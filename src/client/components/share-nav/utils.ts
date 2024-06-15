import { FULLBLEED_MARGIN, NAV_STICKY_TOP } from "./index.ts";

export function getRootMargins(navRect: DOMRect) {
  function getNavRootMargin({ isSticky = false, margin = 0 } = {}) {
    const navTop = isSticky ? NAV_STICKY_TOP : navRect.top;
    const top = navTop * -1;
    const bottom = navTop + navRect.height - window.innerHeight;

    return `${top + margin}px 0px ${bottom + margin}px 0px`;
  }

  return {
    navSticky: getNavRootMargin({ isSticky: true }),
    fullbleedStatic: getNavRootMargin({ margin: FULLBLEED_MARGIN }),
    fullbleedSticky: getNavRootMargin({
      margin: FULLBLEED_MARGIN,
      isSticky: true,
    }),
  };
}

export function getFullbleedEls(contentEl: Element) {
  const fullbleedEls = [];
  const maxWidth = contentEl.getBoundingClientRect().width;
  for (const child of contentEl.children) {
    if (child.getBoundingClientRect().width > maxWidth) {
      fullbleedEls.push(child);
    }
  }

  return fullbleedEls;
}
