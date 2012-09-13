var show_qr_button = document.getElementById("show-qr-button");
show_qr_button.onclick = function()
{
  self.port.emit("showQR");
}