/**
 * @desc An edge detector based on canvas.
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */
'use strict';

function Edger(canvas, options) {
  var _this = this;
  options = options || {};
  _this.margin = options.margin || 0;
  _this.nobg = !!options.nobg;
  _this.isBackgroundColor = options.isBackgroundColor || _this._isBackgroundColor;
  _this.prepare(canvas);
}

Edger.prototype = {
  /**
   * @desc The default isBackgroundColor callback to decide
   * whether a color is background by its Alpha value.
   */
  _isBackgroundColor: function (colorArr) {
    return !colorArr[3]; // alpha is 0
  },
  /**
   * @desc The callback to tell whether a pixel or an area is outside the edges.
   */
  isBackground: function() {
    var _this = this;
    var index;
    if (arguments.length == 1)
      index = arguments[0];
    else if (arguments.length == 2)
      index = arguments[0] + arguments[1] * _this.width;
    else if (arguments.length == 4) {
      var x0 = arguments[0];
      var y0 = arguments[1];
      var x1 = x0 + arguments[2];
      var y1 = y0 + arguments[3];
      if (x0 < 0) x0 = 0;
      if (y0 < 0) y0 = 0;
      if (x1 > _this.width) x1 = _this.width;
      if (y1 > _this.height) y1 = _this.height;
      for (var x = x0; x < x1; x ++)
        for (var y = y0; y < y1; y ++)
          if (!_this.isBackground(x, y)) return false;
      return true;
    } else
      throw Error('Invalid index');
    return _this.nobg ? false : _this.data[index] === 1;
  },
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
    _this.data = new Uint8Array(_this.total);
    /**
     * Whether the pixel itself is a background color.
     * 0 - not checked
     * 1 - background
     * 2 - edge of the image
     */
    var isPixelBg = new Uint8Array(_this.total);

    // BFS
    var queue = [];
    var slice = [].slice;
    var checkPixel = function (index) {
      var value = isPixelBg[index];
      if (!value) {
        var offset = index * 4;
        var colorArr = slice.call(imageData.data, offset, offset + 4);
        if (_this.isBackgroundColor(colorArr)) {
          value = isPixelBg[index] = 1;
        } else
          value = isPixelBg[index] = 2;
      }
      return value === 1;
    };
    var checkCircular = function (index) {
      if (_this.data[index]) return;
      var x0 = index % _this.width;
      var y0 = ~~ (index / _this.width);
      var R = _this.margin + 1;
      for (var x = Math.max(0, x0 - R + 1); x < x0 + R && x < _this.width; x ++)
        for (var y = Math.max(0, y0 - R + 1); y < y0 + R && y < _this.height; y ++) {
          var dx = x - x0;
          var dy = y - y0;
          if (dx * dx + dy * dy < R * R) {
            if (!checkPixel(x + y * _this.width)) {
              _this.data[index] = 2;
              return;
            }
          }
        }
      _this.data[index] = 1;
      queue.push(index);
      /*var rect = _this._rect;
      if (rect.top < 0 || rect.top > y0) rect.top = y0;
      if (rect.right < 0 || rect.right < x0) rect.right = x0;
      if (rect.bottom < 0 || rect.bottom < y0) rect.bottom = y0;
      if (rect.left < 0 || rect.left > x0) rect.left = x0;*/
    };
    var checkThree = function (index, excludeSelf) {
      if (index % _this.width) checkCircular(index - 1);
      if (!excludeSelf) checkCircular(index);
      if ((index + 1) % _this.width) checkCircular(index + 1);
    };
    for (var i = 0; i < _this.width; i ++) {
      checkCircular(i);
      checkCircular(_this.total - 1 - i);
    }
    for (var i = 0; i < _this.height; i ++) {
      checkCircular(i * _this.width);
      checkCircular((i + 1) * _this.width - 1);
    }
    var head = 0;
    while (head < queue.length) {
      var index = queue[head];
      if (index > _this.width) checkThree(index - _this.width);
      checkThree(index, true);
      if (index + _this.width < _this.total) checkThree(index + _this.width);
      head ++;
    }
    _this.totalBackground = head;
  },
  /**
   * @desc Tranform a color number to a RGBA array.
   */
  getColorArr: function (color) {
    return Array.isArray(color)
      ? [
        color[0] || 0,
        color[1] || 0,
        color[2] || 0,
        color[3] || 0,
      ] : [
        color >>> 24,
        color >>> 16 & 255,
        color >>> 8 & 255,
        color & 255,
      ];
  },
  /**
   * @desc To get a shadow with pure color
   */
  getShadow: function (color) {
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
  },
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
