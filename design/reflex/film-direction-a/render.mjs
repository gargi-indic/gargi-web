import puppeteer from 'puppeteer-core';
import fs from 'fs';
const mode = process.argv[2] || 'stills'; // stills | frames
const FPS = 30;
const b = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true, args:['--hide-scrollbars']});
const p = await b.newPage();
await p.setViewport({width:1920,height:1125,deviceScaleFactor:1});
await p.goto('http://127.0.0.1:8765/film.html',{waitUntil:'networkidle0',timeout:90000});
await p.waitForSelector('[data-om-exportable-video-with-duration-secs]',{timeout:60000});
await p.evaluate(()=>document.fonts.ready);
const seek = t => p.evaluate(t=>{const e=document.querySelector('[data-om-exportable-video-with-duration-secs]'); e.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame',{detail:{time:t,sync:true}}));},t);
await seek(0); await new Promise(r=>setTimeout(r,500));
const r = await p.evaluate(()=>{const x=document.querySelector('[data-om-exportable-video-with-duration-secs]').getBoundingClientRect(); return {x:x.x,y:x.y,width:x.width,height:x.height}});
console.log('stage', JSON.stringify(r));
const clip = {x:r.x, y:r.y, width:r.width, height:r.height};
if (mode==='stills') {
  fs.mkdirSync('stills',{recursive:true});
  for (const t of [4,10,19,31,40,46,55,64]) { await seek(t); await p.screenshot({path:`stills/t${t}.jpg`, clip, type:'jpeg', quality:80}); }
} else {
  const { spawn } = await import('child_process');
  const ff = spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-c:v','libx264','-preset','slow','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','film.mp4'],{stdio:['pipe','inherit','inherit']});
  const done = new Promise(r=>ff.on('close',r));
  const dur = 66.5, n = Math.round(dur*FPS);
  for (let i=0;i<n;i++){ await seek(i/FPS); const buf = await p.screenshot({clip, type:'jpeg', quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i===1860) fs.writeFileSync('film-poster.jpg', buf); if(i%300===0) console.log('frame',i,'/',n); }
  ff.stdin.end(); console.log('ffmpeg exit', await done);
}
await b.close();
