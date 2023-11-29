var canvas;	// Drawing surface 
var gl;	// Graphics context

var program1, program2, program3, program4, 
program5, program6, program7, program8, program9, program10,
program11, program12; // programs for each of the fragment shaders
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

function configureBackgroundTexture(imgString) {
    let image = new Image();
    let texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE1);

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
    program1 = initShaders(gl, "vertex-shader", "fragment-shader-1");
    program2 = initShaders(gl, "vertex-shader", "fragment-shader-2");
    program3 = initShaders(gl, "vertex-shader", "fragment-shader-3");
    program4 = initShaders(gl, "vertex-shader", "fragment-shader-4");
    program5 = initShaders(gl, "vertex-shader", "fragment-shader-5");
    program6 = initShaders(gl, "vertex-shader", "fragment-shader-6");
    program7 = initShaders(gl, "vertex-shader", "fragment-shader-7");
    program8 = initShaders(gl, "vertex-shader", "fragment-shader-8");
    program9 = initShaders(gl, "vertex-shader", "fragment-shader-9");
    program10 = initShaders(gl, "vertex-shader", "fragment-shader-10");
    program11 = initShaders(gl, "vertex-shader", "fragment-shader-11");
    program12 = initShaders(gl, "vertex-shader", "fragment-shader-12");

    gl.useProgram(program1); // default to no filter

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

    var texCoordLoc = gl.getAttribLocation(program1, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    texCoordLoc = gl.getAttribLocation(program2, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    texCoordLoc = gl.getAttribLocation(program3, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    // vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    positionLoc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    positionLoc = gl.getAttribLocation(program3, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.uniform1i(gl.getUniformLocation(program1, 'uTexMap'), 0);
    

    document.getElementById("imageFilter").onchange = function (event) {
        switch (event.target.value) {
            case '1': // no filter
                gl.useProgram(program1);
                break;
            case '2': // grayscale filter
                gl.useProgram(program2);
                break;
            case '3': // image negative filter
                gl.useProgram(program3);
                break;
            case '4': // saturated filter
                gl.useProgram(program4);
                break;
            case '5': // sepia filter
                gl.useProgram(program5);
                break;
            case '6': // blurry filter
                gl.useProgram(program6);
                break;
            case '7': // distortion filter
                gl.useProgram(program7);
                break;
            case '8':
                gl.useProgram(program8);
                break;
            case '9':
                gl.useProgram(program9);
                break;
            case '10':
                gl.useProgram(program10);
                break;
            case '11':
                gl.useProgram(program11);
                break;
            case '12':
                configureBackgroundTexture(gorillaBackground);
                gl.useProgram(program12);
                gl.uniform1i(gl.getUniformLocation(program12, 'uBackgroundTexture'), 1);
                break;
            case '13':
                configureBackgroundTexture(christmasHatBackground);
                gl.useProgram(program12);
                gl.uniform1i(gl.getUniformLocation(program12, 'uBackgroundTexture'), 1);
                break;
            default:
                gl.useProgram(program1);
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