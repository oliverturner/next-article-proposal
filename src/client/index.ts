import { onDomReady } from "./utils/dom-ready";
import { RightHandRail, type RHRElement } from "./components/ads/rhr";

function createSlots(length: number) {
  return Array.from({ length }, (_, i) => {
    const slot = document.createElement("pg-slot");
    slot.innerHTML = `<span>${i + 1}</span>`;
    return slot;
  });
}

function createProWidget() {
  return document.createElement("pro-widget");
}

/**
 * We're able to configure RHR slots based on `isFullWidth`
 * Here `rhr-fullbleed` omits 600px tall slots
 */
function configureSlots(slots: HTMLElement[], isFullWidth: boolean) {
  for (const slot of slots) {
    slot.dataset.configKey = isFullWidth ? "rhr-fullbleed" : "rhr";
  }
  return slots;
}

/**
 * This is an example of how a consuming app might choose to order
 * its RHR items.
 *
 * In this case, we're inserting the Concept List as the second item
 * to increase its likelihood of appearing in the right hand rail,
 * but giving the first ad slot priority.
 *
 * We might additionally choose to insert an FT Professional widget:
 * the point is that the consuming app decides the order of items.
 */
function initRhrInstances() {
  try {
    const articleContentEl = document.querySelector("#article-content")!;
    const articleRhrEl = document.querySelector<RHRElement>("#article-rhr")!;
    const conceptListEl = articleRhrEl.querySelector<HTMLElement>(".concepts")!;

    const articleRhr = new RightHandRail("article", {
      groupsEl: articleContentEl,
      rhrEl: articleRhrEl,
    });
    const slots = configureSlots(createSlots(4), articleRhr.isIntersected);

    // If there's no fullbleed content then add the desktop Concept List
    // into the items to be placed in the RHR
    if (articleRhr.isIntersected === false) {
      slots.splice(1, 0, conceptListEl);
    }
    articleRhr.placeSlots(slots);

    // The RightHandRail component supports multiple instances
    const commentsRhr = new RightHandRail("comments", {
      groupsEl: document.querySelector("#comments-content")!,
      rhrEl: document.querySelector<RHRElement>("#comments-rhr")!,
    });

    // Here we place the slots that didn't fit `articleRhr` into `commentsRhr`
    // We also update them to allow 600px MPUs: `commentsRhr.isIntersected` is false
    commentsRhr.placeSlots(configureSlots(slots, commentsRhr.isIntersected));
  } catch (err) {
    console.error(err);
  }
}

function insertProWidget(
  articleRhrEl: RHRElement,
  placement: "top" | "middle" | "bottom"
) {
  articleRhrEl.cmd?.push((rhr: RightHandRail) => {
    rhr.placeItem({
      item: createProWidget(),
      itemSpace: 700,
      placement,
    });
  });
}

onDomReady.then(() => {
  const articleRhrEl = document.querySelector<RHRElement>("#article-rhr")!;
  articleRhrEl.cmd ??= [];

  // We can enqueue RHR commands before the RHR has been initialised
  insertProWidget(articleRhrEl, "middle");

  initRhrInstances();

  // Commands can be run post-initialisation too
  setTimeout(() => insertProWidget(articleRhrEl, "bottom"), 5000);
});
