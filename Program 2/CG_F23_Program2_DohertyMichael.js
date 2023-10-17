"use strict";

var canvas, gl, program;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var modelViewMatrixLoc;

window.onload = function init() {

    let points = getPoints();

    console.log('THE POINTS');
    console.log(points);

    let colors = getColors();

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    let vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    let cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    // document.getElementById("slider1").onchange = function(event) {
    //     theta[0] = event.target.value;
    // };
    // document.getElementById("slider2").onchange = function(event) {
    //      theta[1] = event.target.value;
    // };
    // document.getElementById("slider3").onchange = function(event) {
    //      theta[2] =  event.target.value;
    // };

    let temp = mat4(); // make it temporarily an identity matrix
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i === j) {
                temp[i][j] = 1;
            } else {
                temp[i][j] = 0;
            }
        }
    }

    console.log('TEMP');
    console.log(temp);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp));

    // ! this is how you change the coordinates that you're working with
    // ! currently set to 0-100 for X, Y, and Z axes
    //projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    // ! change first value to change how much you can see in the field of view
    projectionMatrix = perspective(100, 1, 0.1, 50);
    console.log('PROJECTIOJ')
    console.log(projectionMatrix)

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    var currentAngle = 0;

    document.addEventListener("keydown", function (event) {
        if (event.key === "E" || event.key === 'e') {
            let tester1 = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
            currentAngle -= 1;

            let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
            let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

            let finalMatrix = mult(backToOriginal, rotateY(-1));
            finalMatrix = mult(finalMatrix, backToOrigin);

            tester1 = mult(finalMatrix, tester1);
            cameraTarget[0] = tester1[0];
            cameraTarget[1] = tester1[1];
            cameraTarget[2] = tester1[2];

            // currentAngle -= 1;
            // cameraTarget[0] = 10 * Math.sin(radians(currentAngle));
            // cameraTarget[2] = 10 * Math.cos(radians(currentAngle));
        } else if (event.key === "Q" || event.key === 'q') {
            let tester2 = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
            currentAngle += 1;

            let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
            let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

            let finalMatrix = mult(backToOriginal, rotateY(1));
            finalMatrix = mult(finalMatrix, backToOrigin);

            tester2 = mult(finalMatrix, tester2);
            cameraTarget[0] = tester2[0];
            cameraTarget[1] = tester2[1];
            cameraTarget[2] = tester2[2];

            // currentAngle += 1;
            // cameraTarget[0] = 10 * Math.sin(radians(currentAngle));
            // cameraTarget[2] = 10 * Math.cos(radians(currentAngle));
        } else if (event.key === "W" || event.key === 'w') {
            // TODO cos(0) = 1, sin(1) = 0
            // let tester3 = vec4(cameraPosition[0], cameraPosition[1], cameraPosition[2], 1);
            // tester3 = mult(translate(Math.sin(radians(currentAngle)) * -0.1, 0, Math.cos(radians(currentAngle)) * -0.1), tester3);
            // cameraPosition[0] = tester3[0];
            // cameraPosition[1] = tester3[1];
            // cameraPosition[2] = tester3[2];
            
            // ! to walk straight, apply same values to both camera and target
            cameraTarget[0] += 0.1 * Math.sin(radians(currentAngle));
            cameraPosition[0] += 0.1 * Math.sin(radians(currentAngle));

            cameraTarget[2] += 0.1 * Math.cos(radians(currentAngle));
            cameraPosition[2] += 0.1 * Math.cos(radians(currentAngle));
        } else if (event.key === "S" || event.key === 's') {
            // let tester3 = vec4(cameraPosition[0], cameraPosition[1], cameraPosition[2], 1);
            // tester3 = mult(translate(Math.sin(radians(currentAngle)) * 0.1, 0, Math.cos(radians(currentAngle)) * 0.1), tester3);
            // cameraPosition[0] = tester3[0];
            // cameraPosition[1] = tester3[1];
            // cameraPosition[2] = tester3[2];
            cameraTarget[0] -= 0.1 * Math.sin(radians(currentAngle));
            cameraPosition[0] -= 0.1 * Math.sin(radians(currentAngle));

            cameraTarget[2] -= 0.1 * Math.cos(radians(currentAngle));
            cameraPosition[2] -= 0.1 * Math.cos(radians(currentAngle));
        }
        // console.log('Camera Position:');
        // console.log(cameraPosition);
        console.log('Camera Target:');
        console.log(cameraTarget);
    });

    render();
}

//----------------------------------------------------------------------------

// vertices are defined from 0-100 for X, Y, and Z axes
// ! z coordinate needs to be negative (flipped)
function getVertices() {
    let vertices = [];

    vertices.push( // vertices for walls of room
        vec4(-10.0, -10.0,  10.0, 1.0), // 0
        vec4(-10.0,  10.0,  10.0, 1.0), // 1
        vec4( 10.0,  10.0,  10.0, 1.0), // 2
        vec4( 10.0, -10.0,  10.0, 1.0), // 3
        vec4(-10.0, -10.0, -10.0, 1.0), // 4
        vec4(-10.0,  10.0, -10.0, 1.0), // 5
        vec4( 10.0,  10.0, -10.0, 1.0), // 6
        vec4( 10.0, -10.0, -10.0, 1.0)  // 7
    );

    return vertices;
}

// ! define points in counter clockwise (??)
function getPoints() {
    let points = [];
    let vertices = getVertices();

    points.push(
        vertices[0], vertices[3], vertices[2], vertices[1],

        vertices[0], vertices[3], vertices[7], vertices[4],

        vertices[4], vertices[7], vertices[6], vertices[5],

        vertices[1], vertices[2], vertices[6], vertices[5],

        vertices[0], vertices[4], vertices[5], vertices[1],

        vertices[3], vertices[7], vertices[6], vertices[2]
    );

    return points;
}

function getColors() {
    let vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
        vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
    ];

    let colors = [];

    colors.push(
        vertexColors[0], vertexColors[0], vertexColors[0], vertexColors[0],
        vertexColors[1], vertexColors[1], vertexColors[1], vertexColors[1],
        vertexColors[2], vertexColors[2], vertexColors[2], vertexColors[2],
        vertexColors[3], vertexColors[3], vertexColors[3], vertexColors[3],
        vertexColors[4], vertexColors[4], vertexColors[4], vertexColors[4],
        vertexColors[5], vertexColors[5], vertexColors[5], vertexColors[5]
    );

    return colors;
}

//----------------------------------------------------------------------------


function room() {
    // TODO this is wrong!!
    let scaler = scale(2, 2, 2);
    modelViewMatrix = mult(scaler, modelViewMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    for (let i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    }
}

//----------------------------------------------------------------------------

var cameraPosition = vec3(0, 0, 0);
var cameraTarget = vec3(0, 0, 10);
var cameraUp = vec3(0, 1, 0);

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    // modelViewMatrix = translate(0, 0, 30);
    // console.log(modelViewMatrix);
    // gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    modelViewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    room();

    // modelViewMatrix = rotate(theta[Base], vec3(0, 1, 0 ));
    // base();

    // modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], vec3(0, 0, 1 )));
    // lowerArm();

    // modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    // modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], vec3(0, 0, 1)) );

    // upperArm();

    requestAnimationFrame(render);
}