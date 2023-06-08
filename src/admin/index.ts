import './styles.css';

const stateRow = (id: number) => `
    <div class="row">
        <input type="checkbox" class="status killed" title="Killed by Werewolf" id="killed-${id}" data-id="${id}" aria-label="Killed" />
        <input type="checkbox" class="status bitten" title="Bitten by Vampire" id="killed-${id}" data-id="${id}" aria-label="Bitten" />
        <input type="checkbox" class="status cursed" title="Cursed" id="killed-${id}" data-id="${id}" aria-label="Cursed" />
        <input type="checkbox" class="status recruited" title="Recruited by Cultist" id="killed-${id}" data-id="${id}" aria-label="Recruited" />
        <input type="checkbox" class="status protected__vampire" title="Protected from Vampire" id="protected-vampire-${id}" data-id="${id}" aria-label="Protected" />
        <input type="checkbox" class="status protected__werewolf" title="Protected from Werewolf" id="protected-werewolf-${id}" data-id="${id}" aria-label="Protected" />
    </div>
`;

const main = async (token: string) => {
  const table = await fetch('/.netlify/functions/table', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((d) => d.json());

  document.querySelector('tbody').innerHTML = '';

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

      document.querySelector('tbody').appendChild(row);
    });
  setTimeout(() => main(token), 10 * 1000);
};

(() => {
  const query = new URLSearchParams(window.location.search);
  if (!query.has('token')) {
    window.location.replace('/');
  }

  main(query.get('token'));
})();
