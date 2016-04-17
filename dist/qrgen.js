/**
 * JSQRGen - Generate characteristic qrcodes with a canvas.
 * @version v2.0.7
 * @license MIT
 * @author Gerald <gera2ld@163.com>
 *
 * QRCode Generator for JavaScript
 * Copyright (c) 2009 Kazuhiko Arase
 * URL: http://www.d-project.com/
 */
!function (root, factory) {
  if (typeof module === 'object' && module.exports)
    module.exports = factory(root);
  else
    root.qrgen = factory(root);
}(typeof window !== 'undefined' ? window : this, function (window) {

  /**
 * @desc An edge detector based on canvas.
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */

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
  isBackground: function () {
    var args = arguments;
    var _this = this;
    var index;
    if (args.length == 1)
      index = args[0];
    else if (args.length == 2)
      index = args[0] + args[1] * _this.width;
    else if (args.length == 4) {
      var x0 = args[0];
      var y0 = args[1];
      var x1 = x0 + args[2];
      var y1 = y0 + args[3];
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
    var pixelData = new Uint8Array(_this.total);

    // BFS
    var queue = [];
    var slice = [].slice;
    for (var i = 0; i < _this.width; i ++) {
      checkSurroundings(i);
      checkSurroundings(_this.total - 1 - i);
    }
    for (var i = 0; i < _this.height; i ++) {
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
      if (_this.data[index]) return;
      var x0 = index % _this.width;
      var y0 = ~~ (index / _this.width);
      var R = _this.margin + 1;
      for (var x = Math.max(0, x0 - R + 1); x < x0 + R && x < _this.width; x ++)
        for (var y = Math.max(0, y0 - R + 1); y < y0 + R && y < _this.height; y ++) {
          var dx = x - x0;
          var dy = y - y0;
          if (dx * dx + dy * dy < R * R) {
            if (!isBgPixel(x + y * _this.width)) {
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
    }
    function checkRow(index, excludeSelf) {
      if (index % _this.width) checkSurroundings(index - 1);
      if (!excludeSelf) checkSurroundings(index);
      if ((index + 1) % _this.width) checkSurroundings(index + 1);
    }
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

//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//	http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//	http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//
// Modified by: Gerald <gera2ld@163.com>
//	* Removed unneeded code
//	* Added UTF-8 encoding
//-----------------------------------------------------------------------

var qrcode = function() {

	//---------------------------------------------------------------------
	// qrcode
	//---------------------------------------------------------------------

	/**
	 * qrcode
	 * @param typeNumber 1 to 10
	 * @param errorCorrectLevel 'L','M','Q','H'
	 */
	var qrcode = function(typeNumber, errorCorrectLevel) {

		var PAD0 = 0xEC;
		var PAD1 = 0x11;

		var _typeNumber = typeNumber;
		var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
		var _modules = null;
		var _moduleCount = 0;
		var _dataCache = null;
		var _dataList = new Array();

		var _this = {};

		var makeImpl = function(test, maskPattern) {

			while (_dataCache == null) {
        try {
          _dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
          break;
        } catch (e) {
          _typeNumber ++;
          if (_typeNumber > 40) throw e;
        }
			}

			_moduleCount = _typeNumber * 4 + 17;
			_modules = function(moduleCount) {
				var modules = new Array(moduleCount);
				for (var row = 0; row < moduleCount; row += 1) {
					modules[row] = new Array(moduleCount);
					for (var col = 0; col < moduleCount; col += 1) {
						modules[row][col] = null;
					}
				}
				return modules;
			}(_moduleCount);

			setupPositionProbePattern(0, 0);
			setupPositionProbePattern(_moduleCount - 7, 0);
			setupPositionProbePattern(0, _moduleCount - 7);
			setupPositionAdjustPattern();
			setupTimingPattern();
			setupTypeInfo(test, maskPattern);

			if (_typeNumber >= 7) {
				setupTypeNumber(test);
			}

			mapData(_dataCache, maskPattern);
		};

		var setupPositionProbePattern = function(row, col) {

			for (var r = -1; r <= 7; r += 1) {

				if (row + r <= -1 || _moduleCount <= row + r) continue;

				for (var c = -1; c <= 7; c += 1) {

					if (col + c <= -1 || _moduleCount <= col + c) continue;

					if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
							|| (0 <= c && c <= 6 && (r == 0 || r == 6) )
							|| (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
						_modules[row + r][col + c] = true;
					} else {
						_modules[row + r][col + c] = false;
					}
				}
			}
		};

		var getBestMaskPattern = function() {

			var minLostPoint = 0;
			var pattern = 0;

			for (var i = 0; i < 8; i += 1) {

				makeImpl(true, i);

				var lostPoint = QRUtil.getLostPoint(_this);

				if (i == 0 || minLostPoint > lostPoint) {
					minLostPoint = lostPoint;
					pattern = i;
				}
			}

			return pattern;
		};

		var setupTimingPattern = function() {

			for (var r = 8; r < _moduleCount - 8; r += 1) {
				if (_modules[r][6] != null) {
					continue;
				}
				_modules[r][6] = (r % 2 == 0);
			}

			for (var c = 8; c < _moduleCount - 8; c += 1) {
				if (_modules[6][c] != null) {
					continue;
				}
				_modules[6][c] = (c % 2 == 0);
			}
		};

		var setupPositionAdjustPattern = function() {

			var pos = QRUtil.getPatternPosition(_typeNumber);

			for (var i = 0; i < pos.length; i += 1) {

				for (var j = 0; j < pos.length; j += 1) {

					var row = pos[i];
					var col = pos[j];

					if (_modules[row][col] != null) {
						continue;
					}

					for (var r = -2; r <= 2; r += 1) {

						for (var c = -2; c <= 2; c += 1) {

							if (r == -2 || r == 2 || c == -2 || c == 2
									|| (r == 0 && c == 0) ) {
								_modules[row + r][col + c] = true;
							} else {
								_modules[row + r][col + c] = false;
							}
						}
					}
				}
			}
		};

		var setupTypeNumber = function(test) {

			var bits = QRUtil.getBCHTypeNumber(_typeNumber);

			for (var i = 0; i < 18; i += 1) {
				var mod = (!test && ( (bits >> i) & 1) == 1);
				_modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
			}

			for (var i = 0; i < 18; i += 1) {
				var mod = (!test && ( (bits >> i) & 1) == 1);
				_modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
			}
		};

		var setupTypeInfo = function(test, maskPattern) {

			var data = (_errorCorrectLevel << 3) | maskPattern;
			var bits = QRUtil.getBCHTypeInfo(data);

			// vertical
			for (var i = 0; i < 15; i += 1) {

				var mod = (!test && ( (bits >> i) & 1) == 1);

				if (i < 6) {
					_modules[i][8] = mod;
				} else if (i < 8) {
					_modules[i + 1][8] = mod;
				} else {
					_modules[_moduleCount - 15 + i][8] = mod;
				}
			}

			// horizontal
			for (var i = 0; i < 15; i += 1) {

				var mod = (!test && ( (bits >> i) & 1) == 1);

				if (i < 8) {
					_modules[8][_moduleCount - i - 1] = mod;
				} else if (i < 9) {
					_modules[8][15 - i - 1 + 1] = mod;
				} else {
					_modules[8][15 - i - 1] = mod;
				}
			}

			// fixed module
			_modules[_moduleCount - 8][8] = (!test);
		};

		var mapData = function(data, maskPattern) {

			var inc = -1;
			var row = _moduleCount - 1;
			var bitIndex = 7;
			var byteIndex = 0;
			var maskFunc = QRUtil.getMaskFunction(maskPattern);

			for (var col = _moduleCount - 1; col > 0; col -= 2) {

				if (col == 6) col -= 1;

				while (true) {

					for (var c = 0; c < 2; c += 1) {

						if (_modules[row][col - c] == null) {

							var dark = false;

							if (byteIndex < data.length) {
								dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
							}

							var mask = maskFunc(row, col - c);

							if (mask) {
								dark = !dark;
							}

							_modules[row][col - c] = dark;
							bitIndex -= 1;

							if (bitIndex == -1) {
								byteIndex += 1;
								bitIndex = 7;
							}
						}
					}

					row += inc;

					if (row < 0 || _moduleCount <= row) {
						row -= inc;
						inc = -inc;
						break;
					}
				}
			}
		};

		var createBytes = function(buffer, rsBlocks) {

			var offset = 0;

			var maxDcCount = 0;
			var maxEcCount = 0;

			var dcdata = new Array(rsBlocks.length);
			var ecdata = new Array(rsBlocks.length);

			for (var r = 0; r < rsBlocks.length; r += 1) {

				var dcCount = rsBlocks[r].dataCount;
				var ecCount = rsBlocks[r].totalCount - dcCount;

				maxDcCount = Math.max(maxDcCount, dcCount);
				maxEcCount = Math.max(maxEcCount, ecCount);

				dcdata[r] = new Array(dcCount);

				for (var i = 0; i < dcdata[r].length; i += 1) {
					dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
				}
				offset += dcCount;

				var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
				var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

				var modPoly = rawPoly.mod(rsPoly);
				ecdata[r] = new Array(rsPoly.getLength() - 1);
				for (var i = 0; i < ecdata[r].length; i += 1) {
					var modIndex = i + modPoly.getLength() - ecdata[r].length;
					ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
				}
			}

			var totalCodeCount = 0;
			for (var i = 0; i < rsBlocks.length; i += 1) {
				totalCodeCount += rsBlocks[i].totalCount;
			}

			var data = new Array(totalCodeCount);
			var index = 0;

			for (var i = 0; i < maxDcCount; i += 1) {
				for (var r = 0; r < rsBlocks.length; r += 1) {
					if (i < dcdata[r].length) {
						data[index] = dcdata[r][i];
						index += 1;
					}
				}
			}

			for (var i = 0; i < maxEcCount; i += 1) {
				for (var r = 0; r < rsBlocks.length; r += 1) {
					if (i < ecdata[r].length) {
						data[index] = ecdata[r][i];
						index += 1;
					}
				}
			}

			return data;
		};

		var createData = function(typeNumber, errorCorrectLevel, dataList) {

			var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

			var buffer = qrBitBuffer();

			for (var i = 0; i < dataList.length; i += 1) {
				var data = dataList[i];
				buffer.put(data.getMode(), 4);
				buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
				data.write(buffer);
			}

			// calc num max data.
			var totalDataCount = 0;
			for (var i = 0; i < rsBlocks.length; i += 1) {
				totalDataCount += rsBlocks[i].dataCount;
			}

			if (buffer.getLengthInBits() > totalDataCount * 8) {
				throw new Error('code length overflow. ('
					+ buffer.getLengthInBits()
					+ '>'
					+ totalDataCount * 8
					+ ')');
			}

			// end code
			if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
				buffer.put(0, 4);
			}

			// padding
			while (buffer.getLengthInBits() % 8 != 0) {
				buffer.putBit(false);
			}

			// padding
			while (true) {

				if (buffer.getLengthInBits() >= totalDataCount * 8) {
					break;
				}
				buffer.put(PAD0, 8);

				if (buffer.getLengthInBits() >= totalDataCount * 8) {
					break;
				}
				buffer.put(PAD1, 8);
			}

			return createBytes(buffer, rsBlocks);
		};

		_this.addData = function(data) {
			var newData = qr8BitByte(data);
			_dataList.push(newData);
			_dataCache = null;
		};

		_this.isDark = function(row, col) {
			if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
				throw new Error(row + ',' + col);
			}
			return _modules[row][col];
		};

		_this.getModuleCount = function() {
			return _moduleCount;
		};

		_this.make = function() {
			makeImpl(false, getBestMaskPattern() );
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// qrcode.stringToBytes
	//---------------------------------------------------------------------

  // qrcode.stringToBytes = function(s) {
	// 	var bytes = new Array();
	// 	for (var i = 0; i < s.length; i += 1) {
	// 		var c = s.charCodeAt(i);
	// 		bytes.push(c & 0xff);
	// 	}
	// 	return bytes;
	// };
 	qrcode.stringToBytes = function(s) {
		var bytes = [];
		s = s.replace(/\r\n/g, '\n');
		for (var i = 0; i < s.length; i ++) {
			var c = s.charCodeAt(i);
			if (c < 128) bytes.push(c);
			else if (c < 2048) {
        bytes.push(
          (c >> 6) | 192,
          (c & 63) | 128
        );
			} else {
        bytes.push(
          (c >> 12) | 224,
          ((c >> 6) & 63) | 128,
          (c & 63) | 128
        );
			}
		}
		return bytes;
	};

	//---------------------------------------------------------------------
	// qrcode.createStringToBytes
	//---------------------------------------------------------------------

	/**
	 * @param unicodeData base64 string of byte array.
	 * [16bit Unicode],[16bit Bytes], ...
	 * @param numChars
	 */
	qrcode.createStringToBytes = function(unicodeData, numChars) {

		// create conversion map.

		var unicodeMap = function() {

			var bin = base64DecodeInputStream(unicodeData);
			var read = function() {
				var b = bin.read();
				if (b == -1) throw new Error();
				return b;
			};

			var count = 0;
			var unicodeMap = {};
			while (true) {
				var b0 = bin.read();
				if (b0 == -1) break;
				var b1 = read();
				var b2 = read();
				var b3 = read();
				var k = String.fromCharCode( (b0 << 8) | b1);
				var v = (b2 << 8) | b3;
				unicodeMap[k] = v;
				count += 1;
			}
			if (count != numChars) {
				throw new Error(count + ' != ' + numChars);
			}

			return unicodeMap;
		}();

		var unknownChar = '?'.charCodeAt(0);

		return function(s) {
			var bytes = new Array();
			for (var i = 0; i < s.length; i += 1) {
				var c = s.charCodeAt(i);
				if (c < 128) {
					bytes.push(c);
				} else {
					var b = unicodeMap[s.charAt(i)];
					if (typeof b == 'number') {
						if ( (b & 0xff) == b) {
							// 1byte
							bytes.push(b);
						} else {
							// 2bytes
							bytes.push(b >>> 8);
							bytes.push(b & 0xff);
						}
					} else {
						bytes.push(unknownChar);
					}
				}
			}
			return bytes;
		};
	};

	//---------------------------------------------------------------------
	// QRMode
	//---------------------------------------------------------------------

	var QRMode = {
		MODE_NUMBER :		1 << 0,
		MODE_ALPHA_NUM : 	1 << 1,
		MODE_8BIT_BYTE : 	1 << 2,
		MODE_KANJI :		1 << 3
	};

	//---------------------------------------------------------------------
	// QRErrorCorrectLevel
	//---------------------------------------------------------------------

	var QRErrorCorrectLevel = {
		L : 1,
		M : 0,
		Q : 3,
		H : 2
	};

	//---------------------------------------------------------------------
	// QRMaskPattern
	//---------------------------------------------------------------------

	var QRMaskPattern = {
		PATTERN000 : 0,
		PATTERN001 : 1,
		PATTERN010 : 2,
		PATTERN011 : 3,
		PATTERN100 : 4,
		PATTERN101 : 5,
		PATTERN110 : 6,
		PATTERN111 : 7
	};

	//---------------------------------------------------------------------
	// QRUtil
	//---------------------------------------------------------------------

	var QRUtil = function() {

		var PATTERN_POSITION_TABLE = [
			[],
			[6, 18],
			[6, 22],
			[6, 26],
			[6, 30],
			[6, 34],
			[6, 22, 38],
			[6, 24, 42],
			[6, 26, 46],
			[6, 28, 50],
			[6, 30, 54],
			[6, 32, 58],
			[6, 34, 62],
			[6, 26, 46, 66],
			[6, 26, 48, 70],
			[6, 26, 50, 74],
			[6, 30, 54, 78],
			[6, 30, 56, 82],
			[6, 30, 58, 86],
			[6, 34, 62, 90],
			[6, 28, 50, 72, 94],
			[6, 26, 50, 74, 98],
			[6, 30, 54, 78, 102],
			[6, 28, 54, 80, 106],
			[6, 32, 58, 84, 110],
			[6, 30, 58, 86, 114],
			[6, 34, 62, 90, 118],
			[6, 26, 50, 74, 98, 122],
			[6, 30, 54, 78, 102, 126],
			[6, 26, 52, 78, 104, 130],
			[6, 30, 56, 82, 108, 134],
			[6, 34, 60, 86, 112, 138],
			[6, 30, 58, 86, 114, 142],
			[6, 34, 62, 90, 118, 146],
			[6, 30, 54, 78, 102, 126, 150],
			[6, 24, 50, 76, 102, 128, 154],
			[6, 28, 54, 80, 106, 132, 158],
			[6, 32, 58, 84, 110, 136, 162],
			[6, 26, 54, 82, 110, 138, 166],
			[6, 30, 58, 86, 114, 142, 170]
		];
		var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
		var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
		var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

		var _this = {};

		var getBCHDigit = function(data) {
			var digit = 0;
			while (data != 0) {
				digit += 1;
				data >>>= 1;
			}
			return digit;
		};

		_this.getBCHTypeInfo = function(data) {
			var d = data << 10;
			while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
				d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
			}
			return ( (data << 10) | d) ^ G15_MASK;
		};

		_this.getBCHTypeNumber = function(data) {
			var d = data << 12;
			while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
				d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
			}
			return (data << 12) | d;
		};

		_this.getPatternPosition = function(typeNumber) {
			return PATTERN_POSITION_TABLE[typeNumber - 1];
		};

		_this.getMaskFunction = function(maskPattern) {

			switch (maskPattern) {

			case QRMaskPattern.PATTERN000 :
				return function(i, j) { return (i + j) % 2 == 0; };
			case QRMaskPattern.PATTERN001 :
				return function(i, j) { return i % 2 == 0; };
			case QRMaskPattern.PATTERN010 :
				return function(i, j) { return j % 3 == 0; };
			case QRMaskPattern.PATTERN011 :
				return function(i, j) { return (i + j) % 3 == 0; };
			case QRMaskPattern.PATTERN100 :
				return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
			case QRMaskPattern.PATTERN101 :
				return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
			case QRMaskPattern.PATTERN110 :
				return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
			case QRMaskPattern.PATTERN111 :
				return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

			default :
				throw new Error('bad maskPattern:' + maskPattern);
			}
		};

		_this.getErrorCorrectPolynomial = function(errorCorrectLength) {
			var a = qrPolynomial([1], 0);
			for (var i = 0; i < errorCorrectLength; i += 1) {
				a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
			}
			return a;
		};

		_this.getLengthInBits = function(mode, type) {

			if (1 <= type && type < 10) {

				// 1 - 9

				switch(mode) {
				case QRMode.MODE_NUMBER 	: return 10;
				case QRMode.MODE_ALPHA_NUM 	: return 9;
				case QRMode.MODE_8BIT_BYTE	: return 8;
				case QRMode.MODE_KANJI		: return 8;
				default :
					throw new Error('mode:' + mode);
				}

			} else if (type < 27) {

				// 10 - 26

				switch(mode) {
				case QRMode.MODE_NUMBER 	: return 12;
				case QRMode.MODE_ALPHA_NUM 	: return 11;
				case QRMode.MODE_8BIT_BYTE	: return 16;
				case QRMode.MODE_KANJI		: return 10;
				default :
					throw new Error('mode:' + mode);
				}

			} else if (type < 41) {

				// 27 - 40

				switch(mode) {
				case QRMode.MODE_NUMBER 	: return 14;
				case QRMode.MODE_ALPHA_NUM	: return 13;
				case QRMode.MODE_8BIT_BYTE	: return 16;
				case QRMode.MODE_KANJI		: return 12;
				default :
					throw new Error('mode:' + mode);
				}

			} else {
				throw new Error('type:' + type);
			}
		};

		_this.getLostPoint = function(qrcode) {

			var moduleCount = qrcode.getModuleCount();

			var lostPoint = 0;

			// LEVEL1

			for (var row = 0; row < moduleCount; row += 1) {
				for (var col = 0; col < moduleCount; col += 1) {

					var sameCount = 0;
					var dark = qrcode.isDark(row, col);

					for (var r = -1; r <= 1; r += 1) {

						if (row + r < 0 || moduleCount <= row + r) {
							continue;
						}

						for (var c = -1; c <= 1; c += 1) {

							if (col + c < 0 || moduleCount <= col + c) {
								continue;
							}

							if (r == 0 && c == 0) {
								continue;
							}

							if (dark == qrcode.isDark(row + r, col + c) ) {
								sameCount += 1;
							}
						}
					}

					if (sameCount > 5) {
						lostPoint += (3 + sameCount - 5);
					}
				}
			};

			// LEVEL2

			for (var row = 0; row < moduleCount - 1; row += 1) {
				for (var col = 0; col < moduleCount - 1; col += 1) {
					var count = 0;
					if (qrcode.isDark(row, col) ) count += 1;
					if (qrcode.isDark(row + 1, col) ) count += 1;
					if (qrcode.isDark(row, col + 1) ) count += 1;
					if (qrcode.isDark(row + 1, col + 1) ) count += 1;
					if (count == 0 || count == 4) {
						lostPoint += 3;
					}
				}
			}

			// LEVEL3

			for (var row = 0; row < moduleCount; row += 1) {
				for (var col = 0; col < moduleCount - 6; col += 1) {
					if (qrcode.isDark(row, col)
							&& !qrcode.isDark(row, col + 1)
							&&  qrcode.isDark(row, col + 2)
							&&  qrcode.isDark(row, col + 3)
							&&  qrcode.isDark(row, col + 4)
							&& !qrcode.isDark(row, col + 5)
							&&  qrcode.isDark(row, col + 6) ) {
						lostPoint += 40;
					}
				}
			}

			for (var col = 0; col < moduleCount; col += 1) {
				for (var row = 0; row < moduleCount - 6; row += 1) {
					if (qrcode.isDark(row, col)
							&& !qrcode.isDark(row + 1, col)
							&&  qrcode.isDark(row + 2, col)
							&&  qrcode.isDark(row + 3, col)
							&&  qrcode.isDark(row + 4, col)
							&& !qrcode.isDark(row + 5, col)
							&&  qrcode.isDark(row + 6, col) ) {
						lostPoint += 40;
					}
				}
			}

			// LEVEL4

			var darkCount = 0;

			for (var col = 0; col < moduleCount; col += 1) {
				for (var row = 0; row < moduleCount; row += 1) {
					if (qrcode.isDark(row, col) ) {
						darkCount += 1;
					}
				}
			}

			var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
			lostPoint += ratio * 10;

			return lostPoint;
		};

		return _this;
	}();

	//---------------------------------------------------------------------
	// QRMath
	//---------------------------------------------------------------------

	var QRMath = function() {

		var EXP_TABLE = new Array(256);
		var LOG_TABLE = new Array(256);

		// initialize tables
		for (var i = 0; i < 8; i += 1) {
			EXP_TABLE[i] = 1 << i;
		}
		for (var i = 8; i < 256; i += 1) {
			EXP_TABLE[i] = EXP_TABLE[i - 4]
				^ EXP_TABLE[i - 5]
				^ EXP_TABLE[i - 6]
				^ EXP_TABLE[i - 8];
		}
		for (var i = 0; i < 255; i += 1) {
			LOG_TABLE[EXP_TABLE[i] ] = i;
		}

		var _this = {};

		_this.glog = function(n) {

			if (n < 1) {
				throw new Error('glog(' + n + ')');
			}

			return LOG_TABLE[n];
		};

		_this.gexp = function(n) {

			while (n < 0) {
				n += 255;
			}

			while (n >= 256) {
				n -= 255;
			}

			return EXP_TABLE[n];
		};

		return _this;
	}();

	//---------------------------------------------------------------------
	// qrPolynomial
	//---------------------------------------------------------------------

	function qrPolynomial(num, shift) {

		if (typeof num.length == 'undefined') {
			throw new Error(num.length + '/' + shift);
		}

		var _num = function() {
			var offset = 0;
			while (offset < num.length && num[offset] == 0) {
				offset += 1;
			}
			var _num = new Array(num.length - offset + shift);
			for (var i = 0; i < num.length - offset; i += 1) {
				_num[i] = num[i + offset];
			}
			return _num;
		}();

		var _this = {};

		_this.getAt = function(index) {
			return _num[index];
		};

		_this.getLength = function() {
			return _num.length;
		};

		_this.multiply = function(e) {

			var num = new Array(_this.getLength() + e.getLength() - 1);

			for (var i = 0; i < _this.getLength(); i += 1) {
				for (var j = 0; j < e.getLength(); j += 1) {
					num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
				}
			}

			return qrPolynomial(num, 0);
		};

		_this.mod = function(e) {

			if (_this.getLength() - e.getLength() < 0) {
				return _this;
			}

			var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

			var num = new Array(_this.getLength() );
			for (var i = 0; i < _this.getLength(); i += 1) {
				num[i] = _this.getAt(i);
			}

			for (var i = 0; i < e.getLength(); i += 1) {
				num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
			}

			// recursive call
			return qrPolynomial(num, 0).mod(e);
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// QRRSBlock
	//---------------------------------------------------------------------

	var QRRSBlock = function() {

		var RS_BLOCK_TABLE = [

			// L
			// M
			// Q
			// H

			// 1
			[1, 26, 19],
			[1, 26, 16],
			[1, 26, 13],
			[1, 26, 9],

			// 2
			[1, 44, 34],
			[1, 44, 28],
			[1, 44, 22],
			[1, 44, 16],

			// 3
			[1, 70, 55],
			[1, 70, 44],
			[2, 35, 17],
			[2, 35, 13],

			// 4
			[1, 100, 80],
			[2, 50, 32],
			[2, 50, 24],
			[4, 25, 9],

			// 5
			[1, 134, 108],
			[2, 67, 43],
			[2, 33, 15, 2, 34, 16],
			[2, 33, 11, 2, 34, 12],

			// 6
			[2, 86, 68],
			[4, 43, 27],
			[4, 43, 19],
			[4, 43, 15],

			// 7
			[2, 98, 78],
			[4, 49, 31],
			[2, 32, 14, 4, 33, 15],
			[4, 39, 13, 1, 40, 14],

			// 8
			[2, 121, 97],
			[2, 60, 38, 2, 61, 39],
			[4, 40, 18, 2, 41, 19],
			[4, 40, 14, 2, 41, 15],

			// 9
			[2, 146, 116],
			[3, 58, 36, 2, 59, 37],
			[4, 36, 16, 4, 37, 17],
			[4, 36, 12, 4, 37, 13],

			// 10
			[2, 86, 68, 2, 87, 69],
			[4, 69, 43, 1, 70, 44],
			[6, 43, 19, 2, 44, 20],
			[6, 43, 15, 2, 44, 16]

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
		];

		var qrRSBlock = function(totalCount, dataCount) {
			var _this = {};
			_this.totalCount = totalCount;
			_this.dataCount = dataCount;
			return _this;
		};

		var _this = {};

		var getRsBlockTable = function(typeNumber, errorCorrectLevel) {

			switch(errorCorrectLevel) {
			case QRErrorCorrectLevel.L :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
			case QRErrorCorrectLevel.M :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
			case QRErrorCorrectLevel.Q :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
			case QRErrorCorrectLevel.H :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
			default :
				return undefined;
			}
		};

		_this.getRSBlocks = function(typeNumber, errorCorrectLevel) {

			var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

			if (typeof rsBlock == 'undefined') {
				throw new Error('bad rs block @ typeNumber:' + typeNumber +
						'/errorCorrectLevel:' + errorCorrectLevel);
			}

			var length = rsBlock.length / 3;

			var list = new Array();

			for (var i = 0; i < length; i += 1) {

				var count = rsBlock[i * 3 + 0];
				var totalCount = rsBlock[i * 3 + 1];
				var dataCount = rsBlock[i * 3 + 2];

				for (var j = 0; j < count; j += 1) {
					list.push(qrRSBlock(totalCount, dataCount) );
				}
			}

			return list;
		};

		return _this;
	}();

	//---------------------------------------------------------------------
	// qrBitBuffer
	//---------------------------------------------------------------------

	var qrBitBuffer = function() {

		var _buffer = new Array();
		var _length = 0;

		var _this = {};

		_this.getBuffer = function() {
			return _buffer;
		};

		_this.getAt = function(index) {
			var bufIndex = Math.floor(index / 8);
			return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
		};

		_this.put = function(num, length) {
			for (var i = 0; i < length; i += 1) {
				_this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
			}
		};

		_this.getLengthInBits = function() {
			return _length;
		};

		_this.putBit = function(bit) {

			var bufIndex = Math.floor(_length / 8);
			if (_buffer.length <= bufIndex) {
				_buffer.push(0);
			}

			if (bit) {
				_buffer[bufIndex] |= (0x80 >>> (_length % 8) );
			}

			_length += 1;
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// qr8BitByte
	//---------------------------------------------------------------------

	var qr8BitByte = function(data) {

		var _mode = QRMode.MODE_8BIT_BYTE;
		var _data = data;
		var _bytes = qrcode.stringToBytes(data);

		var _this = {};

		_this.getMode = function() {
			return _mode;
		};

		_this.getLength = function(buffer) {
			return _bytes.length;
		};

		_this.write = function(buffer) {
			for (var i = 0; i < _bytes.length; i += 1) {
				buffer.put(_bytes[i], 8);
			}
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// returns qrcode function.

	return qrcode;
}();

/**
 * JSQRGen: QRCode Canvas Renderer
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */

function renderByCanvas(options) {

  function isDark(i, j) {
    return i >= 0 && i < options.count && j >= 0 && j < options.count
      && (options.logo.clearEdges ? clear[i * options.count + j] : true)
      && options.qr.isDark(i, j);
  }

  function drawCorner(cornerX, cornerY, x, y, r) {
    var context = common.context;
    if(r) context.arcTo(cornerX, cornerY, x, y, r);
    else {
      context.lineTo(cornerX, cornerY);
      context.lineTo(x, y);
    }
  }

  function fillCorner(startX, startY, cornerX, cornerY, destX, destY) {
    var context = common.context;
    context.beginPath();
    context.moveTo(startX, startY);
    drawCorner(cornerX, cornerY, destX, destY, common.effect);
    context.lineTo(cornerX, cornerY);
    context.lineTo(startX, startY);
    //context.closePath();
    context.fill();
  }

  function drawSquare() {
    var cell = common.cell;
    var context = common.context;
    var cellSize = common.cellSize;
    if (isDark(cell.i, cell.j)) {
      context.fillStyle = colorDark;
      context.fillRect(cell.x, cell.y, cellSize, cellSize);
    }
  }

  function drawRound() {
    var cell = common.cell;
    var x = cell.x;
    var y = cell.y;
    var context = common.context;
    var cellSize = common.cellSize;
    var effect = common.effect;
    // draw cell if it should be dark
    if(isDark(cell.i, cell.j)) {
      context.fillStyle = colorDark;
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
    var cell = common.cell;
    var i = cell.i;
    var j = cell.j;
    var x = cell.x;
    var y = cell.y;
    var context = common.context;
    var effect = common.effect;
    var cellSize = common.cellSize;
    if(isDark(i-1, j)) {corners[0] ++; corners[1] ++;}
    if(isDark(i+1, j)) {corners[2] ++; corners[3] ++;}
    if(isDark(i, j-1)) {corners[0] ++; corners[3] ++;}
    if(isDark(i, j+1)) {corners[1] ++; corners[2] ++;}
    // draw cell
    context.fillStyle = colorDark;
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
    var func = drawSquare, i, j;
    // common.cellSize should be INTEGER
    var cellSize = common.cellSize;
    common.effect = effect.value * cellSize;
    // draw qrcode according to effect
    if(common.effect)
      switch (effect.key) {
        case 'liquid':
          func = drawLiquid;
          break;
        case 'round':
          func = drawRound;
          break;
      }
    // draw cells
    for(i = 0; i < options.count; i ++)
      for(j = 0; j < options.count; j ++) {
        common.cell = {
          i: i,
          j: j,
          x: j * cellSize,
          y: i * cellSize,
        };
        func();
      }
  }

  function prepareLogo(){
    // limit the logo size
    var logo = options.logo;
    var count = options.count;
    var context = common.context;
    var k, width, height, numberWidth, numberHeight;

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
      k += height + 'px ' + logo.fontFace;
      context.font = k;
      width = context.measureText(logo.text).width;
    }
    // otherwise do nothing
    else return;

    // calculate the number of cells to be broken or covered by the logo
    k = width / height;
    numberHeight = ~~ (Math.sqrt(Math.min(width * height / common.size / common.size, logo.size) / k) * count);
    numberWidth = ~~ (k * numberHeight);
    // (count - [numberWidth | numberHeight]) must be even if the logo is in the middle
    if ((count - numberWidth) % 2) numberWidth ++;
    if ((count - numberHeight) % 2) numberHeight ++;

    // calculate the final width and height of the logo
    k = Math.min((numberHeight * common.cellSize - 2 * logo.margin) / height, (numberWidth * common.cellSize - 2 * logo.margin) / width, 1);
    logo.width = ~~ (k * width);
    logo.height = ~~ (k * height);
    logo.x = ((common.size - logo.width) >> 1) - logo.margin;
    logo.y = ((common.size - logo.height) >> 1) - logo.margin;

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
      ctx.fillText(logo.text, logo.width >> 1 + logo.margin, logo.height >> 1 + logo.margin);
    }
    logo.edger = new Edger(logo.canvas, {margin: logo.margin, nobg: logo.clearEdges == 2});

    // whether to clear cells broken by the logo (incomplete cells)
    if(logo.clearEdges) {
      clear = new Uint8Array(options.count * options.count);
      for (var i = 0; i < options.count; i ++)
        for (var j = 0; j < options.count; j ++)
          clear[i * options.count + j] = logo.edger.isBackground(j * common.cellSize - logo.x, i * common.cellSize - logo.y, common.cellSize, common.cellSize);
    }
  }

  function clearLogo() {
    var logo = options.logo;
    var context = common.context;
    if((logo.image || logo.text) && !logo.clearEdges) {
      var canvas_logo_x = getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
      var ctx = canvas_logo_x.getContext('2d');
      ctx.fillStyle = colorLight;
      ctx.fillRect(0, 0, canvas_logo_x.width, canvas_logo_x.height);
      logo.edger.clearBackground(canvas_logo_x);
      context.drawImage(canvas_logo_x, logo.x, logo.y);
    }
  }

  /**
   * @desc Transform color to remove alpha channel
   */
  function transformColor(fg, bg, alpha) {
    return ~~ (fg * alpha / 255 + bg * (255 - alpha) / 255);
  }

  function transformAlpha() {
    var size = common.size;
    var context = common.context;
    var imageData = context.getImageData(0, 0, size, size);
    var total = size * size;
    for (var i = 0; i < total; i ++) {
      var offset = i * 4;
      var alpha = imageData.data[offset + 3];
      if (alpha < 255) {
        imageData.data[offset] = transformColor(imageData.data[offset], 255, alpha);
        imageData.data[offset + 1] = transformColor(imageData.data[offset + 1], 255, alpha);
        imageData.data[offset + 2] = transformColor(imageData.data[offset + 2], 255, alpha);
        imageData.data[offset + 3] = 255;
      }
    }
  }

  function drawForeground() {
    var size = common.size;
    var canvasFore = getCanvas(size, size);
    initCanvas(canvasFore, assign({}, common, {data: options.foreground}));
    var ctx = canvasFore.getContext('2d');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(common.canvasData, 0, 0);
    return canvasFore;
  }

  function draw() {
    // ensure size and cellSize are integers
    // so that there will not be gaps between cells
    common.cellSize = Math.ceil(options.cellSize);
    var size = common.size = common.cellSize * options.count;
    var canvasData = common.canvasData = getCanvas(size, size);
    var contextData = common.context = canvasData.getContext('2d');
    prepareLogo();
    drawCells();
    clearLogo();

    var fore = drawForeground();
    var canvas = getCanvas(size, size);
    initCanvas(canvas, assign({}, common, {data: options.background}));
    var context = canvas.getContext('2d');
    context.drawImage(fore, 0, 0);
    var logo = options.logo;
    if (logo.canvas) context.drawImage(logo.canvas, logo.x, logo.y);
    options.noAlpha && transformAlpha();
    common.context = null;

    var canvasTarget = options.reuseCanvas;
    if (canvasTarget) {
      canvasTarget.width = canvasTarget.height = options.size;
    } else if (size != options.size) {
      // strech image if the size is not expected
      canvasTarget = getCanvas(options.size, options.size);
    }
    if (canvasTarget) {
      var contextTarget = canvasTarget.getContext('2d');
      contextTarget.drawImage(canvas, 0, 0, options.size, options.size);
      canvas = canvasTarget;
    }

    return canvas;
  }

  var colorDark = 'black';
  var colorLight = 'white';
  var common = {};
  /**
   * Whether the cell is covered.
   * 0 - partially or completely covered.
   * 1 - clear.
   */
  var clear;
  return draw();
}

var defaults = {
  // typeNumber belongs to 1..10
  // will be increased to the smallest valid number if too small
  typeNumber: 1,

  // correctLevel can be 'L', 'M', 'Q' or 'H'
  correctLevel: 'M',

  // foreground and background may be an image or a style string
  // or an array of objects with attributes below:
  // * row | x: default 0
  // * col | y: default 0
  // * cols | width: default size
  // * rows | height: default size
  // * style: default 'black'
  foreground: 'black',
  background: null,

  // data MUST be a string
  data: '',

  // effect: {key: [round|liquid], value: 0-0.5}
  effect: {},

  // Remove alpha channel to make the image not transparent
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
  logo: {},
};

function getQRCode(_options) {
  var logo = {
    color: 'black',
    fontFace: 'Cursive',
    clearEdges: 0,
    margin: -1,
    size: .15,
  };
  var options = assign({}, defaults, _options, {
    logo: logo,
  });
  var _logo = _options.logo;
  if (_logo && (_logo.image || _logo.text)) assign(logo, _logo);
  // if a logo is to be added, correctLevel is set to H
  if (logo.image || logo.text) {
    options.correctLevel = 'H';
    if (logo.margin < 0) logo.margin = logo.image ? 0 : 2;
  }

  // Generate QRCode data with qrcode-light.js
  var qr = qrcode(options.typeNumber, options.correctLevel);
  qr.addData(options.data);
  qr.make();

  // calculate QRCode and cell sizes
  var count = qr.getModuleCount();
  // cellSize is used if assigned
  // otherwise size is used
  var cellSize = options.cellSize;
  var size = options.size;
  if (!cellSize && !size) cellSize = 2;
  if (cellSize) size = cellSize * count;
  else if (size) {
    size = options.size;
    cellSize = size / count;
  }
  return assign(options, {
    cellSize: cellSize,
    size: size,
    qr: qr,
    count: count,
  });
}

function QRCanvas(options) {
  return renderByCanvas(getQRCode(options));
}

/**
 * Common functions for JSQRGen
 * @author Gerald <gera2ld@163.com>
 * @license MIT
 */

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
 * @desc Initialize the canvas with given image or colors.
 * @param {Canvas} canvas The canvas to initialize.
 * @param {Object} options
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

function assign() {
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


  return {
    canvas: QRCanvas,
  };
});