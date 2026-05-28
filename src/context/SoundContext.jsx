import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundOn, setSoundOn] = useState(true);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const loopNodesRef = useRef({});

  const initCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(soundOn ? 1 : 0, audioCtxRef.current.currentTime, 0.02);
    }
  }, [soundOn]);

  const playOsc = useCallback((freq, type, duration, volume = 0.1, delay = 0) => {
    if (!soundOn) return;
    const ctx = initCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, [soundOn, initCtx]);

  const playClick = useCallback(() => playOsc(600, 'square', 0.1, 0.05), [playOsc]);
  const playCorrect = useCallback(() => {
    playOsc(523.25, 'triangle', 0.1, 0.1);
    playOsc(659.25, 'triangle', 0.1, 0.1, 0.05);
    playOsc(783.99, 'triangle', 0.2, 0.1, 0.1);
  }, [playOsc]);
  const playWrong = useCallback(() => {
    playOsc(220, 'sawtooth', 0.2, 0.1);
    playOsc(196, 'sawtooth', 0.3, 0.1, 0.1);
  }, [playOsc]);
  const playWin = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, i) => playOsc(f, 'square', 0.2, 0.08, i * 0.1));
  }, [playOsc]);
  const playFail = useCallback(() => {
    const notes = [196.00, 155.56, 130.81];
    notes.forEach((f, i) => playOsc(f, 'sawtooth', 0.3, 0.1, i * 0.15));
  }, [playOsc]);
  const playJump = useCallback(() => playOsc(400, 'square', 0.15, 0.05), [playOsc]);

  const startBeat = useCallback(() => {
    if (!soundOn) return;
    const ctx = initCtx();
    if (loopNodesRef.current.beat) return;

    const tempoM = 140;
    const beatTime = 60 / tempoM;
    const melody = [
      { f: 261.63, d: 0.75 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 1 }, { f: 261.63, d: 1 }, { f: 349.23, d: 1 }, { f: 329.63, d: 2 },
      { f: 261.63, d: 0.75 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 1 }, { f: 261.63, d: 1 }, { f: 392.00, d: 1 }, { f: 349.23, d: 2 },
      { f: 261.63, d: 0.75 }, { f: 261.63, d: 0.25 }, { f: 523.25, d: 1 }, { f: 440.00, d: 1 }, { f: 349.23, d: 1 }, { f: 329.63, d: 1 }, { f: 293.66, d: 1 },
      { f: 466.16, d: 0.75 }, { f: 466.16, d: 0.25 }, { f: 440.00, d: 1 }, { f: 349.23, d: 1 }, { f: 392.00, d: 1 }, { f: 349.23, d: 2 }
    ];

    const playNote = (t, f, d) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.02, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d * beatTime - 0.05);
      osc.connect(g);
      g.connect(masterGainRef.current);
      osc.start(t);
      osc.stop(t + d * beatTime - 0.01);

      const bass = ctx.createOscillator();
      const bg = ctx.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(f / 2, t);
      bg.gain.setValueAtTime(0.01, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + d * beatTime);
      bass.connect(bg);
      bg.connect(masterGainRef.current);
      bass.start(t);
      bass.stop(t + d * beatTime);
    };

    let seqTime = ctx.currentTime;
    const seqScheduler = () => {
      if (!loopNodesRef.current.beat) return;
      while (seqTime < ctx.currentTime + 0.2) {
        let offset = 0;
        melody.forEach(note => {
          playNote(seqTime + offset, note.f, note.d);
          offset += note.d * beatTime;
        });
        seqTime += offset + beatTime;
      }
      loopNodesRef.current.beatId = setTimeout(seqScheduler, 100);
    };

    loopNodesRef.current.beat = true;
    seqScheduler();
  }, [soundOn, initCtx]);

  const stopBeat = useCallback(() => {
    loopNodesRef.current.beat = false;
    if (loopNodesRef.current.beatId) {
      clearTimeout(loopNodesRef.current.beatId);
    }
  }, []);

  const playWaiting = useCallback(() => {
    if (!soundOn) return;
    const ctx = initCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(g);
    g.connect(masterGainRef.current);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [soundOn, initCtx]);

  return (
    <SoundContext.Provider value={{
      soundOn, setSoundOn, playClick, playCorrect, playWrong,
      playWin, playFail, playJump, startBeat, stopBeat, playWaiting
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
