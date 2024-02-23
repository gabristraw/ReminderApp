import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const REMINDERS_TABLE = process.env.REMINDERS_TABLE;

export const handler: APIGatewayProxyHandler = async (event) => {
 
  const reminderId = event.pathParameters?.id;
  
  if (!reminderId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Reminder ID is required" }) };
  }

  const params = {
    TableName: REMINDERS_TABLE,
    Key: {
      id: reminderId,
    },
  };

  try {
    await dynamoDb.delete(params).promise();
    return { statusCode: 200, 
      headers: {
      "Access-Control-Allow-Origin": "*", // 
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE", // 
    },
    body: JSON.stringify({ message: "Reminder deleted successfully" }) };
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return { statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // 
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE", // 
      },
      body: JSON.stringify({ error: "Could not delete reminder" }) };
  }
};

export default handler;
