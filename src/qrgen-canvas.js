/**
 * JSQRGen: QRCode Canvas Renderer
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */
'use strict';

function renderByCanvas(options) {
  function isDark(i, j) {
    return i >= 0 && i < options.count && j >= 0 && j < options.count
      && (options.logo.clearEdges ? transparent[i * options.count + j] : true)
      && options.isDark(i, j);
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
        var canvas = getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = getColor(options.colorLight, -1, -1);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        logo.edger.clearBackground(canvas);
        context.drawImage(canvas, logo.x, logo.y);
      }
      context.drawImage(logo.canvas, logo.x, logo.y);
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
    var corners = [0, 0, 0, 0]; // NW, NE, SE, SW
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
    numberHeight = ~~(Math.sqrt(Math.min(width * height / data.size / data.size, logo.size) / k) * count);
    numberWidth = ~~(k * numberHeight);
    // (count - [numberWidth | numberHeight]) must be even if the logo is in the middle
    if((count - numberWidth) % 2) numberWidth ++;
    if((count - numberHeight) % 2) numberHeight ++;

    // calculate the final width and height of the logo
    k = Math.min((numberHeight * data.cellSize - 2 * logo.margin) / height, (numberWidth * data.cellSize - 2 * logo.margin) / width, 1);
    logo.width = ~~(k * width);
    logo.height = ~~(k * height);
    logo.x = (data.size - logo.width) / 2 - logo.margin;
    logo.y = (data.size - logo.height) / 2 - logo.margin;

    // draw logo to a canvas
    logo.canvas = getCanvas(logo.width + logo.margin * 2, logo.height + logo.margin * 2);
    var ctx = logo.canvas.getContext('2d');
    if (logo.image)
      ctx.drawImage(logo.image, logo.margin, logo.margin, logo.width, logo.height);
    else {
      var font = '';
      if(logo.fontStyle) font += logo.fontStyle + ' ';
      font += logo.height + 'px ' + logo.fontFace;
      ctx.font = font;
      // draw text in the middle
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = logo.color;
      ctx.fillText(logo.text, logo.width / 2 + logo.margin, logo.height / 2 + logo.margin);
    }
    logo.edger = new Edger(logo.canvas, {margin: logo.margin, nobg: logo.clearEdges == 2});

    // whether to clear cells broken by the logo (incomplete cells)
    if(logo.clearEdges) {
      transparent = new Uint8Array(options.count * options.count);
      for (var i = 0; i < options.count; i ++)
        for (var j = 0; j < options.count; j ++)
          transparent[i * options.count + j] = logo.edger.isBackground(j * data.cellSize - logo.x, i * data.cellSize - logo.y, data.cellSize, data.cellSize);
    }
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

  var data = {};
  /**
   * Whether the cell is covered.
   * 0 - partially or completely covered.
   * 1 - transparent.
   */
  var transparent;
  return draw();
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
   *   clearEdges: number, default 0
   *       0 - not clear, just margin
   *       1 - clear incomplete cells
   *       2 - clear a larger rectangle area
   *   margin: number, default 2 for text and 0 for image
   *   size: float, default .15 stands for 15% of the QRCode
   * }
   */
  var logo = {
    color: 'black',
    fontFace: 'Cursive',
    clearEdges: 0,
    margin: -1,
    size: .15,
    irregular: false,
  };
  if(options.logo) extend(logo, options.logo);
  // if a logo is to be added, correctLevel is set to H
  if(logo.image || logo.text) {
    correctLevel = 'H';
    if (logo.margin < 0) logo.margin = logo.image ? 0 : 2;
  }

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
