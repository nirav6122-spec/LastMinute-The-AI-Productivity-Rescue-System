import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json();

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ plan: "You have no active tasks. Take a break!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { plan: "Please add your GEMINI_API_KEY in the Secrets panel under Settings to generate AI plans." },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const prompt = `
      You are an expert productivity assistant. I have the following tasks:
      ${JSON.stringify(tasks, null, 2)}
      
      Please provide a highly optimized, step-by-step action plan to tackle these tasks today.
      Consider their priority and due dates. Keep the tone encouraging and professional.
      Use markdown formatting with bullet points and bold text for emphasis.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ plan: response.text });
  } catch (error: any) {
    console.error("AI Planner Error:", error);
    return NextResponse.json({ plan: "I'm sorry, I couldn't generate a plan right now." }, { status: 500 });
  }
}
