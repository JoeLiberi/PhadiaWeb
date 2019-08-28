
function Hotspot_Manager(jsonFilePath, sysSelect, videoId, imgPath, videoPath, buttonCallbackFunc, playAllButId, ending, hotSpotRelSize, online, hotspotSelect, deviceStartX)
{
    var sysName = sysSelect;
    var sysHeadline = "";
    
    // check on which browser we are running
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;    // Opera 8.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';      // Firefox 1.0+
    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari = navigator.userAgent.indexOf("Safari") > -1;
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;   // Internet Explorer 6-11
    var isEdge = !isIE && !!window.StyleMedia;                  // Edge 20+
    var isChrome = !!window.chrome && !!window.chrome.webstore; // Chrome 1+
    var isBlink = (isChrome || isOpera) && !!window.CSS;       // Blink engine detection
    var imgFadeTime = 0.0;
    if (isFirefox) {
        imgFadeTime = 10.0;
    }
    var systemWasRotated = false;
    // var mediaSmallScreenSwitch = 769;
    var mediaSmallScreenSwitch = 625;
    var jsonObj;

    //------------------------------------------------------------------
    //splash screen settings

    //------------------------------------------------------------------
    // design variables

    
    // This is where the hitspot size is figured
    // var hotSpotRelSize = 0.035;                 // size of the Hotspot icons relative to <video> width


    //var hotSpotRelSize = 0.032;               // size of the Hotspot icons relative to <video> width
    var hotSpotRelBorderWidth = 0.002;          // width of the Hotspot icon borders relative to <video> width
    var hotSpotRelTextSize = 0.02;              // size of the text inside the hotspot icons relative to <video> width
    //var hotSpotPosInitDivSize = [598, 366];       // size of div when the hotspot positions were created
    //var hotSpotPosInitScaling = [0.0, 0.0];
    var loadImgAspect;
    
    //------------------------------------------------------------------
    // camera parameter
    var camPerspMat;
    var camViewMat;

    //------------------------------------------------------------------

    var vidAngleMin = glm.radians(-64.0);
    var vidAngleMax = glm.radians(64.0);
    var vidAngleRange = vidAngleMax - vidAngleMin;
    var vidDur = 1;
    var vidPos = 0;
    var block = 0;
    
    //------------------------------------------------------------------

    // create a video container and add the video element to it    
    var vidInDyn = document.getElementById(videoId);
    var vidContCell = vidInDyn.parentElement.parentElement;
    var vidContProp = 1.0;

    // save initial videoContainer Size
    var relVidContSize = [parseFloat(vidInDyn.attributes.width.nodeValue), 
    parseFloat(vidInDyn.attributes.height.nodeValue)];

    // check if the width and height are absolute or relative values
    var vidContSize = [vidInDyn.attributes.width.nodeValue, vidInDyn.attributes.height.nodeValue];
    //console.log('vid cont size', vidContSize)
    var vidContSizeIsPercentual = [(""+vidContSize[0]).search("%"), (""+vidContSize[1]).search("%")];
    var vidContParentSize = [parseFloat(vidInDyn.parentElement.parentElement.offsetWidth),
    parseFloat(vidInDyn.parentElement.parentElement.offsetHeight)];

    for (var i=0; i<2; i++){
        if (vidContSizeIsPercentual[i] > -1) {
            // if is percentage calculate an absolute value relative to the parents size
            vidContSize[i] = parseFloat(vidContSize[i]) * 0.01 * vidContParentSize[i];
        } else {
            vidContSize[i] = parseInt(vidContSize[i]);
        }
    }

    var dynVidContSize = [ vidContSize[0], vidContSize[1] ];

    // calculate the aspect ratio of the Container, if we are below the @media
    // switch 
    // this value will be overwritten with the proportion of the video frames,
    // when the json file is loaded
    var vidContProp = $(vidContCell).height() / $(vidContCell).width();

    // if the actual window is wider as the media switch, save the initial videocont proportions
    var bigVidContProp = 0;
    var bigVidInitContSize = [0,0];
    var bigVidInitWindowSize = [0,0];
    if ( window.innerWidth >= mediaSmallScreenSwitch ){
        bigVidContProp = $(vidContCell).height() / $(vidContCell).width();
        bigVidInitContSize[0] = vidContSize[0];
        bigVidInitContSize[1] = vidContSize[1];
        bigVidInitWindowSize[0] = window.innerWidth;
        bigVidInitWindowSize[1] = window.innerHeight;
    }

    // save initial window size
    var initWindowSize = [window.innerWidth, window.innerHeight];
    
    //console.log('init window size', initWindowSize)
    
    //------------------------------------------------------------------

    vidIn = document.getElementById(videoId);

    var vid = document.createElement("div");
    vidIn.parentNode.replaceChild(vid, vidIn);
    
    vid.style.width = "100%";
    vid.style.height = "100%";
    vid.style.backgroundSize = "contain";
    vid.style.backgroundRepeat = "no-repeat";
    vid.style.backgroundPosition = "center"; 
    vid.style.position = "absolute";
    vid.style.top = "0px";
    vid.style.left = "0px";
    
    //------------------------------------------------------------------
    
    // hotspot variables
    var hotspotDivs = [];                       // variable to hold the hotspot icon divs
    var hotSpotSize = vidContSize[0] * hotSpotRelSize;
    var nrHotspots;
    var hotSpots;
    var lastRelPos;                             // relative slider position
    var biggestHsInd;
    var highLightCircleCont;
    var highLightCircle;
    var highlightAnim; 
    var circleBorderWidth = 2;
    var circleAnimSizeAmp = 0;
    var circleLoopRunning = false;
    var circleLoopPar = [0,0,0];

    //------------------------------------------------------------------

    var playActHsDiv;
    var playActHsBut;
    var playActHsText;

    //------------------------------------------------------------------

    // scale the video container according to the size of the frames
    var videoContainer = document.createElement("div");
    videoContainer.id = "videoContainer";
    videoContainer.className = "videoContainer hs_videoFrameSize";
    videoContainer.style.width = vidContSize[0]+"px";
    videoContainer.style.height = (vidContSize[0]*vidContProp)+"px";
    
    
    vid.parentNode.replaceChild(videoContainer, vid);
    videoContainer.appendChild(vid);

    //------------------------------------------------------------------
    // dynamic resizing

    function OrientationResize(){
        console.log("Orientation Changed")
        // calculate relative size change in respect to the size change of the window
        //var relChange = [window.innerWidth / initWindowSize[0], window.innerHeight / initWindowSize[1]];    
        var relChange = [window.innerWidth / initWindowSize[0]];
        var heightChange = [window.innerHeight / initWindowSize[1]];
        vidContProp = $(vidContCell).height() / $(vidContCell).width(); 

        // change videoContainerSize (videoFrames)
        dynVidContSize[0] = vidContSize[0] * relChange;
        dynVidContSize[1] = vidContSize[0] * vidContProp * heightChange;

        videoContainer.style.width = dynVidContSize[0]+"px";
        videoContainer.style.height = (dynVidContSize[0] * vidContProp)+"px";

        // change hotspot size and position

        //hotSpotSize = dynVidContSize[0] * hotSpotRelSize;
        //console.log(hotSpotSize)
        resizeDivBackgrounds();

        // Set new hotspot positions on resize
        // setPos(lastRelPos);
        if (systemWasRotated == true){
            calcHotSpotPos3D(lastRelPos)
        }
    }
    
    $(window).resize(function() {
        OrientationResize();
    });

    // For mobile device orientation change does not trigger window resize event
    // Add a new listener to listen for orientation change

    // window.addEventListener("deviceorientation", handleOrientation, true);

    var matchMedia = window.msMatchMedia || window.MozMatchMedia || window.WebkitMatchMedia || window.matchMedia;
    $(window).on('orientationchange', function() {
        window.setTimeout(function() {
            OrientationResize();
        }, 100)
    });

    //------------------------------------------------------------------
    
    // load always a bunch of images in parallel
    // always load at indices distributed over the whole sequence
    // we sequentially fill up all the "gaps"
    var loadInd = 0;
    var nrParallelLoads = 25;

    var loadFrom = 0;
    var loadTo = 0;
    var vidNrFrames = 0;
    var vidNrSrc = 0;
    var vidNrFramesDiv = 1; // load only every second
    var loadingOrder;
    var loadedImgs;
    var imgPaths;
    var imgDivs;
    var imgSize;
    var validImages = [];
    var allImagesLoaded = false;
    
    var videoSourceElem;
    var divFrameImgSize=[0,0]; // the size of the vidDivs background image (the frames)
    var divFrameImgoffset=[0,0];

    //------------------------------------------------------------------
    // get hotspot json from the server
    var jsonObj;

    // $.ajax({
    //     url: jsonFilePath,
    //     dataType: 'JSONP',
    //     jsonpCallback: 'callback',
    //     type: 'GET',
    //     error: function (jqXHR, textStatus, errorThrown) {
    //         console.log("error loading json "+textStatus+" "+errorThrown);
    //     },
    //     success: function (data) {
            jsonObj = jsonFilePath;

            // create hotspot number icons
            // at the moment we got only one system, change the name here for other systems
            hotSpots = jsonFilePath.hotspots;
            nrHotspots = Object.keys(hotSpots).length;
            imgSize = jsonFilePath.imageSize;
            sysHeadline = jsonFilePath.headline;

            // calculate the aspect ratio of the Container, if we are below the @media switch 
            // that is one column layout, take the ratio of the video frames, not of the videoId parent Element
            if ( window.innerWidth <= mediaSmallScreenSwitch){
                vidContProp = imgSize[1] / imgSize[0];
                videoContainer.style.width = vidContSize[0]+"px";
                videoContainer.style.height = (vidContSize[0]*vidContProp)+"px";
            }

            // build camera parameters
            var camPos = glm.vec3(
                parseFloat(jsonFilePath.camPos[0]), 
                parseFloat(jsonFilePath.camPos[2]) * 0.5, // HACK!!!!!
                parseFloat(jsonFilePath.camPos[1]) * -1.0);
            
            calcCamMatrix(camPos);

            for (var i=0;i<nrHotspots;i++)
            {
                //console.log(i)
                hotspotDivs.push( document.createElement('div') );
                hotspotDivs[i].id = 'hotspot_'+i;
                hotspotDivs[i].className = 'hotspotCont';
                hotspotDivs[i].style.width = hotSpotSize+"px";
                hotspotDivs[i].style.height = hotSpotSize+"px";
                hotspotDivs[i].style.top = "0px";
                hotspotDivs[i].style.left = "0px";
                hotspotDivs[i].style.opacity = "0";
                hotspotDivs[i].style.filter = 'alpha(opacity=0)'; // IE fallback
                hotspotDivs[i].style.transition = "width 0.4s, height 0.4s";
                hotspotDivs[i].style.backgroundImage = "url('assets/nricon_"+Math.floor((i+1)/10)+((i+1)%10)+".png')";
                hotspotDivs[i].style.zIndex = "2";

                videoContainer.appendChild(hotspotDivs[i]);
            }

            // create the highlight circle
            highLightCircleCont = document.createElement('div');
            highLightCircleCont.id = 'highLightCircleCont';
            highLightCircleCont.className = 'hotspotCircleCont';
            highLightCircleCont.style.zIndex = (vidNrFrames +2)+"";

            highLightCircle = document.createElement('div');
            highLightCircle.id = 'highLightCircle';
            highLightCircle.className = 'hotspotCircle';
            highLightCircle.style.opacity = "0";
            highLightCircle.style.filter = 'alpha(opacity=0)'; // IE fallback
            highLightCircle.style.transition = "opacity 3s";
            $(highLightCircle).css('border-radius', '60px');

            highLightCircleCont.appendChild(highLightCircle);
            videoContainer.appendChild(highLightCircleCont);


            playActHsBut = $('.playHotspotButton')

            // create play hotspot button
            /*
            playActHsDiv = document.createElement('div');
            playActHsDiv.className="playHotspot";

            playActHsBut = document.createElement('button');
            playActHsBut.className = 'playHotspotButton';
            playActHsBut.onclick = hsClicked;

            playActHsText = document.createElement('div');
            playActHsText.innerHTML = "Play Hotspot";

            playActHsDiv.appendChild(playActHsBut);
            playActHsDiv.appendChild(playActHsText);
            */

            vidNrFrames = jsonObj.range;               
            vidNrSrc = jsonObj.nr_frames;
            loadFrom = jsonObj.zeropos_ind;
            loadTo = (loadFrom + vidNrFrames) % vidNrSrc;

            loadFrames();
            loadImgSequence(0);
    //     }
    // });

    //------------------------------------------------------------------

    function calcCamMatrix(camPos){
        // reconstruct camera matrix of the video
        // we are using a left hand coordinate system (y up, -z forward)
        // values are taking from the 3d scene of the video
        var camFocalLength = parseFloat(jsonObj.camFocLength);
        var camSensorWidth = parseFloat(jsonObj.camSensorSize);
        var fovX = 2.0 * Math.atan(camSensorWidth * 0.5 / camFocalLength);
        var aspect = 16.0 / 9.0;
        var fovY = fovX / aspect;

        camPerspMat = glm.perspective(fovY, aspect, 0.1, 1000.0);
        camViewMat = glm.lookAt(camPos, glm.vec3(0, 0, 0), glm.vec3(0, 1.0, 0));     
    }

    //------------------------------------------------------------------

    function loadFrames()
    {
       vidNrFrames = (vidNrFrames / vidNrFramesDiv);
       loadedImgs = Array(vidNrFrames);
       loadingOrder = Array(vidNrFrames);
       imgPaths = Array(vidNrFrames);
       imgDivs = Array(vidNrFrames);
       imgPreload = Array(vidNrFrames);

       var images = Array(vidNrFrames);
       var loadingOrderSlices = Array(3);
       var bundleCounter = 0;

       function shuffle(array) {
           var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }
        
        // We need to fill this array with indicies from the starting frame plus half and minus half of the total
        // frames we want to load. If the number is ever zero then we need to wrap the array around
        // var halfVidNrFrames = Math.floor(vidNrFrames/2);
        var startInd = jsonObj.zeropos_ind;

        // for (var i=startInd;i<halfVidNrFrames;i++){
        //    loadingOrder[i] = i;
        // }

        for (var i=1;i<vidNrFrames;i++){
            idx = startInd - i
            if (idx < 0){
                loadingOrder[i] = idx + 361
            } else {
                loadingOrder[i] = idx
            }
        }

       //  // cut in three slices
       //  for (var i=0;i<3;i++){
       //      loadingOrderSlices[i] = loadingOrder.slice(i * Math.round(vidNrFrames / 3), (i+1) * Math.round(vidNrFrames / 3));
       //      // shuffle the array
       //      loadingOrderSlices[i] = shuffle(loadingOrderSlices[i]);
       //  }

       //  // intersect the three arrays with offsets of 0,1,2
       //  var posInd = 0;
       //  for (var i=0;i<vidNrFrames;i++){
       //     var arrayInd = i%3;
       //     loadingOrder[i] = loadingOrderSlices[arrayInd][posInd];
       //     if (arrayInd == 2) {
       //         posInd++;
       //     }
       // }

       var location_size = resizeIndividualBackground()

       for (var i=0;i<vidNrFrames;i++){
           // console.log(vidNrFrames)
           // console.log(loadFrom)
           var ind = i;
           var imgInd = ((i * vidNrFramesDiv) + loadFrom) % vidNrSrc;
           // console.log(imgInd)
           loadedImgs[ind] = new Image();
           imgPaths[ind] = imgPath+"/"+sysSelect+"_"+(Math.floor(imgInd/1000))+(Math.floor(imgInd/1000))+(Math.floor(imgInd/100))+(Math.floor(imgInd/10%10))+(imgInd %10)+"."+ending;

            // preload the images in a img tag
            // we need to add them to the dom in a hidden img element to prevent flickering
            imgPreload[ind] = document.createElement("img");
            imgPreload[ind].id = "tf_pre_"+ind;
            imgPreload[ind].style.display = "none";
            videoContainer.appendChild(imgPreload[ind])

            
            // add the image to the tree
            imgDivs[ind] = document.createElement("div");
            imgDivs[ind].id = "tf_"+ind;
            imgDivs[ind].className = "animDivs";

            imgDivs[ind].style.width = "100%";
            imgDivs[ind].style.height = "100%";
            imgDivs[ind].style.position = "absolute";
            imgDivs[ind].style.opacity = "0";
            imgDivs[ind].style.filter = 'alpha(opacity=0)'; // IE fallback
            imgDivs[ind].style.backgroundRepeat = "no-repeat";
            imgDivs[ind].style.backgroundPosition = location_size[1];
            imgDivs[ind].style.backgroundSize = location_size[0];

            videoContainer.appendChild(imgDivs[ind]);
        }

        console.log(loadingOrder)

        // resizeDivBackgrounds();

        vid.style.backgroundImage = "url('"+imgPaths[vidNrFrames-1]+"')";       
    }

    //------------------------------------------------------------------

    function appendNewDiv(srcName)
    {   
        if (online){
            var divInd = imgPaths.indexOf(srcName);
            validImages.push(divInd);
        } else {
            var split_ind = srcName.split('/')

            var filename = "./assets/" + split_ind[split_ind.length - 3] + '/' + split_ind[split_ind.length - 2] + '/' + split_ind[split_ind.length - 1]

            var divInd = imgPaths.indexOf(filename);
            validImages.push(divInd);
        }

        // console.log(srcName);

        imgDivs[divInd].style.backgroundImage = "url('"+srcName+"')";
        
    }

    //------------------------------------------------------------------
    
    function loadImgSequence(loadIncr)
    {
        
        for (var i=0;i<nrParallelLoads;i++) {
            loadInd = loadingOrder[loadIncr];
            loadIncr++;
            // console.log(loadIncr);

            if (loadIncr >= vidNrFrames){ // stop loading if we got everything
                allImagesLoaded = true;
                break;
            }
            
            if (i == nrParallelLoads-1) {
                loadedImgs[loadIncr].onload = function(){
                    appendNewDiv(this.src);
                    loadImgSequence(loadIncr);
                }         
            } else {
                try {
                    loadedImgs[loadIncr].onload = function(){
                        appendNewDiv(this.src);
                    }
                } catch(error){
                    console.log(error);
                    console.log(loadInd)
                }
            }
            
            imgPreload[loadIncr].src = imgPaths[loadIncr];
            loadedImgs[loadIncr].src = imgPaths[loadIncr];
        }
    }
    function resizeIndividualBackground()
    {   
        // calculate the destiantion size
        // check if the containers' aspect ratio is bigger than the images' one
        //console.log((1.0 / vidContProp) > (imgSize[0] / imgSize[1]))
        if ((1.0 / vidContProp) > (imgSize[0] / imgSize[1]))
        {
            // container is wider than image, scale image so that its filling the container vertically
            divFrameImgSize[1] = (dynVidContSize[0]*vidContProp);
            divFrameImgSize[0] = imgSize[0] * ((dynVidContSize[0]*vidContProp) / imgSize[1]);

        } else {
            // container is wider than image, scale image so that its filling the container horizontally
            divFrameImgSize[0] = dynVidContSize[0];
            divFrameImgSize[1] = imgSize[1] * (dynVidContSize[0] / imgSize[0]);
        }

        // calculate offset
        divFrameImgoffset[0] = (dynVidContSize[0] - divFrameImgSize[0]) / 2;
        divFrameImgoffset[1] = ((dynVidContSize[0]*vidContProp) - divFrameImgSize[1]) / 2;

        var size = ""+divFrameImgSize[0]+"px "+divFrameImgSize[1]+"px";
        var offset = ""+divFrameImgoffset[0]+"px "+divFrameImgoffset[1]+"px";

        return ([size, offset])

    }
    //------------------------------------------------------------------
    // function to calculate the size and position of the frames inside their divs
    function resizeDivBackgrounds()
    {
/*
        // calculate the destiantion size
        // check if the containers' aspect ratio is bigger than the images' one
        if ((dynVidContSize[0] / dynVidContSize[1]) > (imgSize[0] / imgSize[1]))
        {
            // container is wider than image, scale image so that its filling the container vertically
            divFrameImgSize[1] = dynVidContSize[1];
            divFrameImgSize[0] = imgSize[0] * (dynVidContSize[1] / imgSize[1]);

        } else {
            // container is wider than image, scale image so that its filling the container horizontally
            divFrameImgSize[0] = dynVidContSize[0];
            divFrameImgSize[1] = imgSize[1] * (dynVidContSize[0] / imgSize[0]);
        }

        // calculate offset
        for (var i=0; i<2; i++){
            divFrameImgoffset[i] = (dynVidContSize[i] - divFrameImgSize[i]) / 2;
        }

        for (var i=0;i<vidNrFrames;i++){
            imgDivs[i].style.backgroundSize = ""+divFrameImgSize[0]+"px "+divFrameImgSize[1]+"px";
            imgDivs[i].style.backgroundPosition = ""+divFrameImgoffset[0]+"px "+divFrameImgoffset[1]+"px";
        }
*/       
        // calculate the destiantion size
        // check if the containers' aspect ratio is bigger than the images' one
        if ((1.0 / vidContProp) > (imgSize[0] / imgSize[1]))
        {
            // container is taller than image, scale image so that its filling the container vertically
            divFrameImgSize[1] = (dynVidContSize[0]*vidContProp);
            divFrameImgSize[0] = imgSize[0] * ((dynVidContSize[0]*vidContProp) / imgSize[1]);

        } else {
            // container is wider than image, scale image so that its filling the container horizontally
            divFrameImgSize[0] = dynVidContSize[0];
            divFrameImgSize[1] = imgSize[1] * (dynVidContSize[0] / imgSize[0]);
        }

        // calculate offset
        divFrameImgoffset[0] = (dynVidContSize[0] - divFrameImgSize[0]) / 2;
        divFrameImgoffset[1] = ((dynVidContSize[0]*vidContProp) - divFrameImgSize[1]) / 2;

        for (var i=0;i<vidNrFrames;i++){
            imgDivs[i].style.backgroundSize = ""+divFrameImgSize[0]+"px "+divFrameImgSize[1]+"px";
            imgDivs[i].style.backgroundPosition = ""+divFrameImgoffset[0]+"px "+divFrameImgoffset[1]+"px";
        }
    }
    
    //------------------------------------------------------------------
    // function to calculate hotspot positions according to the actual rotation
    
    function calcHotSpotPos3D(relPos, hideId)
    {   
        if (typeof jsonObj != 'undefined') // be sure the json is loaded
        {
            angle = relPos * vidAngleRange + vidAngleMin;
            var destViewportPix = [ divFrameImgSize[1] * 16.0 / 9.0, divFrameImgSize[1] ];
            
            // create the actual rotation matrix                
            var rotMat = glm.angleAxis(-angle, glm.vec3(0,1,0));

            var biggestHs = [0, 0, 0, 0, 0];

            for (var i=0; i<nrHotspots; i++)
            {               
                // calculate the initial hotspot position (minAngle = videoPosition 0)
                // hotspot positions are right hand coordinate system, convert them to left hand
                var hotSpotPos = glm.vec4(
                    parseFloat(jsonObj.hotspots[i].position[0]),
                    parseFloat(jsonObj.hotspots[i].position[2]) - 0.5, // HACK!!!!
                    parseFloat(jsonObj.hotspots[i].position[1]) * -1.0,
                    1.0);

                // apply the rotation
                hotSpotPos = rotMat['*'](hotSpotPos);

                // apply the view/projection matrix
                hotSpotPos = camPerspMat['*'](camViewMat['*'](hotSpotPos));

                // divide by /w, the result is in NDC
                hotSpotPos['/='](hotSpotPos[3]);

                // convert to pixels relative to top / left edge
                var hotSpotPosPix = [
                    ((hotSpotPos[0] + 1.0) / 2.0) * destViewportPix[0] + (destViewportPix[0] - dynVidContSize[0]) * -0.5,
                    (1.0 - ((hotSpotPos[1] + 1.0) / 2.0)) * destViewportPix[1] + (destViewportPix[1] - dynVidContSize[0]*vidContProp) * -0.5
                ];    

                hotspotDivs[i].style.opacity = 1;
                hotspotDivs[i].style.cursor = "pointer";
                hotspotDivs[i].style.left = hotSpotPosPix[0]+"px";
                hotspotDivs[i].style.top = hotSpotPosPix[1]+"px";
                hotspotDivs[i].style.zIndex = 2;
                hotspotDivs[i].onclick = hsClicked;
                hotspotDivs[i].setAttribute('active', 0)

                // calculate size
                var hsNormPos = i / (nrHotspots-1);
                // console.log("norm post" + hsNormPos)
                /*Hack.  created indRelSize as a hidden variable.  This used to control how big a hotspot would be.  
                And we knew the biggest hotspot would be the one that should be selected.  So all of the below that uses
                indRelSize is pretending hotspots were drawn with different sizes, and using that to allow us to cycle through the hotspots.
                to revert back, replace indRelSize with relSize, and remove hard coding it to be 1
                */
                var indRelSize = 1.0 - Math.max(Math.abs(relPos - hsNormPos), 0);
                indRelSize = Math.pow(indRelSize, 4.0);
                indRelSize = (indRelSize * 0.8 + 0.4) + 0.5;
                 
                var relSize = 1.0
                //console.log("i" + i)
                //console.log(Math.max(Math.abs(relPos - hsNormPos), 0))

                hotspotDivs[i].style.width = (hotSpotSize * relSize)+"px";
                hotspotDivs[i].style.height = (hotSpotSize * relSize)+"px";

                // remember the index of the biggest Hotspot
                if (biggestHs[0] < indRelSize)
                {
                    biggestHs[0] = indRelSize;
                    biggestHs[1] = i;
                    biggestHs[2] = hotSpotSize * relSize;
                    biggestHs[3] = hotSpotPosPix[0];
                    biggestHs[4] = hotSpotPosPix[1];
                }                    
            }

            biggestHsInd = biggestHs[1];
            //console.log ('biggest hs ind ' + biggestHsInd)
            hotspotDivs[biggestHsInd].style.zIndex = 3;
            //Set the size of the selected div to be larger than the rest
            hotspotDivs[biggestHsInd].style.width = (hotSpotSize * relSize * 1.8)+"px";
            hotspotDivs[biggestHsInd].style.height = (hotSpotSize * relSize * 1.8)+"px";
            hotspotDivs[biggestHsInd].setAttribute('active', 1)
            // hotspotDivs[biggestHsInd].className += "hotspot-sonar";
            
            //console.log('size' + hotSpotSize * relSize)
            //console.log('rel size' + hotSpotSize * relSize * 1.8)

            circleAnimSizeAmp = (hotSpotSize * relSize * 1.1);

            highLightCircleCont.style.width = biggestHs[2] + circleAnimSizeAmp * 1.8 +"px";
            highLightCircleCont.style.height = biggestHs[2] + circleAnimSizeAmp * 1.8 +"px";
            highLightCircleCont.style.left = (biggestHs[3] - circleAnimSizeAmp/2)+"px";
            highLightCircleCont.style.top = (biggestHs[4] - circleAnimSizeAmp/2)+"px";
            highLightCircleCont.style.margin = (-circleBorderWidth/2)+"px";
            
            highLightCircle.style.opacity = 1;

            if (circleLoopRunning == false){
                circleLoop();
                circleLoopRunning = true;
            }

            /*TODO - only update the button id for play hotspot.  Ignore adding or removing it*/
             
            var infotext = jsonObj.hotspots[biggestHsInd].infotext.slice();  
            
            playActHsBut = $('.playHotspotButton')
            playActHsBut.attr('id', "playHs_"+biggestHsInd);
            //playActHsBut.addClass('test')
            //playActHsBut.id = "playHs_"+biggestHsInd;
            //alert(playActHsBut.id)
            //infotext.push(playActHsDiv);

            buttonCallbackFunc(jsonObj.hotspots[biggestHsInd].headline,
                jsonObj.hotspots[biggestHsInd].valuemessage,
                infotext,
                biggestHsInd+1,
                sysHeadline,
                hideId);
        }
    }

    //------------------------------------------------------------------

    function circleLoop() {
        // $(highLightCircle).css({
        //     width:'60%', 
        //     height:'60%',
        //     top:'20%',
        //     left:'20%'
        // });
        // $(highLightCircle).animate ({
        //     width: '100%',
        //     height: '100%',
        //     top:'0%',
        //     left:'0%'
        // }, 1400, 'linear', function() {
        //     circleLoop();
        // });
        $(highLightCircle).addClass('hotspot-sonar')
    }
    

   
    //------------------------------------------------------------------
    var overlayFrame;
    var hotSpotVideoElem;
    var closeButton;
    var closeButtonCont;
    var actPlayingVideoId = 0;

    function hsClicked(event){
        // get the number of the button from its id
        // clearTimers();
        var butId = event.target.id.split("_");
        butId = parseInt(butId[1]);

        //new code.  THis is to put the proper info in the spec sheet if a hotspot was clicked on the object.
        var infotext = jsonObj.hotspots[butId].infotext.slice();  
        //alert(infotext)
        $("#spec-hsNumber").text(butId+1)
        $("#spec-headline").text(jsonObj.hotspots[butId].headline);
        $("#spec-message").text( jsonObj.hotspots[butId].valuemessage );
        $("#infoTexts").empty(); // remove all children
        
        for (var i=0; i<infotext.length; i++ ) {
            $("#infoTexts").append("<li>"+infotext[i]+"</li>");
        }

        //$('#overlay-details').hide();
        // $("#overlay-details").animate({
        //     right: "-70%"
        // });
        
        //for function in openVideo, the second bit is the function to call after a video is complete.  Set this function 
        //to reveal the outline of the product as a second overlay on the modal
        openVideo(butId, showSpecForm);
    }
    
    //------------------------------------------------------------------

    function openVideo(butId, videoEndFunc){
        actPlayingVideoId = butId;

        // $('#splash-content').hide()
        // $('.splash-screen').removeAttr('src')
        // $('html, body').css({
        //     'background-image': 'none',
        // });

        // create ovelayFrame
        // overlayFrame = document.createElement('div');
        // overlayFrame.className = 'overlayFrame';
        // overlayFrame.style.width = "100%";
        // overlayFrame.style.height = "100%";
        // overlayFrame.style.top = "0%";
        // overlayFrame.style.left = "0%";
        // overlayFrame.style.opacity = "0";
        
        overlayFrame = $('#overlay-frame')
        overlayFrameObj = document.getElementById("overlay-frame");
        $('#phadiaPrime-content').hide()
        $('#splash-content').hide()
        overlayFrame.show();

        hotSpotVideoElem = document.createElement('video');
        hotSpotVideoElem.style.width = "100%";
        hotSpotVideoElem.style.height = "100%";

        $(hotSpotVideoElem).prop("controls", true);
        $(hotSpotVideoElem).prop("autoplay", true);

        
        // create videoSource
        videoSourceElem = document.createElement('source')
        videoSourceElem.setAttribute('src', videoPath +'/'+ jsonObj.hotspots[butId].video+'.mp4');
        hotSpotVideoElem.appendChild(videoSourceElem);        
        
        overlayFrameObj.appendChild(hotSpotVideoElem);        
        
        closeButtonCont = document.createElement('div');
        closeButtonCont.className = 'closeButtonCont';
        closeButtonCont.style.display = 'none';

        // create close button
        closeButton = document.createElement('button');
        closeButton.className = 'closeButton';
        closeButton.onclick = function() {

            // this needs to be removed when closed so multiple videos dont get appended onto the div
            $('video').remove();

            // when the close button is clicked it needs to commit suicide otherwise we will have a Mr. Meeseeks situation on our hands
            $('.closeButtonCont').remove();

            $(overlayFrame).hide()
                          
            videoSourceElem.remove();
            hotSpotVideoElem.remove();

            $('html, body').css({
                'background-image': 'url("./assets/BLUE_POLLEN.png")',
            });
            $("#overlay-details").animate({
                right: "-70%"
            });
            $('html, body').css({
                'background-image': 'url("./assets/BLUE_POLLEN.png")',
            });
            $('.splash-screen').attr("src", "./assets/BLUE_POLLEN.png");
            var device = $(this).data('device')
            $('#splash-content').show()
            $('.splash-screen').trigger("click")
            // $(".deviceTile").find("[data-device-data-id='"+ device +"']").trigger("click")
            $("div[data-device-data-id='" + device +"']").trigger("click")
        
        };

        // closeButtonCont.appendChild(closeButton);        
        // overlayFrameObj.appendChild(closeButtonCont);

        $('.closeButton').data('device', $('.hotspotCont').data('device'))

        $(overlayFrame).appendTo( $("body") );

        // animate frame
        $(overlayFrame).animate({
            opacity: 1
        }, {
            duration: 1000
        });
       
        // define callback function for video end event
        $('video').on('ended', videoEndFunc);

        // On pause show close button
        $('video').on('pause', function(){
            $('.closeButtonCont').show()
        });
        // Hide it when the video is played
        $('video').on('play', function(){
            //when the video plays we want to clear out the timers
            $(window).clearTimers;
            $('.closeButtonCont').hide()
        });
    }
    //------------------------------------------------------------------
    function showSpecForm(){
        // When the video ends goActve
        $(window).goActive;
        $('#overlay-frame').show();
        //$('#overlay-details').show();
        
        $("#overlay-details").animate({
            right: 0
        }, 700);
        
        $('.closeButtonCont').show();
        goActive()
    }
    //------------------------------------------------------------------
    
    function playNextVideo(){
        actPlayingVideoId += 1;
        console.log(actPlayingVideoId)

        try {
            videoSourceElem.setAttribute('src', videoPath +'/'+ jsonObj.hotspots[actPlayingVideoId].video+'.mp4'); 
        } catch(err){
            $('.closeButton').trigger('click');
        }

        // overwrite end function
    //  $('video').on('ended', playNextVideo);
        $('video')[0].load();

        // continue playing
        $('video').trigger('play');
    }

    //------------------------------------------------------------------
    // Play All Button
    
    $("#"+playAllButId).on('click',function() {
        openVideo(0, playNextVideo);        
    });

    //------------------------------------------------------------------
    // get the index of an array entry, who's value is closest to num
    function closest (num, arr) {
        var curr = arr[0];
        var diff = Math.abs (num - curr);
        for (var val = 0; val < arr.length; val++) {
            var newdiff = Math.abs (num - arr[val]);
            if (newdiff < diff) {
                diff = newdiff;
                curr = arr[val];
            }
        }
        return curr;
    }
    
    //------------------------------------------------------------------
    
    function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
            obj.attachEvent("on" + evt, fn);
        }
    }
    
    //------------------------------------------------------------------
    // function to seek a specific position in the video
    // let the respective hotspots appear
    // this is the entry point for everything, call it from a drag, slider or whatever

    var lastFrame = -1;
    
    function setPos(relPos, hideId)
    {
        systemWasRotated = true;
        // console.log('relpos' + relPos)
        relPos = 1.0 -  Math.max(Math.min(relPos / vidContSize[0], 1.0), 0.0);
        // relPos = 1.0 -  Math.min(relPos / vidContSize[0], 1.0);
        lastRelPos = 1.0 - relPos;
        // console.log('lastRelPos' + lastRelPos)

        calcHotSpotPos3D(lastRelPos, hideId);

        // get corresponding frame to this relPos;
        var relFrame = Math.floor(relPos * vidNrFrames);
        var nextValid = closest(relFrame, validImages);
        // if we need a new frame
        // console.log(validImages)
        // console.log(lastFrame != nextValid)
        if (lastFrame != nextValid)
        {
            imgDivs[nextValid].style.opacity = "1.0";
            imgDivs[nextValid].style.filter = 'alpha(opacity=100)'; // IE fallback

            if (lastFrame != -1) 
            {
                $("#" + imgDivs[lastFrame].id).fadeTo(imgFadeTime, 0);  // 1.0 works best in firefox/linux, 0.0 in all others
                 imgDivs[nextValid].style.filter = 'alpha(opacity=0)';  // IE fallback
            } else 
            {
                vid.parentNode.removeChild(vid);
            }

            lastFrame = nextValid;
        }
    }
    
    //------------------------------------------------------------------
    
    // Dragging
    var startX = deviceStartX;
    var isDragging = false;
    var isPressed = false;
    var dragStartX = 0;
    var lastX = startX;
    var relX = startX;
    
    
    $("#"+videoContainer.id)

    .mousedown(function (event) {
        isDragging = true;
        isPressed = true;
        dragStartX = event.pageX;
    })
    .bind('touchstart',function(e){
        //e.preventDefault();                
        isDragging = true;
        isPressed = true;
        dragStartX = e.originalEvent.touches[0].pageX;
    })
    .mousemove(function(event) {
        if (isDragging) {
            relX = Math.max( lastX + (dragStartX - event.pageX), 0.0 );
            // relX = lastX + (dragStartX - event.pageX)
            setPos(relX);
        }
    })
    .bind('touchmove',function(e){
        //e.preventDefault();
        if (isDragging) {
            var actPos = e.originalEvent.touches[0].pageX;
            relX = Math.max( lastX + (dragStartX - actPos), 0.0 );
            // relX = lastX + (dragStartX - actPos)
            setPos(relX);
        }
    })
    .mouseup(function() {
        isPressed = false;
        isDragging = false;
        lastX = relX;             
    })
    .bind('touchend',function(e){
        //e.preventDefault();
        isPressed = false;
        isDragging = false;
        lastX = relX;
    });

    $(document).mouseup(function(e){
        e.preventDefault();
        isPressed = false;
        isDragging = false;
        lastX = relX;        
    });
    

    $('.splash-screen').on('click',function(){
        setPos(lastX, true)
        //TODO - look at starting the device at the middle posisiton using setPOs, and setting a cutomer headline and message right darn here
    })
       
    //------------------------------------------------------------------
    $('.playHotspotButton').on('click',function(event){ 
        hsClicked(event)
        //Used to control clicking the "play hotspot" button near the top of the screen.

    });

    // only enable touch start to trigger a hotspot click on mobile.  
    // device detection
    /*if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
        
        $('.playHotspotButton').bind('touchstart',function(event){ 
            hsClicked(event)
            //Used to control clicking the "play hotspot" button near the top of the screen.

        });
    }*/    

    $('.playHotspotButton').bind('touchstart',function(event){ 
        hsClicked(event)
            //Used to control clicking the "play hotspot" button near the top of the screen.

    });
}
