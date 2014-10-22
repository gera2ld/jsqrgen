JS QRCode
===

This is a QRCode generator written in pure javascript, without any dependencies. (jQuery is not needed, either.)

Based on [Kazuhiko Arase's QRCode](http://www.d-project.com/).

The generation is on a `canvas`, so the only requirement is that the browser works with a `canvas`, which is supported by most modern browsers.

Usage
---
Here is a simple example:

``` html
<script type=text/javascript src=qrgen.min.js></script>
<div id=qrcode></div>
<script>
window.appendQRCode(document.getElement('qrcode'),{
	data:location.href
});
</script>
```

A more advanced example may be found in the test page.

For more details, please read the document below.

Document
---

###Functions

*function* QRCanvas(*options*)

	This is called to build a QRCanvas object with a QRCode and a canvas built inside.

	* *options* is an object with or without the attributes below (all attributes are optional):
		* *data*  
			The **raw** data to be encoded in the QRCode, text should be encoded before calling.
		* *tileWidth*  
			The pixel width of a tile.
		* *tileHeight*  
			The pixel height of a tile.
		* *width*  
			The pixel width of the whole image, ignored if *tileWidth* is assigned.
		* *height*  
			The pixel height of the whole image, ignored if *tileHeight* is assigned.
		* *typeNumber*  
			The type number of the QRCode, default as `-1`.
		* *correctLevel*  
			The correct level of QRCode, default as `QRErrorCorrectLevel.H`.  
		* *colorDark* \*  
			The background color of a tile when it is dark, default as `black`.
		* *colorLight* \*  
			The background color of a tile when it is not dark, default as `white`.
		* *image*  
			An object with `dom` attribute as an `img` element to be shown in the middle of the canvas
			and optional `clearEdges` to choose whether to clear the tiles broken by the image.
		* *method*  
			An object with a `key` attribute to choose a drawing method, and `value` as a parameter.

			`key` can be one of:

			* `tile`  
				This is also the default choice when no valid key is assigned.  
				In this case, `value` is a ratio between 0 and 0.5, making tiles round with a border-radius of `value * [tileWidth|tileHeight]`.

	\* Both *colorDark* and *colorLight* can be a callable function, which will return a color, with `size_of_qrcode, row_id, column_id` as the arguments, so that you may use different colors in different positions to make a characteristic QRCode.

*function* appendQRCode(*element*, *options*)
	* *element* is a DOM element to append the result canvas with an `appendChild` method.
	* *options* is used to build a QRCanvas

###Constants

*QRErrorCorrectLevel*

	* L : 1
	* M : 0
	* Q : 3
	* H : 2
