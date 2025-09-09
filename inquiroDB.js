import AWS from 'aws-sdk';
import dotenv from "dotenv"

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

AWS.config.update({ region: process.env.AWS_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE = process.env.DYNAMODB_TABLE || 'InquiroDB';

export { dynamodb, TABLE };