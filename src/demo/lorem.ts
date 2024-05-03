class LoremIpsum extends HTMLElement {
  attrValue: (n: string) => string;

  constructor() {
    super();

    this.attrValue = (n) =>
      this.getAttribute(n) ||
      getComputedStyle(this)
        .getPropertyValue("--lorem-ipsum-" + n)
        .trim();
  }

  connectedCallback(paras: string[] = [], paragraph: string) {
    const html = this.getParas(+this.attrValue("paras") || 3);
    this.innerHTML += html;

    if (this.hasAttribute("shadow")) {
      this.attachShadow({ mode: "open" }).innerHTML = html;
      this.shadowRoot?.append(...this.querySelectorAll("style"));
    } else if (this.hasAttribute("replace")) {
      this.insertAdjacentHTML("afterend", html);
      this.remove();
    } else {
      this.innerHTML = html;
    }
  }

  getParas(parCount: number, paras: string[] = []): string {
    for (let i = 0; i < parCount; i++) {
      const paragraph = this.getPara();
      paras.push(
        //capitalizing the first letter of the paragraph
        `<p>${paragraph.charAt(0).toUpperCase() + paragraph.slice(1)}. </p>`
      );
    }

    return paras.join("\n");
  }

  getPara(): string {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
      .split(". ") // splitting the text into sentences
      .sort(() => 0.5 - Math.random()) // shuffling the sentences
      .slice(0, this.getSentences()) // taking a random number of sentences
      .join(". ");
  }

  getSentences(): number {
    const min = +this.attrValue("min") || 7;
    const max = +this.attrValue("max") || 2;
    return Math.floor(Math.random() * min) + max;
  }
}

// <lorem-ipsum paras="3" max="2" min="7" style="--lorem-ipsum-paras: 3; --lorem-ipsum-max: 2; --lorem-ipsum-min: 7;"></lorem-ipsum>
customElements.define("lorem-ipsum", LoremIpsum);
