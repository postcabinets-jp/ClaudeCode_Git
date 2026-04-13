/**
 * templates.gs — 帳票テンプレートの生成
 *
 * 見積書・納品書・請求書のシートを自動で作成する。
 * 各関数は「1枚の帳票を1つのシートに描く」ことだけ行う。
 */

// ───────────────────────────────────────
// 見積書の生成
// ───────────────────────────────────────

/**
 * 案件データ1行から見積書シートを生成する。
 * @param {Array} dealRow - 案件データの1行（配列）
 */
function generateEstimate(dealRow) {
  const sheet = getOrCreateSheet(SHEET_NAMES.estimate);  // 見積書シートを取得or作成
  sheet.clear();  // 前回の内容をクリア（上書き生成）

  const client = findClient(dealRow[COL.clientName - 1]);  // 取引先情報を検索
  if (!client) {
    throw new Error(
      `取引先「${dealRow[COL.clientName - 1]}」が取引先マスタに見つかりません。\n` +
      `→ 取引先マスタシートに登録してから再実行してください。`
    );
  }

  // --- ヘッダー部分 ---
  const header = [
    ['御 見 積 書'],
    [''],
    ['見積番号: ' + dealRow[COL.dealId - 1]],
    ['発行日: ' + todayFormatted()],
    ['有効期限: ' + DOC_SETTINGS.estimateValidDays + '日間'],
    [''],
    ['【宛先】'],
    [client.name + ' 御中'],
    ['〒' + client.zip + ' ' + client.address],
    [client.person + ' 様'],
    [''],
    ['【発行元】'],
    [COMPANY.name],
    [COMPANY.zip + ' ' + COMPANY.address],
    ['TEL: ' + COMPANY.tel + '  FAX: ' + COMPANY.fax],
    [''],
    ['下記の通り御見積り申し上げます。'],
    [''],
  ];
  sheet.getRange(1, 1, header.length, 1).setValues(header);  // ヘッダーを書き込み

  // --- 明細テーブル ---
  const tableStart = header.length + 1;  // テーブル開始行
  const tableHeader = [['商品名', '規格', '数量', '単価', '小計']];
  sheet.getRange(tableStart, 1, 1, 5).setValues(tableHeader);  // テーブルヘッダー

  // 明細行（今回は1案件1商品のシンプル版）
  const detailRow = [
    dealRow[COL.productName - 1],   // 商品名
    dealRow[COL.spec - 1],          // 規格
    dealRow[COL.quantity - 1],      // 数量
    dealRow[COL.unitPrice - 1],     // 単価
    dealRow[COL.subtotal - 1],      // 小計
  ];
  sheet.getRange(tableStart + 1, 1, 1, 5).setValues([detailRow]);  // 明細を書き込み

  // --- 合計部分 ---
  const summaryStart = tableStart + 3;  // 合計表示の開始行
  const summary = [
    ['', '', '', '小計（税抜）', dealRow[COL.subtotal - 1]],
    ['', '', '', '消費税（10%）', dealRow[COL.tax - 1]],
    ['', '', '', '合計（税込）', dealRow[COL.total - 1]],
  ];
  sheet.getRange(summaryStart, 1, summary.length, 5).setValues(summary);

  // --- 書式設定 ---
  formatDocumentSheet(sheet, tableStart, summaryStart);  // 見た目を整える
}

// ───────────────────────────────────────
// 納品書の生成
// ───────────────────────────────────────

/**
 * 案件データ1行から納品書シートを生成する。
 * @param {Array} dealRow - 案件データの1行（配列）
 */
function generateDeliveryNote(dealRow) {
  const sheet = getOrCreateSheet(SHEET_NAMES.delivery);  // 納品書シートを取得or作成
  sheet.clear();  // 前回の内容をクリア

  const client = findClient(dealRow[COL.clientName - 1]);  // 取引先情報を検索
  if (!client) {
    throw new Error(`取引先「${dealRow[COL.clientName - 1]}」が取引先マスタに見つかりません。`);
  }

  // --- ヘッダー部分 ---
  const header = [
    ['納 品 書'],
    [''],
    ['案件番号: ' + dealRow[COL.dealId - 1]],
    ['納品日: ' + todayFormatted()],
    [''],
    ['【宛先】'],
    [client.name + ' 御中'],
    [client.person + ' 様'],
    [''],
    ['【発行元】'],
    [COMPANY.name],
    [COMPANY.tel],
    [''],
    ['下記の通り納品いたします。'],
    [''],
  ];
  sheet.getRange(1, 1, header.length, 1).setValues(header);

  // --- 明細テーブル ---
  const tableStart = header.length + 1;
  sheet.getRange(tableStart, 1, 1, 5)
    .setValues([['商品名', '規格', '数量', '単価', '小計']]);

  const detailRow = [
    dealRow[COL.productName - 1],
    dealRow[COL.spec - 1],
    dealRow[COL.quantity - 1],
    dealRow[COL.unitPrice - 1],
    dealRow[COL.subtotal - 1],
  ];
  sheet.getRange(tableStart + 1, 1, 1, 5).setValues([detailRow]);

  // --- 合計 ---
  const summaryStart = tableStart + 3;
  sheet.getRange(summaryStart, 4, 3, 2).setValues([
    ['小計（税抜）', dealRow[COL.subtotal - 1]],
    ['消費税（10%）', dealRow[COL.tax - 1]],
    ['合計（税込）', dealRow[COL.total - 1]],
  ]);

  formatDocumentSheet(sheet, tableStart, summaryStart);
}

// ───────────────────────────────────────
// 請求書の生成
// ───────────────────────────────────────

/**
 * 案件データ1行から請求書シートを生成する。
 * @param {Array} dealRow - 案件データの1行（配列）
 */
function generateInvoice(dealRow) {
  const sheet = getOrCreateSheet(SHEET_NAMES.invoice);  // 請求書シートを取得or作成
  sheet.clear();  // 前回の内容をクリア

  const client = findClient(dealRow[COL.clientName - 1]);
  if (!client) {
    throw new Error(`取引先「${dealRow[COL.clientName - 1]}」が取引先マスタに見つかりません。`);
  }

  // 支払条件: 取引先マスタにあればそれを使い、なければデフォルト
  const paymentTerms = client.payment || DOC_SETTINGS.paymentTerms;

  // --- ヘッダー部分 ---
  const header = [
    ['請 求 書'],
    [''],
    ['案件番号: ' + dealRow[COL.dealId - 1]],
    ['発行日: ' + todayFormatted()],
    ['お支払期限: ' + paymentTerms],
    [''],
    ['【宛先】'],
    [client.name + ' 御中'],
    ['〒' + client.zip + ' ' + client.address],
    [client.person + ' 様'],
    [''],
    ['【発行元】'],
    [COMPANY.name],
    [COMPANY.zip + ' ' + COMPANY.address],
    ['TEL: ' + COMPANY.tel + '  FAX: ' + COMPANY.fax],
    [''],
    ['下記の通りご請求申し上げます。'],
    [''],
  ];
  sheet.getRange(1, 1, header.length, 1).setValues(header);

  // --- 明細テーブル ---
  const tableStart = header.length + 1;
  sheet.getRange(tableStart, 1, 1, 5)
    .setValues([['商品名', '規格', '数量', '単価', '小計']]);

  sheet.getRange(tableStart + 1, 1, 1, 5).setValues([[
    dealRow[COL.productName - 1],
    dealRow[COL.spec - 1],
    dealRow[COL.quantity - 1],
    dealRow[COL.unitPrice - 1],
    dealRow[COL.subtotal - 1],
  ]]);

  // --- 合計 ---
  const summaryStart = tableStart + 3;
  sheet.getRange(summaryStart, 4, 3, 2).setValues([
    ['小計（税抜）', dealRow[COL.subtotal - 1]],
    ['消費税（10%）', dealRow[COL.tax - 1]],
    ['合計（税込）', dealRow[COL.total - 1]],
  ]);

  // --- 振込先（請求書のみ） ---
  const bankStart = summaryStart + 5;
  sheet.getRange(bankStart, 1, 3, 1).setValues([
    ['【お振込先】'],
    [COMPANY.bank],
    ['※振込手数料はお客様ご負担でお願いいたします。'],
  ]);

  formatDocumentSheet(sheet, tableStart, summaryStart);
}

// ───────────────────────────────────────
// 帳票の書式設定（共通）
// ───────────────────────────────────────

/**
 * 帳票シートの見た目を整える。タイトル太字、罫線、列幅など。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 対象シート
 * @param {number} tableStart - 明細テーブルの開始行
 * @param {number} summaryStart - 合計部分の開始行
 */
function formatDocumentSheet(sheet, tableStart, summaryStart) {
  // タイトル行を太字＆大きめフォント
  sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');

  // テーブルヘッダーを太字＆背景色
  sheet.getRange(tableStart, 1, 1, 5)
    .setFontWeight('bold')
    .setBackground('#4472C4')     // 青系の背景
    .setFontColor('#FFFFFF');      // 白文字

  // テーブル全体に罫線
  sheet.getRange(tableStart, 1, 2, 5)
    .setBorder(true, true, true, true, true, true);

  // 合計部分を太字
  sheet.getRange(summaryStart, 4, 3, 2).setFontWeight('bold');

  // 列幅を設定（見やすくするため）
  sheet.setColumnWidth(1, 200);  // A列: 商品名
  sheet.setColumnWidth(2, 150);  // B列: 規格
  sheet.setColumnWidth(3, 80);   // C列: 数量
  sheet.setColumnWidth(4, 100);  // D列: 単価
  sheet.setColumnWidth(5, 120);  // E列: 小計
}

// ───────────────────────────────────────
// 月次売上レポート
// ───────────────────────────────────────

/**
 * 当月の納品済み案件を集計してレポートシートに出力する。
 */
function generateMonthlyReport() {
  const dealsSheet = getSheet(SHEET_NAMES.deals);           // 案件データシート
  const reportSheet = getOrCreateSheet(SHEET_NAMES.report); // レポートシート
  reportSheet.clear();  // 前回のレポートをクリア

  const data = dealsSheet.getDataRange().getValues();  // 全案件データを取得
  const now = new Date();
  const thisYear = now.getFullYear();     // 今年
  const thisMonth = now.getMonth();       // 今月（0始まり）

  // 当月の納品済み・請求済み・入金済みの案件を抽出
  const completedStatuses = [STATUS.delivered, STATUS.invoiced, STATUS.paid];
  let totalRevenue = 0;    // 売上合計
  let totalTax = 0;        // 消費税合計
  let dealCount = 0;       // 案件数
  const details = [];      // 明細データ

  // ヘッダー行（i=0）をスキップして各行を処理
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[COL.status - 1];           // ステータス
    const dealDate = new Date(row[COL.date - 1]); // 案件日付

    // 当月かつ納品済み以降のステータスかチェック
    const isThisMonth = dealDate.getFullYear() === thisYear && dealDate.getMonth() === thisMonth;
    const isCompleted = completedStatuses.indexOf(status) !== -1;

    if (isThisMonth && isCompleted) {
      dealCount++;
      totalRevenue += Number(row[COL.subtotal - 1]) || 0;
      totalTax += Number(row[COL.tax - 1]) || 0;
      details.push([
        row[COL.dealId - 1],       // 案件番号
        row[COL.clientName - 1],   // 取引先名
        row[COL.productName - 1],  // 商品名
        row[COL.subtotal - 1],     // 小計
        row[COL.tax - 1],          // 消費税
        row[COL.total - 1],        // 合計
        status,                     // ステータス
      ]);
    }
  }

  // --- レポート出力 ---
  const monthLabel = thisYear + '年' + (thisMonth + 1) + '月';
  const report = [
    ['月次売上レポート — ' + monthLabel],
    ['出力日: ' + todayFormatted()],
    [''],
    ['案件数', dealCount],
    ['売上合計（税抜）', totalRevenue],
    ['消費税合計', totalTax],
    ['売上合計（税込）', totalRevenue + totalTax],
    [''],
    ['--- 明細 ---'],
    ['案件番号', '取引先', '商品名', '小計', '消費税', '合計', 'ステータス'],
  ];
  sheet = reportSheet;
  sheet.getRange(1, 1, report.length, 7).setValues(
    report.map(function(r) {
      // 列数を7に揃える（足りない分は空文字で埋める）
      while (r.length < 7) r.push('');
      return r;
    })
  );

  // 明細データを書き込み
  if (details.length > 0) {
    sheet.getRange(report.length + 1, 1, details.length, 7).setValues(details);
  }

  // 書式設定
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  sheet.getRange(10, 1, 1, 7).setFontWeight('bold').setBackground('#4472C4').setFontColor('#FFFFFF');

  showInfo(monthLabel + 'の売上レポートを生成しました。\n案件数: ' + dealCount);
}
