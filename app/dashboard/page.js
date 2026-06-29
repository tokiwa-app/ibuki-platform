// pages/dashboard.js
'use client';

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import Layout from "../components/Layout";
import MovementSearch from "../components/MovementSearch";
import MastersIndex from "../components/masters";
import ImportHub from "../components/import/ImportHub";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔐 セッションチェック（未ログインなら / へ戻す）
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      setLoading(false);
    }
    checkSession();
  }, [router]);

  // セッション確認中
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>;
  }

  // view 判定
  const rawView = router.query.view ?? "home";
  const view = Array.isArray(rawView) ? rawView[0] : rawView;

  const isMasterView = view === "master" || view === "master-Partner";

  return (
    <Layout>
      {/* ===============================
          入出庫・在庫移動
      =============================== */}
      {view === "movement" ? (
        <>
          <header style={{ margin: "12px 0" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              🚚 入出庫・在庫移動
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              入庫・出庫・在庫移動を検索できます。
            </p>
          </header>

          <div
            style={{
              background: "#ffffff",
              width: "100%",
              height: "calc(100vh - 170px)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <MovementSearch />
          </div>
        </>
      ) : view === "import" ? (
        /* ===============================
           データ取り込み（新規追加）
        =============================== */
        <>
          <header style={{ margin: "12px 0" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              📥 データ取り込み
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              取引先・フォーマットを選択してください
            </p>
          </header>

          <div
            style={{
              background: "#ffffff",
              width: "100%",
              height: "calc(100vh - 170px)",
              borderRadius: 10,
              padding: 16,
              overflow: "auto",
            }}
          >
            <ImportHub />
          </div>
        </>
      ) : isMasterView ? (
        /* ===============================
           マスタ管理
        =============================== */
        <>
          <header style={{ margin: "12px 0" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              🗂 マスタ管理
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              顧客マスタ・製品マスタを管理します。
            </p>
          </header>

          <div
            style={{
              background: "#ffffff",
              width: "100%",
              height: "calc(100vh - 170px)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <MastersIndex />
          </div>
        </>
      ) : (
        /* ===============================
           Dashboard Home（元のまま）
        =============================== */
        <>
          <header style={{ margin: "12px 0" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              Ibuki ERPへようこそ。メニューから各機能へ移動できます。
            </p>
          </header>

          <div
            style={{
              background: "#ffffff",
              padding: 20,
              borderRadius: 10,
              minHeight: "50vh",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>
              📌 今日のサマリー
            </h2>
            <p style={{ fontSize: 13, color: "#444" }}>
              今後ここにKPI/在庫アラート/作業状況を表示予定
            </p>
          </div>
        </>
      )}
    </Layout>
  );
}
