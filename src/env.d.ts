/// <reference types="wxt/vite-builder-env" />

declare module "*.css" {
  const css: string;
  export default css;
}

declare module "*.html?raw" {
  const html: string;
  export default html;
}
