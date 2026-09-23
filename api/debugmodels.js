export default async function handler(req, res) {
  const out = {};

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await r.json();
    out.gemini = r.ok
      ? { ok: true, models: (data.models || []).map(m => m.name).filter(n => n.includes("flash") || n.includes("pro")) }
      : { ok: false, error: data.error?.message };
  } catch (e) {
    out.gemini = { ok: false, error: e.message };
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    });
    const data = await r.json();
    out.anthropic = r.ok
      ? { ok: true, models: (data.data || []).map(m => m.id) }
      : { ok: false, error: data.error?.message };
  } catch (e) {
    out.anthropic = { ok: false, error: e.message };
  }

  res.status(200).json(out);
}
