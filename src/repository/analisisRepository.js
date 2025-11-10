import { dynamodb } from "../inquiroDB.js";

const TABLE_ENCUESTAS = process.env.DYNAMODB_TABLE_ENCUESTAS;

export const guardarAnalisisRepository = async (analisisData) => {
  const params = {
    TableName: TABLE_ENCUESTAS,
    Item: {
      InquiroPK: `ANALISIS#${analisisData.encuestaId}`, 
      InquiroSK: `VERSION#${Date.now()}`, 
      tipo: 'analisis',
      ...analisisData,
      fechaAnalisis: new Date().toISOString()
    }
  };

  try {
    await dynamodb.put(params).promise();
    return analisisData;
  } catch (error) {
    console.error("Error al guardar análisis:", error);
    throw new Error("Error al guardar análisis");
  }
};

export const obtenerAnalisisRepository = async (encuestaId, limit = 5) => {
  const params = {
    TableName: TABLE_ENCUESTAS,
    KeyConditionExpression: 'InquiroPK = :pk and begins_with(InquiroSK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ANALISIS#${encuestaId}`,
      ':sk': 'VERSION#'
    },
    Limit: limit,
    ScanIndexForward: false // Más reciente primero
  };

  try {
    const result = await dynamodb.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error("Error al obtener análisis:", error);
    return [];
  }
};

export const obtenerUltimoAnalisisRepository = async (encuestaId) => {
  const analisis = await obtenerAnalisisRepository(encuestaId, 1);
  return analisis.length > 0 ? analisis[0] : null;
};