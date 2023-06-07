import { Handler, HandlerEvent } from '@netlify/functions';
import { klona } from 'klona';
import cards from '../cards.json';
import definitions from '../definitions.json';

const handler: Handler = async (event: HandlerEvent) => {
  const card = klona(cards).find(
    (card) => card.id === parseInt(event.queryStringParameters.role, 10),
  );
  if (card.category === 'information') {
    card.rules.push('If you are [[cursed]], your information will be wrong.');
  }

  const dfn = [...card.rules, ...card.tips]
    .reduce((acc, rule) => {
      const regexpr = /\[\[(.*?)]]/g;
      const matches = regexpr.exec(rule);
      if (matches) {
        acc.push(matches[1]);
      }
      return acc;
    }, [])
    .reduce((acc, definition) => {
      if (definitions[definition]) {
        acc[definition] = definitions[definition];
      }
      return acc;
    }, {});

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...card,
      definitions: dfn,
    }),
  };
};

export { handler };
