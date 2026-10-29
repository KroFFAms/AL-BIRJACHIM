// AL-BIRJACHIM — cooperation.uz yig'uvchi.
// cabinet.cooperation.uz/corporate/provider/e-shop/requests sahifasida ishga tushiriladi.
// FAQAT O'QIYDI: sahifa hajmini 50 ga qo'yadi, sahifa raqamlarini bosib varaqlaydi, "Barchasi"/"Qatnashayotgan" filtrlarini almashtiradi.
// "Taklif berish" va boshqa amal tugmalari bosilmaydi.
// Natija: window.__KOOP = {holat:'ISHLAYAPTI'|'TAYYOR'|'XATO'|'KIRISH_KERAK', ...}
(() => {
  if (window.__KOOP && window.__KOOP.holat === 'ISHLAYAPTI') return 'allaqachon ishlayapti';
  const S = window.__KOOP = { holat: 'ISHLAYAPTI', bosqich: 'boshlandi', boshlandi: new Date().toISOString() };
  const API = 'https://dbdtnujcospnsuwwazbs.supabase.co/functions/v1/birja';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pad = n => String(n).padStart(2, '0');
  const sanalar = s => [...String(s).matchAll(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/g)].map(m => `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`);
  const num = s => parseFloat(String(s).replace(/\s/g, '').replace(/[^\d.,-]/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.')) || 0;
  const L = '(?<![а-яёa-z])';
  // O'zbekcha va ruscha nomlar uchun guruhlar
  const G = [
    ['Xizmatlar', /xizmat|ta'mir|tamir|услуг|ремонт|обслуживан/i],
    ['Video/xavfsizlik', /kamera|videokuzat|shlagbaum|turniket|signalizats|o't o'chir|камер|видео|шлагбаум|турникет|огнетуш|пожарн/i],
    ['Kompyuter/ofis', /kompyuter|noutbuk|monoblok|printer|kartridj|monitor|skaner|proyektor|kommutator|router|planshet|telefon|компьютер|ноутбук|принтер|картридж|монитор|проектор|коммутатор/i],
    ['Maishiy texnika', /konditsioner|muzlatkich|televizor|changyutkich|choynak|dazmol|кондиционер|холодильник|телевизор|пылесос|чайник/i],
    ['Mebel', /stol|stul|kreslo|shkaf|javon|divan|mebel|стол|стул|кресл|шкаф|мебел/i],
    ['Kanselyariya', /qog'oz|qogoz|papka|kanselyar|daftar|kitob|бумаг|папк|канцеляр|книг/i],
    ['Tom/devor qoplama', /profnastil|tunuka|shifer|tom yop|профнаст|шифер|кровл/i],
    ['Metall prokat', /armatura|ugolok|shveller|truba po'lat|metall|panjara|setka|арматур|уголок|швеллер|металл|решетк|сетка/i],
    ['Sement/beton/blok', /sement|beton|g'isht|gisht|blok|qum|shag'al|gips|shpaklyovka|kafel|plitka|цемент|бетон|кирпич|блок|песок|щеб|плитк/i],
    ['Yog\'och/plita', /yog'och|taxta|faner|dsp|mdf|laminat|доск|брус|фанер|ДСП|МДФ/i],
    ['Bo\'yoq/kimyo', /bo'yoq|boyoq|emal|grunt|germetik|kley|yelim|краск|эмал|грунт|герметик|клей/i],
    ['Santexnika', /santexnika|kran|smesitel|unitaz|rakovina|nasos|quvur|truba|radiator|qozon|isitish|смесител|кран|унитаз|насос|труб|радиатор|котел|котёл/i],
    ['Elektr', /kabel|sim |simlar|lampa|chiroq|yoritgich|projektor|avtomat|rozetka|vyklyuchatel|elektr|кабел|провод|ламп|светильн|прожектор|розетк|выключат|электр/i],
    ['Xo\'jalik/tozalash', /supurgi|chelak|latta|sovun|yuvish|tozalash|axlat|konteyner|paket|qop|веник|ведро|мыло|моющ|мусор|контейнер|пакет/i],
    ['Tibbiyot', /tibbiy|dori|shprits|медицин|шприц|лекарств/i],
    ['Kiyim/maxsus', /kiyim|kostyum|poyabzal|xalat|maxsus kiyim|одежд|костюм|обув|халат/i],
    ['Avto/texnika qismlari', /shina|akkumulyator|filtr|ehtiyot qism|podshipnik|шин|аккумулятор|фильтр|запасн|подшипник/i],
    ['Asbob/mayda', /qulf|samorez|mix|bolt|gayka|asbob|drel|perforator|bolgarka|kesish|silliqlov|doira|замок|саморез|гвозд|болт|инструмент|дрель|диск/i],
    ['Eshik/deraza', /eshik|deraza|darvoza|двер|окн|ворот/i],
  ];
  const guruh = n => { for (const [g, re] of G) if (re.test(n)) return g; return 'Boshqa'; };
  const norm = x => String(x || '').toUpperCase().replace(/["'«»“”‘’`ʻʼ.]/g, '').replace(/(^|\s)(MCHJ|МЧЖ|OOO|ООО|XK|AJ|QK|YATT)(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();

  const firstLot = () => { const r = document.querySelector('table tbody tr'); return r && r.cells[1] ? r.cells[1].innerText.trim() : ''; };
  async function kut(f) { for (let i = 0; i < 48; i++) { await sleep(250); const x = firstLot(); if (x && x !== f) return true; } return false; }
  const sizeBtn = () => { const ko = [...document.querySelectorAll('span')].find(e => /Ko'rsatish/.test(e.textContent)); return ko && ko.nextElementSibling ? ko.nextElementSibling.querySelector('button') : null; };
  async function sahifa50() {
    const b = sizeBtn(); S.sizeBtn = !!b;
    if (!b || b.textContent.trim() === '50') return;
    const f = firstLot(); b.click(); await sleep(600);
    const o = [...document.querySelectorAll('li,button,div,span')].filter(e => e.children.length === 0 && e.textContent.trim() === '50' && !b.contains(e)).pop();
    if (o) { o.click(); await kut(f); await sleep(800); }
  }
  // Sahifalash: raqamli tugmalar konteyneridagi oxiridan bitta oldingi tugma = "›" (keyingi sahifa)
  const keyingi = () => {
    const sb = sizeBtn();
    const nums = [...document.querySelectorAll('button')].filter(b => /^\d+$/.test(b.textContent.trim()) && b !== sb);
    if (!nums.length) return null;
    let cont = nums[0].parentElement;
    while (cont && cont.querySelectorAll('button').length < nums.length + 2) cont = cont.parentElement;
    if (!cont) return null;
    const all = [...cont.querySelectorAll('button')];
    const nx = all[all.length - 2];
    return nx && !nx.disabled && !nx.textContent.trim() ? nx : null;
  };
  async function hammaSahifa(fn) {
    const out = {};
    for (let p = 1; p <= 80; p++) {
      for (const tr of document.querySelectorAll('table tbody tr')) {
        const c = [...tr.cells].map(x => x.innerText.trim().replace(/\s+/g, ' '));
        if (c[1] && /^[A-Z]{1,3}\d{5,}$/.test(c[1])) out[c[1]] = c;
      }
      S[fn] = Object.keys(out).length; S.sahifa = p;
      const btn = keyingi();
      if (!btn) break;
      const f = firstLot(); btn.click(); if (!(await kut(f))) break;
    }
    return Object.values(out);
  }
  async function tabga(nom) {
    const t = [...document.querySelectorAll('[role=tab],button')].find(x => x.textContent.trim() === nom);
    if (!t) return false;
    const f = firstLot(); t.click(); await kut(f); await sleep(1200); return true;
  }
  const qator = c => {
    const nomKod = c[2] || '';
    const kod = (nomKod.match(/\d{2}\.\d{2}\.\d{2}\.\d{3}-\d{5}/) || [''])[0];
    const nom = nomKod.replace(kod, '').trim();
    const miq = c[3] || '';
    const soni = num((miq.match(/^[\d\s.,]+/) || ['0'])[0]);
    const narx = num((miq.match(/([\d\s]+[.,]\d{2})\s*UZS/i) || ['', '0'])[1]);
    const ds = sanalar(c[4]);
    return { lot: c[1], oferta: c[0], nom, kod, soni, narx, tugash: ds[ds.length - 1] || '', holat: c[6] || '', golib: (c[7] && c[7] !== '-') ? c[7] : '' };
  };

  (async () => {
    try {
      if (!/cabinet\.cooperation\.uz/.test(location.host) || /login|auth/.test(location.href)) { S.holat = 'KIRISH_KERAK'; return; }
      if (!/e-shop\/requests/.test(location.pathname)) { S.holat = 'XATO'; S.xato = "Sahifa e-shop/requests emas"; return; }
      for (let w = 0; w < 40 && !firstLot(); w++) await sleep(250);
      // Korxona nomi: "Korporativ yetkazib beruvchi" yozuvi yonidagi nom
      const rolEl = [...document.querySelectorAll('span,p,div')].find(e => e.children.length === 0 && /yetkazib beruvchi/i.test(e.textContent) && e.textContent.trim().length < 40 && e.previousElementSibling && e.previousElementSibling.textContent.trim());
      const korxona = (rolEl ? rolEl.previousElementSibling.textContent : '').replace(/["«»“”]/g, '').replace(/\s+/g, ' ').trim();
      if (!korxona) { S.holat = 'XATO'; S.xato = 'Korxona nomi topilmadi'; return; }
      S.korxona = korxona;
      for (let w = 0; w < 40 && !firstLot(); w++) await sleep(250);

      S.bosqich = 'barchasi';
      await tabga('Barchasi');
      await sahifa50();
      const all = (await hammaSahifa('barchasi')).map(qator);

      S.bosqich = 'qatnashayotgan';
      let qat = [];
      if (await tabga('Qatnashayotgan')) {
        if (firstLot()) qat = (await hammaSahifa('qatnashayotgan')).map(qator);
      }
      await tabga('Barchasi');

      const aktiv = all.filter(x => /faol/i.test(x.holat) && x.tugash);
      const tugagan = all.filter(x => !/faol/i.test(x.holat));
      // Supabase: e-do'kon formatiga mos qatorlar + qo'shimcha maydonlar
      const kooperatsiya = aktiv.map(x => [x.lot, guruh(x.nom), x.nom, x.soni, x.narx, x.tugash, x.oferta, x.kod, x.holat, x.golib]);
      const takliflar = qat.map(x => [x.lot, x.nom, x.soni, x.narx, x.narx, x.tugash]);
      const natijalar = qat.filter(x => !/faol/i.test(x.holat)).map(x => ({
        korxona, lot: x.lot,
        holat: x.golib ? (norm(x.golib).startsWith(norm(korxona)) || norm(korxona).startsWith(norm(x.golib)) ? 'yutdi' : 'yutqazdi') : 'bitim_yoq',
        golib: x.golib || null, dona_narx: null, shartnoma_summa: null, ishtirokchilar: null,
      }));

      if (window.__KOOP_DRY) { S.dry = { korxona, jami: all.length, aktiv: aktiv.length, tugagan: tugagan.length, qat: qat.length, misol: kooperatsiya.slice(0, 3), golibli: kooperatsiya.filter(x => x[9]).length }; S.holat = 'TAYYOR'; return; }
      S.bosqich = 'yozish';
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ korxona, platforma: 'cooperation', manba: 'cooperation.uz — kabinet (So\'rovlar)', edokon: kooperatsiya, auksion: [], takliflar }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error('Supabase: ' + r.status + ' ' + (j.xato || ''));
      if (natijalar.length) {
        const rn = await fetch(API + '?natija=1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ natijalar }) });
        const jn = await rn.json().catch(() => ({})); S.natijaYozildi = jn.yozildi;
      }
      S.natija = { korxona, telegram: j.telegram, jami: all.length, aktiv: aktiv.length, tugagan: tugagan.length, qatnashgan: qat.length,
        aktivRoyxat: aktiv.slice(0, 10).map(x => `${x.nom.slice(0, 40)} — ${x.soni} × ${Math.round(x.narx).toLocaleString('ru-RU')} (${x.tugash.replace('T', ' ')})`) };
      S.holat = 'TAYYOR';
    } catch (e) { S.holat = 'XATO'; S.xato = String(e && e.message || e); }
    S.tugadi = new Date().toISOString();
  })();
  return 'boshlandi';
})();
