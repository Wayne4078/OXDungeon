import { defineConfig } from "@apps-in-toss/web-framework/config";

/** 앱인토스 콘솔에 등록한 앱 정보. appName은 콘솔의 '앱 네임'과 반드시 같아야 한다(한 번 정하면 못 바꿈). */
export default defineConfig({
  appName: "oxdungeon",
  brand: {
    primaryColor: "#8E1B10", // 붉은 옻칠
  },
  permissions: [],
  webBundleDir: "dist",
});
