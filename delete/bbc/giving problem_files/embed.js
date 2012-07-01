// scope everything
(function() {
    // set up vars
    var build = 'worldwide',  // emp build
        revision = '617329_617319',  // revision of emp to use
        flashVersion = '10.1',  // version of flash to enforce
        protocol = 'http',  // host protocol (http or https)
        domain = 'www.bbc.co.uk',  // host domain
        port = '',  // host port - blank is default ports (80 for http and 443 for https)
        logLevel = 'none',  // level of logging to present in console (used in combination with logLevels)
        logLevels = {  // key for level of logging to present in console (used in combination with logLevel)
            'none' : 0,
            'error' : 10,
            'warn' : 20,
            'info' : 30,
            'log' : 40,
            'debug' : 50
        },
        console = {};  // use our own console logger functionality
    
    // sniff for script tag
    (function() {
        var scriptTags = document.getElementsByTagName('script');
        for(var i = 0; i < scriptTags.length; i++) {
            var scriptSrc = scriptTags[i].getAttribute('src');
            if(scriptSrc) {
                // get script url
                var scriptUrl = (scriptSrc.match(/^[^\?\#]+/gi)[0] || '');
                
                // if this is embed script
                var scriptUrlRegex = new RegExp('/emp/(releases/)?' + build + '(/|/(embed|player)\.js|/revisions/[^/]+/(embed|player)\.js)?$', 'gi');
                if(scriptUrl.match(scriptUrlRegex)) {
                    // get script protocol, domain (and port number if there)
                    var getUriRegex = new RegExp('^(http[s]{0,1})://([^\?\&\#:/]+\.bbc[i]{0,1}(\.co\.uk|\.com))(:([0-9]+))?', 'gi');
    
                    var getProtocol = (scriptUrl.split(getUriRegex)[1] || '')
                    if(getProtocol.length > 1) {
                        protocol = getProtocol;
                    }
    
                    var getDomain = (scriptUrl.split(getUriRegex)[2] || '')
                    if(getDomain.length > 1) {
                        domain = getDomain;
                    }
    
                    var getPort = (scriptUrl.split(getUriRegex)[5] || '')
                    if(getPort.length > 1) {
                        port = getPort;
                    }
                    else if(getDomain.length > 1) {
                        // reset port if we've switched domain and there is no port stated
                        port = '';
                    }
                                  
                    // get script parameters
                    var params = scriptSrc.slice(scriptSrc.indexOf('?') + 1).split('&');
                    for(var a = 0; a < params.length; a++) {
                        param = params[a].split('=');
                        if(param[0] == 'logLevel') {
                            logLevel = (param[1] || '');
                        }
                    }
                }
            }
        }
    })();

    // enforce level of logging
    // uses 'logLevel' & 'logLevels' (above) to set level of logging
    // also gets around undefined console.log/whatever
    (function() {
        var logLevelInt = (logLevels[logLevel] || 0);
        for(var key in logLevels) {
            if(key !== 'none') {
                console[key] = (function(key) {
                    if((logLevelInt >= logLevels[key]) && window.console && window.console[key]) {
                        return function() {
                            var args = arguments;
                            if(args[0] && (typeof args[0] === 'string')) {
                                args[0] = build + ' : ' + args[0];
                            }
                            window.console[key].apply(window.console, args);
                        }
                    }
                    
                    return function() {};
                })(key);
            }
        }
    })();
    
    // dynamically create correct urls to resources
    var revisionUrl = protocol + '://' + domain + (port ? ':' + port : '') + '/emp/releases/' + build + '/revisions/' + revision,
        swfUrl = revisionUrl + '/' + revision + '_emp.swf',
        ctaUrl = revisionUrl + '/cta_play.png',
        popoutUrl = revisionUrl + '/pop.html';
    
    // debug config
    console.debug('logLevel', logLevel);
    console.debug('protocol', protocol);
    console.debug('domain', domain);
    console.debug('port', port);
    console.debug('revisionUrl', revisionUrl);
    console.debug('swfUrl', swfUrl);
    console.debug('ctaUrl', ctaUrl);
    console.debug('popoutUrl', popoutUrl);
    
    // define module so can be used via RequireJS    
    define(['jquery-1', 'swfobject-2'], function ($, swf) {
        window.embeddedMedia = {};
        
        // for storing player instances later
        embeddedMedia.playerInstances = {};
        
        // array of callbacks to run on write of each player instance
        embeddedMedia.playerInstancesCallbacks = [];
    
        embeddedMedia.Player = function(domId) {
            // set up data hashes first
            this.attrs = {};
            this.params = {};
            this.vars = {};
    
            // set domId if passed in
            if(domId) {
                this.setDomId(domId);
            }
    
            // assign some default values
            this.setParam('quality', 'high');
            this.setParam('wmode', 'default');
            this.setParam('allowFullScreen', 'true');
            this.setParam('allowScriptAccess', 'always');
            this.setFlashvar('embedReferer', document.referrer);
            this.setFlashvar('embedPageUrl', location.href);
            this.setFlashvar('uxHighlightColour', '0xf54897');
        };
    
        embeddedMedia.Player.prototype = {
            write: function(guidanceFlag) {
                // use isWritten() instead of isEmbedded() as takes a fraction of a second for DOM to update - hence
                // it's possible that isEmbedded() could return false even if write() has already been called
                if((typeof guidanceFlag == 'undefined') && this.isWritten() && (!this.hasChanged())) {
                    return;
                }
    
                if(bbc.guidance) {
                    guidance = bbc.guidance;
    
                    if(!embeddedMedia.guidanceInstalled) {
                        embeddedMedia.guidanceInstalled = true;
                        guidance.callbacks.toggle = guidance.callbacks.pass = function(status, callbackId) {
                            if(embeddedMedia.playerInstances[callbackId]) {
                                embeddedMedia.playerInstances[callbackId].write(status);
                            }
                        };
                    }
    
                    this.setFlashvar('guidance', guidanceFlag || guidance.status());
                }

                // generate id if not already set
                if(!this.getAttr('id')) {
                    this.setId('bbc_emp_embed_' + this.getDomId());
                }
    
                if(!this.getMessage()) {
                    this.setMessage($('#' + this.getDomId()).html());
                }
                
                for(var key in embeddedMedia.playerInstancesCallbacks) {
                    embeddedMedia.playerInstancesCallbacks[key](this);
                }
    
                if(!swf.hasFlashPlayerVersion(flashVersion)) {
                    // if not got correct flash player version, write message
                    this.writeMessage();
                }
                else if((this.getFlashvar('config_settings_autoPlay') !== 'true') && this.getBoilerPlateUrl()) {
                    // if this is not autoplay, and there is a boiler plate image, write boilerplate
                    this.writeBoilerPlate();
                }
                else {
                    this.writeEmp();
                }
    
                this.setWritten(true);
                this.setChanged(false);
            },
            writeEmp: function() {
                // empty container, and append temporary element to replace using swfobject
                $('#' + this.getDomId())
                    .empty()
                    .append($('<div />').attr({'id' : this.getId()}));
    
                // embed swf
                swf.embedSWF(
                    swfUrl,
                    this.getId(),
                    this.getWidth(),
                    this.getHeight(),
                    flashVersion,
                    false,
                    this.vars,
                    this.params,
                    this.attrs,
                    $.proxy(function(obj) {  // note the use of jQuery's proxy() method to give this the correct context i.e. the emp NOT swfobject
                        if(obj && obj.success && obj.ref) {
                            this.setEmbedded(obj.ref);
                        }
                        else {
                            this.writeMessage();
                        }
                    }, this)
                );
            },
            writeBoilerPlate: function() {
                // set to autoplay, so it plays when user clicks boiler plate
                this.setFlashvar('config_settings_autoPlay', 'true');
    
                // what colour to change play cta on hover - taken from uxHighlightColour
                var uxHighlightColour = this.getFlashvar('uxHighlightColour');
    
                // store the start rgba
                var ctaInitialRgba = {
                    'r': 0,
                    'g': 0,
                    'b': 0,
                    'a': 0.75
                };
    
                // store the end rgba
                var ctaHoverRgba = {
                    'r': parseInt(uxHighlightColour.substring(2,4), 16),
                    'g': parseInt(uxHighlightColour.substring(4,6), 16),
                    'b': parseInt(uxHighlightColour.substring(6,8), 16),
                    'a': 1
                };
    
                // add css to emp container
                var container = $('#' + this.getDomId())
                    .css({
                        'position' : 'relative',
                        'cursor'   : 'pointer',
                        'height'   : this.getHeight() + 'px'
                    });
    
                // create the boiler plate image
                var img = $('<img />')
                    .attr({
                        'src'    : this.getBoilerPlateUrl(),
                        'width'  : this.getWidth(),
                        'height' : this.getHeight()
                    });
    
                // create initial cta
                var ctaInitial = $('<a />')
                    .attr({'title' : 'Click to play'})
                    .css({
                        'background-color' : 'rgb(' + ctaInitialRgba.r + ', ' + ctaInitialRgba.g + ', ' + ctaInitialRgba.b + ')',
                        'opacity'          : ctaInitialRgba.a,
                        'width'            : '80px',
                        'height'           : '80px',
                        'display'          : 'block',
                        'position'         : 'absolute',
                        'left'             : '0',
                        'top'              : '50%',
                        'margin-top'       : function() { return '-' + parseInt($(this).height() / 2) + 'px'; }
                    });
    
                // clone cta for mouse hover event - hide it initially
                var ctaHover = $(ctaInitial)
                    .clone()
                    .css({
                        'background-color' : 'rgb(' + ctaHoverRgba.r + ', ' + ctaHoverRgba.g + ', ' + ctaHoverRgba.b + ')',
                        'opacity'          : '0'
                    });
    
                // IE 5.5 / 6.0 compatible alpha png
                var pngSrc = ctaUrl;
                var ctaPng = $('<div />')
                    .css({
                        'backgroundImage'  : ($.browser.msie ? 'none' : 'url("' + pngSrc + '")'),
                        'filter'           : 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + pngSrc + '",sizingMethod="image")',  // ignored by everything but IE
                        'width'            : '27px',
                        'height'           : '36px',
                        'display'          : 'block',
                        'position'         : 'absolute',
                        'top'              : '50%',
                        'left'             : function() { return parseInt((ctaInitial.width() - $(this).width()) / 2) + 'px'; },
                        'margin-top'       : function() { return '-' + parseInt($(this).height() / 2) + 'px'; }
                    });
    
                // apply events and add elements to dom
                $(container).bind({
                    // onclick write player
                    'click' : $.proxy(function() {  // note the use of jQuery's proxy() method to give this the correct context i.e. the emp NOT container
                        $(container).unbind();
                        this.writeEmp();
                    }, this),
                    // onmouseover change cta
                    'mouseover' : function() {
                        $(ctaHover).stop();  // stop all animations
                        $(ctaHover).css({
                            'opacity'      : ctaHoverRgba.a
                        });
                    },
                    // onmouseout change cta back
                    'mouseout' : function() {
                        $(ctaHover).animate({
                            'opacity'      : 0
                        }, 2500, 'swing');
                    }
                })
                .empty()
                .append(img)
                .append(ctaInitial)
                .append(ctaHover)
                .append(ctaPng);
            },
            writeMessage: function() {
                $('#' + this.getDomId())
                    .empty()
                    .append(this.getMessage());
            },
            setBoilerPlateUrl: function(value) {
                this.boilerPlateUrl = value;
            },
            getBoilerPlateUrl: function() {
                return this.boilerPlateUrl;
            },
            setFlashVersion : function() {},  // deprecated - kept for backwards compatibility
            getFlashVersion : function() {
                return flashVersion;
            },
            setWidth: function(value) {
                this.width = value;
            },
            getWidth: function() {
                return this.width;
            },
            setHeight: function(value) {
                this.height = value;
            },
            getHeight: function() {
                return this.height;
            },
            setPlaylist: function(value) {
                this.setFlashvar('playlist', value);
            },
            getPlaylist: function() {
                return this.getFlashvar('playlist');
            },
            setConfig: function(value) {
                this.setFlashvar('config', value);
            },
            getConfig: function() {
                return this.getFlashvar('config');
            },
            setDomId: function(value) {
                this.domId = value;  // id of element to embed the player inside
                this.setFlashvar('domId', this.domId);  // id used by player (inside flash) for callbacks - see embeddedMedia.api()
                embeddedMedia.playerInstances[this.domId] = this;  // add to reference object
            },
            getDomId: function(value) {
                return this.domId;
            },
            setId: function(value) {
                this.setAttr('id', value);
            },
            getId: function() {
                return this.getAttr('id');
            },
            setRevision: function() {},  // deprecated - kept for backwards compatibility
            getRevision: function() {
                return revision;
            },
            setWmode: function(value) {
                this.setParam('wmode', value);
            },
            getWmode: function() {
                return this.getParam('wmode');
            },
            setMessage: function(value) {
                this.message = value;
            },
            getMessage: function() {
                return this.message;
            },
            setAttr: function(key, value) {
                this.setChanged(true);
                this.attrs[key] = value;
            },
            getAttr: function(key) {
                return this.attrs[key];
            },
            setParam: function(key, value) {
                this.setChanged(true);
                this.params[key] = value;
            },
            getParam: function(key) {
                return this.params[key];
            },
            setVar: function(key, value) {  // for cross-compatibility
                this.setFlashvar(key, value);
            },
            getVar: function(key) {  // for cross-compatibility
                return this.getFlashvar(key);
            },
            setFlashvar: function(key, value) {
                 // encodes html entities - as flashvars variable pairs use '&' as delimiter
                 // ... also prevents double encoding (in case stakeholders have already encoded values)
                encodeDecodedValue = encodeURIComponent(decodeURIComponent(value));
                encodeValue = encodeURIComponent(value);
                if(encodeDecodedValue === encodeValue) {
                    value = encodeValue;
                }
                else {
                    value = encodeDecodedValue;
                }
                this.setChanged(true);
                this.vars[key] = value;
            },
            getFlashvar: function(key) {
                return this.vars[key];
            },
            set: function(key, value) {  // for backwards compatibility
                this.setFlashvar(key, value);
            },
            handleEvent: function(event) {
                if(!this[event.type]) {
                    return;
                }
                this[event.type](event, this);  // pass in domId so registered functions can access embeddedMedia.playerInstances
            },
            call: function(functionName, params, callbackFunction) {
                this.embed.call(functionName, params, callbackFunction);
            },
            register: function(eventType) {
                this.embed.register(eventType);
            },
            unregister: function(eventType) {
                this.embed.unregister(eventType);
            },
            setEmbedded: function(value) {
                this.embed = value;
            },
            isEmbedded: function() {
                return (this.embed) ? true : false;  // is player embedded on page
            },
            setWritten: function(value) {
                this.written = value;
            },
            isWritten: function() {
                return (this.written ? true : false);  // has player been written - different to isEmbedded()
            },
            setChanged: function(value) {
                this.changed = value;
            },
            hasChanged: function() {
                return (this.changed ? true : false);  // has player changed since written
            }
        };
    
        embeddedMedia.each = function(callback) {
            if(typeof callback == 'function') {
                for(var domId in embeddedMedia.playerInstances) {
                    callback(embeddedMedia.playerInstances[domId]);
                }
            }
        };
    
        embeddedMedia.eachWrite = function(callback) {
            if(typeof callback == 'function') {
                embeddedMedia.playerInstancesCallbacks.push(callback);
            }
        };
    
        embeddedMedia.writeAll = function() {
            embeddedMedia.each(function(emp) {
                emp.write();
            });
        };
    
        // wrapper function
        embeddedMedia.setPopoutUrl = function(value) {
            embeddedMedia.console.setPopoutUrl(value);
        };
    
        embeddedMedia.console = (function() {
            var popDetail = {};
    
            var setPopoutUrl = function(value) {
                popoutUrl = value;
            }
    
            var popoutSimulcast = function(pid, locale, colour) {
                var root = (locale && locale != 'en') ? '/iplayer/' + locale : '/iplayer';
                createPopup(root + '/console/' + pid + (colour ? ('/colour/' + colour) : '/colour/silver'), 'simulcastPop', 429, 512);
            }
    
            var popoutRadioInvoke = function(pid, locale) {
                var root = (locale && locale != 'en') ? '/iplayer/' + locale : '/iplayer';
                createPopup(root + '/console/' + pid, 'radioPop', 270, 512);
            }
    
            var popout = function(params, height, width, mode) {
                height = height * 1;
                width = width * 1;
    
                popDetail = {
                    params: params,
                    mode: mode,
                    height: height,
                    width: width
                };
    
                createPopup(popoutUrl, 'videoPop' + mode, height, width);
            }
    
            var createPopup = function(url, name, height, width) {
                var win = window.open(url, name, 'width=' + width + ',height=' + height + ',toolbar=no,resizable=no,scrollbars=no');
    
                if(!win.opener) {
                    win.opener = window.self;
                }
                if(win.focus) {
                    win.focus();
                }
    
                return win;
            }
    
            return {
                setPopoutUrl: function(value) {
                    setPopoutUrl(value);
                },
                popoutRadio: function(pid, locale) {
                    popoutRadioInvoke(pid, locale);
                },
                popoutRadioInvoke: function(pid, locale) {
                    popoutRadioInvoke(pid, locale);
                },
                popoutAudio: function(params, height, width) {
                    popout(params, height, width, 'audio');
                },
                popoutVideo: function(params, height, width) {
                    popout(params, height, width, 'standard');
                },
                popoutiPlayerVideo: function(params, height, width) {
                    popout(params,'323','512','standard');
                },
                popoutSimulcast: function(pid, locale, colour) {
                    popoutSimulcast(pid, locale, colour);
                },
                popoutBlackSimulcast: function(pid, locale) {
                    popoutSimulcast(pid, locale, 'black');
                },
                notifyParent: function(childWin) {
                    if(childWin && childWin.updatePlayer) {
                        childWin.updatePlayer(popDetail);
                    }
                }
            };
        })();
    
        embeddedMedia.diagnostics = (function() {
            return {
                openDiagnostics: function() {
                    var href = ((/bbc.co.uk(:\d{2,5})?\/iplayer/).test(location.href)) ? '/iplayer/diagnostics' : protocol + '://www.bbc.co.uk/iplayer/diagnostics';
                    var isPopup = (/emp\/pop/).test(location) || (/iplayer\/console/).test(location.href);
                    if(isPopup) {
                        window.open(href, '_blank');
                    } else {
                        location.href = href;
                    }
                }
            };
        })();
    
        embeddedMedia.api = (function() {
            return {
                handleEvent: function(domId, event) {
                    if(embeddedMedia.playerInstances[domId]) {
                        embeddedMedia.playerInstances[domId].handleEvent(event);
                    }
                }
            };
        })();
    
        if(!window.bbc) {
            window.bbc = {};
        }
        window.bbc.Emp = embeddedMedia.Player;
    
        $(document).trigger('empReady', [build, $, swf]);
        
        return embeddedMedia;
    });
})();