"use strict";

var canvas, gl, program;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var modelViewMatrixLoc;

// Variables that keep track of the buttons that are currently being pressed
var eActive = false;
var qActive = false;
var wActive = false;
var sActive = false;
var aActive = false;
var dActive = false;

window.onload = function init() {

    let points = getPoints();

    let colors = getColors();

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    // ? enable backface culling for efficiency(??)
    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.BACK);


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

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    // ! change first value to change how much you can see in the field of view
    projectionMatrix = perspective(70, 1, 0.1, 90);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    canvas.onclick = function() {
        canvas.requestPointerLock();
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "E" || event.key === 'e') {
            eActive = true;
        } else if (event.key === "Q" || event.key === 'q') {
            qActive = true;
        } else if (event.key === "W" || event.key === 'w') { // moving forward 
            wActive = true;
        } else if (event.key === "S" || event.key === 's') { // moving backwards
            sActive = true;
        } else if (event.key === "A" || event.key === 'a') { // moving left
            aActive = true;
        } else if (event.key === "D" || event.key === 'd') { // moving right
            dActive = true;
        }
    });
    
    document.addEventListener("keyup", function (event) {
        if (event.key === "E" || event.key === 'e') {
            eActive = false;
        } else if (event.key === "Q" || event.key === 'q') {
            qActive = false;
        } else if (event.key === "W" || event.key === 'w') { // moving forward 
            wActive = false;
        } else if (event.key === "S" || event.key === 's') { // moving backwards
            sActive = false;
        } else if (event.key === "A" || event.key === 'a') { // moving left
            aActive = false;
        } else if (event.key === "D" || event.key === 'd') { // moving right
            dActive = false;
        }
    });

    document.addEventListener("pointerlockchange", function () {
        if (document.pointerLockElement === canvas) {
          document.addEventListener("mousemove", moveCameraWithMouse);
        } else {
          document.removeEventListener("mousemove", moveCameraWithMouse);
        }
    });

    render();
}

var angles = { //TODO eventually need to change 'angles.y' to use this instead
    x: 0,
    y: 0,
    z: 0
}

var theta = 0, phi = 0;

function moveCameraWithMouse(event) {
    // ! cos(0) = 1, cos(90) = 0

    let tester1 = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
    let xChange =  0.5 * event.movementY;
    let yChange = -0.5 * event.movementX;

    if (angles.x + xChange > 90 || angles.x + xChange < -90) {
        xChange = 0;
    }

    angles.x += xChange;
    angles.y += yChange;

    let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
    backToOrigin = mult(rotateY(-angles.y), backToOrigin);
    let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    backToOriginal = mult(backToOriginal, rotateY(angles.y));

    let finalMatrix = mult(backToOriginal, rotateX(xChange));
    finalMatrix = mult(finalMatrix, rotateY(yChange));
    //finalMatrix = mult(finalMatrix, rotateZ(zChange));
    finalMatrix = mult(finalMatrix, backToOrigin);

    tester1 = mult(finalMatrix, tester1);
    cameraTarget[0] = tester1[0];
    cameraTarget[1] = tester1[1];
    cameraTarget[2] = tester1[2];

    console.log('Angles:', angles);



    // let tester1 = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
    // let changeInAngle = 0.5 * event.movementY;
    // let xChange = Math.cos(radians(angles.y)) * changeInAngle;
    // let yChange = -0.5 * event.movementX;
    // let zChange = Math.cos(radians(angles.y + 90)) * changeInAngle;

    // if (angles.x + xChange > 90 || angles.x + xChange < -90) {
    //     xChange = 0;
    // }

    // if (angles.z + zChange > 90 || angles.z + zChange < -90) {
    //     zChange = 0;
    // }

    // angles.x += xChange;
    // angles.y += yChange;
    // angles.z += zChange;

    // let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
    // let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

    // let finalMatrix = mult(backToOriginal, rotateX(xChange));
    // finalMatrix = mult(finalMatrix, rotateY(yChange));
    // finalMatrix = mult(finalMatrix, rotateZ(zChange));
    // finalMatrix = mult(finalMatrix, backToOrigin);

    // tester1 = mult(finalMatrix, tester1);
    // cameraTarget[0] = tester1[0];
    // cameraTarget[1] = tester1[1];
    // cameraTarget[2] = tester1[2];

    // console.log('Angles:', angles);
}

//----------------------------------------------------------------------------

// vertices are defined from 0-100 for X, Y, and Z axes
// ! z coordinate needs to be negative (flipped)
function getVertices() {
    let vertices = [];

    vertices.push( // vertices for walls of room
        vec4(-30.0, -10.0,  30.0, 1.0), // 0
        vec4(-30.0,  10.0,  30.0, 1.0), // 1
        vec4( 30.0,  10.0,  30.0, 1.0), // 2
        vec4( 30.0, -10.0,  30.0, 1.0), // 3
        vec4(-30.0, -10.0, -30.0, 1.0), // 4
        vec4(-30.0,  10.0, -30.0, 1.0), // 5
        vec4( 30.0,  10.0, -30.0, 1.0), // 6
        vec4( 30.0, -10.0, -30.0, 1.0)  // 7
    );

    return vertices;
}

// ! define points in counter clockwise (??)
function getPoints() {
    let points = [];
    let vertices = getVertices();

    points.push(
        vertices[0], vertices[1], vertices[2], vertices[3],

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

function moveCamera() {
    let walkingSpeed = 0.5;

    if (eActive) {
        let tester1 = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
        angles.y -= 1.5;

        let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
        let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

        let finalMatrix = mult(backToOriginal, rotateY(-1.5));
        finalMatrix = mult(finalMatrix, backToOrigin);

        tester1 = mult(finalMatrix, tester1);
        cameraTarget[0] = tester1[0];
        cameraTarget[1] = tester1[1];
        cameraTarget[2] = tester1[2];
    } 
    if (qActive) {
        let tester2 = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
        angles.y += 1.5;

        let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
        let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

        let finalMatrix = mult(backToOriginal, rotateY(1.5));
        finalMatrix = mult(finalMatrix, backToOrigin);

        tester2 = mult(finalMatrix, tester2);
        cameraTarget[0] = tester2[0];
        cameraTarget[1] = tester2[1];
        cameraTarget[2] = tester2[2];
    } 
    // ! to walk straight, apply same values to both camera and target
    if (wActive) { // moving forward 
        if (cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y)) <= 29.9 &&
            cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y)) >= -29.9) {
            cameraTarget[0] += walkingSpeed * Math.sin(radians(angles.y));
            cameraPosition[0] += walkingSpeed * Math.sin(radians(angles.y));
        }
        
        if (cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y)) <= 29.9 &&
            cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y)) >= -29.9) {
            cameraTarget[2] += walkingSpeed * Math.cos(radians(angles.y));
            cameraPosition[2] += walkingSpeed * Math.cos(radians(angles.y));
        }
    } 
    if (sActive) { // moving backwards
        if (cameraPosition[0] - walkingSpeed * Math.sin(radians(angles.y)) <= 29.9 &&
            cameraPosition[0] - walkingSpeed * Math.sin(radians(angles.y)) >= -29.9) {
            cameraTarget[0] -= walkingSpeed * Math.sin(radians(angles.y));
            cameraPosition[0] -= walkingSpeed * Math.sin(radians(angles.y));
        }
        
        if (cameraPosition[2] - walkingSpeed * Math.cos(radians(angles.y)) <= 29.9 &&
            cameraPosition[2] - walkingSpeed * Math.cos(radians(angles.y)) >= -29.9) {
            cameraTarget[2] -= walkingSpeed * Math.cos(radians(angles.y));
            cameraPosition[2] -= walkingSpeed * Math.cos(radians(angles.y));
        }
    } 
    if (aActive) { // moving left
        if (cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y + 90)) <= 29.9 &&
            cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y + 90)) >= -29.9) {
            cameraTarget[0] += walkingSpeed * Math.sin(radians(angles.y + 90));
            cameraPosition[0] += walkingSpeed * Math.sin(radians(angles.y + 90));
        }
        
        if (cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y + 90)) <= 29.9 &&
            cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y + 90)) >= -29.9) {
            cameraTarget[2] += walkingSpeed * Math.cos(radians(angles.y + 90));
            cameraPosition[2] += walkingSpeed * Math.cos(radians(angles.y + 90));
        }
    }
     if (dActive) { // moving right
        if (cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y - 90)) <= 29.9 &&
            cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y - 90)) >= -29.9) {
            cameraTarget[0] += walkingSpeed * Math.sin(radians(angles.y - 90));
            cameraPosition[0] += walkingSpeed * Math.sin(radians(angles.y - 90));
        }
        
        if (cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y - 90)) <= 29.9 &&
            cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y - 90)) >= -29.9) {
            cameraTarget[2] += walkingSpeed * Math.cos(radians(angles.y - 90));
            cameraPosition[2] += walkingSpeed * Math.cos(radians(angles.y - 90));
        }            
    }
}

//TODO change rotating camera to be based on mouse movement (??) (make controls similiar to minecraft)

function room() {
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

    moveCamera();

    modelViewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    room();

    requestAnimationFrame(render);
}