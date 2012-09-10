// Import the APIs we need.
var contextMenu = require("context-menu");
var panel = require("panel");
var { Hotkey } = require("hotkeys");
var data = require("self").data;
var prefs = require("simple-prefs");
var qrCapacity = require("QRCapacity");
var utf8 = require("Utf8");
 
exports.main = function(options, callbacks)
{
	prefs.on("QRBlockSize", validatePrefChange);
	prefs.on("QRErrorCorrectLevel", validatePrefChange);

	// Create a new context menu item.
  contextMenu.Item({
    label: "Show QR",
    // Show this item when a selection exists.
    context: contextMenu.PageContext(),
    // When this item is clicked, post a message back with the selection
    contentScript: 'self.on("click", function (junk) {self.postMessage("junk");});',
    // When we receive a message, look up the item
    onMessage: function (junk) {
      findAndSendQRText();
    }
  });
 
  // Create a new context menu item.
  contextMenu.Item({
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
  
  Hotkey(
	{
		combo: "alt-shift-q",
		onPress: function(){findAndSendQRText();}
	}
  );
};

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
function findAndSendQRText()
{
	var text = require("selection").text;
	if(!text || text=="")
	{
		text = require("tabs").activeTab.url;
	}
	textToBeShown = text;
	showOrUpdateQR();
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

function validatePrefChange(prefName)
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
			if(prefVal<1 || prefVal>5)
			{
				prefs.prefs["QRBlockSize"] = 3;
			}
			break;
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