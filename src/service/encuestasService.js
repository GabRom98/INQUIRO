import { obtenerTodosLosEmailsClienteRepository,cambiarEstadoEncuestaRepository, obtenerTodasLasEncuestasRepository,crearEncuestaRepository, obtenerEncuestasPorPkRepository, obtenerEncuestaPorSkRepository, obtenerEncuestaPorSkGSIRepository,actualizarEncuestaRepository,eliminarEncuestaRepository } from '../repository/encuestasRepository.js';
import { dynamodb,TABLE } from '../../inquiroDB.js';
const crearEncuestaService = async (encuestaData) => {
  try {
    const nuevaEncuesta = await crearEncuestaRepository(encuestaData);
    return nuevaEncuesta;
  } catch (error) {
    throw new Error("No se pudo crear la encuesta.");
  }
};

const obtenerTodosLosEmailsClienteService = async () => {
  try {
    const resp = await obtenerTodosLosEmailsClienteRepository();
    const emails = resp.map( item => item.InquiroPK );
    const uniqueEmails = [...new Set(emails)];
    return uniqueEmails;
  } catch (error) {
    console.log(error.message)
    throw new Error("No se pudieron obtener los emails");
  }
};

const obtenerTodasLasEncuestasService = async () => {
  try {
    const encuestas = await obtenerTodasLasEncuestasRepository();
    return encuestas;
  } catch (error) {
    console.log(error.message)
    throw new Error("No se pudo obtener las encuestas");
  }
};

const obtenerEncuestasPorPkService = async (encuestaData) => {
  try {
    const encuestas = await obtenerEncuestasPorPkRepository(encuestaData);
    return encuestas;
  } catch (error) {
    console.log(error.message)
    throw new Error("No se pudo obtener las encuestas");
  }
};

const obtenerEncuestaPorSkService = async (email,sk) => {
  try {
    const encuesta = await obtenerEncuestaPorSkRepository(email, sk);

    return encuesta;
  } catch (error) {
    throw new Error(error.message);
  }
};

const obtenerEncuestaPorSkGSIService = async (sk) => {
  try {
    const encuesta = await obtenerEncuestaPorSkGSIRepository(sk);

    return encuesta;
  } catch (error) {
    throw new Error(error.message);
  }
};
const cambiarEstadoEncuestaService = async (pk, sk, nuevoEstado) => {
  try {
    const estadosPermitidos = ["pausada", "cerrada"];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error("Estado inválido. Solo se permite 'pausada' o 'cerrada'.");
    }

    const result = await cambiarEstadoEncuestaRepository(pk, sk, nuevoEstado);
    return result;
  } catch (error) {
    throw new Error(`Error en el servicio al cambiar el estado: ${error.message}`);
  }
};


const eliminarEncuestaService = async (InquiroPK, InquiroSK) => {
  try {
    return await eliminarEncuestaRepository(InquiroPK, InquiroSK);
  } catch (error) {
    throw new Error(`Error en el servicio al eliminar la encuesta: ${error.message}`);
  }
};
const actualizarEncuestaService = async (InquiroPK, InquiroSK, titulo, preguntas) => {
  try {
    const preguntasValidadas = preguntas.map((p) => {
      if (!p.tipoPregunta || !p.pregunta) {
        throw new Error("Cada pregunta debe tener el tipo de pregunta y ningun campo vacio.");
      }
      if (p.tipoPregunta === "opciones_radio" && (!p.opciones || p.opciones.length === 0)) {
        throw new Error("Las preguntas de este tipo deben tener opciones.");
      }
      return {
        tipoPregunta: p.tipoPregunta,
        pregunta: p.pregunta,
        opciones: p.opciones || [],
      };
    });

    return await actualizarEncuestaRepository(InquiroPK, InquiroSK, titulo, preguntasValidadas);
  } catch (error) {
    throw new Error(error.message);
  }
};

export { crearEncuestaService, obtenerTodosLosEmailsClienteService,obtenerTodasLasEncuestasService,obtenerEncuestasPorPkService, obtenerEncuestaPorSkService,obtenerEncuestaPorSkGSIService, actualizarEncuestaService,cambiarEstadoEncuestaService, eliminarEncuestaService };