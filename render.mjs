// Render the watercolor short to video/animation.mp4 at a true 30 FPS using your
// system Chrome + WebCodecs (deterministic frame-by-frame — no ffmpeg, no Chromium download).
//   npm install    (once)
//   npm run render
import puppeteer from 'puppeteer-core';
import fs from 'fs'; import path from 'path'; import url from 'url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const videoDir = path.join(here, 'video');
const renderHtml = path.join(videoDir, 'anim-render.html');
const target = path.join(videoDir, 'animation.mp4');

function findChrome() {
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;
  const guesses = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  ].filter(Boolean);
  for (const g of guesses) { try { if (fs.existsSync(g)) return g; } catch (e) {} }
  throw new Error('Chrome not found. Set the CHROME env var to your chrome.exe path.');
}

const CHROME = findChrome();
console.log('Chrome:', CHROME);
try { if (fs.existsSync(target)) fs.rmSync(target); } catch (e) {}

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', protocolTimeout: 600000,
  args: [
    '--autoplay-policy=no-user-gesture-required', '--disable-dev-shm-usage',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', '--window-size=1360,860', '--allow-file-access-from-files',
  ],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1320, height: 800, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: videoDir });

  const fileUrl = url.pathToFileURL(renderHtml).href;
  console.log('Opening', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 });
  await page.bringToFront();
  await page.waitForFunction('window.__ready===true && typeof window.__render==="function" && !!window.Mp4Muxer && !!window.VideoEncoder', { timeout: 60000 });

  console.log('Rendering 600 frames @ 30 FPS (WebCodecs)…');
  const res = await page.evaluate(async () => await window.__render());
  console.log('Encoded:', res);
  await page.evaluate(() => {
    const blob = new Blob([window.__lastBytes], { type: 'video/mp4' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'animation.mp4';
    document.body.appendChild(a); a.click(); a.remove();
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    if (fs.existsSync(target) && fs.statSync(target).size > 0) { const s = fs.statSync(target).size; await new Promise(r => setTimeout(r, 700)); if (fs.statSync(target).size === s) break; }
    await new Promise(r => setTimeout(r, 500));
  }
  if (fs.existsSync(target) && fs.statSync(target).size > 0) console.log('OK wrote video/animation.mp4 —', fs.statSync(target).size, 'bytes');
  else { console.error('FAILED: no output file.'); process.exitCode = 1; }
} finally { await browser.close(); }
