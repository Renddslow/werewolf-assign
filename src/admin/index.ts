import './styles.css';

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

const listener = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const stringVal = target.checked ? 'true' : 'false';

  const [action, id] = target.id.split('-');

  if (action === 'protected_vampire') {
    (document.querySelector(`#recruited-${id}`) as HTMLInputElement).disabled = target.checked;
    (document.querySelector(`#bitten-${id}`) as HTMLInputElement).disabled = target.checked;
  }

  if (action === 'protected_werewolf') {
    (document.querySelector(`#killed-${id}`) as HTMLInputElement).disabled = target.checked;
    (document.querySelector(`#recruited-${id}`) as HTMLInputElement).disabled = target.checked;
  }
};

const main = async (token: string) => {
  const table = await fetch('/.netlify/functions/table', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((d) => d.json());

  document.querySelector('tbody').innerHTML = '';
  window.removeEventListener('change', listener);

  table
    .sort((a, b) => a.role?.turnOrder - b.role?.turnOrder)
    .forEach((r) => {
      const row = document.createElement('tr');
      const turnOrder = document.createElement('td');
      turnOrder.innerText = r.role?.turnOrder || '';
      row.appendChild(turnOrder);

      const name = document.createElement('td');
      name.innerText = r.name;
      row.appendChild(name);

      const role = document.createElement('td');
      role.innerHTML = `
        <span><strong>${r.role?.title}</strong></span>
        <input type="checkbox" aria-label="Role Info" class="info" />
        <ul>${r.role?.rules
          .map((rule) => `<li>${rule.replaceAll(/\[\[(.*?)]]/g, '$1')}</li>`)
          .join('')}</ul>
      `;
      row.appendChild(role);

      const state = document.createElement('td');
      state.innerHTML = stateRow(r.id);
      row.appendChild(state);
      (row.querySelector('.killed') as HTMLInputElement).checked = r.killed;
      (row.querySelector('.bitten') as HTMLInputElement).checked = r.bitten;
      (row.querySelector('.cursed') as HTMLInputElement).checked = r.cursed;
      (row.querySelector('.recruited') as HTMLInputElement).checked = r.recruited;
      (row.querySelector('.protected__vampire') as HTMLInputElement).checked = r.protected_vampire;
      (row.querySelector('.protected__werewolf') as HTMLInputElement).checked =
        r.protected_werewolf;

      if (r.protected_vampire) {
        (row.querySelector('.recruited') as HTMLInputElement).disabled = true;
        (row.querySelector('.bitten') as HTMLInputElement).disabled = true;
      }

      if (r.protected_werewolf) {
        (row.querySelector('.killed') as HTMLInputElement).disabled = true;
        (row.querySelector('.recruited') as HTMLInputElement).disabled = true;
      }

      document.querySelector('tbody').appendChild(row);
    });
  window.addEventListener('change', listener);
  setTimeout(() => main(token), 10 * 1000);
};

(() => {
  const query = new URLSearchParams(window.location.search);
  if (!query.has('token')) {
    window.location.replace('/');
  }

  main(query.get('token'));
})();
