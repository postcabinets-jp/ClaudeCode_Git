import Foundation
import Speech
import AVFoundation

@MainActor
final class SpeechManager: ObservableObject {

    @Published var isRecording = false
    @Published var transcription = ""

    private var recognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private var accumulatedText = ""

    init() {
        self.recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ja-JP"))
    }

    func startRecording() {
        guard !isRecording else { return }
        accumulatedText = ""
        transcription = ""
        beginRecognitionSession()
        isRecording = true
    }

    func stopRecording() -> String {
        guard isRecording else { return transcription }
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isRecording = false
        return transcription
    }

    private func beginRecognitionSession() {
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        if #available(macOS 13, *) {
            request.requiresOnDeviceRecognition = true
        }

        let currentAccumulated = accumulatedText
        recognitionRequest = request

        let inputNode = audioEngine.inputNode
        inputNode.removeTap(onBus: 0)
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        try? audioEngine.start()

        recognitionTask = recognizer?.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self = self else { return }
                if let result = result {
                    let partial = result.bestTranscription.formattedString
                    self.transcription = currentAccumulated.isEmpty ? partial : "\(currentAccumulated) \(partial)"
                }
                if error != nil, self.isRecording {
                    self.accumulatedText = self.transcription
                    self.beginRecognitionSession()
                }
            }
        }
    }
}
