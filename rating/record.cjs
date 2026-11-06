// 등급분류 제출용 진행 영상: 실제 게임을 사람처럼 눌러 가며 주요 장면을 모두 담는다.
const { chromium } = require('playwright');
const W=412, H=732, OUT=__dirname+'/video';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, recordVideo:{dir:OUT, size:{width:W*2,height:H*2}}});
  const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:8765/index.html'); await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('arinfb:oxdungeon:asked','1');});
  await p.reload(); await sleep(3500);                                   // 첫 화면
  await p.click('.tstart'); await sleep(3000);                             // 입구(오늘의 고수)
  await p.click('#btn-start'); await sleep(2500);
  const tap = async (right)=>{ const a = await p.evaluate(()=>currentQ().a); const pick = right ? a : (a==='O'?'X':'O');
    await sleep(2200); await p.click(`button[onclick="answer('${pick}')"]`); await sleep(2600); await p.click('#r-next'); await sleep(1500); };
  await tap(true); await tap(false); await tap(true); await tap(true);  // 일반층: 맞힘·틀림(방패)·맞힘
  // 7층 고수의 방
  await p.evaluate(()=>{ for(let i=0;i<6;i++) D.floors[i].cleared=true; R.floor=7; save(); renderBattle(); }); await sleep(4500);
  await p.evaluate(()=>closeCurtain()); await sleep(1500);
  const bossTap = async ()=>{ const a = await p.evaluate(()=>currentQ().a); await sleep(2200); await p.click(`button[onclick="answer('${a}')"]`); await sleep(2600);
    const nx = await p.$('#r-next'); if(nx && await nx.isVisible()) { await p.click('#r-next'); await sleep(1200); } };
  for(let i=0;i<5;i++){ const done = await p.evaluate(()=>D.floors[6].cleared); if(done) break;
    const en = await p.evaluate(()=>!document.querySelector('button[onclick="answer(\'O\')"]').disabled); if(!en){ await sleep(800); continue; } await bossTap(); }
  await sleep(4500);
  if(await p.evaluate(()=>$('win').classList.contains('on'))){ await p.evaluate(()=>afterWin()); await sleep(2500); }
  // 잠깐 쉬기
  if(await p.evaluate(()=>$('s-battle').classList.contains('on'))){ await p.evaluate(()=>openPause()); await sleep(2500); await p.evaluate(()=>closePause()); await sleep(1000); }
  // 쓰러짐과 한 번 더(광고 자리)
  if(await p.evaluate(()=>$('s-battle').classList.contains('on'))){
    await p.evaluate(()=>{ R.shields=0; save(); renderBattle(); }); await sleep(800);
    const a = await p.evaluate(()=>currentQ().a); await sleep(1500); await p.click(`button[onclick="answer('${a==='O'?'X':'O'}')"]`); await sleep(2800);
    await p.click('#r-next'); await sleep(3000); await p.click('#d-revive'); await sleep(6500); }
  // 등정 화면과 자랑 카드
  await p.evaluate(()=>{ D.floors.forEach(f=>f.cleared=true); D.conquered=true; D.conqueredRun=2; R=null; save(); addMerit(4); show('s-clear'); renderClear(); });
  await sleep(4000); await p.evaluate(()=>openCard()); await sleep(4500);
  await ctx.close(); await b.close();
})();
