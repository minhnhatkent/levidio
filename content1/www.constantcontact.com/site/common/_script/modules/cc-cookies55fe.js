if(typeof(ctct)=='undefined'){ctct={};}
ctct.cookies=(function ctctCookies(){function _add(args){try{var today=new Date();today.setTime(today.getTime());var expires;if(args.expires){expires=args.expires*1000*60*60*24;}
var expires_date=new Date(today.getTime()+(expires));if(typeof(args.name)!='string'||args.name==""||typeof(args.value)=='undefined'){return false;}else{document.cookie=args.name+"="+args.value+
((args.expires)?";expires="+expires_date.toGMTString():"")+
((args.path)?";path="+args.path:"")+
((args.domain)?";domain="+args.domain:"")+
((args.secure)?";secure":"");return true;}}
catch(e){return false;}}
function _remove(args){if(_get({name:args.name}))document.cookie=args.name+"="+
((args.path)?";path="+args.path:"")+
((args.domain)?";domain="+args.domain:"")+
";expires=Thu, 01-Jan-1970 00:00:01 GMT";}
function _get(args){var start=document.cookie.indexOf(args.name+"=");var len=start+args.name.length+1;if((!start)&&(args.name!=document.cookie.substring(0,args.name.length))){return null;}
if(start==-1)return null;var end=document.cookie.indexOf(";",len);if(end==-1)end=document.cookie.length;return unescape(document.cookie.substring(len,end));}
var _cookies_enabled=false;if(typeof window.navigator.cookiesEnabled!='undefined'){_cookies_enabled=window.navigator.cookiesEnabled;}else{_add({name:'testcookieenabled',value:'123'});if(_get({name:'testcookieenabled'})!==null){_cookies_enabled=true;}
_remove({name:'testcookieenabled'});}
return{add:function(args){return _add(args);},get:function(args){return _get(args);},remove:function(args){_remove(args);},enabled:_cookies_enabled};})();