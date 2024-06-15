import { debounce } from "../../utils/events";

export class ShareNav {
  static NAV_STICKY_TOP = 50;

  navEl: HTMLElement;
  contentEl: Element;
  fullbleedEls: Element[];
  navObserver: IntersectionObserver;
  fullbleedObserver: IntersectionObserver | null = null;
  counter = 0;

  constructor(navEl: HTMLElement, contentEl: Element) {
    this.navEl = navEl;
    this.contentEl = contentEl;
    this.fullbleedEls = this.getFullbleedEls();
    this.navObserver = this.createNavObserver();

    // Ensure that the nav's top property matches the sticky top value
    this.navEl.style.top = `${ShareNav.NAV_STICKY_TOP}px`;

    window.addEventListener("resize", debounce(this.onResize, 100));
  }

  getFullbleedEls() {
    const fullbleedEls = [];
    const maxWidth = this.contentEl.getBoundingClientRect().width;
    for (const child of this.contentEl.children) {
      if (child.getBoundingClientRect().width > maxWidth) {
        fullbleedEls.push(child);
      }
    }

    return fullbleedEls;
  }

  /**
   * Create an observer to detect when this.navEl enters its sticky state.
   *
   * Whenever the state changes, create a new observer of fullbleed
   * elements using the nav's current dimensions to determine when the nav
   * is overlapped
   */
  createNavObserver() {
    this.navObserver?.disconnect();
    const observer = new IntersectionObserver(this.onNavIntersect, {
      rootMargin: this.shareNavRootMargin,
      threshold: 0.999,
    });
    observer.observe(this.navEl);

    return observer;
  }

  createFullbleedObserver() {
    this.fullbleedObserver?.disconnect();

    const observer = new IntersectionObserver(this.onFullbleedIntersect, {
      rootMargin: this.shareNavRootMargin,
    });

    for (const el of this.fullbleedEls) {
      observer.observe(el);
    }

    console.log("createFullbleedObserver", this.counter++);

    return observer;
  }

  // Accessors
  //------------------------------------------------------------------------------------------------
  get shareNavRootMargin() {
    const initialNavRect = this.navEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const top = ShareNav.NAV_STICKY_TOP;
    const bottom = top + initialNavRect.height + top - viewportH;

    return `${top}px 0px ${bottom}px 0px`;
  }

  // Event handlers
  //------------------------------------------------------------------------------------------------
  onNavIntersect = () => {
    this.fullbleedObserver = this.createFullbleedObserver();
  };

  onFullbleedIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        return (this.navEl.dataset.isOverlapped = "true");
      }
    }

    this.navEl.dataset.isOverlapped = "false";
  };

  onResize = () => {
    this.fullbleedEls = this.getFullbleedEls();
    this.navObserver = this.createNavObserver();
  };
}
