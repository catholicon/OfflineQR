// Import the APIs we need.
var contextMenu = require("context-menu");
var panel = require("panel");
var { Hotkey } = require("hotkeys");
var data = require("self").data;
var prefs = require("simple-prefs");
 
exports.main = function(options, callbacks)
{
	prefs.on("QRCodeVersion", validatePrefChange);
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
 	qrCodePanel.port.emit("myAddonScriptEvent", {"event":"showQR", "text":textToBeShown, "version": getPreferedQRVersion(), "errorCorrectLevel": getPreferedQRErrorCorrectLevel()});
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
		case "QRCodeVersion":
			prefVal = prefs.prefs["QRCodeVersion"];
			if(prefVal<1 || prefVal>19)
			{
				prefs.prefs["QRCodeVersion"] = 10;
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

function getPreferedQRVersion()
{
	return prefs.prefs["QRCodeVersion"];
}