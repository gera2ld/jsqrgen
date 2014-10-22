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
	t.tileWidth=options.tileWidth;
	t.tileHeight=options.tileHeight;
	t.width=options.width||256;
	t.height=options.height||256;
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
	// method: {key: [liquid|tile], value: 0}
	t.method=options.method||{};
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
		t.size=t.qrcode.getModuleCount();
		// tileWidth and tileHeight are used if assigned
		// otherwise width and height are used
		if(t.tileWidth) t.width=t.tileWidth*t.size;
		else t.tileWidth=t.width/t.size;
		if(t.tileHeight) t.height=t.tileHeight*t.size;
		else t.tileHeight=t.height/t.size;
		// prepare image before drawing
		t.prepareImage();
		// make canvas
		t.canvas=document.createElement('canvas');
		t.canvas.width=t.width;
		t.canvas.height=t.height;
		t.context=t.canvas.getContext('2d');
		t.draw();
	},
	getColor:function(color,row,col) {
		return typeof color=='function'?color(this.size,row,col):color;
	},
	getTile:function(row,col) {
		var t=this;
		return {
			row:row,
			col:col,
			x:Math.round(col*t.tileWidth),
			y:Math.round(row*t.tileHeight),
			width:Math.ceil((col+1)*t.tileWidth)-Math.floor(col*t.tileWidth),
			height:Math.ceil((row+1)*t.tileHeight)-Math.floor(row*t.tileHeight),
		};
	},
	findTile:function(x,y) {
		var t=this;
		return {
			row:Math.floor(y/t.tileHeight),
			col:Math.floor(x/t.tileWidth),
		};
	},
	prepareImage:function() {
		var i=.3,j,t=this,image=t.image.dom,tile1,tile2;
		if(image) {
			// limit the image size
			j=image.clientWidth;
			if(j/t.width>i) j=t.width*i;
			t.image.width=j;
			j=image.clientHeight;
			if(j/t.height>i) j=t.height*i;
			t.image.height=j;
			t.image.x=(t.width-t.image.width)/2;
			t.image.y=(t.height-t.image.height)/2;
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
	draw:function() {
		function drawTile(v) {
			function fillTile(i,j) {
				var tile=t.getTile(i,j);
				color=t.qrcode.isDark(i,j)?t.colorDark:t.colorLight;
				ctx.fillStyle=t.getColor(color,i,j);
				if(v) {	// fill arc with border-radius=v
					var w=tile.width,h=tile.height,x=tile.x,y=tile.y,r=v*w;
					ctx.beginPath();
					ctx.moveTo(x+v*w,y);
					ctx.lineTo(x+(1-v)*w,y);
					ctx.arcTo(x+w,y,x+w,y+v*h,r);
					ctx.lineTo(x+w,y+(1-v)*h);
					ctx.arcTo(x+w,y+h,x+(1-v)*w,y+h,r);
					ctx.lineTo(x+v*w,y+h);
					ctx.arcTo(x,y+h,x,y+(1-v)*h,r);
					ctx.lineTo(x,y+v*h);
					ctx.arcTo(x,y,x+v*w,y,r);
					ctx.closePath();
					ctx.fill();
				} else	// fill rect
					ctx.fillRect(tile.x,tile.y,tile.width,tile.height);
			}
			var ctx=t.context,i,j;
			for(i=0;i<t.size;i++)
				for(j=0;j<t.size;j++) fillTile(i,j);
		}
		var t=this;
		// clear the canvas with the background color
		t.context.fillStyle=t.getColor(t.colorLight,-1,-1);
		t.context.fillRect(0,0,t.width,t.height);
		// draw qrcode according to this.method
		switch(t.method.key) {
			case 'liquid':	// TODO
			//case 'tile':
			default: drawTile(t.method.value);
		}
		// finally draw image
		t.drawImage();
	},
	appendTo:function(dom) {
		dom.appendChild(this.canvas);
	}
};
window.QRCanvas=QRCanvas;
