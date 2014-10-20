JS QRCode
===

This is a QRCode generator written in pure javascript, without any dependencies. (jQuery is not needed, either.)

Based on [Kazuhiko Arase's QRCode](http://www.d-project.com/).

However, the generation is on a `canvas`, so the only requirement is that the browser works with a `canvas`.

Usage
---
After the main script (`jsqrcode.min.js`) is loaded, there will be a global function named `qrcode`.

Here is an example:

``` html
<script type=text/javascript src=jsqrcode.min.js></script>
<div id=qrcode></div>
<script>
window.qrcode(document.getElement('qrcode'),{
	text:location.href
});
</script>
```

Document
---
*function* qrcode(*element*, *options*)

* *element* is a DOM element to show the result canvas with an `appendChild` to it.
* *options* is an object with or without the attributes below (all attributes are optional):
	* *data*  
	  the **raw** data to be encoded in the QRCode.
	* *text* (Deprecated)  
	  if *data* is null, *text* will be checked for a compatible reason. If *text* is unicode, it should be encoded first.
	* *tileWidth*  
	  the pixel width of a tile.
	* *tileHeight*  
	  the pixel height of a tile.
	* *width*  
	  the pixel width of the whole image, ignored if *tileWidth* is assigned.
	* *height*  
	  the pixel height of the whole image, ignored if *tileHeight* is assigned.
	* *typeNumber*  
	  type number of the QRCode, default as -1.
	* *correctLevel*  
	  correct level of QRCode, default as *High level (30%)*.
	* *colorDark* \*  
	  the background color of a tile when it is dark, default as *black*.
	* *colorLight* \*  
	  the background color of a tile when it is not dark, default as *white*.
	* *image*  
	  an `img` element with a picture which is going to be shown in the middle of the QRCode canvas.
	* *radius*  
	  a ratio between 0 and 0.5, making tiles round with a border-radius of *radius* \* `tileWidth/tileHeight`.

\* Both *colorDark* and *colorLight* can be a callable function, which will return a color, with *count_of_tiles_per_line*, *row_id*, *column_id* as the arguments, so that you may use different colors in different positions to make a characteristic QRCode.
