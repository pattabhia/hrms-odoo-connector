const express = require('express');

function createTimeOffRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   - name: TimeOff
   *     description: Manage employee leave requests
   */

  /**
   * @swagger
   * /timeoff:
   *   get:
   *     summary: List leave requests
   *     tags: [TimeOff]
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
   *         description: Filter by state (draft, confirm, validate)
   *     responses:
   *       200:
   *         description: Time off requests
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /timeoff/{id}:
   *   get:
   *     summary: Get leave request by ID
   *     tags: [TimeOff]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Leave request
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /timeoff:
   *   post:
   *     summary: Create a leave request
   *     tags: [TimeOff]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [employeeId, typeId, dateFrom, dateTo]
   *             properties:
   *               employeeId:
   *                 type: integer
   *               typeId:
   *                 type: integer
   *               dateFrom:
   *                 type: string
   *                 format: date-time
   *               dateTo:
   *                 type: string
   *                 format: date-time
   *               days:
   *                 type: number
   *               state:
   *                 type: string
   *                 description: Optional initial state
   *     responses:
   *       201:
   *         description: Created leave request
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /timeoff/{id}:
   *   put:
   *     summary: Update a leave request
   *     tags: [TimeOff]
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
   *               dateFrom:
   *                 type: string
   *                 format: date-time
   *               dateTo:
   *                 type: string
   *                 format: date-time
   *               days:
   *                 type: number
   *               state:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated leave request
   */
  router.put('/:id', controller.update);
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /timeoff/{id}:
   *   delete:
   *     summary: Delete a leave request
   *     tags: [TimeOff]
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

module.exports = createTimeOffRoutes;
