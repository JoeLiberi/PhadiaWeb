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
    $('#mainMenuCloseBtn').show();
}

function mainMenuClose(){
    $('#mainMenuCont').hide();
    $('#thermoLogo').fadeIn("slow");
    $('#showMainMenuBtn').fadeIn("slow")
}

function phadiaPrimeClose(){
    $('#phadiaPrime-content').hide();
    $('#splash-content').fadeIn(200);
}

function videoPause(){
    $('#videoCloseBtn').show();
}

function videoClose(){
    videoEnded();
}

function showMainMenu(){
    $('#thermoLogo').hide();
    $('#mainMenuCont').fadeIn("slow");
    $('#showMainMenuBtn').hide();
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
        hotspotSize = 0.018
    }

    // var systemData = JSON.parse($('#systemData').html());
    // var hsMan = new Hotspot_Manager(
    //     systemData,
    //     //"./SystemsData.json", // url to json database with hotspot info
    //     "cascadion",                                                    // the actual system corresponding to the actual video
    //     "mySlider",                                                     // the id of the video tag
    //     //"http://silicon-int.com/thermo/web/cascadion/pics",         
    //     images,
    //     // "./pics",      
    //     //"http://silicon-int.com/thermo/web/cascadion/videos",  
    //     videos,                             // the url with the  hotspot videos
    //     hotSpotClicked,                                                 // the callback function which is called, if a hotspot has been clicked
    //    "playAllBut",                                                    // id of the play-all button
    //     "png",
    //     //Size of the hotspots
    //     // hotspotSize.size
    //     hotspotSize,
    //     online,
    // );  

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

    $('.itemTile, .primeItemTile').on('click', function(){
        $('#mainMenuCloseBtn').hide();
        $('#overlay-frame').append("<Video id='tileVideo' controls autoplay onended='videoEnded()' onpause='videoPause()'><source src='"+ $(this).data('video-url') +"'></Video>")
    });

    $('#phadiaprimeTile').on('click', function(){
        $('#splash-content').hide();
        $('#phadiaPrime-content').fadeIn(200);
    });


    /*
    When a device tile is clicked we are going to grab f

    */
    $('.deviceTile').on('click', function(){
        $('.overlayFrame').hide();

        images = "./assets/" + $(this).data('device-folder-id') + "/images"
        videos = "./assets/" + $(this).data('device-folder-id') + "/videos"

        // testing
        // images - "./assets/cascadion_testing/images"
        // videos - "./assets/cascadion_testing/videos"
        online = false

        var systemData = JSON.parse($('#systemData').html());
        var hsMan = new Hotspot_Manager(
            systemData,
            //"./SystemsData.json", // url to json database with hotspot info
            "cascadion",                                                    // the actual system corresponding to the actual video
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
        );
    });

    $('.splash-screen').on('click',function(){
        // hide the splash screen
        $('#thermoLogo').hide();
        $('#mainMenuCont').fadeIn("slow");
        $('#showMainMenuBtn').hide();
    })
});