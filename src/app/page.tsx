"use client";

import { useState, useEffect } from "react";
import { message, ConfigProvider, theme } from "antd";

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
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetAi, setTargetAi] = useState("claude");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

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
        err instanceof Error ? err.message : "Errore nella conversione"
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
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: "#6366f1", borderRadius: 10, fontSize: 14 },
      }}
    >
      <div className="mesh-bg" />
      <div className="dot-grid" />

      <div className="app-container">
        <header className="header-banner fade-in">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? "\u2600" : "\u263E"}
          </button>
          <div className="banner-content">
            <img src="/logo.png" alt="Koskimize" className="banner-icon" />
            <div className="banner-text">
              <h1 className="banner-title">Koskimize</h1>
              <p className="banner-sub">
                Trasforma le tue idee in prompt perfetti per qualsiasi AI
              </p>
            </div>
          </div>
          <div className="banner-line" />
        </header>

        <div className="split-layout">
          {/* ── Input Panel ── */}
          <div className="glass-panel fade-in fade-in-delay-1">
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
          <div className="glass-panel fade-in fade-in-delay-2">
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
                  <div className="empty-state-icon">{"\u2728"}</div>
                  <div className="empty-state-text">
                    Il prompt ottimizzato apparir&agrave; qui
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
