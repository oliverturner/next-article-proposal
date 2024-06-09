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
function configureSlots(slots: HTMLElement[], isFullWidth = false) {
  for (const slot of slots) {
    slot.dataset.configKey = isFullWidth ? "rhr-fullbleed" : "rhr";
  }
  return slots;
}

function runOtherCode() {
  const getItem = () => {
    const el = document.createElement("div");
    el.className = "custom-widget";
    return el;
  };

  const insertItem = (rhr: RightHandRail) => {
    rhr.placeItem({
      item: getItem(),
      requiredH: 300,
      placement: "top",
    });
  };

  const articleRhrEl = document.querySelector<
    Element & { cmd?: ((rhr: RightHandRail) => void)[] }
  >("#article-rhr")!;

  articleRhrEl.cmd ??= [insertItem];
  articleRhrEl.cmd.push(insertItem);
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

    const articleRhr = new RightHandRail("article", {
      groupsEl: articleContentEl,
      rhrEl: articleRhrEl,
    });
    const slotEls = configureSlots(createSlots(4), articleRhr.isIntersected);

    // If there's no fullbleed content then add the desktop Concept List
    // into the items to be placed in the RHR
    if (articleRhr.isIntersected === false) {
      slotEls.splice(1, 0, conceptListEl);
    }
    articleRhr.placeSlots(slotEls);

    // The RightHandRail component supports multiple instances
    const commentsRhr = new RightHandRail("comments", {
      groupsEl: document.querySelector("#comments-content")!,
      rhrEl: document.querySelector("#comments-rhr")!,
    });

    // Here we place the slots that didn't fit `articleRhr` into `commentsRhr`
    // We also update them to allow 600px MPUs: `commentsRhr.isIntersected` is false
    commentsRhr.placeSlots(configureSlots(slotEls));
  } catch (err) {
    console.error(err);
  }
}

onDomReady.then(() => {
  runOtherCode();
  runDemo();
});
