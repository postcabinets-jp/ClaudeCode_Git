"use client";

import { useRouter } from "next/navigation";

const TABS = [
  { label: "ホーム", icon: "home", path: "/home" },
  { label: "調子", icon: "activity", path: "/checkin" },
  { label: "漢方", icon: "leaf", path: "/kampo" },
  { label: "相談", icon: "message-circle", path: "/chat" },
  { label: "マイページ", icon: "user", path: "/mypage" },
];

const ICONS: Record<string, string> = {
  "home": "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  "activity": "M22 12h-4l-3 9L9 3l-3 9H2",
  "leaf": "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  "message-circle": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  "user": "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
};

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const d = ICONS[name] || "";
  const color = active ? "#FDF8F2" : "#8A9E98";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((part, i) => (
        <path key={i} d={i === 0 ? part : "M" + part} />
      ))}
    </svg>
  );
}

interface TabBarProps {
  activePath: string;
}

export function TabBar({ activePath }: TabBarProps) {
  const router = useRouter();

  return (
    <div style={{ padding: "12px 21px 21px", backgroundColor: "#FDF8F2" }}>
      <nav style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 36,
        height: 62,
        display: "flex",
        alignItems: "center",
        padding: 4,
        border: "1px solid #E0D8CC",
      }}>
        {TABS.map((tab) => {
          const isActive = activePath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: 26,
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                backgroundColor: isActive ? "#2C4A3E" : "transparent",
                transition: "background-color 0.2s",
              }}
            >
              <TabIcon name={tab.icon} active={isActive} />
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 0,
                color: isActive ? "#FDF8F2" : "#8A9E98",
                fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
