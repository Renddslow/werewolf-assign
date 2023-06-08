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

type UserState = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  killed: boolean;
  recruited: boolean;
  bitten: boolean;
  protected_vampire: boolean;
  protected_werewolf: boolean;
};

const handler: Handler = async (event: HandlerEvent) => {
  // get token from auth
  const [, token] = event.headers.authorization.split(' ');
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user: UserState = await knex('users')
    .leftJoin('assignments', 'users.id', 'assignments.user_id')
    .where({ 'users.id': id })
    .first();

  const clientSafeData = {
    id,
    role: user.role_id,
    killed: user.killed,
    recruited: user.recruited,
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientSafeData),
  };
};

export { handler };
