/**
 * @author Gerald <gera2ld@163.com>
 * @license MIT
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
		var logo=options.logo;
		return i>=0&&i<options.count&&j>=0&&j<options.count
			// when logo.rowN or logo.colN is not defined,
			// any of the comparisons will be false
			&&(!(i>=logo.row1&&i<=logo.row2&&j>=logo.col1&&j<=logo.col2))
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
		//context.closePath();
		context.fill();
	}
	function drawLogo() {
		var logo=options.logo;
		if(logo.image||logo.text) {
			if(!logo.clearEdges) {
				context.fillStyle=getColor(options.colorLight,-1,-1);
				context.fillRect(
					logo.x-logo.margin,
					logo.y-logo.margin,
					logo.width+2*logo.margin,
					logo.height+2*logo.margin
				);
			}
			if(logo.image)
				context.drawImage(logo.image,logo.x,logo.y,logo.width,logo.height);
			else {
				var font='';
				if(logo.fontStyle) font+=logo.fontStyle+' ';
				font+=logo.height+'px '+logo.fontFace;
				context.font=font;
				context.textBaseline='hanging';
				context.fillStyle=logo.color;
				context.fillText(logo.text,logo.x,logo.y);
			}
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
			//context.closePath();
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
			//context.closePath();
			context.fill();
		} else {
			if(corners[0]==2) fillCorner(x,y+.5*h,x,y,x+.5*w,y);
			if(corners[1]==2) fillCorner(x+.5*w,y,x+w,y,x+w,y+.5*h);
			if(corners[2]==2) fillCorner(x+w,y+.5*h,x+w,y+h,x+.5*w,y+h);
			if(corners[3]==2) fillCorner(x+.5*w,y+h,x,y+h,x,y+.5*h);
		}
	}
	function drawCells() {
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
	}
	function prepareLogo(){
		var w,h,nw,nh,k;
		var logo=options.logo;
		var size=options.size;
		var cellSize=options.cellSize;
		var count=options.count;
		// limit the logo size
		if(logo.image) {
			k=logo.image;
			w=k.naturalWidth||k.width;
			h=k.naturalHeight||k.height;
		} else if(logo.text) {
			// get text width/height radio by assuming fontHeight=100px
			h=100;
			k='';
			if(logo.fontStyle) k+=logo.fontStyle+' ';
			k+=h+'px '+logo.fontFace;
			context.font=k;
			w=context.measureText(logo.text).width;
		} else return;
		// calculate the number of cells to be broken or covered by the logo
		k=w/h;
		nh=Math.floor(Math.sqrt(Math.min(w*h/size/size,logo.size)/k)*count);
		nw=Math.floor(k*nh);
		// (count-[nw|nh]) must be even if the logo is in the middle
		if((count-nw)%2) nw++;
		if((count-nh)%2) nh++;
		// calculate the final width and height of the logo
		k=Math.min((nh*cellSize-2*logo.margin)/h,(nw*cellSize-2*logo.margin)/w,1);
		logo.width=~~(k*w);
		logo.height=~~(k*h);
		logo.x=(size-logo.width)/2;
		logo.y=(size-logo.height)/2;
		// whether to clear cells broken by the logo (incomplete cells)
		if(logo.clearEdges) {
			logo.row1=Math.floor((count-nh)/2);
			logo.row2=logo.row1+nh-1;
			logo.col1=Math.floor((count-nw)/2);
			logo.col2=logo.col1+nw-1;
		} else
			logo.row1=logo.col1=logo.row2=logo.col2=-1;
	}

	var canvas=document.createElement('canvas');
	canvas.width=canvas.height=options.size;
	var context=canvas.getContext('2d');
	var cell,effect;
	prepareLogo();
	drawCells();
	drawLogo();
	return {
		dom:canvas,
	};
}

function QRCanvas(options) {
	// update dict1 with dict2
	function extend(dict1,dict2){
		for(var i in dict2) dict1[i]=dict2[i];
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
	/* logo: image or text
	{
		// image
		image: Image,

		// text
		text: string,
		color: string, default 'black'
		fontStyle: string, e.g. 'italic bold'
		fontFace: string, default 'Cursive'

		// common
		clearEdges: bool, default true
		margin: number, default 2
		size: float, default .15 stands for 15% of the QRCode
	}
	*/
	var logo={
		color:'black',
		fontFace:'Cursive',
		clearEdges:true,
		margin:2,
		size:.15,
	};
	if(options.logo) extend(logo,options.logo);
	// if a logo is to be added, correctLevel is set to H
	if(logo.image||logo.text) correctLevel='H';

	var qr=qrcode(typeNumber,correctLevel);
	qr.addData(data);
	qr.make();
	// calculate QRCode and cell sizes
	var count=qr.getModuleCount();
	// cellSize is used if assigned
	// otherwise size is used
	if(cellSize) size=cellSize*count;
	else cellSize=size/count;
	// make canvas
	var renderer=CanvasRender({
		size:size,
		cellSize:cellSize,
		count:count,
		colorDark:colorDark,
		colorLight:colorLight,
		logo:logo,
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
