import React, { useState, useCallback, useRef, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import GameHub from './components/GameHub';
import FinalScreen from './components/FinalScreen';
import StarryBackground from './components/StarryBackground';
import QuizBackground from './components/QuizBackground';
import SleepingBunny from './components/SleepingBunny';
import useSound from './hooks/useSound';

const SCREENS = {
    START: 'start',
    QUIZ: 'quiz',
    RESULT: 'result',
    GAMES: 'games',
    FINAL: 'final',
};

function App() {
    const [screen, setScreen] = useState(SCREENS.START);
    const [quizScore, setQuizScore] = useState(0);
    const { soundOn, setSoundOn, startBeat, stopBeat, playClick, playWin } = useSound();

    useEffect(() => {
        if (soundOn) {
            startBeat();
        } else {
            stopBeat();
        }
        return () => stopBeat();
    }, [soundOn, startBeat, stopBeat]);

    const go = useCallback((s) => {
        playClick();
        setScreen(s);
    }, [playClick]);

    const handleStart = useCallback(() => go(SCREENS.QUIZ), [go]);

    const handleQuizComplete = useCallback((score) => {
        setQuizScore(score);
        if (score >= 8) playWin();
        setScreen(SCREENS.RESULT);
    }, [playWin]);

    const handleUnlock = useCallback(() => go(SCREENS.GAMES), [go]);
    const handleRetry = useCallback(() => go(SCREENS.QUIZ), [go]);
    const handleGamesComplete = useCallback(() => {
        playWin();
        go(SCREENS.FINAL);
    }, [go, playWin]);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <StarryBackground />
            <QuizBackground />
            
            {/* Global Elements */}
            <SleepingBunny isEnd={screen === SCREENS.FINAL} />
            
            {/* Sound toggle */}
            <button
                onClick={() => setSoundOn(s => !s)}
                style={{
                    position: 'fixed',
                    top: 12,
                    right: 12,
                    zIndex: 1000,
                    background: 'var(--bg2)',
                    border: '2px solid var(--purple)',
                    borderRadius: 4,
                    color: 'var(--purple)',
                    fontFamily: 'var(--pixel)',
                    fontSize: 10,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0 var(--shadow)',
                }}
                title="Toggle sound"
            >
                {soundOn ? '🔊' : '🔇'}
            </button>

            {screen === SCREENS.START && <StartScreen onStart={handleStart} />}
            {screen === SCREENS.QUIZ && <QuizScreen onComplete={handleQuizComplete} />}
            {screen === SCREENS.RESULT && (
                <ResultScreen
                    score={quizScore}
                    onUnlock={handleUnlock}
                    onRetry={handleRetry}
                />
            )}
            {screen === SCREENS.GAMES && <GameHub onComplete={handleGamesComplete} />}
            {screen === SCREENS.FINAL && <FinalScreen />}
        </div>
    );
}

export default App;
