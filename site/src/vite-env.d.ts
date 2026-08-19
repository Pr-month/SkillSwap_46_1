// src/vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "swiper/css";
declare module "swiper/css/navigation";
