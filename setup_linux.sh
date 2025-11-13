#!/bin/bash

echo "========================================"
echo "  실시간 포트홀 감지 시스템 - 설치"
echo "========================================"
echo ""

echo "[1/4] Python 버전 확인..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3가 설치되지 않았습니다!"
    echo "Python 3.8 이상을 설치하세요."
    exit 1
fi
python3 --version
echo ""

echo "[2/4] 가상환경 생성..."
python3 -m venv venv
echo ""

echo "[3/4] 가상환경 활성화..."
source venv/bin/activate
echo ""

echo "[4/4] 라이브러리 설치 중..."
echo "이 작업은 5-10분 정도 소요됩니다..."
pip install --upgrade pip
pip install -r requirements.txt
echo ""

echo "========================================"
echo "  설치 완료!"
echo "========================================"
echo ""
echo "다음 단계:"
echo "1. ./run_linux.sh를 실행하세요"
echo "2. 브라우저에서 http://localhost:5000 접속"
echo "3. 웹캠 권한을 허용하세요"
echo ""
echo "주의: 웹캠이 연결되어 있어야 합니다!"
echo ""
