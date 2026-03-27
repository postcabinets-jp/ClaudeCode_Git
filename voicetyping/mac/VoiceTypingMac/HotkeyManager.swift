import Cocoa

final class HotkeyManager {

    var onHotkeyDown: (() -> Void)?
    var onHotkeyUp: (() -> Void)?

    private var eventTap: CFMachPort?
    private let keyCode: UInt16

    init(keyCode: UInt16 = 58) {
        self.keyCode = keyCode
    }

    func start() {
        let mask: CGEventMask = (1 << CGEventType.flagsChanged.rawValue)

        let callback: CGEventTapCallBack = { _, type, event, refcon in
            guard let refcon = refcon else { return Unmanaged.passRetained(event) }
            let manager = Unmanaged<HotkeyManager>.fromOpaque(refcon).takeUnretainedValue()

            if type == .flagsChanged && event.getIntegerValueField(.keyboardEventKeycode) == Int64(manager.keyCode) {
                let flags = event.flags
                if flags.contains(.maskAlternate) {
                    manager.onHotkeyDown?()
                } else {
                    manager.onHotkeyUp?()
                }
            }

            return Unmanaged.passRetained(event)
        }

        let refcon = Unmanaged.passUnretained(self).toOpaque()
        eventTap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: mask,
            callback: callback,
            userInfo: refcon
        )

        guard let eventTap = eventTap else { return }
        let source = CFMachPortCreateRunLoopSource(nil, eventTap, 0)
        CFRunLoopAddSource(CFRunLoopGetCurrent(), source, .commonModes)
        CGEvent.tapEnable(tap: eventTap, enable: true)
    }
}
