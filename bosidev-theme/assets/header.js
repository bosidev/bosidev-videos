// TODO: Clean this section Up and also make general hover custom element

if (!customElements.get("mega-menu")) {
  class MegaMenu extends HTMLElement {
    constructor() {
      super();
      this.details = this.querySelector("details");
      this.openTrigger = this.querySelector("[data-open-trigger]");
      this.openElement = this.querySelector("[data-open-element]");
      this.hoverBuffer = this.querySelector("[data-hover-buffer]"); // Reference to the hover buffer
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }

    manageEventListeners(action) {
      const events = [
        {
          element: this.openTrigger,
          type: "mouseenter",
          handler: this.onMenuItemMouseEnter.bind(this),
        },
        {
          element: this.openTrigger,
          type: "mouseleave",
          handler: this.onMenuItemMouseLeave.bind(this),
        },
        {
          element: this.openElement,
          type: "mouseenter",
          handler: this.onMegaMenuMouseEnter.bind(this),
        },
        {
          element: this.openElement,
          type: "mouseleave",
          handler: this.onMegaMenuMouseLeave.bind(this),
        },
        {
          element: this.hoverBuffer,
          type: "mouseenter",
          handler: this.onHoverBufferEnter.bind(this),
        },
        {
          element: this.hoverBuffer,
          type: "mouseleave",
          handler: this.onHoverBufferLeave.bind(this),
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

    showMegaMenu() {
      this.details.open = true;
      this.hoverBuffer.classList.add("active");
    }

    hideMegaMenu() {
      this.details.open = false;
      this.hoverBuffer.classList.remove("active");
    }

    delayedHideMegaMenu() {
      setTimeout(() => {
        if (
          !this.openTrigger.matches(":hover") &&
          !this.hoverBuffer.matches(":hover") &&
          !this.openElement.matches(":hover")
        ) {
          this.hideMegaMenu();
        }
      }, 100);
    }

    onMenuItemMouseEnter() {
      this.closeAllMenus();
      this.showMegaMenu();
    }

    onMenuItemMouseLeave() {
      this.delayedHideMegaMenu();
    }

    onMegaMenuMouseEnter() {
      this.showMegaMenu();
    }

    onMegaMenuMouseLeave() {
      this.delayedHideMegaMenu();
    }

    onHoverBufferEnter() {
      this.showMegaMenu();
    }

    onHoverBufferLeave() {
      this.delayedHideMegaMenu();
    }

    // Close all other open menus
    closeAllMenus() {
      document
        .querySelectorAll(".mega-menu [data-open-element]")
        .forEach((menu) => {
          menu.open = false;
          this.hoverBuffer.classList.remove("active");
        });
    }
  }

  customElements.define("mega-menu", MegaMenu);
}
