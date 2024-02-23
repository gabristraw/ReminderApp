import type { AWS } from '@serverless/typescript';

const REMINDERS_TABLE = 'RemindersTable';
const AWS_REGION = 'us-east-1';
const serverlessConfiguration: AWS = {
  service: 'reminderAppV0',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: AWS_REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      REMINDERS_TABLE: REMINDERS_TABLE, 
      EMAIL: 'gabrielpimpam@gmail.com', 
      EMAIL_SOURCE: '02gabriel.garcia02@gmail.com',
    },
    iam: { 
      role: {
        statements: [
          {
          Effect: 'Allow',
          Action: [
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
          ],
          Resource: `arn:aws:dynamodb:${AWS_REGION}:*:table/${REMINDERS_TABLE}`,
        }, 
        {
          Effect: 'Allow',
          Action: ['events:*'],
          Resource: `*`,
        },
        {
          Effect: 'Allow',
          Action: ['ses:SendEmail', 'ses:SendRawEmail'],
          Resource: `*`,
        },
        {
          Effect: 'Allow',
          Action: ['schemas:ListDiscoverers'],
          Resource: `*`,
        }
      ],
      },
    },
  },
  functions: { 
    addReminder: {
      handler: 'src/functions/addReminder.handler',
      events: [
        {
          http: {
            path: 'add-reminder',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
    deleteReminder: {
      handler: 'src/functions/deleteReminder.handler',
      events: [
        {
          http: {
            path: 'delete-reminder/{id}',
            method: 'delete',
            cors: true,
          },
        },
      ],
    },
    listReminder: {
      handler: 'src/functions/listReminders.handler',
      events: [
        {
          http: {
            path: 'list-reminders',
            method: 'get',
            cors: true,
          },
        },
      ],
    },
    sendEmail: {
      handler: 'src/functions/sendEmail.handler',
      events:       
      [
        {
          schedule: {
            rate: ['cron(*/5 * * * ? *)'],
            enabled: true,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: [], 
      target: 'node14', 
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      RemindersTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: REMINDERS_TABLE,
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
