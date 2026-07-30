async function handleCellValueChanged(
  event: CellValueChangedEvent<Project>,
) {
  if (!event.data) return;

  const field = event.colDef.field;

  if (!field) return;

  if (event.oldValue === event.newValue) {
    return;
  }

  // 顧客コード変更時のみ顧客名を取得
  if (field === 'customer') {
    try {
      const res = await fetch(
        `/api/erpnext/customer/${encodeURIComponent(
          String(event.newValue),
        )}`,
      );

      if (!res.ok) {
        throw new Error('顧客が見つかりません');
      }

      const customer = await res.json();

      // 画面へ反映
      event.data.customer_name =
        customer.customer_name;

      event.api.refreshCells({
        rowNodes: [event.node],
        columns: ['customer_name'],
      });
    } catch (error) {
      console.error(error);

      // 元に戻す
      event.node.setDataValue(
        'customer',
        event.oldValue,
      );

      event.data.customer_name = null;

      event.api.refreshCells({
        rowNodes: [event.node],
        columns: ['customer_name'],
      });

      return;
    }
  }

  try {
    await updateProjectField(
      event.data.id,
      field as keyof Project,
      event.newValue,
    );
  } catch (error) {
    console.error('保存失敗', error);

    event.node.setDataValue(
      field,
      event.oldValue,
    );
  }
}
