import nodemailer from "nodemailer";

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function expLabel(days) {
  if (days < 0) return `만료 ${Math.abs(days)}일 초과`;
  if (days === 0) return "오늘 만료!";
  return `${days}일 남음`;
}

function makeHtml(items, roomCode) {
  const rows = items.map(item => {
    const days = daysUntil(item.expiry);
    const color = days <= 0 ? "#b83030" : days <= 1 ? "#c2607a" : "#a06000";
    return `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0d9cc;font-weight:700;color:#4a3728;">${item.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0d9cc;font-weight:700;color:${color};">${expLabel(days)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0d9cc;color:#9a7b6a;">${item.expiry}</td>
      </tr>`;
  }).join("");

  return `
    <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fdf6f0;padding:28px;border-radius:18px;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:3rem;line-height:1;">🧊</div>
        <h2 style="color:#c2607a;margin:8px 0 4px;font-size:1.5rem;">My Fridge 소비기한 알림</h2>
        <p style="color:#9a7b6a;font-size:0.85rem;margin:0;">방 코드: ${roomCode}</p>
      </div>
      <p style="color:#4a3728;font-size:0.95rem;line-height:1.7;margin-bottom:16px;">
        소비기한이 <strong style="color:#b83030;">3일 이내</strong>로 임박한 재료가
        <strong>${items.length}개</strong> 있어요. 빨리 사용해주세요! 🥺
      </p>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;margin-bottom:16px;box-shadow:0 2px 12px rgba(180,120,80,.1);">
        <thead>
          <tr style="background:#f9a8c9;">
            <th style="padding:11px 14px;text-align:left;color:#fff;font-size:0.85rem;">재료명</th>
            <th style="padding:11px 14px;text-align:left;color:#fff;font-size:0.85rem;">남은 기간</th>
            <th style="padding:11px 14px;text-align:left;color:#fff;font-size:0.85rem;">소비기한</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#c4a898;font-size:0.78rem;text-align:center;margin:0;">
        이 메일은 My Fridge 앱에서 자동으로 발송됐어요.
      </p>
    </div>`;
}

export default async function handler(req, res) {
  // Vercel Cron 보안: Authorization 헤더 확인
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).end("Unauthorized");
  }

  const DB_URL = process.env.FIREBASE_DB_URL;
  if (!DB_URL) return res.status(500).json({ error: "FIREBASE_DB_URL 환경변수 없음" });

  try {
    // Firebase에서 전체 방 데이터 읽기
    const fbRes = await fetch(`${DB_URL}/fridges.json`);
    if (!fbRes.ok) {
      return res.status(500).json({ error: `Firebase 읽기 실패: ${fbRes.status}` });
    }
    const fridges = await fbRes.json();
    if (!fridges) return res.status(200).json({ message: "데이터 없음" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    let sentCount = 0;
    const results = [];

    for (const [roomCode, roomData] of Object.entries(fridges)) {
      const notifyEmail = roomData?.notifyEmail;
      const rawItems = roomData?.items;
      if (!notifyEmail || !rawItems) continue;

      const items = Array.isArray(rawItems) ? rawItems : Object.values(rawItems);
      const expiring = items.filter(item => {
        const days = daysUntil(item.expiry);
        return days !== null && days <= 3; // 만료된 것 포함, 3일 이내 모두 알림
      });

      if (!expiring.length) continue;

      await transporter.sendMail({
        from: `"🧊 My Fridge" <${process.env.GMAIL_USER}>`,
        to: notifyEmail,
        subject: `[My Fridge] 소비기한 임박 재료 ${expiring.length}개 🚨`,
        html: makeHtml(expiring, roomCode),
      });

      sentCount++;
      results.push({ roomCode, email: notifyEmail, count: expiring.length });
    }

    res.status(200).json({ message: `${sentCount}개 방 이메일 발송 완료`, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
