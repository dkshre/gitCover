/* Modules/UI Class */
ws.modules = {
	    carousel: function(selector) {
	    glow.dom.get(selector).each(function(i) {	        
        	  
	    	var carouselNode = glow.dom.get(this),
	            carouselInstance = this,
	            carouselNum = i;
	            autoscrollSelector = '.carousel-autoscroll',
	            carouselItems = carouselNode.get('ul li'),
	            itemsHaveBeenRemoved = false;
	        
	        // Remove any items which have no teasers or are empty	        
	        carouselItems.each(function() { 
	            var thisItem = glow.dom.get(this);
                if ((thisItem.attr('class') != null && !thisItem.attr('class').match(/ts-.*x.*/)) || glow.lang.trim(thisItem.text()) == '') { thisItem.destroy(); }
                itemsHaveBeenRemoved = true;
            });
            if (itemsHaveBeenRemoved) { carouselItems = carouselNode.get('ul li'); }
	        
	        var teaserSize = carouselItems.attr('class').match(/ts-(.*?)\ /)[1];						
			carouselNode.addClass('li-carousel-'+teaserSize);
			
			//need to set width and height for Glow carousel to calculate correct scroll
	        if(teaserSize=='304x171'){
	        	carouselItems.css('width','291px').css('overflow','hidden');
	        	carouselItems.get('a img').attr('width','290').attr('height','162');
		        //pre-process carousel item summary markup
				carouselItems.get('div.body').each(function(){
					var thisNode = glow.dom.get(this);
					thisNode.parent().get('p.title').append('<span class="summary">' + thisNode.get('.summary').html() + '</span>');
					thisNode.destroy();
				})
	        }else if(teaserSize=='144x81'){
	        	carouselItems.css('width','145px');
	        	carouselItems.css('overflow','hidden');
	        }
	        
	        // define how many items per page depending on carousel width and teaser size
	        var numItemsPerPage = Math.floor(ws.utils.getSlotWidth(carouselNode)/parseInt(carouselItems.css('width')));
	        numPages = (carouselItems.length / numItemsPerPage);
  
	        /* Ensure correct numnber of items in carousel */
	        var excessItems = carouselItems.length % numItemsPerPage;
	        if(excessItems != 0){
	        	var correctNumItems = carouselItems.length-excessItems;
	        	var excessItemIndex = correctNumItems;
	        	while(excessItemIndex < carouselItems.length){
	        		glow.dom.get(carouselItems[excessItemIndex]).destroy();
	        		excessItemIndex++;
	        	}
	        	carouselItems = carouselItems.slice(0,correctNumItems);
	        }
            
	        this.scrollDelay = 5000;
	        this.autoScroll = true;
	        this.pauseScroll = false;
	        
	        var Carousel = new glow.widgets.Carousel(carouselNode.get('ul'), {
	        	loop: true,
	            animDuration: 0.8,
	            className: 'gel-carousel',
	            theme: 'gel-generic',
	            step: 'page',
	            size: numItemsPerPage
	        });
			
			// Change internal Glow carousel variable to enable RTL behaviour
	        if (ws.env.direction == 'rtl') { 
	        	Carousel._direction = 'right'; 
	        }
  
			glow.events.addListener(carouselNode, 'click', function() { 
				carouselInstance.autoScroll = false; 
			});
			
			//remove width styles once glow has calculated correct width for carousel to scroll
			var carouselItemMaxHeight = 0;
			carouselNode.get('ul li').css('width','').each(function(){
				var carouselItemHeight = parseInt(glow.dom.get(this).css('height'));
				if(carouselItemHeight > carouselItemMaxHeight) carouselItemMaxHeight = carouselItemHeight;
			});
			carouselNode.get('.carousel-content,li,.carousel-nav').css('height',carouselItemMaxHeight);
			
			/* carousel page navigation */
			var carouselPageNav = glow.dom.create('<ol class="carousel-page-nav"></ol>');
			var carouselPageNavItem = '';
			var numPages = carouselItems.length / numItemsPerPage;

			for (i = 0; i < numPages; i++){
				var countLabel = (ws.vocab.numbers) ? ws.vocab.numbers[i+1] : (i+1);
				carouselPageNavItem = glow.dom.create('<li class="carousel-page-nav-' + i + '">' + countLabel + '</li>');
				if(i==0)carouselPageNavItem.addClass('current');
				carouselPageNav.append(carouselPageNavItem);
			}
			carouselNode.prepend(carouselPageNav);
			
			// Set nav width to fix IE7 right float bug
	        if (ws.env.direction == 'rtl') {
	        	var navItemMargin = parseInt(carouselPageNavItem.css('margin-right'));
	        	var navItemWidth = 0;
	        	carouselPageNav.get('li').each(function(){
	        		navItemWidth += glow.dom.get(this).width();
	        	})
	        	var navWidth = navItemWidth + (navItemMargin*numPages);
	        	carouselPageNav.css('width',navWidth);
	        }
			
			var navItems = carouselNode.get('.carousel-page-nav li');
			glow.events.addListener(navItems,  'mouseenter', function () {	
				glow.dom.get(this).addClass('mouse-over');
			});
			glow.events.addListener(navItems,  'mouseleave', function () {	
				glow.dom.get(this).removeClass('mouse-over');
			});
			glow.events.addListener(navItems, 'click', function () {
				var thisItem = glow.dom.get(this);
				navItems.removeClass('current');
				thisItem.addClass('current');
				var itemClass = thisItem.attr('class').match(/carousel-page-nav-(.*?)\ /)[1];
				var pageNum = itemClass.substr((itemClass.lastIndexOf('-')+1));
				var targetItem = (pageNum*Carousel._opts.size);
				Carousel.moveTo(targetItem,true);
			});
	        glow.events.addListener(Carousel, 'scroll', function() { 
	        	navItems.removeClass('current');
	        });
	        glow.events.addListener(Carousel, 'afterScroll', function() { 
	        	carouselNode.get(navItems[Carousel.visibleIndexes()[0]/numItemsPerPage]).addClass('current');
	        });
 
	        // Mark which items are visible
			Carousel.visibleItems().addClass('visible');
	        glow.events.addListener(Carousel, 'scroll', function() { 
	        	this.items.removeClass('visible'); 
	        });
	        glow.events.addListener(Carousel, 'afterScroll', function(e) { 
	        	this.visibleItems().addClass('visible');
	        });

			// Autoscroll	                     		
	        if(carouselNode.ancestors().get(autoscrollSelector).length) {
				// combination with emp does not work for ie.
				if (!(glow.env.ie && ws.env.empPlaying)) {				
					glow.events.addListener(carouselNode, 'mouseover', function() { this.pauseScroll = true; });
			        glow.events.addListener(carouselNode, 'mouseout', function() { this.pauseScroll = false; });
	        	    this.timeout = setInterval(function() { 
	                   if (carouselInstance.autoScroll && !carouselInstance.pauseScroll) { carousel.next(); }
	                }, this.scrollDelay);	        	    
				}
			} 
			
			carouselNode.css({"visibility": "visible", "height":"auto"});                     
	    });
	},
    
    enlargeImage: function(selector) {
        glow.dom.get(selector).each(function() {

        	var lightboxNode   = glow.dom.get(this),                
                imgDescription = lightboxNode.get('.body > div').text(),
				title          = (lightboxNode.get('.title').length > 0) ? lightboxNode.get('.title').text() : '',
                largeImageHtml = lightboxNode.get('.content div').html(),
                largeImageUrl  = lightboxNode.get('.content a').attr('href');

             // Get image width from URL
             var urlParts = largeImageUrl.split('?');
             if (typeof(urlParts[1]) != 'undefined') {
                largeImageWidth = glow.data.decodeUrl(urlParts[1]); 
                largeImageWidth = parseInt(largeImageWidth['w']);
             } else {
                largeImageWidth = 466;
             }

             if (!isNaN(largeImageWidth)) { // Create lightbox if largeImageWidth is valid
               var thumbnail   = lightboxNode.get('.content img'),
                   enlargeLink = lightboxNode.get('.content a');
  
               // Create <div> in Glow Lightbox Panel Format
               var html = '<div class="bx-enlargeimage">'
			   			+ '<a class="ws-popup-close" href="#">X</a>'
			   			+ '<h2 class="hd">'+title+'</h2>'
                        + '<img src="'+largeImageUrl+'">'
                        + '<p class="ft">'+imgDescription+'</p>'
						+ '</div>';
                                       
               var Lightbox = new glow.widgets.Overlay(glow.dom.create(html), {                  
                   modal: true,
                   anim: null,
                   className: 'ws-modal-popup'
               });
			    
			   Lightbox.container.width(largeImageWidth);
               
               glow.events.addListener(Lightbox.container.get('.ws-popup-close'), 'click', function() { Lightbox.hide(); return false; });
               glow.events.addListener(enlargeLink, 'click', function() { Lightbox.show(); return false; });
               glow.events.addListener(thumbnail, 'click', function() { Lightbox.show(); return false; });                 
            }
          });
    },  
    
    boxQuote: function(selector) {
		glow.dom.create('<span class="open-quote"><span>&#8220;</span></span>').prependTo('blockquote > .body');
		glow.dom.create('<span class="close-quote"><span>&#8221;</span></span>').appendTo('blockquote > .body');
    },
    
    ticker: function(selector) {
    	glow.dom.get(selector).each(function() {

			var currentTicker = glow.dom.get(this); 
			currentTicker.wrap('<div class="' + currentTicker.attr('class') + '"></div>')
					.attr('class','ticker-wrapper'); 
			currentTicker = currentTicker.parent();
			
			currentTicker.items =  currentTicker.get('.ticker-wrapper > ul li');
			currentTicker.firstItem = currentTicker.get('.ticker-wrapper > ul li.first');
			currentTicker.numItems = currentTicker.items.length;
            currentTicker.position = 0;
            currentTicker.pauseTicker = false;
            currentTicker.stopTicker = false;
   
            loadTickerControls();

            glow.events.addListener(currentTicker, 'mouseover', function() {
            	if (currentTicker.stopTicker != true ) currentTicker.pauseTicker = true; 
            });
            glow.events.addListener(currentTicker, 'mouseout', function() { 
            	if (currentTicker.stopTicker != true ) currentTicker.pauseTicker = false; }
            );
            
            if (currentTicker.numItems > 1) { currentTicker.timeout = setInterval(nextHeadline, 4000); } 
            
	        function nextHeadline() {   
	            if (currentTicker.pauseTicker == false) { 
	            	if(currentTicker.position >= (currentTicker.numItems-1)){
	            		currentTicker.position = 0;
	            	} else {
	            		currentTicker.position = (currentTicker.position + 1);
	            	}
	            	goToHeadline(true); 
	            }
	        }
	        
		    function goToHeadline(animate) {
		    	if( animate === true ){
		    		glow.anim.fadeOut(currentTicker.items.get('a,span.cta'), 1, {
		                onComplete: function() {
		                	currentTicker.items.hide();
		                	var showHeadline = glow.dom.get(currentTicker.items.item(currentTicker.position));
	            			showHeadline.show();
		                    glow.anim.fadeIn(showHeadline.get('a,span.cta'));                     
		                }
		            }); 
	            } else {
	            	currentTicker.stopTicker = true;
	            	currentTicker.get('.pause').addClass('stopped');
	            	currentTicker.items.hide();
	            	var showHeadline = glow.dom.get(currentTicker.items.item(currentTicker.position));
	            	showHeadline.show().get('a,span.cta').css('opacity',1);
	            }        
	        }
	        
		    function loadTickerControls(){
	        	var tickerControls = glow.dom.create('<div class="ticker-controls"><ul></ul></div>');
	        	var pauseTicker = glow.dom.create('<li class="pause"><a href="">Pause ticker</a></li>');
	        	var prevItem = glow.dom.create('<li class="prev"><a href="">Previous item</a></li>');
	        	var nextItem = glow.dom.create('<li class="next"><a href="">Next item</a></li>');
	        	tickerControls.get('ul').append(pauseTicker).append(prevItem).append(nextItem);
	        	currentTicker.get('.ticker-wrapper').append(tickerControls);
	        	showTicker();
	        	
	        	glow.events.addListener(currentTicker.get('.ticker-controls li'), 'mouseover', function() { 
	        		var thisNode = glow.dom.get(this);
	        		thisNode.get('a').addClass('hover');
	        	});
	        	
	        	glow.events.addListener(currentTicker.get('.ticker-controls li'), 'mouseleave', function() { 
	        		var thisNode = glow.dom.get(this);
	        		thisNode.get('a').removeClass('hover');
	        	});
	        	
	        	glow.events.addListener(currentTicker.get('.pause a'), 'click', function(e) {
	        		var thisNode = glow.dom.get(this);
	        		thisNode.parent().hasClass('stopped') ? currentTicker.stopTicker = false : currentTicker.stopTicker = true ;
	        		thisNode.parent().toggleClass('stopped');
	        		e.preventDefault();
	        	});
	        	
	        	glow.events.addListener(currentTicker.get('.prev a'), 'click', function(e) {
	        		var thisNode = glow.dom.get(this);
	        		if(currentTicker.position <= 0){
	        			currentTicker.position = currentTicker.numItems - 1; 
	        		} else {
	        			currentTicker.position = currentTicker.position - 1;
	        		}
	        		goToHeadline(false);
	        		e.preventDefault();
	        	});
	        	
	        	glow.events.addListener(currentTicker.get('.next a'), 'click', function(e) {
	        		var thisNode = glow.dom.get(this);
	        		if(currentTicker.position >= (currentTicker.numItems - 1)){
	        			currentTicker.position = 0; 
	        		} else {
	        			currentTicker.position = currentTicker.position + 1;
	        		}
	        		goToHeadline(false);
	        		e.preventDefault();
	        	});
	        }
  	
        	function showTicker(){
        		currentTicker.items.hide();
        		currentTicker.firstItem.show();
            	currentTicker.get('.ticker-wrapper, .title, .ts-headline').css('display', 'block'); 
        	}

        });

    },

    pictureGallery: function(selector) {       
        glow.dom.get(selector).each(function() {
             var thisGallery = this,
                 galleryNode = glow.dom.get(this),
                 isLightboxGallery = galleryNode[0].className.match('lightbox') ? true : false,                 
                 galleryTitle = (galleryNode.get('.title').length > 0) ? galleryNode.get('.title').text() : '',
                 direction = ws.env.direction,   
                 captionOpacity = 0.75,                                      
                 imageList = [],
                 currentImage = 0,
                 showCaptions = true,
                 playback = false,
                 playbackDelay = 5000,
                 _playbackTimer,
                 galleryInstance = this,
                 inTransition = false,
                 preloadImg = new Image(),
                 crossFade,
                 galleryPanel,
                 vocab = ws.vocab.dictionary;

            galleryNode.css('visibility', 'hidden');
			
			var gallerySize = galleryNode.attr('class').match(/pg-([0-9]+)x([0-9]+)/i),
                galleryWidth = parseInt(gallerySize[1]),
                galleryHeight = parseInt(gallerySize[2]),                
                thumbsVisible = (galleryWidth == 226 || galleryNode.attr('class').match('hide-thumbs')) ? false : true,                
                isJournalGallery = galleryNode.attr('class').match('journal') ? true : false;                                                    
            
            	
             // Assign an ID to the gallery if it is missing one
             var galleryId = galleryNode.attr('id') || ws.utils.uid('gallery');
             galleryNode.attr('id', galleryId);
                                       
             var thumbsHtml = '<ul class="gallery-thumbs">';
             galleryNode.get('> .content > ul > li').each(function(count) {
                var imageNode = glow.dom.get(this),
                    imageItem = {
                      src: imageNode.get('a').attr('href'),
                      alt: imageNode.get('img').attr('alt'),
                      thumbSrc: imageNode.get('img').attr('src'),
                      caption: imageNode.text()
                    };
                
                if (isJournalGallery) { 
                    imageItem.caption = '';
                    if (imageNode.get('> .bx-picture > .title').length>0) { 
                        imageItem.caption += ws.utils.outerHtml(imageNode.get('> .bx-picture > .title')); 
                    }
                    imageItem.caption += imageNode.get('.body').html(); 
                    imageItem.caption += ws.utils.outerHtml(imageNode.get('.associated')); 
                }
                imageList.push(imageItem);
                thumbsHtml += '<li><a class="pos-'+(count+1)+'" href="#">'+ws.utils.outerHtml(imageNode.get('img'))+'</a></li>';                
             });
             thumbsHtml += '</ul>';
             
             galleryNode.get('.content > ul').remove(); // Remove ul from original markup                                       
                               
             var imageCount = imageList.length;
             
             if (location.hash.match('#gallerypic-')) {
                currentImage = parseInt(location.hash.replace('#gallerypic-', '')) - 1;
             }
             
             var footerNav = '<div class="footer-nav blq-clearfix"><p class="image-counter"></p>' 
                           + '<ul class="controls"><li><a class="hideshow-captions"><span>'+vocab.hideCaptions+'</span></a></li><li><a class="startstop-slideshow"><span>'+vocab.startSlideShow+'</span></a></li></ul></div>'
                          
             var galleryHtml = '<div class="images">'
                             + '  <div class="pane front"><img src="'+imageList[currentImage].src+'" /></div>'
                             + '  <div class="pane back"><img src="'+imageList[currentImage].src+'" /></div>'
                             + '  <div class="caption"><p>'+imageList[currentImage].caption+'</p></div>'
                             + '</div>'                             
                             + '<div class="overlay-nav"><a class="prev"></a><a class="next"></a></div>'
                             + '<div class="thumbs-nav">'+thumbsHtml+'</div>'                             
                             + footerNav;
                             
             if (isLightboxGallery) {
            	 
//            	 switch (ws.utils.getSlotWidth(galleryNode)) {
//		    		 case 336:
//		    		     var teaserImgWidth='336';
//		    		     var teaserImgHeight='189';
//		    		     break
//		    		 default:
//		    			 var teaserImgWidth='304';
//		    		     var teaserImgHeight='171';
//		    		 break
//	    		 }
	    		 
		 		 var teaserImgWidth='304';
    		     var teaserImgHeight='171';

                 // Add poster CTA if not present
                if (!galleryNode.get('.content a.cta').length) {
                    var contentNode = galleryNode.get('.content'),
                        summary = galleryNode.get('> .body').html();
                        firstImageSrc = imageList[0].src.replace('http://', '');
                        chefImage = 'http://www.bbc.co.uk/worldservice/ic/' + teaserImgWidth + 'x' + teaserImgHeight + '/'+firstImageSrc;
                        
                    galleryNode.get('> .body').remove();
                    
                    if(summary != ''){
                    	summary = '<p class="caption">'+summary+'</p>';
                    } else {
                    	summary = '';
                    }
                    var ctaHtml = '<a class="cta" href="#">'
                                + '<img alt="'+imageList[0].alt+'" src="'+chefImage+'" class="poster" width="' + teaserImgWidth + '" height="' + teaserImgHeight + '"/>'
                                + '</a>'
                                + '<div class="body">'
                                + summary + '<a class="cta" href="'+imageList[0].src+'"><span></span>'+vocab.viewGallery+'</a>'
                                + '</div>';  
  
                    contentNode.append(ctaHtml);
                    contentNode.get('> .body').css('margin-top', '0');                                        
                }
                 
                 var galleryClass = isJournalGallery ? 'lightbox-journal' : 'lightbox-caption';
                 galleryHtml = '<div id="'+galleryId+'" class="li-picturegallery '+galleryClass+' ' + gallerySize[0] + '">'
			     			 + '<a class="ws-popup-close" title="close" href="#">X</a>'
			                 + '<h2 class="hd">'+galleryTitle+'</h2>'
                             + '<div class="content">'
                             + galleryHtml
                             + '</div></div></div>';                                                      

                 glow.dom.get('body').prepend(galleryHtml);                                                        
                 galleryNode = glow.dom.get('#'+galleryId);                                  
                 galleryNode.get('.thumbs-nav').width(galleryWidth);
                 
             } else {
                 galleryNode.get('.content').html(galleryHtml).css('height','auto');   
                 glow.dom.get(galleryNode).css('height','auto');                               
             }                       
             
             // IE6 PNG Alpha Fix

             
             if (glow.env.ie) { 
                captionOpacity = 0.75; 
                galleryNode.get('.caption').css('background','transparent')
                                           .css('background-color','#000')
                                           .css('opacity', captionOpacity);                               
             }

             // Add black matte so that true black colours don't show as transparent in IE
             // http://social.msdn.microsoft.com/forums/en-US/iewebdevelopment/thread/4df69380-c1ef-4fb6-8e7b-f133131b4abe
             galleryNode.get('.images').append('<div class="black-matte"></div>');
             
             var frontPane = galleryNode.get('.images .front'),
                 frontPaneImage = galleryNode.get('.images .front img'),
                 backPane = galleryNode.get('.images .back'),
                 backPaneImage = galleryNode.get('.images .back img');
                 
                                           
             galleryNode.get('.overlay-nav').width(galleryWidth).height(galleryHeight);
             
             galleryNode.get('.overlay-nav').css('opacity', '0');             
             galleryNode.get('.images').height(galleryHeight);
             galleryNode.get('.images .caption').width(galleryWidth);
             galleryNode.get('.gallery-thumbs').css('display', 'block');
             
             frontPane.css('opacity', '1');                      
             backPane.css('opacity', '0');                           
            
             if (isJournalGallery) { 
            	var journalGalleryWrapper = glow.dom.create('<div class="pg-journal-wrapper"></div>');
            	var journalGalleryContent = galleryNode.get('.content');
            	journalGalleryWrapper.append(journalGalleryContent)
            						 .append('<div class="bodytext"></div>')
            						 .appendTo(galleryNode);
            	galleryNode.get('.images, .thumbs-nav').width(galleryWidth);                
             }
              
             if (thumbsVisible) {
             	// Add title attributes to enable tooltips on thumbs
             	galleryNode.get('.gallery-thumbs img').each(function() {
             		var alt = this.getAttribute('alt');
             		this.setAttribute('title', alt);
             	});
             
                var thumbsCarousel = new glow.widgets.Carousel(galleryNode.get('.gallery-thumbs'), { 
                	step: 'page', 
                	className: 'gel-carousel', 
                	theme: 'gel-pg' 
                });

                // Embed each item's position for easy retrieval later
                thumbsCarousel.items.each(function(i) { glow.dom.get(this).data('position', i); });                

                var thumbsHeight = 81;
                galleryNode.get('.carousel-window, .thumbs-nav > div').height(thumbsHeight);

                //attach mouse over events to carousel items for <IE6 rollover state
                if (glow.env.ie < 7) { 
	                glow.events.addListener(thumbsCarousel.items, 'mouseenter', function() { 
	                    glow.dom.get(this).toggleClass("mouseover");
	                });
	                glow.events.addListener(thumbsCarousel.items, 'mouseleave', function() { 
	                    glow.dom.get(this).toggleClass("mouseover");
	                });
                }

             } else {
                galleryNode.get('.thumbs-nav').hide();
             }
                       
             if (isLightboxGallery) { 
                var lightboxWidth = isJournalGallery ? 926 : galleryWidth;               
                galleryPanel = new glow.widgets.Overlay('#'+galleryId, {
                                                                width: lightboxWidth+40,
                                                                anim: 'fade',
                                                                className: 'ws-modal-popup',
                                                                modal: 'true'
                                                            });
                 
                 // Transfer font-size from main page to Glow panel
                 var pageFontSize = glow.dom.get('#blq-main').css('font-size');                 
                 galleryPanel.content.css('font-size', pageFontSize);
                                            
                 // Clear hash from URL when hiding lightbox                                           
                 glow.events.addListener(galleryPanel, 'afterHide', function(event) {
                    //location.hash = '';
                    return false;
                 });       
                 
                 glow.events.addListener(glow.dom.get('a.ws-popup-close'), 'click', function() { 
                	 galleryPanel.hide();
                     return false; 
                  });
                 
                 // Attach event to the 'Open' CTA button 
                 glow.events.addListener(glow.dom.get(thisGallery).get('a.cta'), 'click', function() { 
                    galleryPanel.show();
                    goToImage(currentImage); 
                    return false; 
                 });
                 
                // Show gallery if hidden
                glow.dom.get(thisGallery).css('visibility', 'visible');   
                
             } else {
                // Adjust elements' width for non-standard width slots/body areas
                var contentWindowWidth = galleryNode.get('.images').width(),                 
                    overlayNavMargin = (contentWindowWidth - galleryWidth)/2,
                    overlayAlign = (direction == 'ltr') ? 'left' : 'right';     
              
                galleryNode.get('.overlay-nav')
                           .width(galleryWidth)
                           .height(galleryHeight)
                           .css(overlayAlign, overlayNavMargin);                           
                               
                galleryNode.get('.caption').width(galleryWidth);
             }                                                                                                
                                                                           
             // Fixes for RTL
             if ((direction == 'rtl') && (thumbsVisible)) {             
                 // Change internal Glow carousel variable to enable RTL 
                 thumbsCarousel._direction = 'right';
                
                 // Override internal Glow focus handler to handle RTL
                 glow.events.removeAllListeners(thumbsCarousel.element);
                 glow.events.addListener(thumbsCarousel.element, 'focus', function(event) {                    
                     var elmItemNum = ws.utils.getParentWithClass(event.source, 'carousel-item').data('position');                    
          			 if ((' ' + thumbsCarousel.visibleIndexes().join(' ') + ' ').indexOf(' ' + elmItemNum + ' ') == -1 ) {    					
          			     thumbsCarousel.moveTo(elmItemNum);
          				 setTimeout(function() {
          				     thumbsCarousel._content[0].parentNode.scrollRight = 0; // The magic happens here
          				 }, 0);
          			}
                 });
             }
                                    
             // Add events
             if (thumbsVisible) {                          
               glow.events.addListener(thumbsCarousel, 'itemClick', function(event) {
                    stopPlayback();
                    goToImage(event.itemIndex);               
                    return false;
               });             
             }

             if (direction == 'ltr') { var nextKey = 'RIGHT', prevKey = 'LEFT'; }
                                else { var nextKey = 'LEFT', prevKey = 'RIGHT'; }

             glow.events.addKeyListener(nextKey, 'press', function() { stopPlayback(); goToImage(currentImage+1); });
             glow.events.addKeyListener(prevKey, 'press', function() { stopPlayback(); goToImage(currentImage-1); });
             glow.events.addListener(galleryNode.get('.overlay-nav .next'), 'click', function() { stopPlayback(); goToImage(currentImage+1); });
             glow.events.addListener(galleryNode.get('.overlay-nav .prev'), 'click', function() { stopPlayback(); goToImage(currentImage-1); });                                        
             
             glow.events.addListener(galleryNode.get('.images, .overlay-nav, .overlay-nav a'), 'mouseover', function() {                  
                glow.anim.fadeTo(galleryNode.get('.overlay-nav'), '0.7');
                //glow.anim.css(galleryNode.get('.overlay-nav'), 0.5, { 'opacity': 0.7 }).start();
                //galleryNode.get('.overlay-nav').show();
             });
             
             glow.events.addListener(galleryNode.get('.images, .overlay-nav, .overlay-nav a'), 'mouseout', function() {                
                glow.anim.fadeOut(galleryNode.get('.overlay-nav'));
                //galleryNode.get('.overlay-nav').hide();
             });             
              
            glow.events.addListener(galleryNode.get('.controls a.hideshow-captions'), 'click', function() {                
                var captionsButton = galleryNode.get('.controls a.hideshow-captions span');
                if (showCaptions) {
                    captionsButton.text(vocab.showCaptions);
                    captionsButton.attr('class', 'showcaptions');
                    glow.anim.css(galleryNode.get('.caption'), 0.2, { 'opacity': 0 }).start();
                    showCaptions = false;
                } else {
                    captionsButton.text(vocab.hideCaptions);
                    captionsButton.attr('class', 'hidecaptions');
                    glow.anim.css(galleryNode.get('.caption'), 0.2, { 'opacity': captionOpacity }).start();
                    showCaptions = true;
                }
             });
             
             glow.events.addListener(galleryNode.get('.controls a.startstop-slideshow'), 'click', function() {     
                var playbackButton = galleryNode.get('.controls a.startstop-slideshow span');          
                if (playback == true) {
                    clearInterval(thisGallery._playbackTimer);
                    playbackButton.text(vocab.startSlideShow);
                    playbackButton.attr('class', 'startslideshow');
                    playback = false;
                } else {
                    thisGallery._playbackTimer = setInterval(goToNextImage, playbackDelay);
                    playbackButton.text(vocab.stopSlideShow);
                    playbackButton.attr('class', 'stopslideshow');
                    playback = true;
                }
             });
                                   
             glow.events.addListener(galleryNode.get('.gallery-thumbs img'), 'error', function(event) {
                // Put placeholders for thumbnails for when ImageChef falls over                
                var source = glow.dom.get(event.source),
                    container = source.parent(),
                    position = container[0].className.replace('pos-',''),
                    width = source.attr('width'),
                    height = source.attr('height');
                                
                container.html('<div class="placeholder"><p>'+position+'</p></div>');
                container.get('.placeholder').width(width).height(height);
                container.get('.placeholder p').css('line-height', height+'px');
             });
                
             function goToNextImage() {
                goToImage(currentImage+1);
             }
             
             function goToImage(index) {
                if (index >= imageCount) { index = 0; }
                if (index < 0) { index = imageCount-1; }                
             	
                // Highlight thumbnail
                if (thumbsVisible) {
                  galleryNode.get('.gallery-thumbs li').removeClass('selected');
                  var currentThumb = galleryNode.get('.gallery-thumbs li')[index];
                  galleryNode.get(currentThumb).addClass('selected');
                  thumbsCarousel.moveTo(index, true);                  
                }             
             
                // Wait for image to load
                var loadImage = new Image();                
                loadImage.onload = function() {
                    transitionToImage(index);
                } 
                                          
                loadImage.src = imageList[index].src;             
             }
             
             function transitionToImage(index) { 
             	                            
                // Change main image                           
                backPaneImage.attr('src', imageList[index].src)
		                     .attr('alt', imageList[index].alt)
		                     .attr('title', imageList[index].alt)
                var imageWidth = backPaneImage.width(),
                    imageHeight = backPaneImage.height();          
                if (imageWidth == 0) { imageWidth = galleryWidth; }                                
                
                // Change caption
                var caption = glow.lang.trim(imageList[index].caption);
                if (isJournalGallery) { 
                    galleryNode.get('.bodytext').html(imageList[index].caption);
                    galleryNode.get('.bodytext > a').remove();
                    galleryNode.get('.images .caption').hide();
                                        
                    ws.modules.scrollable(galleryNode.get('.bodytext'));
                    if (galleryNode.get('.slider').length) { galleryNode.addClass('gel-scrollbars'); }                    
                } else {
                    if (showCaptions) {
                        if (caption == '') { 
                            galleryNode.get('.images .caption').hide(); 
                        } else { 
                            galleryNode.get('.images .caption').css('opacity', captionOpacity).show(); 
                        }                                
                    }                    
                    galleryNode.get('.images .caption p').text(imageList[index].caption);                    
                }
                   
                // Update size/pos of the black matte                
                galleryNode.get('.black-matte')
                           .width(imageWidth)
                           .height(imageHeight)
                           .css('left', (galleryNode.get('.images').width()-imageWidth)/2+'px');
                
                // Crossfade only during slideshow              
                if (playback) {
                    glow.anim.css(backPane, 1, {'opacity': {from:0, to:1}}, { tween: glow.tweens.easeBoth() }).start();
                    crossFade = glow.anim.css(frontPane, 1, {'opacity': {from:1, to:0}}, { tween: glow.tweens.easeBoth() }).start();
                    glow.events.addListener(crossFade, 'complete', function() {                        
                        swapImagePanes();                                             
                    });
                } else {                  
					frontPaneImage.attr('src', imageList[index].src)
			                      .attr('alt', imageList[index].alt)
			     				  .attr('title', imageList[index].alt);                    
                }

                // Update counter and location hash                
                var localeText = vocab.imageCounter,
                    counterText = glow.lang.interpolate(localeText, {
                                                            'current':'<span>'+(index+1)+'</span>', 
                                                            'total':'<span>'+imageCount+'</span>'
                                                           });
                
                galleryNode.get('.footer-nav .image-counter').html(counterText);
                
                //location.hash = '#gallerypic-'+(index+1);

                // Preload next image
                var preloadImgIndex = index+1;
                if ((preloadImgIndex) > imageCount-1) { preloadImgIndex = 0; }
                preloadImg.src = imageList[preloadImgIndex].src;                
                                     
                currentImage = index;
                
                // Show gallery if hidden
                galleryNode.css('visibility', 'visible');    
                             
             }
             
             function enableTransitions() {
                inTransition = false;
                thisGallery.timeout = false;
             }
             
             function swapImagePanes() {                
                var backImageSrc = backPaneImage.attr('src'),
                	backImageAlt = backPaneImage.attr('alt');
                
                frontPaneImage.attr('src', backImageSrc)                
							  .attr('alt', backImageAlt)
							  .attr('title', backImageAlt);						  
             	
                // This attempts to minimise 'jumps' between images in some versions of FF
                var fade = glow.anim.css(frontPane, 0.2, {'opacity': {to:1}}, { tween: glow.tweens.easeBoth() }).start();   
                glow.events.addListener(fade, 'complete', function() {
                    backPane.css('opacity', '1');
                    inTransition = false;                    
                });                                                                
             }
             
             function stopPlayback() {
                if (playback == true) { glow.events.fire(galleryNode.get('.controls .startstop-slideshow'), 'click'); }
             }

             // Start with first image   
             goToImage(currentImage);  
                         
        });
    },
    
    popup: function() {
      glow.dom.get('a').filter(function(e){        
        if (this.className.match('popup')) {            
          var popupOptions = this.className.match(/([0-9]+)x([0-9]+)/i);            
          if (popupOptions) {
                if (this.className.match('-scrolling')) { popupOptions[3] = 'yes'; } else { popupOptions[3] = 'no'; }
                if (!this.href.match('/iplayer/console')) {// Don't process links to iPlayer. Handled by their own JS
            
                  // Hack: grab links to the WikiLeaks survey and widen the popup            
                  if (this.href.indexOf('web.eu-survey.com/WebProd/cgi-bin/askiaext.dll?Action=StartSurvey&SurveyName=BBCws_Wikileaks') != -1) {
                      popupOptions[1] = 820;                
                  }
                  
                  glow.events.addListener(glow.dom.get(this), 'click', function() { return createPopup(this.href,popupOptions); })
                }                              
              }
          }
      });

      function createPopup(url,popupOptions){ 
        var popupName = glow.lang.trim(url.replace(/[^a-zA-Z]+/g,''));
            popupWin = window.open(url,popupName,'width='+parseInt(popupOptions[1])+',height='+parseInt(popupOptions[2])+',scrollbars='+popupOptions[3]+',toolbar=no,personalbar=no,location=no,directories=no,statusbar=no,menubar=no,resizable=yes,status=no,left=60,screenX=60,top=100,screenY=100');; 
            popupWin.focus();
      		return false;
    	}
    },
    

    browserBack: function(selector) {
      glow.dom.get(selector).each(function() {
          glow.events.addListener(glow.dom.get(this), 'click', function() { history.go(-1); });
      });
    },     
        
    scrollingAnchors: function(selector) {
        // Makes <a> anchor links smooth scroll to their target     
        glow.dom.get(selector+' a').each(function() {
          var href = glow.dom.get(this)[0].hash;

          if ((href.substring(0,1) == '#') && (glow.dom.get(href).length > 0)) {
            glow.events.addListener(this, 'click', function() {
              var anchorOffset = glow.dom.get(href).offset().top,
                  markerName = 'scrolling-marker',
                  pageHeight = document.height || document.body.offsetHeight,
                  //currentWindowOffset = typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement.scrollTop;
                  currentWindowOffset = window.pageYOffset || document.documentElement.scrollTop;

              // Create marker and match position to the page
              glow.dom.get('#blq-content').append('<div id="'+markerName+'"></div>');
              glow.dom.get('#'+markerName).css('position','absolute').css('top', currentWindowOffset+'px');

              var marker = glow.dom.get('#'+markerName);

              // Prepare animation for the marker
              var scrollEffect = glow.anim.css('#'+markerName, 1.5,
                                              { top: {to: anchorOffset} },
                                              {tween: glow.tweens.easeBoth() }
                                            );

              // 'Latch' the page position to the animation of the marker
              glow.events.addListener(scrollEffect, 'frame', function() {
                var markerPosition = parseInt(marker.css('top'));
                window.scrollTo(0, markerPosition);
              });

              glow.events.addListener(scrollEffect, 'complete', function() {
                marker.remove();
                window.location.hash = href; // Update the hash so not to break back-button
              });

              scrollEffect.start();
              
              return false;
            });
          }
        });
    },      
    
    validateForms: function(selector) {
      var $ = glow.dom.get;      
      $(selector).each(function() {
          var currentForm = $(this),
              vocab = ws.vocab.dictionary;
                                                 
          var glowForm = new glow.forms.Form(currentForm, {
         
            onValidate: function(results) {                
              currentForm.get('.glow-errorMsg, .validation-error-msg').remove();
              new glow.forms.feedback.defaultFeedback(results);
              currentForm.get('.glow-errorSummary').css('display', 'none'); // This cannot be done in CSS, IE will not do validation otherwise

              currentForm.get('input').each(function() {
                if (this.getAttribute('name') == 'EmailSender') {          
                    var value = $(this).val();                    
                    if (value.match(/bbc.co.uk/i)) {                  
                      $(this).after('<p class="validation-error-msg">'+vocab.cannotUseBBCAddress+'</p>');
                      results.errorCount++;
                    }
                }
              });

              for (var field in results.fields) {
                  // Errors displayed here and not in Glow, because Glow requires the <label> to have
                  // the 'for' attribute set. We enclose the input fields within label.
                  field = results.fields[field];
                  fieldNode = currentForm.get("input,select,textarea").filter(function() { return this.name == field.name })
                
                  if (field.result == 0) {                      
                      glow.dom.create('<span class="validation-error-msg">'+field.message+'</span>').insertAfter(fieldNode);                      
                  }              
              }
                            
              // Don't submit form if there are errors              
              if (results.errorCount > 0) { return false; }              
            }
          });
          
            
          // Check for required fields
          currentForm.get('input.required, input.req, select.required, select.req, textarea.required, textarea.req').each(function() {
            glowForm.addTests(this.name, ["required", { message: vocab.requiredField }]);
          });

          // Check for email fields
          currentForm.get('input.email, textarea.email').each(function() {                                 
            glowForm.addTests(this.name, ["isEmail", { message: vocab.invalidEmail }]);
          });

          // Check for number fields
          currentForm.get('input.numbers, textarea.numbers').each(function() {
            glowForm.addTests(this.name, ["isNumber", { message: vocab.numbersOnly }]);
          });

          // Check for files
          currentForm.get('input.file').each(function() {                        
            glowForm.addTests(this.name, ["custom", {
                arg: function(values, opts, callback, formData) {
                  for (var i = 0, len = values.length; i < len; i++) {                      
                      if (!values[i].match(/\.(jpe?g|png|gif|avi|mov|3gp|wmv|mpe?g|wav|mp4|mp3|aiff|aac|wma|flv|doc|txt)$/ig)) {
                          callback(glow.forms.FAIL, vocab.wrongFileType);
                          return;
                      }
                  }
                  callback(glow.forms.PASS, '');                    
                }                 
            }]);
          });    
          
          // Check for fields with a character limit
          currentForm.get('.limit').each(function() {
              glow.events.addListener($(this), 'keyup', function() {
                  var content = this.value,
                      charLimit = this.className.match(/([\w]+)-([\d]+)/i).splice(1,3),
                      charCounter;

                  charCounter = charLimit[0];
                  charLimit = parseInt(charLimit[1]);
                  if(content.length > charLimit) { this.value = content.substring(0,charLimit); }
                  if($('.'+charCounter+'-toll')) { $('.'+charCounter+'-toll').text(content.length); }
                  return false;
              });
          });
        

       });
    },
    
    // Relative timestamps
    timeAgo: function() {
    	/*glow.lang.apply(ws.modules.timeAgo, {settings : {
      		refreshMillis: 60000,
      		allowFuture: false,
      		strings: {
        		prefixAgo: null,
        		prefixFromNow: null,
        		suffixAgo: "ago",
        		suffixFromNow: "from now",
		        seconds: "less than a minute",
		        minute: "about a minute",
		        minutes: "%d minutes",
		        hour: "about an hour",
		        hours: "about %d hours",
		        day: "a day",
		        days: "%d days",
		        month: "about a month",
		        months: "%d months",
		        year: "about a year",
		        years: "%d years"
			}
      	}});*/

		glow.lang.apply(ws.modules.timeAgo, {settings : {
      		refreshMillis: 6000,
      		allowFuture: false
      	}});
		
		var $ = glow.dom.get;

		// default threshold for min/hours timestamps 
		var defaultDetailedThresholdHours =  ws.config[ws.env.service].defaultDetailedThresholdHours || 1;
		var detailedThresholdHours = defaultDetailedThresholdHours;

		// list li-listing threshold such as topics and genre aggregation
		var listingThresholdHours = ws.config[ws.env.service].listingThresholdHours || 5;
		
		// rolling-news threshold
		var rollingnewsThresholdHours = ws.config[ws.env.service].rollingnewsThresholdHours || 5;
		
		// tweetminster threshold 
		//var tweetminsterThresholdHours = 

		// threshold for all min/hours actual page level timestamp - top of page
		var pageThresholdHours = ws.config[ws.env.service].pageThresholdHours || 5;

		// display local timezone time after threshold in the same day
		var defaultDisplayTimeAfterThreshold = (ws.config[ws.env.service].defaultDisplayTimeAfterThreshold==false)? false : true;
		var displayTimeAfterThreshold = defaultDisplayTimeAfterThreshold;

		// display date as last fallback after threshold and local time
		var defaultDisplayDateAfterThreshold = (ws.config[ws.env.service].defaultDisplayDateAfterThreshold==false)? false : true;
		var displayDateAfterThreshold = defaultDisplayDateAfterThreshold;
		
		// try and get live info from json feed
		var json = "";
		var lp_mod_url = "/worldservice/includes/core/2/data/tc2_ssi_feed.json.sssi?service="+ws.env.service+"&feed_path="+ws.env.servicePath+"/latest_all.sssi";

		/* MR - disabling due to server load.
		if ($(".last-published").length > 0 ) {
		
			glow.net.get(lp_mod_url, {
				async:false,
			  	onLoad: function(response) {
					json = (glow.lang.trim(response.text()).length > 0) ? response.json() : '';
				}
			});
		}
		*/

		//  page timestamp for opted in service
		if (ws.config[ws.env.service].pageRelativeDatestamp && ($("body").hasClass("story") || $("body").hasClass("av-instance"))) { 
			var pageDate="";
			$("meta").each(function() {
				if($(this).attr("name")=='dcterms.modified') {
					pageModifiedDate = $(this).attr("content");
					var pageDt = parse(pageModifiedDate);
					var pageDist = (ws.env.serverDate.getTime()>0)? ws.env.serverDate.getTime() - pageDt.getTime() : distance(dt);
					if (pageDist < (pageThresholdHours*60*60*1000)) {			
						$(".datestamp").html("<span></span>");
						$(".datestamp span").attr("id","dt-"+pageModifiedDate).addClass("timeago");		
					}
				}
			});
			//hidden is screen.css for initial loading
			$(".datestamp").css("display", "block").css("visibility", "visible");
		}
		
		var selector = ws.selectors.timeAgo;
		
        $(selector).each(function() {						

			var dateNode = $(this),
			    dt = (this.id) ? parse(this.id.substring(3)): null,
			    lstpub = ws.utils.getParentWithClass(this, 'last-published'),
			    teaser = ws.utils.getParentWithClass(this, 'teaser');			    

			if (lstpub.length > 0 && teaser.length > 0 && json.length > 0) {
				var story_url = (teaser.hasClass('ts-headline'))?teaser.get('a').attr('href') : teaser.get('.link.title a').attr('href');

				if (story_url.length > 0 && story_url.charAt(0)=="/" && typeof(json[story_url]) !='undefined') {
					dt = parse(json[story_url].datetime);
				}
			}							

			var serverDistance=0;
			if (dt) { serverDistance = (ws.env.serverDate.getTime()>0)? ws.env.serverDate.getTime() - dt.getTime() : distance(dt); } 
			
			// one hour threshold to kill timeagos on teaser in .last-updated slot
			if (lstpub.length > 0) { 
				serverDistance = ( serverDistance > (59*60*1000) )? 0 : serverDistance; 
				if (serverDistance == 0) { $(this).css("display", "none").css("visibility", "hidden"); }
			}
			
			// rolling news threshold
			if (ws.utils.getParentWithClass(this, 'bx-rollingnews').length > 0 || $("body").hasClass("genre-rolling_news") ) {
				detailedThresholdHours = rollingnewsThresholdHours;
			}
			
			// tweetminster threshold
			if (ws.utils.getParentWithClass(this, 'bx-tweetminster').length > 0 || $("body").hasClass("genre-tweetminster") ) {
				detailedThresholdHours = rollingnewsThresholdHours;// tweetminsterThresholdHours;
			}
			
			// list li-listing threshold
			if (ws.utils.getParentWithClass(this, 'li-listing').length > 0) {
				detailedThresholdHours = listingThresholdHours;
			}
			
			// page datestamp threshold
			if (ws.utils.getParentWithClass(this, 'datestamp').length > 0) {
				detailedThresholdHours = pageThresholdHours;
			}
			
			// list li-listing threshold
			if (ws.utils.getParentWithClass(this, 'inline-contextual-links').length > 0) {
				displayTimeAfterThreshold = true;
				displayDateAfterThreshold = false;
			}

			// optout displaying time after timeago threshold
			if (!defaultDisplayTimeAfterThreshold) {
				displayTimeAfterThreshold = false; 
			}

		    if (serverDistance > 0) {

				var $l = ws.vocab.timeAgo;
		    	// Only generate relative timestamps for thresholds set
				if (serverDistance < (detailedThresholdHours*60*60*1000) && $l) {				

					var dtRelative = inWords(serverDistance);		    	
    				$(this).text(dtRelative);
					$(this).addClass('timeago-on');
					$(this).css("display", "inline").css("visibility", "visible");
					
    			} else if (dt.getUTCDay() == ws.env.serverDayOfWeek && serverDistance < (5*24*60*60*1000) && $l && displayTimeAfterThreshold) { //same day using 5 day threshold

					// MR: display story time in the story timezone not local time
					var offset = this.id.slice(-6);
					offset = offset.split(":"); 
					var offsethrms = offset[0] * (60*60*1000);
					var offsetmnms = offset[1] * (60*1000);
					var offsetms = (offsethrms<0) ? offsethrms - offsetmnms : offsethrms + offsetmnms;
					var offsetTime = new Date(dt.getTime() + offsetms);
    				$(this).text(padDateTime(offsetTime.getHours()) + ":" + padDateTime(offsetTime.getMinutes()) + " " + $l.offsetTimezone);
					$(this).removeClass('timeago-on');
					$(this).css("display", "inline").css("visibility", "visible");
    				
    			} else if (displayDateAfterThreshold){
					
					var storyDate = this.id.slice(5,13);
					storyDate = storyDate.split("-");
					$(this).text(storyDate[2]+"."+storyDate[1]+"."+storyDate[0]);
					$(this).removeClass('timeago-on');
					$(this).css("display", "inline").css("visibility", "visible");
					
    			} else {
    				//$(this).append("<br /> " + padDateTime(dt.getUTCHours()) + ":" + padDateTime(dt.getUTCMinutes()) + " GMT");
    			}
    		}
			if (!displayDateAfterThreshold){
				$(this).css("display", "none").css("visibility", "hidden");
			}
			
			//reset defaults
			detailedThresholdHours = defaultDetailedThresholdHours;
			displayTimeAfterThreshold = defaultDisplayTimeAfterThreshold;
			displayDateAfterThreshold = defaultDisplayDateAfterThreshold;
			
		});

		if (!ws.env.timeAgoIncrActive) {
			ws.env.timeAgoIncrActive = true;
			setTimeout(timeAgoIncr,30000);
			setInterval(ws.modules.timeAgo,60000);
		}

	    function timeAgoIncr() {	
			ws.env.serverDate = new Date(ws.env.serverDate.getTime()+(60*1000));
			setTimeout(timeAgoIncr,60000);
		}
		
		function inWords(distanceMillis) {
		  var $l = ws.vocab.timeAgo;
		  var prefix = $l.prefixAgo;
		  var suffix = $l.suffixAgo || $l.ago;
		  if (ws.modules.timeAgo.settings.allowFuture) {
		    if (distanceMillis < 0) {
		      prefix = $l.prefixFromNow;
		      suffix = $l.suffixFromNow || $l.fromNow;
		    }
		    distanceMillis = Math.abs(distanceMillis);
		  }
		
		  var seconds = Math.floor(distanceMillis / 1000);
		  var minutes = Math.floor(seconds / 60);
		  var hours = Math.floor(minutes / 60);
		  var days = Math.floor(hours / 24);
		  var years = Math.floor(days / 365);
		
		  var words = '';
		  	if(seconds < 60) { words = substitute($l.seconds, seconds) }

		    else if (seconds < 120) { words = substitute($l.minute, 1) }
		    else if (minutes < 60) { words = substitute($l.minutes, minutes) }
			
			// one hour permutations
			else if (minutes == 60) { words = substitute($l.hour, 1) }
			else if (minutes == 61) { words = substitute($l.hour, 1) +" "+ substitute($l.minute, 1) }
			else if (hours == 1) { words = substitute($l.hour, 1) +" "+ substitute($l.minutes, minutes - 60) }

			// over one hour permutations
			else if (hours < 24) { 
				if (minutes == hours*60) { words = substitute($l.hours, hours); }
				else if (minutes == (hours*60) +1) { words = substitute($l.hours, hours) +" "+ substitute($l.minute, 1); }
				else { words = substitute($l.hours, hours) +" "+ substitute($l.minutes, minutes - hours*60); }
			}

			else if (hours < 48) { words = substitute($l.day, 1) }
			else if (days < 30) { words = substitute($l.days, days) }
			else if (days < 60) { words = substitute($l.month, 1) }
			else if (days < 365) { words = substitute($l.months, days / 30) }
			else if (years < 2) { words = substitute($l.year, 1) }
		    else { words = substitute($l.years, years) }
		
		  return glow.lang.trim([prefix, words, suffix].join(" "));
		}

		function parse(iso8601) {
			var s = glow.lang.trim(iso8601);
			s = s.replace(/-/,"/").replace(/-/,"/");
			s = s.replace(/T/," ").replace(/Z/," UTC");
			//s = s.replace(/([\+-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
			s = s.match(/([\+-]\d\d)\:?(\d\d)/) ? s.replace(/([\+-]\d\d)\:?(\d\d)/," $1$2") : s+"+0000"; // -04:00 -> -0400 or 0000
			s = new Date(s);
            // s back to UTC.
			var timezoneOffset = s.getTimezoneOffset()*60*1000;
			return new Date(s.getTime() + timezoneOffset);			
		}

		function distance(date) {
			return (new Date().getTime() - date.getTime());
		}

		function substitute(stringOrFunction, value) {
			var string = isFunction(stringOrFunction) ? stringOrFunction(value) : stringOrFunction;

			return string.replace(/%d/i, value);
		}

		function padDateTime(dt) {
			var dtPadded = dt;
			
			if (dt < 10) {
				dtPadded = "0" + dt;
			}
			
			return dtPadded; 
		}

		function isFunction(obj) {
			return typeof obj === "function";
		}
    },
    
    fontCheck: function(selector) {
       glow.dom.get(selector).each(function() {
                            
            var fontExists = false,
                fontName = glow.dom.get(this).attr('class'),
                sampleText = ws.config[ws.currentService].sampleText || 'abcdefghijklmnopqrstuvwxyz',
                fontDiv = glow.dom.create('<div class="font-sample-check"></div>')
                           .appendTo('body')
                           .css('display','inline')
                           .css('opacity','0.01')
                           .html(sampleText);
                           
            fontName = glow.lang.trim(fontName.split('font-check ')[1]);            
            fontDiv.css('font-family', '"'+fontName+'", arial').css('font-size','72px');                
            var width = fontDiv.width(),
                height = fontDiv.height();

            fontDiv.css('font-family', 'arial');
    
            var newWidth = fontDiv.width(),
                newHeight = fontDiv.height();
    
            if ((width != newWidth) || (height != newHeight)) { fontExists = true; }            
            fontDiv.remove();            
            if (!fontExists) { glow.dom.get('#blq-container').addClass('no-font'); }
      });
    },  
    
    liveText: function(selector) {
        if (!ws.env.liveText) { 
            ws.env.liveText = {
                active: true,
                refreshInterval: 2 * 60 * 1000 // 2 mins 
            }         
        };
        ws.env.liveText.firstRun = true;
                        
		if (glow.dom.get(selector).length > 0) {
			if (glow.dom.get("body").hasClass("index") || glow.dom.get("body").hasClass("cluster") || glow.dom.get('#live-text').get('.bx-livetext').length) {			 
				ws.modules.liveTextIndex(selector);
			}
			else {
				glow.dom.get("body").addClass("livetext-story");
				ws.modules.liveTextStory();								
			}		
		}
	},	
    	
    liveTextIndex: function(selector) {        
	    var storyUrl = glow.dom.get('#live-text').get('.live-text-url').attr('href'),
	        storyContentPath = glow.dom.get('#live-text').get('.live-text-url').attr('rel'),
		    ltBody = glow.dom.get('#live-text').get('.body'),
		    ltTotalItems = 7,
		    ltShowItems = 3,
		    ltClassOn = (ws.env.liveText.active)? "livetext-on" : "";
		
		// adjust settings for special royal wedding coverage
		if (glow.dom.get('.story #live-text .bx-livetext').length) {
			ltTotalItems = 20;
		    ltShowItems = 5;
		}
		
		storyUrl = storyUrl.replace(/^http:\/\/.*?\//, '/');

		glow.dom.get('#live-text').get(".live-text-check").addClass(ltClassOn);

        //sourceUrl = '/worldservice/includes/core/2/tools/page_proxy.sssi?page='+sourceUrl;
        storyContentPath = storyContentPath.replace('.sssi','.json');
		if (!ws.env.isLive) {
			storyContentPath = "/cgi-bin/topcat2/open/tunnel.pl?http://www.bbc.co.uk"+storyContentPath;
		}
		
		var request = glow.net.get(storyContentPath, {
		  useCache: true,
		  onLoad: function(response) {

			var rhtml = response.text(),
			    paras;
            
            if (storyContentPath.indexOf('json') != -1) {
                // Process JSON                
                var bodytext = response.json().bodytext;                
                paras = glow.dom.create('<div>'+bodytext+'</div>').children().slice(0, ltTotalItems);     
                if (response.json().title != undefined && response.json().title != '') {
                    var updatedTitle = '<a href="' + storyUrl + '">' + response.json().title + '</a>'; 
                    glow.dom.get('#live-text h2.title').html(updatedTitle);
                }
            } /*else if (rhtml.indexOf("<body") == -1) {
                // Process SSI
                paras = glow.dom.create('<div>'+rhtml+'</div>').children().slice(0, ltTotalItems);
                
            } else {
	       	    // Process full page - legacy
    			var start = rhtml.indexOf("<body");
    			var end = rhtml.indexOf("</body>");
    			var rhtml = rhtml.substring(start,end);
    
    			start = rhtml.indexOf(">");
    			end = rhtml.lastIndexOf("</");
    			rhtml = rhtml.substring(start,end);
    			rhtml = rhtml.replace(/<img src=\"http:\/\/stats.bbc.co.uk.*?>/gi, '') // Remove any stats before recreating DOM
    			             .replace(/<script.*<\/script>/gi, '')
    			             .replace(/<noscript.*<\/noscript>/gi, '');			
    			
    			rhtml = glow.dom.create("<div" + rhtml + "div>");
    			
    			var title = rhtml.get('.g-w20 h1').text(),
    			textSelector = rhtml.get('.live-text-bodytext > p').length ? '.live-text-bodytext > p' : '.bodytext > p';
    			
    			rhtml.get(".bodytext > .ingress").remove();
    			
    			rhtml.get(textSelector).each(function() {
    				if(glow.dom.get(this).text()=='') {
    					glow.dom.get(this).remove();
    				}
    			});
    
    			paras = rhtml.get(textSelector).slice(0, ltTotalItems);    
    			rhtml.remove();    			
    			var updatedtitle = '<a href="' + url + '">' + title + '</a>';    			
    			glow.dom.get('#live-text h2.title').html(updatedtitle);            
            }*/


			var updatedhtml = '<ul>';
            
			for (i=0; i<paras.length; i++) {
			    var node = glow.dom.get(paras[i]),
                    text = glow.lang.trim(node.text());
			    if (text != '') { updatedhtml+= '<li>'+node.html()+'</li>'; }				    
			}
			updatedhtml += '<li>' + ws.utils.outerHtml(glow.dom.get('.associated .live-text-url')) + '</li></ul>';
			
			ltBody.html(updatedhtml);
						
			if(ws.env.liveText.firstRun){
				ltBody.css('visibility','hidden');						
				var liveItemHeight = 0;				
				ltBody.get('ul li').each(function(i) {				
					if (i < ltShowItems) {
				    	liveItemHeight += parseInt(glow.dom.get(this).height());
				    	liveItemHeight += (parseInt(glow.dom.get(this).css("padding-top"))>0)? parseInt(glow.dom.get(this).css("padding-top")) : 0;
				    	liveItemHeight += (parseInt(glow.dom.get(this).css("padding-bottom"))>0)? parseInt(glow.dom.get(this).css("padding-bottom")) : 0;
				    	liveItemHeight += (parseInt(glow.dom.get(this).css("border-top-width"))>0)? parseInt(glow.dom.get(this).css("border-top-width")) : 0;
				    	liveItemHeight += (parseInt(glow.dom.get(this).css("border-bottom-width"))>0)? parseInt(glow.dom.get(this).css("border-bottom-width")) : 0;
				    	liveItemHeight += (parseInt(glow.dom.get(this).css("margin-top"))>0)? parseInt(glow.dom.get(this).css("margin-top")) : 0;
				    	liveItemHeight += (parseInt(glow.dom.get(this).css("margin-bottom"))>0)? parseInt(glow.dom.get(this).css("margin-bottom")) : 0;									
					}
				});
				
				liveItemHeight = liveItemHeight - 1;
			}
			
			var ltItems = glow.dom.get('#live-text').get('li');
			glow.dom.get(ltItems.item(0)).addClass("first");
			
			glow.dom.get('#live-text').get(".disclaimer").css("display", "none");
			glow.dom.get('#live-text').get(".live-text-check").css("display", "block");			
			
			if (ws.env.liveText.firstRun) {
				ltBody.height(liveItemHeight);
				ltBody.css('visibility', 'visible');
			}			
			
			// scrollable 			
			ws.modules.scrollable(ltBody);
			
    		if (ws.env.liveText.active) {
    		    setTimeout(liveTextRemoveClass,10000);
    		    setTimeout(ws.modules.liveTextIndex, ws.env.liveText.refreshInterval);
            } else {
                // Live text has been killed
                glow.dom.get('#live-text .live-text-check').hide();        
            }			
						
			ws.env.liveText.firstRun = false;			
		  }
		});
		
	

		function liveTextRemoveClass() {	
			glow.dom.get('#live-text .live-text-check').removeClass(ltClassOn);
		}		
		
	},
		
    liveTextStory: function(selector) {
	    var storyContentPath = glow.dom.get('#live-text').get('.live-text-url').attr('rel'),
            sourceUrl = location.href.replace(/http:\/\/.*\.bbc\.co\.uk/, '');
        
        if (!storyContentPath) { return false; } // Fail gracefully if the path to the content JSON isn't available
        glow.dom.get('.live-text-check').css('display','block');
        //sourceUrl = '/worldservice/includes/core/2/tools/page_proxy.sssi?page='+url;
        storyContentPath = storyContentPath.replace('.sssi','.json');
		if (!ws.env.isLive) {
			storyContentPath = "/cgi-bin/topcat2/open/tunnel.pl?http://www.bbc.co.uk"+storyContentPath;
		}

		var request = glow.net.get(storyContentPath, {
		  useCache: true,
		  onLoad: function(response) {
			var rhtml = response.text();

            if (storyContentPath.indexOf('json') != -1) {
                // Process JSON                
                var bodytext = response.json().bodytext; 
                glow.dom.get('.live-text-bodytext').html(bodytext);                                    
                       
            }/* else if (rhtml.indexOf("<body") == -1) {
                // Process SSI                
                glow.dom.get('.live-text-bodytext').html(rhtml);
                
            } else {
                // Process full page - legacy
    			var start = rhtml.indexOf("<body");
    			var end = rhtml.indexOf("</body>");
    			var rhtml = rhtml.substring(start,end);
    
    			start = rhtml.indexOf(">");
    			end = rhtml.lastIndexOf("</");
    			rhtml = rhtml.substring(start,end);
    			rhtml = rhtml.replace(/<img src=\"http:\/\/stats.bbc.co.uk.*?>/gi, '') // Remove any stats before recreating DOM
    			             .replace(/<script.*<\/script>/gi, '')
    			             .replace(/<noscript.*<\/noscript>/gi, '');			
    			
    			rhtml = glow.dom.create("<div"+rhtml+"div>");
    			
    			rhtml.get(".emp").parent().remove();
    			
    			var updatedhtml = rhtml.get('.bodytext').html();
    
    			rhtml.remove();
    
    			glow.dom.get('.bodytext > * ').filter(function(e){
    		        if (glow.dom.get(this).get("> div").hasClass('emp')) {}
    		        else if (glow.dom.get(this).get("object, embed").length) {}
    				else {
    					glow.dom.get(this).remove();
    		    	}
    		    });
    			
    			if (glow.dom.get('.bodytext > div').length > 0){
    				glow.dom.get('.bodytext > div').after(updatedhtml);
    			}
    			else {
    				glow.dom.get('.bodytext').html(updatedhtml);
    			}
    	    }*/

			glow.dom.get('.live-text-check').css('display','none');
			
			
    		if (ws.env.liveText.active) { 
                setTimeout(ws.modules.liveTextStory, ws.env.liveText.refreshInterval); 
            } else {
                glow.dom.get('#live-text').hide();
            } 			
			
		  }
		});
		  
	},
    
    tabbedList: function(selector) {
        /* This is the tabbed list used on indices, (ws.com) */
        var $ = glow.dom.get,
            self;

        $(selector).each(function() {
           self = this;
           var currentTabList = $($(this).get('ul').item(0)),
               currentTabNode = currentTabList.parent(),
               activeClass = 'li-selected',
               currentActiveTab = 0,
               i = 0;

               this.currentTabList = currentTabList;
               this.currentTabNode = currentTabNode;
               this.rotate = false;
               this.rotateDelay = 9000;
               this.currentActiveTab = currentActiveTab;               


               // Create Nav
               glow.dom.create('<ul class="tabs-nav"></ul>').insertAfter(currentTabList);

               currentTabList.get('> li').each(function(i) {                  
                  if ($(this).html() != '') { // Sanity check - make sure the <li> contains something
                    var tabTitle = $(this).get('.title').text(),
                        tabLink = $(this).get('> .li-plain > .title a').attr('href'),
                        teaserUrl = tabLink;
                        
                    $(this).get('> .li-plain > .title').remove();
                    if (typeof(tabLink) == 'undefined') { teaserUrl = $(this).get('a').attr('href'); }
  
                    // Add tab to the nav
                    var tab = currentTabNode.get('.tabs-nav').append('<li><a href="'+teaserUrl+'">'+tabTitle+'</a></li>');
                    if (i == 0) { currentTabNode.get('.tabs-nav li').addClass('first'); }
                    
                    // Remove nav placeholder padding
                    $(currentTabNode.parent()).css('padding-bottom','0');
                 } else {
                    $(this).remove();
                 }
               });
               
               this.tabCount = currentTabList.get('> li').length;
        
              // Attach events to nav
              currentTabNode.get('.tabs-nav li').each(function(i) {
                 glow.events.addListener(this, 'click', function() {
                    activateTab(i);
                    self.rotate = false;
                    return false;
                 });
              });
              
              // Set height for tabs
              var teaserHeight = currentTabList.get('img').height();
              if (teaserHeight == 0) { teaserHeight = currentTabList.get('img').attr('height'); }
              
              currentTabList.css('position', 'relative').css('overflow', 'hidden').height(teaserHeight);
              currentTabList.get('> li').css('position', 'absolute')
                                        .css('top', '0')
                                        .css('display', 'block')
                                        .css('opacity', '0');
              currentTabList.get('> li.first').css('opacity', '1');
              
              if ($('body').hasClass('rtl')) {
                currentTabList.get('> li').css('right', '0');
              } else {
                currentTabList.get('> li').css('left', '0');
              }
              
              // Activate the first tab
              activateTab(0);
              
              // Auto rotate
              if (($(this).hasClass('rotating')) || ($(this).hasClass('rotate')))  { this.rotate = true; }
              if (this.rotate) { this.timeout = setTimeout(rotateTabs, this.rotateDelay); }
        });

        function activateTab(tabIndex) {
            var tabNode = self.currentTabNode.get('.content > ul'),
                fadeSpeed = 1,
                allTabs = self.currentTabList.get('> li'),
                showTab = self.currentTabList.get('> li').item(tabIndex);

            allTabs.each(function(i) {
                var thisTab = this;
                if (i == tabIndex) {
                  glow.anim.fadeIn(this, fadeSpeed, {
                      onComplete: function() { 
                        if (glow.env.ie) { thisTab.style.removeAttribute('filter'); } 
                      }
                  });
                  glow.dom.get(this).css('z-index', '10');
                } else {                  
                  glow.anim.fadeOut(this, fadeSpeed);
                  glow.dom.get(this).css('z-index', '9');
                }
            });
            
            $(self.currentTabNode.get('.tabs-nav > li')).removeClass('li-selected');
            $(self.currentTabNode.get('.tabs-nav > li').item(tabIndex)).addClass('li-selected');
            self.currentActiveTab = tabIndex;
        }

        function rotateTabs() {
            if (self.rotate) {
              self.currentActiveTab++;
              if (self.currentActiveTab >= self.tabCount) { self.currentActiveTab = 0; }
              activateTab(self.currentActiveTab);
              setTimeout(rotateTabs, self.rotateDelay);
            }
        }
    },     
    
	tabbedStory: function() {
        // TC2 story tabs
        var tabContainers = glow.dom.get(ws.selectors.tabbedStory); 
        if (tabContainers.length) {  
            glow.dom.get('body.story').addClass('tabbed-story');

            tabContainers.each(function() {
                var node = glow.dom.get(this),
                    tabsType = node.hasClass('tabs-v') ? 'vertical' : 'horizontal';
                    tabs = node.get('.tab'),                    
                    tabsNav = '';
                
                tabsNav = '<ul class="tabs-nav blq-clearfix">';
                
                node.addClass('blq-clearfix').addClass('tabs');
                tabs.hide();
                tabs.each(function(i) {
                    var tabTitle = glow.dom.get(this).get('h2').text(),
                        className = (i == 0) ? 'first' : '';
                                        
                    glow.dom.get(this).get('> h2').remove();                                        
                    if (i == tabs.length-1) { className = 'last'; }
                    //tabsDom.get('.li-tabs-nav').append('<li class="'+className+'"><a href="#'+tabSlugName+'">'+tabTitle+'</a></li>');
                    //tabsDom.append('<div class="li-tab" id="'+tabSlugName+'">'+tabContent+'</div>');      
                    tabsNav += '<li class="'+className+'"><a href="#">'+tabTitle+'</a></li>';  
                    glow.dom.get(this).addClass('tab'); 
                    
                    if(glow.dom.get(this).get('.module').length > 0){
                    	wrapAdjacentModules(glow.dom.get(this));  
                    }
                                          
                });
                
                tabsNav += '</ul>';                
                node.prepend(tabsNav);                
                
                // Replace original content with tabs 
                //node.html(tabsDom.html());                
                
                if (tabsType == 'vertical') {
                  // Take up all available space
                  var availableWidth = node.width(),
                      tabContentWidth = availableWidth - parseInt(node.get('.tabs-nav').width()) - parseInt(node.get('.tab').css(['padding-left','padding-right']));
                        
                  node.get('.tab').width(tabContentWidth);
                }
                 
                // Check tab nav for wrapped lines
                var tabNavHeight = node.get('.tabs-nav').height(),
                    tabNavWidth = node.get('.tabs-nav').width(),                    
                    tabHeight = parseInt(node.get('.tabs-nav li').height()) + parseInt(node.get('.tabs-nav li').css('padding-top')),
                    tabCount = node.get('.tabs-nav li').length,
                    optimalTabWidth = Math.floor(tabNavWidth/tabCount), // Account for 2px borders on selected tab
                    tabContainerWidth = node.width(),
                    maxTabHeight = 0;                                
                            
                if (tabsType == 'horizontal') {
                    node.get('.tabs-nav li').width(optimalTabWidth);                    
                    node.get('.tabs-nav li').each(function() {
                        if (glow.dom.get(this).height() > maxTabHeight) { maxTabHeight = glow.dom.get(this).height(); }
                        
                    });                                                    
                    node.get('.tabs-nav li').height(maxTabHeight);                   
                    node.get('.tabs-nav li a').each(function() {
                        var paddingTop = (maxTabHeight - glow.dom.get(this).height())/2;
                        glow.dom.get(this).height(maxTabHeight);
                    });                                        
                }      
                
                if (tabsType = 'vertical') {
                    var tabContentWidth = node.get('.tab').width();
                    node.get('.tab').css('min-height', tabNavHeight);
                }
                
                node.append('<div class="tabs-footer blq-clearfix"> </div>');
                  
                //if (glow.env.ie) { ws.pageOnload(); } // Run any page onload functions since they could be lost in the HTML rewrite
                // Setup events
                node.get('.tabs-nav a').each(function(tabIndex) {                    
                    glow.events.addListener(this, 'click', function() {
                        node.get('.tabs-nav li').removeClass('open').removeClass('before-open');
                        glow.dom.get(this).parent().addClass('open');
						
						if (glow.env.ie && glow.env.ie < 7) {
							node.get('.tab').hide();
						} else {
							var tabbedContent = glow.dom.get(node.get('.tab'));
							tabbedContent.each(function(i) {
								if (glow.dom.get(tabbedContent.item(i)).get('> div > div > div').hasClass('emp')){
									if (i == tabIndex){ 								
										glow.dom.get(this).css('position', 'relative')
														  .css('top', '0')
														  .css('left', '0')
														  .css('height', 'auto')
														  .css('padding', '8px');
														  
									} else {
										glow.dom.get(this).css('position', 'relative')
														  .css('top', '-1000px')
														  .css('left', '-1000px')
														  .css('visibility', 'visible')
														  .css('min-height', '0')
														  .css('height', '0')
														  .css('padding', '0');
									}
								} else {
									glow.dom.get(tabbedContent.item(i)).hide();
								}
							});            
						}
                        
                        glow.dom.get(node.get('.tab')[tabIndex]).show();  

                        var navTabs = glow.dom.get(this).parent().parent().get('li');
                        navTabs.each(function(i) {
                            if (glow.dom.get(navTabs.item(i)).hasClass('open')) {
                                glow.dom.get(navTabs.item(i-1)).addClass('before-open');                          
                            }
                        });
                        
                        // Fire event to nodes inside the tabs to notify that tabs have changed
                        glow.events.fire(node.get('*'), 'tabChange');
                                                     
                        return false;
                    });
                });
                
                function wrapAdjacentModules(tab){
                	var consecutiveModules = new glow.dom.NodeList(),
                		tabContent = tab.get('> div'),
                		insertPosition,
                		insertType;
                	tabContent.children().each(function(i){
                		var thisElement = glow.dom.get(this);
                		if(glow.dom.get(this).hasClass('module')){
                			var module = thisElement;
	                		if( (module.prev().hasClass('module')) || (module.next().hasClass('module'))  ){
	                     		consecutiveModules.push(module);
	                			if(consecutiveModules.length==1){
	                				if(module.prev().length>0){
	                					insertType = 'previous-sibling-element';
	                					insertPosition = module.prev();
	                				}else{
	                					insertType = 'parent-element';
	                					insertPosition = module.parent();
	                				}
	                			}
	                		}	
                		}else{
                			if(consecutiveModules.length>0){
                				var wrappedModules = glow.dom.create('<div class="module-wrapper"></div>');
                				wrappedModules.append(consecutiveModules);
                				switch(insertType){
                					case 'previous-sibling-element':
                					insertPosition.after(wrappedModules);
                					break;
                					case 'parent-element':
                					insertPosition.prepend(wrappedModules);
                					break;
                				}	
                				consecutiveModules = new glow.dom.NodeList();
                			}
                			
                		}
                	});
                }
                
                // Go to the first tab
                glow.events.fire(node.get('.tabs-nav a').item(0), 'click');              
            });                                    
            
            glow.dom.get(ws.selectors.tabbedStory).css('visibility', 'visible');             
        }        
    },
    
    tabbed: function(selector) {
        // Tabbed Module for manual includes (ex Livestats)                       
        glow.dom.get(selector).each(function() {
            var node = glow.dom.get(this),
                tabs = node.get('.tab');
                        
            glow.events.addListener(tabs, 'click', function() {
                node.children().removeClass('open');
                glow.dom.get(this).addClass('open');
                glow.dom.get(this).next().addClass('open');
                return false;
            });            
        });
    },
  
    timeline: function(selector) {
        glow.dom.get(selector).each(function() {
            var timelineNode = glow.dom.get(this),
                direction = timelineNode.css('direction'),
                timelineItems = timelineNode.get('> .content > ul > li'),
                numTimelineItems = timelineItems.length,
                numItemsInView = 4,
                lastActiveItem = (numTimelineItems-numItemsInView),
               	navItemWidth = '',
                itemIndex = 0,
                nextIndex = 1,
                carouselAnimDur = 0.15,
                sliderAnimDur = 0.2,
                timelineCarousel = '',
                timelineNav = '',
                timelineNavItems = '',
                dateOverlay = '',
                timelineSlider = '',
                timelineSliderHandle = '',
                dragHandleContainer = '',
                dragHandleTarget = '',
                dragHandle = '',
                endNavItemWidth,
                timelineWidth;
                
                if(timelineNode.parent().hasClass('module')){
                	timelineWidth = 624;
                } else {
                	timelineWidth = ws.utils.getSlotWidth(timelineNode);
                }

                if(glow.env.gecko){
                	navItemWidth = ((timelineWidth-72)/(numTimelineItems-1));
                	endNavItemWidth = Math.floor((navItemWidth/2)+12);
                } else {
                	navItemWidth = Math.floor((timelineWidth-72)/(numTimelineItems-1));
                	endNavItemWidth = (navItemWidth/2)+12;
                }

                loadTimeline();
        
				function loadTimeline(){
					prepareCarouselItems();
					loadCarousel();
					if(numTimelineItems>numItemsInView){
						loadTimelineNav();
					}
					timelineNode.css('visibility', 'visible');
				}
				
				function prepareCarouselItems(){
					// Wrap the text content in <p>'s
					timelineNode.get('.body').each(function(){
						var timelineItem = glow.dom.get(this),
							itemText = timelineItem.text();
						timelineItem.replaceWith('<p class="body">' + itemText + '</p>')
					});
				    /* Standardize heights of text and titles */
				   	var maxTitleHeight = 0;
                	var maxParaHeight = 0;
                	var maxAssocHeight = 0;
                	timelineNode.get('> .content > ul > li').each(function() {
				        var thisNode = glow.dom.get(this),
				        	titleHeight = thisNode.get('.title').height(),
				        	paraHeight = thisNode.get('p.body').height();	
			           	maxTitleHeight = (titleHeight > maxTitleHeight) ? titleHeight : maxTitleHeight;  
			         	maxParaHeight = (paraHeight > maxParaHeight) ? paraHeight : maxParaHeight;
			         	if(thisNode.get('ul.associated').length>0){
			         		var assocHeight = (thisNode.get('ul.associated').height());
			        		maxAssocHeight = (assocHeight > maxAssocHeight) ? assocHeight : maxAssocHeight; 
			        	}                  
				    });
				    timelineItems.get('.title').height(maxTitleHeight);
				   	timelineItems.get('p.body').height(maxParaHeight);
				   	timelineItems.get('ul.associated').height((maxAssocHeight));
				   	timelineItems.get('.box .content').height(maxParaHeight + maxAssocHeight + 16);
				    
				    // Standardize height of carousel items
				    var maxCarouselItemHeight = 0;
				    timelineItems.each(function() {
				        var thisNode = glow.dom.get(this),
				            carouselItemHeight = thisNode.height();
				        maxCarouselItemHeight = (carouselItemHeight > maxCarouselItemHeight) ? carouselItemHeight : maxCarouselItemHeight;                    
				    });
				    timelineItems.height(maxCarouselItemHeight);
				}
				
				function loadCarousel(){
		            timelineCarousel = new glow.widgets.Carousel(timelineNode.get('> .content > ul'), {
		            	className: 'ws-carousel',
		            	pageNav: true,
		            	animDuration: carouselAnimDur,
		            	onScroll: function(){
		            		timelineNode.get('.first').removeClass('first');
		            		glow.dom.get(this.items[itemIndex]).addClass('first');	
		            	}
		            });
		            if (direction == 'rtl') { timelineCarousel._direction = 'right'; }
	            } 
	            
	            // timeline navigation loader
	            function loadTimelineNav(){
		  			timelineNav = glow.dom.create('<div class="timeline-nav"><div class="timeline-nav-step tl-back"></div><ol></ol><div class="timeline-nav-step tl-fwd tl-active"></div></div>');
			  		timelineNode.get('> .content').append(timelineNav);
		  			loadTimelineNavItems();
		  			loadDateOverlay();
		  			loadTimelineSlider();
		  			loadBackForwardButtons();
		  			if(direction == 'ltr') loadDraggableSlider();
	            }
	            
	            function loadTimelineNavItems(){
	            	var timelineNavList = timelineNav.get('ol');
        			timelineNavItems = timelineItems.clone()
  													.removeClass('carousel-item')
  													.css('height','24px');
	            	timelineNavItems.each(function(i){
		  				var thisNode = glow.dom.get(this);
		  				thisNode.get('.box').replaceWith(
		  					'<span class="tl-date">' + thisNode.get('.title').text() + '</span>'
		  				);
			  			thisNode.append('<span class="dot">' + (i+1) + '</span>');
			  			var spanDot = thisNode.get('span.dot');
			  			
			  			if(i==0){
		  					thisNode.css('width',endNavItemWidth+'px');
		  					(direction == 'rtl') ?  spanDot.css('right','8px') : spanDot.css('left','8px');
		  					thisNode.addClass('current');
		  				}else if(i==(numTimelineItems-1)){
		  					thisNode.css('width',endNavItemWidth+'px');
		  					(direction == 'rtl') ?  spanDot.css('left','8px') : spanDot.css('right','8px');
		  				}else{
		  					thisNode.css('width',navItemWidth+'px');
		  					spanDot.css('left',((navItemWidth/2)-6) + 'px');
		  				}
		  			});
		  			loadNavItemEvents();
		  			timelineNavList.append(timelineNavItems);
					timelineNav.append(timelineNavList);
	            }
	            	            
	            function loadNavItemEvents(){
		  			glow.events.addListener(timelineNavItems, 'mouseenter', function(){
		  				var thisNode = glow.dom.get(this),
		  					currentItem = timelineNav.get('.current');
		  				if( !(	thisNode.eq(currentItem) 
		  						|| thisNode.prev().eq(currentItem) 
		  						|| thisNode.prev().prev().eq(currentItem) 
		  						|| thisNode.prev().prev().prev().eq(currentItem) ) ){
		  					thisNode.css('cursor','pointer').addClass('tl-nav-hover');
		  					showDateOverlay(thisNode);
		  				}
		  			});
		  			glow.events.addListener(timelineNavItems, 'mouseleave', function(){
		  				var thisNode = glow.dom.get(this);
		  				hideDateOverlay(thisNode);
		  				thisNode.css('cursor','auto').removeClass('tl-nav-hover');
		  			});
		   			glow.events.addListener(timelineNavItems, 'click', function(){
		   				var thisNode = glow.dom.get(this),
		  					thisIndex = thisNode.get('span.dot').text(),
		  					currentItem = timelineNav.get('.current');
		  					
		  				thisNode.css('cursor','auto').removeClass('tl-nav-hover');
		  				if( !(	thisNode.eq(currentItem) 
		  						|| thisNode.prev().eq(currentItem) 
		  						|| thisNode.prev().prev().eq(currentItem) 
		  						|| thisNode.prev().prev().prev().eq(currentItem) ) ){
		  					
		  					hideDateOverlay();
		  					if(thisIndex>lastActiveItem){
		  						itemIndex=lastActiveItem;
		  					} else {
		  						itemIndex=thisIndex-1; 					
		  					}
		  					switchCurrentItem();
		  					activateBackForwardButtons()
		  					timelineCarousel.moveTo(itemIndex);

		  					/* move slider */
		  					slidePx = (navItemWidth*itemIndex)+'px';
                            var spec = (direction == 'ltr') ? { 'left':slidePx } : { 'right':slidePx } 
                            
		  					glow.anim.css( glow.dom.get('.tl-slider-handle'), sliderAnimDur,
		  						spec,
		  						{
		  							onComplete:function(){
		  								//set nav step button to active
					  					if(itemIndex==lastActiveItem){
					  						timelineNode.get('.tl-fwd').removeClass('tl-active');
					  						timelineNode.get('.tl-back').addClass('tl-active');
					  					} else if(itemIndex==0) {
					  						timelineNode.get('.tl-back').removeClass('tl-active');
					  					} else {
					  						timelineNode.get('.tl-fwd,.tl-back').addClass('tl-active');
					  					}
					  					if(direction == 'ltr') moveDraggableSlider();
		  							}
		  						}
		  					).start();
		  				}
		  			});
	            }
	            
	            //Date overlay functions
	            function loadDateOverlay(){
		  			dateOverlay = glow.dom.create('<div class="timeline-nav-date"></div>');
	            }
	            
	            function showDateOverlay(thisNode){
	  				dateOverlay.text(thisNode.get('.tl-date').text());
	  				dateOverlay.css('visibility','hidden');
	  				timelineNav.append(dateOverlay);
	  				dateOverlay.css('left',calculateDateOverlayPos(thisNode,dateOverlay.width()) + 'px');
	  				dateOverlay.css('visibility','visible');  				
	  			}
	  			
	  			function hideDateOverlay(thisNode){
	  				dateOverlay.remove();
	  			}
	  			
	  			function calculateDateOverlayPos(thisNode,overlayWidth){
	  				var navListPos = thisNode.position().left;
	  				var navOffSet = 24;
	  				if( Math.floor(navListPos)<12 ){
	  					overlayPos = 0 + navOffSet;
	  				}else if( Math.ceil(navListPos + endNavItemWidth) >= (timelineWidth-60)){
	  					overlayPos = ((timelineWidth-48) - overlayWidth + 8);
	  				} else {
	  					overlayPos = ((navListPos + navOffSet + (navItemWidth/2)) - ((overlayWidth/2) + 8));
	  				}
	  				return overlayPos;
	  			}

	  			//Coloured slider indicating visible items
	  			function loadTimelineSlider(){
		  			timelineSlider = glow.dom.create('<div class="timeline-nav-slider"><div class="tl-slider-handle"></div></div>');
		  			timelineNav.append(timelineSlider);
		  			timelineSliderHandle = timelineSlider.get('.tl-slider-handle');
		  			timelineSliderHandle.css('width',((navItemWidth*3)+24)+'px');
		  			(direction == 'ltr') ? timelineSliderHandle.css('left','0') : timelineSliderHandle.css('right','0');	
	  			}
	  			
	  			function loadBackForwardButtons(){
		  			glow.events.addListener('.timeline-nav-step', 'click', function(e){
		  				var thisNode = glow.dom.get(this);	
		  				if(thisNode.hasClass('tl-fwd') && thisNode.hasClass('tl-active')){
		  					moveTimelineIncremental('fwd',thisNode);	
		  				}else if(thisNode.hasClass('tl-back') && thisNode.hasClass('tl-active')){
		  					moveTimelineIncremental('back',thisNode);
		  				}	
		  			});
				}
				
	  			function activateBackForwardButtons(){
	  				timelineNode.get('.tl-back,.tl-fwd').addClass('tl-active');
	  				if(itemIndex == 0){
	  					timelineNode.get('.tl-back').removeClass('tl-active');
	  				} else if (itemIndex >= lastActiveItem){
	  					timelineNode.get('.tl-fwd').removeClass('tl-active');
	  				}
	  			}
	  			
	  			function moveTimelineIncremental(moveDirection,node){
	  				var slideOffsetPx = '',
	  				    spec;	  				
	  				if(moveDirection == 'fwd'){
	  					itemIndex = itemIndex + 1;
	  					slideOffsetPx = (navItemWidth*itemIndex)+'px';	  					
	  					spec = (direction == 'ltr') ? { 'left':slideOffsetPx } : { 'right':slideOffsetPx };	  					
		  				var moveSliderFwd = glow.anim.css( timelineSliderHandle, sliderAnimDur,
	  						spec,
	  						{
	  							onStart:function(){
	  								node.removeClass('tl-active');
	  							},
	  							onComplete:function(){
	  								timelineCarousel.moveTo(itemIndex);
	  								switchCurrentItem();
	  								activateBackForwardButtons();
	  								if(direction == 'ltr') moveDraggableSlider();
	  							}
	  						}
	  					).start();
	  				}else if(moveDirection == 'back'){
	  					itemIndex = itemIndex - 1;
	  					slideOffsetPx = (navItemWidth*itemIndex)+'px';
	  					spec = (direction == 'ltr') ? { 'left':slideOffsetPx } : { 'right':slideOffsetPx };
	  					glow.anim.css( timelineSliderHandle, sliderAnimDur,
	  						spec,
	  						{
	  							onStart:function(){
	  								node.removeClass('tl-active');
	  							},
	  							onComplete:function(){
	  								timelineCarousel.moveTo(itemIndex);
	  								switchCurrentItem();
	  								activateBackForwardButtons();
	  								if(direction == 'ltr') moveDraggableSlider();
	  							}
	  						}
	  					).start();	  					
	  				}
	  			}

	  			function loadDraggableSlider(){
	  				dragHandleContainer = glow.dom.create('<div class="tl-drag-container"><div class="tl-drag-handle-target"><div class="tl-drag-handle"></div></div></div>');
	  				dragHandleContainer.width((timelineWidth-48)-(navItemWidth*3));
	  				dragHandleTarget = dragHandleContainer.get('.tl-drag-handle-target');
	  				dragHandleTarget.width(navItemWidth);
	  				dragHandle = dragHandleContainer.get('.tl-drag-handle');
	  				dragHandle.width(timelineSliderHandle.width());
	  				timelineNav.append(dragHandleContainer);
	  				
	  				var dropTargetsArray = new Array();
		  			timelineNavItems.each(function(i){
		  				var thisNode = 	glow.dom.get(this),
		  								thisItemIndex = i;
		  				var dropTarget = new glow.dragdrop.DropTarget(thisNode, {
		  					onEnter: function () {
						    	if(thisItemIndex > lastActiveItem){
						    		thisItemIndex = lastActiveItem;
						    	}
						    	sliderMoveTimeline(thisItemIndex);
						    },
						    onDrop: function () {
						    	sliderMoveTimeline(thisItemIndex);
						    }
						});
		  				dropTargetsArray.push(dropTarget);
		  			});
		  			
		  			var timelineDragHandle = new glow.dragdrop.Draggable(dragHandleTarget, {
						container: dragHandleContainer,
						handle: dragHandle,
						axis: 'x',
						dropTargets: dropTargetsArray,
					  	onDrop : function (e) {
					    	e.preventDefault();
					  	},
					  	onAfterDrop: function(){}
					});
	  			}
	  			
				function sliderMoveTimeline(index){
					itemIndex = index;
					var offsetPx = (navItemWidth*index)+'px',
					    scrollDir = (direction == 'ltr') ? 'left' : 'right';
					timelineSliderHandle.css(scrollDir,offsetPx);
					moveDraggableSlider();
	  				timelineCarousel.moveTo(itemIndex);
	  				activateBackForwardButtons();
	  				switchCurrentItem();
	  			}
	  			
	  			function moveDraggableSlider(){
	  			    var scrollDir = (direction == 'ltr') ? 'left' : 'right';
	  			    dragHandleTarget.css(scrollDir,timelineSliderHandle.css(scrollDir));
	  			}
	  			
	  			function switchCurrentItem(){
	  				timelineNav.get('.current').removeClass('current');
	  				glow.dom.get(timelineNavItems[itemIndex]).addClass('current');
	  			}
	  			
	  			function rtlSwitch(dir){
	            	if(direction == 'rtl'){
	            		switch(dir){
	            			case 'left':
	            			dir = 'right';
	            			break;
	            			case 'right':
	            			dir = 'left';
	            			break;
	            		}
	            	}
	            	return dir;
	            }	  
        });
    },
    
    moreMultimediaTabs: function(selector) {
        glow.dom.get(selector).each(function() {
            var node   = glow.dom.get(this),
                titles = node.get('> .content > ul > li > .list > .title'),
				notabs = (node.hasClass('li-moremultimedia-notabs'))? true: false;
				
            var tabsNav = '<ul class="tabs-nav blq-clearfix">';                                        
            titles.each(function(i) {
                var tabTitle = glow.dom.get(this).text();
				var tabLink = (glow.dom.get(this).get('a').length > 0 && glow.dom.get(this).get('a').hasAttr('href'))? glow.dom.get(this).get('a').attr('href'): '#';
				var tabClass = (tabLink == '#')? '': 'notabs-link';
				tabsNav += '<li><a class="'+tabClass+'" href="'+tabLink+'">'+tabTitle+'</a></li>';
            });
            tabsNav += '</ul>';            
            node.prepend(tabsNav);
            node.get('> .content > ul > li').addClass('panel');
            
            node.get('.tabs-nav li').each(function(i) {
                glow.dom.get(this).addClass('tab');
				
				//if (glow.dom.get(this).get('a').attr('href') == '#') {
				if(glow.dom.get(this).get('a').attr('href').indexOf('#') >= 0) {
					glow.dom.get(this).get('a').css('cursor', 'default');
				
					glow.events.addListener(this, 'click', function() {	
					
						if (notabs) { return false; }
					
						var panelToOpen = glow.dom.get(node.get('> .content > ul > li').item(i));
						node.get('li, > .content > ul > li').removeClass('open');
						//node.get('> .content > ul > li').removeClass('open');                    
						
						glow.dom.get(this).addClass('open');
						panelToOpen.addClass('open');

						var navHeight = node.get('.tabs-nav').height();
						var panelHeight = panelToOpen.get('> div > .content').height();
						if(panelHeight < navHeight){
							panelToOpen.get('> div > .content').height(navHeight);
						}

						//panelToOpen.get('> div > .content').height(node.height()-(parseInt(node.css('padding-bottom')) + parseInt(node.css('padding-top'))));

						return false;
					});            
				}
            });
			
			// if the config is setup, open a tab by default, otherwise open with first tab
			if (ws.config[ws.env.service].moreMultimediaDefaultTabs) {
				
				var foundTab = false;
				
				// compare config key value pairs to open tabs by default
				for (var key in ws.config[ws.env.service].moreMultimediaDefaultTabs) {				
					var value = ws.config[ws.env.service].moreMultimediaDefaultTabs[key];				
					if (glow.dom.get(value).length > 0) {				
						glow.dom.get(node.get('.tabs-nav li a')).each(function(){					
							if (glow.dom.get(this).text() == key) {						
								glow.events.fire(glow.dom.get(this).parent('.tab'), 'click');	
								foundTab = true;					
							} 					
						});				
					} 				
				}
				
				if (!foundTab){fireDefaultTab();}
				
			} else {
	            // 'Hit' the first tab on first run by default
	           fireDefaultTab();				
			}			
			
			function fireDefaultTab() {				
				glow.events.fire(glow.dom.get(node.get('.tabs-nav li').item(0)), 'click');				
			}
									
            //set all teasers in a list to the same height            
            var maxTeaserHeight = 0;
            contentListTeasers = node.get('.teaser');
            contentListTeasers.each(function(){
           		var teaserHeight = parseInt(glow.dom.get(this).height()) + 8; // Hardcoding baseline padding here - much faster than quering the DOM - DV          		
           		if(teaserHeight > maxTeaserHeight){
           			maxTeaserHeight = teaserHeight;
           		}
           	});
            	
            contentListTeasers.height(maxTeaserHeight);            
  			node.css("visibility", "visible");    			  			
        });
    },
    
    scrollable: function(selector) {        
        // Make an element scrollable with custom scrollbars
        glow.dom.get(selector).each(function() {
            var node = glow.dom.get(this),
                height = node.height(),
                sliderActive = false,
                sliderSize,
                bottomArrowMargin;
            
            if (glow.env.ie == 6) {
                // No custom scrollbars on IE6 - sorry
                node.css('overflow', 'auto');
                return false;				
            }            
                        
            // Get actual height of the content            
            node.html('<div class="scroll-container"><div class="scroll-content">'+node.html()+'</div></div>');
            var contentHeight = node.get('.scroll-content').height();
            
            if (contentHeight < height) { return false; } // No scrollbars in content is shorter than container
            node.get('.scroll-container').height(height).css('overflow', 'hidden');                                        
        
            var Slider = new glow.widgets.Slider(node, {
                    className: 'slider',
                    theme: 'gel',
                    vertical: true,
                    buttons: false,
                    min: 0,
                    max: 100,
                    val: 100,  
                    size: height,                  
                    changeOnDrag: true,                    
                    onChange: function () {  
						//var value = ((100 - this.val()) / 100) * (contentHeight - height);
                        var value = 0;
						if (this.val() > 3)
						{					
							value = ((100 - this.val()) / 100) * (contentHeight - height);
						} else {
							if (contentHeight <= 600)
								value = ((115 - this.val()) / 100) * (contentHeight - height);
							else 
								value = ((105 - this.val()) / 100) * (contentHeight - height);
						}				
						
                        this.element.parent().parent().get('.scroll-content').css('margin-top', -value);
                    },
                    onSlideStart: function() { sliderActive = true; },
                    onSlideStop: function() { sliderActive = false; hideHandle(); }
                });

            Slider.element.get('.slider-handle').append('<div class="slider-handle-hover"><span></span></div>');
            Slider.element.get('.slider-handle-hover').css('opacity', 0);
            Slider.element.css('top', parseInt(node.css('padding-top'))); // If content has top padding, reflect it in the slider
            
            function redrawSlider() {
                // Redraws the scrollbars against new content height
                contentHeight = node.get('.scroll-content').height();
                sliderSize = (height/contentHeight); 
                sliderSize = sliderSize * height; 
				
                if (sliderSize < 40) { sliderSize = 40; } // Fix min height - design guide
                if (sliderSize > 88) { sliderSize = 88; } // Fix max height - design guide 
                Slider.element.get('.slider-handle').height(sliderSize);                
                Slider._handleSize = sliderSize;
                Slider._pixelsPerVal = ((Slider._trackSize - Slider._handleSize) / 100);

                // Arrow positioned this way since IE doesn't do opacity of child elements with position: absolute
                bottomArrowMargin = sliderSize - Slider.element.get('.slider-handle-hover span').height();
                Slider.element.get('.slider-handle-hover span').css('margin-top', bottomArrowMargin);       
            }            

            redrawSlider();     
            glow.events.addListener(node, 'redraw', function() {  
                redrawSlider();
            });                            
            glow.events.addListener(Slider.element, 'mouseover', function () { 
                glow.dom.get(this).addClass('slider-hover');                
                //glow.anim.fadeIn(glow.dom.get(this).get('.slider-handle-hover'), 0.2);
                glow.dom.get(this).get('.slider-handle-hover').css('opacity', 1);
            });
            glow.events.addListener(Slider.element, 'mouseout', function() {                
                glow.dom.get(this).removeClass('slider-hover');
                hideHandle();
            });            
            glow.events.addListener(node, 'mousewheel', function(event) {
                var currentVal = Slider.val();
                if (event.wheelDelta == 1) { Slider.val(currentVal*1.2); glow.events.fire(Slider, 'change'); }
                if (event.wheelDelta == -1) { Slider.val(currentVal-currentVal*0.2); glow.events.fire(Slider, 'change'); }
                return false;
            });
            
            // Adjust content width to compensate for slider
            var contentWidth = node.get('.scroll-content').width(),
                sliderWidth = node.get('.slider').width();
            node.get('.scroll-content').width(contentWidth-(sliderWidth/2));
            
            function hideHandle() {
                setTimeout(function() {
                    if (!Slider.element.hasClass('slider-hover') && sliderActive == false) {
                        //glow.anim.fadeOut(Slider.element.get('.slider-handle-hover'));
                        Slider.element.get('.slider-handle-hover').css('opacity', 0);
                    }
                }, 2000);             
            }                                            
        });
    },

    topicsAtoZ: function(selector) {
    	var numTopicsPerPage = 90,
    		topicListSsi = ws.env.servicePath + '/_external/topics_az.sssi';
    		//topicListSsi = '/QA/gel1/includes/lists/topics_az.sssi';
    	
    	//override number of topics if necessary in core.js
    	if(ws.config[ws.env.service].topicsAzPerPage){
    		numTopicsPerPage = ws.config[ws.env.service].topicsAzPerPage;
    	}

		glow.dom.get(selector).each(function() {
    		var thisNode = glow.dom.get(this),
    			browseAllLink = thisNode.get('.cta'),
    			topicPopup;
    		
    		if(!(thisNode.parent().hasClass('bodytext'))){
	      		loadCategories(thisNode,2);
	
				glow.events.addListener(browseAllLink, 'click', function(e) {
	    			loadFullTopicList(browseAllLink);
					e.preventDefault();
				});		
    		}
    		
    		thisNode.css('visibility','visible');  
    	});
    	
    	function loadFullTopicList(browseAllLink){
	    	if(glow.dom.get('#topics-popup').length==0){
	    		var request = glow.net.get(topicListSsi, {
					onLoad: function(response) {
						var fullTopicList = glow.dom.create(response.text());
						
						var closeButton = glow.dom.create('<a class="ws-popup-close" href="#">X</a>');
						fullTopicList.prepend(closeButton);
						
						topicPopup = new glow.widgets.Overlay(
				        	fullTopicList, {
				                anim: 'fade',
				                className: 'ws-modal-popup',
				                id: 'topics-popup',
				                modal: 'true'
			            });
	
			            topicPopup.show();
						
						loadCategories(fullTopicList,4,numTopicsPerPage);
	
						fullTopicList.css('visibility','visible');
						
						//re-centre popup
						topicPopup.setPosition();
						
						//load close button behaviour		
						glow.events.addListener(topicPopup.container.get('.ws-popup-close'), 'click', function(e) { 
							topicPopup.hide(); 
							e.preventDefault();
						});
						
						//load tabs behaviour	
						fullTopicList.get('.tab').each(function(){
							var thisTab = glow.dom.get(this);
			    			glow.events.addListener(thisTab, 'click', function(e) { 
				 				if(thisTab.hasClass('open')==false){
				    				fullTopicList.get('.open').removeClass('open');
				    				thisTab.addClass('open').next().addClass('open');
				    			}
				    			e.preventDefault();
			    			});
			    		});
					},
					onError: function() {
						location.href=browseAllLink.attr('href');
					},
					onAbort: function() {
						location.href=browseAllLink.attr('href');
					}
				});
			} else {
				topicPopup.show();
			}
    	}
    	
    	function loadCategories(nodeList, numCols, perPage){
    		var categories = nodeList.get('.content'),
    			categoryItems;			
    		categories.each(function(i){
    			var thisCategory = glow.dom.get(this);
    			if(i==(categories.length-1)){ thisCategory.addClass('last') }
    			
    			categoryItems = thisCategory.get('li');

    			if( categoryItems.length > parseInt(perPage) ){
    				paginate(thisCategory, categoryItems, perPage, numCols);
				}else{
					columnize(categoryItems, numCols, thisCategory);
				}
				
				var thisBody = thisCategory.get('.body');
				thisBody.css('height',thisBody.height() + 'px');
    		});
    	}
    	
    	function paginate(thisCategory, categoryItems, perPage, numCols){
    		var itemIndex = 0;
			thisCategory.addClass('paginated');
			
			loadPage(thisCategory, categoryItems, numCols, 0, perPage);

    		//insert page nav
    		var numPages = Math.ceil(categoryItems.length/perPage);
    		var pageNav = glow.dom.create(	'<div  class="topics-page-nav"><ul>' + 
    										'<li class="prev"><a href="#"><span></span>' + ws.vocab.dictionary.previous + '</a></li>' + 
    										'<li class="page-num"></li>' +
    										'<li class="next"><a href="#"><span></span>' + ws.vocab.dictionary.next + '</a></li></ul></div>');
    		for(i=1; i<=numPages; i++){
    			var thisNavItem = glow.dom.create('<a href="#">' + i + '</a>');
    			if(i==1) thisNavItem.addClass('current');
    			pageNav.get('.page-num').append(thisNavItem);
    		}
    		var prevLink = pageNav.get('.prev a').addClass('inactive');
    		var nextLink = pageNav.get('.next a');
			
			//navigate by page number
			var pagenavNum = pageNav.get('.page-num');
			glow.events.addListener(pagenavNum.get('a'), 'click', function(e) {
				var thisItem = glow.dom.get(this);
				itemIndex = (parseInt(thisItem.html())-1);
				reloadPage();
				togglePrevNext();
    			e.preventDefault();
			});
			
			//navigate by prev/next
			glow.events.addListener(prevLink, 'click', function(e) {
				var thisNode = glow.dom.get(this);
				if(!(thisNode.hasClass('inactive'))){
					itemIndex = itemIndex-1;
					reloadPage();
					togglePrevNext();
				}
				e.preventDefault();
			});
			glow.events.addListener(nextLink, 'click', function(e) {
				var thisNode = glow.dom.get(this);
				if(!(thisNode.hasClass('inactive'))){
					itemIndex = itemIndex+1;
					reloadPage();
					togglePrevNext();
				}
				e.preventDefault();
			});
			
			function togglePrevNext(){
				if(itemIndex == 0){
					prevLink.addClass('inactive');
					if(nextLink.hasClass('inactive')) nextLink.removeClass('inactive');
				}else if(itemIndex == (numPages-1)){
					nextLink.addClass('inactive');
					if(prevLink.hasClass('inactive')) prevLink.removeClass('inactive');
				}else{
					if(prevLink.hasClass('inactive')) prevLink.removeClass('inactive');
					if(nextLink.hasClass('inactive')) nextLink.removeClass('inactive');
				}
			}
			
			function reloadPage(){
				var pageNums = pagenavNum.get('a');
				var thisItemStart = (itemIndex * perPage);
				var thisItemEnd = ((itemIndex * perPage) + perPage);
				pageNums.removeClass('current');
				glow.dom.get(pageNums[itemIndex]).addClass('current');
				thisCategory.get('.body > ol').remove();
				loadPage(thisCategory, categoryItems, numCols, thisItemStart, thisItemEnd);
			}

    		thisCategory.append(pageNav);
    		
    	}
    	
    	function loadPage(thisCategory, categoryItems, numCols, start, end){
    		var itemsToShow = categoryItems.slice(start,end);
    		columnize(itemsToShow, numCols, thisCategory);
    	}
    	
    	function columnize(nodeList, numCols, parentNode){
    		var colLength,
    			totalCols = numCols,
    			parentList = nodeList.parent(),
    			start, stop, thisCol, thisColItems, columnizedTopics;
    			for(i=0; i<totalCols; i++){
					colLength = Math.ceil(nodeList.length / numCols);
					thisColItems = nodeList.slice(0,colLength);
					thisCol = glow.dom.create('<ol></ol>').append(thisColItems);
					if(i==(totalCols-1)) thisCol.addClass('last');
					parentNode.get('.body').append(thisCol);
					nodeList = nodeList.slice(colLength);
					numCols = numCols-1;
    			}
    			parentList.remove();
    	}
    	
	},
	
	inlineContextualLinks: function(selector) {
	//copies inline contextual links from bottom of page and adds it as an inline floated module 
	
		vocab = ws.vocab.dictionary;
	
		// Only apply if:
		// - It is not a full width text above story page
		// - There are at least 6 paragraphs
		// - There is no inline tabbed content	
		if (glow.dom.get('.story-body > .bodytext').length > 0 && glow.dom.get('.bodytext > p').length > 5 && glow.dom.get('.tabs-h, .tabs-v').length == 0 ) {
			
			var target = glow.dom.get('.bodytext > p')[2]; //add list at 3rd paragraph	
			
			glow.dom.get(selector).each(function() {
				var node = glow.dom.create('<div>' + glow.dom.get(this).html() + '</div>');
				var pubList = node.get('.contextual-published-list');
				node.get('.contextual-published-list').remove();
				var relatedStoriesList = node.get('.g-container > .li-relatedlinks');	
				var relatedTopicsList = node.get('.li-relatedtopics');			
				var newInlineLists = '';
	
				if (glow.dom.get('.contextual-published-list .list').length > 0) {
					pubList.each(function(){
						newInlineLists += '<div class="contextual-published-list">' + glow.dom.get(this).html() + '</div>'; // Is there a better way?
					});
				}
				else {
					relatedStoriesList.each(function() {
						newInlineLists += ws.utils.outerHtml(glow.dom.get(this));								
					});
				}
				
				relatedTopicsList.each(function() {
					newInlineLists += ws.utils.outerHtml(glow.dom.get(this));								
				});			
								
				// Fix ie bug - if floated elements are overlapping, ie pushes paragraphs apart to make space instead of just the floated modules
				// Adding empty element before floated element prevents uneccessary space between paragraphs  
				// CSS for .layoutFix is in layout.css
				var ieFix = '';				
				if (glow.env.ie) {
					ieFix = '<div class="layoutFix"><!-- --></div>';
				}	
	
				var inlineModule = glow.dom.create(ieFix +'<div class="module inline-contextual-links">'+ newInlineLists +'</div>');
				
				// Remove elements we don't need and can't fit
				inlineModule.get('.body, img, .date, .topics').remove();			
				
				var trimStoriesAt=3;

				var relatedStoriesCount=0;
				inlineModule.get(".list .content li.teaser").each(function(i) {	
					
					// remove any extraneous characters eg commas and keep the headlines						
					var itemHeadline = inlineModule.get(this).get('a');
					inlineModule.get(this).empty().prepend(itemHeadline);		
					
					glow.dom.get(this).removeClass('ts-144x81').removeClass('ts-112x63').addClass('ts-headline body-disabled'); // Other teaser sizes?			
					
					if (i>(trimStoriesAt-1)) {glow.dom.get(this).destroy();}
					relatedStoriesCount++;
				});

				if (relatedStoriesCount>trimStoriesAt) {
					inlineModule.get(".li-relatedlinks > .content > ul").after('<p class="more-contextual-links"><a href="#more-contextual-links">'+vocab.moreContextualLinks+'</a></p>');
				}
				
				glow.dom.get('.contextual-links').attr("id", "more-contextual-links");
				
				glow.dom.get(target).before(inlineModule);
			});	
			
		}
							
	},

	servicesNav: function(selector) {
		var serviceNav = glow.dom.get(selector),
			serviceOverlay = glow.dom.create('<div class="service-overlay"><span class="service-overlay-text"></span><span class="service-overlay-arrow"></span></div>'),
			nodeIconHeight = 0;
		
		serviceNav.append(serviceOverlay);
		
		serviceNav.get('li').each(function(i){
			var thisNode = glow.dom.get(this),
				nodeIcon =  thisNode.get('.services-icon');

				if(nodeIconHeight < nodeIcon.height()) { nodeIconHeight = nodeIcon.height(); }

				glow.events.addListener(nodeIcon, 'mouseenter', function () {
					var thisIcon = glow.dom.get(this),
						nodeText = thisIcon.parent().get('.services-text').html(),
						navItemPos = thisIcon.parent().parent().position(),
						offsetPos, arrowOffsetPos;

					serviceOverlay.get('.service-overlay-text').html(nodeText);
					serviceOverlay.css('display','block');

					if(ws.env.direction=='rtl'){
						offsetPos = (navItemPos.left + thisIcon.position().left + (thisIcon.width()/2)) - (serviceOverlay.width()/2);
						if( (offsetPos + serviceOverlay.width())  > serviceNav.width() ){
							offsetPos = serviceNav.width() - serviceOverlay.width();
							arrowOffsetPos = ((serviceOverlay.width()) - ((thisIcon.width()/2)+7));
						} else if(offsetPos < 16) {
							offsetPos = 16;
							arrowOffsetPos = thisIcon.position().left + ((thisIcon.width()/2)-7) - 16;
						} else {	
							arrowOffsetPos = ((serviceOverlay.width()/2)-7);
						}
					}else{
						offsetPos = ((navItemPos.left - (serviceOverlay.width()/2)) + (thisIcon.width()/2));				
						if(offsetPos < 0){ 
							offsetPos = 0;
							arrowOffsetPos = ((thisIcon.width()/2)-7);
						} else {
							arrowOffsetPos = ((serviceOverlay.width()/2)-7);
						}
					}
					
					serviceOverlay.css('left',offsetPos + 'px');
					serviceOverlay.get('.service-overlay-arrow ').css('left',arrowOffsetPos + 'px');
				});

				glow.events.addListener(nodeIcon,  'mouseleave', function () {
					serviceOverlay.css('display','none');
				});
				
				glow.events.addListener(nodeIcon,  'mousedown', function () {
					glow.dom.get(this).addClass('clicked');
				});
				
				glow.events.addListener(nodeIcon,  'mouseup', function () {
					glow.dom.get(this).removeClass('clicked');
				});
		})
		
		serviceOverlay.css('bottom',nodeIconHeight + 'px');
		
	},                           

    browserBack: function(selector) {        
      glow.dom.get(selector).each(function() {
          glow.events.addListener(glow.dom.get(this), 'click', function() { history.go(-1); return false; });
      });
    },
	
	simpleVerticalAccordion: function(selector) {
		
		glow.dom.get(selector).get('.divider').each(function() {
	
			glow.anim.slideUp(glow.dom.get(this).get('.content'), 0);
			if (glow.env.ie != 6) { glow.dom.get(this).get('.title').append('<span></span>'); }
	
			glow.events.addListener(glow.dom.get(this).get('.title'), 'click', function() {
		
				if (glow.dom.get(this).parent().hasClass('open')) {
					glow.anim.slideUp(glow.dom.get(this).next(), 0.5);
					glow.dom.get(this).parent().removeClass('open');
				} else {				
					glow.dom.get('.divider.open').each(function() {
						glow.anim.slideUp(glow.dom.get(this).get('.content'), 0.5);
						glow.dom.get(this).removeClass('open');
					});		
					glow.anim.slideDown(glow.dom.get(this).next(), 0.5);		
					glow.dom.get(this).parent().addClass('open');
				}
						
	
			});
			
		});		
		
	},
	
	changeDegreesUnits: function(selector) {
		
		currentDegrees = "cent";
		
		glow.dom.get(selector).each(function() {
			
			glow.events.addListener(this, 'click', function(e) {
				
				if (currentDegrees == "cent") {
					glow.dom.get('.cent').addClass('hide');
					glow.dom.get('.fahr').removeClass('hide');						
					currentDegrees = "fahr";
				} else {
					glow.dom.get('.fahr').addClass('hide');
					glow.dom.get('.cent').removeClass('hide');											  
					currentDegrees = "cent";						
				}				
				
				e.preventDefault();					
				
			});
			
		});							
		
	},

	rollingNews: function() {
	    if (!ws.env.rollingNews) { ws.env.rollingNews = {} };
		var selector = ws.selectors.rollingNews,
		latestAllFeed = "/worldservice/includes/core/2/data/tc2_ssi_feed.json.sssi?service="+ws.env.service+"&feed_path="+ws.env.servicePath+"/latest_all.sssi",
		visibleItems = (ws.config[ws.env.service].rollingNewsVisibleItems>0) ? ws.config[ws.env.service].rollingNewsVisibleItems : 5,
		rnInterval = ws.env.rollingNews.refreshInterval || 60*1000,
		rnNewItemClass = (ws.env.rollingNewsActive)? " rn-newitem" : "",
		rnClassOn = (ws.env.rollingNewsActive)? " rollingnews-on" : "";
				
		// don't go any further if no rolling news
		if (!glow.dom.get(selector).length) return false;

//		glow.dom.get(selector).addClass(rnClassOn);
		glow.dom.get(selector).get(".live-updates").addClass(rnClassOn);
		
		// try and get live info from json feed
		var json = "";
		glow.net.get(latestAllFeed, {
			async:true,
			useCache:true,
		  	onLoad: function(response) {
				json = (glow.lang.trim(response.text()).length > 0 && !ws.env.isTC2Live) ? response.json() : '';
				
				glow.dom.get(selector).each(function() {	        
		
			    	var rnModule = glow.dom.get(this),
			        classname = rnModule.attr('class')+' ',
					rnGenre = classname.match(/rn-genre-(.*?)\ /)[1],
					rnItems = rnModule.get(".content li.teaser"),
					rnFirstItem = glow.dom.get(rnItems.item(0)),					
					rnFirstItemUrl = glow.lang.trim(rnFirstItem.get("a").attr("href")),
					rnFirstItemUrl = rnFirstItemUrl.replace("http://www.bbc.co.uk", ""),
					rnFirstItemDatestamp = glow.lang.trim(rnFirstItem.get("p.timeago").attr("id")),
					rnFirstItemDatestamp = rnFirstItemDatestamp.replace("dt-", ""),
					rnList = rnModule.get(".content ul"),
					firstItemJson = '',
					newStoriesHTML = "";
					
			    	var rollingItemHeight = rnFirstItem.height();
			    	rollingItemHeight += (parseInt(rnFirstItem.css("padding-top"))>0)? parseInt(rnFirstItem.css("padding-top")) : 0;
			    	rollingItemHeight += (parseInt(rnFirstItem.css("padding-bottom"))>0)? parseInt(rnFirstItem.css("padding-bottom")) : 0;
			    	rollingItemHeight += (parseInt(rnFirstItem.css("border-top-width"))>0)? parseInt(rnFirstItem.css("border-top-width")) : 0;
			    	rollingItemHeight += (parseInt(rnFirstItem.css("border-bottom-width"))>0)? parseInt(rnFirstItem.css("border-bottom-width")) : 0;
			    	rollingItemHeight += (parseInt(rnFirstItem.css("margin-top"))>0)? parseInt(rnFirstItem.css("margin-top")) : 0;
			    	rollingItemHeight += (parseInt(rnFirstItem.css("margin-bottom"))>0)? parseInt(rnFirstItem.css("margin-bottom")) : 0;
					
					var borderOffset = parseInt(rnFirstItem.css("border-top-width"));
					
					var rollingNewsHeight = rollingItemHeight*visibleItems - borderOffset;
					
					rnModule.get(".disclaimer").height(rollingNewsHeight);
					for (itemJson in json) {
						if (json[itemJson].genre==rnGenre) {
							var itemJson = glow.lang.trim(itemJson.replace("http://www.bbc.co.uk", "")),
							itemDatestamp = glow.lang.trim(json[itemJson].datetime);

							if (itemJson.indexOf(rnFirstItemUrl)!=-1 && itemDatestamp.indexOf(rnFirstItemDatestamp)!=-1) { break; } 
							else {
								newStoriesHTML+='<li class="teaser ts-headline body-disabled'+rnNewItemClass+'"><a href="'+itemJson+'">'+json[itemJson].title+'</a><p id="dt-'+json[itemJson].datetime+'" class="timeago">'+json[itemJson]['date.short']+'</p></li>';
							}
						}
					}
					
					if (ws.env.rollingNewsActive) {
						glow.dom.create(newStoriesHTML).css("height", "0").css("overflow", "hidden").prependTo(rnList);
					}
					else {
						glow.dom.create(newStoriesHTML).prependTo(rnList);
						rnList.get("li.teaser").each(function(i) {
							if (i >= rnItems.length && !glow.dom.get(this).hasClass('last')) {
								glow.dom.get(this).destroy();
							}
						});
					}
					
					rnItems = rnModule.get(".content li.teaser");
					rnItems.removeClass("first");
					glow.dom.get(rnItems.item(0)).addClass("first");
					//rnModule.get(".content").css("height", "auto").css("overflow", "auto");
					rnModule.get(".disclaimer").css("display", "none");
					rnModule.get(".live-updates").css("display", "block");
					rnModule.get("ul").css("height", "auto");
										
					if (ws.env.rollingNewsActive) { 
                        glow.anim.slideDown(rnItems, 1, {
                            onComplete: function() {
                                glow.events.fire(rnModule.get('.content .body'), 'redraw'); // Poke the custom slider that new content is there  
                            }
                        });                        
                    }
					
					if (!ws.env.rollingNewsActive) {
						rnModule.get('.content .body').height(rollingNewsHeight);
						ws.modules.scrollable(rnModule.get('.content .body'));
					}
				});
				
				ws.modules.timeAgo();
				
				ws.env.rollingNewsActive = true;
			}
		});
		
		setTimeout(rollingNewsRemoveClass,10000);
		
        if (ws.env.rollingNews.active) {            
            setTimeout(ws.modules.rollingNews, rnInterval);
        }

		function rollingNewsRemoveClass() {	
//			glow.dom.get(selector).removeClass(rnClassOn);
			glow.dom.get(selector).get(".live-updates").removeClass(rnClassOn);
		}
	},

	drawers: function(selector) { 
      glow.dom.get(selector).each(function() {
      	var thisNode = glow.dom.get(this),
      		drawersId = thisNode.attr('id');

		//cursor is always set to pointer over the drawers module
  		glow.events.addListener(thisNode,  'mouseenter', function () {
			thisNode.css('cursor','pointer');
		});
		glow.events.addListener(thisNode,  'mouseleave', function () {
			thisNode.css('cursor','auto');
		});
				
		loadDrawers();

      	function loadDrawers(){
	  		thisNode.get('li').each(function(i){
	  			var thisDrawer = glow.dom.get(this);
	  			thisDrawer.addClass('draw' + i);
	  			if(i==0){
	  				thisDrawer.addClass('open').removeClass('first');
	  				if (ws.env.direction == 'ltr') {
	  					thisDrawer.get('.title').addClass('right');
	  				}
	  			} else {
	  				thisDrawer.addClass('closed');
	  				if (ws.env.direction == 'rtl') {
	  					thisDrawer.get('.title').addClass('right');
	  				}
	  			}
	  			loadDrawerMarkup(thisDrawer,i);
	  			
	  			glow.events.addListener(thisDrawer,  'mouseenter', function () {
					thisDrawer.get('.title').addClass('hover');
					thisDrawer.get('.image-opacity-layer').css('opacity','0');
				});
				glow.events.addListener(thisDrawer,  'mouseleave', function () {
					thisDrawer.get('.title').removeClass('hover');
					thisDrawer.get('.image-opacity-layer').css('opacity','.5');
				});
	  			glow.events.addListener(thisDrawer,  'click', function (e) {
	  				if(thisDrawer.hasClass('inactive')){
	  					e.preventDefault();
	  				}else{
		  				if(thisDrawer.hasClass('closed')){
							openDrawer(thisDrawer);
							e.preventDefault();
						};
	  				}
				});
  			
	  		});
      	}
      	function openDrawer(drawer){
      		var currentOpenDrawer = thisNode.get('li.open'),
      								animationTimeline,
      								slideDirection,
      								siblingDrawer,
      								drawerToSlide,
      								animSpec,
      								slideSpeed = 0.4; 
      								
      		//disable all drawers during animation
      		thisNode.get('li').addClass('inactive');

			//in which direction should drawers slide?
			drawer.get('.title').hasClass('right') ? slideDirection = 'right' : slideDirection = 'left';
			
      		//activate selected drawer and remove hover state
      		drawer.removeClass('closed').addClass('open');
      		//drawer.get('.title').removeClass('hover');
      		
      		//hide title, subtitle and icon of active drawers
      		var drawerTextElements = glow.dom.get(drawer.get('.main-title,.sub-title'),currentOpenDrawer.get('.main-title,.sub-title'));
      		var drawerIconElements = glow.dom.get(drawer.get('.drawer-icon'),currentOpenDrawer.get('.drawer-icon'));
      		drawerTextElements.css('opacity','0');
      		drawerIconElements.css('opacity','0');
			
			//slide currently open Drawer to left or right
			slideDirection == 'left' ? drawerToSlide = drawer : drawerToSlide = currentOpenDrawer;
			animSpec = {'left' : calculateMoveDistance(drawerToSlide,slideDirection) + 'px'};
			var slideOpenDrawer = glow.anim.css(drawerToSlide, slideSpeed, animSpec,{
	      		'tween' : glow.tweens.easeOut(3)
	      	});
      		var animationTimeline = [[slideOpenDrawer]];

      		//if necessary, also slide adjoining closed drawers
  			if (ws.env.direction == 'rtl') {
  				slideDirection == 'left' ? siblingDrawer = drawer.next() : siblingDrawer = drawer.prev();
  			} else {
				slideDirection == 'left' ? siblingDrawer = drawer.prev() : siblingDrawer = drawer.next();
			}
			animSpec = {'left' : calculateMoveDistance(siblingDrawer,slideDirection) + 'px'};
      		if(siblingDrawer.hasClass('closed')){
      			var siblingDrawerAnim = glow.anim.css(siblingDrawer, slideSpeed, animSpec,{
	      			'tween' : glow.tweens.easeOut(3)
	      		});
	      		animationTimeline.push([siblingDrawerAnim]);
      		}

      		new glow.anim.Timeline(animationTimeline,{
      			'onComplete' : function(){
      				currentOpenDrawer.removeClass('open').addClass('closed');
      				siblingDrawer.get('.title').removeClass(slideDirection == 'left' ? 'left' : 'right')
      											.addClass(slideDirection == 'left' ? 'right' : 'left');
      				glow.anim.css(drawerTextElements, .2, {
		      			'opacity': '1'
		      		},{
		      			'onStart' : function(){
				      		glow.anim.css(drawerIconElements, .2, {
				      			'opacity': '0.75'
				      		}).start();
		      			},
		      			'onComplete' : function(){
		      				thisNode.get('li').removeClass('inactive');
		      			}
		      		}).start();
      			}
      		}).start();
      	}

      	function calculateMoveDistance(drawer,slideDirection){
      		var slideOffset = 474,
      			slidePx;
      		slideDirection == 'right' ? slidePx = parseInt(drawer.css('left')) + slideOffset : slidePx = parseInt(drawer.css('left')) - slideOffset;
      		return slidePx;
      	}
      	
      	function loadDrawerMarkup(drawer,i){
      		var drawerLink = drawer.get('a'); 
      		var drawerCta = drawerLink.get('.cta').remove();
      		var drawerImg = drawerLink.get('img').remove();
			var drawerTitle = '<span class="main-title">' + drawer.get('a').html() + '</span>'; // handles dual language spans
      		var drawerSubtitle = '<span class="sub-title">' + drawer.get('.summary').html() + '</span>';  // handles dual language spans
      		var titleOpacityLayer = glow.dom.create('<div class="title-opacity-layer"></div>').css('opacity','.75');
      		var imageOpacityLayer = glow.dom.create('<div class="image-opacity-layer"></div>').css('opacity','.5');
      		var drawersIcon = glow.dom.create('<span class="drawer-icon"></span>').css('opacity','.75');
      		var closedImgSrc = typeof(ws.env.modules[drawersId].images[i]) == 'object' ? ws.env.modules[drawersId].images[i].src : ws.env.modules[drawersId].images[i]; 
      		var closedImg = '<img class="closed-image" alt="" width="166" height="360" src="' + closedImgSrc + '" />';
      		drawerLink.empty();
      		drawer.get('.title').prepend(drawerImg).prepend(closedImg).prepend(titleOpacityLayer).prepend(imageOpacityLayer);
      		drawerLink.append(drawerTitle).append(drawerSubtitle).append(drawersIcon);
      	}
      });
    },
	
	marketDataFeeds: function(selector) {
		
		glow.dom.get(selector).each(function() {
			var thisNode = glow.dom.get(this);
			thisNode.get('td.change').each(function(i){
				var thisCell = glow.dom.get(this);
				thisCell.prepend('<span></span>');
				var data = glow.lang.trim(thisCell.text());
				if(data.substr(0,1)=='-'){
					thisCell.parent().addClass('down');
				}else{
					if(data.match(/[1-9]/)){
						thisCell.parent().addClass('up');
					}
				}
			})
		});							
		
	},
	
	socialBookmarkPanel: function(selector) {		
		// scan document tools, if there are more than just facebook and twitter, add share icon with info panel to show the rest	
		
		glow.dom.get(selector).each(function(){			
			var extraSocialBookmarkLinks = '';
			
			glow.dom.get(this).get('li').each(function(){		
				// check if theres more than the default facebook, twitter, print and email links in doc tools	
				if (!glow.dom.get(this).hasClass('facebook') && !glow.dom.get(this).hasClass('twitter') && !glow.dom.get(this).hasClass('email') && !glow.dom.get(this).hasClass('print') && !glow.dom.get(this).hasClass('report-error')) {					
					extraSocialBookmarkLinks += ws.utils.outerHtml(glow.dom.get(this));					
					glow.dom.get(this).destroy();
				}				
			});			
			
			if (!extraSocialBookmarkLinks == '') {				
				//setup the share cta from vocab if available
				var shareTitle;
				var closeTitle;			
				if (ws.vocab.dictionary.share != null) {shareTitle = ws.vocab.dictionary.share;} else {shareTitle = 'Share';}
				if (ws.vocab.dictionary.close != null) {closeTitle = ws.vocab.dictionary.close;} else {closeTitle = 'Close';}				
				var shareLink = '<li class="share"><a href="#" title="' + shareTitle + '">' + shareTitle + '</a></li>';
				
				//insert shared link and icon after the twitter icon				
				glow.dom.get(this).get('.twitter').after(shareLink);				
				shareLink = glow.dom.get(this).get('.share a');
				
				var helpLink = '';
				if (ws.config[ws.env.service].socialBookmarkPanel) {
					var helpLinkUrl = ws.config[ws.env.service].socialBookmarkPanel.helpLinkUrl;
					var helpTitle;
					if (ws.vocab.dictionary.help != null) {helpTitle = ws.vocab.dictionary.help;} else {helpTitle = 'What is this?';}
					helpLink = '<a href="' + helpLinkUrl + '" class="share-help-link">' + helpTitle + '</a>';
				}
				
				//create the panel content
				var panelContent = '<h2 class="hd">' + shareTitle + '</h2><div class="social-bookmark-content">' + helpLink + '<ul>' + ws.utils.outerHtml(glow.dom.get(this).get('.facebook')) + ws.utils.outerHtml(glow.dom.get(this).get('.twitter')) + extraSocialBookmarkLinks + '</ul></div>';
				panelContent = glow.dom.create(panelContent);	
				panelContent.get('a').prepend('<span></span>');	
				
				//create the panel
				var myInfoPanel = new glow.widgets.InfoPanel(				
					panelContent,					
					{
						context: shareLink,
						className: 'social-bookmark-panel'
					}
				);				
				
				//translate the close button title
				glow.dom.get('.panel-close').attr('title', closeTitle);
				
				//open panel on share link click event
				glow.events.addListener(shareLink,  'click', function (e) {					
					e.preventDefault();					
					myInfoPanel.show();				
				});
			}
		});
				
		//shorten url for twitter
		var twitterLink = glow.dom.get(".social-bookmark-content .twitter a, .document-tools .twitter a");

		require(["istats-1"], function (istats) {
			// Fix to prevent current page directing to Twitter
			twitterLink.each(function() {
				istats.addNoTrack(this);
			});			
		});

		glow.events.addListener(twitterLink, 'click', function(e) {

			var appID="";
			var shrinkRequest = "/modules/sharetools/v1/shrink.json?url="+document.location.href+"&appid="+ws.env.servicePath;
			var json="";

			glow.net.get(shrinkRequest, {
				async:false,
				useCache:true,
			  	onLoad: function(response) {
					json = (glow.lang.trim(response.text()).length > 0) ? response.json() : '';
					
					if (json.url.length > 0) {
						//var newLink = "http://twitter.com/home?status="+glow.dom.get("h1").text()+" "+json.url;
						var newLink = "http://twitter.com/?status="+glow.dom.get("h1").text()+" "+json.url;

						twitterLink.attr("href",newLink);
					}
				}
			});
		});
	},
	
    definitionList: function(selector) {                    
        glow.dom.get(selector).each(function() {            
            var listNode = glow.dom.get(this);
    		
    		listNode.get("dt").each(function(i) {
    			// Add 'odd' and 'even' classes if it hasn't been done through topcat    			
    			if (!glow.dom.get(this).hasClass('odd') && !glow.dom.get(this).hasClass('even')) {
    				if ((i+1)%2 == 1) {
    					glow.dom.get(this).addClass('odd');
    				} else {
    					glow.dom.get(this).addClass('even');
    				}
    			}
    			// Add cta container for chevron    			
    			glow.dom.get(this).append('<span class="slide_cta"></span>');
    		});
    			
    		// EVENT: Show/Hide a definition
    		glow.events.addListener(listNode.get("dl > dt"), "click", function(){		
    			var definition = glow.dom.get(this).next();	
    			glow.anim.slideToggle(definition);	
    			// Adjust (dt) classes	
    			glow.dom.get(this).toggleClass("open");
    		});
       
        });        
    },	
	
	definitionAv: function(selector) {		
		
		glow.dom.get(selector).each(function() {
			var thisNode = glow.dom.get(this);
			var vocab = ws.vocab.dictionary;
			
			thisNode.get('li').append('<span class="play_cta"></span>');						
			
			// only use this functionality for ie7+ and others
			// otherwise mp3 is downloaded as fallback
			if (glow.env.ie > 6 || !glow.env.ie) {
			
				thisNode.before('<div id="mp3PlayerContainer">' + vocab.flash8Required + '</div>');
				
				var my_flash = new glow.embed.Flash("/worldservice/flash/swf/mp3_player/player.swf","div#mp3PlayerContainer","8", {
				        height: "1px",
				        width: "1px",
				        id: "smallClipPlayer",
				        params: {
				        	flashvars: {
				        		embedID: "smallClipPlayer"
				        	},
				        	allowScriptAccess: "always",
				        	allowFullScreen: "false",
				        	bgcolor: "#FFFFFF"
				        }
				});
				my_flash.embed();						
				
				glow.events.addListener(glow.dom.get('#smallClipPlayer'), "ready", function(customEvent){
					//its ready do something - but weird results in ie
				});
				
				// Check for flash		
				if (glow.dom.get('#smallClipPlayer').length) {
					
					thisNode.get('.content').addClass('idle');
					
					glow.events.addListener(thisNode.get("li"), "mouseenter", function(e){
						glow.dom.get(this).addClass('hovered');
					});
					
					glow.events.addListener(thisNode.get("li"), "mouseleave", function(e){
						glow.dom.get('.hovered').removeClass('hovered');
					});
					
		    		glow.events.addListener(thisNode.get("li"), "click", function(e){	
		    			e.preventDefault();
		    			e.stopPropagation();
		    			thisNode.get('.select').removeClass('select');
						glow.dom.get(this).addClass('select');
						
						var thisURL = glow.dom.get(this).get('a').attr("href");
						glow.dom.get("#smallClipPlayer")[0].loadMP3(thisURL);	
																
						thisNode.get('.content').removeClass('idle');
						thisNode.get('.content').addClass('playing')
		    		});
	    		
	    		}
							
				glow.events.addListener(glow.dom.get('#smallClipPlayer'), "finished", function(customEvent){
					thisNode.get('.select').removeClass('select');
					thisNode.get('.content').removeClass('playing');
					thisNode.get('.content').addClass('idle');
				});
			
			}
			
		});		
		
	},
	
	slideshowTeaser: function(selector) { 
    	glow.dom.get(selector).each(function() {
      		var thisNode = 	glow.dom.get(this),
				      		slideshowId = thisNode.attr('id'),
				      		slideshowData = ws.env.modules[slideshowId],
				      		currentImage = 0,
				      		imageCount = slideshowData.images.length,
				      		playback = true,
                 			playbackDelay = 6000,
                 			_playbackTimer,
				      		preloadImg = new Image(),
				      		inTransition = false,
				      		showTransition = true,
				      		transitionSecs = 1,
				      		slideshowTimer;
	
			//slideshow dimensions
			var slideshowSize = thisNode.attr('class').match(/ts-(\d{2,}x\d{2,})/)[1];
			slideshowSizeArray = slideshowSize.split('x',2);	
			var slideshowWidth = slideshowSizeArray[0],
				slideshowHeight = slideshowSizeArray[1];
      		
      		//reconfigure teaser markup
      		thisNode.get('.title img').wrap('<div class="slideshow"><div class="pane front"></div><div class="pane back"><img src="" alt="" /></div></div>');
      		var thisSlideshow = thisNode.get('.slideshow'),
      			frontPane = thisSlideshow.get('.front'),
      			frontPaneImage = frontPane.get('img'),
      			backPane = thisSlideshow.get('.back'),
      			backPaneImage = backPane.get('img');
      			
      		//create nav markup
      		var nav = glow.dom.create('<div class="nav"></div>');
      		var navMask = glow.dom.create('<div class="nav-mask"></div>');
      		var opacityLayer = glow.dom.create('<div class="opacity-layer"></div>').css('opacity','.7');
      		var navControls = glow.dom.create('<div class="controls"></div>');
      		var forwardButton = glow.dom.create('<a class="forward"><span>Forward</span></a>').css('opacity','.7');
      		var backButton = glow.dom.create('<a class="back"><span>Back</span></a>').css('opacity','.7');
      		var pauseButton = glow.dom.create('<a class="pause"><span>Pause</span></a>').css('opacity','.7');
      		var slideshowPosition = glow.dom.create('<div class="slideshow-position"><span>1</span> / ' + imageCount + '</div>');
      		navControls.append(forwardButton).append(pauseButton).append(backButton).append(slideshowPosition);
      		nav.append(opacityLayer).append(navControls);
      		navMask.append(nav);
      		thisSlideshow.append(navMask);
      		
      		//nav show/hide animation
      		var showNavAnim;
      		glow.events.addListener(thisSlideshow, 'mouseenter', function () {
      			var slideshow = glow.dom.get(this);
      			var slideshowControls = slideshow.get('.controls');
      			
      			//disable parent link while over slideshow image
      			slideshow.css('cursor','default');
      			slideshow.parent().addClass('disabled');
      			
				showNavAnim = glow.anim.css(slideshow.get('.nav'), 0.2, {
					'top' : { from : '60', to : '0' }
				}).start();
			});
			
			glow.events.addListener(thisSlideshow, 'mouseleave', function () {
      			var slideshow = glow.dom.get(this);
      			slideshow.parent().removeClass('disabled');
	      		hideNavAnim = glow.anim.css(slideshow.get('.nav'), 0.2, {
					'top' : { from : '0', to : '60' }
				}).start();
			});
			
			glow.events.addListener(thisSlideshow, 'click', function(e) {
      			e.preventDefault();
			});
			
			//nav behaviour
			//rollovers
			var buttonList = new glow.dom.NodeList();
			buttonList.push(forwardButton,backButton,pauseButton);
      		glow.events.addListener(buttonList, 'mouseenter', function() {
      			var button = glow.dom.get(this);
      			button.css('opacity','1').css('cursor','pointer');
			});
			glow.events.addListener(buttonList, 'mouseleave', function() {
				var button = glow.dom.get(this);
				button.css('opacity','0.7').css('cursor','default');
			});
			
			//click events
			glow.events.addListener(forwardButton, 'click', function() {
				showTransition = false;
				if(inTransition == false) goToNextImage();
			});
			glow.events.addListener(backButton, 'click', function() {
				showTransition = false;
				if(inTransition == false) goToPrevImage();
			});
			glow.events.addListener(pauseButton, 'click', function() {
				var button = glow.dom.get(this);
				if(!button.hasClass('stopped')){
					button.addClass('stopped');
					clearInterval(slideshowTimer);
				}else{
					button.removeClass('stopped');
					slideshowTimer = setInterval(goToNextImage, playbackDelay);
				}
			});

			/* slideshow behaviours */
			function goToNextImage() { goToImage(currentImage+1); }
            function goToPrevImage() { goToImage(currentImage-1); }
             
            function goToImage(index) {
            	if (index >= imageCount) { index = 0; }
                if (index < 0) { index = imageCount-1; }    
                // Wait for image to load
                var loadImage = new Image();                
                loadImage.onload = function() {
                	if(showTransition == true){
                		transitionToImage(index);
                	} else {
	        			jumpToImage(index);
                	}
	                currentImage = index;
	               	updateSlideshowPosition();
	               	preloadNextImage(index);  
                }              
                loadImage.src = slideshowData.images[index].src; 
            }
             
			function transitionToImage(index) {                          
				// Change main image    
				inTransition = true;
				backPaneImage.attr('src', slideshowData.images[index].src);
				glow.anim.css( backPane, transitionSecs, {
				    	'opacity': { from : 0, to : 1 }
					}, { tween: glow.tweens.easeBoth() }
				).start();
				crossFade = glow.anim.css( frontPane, transitionSecs, {
						'opacity': { from : 1, to : 0 }
					}, { tween: glow.tweens.easeBoth() }
				).start();
				glow.events.addListener(crossFade, 'complete', function() {                        
					swapImagePanes();                                             
				});
			}

			function jumpToImage(index) { 
				var jumpImgIndex = index+1;
				if ((jumpImgIndex) > imageCount-1) { jumpImgIndex = 0; }
				frontPaneImage.attr('src', slideshowData.images[index].src);
				backPaneImage.attr('src', slideshowData.images[jumpImgIndex].src);
				
            	//reset slideshow timer
            	if(!pauseButton.hasClass('stopped')){
            		showTransition = true;
            		clearInterval(slideshowTimer);
					slideshowTimer = setInterval(goToNextImage, playbackDelay);
            	}	
			}
			
			function preloadNextImage(index){
				var preloadImgIndex = index+1;
				if ((preloadImgIndex) > imageCount-1) { preloadImgIndex = 0; }
				preloadImg.src = slideshowData.images[preloadImgIndex].src; 
			}
			
            function swapImagePanes() { 
	            var backImageSrc = backPaneImage.attr('src');
	            frontPaneImage.attr('src', backImageSrc);
	            // This attempts to minimise 'jumps' between images in some versions of FF
	            var fade = 	glow.anim.css( frontPane, 0.2,
	            	{ 'opacity': {to:1} }, 
	            	{ tween: glow.tweens.easeBoth() }
	            ).start(); 
	            glow.events.addListener( fade, 'complete', function() { 
	            	backPane.css('opacity', '1');
	            	inTransition = false;
	            });                                                                
            }
            
            function updateSlideshowPosition(){
            	slideshowPosition.get('span').text(parseInt(currentImage+1));
            }
            
            //start slideshow
      		slideshowTimer = setInterval(goToNextImage, playbackDelay);

    	});					
	}
}