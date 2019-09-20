let hotspotSize;
let timeoutIDshort;
let timeoutIDlong;

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function checkHotSpotSizeMobile(mediaQuery) {
    if (mediaQuery.matches){
        return true
    } else {
        return false
    }
}

function videoEnded(){
    $('#overlay-frame').animate({
        'opacity': 0
    }, {
        duration: 1500,
        complete: function(){
            $('video').remove();
            $('#videoCloseBtn').hide();
            $('#overlay-frame').hide();
        }
    })
}

function mainMenuClose(){
    $('.splash-screen').attr({'src': './assets/Blue_Pollen_White_Splash.png'})
    $('#mainMenuCont').animate({bottom: '-1000px'}, 'slow', function() {
        // $('.splash-screen').attr({'src': './assets/Blue_Pollen_White_Splash.png'})
        $('#mainMenuCont').hide()
        $('#thermoLogo').fadeIn("slow");
        $('#showMainMenuBtn').fadeIn("slow")
    })

    $('.splash-screen').on('click',function(){
        //alert('clicked')
        // hide the splash screen
        $('.splash-screen').attr({'src': './assets/BLUE_POLLEN.png'})
        $('#thermoLogo').hide();
        $('#mainMenuCont').show();

        $('#showMainMenuBtn').hide();
        
        // $('#mainMenuCloseBtn').show();
        $('#mainMenuCloseBtn').css({'margin-top': '-100%'});
        $('#mainMenuCloseBtn').show();
        $('#mainMenuCloseBtn').animate({'margin-top': '0%'}, 'fast', function(){
            $('.splash-screen').unbind( "click" );
        });
        // open it
        var ipad = window.matchMedia("(max-width: 1024px)")
        if (ipad.matches){
            $('#mainMenuCont').animate({bottom: '16%'}, 1550)
        } else {
            $('#mainMenuCont').animate({bottom: '5%'}, 1550)
        }
        
    })
}

function phadiaPrimeClose(){
    // $('#phadiaPrime-content').fadeOut(200);
    // $('#splash-content').fadeIn(200);
    var ipad = window.matchMedia("(max-width: 1024px)")
    var bottomPercent;
    if (ipad.matches){
        bottomPercent = '16%'
    } else {
        bottomPercent = '5%'
    }
    $('#phadiaPrime-content').animate({'margin-top': '100%'}, 1550, function(){
        $('#phadiaPrime-content').hide();
        $('#splash-content').fadeIn(200);
        $('#mainMenuCont').animate({bottom: bottomPercent}, 'slow', function() {
            $('#mainMenuCont').addClass('open');
        });
    });
}

function videoPause(){
    $('#videoCloseBtn').show();
}

function primeVideoEnd(){
    videoEnded();
}

function videoClose(){
    videoEnded();
}

function showMainMenu(){
    $('#layoutCont').hide();
    $('#thermoLogo').hide();
    $('#mainMenuCont').show();
    $('#splash-content').show();
    $('#showMainMenuBtn').hide();
    // $('.overlayFrame').show();

    var ipad = window.matchMedia("(max-width: 1024px)")
    if (ipad.matches){
        $('#mainMenuCont').animate({bottom: '16%'}, 1550, function() {
            $('#mainMenuCont').addClass('open');
        });
    } else {
        $('#mainMenuCont').animate({bottom: '5%'}, 'slow', function() {
            $('#mainMenuCont').addClass('open');
        });
    }
}

$(document).ready(function()
{

    var content = document.getElementById('layoutCont');
    content.addEventListener('touchstart', function(event) {
        this.allowUp = (this.scrollTop > 0);
        this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
        this.slideBeginY = event.pageY;
    });

    content.addEventListener('touchmove', function(event) {
        var up = (event.pageY > this.slideBeginY);
        var down = (event.pageY < this.slideBeginY);
        this.slideBeginY = event.pageY;
        if ((up && this.allowUp) || (down && this.allowDown)) {
            event.stopPropagation();
        }
        else {
            event.preventDefault();
        }
    });

    var overlay_content = document.getElementById('overlay-frame');
    overlay_content.addEventListener('touchstart', function(event) {
        this.allowUp = (this.scrollTop > 0);
        this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
        this.slideBeginY = event.pageY;
    });

    overlay_content.addEventListener('touchmove', function(event) {
        var up = (event.pageY > this.slideBeginY);
        var down = (event.pageY < this.slideBeginY);
        this.slideBeginY = event.pageY;
        if ((up && this.allowUp) || (down && this.allowDown)) {
            event.stopPropagation();
        }
        else {
            event.preventDefault();
        }
    });
    
    var images;
    var videos;
    var online;
    
    /*
    if(navigator.onLine) { // true|false
        images = "https://s3.amazonaws.com/www.dcasf.com/cascadion/images"
        videos = "https://s3.amazonaws.com/www.dcasf.com/cascadion/videos"
        online = true;
    } else {
        images = "pics"
        videos = "videos"
        online = false
    }
    */

    // Get the media size

    var mobileWide = window.matchMedia("(max-width: 768px)")
    var mobileTall = window.matchMedia("(max-height: 475px)")

    var ua = window.navigator.userAgent;
    var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    var webkit = !!ua.match(/WebKit/i);
    var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);


    if (checkHotSpotSizeMobile(mobileWide) || checkHotSpotSizeMobile(mobileTall)){
        hotspotSize = 0.032
    } else if (iOSSafari){
        hotspotSize = 0.038
    } else {
        hotspotSize = 0.04
    }

    // callback function example to draw the contents
    function hotSpotClicked(headline, valuemessage, infoTexts, id, sysName, hideId)
    {               
        if (id != $("#hsNumber").text()){
            $('#infoHeaderText').fadeOut(function(){
                $("#hsNumberCont").show();
                $('#sysName').text( sysName );
                $('#hsNumber').text(id);
                $('#headline').text(headline);
                $('#message').text(valuemessage);
                $(this).fadeIn();
            });
        }
    }

    /*
    Item tile and phadia prime tile functionality. When one is clicked we add a html5 video 
    to the screen.
    */
    $('.itemTile, .edgeTile').on('click', function(){
        $('#overlay-frame').css({'opacity': 1});
        $('#overlay-frame').show();
        $('#overlay-frame').append("<Video id='tileVideo' controls autoplay onended='videoPause()' onpause='videoPause()'><source src='"+ $(this).data('video-url') +"'></Video>")
    });

    // Phadia prime tile should close its self when the video ends
    $('.primeImgTile').on('click', function(){
        $('#overlay-frame').css({'opacity': 1});
        $('#overlay-frame').show();
        $('#overlay-frame').append("<Video id='tileVideo' controls autoplay onended='primeVideoEnd()' onpause='videoPause()'><source src='"+ $(this).data('video-url') +"'></Video>")
    });

    
    // Phadia prime close button
    $('#phadiaprimeTile').on('click', function(){
        //$('#phadiaPrime-content').show();
        $('#mainMenuCont').animate({bottom: '-1000px'}, 1550, function() {
            $('#splash-content').hide();
            $('#phadiaPrime-content').css({
                'margin-top': '100%',
                'opacity': '0.5'
            });
            $('#phadiaPrime-content').show();
            $('#phadiaPrime-content').animate({
                'margin-top': '0%',
                'opacity': '1'
            }, 1550);
        });
    });

    /*
    When a device tile is clicked we are going to grab folder id of the videos and images
    Here is where we are going to initialize the hotspot_manager and load all of the 
    static files and calculate the hotspots.
    */
    $('.deviceTile').on('click', function(event, swiped=false){
        if (!swiped){
            $('#contentData').css({'margin-top': '-100%'});
        }

        images = "./assets/" + $(this).data('device-folder-id') + "/images"
        videos = "./assets/" + $(this).data('device-folder-id') + "/hotspots"
        startX = $(this).data('start-x')
        title = $(this).data('device-title')
        disclaimer = $(this).data('disclaimer')
        sysSelect = $(this).data('device-file-select')
        hotspotSelect = $(this).data('device-hotspot-select')
        data = $(this).data('device-data-id')

        $('#mainMenuCont').animate({bottom: '-1000px'}, 1550, function() {
            $('#mainMenuCont').removeClass('open');
            $('#splash-content').fadeOut(200); 
            online = false
            $('#swipe-div').data('device-swipe-id', data)
            $('#layoutCont').show();
            $("#headline").remove();
            $("#headline-disclaimer").remove();
            // $("#hsNumberCont").show();
            $("<div class='col headline noselect' id='headline'>" + title + "</div>").appendTo("#headline-text");
            $("<div class='col disclaimer' id='headline-disclaimer'>" + disclaimer + "</div>").appendTo("#headline-text");

            // console.log(data)
            var systemData = JSON.parse($(data).html());

            $('#message').text(systemData.text)
            $("#message").show();

            var hsMan = new Hotspot_Manager(
                systemData,
                //"./SystemsData.json", // url to json database with hotspot info
                sysSelect,                                                    // the actual system corresponding to the actual video
                "mySlider",                                                     // the id of the video tag
                //"http://silicon-int.com/thermo/web/cascadion/pics",         
                images,
                // "./pics",      
                //"http://silicon-int.com/thermo/web/cascadion/videos",  
                videos,                             // the url with the  hotspot videos
                hotSpotClicked,                                                 // the callback function which is called, if a hotspot has been clicked
               "playAllBut",                                                    // id of the play-all button
                "png",
                //Size of the hotspots
                // hotspotSize.size
                hotspotSize,
                online,
                hotspotSelect,
                startX
            );
            if (!swiped){
                $('#contentData').animate({'margin-top': '0%'}, 1550, function() {
                    //nothing
                });
            }
            $('#videoContainer').on('touchstart touchmove mousedown', function(){
                // set the title and the disclaimer
                $("#title").remove();
                $("#headline-disclaimer").remove();
                $("#disclaimer").remove();
                $("<div class='col title noselect' id='title'><h1>" + title + "</h1></div>").appendTo("#deviceTitle").fadeIn(1000);
                $("<div class='col title-disclaimer' id='disclaimer'><h3>" + disclaimer + "</h3></div>").appendTo("#deviceTitle").fadeIn(1000);
            });

            // Set a data attribute on all the hotspots so we can get back to the device page when the video closes
            $('.hotspotCont').data('device', data)
            // $("#hsNumberCont").show();
        });
    });

    /*
    When the splash screen is clicked we show the main menu
    */

    $('.splash-screen').on('click',function(){
        //alert('clicked')
        // hide the splash screen
        $('.splash-screen').attr({'src': './assets/BLUE_POLLEN.png'})
        $('#thermoLogo').hide();
        $('#mainMenuCont').show();

        $('#showMainMenuBtn').hide();
        
        // $('#mainMenuCloseBtn').show();
        $('#mainMenuCloseBtn').css({'margin-top': '-100%'});
        $('#mainMenuCloseBtn').show();
        $('#mainMenuCloseBtn').animate({'margin-top': '0%'}, 'fast', function(){
            $('.splash-screen').unbind( "click" );
        });
        // open it
        var ipad = window.matchMedia("(max-width: 1024px)")
        if (ipad.matches){
            $('#mainMenuCont').animate({bottom: '16%'}, 1550)
        } else {
            $('#mainMenuCont').animate({bottom: '5%'}, 1550)
        }
        
    })

    $('.mainMenuBtn').on('click', function(){
        $('.splash-screen:not([src^="./assets/BLUE_POLLEN.png"])').each(function(i){
          this.src = "./assets/BLUE_POLLEN.png";
        });
        $('#mainMenuCloseBtn').show();
        $("#title").remove();
        $("#disclaimer").remove();
        $("#videoContainer").remove();
        $("#mySlider").remove();
        $("#hsNumberCont").hide();
        $("#message").hide();
        $("#playHotspot").hide();
        $("<img id='mySlider' width='100%' height='100%' class='mx-auto d-block' />").appendTo("#videContBlock")
    });

    $('#videoCloseBtn').on('click', function(event){
        $('#swipe-div').show();
        $('#overlay-details').animate({
            'right': "-70%"
        }, {
            duration: 1500,
            complete: function(){
                $("#overlay-frame").animate({'opacity': 0}, "slow", function(){
                    $('video').remove();
                    $('#videoCloseBtn').hide();
                    $('#overlay-frame').hide();
                });
            }
        })
    });

    // Use the active data attribute to figure out what hotspot is active then trigger a click
    $('#playHotspot').on('click', function(event){
        $("div[active='1']").trigger("click")
    });

    // Dragging stuff for the swipe line thing
    var isDraggingSwipe = false;
    var dragStartYSwipe = 0;
    var lastYSwipe = 0;
    var relYwipe = 0;
    var relY = 0;
    var nextScreen;

    function disableSelect(event) {
        event.preventDefault();
    }

    function startDrag(event) {
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('selectstart', disableSelect);
    }

    function onDragEnd() {
        window.removeEventListener('mouseup', onDragEnd);
        window.removeEventListener('selectstart', disableSelect);
    }

    function swipeUp(deviceList, nextScreen){
        console.log("swiped up");
        $('#layoutCont').animate({'margin-top': '-100%'}, 1550, function(){
            $("#playHotspot").hide();
            $("#title").remove();
            $("#disclaimer").remove();
            $("#videoContainer").remove();
            $("#mySlider").remove();
            $("#hsNumberCont").hide();
            // $("#message").hide();
            $("<img id='mySlider' width='100%' height='100%' class='mx-auto d-block' />").appendTo("#videContBlock")
            $('div').find("[data-device-data-id='"+ deviceList[nextScreen] +"']").trigger("click", [true]);
            setTimeout(function(){
                $('#layoutCont').css({'margin-top': '100%'});
                $('#layoutCont').animate({'margin-top': '0%'}, 1550, function(){});
                }, 1000)
        });
    }

    function swipeDown(deviceList, nextScreen){
        $('#layoutCont').animate({'margin-top': '100%'}, 1550, function(){
            $("#playHotspot").hide();
            $("#title").remove();
            $("#disclaimer").remove();
            $("#videoContainer").remove();
            $("#mySlider").remove();
            $("#hsNumberCont").hide();
            // $("#message").hide();
            $("<img id='mySlider' width='100%' height='100%' class='mx-auto d-block' />").appendTo("#videContBlock")
            $('div').find("[data-device-data-id='"+ deviceList[nextScreen] +"']").trigger("click", [true])

            setTimeout(function(){
                $('#layoutCont').css({'margin-top': '-100%'});
                $('#layoutCont').animate({'margin-top': '0%'}, 1550, function(){});
                }, 1000)
        });
    }

    $("#swipe-div")
    .mousedown(function (event) {
        startDrag(event);
        isDraggingSwipe = true;
        dragStartYSwipe = event.pageY;
    })
    .bind('touchstart',function(e){
        e.preventDefault();                
        isDraggingSwipe = true;
    })
    .mousemove(function(event) {
        if (isDraggingSwipe) {
            relY = lastYSwipe + (dragStartYSwipe - event.pageY);
        }
    })
    .bind('touchmove',function(e){
        //e.preventDefault();
        if (isDraggingSwipe) {
            // console.log("I am being dragged!")
            relY = lastYSwipe + (dragStartYSwipe - event.pageY);
        }
    })
    .mouseup(function(event) {
        isDraggingSwipe = false;
        var deviceList = [
            '#phadia200-data',
            '#phadia250-data',
            '#phadia1000-data'
        ]
        for (var i = 0; i < deviceList.length; i++) {
            if ($(this).data("deviceSwipeId") == deviceList[i]){
                if (relY < 0){
                    if(i == 0){
                        nextScreen = deviceList.length - 1;
                    } else{
                       nextScreen = i-1 
                    }

                    swipeDown(deviceList, nextScreen);
                    break;
                } else {
                    if(i == deviceList.length - 1){
                        nextScreen = 0
                    } else {
                        nextScreen = i+1
                    }

                    swipeUp(deviceList, nextScreen);
                    break;
                }
                // console.log(deviceList[nextScreen]);
                // $('.mainMenuBtn').trigger("click")
                // $('div').find("[data-device-data-id='"+ deviceList[nextScreen] +"']").trigger("click")
                // break;
            }
        }        
    })
    .bind('touchend',function(e){
        isDraggingSwipe = false;
    });

    $('#additionalResourceBtn').on("click", function(){
        $('#layoutCont').fadeOut();
        $('#addtionalResources-content').fadeIn();
    });

    $('#additionalResourcesCloseBtn').on("click", function(){
        $('#addtionalResources-content').fadeOut();
        $('#layoutCont').fadeIn();
    });
});