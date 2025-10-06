class VariantSelector extends HTMLElement {
  constructor() {
    super();
  }

  get sectionId() {
    return this.getAttribute("data-section-id");
  }

  connectedCallback() {
    this.selectors = this.querySelectorAll("input[type='radio']");
    this.handleChange = this.handleChange.bind(this);

    this.selectors.forEach((selector) => {
      selector.addEventListener("change", this.handleChange);
    });
  }

  disconnectedCallback() {
    this.selectors.forEach((selector) => {
      selector.removeEventListener("change", this.handleChange);
    });
  }

  handleChange(event) {
    const url = `${window.location.pathname}?variant=${event.currentTarget.value}&section_id=${this.sectionId}`;

    fetch(url)
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const currentQuantity = document.querySelector(
          "quantity-selector__value"
        )
          ? document.querySelector("quantity-selector__value").textContent
          : null;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data;

        document.querySelector(".product-content").innerHTML =
          tempDiv.querySelector(".product-content").innerHTML;
        document.querySelector(".product-images").innerHTML =
          tempDiv.querySelector(".product-images").innerHTML;

        if (currentQuantity) {
          document.querySelector("quantity-selector__value").textContent =
            currentQuantity;
          document.querySelector(
            'form[action="/cart/add"] input[name="quantity"]'
          ).value = currentQuantity;
        }

        const newUrl = new URL(url, window.location.origin);
        newUrl.searchParams.delete("section_id");
        window.history.pushState({}, "", newUrl.toString());
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching variant:", error);
        }
      });
  }
}

customElements.define("variant-selector", VariantSelector);
