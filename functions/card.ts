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
      let matches = regexpr.exec(rule);
      while (matches) {
        acc.push(matches[1]);
        matches = regexpr.exec(rule);
      }
      return acc;
    }, [])
    .reduce((acc, definition) => {
      if (definitions[definition.toLowerCase()]) {
        acc[definition.toLowerCase()] = definitions[definition.toLowerCase()];
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
