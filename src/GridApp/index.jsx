import React, { useState, useCallback } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "react-grid-layout-config";
const COLS = 12;
const ROW_HEIGHT = 100;
const GRID_WIDTH = 1200;

const WIDGET_COLORS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #fda085, #f6d365)",
  "linear-gradient(135deg, #84fab0, #8fd3f4)",
];

const DEFAULT_WIDGETS = [
  { i: "w1", x: 0,  y: 0, w: 4, h: 2, title: "📊 Analytics",     content: "Track your key metrics and KPIs in real time." },
  { i: "w2", x: 4,  y: 0, w: 4, h: 2, title: "📈 Revenue",        content: "Monthly revenue overview and growth trends." },
  { i: "w3", x: 8,  y: 0, w: 4, h: 2, title: "👥 Users",          content: "Active users and engagement statistics." },
  { i: "w4", x: 0,  y: 2, w: 6, h: 3, title: "🗺️ Traffic Map",    content: "Geographic distribution of your user base." },
  { i: "w5", x: 6,  y: 2, w: 6, h: 3, title: "📅 Schedule",       content: "Upcoming events, meetings and deadlines." },
  { i: "w6", x: 0,  y: 5, w: 12, h: 2, title: "🔔 Notifications", content: "Latest system alerts and notifications." },
];

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save layout:", e);
  }
};

const clearStorage = () => localStorage.removeItem(STORAGE_KEY);

const generateId = () =>
  `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReactGridLayoutApp() {
  const saved = loadFromStorage();

  const [widgets, setWidgets] = useState(saved?.widgets ?? DEFAULT_WIDGETS);
  const [layout, setLayout]   = useState(saved?.layout  ?? DEFAULT_WIDGETS.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })));
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast]         = useState(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Persist on every layout change ──────────────────────────────────────────
  const handleLayoutChange = useCallback(
    (newLayout) => {
      setLayout(newLayout);
      saveToStorage({ widgets, layout: newLayout });
    },
    [widgets]
  );

  // ── Add Widget ───────────────────────────────────────────────────────────────
  const addWidget = () => {
    const id = generateId();
    const newWidget = {
      i: id, x: 0, y: Infinity, w: 4, h: 2,
      title: "🆕 New Widget",
      content: "Click edit to customise this widget.",
    };
    const updated = [...widgets, newWidget];
    const newLayout = [...layout, { i: id, x: 0, y: Infinity, w: 4, h: 2 }];
    setWidgets(updated);
    setLayout(newLayout);
    saveToStorage({ widgets: updated, layout: newLayout });
    showToast("Widget added!");
  };

  // ── Remove Widget ────────────────────────────────────────────────────────────
  const removeWidget = (id) => {
    const updatedWidgets = widgets.filter((w) => w.i !== id);
    const updatedLayout  = layout.filter((l) => l.i !== id);
    setWidgets(updatedWidgets);
    setLayout(updatedLayout);
    saveToStorage({ widgets: updatedWidgets, layout: updatedLayout });
    showToast("Widget removed!", "error");
  };

  // ── Reset Layout ─────────────────────────────────────────────────────────────
  const resetLayout = () => {
    clearStorage();
    setWidgets(DEFAULT_WIDGETS);
    setLayout(DEFAULT_WIDGETS.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })));
    showToast("Layout reset to default!");
  };

  // ── Save Manually ─────────────────────────────────────────────────────────────
  const saveLayout = () => {
    saveToStorage({ widgets, layout });
    showToast("💾 Layout saved!");
  };

  return (
    <div style={styles.app}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚡ Grid Dashboard</h1>
          <p style={styles.subtitle}>
            {isEditing ? "🔓 Edit mode — drag & resize freely" : "🔒 View mode — toggle edit to rearrange"}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={saveLayout}>
            💾 Save
          </button>
          <button style={{ ...styles.btn, ...styles.btnAdd }} onClick={addWidget}>
            ➕ Add Widget
          </button>
          <button
            style={{ ...styles.btn, ...(isEditing ? styles.btnWarning : styles.btnPrimary) }}
            onClick={() => setIsEditing((p) => !p)}
          >
            {isEditing ? "🔒 Lock" : "✏️ Edit"}
          </button>
          <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={resetLayout}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* ── Storage Badge ── */}
      <div style={styles.badge}>
        <span style={styles.badgeDot} />
        Auto-saving to <code style={styles.code}>localStorage["{STORAGE_KEY}"]</code>
      </div>

      {/* ── Grid ── */}
      <GridLayout
        layout={layout}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        width={GRID_WIDTH}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        style={styles.grid}
      >
        {widgets.map((widget, idx) => (
          <div key={widget.i} style={styles.card}>
            {/* Card Header */}
            <div
              style={{
                ...styles.cardHeader,
                background: WIDGET_COLORS[idx % WIDGET_COLORS.length],
              }}
            >
              {isEditing && (
                <span className="drag-handle" style={styles.dragHandle} title="Drag">
                  ⠿
                </span>
              )}
              <span style={styles.cardTitle}>{widget.title}</span>
              {isEditing && (
                <button
                  style={styles.removeBtn}
                  onClick={() => removeWidget(widget.i)}
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Card Body */}
            <div style={styles.cardBody}>
              <p style={styles.cardContent}>{widget.content}</p>
              <div style={styles.cardMeta}>
                <span style={styles.metaTag}>ID: {widget.i}</span>
                <span style={styles.metaTag}>
                  {layout.find((l) => l.i === widget.i)
                    ? `${layout.find((l) => l.i === widget.i).w}×${layout.find((l) => l.i === widget.i).h}`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </GridLayout>

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "error" ? "#ff4757" : "#2ed573",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  app: {
    minHeight: "100vh",
    background: "#0f0f1a",
    padding: "24px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontSize: "1.9rem",
    fontWeight: 800,
    background: "linear-gradient(90deg,#667eea,#f093fb)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "#888",
    marginTop: "4px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  btn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.85rem",
    transition: "opacity 0.2s, transform 0.2s",
  },
  btnPrimary:   { background: "#667eea", color: "#fff" },
  btnSecondary: { background: "#2f3542", color: "#fff" },
  btnAdd:       { background: "#2ed573", color: "#111" },
  btnWarning:   { background: "#ffa502", color: "#111" },
  btnDanger:    { background: "#ff4757", color: "#fff" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#1e1e2e",
    border: "1px solid #2f2f4a",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "0.78rem",
    color: "#aaa",
    marginBottom: "20px",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#2ed573",
    display: "inline-block",
    animation: "pulse 1.5s infinite",
  },
  code: {
    background: "#2f2f4a",
    padding: "2px 6px",
    borderRadius: "4px",
    fontFamily: "monospace",
    color: "#f093fb",
  },
  grid: {
    background: "#13131f",
    borderRadius: "12px",
    padding: "12px",
    minHeight: "600px",
  },
  card: {
    background: "#1e1e2e",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #2f2f4a",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    transition: "box-shadow 0.3s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    position: "relative",
  },
  dragHandle: {
    cursor: "grab",
    fontSize: "1.2rem",
    opacity: 0.8,
    userSelect: "none",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
    flex: 1,
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  removeBtn: {
    background: "rgba(0,0,0,0.3)",
    border: "none",
    color: "#fff",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    padding: "14px 16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardContent: {
    color: "#ccc",
    fontSize: "0.85rem",
    lineHeight: 1.6,
  },
  cardMeta: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  metaTag: {
    background: "#2f2f4a",
    color: "#888",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "0.72rem",
    fontFamily: "monospace",
  },
  toast: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    padding: "14px 24px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#111",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    zIndex: 9999,
    animation: "slideIn 0.3s ease",
  },
};
