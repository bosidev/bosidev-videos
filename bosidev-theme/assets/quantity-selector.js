// TODO: Check if history.replaceState fixed the inital quantity state

if (!customElements.get("quantity-selector")) {
  customElements.define(
    "quantity-selector",
    class QuantitySelector extends HTMLElement {
      constructor() {
        super();
        this.quantityInput = this.querySelector('[type="number"]');
        this.form = document.querySelector(`#${this.dataset.form}`);
        this.formInput = this.form.querySelector('[name="quantity"]');
        this.minusButton = this.querySelector("#quantity-minus");
        this.plusButton = this.querySelector("#quantity-plus");
        this.minValue = parseFloat(this.quantityInput.min);
        this.maxValue = parseFloat(this.quantityInput.max);

        this.handleVariantChange = this.handleVariantChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePlus = this.handlePlus.bind(this);
        this.handleMinus = this.handleMinus.bind(this);
        this.toggleButtonAvailability =
          this.toggleButtonAvailability.bind(this);
        this.checkValue = this.checkValue.bind(this);
      }

      connectedCallback() {
        requestAnimationFrame(this.checkValue);

        this.quantityInput.addEventListener("change", this.handleChange);
        this.minusButton.addEventListener("click", this.handleMinus);
        this.plusButton.addEventListener("click", this.handlePlus);
        document.addEventListener("variant:changed", this.handleVariantChange);
      }

      disconnectedCallback() {
        this.quantityInput.removeEventListener("change", this.handleChange);
        this.minusButton.removeEventListener("click", this.handleMinus);
        this.plusButton.removeEventListener("click", this.handlePlus);
        document.removeEventListener(
          "variant:changed",
          this.handleVariantChange
        );
      }

      handleChange() {
        // Enforce min and max limits on change
        if (this.quantityInput.value < this.minValue) {
          this.quantityInput.value = this.minValue;
        }
        if (this.quantityInput.value > this.maxValue) {
          this.quantityInput.value = this.maxValue;
        }

        this.formInput.value = this.quantityInput.value;
        this.formInput.setAttribute("value", this.quantityInput.value);
        this.toggleButtonAvailability();
      }

      toggleButtonAvailability() {
        this.minusButton.disabled = this.quantityInput.value <= this.minValue;
        this.plusButton.disabled = this.quantityInput.value >= this.maxValue;
      }

      handlePlus() {
        if (!(this.quantityInput.value < this.maxValue)) {
          return;
        }
        this.quantityInput.value++;
        this.formInput.value = this.quantityInput.value;
        this.triggerChangeEvent();
        this.toggleButtonAvailability();
      }

      handleMinus() {
        if (!(this.quantityInput.value > this.minValue)) {
          return;
        }
        this.quantityInput.value--;
        this.formInput.value = this.quantityInput.value;
        this.triggerChangeEvent();
        this.toggleButtonAvailability();
      }

      triggerChangeEvent() {
        this.quantityInput.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      }

      checkValue() {
        if (
          this.quantityInput.value &&
          this.quantityInput.value !== this.minValue.toString()
        ) {
          this.formInput.value = this.quantityInput.value;
          this.toggleButtonAvailability();
        } else {
          this.quantityInput.value = this.formInput.value || this.minValue;
          this.toggleButtonAvailability();
        }
        if (this.quantityInput.value !== this.minValue.toString()) {
          this.toggleButtonAvailability();
        } else {
          requestAnimationFrame(this.checkValue);
        }
      }

      handleVariantChange() {
        this.minValue = parseFloat(this.quantityInput.min);
        this.maxValue = parseFloat(this.quantityInput.max);
        this.handleChange();
      }
    }
  );
}
