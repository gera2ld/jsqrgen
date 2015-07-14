/**
 * JSQRGen: QRCode Canvas Renderer
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */
'use strict';

function getCanvas(width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
};

function renderByCanvas(options) {
	var data = {};
	function isDark(i, j) {
		var logo = options.logo;
		return i >= 0 && i < options.count && j >= 0 && j < options.count
			// when logo.rowN or logo.colN is not defined,
			// any of the comparisons will be false
			&& (!(i >= logo.row1 && i <= logo.row2 && j>=logo.col1 && j<=logo.col2))
			? options.isDark(i, j) : false;
	}
	function getColor(color, row, col) {
		return typeof color == 'function' ? color(options.count, row, col) : color;
	}
	function drawCorner(cornerX, cornerY, x, y, r) {
		var context = data.context;
		if(r) context.arcTo(cornerX, cornerY, x, y, r);
		else {
			context.lineTo(cornerX, cornerY);
			context.lineTo(x, y);
		}
	}
	function fillCell(color) {
		data.context.fillStyle = color;
		data.context.fillRect(data.cell.x, data.cell.y, data.cellSize, data.cellSize);
	}
	function fillCorner(startX, startY, cornerX, cornerY, destX, destY) {
		var context = data.context;
		context.beginPath();
		context.moveTo(startX, startY);
		drawCorner(cornerX, cornerY, destX, destY, data.effect);
		context.lineTo(cornerX, cornerY);
		context.lineTo(startX, startY);
		//context.closePath();
		context.fill();
	}
	function drawLogo() {
		var logo = options.logo;
		var context = data.context;
		if(logo.image || logo.text) {
			if(!logo.clearEdges) {
				context.fillStyle = getColor(options.colorLight, -1, -1);
				context.fillRect(
					logo.x - logo.margin,
					logo.y - logo.margin,
					logo.width + 2 * logo.margin,
					logo.height + 2 * logo.margin
				);
			}
			if(logo.image)
				context.drawImage(logo.image, logo.x, logo.y, logo.width, logo.height);
			else {
				var font = '';
				if(logo.fontStyle) font += logo.fontStyle + ' ';
				font += logo.height + 'px ' + logo.fontFace;
				context.font = font;
				// draw text in the middle
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillStyle = logo.color;
				var o = data.size / 2;
				context.fillText(logo.text, o, o);
			}
		}
	}
	function drawSquare() {
		fillCell(isDark(data.cell.i, data.cell.j) ? data.cell.colorDark : data.cell.colorLight);
	}
	function drawRound() {
		var cell = data.cell;
		var x = cell.x;
		var y = cell.y;
		var context = data.context;
		var cellSize = data.cellSize;
		var effect = data.effect;
		// fill arc with border-radius=effect
		fillCell(cell.colorLight);
		// draw cell if it should be dark
		if(isDark(cell.i, cell.j)) {
			context.fillStyle = cell.colorDark;
			context.beginPath();
			context.moveTo(x + .5 * cellSize, y);
			drawCorner(x + cellSize, y, x + cellSize, y + .5*cellSize, effect);
			drawCorner(x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, effect);
			drawCorner(x, y + cellSize, x, y + .5 * cellSize, effect);
			drawCorner(x, y, x + .5 * cellSize, y, effect);
			//context.closePath();
			context.fill();
		}
	}
	function drawLiquid() {
		var corners = [0, 0, 0, 0];	// NW, NE, SE, SW
		var cell = data.cell;
		var i = cell.i;
		var j = cell.j;
		var x = cell.x;
		var y = cell.y;
		var context = data.context;
		var effect = data.effect;
		var cellSize = data.cellSize;
		if(isDark(i-1, j)) {corners[0] ++; corners[1] ++;}
		if(isDark(i+1, j)) {corners[2] ++; corners[3] ++;}
		if(isDark(i, j-1)) {corners[0] ++; corners[3] ++;}
		if(isDark(i, j+1)) {corners[1] ++; corners[2] ++;}
		fillCell(cell.colorLight);
		// draw cell
		context.fillStyle = cell.colorDark;
		if(isDark(i, j)) {
			if(isDark(i-1, j-1)) corners[0] ++;
			if(isDark(i-1, j+1)) corners[1] ++;
			if(isDark(i+1, j+1)) corners[2] ++;
			if(isDark(i+1, j-1)) corners[3] ++;
			context.beginPath();
			context.moveTo(x + .5 * cellSize, y);
			drawCorner(x + cellSize, y, x + cellSize, y + .5 * cellSize, corners[1] ? 0 : effect);
			drawCorner(x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, corners[2] ? 0 : effect);
			drawCorner(x, y + cellSize, x, y + .5 * cellSize, corners[3] ? 0 : effect);
			drawCorner(x, y, x + .5 * cellSize, y, corners[0] ? 0 : effect);
			//context.closePath();
			context.fill();
		} else {
			if(corners[0] == 2) fillCorner(x, y + .5 * cellSize, x, y, x + .5 * cellSize, y);
			if(corners[1] == 2) fillCorner(x + .5 * cellSize, y, x + cellSize, y, x + cellSize, y + .5 * cellSize);
			if(corners[2] == 2) fillCorner(x + cellSize, y + .5 * cellSize, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize);
			if(corners[3] == 2) fillCorner(x + .5 * cellSize, y + cellSize, x, y + cellSize, x, y + .5 * cellSize);
		}
	}
	function drawCells() {
		var effect = options.effect;
		var func = null, i, j;
		data.effect = effect.value * data.cellSize;
		// draw qrcode according to effect
		if(data.effect)
			switch(effect.key) {
				case 'liquid':
					func = drawLiquid;
					break;
				case 'round':
					func = drawRound;
					break;
			}
		if(!func) func = drawSquare;
		// draw cells
		for(i = 0; i < options.count; i ++)
			for(j = 0; j < options.count; j ++) {
				data.cell = {
					i: i,
					j: j,
					x: ~~ (j * data.cellSize),
					y: ~~ (i * data.cellSize),
					colorDark: getColor(options.colorDark, i, j),
					colorLight: getColor(options.colorLight, i, j),
				};
				func();
			}
	}
	function prepareLogo(){
		// limit the logo size
		var logo = options.logo;
		var count = options.count;
		var context = data.context;
		var k, width, height, numberWidth, numberHeight;

		// if logo is an image
		if(logo.image) {
			k = logo.image;
			width = k.naturalWidth || k.width;
			height = k.naturalHeight || k.height;
		}
		// if logo is text
		else if(logo.text) {
			// get text width/height radio by assuming fontHeight=100px
			height = 100;
			k = '';
			if(logo.fontStyle) k += logo.fontStyle + ' ';
			k += height + 'px ' + logo.fontFace;
			context.font = k;
			width = context.measureText(logo.text).width;
		}
		// otherwise do nothing
		else return;

		// calculate the number of cells to be broken or covered by the logo
		k = width / height;
		numberHeight = Math.floor(Math.sqrt(Math.min(width * height / data.size / data.size, logo.size) / k) * count);
		numberWidth = Math.floor(k * numberHeight);
		// (count - [numberWidth | numberHeight]) must be even if the logo is in the middle
		if((count - numberWidth) % 2) numberWidth ++;
		if((count - numberHeight) % 2) numberHeight ++;

		// calculate the final width and height of the logo
		k = Math.min((numberHeight * data.cellSize - 2 * logo.margin) / height, (numberWidth * data.cellSize - 2 * logo.margin) / width, 1);
		logo.width = ~~(k * width);
		logo.height = ~~(k * height);
		logo.x = (data.size - logo.width) / 2;
		logo.y = (data.size - logo.height) / 2;

		// whether to clear cells broken by the logo (incomplete cells)
		if(logo.clearEdges) {
			logo.row1 = Math.floor((count - numberHeight) / 2);
			logo.row2 = logo.row1 + numberHeight - 1;
			logo.col1 = Math.floor((count - numberWidth) / 2);
			logo.col2 = logo.col1 + numberWidth - 1;
		} else
			logo.row1 = logo.col1 = logo.row2 = logo.col2 = -1;
	}
	function draw() {
		// ensure size and cellSize are integers
		// so that there will not be gaps between cells
		data.cellSize = Math.ceil(options.cellSize);
		data.size = data.cellSize * options.count;
		var canvas = getCanvas(data.size, data.size);

		data.context = canvas.getContext('2d');
		prepareLogo();
		drawCells();
		drawLogo();
		data.context = null;

		// if the size is not expected,
		// draw the QRCode to another canvas with the image stretched
		if(data.size != options.size) {
			var anotherCanvas = getCanvas(options.size, options.size);
			var context = anotherCanvas.getContext('2d');
			context.drawImage(canvas, 0, 0, options.size, options.size);
			canvas = anotherCanvas;
			anotherCanvas = null;
		}

		return canvas;
	}

	return draw();
}

// update dict1 with dict2
function extend(dict1, dict2){
	for(var i in dict2) dict1[i] = dict2[i];
}

function QRCanvas(options) {
	// typeNumber belongs to 1..10
  // will be increased to the smallest valid number if too small
	var typeNumber = options.typeNumber || 1;

	// correctLevel can be 'L', 'M', 'Q' or 'H'
	var correctLevel = options.correctLevel || 'M';

	// colorDark and colorLight can be callable functions
	var colorDark = options.colorDark || 'black';
	var colorLight = options.colorLight || 'white';

	// data should be a string
	var data = options.data || '';

	// effect: {key: [round|liquid], value: 0}
	var effect = options.effect || {};

	/* an image or text can be used as a logo
	 * logo: {
	 *   // image
	 *   image: Image,

	 *   // text
	 *   text: string,
	 *   color: string, default 'black'
	 *   fontStyle: string, e.g. 'italic bold'
	 *   fontFace: string, default 'Cursive'

	 *   // common
	 *   clearEdges: bool, default true
	 *   margin: number, default 2
	 *   size: float, default .15 stands for 15% of the QRCode
	 * }
	 */
	var logo = {
		color: 'black',
		fontFace: 'Cursive',
		clearEdges: true,
		margin: 2,
		size: .15,
	};
	if(options.logo) extend(logo, options.logo);
	// if a logo is to be added, correctLevel is set to H
	if(logo.image || logo.text) correctLevel = 'H';

	// Generate QRCode data with qrcode-light.js
	var qr = qrcode(typeNumber, correctLevel);
	qr.addData(data);
	qr.make();

	// calculate QRCode and cell sizes
	var count=qr.getModuleCount();
	// cellSize is used if assigned
	// otherwise size is used
	var cellSize = options.cellSize;
	var size = options.size;
	if(!cellSize && !size) cellSize = 2;
	if(cellSize) size = cellSize * count;
	else if(size) {
		size = options.size;
		cellSize = size / count;
	}

	// render QRCode with a canvas
	var canvas = renderByCanvas({
		cellSize: cellSize,
		size: size,
		count: count,
		colorDark: colorDark,
		colorLight: colorLight,
		logo: logo,
		isDark: qr.isDark.bind(qr),
		effect: effect,
	});

	return {
		dom: canvas,
		appendTo: function(parent) {
			parent.appendChild(this.dom);
		},
	};
}

window.QRCanvas = QRCanvas;
