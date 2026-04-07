"use client";

import { App, ConfigProvider, theme } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

const AI_OPTIONS = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "grok", label: "Grok" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "llama", label: "LLaMA" },
  { value: "copilot", label: "Copilot" },
  { value: "mistral", label: "Mistral" },
  { value: "perplexity", label: "Perplexity" },
];

interface HistoryEntry {
  id: number;
  inputText: string;
  outputText: string;
  targetAi: string;
  timestamp: number;
}

const HISTORY_KEY = "koskimize_history";
const MAX_HISTORY = 10;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: "#6366f1", borderRadius: 10, fontSize: 14 },
      }}
    >
      <App>
        <MainContent darkMode={darkMode} setDarkMode={setDarkMode} />
      </App>
    </ConfigProvider>
  );
}

function MainContent({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  const { message } = App.useApp();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetAi, setTargetAi] = useState("claude");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleConvert = useCallback(async () => {
    if (!inputText.trim()) {
      message.warning("Scrivi qualcosa prima di convertire");
      return;
    }

    setLoading(true);
    setOutputText("");
    setError(false);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, targetAi }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella conversione");
      }

      const data = await res.json();
      setOutputText(data.prompt);

      const entry: HistoryEntry = {
        id: Date.now(),
        inputText,
        outputText: data.prompt,
        targetAi,
        timestamp: Date.now(),
      };
      const updated = [entry, ...loadHistory()].slice(0, MAX_HISTORY);
      saveHistory(updated);
      setHistory(updated);
    } catch (err) {
      setError(true);
      message.error(
        err instanceof Error ? err.message : "Errore nella conversione",
      );
    } finally {
      setLoading(false);
    }
  }, [inputText, targetAi, message]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleConvert();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleConvert]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setInputText(entry.inputText);
    setOutputText(entry.outputText);
    setTargetAi(entry.targetAi);
    setShowHistory(false);
    setError(false);
  };

  const handleClearHistory = () => {
    saveHistory([]);
    setHistory([]);
  };

  const aiLabel = (value: string) =>
    AI_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="app-container">
      <header className="header-banner">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Cambia tema"
        >
          {darkMode ? "\u2600" : "\u263E"}
        </button>
        <div className="banner-content">
          <h1 className="banner-title">Koskimize</h1>
          <p className="banner-sub">
            Trasforma le tue idee in prompt perfetti per qualsiasi AI
          </p>
        </div>
      </header>

      <div className="split-layout">
        {/* ── Pannello Input ── */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-label">Input</span>
          </div>
          <div className="panel-body">
            <div className="chip-grid" style={{ marginBottom: 16 }}>
              {AI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`ai-chip ${targetAi === opt.value ? "active" : ""}`}
                  onClick={() => setTargetAi(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              className="input-area"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Descrivi cosa vuoi chiedere all'AI..."
            />

            <div className="char-count">{inputText.length} caratteri</div>

            <button
              className="convert-btn"
              onClick={handleConvert}
              disabled={loading || !inputText.trim()}
              style={{ marginTop: 16 }}
            >
              <span>
                {loading ? "Conversione..." : "Converti"}
              </span>
            </button>
            <div className="shortcut-hint">Ctrl+Invio per convertire</div>
          </div>
        </div>

        {/* ── Pannello Output ── */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-label">Prompt ottimizzato</span>
            <div style={{ display: "flex", gap: 6 }}>
              {history.length > 0 && (
                <button
                  className={`copy-btn ${showHistory ? "active" : ""}`}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  Cronologia ({history.length})
                </button>
              )}
              {outputText && (
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={() => handleCopy(outputText)}
                >
                  {copied ? "\u2713 Copiato" : "Copia"}
                </button>
              )}
            </div>
          </div>
          <div className="panel-body">
            {showHistory ? (
              <div className="history-list">
                <div className="history-header">
                  <span className="history-title">Cronologia</span>
                  <button className="history-clear" onClick={handleClearHistory}>
                    Cancella tutto
                  </button>
                </div>
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    className="history-item"
                    onClick={() => handleHistorySelect(entry)}
                  >
                    <div className="history-item-top">
                      <span className="history-item-model">{aiLabel(entry.targetAi)}</span>
                      <span className="history-item-date">
                        {new Date(entry.timestamp).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="history-item-text">
                      {entry.inputText.slice(0, 80)}
                      {entry.inputText.length > 80 ? "..." : ""}
                    </div>
                  </button>
                ))}
              </div>
            ) : loading ? (
              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
            ) : error && !outputText ? (
              <div className="empty-state">
                <div className="empty-state-text">Conversione fallita</div>
                <button className="retry-btn" onClick={handleConvert}>
                  Riprova
                </button>
              </div>
            ) : outputText ? (
              <div className="output-area">{outputText}</div>
            ) : (
              <div className="empty-state">
                <svg
                  className="empty-state-icon"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <div className="empty-state-text">
                  Il prompt ottimizzato apparir&agrave; qui
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
