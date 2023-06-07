import { Handler, HandlerEvent } from '@netlify/functions';
import { klona } from 'klona';
import cards from '../cards.json';

const handler: Handler = async (event: HandlerEvent) => {
  const card = klona(cards).find(
    (card) => card.id === parseInt(event.queryStringParameters.role, 10),
  );
  card.rules = [...card.rules, 'If you are **cursed**, your information will be wrong.'];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(card),
  };
};

export { handler };
