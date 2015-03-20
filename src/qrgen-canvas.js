/*
 * Author: Gerald <gera2ld@163.com>
 */
function CanvasRender(options) {
	function getCell(row,col) {
		var cellSize=options.cellSize;
		cell={
			i:row,
			j:col,
			x:~~(col*cellSize),
			y:~~(row*cellSize),
			// width and height are calculated to avoid small gaps
			w:Math.ceil((col+1)*cellSize)-~~(col*cellSize),
			h:Math.ceil((row+1)*cellSize)-~~(row*cellSize),
			colorDark:getColor(options.colorDark,row,col),
			colorLight:getColor(options.colorLight,row,col),
		};
	}
	/*findCell:function(x,y) {
		var t=this;
		return {
			row:Math.floor(y/t.cellSize),
			col:Math.floor(x/t.cellSize),
		};
	}*/
	function isDark(i,j) {
		var image=options.image;
		return i>=0&&i<options.count&&j>=0&&j<options.count
			&&(!(i>=image.row1&&i<=image.row2&&j>=image.col1&&j<=image.col2))
			?options.isDark(i,j):false;
	}
	function getColor(color,row,col) {
		return typeof color=='function'?color(options.count,row,col):color;
	}
	function drawCorner(xc,yc,x,y,r) {
		if(r) context.arcTo(xc,yc,x,y,r);
		else {
			context.lineTo(xc,yc);
			context.lineTo(x,y);
		}
	}
	function fillCell(color) {
		context.fillStyle=color;
		context.fillRect(cell.x,cell.y,cell.w,cell.h);
	}
	function fillCorner(xs,ys,xc,yc,xd,yd) {
		context.beginPath();
		context.moveTo(xs,ys);
		drawCorner(xc,yc,xd,yd,effect);
		context.lineTo(xc,yc);
		context.lineTo(xs,ys);
		context.closePath();
		context.fill();
	}
	function drawImage() {
		var image=options.image;
		if(image.dom) {
			if(!image.clearEdges) {
				context.fillStyle=getColor(options.colorLight,-1,-1);
				context.fillRect(
					image.x-image.margin,
					image.y-image.margin,
					image.width+2*image.margin,
					image.height+2*image.margin
				);
			}
			context.drawImage(image.dom,image.x,image.y,image.width,image.height);
		}
	}
	function drawSquare() {
		fillCell(isDark(cell.i,cell.j)?cell.colorDark:cell.colorLight);
	}
	function drawRound() {
		var x=cell.x,y=cell.y,w=cell.w,h=cell.h;
		// fill arc with border-radius=effect
		fillCell(cell.colorLight);
		// draw cell if it should be dark
		if(isDark(cell.i,cell.j)) {
			context.fillStyle=cell.colorDark;
			context.beginPath();
			context.moveTo(x+.5*w,y);
			drawCorner(x+w,y,x+w,y+.5*h,effect);
			drawCorner(x+w,y+h,x+.5*w,y+h,effect);
			drawCorner(x,y+h,x,y+.5*h,effect);
			drawCorner(x,y,x+.5*w,y,effect);
			context.closePath();
			context.fill();
		}
	}
	function drawLiquid() {
		var corners=[0,0,0,0];	// NW,NE,SE,SW
		var i=cell.i,j=cell.j,x=cell.x,y=cell.y,w=cell.w,h=cell.h;
		if(isDark(i-1,j)) {corners[0]++;corners[1]++;}
		if(isDark(i+1,j)) {corners[2]++;corners[3]++;}
		if(isDark(i,j-1)) {corners[0]++;corners[3]++;}
		if(isDark(i,j+1)) {corners[1]++;corners[2]++;}
		fillCell(cell.colorLight);
		// draw cell
		context.fillStyle=cell.colorDark;
		if(isDark(i,j)) {
			if(isDark(i-1,j-1)) corners[0]++;
			if(isDark(i-1,j+1)) corners[1]++;
			if(isDark(i+1,j+1)) corners[2]++;
			if(isDark(i+1,j-1)) corners[3]++;
			context.beginPath();
			context.moveTo(x+.5*w,y);
			drawCorner(x+w,y,x+w,y+.5*h,corners[1]?0:effect);
			drawCorner(x+w,y+h,x+.5*w,y+h,corners[2]?0:effect);
			drawCorner(x,y+h,x,y+.5*h,corners[3]?0:effect);
			drawCorner(x,y,x+.5*w,y,corners[0]?0:effect);
			context.closePath();
			context.fill();
		} else {
			if(corners[0]==2) fillCorner(x,y+.5*h,x,y,x+.5*w,y);
			if(corners[1]==2) fillCorner(x+.5*w,y,x+w,y,x+w,y+.5*h);
			if(corners[2]==2) fillCorner(x+w,y+.5*h,x+w,y+h,x+.5*w,y+h);
			if(corners[3]==2) fillCorner(x+.5*w,y+h,x,y+h,x,y+.5*h);
		}
	}
	function draw() {
		var func,i,j;
		effect=options.effect.value*options.cellSize;
		// draw qrcode according to effect
		if(effect) switch(options.effect.key) {
			case 'liquid':
				func=drawLiquid;break;
			case 'round':
				func=drawRound;break;
			default:
				func=drawSquare;
		} else func=drawSquare;
		// draw cells
		for(i=0;i<options.count;i++)
			for(j=0;j<options.count;j++) {
				getCell(i,j);
				func();
			}
		// finally draw image
		drawImage();
	}

	var canvas=document.createElement('canvas');
	canvas.width=canvas.height=options.size;
	var context=canvas.getContext('2d');
	var cell,effect;
	draw();
	return {
		dom:canvas,
	};
}

function QRCanvas(options) {
	// update dict1 with dict2
	function update(dict1,dict2){
		for(var i in dict2) dict1[i]=dict2[i];
	}
	function prepareImage() {
		var w,h,nw,nh,k;
		if(k=image.dom) {
			// limit the image size
			w=k.naturalWidth||k.width;
			h=k.naturalHeight||k.height;
			// calculate the number of cells to be broken or covered by the image
			k=w/h;
			nh=Math.floor(Math.sqrt(Math.min(w*h/size/size,.1)/k)*count);
			nw=Math.floor(k*nh);
			// (count-[nw|nh]) must be even if the image is in the middle
			if((count-nw)%2) nw++;
			if((count-nh)%2) nh++;
			// calculate the final width and height of the image
			k=Math.min((nh*cellSize-2*image.margin)/h,(nw*cellSize-2*image.margin)/w,1);
			image.width=k*w;
			image.height=k*h;
			image.x=(size-image.width)/2;
			image.y=(size-image.height)/2;
			// whether to clear cells broken by the image (incomplete cells)
			if(image.clearEdges) {
				image.row1=Math.floor((count-nh)/2);
				image.row2=image.row1+nh-1;
				image.col1=Math.floor((count-nw)/2);
				image.col2=image.col1+nw-1;
			} else {
				image.row1=image.col1=image.row2=image.col2=-1;
			}
		}
	}

	// initiate options
	var cellSize=options.cellSize
		// compatible with tileWidth and tileHeight
		||options.tileWidth||options.tileHeight;
	var size=options.size
		// compatible with width and height
		||options.width||options.height
		||256;
	var typeNumber=options.typeNumber||0;
	// correctLevel can be 'L', 'M', 'Q' or 'H'
	var correctLevel=options.correctLevel||'M';
	var colorDark=options.colorDark||'black';
	var colorLight=options.colorLight||'white';
	var data=options.data||'';
	// effect: {key: [round|liquid], value: 0}
	var effect=options.effect||{};
	// image: {dom: <img> object, clearEdges: bool}
	var image={clearEdges:true,margin:2};
	if(options.image) {
		if(options.image.tagName) image.dom=options.image;
		else update(image,options.image);
	}
	// if an image is to be added, correctLevel is set to H
	if(image.dom) correctLevel='H';

	var qr=qrcode(typeNumber,correctLevel);
	qr.addData(data);
	qr.make();
	// calculate QRCode and cell sizes
	var count=qr.getModuleCount();
	// cellSize is used if assigned
	// otherwise size is used
	if(cellSize) size=cellSize*count;
	else cellSize=size/count;
	// prepare image before drawing
	prepareImage();
	// make canvas
	var renderer=CanvasRender({
		size:size,
		cellSize:cellSize,
		count:count,
		colorDark:colorDark,
		colorLight:colorLight,
		image:image,
		isDark:qr.isDark.bind(qr),
		effect:effect,
	});

	return {
		appendTo:function(parent) {
			parent.appendChild(renderer.dom);
		},
	}
}

window.QRCanvas=QRCanvas;
