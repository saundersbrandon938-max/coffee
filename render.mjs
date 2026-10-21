// Render video/anim-render.html to video/animation.mp4 (or .webm) using your
// system Chrome via puppeteer-core — no ffmpeg, no Chromium download.
//   npm install    (once)
//   npm run render
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import url from 'url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const videoDir = path.join(here, 'video');
const renderHtml = path.join(videoDir, 'anim-render.html');

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

// clean previous outputs
for (const f of ['animation.mp4', 'animation.webm']) {
  const p = path.join(videoDir, f);
  try { if (fs.existsSync(p)) fs.rmSync(p); } catch (e) {}
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  protocolTimeout: 180000,
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-dev-shm-usage',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--window-size=1300,820',
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: videoDir });

  const fileUrl = url.pathToFileURL(renderHtml).href;
  console.log('Opening', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 });
  await page.bringToFront();
  await page.waitForFunction('window.__ready===true && typeof window.seek==="function"', { timeout: 60000 });

  console.log('Recording ~20s (building plates first)…');
  const res = await page.evaluate(async () => {
    const r = await window.__render();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(window.__lastBlob);
    a.download = 'animation.' + r.ext;
    document.body.appendChild(a); a.click(); a.remove();
    return r;
  });
  console.log('Recorded:', res);

  const target = path.join(videoDir, 'animation.' + res.ext);
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) {
    if (fs.existsSync(target) && fs.statSync(target).size > 0) {
      const s1 = fs.statSync(target).size;
      await new Promise(r => setTimeout(r, 600));
      if (fs.statSync(target).size === s1) break; // stopped growing
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (fs.existsSync(target) && fs.statSync(target).size > 0) {
    console.log('OK wrote video/animation.' + res.ext, '—', fs.statSync(target).size, 'bytes, type', res.type);
  } else {
    console.error('FAILED: no output file produced.');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
