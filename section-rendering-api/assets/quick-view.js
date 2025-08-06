class QuickView extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.content = this.querySelector(".quick-view__content");
    this.openButtons = document.querySelectorAll("[data-quick-view]");
    this.closeButton = this.querySelector("[data-close]");
    this.handleClick = this.handleClick.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);

    this.openButtons.forEach(button => {
      button.addEventListener("click", this.handleClick);
    });
    this.closeButton.addEventListener("click", this.closeDrawer);
  }

  disconnectedCallback() {
    this.openButtons.forEach(button => {
      button.removeEventListener("click", this.handleClick);
    });
    this.closeButton.removeEventListener("click", this.closeDrawer);
  }

  handleClick(event) {
    const button = event.currentTarget;
    const productHandle = button.dataset.productHandle;

    fetch(`${window.Shopify.routes.root}products/${productHandle}?section_id=product`)
      .then(response => response.text())
      .then(data => {
        this.content.innerHTML = data;

        this.openDrawer();
      });
  }

  openDrawer() {
    this.setAttribute("open", "");
  }

  closeDrawer() {
    this.removeAttribute("open");
  }
}

customElements.define("quick-view", QuickView);