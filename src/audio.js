import { CHRISTMAS_TRACKS } from './config.js';
import { state } from './state.js';

export function createAudioEngine({ btnMusic, btnSfx, btnTrackNext, btnUploadAudio, audioInput, musicTrackNameEl, showToast }) {
  let audioCtx = null;
  let musicTimer = null;
  let noteStep = 0;
  let currentTrackIdx = 0;
  let customAudioEl = null;
  let customAudioUrl = null;
  let customAudioName = '';

  function ensureAudio() {
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  function playBellNote(freq, duration, volume) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const over = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const oGain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    over.type = 'triangle';
    over.frequency.setValueAtTime(freq * 2.0, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oGain.gain.setValueAtTime(0.0001, now);
    oGain.gain.exponentialRampToValueAtTime(volume * 0.24, now + 0.01);
    oGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.55);

    osc.connect(gain);
    over.connect(oGain);
    gain.connect(audioCtx.destination);
    oGain.connect(audioCtx.destination);
    osc.start(now);
    over.start(now);
    osc.stop(now + duration + 0.05);
    over.stop(now + duration + 0.05);
  }

  function playWarmPad(freqs, duration, volume) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    freqs.forEach((f) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  function playSleighShaker(volume) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const bufSize = Math.floor(audioCtx.sampleRate * 0.07);
    const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5800;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(volume, now);
    noise.connect(hp);
    hp.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  }

  function playSfx(type) {
    if (!state.sfxEnabled || !ensureAudio()) return;
    const now = audioCtx.currentTime;
    if (type === 'flip') {
      playBellNote(1046.5, 0.28, 0.045);
      playBellNote(1318.5, 0.22, 0.03);
    } else if (type === 'explode') {
      [659.3, 880, 1174.7, 1568, 2093].forEach((f, idx) => {
        setTimeout(() => playBellNote(f, 0.75, 0.055), idx * 40);
      });
    } else if (type === 'gather') {
      [1568, 1174.7, 880, 659.3].forEach((f, idx) => {
        setTimeout(() => playBellNote(f, 0.55, 0.045), idx * 45);
      });
    } else if (type === 'theme') {
      [784, 1046.5, 1318.5, 1568].forEach((f, idx) => {
        setTimeout(() => playBellNote(f, 0.65, 0.05), idx * 50);
      });
    } else if (type === 'firework') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.22);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      [1568, 1975.5, 2349.3].forEach((f, idx) => {
        setTimeout(() => playBellNote(f, 0.42, 0.04), 50 + idx * 45);
      });
    }
  }

  function releaseCustomAudio() {
    if (customAudioEl) {
      customAudioEl.pause();
      customAudioEl.src = '';
      customAudioEl = null;
    }
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
      customAudioUrl = null;
    }
    customAudioName = '';
  }

  function stopMusicPlayback() {
    state.musicPlaying = false;
    clearInterval(musicTimer);
    musicTimer = null;
    if (customAudioEl) {
      customAudioEl.pause();
    }
    btnMusic.classList.remove('active');
    btnMusic.textContent = '🎵 音乐';
  }

  function startMusicPlayback() {
    if (customAudioEl) {
      customAudioEl
        .play()
        .then(() => {
          state.musicPlaying = true;
          btnMusic.classList.add('active');
          btnMusic.textContent = '🔊 播放中';
          musicTrackNameEl.textContent = '🎵 ' + customAudioName;
        })
        .catch(() => showToast('请再点一次音乐按钮开启音频'));
      return;
    }
    if (!ensureAudio()) {
      showToast('当前浏览器不支持音频播放');
      return;
    }
    clearInterval(musicTimer);
    const track = CHRISTMAS_TRACKS[currentTrackIdx];
    musicTrackNameEl.textContent = track.name;
    state.musicPlaying = true;
    btnMusic.classList.add('active');
    btnMusic.textContent = '🔊 播放中';
    noteStep = 0;

    const tick = () => {
      const mel = track.melody[noteStep % track.melody.length];
      if (mel > 0) playBellNote(mel, 0.95, 0.085);
      if (noteStep % 8 === 0) {
        const bar = Math.floor(noteStep / 8) % track.chords.length;
        playWarmPad(track.chords[bar], track.tempoMs * 0.0085, 0.026);
        playBellNote(track.bass[bar], 1.4, 0.055);
      }
      if (track.sleighBell && noteStep % 2 === 0) {
        playSleighShaker(noteStep % 4 === 2 ? 0.032 : 0.016);
      }
      noteStep++;
    };
    tick();
    musicTimer = setInterval(tick, track.tempoMs);
  }

  function toggleMusic() {
    if (state.musicPlaying) stopMusicPlayback();
    else startMusicPlayback();
  }

  btnMusic.addEventListener('click', toggleMusic);
  btnTrackNext.addEventListener('click', () => {
    releaseCustomAudio();
    currentTrackIdx = (currentTrackIdx + 1) % CHRISTMAS_TRACKS.length;
    musicTrackNameEl.textContent = CHRISTMAS_TRACKS[currentTrackIdx].name;
    startMusicPlayback();
    showToast('已切换曲目：' + CHRISTMAS_TRACKS[currentTrackIdx].name);
  });

  btnUploadAudio.addEventListener('click', () => audioInput.click());
  audioInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    stopMusicPlayback();
    releaseCustomAudio();
    customAudioUrl = URL.createObjectURL(file);
    customAudioEl = new Audio(customAudioUrl);
    customAudioEl.loop = true;
    customAudioEl.volume = 0.8;
    customAudioName = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || '本地圣诞歌曲';
    startMusicPlayback();
    showToast('正在本地播放：' + customAudioName + ' 🎵');
    audioInput.value = '';
  });

  btnSfx.addEventListener('click', () => {
    state.sfxEnabled = !state.sfxEnabled;
    btnSfx.textContent = state.sfxEnabled ? '🔔 音效开' : '🔕 音效关';
    btnSfx.classList.toggle('active', state.sfxEnabled);
    if (state.sfxEnabled) playSfx('flip');
  });
  btnSfx.classList.add('active');

  window.addEventListener('beforeunload', releaseCustomAudio);

  return {
    ensureAudio,
    playSfx,
    startMusicPlayback,
    stopMusicPlayback,
  };
}
