# 🚗 실시간 포트홀 감지 시스템

YOLOv8 기반의 **실시간 웹캠 포트홀 감지** 시스템입니다.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-purple.svg)
![OpenCV](https://img.shields.io/badge/OpenCV-4.10-red.svg)

## ✨ 주요 기능

- 🎥 **실시간 웹캠 스트리밍**: OpenCV를 사용한 실시간 비디오 처리
- 🤖 **AI 포트홀 감지**: YOLOv8 모델로 실시간 객체 감지
- 🚨 **즉시 알람**: 포트홀 발견 시 시각적/청각적 알람
- 📊 **실시간 통계**: 감지 개수, 감지율, 프레임 수 표시
- 📈 **감지 히스토리**: 최근 감지 기록 자동 저장
- 🎨 **모던 UI**: 반응형 디자인과 실시간 업데이트

## 🎯 작동 방식

1. **웹캠 연결**: OpenCV로 웹캠 스트림 캡처
2. **실시간 감지**: YOLOv8이 매 프레임마다 포트홀 감지
3. **바운딩 박스**: 감지된 포트홀 위치 표시
4. **알람 발생**: 포트홀 발견 시 즉시 알람 (비프음 + 시각 효과)
5. **통계 업데이트**: 200ms마다 감지 상태 업데이트

## 📦 프로젝트 구조

```
pothole-detector-realtime/
│
├── backend/
│   ├── app.py                    # Flask 서버 (실시간 스트리밍)
│   └── models/
│       └── best.pt               # YOLOv8 학습된 모델 (6MB)
│
├── frontend/
│   ├── index.html                # 메인 페이지
│   ├── style.css                 # 스타일시트
│   └── script.js                 # JavaScript (알람, 통계)
│
├── requirements.txt              # Python 의존성
├── setup.bat                     # Windows 설치
├── run.bat                       # Windows 실행
├── setup_linux.sh                # Linux/Mac 설치
└── run_linux.sh                  # Linux/Mac 실행
```

## 🚀 빠른 시작

### Windows

```bash
# 1. 설치
setup.bat

# 2. 실행
run.bat

# 3. 브라우저 접속
http://localhost:5000
```

### Linux / Mac

```bash
# 1. 실행 권한 부여
chmod +x setup_linux.sh run_linux.sh

# 2. 설치
./setup_linux.sh

# 3. 실행
./run_linux.sh

# 4. 브라우저 접속
http://localhost:5000
```

## ⚙️ 수동 설치

```bash
# 1. 가상환경 생성
python -m venv venv

# 2. 가상환경 활성화
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. 라이브러리 설치
pip install -r requirements.txt

# 4. 서버 실행
cd backend
python app.py

# 5. 브라우저 접속
http://localhost:5000
```

## 📊 모델 성능

| 지표 | 값 |
|------|-----|
| **mAP@0.5** | 78.1% |
| **Precision** | 100% |
| **Recall** | 85% |
| **F1-Score** | 75% |

### 학습 정보
- **모델**: YOLOv8n (nano)
- **에폭**: 100
- **배치 크기**: 32
- **이미지 크기**: 640x640
- **신뢰도 임계값**: 0.3 (30%)

## 🎮 사용 방법

### 1. 시스템 시작
- `run.bat` (Windows) 또는 `./run_linux.sh` (Linux/Mac) 실행
- 브라우저가 자동으로 열리지 않으면 `http://localhost:5000` 접속

### 2. 웹캠 권한 허용
- 브라우저에서 웹캠 접근 권한 허용 필수

### 3. 실시간 감지
- 웹캠 앞에 포트홀 이미지나 실제 포트홀을 보여주세요
- AI가 자동으로 감지하고 알람을 울립니다

### 4. 알람 제어
- **스페이스바**: 소리 켜기/끄기
- **ESC**: 알람 수동 중지
- **🔊 버튼**: 소리 토글

## 🔧 설정

### 신뢰도 임계값 변경
`backend/app.py` 85번째 줄:
```python
results = model(frame, conf=0.3, verbose=False)
# conf=0.3 → 30% 신뢰도
# 더 엄격하게: conf=0.5
# 더 느슨하게: conf=0.2
```

### 웹캠 해상도 변경
`backend/app.py` 26-28번째 줄:
```python
self.video.set(cv2.CAP_PROP_FRAME_WIDTH, 640)   # 너비
self.video.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)  # 높이
self.video.set(cv2.CAP_PROP_FPS, 30)            # FPS
```

### 알람 주파수 변경
`frontend/script.js` 35번째 줄:
```javascript
oscillator.frequency.value = 800; // Hz (높을수록 높은 음)
```

### 감지 히스토리 개수
`backend/app.py` 20번째 줄:
```python
'detection_history': deque(maxlen=30)  # 30 → 원하는 개수
```

## 📋 필수 요구사항

### 하드웨어
- ✅ **웹캠** (필수!)
- ✅ 최소 4GB RAM
- ✅ CPU: Intel i5 이상 권장 (GPU 선택사항)

### 소프트웨어
- ✅ Python 3.8 이상
- ✅ 웹 브라우저 (Chrome, Edge, Firefox 등)
- ✅ 최소 2GB 디스크 공간

### 네트워크
- ✅ 인터넷 연결 (최초 설치 시)

## 🛠️ 기술 스택

### Backend
```python
Flask 3.0.0              # 웹 서버
Ultralytics 8.3.0        # YOLOv8
OpenCV 4.10.0            # 비디오 처리
NumPy 1.26.4             # 수치 연산
PyTorch 2.1.0            # 딥러닝
```

### Frontend
```javascript
HTML5                    # 구조
CSS3                     # 스타일
JavaScript (ES6+)        # 로직
Web Audio API            # 알람 사운드
Fetch API                # 서버 통신
```

## 🎨 UI 기능

### 실시간 비디오
- MJPEG 스트리밍
- 바운딩 박스 오버레이
- 신뢰도 표시

### 알람 시스템
- 🚨 빨간색 배너 (깜빡임)
- 🔊 비프음 (0.6초 간격)
- 🖼️ 브라우저 알림 (권한 허용 시)
- ⚠️ 화면 진동 효과

### 통계 대시보드
- 현재 감지 개수
- 총 감지 수
- 감지율 (%)
- 처리 프레임 수

### 감지 히스토리
- 최근 20개 기록
- 시간 및 개수 표시
- 자동 스크롤

## 🐛 문제 해결

### "웹캠을 열 수 없습니다"
**원인**: 웹캠이 연결되지 않았거나 다른 프로그램이 사용 중
**해결**:
1. 웹캠이 컴퓨터에 연결되어 있는지 확인
2. 다른 프로그램(Zoom, Teams 등)이 웹캠을 사용 중이면 종료
3. 장치 관리자에서 웹캠 드라이버 확인

### "비디오 스트림 오류"
**원인**: 브라우저가 스트림을 로드하지 못함
**해결**:
1. 페이지 새로고침 (F5)
2. 브라우저 캐시 삭제
3. 다른 브라우저 시도

### "알람이 울리지 않음"
**원인**: 소리가 꺼져 있거나 브라우저 설정
**해결**:
1. 스페이스바를 눌러 소리 켜기
2. 브라우저 소리 설정 확인
3. 시스템 볼륨 확인

### "감지가 너무 민감함"
**해결**: `backend/app.py`에서 신뢰도 임계값을 높이세요
```python
results = model(frame, conf=0.5, verbose=False)  # 0.3 → 0.5
```

### "감지가 잘 안 됨"
**해결**: 
1. 조명 밝기 확인
2. 카메라와 포트홀 간 거리 조절
3. 신뢰도 임계값 낮추기 (conf=0.2)

### "프레임이 느림"
**원인**: CPU 성능 부족
**해결**:
1. 해상도 낮추기 (640x480 → 320x240)
2. FPS 낮추기 (30 → 15)
3. GPU 사용 (CUDA 설치)

## ⚡ 성능 최적화

### CPU 최적화
```python
# backend/app.py
# FPS 낮추기
self.video.set(cv2.CAP_PROP_FPS, 15)  # 30 → 15

# 해상도 낮추기
self.video.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
self.video.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
```

### GPU 사용 (NVIDIA)
```bash
# CUDA 버전 PyTorch 설치
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## 🔐 보안 및 주의사항

### ⚠️ 중요한 경고
- **운전 중 사용 금지**: 이 시스템은 교육 목적입니다
- **웹캠 프라이버시**: 비디오는 서버에 저장되지 않습니다
- **실시간 처리**: 모든 처리는 로컬에서 수행됩니다

### 프라이버시
- ✅ 비디오 녹화 안 함
- ✅ 데이터 외부 전송 안 함
- ✅ 로컬 처리만

## 📈 향후 개발 계획

- [ ] 비디오 녹화 기능
- [ ] 감지 결과 내보내기 (CSV, JSON)
- [ ] 여러 카메라 지원
- [ ] 모바일 앱 버전
- [ ] 클라우드 배포
- [ ] 실시간 그래프

## 🎓 사용 사례

### 교육
- 컴퓨터 비전 학습
- 실시간 객체 감지 데모
- AI 프로젝트 포트폴리오

### 개발
- YOLO 모델 테스트
- 웹캠 기반 애플리케이션 개발
- 실시간 스트리밍 구현

### 연구
- 도로 상태 모니터링
- 인프라 관리 시스템
- 자율주행 연구

## 📞 지원

문제가 발생하면:
1. 콘솔 오류 메시지 확인
2. 웹캠 연결 상태 확인
3. Python 버전 확인 (`python --version`)
4. 의존성 재설치 (`pip install -r requirements.txt`)

## 📝 라이선스

이 프로젝트는 교육 및 연구 목적으로 제공됩니다.

## 🙏 감사의 말

- [Ultralytics](https://github.com/ultralytics/ultralytics) - YOLOv8 제공
- [Flask](https://flask.palletsprojects.com/) - 웹 프레임워크
- [OpenCV](https://opencv.org/) - 컴퓨터 비전 라이브러리

---

**🌟 실시간 포트홀 감지를 시작하세요!**

Made with ❤️ using YOLOv8, Flask, OpenCV, and Real-time AI
