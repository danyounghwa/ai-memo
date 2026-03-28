import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "텍스트 없음" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "짧게 요약해줘." },
        { role: "user", content: text },
      ],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("🔥 서버 에러:", error);

    return Response.json(
      { error: "AI 호출 실패", detail: error.message },
      { status: 500 }
    );
  }
}
