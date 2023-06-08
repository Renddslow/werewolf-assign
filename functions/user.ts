import { Handler, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';
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

type User = {
  id: number;
  name: string;
  email: string;
};

const createResponse = (payload: User) => {
  const token = jwt.sign(
    { name: payload.name, id: payload.id, email: payload.email },
    process.env.JWT_SECRET,
  );
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  };
};

const handler: Handler = async (event: HandlerEvent) => {
  const { name, email } = JSON.parse(event.body);

  const existingUser: User = await knex('users').where({ email, name }).first();

  if (existingUser) {
    return createResponse(existingUser);
  }

  await knex('users').insert({ name, email });
  const user: User = await knex('users').where({ email }).first();

  return createResponse(user);
};

export { handler };
