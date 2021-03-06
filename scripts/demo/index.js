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
      function getClassList(el) {
        function get() {
          return el.className.trim().split(/\s+/);
        }
        function set(list) {
          el.className = list.join(' ');
        }
        function add() {
          var list = get();
          forEach(arguments, function (arg) {
            list.indexOf(arg) < 0 && list.push(arg);
          });
          set(list);
        }
        function remove() {
          var list = get();
          forEach(arguments, function (arg) {
            var i = list.indexOf(arg);
            if (~i) list.splice(i, 1);
          });
          set(list);
        }
        return {
          add: add,
          remove: remove,
        };
      }
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
            classList = getClassList(ele);
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
  function showImage(img, file) {
    if (!file) return;
    var reader = new FileReader;
    reader.onload = function () {
      img.src = this.result;
    };
    reader.readAsDataURL(file);
  }

  var logoTabs = document.querySelectorAll('.logo-body>.tab');
  var logoHeader = $('.logo-header');
  var cbLogo = $('#cblogo');
  var logoImg = $('#logoImg');
  var effectImg = $('#effect-img');
  var logoTab = {};
  setLogoType($('.logo-header>[data-type]'));
  logoHeader.addEventListener('click', function (e) {
    var type = e.target.getAttribute('data-type');
    if (type) setLogoType(e.target);
  }, false);

  $('#fimg').addEventListener('change', function (e) {
    showImage(logoImg, e.target.files[0]);
  }, false);
  $('#effect-file').addEventListener('change', function (e) {
    showImage(effectImg, e.target.files[0]);
  }, false);

  var q = $('#qrcanvas');
  var canvas;
  $('#qrgen').onclick = function () {
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
    var effect = $('[name=effect-type]:checked').value;
    if (effect !== 'none') {
      options.effect = {key: effect, value: $('#effect-value').value / 100};
      if (effect === 'image') {
        options.background = [colorBack, effectImg];
      }
    }
    options.reuseCanvas = canvas;
    canvas = qrgen.canvas(options);
    q.appendChild(canvas);
  };
}();
