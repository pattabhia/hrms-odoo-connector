const express = require('express');

function createRecruitmentRoutes(controller) {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   - name: Recruitment
   *     description: Manage applicants and pipeline stages
   */

  /**
   * @swagger
   * /recruitment:
   *   get:
   *     summary: List applicants
   *     tags: [Recruitment]
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
   *         name: job_id
   *         schema:
   *           type: integer
   *       - in: query
   *         name: department_id
   *         schema:
   *           type: integer
   *       - in: query
   *         name: stage_id
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Applicant list
   */
  router.get('/', controller.getAll);

  /**
   * @swagger
   * /recruitment/{id}:
   *   get:
   *     summary: Get applicant by ID
   *     tags: [Recruitment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Applicant details
   */
  router.get('/:id', controller.getById);

  /**
   * @swagger
   * /recruitment:
   *   post:
   *     summary: Create an applicant
   *     tags: [Recruitment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *               applicantName:
   *                 type: string
   *               email:
   *                 type: string
   *               jobId:
   *                 type: integer
   *               departmentId:
   *                 type: integer
   *               stageId:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Created applicant
   */
  router.post('/', controller.create);

  /**
   * @swagger
   * /recruitment/{id}:
   *   put:
   *     summary: Update applicant
   *     tags: [Recruitment]
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
   *               applicantName:
   *                 type: string
   *               email:
   *                 type: string
   *               jobId:
   *                 type: integer
   *               departmentId:
   *                 type: integer
   *               stageId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Updated applicant
   */
  router.put('/:id', controller.update);
  router.patch('/:id', controller.patch);

  /**
   * @swagger
   * /recruitment/{id}:
   *   delete:
   *     summary: Delete applicant
   *     tags: [Recruitment]
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

module.exports = createRecruitmentRoutes;
