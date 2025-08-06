class CollectionFilters extends HTMLElement {
  constructor() {
    super();
  }

  get sectionId() {
    return this.getAttribute("data-section-id");
  }

  connectedCallback() {
    this.filterOptions = this.querySelectorAll("input[type='checkbox']");
    this.handleFilterChange = this.handleFilterChange.bind(this);

    this.filterOptions.forEach((option) => {
      option.addEventListener("change", this.handleFilterChange);
    });
  }

  disconnectedCallback() {
    this.filterOptions.forEach((option) => {
      option.removeEventListener("change", this.handleFilterChange);
    });
  }

  handleFilterChange(event) {
    const url = event.currentTarget.checked ? new URL(event.currentTarget.dataset.addUrl, window.location.origin) : new URL(event.currentTarget.dataset.removeUrl, window.location.origin);
    url.searchParams.set("section_id", 'collection');

    fetch(url.toString())
      .then((response) => response.text())
      .then((html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        document.querySelector(".collection-inner").innerHTML = tempDiv.querySelector(".collection-inner").innerHTML;

        url.searchParams.delete("section_id");
        window.history.pushState({}, "", url.toString());
      });
  }
}

customElements.define("collection-filters", CollectionFilters);