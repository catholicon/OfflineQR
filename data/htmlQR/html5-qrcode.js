//---------------------------------------------------------------------
// JavaScript-HTML5 QRCode Generator
//
// Copyright (c) 2011 Amanuel Tewolde
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
//---------------------------------------------------------------------

// Generates a QRCode of text provided.
// First QRCode is rendered to a canvas.
// The canvas is then turned to an image PNG
// before being returned as an <img> tag.
function showQRCode(text, version, errorCorrectLevel, canvasSize) {

  
  var dotsize = 5;  // size of box drawn on canvas
  var padding = 10; // (white area around your QRCode)
  var black = "rgb(0,0,0)";
  var white = "rgb(255,255,255)";
  var QRCodeVersion = 10; // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html
  if(version!=undefined && version>=1 && version<=19)
  {
	QRCodeVersion = version;
  }
  
	// QR Code Error Correction Capability 
	// Higher levels improves error correction capability while decreasing the amount of data QR Code size.
	// QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
	// eg. L can survive approx 5% damage...etc.
	var qrErrCorrectLevel = QRErrorCorrectLevel.L;
	if(errorCorrectLevel!=undefined)
	{
		switch(errorCorrectLevel)
		{
			case "L":
			case "l":
				qrErrCorrectLevel = QRErrorCorrectLevel.L;
				break;
			case "M":
			case "m":
				qrErrCorrectLevel = QRErrorCorrectLevel.M;
				break;
			case "Q":
			case "q":
				qrErrCorrectLevel = QRErrorCorrectLevel.Q;
				break;
			case "H":
			case "h":
				qrErrCorrectLevel = QRErrorCorrectLevel.H;
				break;
		}
	}
	
	var canvas=document.createElement('canvas');
	var qrCanvasContext = canvas.getContext('2d');
  try {
    var qr = new QRCode(QRCodeVersion, qrErrCorrectLevel); 
   	qr.addData(text);
   	qr.make();
   }
  catch(err) {
		var errorChild = document.createElement("p");
    var errorMSG = document.createTextNode("QR Code FAIL! " + err);
    errorChild.appendChild(errorMSG);
    return errorChild;
  }
    
  var qrsize = qr.getModuleCount();
	if(canvasSize==undefined)
	{
		canvasSize = 295;
	}
 	canvas.setAttribute('height',canvasSize);
 	canvas.setAttribute('width',canvasSize);

	dotsize = Math.max(1, Math.floor((canvasSize-padding)/qrsize));
	padding = canvasSize - dotsize*qrsize
 	var shiftForPadding = padding/2;
 	if (canvas.getContext){
 		for (var r = 0; r < qrsize; r++) {
 			for (var c = 0; c < qrsize; c++) {
 				if (qr.isDark(r, c))
 					qrCanvasContext.fillStyle = black;  
 				else
 					qrCanvasContext.fillStyle = white;  
 				qrCanvasContext.fillRect ((c*dotsize) +shiftForPadding,(r*dotsize) + shiftForPadding,dotsize,dotsize);   // x, y, w, h
 			}	
 		}
 	}

 	var imgElement = document.createElement("img");
 	imgElement.src = canvas.toDataURL("image/png");

 	return imgElement;
    
}

