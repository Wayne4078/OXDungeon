// OX 던전 문제은행 빌드 — 정본은 Supabase(ynhwgxvqabtgrhbhlccl) public.questions 하나뿐.
// 1) Supabase에서 아래 SQL 결과(JSON)를 받아 dump 파일로 저장
//    select json_agg(json_build_object('id',id,'f',fact_id,'cat',category,'t',topic,'q',text,'a',answer,
//      'e',explanation,'h',hint,'s',status,'d',difficulty,'src',source) order by id) as rows from public.questions;
// 2) node tools/build_questions.js <dump> [--flips=review|live]  → data/questions.js
// 규칙: 원문항은 status=live만. 뒤집은 문제(-R)는 원문항이 live일 때만, 기본은 review까지 허용(출시 빌드는 --flips=live).
const fs = require('fs'), path = require('path');
const dump = process.argv[2]; if(!dump){ console.error('usage: build_questions.js <dump>'); process.exit(1); }
const flipMode = (process.argv.find(a=>a.startsWith('--flips='))||'--flips=review').split('=')[1];
let raw = fs.readFileSync(dump,'utf8');
try{ const o = JSON.parse(raw); if(o && typeof o.result==='string') raw = o.result; }catch(e){}
const s = raw.indexOf('[{'), e = raw.lastIndexOf('}]');
const rows = JSON.parse(raw.slice(s, e+2))[0].rows;
const CODES = ['AN','BD','FD','LF','MN','SC'];
const byId = Object.fromEntries(rows.map(r=>[r.id,r]));
const out = [], stat = {live:0, flips:0, noflip:[], skipped:{}};
for(const r of rows){
  if(r.id.endsWith('-R')) continue;
  const c = r.id.slice(0,2);
  if(r.s!=='live' || !CODES.includes(c) || !r.d){ stat.skipped[r.s+'/'+c]=(stat.skipped[r.s+'/'+c]||0)+1; continue; }
  const x = {id:r.id, c, d:r.d, q:r.q, a:r.a, e:r.e||'', h:r.h||'', f:r.f};
  const fl = byId[r.id+'-R'];
  const ok = fl && fl.f===r.f && fl.a!==r.a && (fl.s==='live' || (flipMode==='review' && fl.s==='review'));
  if(ok){ x.fq=fl.q; x.fa=fl.a; x.fe=fl.e||x.e; x.fh=fl.h||x.h; stat.flips++; } else stat.noflip.push(r.id);
  out.push(x); stat.live++;
}
const dest = path.join(__dirname,'..','data','questions.js');
fs.writeFileSync(dest, '// 자동 생성 — 손으로 고치지 말 것. 정본: Supabase public.questions ('+new Date().toISOString().slice(0,10)+', flips='+flipMode+')\nwindow.OXQ='+JSON.stringify(out)+';\n');
const per = {}; out.forEach(x=>{ const k=x.c+x.d; per[k]=(per[k]||0)+1; });
console.log(JSON.stringify({live:stat.live, flips:stat.flips, noflip:stat.noflip.length, skipped:stat.skipped, per}, null, 0));
console.log('noflip:', stat.noflip.join(' '));
