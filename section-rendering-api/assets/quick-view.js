class QuickView extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.content = this.querySelector(".quick-view__content");
    this.openButtons = document.querySelectorAll("[data-quick-view]");
    this.openButtons.forEach(button => {
      button.addEventListener("click", this.handleClick.bind(this));
    });

    this.closeButton = this.querySelector("[data-close]");
    this.closeButton.addEventListener("click", this.closeDrawer.bind(this));
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