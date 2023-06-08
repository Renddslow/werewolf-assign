import css from '../css';

type CardData = {
  title: string;
  description: string;
  definitions: Record<string, string>;
  category: 'information' | 'attack' | 'defend' | 'special' | 'recruit' | 'townsfolk';
  alignment: 'villain' | 'cult' | 'town';
  informationGiven: 'game_start' | 'dependent' | 'nightly' | 'never';
  imageSrc: string;
  rules: string[];
  tips: string[];
};

const matchBold = /\*\*(.*?)\*\*/g;
const matchDfn = /\[\[(.*?)]]/g;
const parseMarkdown = (text: string, definitions: Record<string, string>) => {
  if (!text) return '';
  return text
    .replace(matchBold, '<strong>$1</strong>')
    .replace(
      matchDfn,
      (_, term) => `<dfn data-def="${definitions[term.toLowerCase()]}">${term}</dfn>`,
    );
};

const styles = css`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  :host {
    --color-border: #2f2f2f;
  }

  .card {
    display: grid;
    grid-template-columns: minmax(0, 360px) minmax(0, 300px);
    width: max-content;
    border: 1px solid var(--color-border);
    margin: 75px auto 0;
  }

  .image {
    width: 100%;
    padding: 24px;
    overflow: hidden;
    position: relative;
  }

  .image img {
    width: 100%;
    display: block;
    object-fit: cover;
  }

  #card-content {
    padding: 12px 24px;
    border-left: 1px solid var(--color-border);
  }

  h2 {
    color: #e7e7e7;
    font-weight: 800;
    font-size: 48px;
    margin-top: 14px;
  }

  h3 {
    color: #e3e3e3;
    font-weight: 600;
    font-size: 24px;
  }

  p,
  li {
    color: #d7d7d7;
  }

  .tag {
    background: #d7d7d7;
    color: #000;
    border-radius: 2px;
    text-transform: capitalize;
    padding: 4px 6px;
    font-size: 12px;
    font-weight: 600;
    width: fit-content;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .information,
  .rules,
  .rules-list,
  .tips,
  .tips-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-gap: 12px;
  }

  .rules {
    margin: 12px -24px;
    padding: 12px 24px;
    border-top: 1px solid var(--color-border);
  }

  dfn {
    color: #bd0a0a;
    font-weight: 600;
    font-style: normal;
    text-decoration: dotted underline;
    cursor: help;
    position: relative;
  }

  dfn::before {
    content: attr(data-def);
    display: none;
    position: absolute;
    opacity: 0;
    background: #000;
    color: #fff;
    border: 1px solid var(--color-border);
    border-radius: 2px;
    font-weight: 500;
    padding: 12px;
    width: 200px;
    left: 0;
    top: 100%;
    transform: translateX(-50%);
    z-index: 100;
  }

  dfn:hover::before {
    opacity: 1;
    display: block;
  }

  .row {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 8px;
    justify-content: start;
  }

  .tag.town {
    background: #68a1c2;
  }

  .tag.cult {
    background: #7b4af6;
  }

  .tag.villain {
    background: #bd0a0a;
  }

  .tips {
    grid-column: 1 / 3;
    border-top: 1px solid var(--color-border);
    padding: 24px;
  }

  ol {
    padding-left: 12px;
  }

  @media screen and (max-width: 768px) {
    .card {
      display: block;
      max-width: 360px;
    }
  }
`;

class RoleCard extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.render = this.render.bind(this);
    this.shadow.innerHTML = `
      <style>
          ${styles}
      </style>
      <div class="card">
        <div class="image">
          <img src="" alt="Werewolf role card" aria-labelledby="card-content" />
        </div>
        <div id="card-content">
            <div class="information">
              <h2 class="title"></h2>
              <div class="row">
                <span class="tag category"></span>
                <span class="tag alignment"></span>
              </div>
              <p class="description"></p>
            </div>
            <div class="rules">
                <h3>Rules</h3>
                <ul class="rules-list"></ul>
            </div>
        </div>
        <div class="tips">
            <h3>Tips</h3>
            <ol class="tips-list"></ol>
        </div>
      </div>
    `;
  }

  async connectedCallback() {
    if (this.hasAttribute('id')) {
      await this.getData().then(this.render);
    }
  }

  async attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      await this.getData().then(this.render);
    }
  }

  async getData(): Promise<CardData> {
    const response = await fetch(`/.netlify/functions/card?role=${this.getAttribute('id')}`);
    return await response.json();
  }

  render(data: CardData) {
    console.log(data);
    this.shadow.querySelector('.title').textContent = data.title;
    this.shadow.querySelector('.description').textContent = data.description;
    this.shadow.querySelector('.category').textContent = data.category;
    this.shadow.querySelector('.alignment').textContent = `Team: ${data.alignment}`;
    this.shadow.querySelector('.alignment').classList.add(data.alignment);
    const image = this.shadow.querySelector('.image img') as HTMLImageElement;
    image.src = data.imageSrc;
    image.alt = `Role card for ${data.title}`;
    const rulesList = this.shadow.querySelector('.rules-list') as HTMLUListElement;
    data.rules.forEach((rule) => {
      const li = document.createElement('li');
      li.innerHTML = parseMarkdown(rule, data.definitions);
      rulesList.appendChild(li);
    });
    const tipsList = this.shadow.querySelector('.tips-list') as HTMLUListElement;
    data.tips.forEach((tip) => {
      const li = document.createElement('li');
      li.innerHTML = parseMarkdown(tip, data.definitions);
      tipsList.appendChild(li);
    });
  }
}

export default RoleCard;
