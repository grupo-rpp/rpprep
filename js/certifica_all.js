<!--DOCUMENT CONTENT_TYPE="text/javascript"  -->
/*
  Copyright 2004 - Certifica.com
  $Id: certifica-js14.js,v 1.4 2004/10/27 20:12:21 leus Exp $
*/
function cert_getReferrer14()
{
   var referrer = document.referrer;
   try {
      if ( self != top )
         referrer = top.document.referrer;
   } catch(e) {
      referrer = document.referrer;
   }
   return referrer;
}
/*
  Copyright 2004 - Certifica.com
  $Id$
*/

DEFAULT_PIVOT_NAME = 'cert_Pivot';
DEFAULT_REDIRECT_TIME = 3000;
DEFAULT_PERIODIC_REDIRECT_TIME = 60000;
DEFAULT_ORIGIN_COOKIE_NAME = 'cert_Origin';

var cert_CustomCounters = null;
var cert_CustomAttributes = null;

function cert_normalizePath(sPath, sPrefix)
{
    var sProtocol = cert_getProtocol();
    var sRet = 'home/default';
    var regexSlashes = /\/\/+/g;
    var regexInvalid = /[^A-Z0-9_.\/]/gi;
    var aDefaultPages = [
		'index.htm', 'index.html', 'index.asp', 'index.php',
		'index.cfm', 'index.shtml', 'index.jsp', 'default.asp',
		'default.html', 'default.htm', 'default.jsp', 'default.php'
    ];

    sPath = unescape(sPath);
    if (sPath && sPath.length > 0 &&
        (sProtocol == 'http:' || sProtocol == 'https:')) {
        sPath = sPath.replace(regexInvalid, '');
        // Si es un directorio, se agrega una pagina por defecto
        if (sPath.charAt(sPath.length - 1) == '/') {
            sPath += aDefaultPages[0];
        }
        sPath = sPath.replace(regexSlashes, '/');

        var aParts = sPath.split('/');
        var aElems = new Array();
        for (var i = 0; i < aParts.length; i++) {
            if (aParts[i] && aParts[i] != '') {
                aElems.push(aParts[i]);
            }
        }

        if (aElems.length == 0) {
            aElems.push('home');
            aElems.push('default');
        }

        if (aElems.length == 1) {
            aElems.unshift('home');
        }

        for (var i = 0; i < aDefaultPages.length; i++) {
            if (aElems[aElems.length - 1] == aDefaultPages[i]) {
                aElems[aElems.length - 1] = 'default';
                break;
            }
        }

        // Si viene el prefijo, lo uso.
        if (sPrefix) {
            sRet = sPrefix + '/' + aElems[aElems.length -1];
        } else {
            sRet = aElems.join('/');
        }

    }
    return sRet;
}


function cert_qVal(sValue)
{
    var pos = String(document.location).indexOf('?');
    if (pos != -1) {
       var query = String(document.location).substring(pos+1);
       var vars = query.split("&");
       for (var i=0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] == sValue)
             return pair[1];
       }
    }
    return null;
}

function cert_getCookie(sName) {
  var dc = document.cookie;
  var prefix = sName + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else
    begin += 2;
  var end = document.cookie.indexOf(";", begin);
  if (end == -1)
    end = dc.length;
  return unescape(dc.substring(begin + prefix.length, end));
}

function cert_setCookie(sName, sValue, dtExpires, sPath, sDomain, bSecure) {
  document.cookie = sName + "=" + escape(sValue) +
      ((dtExpires) ? "; expires=" + dtExpires.toGMTString() : "") +
      ((sPath) ? "; path=" + sPath : "") +
      ((sDomain) ? "; domain=" + sDomain : "") +
      ((bSecure) ? "; secure" : "");
}

function cert_getReferrer()
{
   var referrer = document.referrer;
   if (self.cert_getReferrer14)
      return cert_getReferrer14();
/*@cc_on
  @if(@_jscript_version >= 5 )
   try {
      if ( self != top ) referrer = top.document.referrer;
   } catch(e) {};
  @end
  @*/
  return referrer;
}

/* Obtiene el tipo de protocolo del documento actual. */
function cert_getProtocol()
{
    if (window && window.location && window.location.protocol)
        return window.location.protocol;
    return null;
}

/* Crea una cookie con el contenido del referrer para evaluarlo
  en el paso final, si es necesario. */
function cert_setOrigin()
{
	var c = cert_getCookie(DEFAULT_ORIGIN_COOKIE_NAME);
	if (!c) {
		var l = cert_getReferrer();
		if (l) {
			var re = new RegExp('https?:\/\/([^\/]+)');
			var m = re.exec(l);
			if (m) {
				var m2 = re.exec(document.location);
				if (m2) {
					if (m[1] != m2[1]) {
						c = m[1];
					}
				}
			}
		}
		if (!c) {
			c = 'directo';
		}
		cert_setCookie(DEFAULT_ORIGIN_COOKIE_NAME, c);
	}
}

function cert_getFlashVersion()
{
	var flashVersion = -1;
	if (navigator.plugins && navigator.plugins.length) {
		var objFlash = navigator.plugins["Shockwave Flash"];
		if (objFlash) {
			if (objFlash.description) {
				flashDesc = objFlash.description;
				flashVersion = flashDesc.charAt(flashDesc.indexOf('.')-1);
			}
		}

		if (navigator.plugins["Shockwave Flash 2.0"]) {
			flashVersion = 2;
		}
	} else if (navigator.mimeTypes && navigator.mimeTypes.length) {
		x = navigator.mimeTypes['application/x-shockwave-flash'];
		if (x && x.enabledPlugin) {
			flashVersion = 0; // no detectada!
		}
	}

	/*@cc_on
	for(var i = 10; i > 0; i--) {
		try {
			var flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
			flashVersion = i;
			break;
		} catch(e){}
	}	
	@*/
	return flashVersion;
}

/* Crea la URL para obtener un pageview de Certifica. */
/* Sólo necesita los parámetros iSiteId y sPath       */
function cert_getURL(iSiteId, sPath, sAppend)
{
    var size, colors, referrer, url;
    size = colors = referrer = 'otro';
    var o = cert_qVal('url_origen');
    var proto = cert_getProtocol();
    var scache = '&cert_cachebuster=' + (1 + Math.floor (Math.random() * 10000));
    if (proto != 'https:')
        proto = 'http:';

    if (o != null && o != '')
       referrer = o;
    else
       referrer = escape(cert_getReferrer());
    if ( window.screen.width ) size = window.screen.width;
    if ( window.screen.colorDepth ) colors = window.screen.colorDepth;
    else if ( window.screen.pixelDepth ) colors = window.screen.pixelDepth;
    url =
       proto + '//hits.e.cl/cert/hit.dll?sitio_id=' + iSiteId + '&path=' + sPath +  scache +
       '&referer=' + referrer + '&size=' + size + '&colors=' + colors;
    url += '&java=' + navigator.javaEnabled() + '&flash=' + cert_getFlashVersion();
    if (sAppend)
        url += sAppend;
    return url;
}

function cert_addCustomAttribute(sType, sValue)
{
	if (!cert_CustomAttributes) {
		cert_CustomAttributes = new Object();
	}

	cert_CustomAttributes[sType] = sValue;
}

function cert_addCustomCounter(sType, iValue)
{
	if (iValue && iValue > 0) {
		if (!cert_CustomCounters) {
			cert_CustomCounters = new Object();
		}

		if (cert_CustomCounters[sType]) {
			cert_CustomCounters[sType] += iValue;
		} else {
			cert_CustomCounters[sType] = iValue;
		}
	}
}


function cert_getCustomTags()
{
	var sRet = '';
	var ct_atrib = '', ct_acum = '';
	if (cert_CustomAttributes) {
		ct_atrib = 'ct_atrib=';
		for (var i in cert_CustomAttributes) {
			ct_atrib += i + ':' + cert_CustomAttributes[i] + ';';
		}
	}

	if (cert_CustomCounters) {
		ct_acum = 'ct_acum=';
		for (var i in cert_CustomCounters) {
			ct_acum += i + ':' + cert_CustomCounters[i] + ';';
		}
	}

	if (ct_atrib || ct_acum) {
		if (ct_atrib) {
			sRet += '&' + ct_atrib;
		}
		if (ct_acum) {
			sRet += '&' + ct_acum;
		}
	}
	return sRet;
}


/* Crea la URL para un sitio con e-Commerce. */
function cert_getURL_eCommerce(iSiteId, sPath, sAmount)
{
	var sOrigin = null;

	if ((sOrigin = cert_getCookie(DEFAULT_ORIGIN_COOKIE_NAME))) {
		cert_addCustomAttribute('origin', sOrigin);
	}

	if (sAmount) {
		cert_addCustomCounter('money', sAmount);
	}

	var sAppend = cert_getCustomTags();

	return cert_getURL(iSiteId, sPath, sAppend);
}
	
		
/* Efectua un hit en certifica usando una imagen pivote. */
function cert_registerHit(iSiteId, sPath, sPivotName)
{
   var sAppend = '&cert_cachebuster=' + (1 + Math.floor (Math.random() * 10000));
   if ( !sPivotName )
      sPivotName = DEFAULT_PIVOT_NAME;
   if ( document.images )
      if ( document.images[sPivotName] )
         document.images[sPivotName].src = cert_getURL(iSiteId, sPath, sAppend);
}

/* Efectúa una redirección marcando la ruta de salida */
function cert_registerHitAndRedirect( sURL, iSiteId, sPath, sPivotName )
{
   cert_registerHit( iSiteId, sPath, sPivotName );
   setTimeout( "location.href = '" + sURL + "'", DEFAULT_REDIRECT_TIME );
}

/* Abre una nueva ventana, marcando el hit */
function cert_registerHitAndOpenWindow( sURL, iSiteId, sPath, sPivotName, sName, sFeatures, bReplace )
{
   cert_registerHit( iSiteId, sPath, sPivotName );
   if (!sName)
      sName = 'Downloads';
   if (!sFeatures)
      sFeatures = 'toolbar=no,location=no,directories=no,status=yes,menubar=no, scrollbars=no,resizable=no,width=425,height=510,screenX=20,screenY=20';
   window.open( sURL,
      sName,
      sFeatures,
      bReplace
   );
   return false;
}

/* Marca el hit y reemplaza/abre una URL en el frame 'sName' */
function cert_registerHitAndReplaceOtherFrame( sURL, sName, iSiteId, sPath, sPivotName )
{
   cert_registerHitAndOpenWindow( sURL, iSiteId, sPath, sPivotName, sName, 0, true );
}

/* Marca el hit y reemplaza/abre una URL en el frame 'sName' */
function cert_registerHitAndReplaceThisFrame( sURL, iSiteId, sPath, sPivotName )
{
   cert_registerHitAndRedirect( sURL, iSiteId, sPath, sPivotName );
}

/* Marca el hit y baja un archivo */
function cert_registerHitAndDownloadFile( sURL, iSiteId, sPath, sPivotName )
{
   cert_registerHitAndRedirect( sURL, iSiteId, sPath, sPivotName );
}

function cert_getAnchor(sUrl)
{
    return '<img src="' + sUrl + '" width="1" height="1" border="0" alt="Certifica.com">';
}

/* Marca un hit en la página actual */
function cert_getNormalizedURL(iSiteId, sPath, sDesc)
{
    sAppend = null;
    if (sPath.toLowerCase() == 'url') {
        sPath = location.pathname;
    }

    if (!sDesc) {
        sDesc = document.title;
    }

    if (sDesc) {
        sAppend = '&descr=' + escape(sDesc.substr(0, 30));
    }

    sPath = cert_normalizePath(sPath);
    return cert_getURL(iSiteId, sPath, sAppend);
}

/* Marca un hit en la página actual */
function tagCertifica(iSiteId, sPath, sDesc)
{
    sURL = cert_getNormalizedURL(iSiteId, sPath, sDesc);
    document.writeln('<img src="' + sURL
        + '" width="1" height="1" border="0" alt="Certifica.com">' );
}

/* Marca un hit en la página actual, usando eCommerce */
function tagCertifica_eCommerce(iSiteId, sPath, iAmount)
{
    document.writeln(cert_getAnchor(cert_getURL_eCommerce(iSiteId, sPath, iAmount)));
}

/* Marca un registro cada iTime milisegundos.  */
function cert_registerPeriodicHit( iSiteId, sPath, sPivotName, iTime )
{
   if ( !sPivotName )
      sPivotName = DEFAULT_PIVOT_NAME;
   if ( !iTime )
      iTime = DEFAULT_PERIODIC_REDIRECT_TIME;

   cert_registerHit( iSiteId, sPath, sPivotName );
   setTimeout( 'cert_registerPeriodicHit( ' + iSiteId + ', "' + sPath + '", "' + sPivotName + '", ' + iTime + ')', iTime );
}

cert_setOrigin();



//MARCACION OVERLAYS CERTIFICA
var links = document.getElementsByTagName("a");
var arrayLinks = new Array();
for (e=0; e<links.length; e++){
	arrayLinks[e] = links[e];
}

var idSitio = 0;
var path = '';
var f_apreta = function apreta(e){
	if (window.event)
		{eType = event.type;
		eSrc = event.srcElement;
		while (eSrc.tagName != "a" && eSrc.tagName != "A")
			{eSrc = eSrc.parentNode;}
		}
	else
		{eType = e.type;
		eSrc = e.target;
		while (eSrc.nodeName != "a" && eSrc.nodeName != "A")
			{eSrc = eSrc.parentNode;}
		}

	var z=0;
	for (z=0; z<arrayLinks.length; z++){
		if (arrayLinks[z] == eSrc)
			{var idLink = z;
			eSrc = null;
			break;}
	}
var url = location.href;
var index = url.indexOf("?");
if (index == -1)
	{index = url.length;}
   cc = Math.round(Math.random()*1000000);
   (new Image).src='http://hits.e.cl/cert/hit.dll?proc_id=ovl&s=' + idSitio + '&l=' + idLink + '&pag_id=' + path + '&z='+cc+'&ref='+url.substring(0,index);
}

function instalaHdlr(s, p){
	idSitio = s;
	path = p;
	//links = document.links;
	links=document.getElementsByTagName("a");
	for (i=0; i<links.length; i++)
		{links[i].onmousedown=f_apreta;}
}

//*************** FUNCIONES PARA VISUALIZACION OVERLAYS
function genLayer(idLayer, ancho, alto, sVis, texto, link, porcentaje){
var a;
var posLeft=0;
var posTop=0;

	a = link;
	posLeft = a.offsetLeft;
	posTop = a.offsetTop;
	
	while (a.offsetParent!=null){
		if (a.style.visibility=="hidden") {return false;}
		a = a.offsetParent;
		posLeft += a.offsetLeft;
		posTop += a.offsetTop;
		if (posLeft <0) posLeft=0;
		if (posTop <0) posTop=0;
	}

	try {
		var f = Math.round(porcentaje /2);
		if (f < 3) {f=2;}
		document.write('<div id=' + '"' + idLayer + '"' + 'style="position:absolute;left:' + posLeft + 'px;top:' + posTop + 'px;width: 50px; height:13px; border:1px solid; border-color: #0000a0; background-color: #F9FAA4;  -moz-opacity: 0.75; font-family:Arial,Helvetica,sans-serif; font-size:8pt; font-weight:bold; color:blue; visibility: visible; " valign="middle" align="left" > <img src="http://www.certifica.com/2007/img/square_blue.gif" height = "7" width="' + (f / 2) + '" /> ' + texto + ' </div>');
	} catch (e) {alert("error al generar capa");}
}

function showOverlay(idSitio, idPath){
var valor = getParameter('opt');
if (valor == false)
	{return false;}

var sumClicks = 0;
var x=0;
arrayAux = new Array();
var i =0;

for (x=0; x< (valor.length); x+=4)
	{if (i > arrayLinks.length-1) {break;}
	var numero = valor.substring(x,x+4);
	arrayAux[i] = new Array();
	arrayAux[i][0] =i;
	arrayAux[i][1]=parseInt(numero, 16);
	//sumClicks = sumClicks + parseInt(arrayAux[i][1]);
	if (arrayAux[i][1] > sumClicks) sumClicks = arrayAux[i][1];
	i++;
	}

var f = arrayAux.length;

//vinculos = catidad de vinculos existentes en documento
vinculos = document.getElementsByTagName("a");
for (x=f; x < vinculos.length; x++)
	{arrayAux[x] = new Array();
	arrayAux[x][0] =x;
	arrayAux[x][1] =0;}

//crea una matriz con el indice del link y su cantidad de clicks
var arrayResult = burbuja(arrayAux)

		if (arrayAux.length == 0)
			{alert("Debe iniciar sesion para visualizar overlays");
			return false;}
		for (x=0; x < vinculos.length; x++)
			{
			try {
				if (arrayAux[x][1])
					{txt=arrayAux[x][1];}
				else
					{txt="0";}
			}catch (e){
				txt="0";}
		var division = Math.round((arrayAux[x][1] * 80) / sumClicks);
			genLayer('Layer'+ arrayAux[x][0],50,20,'true', txt, vinculos[arrayAux[x][0]], division);
			}
}

function getParameter(parameter){
var url = location.href;
var index = url.indexOf("?");
index = url.indexOf(parameter,index) + parameter.length;
if (url.charAt(index) == "="){
	var result = url.indexOf("&",index);
	if (result == -1){result=url.length;};
	return url.substring(index + 1,result);
	}
return false;
}

function burbuja(inputArray) {

	for (var x = 0; x < inputArray.length-1;  x++) {
		for (var y = 0; y < inputArray.length-1; y++) {
try {
			if (parseInt(inputArray[y][1]) < parseInt(inputArray[y+1][1])){
				var valor = inputArray[y][1];
				var indice = inputArray[y][0];
				inputArray[y][1] = inputArray[y+1][1];
				inputArray[y][0] = inputArray[y+1][0];
				inputArray[y+1][1] = valor;
				inputArray[y+1][0] = indice;
			}
}
catch (e)
	{return false;}
		}
	}
return arrayAux;
}

function cert_overlay(id, page)
{instalaHdlr(id, page);
showOverlay(id, page);}
