import './styles.css';

import RoleCard from './RoleCard';

(() => {
  if (!window.customElements.get('role-card')) {
    customElements.define('role-card', RoleCard);
  }

  const userHash = window.localStorage.getItem('werewolf:user');
  if (!userHash) {
    // Render login page
  } else {
    // Render admin page
  }
})();
