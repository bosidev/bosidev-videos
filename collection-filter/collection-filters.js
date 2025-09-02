class CollectionFilters extends HTMLElement {
  constructor() {
    super();
  }

  get sectionId() {
    return this.getAttribute("data-section-id");
  }

  connectedCallback() {
    this.filterTabs = Array.from(this.querySelectorAll("accordion-toggle"));
    this.filterOptions = this.querySelectorAll("input");
    this.minRange = this.querySelector("input[type='range'][data-min-value]");
    this.maxRange = this.querySelector("input[type='range'][data-max-value]");
    this.minValueDisplay = this.querySelector("[data-min-value-display]");
    this.maxValueDisplay = this.querySelector("[data-max-value-display]");

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleRangeInput = this.handleRangeInput.bind(this);

    this.filterOptions.forEach((option) => {
      option.addEventListener("change", this.handleFilterChange);
    });

    this.minRange.addEventListener("input", this.handleRangeInput);
    this.maxRange.addEventListener("input", this.handleRangeInput);
  }

  disconnectedCallback() {
    this.filterOptions.forEach((option) => {
      option.removeEventListener("change", this.handleFilterChange);
    });

    this.minRange.removeEventListener("input", this.handleRangeInput);
    this.maxRange.removeEventListener("input", this.handleRangeInput);
  }

  handleFilterChange(event) {
    const input = event.target;
    let url;

    if (input.dataset.addUrl || input.dataset.removeUrl) {
      url = new URL(
        input.checked ? input.dataset.addUrl : input.dataset.removeUrl,
        window.location.origin
      );
    } else {

      url = new URL(location.href);

      url.searchParams.delete(this.minRange.dataset.param);
      url.searchParams.delete(this.maxRange.dataset.param);
      url.searchParams.set(this.minRange.dataset.param, this.minRange.value);
      url.searchParams.set(this.maxRange.dataset.param, this.maxRange.value);
    }

    url.searchParams.set("section_id", this.sectionId);

    fetch(url.toString())
      .then((response) => response.text())
      .then((html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        const openFilters = this.filterTabs
          .map((value, index) =>
            value.classList.contains("accordion--open") ? index : -1
          )
          .filter((index) => index !== -1);

        openFilters.forEach((index) => {
          const currentFilter = tempDiv
            .querySelector(".collection-filters__content")
            .querySelectorAll("accordion-toggle")[index];

          currentFilter.classList.add("accordion--open");
        });

        document.querySelector(".collection-inner").innerHTML =
          tempDiv.querySelector(".collection-inner").innerHTML;

        url.searchParams.delete("section_id");
        window.history.pushState({}, "", url.toString());
      });
  }

  handleRangeInput(event) {
    // Update display in real-time while dragging
    const value = parseInt(event.currentTarget.value);
    const isMinRange = event.currentTarget.hasAttribute("data-min-value");

    if (isMinRange) {
      // Ensure min value doesn't exceed max value - 1
      const maxValue = parseInt(this.maxRange.value);
      if (value >= maxValue) {
        console.log("max value");
        event.currentTarget.value = maxValue - 10;
      }

      if (this.minValueDisplay) {
        this.minValueDisplay.textContent = this.formatValue(
          event.currentTarget.value,
          event.currentTarget
        );
      }
    } else {
      // Ensure max value doesn't go below min value + 1
      const minValue = parseInt(this.minRange.value);
      if (value <= minValue) {
        event.currentTarget.value = minValue + 10;
      }

      if (this.maxValueDisplay) {
        this.maxValueDisplay.textContent = this.formatValue(
          event.currentTarget.value,
          event.currentTarget
        );
      }
    }
  }

  formatValue(value) {
    // Convert from cents to dollars and format as currency without decimals
    const dollars = value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(dollars);
  }
}

customElements.define("collection-filters", CollectionFilters);


class AccordionToggle extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = this.querySelector(".accordion__header");
    this.content = this.querySelector(".accordion__content");

    this.handleClick = this.handleClick.bind(this);

    this.header.addEventListener("click", this.handleClick);

    this.addMaxHeight();
  }

  disconnectedCallback() {
    this.header.removeEventListener("click", this.handleClick);
  }

  handleClick() {
    if (this.classList.contains("accordion--open")) {
      this.classList.remove("accordion--open");
    } else {
      this.classList.add("accordion--open");
    }
  }

  addMaxHeight() {
    this.style.setProperty("--accordion-content-height", this.content.scrollHeight + "px");
  }
}

customElements.define("accordion-toggle", AccordionToggle);