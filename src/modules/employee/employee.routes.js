const express = require('express');

/**
 * Employee Routes
 * Defines all HTTP routes for employee operations
 * @param {EmployeeController} controller - Employee controller instance
 * @returns {Router} Express router
 */
function createEmployeeRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * /employees:
   *   get:
   *     summary: Get all employees
   *     tags: [Employees]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of employees
   *       500:
   *         description: Server error
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /employees/active:
   *   get:
   *     summary: Get all active employees
   *     tags: [Employees]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of active employees
   */
  router.get('/active', controller.getActive);

  /**
   * @swagger
   * /employees/search:
   *   get:
   *     summary: Search employees by name
   *     tags: [Employees]
   *     parameters:
   *       - in: query
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Search results
   */
  router.get('/search', controller.searchByName);

  /**
   * @swagger
   * /employees/department/{departmentId}:
   *   get:
   *     summary: Get employees by department
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: departmentId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of employees in department
   */
  router.get('/department/:departmentId', controller.getByDepartment);

  /**
   * @swagger
   * /employees/manager/{managerId}:
   *   get:
   *     summary: Get employees by manager
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: managerId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of employees under manager
   */
  router.get('/manager/:managerId', controller.getByManager);

  /**
   * @swagger
   * /employees/job/{jobId}:
   *   get:
   *     summary: Get employees by job
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of employees with job
   */
  router.get('/job/:jobId', controller.getByJob);

  /**
   * @swagger
   * /employees/email/{email}:
   *   get:
   *     summary: Get employee by email
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Employee details
   *       404:
   *         description: Employee not found
   */
  router.get('/email/:email', controller.getByEmail);

  /**
   * @swagger
   * /employees/{id}:
   *   get:
   *     summary: Get employee by ID
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Employee details
   *       404:
   *         description: Employee not found
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /employees:
   *   post:
   *     summary: Create a new employee
   *     tags: [Employees]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               mobile:
   *                 type: string
   *               jobId:
   *                 type: integer
   *               departmentId:
   *                 type: integer
   *               managerId:
   *                 type: integer
   *               workLocation:
   *                 type: string
   *               joinDate:
   *                 type: string
   *                 format: date
   *               active:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Employee created successfully
   *       400:
   *         description: Validation error
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /employees/{id}:
   *   put:
   *     summary: Update an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Employee updated successfully
   *       404:
   *         description: Employee not found
   */
  router.put('/:id', controller.update);

  /**
   * @swagger
   * /employees/{id}:
   *   patch:
   *     summary: Partially update an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Employee updated successfully
   */
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /employees/{id}/deactivate:
   *   post:
   *     summary: Deactivate an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Employee deactivated successfully
   */
  router.post('/:id/deactivate', controller.deactivate);

  /**
   * @swagger
   * /employees/{id}/reactivate:
   *   post:
   *     summary: Reactivate an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Employee reactivated successfully
   */
  router.post('/:id/reactivate', controller.reactivate);

  /**
   * @swagger
   * /employees/{id}:
   *   delete:
   *     summary: Delete an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Employee deleted successfully
   *       404:
   *         description: Employee not found
   */
  router.delete('/:id', controller.delete);

  return router;
}

module.exports = createEmployeeRoutes;
