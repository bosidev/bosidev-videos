class PaginationComponent extends HTMLElement {
  constructor() {
    super();
  }

  get sectionId() {
    return this.getAttribute("data-section-id");
  }

  get target() {
    return this.getAttribute("data-target");
  }

  connectedCallback() {
    this.links = this.querySelectorAll("a");
    this.handlePaginationButton = this.handlePaginationButton.bind(this);

    this.links.forEach((link) => {
      link.addEventListener("click", this.handlePaginationButton);
    });
  }

  disconnectedCallback() {
    this.links.forEach((link) => {
      link.removeEventListener("click", this.handlePaginationButton);
    });
  }

  handlePaginationButton(event) {
    event.preventDefault();
    const url = new URL(event.currentTarget.href);
    url.searchParams.set("section_id", this.sectionId);

    fetch(url.toString())
      .then((response) => response.text())
      .then((html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        document.querySelector(this.target).innerHTML = tempDiv.querySelector(
          this.target
        ).innerHTML;

        url.searchParams.delete("section_id");
        window.history.pushState({}, "", url.toString());
      });
  }
}

customElements.define("pagination-component", PaginationComponent);
