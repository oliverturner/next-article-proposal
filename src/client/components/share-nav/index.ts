import { debounce } from "../../utils/events";
import { getFullbleedEls, getRootMargins } from "./utils";

export const NAV_STICKY_TOP = 80;
export const FULLBLEED_MARGIN = 40;

export class ShareNav {
  navEl: HTMLElement;
  contentEl: Element;

  fullbleedEls: Element[];
  fullbleedObserver: IntersectionObserver | null = null;
  navObserver: IntersectionObserver;

  constructor(navEl: HTMLElement, contentEl: Element) {
    this.navEl = navEl;
    this.contentEl = contentEl;

    /**
     * Ensure consistency of the sticky top value
     * This overrides any value that may have been set in CSS
     */
    this.navEl.style.top = `${NAV_STICKY_TOP}px`;

    this.fullbleedEls = getFullbleedEls(this.contentEl);
    this.navObserver = this.createNavObserver();

    window.addEventListener("resize", debounce(this.onResize, 100));
  }

  /**
   * Create an observer to detect when this.navEl enters or leaves
   * its sticky state.
   *
   * Whenever the state changes, create a new fullbleed observer
   * using the applicable pre-calculated rootMargin.
   */
  createNavObserver() {
    this.navObserver?.disconnect();

    /**
     * Pre-calculate root margins for nav and fullbleed elements
     * in both static and sticky states
     */
    const rootMargins = getRootMargins(this.navEl.getBoundingClientRect());

    const onNavIntersect = (entries: IntersectionObserverEntry[]) => {
      const isSticky = entries[0].isIntersecting;
      const rootMargin = isSticky
        ? rootMargins.fullbleedSticky
        : rootMargins.fullbleedStatic;

      this.fullbleedObserver = this.createFullbleedObserver(rootMargin);
    };

    const observer = new IntersectionObserver(onNavIntersect, {
      rootMargin: rootMargins.navSticky,
      threshold: 0.9, // this _appears_ to be required in Safari?
    });

    observer.observe(this.navEl);

    return observer;
  }

  createFullbleedObserver(rootMargin: string) {
    this.fullbleedObserver?.disconnect();

    const onFullbleedIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          return (this.navEl.dataset.isOverlapped = "true");
        }
      }

      this.navEl.dataset.isOverlapped = "false";
    };

    const observer = new IntersectionObserver(onFullbleedIntersect, {
      rootMargin,
    });

    for (const el of this.fullbleedEls) {
      observer.observe(el);
    }

    return observer;
  }

  // Event handlers
  //------------------------------------------------------------------------------------------------
  onResize = () => {
    this.fullbleedEls = getFullbleedEls(this.contentEl);
    this.navObserver = this.createNavObserver();
  };
}
