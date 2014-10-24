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
	t.cellSize=options.cellSize
		// compatible with tileWidth and tileHeight
		||options.tileWidth||options.tileHeight;
	t.size=options.size
		// compatible with width and height
		||options.width||options.height
		||256;
	t.typeNumber=options.typeNumber||4;
	// correctLevel can be 'L', 'M', 'Q' or 'H'
	t.correctLevel=options.correctLevel||'M';
	t.colorDark=options.colorDark||'black';
	t.colorLight=options.colorLight||'white';
	t.data=options.data||'';
	// image: {dom: <img> object, clearEdges: bool}
	t.image=options.image||{};
	if(t.image.tagName) t.image={dom:t.image};
	setDefaults(t.image,{clearEdges:true,margin:2});
	// effect: {key: [round|liquid], value: 0}
	t.effect=options.effect||{};
	t.make();
}
QRCanvas.prototype={
	make:function() {
		var t=this;
		// if an image is to be added, correctLevel is set to H
		if(t.image.dom) t.correctLevel='H';
		t.qrcode=qrcode(t.typeNumber,t.correctLevel);
		t.qrcode.addData(t.data);
		t.qrcode.make();
		// calculate QRCode and cell sizes
		t.count=t.qrcode.getModuleCount();
		// cellSize is used if assigned
		// otherwise size is used
		if(t.cellSize) t.size=t.cellSize*t.count;
		else t.cellSize=t.size/t.count;
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
			x:Math.round(col*t.cellSize),
			y:Math.round(row*t.cellSize),
			// width and height are calculated to avoid small gaps
			width:Math.ceil((col+1)*t.cellSize)-Math.floor(col*t.cellSize),
			height:Math.ceil((row+1)*t.cellSize)-Math.floor(row*t.cellSize),
		};
	},
	findTile:function(x,y) {
		var t=this;
		return {
			row:Math.floor(y/t.cellSize),
			col:Math.floor(x/t.cellSize),
		};
	},
	prepareImage:function() {
		var w,h,nw,nh,t=this,image=t.image,k;
		if(k=image.dom) {
			// limit the image size
			w=k.naturalWidth||k.width;
			h=k.naturalHeight||k.height;
			// calculate the number of cells to be broken or covered by the image
			k=w/h;
			nh=Math.floor(Math.sqrt(Math.min(w*h/t.size/t.size,.1)/k)*t.count);
			nw=Math.floor(k*nh);
			// (t.count-[nw|nh]) must be even if the image is in the middle
			if((t.count-nw)%2) nw++;
			if((t.count-nh)%2) nh++;
			// calculate the final width and height of the image
			k=Math.min((nh*t.cellSize-2*image.margin)/h,(nw*t.cellSize-2*image.margin)/w,1);
			image.width=k*w;
			image.height=k*h;
			image.x=(t.size-image.width)/2;
			image.y=(t.size-image.height)/2;
			// whether to clear cells broken by the image (incomplete cells)
			if(image.clearEdges) {
				image.row1=Math.floor((t.count-nh)/2);
				image.row2=image.row1+nh-1;
				image.col1=Math.floor((t.count-nw)/2);
				image.col2=image.col1+nw-1;
			} else {
				image.row1=image.col1=image.row2=image.col2=-1;
			}
		}
	},
	drawImage:function() {
		var t=this,image=t.image;
		if(image.dom) {
			if(!image.clearEdges) {
				t.context.fillStyle=t.getColor(t.colorLight,-1,-1);
				t.context.fillRect(image.x-image.margin,image.y-image.margin,image.width+2*image.margin,image.height+2*image.margin);
			}
			t.context.drawImage(image.dom,image.x,image.y,image.width,image.height);
		}
	},
	isDark:function(i,j) {
		var t=this,img=t.image;
		return i>=0&&i<t.count&&j>=0&&j<t.count
			&&(!(i>=img.row1&&i<=img.row2&&j>=img.col1&&j<=img.col2))
			?t.qrcode.isDark(i,j):false;
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
				var cell=t.getTile(i,j),w=cell.width,h=cell.height,x=cell.x,y=cell.y,
						colorDark=t.getColor(t.colorDark,i,j),colorLight=t.getColor(t.colorLight,i,j);
				if(r) {	// fill arc with border-radius=r
					// clear cell
					ctx.fillStyle=colorLight;
					ctx.fillRect(x,y,w,h);
					// draw cell if it should be dark
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
					// cell will be filled with colorDark so no need to clear
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
				var cell=t.getTile(i,j),w=cell.width,h=cell.height,x=cell.x,y=cell.y,
						colorDark=t.getColor(t.colorDark,i,j),colorLight=t.getColor(t.colorLight,i,j),
						corners=[0,0,0,0];	// NW,NE,SE,SW
				if(t.isDark(i-1,j)) {corners[0]++;corners[1]++;}
				if(t.isDark(i+1,j)) {corners[2]++;corners[3]++;}
				if(t.isDark(i,j-1)) {corners[0]++;corners[3]++;}
				if(t.isDark(i,j+1)) {corners[1]++;corners[2]++;}
				// clear cell
				ctx.fillStyle=colorLight;
				ctx.fillRect(x,y,w,h);
				// draw cell
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
				r=t.effect.value*t.cellSize;
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
