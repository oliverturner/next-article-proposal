const REGION_H = 1080;
const SLOT_MIN_H = 250;
const SLOT_PADDING_END = 300;
const SINGLE_SLOT_REGION_H = SLOT_MIN_H + SLOT_PADDING_END;

export class RightHandRail {
  name: string;
  rhrEl: Element & { cmd?: (() => void)[] };
  groupsEl: Element;
  containerEl: Element;

  #contentGroups: Element[][] = [];
  #rhrRegions: HTMLDivElement[] = [];

  /**
   * How this module works:
   * 1. Scan `groupsEl` for runs of immediate children (e.g. paragraphs, images,
   *   tables, etc) that don't exceed its width
   * 2. Insert a "region" div into the RHR for each run, with a `top` value that
   *   absolutely positions it to align vertically with the first element in the
   *   group and a `height` value that means it ends at the bottom of the last
   *   element
   * 3. Call `this.placeSlots(slots)` to insert as many items as possible into
   *   each sufficiently tall region (i.e. at least `minRegionHeight`)
   * 4. If `contentEl` resizes (e.g. because a Flourish component loads late),
   *   re-run the calculations and update the regions' `top` and `height`
   *   properties to match the new layout
   *   (Contained items are automatically positioned via regions' `flex` display)
   */
  constructor(
    name: string,
    {
      rhrEl,
      groupsEl,
      containerEl,
    }: {
      rhrEl: Element | null | undefined;
      groupsEl: Element | null | undefined;
      containerEl?: Element | null | undefined;
    }
  ) {
    if (!groupsEl || !rhrEl) {
      throw new Error("Missing elements");
    }

    this.name = name;
    this.rhrEl = rhrEl;
    this.groupsEl = groupsEl;
    this.containerEl = containerEl ?? groupsEl;

    this.placeItem = this.placeItem.bind(this);
    this.placeSlots = this.placeSlots.bind(this);
    this.updateRhrRegions = this.updateRhrRegions.bind(this);
    this.onDocResize = this.onDocResize.bind(this);

    this.rhrEl.cmd = this.initCmdProxy();
    this.#contentGroups = this.initContentGroups();
    this.#rhrRegions = this.initRhrRegions();

    const resizeObserver = new ResizeObserver(this.onDocResize);
    resizeObserver.observe(document.documentElement);
  }

  // Public API
  //---------------------------------------------------------------------------
  /**
   * Place as many items as possible in each region
   *
   * **NOTE** this method mutates the `slots` array in place, meaning that
   * its length shrinks as slots are placed
   */
  placeSlots(slotEls: HTMLElement[]) {
    const placedSlotEls = [];
    for (const region of this.#rhrRegions) {
      if (slotEls.length === 0) break;

      const regionHeight = region.getBoundingClientRect().height;
      const regionSlotNum = Math.floor(regionHeight / REGION_H);

      let regionSlotEls: HTMLElement[] = [];

      /**
       * If a region's height is _less_ than REGION_H but is tall enough to fit
       * a `MediumRectangle` slot plus 300px padding (i.e. SINGLE_SLOT_REGION_H)
       * then place a single slot in it, ensuring that its `data-o-ads-formats`
       * attribute is set to 'MediumRectangle,OneByOne'
       */
      if (regionSlotNum <= 1 && regionHeight >= SINGLE_SLOT_REGION_H) {
        regionSlotEls = slotEls.splice(0, 1);
        for (const regionSlotEl of regionSlotEls) {
          const format = "MediumRectangle,OneByOne";
          regionSlotEl.dataset.oAdsFormatsLarge = format;
          regionSlotEl.dataset.oAdsFormatsExtra = format;
        }
      } else if (regionSlotNum > 1) {
        /**
         * Otherwise, if a region is multiple REGION_H pixels tall, grab that many
         * `slot` references
         */
        regionSlotEls = slotEls.splice(0, regionSlotNum);
      }

      // Finally, insert the slot elements into the region DOM
      for (const item of regionSlotEls) {
        placedSlotEls.push(region.appendChild(item));
      }
    }

    return placedSlotEls;
  }

  /**
   * This method will allow for custom item placement
   */
  placeItem({
    item,
    requiredH,
    placement,
  }: {
    item: Element | Node;
    requiredH: number;
    placement: "top" | "middle" | "bottom";
  }) {
    if (
      item instanceof (Element || Node) === false ||
      typeof requiredH !== "number" ||
      ["top", "middle", "bottom"].includes(placement) === false
    ) {
      return console.error("Invalid arguments", this.rhrEl.cmd?.length);
    }

    const regionsAvailable = [];
    for (const [region, regionSpace] of this.regionSpaces.entries()) {
      if (regionSpace >= requiredH) {
        regionsAvailable.push(region);
      }
    }

    if (regionsAvailable.length === 0) {
      return console.warn("Insufficient space in RHR: couldn't place item");
    }

    if (placement === "top") {
      regionsAvailable[0].appendChild(item);
    }

    if (placement === "middle") {
      const regionIndex = Math.floor(regionsAvailable.length / 2);
      const region = regionsAvailable[regionIndex];
      const childIndex = Math.floor(region.children.length / 2);
      const middleChild = region.children[childIndex];
      region.insertBefore(item, middleChild.nextSibling);
    }

    if (placement === "bottom") {
      regionsAvailable.at(-1)?.appendChild(item);
    }
  }

  // Getters
  //---------------------------------------------------------------------------
  get regionSpaces() {
    const spaces: Map<HTMLDivElement, number> = new Map();
    for (const region of this.#rhrRegions) {
      const regionH = region.getBoundingClientRect().height;
      const childrenH = [...region.children].reduce(
        (acc, el) => acc + el.getBoundingClientRect().height,
        0
      );
      spaces.set(region, regionH - childrenH);
    }

    return spaces;
  }

  get isIntersected() {
    return this.#contentGroups.length > 1;
  }

  // Event handlers
  //---------------------------------------------------------------------------
  onDocResize() {
    this.updateRhrRegions();
  }

  // Set-up
  //---------------------------------------------------------------------------
  /**
   * Group contiguous non-fullbleed children of this.contentEl into arrays,
   * stored in this.#contentGroups
   */
  initContentGroups() {
    const contentEls = [...this.groupsEl.children];
    const contentWidth = this.groupsEl.getBoundingClientRect().width;
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
   * Returns the y position and height for a box that would surround a
   * contentGroup's elements.
   *
   * The RHR region corresponding to a contentGroup uses these values to
   * position itself
   */
  getContentGroupRects() {
    /**
     * By default, `containerEl` is `contentEl`, but a custom element can be
     * passed in the constructor
     */
    const containerTop = this.containerEl.getBoundingClientRect().top;
    const contentTop = this.groupsEl.getBoundingClientRect().top;
    const rhrTop = this.rhrEl.getBoundingClientRect().top;

    /**
     * Because the RHR isn't always vertically aligned with the content, we need
     * to calculate some offsets:
     * - `contentDiff` accounts for any disparity between the tops of
     *   `contentEl` and `containerEl`
     * - `rhrOffset`: sets region `top` values relative to the RHR element
     *   itself, simplifying the absolute positioning of region elements
     */
    const contentDiff = contentTop - containerTop;
    const rhrDiff = rhrTop - containerTop;
    const rhrOffset = containerTop + rhrDiff;

    const rects = [];
    for (const group of this.#contentGroups) {
      if (group.length === 0) continue;

      const firstRect = group.at(0)?.getBoundingClientRect() ?? { top: 0 };
      const lastRect = group.at(-1)?.getBoundingClientRect() ?? { bottom: 0 };
      const top = Math.round(firstRect.top - rhrOffset);
      const bottom = Math.round(lastRect.bottom - rhrOffset);
      const height = bottom - top;

      rects.push({ top, height });
    }

    /**
     * Reposition and stretch the first region by `contentDiff` so that it spans
     * from the top of `containerEl` to the end of the first group
     */
    const topRect = rects[0];
    if (topRect) {
      topRect.top = topRect.top - contentDiff;
      topRect.height = topRect.height + contentDiff;
    }

    return rects;
  }

  /**
   * Insert a cell for each group, regardless of dimensions
   *
   * @returns {HTMLDivElement[]}
   */
  initRhrRegions(): HTMLDivElement[] {
    this.rhrEl.innerHTML = "";

    const rects = this.getContentGroupRects();
    const regionEls = [];
    for (const { top, height } of rects) {
      const regionEl = document.createElement("div");
      regionEl.className = `rhr-region rhr-region--${this.name}`;
      regionEl.style.top = `${top}px`;
      regionEl.style.height = `${height}px`;

      /**
       * Add a class to regions that are tall enough to contain an ad
       * This is used for debugging purposes, to visually identify regions
       */
      if (height >= REGION_H) {
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

  /**
   * Support pushing RHR methods onto the `cmd` property of the `this.rhrEl` DOM element
   *
   * NOTE:
   * Commands can be queued regardless of RHR's state: RHR will execute pre-existing commands on
   * initialisation and listen out for new commands as they're added
   *
   * @example
   * const item = myCustomWidget();
   * const rhrEl = $("[data-component='rhr']");
   * rhrEl.cmd = rhrEl.cmd ?? [];
   * rhrEl.cmd.push((rhr) => rhr.placeItem({ item, requiredH: 300, placement: 'top' }));
   */
  initCmdProxy() {
    let fn: ((scope: RightHandRail) => void) | undefined;

    // Execute any pre-existing commands
    while ((fn = this.rhrEl.cmd?.shift())) {
      fn(this);
    }

    // Execute additional commands as they're added
    return new Proxy(this.rhrEl.cmd ?? [], {
      set: (target, property, value) => {
        if (property === "length") return true;

        target[Number(property)] = value;

        /**
         * Commands are removed from the queue as soon as they're executed
         */
        try {
          while ((fn = target.shift())) {
            fn(this);
          }
        } catch (error) {
          console.error("RHR: Error invoking queued method", error);
        }

        return true;
      },
    });
  }
}
