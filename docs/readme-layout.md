# Refactoring layout

The current grid layout manages both columns and rows via a complex `grid-areas` definition:

```css
grid-template-areas:
  "lhr . image            . rhr-top"
  "lhr . content          . rhr-top"
  "lhr . content          . rhr-bottom"
  ".   . tools            . rhr-bottom"
  "more-articles more-articles more-articles more-articles more-articles"
  ".   . onward           . onward-rhr"
  ".   . second-onward    . onward-rhr"
  ".   . promoted-content . ."
  ".   . comments         . comments-rhr";
```

A proposed refactor is the "unified RHR": taking advantage of the inherent stacking behaviour of block-level elements, and avoiding splitting `rhr` elements, the result is a simple, reusable three column grid component:

```css
grid-template-areas: "lhr . content . rhr";
```

The reason that the RHR is split into `rhr-top` and `rhr-bottom` at present is so that the Concept List can appear beside the article content on desktop, but below it on mobile, or when an article contains fullbleed elements.

The refactor achieves this by rendering the component in two places and showing one or the other as appropriate:

```html
<div data-article-type="full-width-graphics">
  <!-- Most elements can simply stack: no need to micromanage them -->
  <div id="n-exponea-top-slot"></div>
  <div class="topper"></div>

  <div class="grid">
    <div class="grid__lhr"></div>
    <div class="grid__content article">
      <div class="article__content"></div>
    </div>
    <div class="grid__rhr">
      <!-- Shown on desktop unless there's fullbleed content -->
      <div class="concepts"></div>
    </div>
  </div>

  <div class="grid">
    <div class="grid__content">
      <div class="onward"></div>
      <!-- Shown on mobile and on desktop when there's fullbleed content -->
      <div class="concepts"></div>
    </div>
    <div class="grid__rhr"></div>
  </div>

  <div class="grid">
    <div class="grid__content comments">...</div>
    <div class="grid__rhr"></div>
  </div>
</div>
```

The CSS uses a "reverse selector" (the trailing `&`) to set `display` values based on its location in the DOM and whether an ancestor's data-attribute value matches. This colocates the display logic within the component itself:

```scss
.concepts {
  .grid__rhr & {
    display: var(--_rhr, none);
  }
  .grid__content & {
    display: var(--_content, block);
  }

  @media (min-width: 980px) {
    --_rhr: block;
    --_content: none;

    [data-article-type="full-width-graphics"] & {
      --_rhr: none;
      --_content: block;
    }
  }
}
```

### Relevant files

- [`src/styles/article.css`](../src/styles/article.css)
- The contents of `src/pages` for mark-up
