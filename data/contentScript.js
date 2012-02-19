self.port.on("myAddonScriptEvent", function(payloadFromAddon)
{
	if(payloadFromAddon["event"]=="showQR")
	{
		document.defaultView.postMessage(JSON.stringify(payloadFromAddon), "*");
	}
});
document.onload = function()
{
	self.port.emit("myContentScriptEvent", "shown");
}