---
name: flutter-android
description: ~/Library/Android/sdk でFlutter Android APKをビルドする際の3つのハマり所と回避策
metadata: 
  node_type: memory
  type: reference
  originSessionId: 703bb104-8ca8-45cb-9cf2-e3fba874a7b5
---

Macローカル（/Users/apple）でFlutter AndroidアプリをAPKまでビルドした際の実証済みノウハウ（2026-06-12 筋トレログアプリ `~/dev/iron_log` で確立）。

## 環境
- Flutter: `/opt/homebrew/bin/flutter`（3.44系）/ Android SDK: `~/Library/Android/sdk`（platforms 33-36, build-tools あり）
- JDK: Android Studio同梱JBR `/Applications/Android Studio.app/Contents/jbr/Contents/Home`（`java`はPATHに無い）
- ビルド時の必須env:
  ```
  export ANDROID_HOME=~/Library/Android/sdk
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
  ```
- 初期状態では cmdline-tools 未導入・ライセンス未承認。`commandlinetools-mac-*.zip` を `~/Library/Android/sdk/cmdline-tools/latest/` に展開し `yes | sdkmanager --licenses`。

## ハマり所3つ（必ず踏む）

**1. Bashサンドボックスが Gradle デーモンを即kill**
- 通常のBash（サンドボックス有効）で `flutter build apk` するとGradleデーモンが起動直後に無言で消滅（daemonログは"started executing the build"で停止、例外なし、APK生成されず）。
- 回避: ビルド系コマンドは `dangerouslyDisableSandbox: true` で実行する（自分のマシンでの正当なローカルビルド）。

**2. Gradle本体のCDN DLが詰まる**
- `services.gradle.org` は307を返すが、その先のCDNからの巨大zip取得が `Operation timed out` する（gradle-9.1.0-all 等）。
- 回避: `curl -L` で `gradle-X.Y.Z-bin.zip` を別途DLし、`android/gradle/wrapper/gradle-wrapper.properties` の `distributionUrl` を `file\:/絶対パス` に書き換える（以後ネットワーク不要）。

**3. 同一プロジェクトの並行ビルドでGradleロック衝突**
- 裏で `flutter build`/`flutter run` を回したまま、ユーザーも `flutter run` すると `Timeout waiting to lock build logic queue ... buildLogic.lock` で片方が落ちる。
- 鉄則: **同一プロジェクトのGradleビルドは常に1本**。裏ビルド中はユーザーに同時実行させない／衝突したら `pkill -9 -f GradleDaemon` + `rm -f android/.gradle/noVersion/buildLogic.lock` で解放。

## その他
- 初回の依存DL（Google Maven）はこの環境だと激遅（数十分）。一度キャッシュされれば以降のdebug/releaseビルドは80〜120秒で通る。
- Health Connect連携は `health` プラグイン（13系）。`MainActivity` を `FlutterFragmentActivity` に、minSdk 26 / compileSdk 36、AndroidManifestにhealth権限＋HC可視化queries＋rationale intent-filterが必須。
- エミュレータ `Medium_Phone_API_36.1` が既存。`flutter emulators --launch` で起動、`adb -s emulator-5554 exec-out screencap -p > x.png` で実画面確認できる。

**Why:** 筋トレログアプリ構築で、サンドボックスkill→Gradle CDN詰まり→並行ビルドロック衝突の3連でビルドが何度も失敗した。原因切り分けに時間を使ったので次回は即回避する。
**How to apply:** Macで `flutter build apk` 系を回すとき、最初からこの3点（sandbox無効・Gradleローカルfile参照・ビルドは1本）を前提にする。
