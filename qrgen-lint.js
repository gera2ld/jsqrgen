/**
 * JSQRGen: QRCode Canvas Renderer
 * @author Gerald <i@gerald.top>
 * @license MIT
 */

function QRCanvas(options) {
  this.m_init(options);
}

// rendering functions
QRCanvas.m_effects = {
  square: {
    data: function (cell, options) {
      var context = options.context;
      var cellSize = options.cellSize;
      if (options.isDark(cell.i, cell.j)) {
        context.fillStyle = QRCanvas.m_colorDark;
        context.fillRect(cell.x, cell.y, cellSize, cellSize);
      }
    },
  },
};
QRCanvas.m_getEffect = function (key) {
  return QRCanvas.m_effects[key] || QRCanvas.m_effects.square;
};
QRCanvas.m_colorDark = 'black';
QRCanvas.m_colorLight = 'white';

QRCanvas.prototype.m_init = function (options) {
  var _this = this;
  options = _this.m_options = assign({
    // typeNumber belongs to 1..40
    // will be increased to the smallest valid number if too small
    typeNumber: 1,

    // correctLevel can be 'L', 'M', 'Q' or 'H'
    correctLevel: 'M',

    // cellSize is preferred to size
    // if none is provided, use default values below
    // * cellSize: 2,
    // * size: cellSize * count,

    // foreground and background may be an image or a style string
    // or an array of objects with attributes below:
    // * row | x: default 0
    // * col | y: default 0
    // * cols | width: default size
    // * rows | height: default size
    // * style: default 'black'
    foreground: QRCanvas.m_colorDark,
    background: null,

    // data MUST be a string
    data: '',

    // effect: an object with optional key and value
    // - {key: 'round', value: 0-1}
    // - {key: 'liquid', value: 0-1}
    // - {key: 'image', value: 0-1}
    effect: {},

    // Avoid transparent pixels
    noAlpha: true,

    // Null or a canvas to be reused
    reuseCanvas: null,

    /**
     * an image or text can be used as a logo
     * logo: {
     *   // image
     *   image: Image,

     *   // text
     *   text: string,
     *   color: string, default 'black'
     *   fontStyle: string, e.g. 'italic bold'
     *   fontFamily: string, default 'Cursive'

     *   // common
     *   clearEdges: number, default 0
     *       0 - not clear, just margin
     *       1 - clear incomplete cells
     *       2 - clear a larger rectangle area
     *   margin: number, default 2 for text and 0 for image
     *   size: float, default .15 stands for 15% of the QRCode
     * }
     */
    // logo: {},
  }, options);
  var logo = _this.m_logo = {
    color: QRCanvas.m_colorDark,
    fontFamily: 'Cursive',
    clearEdges: 0,
    margin: -1,
    size: .15,
  };
  var optionLogo = options.logo;
  optionLogo && (optionLogo.image || optionLogo.text) && assign(logo, optionLogo);
  if (logo.image || logo.text) {
    if (logo.margin < 0) logo.margin = logo.image ? 0 : 2;
  }

  if (logo.image || logo.text || options.effect.key === 'image') {
    options.correctLevel = 'H';
  }

  // Generate QRCode data with qrcode-light.js
  var qr = qrcode(options.typeNumber, options.correctLevel);
  qr.addData(options.data);
  qr.make();

  // calculate QRCode and cell sizes
  var count = qr.getModuleCount();
  var cellSize = options.cellSize;
  var size = options.size;
  if (!cellSize && !size) cellSize = 2;
  if (cellSize) {
    size = cellSize * count;
  } else {
    cellSize = size / count;
  }
  _this.m_cellSize = cellSize;
  _this.m_size = size;
  _this.m_count = count;
  _this.m_data = qr;
};
QRCanvas.prototype.m_isDark = function (i, j) {
  var _this = this;
  var count = _this.m_count;
  return i >= 0 && i < count && j >= 0 && j < count
    && _this.m_shouldTransclude(i * count + j)
    && _this.m_data.isDark(i, j);
};
QRCanvas.prototype.m_draw = function () {
  var _this = this;
  var options = _this.m_options;
  var count = _this.m_count;
  // ensure size and cellSize are integers
  // so that there will not be gaps between cells
  var cellSize = Math.ceil(_this.m_cellSize);
  var size = cellSize * count;
  var canvasData = getCanvas(size, size);
  var optionsDraw = {
    cellSize: cellSize,
    size: size,
    count: count,
    effect: options.effect,
    foreground: options.foreground,
  };

  _this.m_initLogo(canvasData);
  _this.m_drawCells(canvasData, optionsDraw);
  _this.m_clearLogo(canvasData);

  var foreground = _this.m_drawForeground(optionsDraw);
  var contextFore = foreground.getContext('2d');
  contextFore.globalCompositeOperation = 'destination-in';
  contextFore.drawImage(canvasData, 0, 0);

  var canvas = drawCanvas(getCanvas(size, size), {
    cellSize: cellSize,
    size: size,
    data: merge(
      options.noAlpha ? QRCanvas.m_colorLight : null,
      options.background,
      foreground
    ),
  });

  var logo = _this.m_logo;
  if (logo.canvas) canvas.getContext('2d').drawImage(logo.canvas, logo.x, logo.y);

  var destSize = _this.m_size;
  var canvasTarget = options.reuseCanvas;
  if (canvasTarget) {
    canvasTarget.width = canvasTarget.height = destSize;
  } else if (size != destSize) {
    // strech image if the size is not expected
    canvasTarget = getCanvas(destSize, destSize);
  }
  if (canvasTarget) {
    var contextTarget = canvasTarget.getContext('2d');
    contextTarget.drawImage(canvas, 0, 0, destSize, destSize);
  } else {
    canvasTarget = canvas;
  }
  return canvasTarget;
};
QRCanvas.prototype.m_drawForeground = function (options) {
  var _this = this;
  var cellSize = options.cellSize;
  var size = options.size;
  var effect = options.effect || {};
  var draw = QRCanvas.m_getEffect(effect.key);
  if (draw.foreground) {
    return draw.foreground(assign({
      mask: function () {
        // mask is a canvas with basic rendered QRCode
        var mask = getCanvas(size, size);
        // draw mask without effects
        _this.m_drawCells(mask, {
          cellSize: cellSize,
          count: options.count,
        });
        return mask;
      },
    }, options));
  } else {
    return drawCanvas(getCanvas(size, size), {
      cellSize: cellSize,
      size: size,
      data: options.foreground,
    });
  }
};
QRCanvas.prototype.m_initLogo = function (canvas) {
  // limit the logo size
  var _this = this;
  var logo = _this.m_logo;
  var count = _this.m_count;
  var cellSize = _this.m_cellSize;
  var size = _this.m_size;
  var context = canvas.getContext('2d');
  var k, width, height;

  // if logo is an image
  if (logo.image) {
    k = logo.image;
    width = k.naturalWidth || k.width;
    height = k.naturalHeight || k.height;
  }
  // if logo is text
  else if (logo.text) {
    // get text width/height radio by assuming fontHeight=100px
    height = 100;
    k = '';
    if (logo.fontStyle) k += logo.fontStyle + ' ';
    k += height + 'px ' + logo.fontFamily;
    context.font = k;
    width = context.measureText(logo.text).width;
  }
  // otherwise do nothing
  else return;

  // calculate the number of cells to be broken or covered by the logo
  k = width / height;
  var numberHeight = ~~ (Math.sqrt(Math.min(width * height / size / size, logo.size) / k) * count);
  var numberWidth = ~~ (k * numberHeight);
  // (count - [numberWidth | numberHeight]) must be even if the logo is in the middle
  if ((count - numberWidth) % 2) numberWidth ++;
  if ((count - numberHeight) % 2) numberHeight ++;

  // calculate the final width and height of the logo
  k = Math.min((numberHeight * cellSize - 2 * logo.margin) / height, (numberWidth * cellSize - 2 * logo.margin) / width, 1);
  logo.width = ~~ (k * width);
  logo.height = ~~ (k * height);
  logo.x = ((size - logo.width) >> 1) - logo.margin;
  logo.y = ((size - logo.height) >> 1) - logo.margin;

  // draw logo to a canvas
  logo.canvas = getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
  var ctx = logo.canvas.getContext('2d');
  if (logo.image) {
    ctx.drawImage(logo.image, logo.margin, logo.margin, logo.width, logo.height);
  } else {
    var font = '';
    if (logo.fontStyle) font += logo.fontStyle + ' ';
    font += logo.height + 'px ' + logo.fontFamily;
    ctx.font = font;
    // draw text in the middle
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = logo.color;
    ctx.fillText(logo.text, (logo.width >> 1) + logo.margin, (logo.height >> 1) + logo.margin);
  }
  _this.m_detectEdges();
};
QRCanvas.prototype.m_drawCells = function (canvas, options) {
  var _this = this;
  var cellSize = options.cellSize;
  var count = options.count;
  var effect = options.effect || {};
  var cellOptions = {
    cellSize: cellSize,
    count: count,
    context: canvas.getContext('2d'),
    value: effect.value || 0,
    isDark: _this.m_isDark.bind(_this),
  };
  // draw qrcode according to effect
  var draw = QRCanvas.m_getEffect(effect.key);
  // draw cells
  for (var i = 0; i < count; i ++) {
    for (var j = 0; j < count; j ++) {
      draw.data({
        i: i,
        j: j,
        x: j * cellSize,
        y: i * cellSize,
      }, cellOptions);
    }
  }
};
/**
 * @desc Transform color to remove alpha channel
 */
QRCanvas.prototype.m_transformColor = function (fg, bg, alpha) {
  return ~~ (fg * alpha / 255 + bg * (255 - alpha) / 255);
};
QRCanvas.prototype.m_detectEdges = function () {};
QRCanvas.prototype.m_clearLogo = function (_canvas) {};
QRCanvas.prototype.m_shouldTransclude = function (_index) {
  if (this.m_logo.clearEdges) {
    return false;
  } else {
    return true;
  }
};

/* eslint-disable */
function qrcanvas(options) {
  var qrcanvas = new QRCanvas(options);
  return qrcanvas.m_draw();
}

/**
 * @desc Create a new canvas.
 * @param {Int} width Width of the canvas.
 * @param {Int} height Height of the canvas.
 * @return {Canvas}
 */
function getCanvas(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * @desc Draw to the canvas with given image or colors.
 * @param {Canvas} canvas The canvas to initialize.
 * @param {Object} options
 *    data: {Image} or {String} or {Array}
 *    size: {Int}
 *    cellSize: {Int}
 */
function drawCanvas(canvas, options) {
  var data = options.data;
  if (data) {
    var ctx = canvas.getContext('2d');
    if (!Array.isArray(data)) data = [data];
    forEach(data, function (item) {
      if (item instanceof HTMLElement) {
        ctx.drawImage(item, 0, 0, canvas.width, canvas.height);
      } else {
        var x, y, w, h;
        if (typeof item === 'string') item = {style: item};
        else item = item || {};
        x = (('col' in item) ? item.col * options.cellSize : item.x) || 0;
        y = (('row' in item) ? item.row * options.cellSize : item.y) || 0;
        w = (('cols' in item) ? item.cols * options.cellSize : item.width) || options.size;
        h = (('rows' in item) ? item.rows * options.cellSize : item.height) || options.size;
        if (x < 0) x += options.size;
        if (y < 0) y += options.size;
        ctx.fillStyle = item.style || 'black';
        ctx.fillRect(x, y, w, h);
      }
    });
  }
  return canvas;
}

function forEach(arr, cb) {
  var length = arr && arr.length || 0;
  for (var i = 0; i < length; i ++) cb.call(arr, arr[i], i);
}

function assign() {
  var obj;
  forEach(arguments, function (arg) {
    if (!obj) obj = arg;
    else if (arg) for(var key in arg) obj[key] = arg[key];
  });
  return obj;
}

function merge() {
  var res = [];
  forEach(arguments, function (arg) {
    if (Array.isArray(arg)) res = res.concat(arg);
    else if (arg != null) res.push(arg);
  });
  return res;
}

// IE 9- does not support Uint8Array
var Uint8Array = window.Uint8Array || window.Array;

/**
* @desc detect image edge based on canvas
*/
function Edger(canvas, options) {
  var _this = this;
  options = options || {};
  _this.margin = options.margin || 0;
  _this.nobg = !!options.nobg;
  _this.isBackgroundColor = options.isBackgroundColor || _this.isBackgroundColor;
  _this.prepare(canvas);
}

Edger.prototype = {
  /**
   * @desc Read image data from a canvas and find the edges of the image.
   */
  prepare: function (canvas) {
    var _this = this;
    var ctx = canvas.getContext('2d');
    _this.width = canvas.width;
    _this.height = canvas.height;
    _this.total = _this.width * _this.height;
    if (_this.nobg) return;
    var imageData = ctx.getImageData(0, 0, _this.width, _this.height);
    /*_this._rect = {
      top: -1,
      right: -1,
      bottom: -1,
      left: -1,
    };*/

    /**
     * Whether the pixel should be background taking margin into account.
     * 0 - not checked
     * 1 - background
     * 2 - edge of the image
     */
    var bgData = _this.data = new Uint8Array(_this.total);
    /**
     * Whether the pixel itself is a background color.
     * 0 - not checked
     * 1 - background
     * 2 - edge of the image
     */
    var pixelData = new Uint8Array(_this.total);

    // BFS
    var queue = [], i;
    var slice = [].slice;
    for (i = 0; i < _this.width; i ++) {
      checkSurroundings(i);
      checkSurroundings(_this.total - 1 - i);
    }
    for (i = 0; i < _this.height; i ++) {
      checkSurroundings(i * _this.width);
      checkSurroundings((i + 1) * _this.width - 1);
    }
    var head = 0;
    while (head < queue.length) {
      var index = queue[head];
      if (index > _this.width) checkRow(index - _this.width);
      checkRow(index, true);
      if (index + _this.width < _this.total) checkRow(index + _this.width);
      head ++;
    }
    _this.totalBackground = head;

    function isBgPixel(index) {
      var value = pixelData[index];
      if (!value) {
        var offset = index * 4;
        var colorArr = slice.call(imageData.data, offset, offset + 4);
        if (_this.isBackgroundColor(colorArr)) {
          value = pixelData[index] = 1;
        } else {
          value = pixelData[index] = 2;
        }
      }
      return value === 1;
    }
    function checkSurroundings(index) {
      if (bgData[index]) return;
      var x0 = index % _this.width;
      var y0 = ~~ (index / _this.width);
      var R = _this.margin + 1;
      for (var x = Math.max(0, x0 - R + 1); x < x0 + R && x < _this.width; x ++) {
        for (var y = Math.max(0, y0 - R + 1); y < y0 + R && y < _this.height; y ++) {
          var dx = x - x0;
          var dy = y - y0;
          if (dx * dx + dy * dy < R * R) {
            if (!isBgPixel(x + y * _this.width)) {
              bgData[index] = 2;
              return;
            }
          }
        }
      }
      bgData[index] = 1;
      queue.push(index);
      /*var rect = _this._rect;
      if (rect.top < 0 || rect.top > y0) rect.top = y0;
      if (rect.right < 0 || rect.right < x0) rect.right = x0;
      if (rect.bottom < 0 || rect.bottom < y0) rect.bottom = y0;
      if (rect.left < 0 || rect.left > x0) rect.left = x0;*/
    }
    function checkRow(index, excludeSelf) {
      if (index % _this.width) checkSurroundings(index - 1);
      if (!excludeSelf) checkSurroundings(index);
      if ((index + 1) % _this.width) checkSurroundings(index + 1);
    }
  },
  /**
   * @desc The default isBackgroundColor callback to decide
   * whether a color is background by its Alpha value.
   */
  isBackgroundColor: function (colorArr) {
    return !colorArr[3]; // alpha is 0
  },
  /**
   * @desc The callback to tell whether a pixel or an area is outside the edges.
   */
  isBackground: function () {
    var args = arguments;
    var _this = this;
    var index;
    if (args.length == 1) {
      index = args[0];
    } else if (args.length == 2) {
      index = args[0] + args[1] * _this.width;
    } else if (args.length == 4) {
      var x0 = args[0];
      var y0 = args[1];
      var x1 = x0 + args[2];
      var y1 = y0 + args[3];
      if (x0 < 0) x0 = 0;
      if (y0 < 0) y0 = 0;
      if (x1 > _this.width) x1 = _this.width;
      if (y1 > _this.height) y1 = _this.height;
      for (var x = x0; x < x1; x ++) for (var y = y0; y < y1; y ++) {
        if (!_this.isBackground(x, y)) return false;
      }
      return true;
    } else {
      throw Error('Invalid index');
    }
    return _this.nobg ? false : _this.data[index] === 1;
  },
  /**
   * @desc Tranform a color number to a RGBA array.
   */
  /*getColorArr: function (color) {
    color = color || 255;
    return Array.isArray(color)
      ? [
        color[0] || 0,
        color[1] || 0,
        color[2] || 0,
        color[3] || 255,
      ] : [
        color >>> 24,
        color >>> 16 & 255,
        color >>> 8 & 255,
        color & 255,
      ];
  },*/
  /**
   * @desc To get a shadow with pure color
   */
  /*getShadow: function (color) {
    var _this = this;
    var canvas = getCanvas(_this.width, _this.height);
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, _this.width, _this.height);
    color = _this.getColorArr(color);
    for (var i = 0; i < _this.total; i ++)
      if (!_this.isBackground(i)) {
        var offset = i * 4;
        imageData.data[offset] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[3];
      }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  },*/
  /**
   * @desc To clear the background so that the shadow can be filled with custom styles.
   */
  clearBackground: function (canvas) {
    var _this = this;
    if (canvas.width != _this.width || canvas.height != _this.height) return;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, _this.width, _this.height);
    for (var i = 0; i < _this.total; i ++)
      if (_this.isBackground(i)) {
        var offset = i * 4;
        imageData.data[offset] = 0;
        imageData.data[offset + 1] = 0;
        imageData.data[offset + 2] = 0;
        imageData.data[offset + 3] = 0;
      }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  },
  /**
   * @desc Get the real edges of the image excluding the background part.
   */
  /*getRect: function () {
    var rect = this._rect;
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left + 1,
      height: rect.bottom - rect.top + 1,
    };
  },*/
};

QRCanvas.prototype.m_detectEdges = function () {
  var _this = this;
  var logo = _this.m_logo;
  var count = _this.m_count;
  var cellSize = _this.m_cellSize;
  var edger = logo.edger = new Edger(logo.canvas, {
    margin: logo.margin,
    nobg: logo.clearEdges == 2,
  });

  // whether to clear cells broken by the logo (incomplete cells)
  if (logo.clearEdges) {
    /**
     * Whether the cell is overlapped by logo.
     * 0 - partially or completely overlapped.
     * 1 - clear.
     */
    var transclude = _this.m_transclude = new Uint8Array(count * count);
    for (var i = 0; i < count; i ++) for (var j = 0; j < count; j ++) {
      transclude[i * count + j] = edger.isBackground(j * cellSize - logo.x, i * cellSize - logo.y, cellSize, cellSize);
    }
  }
};
QRCanvas.prototype.m_clearLogo = function (canvas) {
  var _this = this;
  var logo = _this.m_logo;
  if((logo.image || logo.text) && !logo.clearEdges) {
    var canvasLogo = getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
    var ctx = canvasLogo.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasLogo.width, canvasLogo.height);
    logo.edger.clearBackground(canvasLogo);
    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'destination-out';
    context.drawImage(canvasLogo, logo.x, logo.y);
  }
};
QRCanvas.prototype.m_shouldTransclude = function (index) {
  var _this = this;
  return _this.m_logo.clearEdges ? _this.m_transclude[index] : true;
};

/**
* @desc rendering functions for each cell
*/
!function () {
  function drawCorner(context, cornerX, cornerY, x, y, r) {
    if (r) {
      context.arcTo(cornerX, cornerY, x, y, r);
    } else {
      context.lineTo(cornerX, cornerY);
      context.lineTo(x, y);
    }
  }

  function drawRound(cell, options) {
    var x = cell.x;
    var y = cell.y;
    var cellSize = options.cellSize;
    var effect = options.value * cellSize / 2;
    var context = options.context;
    // draw cell if it should be dark
    if(options.isDark(cell.i, cell.j)) {
      context.fillStyle = QRCanvas.m_colorDark;
      context.beginPath();
      context.moveTo(x + .5 * cellSize, y);
      drawCorner(context, x + cellSize, y, x + cellSize, y + .5 * cellSize, effect);
      drawCorner(context, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, effect);
      drawCorner(context, x, y + cellSize, x, y + .5 * cellSize, effect);
      drawCorner(context, x, y, x + .5 * cellSize, y, effect);
      //context.closePath();
      context.fill();
    }
  }

  function fillCorner(context, startX, startY, cornerX, cornerY, destX, destY, effect) {
    context.beginPath();
    context.moveTo(startX, startY);
    drawCorner(context, cornerX, cornerY, destX, destY, effect);
    context.lineTo(cornerX, cornerY);
    context.lineTo(startX, startY);
    //context.closePath();
    context.fill();
  }

  function drawLiquid(cell, options) {
    var corners = [0, 0, 0, 0]; // NW, NE, SE, SW
    var i = cell.i;
    var j = cell.j;
    var x = cell.x;
    var y = cell.y;
    var cellSize = options.cellSize;
    var effect = options.value * cellSize / 2;
    var context = options.context;
    if(options.isDark(i-1, j)) {corners[0] ++; corners[1] ++;}
    if(options.isDark(i+1, j)) {corners[2] ++; corners[3] ++;}
    if(options.isDark(i, j-1)) {corners[0] ++; corners[3] ++;}
    if(options.isDark(i, j+1)) {corners[1] ++; corners[2] ++;}
    // draw cell
    context.fillStyle = QRCanvas.m_colorDark;
    if(options.isDark(i, j)) {
      if(options.isDark(i-1, j-1)) corners[0] ++;
      if(options.isDark(i-1, j+1)) corners[1] ++;
      if(options.isDark(i+1, j+1)) corners[2] ++;
      if(options.isDark(i+1, j-1)) corners[3] ++;
      context.beginPath();
      context.moveTo(x + .5 * cellSize, y);
      drawCorner(context, x + cellSize, y, x + cellSize, y + .5 * cellSize, corners[1] ? 0 : effect);
      drawCorner(context, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, corners[2] ? 0 : effect);
      drawCorner(context, x, y + cellSize, x, y + .5 * cellSize, corners[3] ? 0 : effect);
      drawCorner(context, x, y, x + .5 * cellSize, y, corners[0] ? 0 : effect);
      //context.closePath();
      context.fill();
    } else {
      if(corners[0] == 2) fillCorner(context, x, y + .5 * cellSize, x, y, x + .5 * cellSize, y, effect);
      if(corners[1] == 2) fillCorner(context, x + .5 * cellSize, y, x + cellSize, y, x + cellSize, y + .5 * cellSize, effect);
      if(corners[2] == 2) fillCorner(context, x + cellSize, y + .5 * cellSize, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, effect);
      if(corners[3] == 2) fillCorner(context, x + .5 * cellSize, y + cellSize, x, y + cellSize, x, y + .5 * cellSize, effect);
    }
  }

  function drawImage(cell, options) {
    var i = cell.i;
    var j = cell.j;
    var x = cell.x;
    var y = cell.y;
    var context = options.context;
    var cellSize = options.cellSize;
    var count = options.count;
    context.fillStyle = QRCanvas.m_colorDark;
    var fillSize = .25;
    if (i <= 7 && j <= 7
      || i <= 7 && count - j - 1 <= 7
      || count - i - 1 <= 7 && j <= 7
      || i + 5 <= count && i + 9 >= count && j + 5 <= count && j + 9 >= count
      || i === 7 || j === 7) fillSize = 1 - .1 * options.value;
    var offset = (1 - fillSize) / 2;
    context.fillRect(x + offset * cellSize, y + offset * cellSize, fillSize * cellSize, fillSize * cellSize);
  }

  function drawImageFore(options) {
    var cellSize = options.cellSize;
    var size = options.size;
    var mask = options.mask();
    var foreground = drawCanvas(getCanvas(size, size), {
      cellSize: cellSize,
      size: size,
      data: options.foreground,
    });
    var ctx = foreground.getContext('2d');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = QRCanvas.m_colorLight;
    ctx.fillRect(0, 0, size, size);
    return foreground;
  }

  assign(QRCanvas.m_effects, {
    round: {data: drawRound},
    liquid: {data: drawLiquid},
    image: {data: drawImage, foreground: drawImageFore},
  });
}();
