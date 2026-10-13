// Vercel Serverless Function for Resend Email Dispatch
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.TO_EMAIL || 'mkgodlove2070@gmail.com';

  const htmlContent = `
    <div style="max-width: 620px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; background-color: #FAF6ED; padding: 32px; border-radius: 20px; border: 2px solid #C8DCB0;">
      <div style="background: linear-gradient(135deg, #5C7C2F 0%, #2F431B 100%); color: #ffffff; padding: 24px; border-radius: 14px; text-align: center;">
        <span style="background: #FFE838; color: #191919; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">New Inquiry</span>
        <h2 style="margin: 8px 0 0; font-size: 22px; font-weight: 800;">🌿 미카의 일상 (MIKA'S BLOG)</h2>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">새로운 문의사항이 도착했습니다 ♡</p>
      </div>

      <div style="background-color: #ffffff; margin-top: 22px; padding: 26px; border-radius: 14px; border: 1px solid #E4DFD7;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #F0EDE6;">
            <td style="padding: 12px 0; color: #8F8983; font-weight: bold; width: 105px;">문의 유형</td>
            <td style="padding: 12px 0; color: #5C7C2F; font-weight: 800;">${type}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0EDE6;">
            <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">보내신 분</td>
            <td style="padding: 12px 0; color: #2D2B29; font-weight: 700;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0EDE6;">
            <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">회신 연락처</td>
            <td style="padding: 12px 0; color: #02A54B; font-weight: 700;">${contact}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0EDE6;">
            <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">문의 제목</td>
            <td style="padding: 12px 0; color: #2D2B29; font-weight: 800;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">전송 일시</td>
            <td style="padding: 12px 0; color: #8F8983;">${date}</td>
          </tr>
        </table>

        <div style="margin-top: 22px; padding: 18px; background-color: #FDFBF7; border-radius: 10px; border: 1.5px dashed #C8DCB0;">
          <div style="font-weight: 800; color: #2F431B; margin-bottom: 8px;">💌 문의 내용:</div>
          <div style="color: #2D2B29; line-height: 1.7; white-space: pre-wrap;">${message}</div>
        </div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '미카의 일상 문의 알림 <onboarding@resend.dev>',
        to: [toEmail],
        reply_to: contact && contact.includes('@') ? contact : undefined,
        subject: `[미카의 일상] [${type}] ${subject} (${name}님)`,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
