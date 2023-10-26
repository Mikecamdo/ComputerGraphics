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

var ambientProduct, diffuseProduct, specularProduct;

var maxXRange = 29.9, minXRange = -29.9;
var maxZRange = 29.9, minZRange = -29.9;
var normalSize = true;

window.onload = function init() {

    let points = getPoints();

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    // ? enable backface culling for efficiency(??)
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);

    // Load shaders and use the resulting shader program
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    //!
    console.log('Begin');
    let testing = parseOBJ(tableObj);
    console.log('End');
    console.log(testing);
    testing = scaleObjectCoordinates(0.1, testing);
    testing = translateObjectCoordinates(0, -10, 0, testing);
    //!

    normalsArray = normalsArray.concat(testing.geometries[0].data.normal);
    normalsArray = normalsArray.concat(testing.geometries[1].data.normal);
    normalsArray = normalsArray.concat(testing.geometries[2].data.normal);

    points = points.concat(testing.geometries[0].data.position);
    points = points.concat(testing.geometries[1].data.position);
    points = points.concat(testing.geometries[2].data.position);

    console.log('Right after adding obj stuff:');
    console.log(normalsArray);

    let tempBefore = points.length;


    //! mesh coordinates:
    for (let i = 0; i < 119; i++) {
        let x1 = -5.95 + i * 0.1;
        let x2 = -5.95 + i * 0.1;
        let x3 = -5.95 + (i + 1) * 0.1;
        let x4 = -5.95 + (i + 1) * 0.1;

        for (let j = 0; j < 59; j++) {
            let z1 = 2.95 - j * 0.1;
            let z2 = 2.95 - (j + 1) * 0.1;
            let z3 = 2.95 - (j + 1) * 0.1;
            let z4 = 2.95 - j * 0.1;

            // let y1 = (5.95 - Math.abs(x1)) * (2.95 - Math.abs(z1)) * Math.abs((3.0 - x1)) * Math.abs((0.5 - z1)) / 23 - 5.999;
            // let y2 = (5.95 - Math.abs(x2)) * (2.95 - Math.abs(z2)) * Math.abs((3.0 - x2)) * Math.abs((0.5 - z2)) / 23 - 5.999;
            // let y3 = (5.95 - Math.abs(x3)) * (2.95 - Math.abs(z3)) * Math.abs((3.0 - x3)) * Math.abs((0.5 - z3)) / 23 - 5.999;
            // let y4 = (5.95 - Math.abs(x4)) * (2.95 - Math.abs(z4)) * Math.abs((3.0 - x4)) * Math.abs((0.5 - z4)) / 23 - 5.999;

            let y1 = (5.95 - Math.abs(x1)) * (2.95 - Math.abs(z1)) * (Math.abs((2.44 - x1)) + Math.abs((0 - z1))) / 23 - 5.999;
            let y2 = (5.95 - Math.abs(x2)) * (2.95 - Math.abs(z2)) * (Math.abs((2.44 - x2)) + Math.abs((0 - z2))) / 23 - 5.999;
            let y3 = (5.95 - Math.abs(x3)) * (2.95 - Math.abs(z3)) * (Math.abs((2.44 - x3)) + Math.abs((0 - z3))) / 23 - 5.999;
            let y4 = (5.95 - Math.abs(x4)) * (2.95 - Math.abs(z4)) * (Math.abs((2.44 - x4)) + Math.abs((0 - z4))) / 23 - 5.999;

            points.push(
                vec4(x1, y1, z1, 1.0),
                vec4(x2, y2, z2, 1.0),
                vec4(x3, y3, z3, 1.0),
                vec4(x4, y4, z4, 1.0)
            );
            
            getNormal2(
                vec4(x1, y1, z1, 1.0),
                vec4(x2, y2, z2, 1.0),
                vec4(x3, y3, z3, 1.0)
            );

            // normalsArray.push( // ! FIXME need to actually calculate normals later
            //     vec4(0.0, 1.0, 0.0, 0.0),
            //     vec4(0.0, 1.0, 0.0, 0.0),
            //     vec4(0.0, 1.0, 0.0, 0.0),
            //     vec4(0.0, 1.0, 0.0, 0.0)
            // );
        }
    }

    let tempAfter = points.length;
    console.log('Change in size:', tempAfter - tempBefore);
    console.log(tempBefore);
    console.log(tempAfter);
    
    console.log('Final points:');
    console.log(points);

    console.log('Final Normals:');
    console.log(normalsArray);
    // -5.9, y, 2.9
    // -5.9, y, 2.7
    // -5.7, y, 2.9
    // -5.7, y, 2.7






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

    document.getElementById("sizeButton").onclick = function () { // ! FIXME temporary??
        normalSize = !normalSize;

        if (normalSize) {
            walkingSpeed = 0.5;
            maxXRange = 29.9;
            minXRange = -29.9;
            maxZRange = 29.9;
            minZRange = -29.9;
            cameraPosition = vec3(0, 0, -20);
            cameraTarget = vec3(0, 0, 10);

            angles = {
                x: 0,
                y: 0,
                z: 0
            }
        } else {
            walkingSpeed = 0.03;
            maxXRange = 5.9;
            minXRange = -5.9;
            maxZRange = 2.9;
            minZRange = -2.9;
            cameraPosition = vec3(-5.9, -5.85, -2.9);
            cameraTarget = vec3(-5.9, -5.85, 10);

            angles = {
                x: 0,
                y: 0,
                z: 0
            }
        }
    };

    render();
}

var angles = {
    x: 0,
    y: 0,
    z: 0
}

var theta = 0, phi = 0;

function moveCameraWithMouse(event) { //TODO clean up code, rename variables to make more sense (don't have "tester1")
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

        // back wall
        vertices[4], vertices[7], vertices[6], vertices[5],

        // floor
        vertices[0], vertices[3], vertices[7], vertices[4],

        // ceiling
        vertices[1], vertices[5], vertices[6], vertices[2],

        // right wall
        vertices[0], vertices[4], vertices[5], vertices[1],

        // left wall
        vertices[3], vertices[2], vertices[6], vertices[7]
    );

    // front wall
    getNormal(0, 2, 1);

    // back wall
    getNormal(4, 6, 7);

    // floor
    getNormal(0, 7, 3);

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

function getNormal2(a, b, c) { // TODO COMBINE BOTH OF THESE!!!
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal[0], normal[1], normal[2], 0.0);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
}

//----------------------------------------------------------------------------

var walkingSpeed = 0.5;
function moveCamera() {
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
        if (cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y)) <= maxXRange &&
            cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y)) >= minXRange) {
            cameraTarget[0] += walkingSpeed * Math.sin(radians(angles.y));
            cameraPosition[0] += walkingSpeed * Math.sin(radians(angles.y));
        }
        
        if (cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y)) <= maxZRange &&
            cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y)) >= minZRange) {
            cameraTarget[2] += walkingSpeed * Math.cos(radians(angles.y));
            cameraPosition[2] += walkingSpeed * Math.cos(radians(angles.y));
        }

        if (!normalSize) {
            cameraPosition[1] = (5.95 - Math.abs(cameraPosition[0])) * (2.95 - Math.abs(cameraPosition[2])) * (Math.abs((2.44 - cameraPosition[0])) + Math.abs((0 - cameraPosition[2]))) / 23 - 5.8;
        }
    } 
    if (sActive) { // moving backwards
        if (cameraPosition[0] - walkingSpeed * Math.sin(radians(angles.y)) <= maxXRange &&
            cameraPosition[0] - walkingSpeed * Math.sin(radians(angles.y)) >= minXRange) {
            cameraTarget[0] -= walkingSpeed * Math.sin(radians(angles.y));
            cameraPosition[0] -= walkingSpeed * Math.sin(radians(angles.y));
        }
        
        if (cameraPosition[2] - walkingSpeed * Math.cos(radians(angles.y)) <= maxZRange &&
            cameraPosition[2] - walkingSpeed * Math.cos(radians(angles.y)) >= minZRange) {
            cameraTarget[2] -= walkingSpeed * Math.cos(radians(angles.y));
            cameraPosition[2] -= walkingSpeed * Math.cos(radians(angles.y));
        }

        if (!normalSize) {
            cameraPosition[1] = (5.95 - Math.abs(cameraPosition[0])) * (2.95 - Math.abs(cameraPosition[2])) * (Math.abs((2.44 - cameraPosition[0])) + Math.abs((0 - cameraPosition[2]))) / 23 - 5.8;
        }
    } 
    if (aActive) { // moving left
        if (cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y + 90)) <= maxXRange &&
            cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y + 90)) >= minXRange) {
            cameraTarget[0] += walkingSpeed * Math.sin(radians(angles.y + 90));
            cameraPosition[0] += walkingSpeed * Math.sin(radians(angles.y + 90));
        }
        
        if (cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y + 90)) <= maxZRange &&
            cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y + 90)) >= minZRange) {
            cameraTarget[2] += walkingSpeed * Math.cos(radians(angles.y + 90));
            cameraPosition[2] += walkingSpeed * Math.cos(radians(angles.y + 90));
        }

        if (!normalSize) {
            cameraPosition[1] = (5.95 - Math.abs(cameraPosition[0])) * (2.95 - Math.abs(cameraPosition[2])) * (Math.abs((2.44 - cameraPosition[0])) + Math.abs((0 - cameraPosition[2]))) / 23 - 5.8;
        }
    }
     if (dActive) { // moving right
        if (cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y - 90)) <= maxXRange &&
            cameraPosition[0] + walkingSpeed * Math.sin(radians(angles.y - 90)) >= minXRange) {
            cameraTarget[0] += walkingSpeed * Math.sin(radians(angles.y - 90));
            cameraPosition[0] += walkingSpeed * Math.sin(radians(angles.y - 90));
        }
        
        if (cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y - 90)) <= maxZRange &&
            cameraPosition[2] + walkingSpeed * Math.cos(radians(angles.y - 90)) >= minZRange) {
            cameraTarget[2] += walkingSpeed * Math.cos(radians(angles.y - 90));
            cameraPosition[2] += walkingSpeed * Math.cos(radians(angles.y - 90));
        }
        
        if (!normalSize) {
            cameraPosition[1] = (5.95 - Math.abs(cameraPosition[0])) * (2.95 - Math.abs(cameraPosition[2])) * (Math.abs((2.44 - cameraPosition[0])) + Math.abs((0 - cameraPosition[2]))) / 23 - 5.8;
        }
    }
}

function room() {
    gl.uniform4fv( gl.getUniformLocation(program,
        "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uDiffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uSpecularProduct"),flatten(specularProduct));
    gl.uniform1f( gl.getUniformLocation(program,
        "uShininess"),materialShininess);

    for (let i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    }
}

//----------------------------------------------------------------------------

// ! change y values of cameraPosition and cameraTarget to make yourself "shrink"
var cameraPosition = vec3(0, 0, -20);
var cameraTarget = vec3(0, 0, 10);
var cameraUp = vec3(0, 1, 0);

// var cameraPosition = vec3(0, -5.8, 0);
// var cameraTarget = vec3(0, -5.8, 10);
// var cameraUp = vec3(0, 1, 0);

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    moveCamera();

    modelViewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    room();
    renderMesh();

    // renderHat();
    renderTable();

    requestAnimationFrame(render);
}

function doHatStuff() {
    var nRows = 50;
    var nColumns = 50;

    // data for radial hat function: sin(Pi*r)/(Pi*r)

    var data = [];
    for(var i = 0; i < nRows; ++i) {
        data.push([]);
        var x = Math.PI*(4*i/nRows-2.0);

        for(var j = 0; j < nColumns; ++j) {
            var y = Math.PI*(4*j/nRows-2.0);
            var r = Math.sqrt(x*x+y*y);

            // take care of 0/0 for r = 0

            data[i][j] = r ? Math.sin(r) / r : 1.0;
        }
    }

    let points = [];
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            points.push( vec4(2*i/nRows-1, data[i][j] - 8, 2*j/nColumns-1, 1.0));
            points.push( vec4(2*(i+1)/nRows-1, data[i+1][j] - 8, 2*j/nColumns-1, 1.0));
            points.push( vec4(2*(i+1)/nRows-1, data[i+1][j+1] - 8, 2*(j+1)/nColumns-1, 1.0));
            points.push( vec4(2*i/nRows-1, data[i][j+1] - 8, 2*(j+1)/nColumns-1, 1.0) );
        }
    }
    return points;
}

function renderHat() {
    for(var i=24; i<9628; i+=4) {
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }
}

// 
function renderTable() {
    //! different material/light stuff came from .mtl file
    // gl.uniform4fv( gl.getUniformLocation(program,
    //     "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uDiffuseProduct"),flatten(vec4(0.4039, 0.4000, 0.3725, 0.0)));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uSpecularProduct"),flatten(vec4(0.2980, 0.2980, 0.2980, 0.0)));
    // gl.uniform1f( gl.getUniformLocation(program,
    //     "uShininess"),materialShininess);

    for (let i = 24; i < 156; i+=3) { // tabletop
        gl.drawArrays(gl.TRIANGLES, i, 3); // TODO do I even need this anymore, since the mesh is rendered directly on top???
    }

    // gl.uniform4fv( gl.getUniformLocation(program,
    //     "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uDiffuseProduct"),flatten(vec4(0.0039, 0.0039, 0.0039, 0.0)));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uSpecularProduct"),flatten(vec4(0.0200, 0.0200, 0.0200, 0.0)));
    // gl.uniform1f( gl.getUniformLocation(program,
    //     "uShininess"),materialShininess);

    for (let i = 156; i < 1332; i+=3) { //metal legs
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    gl.uniform4fv( gl.getUniformLocation(program,
        "uAmbientProduct"),flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uDiffuseProduct"),flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uSpecularProduct"),flatten(vec4(0.3500, 0.3500, 0.3500, 0.0)));
    gl.uniform1f( gl.getUniformLocation(program,
        "uShininess"), 32);

    for (let i = 1332; i < 3276; i+=3) { // wire
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }
}

function renderMesh() {
    for (let i = 3276; i < normalsArray.length; i+=4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }

    gl.uniform4fv( gl.getUniformLocation(program,
        "uAmbientProduct"),flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    gl.uniform4fv( gl.getUniformLocation(program,
        "uDiffuseProduct"),flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    // gl.uniform4fv( gl.getUniformLocation(program,
    //     "uSpecularProduct"),flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    // gl.uniform1f( gl.getUniformLocation(program,
    //     "uShininess"), 0);

    for (let i = 3276; i < normalsArray.length; i+=4) {
        gl.drawArrays(gl.LINE_LOOP, i, 4);
    }


    // gl.drawArrays(gl.TRIANGLE_FAN, 3276, 4);
    // gl.drawArrays(gl.LINE_LOOP,    3276, 4);
}