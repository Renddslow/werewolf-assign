type CardData = {
  title: string;
  description: string;
  category: 'information' | 'attack' | 'defend' | 'special' | 'recruit' | 'townsfolk';
  alignment: 'villain' | 'cult' | 'town';
  informationGiven: 'game_start' | 'dependent' | 'nightly' | 'never';
  imageSrc: string;
  rules: string[];
  tips: string[];
};

const css = (...a) => a.join('');

const matchBold = /\*\*(.*?)\*\*/g;
const parseMarkdown = (text: string) => {
  if (!text) return '';
  return text.replace(matchBold, '<strong>$1</strong>');
};

const styles = css`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  .card {
    display: grid;
    grid-template-columns: minmax(0, 360px) minmax(0, 300px);
    width: max-content;
    border: 1px solid #1d1d1d;
    margin: 0 auto;
  }

  .image {
    aspect-ratio: 125 / 174;
    width: 100%;
    padding: 12px 24px;
    object-fit: contain;
  }

  #card-content {
    padding: 12px 24px;
    border-left: 1px solid #1d1d1d;
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
  .tips {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-gap: 12px;
  }

  .rules {
    margin: 12px -24px;
    padding: 12px 24px;
    border-top: 1px solid #1d1d1d;
  }

  strong {
    color: #bd0a0a;
    text-decoration: dotted underline;
    cursor: help;
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
        <img src="" class="image" alt="Werewolf role card" aria-labelledby="card-content" />
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
    const image = this.shadow.querySelector('.image') as HTMLImageElement;
    image.src = data.imageSrc;
    image.alt = `Role card for ${data.title}`;
    const rulesList = this.shadow.querySelector('.rules-list') as HTMLUListElement;
    data.rules.forEach((rule) => {
      const li = document.createElement('li');
      li.innerHTML = parseMarkdown(rule);
      rulesList.appendChild(li);
    });
  }
}

export default RoleCard;
