import React, { useState, useEffect } from 'react';
import { useSound } from 'use-sound';
import workSound from './mp3/work.mp3';
import restSound from './mp3/rest.mp3';
import './App.css'; 

const App = () => {
  const workTime = 25 * 60;
  const restTime = 5 * 60;
  const [time, setTime] = useState(workTime); 
  const [isActive, setIsActive] = useState(false);
  const [isRest, setIsRest] = useState(false); // 休憩中かどうか
  const [count, setCount] = useState(0); // 何ポモドーロ目か
  const [workSoundPlay] = useSound(workSound);
  const [restSoundPlay] = useSound(restSound);
  const [color, setColor] = useState('green');

  useEffect(() => {
    let interval: number | null  = null;

    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      if (interval !== null) {
        clearInterval(interval);
      }
      setIsRest(!isRest);
      setTime(isRest ? workTime : restTime); 
      if (!isRest) {
        setCount(count => count + 1);
        
      }
      if (isRest) {
        restSoundPlay();
      }else{
        workSoundPlay();
      }
    }
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, isRest]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(event.target.value);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const reset = () => {
    setTime(isRest ? restTime : workTime);
    setIsActive(false);
    setCount(0);
  };

  const progress = (time / (isRest ? restTime : workTime)) * 100;

  return (
    <>
    <div className="app">
    <h3>{isRest? '休憩中' : '作業中'}</h3>
      <div className="timer"> 
        <div className="pie" style={{ background: `conic-gradient(${color} ${progress}%, #ddd ${progress}%)` }}>
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
    </>
  );
};

export default App;