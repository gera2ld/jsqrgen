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
	var cF=$('#colorFore').value,
			cB=$('#colorBack').value,
			cO=$('#colorOut').value,
			cI=$('#colorIn').value;
	function getColor(n,i,j) {
		var li=n-i-1,lj=n-j-1;
		if(i>1&&i<5&&j>1&&j<5
			||i>1&&i<5&&lj>1&&lj<5
			||li>1&&li<5&&j>1&&j<5) return cI;
		else if(i<7&&j<7||i<7&&lj<7||li<7&&j<7) return cO;
		else return cF;
	}
	$('#qrgen').onclick=function(){
		var q=$('#qrcode'),s=$('#tileSize').value;
		q.innerHTML='';
		qrcode(q,{
			tileWidth:s,
			tileHeight:s,
			colorDark:getColor,
			colorLight:cB,
			image:$('#qrimg'),
			text:$('#qrtext').value,
		});
	};
})(document.querySelector.bind(document));
