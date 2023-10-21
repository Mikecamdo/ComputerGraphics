"use strict";

var canvas, gl, program;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var modelViewMatrixLoc;

var nMatrix, nMatrixLoc;

// Variables that keep track of the buttons that are currently being pressed
var eActive = false;
var qActive = false;
var wActive = false;
var sActive = false;
var aActive = false;
var dActive = false;

var lightPosition = vec4(0.0, 10.0, 0.0, 1.0);
var lightAmbient = vec4(0.05, 0.05, 0.05, 1.0);
var lightDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
var lightSpecular = vec4(0.8, 0.8, 0.8, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4(0.3, 0.3, 0.3, 1.0);
var materialShininess = 0.5;

window.onload = function init() {

    let points = getPoints();

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // ? enable backface culling for efficiency(??)
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);

    // Load shaders and use the resulting shader program
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    // Create and initialize  buffer objects
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    // ! change first value to change how much you can see in the field of view
    projectionMatrix = perspective(70, 1, 0.1, 90);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    gl.uniform4fv( gl.getUniformLocation(program,
        "uAmbientProduct"),flatten(ambientProduct));
     gl.uniform4fv( gl.getUniformLocation(program,
        "uDiffuseProduct"),flatten(diffuseProduct));
     gl.uniform4fv( gl.getUniformLocation(program,
        "uSpecularProduct"),flatten(specularProduct));
     gl.uniform4fv( gl.getUniformLocation(program,
        "lightPosition"),flatten(lightPosition));
     gl.uniform1f( gl.getUniformLocation(program,
        "uShininess"),materialShininess);

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

var angles = {
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
    finalMatrix = mult(finalMatrix, backToOrigin);

    tester1 = mult(finalMatrix, tester1);
    cameraTarget[0] = tester1[0];
    cameraTarget[1] = tester1[1];
    cameraTarget[2] = tester1[2];
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
var normalsArray = []; // TODO clean this code up later!!

function getPoints() {
    let points = [];
    let vertices = getVertices();

    points.push(
        // front wall
        vertices[0], vertices[1], vertices[2], vertices[3],

        // floor
        vertices[0], vertices[3], vertices[7], vertices[4],

        // back wall
        vertices[4], vertices[7], vertices[6], vertices[5],

        // ceiling
        vertices[1], vertices[5], vertices[6], vertices[2],

        // right wall
        vertices[0], vertices[4], vertices[5], vertices[1],

        // left wall
        vertices[3], vertices[2], vertices[6], vertices[7]
    );

    // front wall
    getNormal(0, 2, 1);

    // floor
    getNormal(0, 7, 3);

    // back wall
    getNormal(4, 6, 7);

    // ceiling
    getNormal(1, 2, 6);

    // right wall
    getNormal(0, 5, 4);

    // left wall
    getNormal(3, 7, 6);

    return points;
}

function getNormal(a, b, c) {
    let vertices = getVertices(); // TODO just make this a global variable??

    var t1 = subtract(normalize(vertices[b]), normalize(vertices[a]));
    var t2 = subtract(normalize(vertices[c]), normalize(vertices[a]));
    var normal = cross(t2, t1);
    normal = vec4(normal[0], normal[1], normal[2], 0.0);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
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