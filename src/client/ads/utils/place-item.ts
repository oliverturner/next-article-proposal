export function atTop(
  item: Element | Node,
  regionsAvailable: HTMLDivElement[]
) {
  const firstRegion = regionsAvailable[0];
  const childNum = firstRegion.children.length;
  if (childNum <= 1) {
    return firstRegion.appendChild(item);
  }

  const secondChild = firstRegion.children.item(1);
  firstRegion.insertBefore(item, secondChild);
}

export function atMiddle(
  item: Element | Node,
  regionsAvailable: HTMLDivElement[]
) {
  let children: Element[] = [];
  for (const region of regionsAvailable) {
    children = children.concat(Array.from(region.children));
  }
  const childIndex = Math.floor(children.length / 2);
  const middleChild = children[childIndex];
  const parentRegion = middleChild.parentElement;

  if (middleChild === parentRegion?.firstElementChild) {
    parentRegion?.appendChild(item);
    } else {
    parentRegion?.insertBefore(item, middleChild);
  }
}

export function atBottom(
  item: Element | Node,
  regionsAvailable: HTMLDivElement[]
) {
  regionsAvailable.at(-1)?.appendChild(item);
}
