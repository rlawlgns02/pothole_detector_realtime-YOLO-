// DOM 요소
const videoStream = document.getElementById('videoStream');
const videoOverlay = document.getElementById('videoOverlay');
const alertBanner = document.getElementById('alertBanner');
const alertCount = document.getElementById('alertCount');
const currentDetections = document.getElementById('currentDetections');
const totalDetections = document.getElementById('totalDetections');
const detectionRate = document.getElementById('detectionRate');
const totalFrames = document.getElementById('totalFrames');
const historyList = document.getElementById('historyList');
const soundToggle = document.getElementById('soundToggle');
const alarmSound = document.getElementById('alarmSound');

// 상태 변수
let soundEnabled = true;
let lastAlertTime = 0;
let detectionHistory = [];
let isAlarming = false;
let alarmInterval = null;

// 비디오 스트림 로드 감지
videoStream.onload = () => {
    videoOverlay.classList.add('hidden');
    console.log('✅ 비디오 스트림 연결됨');
};

videoStream.onerror = () => {
    console.error('❌ 비디오 스트림 오류');
    videoOverlay.querySelector('p').textContent = '카메라 연결 실패. 새로고침하세요.';
};

// 소리 토글
soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted');
    
    if (!soundEnabled && isAlarming) {
        stopAlarm();
    }
});

// 알람 사운드 생성 (beep 소리)
function createBeepSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 주파수 (Hz)
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 알람 시작
function startAlarm() {
    if (isAlarming || !soundEnabled) return;
    
    isAlarming = true;
    alertBanner.classList.add('active');
    
    // 첫 번째 비프음
    createBeepSound();
    
    // 0.6초마다 비프음 반복
    alarmInterval = setInterval(() => {
        if (soundEnabled) {
            createBeepSound();
        }
    }, 600);
    
    console.log('🚨 알람 시작!');
}

// 알람 중지
function stopAlarm() {
    if (!isAlarming) return;
    
    isAlarming = false;
    alertBanner.classList.remove('active');
    
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
    
    console.log('✅ 알람 중지');
}

// 감지 히스토리 추가
function addToHistory(count) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    
    const historyItem = {
        time: timeString,
        count: count,
        timestamp: now.getTime()
    };
    
    detectionHistory.unshift(historyItem);
    
    // 최대 20개만 유지
    if (detectionHistory.length > 20) {
        detectionHistory.pop();
    }
    
    updateHistoryDisplay();
}

// 히스토리 표시 업데이트
function updateHistoryDisplay() {
    if (detectionHistory.length === 0) {
        historyList.innerHTML = '<div class="history-empty">감지 기록이 없습니다</div>';
        return;
    }
    
    historyList.innerHTML = detectionHistory.map(item => `
        <div class="history-item">
            <span class="history-time">${item.time}</span>
            <span class="history-count">포트홀 ${item.count}개 감지</span>
        </div>
    `).join('');
}

// 감지 상태 업데이트
async function updateDetectionStatus() {
    try {
        const response = await fetch('/api/detection_status');
        const data = await response.json();
        
        // UI 업데이트
        currentDetections.textContent = data.current_detections;
        totalDetections.textContent = data.total_detections;
        detectionRate.textContent = (data.detection_rate * 100).toFixed(1) + '%';
        totalFrames.textContent = data.total_frames;
        
        // 알람 처리
        if (data.pothole_detected && data.current_detections > 0) {
            alertCount.textContent = data.current_detections;
            
            // 새로운 감지인 경우에만 히스토리 추가
            const now = Date.now();
            if (now - lastAlertTime > 2000) { // 2초마다 한 번만 추가
                addToHistory(data.current_detections);
                lastAlertTime = now;
            }
            
            if (!isAlarming) {
                startAlarm();
            }
        } else {
            if (isAlarming) {
                stopAlarm();
            }
        }
        
    } catch (error) {
        console.error('감지 상태 업데이트 오류:', error);
    }
}

// 헬스 체크
async function checkHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log('✅ 서버 정상 작동 중');
        }
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error);
    }
}

// 페이지 로드 시
window.addEventListener('load', () => {
    console.log('🚀 실시간 포트홀 감지 시스템 시작');
    
    // 헬스 체크
    checkHealth();
    
    // 감지 상태 폴링 시작 (200ms마다)
    setInterval(updateDetectionStatus, 200);
    
    // 비디오 스트림 시작 (약간의 딜레이 후)
    setTimeout(() => {
        videoStream.src = '/video_feed?' + new Date().getTime();
    }, 500);
});

// 페이지 언로드 시 알람 중지
window.addEventListener('beforeunload', () => {
    stopAlarm();
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // 스페이스바: 소리 토글
    if (e.code === 'Space') {
        e.preventDefault();
        soundToggle.click();
    }
    
    // ESC: 알람 중지
    if (e.code === 'Escape') {
        if (isAlarming) {
            stopAlarm();
        }
    }
});

// 브라우저 알림 권한 요청
if ('Notification' in window) {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('✅ 브라우저 알림 권한 허용됨');
            }
        });
    }
}

// 포트홀 감지 시 브라우저 알림
function showBrowserNotification(count) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ 포트홀 감지!', {
            body: `도로에 포트홀 ${count}개가 감지되었습니다.`,
            icon: '🚗',
            badge: '⚠️'
        });
    }
}

// 통계 업데이트 개선 (브라우저 알림 포함)
let lastNotificationTime = 0;
const originalUpdateFunction = updateDetectionStatus;

updateDetectionStatus = async function() {
    await originalUpdateFunction();
    
    // 새로운 감지 시 브라우저 알림 (5초에 한 번만)
    const now = Date.now();
    if (currentDetections.textContent > 0 && now - lastNotificationTime > 5000) {
        showBrowserNotification(currentDetections.textContent);
        lastNotificationTime = now;
    }
};

console.log('✨ JavaScript 초기화 완료');
console.log('💡 단축키: 스페이스바 - 소리 토글, ESC - 알람 중지');
