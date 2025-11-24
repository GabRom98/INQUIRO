import { DeepseekService } from './DeepSeek.js';  
import { obtenerRespuestasService } from './respuestasService.js';
import { obtenerEncuestaPorSkGSIService } from './encuestasService.js';
import { obtenerTodasLasEncuestasService } from './encuestasService.js';

export class GraficosService {
  constructor() {
    this.colores = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
      '#9C27B0', '#00BCD4', '#FF5722', '#795548'
    ];
  }

  generarResumenGeneral(respuestas) {
    return {
      totalRespuestas: respuestas.length,
      fechaPrimera: respuestas.length > 0 ? 
        new Date(Math.min(...respuestas.map(r => new Date(r.fechaRespuesta)))) : null,
      fechaUltima: respuestas.length > 0 ? 
        new Date(Math.max(...respuestas.map(r => new Date(r.fechaRespuesta)))) : null
    };
  }

  graficoParticipacion(respuestas) {
    const total = respuestas.length;
    return {
      tipo: 'pastel',
      titulo: 'Participación General',
      datos: [
        { label: 'Respuestas Recibidas', value: total, color: '#4CAF50' },
        { label: 'Sin Respuestas', value: Math.max(0, 100 - total), color: '#9E9E9E' }
      ]
    };
  }

  graficosPorTipoPregunta(preguntas, respuestas) {
    const graficos = [];
    
    preguntas.forEach((pregunta, index) => {
      switch(pregunta.tipoPregunta) {
        case 'opciones_radio':
          graficos.push(this.graficoPreguntaRadio(pregunta, respuestas, index));
          break;
        case 'escala_numero':
          graficos.push(this.graficoPreguntaEscala(pregunta, respuestas, index));
          break;
        case 'texto_libre':
          graficos.push(this.graficoPreguntaTexto(pregunta, respuestas, index));
          break;
        default:
          graficos.push(this.graficoPreguntaGenerico(pregunta, respuestas, index));
      }
    });
    
    return graficos;
  }

  graficoPreguntaRadio(pregunta, respuestas, indicePregunta) {
    const conteo = this.contarOpcionesRadio(pregunta.opciones, respuestas, indicePregunta);
    
    return {
      tipo: 'pastel',
      tipoPregunta: 'opciones_radio',
      titulo: pregunta.pregunta,
      preguntaId: `pregunta_${indicePregunta}`,
      datos: conteo.map((opcion, i) => ({
        label: opcion.opcion,
        value: opcion.cantidad,
        color: this.colores[i % this.colores.length],
        porcentaje: opcion.porcentaje
      })),
      totalRespuestas: conteo.reduce((sum, opcion) => sum + opcion.cantidad, 0),
      config: {
        mostrarPorcentajes: true,
        mostrarLeyenda: true
      }
    };
  }

  graficoPreguntaEscala(pregunta, respuestas, indicePregunta) {
    const valores = this.extraerValoresEscala(respuestas, indicePregunta);
    
    return {
      tipo: 'barra',
      tipoPregunta: 'escala_numero',
      titulo: pregunta.pregunta,
      datos: this.calcularDistribucionEscala(valores),
      estadisticas: {
        promedio: this.calcularPromedio(valores),
        mediana: this.calcularMediana(valores),
        moda: this.calcularModa(valores)
      }
    };
  }

  graficoPreguntaTexto(pregunta, respuestas, indicePregunta) {
    const textos = this.extraerTextosRespuesta(respuestas, indicePregunta);
    
    return {
      tipo: 'nube_palabras',
      tipoPregunta: 'texto_libre',
      titulo: pregunta.pregunta,
      datos: this.generarNubePalabras(textos),
      totalRespuestas: textos.length,
      metricas: {
        longitudPromedio: this.calcularLongitudPromedio(textos),
        respuestasVacias: textos.filter(t => !t.trim()).length
      }
    };
  }

  graficoPreguntaGenerico(pregunta, respuestas, indicePregunta) {
    return {
      tipo: 'barra',
      tipoPregunta: 'generico',
      titulo: pregunta.pregunta,
      datos: [],
      totalRespuestas: respuestas.filter(r => 
        r.respuestas && r.respuestas[indicePregunta] && 
        r.respuestas[indicePregunta].respuesta
      ).length
    };
  }

  // Métodos auxiliares para cálculos
  contarOpcionesRadio(opciones, respuestas, indicePregunta) {
    const conteo = {};
    
    opciones.forEach(opcion => {
      conteo[opcion] = 0;
    });

    respuestas.forEach(respuesta => {
      if (respuesta.respuestas && respuesta.respuestas[indicePregunta]) {
        const opcionSeleccionada = respuesta.respuestas[indicePregunta].respuesta;
        if (conteo[opcionSeleccionada] !== undefined) {
          conteo[opcionSeleccionada]++;
        }
      }
    });

    const total = Object.values(conteo).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(conteo).map(([opcion, cantidad]) => ({
      opcion,
      cantidad,
      porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0
    }));
  }

  extraerValoresEscala(respuestas, indicePregunta) {
    const valores = [];
    
    respuestas.forEach(respuesta => {
      if (respuesta.respuestas && respuesta.respuestas[indicePregunta]) {
        const valor = parseFloat(respuesta.respuestas[indicePregunta].respuesta);
        if (!isNaN(valor)) {
          valores.push(valor);
        }
      }
    });
    
    return valores;
  }

  calcularDistribucionEscala(valores) {
    const distribucion = {};
    valores.forEach(valor => {
      distribucion[valor] = (distribucion[valor] || 0) + 1;
    });
    
    return Object.entries(distribucion).map(([valor, cantidad]) => ({
      label: valor,
      value: cantidad
    }));
  }

  extraerTextosRespuesta(respuestas, indicePregunta) {
    return respuestas
      .filter(respuesta => 
        respuesta.respuestas && 
        respuesta.respuestas[indicePregunta] && 
        respuesta.respuestas[indicePregunta].respuesta
      )
      .map(respuesta => respuesta.respuestas[indicePregunta].respuesta);
  }

  generarNubePalabras(textos) {
    const palabras = textos.join(' ').toLowerCase().split(/\s+/);
    const frecuencia = {};
    
    palabras.forEach(palabra => {
      const limpia = palabra.replace(/[.,!?;:()]/g, '');
      if (limpia.length > 3) {
        frecuencia[limpia] = (frecuencia[limpia] || 0) + 1;
      }
    });
    
    return Object.entries(frecuencia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([palabra, count], index) => ({
        text: palabra,
        value: count,
        size: Math.max(10, count * 2),
        color: this.colores[index % this.colores.length]
      }));
  }

  calcularPromedio(valores) {
    if (valores.length === 0) return 0;
    return valores.reduce((sum, val) => sum + val, 0) / valores.length;
  }

  calcularMediana(valores) {
    if (valores.length === 0) return 0;
    const sorted = [...valores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calcularModa(valores) {
    if (valores.length === 0) return 0;
    const frecuencia = {};
    valores.forEach(val => {
      frecuencia[val] = (frecuencia[val] || 0) + 1;
    });
    return Object.keys(frecuencia).reduce((a, b) => frecuencia[a] > frecuencia[b] ? a : b);
  }

  calcularLongitudPromedio(textos) {
    if (textos.length === 0) return 0;
    const total = textos.reduce((sum, texto) => sum + texto.length, 0);
    return Math.round(total / textos.length);
  }

  graficoTendenciasTemporales(respuestas) {
    if (respuestas.length === 0) {
      return { tipo: 'linea', titulo: 'Tendencias Temporales', datos: [] };
    }

    const tendencias = {};
    respuestas.forEach(respuesta => {
      const fecha = new Date(respuesta.fechaRespuesta).toISOString().split('T')[0];
      tendencias[fecha] = (tendencias[fecha] || 0) + 1;
    });

    const datos = Object.entries(tendencias)
      .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
      .map(([fecha, cantidad]) => ({
        fecha,
        cantidad
      }));

    return {
      tipo: 'linea',
      titulo: 'Respuestas por Día',
      datos
    };
  }

  calcularMetricasAvanzadas(respuestas) {
    return {
      totalRespuestas: respuestas.length,
      tasaRespuestaDia: this.calcularTasaRespuestaDia(respuestas),
      horarioPico: this.calcularHorarioPico(respuestas),
      duracionPromedio: '3 min' // Simulado
    };
  }

  calcularTasaRespuestaDia(respuestas) {
    if (respuestas.length === 0) return 0;
    
    const fechas = respuestas.map(r => new Date(r.fechaRespuesta).toISOString().split('T')[0]);
    const diasUnicos = new Set(fechas).size;
    
    return Math.round(respuestas.length / diasUnicos);
  }

  calcularHorarioPico(respuestas) {
    if (respuestas.length === 0) return 'No hay datos';

    const horas = respuestas.map(resp => {
      const fecha = new Date(resp.fechaRespuesta);
      return fecha.getHours();
    });

    const frecuenciaHoras = horas.reduce((acc, hora) => {
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {});

    const horarioPico = Object.keys(frecuenciaHoras).reduce((a, b) => 
      frecuenciaHoras[a] > frecuenciaHoras[b] ? a : b
    );

    return `${horarioPico}:00 - ${parseInt(horarioPico) + 1}:00`;
  }

  async generarDashboardCompleto(encuesta, respuestas) {
    return {
      encuestaId: encuesta.InquiroSK,
      titulo: encuesta.titulo,
      resumen: this.generarResumenGeneral(respuestas),
      graficos: {
        participacion: this.graficoParticipacion(respuestas),
        preguntas: this.graficosPorTipoPregunta(encuesta.preguntas, respuestas),
        tendencias: this.graficoTendenciasTemporales(respuestas)
      },
      metricas: this.calcularMetricasAvanzadas(respuestas)
    };
  }
}

// AnalisisService actualizado
export class AnalisisService {

  constructor() {
    this.deepseekService = new DeepseekService();
    this.graficosService = new GraficosService(); // ✅ Agregar GraficosService
  }

  async generarAnalisisIA(encuestaId) {
    try {
      console.log(`🔍 Iniciando análisis para encuesta: ${encuestaId}`);
      
      const [encuesta, respuestas] = await Promise.all([
        this.obtenerEncuesta(encuestaId),
        this.obtenerRespuestas(encuestaId)
      ]);

      // ✅ DEBUG EXTRA
      console.log('📊 Respuestas después de obtener:', respuestas);
      console.log('📊 Tipo:', typeof respuestas);
      console.log('📊 Longitud:', respuestas?.length);

      if (!respuestas || respuestas.length === 0) {
        throw new Error('No hay respuestas para analizar');
      }

      console.log(`✅ Datos obtenidos: ${respuestas.length} respuestas`);

      // Prepara los datos para el análisis
      const datosParaAnalisis = this.prepararDatos(encuesta, respuestas);

      // Llama a Deepseek IA
      const analisisIA = await this.deepseekService.analizarEncuesta(encuestaId, datosParaAnalisis);

      // Añade más info al análisis
      const analisisCompleto = this.enriquecerAnalisis(encuesta, respuestas, analisisIA);

      console.log('✅ Análisis completado exitosamente');
      return analisisCompleto;

    } catch (error) {
      console.error('❌ Error en AnalisisService:', error);
      throw new Error(`Error al generar análisis: ${error.message}`);
    }
  }

  async generarAnalisisCompleto(encuestaId) {
    try {
      const [encuesta, respuestas] = await Promise.all([
        this.obtenerEncuesta(encuestaId),
        this.obtenerRespuestas(encuestaId)
      ]);

      // Análisis de IA
      const analisisIA = await this.deepseekService.analizarEncuesta(encuestaId, respuestas);
      
      // Dashboard de gráficos
      const dashboardGraficos = await this.graficosService.generarDashboardCompleto(encuesta, respuestas);

      return {
        ...analisisIA,
        dashboard: dashboardGraficos,
        metadata: {
          ...analisisIA.metadata,
          totalGraficos: dashboardGraficos.graficos.preguntas.length + 2, // +2 por participación y tendencias
          tiposGraficos: [...new Set(dashboardGraficos.graficos.preguntas.map(g => g.tipo))]
        }
      };

    } catch (error) {
      console.error('Error en análisis completo:', error);
      throw error;
    }
  }

  async obtenerEncuesta(encuestaId) {
    try {
      const todasEncuestas = await obtenerTodasLasEncuestasService();
      const encuesta = todasEncuestas.find(enc => enc.InquiroSK === encuestaId);
      
      if (!encuesta) {
        throw new Error(`No se encontró la encuesta con ID: ${encuestaId}`);
      }
      
      return encuesta;
    } catch (error) {
      console.error('Error obteniendo encuesta:', error);
      throw new Error(`No se pudo obtener la encuesta: ${error.message}`);
    }
  }

  async obtenerRespuestas(encuestaId) {
    try {
      const respuestas = await obtenerRespuestasService(encuestaId);
      
     
      console.log('🔍 Tipo de respuestas:', typeof respuestas);
      console.log('🔍 Es array?:', Array.isArray(respuestas));
      console.log('🔍 Contenido:', JSON.stringify(respuestas, null, 2));
      
      return respuestas || [];
    } catch (error) {
      console.error('Error obteniendo respuestas:', error);
      throw new Error(`No se pudieron obtener las respuestas: ${error.message}`);
    }
  }

 prepararDatos(encuesta, respuestas) {
  console.log('🔍 DEBUG encuesta:', encuesta);
  console.log('🔍 DEBUG respuestas:', respuestas);
  
  // ✅ Estructura corregida que espera el prompt
  return {
    encuesta: {
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion || 'Sin descripción',
      preguntas: encuesta.preguntas || [],
      fechaCreacion: encuesta.fechaCreacion,
      estado: encuesta.estado || 'activa'
    },
    respuestas: respuestas.map((resp, index) => ({
      respuestaId: resp.respuestaId || resp.respuestasInquiroSK || `resp-${index}`,
      fecha: resp.fecha || resp.fechaRespuesta || new Date().toISOString(),
      respuestas: this.formatearRespuestasParaIA(resp, encuesta.preguntas)
    }))
  };
}

// ✅ NUEVO MÉTODO para formatear respuestas correctamente
formatearRespuestasParaIA(respuesta, preguntasEncuesta) {
  const respuestasFormateadas = [];
  
  preguntasEncuesta.forEach((pregunta, index) => {
    let valorRespuesta = 'Sin respuesta';
    
    // Buscar la respuesta correspondiente a esta pregunta
    if (respuesta.respuestas && Array.isArray(respuesta.respuestas)) {
      // Estructura: array de objetos [{pregunta, respuesta}]
      const respEncontrada = respuesta.respuestas.find(r => {
        const preguntaRespuesta = r.pregunta || r.preguntaTexto || '';
        const preguntaEncuesta = pregunta.pregunta || '';
        return preguntaRespuesta.trim() === preguntaEncuesta.trim();
      });
      
      if (respEncontrada && respEncontrada.respuesta !== undefined) {
        valorRespuesta = Array.isArray(respEncontrada.respuesta) 
          ? respEncontrada.respuesta.join(', ')
          : respEncontrada.respuesta.toString();
      }
    } else if (respuesta.respuestas && typeof respuesta.respuestas === 'object') {
      // Estructura: objeto { "pregunta": "respuesta" }
      const clavePregunta = Object.keys(respuesta.respuestas).find(key => 
        key.trim() === pregunta.pregunta.trim()
      );
      if (clavePregunta) {
        const valor = respuesta.respuestas[clavePregunta];
        valorRespuesta = Array.isArray(valor) ? valor.join(', ') : valor.toString();
      }
    }
    
    respuestasFormateadas.push({
      pregunta: pregunta.pregunta,
      tipo: pregunta.tipoPregunta,
      respuesta: valorRespuesta
    });
  });
  
  return respuestasFormateadas;
}

  enriquecerAnalisis(encuesta, respuestas, analisisIA) {
    const metricas = this.calcularMetricas(respuestas, encuesta.preguntas);
    const tendencias = this.analizarTendencias(respuestas, encuesta.preguntas);
    
    return {
      encuestaId: encuesta.InquiroSK,
      tituloEncuesta: encuesta.titulo,
      descripcion: encuesta.descripcion,
      fechaAnalisis: new Date().toISOString(),
      totalRespuestas: respuestas.length,
      estadoEncuesta: encuesta.estado,
      ...analisisIA,
      metricas,
      tendencias,
      metadata: {
        proveedor: 'Deepseek AI',
        version: '1.0',
        costoAproximado: this.calcularCostoAproximado(respuestas),
        tiempoProcesamiento: '~2-5 segundos'
      }
    };
  }

  calcularMetricas(respuestas, preguntas) {
    const metricas = {
      participacion: {
        total: respuestas.length,
        porPregunta: {}
      },
      tiposPreguntas: {},
      completitud: this.calcularCompletitud(respuestas)
    };

    preguntas.forEach(pregunta => {
      metricas.tiposPreguntas[pregunta.tipoPregunta] = 
        (metricas.tiposPreguntas[pregunta.tipoPregunta] || 0) + 1;
    });

    return metricas;
  }

  calcularCompletitud(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length === 0) return 0;

  let totalCampos = 0;
  let camposCompletados = 0;

  respuestas.forEach(respuesta => {
    if (respuesta.respuestas && Array.isArray(respuesta.respuestas)) {
      respuesta.respuestas.forEach(resp => {
        totalCampos++;

        let valor = resp.respuesta;

        // ✅ Si la respuesta es un array (por ejemplo, selección múltiple), convertir a texto
        if (Array.isArray(valor)) {
          valor = valor.join(', ');
        }

        // ✅ Si es string, limpiar espacios
        if (typeof valor === 'string') {
          valor = valor.trim();
        }

        // ✅ Contar como completado si no está vacío ni null
        if (valor && valor !== '') {
          camposCompletados++;
        }
      });
    }
  });

  return totalCampos > 0 ? (camposCompletados / totalCampos) * 100 : 0;
}

  analizarTendencias(respuestas) {
    const tendencias = {
      respuestasRecientes: 0,
      horarioPico: this.calcularHorarioPico(respuestas),
      duracionPromedio: this.calcularDuracionPromedio(respuestas)
    };

    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

    tendencias.respuestasRecientes = respuestas.filter(resp => 
      new Date(resp.fechaRespuesta) > sieteDiasAtras
    ).length;

    return tendencias;
  }

  calcularHorarioPico(respuestas) {
    if (respuestas.length === 0) return 'No hay datos';

    const horas = respuestas.map(resp => {
      const fecha = new Date(resp.fechaRespuesta);
      return fecha.getHours();
    });

    const frecuenciaHoras = horas.reduce((acc, hora) => {
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {});

    const horarioPico = Object.keys(frecuenciaHoras).reduce((a, b) => 
      frecuenciaHoras[a] > frecuenciaHoras[b] ? a : b
    );

    return `${horarioPico}:00 - ${parseInt(horarioPico) + 1}:00`;
  }

  calcularDuracionPromedio(respuestas) {
    if (respuestas.length === 0) return 'No hay datos';
    const duracionEstimada = 3;
    return `${duracionEstimada} min`;
  }

  calcularCostoAproximado(respuestas) {
    const tokensPorRespuesta = 50;
    const totalTokens = respuestas.length * tokensPorRespuesta;
    const costo = (totalTokens / 1000000) * 0.14;
    return `~$${costo.toFixed(6)}`;
  }

  // Método para análisis rápido (sin IA)
  async generarAnalisisRapido(encuestaId) {
    try {
      const [encuesta, respuestas] = await Promise.all([
        this.obtenerEncuesta(encuestaId),
        this.obtenerRespuestas(encuestaId)
      ]);

      return {
        encuestaId: encuesta.InquiroSK,
        tituloEncuesta: encuesta.titulo,
        totalRespuestas: respuestas.length,
        completitud: this.calcularCompletitud(respuestas),
        analisis: {
          resumen_general: `Encuesta con ${respuestas.length} respuestas. Completitud: ${this.calcularCompletitud(respuestas).toFixed(1)}%`,
          sentimiento_promedio: 0,
          temas_principales: ["Análisis básico"],
          insights: [
            {
              titulo: "Datos recopilados",
              descripcion: `Se han recopilado ${respuestas.length} respuestas para esta encuesta`,
              tipo: "neutral"
            }
          ],
          recomendaciones: [
            "Para un análisis más detallado, use el análisis con IA"
          ]
        },
        metadata: {
          tipo: 'analisis_rapido',
          sin_ia: true
        }
      };
    } catch (error) {
      throw new Error(`Error en análisis rápido: ${error.message}`);
    }
  }

  // Métodos de gráficos existentes (mantener compatibilidad)
  graficosPreguntasRadio(preguntas, respuestas) {
    return this.graficosService.graficosPorTipoPregunta(preguntas, respuestas)
      .filter(grafico => grafico.tipoPregunta === 'opciones_radio');
  }

  async obtenerDatosParaGraficos(encuestaId) {
    try {
      const [encuesta, respuestas] = await Promise.all([
        this.obtenerEncuesta(encuestaId),
        this.obtenerRespuestas(encuestaId)
      ]);

      const dashboard = await this.graficosService.generarDashboardCompleto(encuesta, respuestas);

      return {
        encuestaId,
        titulo: encuesta.titulo,
        graficos: dashboard.graficos
      };
    } catch (error) {
      throw new Error(`Error generando datos para gráficos: ${error.message}`);
    }
  }

  graficoParticipacionGeneral(respuestas) {
    return this.graficosService.graficoParticipacion(respuestas);
  }

  graficoTendenciasTemporales(respuestas) {
    return this.graficosService.graficoTendenciasTemporales(respuestas);
  }

  graficoCompletitud(respuestas) {
    const completitud = this.calcularCompletitud(respuestas);
    return {
      tipo: 'pastel',
      titulo: 'Tasa de Completitud',
      datos: [
        { label: 'Completado', value: completitud, color: '#4CAF50' },
        { label: 'Incompleto', value: 100 - completitud, color: '#FF9800' }
      ]
    };
  }

  generarColor(index) {
    const colores = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
      '#9C27B0', '#00BCD4', '#FF5722', '#795548',
      '#607D8B', '#3F51B5'
    ];
    return colores[index % colores.length];
  }

  
  async obtenerAnalisisExistente(encuestaId) {
    try {
      return null;
    } catch (error) {
      console.error('Error obteniendo análisis existente:', error);
      return null;
    }
  }

  esAnalisisReciente(analisis, minutos = 60) {
    return false;
  }
}