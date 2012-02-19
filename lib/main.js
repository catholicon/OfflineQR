// Import the APIs we need.
var contextMenu = require("context-menu");
var panel = require("panel");
var { Hotkey } = require("hotkeys");
var data = require("self").data;
 
exports.main = function(options, callbacks)
{
  // Create a new context menu item.
  contextMenu.Item({
    label: "Show QR",
    // Show this item when a selection exists.
    context: contextMenu.PageContext(),
    // When this item is clicked, post a message back with the selection
    contentScript: 'self.on("click", function (junk) {self.postMessage("junk");});',
    // When we receive a message, look up the item
    onMessage: function (junk) {
      showQR();
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
      showQR();
    }
  });
  
  Hotkey(
	{
		combo: "alt-shift-q",
		onPress: function(){showOrUpdateQR();}
	}
  );
};

var textUpdated = false;

var qrCodePanel = panel.Panel(
{
	width: 300,
	height: 300,
	contentURL: data.url("htmlQR/index.html"),
	contentScriptWhen: "end",
	contentScriptFile: data.url("contentScript.js")
});
qrCodePanel.on("hide", function()
{
	textUpdated = false;
});
qrCodePanel.port.on("myContentScriptEvent", function(payloadFromCS)
{
	if(payloadFromCS=="shown" && textUpdated==false)
	{
		textUpdated = true;
		sendShowQRMsg();
	}
 });

 function sendShowQRMsg()
{
	var text = require("selection").text;
	if(!text || text=="")
	{
		text = require("tabs").activeTab.url;
	}
 	qrCodePanel.port.emit("myAddonScriptEvent", {"event":"showQR", "text":text});
}

function showOrUpdateQR()
{
	if(qrCodePanel.isShowing)
	{
		sendShowQRMsg();
	}
	else
	{
		showQR();
	}
}
 
function showQR()
{  
  qrCodePanel.show();
}