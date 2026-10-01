@echo off
title 미카의 일상 랜딩페이지 로컬 서버
echo ========================================================
echo  미카의 일상 (MIKA'S BLOG) 랜딩 페이지 로컬 웹서버 실행중...
echo  브라우저 접속 주소: http://localhost:3000
echo ========================================================
start http://localhost:3000
python -m http.server 3000
pause
