export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { ingredients, recipeType, soonNames } = req.body;
  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: "재료가 없습니다" });
  }

  const soonPart = soonNames && soonNames.length
    ? `\n\n⚠️ 소비기한 임박 재료 (우선 활용): ${soonNames.join(", ")}`
    : "";

  const prompt = `당신은 한국의 전문 요리사입니다. 아래 재료들을 활용한 ${recipeType} 레시피를 2가지 추천해주세요.\n\n사용 가능한 재료: ${ingredients.join(", ")}${soonPart}\n\n각 레시피 형식:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 레시피 이름\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⏱ 조리시간:\n👥 인분:\n🥘 필요 재료:\n  -\n\n👨‍🍳 조리 순서:\n  1.\n\n💡 요리 팁:`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "너는 한국 요리사야. 반드시 한국어만 사용해. 한자, 일본어, 베트남어, 태국어 등 외국 문자를 절대 쓰지 마. 모든 단어를 순수 한국어로만 표현해.",
          },
          {
            role: "user",
            content: prompt + "\n\n주의: 한국어만 사용할 것. 외국 문자 절대 금지.",
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(200).json({ error: data.error?.message || JSON.stringify(data) });
    }

    const raw = data.choices?.[0]?.message?.content || "레시피를 가져오지 못했습니다.";

    // 허용 목록: 한글 + ASCII + 이모지(서로게이트) + 줄바꿈 + 특수기호만 남김
    const allowed = /[^가-힣ᄀ-ᇿ㄰-㆏ -~‐-⟿\uD800-\uDFFF\n\r]/g;
    const text = raw.replace(allowed, "").replace(/ {2,}/g, " ").trim();

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
