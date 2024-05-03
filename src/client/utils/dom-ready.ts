const isDomReady = () => ["complete"].includes(document.readyState);

export const onDomReady = new Promise<string>((resolve) => {
  if (isDomReady()) return resolve(document.readyState);

  function onStateChange() {
    if (isDomReady()) {
      document.removeEventListener("readystatechange", onStateChange);
      resolve(document.readyState);
    }
  }

  document.addEventListener("readystatechange", onStateChange);
});
