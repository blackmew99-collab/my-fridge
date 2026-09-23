export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { image } = req.body; // data URL (e.g. "data:image/jpeg;base64,...")
  if (!image || !image.startsWith("data:image")) {
    return res.status(400).json({ error: "이미지가 없습니다" });
  }

  const prompt = `이 이미지는 마트/편의점 영수증입니다. 영수증에서 구매한 식료품·생필품 품목만 추출해주세요.

규칙:
- 품목명은 한국어로, 영수증 약어를 실제 상품명으로 풀어서 써주세요 (예: "삼겹살500G" → "삼겹살")
- 수량은 숫자만 (없으면 "1")
- 단위는 g, kg, ml, L, 개, 봉, 팩, 줌 중 가장 알맞은 것으로 (모르면 "개")
- 배송비, 봉투값, 할인, 포인트, 합계 등 식료품이 아닌 항목은 제외
- 반드시 아래 JSON 배열 형식으로만 답하세요. 다른 설명이나 텍스트는 절대 포함하지 마세요.

[{"name":"품목명","qty":"수량","unit":"단위"}]`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1500,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(200).json({ error: data.error?.message || JSON.stringify(data) });
    }

    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(200).json({ error: "영수증에서 품목을 찾지 못했어요. 더 선명한 사진으로 다시 시도해주세요." });
    }

    let items;
    try {
      items = JSON.parse(match[0]);
    } catch {
      return res.status(200).json({ error: "인식 결과를 해석하지 못했어요. 다시 시도해주세요." });
    }

    items = items
      .filter(i => i && typeof i.name === "string" && i.name.trim())
      .map(i => ({
        name: i.name.trim().slice(0, 40),
        qty: String(i.qty ?? "1").trim().slice(0, 10) || "1",
        unit: ["g", "kg", "ml", "L", "개", "봉", "팩", "줌"].includes(i.unit) ? i.unit : "개",
      }))
      .slice(0, 40);

    if (!items.length) {
      return res.status(200).json({ error: "영수증에서 품목을 찾지 못했어요. 더 선명한 사진으로 다시 시도해주세요." });
    }

    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
