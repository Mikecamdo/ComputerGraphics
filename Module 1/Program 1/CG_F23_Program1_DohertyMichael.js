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

var showFireworks = false; // Toggle Fireworks Animation

var rocketOffset = 0; // Offset for the rocket part of the firework
var innerExplosionOffset = -0.1; // Offset for the inner ring of the firework explosion
var middleExplosionOffset = -0.1; // Offset for the middle ring of the firework explosion
var outerExplosionOffset = -0.1; // Offset for the outer ring of the firework explosion

// Arrays holding previous offset values (used to create a "trail" behind the points in each explosion ring)
var innerRingOffsets = [ ];
var middleRingOffsets = [ ];
var outerRingOffsets = [ ];

var counter = 0; // Counter variable that keeps track of the number of frames during the firework animation (used to help create the "trail" effect)

var uOffsetLoc; // Holds shader uniform variable location for uOffset
var uColorLoc; // Holder shader uniform variable location for uColor
var scaleFactorLoc; // Holder shader uniform variable location for scaleFactor

// Variables to hold the scaleFactor values
var pedestalScaleFactor;
var mScaleFactor;
var dScaleFactor;

window.onload = function init() {
    // put vertices and indices in typed arrays (needed by the GPU)
    let vertices = new Float32Array(getVertices());
    let indices = new Uint8Array(getIndices());

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

    // index array attribute buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // set uniform variable references
    thetaLoc = gl.getUniformLocation(program, "uTheta");
    uOffsetLoc = gl.getUniformLocation(program, "uOffset");
    uColorLoc = gl.getUniformLocation(program, "uColor");
    scaleFactorLoc = gl.getUniformLocation(program, "scaleFactor");

    // initialize each scaleFactor to 1
    pedestalScaleFactor = 1.0;
    mScaleFactor = 1.0;
    dScaleFactor = 1.0;
    gl.uniform1f(scaleFactorLoc, 1.0);

    //event listeners for interactive elements (buttons, dropdown menus, etc.)
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
        showFireworks = true; // begin fireworks animation

        // reset all offsets
        rocketOffset = 0;
        innerExplosionOffset = -0.1;
        middleExplosionOffset = -0.1;
        outerExplosionOffset = -0.1;

        // clear offset arrays
        innerRingOffsets.length = 0;
        middleRingOffsets.length = 0;
        outerRingOffsets.length = 0;

        counter = 0; // reset the counter
    }
    document.getElementById("pedestalScaler").onpointermove = function(event) {
        pedestalScaleFactor = event.target.value;
    };
    document.getElementById("mScaler").onpointermove = function(event) {
        mScaleFactor = event.target.value;
    };
    document.getElementById("dScaler").onpointermove = function(event) {
        dScaleFactor = event.target.value;
    };
    let previous = 1; // variable that stores the last value used from the "Everything" size adjuster
    document.getElementById("everythingScaler").onpointermove = function(event) {
        if (event.target.value != previous) { // this if statement prevents the other scale factors from resetting when the "Everything" size adjuster is simply hovered over
            pedestalScaleFactor = event.target.value;
            mScaleFactor = event.target.value;
            dScaleFactor = event.target.value;

            document.getElementById("pedestalScaler").value = event.target.value;
            document.getElementById("mScaler").value = event.target.value;
            document.getElementById("dScaler").value = event.target.value;
            previous = event.target.value;
        }
    };

    render();
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform4fv(uOffsetLoc, [0.0, 0.0, 0.0, 0.0]); // reset offset to 0

    if(flag) theta[axis] += 0.015 * document.getElementById("rotationSpeed").value * direction;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    let pedestalColor = document.getElementById("colorPicker").value; // get pedestal color from HTML input
    pedestalColor = hexToRgb(pedestalColor); // convert color from Hex to RGB
    gl.uniform4f(uColorLoc, pedestalColor[0], pedestalColor[1], pedestalColor[2], 1.0); // set the pedestal's color
    gl.uniform1f(scaleFactorLoc, pedestalScaleFactor); // set the pedestal's scaleFactor

    // draw top of pedestal
    gl.drawElements(gl.LINE_LOOP, 24, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.TRIANGLE_FAN, 24, gl.UNSIGNED_BYTE, 0);

    // draw bottom of pedestal
    gl.drawElements(gl.LINE_LOOP, 24, gl.UNSIGNED_BYTE, 24);
    gl.drawElements(gl.TRIANGLE_FAN, 24, gl.UNSIGNED_BYTE, 24);

    // connect top and bottom of pedestal (coloring it in)
    for (let i = 0; i < 24; i++) {
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 48 + (4 * i));
    }

    gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0); // set the color for M
    gl.uniform1f(scaleFactorLoc, mScaleFactor); // set the M's scaleFactor

    // draw M
    for (let i = 0; i < 20; i++) {
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 144 + (4 * i));
    }

    gl.uniform4f(uColorLoc, 0.5, 0.0, 1.0, 1.0); // set the color for D
    gl.uniform1f(scaleFactorLoc, dScaleFactor); // set the D's scaleFactor

    // draw D
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

    if (showFireworks) { // code for the fireworks animation
        gl.uniform1f(scaleFactorLoc, 1.0); // clears scale factor so it doesn't apply to the fireworks
        gl.uniform3fv(thetaLoc, [0, 0, 0]); // clears rotation angles so they don't apply to fireworks

        gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0); // set the color for the firework rocket

        rocketOffset += 0.02; // increment the firework rocket's offset

        if (rocketOffset < 1.2) { // animation for the firework rocket launching
            gl.uniform4fv(uOffsetLoc, [0.0, rocketOffset, 0.0, 0.0]);
            gl.drawArrays(gl.POINTS, 132, 1);

            gl.uniform4fv(uOffsetLoc, [1.2, rocketOffset, 0.0, 0.0]);
            gl.drawArrays(gl.POINTS, 132, 1);
        } else if (outerExplosionOffset < 0.5) { // animation for the firework explosion
            for (let i = 0; i < 12; i++) { // loop for the firework on the left
                // Inner ring of firework
                gl.uniform4f(uColorLoc, 1.0, 0.65, 0.0, 1.0 - innerExplosionOffset); // set the color of the inner ring of the firework explosion

                // calculate each point's offset
                let xOffset = Math.cos(i*2*Math.PI/12) * innerExplosionOffset;
                let yOffset = Math.sin(i*2*Math.PI/12) * innerExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]); // update offset
                gl.drawArrays(gl.POINTS, 133 + i, 1); // draw the inner ring explosion

                for (let j = 0; j < innerRingOffsets.length; j++) { // draws the "trail" for the inner ring's explosion
                    xOffset = Math.cos(i*2*Math.PI/12) * innerRingOffsets[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * innerRingOffsets[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                // Middle ring of firework
                gl.uniform4f(uColorLoc, 1.0, 1.0, 0.0, 1.0 - middleExplosionOffset); // set the color of the middle ring of the firework explosion
                
                // calculate each point's offset
                xOffset = Math.cos(i*2*Math.PI/12) * middleExplosionOffset;
                yOffset = Math.sin(i*2*Math.PI/12) * middleExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]); // update offset
                gl.drawArrays(gl.POINTS, 133 + i, 1); // draw the middle ring explosion

                for (let j = 0; j < middleRingOffsets.length; j++) { // draws the "trail" for the middle ring's explosion
                    xOffset = Math.cos(i*2*Math.PI/12) * middleRingOffsets[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * middleRingOffsets[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                // Outer ring of firework
                gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0 - outerExplosionOffset); // set the color of the outer ring of the firework explosion

                // calculate each point's offset
                xOffset = Math.cos(i*2*Math.PI/12) * outerExplosionOffset;
                yOffset = Math.sin(i*2*Math.PI/12) * outerExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]); // update offset
                gl.drawArrays(gl.POINTS, 133 + i, 1); // draw the outer ring explosion

                for (let j = 0; j < outerRingOffsets.length; j++) { // draws the "trail" for the outer ring's explosion
                    xOffset = Math.cos(i*2*Math.PI/12) * outerRingOffsets[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * outerRingOffsets[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }
            }

            for (let i = 0; i < 12; i++) { // loop for the firework on the right
                // Inner ring of firework
                gl.uniform4f(uColorLoc, 1.0, 0.65, 0.0, 1.0 - innerExplosionOffset); // set the color of the inner ring of the firework explosion

                // calculate each point's offset
                let xOffset = Math.cos(i*2*Math.PI/12) * innerExplosionOffset;
                let yOffset = Math.sin(i*2*Math.PI/12) * innerExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]); // update offset
                gl.drawArrays(gl.POINTS, 133 + i, 1); // draw the inner ring explosion

                for (let j = 0; j < innerRingOffsets.length; j++) { // draws the "trail" for the inner ring's explosion
                    xOffset = Math.cos(i*2*Math.PI/12) * innerRingOffsets[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * innerRingOffsets[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                // Middle ring of firework
                gl.uniform4f(uColorLoc, 1.0, 1.0, 0.0, 1.0 - middleExplosionOffset); // set the color of the middle ring of the firework explosion
                
                // calculate each point's offset
                xOffset = Math.cos(i*2*Math.PI/12) * middleExplosionOffset;
                yOffset = Math.sin(i*2*Math.PI/12) * middleExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]); // update offset
                gl.drawArrays(gl.POINTS, 133 + i, 1); // draw the middle ring explosion

                for (let j = 0; j < middleRingOffsets.length; j++) { // draws the "trail" for the middle ring's explosion
                    xOffset = Math.cos(i*2*Math.PI/12) * middleRingOffsets[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * middleRingOffsets[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }

                // Outer ring of firework
                gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0 - outerExplosionOffset); // set the color of the outer ring of the firework explosion

                // calculate each point's offset
                xOffset = Math.cos(i*2*Math.PI/12) * outerExplosionOffset;
                yOffset = Math.sin(i*2*Math.PI/12) * outerExplosionOffset;

                gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]); // update offset
                gl.drawArrays(gl.POINTS, 133 + i, 1); // draw the outer ring explosion

                for (let j = 0; j < outerRingOffsets.length; j++) { // draws the "trail" for the outer ring's explosion
                    xOffset = Math.cos(i*2*Math.PI/12) * outerRingOffsets[j];
                    yOffset = Math.sin(i*2*Math.PI/12) * outerRingOffsets[j];

                    gl.uniform4fv(uOffsetLoc, [xOffset + 1.2, yOffset, 0.0, 0.0]);
                    gl.drawArrays(gl.POINTS, 133 + i, 1);
                }
            }

            // the following 2 if statements are used to create the "trail" effect in the fireworks' explosions
            // we keep 5 previous offset values to redraw the points at those offsets (thus creating a "trail" effect)

            if (counter % 4 == 0) { // every 4th frame, save the current offset values for the explosion's points
                innerRingOffsets.push(innerExplosionOffset);
                middleRingOffsets.push(middleExplosionOffset);
                outerRingOffsets.push(outerExplosionOffset);
            }

            if (innerRingOffsets.length > 5) { // removes the oldest offset value to maintain a length of 5
                innerRingOffsets.shift();
                middleRingOffsets.shift();
                outerRingOffsets.shift();
            }

            // increment the offsets
            if (outerExplosionOffset < 0.1) { // faster increase at first (for the explosion)
                innerExplosionOffset += 0.005;
                middleExplosionOffset += 0.010;
                outerExplosionOffset += 0.015;
            } else { // slower increase after
                innerExplosionOffset += 0.002;
                middleExplosionOffset += 0.003;
                outerExplosionOffset += 0.004;
            }
            
            counter += 1;
        } else { // when the fireworks animation is over
            showFireworks = false;
        }
    }

    requestAnimationFrame(render);	// Call to browser to refresh display
}

// function that highlights the button of the currently rotating axis
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

// function that converts from hex colors to rgb colors (needed, as the HTML color input returns a hex value)
function hexToRgb(hex) {
    // hex[0] is '#', so we ignore it

    // convert hex to decimal numbers
    let r = parseInt(hex[1] + hex[2], 16);
    let g = parseInt(hex[3] + hex[4], 16);
    let b = parseInt(hex[5] + hex[6], 16);

    return [r / 255, g / 255, b / 255]; // return normalized RGB value
}

// function that creates the vertices for the pedestal, M, D, and fireworks
function getVertices() {
    let vertices = [ ];

    for (let i = 0; i < 24; i++) { // vertices for top of pedestal
        vertices.push(
            Math.cos(i*2*Math.PI/24) * 0.3, // X
            -0.1001,                        // Y
            Math.sin(i*2*Math.PI/24) * 0.3  // Z
        );
    }

    for (let i = 0; i < 24; i++) { // vertices for bottom of pedestal
        vertices.push(
            Math.cos(i*2*Math.PI/24) * 0.6, // X
            -0.8,                           // Y
            Math.sin(i*2*Math.PI/24) * 0.6  // Z
        );
    }
    
    vertices.push( // vertices for M
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

    vertices.push( // vertices for D
    //     X     Y    Z
        -0.15,  -0.1, 0.05,
        -0.15,   0.3, 0.05,
        -0.075,  0.3, 0.05,
        -0.075, -0.1, 0.05,

        -0.075, -0.025, 0.05,
        -0.075,  0.225, 0.05 
    );

    for (let i = 0; i < 13; i++) { // vertices for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.2 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.2 + 0.1, // Y
            0.05                                   // Z
        );
    }

    for (let i = 0; i < 13; i++) { // vertices for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.125 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.125 + 0.1, // Y
            0.05                                     // Z
        );
    }

    vertices.push( // vertices for D
    //     X     Y    Z
        -0.15,  -0.1, -0.05,
        -0.15,   0.3, -0.05,
        -0.075,  0.3, -0.05,
        -0.075, -0.1, -0.05,

        -0.075, -0.025, -0.05,
        -0.075,  0.225, -0.05
    );

    for (let i = 0; i < 13; i++) { // vertices for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.2 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.2 + 0.1, // Y
            -0.05                                  // Z
        );
    }

    for (let i = 0; i < 13; i++) { // vertices for D
        vertices.push(
            Math.sin(i*2*Math.PI/24) * 0.125 - 0.03, // X
            -Math.cos(i*2*Math.PI/24) * 0.125 + 0.1, // Y
            -0.05                                    // Z
        );
    }

    vertices.push(-0.6, -0.8, 0); // vertices for fireworks
    for (let i = 0; i < 12; i++) {
        vertices.push(
            Math.cos(i*2*Math.PI/12) * 0.125 - 0.6, // X
            Math.sin(i*2*Math.PI/12) * 0.125 + 0.4, // Y
            0                                       // Z
        );
    }

    return vertices;
}

// function that creates the indices for the pedestal, M, and D
function getIndices() {
    //Numbering for vertices:
    //0 - 23 are top of pedestal
    //24 - 47 are bottom of pedestal
    //48 - 67 are M
    //68 - 99 are front of D
    //100 - 131 are back of D
    //132 - 144 are fireworks (these aren't used here)
    let indices = [ ];

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

    // indices for the D
    indices.push(
        // indices for front of D
        68, 69, 70, 71,
        
        74, 87, 75, 88, 
        76, 89, 77, 90, 
        78, 91, 79, 92, 
        80, 93, 81, 94, 
        82, 95, 83, 96, 
        84, 97, 85, 98, 
        86, 99,

        73, 70, 86, 99,
        71, 72, 87, 74,

        // indices for back of D
        100, 101, 102, 103,
        
        106, 119, 107, 120, 
        108, 121, 109, 122, 
        110, 123, 111, 124, 
        112, 125, 113, 126, 
        114, 127, 115, 128, 
        116, 129, 117, 130, 
        118, 131,

        105, 102, 118, 131,
        103, 104, 119, 106,

        // indices for filling in the D
        68, 100, 103, 71,
        68, 69, 101, 100,
        69, 101, 102, 70,
        71, 70, 102, 103,

        70, 102, 118, 86,
        71, 103, 106, 74
    );

    for (let i = 0; i < 12; i++) {
        let start = 74 + i;
        indices.push(
            start, start + 32, start + 33, start + 1
        );

        start = 87 + i;
        indices.push(
            start, start + 32, start + 33, start + 1
        );
    }

    return indices;
}