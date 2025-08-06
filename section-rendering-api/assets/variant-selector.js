class VariantSelector extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.selectors = this.querySelectorAll("input[type='radio']");
    this.handleChange = this.handleChange.bind(this);

    this.selectors.forEach(selector => {
      selector.addEventListener("change", this.handleChange);
    });
  }

  disconnectedCallback() {
    this.selectors.forEach(selector => {
      selector.removeEventListener("change", this.handleChange);
    });
  }

  handleChange(event) {
    const url = `${window.location.pathname}?variant=${event.currentTarget.value}&section_id=product`;
    
    fetch(url)
      .then(response => response.text())
      .then(data => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data;
        document.querySelector(".product-content").innerHTML = tempDiv.querySelector(".product-content").innerHTML;

        const newUrl = new URL(url, window.location.origin);
        newUrl.searchParams.delete("section_id");
        window.history.pushState({}, "", newUrl.toString());
      });
  }
}

customElements.define("variant-selector", VariantSelector);