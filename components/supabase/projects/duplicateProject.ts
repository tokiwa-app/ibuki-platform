import { supabase } from "../../../lib/supabaseClient";

export async function duplicateProject(id: number) {
  // 1. 指定されたIDの元データを取得
  const { data: original, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    throw new Error("複製元のデータが見つかりません");
  }

  // 2. idを除外してコピー用のデータオブジェクトを作成
  const { id: _, ...rest } = original;
  const newRowData = {
    ...rest,
    project_name: `${original.project_name || ''} (コピー)`,
    updated_at: new Date().toISOString(),
  };

  // 3. Supabaseに新規インサートし、自動採番されたIDを含む新しい行データを取得する
  const { data: insertedData, error: insertError } = await supabase
    .from("projects")
    .insert([newRowData])
    .select() // ← これで新しく作られたデータが返る
    .single();

  if (insertError) {
    throw insertError;
  }

  return insertedData; // 新しいIDが入った完成形のデータを返す！
}
