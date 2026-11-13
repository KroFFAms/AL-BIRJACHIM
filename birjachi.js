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
  // Har bir qatorda saytning o'z «Продлить» tugmasini navbat bilan bosadi. E-IMZO so'rasa — xodim tasdiqlaydi.
  if (P.xarid.host.test(h) && /\/provider\/shop\/offer-list\//.test(location.pathname)) {
    if (window.__BJ_AKTIV) { alert('AL-BIRJACHIM: aktiv qilish allaqachon ishlayapti.'); return; }
    window.__BJ_AKTIV = { stop: false };
    const S = window.__BJ_AKTIV;
    const sl = (ms) => new Promise((r) => setTimeout(r, ms));
    const pn = document.createElement('div');
    pn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#0f1b2d;color:#e8eef7;font:14px/1.45 Segoe UI,Arial,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);width:340px';
    pn.innerHTML = '<b>♻️ AL-BIRJACHIM — ofertalarni aktiv qilish</b><div id="bjAkM" style="margin:8px 0;color:#b9c8dc">Tayyorlanmoqda…</div><button id="bjAkS" style="background:#d9473b;color:#fff;border:0;border-radius:8px;padding:6px 12px;cursor:pointer">To\'xtatish</button>';
    document.body.appendChild(pn);
    const msg = (t) => { pn.querySelector('#bjAkM').innerHTML = t; };
    pn.querySelector('#bjAkS').onclick = () => { S.stop = true; msg('To\'xtatilmoqda…'); };
    const PRO = /Продлить|Uzaytir|Muddatini|Prolong/i;
    const birinchi = () => { const r = [...document.querySelectorAll('tbody tr')].find((x) => x.offsetParent && x.querySelector('td')); return r || null; };
    const rid = (r) => (r ? (r.querySelector('td') || r).textContent.trim().split(/\s+/)[0] : '');
    const jami = () => { const m = /of\s+(\d+)/i.exec(document.body.innerText); return m ? +m[1] : null; };
    (async () => {
      let ok = 0, xato = 0, otk = new Set();
      await sl(1500);
      const n0 = jami();
      if (!birinchi()) { msg('Bu ro\'yxat bo\'sh — aktiv qiladigan tovar yo\'q.'); S.stop = true; }
      else if (!confirm('AL-BIRJACHIM: shu ro\'yxatdagi ' + (n0 != null ? n0 + ' ta ' : '') + 'tovar navbat bilan «Продлить» qilinadi.\nE-IMZO so\'rasa — kalitni tanlab tasdiqlang.\nBoshlaymizmi?')) { msg('Bekor qilindi.'); S.stop = true; }
      while (!S.stop) {
        // o'tkazib yuborilganlardan keyingi birinchi qator
        const rows = [...document.querySelectorAll('tbody tr')].filter((x) => x.offsetParent && x.querySelector('td'));
        const r = rows.find((x) => !otk.has(rid(x)));
        if (!r) break;
        const id = rid(r);
        const ic = [...r.querySelectorAll('td:last-child *')].find((e) => e.offsetParent && (e.tagName === 'I' || e.tagName === 'A' || e.tagName === 'BUTTON' || e.tagName === 'SPAN' || e.tagName === 'svg'));
        (ic || r.querySelector('td:last-child')).click();
        await sl(500);
        const it = [...document.querySelectorAll('.dropdown-item, a, button')].find((e) => e.offsetParent && PRO.test(e.textContent.trim()) && e.textContent.trim().length < 40);
        if (!it && !ok && !xato) { document.body.click(); msg('Bu sahifada «Продлить» yo\'q. Chap menyuda <b>Mening mahsulotlarim → Срок истек</b> ni oching va «🔄 Birjachi» ni qayta bosing.'); S.yoq = true; break; }
        if (!it) { otk.add(id); xato++; document.body.click(); msg('✅ ' + ok + ' ta aktiv · ⚠️ ' + xato + ' ta o\'tkazildi (Продлить yo\'q: ' + id + ')'); await sl(400); continue; }
        it.click();
        msg('⏳ ' + id + ' — aktiv qilinmoqda… (E-IMZO so\'rasa, tasdiqlang)<br>✅ ' + ok + ' ta · ⚠️ ' + xato + ' ta');
        // ro'yxat yangilanib, shu tovar yo'qolishini kutamiz (E-IMZO uchun 3 daqiqagacha)
        let ketdi = false;
        for (let i = 0; i < 360 && !S.stop; i++) {
          await sl(500);
          const hozir = [...document.querySelectorAll('tbody tr')].filter((x) => x.offsetParent && x.querySelector('td')).map(rid);
          if (!hozir.includes(id)) { ketdi = true; break; }
          if ([...document.querySelectorAll('.toast-error,[class*="toast-error"],[class*="noty_type__error"],.swal2-icon-error')].some((e) => e.offsetParent)) { await sl(1500); break; }
        }
        if (ketdi) ok++; else { otk.add(id); xato++; }
        msg('✅ ' + ok + ' ta aktiv qilindi · ⚠️ ' + xato + ' ta o\'tkazildi');
        await sl(600);
      }
      if (!S.yoq) msg((S.stop && !ok && !xato ? '' : '🏁 Tugadi. ') + '✅ <b>' + ok + '</b> ta aktiv qilindi' + (xato ? ' · ⚠️ ' + xato + ' ta o\'tkazildi (qo\'lda tekshiring)' : '') + '<br><span style="font-size:12px">«Опубликован» ro\'yxatida ko\'rinadi.</span>');
      pn.querySelector('#bjAkS').textContent = 'Yopish';
      pn.querySelector('#bjAkS').onclick = () => pn.remove();
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
