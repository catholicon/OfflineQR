// Import the APIs we need.
var contextMenu = require("context-menu");
var panel = require("panel");
var { Hotkey } = require("hotkeys");
var data = require("self").data;
 
exports.main = function(options, callbacks) {
  console.log(options.loadReason);
 
  // Create a new context menu item.
  var menuItem = contextMenu.Item({
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
  var menuItem = contextMenu.Item({
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
		combo: "accel-alt-q",
		onPress: function(){showQR();}
	}
  );
};
 
function showQR()
{  
  var text = require("selection").text;
  if(!text || text=="")
  {
	text = require("tabs").activeTab.url;
  }
  var stringMsgObj = "'{\"showQR\":\"" + text + "\"}'";
  console.log(stringMsgObj);
  var qrURL = data.url("index.html");
  console.log('showing QR using ' + qrURL);
  qrCodePanel = panel.Panel({
    width: 300,
    height: 300,
    contentURL: qrURL,
	contentScriptWhen: "end",
	contentScript: 'document.defaultView.postMessage(' + stringMsgObj + ', "*");'
  });
  qrCodePanel.show();
}