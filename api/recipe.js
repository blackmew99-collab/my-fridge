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
        model: "gemma2-9b-it",
        max_tokens: 1000,
        messages: [
          { role: "system", content: "너는 한국 요리사야. 반드시 한국어만 사용해. 한자(漢字), 일본어 히라가나·가타카나, 영어 단어를 절대 쓰지 마. '少量' 대신 '조금', 'モールド' 대신 '틀', 'Fresh' 대신 '신선한' 처럼 모든 단어를 순수 한국어로만 표현해." },
          { role: "user", content: prompt + "\n\n※ 주의: 한국어만 사용할 것. 한자, 일본어, 영어 절대 금지." },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(200).json({ error: data.error?.message || JSON.stringify(data) });
    }
    const raw = data.choices?.[0]?.message?.content || "레시피를 가져오지 못했습니다.";
    // 히라가나·가타카나·한자 등 비한국어 CJK 문자 제거
    const text = raw.replace(/[぀-ヿ一-鿿豈-﫿]/g, "").replace(/\s{2,}/g, " ");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
