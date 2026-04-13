"use client";

import { useRouter } from "next/navigation";

const TABS = [
  { label: "HOME", icon: "home", path: "/home" },
  { label: "CHECK", icon: "activity", path: "/checkin" },
  { label: "SHOP", icon: "shopping-bag", path: "/kampo" },
  { label: "CHAT", icon: "message-circle", path: "/chat" },
  { label: "REPORT", icon: "bar-chart-2", path: "/report" },
];

const ICONS: Record<string, string> = {
  "home": "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  "activity": "M22 12h-4l-3 9L9 3l-3 9H2",
  "shopping-bag": "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  "message-circle": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  "bar-chart-2": "M18 20V10 M12 20V4 M6 20v-6",
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
                letterSpacing: 0.5,
                color: isActive ? "#FDF8F2" : "#8A9E98",
                fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
                textTransform: "uppercase",
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
