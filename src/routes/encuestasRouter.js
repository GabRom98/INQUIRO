//Este archivo manejará las rutas para obtención de preguntas y la creación de encuestas nuevas.
import { Router } from "express";
import { crearEncuestaController, obtenerTodosLosEmailsClienteController, obtenerTodasLasEncuestasController,obtenerEncuestasPorPkController, obtenerEncuestaPorSkController, obtenerEncuestaPorSkGSIController, actualizarEncuestaController,eliminarEncuestaController, cambiarEstadoEncuestaController } from "../controllers/encuestasController.js"
import { 
  analizarEncuestaController, 
  obtenerEstadisticasController,
  obtenerHistorialAnalisisController,
  obtenerUltimoAnalisisController,
  obtenerDatosGraficosController
} from "../controllers/analisisController.js";
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
 *                       descripcion:
 *                         type: string
 *                         example: Descripcion prueba
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
 *                       descripcion:
 *                         type: string
 *                         example: Descripcion prueba
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
 *                       descripcion:
 *                         type: string
 *                         example: Descripcion prueba
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

 *                       descripcion:
 *                         type: string
 *                         example: Descripcion prueba
 *                       InquiroPK:
 *                         type: string
 *                         example: email@h.com
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-05T18:57:47.675Z
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
 *     description: Este endpoint permite crear una nueva encuesta en la base de datos. Se debe enviar el correo electrónico del usuario, un título, una descripción y una lista de preguntas. Cada pregunta puede ser de tipo texto, selección o múltiple elección.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - titulo
 *               - descripcion
 *               - preguntas
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario al que pertenece la encuesta.
 *                 example: mimail@he.com
 *               titulo:
 *                 type: string
 *                 description: Título de la encuesta.
 *                 example: prueba
 *               descripcion:
 *                 type: string
 *                 description: Descripción breve de la encuesta.
 *                 example: Encuesta de prueba sobre satisfacción del cliente.
 *               preguntas:
 *                 type: array
 *                 description: Lista de preguntas incluidas en la encuesta.
 *                 items:
 *                   type: object
 *                   properties:
 *                     tipoPregunta:
 *                       type: string
 *                       description: Tipo de la pregunta (texto, radio, checkbox, etc.)
 *                       example: radio
 *                     pregunta:
 *                       type: string
 *                       description: Enunciado de la pregunta.
 *                       example: ¿Probando diferentes cosas?
 *                     opciones:
 *                       type: array
 *                       description: Opciones disponibles (vacías si es de tipo texto).
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
 *                   description: Título de la encuesta creada.
 *                   example: prueba
 *                 descripcion:
 *                   type: string
 *                   description: Descripción de la encuesta creada.
 *                   example: Encuesta de prueba sobre satisfacción del cliente.
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
 *                         example: ¿Probando?
 *                       opciones:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                 fechaCreacion:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación de la encuesta.
 *                   example: 2025-10-07T23:26:21.163Z
 *       400:
 *         description: Datos inválidos. Faltan campos o el formato es incorrecto.
 *       500:
 *         description: Error interno del servidor.
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
 *                 description: Nuevo título de la encuesta.
 *                 example: MEU XD
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripcion
 *                 example: Descripcion prueba
>>>>>>> ac10c00b160865074e6f9e91a424427da500d7e4
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
 *                       example: Este es un nuevo titulo
 *                     descripcion:
 *                       type: string
 *                       example: Descripcion prueba
>>>>>>> ac10c00b160865074e6f9e91a424427da500d7e4
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
/**
 * @openapi
 * /encuestas/analizar/{encuestaId}:
 *   post:
 *     tags:
 *       - Análisis IA
 *     summary: Analiza las respuestas de una encuesta usando inteligencia artificial
 *     description: Envía las respuestas y preguntas de una encuesta al servicio de IA (Groq o DeepSeek) para generar un análisis textual detallado.
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta a analizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encuesta:
 *                 type: object
 *                 description: Datos de la encuesta, incluyendo título y preguntas.
 *               respuestas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: Respuestas individuales de los usuarios.
 *     responses:
 *       200:
 *         description: Análisis generado correctamente por la IA.
 *       400:
 *         description: Error en los datos enviados.
 *       500:
 *         description: Error interno al comunicarse con la IA.
 */

encuestasRouter.get('/encuesta/:encuestaId/analizar', analizarEncuestaController);
/**
 * @openapi
 * /encuestas/analizar-rapido/{encuestaId}:
 *   post:
 *     tags:
 *       - Análisis IA
 *     summary: Realiza un análisis rápido de una encuesta
 *     description: Similar a `/analizar`, pero utiliza un modelo optimizado para velocidad. Ideal para obtener un resumen rápido de resultados.
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta a analizar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Análisis rápido completado correctamente.
 *       500:
 *         description: Error al procesar el análisis rápido.
 */

encuestasRouter.get('/encuesta/:encuestaId/analizar-rapido', (req, res) => {
  req.query.tipo = 'rapido';
  return analizarEncuestaController(req, res);
});
/**
 * @openapi
 * /encuestas/analizar-forzar/{encuestaId}:
 *   post:
 *     tags:
 *       - Análisis IA
 *     summary: Fuerza un nuevo análisis de la encuesta ignorando caché previo
 *     description: Genera un nuevo análisis de la encuesta, incluso si ya existe un análisis anterior almacenado.
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nuevo análisis generado correctamente.
 *       500:
 *         description: Error interno al procesar el nuevo análisis.
 */

encuestasRouter.get('/encuesta/:encuestaId/analizar-forzar', (req, res) => {
  req.query.forzar = 'true';
  return analizarEncuestaController(req, res);
});
/**
 * @openapi
 * /encuestas/estadisticas/{encuestaId}:
 *   get:
 *     tags:
 *       - Análisis IA
 *     summary: Obtiene estadísticas cuantitativas de una encuesta
 *     description: Devuelve datos estadísticos (porcentajes, promedios, conteos) calculados a partir de las respuestas.
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas devueltas correctamente.
 *       404:
 *         description: No se encontraron respuestas para la encuesta.
 */

encuestasRouter.get('/encuesta/:encuestaId/estadisticas', obtenerEstadisticasController);
/**
 * @openapi
 * /encuestas/historial/{encuestaId}:
 *   get:
 *     tags:
 *       - Análisis IA
 *     summary: Obtiene el historial de análisis generados para una encuesta
 *     description: Retorna todos los análisis previos realizados sobre una encuesta determinada.
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de análisis obtenido correctamente.
 *       404:
 *         description: No se encontraron análisis previos.
 */


encuestasRouter.get('/encuesta/:encuestaId/historial', obtenerHistorialAnalisisController);
/**
 * @openapi
 * /encuestas/graficos/{encuestaId}:
 *   get:
 *     tags:
 *       - Análisis IA
 *     summary: Obtiene los datos preparados para visualizaciones gráficas
 *     description: Devuelve información estadística lista para ser graficada (barras, tortas, etc.).
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de gráficos obtenidos correctamente.
 *       404:
 *         description: No hay datos disponibles para graficar.
 */

encuestasRouter.get('/encuesta/:encuestaId/graficos', obtenerDatosGraficosController);
/**
 * @openapi
 * /encuestas/ultimo-analisis/{encuestaId}:
 *   get:
 *     tags:
 *       - Análisis IA
 *     summary: Obtiene el último análisis generado para una encuesta
 *     description: Devuelve el resultado más reciente generado por la IA para la encuesta solicitada.
 *     parameters:
 *       - name: encuestaId
 *         in: path
 *         required: true
 *         description: ID de la encuesta.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Último análisis encontrado y devuelto correctamente.
 *       404:
 *         description: No existe un análisis previo para la encuesta.
 */
encuestasRouter.get('/encuesta/:encuestaId/ultimo-analisis', obtenerUltimoAnalisisController);

export default encuestasRouter;