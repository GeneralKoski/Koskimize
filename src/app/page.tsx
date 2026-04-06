"use client";

import { App, ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

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

  const handleConvert = async () => {
    if (!inputText.trim()) {
      message.warning("Scrivi qualcosa prima di convertire");
      return;
    }

    setLoading(true);
    setOutputText("");
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
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Errore nella conversione",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <div className="app-container">
        <header className="header-banner">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
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
          {/* ── Input Panel ── */}
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
                <span>{loading ? "Conversione..." : "Converti"}</span>
              </button>
            </div>
          </div>

          {/* ── Output Panel ── */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-label">Prompt ottimizzato</span>
              {outputText && (
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? "\u2713 Copiato" : "Copia"}
                </button>
              )}
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="loading-dots">
                  <span />
                  <span />
                  <span />
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
