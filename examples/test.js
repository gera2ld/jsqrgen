(function($){
	function switchLogoType(){
		var type=logoType.getAttribute('data');
		Array.prototype.forEach.call(logoTabs.querySelectorAll('.tab'),function(ele){
			if(ele.getAttribute('data')==type) ele.classList.remove('hide');
			else ele.classList.add('hide');
		});
	}
	function toggleLogo(){
		if(cbLogo.checked) {
			logoTabs.classList.remove('hide');
			logoOptions.classList.remove('hide');
			switchLogoType();
		} else {
			logoTabs.classList.add('hide');
			logoOptions.classList.add('hide');
		}
	}
	function updateLogoType(ele){
		if(logoType) logoType.classList.remove('active');
		logoType=ele;
		logoType.classList.add('active');
		switchLogoType();
	}

	var logoTabs=$('#logoTabs'),logoOptions=$('#logoOptions'),
	cbLogo=$('#cblogo'),logoType=null,logoImg=$('#logoImg');
	updateLogoType($('#logoOptions>*[data]'));
	cbLogo.onchange=toggleLogo;
	$('#cellEffectStops').onclick=function(e){
		var d=e.target.getAttribute('data');
		if(d) {
			e.preventDefault();
			switch(d) {
				case 's':
					t.value=0;break;
				case 'l':
					t.value=-50;break;
				case 'r':
					t.value=50;break;
			}
		}
	};
	logoOptions.addEventListener('click', function(e){
		var data=e.target.getAttribute('data');
		if(data) updateLogoType(e.target);
	}, false);
	toggleLogo();

	$('#fimg').onchange=function(e){
		var f=e.target.files,r;
		if(f&&f[0]) {
			r=new FileReader();
			r.onload=function(e){
				logoImg.src=e.target.result;
			};
			r.readAsDataURL(f[0]);
		}
	};
	function getColor(n,i,j) {
		var li=n-i-1,lj=n-j-1;
		if(i>1&&i<5&&j>1&&j<5
			||i>1&&i<5&&lj>1&&lj<5
			||li>1&&li<5&&j>1&&j<5) return $('#colorIn').value;
		else if(i<7&&j<7||i<7&&lj<7||li<7&&j<7) return $('#colorOut').value;
		else return $('#colorFore').value;
	}
	var q=$('#qrcanvas'),t=$('#cellEffect');
	$('#qrgen').onclick=function(){
		var options,s=t.value/100;
		q.innerHTML='';
		options={
			cellSize:$('#cellSize').value,
			colorDark:getColor,
			colorLight:$('#colorBack').value,
			data:$('#qrtext').value,
		};
		if(cbLogo.checked) {
			options.logo={
				clearEdges:$('#qrclearedges').checked,
				size:$('#logoSize').value/100,
			};
			if(logoType.getAttribute('data')=='image')
				options.logo.image=logoImg;
			else {
				options.logo.text=$('#logoText').value;
				var font=$('#logoFont').value;
				if(font) options.logo.fontFace=font;
				options.logo.color=$('#logoColor').value;
				var style='';
				if($('#logoItalic').checked) style+='italic ';
				if($('#logoBold').checked) style+='bold ';
				options.logo.fontStyle=style;
			}
		}
		if(s>=0)
			options.effect={key:'round',value:s};
		else
			options.effect={key:'liquid',value:-s};
		QRCanvas(options).appendTo(q);
	};
})(document.querySelector.bind(document));
