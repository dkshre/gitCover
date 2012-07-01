/* Media Class */
ws.media = {
    emp: function(selector) {         
        glow.dom.get(selector).each(function() {
            var node        = glow.dom.get(this),                
                uid         = ws.utils.uid('emp'),
                nodeId      = node.attr('id') || uid,
                classname   = node.attr('class')+' ',
                format      = classname.match(/emp-f-(.*?)\ /)[1],
                bodyNode    = glow.dom.get('body'),
                autoplay    = node.hasClass('autoplay') ? true : false,                
                playlist    = node.attr('rel'),
                size        = '640x360', // Default MAP size
                lsPageType  = 't2_eav5_Started',
                audioHeight = 106,
                isMulticlip = false;
        
            if (playlist == '') { return; } // Don't continue if the playlist is not available (ex EMP teaser not populated)
         
			//Get the EMP version for the current service - if not set use default
			var empVersion = ws.config[ws.env.service].empVersion || ws.config.defaultEmpVersion,
				showButtons = true;//(empVersion == 2) ? true : false;

			//If emp version is 3 add class .emp3 to EMP node
			if (empVersion == 3){ 
				node.addClass('emp3'); 
			} 

            // Set options            
            if (ws.env.documentType == 'popup' && format == 'audio') { size = '466x138'; }            
            if (bodyNode.hasClass('story')) {
				if (format=='audio') {
	                size = node.parent().attr('class').match(/align-(left|right)-wrap/) ? '304x106' : '466x106';	
					if (empVersion == 3) {
						size = node.parent().attr('class').match(/align-(left|right)-wrap/) ? '304x115' : '466x115';
						if (ws.utils.getParentWithClass(node, 'li-listen').length) {
							size = '304x115';
						}
					}
				} else {
	                size = node.parent().attr('class').match(/align-(left|right)-wrap/) ? '320x180' : '448x252';
				}				
                if (glow.dom.get('.story .bx-livetext').length) {
                    //hack for livetext special events with 640emp and livetext box module on a full width story page - Royal Wedding                    
				    size = '640x360'; 
				}			                	
                lsPageType = 't2_eav2_Started';
            } else if (bodyNode.hasClass('index') || bodyNode.hasClass('topic-cluster')|| bodyNode.hasClass('cluster')) {			
                if (node.parent().hasClass('ts-512emp')) { size = '512x288';}
                if (node.parent().hasClass('ts-256emp')) { size = '256x144';}
				if (node.parent().hasClass('ts-384emp')) { size = '384x216';} 
                lsPageType = 't2_eav3_Started';
            } else if (bodyNode.hasClass('av-instance')) {
                lsPageType = 't2_eav1_Started';
                autoplay = true;   //Go ahead and embed and play
            } else if (bodyNode.hasClass('cluster')) {
                lsPageType = 't2_eav3_Started';
            }        

			var width = node.width();
            // Handle special case for MulticlipEMP
            if (ws.utils.getParentWithClass(node, ws.selectors.multiClipEmp).length) {
                //var width = ws.utils.getSlotWidth(node);
                //var width = node.width();
                size = width+'x'+audioHeight; 
                autoplay = node.hasClass('autoplay') ? true : false;
                isMulticlip = true;				
            } 	

			//if (empVersion == 3){ size = width+'x'+(width/16*9); }			
            
            // Size override if class name emp-s-WxH is set
            if (node.attr('class').match(/emp-s-/)) {
            	var overrideSize = node.attr('class').match(/emp-s-(.*)x(.*)/);            	            
            	size = overrideSize[1]+'x'+overrideSize[2];
            }
            
            // Check for devpublish and GEL sandbox
            if (location.href.match(/publish-wsnmas01/) && ws.env.service == 'gel') { playlist = playlist.replace('http://www.bbc.co.uk', 'http://gel.wsnmas07.national.core.bbc.co.uk/topcat/publish'); }            
            playlist = playlist.replace('http://www.bbc.co.uk/gel', 'http://gel.wsnmas07.national.core.bbc.co.uk/topcat/publish/gel');

            // Instantiate EMP
            var emp = new bbc.Emp();
                        
            size = size.match(/(.*)x(.*)/);
            if (format == 'audio') { 
				size[2] = audioHeight; 	
				if (size[1] <= 320 && empVersion == 3) {
					showButtons = false;
				}
				if (empVersion == 3) { 
					size[2] = 115; 
					//showButtons = false;
				}
			}
            if (format == 'video') { 
				if (empVersion <= 2){
					size[2] = parseInt(size[2])+35; // Add controls height
					showButtons = true;
				}
				if (size[1] <= 384 && empVersion == 3) {
					showButtons = false;
				}
                emp.set('config_settings_displayMode', 'standard');
            }   

            if (empVersion == 3) { 
	            var uxHighlightColour = ws.config[ws.env.service].empHighlightColour || '0xff0000';
				emp.set('uxHighlightColour', uxHighlightColour); 
			} 
            
            // Create container for player and move ID to that container
            node.prepend('<div id="'+nodeId+'" class="emp-player" style="height:'+size[2]+'px;"></div>');
			//node.prepend('<div id="'+nodeId+'" class="emp-player"></div>');
            node.removeAttr('id');			
			
            emp.setWidth(size[1]);
            emp.setHeight(size[2]);
            emp.setDomId(nodeId);
            
			//portuguese workaround
			
            var empLang = (ws.config[ws.env.service].empFontSupported === false) ? 'en' : ws.env.lang,
				empLang = ws.env.lang.match('pt-BR') ? 'pt' : empLang,
				showRelatedLinks = (empLang != 'en') ? true : false;
    
            emp.set('config_settings_language', empLang);
			if (empVersion == 3) {			
				emp.set('messagesFileUrl', 'http://www.bbc.co.uk/worldservice/emp/3/vocab/'+empLang+'.xml');	
				emp.set('showShareButton', 'true');
			}
            emp.set('config_settings_showPopoutButton', showButtons);//true);
            emp.set('config_settings_autoPlay', autoplay);
            emp.set('config_settings_showFooter', 'false');
			//emp.set('config_settings_showFullScreenButton', false);
			emp.set('relatedLinksCarousel', showRelatedLinks);
            emp.set('config.plugins.fmtjLiveStats.pageType', lsPageType);
            emp.setConfig('http://www.bbc.co.uk/worldservice/scripts/core/2/emp_jsapi_config.xml?'+ws.env.assetsVersion);
            emp.setPlaylist(playlist);
            if (glow.embed.Flash.version().major > 0) {
                //glow.dom.get('body').addClass('emp-loaded'); // Put this in straight away to lessen the layout jumps
				//emp.write(); 
            }
			
			// This is a hack so that when embedded on a 3rd party site, it doesn't autoplay
			//if (autoplay) { emp.set('config_settings_autoPlayEmbed', 'false&config_settings_autoPlay=false'); }
			
			var title = '',
				duration = 0;
				
			glow.net.get(playlist, {
			    useCache: true,
				onLoad: function(response){
					var markupDom = response.xml();
						title = glow.dom.get(markupDom).get('title').text();
						duration = glow.dom.get(markupDom).get('item').attr('duration');											
				},
			  	onError: function(response){},
			  	onAbort: function(response){}										
			});
			
            // Keep track of any playing EMPs on the page
            emp.onMediaPlayerInitialised = function() { 
				var obj = {
					mediaName : title, //	playlist				
					mediaId: nodeId.replace('emp-',''),					
					avType: format,
					mediaPlayerName: 'EMP',
					//mediaTitle: ,
					mediaLength: duration,
					mediaOffset: function(event) {
						return event.timecode;
					}
				}
				
				if (startMovie) { startMovie(obj); } 
                emp.register('onMediaPlaying');
                emp.register('onMediaPaused');
				emp.register('onMediaSeeking');
				emp.register('onMediaCompleted');
                emp.onMediaPlaying = function() { glow.events.fire(node, 'play'); if(playMovie) { playMovie(obj); }ws.env.empPlaying++; }
				
                emp.onMediaPaused = function() { 
					glow.events.fire(node, 'pause'); 
					emp.call("getCurrentTimecode", [], "statsEmpPaused");
					ws.env.empPlaying--; 
				}
				emp.onMediaSeeking = function() { }
				emp.onMediaCompleted = function() { if(endMovie) { stopMovie(obj); endMovie(obj); } } 
				
				emp.statsEmpPaused = function(event) { 
					//if(stopMovie){ 
					//	obj.mediaOffset = event.timecode; 
					//	stopMovie(obj);
					//}				  
				}				
            }			

            glow.events.removeAllListeners(node);      
            glow.events.addListener(node, 'pauseMedia', function() { emp.call('pause'); });
            glow.events.addListener(node, 'playMedia', function() { emp.call('play'); });		

            // Set body classnames
   			//if (glow.dom.get('.emp object, .emp embed').length) {			
			if (glow.embed.Flash.version().major > 9) {
    			glow.dom.get('body').addClass('emp-loaded');
				node.get('.emp-html-embed').destroy(); 
				emp.write(); 
    		} else {
    			glow.dom.get('body').removeClass('emp-loaded').addClass('emp-failed'); 
    		}  

			if (glow.dom.get('body').hasClass('emp-failed')) {
				var html5FileType=node.get('.emp-alt-handheld a').attr('rel') || '';
				
					// just catching variations for mp4 mime types
					if (html5FileType.match('mp4')) {html5FileType='video/mp4';}
				
					html5Element = document.createElement(format),
					canPlayFileType = !!(html5Element.canPlayType && html5Element.canPlayType(html5FileType).replace(/no/, ''));
	            
				if (canPlayFileType == true) {
				    node.get('.emp-img, .emp-title, .emp-summary, .emp-player').destroy();
				} else {
					node.get('.emp-html-embed').destroy();
				}
			}
        });
		
		// EMP alt text vocab fixes
		if (glow.dom.get('body').hasClass('av-instance')) {
		
			glow.dom.get('.wsAV-preference').destroy();

			var vocab = ws.vocab;
			
			var altLowResText = ws.vocab.get('altLinkLowRes'),
				altHighResText = ws.vocab.get('altLinkHighRes'),
				url = window.location.href;

			// If alt not set in vocab then set to null
			if (altHighResText == "" || typeof altHighResText == "undefined"){												
				altHighResText = null;
			} 
			if (altLowResText == "" || typeof altLowResText == "undefined"){												
				altLowResText = null;
			}

			if (altHighResText && altLowResText && (url.match('bw=bb') || url.match('bw=nb'))){
				
				var altText = altHighResText,
					param = 'bw=bb';
					
				if(url.match('bw=bb')){
					param = 'bw=nb';
					altText = altLowResText;
				}
					
				// Create and insert
				var empAltNode = '<div class="emp"><p class="emp-alt-screen"><a href="'+window.location.pathname+'?'+param+'&amp;mp=wm&amp;bbcws=1&amp;news=1">'+altText+'</a></p></div>';
				glow.dom.get('#player').append(empAltNode);	
			}
		}
    },
    
    multiClipEMP: function(selector) {
        var $ = glow.dom.get,
            visibleItems = 3,                 
            vocab = ws.vocab.dictionary;                      
        
        if (ws.env.service in ws.config) { visibleItems = ws.config[ws.env.service].multiClipEmpItems || 3; }

        glow.dom.get(selector).each(function() {
            var node = $(this),
                cleanHtml = ws.utils.outerHtml(node),
                items = node.get('.content li'),
                numItems = items.length,
                height = 5,
                currentItemPlaying = 0,
                isPopup = glow.dom.get('body').hasClass('popup') ? true : false;
                        
            if (isPopup) {
                // Handle popup player                 
                currentItemPlaying = window.opener.ws.popup.currentItemPlaying; 
            }
                                
            if (numItems > visibleItems) {                                        
              // Set the height and add custom scrollers               
              for (var i=0; i<visibleItems; i++) {
                var item = $(node.get('.content li').item(i));                 
                height += item.height() 
                        + parseInt(item.css(['padding-top','padding-bottom'])) 
                        + parseInt(item.css(['margin-top','margin-bottom'])); 
              } 
              node.get('.content').height(height);            
              //ws.modules.scrollable(node.get('.content'));         
            }     
                        
            node.get('.content li').each(function(i) { 
                var liNode = $(this);
                var linkNode = $(this).get('a');
                
                //if (glow.env.ie == 6) { liNode.removeClass('body-disabled'); }                        
                liNode.attr('data-index',i);        
                if ($(this).attr('rel').match('.xml')) {                    
                    var oe = (i%2) ? 'od' : 'ev';
                    $(this).addClass(oe);
                           
                    if (i==currentItemPlaying) {					
                        $(this).addClass('clip-loaded');
                        var av = ($(this).hasClass('ts-audio')) ? 'multiclipemp-audio' : 'multiclipemp-video';
                        var avType = ($(this).hasClass('ts-audio')) ? 'audio' : 'video';
                        ws.utils.getParentWithClass($(this),selector).addClass(av);
						
						//create emp holder
						glow.dom.create('<div class="emp emp-f-'+avType+'"></div>').insertBefore(node.get('.content'));
	                    reloadClip($(this), $(this).attr('rel'), false);	                    
                    }                                    
                    
                    // Copy duration to under the headline text if the teaser is not .ts-headline
                    if (liNode.attr('class').match(/ts-.*x.*/)) {
                        var durationHtml = ws.utils.outerHtml(liNode.get('.duration'));
                        liNode.get('.title').append(durationHtml);
                    }                                                                  
                }         
            });    
              
            // custom scrollbars are started here so it gives time for .emp-loaded to kick in 
            if (numItems > visibleItems) { 
            	ws.modules.scrollable(node.get('.content'));	                    	
            }
              
            glow.events.addListener(node.get('.content li'), 'click', function() {
                var clickedNode = $(this);                                                                     
                reloadClip(this, clickedNode.attr('rel'), true);      
                currentItemPlaying = clickedNode.attr('data-index');              
                return false;
            });              
                        
            node.get('.content').before('<p class="playlist-title">'+vocab.playlist+'</p>');                
            if (!glow.dom.get('body').hasClass('popup')) {
                //node.get('.content').after('<a href="#" class="popout-player">'+vocab.popoutPlayer+'<span></span></a>');
            }                                         
            
            // Set hover class for IE	
            items = node.get('.content li');            
			glow.events.addListener(items, 'mouseenter', function() {
                // Disable hover when slider is active
                if (node.get('.slider-active').length == 0) { glow.dom.get(this).addClass('hover'); } 
            });
			glow.events.addListener(items, 'mouseleave', function() { glow.dom.get(this).removeClass('hover'); });            
                    
            // Popup console
            glow.events.addListener(node.get('.popout-player'), 'click', function() {
                //ws.env.service = 'turkish';
                var popoutTemplate = '/worldservice/includes/core/2/screen/multiclipemp_popup.sssi?service='+ws.env.service,
                    popoutWindow = window.open(popoutTemplate,'multiclipemp','width='+(parseInt(node.width())+15)+',height='+node.height()+',scrollbars=no,toolbar=no,personalbar=no,location=no,directories=no,statusbar=no,menubar=no,resizable=no,status=no,left=60,screenX=60,top=100,screenY=100');; 

                // Pause player
                glow.events.fire(node.get('.emp'), 'pauseMedia');                
                
                // Pass parameters to popup                
                ws.popup = { 
                    html: cleanHtml,
                    currentItemPlaying: currentItemPlaying
                };                
                popoutWindow.focus();
                return false;
            });
            
            // Unhide module
            node.css('visibility', 'visible');           
                   
            function reloadClip(clickedItem, playlist, autoplay) {                            
                var empNode = node.get('.emp');                                   
                node.get('.content li, .content li a').removeClass('clip-playing').removeClass('clip-loaded');                  
                empNode.attr('rel', playlist).empty();                
                
                if (autoplay) { 
                    empNode.addClass('autoplay');
                    $(clickedItem).get('a').addClass('clip-playing'); 
                }   
                             
                $(clickedItem).addClass('clip-loaded');
                ws.media.emp(empNode);
                
                // Listen for play/pause events, and update UI
                glow.events.addListener(node.get('.emp'), 'play', function() { node.get('.clip-loaded a').addClass('clip-playing'); });
                glow.events.addListener(node.get('.emp'), 'pause', function() { node.get('.clip-loaded a').removeClass('clip-playing'); });                            
            }
        });                            
      },
      
    liveMAPTeaser: function(selector) {					
	
		// Find and process each teaser on the page that links to a potentially live MAP	
        glow.dom.get(selector).each(function() {					
		
			var currTeaser = this;	
						
			var currMedia = {	
				teaser: {
					node: null,
					liveClassName: ws.liveMAPTeaserSelector.substring(1),
					cta: {
						node: null,
						actionType: null,
						label: null
					}
				},
				page: {
					node: null,
					markup: null,
					url: null					
				},
				asset: {
					node: null,
					id: null,
					selector: "#player",
					liveClassName: ws.liveMAPAssetSelector.substring(1),
					broadcastStatus: null,
					durationInSecs: null	
				},		
				playlist: {
					selector: null,
					node: null,					
					url: null
				},					
				init: function(){
					this.getTeaserDom(currTeaser);
					this.getUrl();					
					this.getPageDom();
				},
				getTeaserDom: function(teaser){								
					currMedia.teaser.node = glow.dom.get(teaser);								
				},		
				getTeaserCta: function(){
					currMedia.teaser.cta.node = (currMedia.teaser.node).get("> .cta");
					if ((currMedia.teaser.cta.node).get("a").attr("class") == "video") {
						currMedia.teaser.cta.actionType = "watch";
					} else if ((currMedia.teaser.cta.node).get("a").attr("class") == "audio") {
						currMedia.teaser.cta.actionType = "listen";
					}
					currMedia.teaser.cta.label = (currMedia.teaser.cta.node).text();	
				},
				getUrl: function(){				
					var url = (currMedia.teaser.node).get('.cta').get('a').attr('href');
					if (!ws.isPublic && !ws.debug) {
						url = "/cgi-bin/topcat2/open/tunnel.pl?http://www.bbc.co.uk"+url+"?";
					}
					currMedia.page.url = url;
				},
				getPageDom: function(){			
					glow.net.get(currMedia.page.url, {
						onLoad: function(response){
							var rMarkupDom = response.text();
							rMarkup = rMarkupDom.toString();	
							
							var start = rMarkup.indexOf("<html");
							var end = rMarkup.indexOf("</html>");
							var rMarkup = rMarkup.substring(start,end);
																			
							currMedia.page.markup = rMarkup;					
							currMedia.page.node = glow.dom.create("<response>"+rMarkup+"</response>");												
							currMedia.asset.node = (currMedia.page.node).get(currMedia.asset.selector);
							currMedia.asset.id = (currMedia.asset.node).get("#legacy > div").attr("id");														
							currMedia.getBroadcastStatus();																				
						},
			  			onError: function(response){
			  				currMedia.page.node = null;
			  			},
			  			onAbort: function(response){
			  				currMedia.page.node = null;
			  			}										
					})					
				},
				getBroadcastStatus: function(){	
					if ((currMedia.asset.node).hasClass(currMedia.asset.liveClassName)){
						currMedia.asset.broadcastStatus = "live";							
					} else {
						currMedia.asset.broadcastStatus = "static";
					}
					if(currMedia.asset.broadcastStatus == "static"){															
						currMedia.getPlaylistUrl();						
						currMedia.getPlaylistDom();	
					}														
				},				
				getPlaylistUrl: function(){		
				
					//console.log("currMedia.asset.id: " + currMedia.asset.id);					
						
					if (currMedia.asset.id !== null) {						
						var url = null;						
						currMedia.playlist.selector = "#playlist-" + currMedia.asset.id;
						
						// First attempt at finding URL
						var linkElement = (currMedia.page.node).get(currMedia.playlist.selector);
						if (linkElement.length > 0) {					
							var url = linkElement.attr("href");
						}							
						//console.log("url: " + url);
																		
						// Potential workaround for if first method fails		
						if (url == null){										
							var linkSelector = (currMedia.playlist.selector).substring(1, (currMedia.playlist.selector).length);
							
							//console.log("linkSelector: " + linkSelector);
															
							var pattern = "<link [^>]*id=[\u0027|\u0022]" + linkSelector + "[\u0027|\u0022][^>]*>";
							var modifiers = "igm";
							var getLinkElement = new RegExp(pattern, modifiers);
							var linkElement = (getLinkElement.exec(currMedia.page.markup)).toString();
							pattern = "href=[\u0027|\u0022][^\u0027|\u0022]*[\u0027|\u0022]";
							var getHrefAttribute = new RegExp(pattern, modifiers);
							var hrefAttribute = (getHrefAttribute.exec(linkElement)).toString();
							url = hrefAttribute.substring(6, (hrefAttribute.length - 1));																																																											
						}
						
						// If URL still not found, set to null
						if (url == "" || typeof url == "undefined"){																		
							url = null;
						} 
						
						if (url !== null && !ws.isPublic) {
						//	url = "/cgi-bin/topcat2/tunnel.pl?"+url+"?";
						}	
						currMedia.playlist.url = url;					
																															
					}																			
				},
				getPlaylistDom: function(){		
					if (currMedia.playlist.url !== null) {
						glow.net.get(currMedia.playlist.url, {
							onLoad: function(response){		
								currMedia.playlist.node = response.xml();																																																					
								currMedia.getAssetDuration();
								currMedia.updateTeaser();		
							},
							onError: function(response){
								currMedia.playlist.node = null;		
								currMedia.updateTeaser();
							},
							onAbort: function(response){							
								currMedia.playlist.node = null;
								currMedia.updateTeaser();
							}
						})
					} else {
						currMedia.updateTeaser();
					}
				},
				getAssetDuration: function(){	
					if (currMedia.playlist.node !== null) {
					
						//console.log(currMedia.playlist.node);
					
						var durationInSecs = parseInt(glow.dom.get(currMedia.playlist.node).get("item").filter(function(){
							return glow.dom.get(this).attr("kind") == "programme";
						}).get("media").attr("duration"));									
											
						//console.log("durationInSecs:" + durationInSecs);											
											
						if (typeof durationInSecs == "number") {						
							currMedia.asset.durationInSecs = durationInSecs;										
						} 	
					}
				},
				formatDuration: function(durationInSecs){
					var duration = ws.durationFromSecs(durationInSecs);
					var hours = (((duration.hours).toString()).length == 1) ? "0" + duration.hours : duration.hours;
					var mins = (((duration.mins).toString()).length == 1) ? "0" + duration.mins : duration.mins;
					var secs = (((duration.secs).toString()).length == 1) ? "0" + duration.secs : duration.secs;
					var formattedDuration = "";
					if (duration.hours > 0) {
						formattedDuration = hours + ":";
					}
					if (duration.mins > 0) {
						formattedDuration = formattedDuration + mins + ":" + secs;
					}
					return formattedDuration;					
				},
				updateTeaser: function(){		
					
					//console.log("updating teaser");
				
					// Populate currMedia.teaser.cta				
					currMedia.getTeaserCta();
					
					// Make a copy of the current teaser to use 
					// as a base for building its replacement
					var newTeaser = (currMedia.teaser.node).clone();
					var newCta = newTeaser.get("> .cta");
					var actionType = currMedia.teaser.cta.actionType
										
					// Remove the classes associated with a live MAP
					newTeaser.removeClass(currMedia.teaser.liveClassName);	
					newCta.get(".live").replaceWith(newCta.get("a"));

					// Update the text label
					if (actionType == "watch" || actionType == "listen") {
						newCta.get("a span").text(ws.vocab.get(actionType))
					}					
					// Add the duration			
					if (currMedia.asset.durationInSecs !== null) {
						var formattedDuration = currMedia.formatDuration(currMedia.asset.durationInSecs);
						newCta.append(ws.vocab.get("duration") + ": <span>" + formattedDuration + "</span>");
					}
										
					// Replace the existing teaser with this modified one
					
					// Method 1: Fade in/out
					newTeaser.get("> .cta").replaceWith(newCta.clone());
					newCta.css("opacity", 0);
					
					// Fade out the whole node for associated items
					var fadeOutTarget = null;
					
					if (!(currMedia.teaser.node).parent().hasClass("associated")) {
						fadeOutTarget = currMedia.teaser.cta.node;
					} else {
						fadeOutTarget = currMedia.teaser.node;
					}
										
					glow.anim.fadeOut(fadeOutTarget, 1.75, {
						onComplete: function(){
							(currMedia.teaser.cta.node).replaceWith(newCta);
							glow.anim.fadeIn(newCta, .3, {
								onComplete: function(){
									currMedia.teaser.node.replaceWith(newTeaser);
								}
							});			
						}
					});				
					
					// Method 2: Straight swap
					// (currMedia.teaser.node).replaceWith(newTeaser);																 	
				}				
			}		                                                 						
			currMedia.init();					
		});							
	}          
} 
