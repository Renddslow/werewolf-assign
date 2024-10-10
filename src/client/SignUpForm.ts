import css from '../css';

const styles = css`
  :host {
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
      sans-serif;
  }

  @keyframes appear {
    from {
      opacity: 0;
      top: 60%;
    }

    to {
      opacity: 1;
      top: 50%;
    }
  }

  .sign-up-form {
    display: grid;
    grid-gap: 24px;
    padding: 24px;
    grid-template-columns: minmax(0, 1fr);
    border-radius: 2px;
    border: 1px solid #2f2f2f;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 360px;
    animation: appear 0.5s ease-in-out;
  }

  form {
    display: grid;
    grid-gap: 24px;
    grid-template-columns: minmax(0, 1fr);
  }

  .form-control {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
  }

  .form-control label {
    color: #e7e7e7;
    font-weight: 600;
    font-family: var(--font-family);
    font-size: 14px;
  }

  .form-control input {
    background: #e7e7e7;
    border: 1px solid #e7e7e7;
    color: #2f2f2f;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    appearance: none;
    font-family: var(--font-family);
  }

  button {
    background: #2f2f2f;
    color: #e7e7e7;
    font-family: var(--font-family);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    appearance: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  h2 {
    color: #bf0005;
    font-weight: 800;
    font-size: 24px;
    font-family: var(--font-family);
  }

  @keyframes load {
    0% {
      background-position-x: 75%;
    }

    100% {
      background-position-x: 0;
    }
  }

  button:disabled {
    animation: load 6s ease-in-out forwards;
    background: linear-gradient(90deg, #bf0005 50%, #2f2f2f 60%);
    background-size: 400% 100%;
    color: #000;
    font-style: italic;
  }
`;

class SignUpForm extends HTMLElement {
  #shadow: ShadowRoot;

  constructor() {
    super();
    this.render.bind(this);
    this.#shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.#shadow.innerHTML = `
      <style>${styles}</style>
      <div class="sign-up-form">
        <h2>Get Your Role Card</h2>
        <form id="sign-up">
            <div class="form-control">
                <label for="full-name">Full Name</label>
                <input type="text" id="full-name" name="full-name" autocomplete="name" />
            </div>
            <div class="form-control">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" />
            </div>
            <button type="submit">Sign Up</button>
        </form>
      </div>
    `;

    this.#shadow.getElementById('sign-up').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = this.#shadow.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Loading...';

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const name = formData.get('full-name');
      const email = formData.get('email');

      const res = await fetch('/.netlify/functions/user', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
      }).then((d) => d.json());
      if (res && res.token) {
        window.localStorage.setItem('werewolf:user:october-2024', res.token);
        window.location.reload();
      }
    });
  }
}

export default SignUpForm;
