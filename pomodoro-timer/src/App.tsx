import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useSound } from 'use-sound';
import workSound from './mp3/work.mp3';
import restSound from './mp3/rest.mp3';
import './App.css';

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

const useTimer = (
  initialTime: number,
  isRest: boolean,
  onWorkEnd: () => void,
  onRestEnd: () => void,
) => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive) {
      interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime === 0) {
            if (isRest) {
              onRestEnd();
              return initialTime;
            } else {
              onWorkEnd();
              return initialTime;
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
  }, [isActive, isRest, onWorkEnd, onRestEnd, initialTime]);

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
  const [workMinutes, setWorkMinutes] = useState(25);
  const restMinutes = 5;

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
    isRest ? restMinutes * 60 : workMinutes * 60,
    isRest,
    handleWorkEnd,
    handleRestEnd,
  );

  const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(event.target.value);
  };

  const handleWorkMinutesChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setWorkMinutes(Number(event.target.value));
  };

  const progress =
    (time / (isRest ? restMinutes * 60 : workMinutes * 60)) * 100;

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
        <div
          className="pie"
          style={{
            background: `conic-gradient(${getColorCode(color)} ${progress}%, #ddd ${progress}%)`,
          }}
        >
          <div className="time">{formatTime(time)}</div>
        </div>
      </div>
      <button onClick={toggleActive}>{isActive ? '⏸' : '▶'}</button>
      <button onClick={reset}>リセット</button>
      <section>
        <label>
          作業時間:
          <select value={workMinutes} onChange={handleWorkMinutesChange}>
            <option value={15}>15分</option>
            <option value={25}>25分</option>
          </select>
        </label>
      </section>
      <p>ポモドーロ回数: {Array(count).fill('🍅').join('')}</p>
      <select value={color} onChange={handleColorChange}>
        <option value="red">赤</option>
        <option value="blue">青</option>
        <option value="green">緑</option>
      </select>
    </div>
  );
};

export default App;
