@echo off
echo ========================================
echo   실시간 포트홀 감지 시스템 시작
echo ========================================
echo.

call venv\Scripts\activate

echo 📹 웹캠을 사용하여 실시간 포트홀을 감지합니다...
echo.
echo 서버 주소: http://localhost:5000
echo.
echo 웹캠 권한을 허용해주세요!
echo Ctrl+C를 눌러 서버를 중지할 수 있습니다.
echo.

cd backend
python app.py
