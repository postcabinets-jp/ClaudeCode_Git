import Foundation

final class Settings {

    static let shared = Settings()

    private let defaults = UserDefaults.standard

    var selectedMode: OutputMode {
        get {
            guard let raw = defaults.string(forKey: "selectedMode"),
                  let mode = OutputMode(rawValue: raw) else { return .casual }
            return mode
        }
        set { defaults.set(newValue.rawValue, forKey: "selectedMode") }
    }

    var proxyURL: String {
        get { defaults.string(forKey: "proxyURL") ?? "https://asia-northeast1-voicetyping-prod.cloudfunctions.net/formatText" }
        set { defaults.set(newValue, forKey: "proxyURL") }
    }

    var customAPIKey: String? {
        get { defaults.string(forKey: "customAPIKey") }
        set { defaults.set(newValue, forKey: "customAPIKey") }
    }

    var deviceId: String {
        if let id = defaults.string(forKey: "deviceId") { return id }
        let id = UUID().uuidString
        defaults.set(id, forKey: "deviceId")
        return id
    }

    var hotkeyKeyCode: UInt16 {
        get { UInt16(defaults.integer(forKey: "hotkeyKeyCode").nonZeroOr(58)) }
        set { defaults.set(Int(newValue), forKey: "hotkeyKeyCode") }
    }
}

private extension Int {
    func nonZeroOr(_ fallback: Int) -> Int { self == 0 ? fallback : self }
}
