function resizeImages() {
  const elsA = document.querySelectorAll(
    "[src='https://placehold.co/800x400']"
  );
  const elsB = document.querySelectorAll(
    "[src='https://placehold.co/2000x400']"
  );
  let counter = 0;

  return () => {
    const h = counter++ % 2 === 0 ? 600 : 400;
    for (const el of elsA) {
      el.setAttribute("src", `https://placehold.co/800x${h}`);
    }
    for (const el of elsB) {
      el.setAttribute("src", `https://placehold.co/2000x${h}`);
    }
  };
}

function initControls({
  toggleTopperBtn,
  toggleImgBtn,
  toggleZoomBtn,
  toggleGridFlexBtn,
  insertItemBtn,
  increaseInitialItemsBtn,
  demoEl,
}: Record<string, Element>) {
  const onResize = resizeImages();
  toggleImgBtn?.addEventListener("click", onResize);

  toggleZoomBtn?.addEventListener("click", () => {
    const zoomed = demoEl?.classList.toggle("demo--zoomed");
    toggleZoomBtn.textContent = zoomed ? "Zoom In" : "Zoom Out";
  });

  toggleTopperBtn?.addEventListener("click", () => {
    document.body.classList.toggle("no-topper");
  });

  toggleGridFlexBtn?.addEventListener("click", () => {
    document.querySelectorAll('.rhr-region').forEach((el) => {
      if (el.classList.contains('rhr-region-flex')) {
        el.classList.remove('rhr-region-flex');
        el.classList.add('rhr-region-grid');
      } else {
        el.classList.remove('rhr-region-grid');
        el.classList.add('rhr-region-flex');
      }
    });
  });

  insertItemBtn?.addEventListener("click", () => {
    const slot = document.createElement("pg-slot");
    slot.innerHTML = `<span>Sorry I'm late!</span>`;

    // @ts-ignore
    window.articleRhr.appendItem(slot)
  });

  increaseInitialItemsBtn.querySelector('.demo-controls__num-items')!.textContent
    = new URLSearchParams(document.location.search).get("numItems") ?? "2";

  increaseInitialItemsBtn?.addEventListener("click", () => {
    const numItems = parseInt(new URLSearchParams(document.location.search).get("numItems") ?? "2");
    document.location.replace(`?numItems=${(numItems % 4) + 1}`);
  });
}


initControls({
  demoEl: document.querySelector(".demo")!,
  toggleTopperBtn: document.querySelector("[data-click='toggleTopper']")!,
  toggleImgBtn: document.querySelector("[data-click='toggleImages']")!,
  toggleZoomBtn: document.querySelector("[data-click='toggleZoom']")!,
  toggleGridFlexBtn: document.querySelector("[data-click='toggleGridFlex']")!,
  insertItemBtn: document.querySelector("[data-click='insertNewItem']")!,
  increaseInitialItemsBtn: document.querySelector("[data-click='increaseInitialItems']")!,
});
