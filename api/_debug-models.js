export default async function handler(req, res) {
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    });
    const data = await r.json();
    const ids = (data.data || []).map(m => m.id).sort();
    res.status(200).json({ count: ids.length, ids });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
