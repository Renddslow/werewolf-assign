import { Handler, HandlerEvent } from '@netlify/functions';

const Knex = require('knex');
const knexServerlessMysql = require('knex-serverless-mysql');

const mysql = require('serverless-mysql')({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});

const knex = Knex({
  client: knexServerlessMysql,
  mysql,
});

const handler: Handler = async (event: HandlerEvent) => {
  const [, token] = (event.headers.authorization || '').split(' ');

  if (token !== process.env.ADMIN_TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Unauthorized',
      }),
    };
  }

  await knex('events').insert({
    type: 'NEW_ROUND',
    content: 'New nighttime round started',
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export { handler };
