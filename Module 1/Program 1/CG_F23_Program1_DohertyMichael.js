"use strict";

var canvas;	// Drawing surface 
var gl;	// Graphics context

var axis = 0; // Currently active axis of rotation
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var theta = [0, 0, 0]; // Rotation angles for x, y and z axes
var thetaLoc; // Holds shader uniform variable location
var flag = false; // Toggle Rotation Control


window.onload = function init()
{
    let vertices = [];

    for (let i = 0; i < 24; i++) { //points for top of pedestal
        vertices.push(
            Math.cos(i*2*Math.PI/24) * 0.3, // X
            -0.1,                            // Y
            Math.sin(i*2*Math.PI/24) * 0.3  // Z
        );
    }

    for (let i = 0; i < 24; i++) { //points for bottom of pedestal
        vertices.push(
            Math.cos(i*2*Math.PI/24) * 0.6, // X
            -0.8,                           // Y
            Math.sin(i*2*Math.PI/24) * 0.6  // Z
        );
    }

    let vertexColors = [];

    for (let i = 0; i < 24; i++) { //color for top of pedestal
        vertexColors.push(
        //   R    G    B    A
            1.0, 1.0, 1.0, 1.0
        );
    }

    for (let i = 0; i < 24; i++) { //colors for bottom of pedestal
        vertexColors.push(
        //   R    G    B    A
            0.0, 0.0, 0.0, 1.0
        );
    }

    //0 - 23 are top of pedestal
    //24 - 47 are bottom of pedestal
    let indices = [];

    for (let i = 0; i < 48; i++) { // indices for top/bottom of pedestal
        indices.push(i);
    }

    for (let i = 0; i < 23; i++) { // indices for connecting the top and bottom of pedestal
        indices.push(i, i + 24, i + 25, i + 1);
    }
    indices.push(23, 47, 24, 0);
    
    // convert to typed arrays
    vertices = new Float32Array(vertices);
    vertexColors = new Float32Array(vertexColors);
    indices = new Uint8Array(indices);

// ----------------------------------------------------------

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array attribute buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // ! new buffer, leave a better comment
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    // draw top of pedestal
    gl.drawElements(gl.LINE_LOOP, 24, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.TRIANGLE_FAN, 24, gl.UNSIGNED_BYTE, 0);

    // draw bottom of pedestal
    gl.drawElements(gl.LINE_LOOP, 24, gl.UNSIGNED_BYTE, 24);
    gl.drawElements(gl.TRIANGLE_FAN, 24, gl.UNSIGNED_BYTE, 24);

    // connect top and bottom of pedestal
    for (let i = 0; i < 24; i++) {
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 48 + (4 * i));
    }

    requestAnimationFrame(render);	// Call to browser to refresh display
}
