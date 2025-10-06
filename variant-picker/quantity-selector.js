// This is not part of the video but I added it to the project to make the quantity selector work with the variant picker.
// Be ware though that this is not a production ready solution and may not work for all cases.

class QuantitySelector extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.productForm = document.querySelector("form[action='/cart/add']");
    this.quantityInput = this.productForm.querySelector(
      "input[name='quantity']"
    );

    this.quantityDisplay = this.querySelector("[data-quantity-display]");

    this.minusButton = this.querySelector("[data-quantity-minus]");
    this.plusButton = this.querySelector("[data-quantity-plus]");

    this.handleMinusClick = this.handleMinusClick.bind(this);
    this.handlePlusClick = this.handlePlusClick.bind(this);

    this.minusButton.addEventListener("click", this.handleMinusClick);
    this.plusButton.addEventListener("click", this.handlePlusClick);
  }

  disconnectedCallback() {
    this.minusButton.removeEventListener("click", this.handleMinusClick);
    this.plusButton.removeEventListener("click", this.handlePlusClick);
  }

  handleMinusClick() {
    if (parseInt(this.quantityDisplay.textContent) === 1) {
      return;
    }
    this.quantityDisplay.textContent =
      parseInt(this.quantityDisplay.textContent) - 1;
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
  }

  handlePlusClick() {
    if (
      parseInt(this.quantityDisplay.textContent) === parseInt(this.maxQuantity)
    ) {
      return;
    }
    this.quantityDisplay.textContent =
      parseInt(this.quantityDisplay.textContent) + 1;
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
  }
}

customElements.define("quantity-selector", QuantitySelector);
