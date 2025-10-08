//Este archivo manejará las rutas para almacenar las respuestas de los usuarios y obtenerlas.
import { Router } from "express";
import { crearRespuestaController, obtenerRespuestasController } from "../controllers/respuestasController.js"

const respuestasRouter = Router();

/**
 * @openapi
 * /respuestas/{id}:
 *   get:
 *     tags:
 *      - Respuestas
 *     summary: Obtiene todas las respuestas asociadas a una encuesta
 *     description: Retorna todas las respuestas guardadas para una encuesta específica, identificada por su `id` (respuestaInquiroPK).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador de la encuesta (respuestaInquiroPK).
 *         schema:
 *           type: string
 *           example: 65ba9d5a-cf6d-4524-ab2d-d6041582e998
 *     responses:
 *       200:
 *         description: Respuestas obtenidas correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fechaRespuesta:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha en la que se guardó el conjunto de respuestas.
 *                     example: 2025-10-07T23:50:59.083Z
 *                   respuestas:
 *                     type: array
 *                     description: Lista de preguntas y respuestas.
 *                     items:
 *                       type: object
 *                       properties:
 *                         pregunta:
 *                           type: string
 *                           example: xdxdxd
 *                         respuesta:
 *                           type: string
 *                           example: respuesta
 *       400:
 *         description: ID inválido o no proporcionado
 *       500:
 *         description: Error interno del servidor
 */
respuestasRouter.get('/:id', obtenerRespuestasController);

/**
 * @openapi
 * /respuestas:
 *   post:
 *     tags:
 *      - Respuestas
 *     summary: Crea un nuevo conjunto de respuestas para una encuesta
 *     description: Crea un nuevo registro de respuestas en DynamoDB asociado a una encuesta (referenciada por `respuestaInquiroPK`).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - respuestaInquiroPK
 *               - respuestas
 *             properties:
 *               respuestaInquiroPK:
 *                 type: string
 *                 description: Identificador de la encuesta (InquiroSK o ID de la encuesta).
 *                 example: 65ba9d5a-cf6d-4524-ab2d-d6041582e998
 *               respuestas:
 *                 type: array
 *                 description: Lista de preguntas y sus respuestas.
 *                 items:
 *                   type: object
 *                   properties:
 *                     pregunta:
 *                       type: string
 *                       example: xdxdxd
 *                     respuesta:
 *                       type: string
 *                       example: respuesta
 *     responses:
 *       200:
 *         description: Respuestas creadas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 respuestasInquiroPK:
 *                   type: string
 *                   description: Identificador de la encuesta a la que pertenecen las respuestas.
 *                   example: 65ba9d5a-cf6d-4524-ab2d-d6041582e998
 *                 respuestasInquiroSK:
 *                   type: string
 *                   description: Identificador único generado para este conjunto de respuestas.
 *                   example: badc78eb-ef9d-49a3-b482-a68d6b518cc7
 *                 respuestas:
 *                   type: array
 *                   description: Lista de respuestas registradas.
 *                   items:
 *                     type: object
 *                     properties:
 *                       pregunta:
 *                         type: string
 *                         example: xdxdxd
 *                       respuesta:
 *                         type: string
 *                         example: respuesta
 *                 fechaRespuesta:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-10-07T23:49:36.392Z
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
respuestasRouter.post('/', crearRespuestaController);

export default respuestasRouter;