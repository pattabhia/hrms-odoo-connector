const express = require('express');

function createExpensesRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   - name: Expenses
   *     description: Submit and view expense reports
   */

  /**
   * @swagger
   * /expenses:
   *   get:
   *     summary: List expenses
   *     tags: [Expenses]
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
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Expense list
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /expenses/{id}:
   *   get:
   *     summary: Get an expense
   *     tags: [Expenses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Expense details
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /expenses:
   *   post:
   *     summary: Create an expense
   *     tags: [Expenses]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, employeeId, total]
   *             properties:
   *               name:
   *                 type: string
   *               employeeId:
   *                 type: integer
   *               total:
   *                 type: number
   *               state:
   *                 type: string
   *               paymentState:
   *                 type: string
   *               date:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Created expense
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /expenses/{id}:
   *   put:
   *     summary: Update an expense
   *     tags: [Expenses]
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
   *               name:
   *                 type: string
   *               total:
   *                 type: number
   *               state:
   *                 type: string
   *               paymentState:
   *                 type: string
   *               date:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Updated expense
   */
  router.put('/:id', controller.update);
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /expenses/{id}:
   *   delete:
   *     summary: Delete an expense
   *     tags: [Expenses]
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

module.exports = createExpensesRoutes;
