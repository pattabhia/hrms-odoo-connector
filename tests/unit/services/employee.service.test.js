const EmployeeService = require('../../../src/modules/employee/employee.service');
const { NotFoundError, ValidationError } = require('../../../src/core/errors');

describe('EmployeeService', () => {
  let employeeService;
  let mockRepository;
  let mockValidator;
  let mockAdapter;
  let mockLogger;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByDepartment: jest.fn(),
      findByManager: jest.fn(),
      findByJob: jest.fn(),
      searchByName: jest.fn(),
      findActive: jest.fn(),
      findByEmail: jest.fn(),
      countByDepartment: jest.fn(),
      countByJob: jest.fn(),
      modelName: 'hr.employee'
    };

    // Create mock validator
    mockValidator = {
      validate: jest.fn(),
      validateUpdate: jest.fn()
    };

    // Create mock adapter
    mockAdapter = {
      toDTO: jest.fn(),
      toDTOArray: jest.fn(),
      toOdooFormat: jest.fn()
    };

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    // Create service instance
    employeeService = new EmployeeService(
      mockRepository,
      mockValidator,
      mockAdapter,
      mockLogger
    );
  });

  describe('getAll', () => {
    it('should return paginated employees', async () => {
      const mockEmployees = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ];

      mockRepository.findAll.mockResolvedValue(mockEmployees);
      mockRepository.count.mockResolvedValue(10);
      mockAdapter.toDTOArray.mockReturnValue(mockEmployees);

      const result = await employeeService.getAll(1, 50);

      expect(result).toEqual({
        success: true,
        data: mockEmployees,
        pagination: {
          page: 1,
          limit: 50,
          total: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith([], [], 50, 0);
      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockAdapter.toDTOArray).toHaveBeenCalledWith(mockEmployees);
    });

    it('should throw ValidationError for invalid page', async () => {
      await expect(employeeService.getAll(0, 50)).rejects.toThrow(ValidationError);
      await expect(employeeService.getAll(-1, 50)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid limit', async () => {
      await expect(employeeService.getAll(1, 0)).rejects.toThrow(ValidationError);
      await expect(employeeService.getAll(1, 101)).rejects.toThrow(ValidationError);
    });
  });

  describe('getById', () => {
    it('should return employee when found', async () => {
      const mockEmployee = { id: 1, name: 'John Doe' };

      mockRepository.findById.mockResolvedValue(mockEmployee);
      mockAdapter.toDTO.mockReturnValue(mockEmployee);

      const result = await employeeService.getById(1);

      expect(result).toEqual(mockEmployee);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockAdapter.toDTO).toHaveBeenCalledWith(mockEmployee);
    });

    it('should throw NotFoundError when employee not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(employeeService.getById(999)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid ID', async () => {
      await expect(employeeService.getById(-1)).rejects.toThrow(ValidationError);
      await expect(employeeService.getById(0)).rejects.toThrow(ValidationError);
    });
  });

  describe('create', () => {
    it('should create employee with valid data', async () => {
      const employeeData = { name: 'Jane Doe', email: 'jane@example.com' };
      const odooData = { name: 'Jane Doe', work_email: 'jane@example.com' };
      const createdEmployee = { id: 1, ...employeeData };

      mockValidator.validate.mockReturnValue({ isValid: true, value: employeeData });
      mockAdapter.toOdooFormat.mockReturnValue(odooData);
      mockRepository.create.mockResolvedValue(1);
      mockRepository.findById.mockResolvedValue(createdEmployee);
      mockAdapter.toDTO.mockReturnValue(createdEmployee);

      const result = await employeeService.create(employeeData);

      expect(result).toEqual(createdEmployee);
      expect(mockValidator.validate).toHaveBeenCalledWith(employeeData);
      expect(mockAdapter.toOdooFormat).toHaveBeenCalledWith(employeeData);
      expect(mockRepository.create).toHaveBeenCalledWith(odooData);
    });

    it('should throw ValidationError for invalid data', async () => {
      const invalidData = { name: '' };

      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: ['Name is required'],
        fields: { name: 'Name is required' }
      });

      await expect(employeeService.create(invalidData)).rejects.toThrow(ValidationError);
    });
  });

  describe('update', () => {
    it('should update employee with valid data', async () => {
      const updateData = { name: 'Updated Name' };
      const odooData = { name: 'Updated Name' };
      const existingEmployee = { id: 1, name: 'Old Name' };
      const updatedEmployee = { id: 1, name: 'Updated Name' };

      mockRepository.findById.mockResolvedValueOnce(existingEmployee);
      mockValidator.validateUpdate.mockReturnValue({ isValid: true, value: updateData });
      mockAdapter.toOdooFormat.mockReturnValue(odooData);
      mockRepository.update.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValueOnce(updatedEmployee);
      mockAdapter.toDTO.mockReturnValue(updatedEmployee);

      const result = await employeeService.update(1, updateData);

      expect(result).toEqual(updatedEmployee);
      expect(mockValidator.validateUpdate).toHaveBeenCalledWith(updateData);
      expect(mockRepository.update).toHaveBeenCalledWith(1, odooData);
    });

    it('should throw NotFoundError when employee does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(employeeService.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('delete', () => {
    it('should delete employee when exists', async () => {
      const existingEmployee = { id: 1, name: 'John Doe' };

      mockRepository.findById.mockResolvedValue(existingEmployee);
      mockAdapter.toDTO.mockReturnValue(existingEmployee);
      mockRepository.delete.mockResolvedValue(true);

      const result = await employeeService.delete(1);

      expect(result).toEqual({
        success: true,
        message: 'Record with ID 1 deleted successfully'
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when employee does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(employeeService.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('searchByName', () => {
    it('should search employees by name', async () => {
      const mockEmployees = [{ id: 1, name: 'John Doe' }];

      mockRepository.searchByName.mockResolvedValue(mockEmployees);
      mockAdapter.toDTOArray.mockReturnValue(mockEmployees);

      const result = await employeeService.searchByName('John', 50);

      expect(result).toEqual({
        success: true,
        data: mockEmployees,
        total: 1
      });
      expect(mockRepository.searchByName).toHaveBeenCalledWith('John', [], 50);
    });

    it('should throw ValidationError for empty name', async () => {
      await expect(employeeService.searchByName('', 50)).rejects.toThrow(ValidationError);
    });
  });
});
