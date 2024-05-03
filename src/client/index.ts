import { onDomReady } from "./utils/dom-ready";
import { RightHandRail } from "./ads/rhr";

function createSlots(length: number): Element[] {
  return Array.from({ length }, (_, i) => {
    const slot = document.createElement("pg-slot");
    slot.innerHTML = `<span>${i + 1}</span>`;
    return slot;
  });
}

/**
 * This is an example of how a consuming app might choose to order
 * its RHR items.
 *
 * In this case, we're inserting the Concept List as the second item
 * to increase its likelihood of appearing in the right hand rail,
 * but giving the first ad slot priority.
 */
function initRhr() {
  try {
    const items = createSlots(4);
    const conceptList = document.querySelector(".concepts--rhr");

    const articleRhr = new RightHandRail(
      document.querySelector("#article-content")!,
      document.querySelector("#article-rhr")!
    );

    // If there's no fullbleed content then add the desktop Concept List
    // into the items to be placed in the RHR
    if (articleRhr.isIntersected === false && conceptList) {
      items.splice(1, 0, conceptList);
    }

    articleRhr.placeItems(items);

    // The RightHandRail supports multiple instances on a page
    // Here we're placing the overflow slots that didn't fit `articleRhr`
    const commentsRhr = new RightHandRail(
      document.querySelector("#comments-content")!,
      document.querySelector("#comments-rhr")!
    );
    commentsRhr.placeItems(items);
  } catch (err) {
    console.error(err);
  }
}

onDomReady.then(initRhr);
