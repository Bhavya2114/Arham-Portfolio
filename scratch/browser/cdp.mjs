// Minimal CDP helper for headless Chrome (browser checks in this folder). Chrome path below is the Windows default.
import { spawn } from 'node:child_process';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export const S = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(port = 9333) {
  const proc = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(S, 'chrome-prof')}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--window-size=1280,900', 'about:blank',
  ], { stdio: 'ignore' });
  let ws; let nextId = 1; const pending = new Map(); const listeners = [];
  for (let i = 0; i < 60; i++) {
    try {
      const v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
      break;
    } catch { await sleep(200); }
  }
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`)); else p.resolve(msg.result);
    } else listeners.forEach((fn) => fn(msg));
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject, method });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const newPage = async ({ width, height, dpr, mobile }) => {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    await s('Page.enable'); await s('Runtime.enable');
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
    const evaluate = async (expr) => {
      const r = await s('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails)).slice(0, 600));
      return r.result.value;
    };
    return { s, sessionId, targetId, evaluate, close: () => send('Target.closeTarget', { targetId }) };
  };
  return { send, on: (fn) => listeners.push(fn), newPage, kill: () => proc.kill() };
}

// Page helpers: wait for the map, scroll it into view, wait for a fully settled still map.
export async function openPresence(page, url) {
  await page.s('Page.navigate', { url });
  for (let i = 0; i < 80; i++) { await sleep(150); if (await page.evaluate(`!!document.getElementById('IN-RJ')`).catch(() => false)) break; }
  await sleep(600);
  await page.evaluate(`document.documentElement.style.scrollBehavior='auto'; true`);
}
export const settled = (page) => page.evaluate(`(async () => {
  const svg = () => document.querySelector('svg[aria-label^="Map of India high"]');
  let last = null, stable = 0;
  for (let i = 0; i < 200; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    const vb = svg().getAttribute('viewBox');
    stable = vb === last ? stable + 1 : 0; last = vb;
    if (stable > 10) break;
  }
  await new Promise((r) => setTimeout(r, 700)); // glow / district fades finish
  return true; })()`);
