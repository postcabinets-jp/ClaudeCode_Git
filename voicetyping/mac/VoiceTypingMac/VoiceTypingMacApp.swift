import SwiftUI

@main
struct VoiceTypingMacApp: App {

    @StateObject private var appState = AppState()

    var body: some Scene {
        MenuBarExtra("VoiceTyping", systemImage: appState.isRecording ? "mic.fill" : "mic") {
            VStack(alignment: .leading, spacing: 8) {
                Text(appState.isRecording ? "録音中..." : "Right Option で録音")
                    .font(.headline)

                if !appState.lastTranscription.isEmpty {
                    Divider()
                    Text(appState.lastTranscription)
                        .font(.body)
                        .lineLimit(5)
                }

                Divider()

                Menu("モード: \(appState.selectedMode.label)") {
                    ForEach(OutputMode.allCases, id: \.self) { mode in
                        Button(mode.label) {
                            appState.selectedMode = mode
                            Settings.shared.selectedMode = mode
                        }
                    }
                }

                Button("設定...") { appState.showSettings = true }
                Divider()
                Button("終了") { NSApplication.shared.terminate(nil) }
            }
            .padding(8)
            .frame(width: 300)
        }

        Settings {
            SettingsView()
        }
    }
}

@MainActor
final class AppState: ObservableObject {

    @Published var isRecording = false
    @Published var lastTranscription = ""
    @Published var selectedMode: OutputMode = Settings.shared.selectedMode
    @Published var showSettings = false

    private let speechManager = SpeechManager()
    private let hotkeyManager = HotkeyManager()
    private let formatter = LLMFormatter()
    private let textInjector = TextInjector()
    private let floatingWindow = FloatingWindow()

    init() {
        hotkeyManager.onHotkeyDown = { [weak self] in
            Task { @MainActor in self?.startRecording() }
        }
        hotkeyManager.onHotkeyUp = { [weak self] in
            Task { @MainActor in self?.stopAndProcess() }
        }
        hotkeyManager.start()

        speechManager.$transcription.assign(to: &$lastTranscription)
        speechManager.$isRecording.assign(to: &$isRecording)
    }

    private func startRecording() {
        floatingWindow.showNearCursor()
        floatingWindow.updateContent(text: "", isProcessing: false)
        speechManager.startRecording()
    }

    private func stopAndProcess() {
        let rawText = speechManager.stopRecording()
        guard !rawText.isEmpty else {
            floatingWindow.orderOut(nil)
            return
        }

        floatingWindow.updateContent(text: rawText, isProcessing: true)

        Task {
            let result = await formatter.format(rawText, mode: selectedMode)
            floatingWindow.updateContent(text: result.cleaned, isProcessing: false)
            textInjector.inject(result.cleaned)

            try? await Task.sleep(nanoseconds: 1_000_000_000)
            floatingWindow.orderOut(nil)
        }
    }
}

extension OutputMode {
    var label: String {
        switch self {
        case .casual: return "カジュアル"
        case .business: return "ビジネス"
        case .technical: return "テクニカル"
        case .raw: return "そのまま"
        }
    }
}
