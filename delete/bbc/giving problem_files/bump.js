(function(){var b={},f={emp:"iplayer",emprev:"",protocol:"http",domain:"emp.bbci.co.uk",port:"",enableClear:false,enableMobile:false,appleDevice:false,touchDevice:false,logLevel:"none"},k={none:0,error:10,warn:20,info:30,log:40,debug:50},e={},p=function(r){for(var q in r){if((typeof f[q]!=="undefined")&&(typeof b[q]==="undefined")){if(typeof f[q]==="boolean"){b[q]=(function(s){switch(s.toLowerCase()){case"true":case"1":return true;case"false":case"0":case"":case null:return false;default:return Boolean(s)}})(r[q].toString())}else{if(typeof f[q]==="number"){b[q]=parseInt(r[q]);if(isNaN(b[q])){b[q]=0}}else{b[q]=r[q]}}}}},d="bbcBump",n=[],h=[],o="";(function(){var t={},w=document.cookie.split(";");for(var s=0;s<w.length;s++){var x=w[s].replace(/^\s\s*/,"").replace(/\s\s*$/,"");if(x.indexOf(d)===0){x=x.substring(d.length,x.length);var u=x.split("="),r=u[0].charAt(0).toLowerCase()+u[0].slice(1),q=(u[1]||"");t[r]=q}}p(t)})();(function(){var r=document.getElementsByTagName("script"),y={};for(var w=0;w<r.length;w++){var t=r[w].getAttribute("src");if(t){var u=(t.match(/^[^\?\#]+/gi)[0]||"");var A=new RegExp("/emp/(releases/)?bump(/|/(embed|player|define)\\.js|/revisions/[^/]+/(embed|player|define)\\.js)?$","gi");if(u.match(A)){var q=new RegExp("^(http[s]{0,1})://([^\\?\\&#:/]+\\.bbc[i]{0,1}(\\.co\\.uk|\\.com))(:([0-9]+))?","gi");var x=(u.split(q)[1]||"");if(x.length>1){y.protocol=x}var B=(u.split(q)[2]||"");if(B.length>1){y.domain=B}var s=(u.split(q)[5]||"");if(s.length>1){y.port=s}else{if(B.length>1){y.port=""}}var v=t.slice(t.indexOf("?")+1).split("&");for(var z=0;z<v.length;z++){param=v[z].split("=");y[param[0]]=(param[1]||"")}}}}p(y)})();p(f);(function(){var r=(k[b.logLevel]||0);for(var q in k){if(q!=="none"){e[q]=(function(s){if((r>=k[s])&&window.console&&window.console[s]){return function(){var t=arguments;if(t[0]&&(typeof t[0]==="string")){t[0]="bump : "+t[0]}window.console[s].apply(window.console,t)}}return function(){}})(q)}}})();e.debug("config",b);var a=b.emp,j=function(){var q=b.enableClear;e.debug("clearEnabled",q);return q},m=function(){var q=b.enableMobile;e.debug("mobileEnabled",q);return q},g=function(){var q=(b.appleDevice||navigator.userAgent.match(/(iPad|iPhone|iPod)/i));e.debug("appleDevice",q);return q},c=function(){var q=(b.touchDevice||("ontouchstart" in window));e.debug("touchDevice",q);return q};if(j()&&g()){a="clear"}else{if(m()&&c()){a="mobile"}else{}}e.log("EMP : "+a);var l=b.protocol+"://"+b.domain+(b.port.length?":"+b.port:"")+"/emp/"+a+(b.emprev.length?"/revisions/"+b.emprev:"")+"/embed.js"+(b.logLevel!=="none"?"?logLevel="+b.logLevel:"");e.log("moduleUrl : "+l);window.embeddedMedia={};var i=(function(){var q=function(t){e.debug("Stub",arguments);this._delayedCalls=[];this._delayedCalls.stubAdded=true;for(var s=0,r=(t||[]).length;s<r;++s){(function(u,v){u[v]=function(){this.addDelayedCall(v,arguments)};u[v].stubAdded=true})(this,t[s])}};q.prototype={growInto:function(u){for(var t in u){if(!this.hasOwnProperty(t)||(this[t]&&this[t].stubAdded)){e.debug("Stub.growInto : "+t,u[t]);this[t]=u[t]}}for(var s=0,r=this._delayedCalls.length;s<r;++s){(function(w,x,v){if(typeof x=="function"){x.apply(embeddedMedia,[w])}else{w[x].apply(w,v)}})(this,this._delayedCalls[s][0],this._delayedCalls[s][1])}delete this._delayedCalls;delete this.growInto},addDelayedCall:function(s,r){e.debug("Stub.addDelayedCall : "+s,r);this._delayedCalls.push([s,r])}};return q})();embeddedMedia.Player=function(r){i.call(this,["write","setBoilerPlateUrl","setFlashVersion","setWidth","setHeight","setPlaylist","setConfig","setDomId","setId","setRevision","setWmode","setMessage","setAttr","setParam","setVar","setFlashvar","set","handleEvent","call","register","unregister","setEmbedded","isEmbedded","setWritten","isWritten","setChanged","hasChanged"]);n.push(this);if(typeof r!=="undefined"){var q=(n.length-1);n[q].addDelayedCall("setDomId",new Array(r))}};embeddedMedia.Player.prototype=i.prototype;embeddedMedia.each=function(s){for(var r=0,q=n.length;r<q;++r){n[r].addDelayedCall(s)}};embeddedMedia.eachWrite=function(q){h.push(q)};embeddedMedia.writeAll=function(){for(var r=0,q=n.length;r<q;++r){n[r].addDelayedCall("write",arguments)}};embeddedMedia.setPopoutUrl=function(q){o=q};if(!window.bbc){window.bbc={}}window.bbc.Emp=embeddedMedia.Player;require([l],function(s){for(var r=0,q=h.length;r<q;++r){s.eachWrite(h[r])}if(o.length>0){s.setPopoutUrl(o)}for(var r=0,q=n.length;r<q;++r){n[r].growInto(new s.Player())}})})();