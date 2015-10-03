JS QRGen
########

.. image:: https://img.shields.io/bower/v/jsqrgen.svg
    :alt: Bower

This is a QRCode generator written in pure javascript, without any dependencies. (jQuery is not needed, either.)

Based on `Kazuhiko Arase's QRCode <http://www.d-project.com/>`__ .

The only requirement is that the browser works with a :code:`canvas`, which is supported by most modern browsers.

Usage
-----
Install with bower:

.. code-block:: sh

    $ bower install jsqrgen

You may also download `dist/qrgen.min.js` manually.

Here is a simple example:

.. code-block:: html

    <script src="qrgen.min.js"></script>
    <div id="qrcode"></div>
    <script>
    var canvas = qrgen.canvas({
            data: location.href
    });
    document.getElementById('qrcode').appendChild(canvas);
    </script>

Check `demo <demo>`__ folder for more advanced examples.

`中文说明 <http://gerald.top/code/qrgen>`__ `测试页面 <http://gerald.top/code/qrgen-test>`__

Documentation
-------------
There will be a global variable :code:`qrgen` with methods below:

- *function* qrgen.canvas( *options* )

  This is a function to build a QRCode and render it to a canvas.

  *options* is an object with attributes below (all attributes are optional):

  .. list-table::

     * - Attribute
       - Type
       - Default
       - Description
     * - :code:`data`
       - String
       - ''
       - The data to be encoded in the QRCode, text will be encoded in UTF-8.
     * - :code:`cellSize` [#size]_
       - Number
       - 2
       - The pixel width or height of a cell. Default value is used only if neither `cellSize` nor `size` is provided.
     * - :code:`size` [#size]_
       - Number
       - None
       - The pixel width or height of the entire image, ignored if *cellSize* is assigned.
     * - :code:`typeNumber`
       - Number [1..10]
       - Auto
       - The type number of the QRCode. If too small to contain the data, the smallest valid type number will be used instead.
     * - :code:`correctLevel`
       - String {'L', 'M', 'Q', 'H'}
       - 'M'
       - The correct level of QRCode. When `logo` is assigned, `correctLevel` will be set to `H`.
     * - :code:`foreground` [#color]_
       - Image | Canvas | String | Array
       - 'black'
       - The foreground color or image of the QRCode.
     * - :code:`background` [#color]_
       - Image | Canvas | String | Array
       - 'white'
       - The background color or image of the QRCode.
     * - :code:`logo`
       - Object
       - {}
       - The object may have attributes below (all optional):

         if image:

         - :code:`image`: An *Image* element with the image to be drawn in the middle of the canvas.

         if text:

         - :code:`text`: The text to be drawn as logo.
         - :code:`color`: Logo text color, default as `black`.
         - :code:`fontStyle`: Logo text style, e.g. `italic bold`.
         - :code:`fontFace`: Logo text font face, default as `Cursive`.

         common attributes:

         - :code:`clearEdges`: A number to decide the level to clear the cells broken by the image, default as `0`.
         - :code:`margin`: The pixel gap between the image and the QRCode cells around it, default as `2`.
         - :code:`size`: A float stands for the ratio of logo size to the QRCode size, default as `.15`, which is recommended.

     * - :code:`effect`
       - Object
       - {}
       - The object may have two attributes: :code:`key` and :code:`value`.

         - :code:`effect.key = 'round'`

           :code:`effect.value` is a ratio between 0 and 0.5, making cells round with a border-radius of `value` * `cellSize`.

         - :code:`effect.key = 'liquid'`

           :code:`effect.value` is a ratio between 0 and 0.5.

  A canvas will be returned.

.. [#size] It is highly recommended to use :code:`cellSize` instead of :code:`size` because when :code:`size` is assigned and the calculated :code:`cellSize` is not an integer, the final image may be stretched and thus blurred.

.. [#color] Both :code:`foreground` and :code:`background` can be an image (Image or Canvas), a string of CSS color, or an array of objects with attributes below:

   .. list-table::

      * - Attribute
        - Type
        - Default
        - Description
      * - :code:`col`
        - Number
        - Use :code:`x` instead
        - Column index of the start position.
      * - :code:`row`
        - Number
        - Use :code:`y` instead
        - Row index of the start position.
      * - :code:`cols`
        - Number
        - Use :code:`width` instead
        - Number of columns involved in current style.
      * - :code:`rows`
        - Number
        - Use :code:`height` instead
        - Number of rows involved in current style.
      * - :code:`x`
        - Number
        - 0
        - X of start position.
      * - :code:`y`
        - Number
        - 0
        - Y of start position.
      * - :code:`width`
        - Number
        - Full width
        - Width of block involved in current style.
      * - :code:`height`
        - Number
        - Full height
        - Height of block involved in current style.
      * - :code:`style`
        - String
        - 'black'
        - CSS style to fill the area defined by other attributes.

Known Issues
------------
Opera 12 (Presto) has problems with :code:`canvas.arcTo`, so effects will probably fail.
