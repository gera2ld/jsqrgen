/**
 * Common functions for JSQRGen
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */
'use strict';

/**
 * @desc Create a new canvas.
 * @param width {Int} Width of the canvas.
 * @param height {Int} Height of the canvas.
 * @return {Canvas}
 */
function getCanvas(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * @desc Initialize the canvas with given image or colors.
 * @param canvas {Canvas} The canvas to initialize.
 * @param options {Object}
 *    data: {Image} or {Array} or {String}
 *    size: {Int}
 *    cellSize: {Int}
 */
function initCanvas(canvas, options) {
  var ctx = canvas.getContext('2d');
  var data = options.data;
  if (!data) return;
  if (typeof data == 'string') data = [{style: data}];
  // color blocks
  if (Array.isArray(data))
    forEach(data, function (block) {
      var x, y, w, h, s;
      block = block || {};
      x = (('col' in block) ? block.col * options.cellSize : block.x) || 0;
      y = (('row' in block) ? block.row * options.cellSize : block.y) || 0;
      w = (('cols' in block) ? block.cols * options.cellSize : block.width) || options.size;
      h = (('rows' in block) ? block.rows * options.cellSize : block.height) || options.size;
      s = block.style || 'black';
      if (x < 0) x += options.size;
      if (y < 0) y += options.size;
      ctx.fillStyle = s;
      ctx.fillRect(x, y, w, h);
    });
  // image
  else
    ctx.drawImage(data, 0, 0, canvas.width, canvas.height);
}

function forEach(arr, cb) {
  for (var i = 0; i < arr.length; i ++)
    cb.call(arr, arr[i], i);
}

function extend() {
  var obj;
  forEach(arguments, function (arg) {
    if (!obj) obj = arg;
    else if (arg)
      for(var key in arg) obj[key] = arg[key];
  });
  return obj;
}

// IE 9- does not support Uint8Array
var Uint8Array = window.Uint8Array || window.Array;
