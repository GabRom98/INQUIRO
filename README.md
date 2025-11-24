# Backend Proyecto Final IFTS 11 

Desarrollado en NodeJS para uso con Elastic Beanstalk y DynamoDB en AWS Cloud Services.

## Env file
Este server requiere de un archivo .env con las siguientes variables de entorno:

* DYNAMODB_TABLE_ENCUESTAS - Tabla DynamoDB para encuestas.
* DYNAMODB_TABLE_RESPUESTAS - Tabala DynamoDB para respuestas.
* AWS_REGION - Región AWS
* GROQ_API_KEY - Api key de Groq para servicio de IA

Además, si se corre localmente, se deben agregar las siguientes variables para el sdk de AWS:

* aws_access_key_id
* aws_secret_access_key
* aws_session_token

Ejemplo:
```
DYNAMODB_TABLE_ENCUESTAS=InquiroEncuestasDB
DYNAMODB_TABLE_RESPUESTAS=InquiroRespuestasDB
AWS_REGION=us-east-1
GROQ_API_KEY=<token>
aws_access_key_id=<key>
aws_secret_access_key=<key>
aws_session_token=<token>
```