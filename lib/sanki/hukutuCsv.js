// lib/sanki/hukutuCsv.js
// 三基CSV（A〜Z列）の定義 + グループ化 + バリデーション + CSV出力

export const SANKI_COLUMNS = [
  { key: 'consigneeCode', label: 'A 荷受人ｺｰﾄﾞ\n半角英数字 15桁以内\n※使用しない' },
  { key: 'tel',            label: 'B 電話番号 ※必須\n半角数字・ハイフン可\n最大17文字' },
  { key: 'addr1',          label: 'C 住所 ※必須\n全半角英数カナ\n最大20文字' },
  { key: 'addr2',          label: 'D 住所２\n全半角英数カナ\n最大20文字' },
  { key: 'addr3',          label: 'E 住所３（コメント）\n全半角英数カナ\n最大20文字' },
  { key: 'name1',          label: 'F 名前 ※必須\n全半角英数カナ\n最大20文字' },
  { key: 'name2',          label: 'G 名前２\n全半角英数カナ\n最大20文字' },
  { key: 'postal',         label: 'H 郵便番号 ※必須\n例：123-4567 \nまたは 1234567' },
  { key: 'specialCount',   label: 'I 特殊計\n半角数字\n最大5文字' },
  { key: 'arrivalBranch',  label: 'J 着店コード\n半角数字\n最大3文字' },
  { key: 'shipperCode',    label: 'K ご依頼主ｺｰﾄﾞ\n半角英数字\n最大12文字' },
  { key: 'pieces',         label: 'L 個数 ※必須\n半角数字\n1～99' },
  { key: 'size',           label: 'M 才数\n半角数字\n最大3桁' },
  { key: 'weight',         label: 'N 重量 ※必須\n半角数字\n最大4桁' },
  { key: 'transport1',     label: 'O 輸送商品１\n全角英数カナ15文字\n半角数字3桁' },
  { key: 'transport2',     label: 'P 輸送商品２\n全角英数カナ15文字\n半角数字3桁' },
  { key: 'itemText1',      label: 'Q 品名記事１\n全半角英数カナ混在可\n最大30文字' },
  { key: 'itemText2',      label: 'R 品名記事２\n全半角英数カナ混在可\n最大30文字' },
  { key: 'itemText3',      label: 'S 品名記事３\n全半角英数カナ混在可\n最大30文字' },
  { key: 'deliveryDate',   label: 'T 配達指定日\n半角数字8桁\n例：20250131' },
  { key: 'customerNo',     label: 'U お客様管理番号\n半角英数字\n最大16文字' },
  { key: 'spare',          label: 'V 予備\n最大30文字' },
  { key: 'paymentType',    label: 'W 元払区分 ※必須\n半角数字1桁\n1：元払' },
  { key: 'insurance',      label: 'X 保険金額\n半角数字4桁\n0～9999' },
  { key: 'shipDate',       label: 'Y 出荷日付 ※必須\n半角数字8桁\n例：20250131' },
  { key: 'registerDate',   label: 'Z 登録日付\n半角数字8桁\n空欄→当日自動' },
];


// =========================
//  バリデーションルール
// =========================

const SANKI_RULES = {
  tel:           { required: true,  max: 17 },
  addr1:         { required: true,  max: 20 },
  addr2:         {               max: 20 },
  addr3:         {               max: 20 },
  name1:         { required: true,  max: 20 },
  name2:         {               max: 20 },
  postal:        { required: true,  type: 'postal', max: 8 },

  specialCount:  { max: 5 },
  arrivalBranch: { max: 3 },
  shipperCode:   { max: 12 },

  pieces: { required: true, type: 'number', min: 1, max: 10 },
  size:          { type: 'number', max: 3 },
  weight:        { required: true, type: 'number', max: 9999 },

  transport1:    { max: 15 },
  transport2:    { max: 15 },
  itemText1:     { max: 30 },
  // ★ itemText2, itemText3 は「全文」なのでルールから外す

  deliveryDate:  { type: 'date8', max: 8 },
  customerNo:    { max: 16 },
  spare:         { max: 30 },
  paymentType:   { required: true, max: 1 },
  insurance:     { type: 'number', max: 4 },
  shipDate:      { required: true, type: 'date8', max: 8 },
  registerDate:  { type: 'date8', max: 8 },
};


// =========================
//  共通ヘルパ
// =========================

const onlyDigits = (s) => String(s ?? '').replace(/\D/g, '');

const normalizeQty = (v) => {
  if (typeof v === 'number') return v;
  const n = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const leftOfHyphen = (name) => {
  if (!name) return '';
  const s = String(name);
  const idx = s.indexOf('-');
  return (idx >= 0 ? s.slice(0, idx) : s).trim();
};

const formatPostalRaw7 = (postal) => {
  if (postal == null) return '';
  const raw = String(postal).trim();
  if (!raw) return '';
  const d = onlyDigits(raw).padStart(7, '0').slice(0, 7);
  return d || '';
};

export const formatPostalDisp = (postal) => {
  const d = formatPostalRaw7(postal);
  return d ? `${d.slice(0, 3)}-${d.slice(3)}` : '';
};
export const formatPostalCsv = (postal) => formatPostalDisp(postal);

export const formatTel = (tel) => {
  if (!tel) return '';
  let s = String(tel).replace(/[^\d-]/g, '');
  if (!s.includes('-')) s = onlyDigits(s);
  return s;
};

export const formatDate8 = (v) => {
  if (!v) return '';

  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  // Excelシリアル値対応
  if (typeof v === 'number') {
    const base = new Date(Date.UTC(1899, 11, 30));
    const ms = base.getTime() + v * 86400000;
    const dt = new Date(ms);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  const digits = String(v).replace(/\D/g, '');
  return digits.length === 8 ? digits : '';
};

const escapeCsv = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};


// =========================
//  バリデーション
// =========================

export const validateSankiCell = (row, colKey) => {
  const rule = SANKI_RULES[colKey];
  if (!rule) return { valid: true };

  const raw = row[colKey];
  const value = raw == null ? '' : String(raw);

  if (rule.required && value.trim() === '') {
    return { valid: false, reason: 'required' };
  }

  if (rule.max && value.length > rule.max) {
    return { valid: false, reason: 'length' };
  }

  if (rule.type === 'postal' && value.trim() !== '') {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 7) return { valid: false, reason: 'postal' };
  }

  if (rule.type === 'number' && value.trim() !== '') {
    const num = Number(value);
    if (!Number.isFinite(num)) return { valid: false, reason: 'nan' };
    if (rule.min != null && num < rule.min) return { valid: false, reason: 'range' };
    if (rule.max != null && num > rule.max) return { valid: false, reason: 'range' };
  }

  if (rule.type === 'date8' && value.trim() !== '') {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8) return { valid: false, reason: 'date' };
  }

  return { valid: true };
};


// =========================
//   ★ ラベル詰めヘルパー
// =========================
//  itemText1 → 30文字以内
//  itemText2 → 制限なし（切り捨てなし）

const packLabelsToTwoLines = (labels, maxLen = 30) => {
  let line1 = '';
  let line2 = '';
  let useSecondLine = false;

  for (const lab of labels) {
    if (!useSecondLine) {
      const candidate = line1 ? `${line1},${lab}` : lab;
      if (candidate.length <= maxLen) {
        line1 = candidate;
        continue;
      }
      useSecondLine = true;
    }

    // itemText2 は全文入れて良い
    line2 = line2 ? `${line2},${lab}` : lab;
  }

  return { line1, line2 };
};

const formatQtyForLabel = (q) => {
  const n = Number(q);
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return String(n);
};


// =========================
//  出荷指示番号ごとにグループ化
// =========================
//  期待するimported rowには、UI側で付与した以下が含まれる想定：
//   - productCode6
//   - productId
//   - productShortName
//   - productUnit
//   - productCaseWeight  ★追加（products.case_weight をUI側で付与）
//   - productInt1        ★追加（products.int1 をUI側で付与）
//
//  ※ これらが無い場合は modelName からの従来ロジックでフォールバックする
//
//  opts:
//   - onWarning(msg: string): void  // 商品名null等の警告出し先（未指定ならconsole.warn）
//   - shipperBase?: number          // ★追加：東京=1000, 大阪=2000, 富士=3000
//
// shipperCode について：
//   - shipperCode = shipperBase + グループ内商品の max(int1)
//   - 例: 東京(1000) + max(3) = 1003
//
// weight について：
//   - weight = Σ(商品case_weight × 数量)
//   - case_weight が取れない明細は「99999 × 数量」を足す（人が必ず気づく）
//     ※固定で 99999 にしないのが重要（数量で増える）

export const buildSankiRowsFromImported = (importedRows = [], opts = {}) => {
  const warn = (msg) => {
    if (typeof opts.onWarning === 'function') opts.onWarning(msg);
    else console.warn(msg);
  };

  const shipperBase = Number(opts.shipperBase ?? 1000);

  const rows = importedRows.filter(
    (r) => String(r?.itemCode ?? '') !== '1112'
  );

  const groups = new Map();

  for (const r of rows) {
    const key = r.shipOrderNo;
    if (!key) continue;

    let g = groups.get(key);
    if (!g) {
      g = {
        base: r,
        rows: [],
        qtySum: 0,

        // ★重量用
        weightSum: 0,
        missingWeightCount: 0,

        // ★ shipperCode 用
        maxInt1: 0,

        // 商品ごと（code6単位）集計
        productQtyByKey: new Map(),    // key -> qty
        productMetaByKey: new Map(),   // key -> { shortName, unit, productId, code6 }
        productOrder: [],              // key の出現順
      };
      groups.set(key, g);
    }

    g.rows.push(r);

    const q = normalizeQty(r.qty);
    g.qtySum += q;

    // ===== 重量：Σ(case_weight × qty) / 欠けは 99999×qty を足す =====
    // ※ここで "固定99999" にしないこと（数量分だけ増える）
    const cw = Number(r.productCaseWeight);
    if (!Number.isFinite(cw) || cw <= 0) {
      g.missingWeightCount += 1;
      g.weightSum += q * 99999;
    } else {
      g.weightSum += q * cw;
    }

    // ===== shipperCode 用：複数商品なら int1 の最大値を採用 =====
    const int1 = Number(r.productInt1);
    if (Number.isFinite(int1) && int1 > g.maxInt1) {
      g.maxInt1 = int1;
    }

    const code6 = String(r.productCode6 ?? '').trim();

    // 表示名（short_name優先）
    let shortName = String(r.productShortName ?? '').trim();
    let unit = String(r.productUnit ?? '').trim();
    const productId = r.productId ?? null;

    // フォールバック：従来の modelName 由来
    if (!shortName) {
      const rawName = leftOfHyphen(r.modelName);
      const cleanedName = rawName.replace(/_?三基鋼業/g, '').trim();
      shortName = cleanedName;
    }

    // code6 が無い場合は shortName を擬似キーとして扱う
    const keyCode = code6 || (shortName ? `NAME:${shortName}` : '');
    if (!keyCode) continue;

    if (!g.productQtyByKey.has(keyCode)) {
      g.productQtyByKey.set(keyCode, 0);
      g.productOrder.push(keyCode);
    }
    g.productQtyByKey.set(keyCode, (g.productQtyByKey.get(keyCode) || 0) + q);

    if (!g.productMetaByKey.has(keyCode)) {
      g.productMetaByKey.set(keyCode, { shortName, unit, productId, code6: code6 || '' });
    } else {
      const cur = g.productMetaByKey.get(keyCode);
      if (cur && !cur.shortName && shortName) cur.shortName = shortName;
      if (cur && !cur.unit && unit) cur.unit = unit;
      if (cur && !cur.productId && productId) cur.productId = productId;
      if (cur && !cur.code6 && code6) cur.code6 = code6;
    }
  }

  const result = [];
  for (const [, g] of groups) {
    const base = g.base;

// ===== E列用：会社名
const customer = String(base.customerName ?? '').trim();

// ===== F列用：担当者様
const person = String(base.personInCharge ?? '').trim();
const name1 = person ? `${person}様` : '';

// ===== G列用：物件名
const projectName = String(base.projectName ?? '').trim();
const name2 = projectName ? `物件名：${projectName}` : '';
    // ★ ラベル生成： short_name + 数量 + unit
    // 商品名がnull/空なら警告
    const labels = g.productOrder
      .map((k) => {
        const meta = g.productMetaByKey.get(k) || {};
        const name = String(meta.shortName ?? '').trim();
        const unit = String(meta.unit ?? '').trim();
        const q = g.productQtyByKey.get(k) || 0;

        if (!name) {
          warn(`[三基CSV] 商品名が空(null/未設定)の明細がありました shipOrderNo=${base.shipOrderNo || ''} key=${k}`);
          return '';
        }
        return `${name}${formatQtyForLabel(q)}${unit || ''}`;
      })
      .filter(Boolean);

    const { line1, line2 } = packLabelsToTwoLines(labels, 30);

    // 欠けがあれば警告（weight自体は合計で出す）
    if (g.missingWeightCount > 0) {
      warn(
        `[三基CSV] case_weight 未設定の明細が ${g.missingWeightCount} 件ありました（その明細は 99999×数量 で加算） shipOrderNo=${base.shipOrderNo || ''}`
      );
    }

    const finalShipperCode = String(shipperBase + g.maxInt1);

    const sanki = {
      consigneeCode: '',
      tel: formatTel(base.tel),
      addr1: `${base.pref || ''}${base.deliveryPlace || ''}`,

// D列
addr2: base.comment || '',

// E列
addr3: customer || '',

// F列
name1: name1 || '',

// G列
name2: name2 || '',

      postal: formatPostalCsv(base.postal),
      specialCount: '',
      arrivalBranch: '',
      shipperCode: finalShipperCode,

      pieces: String(Math.max(0, g.qtySum)),
      size: '',

      // ★ 重量：常に合計（欠けは 99999×数量 が混ざってデカくなる＝気づける）
      weight: String(Math.max(0, Math.round(g.weightSum))),

      // ★ デフォルト指定
      transport1: '100',
      transport2: '110',

      itemText1: line1 || '',
      itemText2: line2 || '',

      // ★ 記事欄3は空
      itemText3: '',

      deliveryDate: formatDate8(base.deliveryDate),

      // ★ U列：空でOK（常に空）
      customerNo: '',

      spare: '',
      paymentType: '1',
      insurance: '',
      shipDate: formatDate8(base.warehouseOutDate || base.orderDate),
      registerDate: '',

      // CSVには出ないが、DB保存ログ等で使える
      _productMeta: g.productOrder.map((k) => g.productMetaByKey.get(k)).filter(Boolean),
    };

    result.push(sanki);
  }

  return result;
};


// =========================
//  CSV 出力
// =========================

export const sankiRowsToCsv = (rows) => {
  const lines = rows.map((row) =>
    SANKI_COLUMNS.map((col) => escapeCsv(row[col.key] ?? '')).join(',')
  );
  return lines.join('\r\n');
};
