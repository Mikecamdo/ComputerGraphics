var canvas;	// Drawing surface 
var gl;	// Graphics context

// variables for the live video feed
var videoFeed, videoTexture;
var liveVideoFeed = true;

var vertices = new Float32Array ([ // vertices for textures to be mapped on to
//    X     Y     Z
   -1.0, -1.0,  0.0,
   -1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,
    1.0, -1.0,  0.0
]);

var backgroundTexture; // variable to hold the current backgroundTexture (either the gorilla or the Christmas hat)

// arrays to hold the programs and their uniform variable locations (each array starts with undefined so that program1 is index 1, program2 is index 2, etc.)
var programs = [undefined];
var distortionFilterTypeLocs = [undefined];
var reflectionTypeLocs = [undefined];
var blurStrengthLocs = [undefined];
var amplitudeLocs = [undefined];
var frequencyLocs = [undefined];
var distortionCoefficientLocs = [undefined];

var currentProgram = 1; // keeps track of the current program that is being used

// adapted from "Hello2DTexture_ImageFile.js" example
function configureTexture(imgString) { // used to configure texture for default static image
    let image = new Image();
    let texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);

    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
        gl.generateMipmap(gl.TEXTURE_2D);
            
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
            gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    image.src = imgString;
}

// used to configure texture for background image (either the gorilla or the Christmas hat)
function configureBackgroundTexture(imgString) {
    let image = new Image();
    backgroundTexture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE1);

    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
        gl.generateMipmap(gl.TEXTURE_2D);
            
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
            gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    image.src = imgString;
}

// the following 3 functions were adapted from https://dev.to/learosema/realtime-video-processing-with-webgl-5653, with assistance from ChatGPT
function configureVideoTexture(video) { 
    let texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    gl.generateMipmap(gl.TEXTURE_2D);
        
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

function updateTexture(texture, video) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
}

function accessWebcam(video) {
  return new Promise((resolve, reject) => {
    const mediaConstraints = { audio: false, video: { width: 1280, height: 720, brightness: {ideal: 2}, facingMode: 'user' } };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(mediaStream => {
      video.srcObject = mediaStream;
      video.setAttribute('playsinline', true);
      video.onloadedmetadata = (e) => {
        video.play();
        resolve(video);
      }
    }).catch(err => {
      reject(err);
    });
  });
}

//----------------------------------------------------------------------------

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-1"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-2"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-3"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-4"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-5"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-6"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-7"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-8"));

    // texture array atrribute buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
        ]),
        gl.STATIC_DRAW
    );

    var texCoordLoc = gl.getAttribLocation(programs[1], "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    texCoordLoc = gl.getAttribLocation(programs[2], "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    texCoordLoc = gl.getAttribLocation(programs[3], "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    // vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(programs[1], "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    positionLoc = gl.getAttribLocation(programs[2], "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    positionLoc = gl.getAttribLocation(programs[3], "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // store all uniform variable locations
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[1], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[2], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[3], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[4], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[5], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[6], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[7], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[8], 'distortionFilterType'));
    
    reflectionTypeLocs.push(gl.getUniformLocation(programs[1], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[2], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[3], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[4], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[5], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[6], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[7], 'reflectionType'));
    reflectionTypeLocs.push(gl.getUniformLocation(programs[8], 'reflectionType'));

    blurStrengthLocs.push(gl.getUniformLocation(programs[1], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[2], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[3], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[4], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[5], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[6], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[7], 'blurStrength'));
    blurStrengthLocs.push(gl.getUniformLocation(programs[8], 'blurStrength'));

    amplitudeLocs.push(gl.getUniformLocation(programs[1], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[2], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[3], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[4], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[5], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[6], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[7], 'amplitude'));
    amplitudeLocs.push(gl.getUniformLocation(programs[8], 'amplitude'));

    frequencyLocs.push(gl.getUniformLocation(programs[1], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[2], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[3], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[4], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[5], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[6], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[7], 'frequency'));
    frequencyLocs.push(gl.getUniformLocation(programs[8], 'frequency'));

    distortionCoefficientLocs.push(gl.getUniformLocation(programs[1], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[2], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[3], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[4], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[5], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[6], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[7], 'distortionCoefficient'));
    distortionCoefficientLocs.push(gl.getUniformLocation(programs[8], 'distortionCoefficient'));

    // initialize the uniform variables for each program
    initializeTextureLocations();

    updateDistortionFilter(1);
    updateReflectionType(1);
    updateBlurStrength(7);
    updateAmplitude(0.2);
    updateFrequency(10.0);
    updateDistortionCoefficient(1.0);

    gl.useProgram(programs[currentProgram]);

    document.getElementById("colorFilter").onchange = function (event) { // switch between different programs based on user's selection
        // 1 = no filter
        // 2 = grayscale filter
        // 3 = image negative filter
        // 4 = saturated filter
        // 5 = sepia filter
        // 6 = constant threshold halftoning
        // 7 = clustered dot screen
        // 8 = bayer dot screen

        currentProgram = event.target.value;
        gl.useProgram(programs[currentProgram]);
    }

    document.getElementById("distortionFilter").onchange = function (event) { // update uniform variables for distortion effects based on user's selection
        switch (event.target.value) {
            case '1': // none
            case '2': // blurry
            case '3': // reflection
            case '4': // wave distortion
            case '5': // barrel distortion
                updateDistortionFilter(event.target.value);
                gl.useProgram(programs[currentProgram]);
                break;
            case '6': // gorilla
                configureBackgroundTexture(gorillaBackground);
                updateDistortionFilter(event.target.value);
                gl.useProgram(programs[currentProgram]);
                break;
            case '7': // christmas hat
                configureBackgroundTexture(christmasHatBackground);
                updateDistortionFilter(event.target.value);
                gl.useProgram(programs[currentProgram]);
                break;
            default:
                updateDistortionFilter(1);
                gl.useProgram(programs[currentProgram]);
        }

        // the following if else statements hide and display various sliders and dropdown menus as needed
        if (event.target.value == '2') {
            document.getElementById("blurChoice").style.display = 'block';
        } else {
            document.getElementById("blurChoice").style.display = 'none';
        }

        if (event.target.value == '3') {
            document.getElementById("reflectionChoice").style.display = 'block';
        } else {
            document.getElementById("reflectionChoice").style.display = 'none';
        }

        if (event.target.value == '4') {
            document.getElementById("waveChoices").style.display = 'block';
        } else {
            document.getElementById("waveChoices").style.display = 'none';
        }

        if (event.target.value == '5') {
            document.getElementById("distortionChoice").style.display = 'block';
        } else {
            document.getElementById("distortionChoice").style.display = 'none';
        }        
    }

    document.getElementById("reflectionType").onchange = function (event) { // updates type of reflection
        updateReflectionType(event.target.value);
    }

    document.getElementById("blurChoice").onpointermove = function (event) { // updates blur strength
        if (event.pressure !== 0) {
            updateBlurStrength(event.target.value);
        }
    }

    document.getElementById("amplitude").onpointermove = function (event) { // updates the amplitude of the wave distortion
        if (event.pressure !== 0) {
            updateAmplitude(event.target.value);
        }
    }

    document.getElementById("frequency").onpointermove = function (event) { // updates the frequency of the wave distortion
        if (event.pressure !== 0) {
            updateFrequency(event.target.value);
        }
    }

    document.getElementById("distortionCoefficient").onpointermove = function (event) { // updates the distortion coefficient of the barrel distortion
        if (event.pressure !== 0) {
            updateDistortionCoefficient(event.target.value);
        }
    }

    videoFeed = document.querySelector('video');

    accessWebcam(videoFeed).then(video => {
        videoTexture = configureVideoTexture(videoFeed);
        render();    
    }).catch(error => {
        console.log(error);

        // if the error is due to no available webcam, use a default image instead
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            configureTexture(imageData);
            liveVideoFeed = false;
            render();    
        }
    });
}

//----------------------------------------------------------------------------

function render()
{
    if (liveVideoFeed) { // only update texture if there is a live video feed
        updateTexture(videoTexture, videoFeed);
    }

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // draws rectangle the size of the canvas for the texture to be mapped to

    requestAnimationFrame(render);	// Call to browser to refresh display
}

//----------------------------------------------------------------------------
// the following functions are all used to initialize and update uniform variables across all fragment shaders

function initializeTextureLocations() {
    gl.useProgram(programs[1]);
    gl.uniform1i(gl.getUniformLocation(programs[1], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[1], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[2]);
    gl.uniform1i(gl.getUniformLocation(programs[2], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[2], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[3]);
    gl.uniform1i(gl.getUniformLocation(programs[3], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[3], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[4]);
    gl.uniform1i(gl.getUniformLocation(programs[4], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[4], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[5]);
    gl.uniform1i(gl.getUniformLocation(programs[5], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[5], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[6]);
    gl.uniform1i(gl.getUniformLocation(programs[6], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[6], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[7]);
    gl.uniform1i(gl.getUniformLocation(programs[7], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[7], 'uBackgroundTexture'), 1);

    gl.useProgram(programs[8]);
    gl.uniform1i(gl.getUniformLocation(programs[8], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[8], 'uBackgroundTexture'), 1);
}

function updateDistortionFilter(distortionFilterType) {
    gl.useProgram(programs[1]);
    gl.uniform1i(distortionFilterTypeLocs[1], distortionFilterType);

    gl.useProgram(programs[2]);
    gl.uniform1i(distortionFilterTypeLocs[2], distortionFilterType);

    gl.useProgram(programs[3]);
    gl.uniform1i(distortionFilterTypeLocs[3], distortionFilterType);

    gl.useProgram(programs[4]);
    gl.uniform1i(distortionFilterTypeLocs[4], distortionFilterType);

    gl.useProgram(programs[5]);
    gl.uniform1i(distortionFilterTypeLocs[5], distortionFilterType);

    gl.useProgram(programs[6]);
    gl.uniform1i(distortionFilterTypeLocs[6], distortionFilterType);

    gl.useProgram(programs[7]);
    gl.uniform1i(distortionFilterTypeLocs[7], distortionFilterType);

    gl.useProgram(programs[8]);
    gl.uniform1i(distortionFilterTypeLocs[8], distortionFilterType);

    gl.useProgram(programs[currentProgram]);
}

function updateReflectionType(reflectionType) {
    gl.useProgram(programs[1]);
    gl.uniform1i(reflectionTypeLocs[1], reflectionType);

    gl.useProgram(programs[2]);
    gl.uniform1i(reflectionTypeLocs[2], reflectionType);

    gl.useProgram(programs[3]);
    gl.uniform1i(reflectionTypeLocs[3], reflectionType);

    gl.useProgram(programs[4]);
    gl.uniform1i(reflectionTypeLocs[4], reflectionType);

    gl.useProgram(programs[5]);
    gl.uniform1i(reflectionTypeLocs[5], reflectionType);

    gl.useProgram(programs[6]);
    gl.uniform1i(reflectionTypeLocs[6], reflectionType);

    gl.useProgram(programs[7]);
    gl.uniform1i(reflectionTypeLocs[7], reflectionType);

    gl.useProgram(programs[8]);
    gl.uniform1i(reflectionTypeLocs[8], reflectionType);

    gl.useProgram(programs[currentProgram]);
}

function updateBlurStrength(blurStrength) {
    gl.useProgram(programs[1]);
    gl.uniform1i(blurStrengthLocs[1], blurStrength);

    gl.useProgram(programs[2]);
    gl.uniform1i(blurStrengthLocs[2], blurStrength);

    gl.useProgram(programs[3]);
    gl.uniform1i(blurStrengthLocs[3], blurStrength);

    gl.useProgram(programs[4]);
    gl.uniform1i(blurStrengthLocs[4], blurStrength);

    gl.useProgram(programs[5]);
    gl.uniform1i(blurStrengthLocs[5], blurStrength);

    gl.useProgram(programs[6]);
    gl.uniform1i(blurStrengthLocs[6], blurStrength);

    gl.useProgram(programs[7]);
    gl.uniform1i(blurStrengthLocs[7], blurStrength);

    gl.useProgram(programs[8]);
    gl.uniform1i(blurStrengthLocs[8], blurStrength);

    gl.useProgram(programs[currentProgram]);
}

function updateAmplitude(amplitude) {
    gl.useProgram(programs[1]);
    gl.uniform1f(amplitudeLocs[1], amplitude);

    gl.useProgram(programs[2]);
    gl.uniform1f(amplitudeLocs[2], amplitude);

    gl.useProgram(programs[3]);
    gl.uniform1f(amplitudeLocs[3], amplitude);

    gl.useProgram(programs[4]);
    gl.uniform1f(amplitudeLocs[4], amplitude);

    gl.useProgram(programs[5]);
    gl.uniform1f(amplitudeLocs[5], amplitude);

    gl.useProgram(programs[6]);
    gl.uniform1f(amplitudeLocs[6], amplitude);

    gl.useProgram(programs[7]);
    gl.uniform1f(amplitudeLocs[7], amplitude);

    gl.useProgram(programs[8]);
    gl.uniform1f(amplitudeLocs[8], amplitude);

    gl.useProgram(programs[currentProgram]);
}

function updateFrequency(frequency) {
    gl.useProgram(programs[1]);
    gl.uniform1f(frequencyLocs[1], frequency);

    gl.useProgram(programs[2]);
    gl.uniform1f(frequencyLocs[2], frequency);

    gl.useProgram(programs[3]);
    gl.uniform1f(frequencyLocs[3], frequency);

    gl.useProgram(programs[4]);
    gl.uniform1f(frequencyLocs[4], frequency);

    gl.useProgram(programs[5]);
    gl.uniform1f(frequencyLocs[5], frequency);

    gl.useProgram(programs[6]);
    gl.uniform1f(frequencyLocs[6], frequency);

    gl.useProgram(programs[7]);
    gl.uniform1f(frequencyLocs[7], frequency);

    gl.useProgram(programs[8]);
    gl.uniform1f(frequencyLocs[8], frequency);

    gl.useProgram(programs[currentProgram]);
}

function updateDistortionCoefficient(distortionCoefficient) {
    gl.useProgram(programs[1]);
    gl.uniform1f(distortionCoefficientLocs[1], distortionCoefficient);

    gl.useProgram(programs[2]);
    gl.uniform1f(distortionCoefficientLocs[2], distortionCoefficient);

    gl.useProgram(programs[3]);
    gl.uniform1f(distortionCoefficientLocs[3], distortionCoefficient);

    gl.useProgram(programs[4]);
    gl.uniform1f(distortionCoefficientLocs[4], distortionCoefficient);

    gl.useProgram(programs[5]);
    gl.uniform1f(distortionCoefficientLocs[5], distortionCoefficient);

    gl.useProgram(programs[6]);
    gl.uniform1f(distortionCoefficientLocs[6], distortionCoefficient);

    gl.useProgram(programs[7]);
    gl.uniform1f(distortionCoefficientLocs[7], distortionCoefficient);

    gl.useProgram(programs[8]);
    gl.uniform1f(distortionCoefficientLocs[8], distortionCoefficient);

    gl.useProgram(programs[currentProgram]);
}