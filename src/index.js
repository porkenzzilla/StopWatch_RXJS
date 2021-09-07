import { fromEvent, interval } from 'rxjs';
import { map, buffer, filter, debounceTime, takeUntil } from 'rxjs/operators';
import css from "./style.css";

const getElem = (id) => document.getElementById(id);

const startButton = getElem('start');
const stopButton = getElem('stop');
const waitButton = getElem('wait');
const resetButton = getElem('reset');
const clock = getElem("clock");

const startClick$ = fromEvent(startButton, 'click');
const stopClick$ = fromEvent(stopButton, 'click');
const waitClick$ = fromEvent(waitButton, 'click');
const resetClick$ = fromEvent(resetButton, 'click');
const second$ = interval(1000);


const setDefaultState = (value) => {
	clock.textContent = value === 0 ? "00:00:00" : time;
}
setDefaultState(0);

let started = false;
let paused = false;
let totalTime = 0; 

if (!started) {
	stopButton.classList.add('disabled');
	waitButton.classList.add('disabled');
	resetButton.classList.add('disabled');
}

const renderTime = () => {
	totalTime++;
	let hours = Math.floor(totalTime / 3600);
	let minutes = Math.floor(totalTime / 60) % 60;
	let seconds = totalTime % 60;
	clock.textContent = 
		(hours <= 9 ? "0" + hours : hours) + ":" +
		(minutes <= 9 ? "0" + minutes : minutes) + ":" +
		(seconds <= 9 ? "0" + seconds : seconds);
}

startClick$.subscribe(() => {
	if (!started && !paused) {
		started = true;
		if (started) {
			stopButton.classList.remove('disabled');
			waitButton.classList.remove('disabled');
			resetButton.classList.remove('disabled');
		}
		second$.pipe(takeUntil(stopClick$))
		       .pipe(takeUntil(doubleWaitClick$))
		       .subscribe(() => { renderTime() });
	}
});

const doubleWaitClick$ = waitClick$.pipe(
	buffer(waitClick$.pipe(debounceTime(300))),
	map(clicks => clicks.length),
	filter(clicksLength => clicksLength >= 2)
);

doubleWaitClick$.subscribe(() => {
	if (started && !paused) {
		paused = true;
		if (paused) {
			startButton.classList.add('disabled');
			stopButton.classList.add('disabled');
			resetButton.classList.add('disabled');
		}
	} else {
		paused = false;
		second$.pipe(takeUntil(stopClick$))
		       .pipe(takeUntil(doubleWaitClick$))
		       .subscribe(() => { renderTime() });
		if (!paused) {
			startButton.classList.remove('disabled');
			stopButton.classList.remove('disabled');
			resetButton.classList.remove('disabled');
		}
	}
});

stopClick$.subscribe(() => {
	started = false;
	totalTime = 0;
	setDefaultState(0);
	if (!started) {
		stopButton.classList.add('disabled');
		waitButton.classList.add('disabled');
		resetButton.classList.add('disabled');
	}
})

resetClick$.subscribe(() => {
	totalTime = 0;
	setDefaultState(0);
})
