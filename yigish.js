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
  // Qo'shimcha so'zlar: asosiy ro'yxatga tushmaganlar uchun ("Boshqa" kamaysin)
  const G2 = [
    ['Boyoq/kimyo', /химическ|реагент|инсектицид|дезинфек|(?<![а-яё])лак(?![а-яё])|чернил|клей|парафин|литол|смазк|фольгоизол/i],
    ['Kompyuter/ofis', /материнск|видеокарт|твердотельн|программн|(?<![а-яё])хаб|коммутацион|аудио|изображени|сервер|накопител|оперативн/i],
    ['Santexnika', /клапан|фланец|(?<![а-яё])труб|(?<![а-яё])таз(?![а-яё])|паронит|вантуз|(?<![а-яё])фум|кот[её]л|гофр|задвижк|вентил|сифон/i],
    ['Sement/beton/blok', /шпатл[её]вк|гранит|асфальт|наливн|плитк|тротуар|бордюр|(?<![а-яё])плита|мрамор|керамогранит/i],
    ['Asbob/mayda', /щ[её]тк|кетмен|грабл|совок|лестниц|стремянк|зажим|воздуходув|тестер|измерительн|рулетк|ножниц|тиск|опрыскиват|распылител/i],
    ['Elektr', /датчик|детектор|источник питан|стабилизатор|генератор|инвертор|солнечн|предохранит/i],
    ['Video/xavfsizlik', /охранн|радар|видеокамер|металлодетект|досмотр/i],
    ['Kanselyariya', /штамп|печать(?![а-яё])|таблич|издани|календар|грамот|баннер|плакат|вывеск/i],
    ["Xo'jalik/tozalash", /коробк|упаковк|пл[её]нк|коврик|ковров|пиал|зеркал|посуд|тарелк|кастрюл|поднос|стакан|сортировщик|конус(?![а-яё])/i],
    ["Sport/o'quv", /(?<![а-яё])мяч|обруч|тренаж|спортивн|стенд|мольберт|наглядн|учебн|глобус|доск[аи] школ|скакалк|гантел|теннис|шахмат/i],
    ['Mebel', /скамь|перил|ограждени|остановк|беседк|киоск/i],
    ['Avto/texnika qismlari', /колес|гидроцилиндр|цилиндр|минитрактор|трактор|подъ[её]мн|пресс|установк/i],
    ['Yogoch/plita', /плинтус|обои|потолочн|панел[ьи] пвх|вагонк/i],
    ['Qishloq xo\'jaligi', /живые|саженц|семен|удобрен|растени|цвет(ы|ок)|газон|корм(?![а-яё])/i],
    ['Kiyim/maxsus', /форм[аы] (школ|спорт|служ)|ткань|текстил|постельн|полотенц|одеял/i],
  ];
  const guruh = name => { for (const [g, re] of G) if (re.test(name)) return g; for (const [g, re] of G2) if (re.test(name)) return g; return 'Boshqa'; };

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
      // Jadval sekin yuklanishi mumkin (1000+ lot) — 45 soniyagacha kutamiz
      for (let w = 0; w < 180 && !first(); w++) { await sleep(250); S.kutish = Math.round(w / 4); }
      if (!first()) throw new Error("E-do'kon jadvali yuklanmadi — sahifani yangilab (F5) qayta urining");
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
      if (!Object.keys(all).length) throw new Error("E-do'kon lotlari o'qilmadi — eski ma'lumot saqlanib qoldi");
      const edokon = Object.values(all).map(c => [c[0], guruh(c[2]), c[2].replace(/\s+/g, ' '), num(c[6]), num(c[7]), iso(c[4])]).filter(r => r[5]);
      // Biz narx bergan lotlar: "Men taklif etgan narx" ustunida narx bor (masalan "72 000,00 UZS Narxni yangilash")
      const takliflar = Object.values(all).filter(c => c[8] && !/Taklif berish/i.test(c[8]) && /\d/.test(c[8]))
        .map(c => [c[0], c[2].replace(/\s+/g, ' '), num(c[6]), num(c[8].split(/narx/i)[0]), num(c[7]), iso(c[4])]);
      S.takliflar = takliflar.length;

      // 1b) Tahlil (Avtopilot kabi): qo'lga ilinadigan lotlar uchun hudud, ehtimoliy xaridor, 3 oylik yutilgan narx
      S.bosqich = 'tahlil';
      const SHOP = 'https://xarid-api-shop.uzex.uz/Common';
      const TRADE = 'https://xarid-api-trade.uzex.uz';
      const POST = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
      const REG = {};
      try { (await (await fetch(TRADE + '/Lib/GetRegions')).json()).forEach(r => REG[r.id] = r.name); } catch (e) { }
      const DIS = {};
      const tumanNomi = async (rid, did) => {
        if (!DIS[rid]) DIS[rid] = fetch(TRADE + '/Lib/GetDistricts/' + rid).then(r => r.json()).then(a => Object.fromEntries(a.map(d => [d.id, d.name]))).catch(() => ({}));
        return (await DIS[rid])[did] || '';
      };
      const chegara = Date.now() - 90 * 864e5;
      const y0 = new Date().getFullYear(), YILLAR = new Date().getMonth() < 3 ? [y0, y0 - 1] : [y0];
      // Bitimlar API sahifalari barqaror tartiblanmaydi — ustma-ust oyna (11 qadam) + deal_id bo'yicha takrorsiz
      async function bitimOl(filtr, maxSahifa, toxta) {
        const out = new Map();
        for (const yil of YILLAR) {
          for (let f = 1, k = 0; k < maxSahifa; f += 11, k++) {
            let a; try { a = await POST(SHOP + '/GetCompletedDeals', { from: f, to: f + 12, display_on_shop: 1, display_on_national: 0, year_id: yil, ...filtr }); } catch (e) { break; }
            if (!Array.isArray(a) || !a.length) break;
            for (const x of a) out.set(x.deal_id, x);
            if (out.size >= (a[0].total_count || 0)) break;
            if (toxta && new Date(a[a.length - 1].deal_date) < toxta) break;
          }
        }
        return [...out.values()];
      }
      const KESH = {};
      const keshla = (k, f) => KESH[k] || (KESH[k] = f());
      // Tuman nomini solishtirish: kirill/lotin, o'zbekcha/ruscha — undosh "skelet" (Алмалык = Olmaliq = Олмалик → lmlk)
      const TR = { а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'e', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', қ: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ў: 'u', ф: 'f', х: 'h', ҳ: 'h', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya' };
      const lat = t => String(t || '').toLowerCase().replace(/[а-яёғқўҳ]/g, c => TR[c] ?? '').replace(/dj/g, 'j').replace(/q/g, 'k').replace(/x/g, 'h').replace(/w/g, 'v');
      const skelet = t => lat(t).replace(/[^a-z]/g, '').replace(/[aeiouy]/g, '').replace(/(.)\1+/g, '$1');
      const TUMAN_SOZ = /^(район|р-он|р-н|tumani|tuman|туман\S*|shahri|shahar|шахар\S*|sh\.?|г\.?|город|city)$/i;
      const tumanIldiz = t => { const w = String(t || '').replace(/(^|\s)(г|sh|ш)\.\s*/gi, ' ').split(/\s+/).filter(x => x && !TUMAN_SOZ.test(x))[0] || ''; const k = skelet(w.replace(/(ский|ская|ское|ий)$/i, '')); return k.length >= 3 ? k.slice(0, 4) : ''; };
      const nomdaTuman = (nom, il) => !!il && String(nom || '').split(/[\s"«».,()-]+/).some(w => skelet(w).startsWith(il));
      const tq = edokon.filter(e => e[3] >= 3 && e[3] * e[4] >= 10e6 && new Date(e[5] + ':00+05:00') > Date.now())
        .sort((a, b) => b[3] * b[4] - a[3] * a[4]).slice(0, 150);
      // Narx bergan lotlarimiz ham (taxmin to'g'ri chiqqanini keyin tekshirish uchun)
      const tqIds = new Set(tq.map(e => e[0]));
      for (const t of takliflar) if (!tqIds.has(t[0])) { const e = edokon.find(z => z[0] === t[0]); if (e) tq.push(e); }
      // Boshqa korxona yig'ishida (3 kun ichida) tahlil qilingan lotlar qayta tahlil qilinmaydi — tezlik uchun
      const eski = {};
      try { const jj = await (await fetch(API, { cache: 'no-store' })).json(); for (const r of (jj.edokon || [])) if (r[7] && r[7].x) eski[r[0]] = r[7]; } catch (x) { }
      const yangi = tq.filter(e => { if (eski[e[0]]) { e[6] = eski[e[0]]; return false; } return true; });
      S.tahlilJami = yangi.length; S.tahlilTayyor = tq.length - yangi.length; S.tahlil = 0;
      let ti = 0;
      const tahlilchi = async () => {
        while (ti < yangi.length) {
          const e = yangi[ti++];
          try {
            const g = await (await fetch(SHOP + '/GetLot/' + String(e[0]).slice(-7))).json();
            const code = g && g.product_code;
            let joy = []; try { joy = JSON.parse(g.js_lot_delivery_district || '[]'); } catch (x) { }
            const regs = [...new Set(joy.map(z => z.Region_Id))];
            const R = regs.length === 1 ? regs[0] : null;            // bir nechta viloyat bo'lsa — hudud bo'yicha taxmin qilinmaydi
            const Dd = R && joy.length <= 2 ? joy[0].District_Id : null;
            const hudud = R ? (REG[R] || '') : (regs.length > 1 ? regs.length + ' ta viloyat' : '');
            const tuman = Dd ? await tumanNomi(R, Dd) : '';
            const il = tumanIldiz(tuman);
            // 1) Narx: shu tovar, butun respublika, oxirgi 3 oy
            const B = code ? (await keshla('n|' + code, () => bitimOl({ product_code: code }, 3, chegara))).filter(x => new Date(x.deal_date) >= chegara) : [];
            const np = B.filter(x => x.amount > 0 && x.deal_cost > 0).map(x => x.deal_cost / x.amount).sort((a, b) => a - b);
            // 2) Nomzodlar: shu tovarni SHU VILOYATDA olganlar (butun yil), kam bo'lsa — respublika bo'yicha
            let H = code && R ? await keshla('h|' + code + '|' + R, () => bitimOl({ product_code: code, region_id: R }, 3)) : [];
            const xar = {};
            const qosh = (x, viloyatda) => {
              const k = x.customer_inn || x.customer_name;
              const o = xar[k] || (xar[k] = { i: x.customer_inn, n: String(x.customer_name || '').replace(/\s+/g, ' ').slice(0, 90), h: x.customer_region_name || '', c: 0, v: viloyatda, t: 0, oxirgi: '' });
              o.c++; if (x.deal_date > o.oxirgi) o.oxirgi = x.deal_date;
            };
            H.forEach(x => qosh(x, 1));
            if (Object.keys(xar).length < 3) B.forEach(x => qosh(x, hudud && x.customer_region_name === hudud ? 1 : 0));
            // Ball (0–10): tuman mos +4, viloyat mos +3, xaridlar soni +0..2, yaqinda (3 oy) +1
            for (const o of Object.values(xar)) {
              o.t = nomdaTuman(o.n, il) ? 1 : 0;
              o.b = Math.min(10, (o.t ? 4 : 0) + (o.v ? 3 : 0) + Math.min(2, o.c - 1 + 1) + (new Date(o.oxirgi) >= chegara ? 1 : 0));
            }
            const top = Object.values(xar).sort((a, b) => b.b - a.b || b.c - a.c).slice(0, 3).map(o => [o.i, o.n, o.h, o.c, o.b, o.t]);
            e[6] = { h: hudud, t: tuman, k: /казн/i.test(g.lot_note || '') ? 1 : 0, n: np.length,
              p: np.length ? [Math.round(np[0]), Math.round(np[np.length - 1]), Math.round(np[Math.floor(np.length / 2)])] : null, x: top };
          } catch (x) { }
          S.tahlil++;
        }
      };
      await Promise.all(Array.from({ length: 8 }, tahlilchi));
      // Narx bergan lotlarimiz uchun taxminni saqlaymiz: savdo tugagach to'g'ri chiqqani tekshiriladi
      for (const t of takliflar) { const e = edokon.find(z => z[0] === t[0]); if (e && e[6] && e[6].x) t[6] = e[6].x.map(z => [z[0], z[1], z[4]]); }

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
              for (let f = 1; f <= 11 * 25 && !found; f += 11) {
                const a = await (await fetch(SHOP + '/GetCompletedDeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: f, to: f + 12, display_on_shop: 1, display_on_national: 0, year_id: new Date(t.tugash).getFullYear(), product_code: code }) })).json();
                if (!Array.isArray(a) || !a.length) break;
                found = a.find(x => String(x.lot_display_no) === String(t.lot));
                if (!found && new Date(a[a.length - 1].deal_date) < new Date(new Date(t.tugash).getTime() - 864e5)) break;
              }
            }
            if (found) {
              natijalar.push({ korxona, lot: t.lot, holat: biz(found.provider_name) ? 'yutdi' : 'yutqazdi', golib: found.provider_name, golib_stir: found.provider_inn,
                shartnoma_summa: found.deal_cost, dona_narx: found.amount ? found.deal_cost / found.amount : found.deal_cost, ishtirokchilar: found.pcp_count,
                buyurtmachi: found.customer_name, buyurtmachi_stir: found.customer_inn, bitim_sana: found.deal_date });
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
