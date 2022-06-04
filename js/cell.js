/**
 * Класс клетки
 * @param {{}} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {{x:{int}, y:{int}}} params.coords
 * @param {int} params.size
 * @constructor
 */
CLIFE.CCell = function (params) {
	CLIFE.CCell.superclass.constructor.apply(this, arguments);

	this.canvas = params.canvas;
	this.calculatedCanvas = params.calculatedCanvas;
	this.canvasContext_ = this.canvas.getContext('2d');
	this.calculatedCanvasContext_ = this.calculatedCanvas.getContext('2d');
	this.coords = params.coords;
	this.size = params.size;
	this.living = false;
	this.relatives = {};
};

CLifeComponent.extend(CLIFE.CCell, CLifeComponent);

CLIFE.CCell.EVENTS = {
	onborn: 'onborn',
	ondie: 'ondie'
};

CLIFE.CCell.PADDING = 2;

/**
 * @param {boolean=true} draw
 */
CLIFE.CCell.prototype.born = function (draw = true) {
	let context = draw ? this.canvasContext_ : this.calculatedCanvasContext_;
	context.fillStyle = CLIFE.COLORS.filled_cell;
	context.fillRect(this.coords.x * this.size, this.coords.y * this.size, this.size - CLIFE.CCell.PADDING, this.size - CLIFE.CCell.PADDING);
	this.living = true;
	this.fireEvent(CLIFE.CCell.EVENTS.onborn, {
		cell: this
	});
};

CLIFE.CCell.prototype.die = function (draw = true) {
	let context = draw ? this.canvasContext_ : this.calculatedCanvasContext_;
	context.fillStyle = CLIFE.COLORS.empty_cell;
	context.fillRect(this.coords.x * this.size, this.coords.y * this.size, this.size - CLIFE.CCell.PADDING, this.size - CLIFE.CCell.PADDING);
	this.living = false;
	this.fireEvent(CLIFE.CCell.EVENTS.ondie, {
		cell: this
	});
};

CLIFE.CCell.prototype.countLivingRels = function () {
	let relativesLiving = 0;
	let rels = this.relatives;
	for (let pos in rels) {
		if (rels[pos].living) {
			relativesLiving++;
		}
	}
	return relativesLiving;
};

CLIFE.CCell.prototype.toggle = function (draw = true) {
	if (this.living) {
		this.die(draw);
	}
	else {
		this.born(draw);
	}
};

CLIFE.CCell.prototype.setRelatives = function (relatives) {
	this.relatives = relatives;
};

CLIFE.CCell.prototype.setSize = function (size) {
	this.size = size;
}