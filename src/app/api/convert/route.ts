import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { AI_TARGETS, AiTarget } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const { text, targetAi } = (await request.json()) as {
    text: string;
    targetAi: AiTarget;
  };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const target = AI_TARGETS[targetAi];
  if (!target) {
    return NextResponse.json({ error: "Invalid AI target" }, { status: 400 });
  }

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: target.systemPrompt },
      { role: "user", content: text },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 4096,
  });

  const result = chatCompletion.choices[0]?.message?.content || "";

  return NextResponse.json({ prompt: result });
}
