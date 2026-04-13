/**
 * utils.gs — ユーティリティ関数
 *
 * 帳票生成やデータ操作で繰り返し使う小さな関数をまとめる。
 * どの関数も「1つのことだけ」行う。
 */

// ───────────────────────────────────────
// シート取得
// ───────────────────────────────────────

/**
 * シート名でシートを取得する。存在しなければエラー。
 * @param {string} name - シート名
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); // 現在のスプレッドシート
  const sheet = ss.getSheetByName(name);            // シートを名前で検索
  if (!sheet) {
    // シートが見つからない場合は、何をすればいいか伝える
    throw new Error(
      `「${name}」シートが見つかりません。\n` +
      `→ シート名が正しいか確認してください。\n` +
      `→ 初回は「メニュー > 帳票自動化 > 初期設定」を実行してください。`
    );
  }
  return sheet;
}

/**
 * シートが存在しなければ新規作成する。存在すればそのまま返す。
 * @param {string} name - シート名
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); // 現在のスプレッドシート
  let sheet = ss.getSheetByName(name);              // 既存シートを検索
  if (!sheet) {
    sheet = ss.insertSheet(name);                   // なければ新規作成
  }
  return sheet;
}

// ───────────────────────────────────────
// 日付・フォーマット
// ───────────────────────────────────────

/**
 * 今日の日付を「yyyy年MM月dd日」形式で返す。
 * @return {string}
 */
function todayFormatted() {
  return Utilities.formatDate(
    new Date(),                  // 現在日時
    'Asia/Tokyo',                // タイムゾーンは日本固定
    DOC_SETTINGS.dateFormat       // config.gs で定義したフォーマット
  );
}

/**
 * Date オブジェクトをフォーマット文字列に変換する。
 * @param {Date} date - 変換する日付
 * @return {string}
 */
function formatDate(date) {
  if (!date) return '';  // 日付が空なら空文字を返す（エラー防止）
  return Utilities.formatDate(date, 'Asia/Tokyo', DOC_SETTINGS.dateFormat);
}

/**
 * 金額を3桁カンマ区切りで返す。
 * @param {number} amount - 金額
 * @return {string} 例: "1,234,567"
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') return '0';  // 数値でなければ0を返す
  return amount.toLocaleString('ja-JP');        // 日本語ロケールでカンマ区切り
}

// ───────────────────────────────────────
// 案件番号の自動採番
// ───────────────────────────────────────

/**
 * 新しい案件番号を生成する。形式: EST-YYYYMMDD-001
 * @return {string}
 */
function generateDealId() {
  const today = new Date();
  // 日付部分: 20260325 のような8桁
  const datePart = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyyMMdd');
  const sheet = getSheet(SHEET_NAMES.deals);         // 案件データシートを取得
  const lastRow = sheet.getLastRow();                // 最終行を取得
  // 今日の案件数をカウントして連番をつける
  let count = 0;
  if (lastRow >= 2) {
    // 2行目以降（ヘッダー除く）のA列を取得
    const ids = sheet.getRange(2, COL.dealId, lastRow - 1, 1).getValues();
    // 今日の日付を含む案件番号をカウント
    count = ids.filter(function(row) {
      return String(row[0]).indexOf(datePart) !== -1;
    }).length;
  }
  // 3桁ゼロ埋めの連番（001, 002, ...）
  const seq = ('000' + (count + 1)).slice(-3);
  return 'EST-' + datePart + '-' + seq;
}

// ───────────────────────────────────────
// データ検索
// ───────────────────────────────────────

/**
 * 取引先マスタから会社名で検索し、1行分のデータを返す。
 * @param {string} clientName - 取引先名
 * @return {Object|null} {name, zip, address, person, payment}
 */
function findClient(clientName) {
  const sheet = getSheet(SHEET_NAMES.clients);     // 取引先マスタシート
  const data = sheet.getDataRange().getValues();   // 全データを取得
  // 1行目はヘッダーなのでスキップ
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clientName) {
      return {
        name: data[i][0],       // A列: 会社名
        zip: data[i][1],        // B列: 郵便番号
        address: data[i][2],    // C列: 住所
        person: data[i][3],     // D列: 担当者名
        payment: data[i][4],    // E列: 支払条件
      };
    }
  }
  return null;  // 見つからなければ null
}

/**
 * 商品マスタから商品名で検索し、1行分のデータを返す。
 * @param {string} productName - 商品名
 * @return {Object|null} {name, spec, unitPrice, cost}
 */
function findProduct(productName) {
  const sheet = getSheet(SHEET_NAMES.products);    // 商品マスタシート
  const data = sheet.getDataRange().getValues();   // 全データを取得
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productName) {
      return {
        name: data[i][0],       // A列: 商品名
        spec: data[i][1],       // B列: 規格
        unitPrice: data[i][2],  // C列: 標準単価
        cost: data[i][3],       // D列: 原価
      };
    }
  }
  return null;  // 見つからなければ null
}

// ───────────────────────────────────────
// UI ヘルパー
// ───────────────────────────────────────

/**
 * 情報ダイアログを表示する（処理完了の通知などに使う）。
 * @param {string} message - 表示するメッセージ
 */
function showInfo(message) {
  SpreadsheetApp.getUi().alert('帳票自動化', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * 確認ダイアログを表示し、「はい」が押されたかを返す。
 * @param {string} message - 確認メッセージ
 * @return {boolean}
 */
function showConfirm(message) {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert('確認', message, ui.ButtonSet.YES_NO);
  return result === ui.Button.YES;  // 「はい」なら true
}
