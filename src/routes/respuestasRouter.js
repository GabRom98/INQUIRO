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
 *     summary: Obtiene todas las respuestas de una encuesta
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la encuesta (respuestaInquiroPK)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Respuestas obtenidas exitosamente
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
 *     summary: Crea una nueva respuesta
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
 *                 example: "1234-encuesta"
 *               respuestas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Sí", "No", "Tal vez"]
 *     responses:
 *       200:
 *         description: Respuesta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
respuestasRouter.post('/', crearRespuestaController);

export default respuestasRouter;