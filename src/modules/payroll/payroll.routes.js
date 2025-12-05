const express = require('express');

function createPayrollRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   - name: Payroll
   *     description: Work with payslips
   */

  /**
   * @swagger
   * /payroll:
   *   get:
   *     summary: List payslips
   *     tags: [Payroll]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: employee_id
   *         schema:
   *           type: integer
   *         description: Filter by employee
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *         description: Filter by state
   *     responses:
   *       200:
   *         description: Payslip list
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /payroll/{id}:
   *   get:
   *     summary: Get payslip by ID
   *     tags: [Payroll]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Payslip details
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /payroll:
   *   post:
   *     summary: Create a payslip shell
   *     tags: [Payroll]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [employeeId, dateFrom, dateTo]
   *             properties:
   *               employeeId:
   *                 type: integer
   *               dateFrom:
   *                 type: string
   *                 format: date
   *               dateTo:
   *                 type: string
   *                 format: date
   *               state:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created payslip
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /payroll/{id}:
   *   put:
   *     summary: Update a payslip
   *     tags: [Payroll]
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
   *             properties:
   *               state:
   *                 type: string
   *               dateFrom:
   *                 type: string
   *                 format: date
   *               dateTo:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Updated payslip
   */
  router.put('/:id', controller.update);
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /payroll/{id}:
   *   delete:
   *     summary: Delete a payslip
   *     tags: [Payroll]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Deletion result
   */
  router.delete('/:id', controller.delete);

  return router;
}

module.exports = createPayrollRoutes;
