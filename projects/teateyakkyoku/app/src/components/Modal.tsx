"use client";

interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "confirm" | "info";
}

export function Modal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  variant = "info",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.() ?? onConfirm?.();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "24px 24px 0 0",
          backgroundColor: "#fff",
          padding: "28px 24px",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 17,
            fontWeight: 700,
            color: "#1E2D2A",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 14,
            color: "#6B7F7A",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexDirection: variant === "confirm" ? "row" : "column",
          }}
        >
          {variant === "confirm" && (
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                border: "1.5px solid #E0D8CC",
                backgroundColor: "#fff",
                color: "#6B7F7A",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              border: "none",
              backgroundColor: variant === "confirm" ? "#E8956D" : "#2C4A3E",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {confirmLabel}
          </button>
        </div>

        {/* Safe area spacing for iOS */}
        <div style={{ height: "env(safe-area-inset-bottom, 8px)" }} />
      </div>
    </div>
  );
}
