import './styles.css';
import sortOn from 'sort-on';

const stateRow = (id: number) => `
    <div class="row">
        <input type="checkbox" class="status killed" title="Killed by Werewolf" id="killed-${id}" data-id="${id}" aria-label="Killed" />
        <input type="checkbox" class="status bitten" title="Bitten by Vampire" id="bitten-${id}" data-id="${id}" aria-label="Bitten" />
        <input type="checkbox" class="status cursed" title="Cursed" id="cursed-${id}" data-id="${id}" aria-label="Cursed" />
        <input type="checkbox" class="status recruited" title="Recruited by Cultist" id="recruited-${id}" data-id="${id}" aria-label="Recruited" />
        <input type="checkbox" class="status protected__vampire" title="Protected from Vampire" id="protected_vampire-${id}" data-id="${id}" aria-label="Protected" />
        <input type="checkbox" class="status protected__werewolf" title="Protected from Werewolf" id="protected_werewolf-${id}" data-id="${id}" aria-label="Protected" />
    </div>
`;

const listener = (token: string) => async (e: Event) => {
  const target = e.target as HTMLInputElement;

  const [action, id] = target.id.split('-');

  if ((action === 'cursed' && !target.checked) || (action === 'killed' && !target.checked)) {
    e.preventDefault();
    target.checked = true;
    return;
  }

  if (action === 'info') {
    if (target.checked) {
      window.localStorage.setItem(`info-${id}`, '@');
    } else {
      window.localStorage.removeItem(`info-${id}`);
    }
  }

  if (action === 'protected_vampire') {
    (document.querySelector(`#recruited-${id}`) as HTMLInputElement).disabled = target.checked;
    (document.querySelector(`#bitten-${id}`) as HTMLInputElement).disabled = target.checked;
  }

  if (action === 'protected_werewolf') {
    (document.querySelector(`#killed-${id}`) as HTMLInputElement).disabled = target.checked;
    (document.querySelector(`#recruited-${id}`) as HTMLInputElement).disabled = target.checked;
  }

  await fetch('/.netlify/functions/update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
      action,
      value: target.checked,
    }),
  });
};

const formatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
});

type Role = {
  role: {
    turnOrder: number;
    title: string;
    rules: string[];
  };
  name: string;
  id: number;
  killed: boolean;
  bitten: boolean;
  cursed: boolean;
  recruited: boolean;
  protected_vampire: boolean;
  protected_werewolf: boolean;
}

const main = async (token: string) => {
  const table = await fetch('/.netlify/functions/table', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((d) => d.json());

  const events = await fetch('/.netlify/functions/events', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((d) => d.json());

  document.querySelector('.log').innerHTML = `
    <div class="log-header-row">
      <h2>Event Log</h2>
      <button class="new-round" type="button" id="new-round">
        New Round 🌕
      </button>
    </div>
  `;

  document.querySelector('tbody').innerHTML = '';

  sortOn(table, ['-killed', 'role.turnOrder', 'role.title']).forEach((r: Role) => {
    const row = document.createElement('tr');
    const turnOrder = document.createElement('td');
    turnOrder.innerText = r.role?.turnOrder.toString() || '';
    row.appendChild(turnOrder);

    const name = document.createElement('td');
    name.innerText = r.name;
    row.appendChild(name);

    const role = document.createElement('td');
    role.innerHTML = `
        <span><strong>${r.role?.title}</strong></span>
        <input type="checkbox" aria-label="Role Info" class="info" id="info-${r.id}" />
        <ul>${r.role?.rules
          .map((rule) => `<li>${rule.replaceAll(/\[\[(.*?)]]/g, '$1')}</li>`)
          .join('')}</ul>
      `;
    row.appendChild(role);
    (row.querySelector('.info') as HTMLInputElement).checked = !!window.localStorage.getItem(
      `info-${r.id}`,
    );

    const state = document.createElement('td');
    state.innerHTML = stateRow(r.id);
    row.appendChild(state);
    (row.querySelector('.killed') as HTMLInputElement).checked = r.killed;
    (row.querySelector('.bitten') as HTMLInputElement).checked = r.bitten;
    (row.querySelector('.cursed') as HTMLInputElement).checked = r.cursed;
    (row.querySelector('.recruited') as HTMLInputElement).checked = r.recruited;
    (row.querySelector('.protected__vampire') as HTMLInputElement).checked = r.protected_vampire;
    (row.querySelector('.protected__werewolf') as HTMLInputElement).checked = r.protected_werewolf;

    if (r.protected_vampire) {
      (row.querySelector('.recruited') as HTMLInputElement).disabled = true;
      (row.querySelector('.bitten') as HTMLInputElement).disabled = true;
    }

    if (r.protected_werewolf) {
      (row.querySelector('.killed') as HTMLInputElement).disabled = true;
      (row.querySelector('.recruited') as HTMLInputElement).disabled = true;
    }

    if (r.role.title === 'Werewolf') {
      // Werewolves cannot be recruited
      (row.querySelector('.recruited') as HTMLInputElement).disabled = true;
      (row.querySelector('.bitten') as HTMLInputElement).disabled = true;
      (row.querySelector('.cursed') as HTMLInputElement).disabled = true;
    }

    document.querySelector('tbody').appendChild(row);
  });
  events.forEach((event) => {
    const div = document.createElement('div');
    div.classList.add('event');
    div.classList.add(event.type);
    div.innerHTML = `<span class="time">${formatter.format(new Date(event.created_at))}</span> ${
      event.content
    }`;
    document.querySelector('.log').appendChild(div);
  });
  setTimeout(() => main(token), 10 * 1000);
};

(() => {
  const query = new URLSearchParams(window.location.search);
  if (!query.has('token')) {
    window.location.replace('/');
  }

  window.addEventListener('change', listener(query.get('token')));
  window.addEventListener('click', async (e) => {
    if ((e.target as HTMLElement).id === 'new-round') {
      await fetch('/.netlify/functions/new-round', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${query.get('token')}`,
        },
      });
    }
  });
  main(query.get('token'));
})();
