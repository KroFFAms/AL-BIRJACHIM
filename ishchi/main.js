// AL-BIRJACHIM Ishchi — 1-bosqich
// Firmalar bir marta ulanadi (har biri o'z alohida sessiyasida), keyin dastur ularning
// kabinetlaridan lotlarni o'zi yig'adi va AL-BIRJACHIM bazasiga yozadi.
// FAQAT O'QIYDI: taklif bermaydi, hech narsani tasdiqlamaydi.
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, net, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const BASE = 'https://kroffams.github.io/AL-BIRJACHIM/';
const PLAT = {
  xarid: { nom: 'xarid.uzex.uz', start: 'https://xarid.uzex.uz/provider/shop/rival-lots/0', host: /(^|\.)xarid\.uzex\.uz$/, ichi: /\/provider\//, js: 'yigish.js', st: '__BIRJA' },
  koop: { nom: 'cooperation.uz', start: 'https://cabinet.cooperation.uz/corporate/provider/e-shop/requests', host: /^cabinet\.cooperation\.uz$/, ichi: /e-shop\/requests/, js: 'koop.js', st: '__KOOP' },
};
// Brauzer sifatida ko'rinish (ba'zi saytlar "Electron" ni tanimaydi)
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

// ---------- Sozlamalar ----------
let CFG_FILE;
let cfg = { firmalar: [], ses: '', har: 60, avto: true, autostart: true };
function yukla() { try { cfg = Object.assign(cfg, JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'))); } catch (_) { /* birinchi ishga tushish */ } }
function saqla() { try { fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2)); } catch (e) { log('Sozlama saqlanmadi: ' + e.message); } }

// ---------- Jurnal ----------
const JURNAL = [];
function log(m) {
  const q = new Date().toLocaleString('ru-RU') + '  ' + m;
  JURNAL.push(q); if (JURNAL.length > 300) JURNAL.shift();
  send('jurnal', q);
}

let win = null, tray = null, ishlayapti = false, keyingi = 0, taymer = null;
function send(ch, d) { try { if (win && !win.isDestroyed()) win.webContents.send(ch, d); } catch (_) { /* */ } }
function holatYubor() { send('holat', { firmalar: cfg.firmalar, ses: !!cfg.ses, har: cfg.har, avto: cfg.avto, autostart: cfg.autostart, ishlayapti, keyingi }); }
function firma(id) { return cfg.firmalar.find((f) => f.id === id); }
function yangila(f, o) { Object.assign(f, o); saqla(); holatYubor(); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Firma oynasi (har firma — alohida sessiya: persist:<id>) ----------
const OYNA = {};
function firmaOynasi(f, korsat) {
  let w = OYNA[f.id];
  if (!w || w.isDestroyed()) {
    w = new BrowserWindow({
      width: 1300, height: 860, show: false, title: (f.nom || 'Firma') + ' — ' + PLAT[f.platforma].nom,
      autoHideMenuBar: true,
      webPreferences: { partition: 'persist:' + f.id, backgroundThrottling: false, contextIsolation: true, sandbox: true },
    });
    w.webContents.setUserAgent(UA);
    w.on('close', (e) => { if (!app.isQuitting) { e.preventDefault(); w.hide(); } });
    OYNA[f.id] = w;
  }
  if (korsat) { w.show(); w.focus(); }
  return w;
}
async function ochish(w, url) {
  try { await w.loadURL(url); } catch (_) { /* sahifa yo'naltirsa ham davom etamiz */ }
  await sleep(2500);
}
function ichkaridami(f, w) {
  try { const u = new URL(w.webContents.getURL()); const p = PLAT[f.platforma]; return p.host.test(u.host) && p.ichi.test(u.pathname) && !/login|auth|signin/i.test(u.href); } catch (_) { return false; }
}

// ---------- Kirish (foydalanuvchi E-IMZO bilan o'zi kiradi) ----------
async function kirish(id) {
  const f = firma(id); if (!f) return;
  const p = PLAT[f.platforma];
  const w = firmaOynasi(f, true);
  yangila(f, { holat: 'kirilmoqda' });
  await ochish(w, p.start);
  log((f.nom || 'Yangi firma') + ': kirish oynasi ochildi — kalitni tanlab, parolni kiriting');
  // 10 daqiqagacha kutamiz: foydalanuvchi kabinetga kirsa — davom
  for (let i = 0; i < 300; i++) {
    if (w.isDestroyed()) return;
    if (ichkaridami(f, w)) {
      log((f.nom || 'Yangi firma') + ': kabinetga kirildi');
      w.hide();
      yangila(f, { holat: 'tayyor' });
      await yigish(id); // birinchi yig'ish firma nomini ham aniqlaydi
      return;
    }
    // kabinetga kirgandan keyin bosh sahifaga tushsa — kerakli sahifaga o'tamiz
    try { const u = new URL(w.webContents.getURL()); if (p.host.test(u.host) && !/login|auth|signin|redirect/i.test(u.href) && !p.ichi.test(u.pathname) && i % 5 === 4) await ochish(w, p.start); } catch (_) { /* */ }
    await sleep(2000);
  }
  yangila(f, { holat: 'kirish kerak' });
}

// ---------- Yig'ish (mavjud AL-BIRJACHIM yig'uvchisi: yigish.js / koop.js) ----------
async function skriptOl(nom) {
  const r = await net.fetch(BASE + nom + '?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error(nom + ' yuklanmadi: HTTP ' + r.status);
  return await r.text();
}
async function yigish(id) {
  const f = firma(id); if (!f) return;
  const p = PLAT[f.platforma];
  const w = firmaOynasi(f, false);
  yangila(f, { holat: 'yig\'ilmoqda', bosqich: '' });
  try {
    await ochish(w, p.start);
    if (!ichkaridami(f, w)) { yangila(f, { holat: 'kirish kerak' }); log((f.nom || f.id) + ': sessiya tugagan — "Kirish" ni bosing'); return; }
    if (cfg.ses) await w.webContents.executeJavaScript('document.documentElement.dataset.birjachiSessiya=' + JSON.stringify(cfg.ses) + ';1');
    const js = await skriptOl(p.js);
    await w.webContents.executeJavaScript('window.' + p.st + '=undefined;' + js + '\n;1');
    const t0 = Date.now();
    let S = null;
    while (Date.now() - t0 < 25 * 60e3) {
      await sleep(3000);
      if (w.isDestroyed()) throw new Error('oyna yopildi');
      S = JSON.parse(await w.webContents.executeJavaScript('JSON.stringify(window.' + p.st + '||null)'));
      if (S && S.korxona && f.nom !== S.korxona) yangila(f, { nom: S.korxona });
      if (S && S.bosqich && S.bosqich !== f.bosqich) yangila(f, { bosqich: String(S.bosqich).slice(0, 60) });
      if (S && S.holat && S.holat !== 'ISHLAYAPTI') break;
    }
    if (!S || S.holat === 'ISHLAYAPTI') throw new Error('25 daqiqada tugamadi');
    if (S.holat === 'KIRISH_KERAK') { yangila(f, { holat: 'kirish kerak' }); log((f.nom || f.id) + ': kirish kerak'); return; }
    if (S.holat === 'XATO') throw new Error(S.xato || 'noma\'lum xato');
    const n = S.edokon_soni ?? S.soni ?? (S.natija && S.natija.edokon) ?? '';
    yangila(f, { holat: 'tayyor', oxirgi: new Date().toISOString(), xato: '', bosqich: '' });
    log((f.nom || f.id) + ': yig\'ildi' + (n !== '' ? ' (' + n + ' ta lot)' : ''));
  } catch (e) {
    yangila(f, { holat: 'xato', xato: String(e && e.message || e).slice(0, 200), bosqich: '' });
    log((f.nom || f.id) + ': XATO — ' + (e && e.message || e));
  }
}
async function hammasi() {
  if (ishlayapti) return;
  ishlayapti = true; holatYubor();
  log('Hamma firmalar yig\'ilmoqda…');
  for (const f of cfg.firmalar) { if (f.ochiq === false) continue; await yigish(f.id); }
  ishlayapti = false;
  rejala();
  log('Tayyor. Keyingi yig\'ish: ' + (cfg.avto ? new Date(keyingi).toLocaleTimeString('ru-RU') : 'avtomatik o\'chiq'));
}
function rejala() {
  clearTimeout(taymer);
  if (!cfg.avto) { keyingi = 0; holatYubor(); return; }
  const ms = Math.max(15, +cfg.har || 60) * 60e3;
  keyingi = Date.now() + ms; holatYubor();
  taymer = setTimeout(hammasi, ms);
}

// ---------- AL-BIRJACHIM akkauntiga ulash (sayt sessiyasi — lotlar sizning akkauntingizga bog'lanadi) ----------
async function saytgaUlash() {
  const w = new BrowserWindow({ width: 1100, height: 800, title: 'AL-BIRJACHIM — kirish', autoHideMenuBar: true, webPreferences: { partition: 'persist:sayt', contextIsolation: true, sandbox: true } });
  w.webContents.setUserAgent(UA);
  await ochish(w, BASE);
  log('AL-BIRJACHIM saytiga kiring (login/PIN yoki Telegram)');
  for (let i = 0; i < 300 && !w.isDestroyed(); i++) {
    try {
      const t = await w.webContents.executeJavaScript("localStorage.getItem('birjachim_sessiya')||''");
      if (t && t.length > 20) { cfg.ses = t; saqla(); holatYubor(); log('AL-BIRJACHIM akkauntiga ulandi'); w.destroy(); return; }
    } catch (_) { /* */ }
    await sleep(2000);
  }
}

// ---------- Oyna, tray, IPC ----------
function oyna() {
  win = new BrowserWindow({
    width: 980, height: 720, title: 'AL-BIRJACHIM Ishchi', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
  });
  win.loadFile(path.join(__dirname, 'ui', 'index.html'));
  win.on('close', (e) => { if (!app.isQuitting) { e.preventDefault(); win.hide(); } });
}
function trayQur() {
  const ic = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAQElEQVR4nO3OoQ0AIBRDQRZhNtZjS/AIBIKfNNfk6V7rY67KGgBAJOAcQCbgdgIAkAN4PQEAAADIAfwIAKAcsAEf+OCAiQDE/gAAAABJRU5ErkJggg==');
  tray = new Tray(ic);
  tray.setToolTip('AL-BIRJACHIM Ishchi');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Ochish', click: () => { win.show(); win.focus(); } },
    { label: 'Hozir yig\'ish', click: () => hammasi() },
    { type: 'separator' },
    { label: 'Chiqish', click: () => { app.isQuitting = true; app.quit(); } },
  ]));
  tray.on('click', () => { win.show(); win.focus(); });
}

ipcMain.handle('holat', () => { holatYubor(); return JURNAL.slice(-80); });
ipcMain.handle('qosh', async (_e, platforma) => {
  if (!PLAT[platforma]) return;
  const f = { id: 'f' + Date.now(), platforma, nom: '', holat: 'yangi', ochiq: true };
  cfg.firmalar.push(f); saqla(); holatYubor();
  kirish(f.id);
});
ipcMain.handle('kirish', (_e, id) => { kirish(id); });
ipcMain.handle('yigish', async (_e, id) => { if (!ishlayapti) await yigish(id); });
ipcMain.handle('hammasi', () => { hammasi(); });
ipcMain.handle('korsat', (_e, id) => { const f = firma(id); if (f) firmaOynasi(f, true); });
ipcMain.handle('ochiq', (_e, id, v) => { const f = firma(id); if (f) yangila(f, { ochiq: !!v }); });
ipcMain.handle('ochir', async (_e, id) => {
  const f = firma(id); if (!f) return;
  const r = await dialog.showMessageBox(win, { type: 'question', buttons: ['Bekor', 'O\'chirish'], defaultId: 0, message: '"' + (f.nom || 'Firma') + '" dasturdan olib tashlansinmi?', detail: 'Faqat shu dasturdagi ulanish o\'chadi. AL-BIRJACHIM saytidagi ma\'lumotlar o\'zgarmaydi.' });
  if (r.response !== 1) return;
  try { if (OYNA[f.id]) OYNA[f.id].destroy(); } catch (_) { /* */ }
  cfg.firmalar = cfg.firmalar.filter((x) => x.id !== id); saqla(); holatYubor();
});
ipcMain.handle('sayt', () => { saytgaUlash(); });
ipcMain.handle('sozla', (_e, o) => {
  if (o.har != null) cfg.har = Math.max(15, Math.min(720, +o.har || 60));
  if (o.avto != null) cfg.avto = !!o.avto;
  if (o.autostart != null) { cfg.autostart = !!o.autostart; try { app.setLoginItemSettings({ openAtLogin: cfg.autostart }); } catch (_) { /* */ } }
  saqla(); rejala();
});

// E-IMZO (127.0.0.1:64443) sertifikati — faqat shu lokal manzil uchun ruxsat
app.on('certificate-error', (e, _wc, url, _err, _cert, cb) => {
  try { const u = new URL(url); if ((u.hostname === '127.0.0.1' || u.hostname === 'localhost') && u.port === '64443') { e.preventDefault(); cb(true); return; } } catch (_) { /* */ }
  cb(false);
});

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });
  app.whenReady().then(() => {
    CFG_FILE = path.join(app.getPath('userData'), 'sozlama.json');
    yukla();
    try { app.setLoginItemSettings({ openAtLogin: cfg.autostart }); } catch (_) { /* */ }
    oyna(); trayQur();
    log('AL-BIRJACHIM Ishchi ishga tushdi. Firmalar: ' + cfg.firmalar.length);
    // Ishga tushgandan 1 daqiqa keyin birinchi yig'ish
    if (cfg.avto && cfg.firmalar.length) { keyingi = Date.now() + 60e3; taymer = setTimeout(hammasi, 60e3); }
    holatYubor();
  });
  app.on('window-all-closed', (e) => e.preventDefault());
}
