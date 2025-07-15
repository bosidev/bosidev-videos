// You need to insert this script somewhere in the theme, for example in the theme.liquid file
// <script src="{{ 'custom-cart-drawer.js' | asset_url }}" defer></script>

class CustomCartDrawer extends HTMLElement {
  constructor() {
    super();

    this.openTrigger = document.querySelector(`#${this.dataset.openTrigger}`);
    this.overlay = this.querySelector("#CustomCartOverlay");
    this.closeButton = this.querySelector("[data-close]");
    this.cartCount = document.querySelector(".cart-item-count");
  }

  connectedCallback() {
    this.openTrigger?.addEventListener("click", this.handleOpen.bind(this));
    this.closeButton?.addEventListener("click", this.closeDrawer.bind(this));
    document.addEventListener("click", (event) => {
      if (event.target === this.overlay) {
        this.closeDrawer();
      }
    });

    // Once the cart:rerender event is set up, we can call it from everyhwere we want in the theme
    // just dont forget to append the correct data to the event so we can rerender the cart

    document.addEventListener("cart:rerender", this.cartRerender.bind(this));
  }

  handleOpen(event) {
    event.preventDefault();

    this.openDrawer();
  }

  openDrawer() {
    this.setAttribute("open", "");
  }

  closeDrawer() {
    this.removeAttribute("open");
  }

  cartRerender(event) {
    // We first create empty fake elements so we can store the HTML string of the new section later on
    // This helps with selecting the right elements to replace without reloading the page

    const fakeElement = document.createElement("div");
    const fakeCount = document.createElement("div");
    const newHTML = event.detail.sections["custom-cart-drawer"];
    const newCount = event.detail.sections["custom-cart-count"];

    fakeElement.innerHTML = newHTML;
    fakeCount.innerHTML = newCount;

    this.querySelector(".custom-cart-drawer__inner").innerHTML =
      fakeElement.querySelector(".custom-cart-drawer__inner").innerHTML;

    this.cartCount.innerHTML =
      fakeCount.querySelector(".cart-item-count").innerHTML;

    this.openDrawer();
  }
}

customElements.define("custom-cart-drawer", CustomCartDrawer);

class AtcButton extends HTMLElement {
  constructor() {
    super();

    this.submitForm = this.querySelector('form[action="/cart/add"]');
  }

  connectedCallback() {
    this.submitForm.addEventListener("submit", this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();

    const id = this.submitForm.querySelector('input[name="id"]');

    let formData = {
      items: [
        {
          id: this.submitForm.querySelector('input[name="id"]').value,
          quantity: this.submitForm.querySelector('input[name="quantity"]')
            .value,
        },
      ],
      sections: "custom-cart-drawer,custom-cart-count",
    };

    fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:rerender", {
            detail: data,
            bubbles: true,
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

customElements.define("atc-button", AtcButton);

class CartActions extends HTMLElement {
  constructor() {
    super();

    this.plusButton = this.querySelector("[data-plus]");
    this.minusButton = this.querySelector("[data-minus]");
    this.removeButton = this.querySelector("[data-remove]");

    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    this.plusButton.addEventListener("click", this.handleChange);
    this.minusButton.addEventListener("click", this.handleChange);
    this.removeButton.addEventListener("click", this.handleChange);
  }

  disconnectedCallback() {
    this.plusButton.removeEventListener("click", this.handleChange);
    this.minusButton.removeEventListener("click", this.handleChange);
    this.removeButton.removeEventListener("click", this.handleChange);
  }

  handleChange(event) {
    const formData = {
      line: this.dataset.line,
      quantity: event.target.dataset.quantity,
      sections: "custom-cart-drawer,custom-cart-count",
    };

    fetch(window.Shopify.routes.root + "cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:rerender", {
            detail: data,
            bubbles: true,
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

customElements.define("cart-actions", CartActions);

class DiscountInput extends HTMLElement {
  constructor() {
    super();

    this.submitForm = this.querySelector('#discount-form');
    this.removeButtons = this.querySelectorAll('.cart-discount__pill-remove');
  }

  connectedCallback() {
    this.submitForm.addEventListener('submit', this.handleSubmit.bind(this));

    this.removeButtons.forEach((button) => {
      button.addEventListener('click', this.handleRemove.bind(this))
    })
  }

  handleSubmit(event) {
    event.preventDefault();

    const formData = {
      discount: this.submitForm.querySelector('input[name="discount"]').value,
      sections: "custom-cart-drawer,custom-cart-count",
    };

    fetch(window.Shopify.routes.root + "cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:rerender", {
            detail: data,
            bubbles: true,
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleRemove() {
    // this removes all the discounts in the cart. Try to only remove the correct discount that is clicked!
    
    const formData = {
      discount: '',
      sections: "custom-cart-drawer,custom-cart-count",
    };

    fetch(window.Shopify.routes.root + "cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:rerender", {
            detail: data,
            bubbles: true,
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

customElements.define("discount-input", DiscountInput);
