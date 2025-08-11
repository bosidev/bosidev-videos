// UTILITY

/**
 * Function to dynamically format money based on the `moneyFormat` string.
 * @param {number} amount - The amount in cents.
 * @returns {string} - The formatted currency string.
 */
function formatMoney(amount) {
  const { currency, requestLocale, moneyFormat } = window.themeVariables || {};
  const locale = requestLocale || "en-US";

  // Convert the amount from cents to dollars/euros, etc.
  let formattedAmount = (amount / 100).toFixed(2);

  // Utility function to add thousands separators
  function addThousandsSeparator(numberStr, separator = ".") {
    // This regex adds the specified separator at every thousand position
    return numberStr.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  // Determine the format type from the moneyFormat string
  if (moneyFormat.includes("{{amount_no_decimals}}")) {
    formattedAmount = Math.round(amount / 100).toString();
  } else if (moneyFormat.includes("{{amount_with_comma_separator}}")) {
    // Comma as a decimal separator, dot as a thousands separator
    formattedAmount = addThousandsSeparator(
      formattedAmount.replace(".", ","),
      "."
    );
  } else if (
    moneyFormat.includes("{{amount_no_decimals_with_comma_separator}}")
  ) {
    formattedAmount = addThousandsSeparator(
      Math.round(amount / 100).toString(),
      "."
    );
  } else if (moneyFormat.includes("{{amount_with_apostrophe_separator}}")) {
    formattedAmount = addThousandsSeparator(formattedAmount, "'");
  } else if (moneyFormat.includes("{{amount_with_space_separator}}")) {
    // Space as thousands separator, comma as decimal separator
    formattedAmount = addThousandsSeparator(
      formattedAmount.replace(".", ","),
      " "
    );
  } else if (
    moneyFormat.includes("{{amount_no_decimals_with_space_separator}}")
  ) {
    formattedAmount = addThousandsSeparator(
      Math.round(amount / 100).toString(),
      " "
    );
  } else if (
    moneyFormat.includes("{{amount_with_period_and_space_separator}}")
  ) {
    // Period for decimals, space for thousands
    formattedAmount = addThousandsSeparator(formattedAmount, " ");
  }

  // Add the currency symbol and any suffix if present in the moneyFormat
  const formattedCurrency = moneyFormat
    .replace(`{{amount}}`, formattedAmount)
    .replace(`{{amount_no_decimals}}`, formattedAmount)
    .replace(`{{amount_with_comma_separator}}`, formattedAmount)
    .replace(`{{amount_no_decimals_with_comma_separator}}`, formattedAmount)
    .replace(`{{amount_with_apostrophe_separator}}`, formattedAmount)
    .replace(`{{amount_with_space_separator}}`, formattedAmount)
    .replace(`{{amount_no_decimals_with_space_separator}}`, formattedAmount)
    .replace(`{{amount_with_period_and_space_separator}}`, formattedAmount);

  return formattedCurrency.trim();
}

// CUSTOM ELEMENTS

class DrawerElement extends HTMLElement {
  constructor() {
    super();
    this.drawerId = this.dataset.drawerId;
    this.drawerContent = this.querySelector(".drawer");
    this.openElement = document.querySelector(`[data-open='${this.drawerId}']`);
    this.closeElement = this.querySelector(`[data-close='${this.drawerId}']`);
    this.overlay = document.querySelector("#overlay");
    this.openOverlay = this.hasAttribute("data-open-overlay");

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  connectedCallback() {
    this.openElement.addEventListener("click", this.open);
    this.closeElement.addEventListener("click", this.close);
    document.addEventListener("click", this.handleDocumentClick);
  }

  disconnectedCallback() {
    this.openElement.removeEventListener("click", this.open);
    this.closeElement.removeEventListener("click", this.close);
    document.removeEventListener("click", this.handleDocumentClick);
  }

  open() {
    const isOpen = this.drawerContent.hasAttribute("open");
    this.toggleDrawer(!isOpen);
  }

  close() {
    this.toggleDrawer(false);
  }

  toggleDrawer(isOpen) {
    if (isOpen) {
      this.drawerContent.setAttribute("open", "");
      if (this.openOverlay) {
        this.overlay.setAttribute("open", "");
      }
      document.documentElement.classList.add("lock-scroll");
    } else {
      this.drawerContent.removeAttribute("open");
      if (this.openOverlay) {
        this.overlay.removeAttribute("open");
      }
      document.documentElement.classList.remove("lock-scroll");
    }
  }

  handleDocumentClick(event) {
    if (
      this.openElement.contains(event.target) ||
      this.drawerContent.contains(event.target)
    ) {
      return;
    }
    if (this.drawerContent.hasAttribute("open")) {
      this.close();
    }
  }
}

customElements.define("drawer-element", DrawerElement);

class CartDrawer extends DrawerElement {
  constructor() {
    super();
    this.rerenderContent = this.rerenderContent.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("cart:rerender", this.rerenderContent);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("cart:rerender", this.rerenderContent);
  }

  rerenderContent(event) {
    fetch(window.location.pathname + "?sections=cart-drawer")
      .then((res) => res.json())
      .then((res) => {
        const placeholderElement = document.createElement("div");
        placeholderElement.innerHTML = res["cart-drawer"];
        this.querySelector(".drawer").innerHTML =
          placeholderElement.querySelector(".drawer").innerHTML;

        if (event.detail.openCart) {
          this.open();
        }
      });
  }
}

customElements.define("cart-drawer", CartDrawer);

class SlidingDetails extends HTMLDetailsElement {
  constructor() {
    super();
    this.detailsId = this.dataset.triggerId;
    this.summaryElement = this.querySelector("summary");
    this.closeTrigger = this.querySelector(
      `[data-close-id='${this.detailsId}']`
    );

    this.handleSummaryClick = this.handleSummaryClick.bind(this);
    this.openDetails = this.openDetails.bind(this);
    this.closeDetails = this.closeDetails.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  connectedCallback() {
    document.addEventListener("click", this.handleDocumentClick);
    this.summaryElement.addEventListener("click", this.handleSummaryClick);
    this.closeTrigger.addEventListener("click", this.closeDetails);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleDocumentClick);
    this.summaryElement.removeEventListener("click", this.handleSummaryClick);
    this.closeTrigger.removeEventListener("click", this.closeDetails);
  }

  handleSummaryClick(event) {
    event.preventDefault();

    if (this.hasAttribute("open")) {
      this.closeDetails(event);
    } else {
      this.openDetails();
    }
  }

  openDetails() {
    this.setAttribute("open", "");
    setTimeout(() => {
      this.classList.add("details-open");
    }, 50);
  }

  closeDetails(event) {
    event.preventDefault();
    this.classList.remove("details-open");

    setTimeout(() => {
      this.removeAttribute("open");
    }, 300);
  }

  handleDocumentClick(event) {
    // if (this.contains(event.target) && this.hasAttribute("open")) {
    //   this.closeDetails(event);
    // }
  }
}

customElements.define("sliding-details", SlidingDetails, {
  extends: "details",
});

class HoverableDetails extends HTMLDetailsElement {
  constructor() {
    super();
    this.openTrigger = this.querySelector("[data-open-trigger]");
    this.openElement = this.querySelector("[data-open-element]");
  }

  connectedCallback() {
    this.addEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  // Utility method to handle adding/removing event listeners
  manageEventListeners(action) {
    const events = [
      {
        element: this.openTrigger,
        type: "mouseenter",
        handler: this.onTriggerMouseEnter.bind(this),
      },
      {
        element: this.openTrigger,
        type: "mouseleave",
        handler: this.onTriggerMouseLeave.bind(this),
      },
      {
        element: this.openElement,
        type: "mouseenter",
        handler: this.onElementMouseEnter.bind(this),
      },
      {
        element: this.openElement,
        type: "mouseleave",
        handler: this.onElementMouseLeave.bind(this),
      },
    ];

    events.forEach(({ element, type, handler }) => {
      element[`${action}EventListener`](type, handler);
    });
  }

  addEventListeners() {
    this.manageEventListeners("add");
  }

  removeEventListeners() {
    this.manageEventListeners("remove");
  }

  // Event Handlers
  onTriggerMouseEnter() {
    this.showElement();
  }

  onTriggerMouseLeave() {
    this.delayedHideElement();
  }

  onElementMouseEnter() {
    this.showElement();
  }

  onElementMouseLeave() {
    this.delayedHideElement();
  }

  showElement() {
    this.open = true;
  }

  hideElement() {
    this.open = false;
  }

  delayedHideElement() {
    setTimeout(() => {
      if (
        !this.openTrigger.matches(":hover") &&
        !this.openElement.matches(":hover")
      ) {
        this.hideElement();
      }
    }, 100);
  }
}

customElements.define("hoverable-details", HoverableDetails, {
  extends: "details",
});

class OpenableElement extends HTMLElement {
  constructor() {
    super();
    this.openTrigger = this.querySelector("[data-open]");
    this.content = this.querySelector("[data-content]");
    this.action = this.dataset.action;
  }

  connectedCallback() {
    this.openTrigger.addEventListener("click", this.toggleState.bind(this));
    if (this.action === "hover") {
      document.addEventListener("click", this.handleDocumentClick.bind(this));
    }
    this.setContentHeight();
  }

  disconnectedCallback() {
    this.openTrigger.removeEventListener("click", this.toggleState);
    if (this.action === "hover") {
      document.removeEventListener("click", this.handleDocumentClick);
    }
  }

  handleDocumentClick(event) {
    if (!this.contains(event.target)) {
      this.close();
    }
  }

  setContentHeight() {

  }

  toggleState() {
    this.hasAttribute("open") ? this.close() : this.open();
  }

  open() {
    this.setAttribute("open", "");
    this.setAttribute("aria-expanded", "true");
  }

  close() {
    this.removeAttribute("open");
    this.setAttribute("aria-expanded", "false");
  }
}

customElements.define("openable-element", OpenableElement);

class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.inputElement = this.querySelector(
      'input[name="language_code"], input[name="country_code"]'
    );
    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", this.onItemClick.bind(this))
    );
  }

  onItemClick(event) {
    event.preventDefault();
    const form = this.querySelector("form");
    this.inputElement.value = event.currentTarget.dataset.value;
    if (form) form.submit();
  }
}
customElements.define("localization-form", LocalizationForm);

class PredictiveSearch extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector("#predictive-search");
    this.wrapper = document.querySelector(".predictive-search");
    this.openElement = document.querySelector("#predictive-search__details");
    this.recommendations = this.querySelector(
      ".predictive-search__recommendations"
    );
    this.ressourceList = this.querySelector(
      ".predictive-search__resource-list"
    );
    this.originalRessources = this.ressourceList.innerHTML;

    this.input.addEventListener(
      "input",
      this.debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );
  }

  connectedCallback() {
    this.openElement.addEventListener("click", (e) => {
      setTimeout(() => {
        this.input.focus();
      }, 100);
    });

    document.addEventListener("click", (event) => {
      if (
        !this.wrapper.contains(event.target) &&
        !this.openElement.contains(event.target)
      ) {
        this.close();
      }
    });
  }

  disconnectedCallback() {
    document.removeEventListener("click", (event) => {
      if (
        !this.wrapper.contains(event.target) &&
        !this.openElement.contains(event.target)
      ) {
        this.close();
      }
    });
  }

  onChange() {
    let searchTerm = this.input.value.trim();

    if (!searchTerm.length) {
      searchTerm = "*";
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    fetch(`/search/suggest?q=${searchTerm}&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector("#shopify-section-predictive-search");
        this.ressourceList.innerHTML = resultsMarkup.querySelector(
          ".predictive-search__resource-list"
        ).innerHTML;
        this.predictiveSearchResults.innerHTML = resultsMarkup.querySelector(
          "#predictive-search-results"
        ).innerHTML;
        this.open();
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  open() {
    this.predictiveSearchResults.style.display = "block";
    this.recommendations.style.display = "none";
  }

  close() {
    this.openElement.open = false;
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
customElements.define("predictive-search", PredictiveSearch);

class SliderElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-swiper-config"];
  }

  constructor() {
    super();
    this.swiper = null;
    this.thumbnails = null;
    this.swiperConfig = this.dataset.swiperConfig
      ? JSON.parse(this.dataset.swiperConfig)
      : {};
  }

  connectedCallback() {
    if (!this.swiper) {
      this.initSwiper();
    }
  }

  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  initSwiper() {
    if (this.dataset.thumbnails) {
      this.thumbnails = document.querySelector(`#${this.dataset.thumbnails}`);
      if (this.thumbnails) {
        this.swiperConfig.thumbs = { swiper: this.thumbnails };
      }
    }
    this.swiper = new Swiper(this, this.swiperConfig);
  }
}

customElements.define("slider-element", SliderElement);

class ProductGallerySlider extends SliderElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      "variant:changed",
      this.handleVariantChange.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      "variant:changed",
      this.handleVariantChange.bind(this)
    );
  }

  handleVariantChange(event) {
    const { variant } = event.detail;
    const correspondingVariantSlideIndex = Array.from(
      this.swiper.slides
    ).findIndex((slide) => {
      return Number(slide.dataset.mediaId) === variant.featuredMedia.id;
    });
    this.swiper.slideTo(correspondingVariantSlideIndex);
  }
}

customElements.define("product-gallery-slider", ProductGallerySlider);

class ProductInfo extends HTMLElement {
  constructor() {
    super();

    this.priceContainer = this.querySelector(".product-price");
    this.atcButton = this.querySelector(".product__atc-button");
    this.quantitySelector = this.querySelector("quantity-selector");
  }

  connectedCallback() {
    document.addEventListener(
      "variant:changed",
      this.handleVariantChange.bind(this)
    );
  }

  disconnectedCallback() {
    document.removeEventListener(
      "variant:changed",
      this.handleVariantChange.bind(this)
    );
  }

  handleVariantChange(event) {
    const { variant, productData } = event.detail;

    this.updateURL(productData.productURL, variant);
    this.updatePrice(variant);
    this.updateAtcButton(variant);
    this.updateQuantitySelector(variant);
  }

  updateURL(url, variant) {
    window.history.replaceState(
      {},
      "",
      `${url}${variant ? `?variant=${variant.id}` : ""}`
    );
  }

  updatePrice(variant) {
    if (!this.priceContainer || !variant) {
      return;
    }

    if (variant.price < variant.compareAtPrice) {
      this.priceContainer.innerHTML = `
        <span class="product-price__price text--highlight">
          ${formatMoney(variant.price)}
        </span>
        <span class="product-price__compare-at-price text--striked">
        ${formatMoney(variant.compareAtPrice)}
        </span>
      `;
    } else {
      this.priceContainer.innerHTML = `
        <span class="product-price__price">
          ${formatMoney(variant.price)}
        </span>
      `;
    }
  }

  updateAtcButton(variant) {
    this.atcButton.disabled = !variant.available;

    if (variant.available) {
      this.atcButton.disabled = false;
      this.atcButton.classList.add("button--primary");
      this.atcButton.classList.remove("button--secondary");
      this.atcButton.textContent = window.translations.product.addToCart;
    } else {
      this.atcButton.disabled = true;
      this.atcButton.classList.remove("button--primary");
      this.atcButton.classList.add("button--secondary");
      this.atcButton.textContent = window.translations.product.outOfStock;
    }
  }

  updateQuantitySelector(variant) {
    if (!this.quantitySelector || !variant) {
      return;
    }
    const quantityInput = this.quantitySelector.querySelector(
      'input[type="number"]'
    );

    quantityInput.max =
      variant.inventoryQuantity === 0 ? 1 : variant.inventoryQuantity;

    if (variant.inventoryQuantity >= quantityInput.value) {
      return;
    }

    if (variant.available) {
      quantityInput.value = variant.inventoryQuantity;
    } else {
      quantityInput.value = 1;
    }
  }
}

customElements.define("product-info", ProductInfo);

if (!customElements.get("variant-picker")) {
  customElements.define(
    "variant-picker",
    class VariantPicker extends HTMLElement {
      constructor() {
        super();

        this.selectionTitles = Array.from(this.querySelectorAll("label"));
        this.variantInputs = Array.from(
          this.querySelectorAll("[data-type='variant-input']")
        );
        this.variantSwatchButtons = Array.from(
          this.querySelectorAll(".swatch__button")
        );
        this.productForm = document.querySelector('[action="/cart/add"]');
        this.variantInput = this.productForm.querySelector('[name="id"]');
        this.productData = document.querySelector("[data-product-json]")
          ? JSON.parse(
              document.querySelector("[data-product-json]").textContent
            )
          : null;
      }

      connectedCallback() {
        this.variantInputs.forEach((selector) => {
          selector.addEventListener("change", this.handleChange.bind(this));
        });

        this.variantSwatchButtons.forEach((button) => {
          button.addEventListener("click", this.handleSwatchButton.bind(this));
        });
      }

      disconnectedCallback() {
        this.variantInputs.forEach((selector) => {
          selector.removeEventListener("change", this.handleChange.bind(this));
        });

        this.variantSwatchButtons.forEach((button) => {
          button.removeEventListener(
            "click",
            this.handleSwatchButton.bind(this)
          );
        });
      }

      handleChange(event) {
        let selectorOptionValues = [];
        const optionValue = this.querySelector(
          `[for="${event.target.id}"]`
        ).querySelector(".variant-dropdown__option-value");
        optionValue.textContent = event.target.value;

        if (this.variantInputs.length > 0) {
          selectorOptionValues = this.variantInputs.map((selector) => {
            return {
              value: selector.value,
              position: selector.dataset.position,
            };
          });
        }

        this.currentVariant = this.productData.variants.find((variant) => {
          return selectorOptionValues.every((option) => {
            return variant.options[option.position] === option.value;
          });
        });

        this.variantInput.value = this.currentVariant
          ? this.currentVariant.id
          : "";

        document.documentElement.dispatchEvent(
          new CustomEvent("variant:changed", {
            bubbles: true,
            detail: {
              variant: this.currentVariant,
              productData: this.productData,
            },
          })
        );
      }

      handleSwatchButton(event) {
        const swatchGroup = event.target.closest(".variant-swatches__group");
        const swatchInput = swatchGroup.querySelector("input");
        const swatches = swatchGroup.querySelectorAll(".swatch");

        swatches.forEach((swatch) => {
          if (swatch === event.target.closest(".swatch")) {
            swatch.setAttribute("selected", "");
          } else {
            swatch.removeAttribute("selected");
          }
        });

        swatchInput.value = event.target.value;
        swatchInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  );
}

if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('[action="/cart/add"]');
      }

      connectedCallback() {
        this.form.addEventListener("submit", this.handleSubmit.bind(this));
      }

      disconnectedCallback() {}

      handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        const formObject = {};
        formData.forEach((value, key) => {
          formObject[key] = value;
        });

        fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formObject),
        })
          .then((response) => {
            document.documentElement.dispatchEvent(
              new CustomEvent("cart:rerender", {
                bubbles: true,
                detail: {
                  openCart: true,
                },
              })
            );

            return response.json();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  );
}

if (!customElements.get("cart-actions")) {
  customElements.define(
    "cart-actions",
    class CartActions extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.line = Number(this.dataset.line);
        this.quantityInput = this.querySelector('[data-cart-action="change"]');
        this.removeButton = this.querySelector('[data-cart-action="remove"]');
        this.minusButton = this.querySelector("[data-cart-action='minus']");
        this.plusButton = this.querySelector("[data-cart-action='plus']");

        this.quantityInput.addEventListener("change", (event) =>
          this.updateLine(event, Number(this.quantityInput.value))
        );
        this.removeButton.addEventListener("click", (event) =>
          this.updateLine(event, 0)
        );
        this.minusButton.addEventListener("click", (event) =>
          this.updateLine(event, Number(this.quantityInput.value) - 1)
        );
        this.plusButton.addEventListener("click", (event) =>
          this.updateLine(event, Number(this.quantityInput.value) + 1)
        );
      }

      disconnectedCallback() {
        this.quantityInput.removeEventListener("change", this.updateLine);
        this.removeButton.removeEventListener("click", this.updateLine);
        this.minusButton.removeEventListener("click", this.updateLine);
        this.plusButton.removeEventListener("click", this.updateLine);
      }

      updateLine(event, quantity) {
        event.preventDefault();

        const update = {
          line: this.line,
          quantity: quantity,
        };

        fetch(window.Shopify.routes.root + "cart/change.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        })
          .then(() => {
            document.documentElement.dispatchEvent(
              new CustomEvent("cart:rerender", {
                bubbles: true,
                detail: {
                  openCart: false,
                },
              })
            );
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  );
}

if (!customElements.get("pagination-item")) {
  customElements.define(
    "pagination-item",
    class PaginationItem extends HTMLElement {
      constructor() {
        super();

        this.paginationButtons = this.querySelectorAll(".pagination__button");
        this.paginateContainer = document.querySelector(
          this.dataset.paginateContainer
        );
        this.sectionId = this.dataset.sectionId;
      }

      connectedCallback() {
        this.paginationButtons.forEach((button) => {
          button.addEventListener(
            "click",
            this.handlePaginationButtons.bind(this)
          );
        });
      }

      disconnectedCallback() {
        this.paginationButtons.forEach((button) => {
          button.removeEventListener("click", this.handlePaginationButtons);
        });
      }

      handlePaginationButtons(event) {
        const button = event.target;
        const href = button.dataset.href;
        if (!href) {
          return;
        }

        const pageNumber = button.dataset.page;
        const url = href + `&section_id=${this.sectionId}`;

        this.updateHistory(pageNumber);
        this.rerenderContent(url);
      }

      updateHistory(pageNumber) {
        const currentUrl = new URL(location.href);
        currentUrl.searchParams.set("page", pageNumber);
        history.pushState(null, "", currentUrl.toString());
      }

      rerenderContent(url) {
        fetch(url)
          .then((response) => {
            return response.text();
          })
          .then((data) => {
            const placeholderDiv = document.createElement("div");
            placeholderDiv.innerHTML = data;

            this.paginateContainer.innerHTML = placeholderDiv.querySelector(
              this.dataset.paginateContainer
            ).innerHTML;
          });
      }
    }
  );
}

if (!customElements.get("sort-by")) {
  customElements.define(
    "sort-by",
    class SortBy extends HTMLElement {
      constructor() {
        super();

        this.sortInputs = this.querySelectorAll('[name="sort"]');
        this.sectionId = this.dataset.sectionId;

        this.handleInputChange = this.handleInputChange.bind(this);
      }

      connectedCallback() {
        this.sortInputs.forEach((input) => {
          input.addEventListener("change", this.handleInputChange);
        });
      }

      disconnectedCallback() {
        this.sortInputs.forEach((input) => {
          input.removeEventListener("change", this.handleInputChange);
        });
      }

      handleInputChange(event) {
        this.sortInputs.forEach((input) => {
          if (input !== event.target && input.checked) {
            input.checked = false;
          }
        });

        const input = event.target;
        const href = input.dataset.href;
        const sortValue = input.checked ? input.value : "";

        // Create a new URL object based on the current location
        const currentUrl = new URL(location.href);
        const searchParams = new URLSearchParams(currentUrl.search);

        // Update or set the `sort_by` parameter
        searchParams.set("sort_by", sortValue);

        // Reconstruct the URL dynamically
        let url = `${href}?section_id=${
          this.sectionId
        }&${searchParams.toString()}`;

        // Update the history and rerender content
        this.updateHistory(sortValue);
        this.rerenderContent(url);
      }

      updateHistory(sortValue) {
        const currentUrl = new URL(location.href);
        currentUrl.searchParams.set("sort_by", sortValue);
        history.pushState(null, "", currentUrl.toString());
      }

      rerenderContent(url) {
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            const placeholderDiv = document.createElement("div");
            placeholderDiv.innerHTML = data;

            document.querySelector(".collection__content").innerHTML =
              placeholderDiv.querySelector(".collection__content").innerHTML;
          });
      }
    }
  );
}

if (!customElements.get("product-filters")) {
  customElements.define(
    "product-filters",
    class ProductFilters extends HTMLElement {
      constructor() {
        super();

        this.filterTabs = Array.from(this.querySelectorAll("openable-element"));
        this.filterInputs = Array.from(this.querySelectorAll("input"));
        this.clearFilters = this.querySelector("#ClearFilters");
        this.activeValues = this.querySelectorAll(".filters__tag");
        this.priceInputs = this.querySelector(
          ".filter-group-display__price-range"
        ).querySelectorAll("input");

        this.handleFilterInputs = this.handleFilterInputs.bind(this);
      }

      connectedCallback() {
        this.filterInputs.forEach((input) => {
          input.addEventListener("change", this.handleFilterInputs);
        });
        if (this.clearFilters) {
          this.clearFilters.addEventListener("click", (event) => {
            this.handleFilterChange(event.target.dataset.href);
          });
        }
        if (this.activeValues) {
          this.activeValues.forEach((value) => {
            value.addEventListener("click", (event) => {
              this.handleFilterChange(event.target.dataset.href);
            });
          });
        }
      }

      disconnectedCallback() {
        this.filterInputs.forEach((input) => {
          input.removeEventListener("change", this.handleFilterInputs);
        });
        if (this.clearFilters) {
          this.clearFilters.removeEventListener(
            "click",
            this.handleFilterChange
          );
        }
        if (this.activeValues) {
          this.activeValues.forEach((value) => {
            value.removeEventListener("click", this.handleFilterChange);
          });
        }
      }

      handleFilterInputs(event) {
        const input = event.target;
        let url;

        if (input.dataset.urlAdd || input.dataset.urlRemove) {
          url = input.checked ? input.dataset.urlAdd : input.dataset.urlRemove;
        } else {
          if (parseInt(input.value) < parseInt(input.min)) {
            input.value = parseInt(input.min);
          }
          if (parseInt(input.value) > parseInt(input.max)) {
            input.value = parseInt(input.max);
          }

          url = new URL(location.href);

          this.priceInputs.forEach((input) => {
            if (url.searchParams.get(input.name) !== input.value) {
              url.searchParams.delete(input.name);
              url.searchParams.append(input.name, input.value);
            }
          });
          url = url.toString();
        }
        this.handleFilterChange(url);
      }

      handleFilterChange(url) {
        const searchParams = this.getSearchParams(url);
        this.updateHistory(searchParams);

        this.rerenderContent(url);
      }

      getSearchParams(url) {
        const fullUrl = new URL(url, location.origin);
        return fullUrl.search;
      }

      updateHistory(searchParams) {
        const currentUrl = new URL(location.href);
        const newSearchParams = new URLSearchParams(searchParams);

        currentUrl.search = newSearchParams.toString();
        history.pushState(null, "", currentUrl.toString());
      }

      rerenderContent(url) {
        const openFilters = this.filterTabs
          .map((value, index) => (value.hasAttribute("open") ? index : -1))
          .filter((index) => index !== -1);

        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            const placeholderDiv = document.createElement("div");
            placeholderDiv.innerHTML = data;

            openFilters.forEach((index) => {
              const currentFilter = placeholderDiv
                .querySelector(".collection__content")
                .querySelectorAll("openable-element")[index];

              currentFilter.setAttribute("open", "");
              currentFilter.setAttribute("aria-expanded", "true");
            });

            if (placeholderDiv.querySelector("[data-drawer-id='filters']")) {
              placeholderDiv.querySelector("[data-drawer-id='filters']").querySelector('.drawer').setAttribute('open', '')
            }

            document.querySelector(".collection__content").innerHTML =
              placeholderDiv.querySelector(".collection__content").innerHTML;
          });
      }
    }
  );
}
