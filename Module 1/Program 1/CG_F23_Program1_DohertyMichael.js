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

    var vertices = new Float32Array ( [
    //    X     Y     Z
    Math.cos(0*2*Math.PI/24) * 0.8, -0.5, Math.sin(0*2*Math.PI/24) * 0.8, 
    Math.cos(1*2*Math.PI/24) * 0.8, -0.5, Math.sin(1*2*Math.PI/24) * 0.8,
    Math.cos(2*2*Math.PI/24) * 0.8, -0.5, Math.sin(2*2*Math.PI/24) * 0.8,
    Math.cos(3*2*Math.PI/24) * 0.8, -0.5, Math.sin(3*2*Math.PI/24) * 0.8,
    Math.cos(4*2*Math.PI/24) * 0.8, -0.5, Math.sin(4*2*Math.PI/24) * 0.8,
    Math.cos(5*2*Math.PI/24) * 0.8, -0.5, Math.sin(5*2*Math.PI/24) * 0.8,
    Math.cos(6*2*Math.PI/24) * 0.8, -0.5, Math.sin(6*2*Math.PI/24) * 0.8,
    Math.cos(7*2*Math.PI/24) * 0.8, -0.5, Math.sin(7*2*Math.PI/24) * 0.8,
    Math.cos(8*2*Math.PI/24) * 0.8, -0.5, Math.sin(8*2*Math.PI/24) * 0.8,
    Math.cos(9*2*Math.PI/24) * 0.8, -0.5, Math.sin(9*2*Math.PI/24) * 0.8,
    Math.cos(10*2*Math.PI/24) * 0.8, -0.5, Math.sin(10*2*Math.PI/24) * 0.8,
    Math.cos(11*2*Math.PI/24) * 0.8, -0.5, Math.sin(11*2*Math.PI/24) * 0.8,
    Math.cos(12*2*Math.PI/24) * 0.8, -0.5, Math.sin(12*2*Math.PI/24) * 0.8, 
    Math.cos(13*2*Math.PI/24) * 0.8, -0.5, Math.sin(13*2*Math.PI/24) * 0.8,
    Math.cos(14*2*Math.PI/24) * 0.8, -0.5, Math.sin(14*2*Math.PI/24) * 0.8,
    Math.cos(15*2*Math.PI/24) * 0.8, -0.5, Math.sin(15*2*Math.PI/24) * 0.8,
    Math.cos(16*2*Math.PI/24) * 0.8, -0.5, Math.sin(16*2*Math.PI/24) * 0.8,
    Math.cos(17*2*Math.PI/24) * 0.8, -0.5, Math.sin(17*2*Math.PI/24) * 0.8,
    Math.cos(18*2*Math.PI/24) * 0.8, -0.5, Math.sin(18*2*Math.PI/24) * 0.8,
    Math.cos(19*2*Math.PI/24) * 0.8, -0.5, Math.sin(19*2*Math.PI/24) * 0.8,
    Math.cos(20*2*Math.PI/24) * 0.8, -0.5, Math.sin(20*2*Math.PI/24) * 0.8,
    Math.cos(21*2*Math.PI/24) * 0.8, -0.5, Math.sin(21*2*Math.PI/24) * 0.8,
    Math.cos(22*2*Math.PI/24) * 0.8, -0.5, Math.sin(22*2*Math.PI/24) * 0.8,
    Math.cos(23*2*Math.PI/24) * 0.8, -0.5, Math.sin(23*2*Math.PI/24) * 0.8,

    Math.cos(0*2*Math.PI/24) * 0.4, 0.2, Math.sin(0*2*Math.PI/24) * 0.4, 
    Math.cos(1*2*Math.PI/24) * 0.4, 0.2, Math.sin(1*2*Math.PI/24) * 0.4,
    Math.cos(2*2*Math.PI/24) * 0.4, 0.2, Math.sin(2*2*Math.PI/24) * 0.4,
    Math.cos(3*2*Math.PI/24) * 0.4, 0.2, Math.sin(3*2*Math.PI/24) * 0.4,
    Math.cos(4*2*Math.PI/24) * 0.4, 0.2, Math.sin(4*2*Math.PI/24) * 0.4,
    Math.cos(5*2*Math.PI/24) * 0.4, 0.2, Math.sin(5*2*Math.PI/24) * 0.4,
    Math.cos(6*2*Math.PI/24) * 0.4, 0.2, Math.sin(6*2*Math.PI/24) * 0.4,
    Math.cos(7*2*Math.PI/24) * 0.4, 0.2, Math.sin(7*2*Math.PI/24) * 0.4,
    Math.cos(8*2*Math.PI/24) * 0.4, 0.2, Math.sin(8*2*Math.PI/24) * 0.4,
    Math.cos(9*2*Math.PI/24) * 0.4, 0.2, Math.sin(9*2*Math.PI/24) * 0.4,
    Math.cos(10*2*Math.PI/24) * 0.4, 0.2, Math.sin(10*2*Math.PI/24) * 0.4,
    Math.cos(11*2*Math.PI/24) * 0.4, 0.2, Math.sin(11*2*Math.PI/24) * 0.4,
    Math.cos(12*2*Math.PI/24) * 0.4, 0.2, Math.sin(12*2*Math.PI/24) * 0.4, 
    Math.cos(13*2*Math.PI/24) * 0.4, 0.2, Math.sin(13*2*Math.PI/24) * 0.4,
    Math.cos(14*2*Math.PI/24) * 0.4, 0.2, Math.sin(14*2*Math.PI/24) * 0.4,
    Math.cos(15*2*Math.PI/24) * 0.4, 0.2, Math.sin(15*2*Math.PI/24) * 0.4,
    Math.cos(16*2*Math.PI/24) * 0.4, 0.2, Math.sin(16*2*Math.PI/24) * 0.4,
    Math.cos(17*2*Math.PI/24) * 0.4, 0.2, Math.sin(17*2*Math.PI/24) * 0.4,
    Math.cos(18*2*Math.PI/24) * 0.4, 0.2, Math.sin(18*2*Math.PI/24) * 0.4,
    Math.cos(19*2*Math.PI/24) * 0.4, 0.2, Math.sin(19*2*Math.PI/24) * 0.4,
    Math.cos(20*2*Math.PI/24) * 0.4, 0.2, Math.sin(20*2*Math.PI/24) * 0.4,
    Math.cos(21*2*Math.PI/24) * 0.4, 0.2, Math.sin(21*2*Math.PI/24) * 0.4,
    Math.cos(22*2*Math.PI/24) * 0.4, 0.2, Math.sin(22*2*Math.PI/24) * 0.4,
    Math.cos(23*2*Math.PI/24) * 0.4, 0.2, Math.sin(23*2*Math.PI/24) * 0.4,
    ] );

    var vertexColors = new Float32Array ( [	
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0
    ]);


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
    // ! need to change the following line when I go back to 3D
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

    gl.drawArrays( gl.LINE_LOOP, 0, 24);

    gl.drawArrays(gl.LINE_LOOP, 24, 24);

    requestAnimationFrame(render);	// Call to browser to refresh display
}
