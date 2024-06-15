export function debounce(fn: Function, ms: number) {
  let timeout: number;

  return function (this: Function) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), ms);
  };
}
