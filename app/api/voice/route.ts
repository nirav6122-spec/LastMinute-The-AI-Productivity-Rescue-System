import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in the Secrets panel in Settings." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const prompt = `
      Extract a task from the following user voice command: "${text}"
      
      Return ONLY a JSON object representing the task, with the following format:
      {
        "title": "A concise title",
        "priority": "High" | "Medium" | "Low",
        "due": "A short relative date like 'Tomorrow', 'Next week', or 'Today'",
        "aiRec": "A short estimate like '15m' or '1h'"
      }
      
      If you cannot extract a task, return an empty object {}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    let resultText = response.text || "{}";
    // Strip markdown formatting if any
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const task = JSON.parse(resultText);

    if (task.title) {
      return NextResponse.json({ task });
    } else {
      return NextResponse.json({ error: "Could not parse task" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Voice AI Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
