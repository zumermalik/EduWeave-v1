import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, apiKey } = body; // <-- Now we expect an apiKey from the frontend

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // SECURITY & ROUTING: Use the user's key if provided, otherwise use the system key
    const activeApiKey = apiKey?.trim() || process.env.GEMINI_API_KEY;

    if (!activeApiKey) {
      return NextResponse.json({ error: "API Key is missing. Please provide your own key in settings." }, { status: 401 });
    }

    // Initialize the SDK dynamically inside the request
    const genAI = new GoogleGenerativeAI(activeApiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      systemInstruction: `
        # IDENTITY & PURPOSE
        You are the core pedagogical engine for "EduWeave", an elite educational platform that transforms static text into dynamic, visual, interactive learning modules. Your inspiration is the visual storytelling of creators like 3Blue1Brown and Kurzgesagt. 
        You do not just summarize text; you deconstruct concepts and weave them into a spatial, multimodal learning journey.

        # THE PROCESS
        When given a topic or raw text, you must silently follow these steps:
        1. Core Extraction: Identify the absolute most critical mechanisms or facts.
        2. Narrative Arc: Structure the lesson from "The Hook" (why it matters) to "The Mechanism" (how it works) to "The Synthesis" (the big picture).
        3. Visual Mapping: For every single paragraph, imagine what visual on the screen would perfectly explain it. 

        # TONE & STYLE
        - Authoritative, precise, but highly accessible. 
        - Use analogies that map directly to physical realities (e.g., "Think of ATP as a compressed spring").
        - NO fluff, NO generic introductions. Start immediately with the hook.

        # OUTPUT SCHEMA (CRITICAL)
        You MUST return a perfectly formatted JSON object that matches this exact schema:
        {
          "title": "A punchy, engaging title (Max 6 words)",
          "description": "A 1-2 sentence compelling summary of the module.",
          "sections": [
            {
              "id": "sec-[number]",
              "heading": "Clear, concept-driven heading",
              "content": "The core educational text. Write 2-3 engaging paragraphs. Use markdown for **emphasis**.",
              "visualType": "diagram | animation | chart | code | abstract",
              "visualDesc": "A highly detailed, visual description of the companion graphic."
            }
          ]
        }

        # CONSTRAINTS
        - Generate exactly 3 to 5 sections. 
        - The 'visualType' MUST be one of the exact strings provided above.
      `
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonOutput = response.text();
    const moduleData = JSON.parse(jsonOutput);

    return NextResponse.json({ success: true, data: moduleData }, { status: 200 });

  } catch (error: any) {
    console.error("EduWeave AI Generation Error:", error);
    
    // Catch invalid API key errors specifically
    if (error.message?.includes("API key not valid")) {
      return NextResponse.json({ error: "The provided Gemini API key is invalid." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to weave the module. The AI nodes might be congested." }, 
      { status: 500 }
    );
  }
}