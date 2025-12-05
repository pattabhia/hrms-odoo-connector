const express = require('express');

function createInvoicesRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   - name: Invoices
   *     description: Customer invoices pulled from Odoo accounting
   */

  /**
   * @swagger
   * /invoices:
   *   get:
   *     summary: List invoices
   *     tags: [Invoices]
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
   *         name: partner_id
   *         schema:
   *           type: integer
   *       - in: query
   *         name: payment_state
   *         schema:
   *           type: string
   *       - in: query
   *         name: move_type
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invoice list
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /invoices/{id}:
   *   get:
   *     summary: Get invoice by ID
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Invoice details
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /invoices:
   *   post:
   *     summary: Create a draft invoice
   *     tags: [Invoices]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, customerId]
   *             properties:
   *               name:
   *                 type: string
   *               customerId:
   *                 type: integer
   *               invoiceDate:
   *                 type: string
   *                 format: date
   *               dueDate:
   *                 type: string
   *                 format: date
   *               amountTotal:
   *                 type: number
   *               paymentState:
   *                 type: string
   *               state:
   *                 type: string
   *               moveType:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created invoice
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /invoices/{id}:
   *   put:
   *     summary: Update an invoice
   *     tags: [Invoices]
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
   *               amountTotal:
   *                 type: number
   *               paymentState:
   *                 type: string
   *               state:
   *                 type: string
   *               moveType:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated invoice
   */
  router.put('/:id', controller.update);
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /invoices/{id}:
   *   delete:
   *     summary: Delete an invoice
   *     tags: [Invoices]
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

module.exports = createInvoicesRoutes;
