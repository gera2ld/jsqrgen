(function($){
	$('#fimg').onchange=function(e){
		var f=e.target.files,r;
		if(f&&f[0]) {
			r=new FileReader();
			r.onload=function(e){
				$('#qrimg').src=e.target.result;
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
	var c=$('#cbimg'),q=$('#qrcanvas'),t=$('#cellEffect');
	c.onchange=function(e){
		this.parentNode.nextElementSibling.style.display=this.checked?'none':'';
	};
	q.onclick=function(e){
		if(e.target.tagName=='CANVAS') {
			var a=document.createElement('a');
			a.target='_blank';
			a.href=e.target.toDataURL();
			a.click();
		}
	};
	$('#qrgen').onclick=function(){
		var options,s=t.value/100;
		q.innerHTML='';
		options={
			cellSize:$('#cellSize').value,
			colorDark:getColor,
			colorLight:$('#colorBack').value,
			data:$('#qrtext').value,
		};
		if(!c.checked) options.image={
			dom:$('#qrimg'),
			clearEdges:$('#qrclearedges').checked,
		};
		if(s>=0)
			options.effect={key:'round',value:s};
		else
			options.effect={key:'liquid',value:-s};
		QRCanvas(options).appendTo(q);
	};
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
})(document.querySelector.bind(document));
