var reloadTimer = null;
var seconds=0;
var tseconds=60;
Reload();
function Reload()
{
  seconds++;
  if (seconds>tseconds) window.location.replace(window.location.href);
  else
  {
  document.monitor.clock.value="Reload in "+(tseconds-seconds)+" seconds";
  reloadTimer = setTimeout("Reload()", 1000);
  }
}
