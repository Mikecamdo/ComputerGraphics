"use strict";

var program;
var canvas;	// Drawing surface 
var gl;	// Graphics context

var axis = 0; // Currently active axis of rotation
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var theta = [0, 0, 0]; // Rotation angles for x, y and z axes
var thetaLoc; // Holds shader uniform variable location
var flag = false; // Toggle Rotation Control

var direction = 1; // Toggle Rotation Direction (1 is counter clockwise, -1 is clockwise)
var speed = 0.015; // Toggle Rotation Speed

var showFireworks = false; // Toggle Fireworks Animation
var fireworkOffset = 0; // TODO add description
// ! FIXME RENAME THESE VARIABLES!!
var fireworkExplosionOffset = -0.1;
var fireworkExplosionOffset2 = -0.1;
var fireworkExplosionOffset3 = -0.1;

// TODO probably need to rename these too!
var innerRingPoints = [ ];
var middleRingPoints = [ ];
var outerRingPoints = [ ];

var uOffsetLoc;

window.onload = function init()
{
    let vertices = [];

    for (let i = 0; i < 24; i++) { //points for top of pedestal
        vertices.push(
            Math.cos(i*2*Math.PI/24) * 0.3, // X
            -0.1001,                            // Y
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
    
    vertices.push( //points for M
    //     X     Y    Z
        -0.15,  0.3, 0.05,
        -0.15,  0.7, 0.05,
        -0.10,  0.7, 0.05,
        -0.10,  0.3, 0.05,
         0.0,   0.4, 0.05,
         0.0,   0.5, 0.05,
         0.10,  0.3, 0.05,
         0.10,  0.7, 0.05,
         0.15,  0.7, 0.05,
         0.15,  0.3, 0.05,

        -0.15,  0.3, -0.05,
        -0.15,  0.7, -0.05,
        -0.10,  0.7, -0.05,
        -0.10,  0.3, -0.05,
         0.0,   0.4, -0.05,
         0.0,   0.5, -0.05,
         0.10,  0.3, -0.05,
         0.10,  0.7, -0.05,
         0.15,  0.7, -0.05,
         0.15,  0.3, -0.05
    );

    vertices.push( // points for D
    //     X     Y    Z
        -0.15,  -0.1, 0.05,
        -0.15,   0.3, 0.05,
        -0.075,  0.3, 0.05,
        -0.075, -0.1, 0.05,

        -0.075, -0.025, 0.05,
        -0.075,  0.225, 0.05,
    );

    for (let i = 0; i < 13; i++) { //points for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.2 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.2 + 0.1, // Y
            0.05,                           // Z
        );
    }

    for (let i = 0; i < 13; i++) { //points for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.125 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.125 + 0.1, // Y
            0.05,                           // Z
        );
    }

    vertices.push( // points for D
    //     X     Y    Z
        -0.15,  -0.1, -0.05,
        -0.15,   0.3, -0.05,
        -0.075,  0.3, -0.05,
        -0.075, -0.1, -0.05,

        -0.075, -0.025, -0.05,
        -0.075,  0.225, -0.05,
    );

    for (let i = 0; i < 13; i++) { //points for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.2 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.2 + 0.1, // Y
            -0.05,                           // Z
        );
    }

    for (let i = 0; i < 13; i++) { //points for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.125 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.125 + 0.1, // Y
            -0.05,                           // Z
        );
    }

    vertices.push(-0.6, -0.8, 0); //! Temp for fireworks

    for (let i = 0; i < 12; i++) {
        vertices.push(
            Math.cos(i*2*Math.PI/12) * 0.125 - 0.6, // X
            Math.sin(i*2*Math.PI/12) * 0.125 + 0.8, // Y
            0,                           // Z
        );
    }

    // vertices.push(
    //     -0.8 , 0.8, 0.0,
    //     -0.85, 0.8, 0.0,
    //     -0.75, 0.8, 0.0
    // );

    //Numbering for vertex points:
    //0 - 23 are top of pedestal
    //24 - 47 are bottom of pedestal
    //48 - 67 are M
    //68 - 99 are front of D
    //100 - 131 are back of D
    let indices = [];

    for (let i = 0; i < 48; i++) { // indices for top/bottom of pedestal
        indices.push(i);
    }

    for (let i = 0; i < 23; i++) { // indices for connecting the top and bottom of pedestal
        indices.push(i, i + 24, i + 25, i + 1);
    }
    indices.push(23, 47, 24, 0);

    // indices for the M
    indices.push(
        //front face of M
        48, 49, 50, 51, 
        54, 55, 56, 57,
        49, 52, 53, 50, 
        55, 53, 52, 56,

        //back face of M
        58, 59, 60, 61, 
        64, 65, 66, 67,
        59, 62, 63, 60, 
        65, 63, 62, 66,

        //other faces of M
        48, 58, 61, 51,
        48, 58, 59, 49,
        49, 59, 60, 50,
        51, 50, 60, 61,

        49, 59, 62, 52,
        50, 60, 63, 53,

        52, 62, 66, 56,
        53, 63, 65, 55,

        54, 64, 67, 57,
        54, 64, 65, 55,
        55, 65, 66, 56,
        57, 56, 66, 67
    );

    indices.push( //front of D
        68, 69, 70, 71,
        
        74, 87, 75, 88, 76, 89, 77, 90, 78, 91, 79, 92, 80, 93, 81, 94, 82, 95, 83, 96, 84, 97, 85, 98, 86, 99,

        73, 70, 86, 99,
        71, 72, 87, 74
    );

    indices.push( //back of D
        100, 101, 102, 103,
        
        106, 119, 107, 120, 108, 121, 109, 122, 110, 123, 111, 124, 112, 125, 113, 126, 114, 127, 115, 128, 116, 129, 117, 130, 118, 131,

        105, 102, 118, 131,
        103, 104, 119, 106
    );

    indices.push( // filling in the D
        68, 100, 103, 71,
        68, 69, 101, 100,
        69, 101, 102, 70,
        71, 70, 102, 103,

        70, 102, 118, 86,
        71, 103, 106, 74,
    );

    for (let i = 0; i < 12; i++) {
        let start = 74 + i;
        indices.push(
            start, start + 32, start + 33, start + 1
        );
    }

    for (let i = 0; i < 12; i++) {
        let start = 87 + i;
        indices.push(
            start, start + 32, start + 33, start + 1
        );
    }
    
    // convert to typed arrays
    vertices = new Float32Array(vertices);
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
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

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
    let xButton = document.getElementById("xButton");
    let yButton = document.getElementById("yButton");
    let zButton = document.getElementById("zButton");

    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
        changeButtonColor(xButton, yButton, zButton);
    };
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
        changeButtonColor(xButton, yButton, zButton);
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
        changeButtonColor(xButton, yButton, zButton);
    };
    document.getElementById("ButtonT").onclick = function () {
        flag = !flag;
        if (flag) {
            this.classList.add('active-button');
        } else {
            this.classList.remove('active-button');
        }
    };
    document.getElementById("rotationButton").onclick = function () {
        direction *= -1;
    }
    document.getElementById("fireworksButton").onclick = function () {
        //TODO start the fireworks
        showFireworks = true;
        fireworkOffset = 0;
        fireworkExplosionOffset = -0.1;
        fireworkExplosionOffset2 = -0.1;
        fireworkExplosionOffset3 = -0.1;

        // clear the arrays
        innerRingPoints.length = 0;
        middleRingPoints.length = 0;
        outerRingPoints.length = 0;

        counter = 0;
        console.log("Fireworks!");
    }


    uOffsetLoc = gl.getUniformLocation(program, "uOffset");

    render();
}

// function that highlights the button of the axis that rotation is currently applied to
function changeButtonColor(xButton, yButton, zButton) {
    switch(axis) {
        case xAxis:
            xButton.classList.add('active-button');
            yButton.classList.remove('active-button');
            zButton.classList.remove('active-button');
            break;
        case yAxis:
            xButton.classList.remove('active-button');
            yButton.classList.add('active-button');
            zButton.classList.remove('active-button');
            break;
        case zAxis:
            xButton.classList.remove('active-button');
            yButton.classList.remove('active-button');
            zButton.classList.add('active-button');
    }
}

// this function converts from hex colors to rgb colors
function hexToRgb(hex) {
    let r = parseInt(hex[1] + hex[2], 16);
    let g = parseInt(hex[3] + hex[4], 16);
    let b = parseInt(hex[5] + hex[6], 16);

    return [r / 255, g / 255, b / 255];
}

var counter = 0; //TODO MOVE THIS AND RENAME (?)

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform4fv(uOffsetLoc, [0.0, 0.0, 0.0, 0.0]); // reset offset to 0

    let colorChoice = document.getElementById("colorPicker").value;
    colorChoice = hexToRgb(colorChoice);

    if(flag) theta[axis] += speed * document.getElementById("rotationSpeed").value * direction;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    let uColorLoc = gl.getUniformLocation(program, "uColor");

    //! color for pedestal
    gl.uniform4f(uColorLoc, colorChoice[0], colorChoice[1], colorChoice[2], 1.0);

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

    //! color for M
    gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0);

    // draw M
    for (let i = 0; i < 20; i++) {
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 144 + (4 * i));
    }

    //! color for D
    gl.uniform4f(uColorLoc, 0.5, 0.0, 1.0, 1.0);

    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 224);
    gl.drawElements(gl.TRIANGLE_STRIP, 26, gl.UNSIGNED_BYTE, 228);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 254);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 258);

    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 262);
    gl.drawElements(gl.TRIANGLE_STRIP, 26, gl.UNSIGNED_BYTE, 266);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 292);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 296);

    for (let i = 0; i < 30; i++) {
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 300 + (4 * i));
    }

    if (showFireworks) {
        gl.uniform3fv(thetaLoc, [0, 0, 0]); // clears rotation angles so they don't apply to fireworks

        //! color for fireworks
        gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0);

        fireworkOffset += 0.02;

        if (fireworkOffset < 1.6) {
            gl.uniform4fv(uOffsetLoc, [0.0, fireworkOffset, 0.0, 0.0]);
            gl.drawArrays(gl.POINTS, 132, 1);

            gl.uniform4fv(uOffsetLoc, [1.2, fireworkOffset, 0.0, 0.0]);
            gl.drawArrays(gl.POINTS, 132, 1);
        } else if (fireworkExplosionOffset3 < 0.5) {
            for (let i = 0; i < 12; i++) {

                gl.uniform4f(uColorLoc, 1.0, 0.65, 0.0, 1.0 - fireworkExplosionOffset);

                // Inner ring of firework
                let xOffset = Math.cos(i*2*Math.PI/12) * fireworkExplosionOffset;
                let yOffset = Math.sin(i*2*Math.PI/12) * fireworkExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                gl.drawArrays(gl.POINTS, 133 + i, 1);

                for (let j = 0; j < innerRingPoints.length; j++) {
                    xOffset = Math.cos(i*2*Math.PI/12) * innerRingPoints[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * innerRingPoints[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                gl.uniform4f(uColorLoc, 1.0, 1.0, 0.0, 1.0 - fireworkExplosionOffset2);

                // Middle ring of firework
                xOffset = Math.cos(i*2*Math.PI/12) * fireworkExplosionOffset2;
                yOffset = Math.sin(i*2*Math.PI/12) * fireworkExplosionOffset2;

                gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                gl.drawArrays(gl.POINTS, 133 + i, 1);

                for (let j = 0; j < middleRingPoints.length; j++) {
                    xOffset = Math.cos(i*2*Math.PI/12) * middleRingPoints[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * middleRingPoints[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0 - fireworkExplosionOffset3);

                // Outer ring of firework
                xOffset = Math.cos(i*2*Math.PI/12) * fireworkExplosionOffset3;
                yOffset = Math.sin(i*2*Math.PI/12) * fireworkExplosionOffset3;

                gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                gl.drawArrays(gl.POINTS, 133 + i, 1);

                for (let j = 0; j < outerRingPoints.length; j++) {
                    xOffset = Math.cos(i*2*Math.PI/12) * outerRingPoints[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * outerRingPoints[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }        
            }

            for (let i = 0; i < 12; i++) {

                gl.uniform4f(uColorLoc, 1.0, 0.65, 0.0, 1.0 - fireworkExplosionOffset);

                // Inner ring of firework
                let xOffset = Math.cos(i*2*Math.PI/12) * fireworkExplosionOffset;
                let yOffset = Math.sin(i*2*Math.PI/12) * fireworkExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                gl.drawArrays(gl.POINTS, 133 + i, 1);

                for (let j = 0; j < innerRingPoints.length; j++) {
                    xOffset = Math.cos(i*2*Math.PI/12) * innerRingPoints[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * innerRingPoints[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                gl.uniform4f(uColorLoc, 1.0, 1.0, 0.0, 1.0 - fireworkExplosionOffset2);

                // Middle ring of firework
                xOffset = Math.cos(i*2*Math.PI/12) * fireworkExplosionOffset2;
                yOffset = Math.sin(i*2*Math.PI/12) * fireworkExplosionOffset2;

                gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                gl.drawArrays(gl.POINTS, 133 + i, 1);

                for (let j = 0; j < middleRingPoints.length; j++) {
                    xOffset = Math.cos(i*2*Math.PI/12) * middleRingPoints[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * middleRingPoints[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0 - fireworkExplosionOffset3);

                // Outer ring of firework
                xOffset = Math.cos(i*2*Math.PI/12) * fireworkExplosionOffset3;
                yOffset = Math.sin(i*2*Math.PI/12) * fireworkExplosionOffset3;

                gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                gl.drawArrays(gl.POINTS, 133 + i, 1);

                for (let j = 0; j < outerRingPoints.length; j++) {
                    xOffset = Math.cos(i*2*Math.PI/12) * outerRingPoints[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * outerRingPoints[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }        
            }

            if (counter % 4 == 0) {
                innerRingPoints.push(fireworkExplosionOffset);
                middleRingPoints.push(fireworkExplosionOffset2);
                outerRingPoints.push(fireworkExplosionOffset3);
            }

            if (innerRingPoints.length > 5) {
                innerRingPoints.shift();
                middleRingPoints.shift();
                outerRingPoints.shift();
            }

            if (fireworkExplosionOffset3 < 0.1) { // faster increase at first (for the explosion)
                fireworkExplosionOffset += 0.005;
                fireworkExplosionOffset2 += 0.010;
                fireworkExplosionOffset3 += 0.015;
            } else { // slower increase after
                fireworkExplosionOffset += 0.002;
                fireworkExplosionOffset2 += 0.003;
                fireworkExplosionOffset3 += 0.004;
            }
            
            counter += 1;
        } else {
            showFireworks = false;
        }
    }

    requestAnimationFrame(render);	// Call to browser to refresh display
}
