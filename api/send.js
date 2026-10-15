import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !contactEmail) {
    return res.status(500).send("버셀(또는 .env)에 RESEND_API_KEY · CONTACT_EMAIL 이 있는지 확인하세요");
  }

  // 본문 데이터 파싱
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  } else if (!body) {
    body = {};
  }

  const name = body.name || '익명';
  const message = body.message || '';

  try {
    // new Resend(...) 는 파일 맨 위가 아니라 보내기 함수 안에서 생성
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: contactEmail,
      to: contactEmail,
      subject: `[연락하기] ${name}님의 메시지`,
      text: `이름: ${name}\n\n하고 싶은 말:\n${message}`,
    });

    if (error) {
      return res.status(400).send(error.message || '이메일 전송에 실패했습니다.');
    }

    return res.status(200).send('보냈어요!');
  } catch (err) {
    return res.status(500).send(err.message || '서버 오류가 발생했습니다.');
  }
}
