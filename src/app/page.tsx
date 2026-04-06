"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Typography,
  message,
  Spin,
  Card,
  Row,
  Col,
  Space,
  ConfigProvider,
  theme,
} from "antd";
import {
  CopyOutlined,
  ThunderboltOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

const AI_OPTIONS = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "grok", label: "Grok" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "llama", label: "LLaMA" },
  { value: "copilot", label: "GitHub Copilot" },
  { value: "mistral", label: "Mistral" },
  { value: "perplexity", label: "Perplexity" },
];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetAi, setTargetAi] = useState("claude");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      message.warning("Scrivi qualcosa prima di convertire");
      return;
    }

    setLoading(true);
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
    message.success("Prompt copiato!");
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#6c5ce7",
          borderRadius: 8,
          fontSize: 15,
        },
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 24px",
          minHeight: "100vh",
          background: darkMode ? "#141414" : "#f5f5f5",
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div style={{ width: 40 }} />
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ marginBottom: 4 }}>
              <ThunderboltOutlined
                style={{ marginRight: 8, color: "#6c5ce7" }}
              />
              Koskimize
            </Title>
            <Text type="secondary">
              Converti il tuo testo in prompt ottimizzati per qualsiasi AI
            </Text>
          </div>
          <Button
            type="text"
            size="large"
            icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={() => setDarkMode(!darkMode)}
          />
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card
              title="Input"
              styles={{ header: { borderBottom: "2px solid #6c5ce7" } }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Select
                  value={targetAi}
                  onChange={setTargetAi}
                  options={AI_OPTIONS}
                  style={{ width: "100%" }}
                  size="large"
                />
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Scrivi qui il tuo testo..."
                  rows={16}
                  style={{ resize: "none" }}
                />
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleConvert}
                  loading={loading}
                  icon={<ThunderboltOutlined />}
                >
                  Converti
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Prompt ottimizzato"
              styles={{ header: { borderBottom: "2px solid #6c5ce7" } }}
              extra={
                outputText && (
                  <Button
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    type="text"
                  >
                    Copia
                  </Button>
                )
              }
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 380,
                  }}
                >
                  <Spin size="large" />
                </div>
              ) : outputText ? (
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                    fontFamily: "inherit",
                    fontSize: 14,
                    lineHeight: 1.7,
                    minHeight: 380,
                    maxHeight: 500,
                    overflowY: "auto",
                  }}
                >
                  {outputText}
                </pre>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 380,
                    color: "#bbb",
                  }}
                >
                  <Text type="secondary">
                    Il prompt ottimizzato apparir&agrave; qui
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
}
