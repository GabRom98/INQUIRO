//Este archivo manejará las rutas para obtención de preguntas y la creación de encuestas nuevas.
import { Router } from "express";
import { crearEncuestaController, obtenerTodosLosEmailsClienteController, obtenerTodasLasEncuestasController,obtenerEncuestasPorPkController, obtenerEncuestaPorSkController, obtenerEncuestaPorSkGSIController, actualizarEncuestaController } from "../controllers/encuestasController.js"

const encuestasRouter = Router();

encuestasRouter.get('/all', obtenerTodasLasEncuestasController)
encuestasRouter.get('/email/all', obtenerTodosLosEmailsClienteController)
encuestasRouter.get('/email/:email', obtenerEncuestasPorPkController)
encuestasRouter.get('/email/:email/id/:sk', obtenerEncuestaPorSkController)
encuestasRouter.get('/:sk', obtenerEncuestaPorSkGSIController)
encuestasRouter.post('/', crearEncuestaController);
encuestasRouter.put('/', actualizarEncuestaController)

export default encuestasRouter;