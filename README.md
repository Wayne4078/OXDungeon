# OX 던전 — 생활 무림 편

매일 0시에 새로 열리는 21층 탑을 상식 OX 문제로 오르는 토스 미니게임. 아린플레이.

- 앱인토스: 앱 네임 `oxdungeon` (miniAppId 98095, 게임 > 퀴즈)
- 문제은행 정본: Supabase `ynhwgxvqabtgrhbhlccl` `public.questions` (파일 사본 금지)

## 구조
- `index.html` — 게임 전부(한 파일). 웹·아티팩트에서 그대로 돈다.
- `public/` — 그림(img, title), 소리(sound), 문제(data/questions.js, 자동 생성)
- `src/toss.ts` — 토스 다리 `window.OXToss` (광고·뒤로 가기·공유·랭킹·이벤트·햅틱·안전 영역). 토스 빌드에서만 끼워진다.
- `tools/build_questions.js` — Supabase 덤프 → `public/data/questions.js`
- `store/` — 콘솔 등록 그림(아이콘 600², 썸네일 1932×828, 세로 스크린샷 636×1048)
- `docs/기획서.md` — 기획·결정 기록

## 빌드
```
npm install
npm run build:toss   # dist/ + oxdungeon.ait
```
광고 지면 ID는 `src/toss.ts`의 `AD_GROUP_ID`.
