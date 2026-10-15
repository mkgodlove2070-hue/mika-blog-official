#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
미카의 일상 (MIKA'S BLOG) - 로컬 웹 서버 및 Resend 메일 전송 API
"""

import http.server
import json
import os
import urllib.request
import urllib.error

PORT = 3000

# 간단한 .env 파서 (외부 패키지 설치 불필요)
def load_env():
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip()

load_env()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
TO_EMAIL = os.environ.get("TO_EMAIL", "mkgodlove2070@gmail.com")

class BlogServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/send-email':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                sender_name = data.get('name', '익명')
                sender_contact = data.get('contact', '미기재')
                inquiry_type = data.get('type', '기타 문의')
                subject = data.get('subject', '제목 없음')
                message = data.get('message', '')
                date_str = data.get('date', '')

                # 예쁜 네이버/미카 블로그 감성 HTML 메일 템플릿
                html_content = f"""
                <div style="max-width: 620px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; background-color: #FAF6ED; padding: 32px; border-radius: 20px; border: 2px solid #C8DCB0;">
                    <div style="background: linear-gradient(135deg, #5C7C2F 0%, #2F431B 100%); color: #ffffff; padding: 24px; border-radius: 14px; text-align: center; box-shadow: 0 4px 14px rgba(92, 124, 47, 0.25);">
                        <span style="background: #FFE838; color: #191919; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; text-transform: uppercase;">New Inquiry</span>
                        <h2 style="margin: 8px 0 0; font-size: 22px; font-weight: 800;">🌿 미카의 일상 (MIKA'S BLOG)</h2>
                        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">새로운 문의사항이 도착했습니다 ♡</p>
                    </div>

                    <div style="background-color: #ffffff; margin-top: 22px; padding: 26px; border-radius: 14px; border: 1px solid #E4DFD7; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr style="border-bottom: 1px solid #F0EDE6;">
                                <td style="padding: 12px 0; color: #8F8983; font-weight: bold; width: 105px;">문의 유형</td>
                                <td style="padding: 12px 0; color: #5C7C2F; font-weight: 800; font-size: 15px;">{inquiry_type}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #F0EDE6;">
                                <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">보내신 분</td>
                                <td style="padding: 12px 0; color: #2D2B29; font-weight: 700;">{sender_name}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #F0EDE6;">
                                <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">회신 연락처</td>
                                <td style="padding: 12px 0; color: #02A54B; font-weight: 700;">{sender_contact}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #F0EDE6;">
                                <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">문의 제목</td>
                                <td style="padding: 12px 0; color: #2D2B29; font-weight: 800;">{subject}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; color: #8F8983; font-weight: bold;">전송 일시</td>
                                <td style="padding: 12px 0; color: #8F8983;">{date_str}</td>
                            </tr>
                        </table>

                        <div style="margin-top: 22px; padding: 18px; background-color: #FDFBF7; border-radius: 10px; border: 1.5px dashed #C8DCB0;">
                            <div style="font-weight: 800; color: #2F431B; margin-bottom: 8px; font-size: 14px;">💌 문의 내용:</div>
                            <div style="color: #2D2B29; line-height: 1.7; font-size: 14px; white-space: pre-wrap;">{message}</div>
                        </div>
                    </div>

                    <div style="margin-top: 18px; text-align: center; font-size: 12px; color: #8F8983; line-height: 1.5;">
                        이 메일은 '미카의 일상' 블로그 랜딩페이지 문의하기 폼(Resend API)을 통해 발송되었습니다.<br>
                        회신을 원하실 경우 위 기재된 연락처(<strong>{sender_contact}</strong>)로 답변해주세요 🦜
                    </div>
                </div>
                """

                # Resend API 페이로드 구성
                payload_dict = {
                    "from": "미카의 일상 문의 알림 <onboarding@resend.dev>",
                    "to": [TO_EMAIL],
                    "subject": f"[미카의 일상] [{inquiry_type}] {subject} ({sender_name}님)",
                    "html": html_content
                }

                if "@" in sender_contact:
                    payload_dict["reply_to"] = sender_contact

                resend_payload = json.dumps(payload_dict).encode('utf-8')

                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=resend_payload,
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json",
                        "User-Agent": "MikaBlog/1.0"
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode('utf-8')
                    res_json = json.loads(res_body)

                resp_bytes = json.dumps({"success": True, "id": res_json.get("id")}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp_bytes)

            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8')
                print(f"[Resend HTTP Error {e.code}]: {err_body}")
                err_bytes = json.dumps({"success": False, "error": err_body}).encode('utf-8')
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_bytes)
            except Exception as e:
                print(f"[Server Error]: {e}")
                err_bytes = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_bytes)
        elif self.path == '/api/send':
            api_key = os.environ.get("RESEND_API_KEY", "").strip()
            contact_email = os.environ.get("CONTACT_EMAIL", "").strip()

            if not api_key or not contact_email:
                err_msg = "버셀(또는 .env)에 RESEND_API_KEY · CONTACT_EMAIL 이 있는지 확인하세요"
                err_bytes = err_msg.encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_bytes)
                return

            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                sender_name = data.get('name', '익명')
                message = data.get('message', '')

                resend_payload = json.dumps({
                    "from": contact_email,
                    "to": [contact_email],
                    "subject": f"[연락하기] {sender_name}님의 메시지",
                    "text": f"이름: {sender_name}\n\n하고 싶은 말:\n{message}"
                }).encode('utf-8')

                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=resend_payload,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "MikaBlog/1.0"
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode('utf-8')

                success_msg = "보냈어요!"
                resp_bytes = success_msg.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Content-Length', str(len(resp_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp_bytes)

            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8')
                print(f"[Resend HTTP Error {e.code}]: {err_body}")
                try:
                    err_json = json.loads(err_body)
                    msg = err_json.get('message', err_body)
                except Exception:
                    msg = err_body
                err_bytes = msg.encode('utf-8')
                self.send_response(e.code)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_bytes)
            except Exception as e:
                print(f"[Server Error]: {e}")
                err_bytes = str(e).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_bytes)
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', '0')
        self.end_headers()

if __name__ == '__main__':
    print("=" * 60)
    print(" 미카의 일상 (MIKA'S BLOG) 웹 서버 + Resend 메일 전송 API 가동")
    print(f" 접속 주소: http://localhost:{PORT}")
    print(f" 수신 이메일: {TO_EMAIL}")
    print("=" * 60)
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, BlogServerHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n서버가 종료되었습니다.")
