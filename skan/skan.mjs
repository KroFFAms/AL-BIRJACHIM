// AL-BIRJACHIM: yangi e-do'kon lotlarini o'qib, AL-BIRJACHIM serveriga yuboradi (GitHub Actions'da ishlaydi)
const API = 'https://dbdtnujcospnsuwwazbs.supabase.co/functions/v1/birja';
const SHOP = 'https://xarid-api-shop.uzex.uz/Common';
const KALIT = process.env.SKAN_KALIT || '';
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36', 'Accept': 'application/json, text/plain, */*', 'Origin': 'https://xarid.uzex.uz', 'Referer': 'https://xarid.uzex.uz/' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function J(url, o = {}, ms = 20000) {
  const r = await fetch(url, { ...o, headers: { ...UA, ...(o.headers || {}) }, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
async function bitimlar(kod) {
  const B = new Map();
  for (let f = 1, k = 0; k < 3; f += 11, k++) {
    let a; try { a = await J(SHOP + '/GetCompletedDeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: f, to: f + 12, display_on_shop: 1, display_on_national: 0, year_id: new Date().getFullYear(), product_code: kod }) }); } catch (e) { break; }
    if (!Array.isArray(a) || !a.length) break;
    a.forEach(x => B.set(x.deal_id, x)); if (B.size >= (a[0].total_count || 0)) break;
    await sleep(300);
  }
  const L = [...B.values()], cheg = Date.now() - 90 * 864e5;
  const np = L.filter(x => new Date(x.deal_date) >= cheg && x.amount > 0 && x.deal_cost > 0).map(x => x.deal_cost / x.amount).sort((a, b) => a - b);
  const gol = {};
  for (const x of L) { const k = x.provider_inn || x.provider_name; if (!k) continue; const o = gol[k] || (gol[k] = { i: x.provider_inn || '', n: String(x.provider_name || '').replace(/\s+/g, ' ').slice(0, 80), c: 0, p: [], o: '' }); o.c++; if (x.amount > 0 && x.deal_cost > 0) o.p.push(x.deal_cost / x.amount); if (x.deal_date > o.o) o.o = x.deal_date; }
  const g = Object.values(gol).sort((a, b) => b.c - a.c).slice(0, 3).map(o => { const q = o.p.sort((a, b) => a - b); return [o.i, o.n, o.c, q.length ? Math.round(q[Math.floor(q.length / 2)]) : 0, String(o.o).slice(0, 10), 0]; });
  return { n: np.length, p: np.length ? [Math.round(np[0]), Math.round(np[np.length - 1]), Math.round(np[Math.floor(np.length / 2)])] : null, g };
}
// ---- Tugagan takliflarimiz natijasi (yutdik / yutmadik) — ochiq "Amalga oshgan bitimlar" dan ----
const norm = x => String(x || '').toUpperCase().replace(/["'«»‘’`ʻʼ.]/g, '').replace(/(^|\s)(MCHJ|МЧЖ|OOO|ООО|XK|AJ|MAS'?ULIYATI CHEKLANGAN JAMIYAT)(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
const biz = (n, korxona) => { const a = norm(n), b = norm(korxona); return a.length > 5 && b.length > 5 && (a.startsWith(b) || b.startsWith(a)); };
async function natijalar(t0) {
  let kut; try { kut = await J(API + '?kutilayotgan_hammasi=1', { headers: { 'x-skan-kalit': KALIT } }); } catch (e) { console.log('natija: ro\'yxat olinmadi', String(e).slice(0, 120)); return; }
  if (!Array.isArray(kut) || !kut.length) { console.log('natija: kutilayotgan taklif yo\'q'); return; }
  const tugadi = () => Date.now() - t0 > 10.5 * 60e3;
  const lotKod = {}, sahifa = {}, chiq = [];
  const bet = async (kod, yil, f) => { const k = kod + '|' + yil + '|' + f; if (!(k in sahifa)) { try { sahifa[k] = await J(SHOP + '/GetCompletedDeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: f, to: f + 12, display_on_shop: 1, display_on_national: 0, year_id: yil, product_code: kod }) }); } catch (e) { sahifa[k] = null; } await sleep(250); } return sahifa[k]; };
  for (const t of kut) {
    if (tugadi()) break;
    try {
      const id = String(t.lot).slice(-7);
      if (!(id in lotKod)) { try { const g = await J(SHOP + '/GetLot/' + id); lotKod[id] = g && g.product_code || null; } catch (e) { lotKod[id] = null; } await sleep(200); }
      const kod = lotKod[id]; if (!kod) continue;
      const yil = new Date(t.tugash).getFullYear(), chegara = new Date(t.tugash).getTime() - 864e5;
      let found = null;
      for (let f = 1; f <= 11 * 25 && !found && !tugadi(); f += 11) {
        const a = await bet(kod, yil, f);
        if (!Array.isArray(a) || !a.length) break;
        found = a.find(x => String(x.lot_display_no) === String(t.lot));
        if (!found && new Date(a[a.length - 1].deal_date).getTime() < chegara) break;
      }
      if (found) chiq.push({ korxona: t.korxona, lot: t.lot, holat: biz(found.provider_name, t.korxona) ? 'yutdi' : 'yutqazdi', golib: found.provider_name, golib_stir: found.provider_inn,
        shartnoma_summa: found.deal_cost, dona_narx: found.amount ? found.deal_cost / found.amount : found.deal_cost, ishtirokchilar: found.pcp_count,
        buyurtmachi: found.customer_name, buyurtmachi_stir: found.customer_inn, bitim_sana: found.deal_date });
      else chiq.push({ korxona: t.korxona, lot: t.lot, holat: 'kutilmoqda' });
    } catch (e) { }
  }
  const tayyor = chiq.filter(x => x.holat !== 'kutilmoqda').length;
  console.log('natija: tekshirildi ' + chiq.length + '/' + kut.length + ', aniqlandi ' + tayyor);
  for (let i = 0; i < chiq.length; i += 100) {
    try { const r = await J(API + '?natija=1', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-skan-kalit': KALIT }, body: JSON.stringify({ natijalar: chiq.slice(i, i + 100) }) }, 120000); console.log('natija →', JSON.stringify(r)); }
    catch (e) { console.log('natija yozilmadi', String(e).slice(0, 120)); }
  }
}
(async () => {
  if (KALIT.length < 16) { console.error('SKAN_KALIT secret qo\'yilmagan'); process.exit(1); }
  const st = await J(API + '?skan_holat=1', { headers: { 'x-skan-kalit': KALIT } });
  const oxirgi = Number(st.oxirgi) || 0; if (!oxirgi) { console.log('boshlanmagan'); await natijalar(Date.now()); return; }
  const lotlar = []; let id = oxirgi + 1, bosh = 0, eng = oxirgi, xato = 0; const t0 = Date.now();
  while (bosh < 80 && id - oxirgi <= 600 && Date.now() - t0 < 6 * 60e3) {
    const ids = [id, id + 1, id + 2, id + 3]; id += 4;
    const res = await Promise.all(ids.map(async i => { try { const g = await J(SHOP + '/GetLot/' + i); return g && g.lot_display_no ? { ...g, __id: i } : null; } catch (e) { xato++; return null; } }));
    for (const g of res) { if (g) { bosh = 0; eng = Math.max(eng, g.__id); lotlar.push(g); } else bosh++; }
    if (xato > 40 && !lotlar.length) { console.error('xarid.uzex.uz javob bermadi'); process.exit(1); }
    await sleep(250);
  }
  const bitim = {}, kesh = {};
  for (const g of lotlar) {
    const fa = g.lot_end_date && new Date(g.lot_end_date + '+05:00') > Date.now();
    if (fa && g.product_code && g.lot_amount >= 3 && g.lot_amount * g.price >= 10e6 && !kesh[g.product_code] && Date.now() - t0 < 7 * 60e3) bitim[g.product_code] = kesh[g.product_code] = await bitimlar(g.product_code);
  }
  if (!lotlar.length) console.log('yangi lot yo\'q');
  // Serverga 150 tadan bo'lib yuboriladi (katta paket vaqtida ulgurmasligi mumkin)
  lotlar.sort((a, b) => a.__id - b.__id);
  for (let i = 0; i < lotlar.length; i += 150) {
    const qism = lotlar.slice(i, i + 150), ox = i + 150 >= lotlar.length ? eng : qism[qism.length - 1].__id;
    const bq = {}; for (const g of qism) if (bitim[g.product_code]) bq[g.product_code] = bitim[g.product_code];
    const r = await J(API + '?lot_yoz=1', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-skan-kalit': KALIT }, body: JSON.stringify({ lotlar: qism, oxirgi: ox, bitim: bq }) }, 120000);
    console.log(qism.length + ' ta lot →', JSON.stringify(r));
  }
  await natijalar(t0);
})().catch(e => { console.error(e); process.exit(1); });
