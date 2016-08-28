!function () {
  !function () {
    // function shimDataset() {
    //   // IE 10- does not support dataset
    //   var datasets = [];
    //   Object.defineProperty(HTMLElement.prototype, 'dataset', {
    //     get: function () {
    //       var dataset, ele = this;
    //       forEach(datasets, function (item) {
    //         if (item.ele === ele) {
    //           dataset = item.dataset;
    //           return false;
    //         }
    //       });
    //       if (!dataset) {
    //         dataset = {};
    //         datasets.push({ele: ele, dataset: dataset});
    //         forEach(ele.attributes, function (attr) {
    //           var name = attr.name;
    //           if (/^data-/.test(name)) {
    //             name = name.slice(5).replace(/-(\w)/g, function (m, g) {
    //               return g.toUpperCase();
    //             });
    //             dataset[name] = attr.value;
    //           }
    //         });
    //       }
    //       return dataset;
    //     },
    //   });
    // }
    function shimClassList() {
      // IE 9- does not support classList
      function ClassList(ele) {
        this.ele = ele;
        this.add = this._add.bind(this);
        this.remove = this._remove.bind(this);
      }
      ClassList.prototype = {
        _get: function () {
          return this.ele.className.trim().split(/\s+/);
        },
        _set: function (list) {
          this.ele.className = list.join(' ');
        },
        _add: function (cls) {
          var list = this._get();
          var i = list.indexOf(cls);
          if (i < 0) list.push(cls);
          this._set(list);
        },
        _remove: function (cls) {
          var list = this._get();
          var i = list.indexOf(cls);
          if (~i) list.splice(i, 1);
          this._set(list);
        },
      };
      var classLists = [];
      Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function () {
          var classList, ele = this;
          forEach(classLists, function (item) {
            if (item.ele === ele) {
              classList = item.classList;
              return false;
            }
          });
          if (!classList) {
            classList = new ClassList(ele);
            classLists.push({ele: ele, classList: classList});
          }
          return classList;
        },
      });
    }
    // if (!document.body.dataset) shimDataset();
    if (!document.body.classList) shimClassList();
  }();

  function $(selector) {
    return document.querySelector(selector);
  }
  function forEach(arr, cb) {
    for (var i = 0; i < arr.length; i ++)
      if (cb.call(arr, arr[i], i) === false) break;
  }
  function setLogoType(el) {
    if (logoTab.head) logoTab.head.classList.remove('active');
    logoTab.head = el;
    logoTab.type = el.getAttribute('data-type');
    el.classList.add('active');
    forEach(logoTabs, function (el) {
      el.classList[el.getAttribute('data-type') === logoTab.type ? 'add' : 'remove']('active');
    });
  }

  var logoTabs = document.querySelectorAll('.logo-body>.tab');
  var logoHeader = $('.logo-header');
  var cbLogo = $('#cblogo');
  var logoImg = $('#logoImg');
  var logoTab = {};
  setLogoType($('.logo-header>[data-type]'));
  $('#cellEffectStops').addEventListener('click', function (e) {
    var d = e.target.getAttribute('data-key');
    if (d) {
      e.preventDefault();
      switch (d) {
        case 's':
          t.value = 0;
          break;
        case 'l':
          t.value = -50;
          break;
        case 'r':
          t.value = 50;
          break;
      }
    }
  }, false);
  logoHeader.addEventListener('click', function (e) {
    var type = e.target.getAttribute('data-type');
    if (type) setLogoType(e.target);
  }, false);

  $('#fimg').addEventListener('change', function (e) {
    var reader = new FileReader;
    reader.onload = function () {
      logoImg.src = this.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }, false);

  var q = $('#qrcanvas');
  var t = $('#cellEffect');
  var canvas;
  $('#qrgen').onclick = function () {
    var s = t.value / 100;
    var colorIn = $('#colorIn').value;
    var colorOut = $('#colorOut').value;
    var colorFore = $('#colorFore').value;
    var colorBack = $('#colorBack').value;
    var options = {
      cellSize: Number($('#cellSize').value),
      foreground: [
        // foreground color
        {style: colorFore},
        // outer squares of the positioner
        {row: 0, rows: 7, col: 0, cols: 7, style: colorOut},
        {row: -7, rows: 7, col: 0, cols: 7, style: colorOut},
        {row: 0, rows: 7, col: -7, cols: 7, style: colorOut},
        // inner squares of the positioner
        {row: 2, rows: 3, col: 2, cols: 3, style: colorIn},
        {row: -5, rows: 3, col: 2, cols: 3, style: colorIn},
        {row: 2, rows: 3, col: -5, cols: 3, style: colorIn},
      ],
      background: colorBack,
      data: $('#qrtext').value,
      typeNumber: Number($('#typeNumber').value),
    };
    //q.innerHTML='';
    if (cbLogo.checked) {
      options.logo = {
        clearEdges: Number($('#qrclearedges').value),
        size: $('#logoSize').value / 100,
        margin: Number($('#logoMargin').value),
      };
      if (logoTab.type == 'image')
        options.logo.image = logoImg;
      else {
        options.logo.text = $('#logoText').value;
        var font = $('#logoFont').value;
        if (font) options.logo.fontFace = font;
        options.logo.color = $('#logoColor').value;
        var style = '';
        if ($('#logoItalic').checked) style += 'italic ';
        if ($('#logoBold').checked) style += 'bold ';
        options.logo.fontStyle = style;
      }
    }
    if (s >= 0)
      options.effect = {key: 'round', value: s};
    else
      options.effect = {key: 'liquid', value: -s};
    options.reuseCanvas = canvas;
    canvas = qrgen.canvas(options);
    q.appendChild(canvas);
  };
}();
