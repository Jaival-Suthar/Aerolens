import "@testing-library/jest-dom";

/** pdfjs-dist (e.g. JobProfileNew) expects browser APIs missing in jsdom */
if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as unknown as { DOMMatrix: unknown }).DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}
