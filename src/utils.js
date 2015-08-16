/**
 * Common functions for JSQRGen
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

function extend(dict1, dict2) {
	for(var key in dict2)
    dict1[key] = dict2[key];
}
