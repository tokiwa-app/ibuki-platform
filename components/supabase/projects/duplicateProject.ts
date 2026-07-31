import { supabase } from '../../../lib/supabaseClient';

export async function duplicateProjects(ids: number[]) {
  // 1. 指定された複数のIDの元データをまとめて取得
  const { data: originals, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .in('id', ids);

  if (fetchError || !originals || originals.length === 0) {
    throw new Error('複製元のデータが見つかりません');
  }

  // 2. 各データの id を除外して、(コピー) を付与した新しいデータの配列を作る
  const newRowsData = originals.map((original) => {
    const { id: _, ...rest } = original;
    return {
      ...rest,
      project_name: `${original.project_name || ''} (コピー)`,
      updated_at: new Date().toISOString(),
    };
  });

  // 3. まとめてインサートし、新しく作られたすべての行データを一括で返す
  const { data: insertedRows, error: insertError } = await supabase
    .from('projects')
    .insert(newRowsData)
    .select();

  if (insertError) {
    throw insertError;
  }

  return insertedRows; // 新しいIDたちが入った配列が返る
}
