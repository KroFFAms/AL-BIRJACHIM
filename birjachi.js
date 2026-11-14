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
  // Har bir tovar uchun saytning o'z «Продлить» anketasini (republish-offer) shu oynada ochadi va
  // «Tovarni joylashtirish» ni bosadi. E-IMZO so'rasa — xodim tasdiqlaydi. Narx/ma'lumotlar o'zgarmaydi.
  if (P.xarid.host.test(h) && /\/provider\/shop\/(offer-list|republish-offer)\//.test(location.pathname)) {
    if (window.__BJ_AKTIV) { alert('AL-BIRJACHIM: aktiv qilish allaqachon ishlayapti.'); return; }
    const S = (window.__BJ_AKTIV = { stop: false });
    const sl = (ms) => new Promise((r) => setTimeout(r, ms));
    const LS = 'bj_aktiv_qilingan';
    const qil = (() => { try { return new Set(JSON.parse(localStorage.getItem(LS) || '[]')); } catch (_) { return new Set(); } })();
    const saqla = () => { try { localStorage.setItem(LS, JSON.stringify([...qil].slice(-3000))); } catch (_) { /* */ } };
    const pn = document.createElement('div');
    pn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#0f1b2d;color:#e8eef7;font:14px/1.45 Segoe UI,Arial,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);width:360px';
    pn.innerHTML = '<b>♻️ AL-BIRJACHIM — ofertalarni aktiv qilish</b><div id="bjAkM" style="margin:8px 0;color:#b9c8dc">Tayyorlanmoqda…</div><button id="bjAkS" style="background:#d9473b;color:#fff;border:0;border-radius:8px;padding:6px 12px;cursor:pointer">To\'xtatish</button>';
    document.body.appendChild(pn);
    const msg = (t) => { const e = document.getElementById('bjAkM'); if (e) e.innerHTML = t; };
    pn.querySelector('#bjAkS').onclick = () => { S.stop = true; msg('To\'xtatilmoqda… (joriy tovar tugagach)'); };
    const bor = () => { if (!document.body.contains(pn)) document.body.appendChild(pn); };
    const qatorlar = () => [...document.querySelectorAll('tbody tr')].filter((x) => x.querySelector('td'));
    const rid = (r) => (r.querySelector('td') || r).textContent.trim().split(/\s+/)[0];
    const yolga = (u) => { history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate', { state: {} })); };
    const kut = async (f, ms) => { const tugash = Date.now() + ms; while (Date.now() < tugash) { const v = f(); if (v) return v; await sl(400); } return f() || null; };
    (async () => {
      if (!/\/offer-list\/8$/.test(location.pathname)) { msg('Avval chap menyuda <b>Mening mahsulotlarim → Срок истек</b> ni oching, keyin qayta bosing.'); S.yoq = true; }
      // 1) Hamma sahifalardan «Продлить» bor tovarlarni yig'amiz
      const ROY = [];
      if (!S.yoq) {
        await kut(() => qatorlar().length, 15000);
        for (let p = 0; p < 60 && !S.stop; p++) {
          const birinchi = qatorlar()[0] && rid(qatorlar()[0]);
          for (const r of qatorlar()) {
            const id = rid(r);
            const a = [...r.querySelectorAll('.dropdown-item')].map((x) => x.textContent.trim());
            if (a.includes('Продлить') && !ROY.some((z) => z.id === id)) ROY.push({ id, nom: (r.querySelectorAll('td')[1] || r).textContent.trim().slice(0, 40), kat: false });
            else if (a.some((x) => /Продлить \(/.test(x)) && !ROY.some((z) => z.id === id)) ROY.push({ id, nom: (r.querySelectorAll('td')[1] || r).textContent.trim().slice(0, 40), kat: true });
          }
          msg('Ro\'yxat yig\'ilmoqda… ' + ROY.length + ' ta');
          const nx = [...document.querySelectorAll('a, button')].find((e) => e.offsetParent && e.textContent.trim() === '›' && !e.disabled && !(e.closest('li') && e.closest('li').classList.contains('disabled')));
          if (!nx) break;
          nx.click();
          const ok = await kut(() => qatorlar()[0] && rid(qatorlar()[0]) !== birinchi, 8000);
          if (!ok) break;
        }
      }
      const ISH = ROY.filter((z) => !z.kat && !qil.has(z.id));
      const KAT = ROY.filter((z) => z.kat);
      if (!S.yoq && !ISH.length) { msg('Aktiv qilinadigan tovar topilmadi' + (KAT.length ? ' (' + KAT.length + ' ta «Каталог» — qo\'lda)' : '') + '.'); S.yoq = true; }
      if (!S.yoq && !confirm('AL-BIRJACHIM: ' + ISH.length + ' ta tovar navbat bilan qayta joylanadi (Продлить → Tovarni joylashtirish).\n' + (KAT.length ? KAT.length + ' ta «Каталог» tovari o\'tkazib yuboriladi (qo\'lda).\n' : '') + 'E-IMZO so\'rasa — tasdiqlang. Boshlaymizmi?')) { msg('Bekor qilindi.'); S.yoq = true; }
      // Yetkazib berish muddati bo'sh bo'lsa — qancha kun qo'yilsin (xodim bir marta kiritadi)
      let YKUN = '';
      if (!S.yoq) {
        let sk = ''; try { sk = localStorage.getItem('bj_yetkazish_kun') || ''; } catch (_) { /* */ }
        const j = prompt('Yetkazib berish muddati bo\'sh tovarlarga necha KUN yozilsin? (kamida 5)', sk || '10');
        if (j === null) { msg('Bekor qilindi.'); S.yoq = true; }
        else { YKUN = String(Math.max(5, parseInt(j, 10) || 10)); try { localStorage.setItem('bj_yetkazish_kun', YKUN); } catch (_) { /* */ } }
      }
      // 2) Har birini qayta joylash
      let ok = 0; const X = [];
      for (let i = 0; i < ISH.length && !S.yoq && !S.stop; i++) {
        const z = ISH[i];
        msg('⏳ ' + (i + 1) + '/' + ISH.length + ' — <b>' + z.nom + '</b> anketasi ochilmoqda…<br>✅ ' + ok + ' ta' + (X.length ? ' · ⚠️ ' + X.length : ''));
        yolga('/provider/shop/republish-offer/' + z.id);
        const tg = await kut(() => { bor(); const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /Tovarni joylashtirish|Разместить товар/i.test(x.textContent)); const n = [...document.querySelectorAll('input')].filter((x) => x.offsetParent && x.type !== 'radio' && x.type !== 'checkbox' && /^\d[\d\s.,]{2,}$/.test(x.value.trim())).length >= 2; return b && n && !b.disabled ? b : null; }, 40000);
        if (!tg) { X.push(z.nom + ': anketa ochilmadi'); continue; }
        // Katalogdagi mahsulot o'chirilgan bo'lsa «Tovar (ish / xizmat)» bo'sh keladi — joylab bo'lmaydi
        await sl(600);
        const tovarBosh = (() => { const lb = [...document.querySelectorAll('label, span, div')].find((e) => e.childElementCount <= 1 && /^\*?\s*(Tovar \(ish \/ xizmat\)|Товар \(работа \/ услуга\))/i.test(e.textContent.trim()) && e.textContent.trim().length < 40); let b = lb; let ns = null; for (let k = 0; k < 5 && b && !ns; k++) { b = b.parentElement; ns = b && b.querySelector('ng-select'); } return ns && !ns.querySelector('.ng-value'); })();
        if (tovarBosh) { X.push(z.nom + ': mahsulot katalogda faol emas — yangi oferta kerak'); continue; }
        await sl(400);
        // Yetkazib berish muddati bo'sh bo'lsa — to'ldiramiz
        try {
          const lb2 = [...document.querySelectorAll('label, span, div, p')].find((e) => e.childElementCount <= 1 && /^\*?\s*(Yetkazib berish muddati|Срок поставки)/i.test(e.textContent.trim()) && e.textContent.trim().length < 40);
          let bx = lb2; let inp = null;
          for (let k = 0; k < 5 && bx && !inp; k++) { bx = bx.parentElement; inp = bx && [...bx.querySelectorAll('input')].find((x) => x.offsetParent && x.type !== 'radio' && x.type !== 'checkbox' && !x.closest('ng-select')); }
          if (inp && !inp.value.trim() && YKUN) {
            const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            inp.focus(); set.call(inp, YKUN);
            ['input', 'change', 'keyup', 'blur'].forEach((tt) => inp.dispatchEvent(new Event(tt, { bubbles: true })));
            await sl(400);
          }
        } catch (_) { /* */ }
        // Hisob raqamni qayta tanlash (eski ofertadagi raqam endi yaroqsiz bo'lishi mumkin)
        try {
          const lb = [...document.querySelectorAll('label, span, div')].find((e) => e.childElementCount <= 1 && /Hisob raqamni tanlang|Выберите расчетный счет|Hisob raqam/i.test(e.textContent.trim()) && e.textContent.trim().length < 40);
          let box = lb; let ns = null;
          for (let k = 0; k < 5 && box && !ns; k++) { box = box.parentElement; ns = box && box.querySelector('ng-select'); }
          if (ns && false) { // hisob raqami o'zgartirilmaydi (kerak emas ekan)
            const joriy = (ns.querySelector('.ng-value') || {}).textContent || '';
            const c = ns.querySelector('.ng-select-container') || ns;
            c.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            const ops = await kut(() => { const o = [...document.querySelectorAll('.ng-dropdown-panel .ng-option')].filter((x) => !x.classList.contains('ng-option-disabled')); return o.length ? o : null; }, 4000);
            if (ops) { const op = ops.find((x) => x.textContent.trim() === joriy.trim()) || (ops.length === 1 ? ops[0] : null); if (op) { op.click(); await sl(600); } }
            document.body.click();
          }
        } catch (_) { /* */ }
        tg.scrollIntoView({ block: 'center' });
        await sl(200);
        tg.click();
        msg('⏳ ' + (i + 1) + '/' + ISH.length + ' — <b>' + z.nom + '</b> joylanmoqda… <b>E-IMZO so\'rasa, tasdiqlang</b><br>✅ ' + ok + ' ta' + (X.length ? ' · ⚠️ ' + X.length : ''));
        const t0 = Date.now();
        const nat = await kut(() => {
          bor();
          if (Date.now() - t0 > 7000 && /republish-offer/.test(location.pathname) && [...document.querySelectorAll('div,span,small,p')].some((e) => e.offsetParent && e.childElementCount === 0 && /To.ldirilishi shart|обязательн/i.test(e.textContent))) return 'majburiy maydon to\'ldirilmagan (qo\'lda)';
          if (!/republish-offer/.test(location.pathname)) return 'ok';
          const er = [...document.querySelectorAll('.toast-error,[class*="toast-error"]')].find((e) => e.offsetParent && e.textContent.trim());
          return er ? 'xato: ' + er.textContent.trim().slice(0, 80) : null;
        }, 180000);
        if (nat === 'ok') { ok++; qil.add(z.id); saqla(); } else X.push(z.nom + ': ' + (nat || 'javob kelmadi'));
        await sl(500);
      }
      if (!S.yoq) msg('🏁 Tugadi. ✅ <b>' + ok + '</b> ta qayta joylandi (moderatsiyada)' + (X.length ? '<br>⚠️ ' + X.length + ' ta o\'tmadi:<br><span style="font-size:12px">' + X.slice(0, 6).join('<br>') + '</span>' : '') + (KAT.length ? '<br>«Каталог»: ' + KAT.length + ' ta — qo\'lda' : ''));
      const b = document.getElementById('bjAkS'); if (b) { b.textContent = 'Yopish'; b.onclick = () => pn.remove(); }
      window.__BJ_AKTIV = null;
      if (!S.yoq) yolga('/provider/shop/offer-list/8');
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
