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
