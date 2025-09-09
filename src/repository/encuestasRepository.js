import { dynamodb } from "../../inquiroDB.js"

const TABLE_ENCUESTAS = process.env.DYNAMODB_TABLE_ENCUESTAS;

const crearEncuestaRepository = async (encuestaData) => {
  console.log(TABLE_ENCUESTAS)
  const params = {
        TableName: TABLE_ENCUESTAS,
        Item: encuestaData,  
  };

  try {
    await dynamodb.put(params).promise();
    return encuestaData; 
  } catch (error) {
    console.error("Error al crear encuesta:", error);
    throw new Error("Error al crear encuesta");
  }
};

const obtenerEncuestasPorPkRepository = async (pk) => {
    const params = {
        TableName: TABLE_ENCUESTAS,
        KeyConditionExpression: 'InquiroPK = :email', 
        ExpressionAttributeValues: {
        ':email': pk, 
    },
  };

  try {
    const result = await dynamodb.query(params).promise();
    return result.Items; 
  } catch (error) {
    console.log("No se pudo obtener encuestas por PK: " + error.message)
    throw new Error(`Error al obtener las encuestas: ${error.message}`);
  }
};

const obtenerTodosLosEmailsClienteRepository = async () => {
    const params = {
        TableName: TABLE_ENCUESTAS,
        ProjectionExpression: 'InquiroPK'
    };

  try {
    const result = await dynamodb.scan(params).promise();
    return result.Items; 
  } catch (error) {
    console.log("No se pudieron obtener los e-mails: " + error.message)
    throw new Error(`Error al obtener e-mails: ${error.message}`);
  }
};

const obtenerTodasLasEncuestasRepository = async () => {
    const params = {
        TableName: TABLE_ENCUESTAS,
        ProjectionExpression: 'InquiroPK, InquiroSK, preguntas, fechaCreacion, titulo'
    };

  try {
    const result = await dynamodb.scan(params).promise();
    return result.Items; 
  } catch (error) {
    console.log("No se pudieron obtener las encuestas: " + error.message)
    throw new Error(`Error al obtener las encuestas: ${error.message}`);
  }
};

const obtenerEncuestaPorSkRepository = async (pk,sk) => {
    const params = {
        TableName: TABLE_ENCUESTAS,
        KeyConditionExpression: 'InquiroPK = :pk and InquiroSK = :sk', 
        ExpressionAttributeValues: {
        ':pk': pk,    
        ':sk': sk, 
    },
};

  try {
    const result = await dynamodb.query(params).promise();

    if (!result.Items || result.Items.length === 0) {
      throw new Error(`No se encontró ninguna encuesta con la SK: ${sk}`);
    }

    return result.Items; 
  } catch (error) {
    console.log(`No se pudo obtener encuesta por SK ${sk}: ` + error.message)
    throw new Error(`Error al obtener la encuesta por SK ${sk} : ${error.message}`);
  }
};

const obtenerEncuestaPorSkGSIRepository= async (sk) => {
    const params = {
        TableName: TABLE_ENCUESTAS,
        IndexName: "InquiroSK-index",
        KeyConditionExpression: 'InquiroSK = :sk', 
        ExpressionAttributeValues: {
        ':sk': sk, 
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    if (!result.Items || result.Items.length === 0) {
      throw new Error(`No se encontró ninguna encuesta con la SK: ${sk}`);
    }

    return result.Items; 
  } catch (error) {
    console.log(`No se pudo obtener encuesta por SK ${sk}: ` + error.message)
    throw new Error(`Error al obtener la encuesta por SK ${sk} : ${error.message}`);
  }
};


const actualizarEncuestaRepository = async (InquiroPK, InquiroSK, titulo, preguntas) => {
  const params = {
    TableName: TABLE_ENCUESTAS,  
    Key: {
      'InquiroPK': InquiroPK,  
      'InquiroSK': InquiroSK,   
    },
    UpdateExpression: 'SET titulo = :titulo, preguntas = :preguntas',
    ExpressionAttributeValues: {
      ':titulo': titulo,     
      ':preguntas': preguntas,  
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();

    return result.Attributes;
  } catch (error) {
    console.error('Error al reemplazar la encuesta:', error.message);
    throw new Error(`Error al reemplazar la encuesta: ${error.message}`);
  }
};

export { crearEncuestaRepository, obtenerEncuestasPorPkRepository, obtenerTodasLasEncuestasRepository,obtenerEncuestaPorSkRepository,obtenerEncuestaPorSkGSIRepository, actualizarEncuestaRepository, obtenerTodosLosEmailsClienteRepository };