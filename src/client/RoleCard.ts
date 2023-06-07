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

const styles = css`
  .card {
    display: grid;
    grid-template-columns: minmax(0, 360px) minmax(0, 300px);
    grid-gap: 32px;
    width: max-content;
  }

  .image {
    aspect-ratio: 125 / 174;
    width: 100%;
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
            <h2 class="title"></h2>
            <p class="description"></p>
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
    const image = this.shadow.querySelector('.image') as HTMLImageElement;
    image.src = data.imageSrc;
    image.alt = `Role card for ${data.title}`;
  }
}

export default RoleCard;
