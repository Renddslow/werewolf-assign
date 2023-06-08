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

const getCard = (id: number) => {
  return cards.find((card) => card.id === id);
};

const handleKilled = async (user: User) => {
  await knex('users').where({ id: user.id }).update({
    killed: true,
  });
  await knex('events').insert({
    type: 'KILLED',
    content: `${user.name} (${getCard(user.role_id).title}) was killed!`,
  });

  if (user.role_id === WEREWOLF) {
    const cursed: User = await knex('users')
      .leftJoin('assignments', 'users.id', 'assignments.user_id')
      .where({ cursed: true })
      .select('users.*', 'assignments.role_id')
      .first();
    if (cursed) {
      await knex('assignments').where({ user_id: cursed.id }).update({
        role_id: WEREWOLF,
      });
      await knex('events').insert({
        type: 'CURSED_BECOMES_WEREWOLF',
        content: `${cursed.name} (${getCard(cursed.role_id).title}) has become a werewolf!`,
      });
    }
  }
  if (user.role_id === CULTIST) {
    const recruits: User[] = await knex('users')
      .leftJoin('assignments', 'users.id', 'assignments.user_id')
      .where({ recruited: true })
      .select('users.*', 'assignments.role_id');
    if (recruits.length) {
      const idx = Math.floor(Math.random() * recruits.length);
      await knex('assignments').where({ user_id: recruits[idx].id }).update({
        role_id: CULTIST,
      });
      await knex('events').insert({
        type: 'RECRUIT_BECOMES_CULTIST',
        content: `${recruits[idx].name} (${
          getCard(recruits[idx].role_id).title
        }) has become a cultist!`,
      });
    }
  }
};

const handleProtection = async (user: User, from: 'vampire' | 'werewolf', value: boolean) => {
  await knex('users')
    .where({ id: user.id })
    .update({
      [`protected_${from}`]: value,
    });
  return knex('events').insert({
    type: 'USER_PROTECTED',
    content: `${user.name} (${
      getCard(user.role_id).title
    }) has been protected from ${from} attacks and recruitment!`,
  });
};

const handleRecruitment = async (user: User, value: boolean) => {
  await knex('users').where({ id: user.id }).update({
    recruited: value,
  });
  if (value) {
    await knex('events').insert({
      type: 'USER_RECRUITED',
      content: `${user.name} (${getCard(user.role_id).title}) has joined the cult`,
    });
  }
  return;
};

const handleCursing = async (user: User) => {
  const cursed: User = await knex('users')
    .leftJoin('assignments', 'users.id', 'assignments.user_id')
    .where({ cursed: true })
    .select('users.*', 'assignments.role_id')
    .first();
  if (cursed) {
    await knex('events').insert({
      type: 'CURSE_BROKEN',
      content: `${cursed.name} (${getCard(cursed.role_id).title}) had their curse broken.`,
    });
  }

  await knex('users').where({ cursed: true }).update({
    cursed: false,
  });
  await knex('users').where({ id: user.id }).update({
    cursed: true,
  });
  return knex('events').insert({
    type: 'USER_CURSED',
    content: `${user.name} (${getCard(user.role_id).title}) was cursed.`,
  });
};

const handleBite = async (user: User, value: boolean) => {
  await knex('users').where({ id: user.id }).update({
    bitten: value,
  });
  return knex('events').insert({
    type: 'USER_BITTEN',
    content: `${user.name} (${getCard(user.role_id).title}) was bitten.`,
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
