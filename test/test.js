(function($){
/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/
function utf8Encode(string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";
	for (var n = 0; n < string.length; n++) {
		var c = string.charCodeAt(n);
		if (c < 128) {
			utftext += String.fromCharCode(c);
		}
		else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}
	}
	return utftext;
}

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
			data:utf8Encode($('#qrtext').value),
			radius:$('#tileRadius').value,
		});
	};
})(document.querySelector.bind(document));
