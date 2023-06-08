import { Handler, HandlerEvent } from '@netlify/functions';

import cards from '../cards.json';

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

type Row = {
  id: number;
  name: string;
  email: string;
  killed: 0 | 1;
  recruited: 0 | 1;
  cursed: 0 | 1;
  bitten: 0 | 1;
  protected_vampire: 0 | 1;
  protected_werewolf: 0 | 1;
  user_id: number;
  role_id: number;
};

type StateRow = {};

const rowToStateRow = (row: Row): StateRow => ({
  id: row.id,
  name: row.name,
  email: row.email,
  killed: !!row.killed,
  recruited: !!row.recruited,
  cursed: !!row.cursed,
  bitten: !!row.bitten,
  protected_vampire: !!row.protected_vampire,
  protected_werewolf: !!row.protected_werewolf,
  role: row.role_id ? cards.find((card) => card.id === row.role_id) : null,
});

const handler: Handler = async (event: HandlerEvent) => {
  let token;
  if (!event.headers.authorization) {
    token = event.queryStringParameters.token;
  } else {
    const [, headerToken] = event.headers.authorization.split(' ');
    token = headerToken;
  }

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return {
      statusCode: 403,
    };
  }

  const users: Row[] = await knex('users')
    .leftJoin('assignments', 'users.id', 'assignments.user_id')
    .select('users.*', 'assignments.role_id');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(users.map(rowToStateRow)),
  };
};

export { handler };
