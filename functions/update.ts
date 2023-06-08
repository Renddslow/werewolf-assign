import { Handler, HandlerEvent } from '@netlify/functions';
import { Simulate } from 'react-dom/test-utils';
import select = Simulate.select;

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
  killed: 0 | 1;
  recruited: 0 | 1;
  cursed: 0 | 1;
  bitten: 0 | 1;
  protected_vampire: 0 | 1;
  protected_werewolf: 0 | 1;
  role_id: number;
};

const CULTIST = 18;
const WEREWOLF = 20;

const handleKilled = async (user: User) => {
  await knex('users').where({ id: user.id }).update({
    killed: true,
  });

  if (user.role_id === WEREWOLF) {
    const cursed: User = await knex('users').where({ cursed: true }).first();
    if (cursed) {
      await knex('assignments').where({ user_id: cursed.id }).update({
        role_id: WEREWOLF,
      });
    }
  }
  if (user.role_id === CULTIST) {
    const recruits: User[] = await knex('users').where({ recruited: true });
    if (recruits.length) {
      const idx = Math.floor(Math.random() * recruits.length);
      await knex('assignments').where({ user_id: recruits[idx].id }).update({
        role_id: CULTIST,
      });
    }
  }
};

const handleProtection = async (user: User, from: 'vampire' | 'werewolf', value: boolean) => {
  return knex('users')
    .where({ id: user.id })
    .update({
      [`protected_${from}`]: value,
    });
};

const handleRecruitment = async (user: User, value: boolean) => {
  return knex('users').where({ id: user.id }).update({
    recruited: value,
  });
};

const handleCursing = async (user: User) => {
  await knex('users').where({ cursed: true }).update({
    cursed: false,
  });
  return knex('users').where({ id: user.id }).update({
    cursed: true,
  });
};

const handleBite = async (user: User, value: boolean) => {
  return knex('users').where({ id: user.id }).update({
    bitten: value,
  });
};

const handler: Handler = async (event: HandlerEvent) => {
  const { id, action, value } = JSON.parse(event.body);
  const [, token] = event.headers.authorization.split(' ');

  if (token !== process.env.ADMIN_TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Unauthorized',
      }),
    };
  }

  const user: User = await knex('users')
    .leftJoin('assignments', 'users.id', 'assignments.user_id')
    .select('users.*', 'assignments.role_id')
    .where({ 'users.id': id })
    .first();

  switch (action) {
    case 'killed':
      await handleKilled(user);
      break;
    case 'recruited':
      await handleRecruitment(user, value);
      break;
    case 'cursed':
      await handleCursing(user);
      break;
    case 'bitten':
      await handleBite(user, value);
      break;
    case 'protected_vampire':
      await handleProtection(user, 'vampire', value);
      break;
    case 'protected_werewolf':
      await handleProtection(user, 'werewolf', value);
      break;
  }

  return {
    statusCode: 200,
  };
};

export { handler };
