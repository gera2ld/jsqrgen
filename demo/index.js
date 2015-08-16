(function ($) {
  function forEach(arr, cb) {
    for (var i = 0; i < arr.length; i ++)
      cb.call(arr, arr[i], i);
  }
	function updateLogoTab() {
		forEach(logoTabs, function (ele) {
      ele.classList[ele.dataset.type === logoTab.type ? 'remove' : 'add']('hide');
		});
	}
	function toggleLogo() {
		if (cbLogo.checked) {
			logoWrap.classList.remove('hide');
			logoOptions.classList.remove('hide');
			updateLogoTab();
		} else {
			logoWrap.classList.add('hide');
			logoOptions.classList.add('hide');
		}
	}
	function updateLogoType(ele) {
		if (logoTab.head) logoTab.head.classList.remove('active');
		logoTab.head = ele;
    logoTab.type = ele.dataset.type;
		ele.classList.add('active');
		updateLogoTab();
	}

	var logoWrap = $('#logoWrap');
  var logoTabs = logoWrap.querySelectorAll('.tab');
  var logoOptions = $('#logoOptions');
	var cbLogo = $('#cblogo');
  var logoImg = $('#logoImg');
  var logoTab = {};
  updateLogoType($('#logoOptions>[data-type]'));
	cbLogo.onchange = toggleLogo;
	$('#cellEffectStops').addEventListener('click', function (e) {
		var d = e.target.dataset.key;
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
	logoOptions.addEventListener('click', function (e) {
		var type = e.target.dataset.type;
		if (type) updateLogoType(e.target);
	}, false);
	toggleLogo();

	$('#fimg').addEventListener('change', function (e) {
    var reader = new FileReader;
    reader.onload = function () {
      logoImg.src = this.result;
    };
    reader.readAsDataURL(e.target.files[0]);
	}, false);

	function getColor(n, i, j) {
		var li = n - i - 1;
    var lj = n - j - 1;
		if (
      i > 1 && i < 5 && j > 1 && j < 5
			|| i > 1 && i < 5 && lj > 1 && lj < 5
			|| li > 1 && li < 5 && j > 1 && j < 5
    ) return $('#colorIn').value;
		else if (i<7 && j<7 || i < 7 && lj<7 || li < 7 && j < 7)
      return $('#colorOut').value;
		else
      return $('#colorFore').value;
	}
	var q = $('#qrcanvas');
  var t = $('#cellEffect');
	$('#qrgen').onclick = function () {
		var s = t.value / 100;
		var options={
			cellSize: Number($('#cellSize').value),
			colorDark: getColor,
			colorLight: $('#colorBack').value,
			data: $('#qrtext').value,
      typeNumber: Number($('#typeNumber').value),
		};
		q.innerHTML='';
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
		QRCanvas(options).appendTo(q);
	};
})(document.querySelector.bind(document));
