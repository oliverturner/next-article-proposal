function resizeImages() {
  const elsA = document.querySelectorAll("[src='https://placehold.co/800x400']");
  const elsB = document.querySelectorAll("[src='https://placehold.co/2000x400']");
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

function initControls({ toggleImgBtn, toggleZoomBtn, demoEl }: Record<string, Element>) {
  const onResize = resizeImages();
  toggleImgBtn?.addEventListener("click", onResize);

  toggleZoomBtn?.addEventListener("click", () => {
    const zoomed = demoEl?.classList.toggle("demo--zoomed");
    toggleZoomBtn.textContent = zoomed ? "Zoom In" : "Zoom Out";
  });
}

initControls({
  demoEl: document.querySelector(".demo")!,
  toggleImgBtn: document.querySelector("[data-click='toggleImages']")!,
  toggleZoomBtn: document.querySelector("[data-click='toggleZoom']")!,
});
