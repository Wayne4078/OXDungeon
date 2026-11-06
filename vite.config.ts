import { defineConfig } from "vite";

// 토스 빌드에서만 SDK 연결부(src/toss.ts)를 끼워 넣는다. 웹·아티팩트 빌드는 그대로.
const TOSS = process.env.VITE_TARGET === "toss";

export default defineConfig({
  plugins: [{
    name: "oxd-toss-bridge",
    transformIndexHtml: { order: "pre", handler: (html) => TOSS ? html.replace("</head>", `<script type="module" src="/src/toss.ts"></script>\n</head>`) : html },
  }],
  build: { assetsInlineLimit: 0 },
});
