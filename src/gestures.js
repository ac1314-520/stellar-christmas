import { MEDIAPIPE_CDN_BASES } from './config.js';
import { state } from './state.js';

function loadScriptWithTimeout(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      s.remove();
      reject(new Error('Script load timeout: ' + url));
    }, timeoutMs);

    s.src = url;
    s.crossOrigin = 'anonymous';
    s.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    s.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      s.remove();
      reject(new Error('Script load failed: ' + url));
    };
    document.head.appendChild(s);
  });
}

async function ensureMediaPipeHands() {
  if (typeof window.Hands === 'function') {
    return MEDIAPIPE_CDN_BASES[0];
  }
  for (const base of MEDIAPIPE_CDN_BASES) {
    try {
      await loadScriptWithTimeout(base + 'hands.js', 9000);
      if (typeof window.Hands === 'function') {
        return base;
      }
    } catch {
      // Try next configured CDN mirror
    }
  }
  throw new Error('MEDIAPIPE_UNAVAILABLE');
}

function classifyGesture(lm) {
  const wrist = lm[0];
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const indexOpen = dist(lm[8], wrist) > dist(lm[6], wrist) * 1.12;
  const middleOpen = dist(lm[12], wrist) > dist(lm[10], wrist) * 1.12;
  const ringOpen = dist(lm[16], wrist) > dist(lm[14], wrist) * 1.12;
  const pinkyOpen = dist(lm[20], wrist) > dist(lm[18], wrist) * 1.12;
  const thumbOpen = dist(lm[4], lm[17]) > dist(lm[2], lm[17]) * 1.08;
  const openCount = [thumbOpen, indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;
  if (openCount >= 4) return 'open';
  if (openCount <= 1 && !indexOpen) return 'fist';
  if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return 'point';
  return 'other';
}

export function createGestureController({
  camBox,
  camToggleBtn,
  camVideo,
  camOverlay,
  snowflakeIcon,
  setMode,
  updateGalleryCounter,
  updateStatus,
  showToast,
  flipCurrentCard,
}) {
  let mediaStream = null;
  let handsInstance = null;
  let camLoopId = null;
  let isStarting = false;
  let lastFlipAt = 0;
  let lastPointZ = null;

  function drawHandOverlay(landmarks) {
    const ctx = camOverlay.getContext('2d');
    camOverlay.width = camOverlay.clientWidth || 128;
    camOverlay.height = camOverlay.clientHeight || 96;
    ctx.clearRect(0, 0, camOverlay.width, camOverlay.height);
    if (!landmarks) return;
    ctx.fillStyle = '#fde68a';
    for (let i = 0; i < landmarks.length; i++) {
      ctx.beginPath();
      ctx.arc((1 - landmarks[i].x) * camOverlay.width, landmarks[i].y * camOverlay.height, i === 8 ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function onHandResults(results) {
    const multi = results && results.multiHandLandmarks;
    if (!multi || !multi.length) {
      drawHandOverlay(null);
      state.lastHandX = null;
      state.gestureHoldFrames = 0;
      lastPointZ = null;
      return;
    }
    const lm = multi[0];
    drawHandOverlay(lm);
    const gesture = classifyGesture(lm);
    const palmX = 1 - lm[9].x;
    if (gesture === state.lastDetectedGesture) state.gestureHoldFrames++;
    else {
      state.lastDetectedGesture = gesture;
      state.gestureHoldFrames = 1;
    }

    if (gesture === 'open') {
      if (state.gestureHoldFrames >= 3 && state.mode !== 'exploded') {
        setMode('exploded', '状态: ✋ 五指张开', '左右挥手翻页 · 单指轻点翻面');
      }
      if (state.lastHandX !== null && state.mode === 'exploded') {
        const dx = palmX - state.lastHandX;
        if (Math.abs(dx) > 0.012) {
          state.carouselIndex -= dx * 6.5;
          state.flippedCardIndex = -1;
          updateGalleryCounter();
          updateStatus('状态: 👋 挥手翻页', '左右摆动切换拍立得照片', true);
        }
      }
      state.lastHandX = palmX;
    } else if (gesture === 'fist') {
      if (state.gestureHoldFrames >= 4 && state.mode !== 'tree') {
        setMode('tree', '状态: ✊ 握拳', '正在还原圣诞树...');
      }
      state.lastHandX = null;
    } else if (gesture === 'point') {
      const tipX = 1 - lm[8].x;
      const tipZ = lm[8].z;
      if (state.mode === 'exploded') {
        // In the photo wall a single pointed finger flips the centered
        // Polaroid. Trigger once when the point starts, or on a deliberate
        // forward poke so users can flip it back without changing gestures.
        const now = performance.now();
        const poke = lastPointZ !== null && lastPointZ - tipZ > 0.022;
        if ((state.gestureHoldFrames === 1 || poke) && now - lastFlipAt > 750) {
          lastFlipAt = now;
          flipCurrentCard?.();
          updateStatus('状态: ☝️ 单指轻点', '当前拍立得已翻面 · 再点一次翻回正面', true);
        }
        lastPointZ = tipZ;
        state.lastHandX = null;
      } else {
        if (state.lastHandX !== null) {
          state.pokeVelocity += (tipX - state.lastHandX) * 0.42;
          updateStatus('状态: ☝️ 单指戳动', '拨动圣诞树加速旋转 ✨', true);
        }
        state.lastHandX = tipX;
        lastPointZ = null;
      }
    } else {
      state.lastHandX = null;
      lastPointZ = null;
    }
  }

  function stopCamera() {
    state.cameraActive = false;
    isStarting = false;
    if (camLoopId) {
      cancelAnimationFrame(camLoopId);
      camLoopId = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    camVideo.srcObject = null;
    camVideo.style.display = 'none';
    camOverlay.style.display = 'none';
    snowflakeIcon.style.display = 'block';
    camBox.classList.remove('active');
    camToggleBtn.textContent = 'OPEN';
  }

  async function startCamera() {
    if (isStarting) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('当前环境无法调用摄像头，可用鼠标或底部按钮体验全部特效');
      return;
    }
    isStarting = true;
    camToggleBtn.textContent = 'LOADING...';
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      camVideo.srcObject = mediaStream;
      await camVideo.play();

      const cdnBase = await ensureMediaPipeHands();
      if (!handsInstance && typeof window.Hands === 'function') {
        handsInstance = new window.Hands({ locateFile: (file) => cdnBase + file });
        handsInstance.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.65, minTrackingConfidence: 0.6 });
        handsInstance.onResults(onHandResults);
      }

      state.cameraActive = true;
      isStarting = false;
      camBox.classList.add('active');
      snowflakeIcon.style.display = 'none';
      camVideo.style.display = 'block';
      camOverlay.style.display = 'block';
      camToggleBtn.textContent = 'CLOSE';
      updateStatus('状态: 摄像头已开启', '张开 / 挥手 / 握拳 · 照片墙里单指轻点翻面', false);

      let busy = false;
      const processFrame = async () => {
        if (!state.cameraActive) return;
        if (handsInstance && !busy && camVideo.readyState >= 2) {
          busy = true;
          try {
            await handsInstance.send({ image: camVideo });
          } catch {
            // Keep video loop alive on transient frame errors
          }
          busy = false;
        }
        camLoopId = requestAnimationFrame(processFrame);
      };
      camLoopId = requestAnimationFrame(processFrame);
    } catch (err) {
      stopCamera();
      if (err && err.message === 'MEDIAPIPE_UNAVAILABLE') {
        showToast('手势识别模型加载超时（请检查网络），可直接用鼠标和底部按钮体验', 3600);
      } else {
        showToast('未获取摄像头权限，可直接用鼠标拖拽或底部按钮体验 ✨', 3200);
      }
    }
  }

  function toggleCamera() {
    if (state.cameraActive) stopCamera();
    else startCamera();
  }

  camBox.addEventListener('click', toggleCamera);
  camToggleBtn.addEventListener('click', toggleCamera);
  window.addEventListener('beforeunload', stopCamera);

  return { startCamera, stopCamera };
}
