# てあて薬局 開発ロードマップ

自動エージェントループが順次実装するタスク一覧。
完了したタスクは `[x]` に変更すること。

## Phase 1: 品質・バグ修正（最優先）

- [x] ROAD-01: result/page.tsx のスコアラベル閾値を新スコア範囲（0-12/カテゴリ）に合わせて修正
- [x] ROAD-02: checkin/page.tsx のスライダー値がリセットされずに残る問題を修正
- [ ] ROAD-03: 未ログイン状態で /home 以降に直接アクセスした場合に /onboarding にリダイレクトするガード強化
- [ ] ROAD-04: ホームの「疲労スコア」が診断していない場合に表示されないこと（現状確認・修正）

## Phase 2: UX改善

- [ ] ROAD-05: result/page.tsx に「この疲労タイプへの対処法」セクションを追加（tips 3つ）
- [ ] ROAD-06: diagnosis/page.tsx にセクション間のスクロール自動移動を追加（回答後に次セクションへ）
- [ ] ROAD-07: checkin完了後にホームへの遷移を0.8秒のフィードバックアニメーション付きで実装
- [ ] ROAD-08: onboarding/page.tsx のステップ説明を診断中心の内容に更新（キャラ説明を削除）

## Phase 3: 機能追加

- [ ] ROAD-09: report/page.tsx に週次チェックイン集計グラフ（簡易バーチャート）を追加
- [ ] ROAD-10: kampo/page.tsx でユーザーの primaryType に一致する漢方を上部にハイライト表示
- [ ] ROAD-11: mypage/page.tsx に診断履歴リスト（直近3回）を表示するセクションを追加
- [ ] ROAD-12: result/page.tsx に「診断をシェアする」ボタンを追加（Web Share API）

## Phase 4: コード品質

- [ ] ROAD-13: home/page.tsx の `calcFatigueScore` と `getCharStatus` を lib/diagnosis.ts に移動して共通化
- [ ] ROAD-14: 各ページで重複している FATIGUE_LABELS を types/index.ts に移動して単一定義にする
- [ ] ROAD-15: TabBar コンポーネントのアクティブタブ判定を現在のパス名ベースに統一
