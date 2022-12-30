import React, { useReducer } from "react";
import { useInterval } from "./use-interval";
import "./App.css";
const actionTypes = {
  tick: "tick",
  play: "play",
  pause: "pause",
  stop: "stop"
};

const initialState = {
  tick: null,
  timeEntries: []
};

const now = () => new Date().getTime();

const startTimeEntry = (time = now()) => ({
  startedAt: time,
  elapsedMs: null
});

const stopTimeEntry = (timeEntry, time = now()) => ({
  ...timeEntry,
  elapsedMs: time - timeEntry.startedAt
});

const isTimeEntryRunning = ({ elapsedMs }) => elapsedMs === null;

const isTimeEntryPaused = ({ elapsedMs }) => elapsedMs !== null;

const getCurrentTimeEntry = (state) =>
  state.timeEntries[state.timeEntries.length - 1];

const isStopped = (state) => state.timeEntries.length === 0;

const isRunning = (state) =>
  state.timeEntries.length > 0 && isTimeEntryRunning(getCurrentTimeEntry(state));

const isPaused = (state) =>
  state.timeEntries.length > 0 && isTimeEntryPaused(getCurrentTimeEntry(state));


const getElapsedMs = (state) => {
  if (isStopped(state)) return 0;

  return state.timeEntries.reduce(
    (acc, timeEntry) =>
      isTimeEntryPaused(timeEntry)
        ? acc + timeEntry.elapsedMs
        : acc + (now() - timeEntry.startedAt),
    0
  );
};

const timerReducer = (state, { type, payload }) => {
  switch (type) {
    case actionTypes.tick:
      return { ...state, tick: payload };
    case actionTypes.play:
      if (isRunning(state)) return state;

      return {
        ...state,
        timeEntries: state.timeEntries.concat(startTimeEntry(payload))
      };
    case actionTypes.pause:
      if (isStopped(state)) return state;
      if (isPaused(state)) return state;

      const currTimeEntry = getCurrentTimeEntry(state);
      return {
        ...state,
        timeEntries: state.timeEntries
          .slice(0, -1)
          .concat(stopTimeEntry(currTimeEntry))
      };
    case actionTypes.stop:
      return { ...state, timeEntries: [] };
  
  }
};

const useTimer = () => {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  const pause = () => dispatch({ type: actionTypes.pause, payload: now() });
  const play = () => dispatch({ type: actionTypes.play, payload: now() });
  const stop = () => dispatch({ type: actionTypes.stop });
  const tick = () => dispatch({ type: actionTypes.tick, payload: now() });

  const running = isRunning(state);
  const elapsedMs = getElapsedMs(state);

  return {
    pause,
    play,
    running,
    stop,
    tick,
    elapsedMs
  };
};

const Timer = () => {
  const { pause, play, running, stop, tick, elapsedMs } = useTimer();

 
  const mseconds = Math.floor((elapsedMs) );
  const seconds = Math.floor((elapsedMs / 1000 ) % 60);
  const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);

  useInterval(() => {
    tick();
  }, 1000);

  return (
    <div>
      <p>
        {minutes} : {seconds} , {mseconds}
      </p>
      <button className="reset" onClick={stop}>Reset</button>
      {running ? (
        <button  className="pause" onClick={pause}>Pause</button>
      ) : (
        <button className = "start" onClick={play}>Start</button>
      )}
     
    </div>
  );
};

const App = () => {
  return <Timer />;
};

export default App;
