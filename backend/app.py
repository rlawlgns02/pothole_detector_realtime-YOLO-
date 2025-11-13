from flask import Flask, Response, render_template, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import os
import time
from threading import Thread, Lock
from collections import deque

app = Flask(__name__)
CORS(app)

# 전역 변수
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
model = YOLO(MODEL_PATH)
camera = None
camera_lock = Lock()
detection_state = {
    'pothole_detected': False,
    'detection_count': 0,
    'last_detection_time': 0,
    'current_detections': 0,
    'total_frames': 0,
    'detection_history': deque(maxlen=30)  # 최근 30프레임 기록
}

print("=" * 60)
print("🚀 실시간 포트홀 감지 시스템 시작!")
print(f"📁 모델 경로: {MODEL_PATH}")
print("=" * 60)

class VideoCamera:
    def __init__(self):
        self.video = cv2.VideoCapture(0)
        self.video.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.video.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.video.set(cv2.CAP_PROP_FPS, 30)
        
        if not self.video.isOpened():
            raise ValueError("웹캠을 열 수 없습니다!")
        
        print("✅ 웹캠 연결 성공!")
    
    def __del__(self):
        if self.video.isOpened():
            self.video.release()
    
    def get_frame(self):
        success, frame = self.video.read()
        if not success:
            return None
        return frame

def get_camera():
    """카메라 싱글톤"""
    global camera
    with camera_lock:
        if camera is None:
            camera = VideoCamera()
        return camera

def detect_potholes(frame):
    """YOLO로 포트홀 감지"""
    global detection_state
    
    # YOLO 추론
    results = model(frame, conf=0.3, verbose=False)
    
    # 감지된 객체 처리
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0].cpu().numpy())
            class_id = int(box.cls[0].cpu().numpy())
            class_name = result.names[class_id]
            
            if class_name == 'pothole':
                detections.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': confidence
                })
                
                # 바운딩 박스 그리기
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), 
                            (0, 0, 255), 3)
                
                # 신뢰도 표시
                label = f'POTHOLE {confidence:.2f}'
                cv2.putText(frame, label, (int(x1), int(y1) - 10),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    
    # 감지 상태 업데이트
    detection_state['current_detections'] = len(detections)
    detection_state['total_frames'] += 1
    detection_state['detection_history'].append(len(detections))
    
    if len(detections) > 0:
        detection_state['pothole_detected'] = True
        detection_state['detection_count'] += 1
        detection_state['last_detection_time'] = time.time()
    else:
        # 3초 동안 감지 없으면 상태 리셋
        if time.time() - detection_state['last_detection_time'] > 3:
            detection_state['pothole_detected'] = False
    
    # 화면에 정보 표시
    info_text = f"Detections: {len(detections)}"
    cv2.putText(frame, info_text, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # 경고 표시
    if len(detections) > 0:
        warning_text = "!!! POTHOLE DETECTED !!!"
        text_size = cv2.getTextSize(warning_text, cv2.FONT_HERSHEY_SIMPLEX, 1.2, 3)[0]
        text_x = (frame.shape[1] - text_size[0]) // 2
        
        # 배경 박스
        cv2.rectangle(frame, (text_x - 10, 50), 
                     (text_x + text_size[0] + 10, 90), 
                     (0, 0, 255), -1)
        
        # 경고 텍스트
        cv2.putText(frame, warning_text, (text_x, 80),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
    
    return frame, detections

def generate_frames():
    """프레임 생성기 (MJPEG 스트리밍)"""
    cam = get_camera()
    
    while True:
        frame = cam.get_frame()
        if frame is None:
            break
        
        # 포트홀 감지
        frame, detections = detect_potholes(frame)
        
        # JPEG로 인코딩
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        # 멀티파트 응답
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/video_feed')
def video_feed():
    """비디오 스트림 엔드포인트"""
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/detection_status')
def detection_status():
    """현재 감지 상태 반환"""
    return jsonify({
        'pothole_detected': detection_state['pothole_detected'],
        'current_detections': detection_state['current_detections'],
        'total_detections': detection_state['detection_count'],
        'total_frames': detection_state['total_frames'],
        'detection_rate': (sum(detection_state['detection_history']) / 
                          len(detection_state['detection_history']) 
                          if detection_state['detection_history'] else 0),
        'timestamp': time.time()
    })

@app.route('/api/health')
def health():
    """헬스 체크"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'camera_active': camera is not None
    })

if __name__ == '__main__':
    print("\n🌟 서버 시작 중...")
    print("📍 서버 주소: http://localhost:5000")
    print("📹 웹캠을 사용하여 실시간 포트홀 감지를 시작합니다.\n")
    print("⚠️  웹캠 접근 권한을 허용해주세요!\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
