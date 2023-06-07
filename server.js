import polka from 'polka';
import bodyParser from 'body-parser';
import cors from 'cors';
import sirv from 'sirv';

const peopleCard = new Map();
const people = new Set();

const assignmentOrder = [
  ['20_werewolf.png', 1],
  ['19_vampire.png', 3],
  ['18_cultist.png', 1],
  ['03_priest.png', 2],
  ['09_mason.png', 3],
  ['10_investigator.png', 2],
  ['12_towncrier.png', 1],
  ['04_silversmith.png', 1],
  ['07_empath.png', 1],
  ['06_undertaker.png', 2],
  ['17_census_worker.png', 1],
  ['02_apprenctice_seer.png', 1],
  ['05_hunter.png', 1],
  ['14_village_idiot.png', 1],
  ['15_conspiracy_theorist.png', 1],
  ['21_butcher.png', null],
  ['22_baker.png', null],
  ['23_candlestick_maker.png', null],
];

const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const staticServer = sirv('./');

polka()
  .use(bodyParser.json(), cors(), staticServer)
  .post('/api/card', (req, res) => {
    const { email } = req.body;
    if (people.has(email)) {
      res.statusCode = 400;
      return res.end('Already registered');
    }
    people.add(email);
    res.end('OK');
  })
  .post('/api/assign', (req, res) => {
    const assignmentList = [...assignmentOrder];
    const allPeople = shuffle(Array.from(people));

    if (peopleCard.size > 0) {
      res.end();
    }

    allPeople.forEach((person, idx) => {
      console.log(idx % assignmentList.length);
      console.log(assignmentList);
      const [card, count] = assignmentList[idx % assignmentList.length];
      peopleCard.set(person, card);
      if (count) {
        assignmentList[idx][1] = count - 1;
        if (count === 1) {
          assignmentList.splice(idx, 1);
        }
      }
    });
    res.end('OK');
  })
  .get('/api/card', (req, res) => {
    const { email } = req.query;
    if (!people.has(email)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Not registered' }));
    }
    const data = peopleCard.get(email);
    res.end(JSON.stringify({ card: data }));
  })
  .get('/api/assignments', (req, res) => {
    const cards = [];
    people.forEach((person) => {
      cards.push({
        card: peopleCard.get(person),
        person,
      });
    });
    res.end(
      `Cards\t\t\tPeople (${people.size})\n${cards
        .map((c) => `${c.card}\t\t\t${c.person}`)
        .join('\n')}`,
    );
  })
  .listen(5675, () => console.log(`🐺 Running Werewolf on http://localhost:5675`));
