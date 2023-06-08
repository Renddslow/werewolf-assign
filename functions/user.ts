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
  const { name, email } = JSON.parse(event.body);

  await knex('users').insert({ name, email });
  const user = await knex('users').where({ email }).first();

  return {
    statusCode: 200,
  };
};

export { handler };
