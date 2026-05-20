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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(200).json({ error: data.error?.message || JSON.stringify(data) });
    }
    const text = data.content?.map(b => b.text || "").join("") || "레시피를 가져오지 못했습니다.";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
