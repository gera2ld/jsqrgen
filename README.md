JS QRGen
===

![Bower](https://img.shields.io/bower/v/jsqrgen.svg)

This is a QRCode generator written in pure javascript, without any dependencies. (jQuery is not needed, either.)

Based on [Kazuhiko Arase's QRCode](http://www.d-project.com/).

The only requirement is that the browser works with a `canvas`, which is supported by most modern browsers.

Usage
---
Install with bower:

``` sh
$ bower install jsqrgen
```

You may also download `dist/qrgen.min.js` manually.

Here is a simple example:

``` html
<script src="qrgen.min.js"></script>
<div id="qrcode"></div>
<script>
var qrc=QRCanvas({
        data:location.href
});
qrc.appendTo(document.getElementById('qrcode'));
</script>
```

Check [examples](examples) folder for more advanced examples.

[中文说明](http://geraldl.net/it/qrgen) [测试页面](http://geraldl.net/js/qrgen-test)

Document
---
* *function* QRCanvas(*options*)  
  This is a function to build a QRCanvas object with a QRCode and a canvas built inside.
  * `options` is an object with or without the attributes below (all attributes are optional):
    * `data`  
      The data to be encoded in the QRCode, text will be encoded in UTF-8.
    * `cellSize` \*  
      The pixel width or height of a cell.
    * `size` \*  
      The pixel width or height of the entire image, ignored if *cellSize* is assigned.
    * `typeNumber`  
      The type number of the QRCode, may be one of `1..10`. If less than `1`, the smallest valid type number will be found.
    * `correctLevel`  
      The correct level of QRCode, should be one of `['L','M','Q','H']`, default as `M`.
      When `logo` is assigned, `correctLevel` will be set to `H`.
    * `colorDark` \*\*  
      The background color of a cell when it is dark, default as `black`.
    * `colorLight` \*\*  
      The background color of a cell when it is not dark, default as `white`.
    * `logo`  
      An object with attributes listed below (all optional):
      * If the logo is an Image, attributes below should be included:
        * `image`  
           An *Image* element with the image to be drawn in the middle of the canvas.
      * If the logo is text, attributes below may be included:
        * `text`  
          The text to be drawn as logo.
        * `color`  
          Logo text color, default as `black`.
        * `fontStyle`  
          Logo text style, e.g. `italic bold`.
        * `fontFace`  
          Logo text font face, default as `Cursive`.
      * Below are the common attributes:
        * `clearEdges`  
          A boolean to decide whether to clear the cells broken by the image, default as `true`.
        * `margin`  
          The pixel gap between the image and the QRCode cells around it, default as `2`.
        * `size`  
          A float stands for the ratio of logo size to the QRCode size, default as `.15`, which is recommended.
    * `effect`  
      An object with a *key* attribute to choose an effect, and *value* attribute as a parameter.
      *key* can be `null` or one of the items below:
      * `round`  
        *value* is a ratio between 0 and 0.5, making cells round with a border-radius of *value* * `cellSize`.
      * `liquid`  
        *value* is a ratio between 0 and 0.5.

The returned object has methods below:
* *function* appendTo(*ele*)  
  Append the `canvas` to *ele*, works the same as `ele.appendChild(the_canvas)`.

\* It is highly recommended to use `cellSize` instead of `size` because when `size` is assigned and the calculated `cellSize` is not an integer, then the final image may be stretched and thus blurred.

\*\* Both `colorDark` and `colorLight` can be a callable function, with `size_of_qrcode, row_id, column_id` as the arguments. A CSS color is returned, so different colors may be used in different positions to make a characteristic QRCode.

Known Issues
---
Opera 12 (Presto) has problems with `canvas.arcTo`, so effects will probably fail.
