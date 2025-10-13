//Este archivo manejará las rutas para obtención de preguntas y la creación de encuestas nuevas.
import { Router } from "express";
import { crearEncuestaController, obtenerTodosLosEmailsClienteController, obtenerTodasLasEncuestasController,obtenerEncuestasPorPkController, obtenerEncuestaPorSkController, obtenerEncuestaPorSkGSIController, actualizarEncuestaController,eliminarEncuestaController, cambiarEstadoEncuestaController } from "../controllers/encuestasController.js"

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
 *                       titulo:
 *                         type: string
 *                         example: Sabores
 *                       InquiroPK:
 *                         type: string
 *                         example: email@h.com
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-05T18:57:47.675Z
 *                       preguntas:
 *                         type: array
 *                         description: Lista de preguntas de la encuesta
 *                         items:
 *                           type: object
 *                           properties:
 *                             tipoPregunta:
 *                               type: string
 *                               description: Tipo de pregunta (texto, radio, etc.)
 *                               example: radio
 *                             pregunta:
 *                               type: string
 *                               description: Texto de la pregunta
 *                               example: color favorito?
 *                             opciones:
 *                               type: array
 *                               description: Opciones de respuesta (vacías si es texto libre)
 *                               items:
 *                                 type: string
 *                               example: ["azul", "verde", "rojo"]
 *                       InquiroSK:
 *                         type: string
 *                         example: xxxxx-xxxxx-xxx-xxxxx-xxxxxxxxx
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
/**
 * @openapi
 * /encuestas/{sk}:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene una encuesta específica por su SK (GSI)
 *     description: Busca en DynamoDB una encuesta a través del índice secundario global **InquiroSK-index** usando el valor de SK proporcionado.
 *     parameters:
 *       - name: sk
 *         in: path
 *         required: true
 *         description: Identificador único (Sort Key) de la encuesta.
 *         schema:
 *           type: string
 *           example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
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
 *                       titulo:
 *                         type: string
 *                         example: Sabores
 *                       preguntas:
 *                         type: array
 *                         description: Preguntas que componen la encuesta
 *                         items:
 *                           type: object
 *                           properties:
 *                             tipoPregunta:
 *                               type: string
 *                               example: radio
 *                             pregunta:
 *                               type: string
 *                               example: color favorito?
 *                             opciones:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["azul", "verde", "rojo"]
 *                       InquiroPK:
 *                         type: string
 *                         description: Clave primaria (email del cliente)
 *                         example: email@h.com
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-05T18:57:47.675Z
 *                       InquiroSK:
 *                         type: string
 *                         description: Clave de ordenamiento (UUID único)
 *                         example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
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
 *         description: Correo electrónico del cliente cuyas encuestas se desean obtener.
 *         schema:
 *           type: string
 *           example: email@h.com
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
 *                   description: Lista de encuestas asociadas al correo proporcionado.
 *                   items:
 *                     type: object
 *                     properties:
 *                       titulo:
 *                         type: string
 *                         example: Sabores
 *                       InquiroPK:
 *                         type: string
 *                         example: email@h.com
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-05T18:57:47.675Z
 *                       preguntas:
 *                         type: array
 *                         description: Preguntas incluidas en la encuesta.
 *                         items:
 *                           type: object
 *                           properties:
 *                             tipoPregunta:
 *                               type: string
 *                               example: radio
 *                             pregunta:
 *                               type: string
 *                               example: color favorito?
 *                             opciones:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["azul", "verde", "rojo"]
 *                       InquiroSK:
 *                         type: string
 *                         example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *       404:
 *         description: No se encontraron encuestas para este correo.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.get('/email/:email', obtenerEncuestasPorPkController)

/**
 * @openapi
 * /encuestas/{sk}:
 *   get:
 *     tags:
 *       - Encuestas
 *     summary: Obtiene una encuesta específica por su SK (GSI)
 *     description: Busca en DynamoDB una encuesta a través del índice secundario global **InquiroSK-index** usando el valor de SK proporcionado.
 *     parameters:
 *       - name: sk
 *         in: path
 *         required: true
 *         description: Identificador único (Sort Key) de la encuesta.
 *         schema:
 *           type: string
 *           example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
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
 *                       titulo:
 *                         type: string
 *                         example: Sabores
 *                       preguntas:
 *                         type: array
 *                         description: Preguntas que componen la encuesta
 *                         items:
 *                           type: object
 *                           properties:
 *                             tipoPregunta:
 *                               type: string
 *                               example: radio
 *                             pregunta:
 *                               type: string
 *                               example: color favorito?
 *                             opciones:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["azul", "verde", "rojo"]
 *                       InquiroPK:
 *                         type: string
 *                         description: Clave primaria (email del cliente)
 *                         example: email@h.com
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-05T18:57:47.675Z
 *                       InquiroSK:
 *                         type: string
 *                         description: Clave de ordenamiento (UUID único)
 *                         example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *       400:
 *         description: Parámetro SK inválido.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.get('/:sk', obtenerEncuestaPorSkGSIController);

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
 *                 example: mimail@he.com
 *               titulo:
 *                 type: string
 *                 example: prueba
 *               preguntas:
 *                 type: array
 *                 description: Lista de preguntas incluidas en la encuesta.
 *                 items:
 *                   type: object
 *                   properties:
 *                     tipoPregunta:
 *                       type: string
 *                       example: radio
 *                     pregunta:
 *                       type: string
 *                       example: probando diferentes cosas?
 *                     opciones:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["1", "2", "3"]
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 InquiroPK:
 *                   type: string
 *                   description: Clave primaria (email del usuario).
 *                   example: mimail@he.com
 *                 InquiroSK:
 *                   type: string
 *                   description: Identificador único (UUID) generado para la encuesta.
 *                   example: 1566136b-0a1c-4f5b-90ba-38f67ea55fb2
 *                 titulo:
 *                   type: string
 *                   example: prueba
 *                 preguntas:
 *                   type: array
 *                   description: Lista de preguntas de la encuesta creada.
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipoPregunta:
 *                         type: string
 *                         example: texto
 *                       pregunta:
 *                         type: string
 *                         example: probando?
 *                       opciones:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                 fechaCreacion:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-10-07T23:26:21.163Z
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
encuestasRouter.post('/', crearEncuestaController);
/**
 * @openapi
 * /encuestas/{pk}/{sk}:
 *   put:
 *     tags:
 *       - Encuestas
 *     summary: Actualiza una encuesta existente
 *     description: Permite modificar el título, las preguntas o las opciones de una encuesta ya registrada en DynamoDB, identificada por su PK (correo) y SK (UUID).
 *     parameters:
 *       - name: pk
 *         in: path
 *         required: true
 *         description: Clave primaria del usuario (correo electrónico).
 *         schema:
 *           type: string
 *           example: usuario@ejemplo.com
 *       - name: sk
 *         in: path
 *         required: true
 *         description: Clave de ordenamiento única (UUID) de la encuesta.
 *         schema:
 *           type: string
 *           example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Preferencias de sabores - Edición 2
 *               preguntas:
 *                 type: array
 *                 description: Lista de preguntas actualizadas.
 *                 items:
 *                   type: object
 *                   properties:
 *                     tipoPregunta:
 *                       type: string
 *                       example: radio
 *                     pregunta:
 *                       type: string
 *                       example: ¿Cuál es tu color favorito?
 *                     opciones:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Rojo", "Verde", "Azul"]
 *     responses:
 *       200:
 *         description: Encuesta actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Encuesta actualizada correctamente.
 *                 encuesta:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                       example: Preferencias de sabores - Edición 2
 *                     InquiroPK:
 *                       type: string
 *                       example: usuario@ejemplo.com
 *                     InquiroSK:
 *                       type: string
 *                       example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *                     fechaActualizacion:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-05T18:57:47.675Z
 *       400:
 *         description: Datos inválidos o encuesta inexistente.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.put('/:pk/:sk', actualizarEncuestaController);

/**
 * @openapi
 * /encuestas/{pk}/{sk}:
 *   delete:
 *     tags:
 *       - Encuestas
 *     summary: Elimina una encuesta existente
 *     description: Borra una encuesta de DynamoDB según el correo electrónico (PK) y el identificador único (SK).
 *     parameters:
 *       - name: pk
 *         in: path
 *         required: true
 *         description: Clave primaria (correo electrónico del usuario).
 *         schema:
 *           type: string
 *           example: usuario@ejemplo.com
 *       - name: sk
 *         in: path
 *         required: true
 *         description: Clave de ordenamiento (UUID) de la encuesta.
 *         schema:
 *           type: string
 *           example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *     responses:
 *       200:
 *         description: Encuesta eliminada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Encuesta eliminada correctamente.
 *       404:
 *         description: Encuesta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.delete('/:pk/:sk', eliminarEncuestaController);

/**
 * @openapi
 * /encuestas/estado:
 *   put:
 *     tags:
 *       - Encuestas
 *     summary: Cambia el estado de una encuesta
 *     description: Actualiza el campo **estado** (por ejemplo, “activa”, “inactiva”, “finalizada”) de una encuesta específica en DynamoDB.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pk
 *               - sk
 *               - nuevoEstado
 *             properties:
 *               pk:
 *                 type: string
 *                 description: Correo electrónico del usuario dueño de la encuesta.
 *                 example: usuario@ejemplo.com
 *               sk:
 *                 type: string
 *                 description: Identificador único (UUID) de la encuesta.
 *                 example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *               nuevoEstado:
 *                 type: string
 *                 description: Estado nuevo que se asignará a la encuesta.
 *                 example: inactiva
 *     responses:
 *       200:
 *         description: Estado de la encuesta actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estado actualizado a "inactiva".
 *                 encuesta:
 *                   type: object
 *                   properties:
 *                     InquiroPK:
 *                       type: string
 *                       example: usuario@ejemplo.com
 *                     InquiroSK:
 *                       type: string
 *                       example: 312bc281-f0c0-4b14-b5ec-b2b2edf2a1ac
 *                     estado:
 *                       type: string
 *                       example: inactiva
 *       400:
 *         description: Datos inválidos o encuesta inexistente.
 *       500:
 *         description: Error interno del servidor.
 */
encuestasRouter.put('/estado', cambiarEstadoEncuestaController);

export default encuestasRouter;