import { AnalisisService } from '../service/analisisService.js';

const analisisService = new AnalisisService();

export const analizarEncuestaController = async (req, res) => {
  const { encuestaId } = req.params;
  const { tipo = 'completo', forzar = 'false' } = req.query;

  try {
    console.log(` Solicitando análisis (${tipo}) para: ${encuestaId}`);
    
    let analisis;
    
    if (tipo === 'rapido') {
      analisis = await analisisService.generarAnalisisRapido(encuestaId);
    } else {
      analisis = await analisisService.generarAnalisisIA(encuestaId, forzar === 'true');
    }

    res.status(200).json({
      success: true,
      mensaje: `Análisis ${tipo} generado exitosamente`,
      analisis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en analizarEncuestaController:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error en el análisis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const obtenerEstadisticasController = async (req, res) => {
  const { encuestaId } = req.params;

  try {
    const [encuesta, respuestas] = await Promise.all([
      analisisService.obtenerEncuesta(encuestaId),
      analisisService.obtenerRespuestas(encuestaId)
    ]);

    const estadisticas = {
      encuestaId,
      titulo: encuesta.titulo,
      totalRespuestas: respuestas.length,
      fechaCreacion: encuesta.fechaCreacion,
      estado: encuesta.estado,
      completitud: analisisService.calcularCompletitud(respuestas),
      ultimaRespuesta: respuestas.length > 0 
        ? respuestas[respuestas.length - 1].fechaRespuesta 
        : null,
      tendencias: analisisService.analizarTendencias(respuestas)
    };

    res.status(200).json({
      success: true,
      estadisticas
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

export const obtenerHistorialAnalisisController = async (req, res) => {
  const { encuestaId } = req.params;
  const { limite = 10 } = req.query;

  try {
    const historial = await analisisService.obtenerHistorialAnalisis(encuestaId, parseInt(limite));

    res.status(200).json({
      success: true,
      encuestaId,
      totalAnalisis: historial.length,
      historial: historial.map(analisis => ({
        tipo: analisis.metadata?.tipo || 'completo',
        fecha: analisis.fechaAnalisis,
        totalRespuestas: analisis.totalRespuestas,
        desdeCache: analisis.desdeCache || false
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial',
      error: error.message
    });
  }
};

export const obtenerUltimoAnalisisController = async (req, res) => {
  const { encuestaId } = req.params;

  try {
    const analisis = await analisisService.obtenerAnalisisExistente(encuestaId);

    if (!analisis) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron análisis para esta encuesta'
      });
    }

    res.status(200).json({
      success: true,
      analisis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo último análisis',
      error: error.message
    });
  }
 
};
 export const obtenerDatosGraficosController = async (req, res) => {
  const { encuestaId } = req.params;

  try {
    const datosGraficos = await analisisService.obtenerDatosParaGraficos(encuestaId);

    res.status(200).json({
      success: true,
      ...datosGraficos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos para gráficos',
      error: error.message
    });
  }
};