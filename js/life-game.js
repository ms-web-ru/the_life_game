/**
 * Класс для создания игры Жизнь
 * @constructor
 * @param {{}=} params
 * @param {string} params.canvasId
 * @param {int='30'} params.width кол-во клеток по ширине
 * @param {int='10'} params.height кол-во клеток по высоте
 * @param {int='20'} params.cellSize - размеры ячейки в пикселях
 */
CLIFE = function (params) {
	CLIFE.superclass.constructor.apply(this, arguments);

	params = params || {};

	// холст для отрисовки всего
	this.canvas = document.getElementById(params.canvasId);

	// холст чтобы не перерисовывать всё при добавлении элементов
	this.calculatedCanvas_ = document.createElement('canvas');

	this.handlers = {
		oncanvasmousedown: this.onCanvasMouseDown.bind(this),
		onmouseup: this.onMouseUp.bind(this),
		oncanvasmousemove: this.onCanvasMouseMove.bind(this),
		onresize: this.onResize.bind(this),
		oncellborn: this.onCellBorn.bind(this),
		oncelldie: this.onCellDie.bind(this)
	};

	this.isMouseDown_ = false;
	this.isClicked_ = false;
	this.isClickOnCell_ = false;
	this.clickedTime_ = null;

	this.cellSize = params.cellSize || 20;

	// размеры в ясейках
	this.gridWidth = (params.width || 30);
	this.gridHeight = (params.height || 10);

	// размеры в пикселях
	this.width = this.gridWidth * this.cellSize;
	this.height = this.gridHeight * this.cellSize;

	this.cellsMatrix = {};
	this.cellsMatrixYX = {};
	this.speed_ = 1000;
	this.running_ = false;
	this.paused_ = false;
	this.runningInterval_ = null;

	// статистика
	this.borned_ = 0;
	this.died_ = 0;
	this.steps_ = 0;

	this.createCells();
	this.drawCanvas_();
	this.canvasRect = this.canvas.getBoundingClientRect();
	this.setListeners();
};

CLifeComponent.extend(CLIFE, CLifeComponent);

/**
 * Названия событий на которые можно подписаться вне компонента
 */
CLIFE.EVENTS = {
	start: 'onstart',
	changecellsize: 'onchangecellsize',
	gameover: 'ongameover',
	step: 'onstep'
};

CLIFE.COLORS = {
	empty_cell: '#fff',
	filled_cell: '#3cc900',
	cell_stroke: '#d5d5d5',
	background: '#fff'
};

CLIFE.LINE_WIDTH = 0.1;

/**
 * Создание экземпляров клеток.
 * Запускается при загрузке страницы и в случае изменения количества отображаемых клеток
 */
CLIFE.prototype.createCells = function () {
	this.cellsMatrix = {};
	this.cellsMatrixYX = {};
	let dx = this.gridWidth + 1;
	let dy = this.gridHeight + 1;
	for (let x = 0; x < dx; x++) {
		this.cellsMatrix[x] = {};
		for (let y = 0; y < dy; y++) {
			let cell = this.addCell(x, y);
			this.cellsMatrix[x][y] = {cell: cell};
			if (!this.cellsMatrixYX[y]) {
				this.cellsMatrixYX[y] = {};
			}
			this.cellsMatrixYX[y][x] = {cell: cell};
		}
	}

	// сразу находим соседние и запоминаем в объекте ячейки
	for (let x = 0; x < dx; x++) {
		for (let y = 0; y < dy; y++) {
			let cell = this.cellsMatrix[x][y].cell;
			cell.setRelatives(this.getRelativeCells(x, y));
		}
	}
};

/**
 * Setting DOM listeners
 */
CLIFE.prototype.setListeners = function () {
	let A = this;
	window.addEventListener('resize', this.handlers.onresize);
	window.addEventListener('scroll', this.handlers.onresize);
	window.addEventListener('mouseup', this.handlers.onmouseup);
	this.canvas.addEventListener('mousedown', this.handlers.oncanvasmousedown);
	this.canvas.addEventListener('mousemove', this.handlers.oncanvasmousemove);
};

CLIFE.prototype.onResize = function () {
	this.canvasRect = this.canvas.getBoundingClientRect();
};

/**
 * @param e
 */
CLIFE.prototype.onCanvasMouseDown = function (e) {
	this.isMouseDown_ = true;
	this.isClicked_ = false;
	this.clickedTime_ = new Date() / 1000;
	let coords = this.getCursorPosition(e);
	let gridCoords = this.getGridCoords(coords.x, coords.y);
	this.isClickOnCell_ = !!(this.getCellByCoords(gridCoords.x, gridCoords.y));
};

CLIFE.prototype.getCellByCoords = function (x, y) {
	return this.cellsMatrix[x] && this.cellsMatrix[x][y] && this.cellsMatrix[x][y].cell || false;
};

/**
 * Обработчик отжатия кнопки мыши над документом
 * @param {Event} e
 */
CLIFE.prototype.onMouseUp = function (e) {
	this.isMouseDown_ = false;
	this.isClicked_ = (new Date() / 1000 - this.clickedTime_) <= 0.3;
	let coords = this.getCursorPosition(e);
	let gridCoords = this.getGridCoords(coords.x, coords.y);
	if (gridCoords && this.isClicked_ && this.isClickOnCell_) {
		// отжали над канвасом
		let cell = this.getCellByCoords(gridCoords.x, gridCoords.y);
		cell.toggle(true);
	}
};

CLIFE.prototype.onCanvasMouseMove = function (e) {
	if (this.isMouseDown_) {
		let coords = this.getCursorPosition(e);
		let gridCoords = this.getGridCoords(coords.x, coords.y);
		if (gridCoords) {
			// движение в пределах холста
			let cell = this.getCellByCoords(gridCoords.x, gridCoords.y);
			if (!cell.living) {
				cell.born(true);
			}
		}
	}
};

/**
 * @private
 */
CLIFE.prototype.setCanvasSize_ = function () {
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.calculatedCanvas_.width = this.width;
	this.calculatedCanvas_.height = this.height;
};

CLIFE.prototype.drawCanvas_ = function () {
	this.setCanvasSize_();
	let context = this.canvas.getContext('2d');
	context.lineWidth = CLIFE.LINE_WIDTH;
	context.fillStyle = CLIFE.COLORS.background;
	for (let x = 0; x < this.width; x += this.cellSize) {
		context.moveTo(x, 0);
		context.lineTo(x, this.height);
	}

	for (let y = 0; y < this.height; y += this.cellSize) {
		context.moveTo(0, y);
		context.lineTo(this.width, y);
	}

	context.strokeStyle = CLIFE.COLORS.cell_stroke;
	context.stroke();

	this.calculatedCanvas_.getContext('2d').fillStyle = CLIFE.COLORS.background;

	this.canvasRect = this.canvas.getBoundingClientRect();
};

/**
 * Установить ширину холста
 * @param width
 * @param {boolean=true} draw
 */
CLIFE.prototype.setWidth = function (width, draw = true) {
	this.gridWidth = +width;
	this.width = width * this.cellSize;
	if (draw) {
		this.drawCanvas_();
	}
	this.clear();
	this.createCells();
};

/**
 * Установить высоту холста
 * @param height
 * @param {boolean=true} draw
 */
CLIFE.prototype.setHeight = function (height, draw = true) {
	this.height = height * this.cellSize;
	this.gridHeight = +height;
	if (draw) {
		this.drawCanvas_();
	}
	this.clear();
	this.createCells();
};

/**
 * Установить размер ячейки
 */
CLIFE.prototype.setCellSize = function (cellSize) {

	this.cellSize = +cellSize || this.cellSize;

	this.gridWidth = Math.ceil(this.width / this.cellSize);
	this.gridHeight = Math.ceil(this.height / this.cellSize);

	this.width = this.gridWidth * this.cellSize;
	this.height = this.gridHeight * this.cellSize;

	this.setCanvasSize_();
	this.createCells();
	this.drawCanvas_();
	this.clear();

	this.fireEvent(CLIFE.EVENTS.changecellsize, {
		canvasWidth: this.gridWidth,
		canvasHeight: this.gridHeight
	});
};

CLIFE.prototype.setSpeed = function (speed) {
	this.speed_ = 1100 - speed * 100;
	if (this.running_) {
		this.running_ = false;
		clearInterval(this.runningInterval_);
		this.start();
	}
};

CLIFE.prototype.start = function () {
	if (this.running_ && !this.paused_) {
		return;
	}
	this.running_ = true;
	this.paused_ = false;
	let A = this;
	A.step();
	this.runningInterval_ = setInterval(function () {
		A.step();
	}, this.speed_);
	this.fireEvent(CLIFE.EVENTS.start);
};

CLIFE.prototype.pause = function () {
	clearInterval(this.runningInterval_);
	this.paused_ = true;
};

CLIFE.prototype.stop = function () {
	clearInterval(this.runningInterval_);
	this.gameOver();
	this.running_ = false;
	this.borned_ = 0;
	this.died_ = 0;
	this.steps_ = 0;
};

CLIFE.prototype.clear = function () {
	for (let x in this.cellsMatrix) {
		for (let y in this.cellsMatrix[x]) {
			let cell = this.cellsMatrix[x][y].cell;
			if (cell.living) {
				cell.die(true);
			}
		}
	}
	this.drawCanvas_();
};

CLIFE.prototype.getCursorPosition = function (event) {
	rect = this.canvasRect;
	return {
		x: Math.floor(event.clientX - rect.left),
		y: Math.floor(event.clientY - rect.top)
	};
};

CLIFE.prototype.addCell = function (gridX, gridY) {
	let cell = new CLIFE.CCell({
		canvas: this.canvas,
		calculatedCanvas: this.calculatedCanvas_,
		coords: {
			x: gridX,
			y: gridY
		},
		size: this.cellSize
	});

	cell.listen(CLIFE.CCell.EVENTS.onborn, this.handlers.oncellborn);
	cell.listen(CLIFE.CCell.EVENTS.ondie, this.handlers.oncelldie);

	return cell;
};

/**
 * Поиск соседних клеток
 * @param gridX
 * @param gridY
 * @return {{}}
 */
CLIFE.prototype.getRelativeCells = function (gridX, gridY) {
	let relatives = {};

	let relsCoords = {
		l: {
			x: gridX - 1,
			y: gridY
		},
		r: {
			x: gridX + 1,
			y: gridY
		},
		t: {
			x: gridX,
			y: gridY - 1
		},
		b: {
			x: gridX,
			y: gridY + 1
		},
		tl: {
			x: gridX - 1,
			y: gridY + 1
		},
		tr: {
			x: gridX + 1,
			y: gridY + 1
		},
		bl: {
			x: gridX - 1,
			y: gridY - 1
		},
		br: {
			x: gridX + 1,
			y: gridY - 1
		}
	};

	for (let pos in relsCoords) {
		let posCoords = relsCoords[pos];
		let cell = this.getRelativeCell(posCoords.x, posCoords.y);
		relatives[pos] = cell;
	}

	return relatives;
};

CLIFE.prototype.getRelativeCell = function (gridX, gridY) {
	if (gridX < 0) {
		gridX = this.gridWidth - Math.abs(gridX);
	}
	if (gridX >= this.gridWidth) {
		gridX = gridX - this.gridWidth + 1;
	}

	if (gridY < 0) {
		gridY = this.gridHeight - Math.abs(gridY);
	}
	if (gridY >= this.gridHeight) {
		gridY = gridY - this.gridHeight + 1;
	}

	return this.getCellByCoords(gridX, gridY);
};

CLIFE.prototype.onCellBorn = function (data) {
	this.borned_++;
};

CLIFE.prototype.onCellDie = function (data) {
	this.died_++;
};

/**
 * Получить координаты ячейки по координатам курсора
 * @param x
 * @param y
 * @return {boolean|{x: number, y: number}}
 */
CLIFE.prototype.getGridCoords = function (x, y) {
	x = Math.floor(x / this.cellSize);
	y = Math.floor(y / this.cellSize);
	if (x >= 0 && y >= 0 && this.gridWidth >= x && this.gridHeight >= 0) {
		return {
			x: x,
			y: y
		};
	}
	return false;
};

CLIFE.prototype.step = function () {
	this.steps_++;
	// let cellsMatrix = this.cellsMatrix;
	let changed = false;

	// for (let x in cellsMatrix) {
	// 	let cmx = cellsMatrix[x];
	// 	for (let y in cmx) {
	// 		let cell = cmx[y].cell;
	// 		let relsLiving = cell.countLivingRels();
	// 		if (cell.living) {
	// 			if (relsLiving < 2 || relsLiving > 3) {
	// 				cell.die(false);
	// 				changed = true;
	// 			}
	// 		}
	// 		else if (relsLiving === 3) {
	// 			cell.born(false);
	// 			changed = true;
	// 		}
	// 	}
	// }

	let cellsMatrix = this.cellsMatrixYX;
	let xln = this.gridWidth;
	let yln = this.gridHeight;


	for (let yi = 0; yi < yln; yi++) {
		let line = cellsMatrix[yi];
		for (let xi = 0; xi < xln; xi++) {
				let cell = line[xi].cell;
				let relsLiving = cell.countLivingRels();
				if (cell.living) {
					if (relsLiving < 2 || relsLiving > 3) {
						cell.die(false);
						changed = true;
					}
				}
				else if (relsLiving === 3) {
					cell.born(false);
					changed = true;
				}

		}
	}

	this.updateCanvas_();
	if (!changed) {
		this.stop();
	}
	this.fireEvent(CLIFE.EVENTS.step, {
		steps: this.steps_,
		borned: this.borned_,
		died: this.died_
	});
};

CLIFE.prototype.updateCanvas_ = function () {
	this.canvas.getContext('2d').drawImage(this.calculatedCanvas_, 0, 0);
};

CLIFE.prototype.gameOver = function () {
	this.fireEvent(CLIFE.EVENTS.gameover, {
		borned: this.borned_,
		died: this.died_
	});
};

CLIFE.prototype.generate = function () {
	let cellsMatrix = this.cellsMatrix;
	for (let x in cellsMatrix) {
		for (let y in cellsMatrix[x]) {
			let cell = cellsMatrix[x][y].cell;
			let act = !(Math.floor(Math.random(0, 15) * 10) % 2) ? 'born' : 'die';
			if (act === 'born') {
				cell[act](false);
			}
		}
	}
	this.updateCanvas_();
};