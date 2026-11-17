// AL-BIRJACHIM — "🔄 Birjachi" xatcho'pi (bookmarklet) shu faylni yuklaydi.
// Qayerda bosilganini o'zi aniqlaydi:
//   xarid.uzex.uz kabineti      → yigish.js (e-do'kon + auksion + natijalar)
//   cabinet.cooperation.uz       → koop.js   (So'rovlar)
// FAQAT O'QIYDI. Hech narsa tasdiqlamaydi, narx bermaydi, kirmaydi.
(() => {
  const BASE = 'https://kroffams.github.io/AL-BIRJACHIM/';
  const SAYT = BASE;
  const h = location.host;
  const P = {
    xarid: { host: /(^|\.)xarid\.uzex\.uz$/, sahifa: '/provider/shop/rival-lots/0', js: 'yigish.js', st: '__BIRJA', nom: 'xarid.uzex.uz' },
    koop: { host: /^cabinet\.cooperation\.uz$/, sahifa: '/corporate/provider/e-shop/requests', js: 'koop.js', st: '__KOOP', nom: 'cooperation.uz' },
  };
  const p = P.xarid.host.test(h) ? P.xarid : P.koop.host.test(h) ? P.koop : null;

  // ---- 📝 Taklif: saytdagi «▶ Ochish» orqali ochilgan lot sahifasida narxni yozish ----
  // Narx sayt tomonidan oyna nomida (window.name = "bjn:<narx>:<id>") keladi. Faqat yozadi:
  // hisob raqamini tanlash, «Yuborish» va E-IMZO — xodimning o'zi.
  if (P.xarid.host.test(h) && /\/lot-details\//.test(location.pathname)) {
    const m = /^bjn:([\d.]+):(\d+)/.exec(window.name || '');
    if (!m) { alert("AL-BIRJACHIM: bu lot saytdagi «📝 Taklif» → «▶ Ochish» orqali ochilmagan, narx noma'lum."); return; }
    (async () => {
      const sl = (ms) => new Promise((r) => setTimeout(r, ms));
      let b = null;
      for (let i = 0; i < 40 && !b; i++) { b = [...document.querySelectorAll('button')].find((x) => /^\s*Taklif berish\s*$/i.test(x.textContent) && x.offsetParent); if (!b) await sl(500); }
      if (!b) { alert('AL-BIRJACHIM: «Taklif berish» tugmasi topilmadi — kabinetga kirilmagan yoki lot yopilgan.'); return; }
      b.click();
      let inp = null;
      for (let i = 0; i < 25 && !inp; i++) {
        await sl(400);
        const md = [...document.querySelectorAll('[role=dialog],.modal-content,.modal')].find((x) => x.offsetParent && /Taklif shakli/i.test(x.textContent));
        if (md) inp = [...md.querySelectorAll('input')].find((x) => x.offsetParent && x.type !== 'hidden' && x.type !== 'checkbox' && !x.readOnly && !x.closest('ng-select,.ng-select'));
      }
      if (!inp) { alert('AL-BIRJACHIM: taklif oynasi ochilmadi.'); return; }
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      inp.focus(); set.call(inp, m[1]);
      ['input', 'change', 'keyup', 'blur'].forEach((t) => inp.dispatchEvent(new Event(t, { bubbles: true })));
      inp.style.outline = '3px solid #22a35a';
    })();
    return;
  }

  // ---- ♻️ Ofertalarni aktiv qilish: «Mening mahsulotlarim → Срок истек» sahifasida ----
  // 1) To'liq anketali tovarlar — xaridning o'z ommaviy «Продлить» usuli bilan BITTA E-IMZO imzosi;
  // 2) qolganlari — «Joylashtirish» nusxa anketasi (add-offer/<id>) orqali bittalab: yetkazish muddati va asosiy
  //    surat to'ldiriladi; tanlash kerak bo'lgan maydon bo'sh bo'lsa — nomi bilan ro'yxatga yoziladi, yuborilmaydi.
  // E-IMZO paroli — E-IMZO oynasida, xodim kiritadi. Narx/ma'lumotlar o'zgartirilmaydi.
  if (P.xarid.host.test(h) && /\/provider\/shop\/(offer-list|republish-offer|add-offer)\//.test(location.pathname)) {
    if (window.__BJ_AKTIV) { alert('AL-BIRJACHIM: aktiv qilish allaqachon ishlayapti.'); return; }
    const S = (window.__BJ_AKTIV = { stop: false });
    const sl = (ms) => new Promise((r) => setTimeout(r, ms));
    // Joylangan deb belgilanganlar: id → vaqt. 7 kundan eski belgi hisobga olinmaydi (eski xato belgilar tufayli tovar abadiy o'tkazib yuborilmasin)
    const LS = 'bj_aktiv_qilingan2';
    const QM = (() => { try { const o = JSON.parse(localStorage.getItem(LS) || '{}'); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; } catch (_) { return {}; } })();
    const qil = { has: (id) => QM[id] && (Date.now() - QM[id] < 7 * 86400e3), add: (id) => { QM[id] = Date.now(); } };
    // Doimiy o'tkazib yuboriladiganlar (YaTT uchun taqiqlangan, katalogda faol emas) — har kuni qayta urinilmaydi
    const LSO = 'bj_otkaz';
    const OTK = (() => { try { const o = JSON.parse(localStorage.getItem(LSO) || '{}'); return (o && typeof o === 'object') ? o : {}; } catch (_) { return {}; } })();
    const otkaz = (id, sabab) => { OTK[id] = { s: String(sabab).slice(0, 80), t: Date.now() }; try { localStorage.setItem(LSO, JSON.stringify(OTK)); } catch (_) { /* */ } };
    const saqla = () => { try { for (const k of Object.keys(QM)) if (Date.now() - QM[k] > 30 * 86400e3) delete QM[k]; localStorage.setItem(LS, JSON.stringify(QM)); } catch (_) { /* */ } };
    const pn = document.createElement('div');
    pn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#0f1b2d;color:#e8eef7;font:14px/1.45 Segoe UI,Arial,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);width:380px;max-height:60vh;overflow:auto';
    pn.innerHTML = '<b>♻️ AL-BIRJACHIM — ofertalarni aktiv qilish</b><div id="bjAkM" style="margin:8px 0;color:#b9c8dc">Tayyorlanmoqda…</div><button id="bjAkS" style="background:#d9473b;color:#fff;border:0;border-radius:8px;padding:6px 12px;cursor:pointer">To\'xtatish</button>';
    document.body.appendChild(pn);
    const msg = (t) => { const e = document.getElementById('bjAkM'); if (e) e.innerHTML = t; };
    pn.querySelector('#bjAkS').onclick = () => { S.stop = true; msg('To\'xtatilmoqda… (joriy tovar tugagach)'); };
    const bor = () => { if (!document.body.contains(pn)) document.body.appendChild(pn); };
    const qatorlar = () => [...document.querySelectorAll('tbody tr')].filter((x) => x.querySelector('td'));
    const rid = (r) => ((r.querySelector('td') || r).textContent.match(/\d{6,}/) || [''])[0];
    const yolga = (u) => { history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate', { state: {} })); };
    const kut = async (f, ms) => { const tugash = Date.now() + ms; while (Date.now() < tugash) { const v = f(); if (v) return v; await sl(400); } return f() || null; };
    const jm = () => +((/of\s+(\d+)/.exec(document.body.innerText) || [])[1] || 0);
    const label = (el) => { let p = el; for (let k = 0; k < 4 && p; k++) { p = p.parentElement; const l = p && p.querySelector('label'); if (l) return l.textContent.replace('*', '').trim().slice(0, 40); } return '?'; };
    // Ro'yxatni (hamma sahifalar) yig'ish
    async function royxat() {
      const R = [];
      yolga('/provider/shop/offer-list/8');
      await kut(() => qatorlar().length || /of\s+0\b/.test(document.body.innerText), 15000); await sl(800);
      for (let p = 0; p < 60 && !S.stop; p++) {
        const birinchi = qatorlar()[0] && rid(qatorlar()[0]);
        for (const r of qatorlar()) {
          const id = rid(r); if (!id || R.some((z) => z.id === id)) continue;
          const a = [...r.querySelectorAll('.dropdown-item')].map((x) => x.textContent.trim());
          const nom = (r.querySelectorAll('td')[1] || r).textContent.trim().slice(0, 40);
          if (a.includes('Продлить')) R.push({ id, nom, kat: false });
          else if (a.some((x) => /Продлить \(/.test(x))) R.push({ id, nom, kat: true });
        }
        const nx = [...document.querySelectorAll('a, button')].find((e) => e.offsetParent && e.textContent.trim() === '›' && !e.disabled && !(e.closest('li') && e.closest('li').classList.contains('disabled')));
        if (!nx) break;
        nx.click();
        if (!await kut(() => qatorlar()[0] && rid(qatorlar()[0]) !== birinchi, 8000)) break;
      }
      return R;
    }
    (async () => {
      if (!/\/offer-list\/8$/.test(location.pathname)) { msg('Avval chap menyuda <b>Mening mahsulotlarim → Срок истек</b> ni oching, keyin qayta bosing.'); S.yoq = true; }
      let ROY = [];
      if (!S.yoq) { msg('Ro\'yxat yig\'ilmoqda…'); ROY = await royxat(); }
      const KAT = ROY.filter((z) => z.kat);
      const OLDIN = ROY.filter((z) => !z.kat && qil.has(z.id)).length; // oxirgi 7 kunda joylangan deb belgilanganlar
      const OTKN = ROY.filter((z) => !z.kat && OTK[z.id]).length; // doimiy o'tkazib yuboriladiganlar
      let ISH = ROY.filter((z) => !z.kat && !qil.has(z.id) && !OTK[z.id]);
      if (!S.yoq && !ISH.length) { msg('Aktiv qilinadigan tovar topilmadi' + (OLDIN ? ' (' + OLDIN + ' ta — oxirgi 7 kunda joylangan, moderatsiyada)' : '') + (KAT.length ? ' (' + KAT.length + ' ta «Каталог» — qo\'lda)' : '') + '.'); S.yoq = true; }
      // Yetkazib berish muddati bo'sh bo'lsa — qancha kun (xodim bir marta kiritadi)
      let YKUN = '';
      if (!S.yoq) {
        let sk = ''; try { sk = localStorage.getItem('bj_yetkazish_kun') || ''; } catch (_) { /* */ }
        const j = prompt(ISH.length + ' ta tovar aktiv qilinadi.\nYetkazib berish muddati bo\'sh tovarlarga necha KUN yozilsin? (kamida 5)', sk || '10');
        if (j === null) { msg('Bekor qilindi.'); S.yoq = true; }
        else { YKUN = String(Math.max(5, parseInt(j, 10) || 10)); try { localStorage.setItem('bj_yetkazish_kun', YKUN); } catch (_) { /* */ } }
      }
      let ok = 0, okMass = 0; const X = [], TANLA = [];
      // Token va API manzili (bir marta)
      let _tk = null;
      const tokenOl = async () => { if (_tk) return _tk; const mainU = [...document.scripts].map((s) => s.src).find((s) => /\/main[.-]/.test(s)); const mt = mainU ? await fetch(mainU).then((r) => r.text()).catch(() => '') : ''; _tk = { tk: (mt.match(/tokenKey\s*=\s*"([^"]+)"/) || [])[1], api: (mt.match(/shopUrl:"([^"]+)"/) || [])[1] || 'https://xarid-api-shop.uzex.uz' }; return _tk; };
      const qidir = (o, k, d = 0) => { if (!o || typeof o !== 'object' || d > 4) return undefined; if (o[k] != null && typeof o[k] !== 'object') return o[k]; for (const x of Object.values(o)) { const r = qidir(x, k, d + 1); if (r != null) return r; } return undefined; };
      // 1) BITTA IMZO: xaridning o'z «SetRepublishMass» usuli — to'liq anketali tovarlarni o'zi uzaytiradi
      // (ko'pincha ishlamaydi; Ishchi window.__BJ_MASS=false bersa — o'tkazib yuboriladi, to'g'ri birma-bir anketaga)
      if (!S.yoq && ISH.length && window.__BJ_MASS !== false) {
        try {
          msg('✍️ ' + ISH.length + ' ta tovar <b>bitta E-IMZO imzosi</b> bilan uzaytirilmoqda… Parol so\'rasa — kiriting.');
          const j0 = jm();
          const mainU = [...document.scripts].map((s) => s.src).find((s) => /\/main[.-]/.test(s));
          const mt = mainU ? await fetch(mainU).then((r) => r.text()) : '';
          const tk = (mt.match(/tokenKey\s*=\s*"([^"]+)"/) || [])[1];
          const api = (mt.match(/shopUrl:"([^"]+)"/) || [])[1] || 'https://xarid-api-shop.uzex.uz';
          const raw = localStorage.getItem('esi-id');
          if (!raw || !tk || typeof window.esiSign !== 'function') throw new Error('E-IMZO kaliti topilmadi');
          const key = decodeURIComponent(escape(atob(raw)));
          const obj = { ids: ISH.map((z) => +z.id).filter(Boolean), signed_Data: '', signature: '' };
          const sig = await new Promise((res, rej) => {
            const tm = setTimeout(() => rej(new Error('E-IMZO 3 daqiqada javob bermadi')), 180000);
            try { window.esiSign(key, JSON.stringify(obj), (_k, s) => { clearTimeout(tm); res(s); }); } catch (e) { clearTimeout(tm); rej(e); }
          });
          obj.signed_Data = JSON.stringify(sig); obj.signature = sig;
          const r = await fetch(api + '/Provider/SetRepublishMass', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem(tk) }, body: JSON.stringify(obj) });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          await sl(6000);
          const R2 = await royxat();
          const j1 = jm();
          // Ro'yxat to'liq yuklanmagan bo'lsa (qatorlar soni umumiy sondan kam) — «yo'qoldi» deb hisoblamaymiz
          if (j1 && R2.length < j1 - 1) throw new Error('ro\'yxat to\'liq yuklanmadi (' + R2.length + '/' + j1 + '), natija tekshirilmadi');
          const qolgan = new Set(R2.map((z) => z.id));
          okMass = Math.min(ISH.filter((z) => !qolgan.has(z.id)).length, Math.max(0, (j0 || 0) - (j1 || 0)));
          ok += okMass;
          ISH = ISH.filter((z) => qolgan.has(z.id));
          msg('✅ ' + okMass + ' ta bitta imzo bilan uzaytirildi. Qolgan ' + ISH.length + ' tasi bittalab tekshirilmoqda…');
        } catch (e) {
          X.push('Ommaviy usul ishlamadi: ' + e.message);
        }
      }
      // 2) Qolganlari — «Joylashtirish» nusxa anketasi (add-offer/<id>): to'ldirib bo'ladiganini to'ldiramiz
      // Xarid tezlik chegarasi («Qisqa vaqt oralig'ida juda ko'p e'lon»): har joylashdan keyin pauza, xato kelsa kutib qayta urinish
      let KUTX = 0, MAJB = 0; const PAUZA = Math.max(10, +window.__BJ_PAUZA || 30) * 1000;
      // Diagnostika: anketadagi BO'SH maydonlar (label bilan) — sayt «не все обязательные поля» desa, nimasi bo'shligini ko'ramiz
      const boshlar = () => { const L = []; try {
        for (const x of document.querySelectorAll('input, textarea')) { if (!x.offsetParent || x.type === 'hidden' || x.type === 'checkbox' || x.type === 'radio' || x.closest('ng-select')) continue; if (!String(x.value || '').trim()) L.push(label(x) + (x.id ? '#' + x.id : '')); }
        for (const n of document.querySelectorAll('ng-select')) { if (!n.querySelector('.ng-value')) L.push(label(n) + (n.classList.contains('ng-select-disabled') ? '(qulf)' : '')); }
        const G = {}; for (const r of document.querySelectorAll('input[type=radio]')) { if (!r.offsetParent) continue; (G[r.name || '?'] = G[r.name || '?'] || []).push(r); } for (const k in G) if (!G[k].some((r) => r.checked)) L.push('radio:' + k);
      } catch (_) { /* */ } return [...new Set(L)].slice(0, 20).join(', '); };
      for (let i = 0; i < ISH.length && !S.yoq && !S.stop; i++) {
        const z = ISH[i];
        msg('⏳ ' + (i + 1) + '/' + ISH.length + ' — <b>' + z.nom + '</b> anketasi ochilmoqda…<br>✅ ' + ok + ' ta' + (X.length ? ' · ⚠️ ' + X.length : '') + (TANLA.length ? ' · ✋ ' + TANLA.length : ''));
        yolga('/provider/shop/add-offer/' + z.id);
        const tg = await kut(() => { bor(); const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /Tovarni joylashtirish|Разместить товар/i.test(x.textContent)); const n = [...document.querySelectorAll('input')].filter((x) => x.offsetParent && x.type !== 'radio' && x.type !== 'checkbox' && /^\d[\d\s.,]*$/.test(x.value.trim())).length >= 2; return b && n ? b : null; }, 30000);
        if (!tg) { X.push(z.nom + ': anketa ochilmadi'); continue; }
        await sl(1500);
        // Katalogdagi mahsulot o'chirilgan bo'lsa «Tovar (ish / xizmat)» bo'sh keladi — joylab bo'lmaydi
        const tovarNs = [...document.querySelectorAll('ng-select')].find((n) => /Tovar \(ish|Товар \(работа/i.test(label(n)));
        if (tovarNs && !tovarNs.querySelector('.ng-value')) { otkaz(z.id, 'katalogda faol emas'); X.push(z.nom + ': mahsulot katalogda faol emas — yangi oferta kerak (keyingi kunlarda urinilmaydi)'); continue; }
        // Yetkazib berish muddati bo'sh bo'lsa — to'ldiramiz
        try {
          const dt = document.getElementById('delivery_term') || [...document.querySelectorAll('input')].find((x) => x.offsetParent && /Yetkazib berish muddati|Срок поставки/i.test(label(x)));
          if (dt && !dt.value.trim() && YKUN) { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; dt.focus(); set.call(dt, YKUN); ['input', 'change', 'keyup', 'blur'].forEach((tt) => dt.dispatchEvent(new Event(tt, { bubbles: true }))); await sl(300); }
        } catch (_) { /* */ }
        // Nusxa anketada «Tovar markasi» va «Ishlab chiqaruvchi» bo'sh keladi — eski ofertadan olib to'ldiramiz
        try {
          const pm = document.getElementById('product_mark'), pf = document.getElementById('product_manafacturer');
          if ((pm && !pm.value.trim()) || (pf && !pf.value.trim())) {
            const { tk, api } = await tokenOl();
            const o = tk ? await fetch(api + '/Provider/GetOfferForEdit/' + z.id, { headers: { Authorization: 'Bearer ' + localStorage.getItem(tk) } }).then((r) => r.json()).catch(() => null) : null;
            const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            const yoz = (e, val) => { if (e && !e.value.trim() && val) { e.focus(); set.call(e, String(val)); ['input', 'change', 'keyup', 'blur'].forEach((tt) => e.dispatchEvent(new Event(tt, { bubbles: true }))); } };
            if (o) { yoz(pm, qidir(o, 'product_mark')); yoz(pf, qidir(o, 'product_manafacturer')); await sl(300); }
            // Eski ofertada ham bo'lmasa — standart: marka = tovar nomi, ishlab chiqaruvchi = O'zbekiston
            yoz(pm, z.nom); yoz(pf, 'O\'zbekiston'); await sl(200);
          }
        } catch (_) { /* */ }
        // Asosiy surat: anketada firmaning BUTUN surat ombori ko'rinadi, shuning uchun faqat shu ofertaning O'Z surati
        // (eski ofertadagi file_id bo'yicha) tanlanadi. Topilmasa — tovar yuborilmaydi (noto'g'ri surat bilan moderatsiya rad etadi).
        let suratYoq = false;
        try {
          const yozuv = (re) => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,label,span,div,p')].find((e) => e.childElementCount <= 1 && re.test(e.textContent.trim()) && e.textContent.trim().length < 40);
          const b1 = yozuv(/^(Tovarning surati|Фото товара|Изображение товара)/i), o1 = yozuv(/^\*?\s*(Hisob raqamni tanlang|Выберите расчетный счет)/i);
          const rs = b1 ? [...document.querySelectorAll('input[type=radio]')].filter((x) => (b1.compareDocumentPosition(x) & 4) && (!o1 || (x.compareDocumentPosition(o1) & 4))) : [];
          if (rs.length) {
            const { tk, api } = await tokenOl();
            const o = tk ? await fetch(api + '/Provider/GetOfferForEdit/' + z.id, { headers: { Authorization: 'Bearer ' + localStorage.getItem(tk) } }).then((r) => r.json()).catch(() => null) : null;
            const ids = []; const mid = o && qidir(o, 'main_image_id'); if (mid) ids.push(String(mid));
            const yig = (x, d = 0) => { if (!x || typeof x !== 'object' || d > 5) return; if (x.file_id) ids.push(String(x.file_id)); for (const q of Object.values(x)) yig(q, d + 1); }; yig(o);
            const radioTop = (id) => rs.find((x) => { let p = x; for (let k = 0; k < 6 && p; k++) { p = p.parentElement; if (p && p.querySelectorAll('input[type=radio]').length === 1 && new RegExp('(^|\\D)' + id + '(\\D|$)').test(p.textContent)) return true; } return false; });
            let r0 = null; for (const id of ids) { r0 = radioTop(id); if (r0) break; }
            if (r0) { if (!r0.checked) { r0.click(); r0.dispatchEvent(new Event('change', { bubbles: true })); await sl(400); } }
            else suratYoq = true;
          }
        } catch (_) { suratYoq = true; }
        if (suratYoq) { X.push(z.nom + ': o\'z surati topilmadi — qo\'lda joylang (' + location.origin + '/provider/shop/add-offer/' + z.id + ')'); continue; }
        // Tanlash kerak bo'lgan (bo'sh) maydonlar — tovar xususiyatlari: xodim o'zi tanlaydi, robot taxmin qilmaydi
        // faqat KO'RINADIGAN va nomi aniq bo'sh tanlovlar (yashirin/nomsiz select'lar sababli hammasini o'tkazib yubormaslik uchun)
        const bosh = [...document.querySelectorAll('ng-select')].filter((n) => n.offsetParent && !n.querySelector('.ng-value') && !n.classList.contains('ng-select-disabled') && !/Mahsulotlarni|qidirish|поиск/i.test(label(n)) && label(n) !== '?').map(label);
        const boshInp = [...document.querySelectorAll('input')].filter((x) => x.offsetParent && x.type !== 'radio' && x.type !== 'checkbox' && !x.value.trim() && /^\*/.test((() => { let p = x; for (let k = 0; k < 4 && p; k++) { p = p.parentElement; const l = p && p.querySelector('label'); if (l) return l.textContent.trim(); } return ''; })())).map(label);
        const hammasi = [...new Set([...bosh, ...boshInp])];
        if (hammasi.length) { TANLA.push({ id: z.id, nom: z.nom, m: hammasi }); X.push(z.nom + ': tanlash kerak — ' + hammasi.join(', ') + ' (' + location.origin + '/provider/shop/add-offer/' + z.id + ')'); continue; }
        const BOSH = boshlar();
        tg.scrollIntoView({ block: 'center' }); await sl(200);
        const T = []; const mo = new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && /toast|notif/i.test(n.className + ' ' + ((n.parentElement || {}).className || ''))) T.push(n.innerText.replace(/\s+/g, ' ').trim()); }); mo.observe(document.body, { childList: true, subtree: true });
        window.__BJ_ALERT = '';
        tg.click();
        msg('⏳ ' + (i + 1) + '/' + ISH.length + ' — <b>' + z.nom + '</b> joylanmoqda… <b>E-IMZO so\'rasa, tasdiqlang</b><br>✅ ' + ok + ' ta' + (X.length ? ' · ⚠️ ' + X.length : ''));
        const nat = await kut(() => { bor(); if (!/add-offer\//.test(location.pathname)) return 'ok'; if (window.__BJ_ALERT) return 'xato: ' + String(window.__BJ_ALERT).slice(0, 120); const er = T.find((t) => /Xato|Ошибка/i.test(t)); if (er) return 'xato: ' + er.replace(/^×?\s*(Xato|Ошибка)\s*/i, '').slice(0, 120); const okT = T.find((t) => /Muvaffaqiyat|Успешно|успешно/i.test(t)); return okT ? 'ok' : null; }, 180000);
        mo.disconnect();
        if (nat && /обязательные поля|majburiy maydon/i.test(nat)) { try { const bo = [...document.querySelectorAll('input,textarea,ng-select')].filter((x) => x.offsetParent && (x.tagName === 'NG-SELECT' ? !x.querySelector('.ng-value') : (x.type !== 'radio' && x.type !== 'checkbox' && x.type !== 'file' && !String(x.value || '').trim()))).map(label).filter((q, qi, qa) => qa.indexOf(q) === qi).slice(0, 10); nat += ' [bo\'sh: ' + bo.join(', ') + ']'; } catch (_) { /* */ } }
        if (nat === 'ok') { ok++; qil.add(z.id); saqla(); KUTX = 0; if (i < ISH.length - 1) { msg('✅ ' + ok + ' ta joylandi. Keyingisigacha ' + Math.round(PAUZA / 1000) + ' s kutilmoqda (xarid tezlik chegarasi)…'); await sl(PAUZA); } }
        else if (/YaTT|faoliyat turlari|faol emas|не активен/i.test(nat || '')) { otkaz(z.id, nat); X.push(z.nom + ': ' + nat + ' — keyingi kunlarda urinilmaydi'); }
        else if (/Qisqa vaqt|juda ko.p e.lon|biroz kutib|Слишком много|подождите|WebSocket|E-IMZO|javob bermadi/i.test(nat || '') && KUTX < 5) { KUTX++; const w = 60000 * KUTX; msg('⏸ Xarid: «juda ko\'p e\'lon» — ' + (w / 1000) + ' s kutib, <b>' + z.nom + '</b> qayta uriniladi (' + KUTX + '/5)…'); await sl(w); i--; }
        else {
          X.push(z.nom + ': ' + (nat || 'javob kelmadi') + (/обязательн|majburiy|to.ldirilishi shart/i.test(nat || '') && BOSH ? ' | bo\'sh maydonlar: ' + BOSH : ''));
          if (/обязательн|majburiy|to.ldirilishi shart/i.test(nat || '')) { MAJB++; if (MAJB >= 3) { X.push('⛔ 3 ta ketma-ket «majburiy maydon» xatosi — bu firmada to\'xtatildi (anketa tuzilishi o\'zgargan, jurnaldagi bo\'sh maydonlar ro\'yxatini yuboring)'); break; } }
        }
        await sl(600);
      }
      if (!S.yoq) {
        msg('🏁 Tugadi. ✅ <b>' + ok + '</b> ta qayta joylandi' + (okMass ? ' (' + okMass + ' tasi bitta imzo bilan)' : '') + ' — moderatsiyada' +
          (TANLA.length ? '<br>✋ <b>' + TANLA.length + '</b> ta tovarda xususiyat tanlash kerak (robot taxmin qilmaydi)' : '') +
          (X.length ? '<br>⚠️ ' + X.length + ' ta o\'tmadi:<br><span style="font-size:12px">' + X.slice(0, 8).join('<br>') + '</span>' : '') +
          (KAT.length ? '<br>«Каталог»: ' + KAT.length + ' ta — qo\'lda' : '') +
          (OLDIN ? '<br>↩️ ' + OLDIN + ' ta — oxirgi 7 kunda joylangan (moderatsiyada), qayta yuborilmadi' : '') +
          (OTKN ? '<br>⛔ ' + OTKN + ' ta — YaTT taqiqi / katalogda faol emas, o\'tkazib yuborildi' : ''));
        yolga('/provider/shop/offer-list/8');
      }
      const b = document.getElementById('bjAkS'); if (b) { b.textContent = 'Yopish'; b.onclick = () => pn.remove(); }
      window.__BJ_AKTIV = null;
    })();
    return;
  }

  // ---- Panel ----
  let box = document.getElementById('birjachi-panel');
  if (!box) {
    box = document.createElement('div');
    box.id = 'birjachi-panel';
    box.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483647;width:340px;max-width:calc(100vw - 36px);background:#fff;color:#15202b;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.28);font:14px/1.45 system-ui,Segoe UI,Arial,sans-serif;overflow:hidden';
    document.body.appendChild(box);
  }
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const show = (title, body, color) => {
    box.innerHTML = '<div style="background:' + (color || 'linear-gradient(90deg,#123a6b,#1d5fa8,#0e8a7a)') + ';color:#fff;padding:10px 14px;display:flex;align-items:center;gap:8px;font-weight:700">' +
      '<span>📊 AL-BIRJACHIM</span><span style="flex:1"></span><button id="bj-x" style="all:unset;cursor:pointer;font-size:18px;line-height:1;padding:0 4px">×</button></div>' +
      '<div style="padding:12px 14px"><div style="font-weight:700;margin-bottom:6px">' + title + '</div>' + body + '</div>';
    box.querySelector('#bj-x').onclick = () => { clearInterval(window.__BJ_T); box.remove(); };
  };

  if (!p) {
    show('Bu sahifada ishlamaydi', 'Avval kabinetga kiring, keyin shu tugmani o\'sha sahifada bosing:<br>• <a href="https://xarid.uzex.uz' + P.xarid.sahifa + '">xarid.uzex.uz — Tushgan takliflar</a><br>• <a href="https://cabinet.cooperation.uz' + P.koop.sahifa + '">cooperation.uz — So\'rovlar</a>', '#a15c00');
    return;
  }
  if (/login|auth|signin/i.test(location.href) || (p === P.xarid && !/\/provider\//.test(location.pathname))) {
    show('Avval kabinetga kiring', p.nom + ' kabinetiga E-IMZO bilan o\'zingiz kiring, keyin tugmani yana bosing.', '#a15c00');
    return;
  }
  // To'g'ri sahifada emas yoki 1-sahifada emas → kerakli sahifani yangidan ochamiz
  const birinchi = () => {
    const a = document.querySelector('.pagination .active, .pagination [aria-current]');
    return !a || /^\s*1\s*$/.test(a.textContent);
  };
  const yolda = location.pathname.replace(/\/$/, '') === p.sahifa;
  let kutBor = false; try { kutBor = sessionStorage.getItem('birjachi_kut') === '1'; } catch (e) { }
  // Sahifa allaqachon bir marta ochilgan bo'lsa, qayta-qayta ochmaymiz
  const joyida = yolda && (p !== P.xarid || birinchi() || kutBor);
  if (!joyida && kutBor) {
    try { sessionStorage.removeItem('birjachi_kut'); } catch (e) { }
    show('Kerakli sahifa ochilmadi', 'Menyudan <a href="' + location.origin + p.sahifa + '">ro\'yxat sahifasini</a> o\'zingiz oching, keyin tugmani yana bosing.', '#a15c00');
    return;
  }
  if (!joyida) {
    try { sessionStorage.setItem('birjachi_kut', '1'); } catch (e) { }
    show('Sahifa ochilmoqda…', 'Kerakli ro\'yxat ochilyapti. Sahifa yuklangach, <b>🔄 Birjachi</b> tugmasini <b>yana bir marta</b> bosing.');
    setTimeout(() => { location.href = location.origin + p.sahifa + (p === P.koop ? '?pageIndex=1' : ''); }, 900);
    return;
  }
  try { sessionStorage.removeItem('birjachi_kut'); } catch (e) { }

  const st = () => window[p.st];
  if (!(st() && st().holat === 'ISHLAYAPTI')) {
    delete window[p.st];
    window.__KOOP_DRY = false;
    (async () => {
      for (let i = 1; i <= 5; i++) {
        try {
          const r = await fetch(BASE + p.js + '?v=' + Date.now(), { cache: 'no-store' });
          if (r.ok) { const s = document.createElement('script'); s.textContent = await r.text(); document.head.appendChild(s); return; }
        } catch (e) { }
        await new Promise(r => setTimeout(r, i * 2500));
      }
      clearInterval(window.__BJ_T);
      show('Skript yuklanmadi', esc(p.js) + ' olinmadi (internet yoki GitHub). Birozdan keyin sahifani yangilab, qayta bosing.', '#b42318');
    })();
  }

  const qadam = { boshlandi: 'Boshlandi', "e-do'kon": "E-do'kon o'qilmoqda", auksion: 'Auksion o\'qilmoqda', tahlil: 'Tahlil: ehtimoliy xaridorlar', yozish: 'Bazaga yozilmoqda', natijalar: 'Natijalar tekshirilmoqda', barchasi: "So'rovlar o'qilmoqda", qatnashayotgan: 'Qatnashgan so\'rovlar o\'qilmoqda' };
  const t0 = Date.now();
  clearInterval(window.__BJ_T);
  const tik = () => {
    const S = st();
    const sek = Math.round((Date.now() - t0) / 1000);
    if (!S) { show('Yuklanmoqda…', 'Skript olinmoqda (' + sek + ' s)'); return; }
    if (S.holat === 'ISHLAYAPTI') {
      const son = S.yigildi ?? S.barchasi ?? S.qatnashayotgan ?? '';
      show('⏳ ' + esc(qadam[S.bosqich] || S.bosqich), (S.korxona ? '🏢 ' + esc(S.korxona) + '<br>' : '') +
        (son !== '' ? 'Yig\'ildi: <b>' + son + '</b>' + (S.jami ? ' / ' + S.jami : '') + (S.sahifa ? ' · sahifa ' + S.sahifa : '') + '<br>' : '') +
        (S.tahlilJami ? 'Tahlil: ' + (S.tahlil || 0) + ' / ' + S.tahlilJami + '<br>' : '') +
        (S.auksionTafsilot ? 'Auksion tafsiloti: ' + S.auksionTafsilot + '<br>' : '') +
        (S.tekshiriladi ? 'Natija tekshiruvi: ' + (S.tekshirildi || 0) + ' / ' + S.tekshiriladi + '<br>' : '') +
        '<span style="color:#5f6b7a;font-size:12px">' + sek + ' s · sahifani yopmang, hech narsani bosmang</span>');
      return;
    }
    clearInterval(window.__BJ_T);
    if (S.holat === 'TAYYOR') {
      const n = S.natija || {};
      const qator = p === P.xarid
        ? 'E-do\'kon: <b>' + (n.edokon ?? '?') + '</b> · qo\'lga ilinadigan: <b>' + (n.qiziq ?? '?') + '</b><br>Auksion: <b>' + (n.auksion ?? '?') + '</b>' + (S.takliflar ? '<br>Narx bergan lotlar: <b>' + S.takliflar + '</b>' : '') + (S.natijaYozildi ? '<br>Yangi natijalar: <b>' + S.natijaYozildi + '</b>' : '')
        : 'So\'rovlar: <b>' + (n.jami ?? '?') + '</b> · faol: <b>' + (n.aktiv ?? '?') + '</b>' + (n.qatnashgan ? '<br>Qatnashgan: <b>' + n.qatnashgan + '</b>' : '');
      const tg = n.telegram || (n.javob && n.javob.telegram) || '';
      show('✅ Yangilandi', '🏢 ' + esc(n.korxona || S.korxona) + '<br>' + qator + '<br>Telegram: ' + esc(tg || '—') +
        '<br><a href="' + SAYT + '" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;background:#1d5fa8;color:#fff;padding:6px 12px;border-radius:8px;text-decoration:none">Saytni ochish →</a>', '#1a7f4b');
    } else if (S.holat === 'KIRISH_KERAK') {
      show('Avval kabinetga kiring', p.nom + ' kabinetiga o\'zingiz kiring, keyin tugmani yana bosing.', '#a15c00');
    } else {
      show('❌ Xato', esc(S.xato || S.holat) + '<br><span style="font-size:12px;color:#5f6b7a">Sahifani yangilab, tugmani qayta bosing. Takrorlansa, Claude\'ga yozing.</span>', '#b42318');
    }
  };
  tik();
  window.__BJ_T = setInterval(tik, 1500);
})();
