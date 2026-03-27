import Cocoa
import SwiftUI

final class FloatingWindow: NSPanel {

    init() {
        super.init(
            contentRect: NSRect(x: 0, y: 0, width: 400, height: 80),
            styleMask: [.nonactivatingPanel, .hudWindow],
            backing: .buffered,
            defer: false
        )
        isFloatingPanel = true
        level = .floating
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        isOpaque = false
        backgroundColor = .clear
        hasShadow = true
    }

    func showNearCursor() {
        let mouseLocation = NSEvent.mouseLocation
        setFrameOrigin(NSPoint(x: mouseLocation.x - 200, y: mouseLocation.y + 20))
        orderFront(nil)
    }

    func updateContent(text: String, isProcessing: Bool) {
        contentView = NSHostingView(rootView:
            HStack {
                Text(text.isEmpty ? "話してください..." : text)
                    .foregroundColor(.white)
                    .lineLimit(3)
                    .frame(maxWidth: .infinity, alignment: .leading)
                if isProcessing {
                    ProgressView()
                        .scaleEffect(0.6)
                }
            }
            .padding(12)
            .frame(width: 400)
            .background(Color.black.opacity(0.85))
            .cornerRadius(12)
        )
    }
}
