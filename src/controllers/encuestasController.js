import { crearEncuestaService, obtenerTodosLosEmailsClienteService,obtenerTodasLasEncuestasService,obtenerEncuestasPorPkService, obtenerEncuestaPorSkService, obtenerEncuestaPorSkGSIService, actualizarEncuestaService } from '../service/encuestasService.js';
import { v4 as uuidv4 } from "uuid"
import generarNuevaEncuesta from "../utils/generarNuevaEncuesta.js"

//Hoy en dia las validaciones no tienen porque ser tan fuertes. Ya que lo manejaremos nosotros a la app.

const crearEncuestaController = async (req, res) => {
 const { email, titulo, preguntas } = req.body;
 const idEncuesta = uuidv4();

  if ( !email || !titulo || !Array.isArray(preguntas) || preguntas.length === 0) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }

  const nuevaEncuesta = generarNuevaEncuesta(email, titulo, preguntas,idEncuesta);

  try {
    const encuestaCreada = await crearEncuestaService(nuevaEncuesta);
    res.status(201).json(encuestaCreada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerTodosLosEmailsClienteController = async (req, res) => {

  try {
    const emails = await obtenerTodosLosEmailsClienteService();
    if (emails.length === 0) {
      return res.status(404).json({ message: 'No se encontraron emails de cliente' });
    }
    res.status(200).json({ emails });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerTodasLasEncuestasController = async (req, res) => {
  try {
    const encuestas = await obtenerTodasLasEncuestasService();
    if (encuestas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron encuestas.' });
    }
    res.status(200).json({ encuestas });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerEncuestasPorPkController = async (req, res) => {
 const { email } = req.params;

  if ( !email ) {
    return res.status(400).json({ message: 'No se ingreso un email valido' });
  }

  try {
    const encuestas = await obtenerEncuestasPorPkService(email);
    if (encuestas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron encuestas para este usuario.' });
    }
    res.status(200).json({ encuestas });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerEncuestaPorSkController = async (req, res) => {
 const { email, sk } = req.params;

  if ( !email || !sk ) {
    return res.status(400).json({ message: 'No se ingreso un id valido' });
  }

  try {
    const encuesta = await obtenerEncuestaPorSkService(email,sk);

    res.status(200).json({ encuesta });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerEncuestaPorSkGSIController = async (req, res) => {
 const { sk } = req.params;

  if ( !sk ) {
    return res.status(400).json({ message: 'No se ingreso un id valido' });
  }

  try {
    const encuesta = await obtenerEncuestaPorSkGSIService(sk);

    res.status(200).json({ encuesta });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarEncuestaController = async (req, res) => {
 const { InquiroPK, InquiroSK, titulo, preguntas } = req.body;

  if ( !InquiroPK || !InquiroSK || !titulo || !Array.isArray(preguntas) || preguntas.length === 0 ) {
    return res.status(400).json({ message: 'Datos incompletos para la actualizacion.' });
  }

  try {
    const encuestaNueva = await actualizarEncuestaService(InquiroPK, InquiroSK, titulo, preguntas);

    res.status(200).json({ encuestaNueva });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { crearEncuestaController, obtenerTodosLosEmailsClienteController, obtenerTodasLasEncuestasController,obtenerEncuestasPorPkController, obtenerEncuestaPorSkController, obtenerEncuestaPorSkGSIController,actualizarEncuestaController };