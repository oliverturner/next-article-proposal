import { onDomReady } from "./utils/dom-ready";
import { RightHandRail } from "./ads/rhr";

function createSlots(length: number) {
  return Array.from({ length }, (_, i) => {
    const slot = document.createElement("pg-slot");
    slot.innerHTML = `<span>${i + 1}</span>`;
    return slot;
  });
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
function runDemo() {
  try {
    const articleContentEl = document.querySelector("#article-content")!;
    const articleRhrEl = document.querySelector("#article-rhr")!;
    const conceptListEl = articleRhrEl.querySelector<HTMLElement>(".concepts")!;

    const numSlots = parseInt(new URLSearchParams(document.location.search).get("numItems") ?? "2");

    const articleRhr = new RightHandRail(articleContentEl, articleRhrEl);
    const items = configureSlots(createSlots(numSlots), articleRhr.isIntersected);

    // @ts-ignore
    window.articleRhr = articleRhr;

    // If there's no fullbleed content then add the desktop Concept List
    // into the items to be placed in the RHR
    if (articleRhr.isIntersected === false) {
      items.splice(1, 0, conceptListEl);
    }
    articleRhr.placeItems(items);

    // The RightHandRail component supports multiple instances
    const commentsRhr = new RightHandRail(
      document.querySelector("#comments-content")!,
      document.querySelector("#comments-rhr")!
    );

    // Here we place the slots that didn't fit `articleRhr` into `commentsRhr`
    // We also update them to allow 600px MPUs: `commentsRhr.isIntersected` is false
    commentsRhr.placeItems(configureSlots(items, commentsRhr.isIntersected));

  } catch (err) {
    console.error(err);
  }
}

onDomReady.then(runDemo);
