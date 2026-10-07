(() => {
  "use strict";

  if (window.__tvappPopupGuard) {
    return;
  }
  window.__tvappPopupGuard = true;

  const block = () => null;

  try {
    Object.defineProperty(window, "open", {
      configurable: true,
      writable: true,
      value: block,
    });
  } catch {
    try {
      window.open = block;
    } catch {
      // ignore
    }
  }

  setInterval(() => {
    try {
      if (window.open !== block) {
        Object.defineProperty(window, "open", {
          configurable: true,
          writable: true,
          value: block,
        });
      }
    } catch {
      // ignore
    }
  }, 250);

  window.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      const anchor = target && target.closest ? target.closest("a") : null;
      if (anchor && (anchor.target === "_blank" || anchor.target === "_top")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );

  const handshake = { type: "tvapp-popup-guard", version: 1 };
  const announce = () => {
    try {
      if (window.top !== window) {
        window.top.postMessage(handshake, "*");
      }
    } catch {
      // ignore
    }
  };
  announce();
  window.addEventListener("DOMContentLoaded", announce);
  let ticks = 0;
  const timer = setInterval(() => {
    announce();
    ticks += 1;
    if (ticks > 15) {
      clearInterval(timer);
    }
  }, 2000);
})();
