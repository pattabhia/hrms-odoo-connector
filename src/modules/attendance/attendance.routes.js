const express = require('express');

function createAttendanceRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   - name: Attendance
   *     description: Track employee check-ins and check-outs
   */

  /**
   * @swagger
   * /attendance:
   *   get:
   *     summary: List attendance entries
   *     tags: [Attendance]
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
   *         description: Filter by employee id
   *     responses:
   *       200:
   *         description: Attendance records
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /attendance/{id}:
   *   get:
   *     summary: Get attendance by ID
   *     tags: [Attendance]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Attendance record
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /attendance:
   *   post:
   *     summary: Create attendance entry
   *     tags: [Attendance]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [employeeId, checkIn]
   *             properties:
   *               employeeId:
   *                 type: integer
   *               checkIn:
   *                 type: string
   *                 format: date-time
   *               checkOut:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Created attendance entry
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /attendance/{id}:
   *   put:
   *     summary: Update attendance entry
   *     tags: [Attendance]
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
   *               checkIn:
   *                 type: string
   *                 format: date-time
   *               checkOut:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Updated attendance entry
   */
  router.put('/:id', controller.update);
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /attendance/{id}:
   *   delete:
   *     summary: Delete attendance entry
   *     tags: [Attendance]
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

module.exports = createAttendanceRoutes;
