/*
 * Author: Gerald <gera2ld@163.com>
 */
window.qrcode=function(container,options) {
	function getColor(c,i,j) {
		return typeof c=='function'?c(n,i,j):c;
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
			i,j,canvas,qrcode,ctx,color,w,h,n;
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
	for(i=0;i<n;i++)
		for(j=0;j<n;j++) {
			color=qrcode.isDark(i,j)?colorDark:colorLight;
			ctx.fillStyle=getColor(color,i,j);
			w=Math.ceil((j+1)*tileWidth)-Math.floor(j*tileWidth);
			h=Math.ceil((i+1)*tileHeight)-Math.floor(i*tileHeight);
			ctx.fillRect(Math.round(j*tileWidth),Math.round(i*tileHeight),w,h);
		}
	if(image) {
		w=image.clientWidth;h=image.clientHeight;
		i=(width-w)/2;j=(height-h)/2;
		ctx.fillStyle=getColor(colorLight,-1,-1);
		ctx.fillRect(i-2,j-2,w+4,h+4);
		ctx.drawImage(image,i,j);
	}
	container.appendChild(canvas);
};
