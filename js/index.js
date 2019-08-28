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
    $('video').remove();
    $('#videoCloseBtn').hide();
}

function mainMenuClose(){
    $('#mainMenuCont').animate({bottom: '-1000px'}, 'slow', function() {
        $('#mainMenuCont').hide()
        $('#thermoLogo').fadeIn("slow");
        $('#showMainMenuBtn').fadeIn("slow")
    })
}

function phadiaPrimeClose(){
    $('#phadiaPrime-content').fadeOut(200);
    $('#splash-content').fadeIn(200);
}

function videoPause(){
    $('#videoCloseBtn').show();
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
    $('#mainMenuCont').animate({bottom: '0px'}, 'slow', function() {
        $('#mainMenuCont').addClass('open');
    });
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
        $("#sysName").text( sysName );

        $("#hsNumber").text( id );
        
        //$("#hsNumber").css({ opacity: 1.0 });
        //$("#hsNumberCont").css({ opacity: 1.0 });
        $("#headline").text( headline );
       
        $("#message").text( valuemessage );

        if (hideId == true){
            $('#hsNumberCont').hide();
            $('#headline').text('CASCADION SM CLINICAL ANALYSER');
            $('#message').text('Breaking the barrier between LC-MS/MS and the clinical lab')
        } else {
            $('#hsNumberCont').show();
        }
    }

    /*
    Item tile and phadia prime tile functionality. When one is clicked we add a html5 video 
    to the screen.
    */
    $('.itemTile, .primeImgTile, .edgeTile').on('click', function(){
        $('#overlay-frame').show()
        $('#overlay-frame').append("<Video id='tileVideo' controls autoplay onended='videoEnded()' onpause='videoPause()'><source src='"+ $(this).data('video-url') +"'></Video>")
    });
    
    // Phadia prime close button
    $('#phadiaprimeTile').on('click', function(){
        $('#splash-content').hide();
        $('#phadiaPrime-content').fadeIn(200);
    });

    /*
    When a device tile is clicked we are going to grab folder id of the videos and images
    Here is where we are going to initialize the hotspot_manager and load all of the 
    static files and calculate the hotspots.
    */
    $('.deviceTile').on('click', function(){
        $('#mainMenuCont').animate({bottom: '-1000px'}, 'fast', function() {
            $('#mainMenuCont').removeClass('open'); 
        });
        $('#splash-content').fadeOut(200);
        $('#layoutCont').fadeIn(200);
        images = "./assets/" + $(this).data('device-folder-id') + "/images"
        videos = "./assets/" + $(this).data('device-folder-id') + "/hotspots"
        startX = $(this).data('start-x')
        title = $(this).data('device-title')
        disclaimer = $(this).data('disclaimer')
        sysSelect = $(this).data('device-file-select')
        hotspotSelect = $(this).data('device-hotspot-select')
        data = $(this).data('device-data-id')
        online = false
        $('#swipe-div').data('device-swipe-id', data)

        $("#headline").remove();
        $("#headline-disclaimer").remove();
        $("<div class='col headline noselect' id='headline'>" + title + "</div>").appendTo("#headline-text");
        $("<div class='col disclaimer' id='headline-disclaimer'>" + disclaimer + "</div>").appendTo("#headline-text");

        // console.log(data)

        var systemData = JSON.parse($(data).html()); 
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


        $('#videoContainer').on('touchstart touchmove mousedown', function(){
            // set the title and the disclaimer
            $("#title").remove();
            $("#disclaimer").remove();
            $("<div class='col title noselect' id='title'><h1>" + title + "</h1></div>").appendTo("#deviceTitle");
            $("<div class='col title-disclaimer' id='disclaimer'><h3>" + disclaimer + "</h3></div>").appendTo("#deviceTitle");
        });

        $('.mainMenuBtn').on('click', function(){
            $("#title").remove();
            $("#disclaimer").remove();
            $("#videoContainer").remove();
            $("#mySlider").remove();
            $("<img id='mySlider' width='100%' height='100%' class='mx-auto d-block' />").appendTo("#videContBlock")
        });

        // Set a data attribute on all the hotspots so we can get back to the device page when the video closes
        $('.hotspotCont').data('device', data)
    });

    /*
    When the splash screen is clicked we show the main menu
    */

    $('.splash-screen').on('click',function(){
        //alert('clicked')
        // hide the splash screen
        $('#thermoLogo').hide();
        $('#mainMenuCont').show();

        $('#showMainMenuBtn').hide();
        
        $('#mainMenuCloseBtn').show();
        // open it
        $('#mainMenuCont').animate({bottom: '0px'}, 'slow', function() {
        
        })
    })

    $('#videoCloseBtn').on('click', function(event){
        $('video').remove();
        $('#videoCloseBtn').hide();
        $('#overlay-frame').hide();
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
                var nextScreen;

                if (relY > 0){
                    if(i == 0){
                        nextScreen = deviceList.length - 1;
                    } else{
                       nextScreen = i-1 
                    }
                } else {
                    if(i == deviceList.length){
                        nextScreen = 0
                    } else {
                        nextScreen = i+1
                    }
                }
                // $('div').find("[data-device-data-id='"+ deviceList[nextScreen] +"']").trigger("click")
                break;
            }
        }        
    })
    .bind('touchend',function(e){
        isDraggingSwipe = false;
    });
});