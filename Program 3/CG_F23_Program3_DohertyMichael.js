var canvas;	// Drawing surface 
var gl;	// Graphics context

var program1, program2, program3, program4, 
program5, program6, program7, program8, program9, program10,
program11, program12; // programs for each of the fragment shaders
var programs = [undefined];

var videoFeed, videoTexture;

var liveVideoFeed = true;

var vertices = new Float32Array ( [	// Use Javascript typed arrays for coordinates
//    X     Y     Z
   -1.0, -1.0,  0.0,
   -1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,
    1.0, -1.0,  0.0
]);

var backgroundTexture;
var distortionFilterTypeLocs = [undefined];
var currentProgram = 1;

// adapted from "Hello2DTexture_ImageFile.js" example
function configureTexture(imgString) {
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

var backgroundTexture;
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
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-9"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-10"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-11"));
    programs.push(initShaders(gl, "vertex-shader", "fragment-shader-12"));

    gl.useProgram(programs[currentProgram]); // default to no filter

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

    gl.uniform1i(gl.getUniformLocation(programs[1], 'uTexMap'), 0);
    gl.uniform1i(gl.getUniformLocation(programs[1], 'uBackgroundTexture'), 1);

    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[1], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[2], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[3], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[4], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[5], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[6], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[7], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[8], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[9], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[10], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[11], 'distortionFilterType'));
    distortionFilterTypeLocs.push(gl.getUniformLocation(programs[12], 'distortionFilterType'));

    updateDistortionFilter(1);
    gl.useProgram(programs[currentProgram]);

    document.getElementById("colorFilter").onchange = function (event) {
        switch (event.target.value) {
            case '1': // no filter
            case '2': // grayscale filter
            case '3': // image negative filter
            case '4': // saturated filter
            case '5': // sepia filter
            // case '6': // blurry filter
            //     gl.useProgram(program6);
            //     break;
            // case '7': // distortion filter
            //     gl.useProgram(program7);
            //     break;
            case '8': // constant threshold halftoning
            case '9': // clustered dot screen
            case '10': // bayer dot screen
                currentProgram = event.target.value;

                gl.useProgram(programs[currentProgram]);
                
                gl.uniform1i(gl.getUniformLocation(programs[currentProgram], 'uTexMap'), 0);
                gl.uniform1i(gl.getUniformLocation(programs[currentProgram], 'uBackgroundTexture'), 1);
                break;
            // case '11': // reflection
            //     gl.useProgram(program11);
            //     break;
            // case '12': // gorilla
            //     configureBackgroundTexture(gorillaBackground);
            //     gl.useProgram(program12);
            //     gl.uniform1i(gl.getUniformLocation(program12, 'uBackgroundTexture'), 1);
            //     break;
            // case '13': // christmas hat
            //     configureBackgroundTexture(christmasHatBackground);
            //     gl.useProgram(program12);
            //     gl.uniform1i(gl.getUniformLocation(program12, 'uBackgroundTexture'), 1);
            //     break;
            default:
                gl.useProgram(program1);
        }
    }

    document.getElementById("distortionFilter").onchange = function (event) {
        switch (event.target.value) {
            case '1': // none
            case '2': // blurry
            case '3': // distortion
            case '4': // reflection
                updateDistortionFilter(event.target.value);
                gl.useProgram(programs[currentProgram]);
                break;
            case '5': // gorilla
                configureBackgroundTexture(gorillaBackground);
                updateDistortionFilter(event.target.value);
                gl.useProgram(programs[currentProgram]);
                break;
            case '6': // christmas hat
                configureBackgroundTexture(christmasHatBackground);
                updateDistortionFilter(event.target.value);
                gl.useProgram(programs[currentProgram]);
                break;
            default:
                updateDistortionFilter(1);
                gl.useProgram(programs[currentProgram]);
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

function render()
{
    if (liveVideoFeed) { // only update texture if there is a live video feed
        updateTexture(videoTexture, videoFeed);
    }

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // draws rectangle the size of the canvas for the texture to be mapped to

    requestAnimationFrame(render);	// Call to browser to refresh display
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

    gl.useProgram(programs[9]);
    gl.uniform1i(distortionFilterTypeLocs[9], distortionFilterType);

    gl.useProgram(programs[10]);
    gl.uniform1i(distortionFilterTypeLocs[10], distortionFilterType);

    gl.useProgram(programs[11]);
    gl.uniform1i(distortionFilterTypeLocs[11], distortionFilterType);

    gl.useProgram(programs[12]);
    gl.uniform1i(distortionFilterTypeLocs[12], distortionFilterType);
}