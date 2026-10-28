// AL-BIRJACHIM yig'uvchi — xarid.uzex.uz kabinetida (provider/shop/rival-lots/0) ishga tushiriladi.
// FAQAT O'QIYDI: ro'yxat sahifalarini "›" bilan varaqlaydi, hech qanday "Taklif berish"/tasdiqlash bosilmaydi.
// Natija: window.__BIRJA = {holat:'ISHLAYAPTI'|'TAYYOR'|'XATO'|'KIRISH_KERAK', ...}
(() => {
  if (window.__BIRJA && window.__BIRJA.holat === 'ISHLAYAPTI') return 'allaqachon ishlayapti';
  const S = window.__BIRJA = { holat: 'ISHLAYAPTI', bosqich: 'boshlandi', boshlandi: new Date().toISOString() };
  const API = 'https://dbdtnujcospnsuwwazbs.supabase.co/functions/v1/birja';
  const AUK = 'https://xarid-api-auction.uzex.uz/Common';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pad = n => String(n).padStart(2, '0');
  const iso = s => { const m = s.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+)/); return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}T${pad(m[4])}:${pad(m[5])}` : ''; };
  const num = s => parseFloat(String(s).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;

  const L = '(?<![а-яё])';
  const G = [
  ['Xizmatlar', new RegExp(L+'услуг|'+L+'ремонт|обслуживан|транспортировк|перевозк|монтаж|утилизац|обследован','i')],
  ['Video/xavfsizlik', new RegExp('видеонаблюд|видеорегистр|'+L+'камер|домофон|турникет|шлагбаум|сигнализац|распознавания лиц|экстренного вызова|огнетушит|пожарн','i')],
  ['Kompyuter/ofis', new RegExp('компьютер|ноутбук|моноблок|принтер|картридж|тонер|монитор|сканер|проектор|коммутатор|маршрутизатор|роутер|жесткий диск|флеш|клавиатур|'+L+'мыш|планшет|бесперебой|сервер|модем|точка доступа|сетевой адаптер|интерактивн|телефон|смартфон|микрофон|колонк|звуков|радиостанц|копир|МФУ|SATA|веб-камер','i')],
  ['Maishiy texnika', new RegExp('кондиционер|холодильник|морозильник|телевизор|пылесос|чайник|утюг|кулер|микроволнов|стиральн|блендер|кофемашин|фен'+'(?![а-яё])|вентилятор|обогреват|плита газ|электроплит','i')],
  ['Kanselyariya', new RegExp('бумаг|папк|файл-вкладыш|перфофайл|канцеляр|скотч|степлер|блокнот|тетрад|книг|журнал|бланк|конверт|ручка шарик|ручка гелев|фоторамк|доска магнит|доска маркер|меловая|органайзер|грамот|медаль|флаг|календар|ежедневник','i')],
  ['Tom/devor qoplama', /профнаст|профлист|металлочереп|шифер|кровел|кровл|сэндвич|ондулин|поликарбонат|декоративная панель|натяжной потол/i],
  ['Metall prokat', /арматур(?!а для сливн)|уголок|швеллер|двутавр|профиль металл|труба стальн|труб[аы] профил|лист стальн|прокат|проволок|сетка|металлопрокат|катанк|полоса стал|решетк|жесть|лист из .*стал|лист металл|конструкция металл/i],
  ['Sement/beton/blok', new RegExp('цемент|бетон|кирпич|шлакоблок|газоблок|пеноблок|песок|щеб[её]н|гравий|'+L+'гипс|шпакл|штукатур|раствор|смесь сух|смеси песч|клей плит|плиточн|'+L+'плитк|кафел|керамогран|бордюр|брусчат|базальт|стекловат|линолеум','i')],
  ['Yogoch/plita', /доск|брус|фанер|ДСП|ДВП|OSB|ОСБ|ламинат|древес|пиломат|МДФ|гипсокартон|рейк|стропил/i],
  ['Boyoq/kimyo', /краск|эмал|грунт|растворит|олиф|пена монт|герметик|силикон|мастик|битум|гидроизол|рубероид|утеплит|минвата|пенопласт|водоэмульс|'+'клей/i],
  ['Santexnika', new RegExp('смесител|'+L+'кран(?![а-яё])|унитаз|раковин|'+L+'ванн|фитинг|муфт|отвод|тройник|полипроп|канализ|насос|'+L+'бак(?![а-яё])|водонагр|радиатор|вентил|задвижк|труба пласт|трубы пласт|труба напорн|труба гофр|сливного бач|сифон|душ|бачок|шланг|рукав','i')],
  ['Elektr', new RegExp('кабел|провод|выключат|розетк|светильн|'+L+'ламп|LED|светодиод|прожектор|'+L+'щит|счетчик|удлинит|электрод|регулятор напряж|трансформатор|контактор|автомат|реле|генератор|фотоэлектрич|солнечн|изолент|распределительн|патрон для ламп','i')],
  ['Xo\'jalik/tozalash', /веник|метл|тряпк|швабр|ведро|мыло|моющ|чистящ|освежит|перчатк|салфетк|мусор|урна|пакет|мешк|полиэтилен|контейнер|ёмкост|емкост|ящик|корзин|бочк|посуд|кастрюл|чашк|фужер|стакан|тарелк/i],
  ['Mebel', new RegExp(L+'стол(?!б)|'+L+'стул|кресл|шкаф|'+L+'полк|диван|мебел|тумб|стеллаж|верстак|ширма|скамейк','i')],
  ['Tibbiyot', /медицин|шприц|аптечк|лекарств|бинт|маск|тест-|анализатор|лаборатор|пипет|химическая посуд|стандартн(ый|ые) образ|диагностическ|слухов|стимулятор|стерил/i],
  ['Kiyim/maxsus', /одежд|костюм|обув|сапог|куртк|халат|спецодежд|каск|жилет|шлем|перчатки трикот/i],
  ['Avto/texnika qismlari', new RegExp(L+'шин|покрышк|аккумулятор|масло мотор|фильтр|запасн|ремкомплект|колод|подшипник|двигател|рессор|сцеплен|прицеп|нож грейдер|косилк|газонокосил|опрыскиват|компрессор|сварочн','i')],
  ['Asbob/mayda', /замок|замки|саморез|шуруп|гвозд|болт|гайк|дюбел|анкер|инструмент|дрель|перфорат|шлифмаш|болгар|лопат|молот|отверт|ключ|петл|навес|диск для|сверл|рулетк|уровень|кисть|валик|шпател|шуруповерт|пила|кирк|стремянк|нивелир|клещи|паяльник/i],
  ['Eshik/deraza', new RegExp('двер|'+L+'окн|оконн|стеклопакет|жалюзи|'+L+'ворот','i')],
  ['Oziq-ovqat', /мука|сахар|масло растит|'+'(?<![а-яё])чай(?![а-яё])|кофе|вода питьев|питьевая вода|мясо|молок|хлеб|крупа|рис |макарон|консерв/i],
];
  const guruh = name => { for (const [g, re] of G) if (re.test(name)) return g; return 'Boshqa'; };

  (async () => {
    try {
      if (!/\/provider\//.test(location.pathname) || /login/.test(location.href)) { S.holat = 'KIRISH_KERAK'; return; }
      // Qaysi korxona kalitida kirilgan — kabinet tepasidagi nomdan
      const ROL = /ПОСТАВЩИК|ЗАКАЗЧИК|YETKAZIB BERUVCHI|BUYURTMACHI/i;
      const rolEl = [...document.querySelectorAll('header *, nav *, .header *, body *')].find(e => e.children.length === 0 && ROL.test(e.textContent) && e.textContent.trim().length < 30);
      const korxona = (rolEl && rolEl.parentElement ? rolEl.parentElement.innerText : '').replace(new RegExp(ROL.source, 'gi'), '').replace(/\s+/g, ' ').trim();
      if (!korxona) { S.holat = 'XATO'; S.xato = 'Korxona nomi topilmadi (kabinet tepasida)'; return; }
      S.korxona = korxona;
      // 1) E-do'kon: Tushgan takliflar — sahifama-sahifa
      S.bosqich = "e-do'kon";
      const all = {};
      const first = () => { const r = document.querySelector('table tbody tr'); return r ? r.cells[0].innerText.trim() : ''; };
      for (let w = 0; w < 40 && !first(); w++) await sleep(250);
      let stuck = 0;
      for (let p = 0; p < 400; p++) {
        for (const tr of document.querySelectorAll('table tbody tr')) {
          const c = [...tr.cells].map(x => x.innerText.trim());
          if (c[0] && /^\d{10,}$/.test(c[0])) all[c[0]] = c;
        }
        const info = document.body.innerText.match(/(\d+) - (\d+) of (\d+)/);
        S.sahifa = p + 1; S.jami = info ? +info[3] : null; S.yigildi = Object.keys(all).length;
        if (info && +info[2] >= +info[3]) break;
        const nx = [...document.querySelectorAll('.pagination a, ul.pagination a')].find(a => a.textContent.trim() === '›');
        if (!nx) break;
        const f = first(); nx.click();
        let ok = false;
        for (let i = 0; i < 40; i++) { await sleep(250); if (first() && first() !== f) { ok = true; break; } }
        if (!ok && ++stuck > 2) break;
      }
      const edokon = Object.values(all).map(c => [c[0], guruh(c[2]), c[2].replace(/\s+/g, ' '), num(c[6]), num(c[7]), iso(c[4])]).filter(r => r[5]);
      // Biz narx bergan lotlar: "Men taklif etgan narx" ustunida narx bor (masalan "72 000,00 UZS Narxni yangilash")
      const takliflar = Object.values(all).filter(c => c[8] && !/Taklif berish/i.test(c[8]) && /\d/.test(c[8]))
        .map(c => [c[0], c[2].replace(/\s+/g, ' '), num(c[6]), num(c[8].split(/narx/i)[0]), num(c[7]), iso(c[4])]);
      S.takliflar = takliflar.length;

      // 2) Auksion: ochiq ro'yxat + har lot tafsiloti
      S.bosqich = 'auksion';
      const L = [];
      for (let f = 1; f <= 3000; f += 20) {
        const r = await fetch(AUK + '/GetMinimizedLotsList', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: f, to: f + 19 }) });
        if (!r.ok) break;
        const a = await r.json();
        if (!Array.isArray(a) || !a.length) break;
        L.push(...a);
        if (L.length >= a[0].total_count) break;
      }
      const D = {}; let k = 0;
      const worker = async () => { while (k < L.length) { const x = L[k++]; try { D[x.id] = await (await fetch(AUK + '/GetLot/' + x.id)).json(); } catch (e) { } S.auksionTafsilot = Object.keys(D).length; } };
      await Promise.all(Array.from({ length: 8 }, worker));
      const auksion = L.map(x => {
        const d = D[x.id] || {};
        const pr = [...new Set((d.js_details || []).map(p => p.product_name))];
        return [x.id, x.display_no, x.customer_type, (d.customer_name || '').replace(/\s+/g, ' '), x.category_name, x.start_cost, String(x.end_date).replace(/:\d\d(\.\d+)?$/, '').slice(0, 16), pr.length, pr.join('; ').replace(/\s+/g, ' ').slice(0, 200)];
      });

      // 3) Supabase'ga yozish
      S.bosqich = 'yozish';
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ korxona, manba: "xarid.uzex.uz — kabinet (Tushgan takliflar) + ochiq Auksion", edokon, auksion, takliflar }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error('Supabase: ' + r.status + ' ' + (j.xato || ''));
      // 4) Tugagan takliflarimiz natijasi: "Amalga oshgan bitimlar" (ochiq ma'lumot) dan qidiriladi
      S.bosqich = 'natijalar';
      const SHOP = 'https://xarid-api-shop.uzex.uz/Common';
      const norm = x => String(x || '').toUpperCase().replace(/["'«»‘’`ʻʼ.]/g, '').replace(/(^|\s)(MCHJ|МЧЖ|OOO|ООО|XK|AJ|MAS'?ULIYATI CHEKLANGAN JAMIYAT)(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
      const biz = n => { const a = norm(n), b = norm(korxona); return a.length > 5 && b.length > 5 && (a.startsWith(b) || b.startsWith(a)); };
      let kut = [];
      try { kut = await (await fetch(API + '?kutilayotgan=1', { cache: 'no-store' })).json(); } catch (e) { kut = []; }
      kut = (Array.isArray(kut) ? kut : []).filter(t => t.korxona === korxona).slice(0, 60);
      S.tekshiriladi = kut.length;
      const natijalar = [];
      let q = 0;
      const tek = async () => {
        while (q < kut.length) {
          const t = kut[q++];
          try {
            const id = String(t.lot).slice(-7);
            const g = await (await fetch(SHOP + '/GetLot/' + id)).json();
            const code = g && g.product_code;
            let found = null;
            if (code) {
              for (let f = 1; f <= 12 * 25 && !found; f += 12) {
                const a = await (await fetch(SHOP + '/GetCompletedDeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: f, to: f + 11, display_on_shop: 1, display_on_national: 0, year_id: new Date(t.tugash).getFullYear(), product_code: code }) })).json();
                if (!Array.isArray(a) || !a.length) break;
                found = a.find(x => String(x.lot_display_no) === String(t.lot));
                if (!found && new Date(a[a.length - 1].deal_date) < new Date(new Date(t.tugash).getTime() - 864e5)) break;
              }
            }
            if (found) {
              natijalar.push({ korxona, lot: t.lot, holat: biz(found.provider_name) ? 'yutdi' : 'yutqazdi', golib: found.provider_name, golib_stir: found.provider_inn,
                shartnoma_summa: found.deal_cost, dona_narx: found.amount ? found.deal_cost / found.amount : found.deal_cost, ishtirokchilar: found.pcp_count,
                buyurtmachi: found.customer_name, bitim_sana: found.deal_date });
            } else natijalar.push({ korxona, lot: t.lot, holat: 'kutilmoqda' });
          } catch (e) { }
          S.tekshirildi = natijalar.length;
        }
      };
      await Promise.all(Array.from({ length: 4 }, tek));
      if (natijalar.length) {
        const rn = await fetch(API + '?natija=1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ natijalar }) });
        const jn = await rn.json().catch(() => ({}));
        S.natijaYozildi = jn.yozildi; S.natijaTelegram = jn.telegram;
      }
      S.natijalar = natijalar.filter(n => n.holat !== 'kutilmoqda').map(n => `${n.holat}: ${n.lot} → ${n.golib || ''} ${Math.round(n.dona_narx || 0)} (${n.ishtirokchilar ?? '?'} ishtirokchi)`);

      const mos = edokon;
      const qiziq = mos.filter(e => e[3] >= 3 && e[3] * e[4] >= 10e6);
      S.natija = { korxona, telegram: j.telegram, edokon: edokon.length, bizgaMos: mos.length, qiziq: qiziq.length, auksion: auksion.length,
        top: qiziq.sort((a, b) => b[3] * b[4] - a[3] * a[4]).slice(0, 10).map(e => `${e[2]} — ${e[3]} × ${Math.round(e[4]).toLocaleString('ru-RU')} = ${Math.round(e[3] * e[4] / 1e6)} mln (${e[5].replace('T', ' ')})`) };
      S.holat = 'TAYYOR';
    } catch (e) { S.holat = 'XATO'; S.xato = String(e && e.message || e); }
    S.tugadi = new Date().toISOString();
  })();
  return 'boshlandi';
})();
