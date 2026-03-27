import SwiftUI

struct SettingsView: View {

    @State private var selectedMode = Settings.shared.selectedMode
    @State private var customAPIKey = Settings.shared.customAPIKey ?? ""

    var body: some View {
        Form {
            Section("デフォルトモード") {
                Picker("モード", selection: $selectedMode) {
                    ForEach(OutputMode.allCases, id: \.self) { mode in
                        Text(mode.label).tag(mode)
                    }
                }
                .onChange(of: selectedMode) { _, newValue in
                    Settings.shared.selectedMode = newValue
                }
            }

            Section("API設定（オプション）") {
                TextField("Gemini API Key（空欄でプロキシ使用）", text: $customAPIKey)
                    .onChange(of: customAPIKey) { _, newValue in
                        Settings.shared.customAPIKey = newValue.isEmpty ? nil : newValue
                    }
            }

            Section("ショートカット") {
                Text("Right Option キーを長押しで録音")
                    .foregroundColor(.secondary)
            }
        }
        .padding(20)
        .frame(width: 400)
    }
}
