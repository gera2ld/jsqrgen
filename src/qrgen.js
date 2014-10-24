/*
 * Author: Gerald <gera2ld@163.com>
 */
function setDefaults(dict,defaults) {
	for(i in defaults) if(!(i in dict)) {
		dict[i]=defaults[i];
	}
}
function QRCanvas(options) {
	var t=this;
	// options
	t.tileSize=options.tileSize||options.tileWidth||options.tileHeight;
	t.size=options.size||options.width||options.height||256;
	t.typeNumber=options.typeNumber||-1;
	// correctLevel can be 'L', 'M', 'Q' or 'H'
	t.correctLevel=QRErrorCorrectLevel[options.correctLevel]||QRErrorCorrectLevel.H;
	t.colorDark=options.colorDark||'black';
	t.colorLight=options.colorLight||'white';
	t.data=options.data||'';
	// image: {dom: <img> object, clearEdges: bool}
	t.image=options.image||{};
	if(t.image.tagName) t.image={dom:t.image};
	setDefaults(t.image,{clearEdges:true});
	// effect: {key: [round|liquid], value: 0}
	t.effect=options.effect||{};
	t.make();
}
QRCanvas.prototype={
	make:function() {
		var t=this;
		// if an image is to be added, correctLevel is set to H
		if(t.image.dom) t.correctLevel=QRErrorCorrectLevel.H;
		t.qrcode=new QRCode(t.typeNumber,t.correctLevel);
		t.qrcode.addData(t.data);
		t.qrcode.make();
		// calculate QRCode and tile sizes
		t.count=t.qrcode.getModuleCount();
		// tileSize is used if assigned
		// otherwise size is used
		if(t.tileSize) t.size=t.tileSize*t.count;
		else t.tileSize=t.size/t.count;
		// prepare image before drawing
		t.prepareImage();
		// make canvas
		t.canvas=document.createElement('canvas');
		t.canvas.width=t.canvas.height=t.size;
		t.context=t.canvas.getContext('2d');
		t.draw();
	},
	getColor:function(color,row,col) {
		return typeof color=='function'?color(this.count,row,col):color;
	},
	getTile:function(row,col) {
		var t=this;
		return {
			row:row,
			col:col,
			x:Math.round(col*t.tileSize),
			y:Math.round(row*t.tileSize),
			// width and height are calculated to avoid small gaps
			width:Math.ceil((col+1)*t.tileSize)-Math.floor(col*t.tileSize),
			height:Math.ceil((row+1)*t.tileSize)-Math.floor(row*t.tileSize),
		};
	},
	findTile:function(x,y) {
		var t=this;
		return {
			row:Math.floor(y/t.tileSize),
			col:Math.floor(x/t.tileSize),
		};
	},
	prepareImage:function() {
		var i=.3,j,t=this,image=t.image.dom,tile1,tile2;
		if(image) {
			// limit the image size
			j=image.clientWidth;
			if(j/t.size>i) j=t.size*i;
			t.image.width=j;
			j=image.clientHeight;
			if(j/t.size>i) j=t.size*i;
			t.image.height=j;
			t.image.x=(t.size-t.image.width)/2;
			t.image.y=(t.size-t.image.height)/2;
			t.image.outX=t.image.x-2;
			t.image.outY=t.image.y-2;
			t.image.outWidth=t.image.width+4;
			t.image.outHeight=t.image.height+4;
			// clear tiles broken by the image so that there will not be partial tiles
			if(t.image.clearEdges) {
				tile1=t.findTile(t.image.outX,t.image.outY);
				tile2=t.findTile(t.image.outX+t.image.outWidth,t.image.outY+t.image.outHeight);
				for(i=tile1.row;i<=tile2.row;i++)
					for(j=tile1.col;j<=tile2.col;j++) t.qrcode.modules[i][j]=0;
			}
		}
	},
	drawImage:function() {
		var t=this,image=t.image.dom;
		if(image) {
			if(!t.image.clearEdges) {
				t.context.fillStyle=t.getColor(t.colorLight,-1,-1);
				t.context.fillRect(t.image.outX,t.image.outY,t.image.outWidth,t.image.outHeight);
			}
			t.context.drawImage(t.image.dom,t.image.x,t.image.y,t.image.width,t.image.height);
		}
	},
	isDark:function(i,j) {
		var t=this;
		return i>=0&&i<t.count&&j>=0&&j<t.count?t.qrcode.isDark(i,j):false;
	},
	draw:function() {
		function drawCorner(xc,yc,x,y,r) {
			if(r) ctx.arcTo(xc,yc,x,y,r);
			else {
				ctx.lineTo(xc,yc);
				ctx.lineTo(x,y);
			}
		}
		function drawRound(r) {
			function fillTile(i,j) {
				var tile=t.getTile(i,j),w=tile.width,h=tile.height,x=tile.x,y=tile.y,
						colorDark=t.getColor(t.colorDark,i,j),colorLight=t.getColor(t.colorLight,i,j);
				if(r) {	// fill arc with border-radius=r
					// clear tile
					ctx.fillStyle=colorLight;
					ctx.fillRect(x,y,w,h);
					// draw tile if it should be dark
					if(t.isDark(i,j)) {
						ctx.fillStyle=colorDark;
						ctx.beginPath();
						ctx.moveTo(x+.5*w,y);
						drawCorner(x+w,y,x+w,y+.5*h,r);
						drawCorner(x+w,y+h,x+.5*w,y+h,r);
						drawCorner(x,y+h,x,y+.5*h,r);
						drawCorner(x,y,x+.5*w,y,r);
						ctx.closePath();
						ctx.fill();
					}
				} else {	// fill rect
					// tile will be filled with colorDark so no need to clear
					ctx.fillStyle=colorDark;
					ctx.fillRect(x,y,w,h);
				}
			}
			var i,j;
			for(i=0;i<t.count;i++)
				for(j=0;j<t.count;j++) fillTile(i,j);
		}
		function fillCorner(xs,ys,xc,yc,xd,yd,r) {
			ctx.beginPath();
			ctx.moveTo(xs,ys);
			drawCorner(xc,yc,xd,yd,r);
			ctx.lineTo(xc,yc);
			ctx.lineTo(xs,ys);
			ctx.closePath();
			ctx.fill();
		}
		function drawLiquid(r) {
			function fillTile(i,j) {
				var tile=t.getTile(i,j),w=tile.width,h=tile.height,x=tile.x,y=tile.y,
						colorDark=t.getColor(t.colorDark,i,j),colorLight=t.getColor(t.colorLight,i,j),
						corners=[0,0,0,0];	// NW,NE,SE,SW
				if(t.isDark(i-1,j)) {corners[0]++;corners[1]++;}
				if(t.isDark(i+1,j)) {corners[2]++;corners[3]++;}
				if(t.isDark(i,j-1)) {corners[0]++;corners[3]++;}
				if(t.isDark(i,j+1)) {corners[1]++;corners[2]++;}
				// clear tile
				ctx.fillStyle=colorLight;
				ctx.fillRect(x,y,w,h);
				// draw tile
				ctx.fillStyle=colorDark;
				if(t.isDark(i,j)) {
					if(t.isDark(i-1,j-1)) corners[0]++;
					if(t.isDark(i-1,j+1)) corners[1]++;
					if(t.isDark(i+1,j+1)) corners[2]++;
					if(t.isDark(i+1,j-1)) corners[3]++;
					ctx.beginPath();
					ctx.moveTo(x+.5*w,y);
					drawCorner(x+w,y,x+w,y+.5*h,corners[1]?0:r);
					drawCorner(x+w,y+h,x+.5*w,y+h,corners[2]?0:r);
					drawCorner(x,y+h,x,y+.5*h,corners[3]?0:r);
					drawCorner(x,y,x+.5*w,y,corners[0]?0:r);
					ctx.closePath();
					ctx.fill();
				} else {
					if(corners[0]==2) fillCorner(x,y+.5*h,x,y,x+.5*w,y,r);
					if(corners[1]==2) fillCorner(x+.5*w,y,x+w,y,x+w,y+.5*h,r);
					if(corners[2]==2) fillCorner(x+w,y+.5*h,x+w,y+h,x+.5*w,y+h,r);
					if(corners[3]==2) fillCorner(x+.5*w,y+h,x,y+h,x,y+.5*h,r);
				}
			}
			var i,j;
			for(i=0;i<t.count;i++)
				for(j=0;j<t.count;j++) fillTile(i,j);
		}
		var t=this,ctx=t.context,
				r=t.effect.value*t.tileSize;
		// draw qrcode according to this.effect
		switch(t.effect.key) {
			case 'liquid':
				drawLiquid(r);break;
			case 'round':
				drawRound(r);break;
			default:
				drawRound(0);
		}
		// finally draw image
		t.drawImage();
	},
	appendTo:function(dom) {
		dom.appendChild(this.canvas);
	},
};
window.QRCanvas=QRCanvas;
