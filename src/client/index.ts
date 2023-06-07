import './styles.css';

import RoleCard from './RoleCard';

(() => {
  if (!window.customElements.get('role-card')) {
    customElements.define('role-card', RoleCard);
  }
})();
