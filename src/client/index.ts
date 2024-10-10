import './styles.css';

import RoleCard from './RoleCard';
import SignUpForm from './SignUpForm';

const main = async () => {
  const userHash = window.localStorage.getItem('werewolf:user:october-2024');

  const role = await fetch('/.netlify/functions/role', {
    headers: {
      Authorization: `Bearer ${userHash}`,
    },
  }).then((d) => d.json());

  if (role.role === null) {
    window.localStorage.removeItem('werewolf:role:october-2024');
    const existingCard = document.querySelector('role-card');
    if (existingCard) {
      existingCard.remove();
    }
    return setTimeout(main, 10 * 1000);
  }

  const currentRole = window.localStorage.getItem('werewolf:role:october-2024');

  if (
    (!currentRole && role.role) || (role.role !== parseInt(currentRole, 10))
  ) {
    window.localStorage.setItem('werewolf:role:october-2024', role.role);
    const existingCard = document.querySelector('role-card');
    if (existingCard) {
      existingCard.remove();
    }
    const roleCard = document.createElement('role-card');
    roleCard.setAttribute('id', role.role);
    document.querySelector('#wrapper').appendChild(roleCard);
  }

  setTimeout(main, 10 * 1000);
};

(async () => {
  if (!window.customElements.get('role-card')) {
    customElements.define('role-card', RoleCard);
  }

  if (!window.customElements.get('sign-up-form')) {
    customElements.define('sign-up-form', SignUpForm);
  }

  const userHash = window.localStorage.getItem('werewolf:user:october-2024');

  if (!userHash) {
    setTimeout(() => {
      const signUpForm = document.createElement('sign-up-form');
      document.querySelector('#wrapper').appendChild(signUpForm);
    }, 5 * 1000);
  } else {
    // Render an empty div to prevent the animation from running
    const emptyDiv = document.createElement('div');
    document.querySelector('#wrapper').appendChild(emptyDiv);

    const currentRole = window.localStorage.getItem('werewolf:role:october-2024');
    if (currentRole) {
      const roleCard = document.createElement('role-card');
      roleCard.setAttribute('id', currentRole);
      document.querySelector('#wrapper').appendChild(roleCard);
    }

    main();
  }
})();
