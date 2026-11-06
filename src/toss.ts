/**
 * OX 던전 ↔ 토스(앱인토스) 다리. @apps-in-toss/web-framework 3.8.0.
 * 토스 빌드(VITE_TARGET=toss)에서만 index.html에 끼워진다. 게임 코드는 window.OXToss 이름만 안다.
 * 바탕: OX퀴즈쇼 src/platform/toss.ts (토스 검수 통과본).
 */
import {
  Analytics,
  SafeArea,
  Screen,
  Share,
  graniteEvent,
  loadFullScreenAd,
  showFullScreenAd,
  generateHapticFeedback,
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore,
  type HapticFeedbackType,
} from "@apps-in-toss/web-framework";

/** 콘솔 > 광고 > 지면(보상형)에서 만든 광고 그룹 ID. 비어 있으면 광고 없이 동작(보상은 그냥 준다). */
const AD_GROUP_ID = "";
const APP_NAME = "oxdungeon";

/* 보상형 광고: 미리 불러두고(검수 항목), 보여준 뒤 다음 광고를 다시 불러둔다 */
let adLoaded = false, adLoading = false;
function preloadAd() {
  if (!AD_GROUP_ID || adLoaded || adLoading) return;
  try {
    if (!loadFullScreenAd.isSupported()) return;
    adLoading = true;
    loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (e) => { if (e.type === "loaded") { adLoaded = true; adLoading = false; } },
      onError: () => { adLoading = false; },
    });
  } catch { adLoading = false; }
}

type AdResult = "rewarded" | "skipped" | "notReady" | "unavailable";
function showAd(): Promise<AdResult> {
  return new Promise((resolve) => {
    try {
      if (!AD_GROUP_ID || !showFullScreenAd.isSupported()) { resolve("unavailable"); return; }
      if (!adLoaded) { preloadAd(); resolve("notReady"); return; }
      adLoaded = false;
      let earned = false, done = false;
      const end = (r: AdResult) => { if (done) return; done = true; resolve(r); preloadAd(); };
      showFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (e) => {
          if (e.type === "userEarnedReward") earned = true;
          else if (e.type === "dismissed") end(earned ? "rewarded" : "skipped");
          else if (e.type === "failedToShow") end("unavailable");
        },
        onError: () => end("unavailable"),
      });
    } catch { resolve("unavailable"); }
  });
}

const HAPTIC: Record<string, HapticFeedbackType> = {
  tap: "tap", correct: "success", wrong: "error", big: "confetti", heavy: "basicMedium",
};

const flat = (ev: Record<string, unknown> = {}) => {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(ev)) {
    if (v == null) continue;
    out[k] = typeof v === "object" ? JSON.stringify(v).slice(0, 200) : (v as string | number | boolean);
  }
  return out;
};

// 노치·토스 위쪽 바를 피하는 안전 영역(검수 필수) → CSS 변수
try {
  const apply = (i: { top: number; right: number; bottom: number; left: number }) => {
    const r = document.documentElement.style;
    r.setProperty("--sa-top", `${i.top}px`); r.setProperty("--sa-right", `${i.right}px`);
    r.setProperty("--sa-bottom", `${i.bottom}px`); r.setProperty("--sa-left", `${i.left}px`);
  };
  apply(SafeArea.get()); SafeArea.subscribe({ onEvent: apply });
} catch { /* 지원 안 하면 env() 값 */ }

(globalThis as any).OXToss = {
  platform: "toss",
  preloadAd,
  showAd,
  onBack(handler: () => void) {
    try { graniteEvent.addEventListener("backEvent", { onEvent: handler }); } catch { /* 무시 */ }
  },
  close() { Screen.close().catch(() => {}); },
  haptic(kind: string) { const t = HAPTIC[kind]; if (t) generateHapticFeedback({ type: t }).catch(() => {}); },
  log(name: string, ev?: Record<string, unknown>) {
    try { Analytics.log({ log_name: name, log_type: "event", params: flat(ev) }).catch(() => {}); } catch { /* 무시 */ }
  },
  async share({ text, params }: { text: string; params?: Record<string, string> }) {
    try {
      const q = new URLSearchParams({ utm_source: "share", ...(params ?? {}) }).toString();
      let link = "";
      try { link = await Share.createLink({ path: `intoss://${APP_NAME}?${q}` }); } catch { /* 링크 없이 */ }
      await Share.sendMessage({ message: link ? `${text}\n${link}` : text });
      return "shared";
    } catch { return "failed"; }
  },
  hasLeaderboard() { try { return openGameCenterLeaderboard.isSupported(); } catch { return false; } },
  async openLeaderboard() { try { if (openGameCenterLeaderboard.isSupported()) await openGameCenterLeaderboard(); } catch { /* 무시 */ } },
  async submitScore(score: number) {
    // 플레이가 끝난 뒤에만 제출(게임 프로필 생성 전 제출은 에러). 점수는 정수 문자열.
    try {
      if (!submitGameCenterLeaderBoardScore.isSupported() || !(score > 0)) return;
      const r = await submitGameCenterLeaderBoardScore({ score: String(Math.floor(score)) });
      if (r && r.statusCode !== "SUCCESS") console.warn("leaderboard:", r.statusCode);
    } catch { /* 무시 */ }
  },
};
preloadAd();
