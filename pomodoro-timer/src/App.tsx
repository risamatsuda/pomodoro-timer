import React, { useState, useEffect } from 'react';
import { useSound } from 'use-sound';
import workSound from './mp3/work.mp3';
import restSound from './mp3/rest.mp3';
import './App.css';

const WORK_TIME = 5; // 25 minutes
const REST_TIME = 5; // 5 minutes

const getColorCode = (color: string) => {
  switch (color) {
    case 'red':
      return '#ff6347';
    case 'blue':
      return '#4169e1';
    case 'green':
      return '#3cb371';
    default:
      return '#3cb371';
  }
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const useTimer = (initialTime: number, isRest: boolean, onWorkEnd: () => void, onRestEnd: () => void) => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive) {
      interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime === 0) {
            if (isRest) {
              onRestEnd();
              return WORK_TIME;
            } else {
              onWorkEnd();
              return REST_TIME;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isActive, isRest, onWorkEnd, onRestEnd]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setTime(initialTime);
  };

  return { time, isActive, toggleActive, reset };
};

const App = () => {
  const [isRest, setIsRest] = useState(false);
  const [count, setCount] = useState(0);
  const [workSoundPlay] = useSound(workSound);
  const [restSoundPlay] = useSound(restSound);
  const [color, setColor] = useState('green');

  const handleWorkEnd = () => {
    setIsRest(true);
    setCount((prevCount) => prevCount + 1);
    restSoundPlay();
  };

  const handleRestEnd = () => {
    setIsRest(false);
    workSoundPlay();
  };

  const { time, isActive, toggleActive, reset } = useTimer(
    isRest ? REST_TIME : WORK_TIME,
    isRest,
    handleWorkEnd,
    handleRestEnd
  );

  const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(event.target.value);
  };

  const progress = (time / (isRest ? REST_TIME : WORK_TIME)) * 100;

  const getStatusMessage = () => {
    if (isActive) {
      return isRest ? '休憩中' : '作業中';
    } else {
      return '一時停止';
    }
  };

  return (
    <div className="app">
      <h3>{getStatusMessage()}</h3>
      <div className="timer">
        <div className="pie" style={{ background: `conic-gradient(${getColorCode(color)} ${progress}%, #ddd ${progress}%)` }}>
          <div className="time">{formatTime(time)}</div>
        </div>
      </div>
      <button onClick={toggleActive}>{isActive ? '⏸' : '▶'}</button>
      <button onClick={reset}>リセット</button>
      <p>現在 {count} ポモドーロ</p>
      <select value={color} onChange={handleColorChange}>
        <option value="red">赤</option>
        <option value="blue">青</option>
        <option value="green">緑</option>
      </select>
    </div>
  );
};

export default App;