/**
 * Code.gs — メインのエントリーポイント
 *
 * このファイルがGASの「司令塔」。
 * メニュー表示、初期設定、ステータス変更時の自動処理を担当する。
 *
 * 【処理の流れ】
 * 1. スプレッドシートを開く → onOpen() でメニュー追加
 * 2. 「初期設定」 → setupSheets() でマスタシートを自動作成
 * 3. 案件データに入力 → 見積書を生成
 * 4. ステータスを「注文確定」に変更 → onEdit() で納品書を自動生成
 * 5. ステータスを「納品済み」に変更 → onEdit() で請求書を自動生成
 */

// ───────────────────────────────────────
// メニュー（スプレッドシートを開いたときに表示）
// ───────────────────────────────────────

/**
 * スプレッドシートを開いたときに自動実行される特殊関数。
 * カスタムメニューを追加する。
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();  // UIオブジェクトを取得
  ui.createMenu('帳票自動化')          // メニュー名
    .addItem('初期設定（シート作成）', 'setupSheets')       // マスタシート作成
    .addSeparator()                                         // 区切り線
    .addItem('見積書を生成', 'createEstimate')              // 手動で見積書を生成
    .addItem('納品書を生成', 'createDeliveryNote')          // 手動で納品書を生成
    .addItem('請求書を生成', 'createInvoice')               // 手動で請求書を生成
    .addSeparator()
    .addItem('月次売上レポート', 'generateMonthlyReport')   // 月次レポート
    .addToUi();                                              // メニューを表示
}

// ───────────────────────────────────────
// 初期設定（マスタシートの自動作成）
// ───────────────────────────────────────

/**
 * 商品マスタ・取引先マスタ・案件データの3シートを作成し、
 * ヘッダー行とサンプルデータを入れる。
 */
function setupSheets() {
  // --- 商品マスタ ---
  const products = getOrCreateSheet(SHEET_NAMES.products);
  if (products.getLastRow() < 2) {  // データがなければサンプルを入れる
    products.getRange(1, 1, 1, 4).setValues([['商品名', '規格', '標準単価', '原価']]);
    products.getRange(2, 1, 3, 4).setValues([
      ['SUS304 丸棒',   'φ10 × 1000mm', 2500, 1500],  // サンプル商品1
      ['SUS304 板材',   't3.0 × 100 × 200mm', 3800, 2200],  // サンプル商品2
      ['アルミ A5052',  't5.0 × 300 × 300mm', 4200, 2800],  // サンプル商品3
    ]);
    // ヘッダー行の書式設定
    products.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#D9E2F3');
  }

  // --- 取引先マスタ ---
  const clients = getOrCreateSheet(SHEET_NAMES.clients);
  if (clients.getLastRow() < 2) {
    clients.getRange(1, 1, 1, 5).setValues([['会社名', '郵便番号', '住所', '担当者', '支払条件']]);
    clients.getRange(2, 1, 2, 5).setValues([
      ['大阪機械工業株式会社', '541-0041', '大阪府大阪市中央区北浜1-1-1', '佐藤一郎', '月末締め翌月末払い'],
      ['東京精密部品株式会社', '100-0001', '東京都千代田区千代田1-1-1', '鈴木花子', '20日締め翌月末払い'],
    ]);
    clients.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#D9E2F3');
  }

  // --- 案件データ ---
  const deals = getOrCreateSheet(SHEET_NAMES.deals);
  if (deals.getLastRow() < 1) {
    const headers = [
      '案件番号', '案件日付', '取引先名', 'ステータス',
      '商品名', '規格', '数量', '単価',
      '小計（税抜）', '消費税', '合計（税込）',
      '納品日', '備考'
    ];
    deals.getRange(1, 1, 1, headers.length).setValues([headers]);
    deals.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#D9E2F3');

    // 小計・消費税・合計の自動計算式を2行目に入れる（コピー用テンプレート）
    // I2 = G2 * H2（数量 × 単価）
    deals.getRange(2, COL.subtotal).setFormula('=IF(G2*H2=0,"",G2*H2)');
    // J2 = I2 * 10%（小計 × 税率）
    deals.getRange(2, COL.tax).setFormula('=IF(I2="","",FLOOR(I2*' + TAX_RATE + '))');
    // K2 = I2 + J2（小計 + 消費税）
    deals.getRange(2, COL.total).setFormula('=IF(I2="","",I2+J2)');

    // ステータス列にプルダウンを設定（入力ミス防止）
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([STATUS.draft, STATUS.ordered, STATUS.delivered, STATUS.invoiced, STATUS.paid])
      .setAllowInvalid(false)  // リスト以外の値を拒否
      .build();
    deals.getRange(2, COL.status, 100).setDataValidation(statusRule);  // 100行分

    // 取引先名にプルダウン（取引先マスタから）
    const clientRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(clients.getRange('A2:A100'))  // 取引先マスタのA列
      .setAllowInvalid(true)   // 新規取引先も手入力可能にする
      .build();
    deals.getRange(2, COL.clientName, 100).setDataValidation(clientRule);

    // 商品名にプルダウン（商品マスタから）
    const productRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(products.getRange('A2:A100'))
      .setAllowInvalid(true)
      .build();
    deals.getRange(2, COL.productName, 100).setDataValidation(productRule);
  }

  showInfo(
    '初期設定が完了しました！\n\n' +
    '【次のステップ】\n' +
    '1. 「商品マスタ」に自社の商品を登録\n' +
    '2. 「取引先マスタ」に取引先を登録\n' +
    '3. 「案件データ」に案件を入力\n' +
    '4. メニューから「見積書を生成」を実行'
  );
}

// ───────────────────────────────────────
// ステータス変更の自動検知（トリガー）
// ───────────────────────────────────────

/**
 * セルが編集されたときに自動実行される特殊関数。
 * 案件データのステータス列が変更されたとき、対応する帳票を自動生成する。
 *
 * 【重要】onEdit はシンプルトリガーなので、権限が必要な処理は
 * installable trigger（インストール可能なトリガー）に変更が必要な場合がある。
 * → 今回は spreadsheet 内の操作のみなので onEdit で OK。
 *
 * @param {Object} e - イベントオブジェクト（GASが自動で渡す）
 */
function onEdit(e) {
  // イベントオブジェクトがない場合は何もしない（手動実行対策）
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();         // 編集されたシート
  const sheetName = sheet.getName();        // シート名
  const col = e.range.getColumn();          // 編集された列
  const row = e.range.getRow();             // 編集された行
  const newValue = e.value;                 // 新しい値

  // 案件データシートのステータス列以外は無視
  if (sheetName !== SHEET_NAMES.deals) return;
  if (col !== COL.status) return;
  if (row < 2) return;  // ヘッダー行は無視

  // 案件データの1行を取得
  const lastCol = Object.keys(COL).length;  // 列数
  const dealRow = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

  try {
    // ステータスに応じて帳票を自動生成
    if (newValue === STATUS.ordered) {
      // 「注文確定」→ 納品書を自動生成
      generateDeliveryNote(dealRow);
      showInfo('注文確定しました。納品書を自動生成しました。');
    } else if (newValue === STATUS.delivered) {
      // 「納品済み」→ 請求書を自動生成
      generateInvoice(dealRow);
      // 納品日を自動記入（空欄の場合のみ）
      if (!dealRow[COL.deliveryDate - 1]) {
        sheet.getRange(row, COL.deliveryDate).setValue(new Date());
      }
      showInfo('納品済みに更新しました。請求書を自動生成しました。');
    }
  } catch (error) {
    // エラーが起きても分かりやすく通知する
    showInfo('エラーが発生しました:\n' + error.message);
  }
}

// ───────────────────────────────────────
// 手動生成メニュー用の関数
// ───────────────────────────────────────

/**
 * 現在選択している行の案件データから見積書を生成する。
 */
function createEstimate() {
  const row = getSelectedDealRow();  // 選択行の案件データを取得
  if (!row) return;                  // 取得失敗なら中断

  try {
    generateEstimate(row);
    showInfo('見積書を生成しました。\n「見積書」シートを確認してください。');
  } catch (error) {
    showInfo('見積書の生成に失敗しました:\n' + error.message);
  }
}

/**
 * 現在選択している行の案件データから納品書を生成する。
 */
function createDeliveryNote() {
  const row = getSelectedDealRow();
  if (!row) return;

  try {
    generateDeliveryNote(row);
    showInfo('納品書を生成しました。\n「納品書」シートを確認してください。');
  } catch (error) {
    showInfo('納品書の生成に失敗しました:\n' + error.message);
  }
}

/**
 * 現在選択している行の案件データから請求書を生成する。
 */
function createInvoice() {
  const row = getSelectedDealRow();
  if (!row) return;

  try {
    generateInvoice(row);
    showInfo('請求書を生成しました。\n「請求書」シートを確認してください。');
  } catch (error) {
    showInfo('請求書の生成に失敗しました:\n' + error.message);
  }
}

// ───────────────────────────────────────
// 選択行の取得（共通処理）
// ───────────────────────────────────────

/**
 * 案件データシートで現在選択されている行のデータを返す。
 * 案件データシート以外を選択している場合はエラーメッセージを出す。
 * @return {Array|null} 案件データの1行（配列）またはnull
 */
function getSelectedDealRow() {
  const sheet = SpreadsheetApp.getActiveSheet();  // 現在アクティブなシート
  const sheetName = sheet.getName();

  // 案件データシート以外の場合はエラー
  if (sheetName !== SHEET_NAMES.deals) {
    showInfo(
      '「案件データ」シートで対象の行を選択してから実行してください。\n' +
      '現在のシート: ' + sheetName
    );
    return null;
  }

  const row = SpreadsheetApp.getActiveRange().getRow();  // 選択中の行番号
  if (row < 2) {
    showInfo('ヘッダー行ではなく、データ行を選択してください。');
    return null;
  }

  const lastCol = Object.keys(COL).length;  // 列数を取得
  const dealRow = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

  // 案件番号が空ならデータがない行
  if (!dealRow[COL.dealId - 1]) {
    showInfo('選択した行に案件データがありません。\n案件番号を入力してください。');
    return null;
  }

  return dealRow;
}

// ───────────────────────────────────────
// 案件番号の自動入力（便利機能）
// ───────────────────────────────────────

/**
 * 案件データシートの選択行に新しい案件番号を自動入力する。
 * メニューからも呼べるが、主にサンプルデータ投入時に使う。
 */
function fillDealId() {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== SHEET_NAMES.deals) {
    showInfo('「案件データ」シートで実行してください。');
    return;
  }
  const row = SpreadsheetApp.getActiveRange().getRow();
  if (row < 2) {
    showInfo('2行目以降を選択してください。');
    return;
  }
  const newId = generateDealId();                        // 新しい案件番号を生成
  sheet.getRange(row, COL.dealId).setValue(newId);       // A列に書き込み
  sheet.getRange(row, COL.date).setValue(new Date());    // B列に今日の日付
  sheet.getRange(row, COL.status).setValue(STATUS.draft); // D列に初期ステータス
  showInfo('案件番号 ' + newId + ' を入力しました。');
}
