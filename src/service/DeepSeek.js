import 'dotenv/config';
import fetch from 'node-fetch';

export class DeepseekService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY no está configurada correctamente');
    }
  }

  async analizarEncuesta(encuestaId, datosParaAnalisis) {
    console.log('🟡 Iniciando análisis para encuesta:', encuestaId);

    // Generar prompt natural
    const prompt = this.crearPromptTextoLibre(datosParaAnalisis);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: 'system', 
              content: `Eres un analista humano experto en investigación de usuarios y análisis cualitativo. 
              
Tu especialidad es interpretar respuestas de encuestas con empatía, captando matices y entendiendo el contexto detrás de las palabras de los usuarios.

**Tu estilo:**
- Natural y conversacional, evitando jerga técnica innecesaria
- Empático con las experiencias de los usuarios
- Observador de patrones y tendencias sutiles
- Pragmático en tus recomendaciones
- Humano en tu forma de expresar insights` 
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2500,
          top_p: 0.9
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(' Error desde Groq:', data);
        throw new Error(`Groq API error: ${data.error?.message || response.statusText}`);
      }

      const contenido = data.choices?.[0]?.message?.content || '';
      console.log('✅ Análisis Groq completado con estilo natural.');
      
      // Procesar la respuesta
      const analisisProcesado = this.procesarRespuestaIA(contenido);
      
      return { 
        success: true, 
        analisis: analisisProcesado 
      };

    } catch (error) {
      console.error('❌ Error en analizarEncuesta:', error);
      throw error;
    }
  }

  crearPromptTextoLibre(datosParaAnalisis) {
  try {
    const encuesta = datosParaAnalisis?.encuesta;
    const respuestas = datosParaAnalisis?.respuestas;

    if (!encuesta || !respuestas) {
      return 'No hay datos suficientes para el análisis.';
    }

    // Construir texto de respuestas - ADAPTADO A LA ESTRUCTURA ACTUAL
    const textosRespuestas = respuestas.map((respuesta, idx) => {
      let texto = `--- Respuesta ${idx + 1} (${respuesta.fecha ? new Date(respuesta.fecha).toLocaleDateString('es-ES') : 'sin fecha'}) ---\n`;
      
      // La estructura actual tiene respuestas como array de objetos [{pregunta, respuesta}]
      if (respuesta.respuestas && Array.isArray(respuesta.respuestas)) {
        respuesta.respuestas.forEach((item) => {
          const pregunta = item.pregunta || 'Pregunta';
          const respuestaTexto = Array.isArray(item.respuesta) ? item.respuesta.join(', ') : item.respuesta;
          texto += `P: ${pregunta}\n`;
          texto += `R: ${respuestaTexto}\n\n`;
        });
      }
      return texto;
    }).join('\n');

    const promptFinal = `
ANALIZA ESTAS RESPUESTAS DE ENCUESTA Y GENERA UN INFORME COMPLETO:

**INFORMACIÓN DE LA ENCUESTA:**
• Título: ${encuesta.titulo}
• Descripción: ${encuesta.descripcion || 'No disponible'}
• Total de respuestas: ${respuestas.length}

**RESPUESTAS RECIBIDAS:**
${textosRespuestas}

**INSTRUCCIONES PARA EL ANÁLISIS:**
Como analista experto, genera un informe que incluya:

 RESUMEN EJECUTIVO
Un panorama general de lo que revelan las respuestas, destacando los hallazgos principales.


 ASPECTOS POSITIVOS
Lo que está funcionando bien según la percepción de los usuarios.

 ÁREAS DE MEJORA  
Problemas, quejas o sugerencias recurrentes que necesitan atención.

 RECOMENDACIONES ACCIONABLES
Sugerencias concretas para mejorar basadas en los hallazgos.

**ESTILO:**
- Sé natural y conversacional, como un consultor humano
- Usa ejemplos específicos de las respuestas cuando sea relevante
- Mantén un tono profesional pero accesible
- Evita lenguaje técnico innecesario
- Enfócate en insights prácticos y útiles

El objetivo es entender profundamente lo que dicen los usuarios y traducirlo en acciones concretas.
    `;

    console.log('📝 Prompt natural generado (primeros 500 chars):', promptFinal.substring(0, 500));
    return promptFinal;

  } catch (error) {
    console.error('❌ Error en crearPromptTextoLibre:', error);
    return 'Error generando el análisis.';
  }
}

  formatearAnalisisTexto(textoAnalisis, totalRespuestas) {
    // Groq devuelve texto libre, lo estructuramos básicamente
    return {
      analisis_texto: textoAnalisis,
      resumen_estructurado: {
        total_respuestas: totalRespuestas,
        tipo_analisis: "textual_groq"
      }
    };
  }

  procesarRespuestaIA(textoRespuesta) {
    try {
      console.log('🔍 Procesando respuesta de IA...');
      console.log('📄 TEXTO COMPLETO DE GROQ:', textoRespuesta);
      
      // Si ya es un objeto JSON, devolverlo directamente
      if (typeof textoRespuesta === 'object') {
        console.log('✅ Respuesta ya es objeto JSON');
        return textoRespuesta;
      }
      
      // Intentar extraer JSON si está embebido en texto
      const jsonMatch = textoRespuesta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('📋 JSON extraído:', jsonMatch[0]);
        const analisis = JSON.parse(jsonMatch[0]);
        console.log('✅ Análisis procesado correctamente');
        return analisis;
      }
      
      // Si no hay JSON, devolver como texto plano
      console.log('📝 Respuesta es texto plano, devolviendo como análisis textual');
      return {
        analisis_texto: textoRespuesta,
        resumen_general: "Análisis generado por IA",
        sentimiento_promedio: 0,
        temas_principales: ["Análisis cualitativo de respuestas"],
        insights: [
          {
            titulo: "Respuestas analizadas",
            descripcion: "Se procesaron las respuestas de la encuesta",
            tipo: "neutral"
          }
        ],
        recomendaciones: [
          "Revisar los comentarios específicos para acciones concretas",
          "Considerar realizar seguimiento de los temas identificados"
        ]
      };
      
    } catch (error) {
      console.error('❌ Error procesando la respuesta IA:', error);
      console.error('📄 Texto que falló:', textoRespuesta);
      return {
        resumen_general: "Análisis no disponible temporalmente",
        sentimiento_promedio: 0,
        temas_principales: [],
        insights: [
          {
            titulo: "Error en el análisis",
            descripcion: "No se pudo procesar la respuesta de la IA",
            tipo: "neutral"
          }
        ],
        recomendaciones: ["Vuelve a intentar más tarde", "Verifica la conexión"],
        analisis_detallado: { 
          total_respuestas: 0, 
          participacion_estimada: 0,
          nota: "Error temporal en el servicio de IA"
        }
      };
    }
  }
}