// Import the APIs we need.
var panel = require("panel");
var { Hotkey } = require("hotkeys");
var data = require("self").data;
var prefs = require("simple-prefs");
var qrCapacity = require("QRCapacity");
var utf8 = require("Utf8");

var toolbarWidget = require("widget").Widget(
{
	id: "qrIcon",
	label: "Show QR",
	icon: data.url("toolbar/assets/qrIcon.png"),
	contentURL: data.url("toolbar/widget.html"),
	contentScriptFile: data.url("toolbar/widget.js")
});
toolbarWidget.port.on("showQR", function()
{
	findAndSendQRText();
});
 
exports.main = function(options, callbacks)
{
	prefs.on("QRBlockSize", handlePrefChange);
	prefs.on("QRErrorCorrectLevel", handlePrefChange);
	prefs.on("ShowInContextMenu", handlePrefChange);
	
	setupContextMenu();
  
	Hotkey(
		{
			combo: "alt-shift-q",
			onPress: function(){findAndSendQRText();}
		}
	);
};


var pageContextMenu;
var selectionContextMenu;
var imageContextMenu;
var linkContextMenu;
function setupContextMenu()
{
  var menuPref = prefs.prefs["ShowInContextMenu"];
  if(menuPref && !(pageContextMenu && selectionContextMenu))
  {
	removeContextMenu();
	createContextMenus();
  }
  else if(!menuPref)
  {
	removeContextMenu();
  }
}

function createContextMenus()
{
  var contextMenu = require("context-menu");

  pageContextMenu = contextMenu.Item({
    label: "Show QR",
    // Show this item when no selection exists.
    context: contextMenu.PageContext(),
    // When this item is clicked, post a message back with the selection
    contentScript: 'self.on("click", function (junk) {self.postMessage("junk");});',
    // When we receive a message, look up the item
    onMessage: function (junk) {
      findAndSendQRText();
    }
  });
 
  selectionContextMenu = contextMenu.Item({
    label: "Show QR",
    // Show this item when a selection exists.
    context: contextMenu.SelectionContext(),
    // When this item is clicked, post a message back with the selection
    contentScript: 'self.on("click", function (junk) {self.postMessage("junk");});',
    // When we receive a message, look up the item
    onMessage: function (junk) {
      findAndSendQRText();
    }
  });
 
  imageContextMenu = contextMenu.Item({
    label: "Show QR for image source",
    // Show this item when an img is right-clicked on.
    context: contextMenu.SelectorContext("img"),
    // When this item is clicked, post a message back with the selection
    contentScript: 'self.on("click", function (node) {self.postMessage(node.src);});',
    // When we receive a message, look up the item
    onMessage: function (imgSrc) {
      sendQRText(imgSrc);
    }
  });
 
  linkContextMenu = contextMenu.Item({
    label: "Show QR for link",
    // Show this item when an img is right-clicked on.
    context: contextMenu.SelectorContext("a"),
    // When this item is clicked, post a message back with the selection
    contentScript: 'self.on("click", function (node) {self.postMessage(node.href);});',
    // When we receive a message, look up the item
    onMessage: function (link) {
      sendQRText(link);
    }
  });
}

function removeContextMenu()
{
	if(pageContextMenu)
	{
		pageContextMenu.destroy();
		pageContextMenu = undefined;
	}
	
	if(selectionContextMenu)
	{
		selectionContextMenu.destroy();
		selectionContextMenu = undefined;
	}
	
	if(imageContextMenu)
	{
		imageContextMenu.destroy();
		imageContextMenu = undefined;
	}
	
	if(linkContextMenu)
	{
		linkContextMenu.destroy();
		linkContextMenu = undefined;
	}
}

var qrCodePanel = panel.Panel(
{
	width: 300,
	height: 300,
	contentURL: data.url("htmlQR/index.html")
});
qrCodePanel.on("show", function()
{
	showOrUpdateQR();
});

function sendShowQRMsg()
{
	if(!textToBeShown || textToBeShown=="")return;
	
	var text = utf8.encode(textToBeShown);
	var reqVersion = -1;
	try
	{
		reqVersion = qrCapacity.getMinQRVersion(text.length, getPreferedQRErrorCorrectLevel());
	}
	catch(err)
	{
		console.error(err);
		return;
	}
	
	var modCount = qrCapacity.getModuleCountForVersion(reqVersion);
	var blockSize = getPreferredBlockSize();
	
	var panelSize = Math.min(400, (modCount+8)*blockSize + 5);
	qrCodePanel.resize(panelSize, panelSize);
	
 	qrCodePanel.port.emit("myAddonScriptEvent", {"event":"showQR", "text":text, "version": reqVersion, "errorCorrectLevel": getPreferedQRErrorCorrectLevel(), "panelSize": panelSize});
}

var textToBeShown;
function sendQRText(text)
{
	textToBeShown = text;
	showOrUpdateQR();
}

function findAndSendQRText()
{
	var text = require("selection").text;
	if(!text || text=="")
	{
		text = require("tabs").activeTab.url;
	}
	sendQRText(text);
}

function showOrUpdateQR()
{
	if(qrCodePanel.isShowing)
	{
		sendShowQRMsg();
	}
	else
	{
		qrCodePanel.show();
	}
}

function handlePrefChange(prefName)
{
	switch(prefName)
	{
		case "QRErrorCorrectLevel":
			prefVal = prefs.prefs["QRErrorCorrectLevel"].toLowerCase();
			if(prefVal && prefVal!="l" && prefVal!="m" && prefVal!="q" && prefVal!="h" && prefVal!="")
			{
				prefs.prefs["QRErrorCorrectLevel"] = "L";
			}
			else if(prefVal)
			{
				prefs.prefs["QRErrorCorrectLevel"] = prefVal.toUpperCase();
			}
			break;
		case "QRBlockSize":
			prefVal = prefs.prefs["QRBlockSize"];
			if(prefVal<1 || prefVal>10)
			{
				prefs.prefs["QRBlockSize"] = 3;
			}
			break;
		case "ShowInContextMenu":
			setupContextMenu();
		default:
			break;
	}
}
 
function getPreferedQRErrorCorrectLevel()
{
	return prefs.prefs["QRErrorCorrectLevel"];
}

function getPreferredBlockSize()
{
	return prefs.prefs["QRBlockSize"];
}