import { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  console.log(event);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Seer',
      description:
        'Each night, choose a player and learn if they are a Townsfolk, a Vampire, or a Werewolf.',
      category: 'information',
      alignment: 'town',
      informationGiven: 'nightly',
      imageSrc: '/cards/01_seer.png',
      rules: [],
      tips: [],
    }),
  };
};

export { handler };
