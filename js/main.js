function createGame() {
	let Game = new CLIFE({
		canvasId: 'life-game-canvas',
		width: 50,
		height: 20,
		cellSize: 15
	});

	const handlers = {
		setWidth: e => {
			Game.setWidth(e.target.value);
		},
		setHeight: e => {
			Game.setHeight(e.target.value);
		},
		setCellSize: e => {
			Game.setCellSize(e.target.value);
		},
		setSpeed: e => {
			Game.setSpeed(e.target.value);
		},
		start: Game.start.bind(Game),
		pause: Game.pause.bind(Game),
		stop: Game.stop.bind(Game),
		clear: Game.clear.bind(Game),
		generate: Game.generate.bind(Game)
	};

	const inputs = {
		setWidth: document.getElementById('life-game-width'),
		setHeight: document.getElementById('life-game-height'),
		setCellSize: document.getElementById('life-game-cell-size'),
		setSpeed: document.getElementById('life-game-speed')
	};

	const buttons = {
		start: document.getElementById('life-game-start'),
		pause: document.getElementById('life-game-pause'),
		stop: document.getElementById('life-game-stop'),
		clear: document.getElementById('life-game-clear'),
		generate: document.getElementById('life-game-generate')
	};

	for (let i in inputs) {
		inputs[i].addEventListener('change', handlers[i]);
	}

	for (let i in buttons) {
		buttons[i].addEventListener('click', handlers[i]);
	}

	Game.setSpeed(inputs.setSpeed.value);

	// изменение значений инпутов ширины и высоты при изменении размеров ячеек
	Game.listen(CLIFE.EVENTS.changecellsize, function (data) {
		inputs.setHeight.value = data.canvasHeight;
		inputs.setWidth.value = data.canvasWidth;
	});

	// вывод инфы во время игры
	let info = document.getElementById('info');
	Game.listen(CLIFE.EVENTS.step, function (data) {
		let lived = data.borned - data.died;
		if (lived < 0)
			lived = 0;
		info.innerHTML = '<p>Всего родилось ' + data.borned + ' клеток, умерло ' + data.died + ' клеток, шагов: ' + data.steps + ', живых: ' + (lived) + '</p>';
	});

	let res = document.getElementById('result');

	Game.listen(CLIFE.EVENTS.start, function () {
		res.innerHTML = '';
	});

	Game.listen(CLIFE.EVENTS.gameover, function (data) {
		res.innerHTML = '<h3>Игра окончена</h3><p>Всего шагов ' + data.steps + ', родилось ' + data.borned + ', умерло ' + data.died + '</p>';
	});

	window.GameOBJ = Game;

	document.addEventListener('mousewheel', function (e) {
		if (!e.ctrlKey && !e.metaKey) {
			return;
		}
		e.preventDefault();
		e.stopImmediatePropagation();
	}, {passive: false});

	document.addEventListener('gesturestart', function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
	}, {passive: false});

	document.addEventListener('keydown', function (e) {
		if ((!e.ctrlKey && !e.metaKey) || (e.keyCode != 189 && e.keyCode != 187)) {
			return;
		}
		e.preventDefault();
		e.stopImmediatePropagation();
	}, {passive: false});

}