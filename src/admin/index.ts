import './styles.css';

(() => {
  const query = new URLSearchParams(window.location.search);
  if (!query.has('token')) {
    window.location.replace('/');
  }
})();
