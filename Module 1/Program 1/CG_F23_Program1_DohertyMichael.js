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
    // ! change the following every time you need more values
    let vertices = new Float32Array(48 * 3);

    for (let i = 0; i < 24; i++) { //points for bottom of pedestal
        vertices[3 * i] = Math.cos(i*2*Math.PI/24) * 0.8; //x
        vertices[3 * i + 1] = -0.5; //y
        vertices[3 * i + 2] = Math.sin(i*2*Math.PI/24) * 0.8; //z
    }

    for (let i = 24; i < 48; i++) { //points for top of pedestal
        vertices[3 * i] = Math.cos(i*2*Math.PI/24) * 0.4; //x
        vertices[3 * i + 1] = 0.2; //y
        vertices[3 * i + 2] = Math.sin(i*2*Math.PI/24) * 0.4; //z
    }

    let vertexColors = new Float32Array(48 * 4);

    for (let i = 0; i < 48; i++) { //colors for pedestal
        vertexColors[4 * i] = 0.0; //r
        vertexColors[4 * i + 1] = 0.0; //g
        vertexColors[4 * i + 2] = 0.0; //b
        vertexColors[4 * i + 3] = 1.0; //a
    }
    
    

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

    // color array atrribute buffer
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

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

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

    gl.drawArrays(gl.LINE_LOOP, 0, 24);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 24);

    gl.drawArrays(gl.LINE_LOOP, 24, 24);
    gl.drawArrays(gl.TRIANGLE_FAN, 24, 24);

    requestAnimationFrame(render);	// Call to browser to refresh display
}
