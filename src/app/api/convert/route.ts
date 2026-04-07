import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { AI_TARGETS, AiTarget, GUARD, buildSystemPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const { text, targetAi } = (await request.json()) as {
    text: string;
    targetAi: AiTarget;
  };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Il testo è obbligatorio" }, { status: 400 });
  }

  if (!AI_TARGETS[targetAi]) {
    return NextResponse.json({ error: "Modello AI non valido" }, { status: 400 });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: GUARD + buildSystemPrompt(targetAi) },
        { role: "user", content: text },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
    });

    const result = chatCompletion.choices[0]?.message?.content?.trim() || "";

    if (result === "REJECTED") {
      return NextResponse.json(
        { error: "Il testo inserito non descrive un task da delegare a un'AI. Scrivi cosa vuoi far fare all'AI, non una domanda diretta." },
        { status: 422 }
      );
    }

    return NextResponse.json({ prompt: result });
  } catch {
    return NextResponse.json(
      { error: "Errore di comunicazione con il servizio AI. Riprova tra qualche istante." },
      { status: 500 }
    );
  }
}
