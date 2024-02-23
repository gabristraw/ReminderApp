import { DynamoDB, SES } from 'aws-sdk';
import { ScheduledHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const ses = new SES({ region: process.env.AWS_REGION });
const REMINDERS_TABLE = process.env.REMINDERS_TABLE!;
const EMAIL_SOURCE = process.env.EMAIL_SOURCE!;
const EMAIL_DESTINATION = process.env.EMAIL!;

interface ReminderItem {
  id: string;
  title: string;
  datetime: string; 
  sent?: boolean; 
}

export const handler: ScheduledHandler = async () => {
  const now = new Date().toISOString();

  const params = {
    TableName: REMINDERS_TABLE,
    FilterExpression: "#datetime <= :now",
    ExpressionAttributeNames: {
      "#datetime": "datetime",
    },
    ExpressionAttributeValues: {
      ":now": now,
    },
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    for (const item of data.Items as ReminderItem[]) {
      await sendEmail(item);
      await markAsSent(item.id);
      await deleteReminder(item.id);
    }
  } catch (error) {
    console.error("Error al procesar recordatorios", error);
    throw error;
  }
};

async function sendEmail(reminder: ReminderItem) {
  const params: SES.Types.SendEmailRequest = {
    Source: EMAIL_SOURCE,
    Destination: { ToAddresses: [EMAIL_DESTINATION] },
    Message: {
      Body: { Text: { Data: `Recordatorio: ${reminder.title}` } },
      Subject: { Data: "Reminder Programmed" },
    },
  };

  try {
    const response = await ses.sendEmail(params).promise();
    console.log(`Correo enviado: ${response.MessageId}`);
  } catch (error) {
    console.error("Error sending the Email", error);
    throw error;
  }
}

async function markAsSent(reminderId: string) {
  const params = {
    TableName: REMINDERS_TABLE,
    Key: { id: reminderId },
    UpdateExpression: "set sent = :sent",
    ExpressionAttributeValues: {
      ":sent": true,
    },
  };

  try {
    await dynamoDb.update(params).promise();
    console.log(`Reminder as sent: ${reminderId}`);
  } catch (error) {
    console.error("Error labeling at sent", error);
    throw error;
  }
}


async function deleteReminder(reminderId: string) {
    const params = {
      TableName: REMINDERS_TABLE,
      Key: { id: reminderId },
    };
  
    try {
      await dynamoDb.delete(params).promise();
      console.log(`Recordatorio eliminado: ${reminderId}`);
    } catch (error) {
      console.error("Error al eliminar el recordatorio", error);
      throw error;
    }
  }
