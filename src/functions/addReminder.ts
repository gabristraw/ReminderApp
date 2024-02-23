import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const eventbridge = new AWS.EventBridge();
const REMINDERS_TABLE = process.env.REMINDERS_TABLE;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { title, datetime } = JSON.parse(event.body);
  const reminderId = uuidv4();

  const params = {
    TableName: REMINDERS_TABLE,
    Item: {
      id: reminderId,
      title,
      datetime,
    },
  };

  
    await dynamoDb.put(params).promise();
    const eventTime = new Date(datetime).toISOString(); 
  
  try {

    await eventbridge.putEvents({
      Entries: [{
        Source: 'custom.myApp',
        DetailType: 'ReminderCreated',
        Detail: JSON.stringify({
          reminderId,
          title,
        }),
        EventBusName: 'default', 
        Time: new Date(eventTime), 
      }]
    }).promise();

    return { statusCode: 200,

      headers: {
        "Access-Control-Allow-Origin": "*", // 
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE", // 
      },
       body: JSON.stringify({ reminderId }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not create reminder" }) };
  }
};

