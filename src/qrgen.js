/*
 * Author: Gerald <gera2ld@163.com>
 */
window.qrcode=function(container,options) {
	function getColor(c,i,j) {
		return typeof c=='function'?c(n,i,j):c;
	}
	function fillTile(i,j) {
		function fillArc(rr) {
			var r=rr*w;
			ctx.beginPath();
			ctx.moveTo(x+rr*w,y);
			ctx.lineTo(x+(1-rr)*w,y);
			ctx.arcTo(x+w,y,x+w,y+rr*h,r);
			ctx.lineTo(x+w,y+(1-rr)*h);
			ctx.arcTo(x+w,y+h,x+(1-rr)*w,y+h,r);
			ctx.lineTo(x+rr*w,y+h);
			ctx.arcTo(x,y+h,x,y+(1-rr)*h,r);
			ctx.lineTo(x,y+rr*h);
			ctx.arcTo(x,y,x+rr*w,y,r);
			ctx.closePath();
			ctx.fill();
		}
		function fillRect() {
			ctx.fillRect(x,y,w,h);
		}
		var x=Math.round(j*tileWidth),y=Math.round(i*tileHeight),
				w=Math.ceil((j+1)*tileWidth)-Math.floor(j*tileWidth),
				h=Math.ceil((i+1)*tileHeight)-Math.floor(i*tileHeight);
		color=qrcode.isDark(i,j)?colorDark:colorLight;
		ctx.fillStyle=getColor(color,i,j);
		if(radius) fillArc(radius);
		else fillRect();
	}
	var tileWidth=options.tileWidth,
			tileHeight=options.tileHeight,
			width=options.width||256,
			height=options.height||256,
			typeNumber=options.typeNumber||-1,
			correctLevel=options.correctLevel||QRErrorCorrectLevel.H,
			colorDark=options.colorDark||'black',
			colorLight=options.colorLight||'white',
			text=options.text||'',
			image=options.image,
			radius=options.radius,
			i,j,canvas,qrcode,ctx,color,w,h,n;
	if(radius<0||radius>.5) radius=0;
	qrcode=new QRCode(typeNumber,correctLevel);
	qrcode.addData(text);
	qrcode.make();
	canvas=document.createElement('canvas');
	n=qrcode.getModuleCount();
	if(tileWidth) width=tileWidth*n;
	else tileWidth=width/n;
	if(tileHeight) height=tileHeight*n;
	else tileHeight=height/n;
	canvas.width=width;
	canvas.height=height;
	ctx=canvas.getContext('2d');
	ctx.fillStyle=getColor(colorLight,-1,-1);
	ctx.fillRect(0,0,width,height);
	for(i=0;i<n;i++)
		for(j=0;j<n;j++) fillTile(i,j);
	if(image) {
		w=image.clientWidth;if(w/width>.3) w=width*.3;
		h=image.clientHeight;if(h/height>.3) h=height*.3;
		i=(width-w)/2;j=(height-h)/2;
		ctx.fillStyle=getColor(colorLight,-1,-1);
		ctx.fillRect(i-2,j-2,w+4,h+4);
		ctx.drawImage(image,i,j,w,h);
	}
	container.appendChild(canvas);
};
