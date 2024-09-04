import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(60); // Set initial countdown time in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer;
    if (isActive && seconds > 0) {
      timer = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, seconds]);

  const startTimer = () => {
    setIsActive(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(60); // Reset to initial countdown time
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <h1>Countdown Timer</h1>
      <div className="timer">
        <span>{formatTime(seconds)}</span>
      </div>
      <button onClick={startTimer} disabled={isActive}>
        Start
      </button>
      <button onClick={resetTimer}>
        Reset
      </button>
    </div>
  );
}

export default Timer;