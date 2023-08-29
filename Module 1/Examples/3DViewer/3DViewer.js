"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 0;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis =1;			//  
var zAxis = 2;

var theta = [0, 0, 0];		// Rotation angles for x, y and z axes
var thetaLoc;			// Holds shader uniform variable location
var flag = true;		// Toggle Rotation Control

    var vertices = new Float32Array ( [			// Use Javascript typed arrays
        -0.5, -0.5,  0.5,		
        -0.5,  0.5,  0.5,	
        -0.5,  0.5,  0.5,   	
        0.5,  0.5,  0.5,

        0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
        0.5,  0.5, -0.5
       // 0.5, -0.5, -0.5
    ] );

    var vertexColors = new Float32Array ( [	
        0.0, 0.0, 0.0, 1.0,  // black
        1.0, 0.0, 0.0, 1.0,  // red
        1.0, 1.0, 0.0, 1.0,  // yellow
        0.0, 1.0, 0.0, 1.0,  // green
        0.0, 0.0, 1.0, 1.0,  // blue
        1.0, 0.0, 1.0, 1.0,  // magenta
        1.0, 1.0, 1.0, 1.0,  // white
        0.0, 1.0, 1.0, 1.0  // cyan
    ]);


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //gl.enable(gl.DEPTH_TEST);;

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

    gl.drawArrays(gl.LINES, 0, vertices.length/3);	// Try changing the primitive type

    //gl.drawArrays(gl.POINTS, 0, vertices.length/3);	// Try changing the primitive type

    requestAnimationFrame(render);	// Call to browser to refresh display
}
