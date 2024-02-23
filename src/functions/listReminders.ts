import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const REMINDERS_TABLE = process.env.REMINDERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const params = {
      TableName: REMINDERS_TABLE,
    };

    const data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ reminders: data.Items }),
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*", // 
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE", // 
      },
    };
  } catch (error) {
    console.error('Error retrieving reminders: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not retrieve reminders' }),
    };
  }
};
