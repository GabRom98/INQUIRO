//Este archivo manejará las rutas para obtención de preguntas y la creación de encuestas nuevas.
import { Router } from "express";
import { crearEncuestaController, obtenerTodosLosEmailsClienteController, obtenerTodasLasEncuestasController,obtenerEncuestasPorPkController, obtenerEncuestaPorSkController, obtenerEncuestaPorSkGSIController, actualizarEncuestaController } from "../controllers/encuestasController.js"

const encuestasRouter = Router();
/**
 * @openapi
 * /encuestas/all:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene todas las encuestas registradas
 *     description: Retorna todas las encuestas de la tabla DynamoDB, incluyendo sus PK, SK, título y fecha de creación.
 *     responses:
 *       200:
 *         description: Lista de encuestas obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 encuestas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       InquiroPK:
 *                         type: string
 *                         example: usuario@email.com
 *                       InquiroSK:
 *                         type: string
 *                         example: 1234-uuid
 *                       titulo:
 *                         type: string
 *                       fechaCreacion:
 *                         type: string
 *       404:
 *         description: No se encontraron encuestas.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.get('/all', obtenerTodasLasEncuestasController)

/**
 * @openapi
 * /encuestas/email/all:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene todos los correos electrónicos únicos de clientes
 *     responses:
 *       200:
 *         description: Lista de correos electrónicos de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emails:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: cliente@email.com
 *       404:
 *         description: No se encontraron correos.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.get('/email/all', obtenerTodosLosEmailsClienteController)

/**
 * @openapi
 * /encuestas/{sk}:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene una encuesta usando su SK desde el índice GSI
 *     parameters:
 *       - name: sk
 *         in: path
 *         required: true
 *         description: ID único (SK) de la encuesta.
 *         schema:
 *           type: string
 *           example: "1a2b-uuid-4c5d"
 *     responses:
 *       200:
 *         description: Encuesta obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 encuesta:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       InquiroPK:
 *                         type: string
 *                       titulo:
 *                         type: string
 *                       preguntas:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Parámetro SK inválido.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.get('/:sk', obtenerEncuestaPorSkGSIController)

/**
 * @openapi
 * /encuestas/email/{email}:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene todas las encuestas asociadas a un correo electrónico
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         description: Correo electrónico del cliente
 *         schema:
 *           type: string
 *           example: cliente@email.com
 *     responses:
 *       200:
 *         description: Lista de encuestas del usuario obtenida correctamente
 *       404:
 *         description: No se encontraron encuestas para este correo.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.get('/email/:email', obtenerEncuestasPorPkController)

/**
 * @openapi
 * /encuestas/email/{email}/id/{sk}:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene una encuesta específica por email y SK
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: cliente@email.com
 *       - name: sk
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "uuid-encuesta-123"
 *     responses:
 *       200:
 *         description: Encuesta encontrada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No se encontró la encuesta
 *       500:
 *         description: Error interno
 */
encuestasRouter.get('/email/:email/id/:sk', obtenerEncuestaPorSkController)

/**
 * @openapi
 * /encuestas:
 *   post:
 *     tags:
 *       - Encuestas
 *     summary: Crea una nueva encuesta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - titulo
 *               - preguntas
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *               titulo:
 *                 type: string
 *                 example: Encuesta de satisfacción
 *               preguntas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["¿Te gustó el producto?", "¿Recomendarías la app?"]
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
encuestasRouter.post('/', crearEncuestaController);

/**
 * @openapi
 * /encuestas:
 *   put:
 *     tags:
 *       - Encuestas
 *     summary: Actualiza una encuesta existente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - InquiroPK
 *               - InquiroSK
 *               - titulo
 *               - preguntas
 *             properties:
 *               InquiroPK:
 *                 type: string
 *                 example: cliente@email.com
 *               InquiroSK:
 *                 type: string
 *                 example: "uuid-encuesta-abc123"
 *               titulo:
 *                 type: string
 *                 example: Encuesta actualizada
 *               preguntas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["¿Cómo calificarías la atención?", "¿Usarías el servicio otra vez?"]
 *     responses:
 *       200:
 *         description: Encuesta actualizada correctamente
 *       400:
 *         description: Datos incompletos para la actualización
 *       500:
 *         description: Error interno del servidor
 */
encuestasRouter.put('/', actualizarEncuestaController)

export default encuestasRouter;