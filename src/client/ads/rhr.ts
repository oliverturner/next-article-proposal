export class RightHandRail {
  public static readonly REGION_MIN_H = 980;
  public static readonly REGION_MAX_H = 1080;

  #contentGroups: Element[][] = [];
  #rhrRegions: HTMLDivElement[] = [];

  constructor(
    public readonly contentEl: Element,
    public readonly rhrEl: Element
  ) {
    if (!contentEl || !rhrEl) {
      throw new Error("Missing elements", { cause: { contentEl, rhrEl } });
    }

    this.#contentGroups = this.initContentGroups();
    this.#rhrRegions = this.initRhrRegions();

    const contentElObserver = new ResizeObserver(
      this.onContentElResize.bind(this)
    );
    contentElObserver.observe(this.contentEl);
  }

  // Public API
  //---------------------------------------------------------------------------
  /**
   * Place as many items as possible in each region
   * N.B. this method mutates the `items` array in place
   */
  placeItems(items: Element[]) {
    // To reduce items appearing on screen together, regions have a minimum height requirement
    console.log("minRegionHeight", this.minRegionHeight);

    for (const region of this.#rhrRegions) {
      if (items.length === 0) break;

      const regionHeight = region.getBoundingClientRect().height;
      const regionMax = Math.floor(regionHeight / this.minRegionHeight);
      const regionItems = items.splice(0, regionMax);

      for (const item of regionItems) {
        region.appendChild(item);
      }
    }
  }

  get isIntersected() {
    return this.#contentGroups.length > 1;
  }

  /**
   * Region height is determined by the viewport height,
   * clamped between REGION_MIN_H and REGION_MAX_H
   */
  get minRegionHeight() {
    return Math.min(
      Math.max(window.innerHeight, RightHandRail.REGION_MIN_H),
      RightHandRail.REGION_MAX_H
    );
  }

  // Event handlers
  //---------------------------------------------------------------------------
  onContentElResize() {
    this.updateRhrRegions();
  }

  // Set-up
  //---------------------------------------------------------------------------
  /**
   * Group contiguous non-fullbleed children of this.articleEl into arrays
   */
  initContentGroups() {
    const contentEls = [...this.contentEl.children];
    const contentWidth = this.contentEl.getBoundingClientRect().width;
    const groups = [];

    let currentGroup: Element[] = [];
    for (const el of contentEls) {
      if (el.getBoundingClientRect().width <= contentWidth) {
        currentGroup.push(el);
      }

      let nextEl = el.nextElementSibling;
      if (!nextEl) {
        groups.push(currentGroup);
        break;
      }

      if (nextEl.getBoundingClientRect().width > contentWidth) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }

    return groups;
  }

  /**
   * Get the bounding box for each group's elements
   *
   * `offsetY`: sets `top` values relative to the RHR element
   * This simplifies the absolute positioning of region elements within the RHR
   *
   * `topDiff` accounts for any disparity between the tops of `content` and `rhr`
   */
  getContentGroupRects() {
    const contentTop = this.contentEl.getBoundingClientRect().top;
    const rhrTop = this.rhrEl.getBoundingClientRect().top;
    const topDiff = contentTop - rhrTop;
    const offsetY = contentTop + topDiff;

    const rects = [];
    for (const group of this.#contentGroups) {
      if (group.length === 0) continue;

      const firstRect = group.at(0)!.getBoundingClientRect();
      const lastRect = group.at(-1)!.getBoundingClientRect();
      const top = Math.round(firstRect.top - offsetY);
      const bottom = Math.round(lastRect.bottom - offsetY);
      const height = bottom - top;

      rects.push({ top, height });
    }

    return rects;
  }

  /**
   * Insert a cell for each group
   */
  initRhrRegions() {
    this.rhrEl.innerHTML = "";

    const rects = this.getContentGroupRects();
    const regionEls = [];
    for (const { top, height } of rects) {
      const regionEl = document.createElement("div");
      regionEl.className = "rhr-region";
      regionEl.style.top = `${top}px`;
      regionEl.style.height = `${height}px`;

      if (height >= this.minRegionHeight) {
        regionEl.classList.add("rhr-region--sufficient");
      }

      regionEls.push(this.rhrEl.appendChild(regionEl));
    }

    return regionEls;
  }

  updateRhrRegions() {
    const rects = this.getContentGroupRects();
    let i = 0;
    for (const { top, height } of rects) {
      const regionEl = this.#rhrRegions[i++];
      regionEl.style.top = `${top}px`;
      regionEl.style.height = `${height}px`;
    }
  }
}
