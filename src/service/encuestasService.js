import { obtenerTodosLosEmailsClienteRepository, obtenerTodasLasEncuestasRepository,crearEncuestaRepository, obtenerEncuestasPorPkRepository, obtenerEncuestaPorSkRepository, obtenerEncuestaPorSkGSIRepository,actualizarEncuestaRepository } from '../repository/encuestasRepository.js';

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

const actualizarEncuestaService = async (InquiroPK, InquiroSK, titulo, preguntas) => {
  try {
    const encuesta = await actualizarEncuestaRepository(InquiroPK, InquiroSK, titulo, preguntas);

    return encuesta;
  } catch (error) {
    throw new Error(error.message);
  }
};

export { crearEncuestaService, obtenerTodosLosEmailsClienteService,obtenerTodasLasEncuestasService,obtenerEncuestasPorPkService, obtenerEncuestaPorSkService,obtenerEncuestaPorSkGSIService, actualizarEncuestaService };