// components/MasterManagement.js
// マスタ管理用の汎用コンポーネント（Dashboard から呼び出す）

import { useState } from 'react';

const MASTER_ITEMS = [
  {
    key: 'product',
    label: '📦 商品マスタ',
    description: 'SKU / 商品コード、商品名、規格、単位、標準単価などを管理します。',
  },
  {
    key: 'customer',
    label: '👤 顧客マスタ',
    description: '得意先コード、名称、請求先・納品先、締め日・支払条件などを管理します。',
  },
  {
    key: 'supplier',
    label: '🏢 仕入先マスタ',
    description: '仕入先コード、名称、支払条件、担当者情報などを管理します。',
  },
  {
    key: 'employee',
    label: '🧑‍💼 社員マスタ',
    description: '社員コード、氏名、所属部署、権限ロールなどを管理します。',
  },
  {
    key: 'warehouse',
    label: '🏬 倉庫マスタ',
    description: '倉庫コード、名称、所在地、在庫評価区分などを管理します。',
  },
  {
    key: 'category',
    label: '📁 商品カテゴリ',
    description: '商品カテゴリ階層（大分類・中分類など）を管理します。',
  },
  {
    key: 'unit',
    label: '📏 単位マスタ',
    description: '数量・重量・長さなどの単位や換算レートを管理します。',
  },
];

export default function MasterManagement() {
  const [activeKey, setActiveKey] = useState('product');

  const activeMaster =
    MASTER_ITEMS.find((m) => m.key === activeKey) ?? MASTER_ITEMS[0];

  return (
    <div
      style={{
        width: '100%',
        fontFamily: 'system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          fontSize: 16,
          margin: '0 0 8px',
          fontWeight: 600,
          color: '#333',
        }}
      >
        マスタ管理
      </h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        編集したいマスタを左のリストから選択してください。
        現時点ではレイアウトのみで、API 接続や CRUD 処理はまだ実装していません。
      </p>

      <div
        style={{
          display: 'flex',
          gap: 16,
          minHeight: 260,
        }}
      >
        {/* 左：マスタ種別リスト */}
        <aside
          style={{
            width: 220,
            borderRight: '1px solid #eee',
            paddingRight: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#666',
              marginBottom: 8,
            }}
          >
            マスタ種別
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {MASTER_ITEMS.map((m) => {
              const active = m.key === activeKey;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setActiveKey(m.key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: active
                      ? '1px solid #0a74da'
                      : '1px solid transparent',
                    background: active ? '#e0f2fe' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: active ? '#0a3069' : '#222',
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 右：選択中マスタの内容 */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 15,
              margin: '0 0 4px',
              fontWeight: 600,
              color: '#333',
            }}
          >
            {activeMaster.label}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: '#666',
              margin: '0 0 12px',
            }}
          >
            {activeMaster.description}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: '#555' }}>
              ※ ここに {activeMaster.label} の一覧・編集 UI を実装していきます。
            </span>
            <button
              type="button"
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #0a74da',
                background: '#0a74da',
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
              }}
              // onClick={() => setShowForm(true)} など、あとでモーダルをつなぐ
            >
              新規登録
            </button>
          </div>

          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>
                    コード
                  </th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>
                    名称
                  </th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>
                    説明
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      width: 120,
                    }}
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* ここをあとで API 結果で置き換える */}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      color: '#888',
                    }}
                  >
                    まだデータ取得処理を実装していません。
                    <br />
                    /api/master/{activeMaster.key} などのエンドポイントと接続して一覧を表示してください。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
