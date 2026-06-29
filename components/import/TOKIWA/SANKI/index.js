// components/import/TOKIWA/SANKI/index.js

import { useCallback, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import Encoding from 'encoding-japanese';
import {
  SANKI_COLUMNS,
  buildSankiRowsFromImported,
  sankiRowsToCsv,
  validateSankiCell,
} from '../../../../lib/sanki/hukutuCsv';

import { supabase } from '../../../../lib/supabaseClient';

const TENANT_ID = 'TOKIWA';
const PARTNER_ID = 'dd32d54a-8e5e-44f3-9a49-e18ea6ae8561';

// 6桁 code（商品4 + アーム2）※文字列として扱う（英字/記号を消さない）
const toProductCode6 = (itemCode, armCode) => {
  const item = String(itemCode ?? '').trim();
  const arm = String(armCode ?? '').trim();
  if (!item || !arm) return '';

  const item4 = item.padStart(4, '0').slice(-4);
  const arm2 = arm.padStart(2, '0').slice(-2);

  return `${item4}${arm2}`;
};

// ==================================
// Clipboard TSV/CSV parser
// ===============================
const parseClipboardTable = (text) => {
  const t = String(text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!t) return [];

  const lines = t.split('\n').filter((l) => l.trim() !== '');

  const hasTab = t.includes('\t');
  const hasComma = t.includes(',');

  const splitLine = (line) => {
    if (hasTab) return line.split('\t');
    if (hasComma) return line.split(',');
    // どっちも無いなら「2つ以上の空白」を区切りとして扱う
    return line.trim().split(/\s{2,}/);
  };

  return lines.map(splitLine);
};

const toStr = (v) => (v == null ? null : String(v).trim());
const toNum = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
};
const toPostal7 = (v) => {
  const s = v == null ? '' : String(v);
  const digits = s.replace(/\D/g, '');
  if (!digits) return null;
  return digits.padStart(7, '0').slice(-7);
};

const parsePasteDate = (v) => {
  if (v == null) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;

  const s = String(v).trim();
  if (!s) return null;

  // 25/11/01 or 2025/11/01 or 25-11-01
  const m = s.match(/^(\d{2}|\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (!m) return null;

  let y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 100) y = 2000 + y;

  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
};

// ===============================
// 表1（貼り付け：ヘッダ無し）→ 共通 imported 形へ
// 列順（サンプル通り）
// 0 raw
// 1 出荷指示番号
// 2 事業所
// 3 件数
// 4 出荷指示日
// 5 倉庫出庫日
// 6 納入日
// 7 行番号
// 8 商品分類コード
// 9 商品コード
// 10 アームコード
// 11 商品名
// 12 アームサイズ＆シール
// 13 出荷数量
// 14 納入先会社名
// 15 郵便番号
// 16 県
// 17 納入場所
// 18 物件名
// 19 担当者
// 20 TEL
// 21 備考
// ===============================
const buildImportedRowsFromPasteTable1 = (grid) => {
  if (!grid?.length) return [];

  return grid
    .filter((r) => Array.isArray(r) && r.some((x) => String(x ?? '').trim() !== ''))
    .map((arr) => ({
      rowNo: arr[0] ?? null,
      shipOrderNo: toStr(arr[1]),
      office: arr[2] ?? null,
      cases: arr[3] ?? null,
      orderDate: arr[4] ?? null,
      warehouseOutDate: arr[5] ?? null,
      deliveryDate: parsePasteDate(arr[6]),
      lineNo: toNum(arr[7]),
      category: arr[8] ?? null,

      itemCode: toStr(arr[9]),
      modelCode: toStr(arr[10]),
      modelName: arr[11] ?? null,
      armSizeSeal: arr[12] ?? null,
      qty: toNum(arr[13]),

      customerName: arr[14] ?? null,
      postal: toPostal7(arr[15]),
      pref: arr[16] ?? null,
      deliveryPlace: arr[17] ?? null,
      projectName: arr[18] ?? null,
      personInCharge: arr[19] ?? null,
      tel: toStr(arr[20]),
      comment: arr[21] ?? null,

      customerCode: null,
      fkkOrderNo: null,
      mailReceivedDate: null,
      comment2: null,
    }))
    .filter((r) => r.shipOrderNo && r.lineNo != null);
};

// ===============================
// 表2（貼り付け：ヘッダ無し）→ 共通 imported 形へ
// 列順（サンプル通り）
// 0 raw
// 1 得意先コード
// 2 FKK受注番号
// 3 事業所
// 4 件数
// 5 メール受信日
// 6 出荷指示日
// 7 倉庫出庫日
// 8 納入日
// 9 行番号
// 10 商品分類
// 11 商品コード
// 12 アーム
// 13 商品名
// 14 アームサイズ＆シール
// 15 出荷数量
// 16 納入先会社名
// 17 郵便番号
// 18 県
// 19 納入場所
// 20 物件名
// 21 担当者
// 22 TEL
// 23 備考
// 24 備考2
// ===============================
const buildImportedRowsFromPasteTable2 = (grid) => {
  if (!grid?.length) return [];

  return grid
    .filter((r) => Array.isArray(r) && r.some((x) => String(x ?? '').trim() !== ''))
    .map((arr) => {
      const shipOrderNo = toStr(arr[2]); // FKK受注番号
      const lineNo = toNum(arr[9]);

      const comment1 = String(arr[23] ?? '').trim();
      const comment2 = String(arr[24] ?? '').trim();
      const mergedComment =
        comment1 || comment2 ? [comment1, comment2].filter(Boolean).join(' / ') : null;

      return {
        rowNo: arr[0] ?? null,
        shipOrderNo,
        office: arr[3] ?? null,
        cases: arr[4] ?? null,

mailReceivedDate: parsePasteDate(arr[5]),
orderDate: parsePasteDate(arr[6]),
warehouseOutDate: parsePasteDate(arr[7]),
deliveryDate: parsePasteDate(arr[8]),

        lineNo,
        category: arr[10] ?? null,

        itemCode: toStr(arr[11]),
        modelCode: toStr(arr[12]),
        modelName: arr[13] ?? null,
        armSizeSeal: arr[14] ?? null,
        qty: toNum(arr[15]),

        customerName: arr[16] ?? null,
        postal: toPostal7(arr[17]),
        pref: arr[18] ?? null,

        deliveryPlace: arr[19] ?? null,
        projectName: arr[20] ?? null,
        personInCharge: arr[21] ?? null,

        tel: toStr(arr[22]),
        comment: mergedComment,

        customerCode: toStr(arr[1]),
        fkkOrderNo: shipOrderNo,
        comment2: comment2 || null,
      };
    })
    .filter((r) => r.shipOrderNo && r.lineNo != null);
};

// ===============================
// products 参照 + sanki 生成（共通）
// ===============================
const enrichAndBuildSanki = async (importedRows, shipperBase) => {
  const codes = Array.from(
    new Set(importedRows.map((r) => toProductCode6(r.itemCode, r.modelCode)).filter(Boolean))
  );

  let productMap = new Map(); // code -> { id, short_name, unit, case_weight, int1 }
  let missingCodes = [];

  if (codes.length) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, code, short_name, unit, case_weight, int1')
      .eq('tenant_id', TENANT_ID)
      .eq('partner_id', PARTNER_ID)
      .in('code', codes);

    if (error) throw error;

    productMap = new Map(
      (products ?? []).map((p) => [
        String(p.code ?? ''),
        {
          id: p.id,
          short_name: p.short_name ?? '',
          unit: p.unit ?? '',
          case_weight: p.case_weight ?? null,
          int1: Number(p.int1 ?? 0),
        },
      ])
    );

    missingCodes = codes.filter((c) => !productMap.has(c));
  }

  const importedWithProduct = importedRows.map((r) => {
    const code6 = toProductCode6(r.itemCode, r.modelCode);
    const p = productMap.get(code6);
    return {
      ...r,
      productCode6: code6,
      productId: p?.id ?? null,
      productShortName: p?.short_name ?? '',
      productUnit: p?.unit ?? '',
      productCaseWeight: p?.case_weight ?? null,
      productInt1: p?.int1 ?? 0,
    };
  });

  const sanki = buildSankiRowsFromImported(importedWithProduct, { shipperBase });

  const sankiWithId = (sanki ?? []).map((r) => ({
    ...r,
    __tmpId: r.__tmpId ?? (crypto?.randomUUID?.() ?? `tmp_${Date.now()}_${Math.random()}`),
  }));

  return { importedWithProduct, sankiWithId, missingCodes };
};

export default function SankiImport() {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // 元データ（確認用）
  const [rawRows, setRawRows] = useState([]);

  // 三基CSV用（編集対象）
  const [csvRows, setCsvRows] = useState([]);

  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'raw'
  const [colWidths, setColWidths] = useState({});
  const [importing, setImporting] = useState(false);

  // 取り込み画面（表1 / 表2）
  const [importMode, setImportMode] = useState('table1'); // 'table1' | 'table2'

  // ご依頼主ベースコード（東京/大阪/富士）
  const [shipperBase, setShipperBase] = useState(1000); // 東京=1000, 大阪=2000, 富士=3000

  // 貼り付け入力
  const [paste1, setPaste1] = useState('');
  const [paste2, setPaste2] = useState('');

  // ★プレビュー
  const [previewRows, setPreviewRows] = useState([]);
  const [previewMode, setPreviewMode] = useState(null); // 'table1' | 'table2'

  // ===============================
  // Excel → row map（既存：Drop用）※触らない
  // ===============================
  const mapRow = (arr) => ({
    rowNo: arr[0] ?? null,
    shipOrderNo: arr[1] ?? null,
    office: arr[2] ?? null,
    cases: arr[3] ?? null,
    orderDate: arr[4] ?? null,
    warehouseOutDate: arr[5] ?? null,
    deliveryDate: arr[6] ?? null,
    lineNo: arr[7] ?? null,
    category: arr[8] ?? null,

    // ★ ここが重要：文字列として保持
    itemCode: arr[9] == null ? null : String(arr[9]).trim(), // 商品コード（文字列）
    modelCode: arr[10] == null ? null : String(arr[10]).trim(), // アームコード（文字列）

    modelName: arr[11] ?? null,
    armSizeSeal: arr[12] ?? null,
    qty:
      typeof arr[13] === 'number'
        ? arr[13]
        : Number(String(arr[13] ?? '').replace(/,/g, '')) || null,
    customerName: arr[14] ?? null,
    postal: arr[15] ? String(arr[15]).replace(/\D/g, '').padStart(7, '0') : null,
    pref: arr[16] ?? null,
    deliveryPlace: arr[17] ?? null,
    projectName: arr[18] ?? null,
    personInCharge: arr[19] ?? null,
    tel: arr[20] ? String(arr[20]) : null,
    comment: arr[21] ?? null,
  });

  // ===============================
  // CSVセル編集
  // ===============================
  const updateCsvCell = (rowIndex, key, value) => {
    setCsvRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [key]: value };
      return next;
    });
  };

  // ===============================
  // CSV 行追加
  // ===============================
  const createEmptyCsvRow = () => {
    const row = {};
    for (const c of SANKI_COLUMNS) row[c.key] = '';
    row.__tmpId = crypto?.randomUUID?.() ?? `tmp_${Date.now()}_${Math.random()}`;
    return row;
  };

  const addCsvRow = () => {
    setCsvRows((prev) => [...prev, createEmptyCsvRow()]);
    setActiveTab('csv');
  };

  // ===============================
  // 列リサイズ
  // ===============================
  const handleResizeMouseDown = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const th = e.target.closest('th');
    const startWidth = th ? th.offsetWidth : 140;

    const onMove = (ev) => {
      const w = Math.max(startWidth + (ev.clientX - startX), 60);
      setColWidths((p) => ({ ...p, [colKey]: w }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ===============================
  // Excel Drop（既存のまま残す）※触らない
  // ===============================
  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setDragOver(false);
      setBusy(true);
      setMsg('解析中…');

      try {
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;

        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, {
          type: 'array',
          cellDates: true,
          sheetRows: 1000,
        });

        const name = wb.SheetNames.find((n) => /出荷指示書移出用/.test(n)) || wb.SheetNames[0];

        const sheet = XLSX.utils.sheet_to_json(wb.Sheets[name], {
          header: 1,
          raw: true,
          defval: null,
        });

        const imported = sheet
          .filter((r) => Array.isArray(r) && r.length > 0)
          .map(mapRow)
          .filter((r) => r.shipOrderNo && r.lineNo != null);

        const { importedWithProduct, sankiWithId, missingCodes } = await enrichAndBuildSanki(
          imported,
          shipperBase
        );

        setRawRows(importedWithProduct);
        setCsvRows(sankiWithId);
        setActiveTab('csv');

        const baseMsg = `解析成功：${sankiWithId.length} 行 / ご依頼主ベース=${shipperBase}`;
        if (missingCodes.length) {
          setMsg(`${baseMsg} / 商品マスタ未登録 code: ${missingCodes.join(', ')}`);
        } else {
          setMsg(baseMsg);
        }
      } catch (err) {
        console.error(err);
        setMsg('解析に失敗しました');
      } finally {
        setBusy(false);
      }
    },
    [shipperBase]
  );

  // ===============================
  // プレビュー
  // ===============================
  const previewPasteTable1 = useCallback(() => {
    const grid = parseClipboardTable(paste1);
    const imported = buildImportedRowsFromPasteTable1(grid);
    setPreviewRows(imported);
    setPreviewMode('table1');
    setMsg(imported.length ? `表1 プレビュー：${imported.length} 行` : '表1：プレビュー行がありません');
  }, [paste1]);

  const previewPasteTable2 = useCallback(() => {
    const grid = parseClipboardTable(paste2);
    const imported = buildImportedRowsFromPasteTable2(grid);
    setPreviewRows(imported);
    setPreviewMode('table2');
    setMsg(imported.length ? `表2 プレビュー：${imported.length} 行` : '表2：プレビュー行がありません');
  }, [paste2]);

  // ===============================
  // 表1 取り込み（貼り付け：ヘッダ無し）
  // ===============================
  const importPasteTable1 = useCallback(async () => {
    setBusy(true);
    setMsg('表1 取り込み中…');

    try {
      const imported =
        previewMode === 'table1' && previewRows?.length
          ? previewRows
          : buildImportedRowsFromPasteTable1(parseClipboardTable(paste1));

      if (!imported.length) {
        setMsg('表1：有効な行がありません（出荷指示番号/行番号が取れない）');
        return;
      }

      const { importedWithProduct, sankiWithId, missingCodes } = await enrichAndBuildSanki(
        imported,
        shipperBase
      );

      setRawRows(importedWithProduct);
      setCsvRows(sankiWithId);
      setActiveTab('csv');

      const baseMsg = `表1 解析成功：${sankiWithId.length} 行 / ご依頼主ベース=${shipperBase}`;
      setMsg(missingCodes.length ? `${baseMsg} / 商品マスタ未登録: ${missingCodes.join(', ')}` : baseMsg);
    } catch (e) {
      console.error(e);
      setMsg('表1：解析に失敗しました');
    } finally {
      setBusy(false);
    }
  }, [paste1, shipperBase, previewMode, previewRows]);

  // ===============================
  // 表2 取り込み（貼り付け：ヘッダ無し）
  // ===============================
  const importPasteTable2 = useCallback(async () => {
    setBusy(true);
    setMsg('表2 取り込み中…');

    try {
      const imported =
        previewMode === 'table2' && previewRows?.length
          ? previewRows
          : buildImportedRowsFromPasteTable2(parseClipboardTable(paste2));

      if (!imported.length) {
        setMsg('表2：有効な行がありません（FKK受注番号/行番号が取れない）');
        return;
      }

      const { importedWithProduct, sankiWithId, missingCodes } = await enrichAndBuildSanki(
        imported,
        shipperBase
      );

      setRawRows(importedWithProduct);
      setCsvRows(sankiWithId);
      setActiveTab('csv');

      const baseMsg = `表2 解析成功：${sankiWithId.length} 行 / ご依頼主ベース=${shipperBase}`;
      setMsg(missingCodes.length ? `${baseMsg} / 商品マスタ未登録: ${missingCodes.join(', ')}` : baseMsg);
    } catch (e) {
      console.error(e);
      setMsg('表2：解析に失敗しました');
    } finally {
      setBusy(false);
    }
  }, [paste2, shipperBase, previewMode, previewRows]);

  // ===============================
  // CSV Download
  // ===============================
  const downloadCsv = () => {
    if (!csvRows.length) return;
    const csv = sankiRowsToCsv(csvRows);

    const sjis = Encoding.convert(csv, {
      to: 'SJIS',
      from: 'UNICODE',
      type: 'array',
    });

    const blob = new Blob([new Uint8Array(sjis)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanki_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===============================
  // Supabase 保存（最小）
  // ===============================
  const handleImportToDb = async () => {
    if (!csvRows.length) return;

    try {
      setImporting(true);
      setMsg('DB保存中…');

      const { error } = await supabase.from('sanki_import_logs').insert(
        csvRows.map((row) => ({
          tenant_id: TENANT_ID,
          data: row,
        }))
      );

      if (error) throw error;
      setMsg(`保存完了：${csvRows.length} 行`);
    } catch (e) {
      console.error(e);
      setMsg('保存に失敗しました');
    } finally {
      setImporting(false);
    }
  };

  const headerCommon = useMemo(
    () => ({
      th: {
        fontSize: 12,
        padding: '6px 8px',
        borderBottom: '1px solid #ddd',
        background: '#f7f7f7',
        whiteSpace: 'pre-line',
        position: 'relative',
        verticalAlign: 'bottom',
      },
      td: {
        fontSize: 12,
        padding: '4px 6px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'top',
      },
      input: {
        width: '100%',
        fontSize: 12,
        border: '1px solid #ddd',
        padding: '2px 4px',
        boxSizing: 'border-box',
      },
    }),
    []
  );

  const fmt = (v) => (v == null ? '' : String(v));

  const RAW_COLUMNS = useMemo(
    () => [
      { key: 'rowNo', label: 'raw/No' },
      { key: 'shipOrderNo', label: '出荷指示番号 / FKK受注番号' },
      { key: 'office', label: '事業所' },
      { key: 'cases', label: '件数' },
      { key: 'mailReceivedDate', label: 'メール受信日(表2)' },
      { key: 'orderDate', label: '出荷指示日' },
      { key: 'warehouseOutDate', label: '倉庫出庫日' },
      { key: 'deliveryDate', label: '納入日' },
      { key: 'lineNo', label: '行番号' },
      { key: 'category', label: '商品分類' },
      { key: 'itemCode', label: '商品コード' },
      { key: 'modelCode', label: 'アーム' },
      { key: 'productCode6', label: '管理番号(6桁)' },
      { key: 'productId', label: '製ID(uuid)' },
      { key: 'productShortName', label: 'short_name' },
      { key: 'productUnit', label: 'unit' },
      { key: 'productCaseWeight', label: 'case_weight' },
      { key: 'productInt1', label: 'int1' },
      { key: 'modelName', label: '商品名' },
      { key: 'armSizeSeal', label: 'アームサイズ＆シール' },
      { key: 'qty', label: '数量' },
      { key: 'customerName', label: '納入先' },
      { key: 'postal', label: '郵便番号' },
      { key: 'pref', label: '県' },
      { key: 'deliveryPlace', label: '納入場所' },
      { key: 'projectName', label: '物件名' },
      { key: 'personInCharge', label: '担当者' },
      { key: 'tel', label: 'TEL' },
      { key: 'comment', label: '備考' },
      { key: 'customerCode', label: '得意先コード(表2)' },
      { key: 'fkkOrderNo', label: 'FKK受注番号(表2)' },
      { key: 'comment2', label: '備考2(表2)' },
    ],
    []
  );

  const debug = useMemo(
    () => ({
      raw: rawRows.length,
      csv: csvRows.length,
      tab: activeTab,
      mode: importMode,
      shipperBase,
      preview: previewRows.length,
      previewMode,
    }),
    [rawRows.length, csvRows.length, activeTab, importMode, shipperBase, previewRows.length, previewMode]
  );

  const anyInvalid = useMemo(() => {
    if (!csvRows.length) return false;
    for (let i = 0; i < csvRows.length; i++) {
      for (const c of SANKI_COLUMNS) {
        const r = validateSankiCell(csvRows[i], c.key);
        if (!r.valid) return true;
      }
    }
    return false;
  }, [csvRows]);

  return (
    <section style={{ padding: 24 }}>
      {/* Shipper selector */}
      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: '#444' }}>ご依頼主：</div>
        <label style={{ fontSize: 12 }}>
          <input
            type="radio"
            name="shipper"
            checked={shipperBase === 1000}
            onChange={() => setShipperBase(1000)}
          />{' '}
          東京（1000）
        </label>
        <label style={{ fontSize: 12 }}>
          <input
            type="radio"
            name="shipper"
            checked={shipperBase === 2000}
            onChange={() => setShipperBase(2000)}
          />{' '}
          大阪（2000）
        </label>
        <label style={{ fontSize: 12 }}>
          <input
            type="radio"
            name="shipper"
            checked={shipperBase === 3000}
            onChange={() => setShipperBase(3000)}
          />{' '}
          富士（3000）
        </label>
      </div>

      {/* Import Screen Tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setImportMode('table1')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: importMode === 'table1' ? '#eaf2ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          表1（貼り付け取り込み）
        </button>
        <button
          type="button"
          onClick={() => setImportMode('table2')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: importMode === 'table2' ? '#eaf2ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          表2（貼り付け取り込み）
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ fontSize: 12, color: '#666', alignSelf: 'center' }}>（Excelドロップも可）</div>
      </div>

      {/* Import Screen */}
      <div
        style={{
          marginTop: 10,
          border: '1px solid #e5e5e5',
          borderRadius: 10,
          background: '#fff',
          padding: 12,
        }}
      >
        {importMode === 'table1' ? (
          <>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 8 }}>
              表1のデータ（ヘッダ無し）をそのまま貼り付けてください（TSV推奨）
            </div>
            <textarea
              value={paste1}
              onChange={(e) => setPaste1(e.target.value)}
              placeholder="例：1[TAB]110250035002792[TAB]IMA東京[TAB]1..."
              style={{
                width: '100%',
                minHeight: 140,
                fontSize: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 10,
                boxSizing: 'border-box',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={previewPasteTable1}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: busy ? '#f2f2f2' : '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                プレビュー
              </button>
              <button
                type="button"
                onClick={importPasteTable1}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: busy ? '#f2f2f2' : '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                表1を取り込む
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaste1('');
                  setPreviewRows([]);
                  setPreviewMode(null);
                }}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: busy ? '#f2f2f2' : '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                クリア
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 8 }}>
              表2のデータ（ヘッダ無し）をそのまま貼り付けてください（TSV推奨）
            </div>
            <textarea
              value={paste2}
              onChange={(e) => setPaste2(e.target.value)}
              placeholder="例：14[TAB]100474[TAB]TJ04157888[TAB]IMA東京..."
              style={{
                width: '100%',
                minHeight: 140,
                fontSize: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 10,
                boxSizing: 'border-box',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={previewPasteTable2}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: busy ? '#f2f2f2' : '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                プレビュー
              </button>
              <button
                type="button"
                onClick={importPasteTable2}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: busy ? '#f2f2f2' : '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                表2を取り込む
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaste2('');
                  setPreviewRows([]);
                  setPreviewMode(null);
                }}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: busy ? '#f2f2f2' : '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                クリア
              </button>
            </div>
          </>
        )}

        {/* Preview table */}
        {previewRows?.length ? (
          <div style={{ marginTop: 10, border: '1px solid #eee', borderRadius: 10, overflow: 'auto' }}>
            <div style={{ padding: 8, fontSize: 12, color: '#555' }}>
              プレビュー（{previewMode}）: {previewRows.length} 行（表示は先頭200行）
            </div>
            <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
              <thead>
                <tr>
                  {['出荷指示番号/FKK', '行番号', '商品コード', 'アーム', '数量', '納入先', '納入場所', 'TEL', '備考'].map((h) => (
                    <th key={h} style={{ ...headerCommon.th, width: 180 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 200).map((r, i) => (
                  <tr key={r.rowNo ?? i}>
                    <td style={headerCommon.td}>{fmt(r.shipOrderNo)}</td>
                    <td style={headerCommon.td}>{fmt(r.lineNo)}</td>
                    <td style={headerCommon.td}>{fmt(r.itemCode)}</td>
                    <td style={headerCommon.td}>{fmt(r.modelCode)}</td>
                    <td style={headerCommon.td}>{fmt(r.qty)}</td>
                    <td style={headerCommon.td}>{fmt(r.customerName)}</td>
                    <td style={headerCommon.td}>{fmt(r.deliveryPlace)}</td>
                    <td style={headerCommon.td}>{fmt(r.tel)}</td>
                    <td style={headerCommon.td}>{fmt(r.comment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Drop Area（既存） */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        style={{
          marginTop: 14,
          padding: 18,
          border: '2px dashed #bbb',
          borderRadius: 10,
          background: dragOver ? '#f3f7ff' : '#fafafa',
          color: '#333',
          userSelect: 'none',
        }}
      >
        {busy ? '解析中…' : 'ここにExcelをドロップ（任意）'}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('csv')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: activeTab === 'csv' ? '#eaf2ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          三基CSV（編集）
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: activeTab === 'raw' ? '#eaf2ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          元データ（確認）
        </button>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={addCsvRow}
          disabled={busy || importing}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: busy || importing ? '#f2f2f2' : '#fff',
            cursor: busy || importing ? 'not-allowed' : 'pointer',
          }}
        >
          ＋ 行追加
        </button>

        <button
          type="button"
          onClick={downloadCsv}
          disabled={!csvRows.length}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: csvRows.length ? '#fff' : '#f2f2f2',
            cursor: csvRows.length ? 'pointer' : 'not-allowed',
          }}
        >
          CSVダウンロード（SJIS）
        </button>

        <button
          type="button"
          onClick={handleImportToDb}
          disabled={!csvRows.length || importing}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: !csvRows.length || importing ? '#f2f2f2' : '#fff',
            cursor: !csvRows.length || importing ? 'not-allowed' : 'pointer',
          }}
        >
          {importing ? 'DB保存中…' : 'DBに保存'}
        </button>
      </div>

      {/* Table Area */}
      <div
        style={{
          marginTop: 12,
          border: '1px solid #e5e5e5',
          borderRadius: 10,
          overflow: 'auto',
          maxHeight: '70vh',
          background: '#fff',
        }}
      >
        {activeTab === 'csv' ? (
          csvRows.length ? (
            <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
              <thead>
                <tr>
                  {SANKI_COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      style={{
                        ...headerCommon.th,
                        width: colWidths[c.key] ?? 180,
                        minWidth: 60,
                      }}
                    >
                      <div style={{ paddingRight: 10 }}>{c.label}</div>

                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, c.key)}
                        title="ドラッグで幅変更"
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          width: 10,
                          height: '100%',
                          cursor: 'col-resize',
                          background: 'transparent',
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvRows.map((row, originalIndex) => (
                  <tr key={row.customerNo || row.__tmpId || originalIndex}>
                    {SANKI_COLUMNS.map((c) => {
                      const r = validateSankiCell(row, c.key);
                      const bad = !r.valid;

                      return (
                        <td
                          key={c.key}
                          style={{
                            ...headerCommon.td,
                            background: bad ? '#fff2f2' : 'transparent',
                          }}
                        >
                          <input
                            value={fmt(row[c.key])}
                            onChange={(e) => updateCsvCell(originalIndex, c.key, e.target.value)}
                            style={{
                              ...headerCommon.input,
                              outline: bad ? '2px solid #ffb3b3' : 'none',
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 14, color: '#777' }}>
              まだデータがありません（表1/表2貼り付け or Excelドロップしてください）
            </div>
          )
        ) : rawRows.length ? (
          <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr>
                {RAW_COLUMNS.map((c) => (
                  <th key={c.key} style={{ ...headerCommon.th, width: 180 }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawRows.map((r, i) => (
                <tr key={r.rowNo ?? i}>
                  {RAW_COLUMNS.map((c) => (
                    <td key={c.key} style={headerCommon.td}>
                      {fmt(r[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 14, color: '#777' }}>
            まだ元データがありません（表1/表2貼り付け or Excelドロップしてください）
          </div>
        )}
      </div>
    </section>
  );
}
