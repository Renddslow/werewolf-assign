import { Handler, HandlerEvent } from '@netlify/functions';
import cards from '../cards.json';
import { klona } from 'klona';
import pipr from 'pipr';

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
};

type Card = {
  id: number;
  turnOrder: number;
  assignmentRules: {
    min: number;
    max: number;
  };
};

const SEER = 1;
const PRIEST = 3;
const SILVERSMITH = 4;
const ARCANIST = 8;
const ANOINTED = 15;
const VAMPIRE = 19;
const CULTIST = 18;
const WEREWOLF = 20;

const totalCardInDeck = (deck: Card[], id: number) => deck.filter((card) => card.id === id).length;
const fillCards = (card: Card) => {
  const count = randRange(card.assignmentRules.min, card.assignmentRules.max);
  return Array(count).fill(card);
};

const shuffle = (array: any[]) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = randRange(0, currentIndex - 1);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const handler: Handler = async (event: HandlerEvent) => {
  const [, token] = (event.headers.authorization || '').split(' ');

  await wait(1.5 * 1000);

  // if (token !== process.env.ADMIN_TOKEN) {
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify({
  //       error: 'Unauthorized',
  //     }),
  //   };
  // }

  if (await knex('assignments').first()) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Assignments already exist',
      }),
    };
  }

  const users: User[] = await knex('users').select('id');
  const deck = klona<Card[]>(cards).sort((a, b) => a.turnOrder - b.turnOrder);

  const cardsNeed = users.length;
  const finalDeck = [];
  let i = 0;
  const SINGLE_LIMITS: number[] = [SEER, ANOINTED, CULTIST, ARCANIST];
  console.log(users, cardsNeed);
  while (finalDeck.length < cardsNeed) {
    const card = deck[i % deck.length];
    const cards = fillCards(card);

    if (SINGLE_LIMITS.includes(card.id)) {
      if (totalCardInDeck(finalDeck, card.id) >= 1) {
        i++;
        continue;
      }
    }

    if (card.id === WEREWOLF && totalCardInDeck(finalDeck, card.id) >= 2) {
      i++;
      continue;
    }

    if (card.id === VAMPIRE && totalCardInDeck(finalDeck, card.id) >= 3) {
      i++;
      continue;
    }

    if (card.id === PRIEST && totalCardInDeck(finalDeck, card.id) >= 2) {
      i++;
      continue;
    }

    if (card.id === SILVERSMITH && totalCardInDeck(finalDeck, card.id) >= 2) {
      i++;
      continue;
    }

    finalDeck.push(...cards);
    i++;
  }

  console.log(finalDeck);

  const shuffledUsers = shuffle(users);
  console.log(shuffledUsers);

  const assignments = finalDeck.map((card, idx) => ({
    user_id: shuffledUsers[idx].id,
    role_id: card.id,
  }));

  await knex('assignments').insert(assignments);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignments),
  };
};

export { handler };
