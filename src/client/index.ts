import './styles.css';

import RoleCard from './RoleCard';
import SignUpForm from './SignUpForm';

(() => {
  if (!window.customElements.get('role-card')) {
    customElements.define('role-card', RoleCard);
  }

  if (!window.customElements.get('sign-up-form')) {
    customElements.define('sign-up-form', SignUpForm);
  }

  const userHash = window.localStorage.getItem('werewolf:user');
  if (!userHash) {
    // setTimeout(() => {
    //   const signUpForm = document.createElement('sign-up-form');
    //   document.querySelector('#wrapper').appendChild(signUpForm);
    // }, 5 * 1000);
  } else {
    // Render admin page
  }
})();
