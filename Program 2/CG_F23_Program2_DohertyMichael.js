"use strict";

var canvas, gl, program;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// variables controlling the lighting in the scene
var lightPosition = vec4(0.0, 10.0, 0.0, 1.0);
var lightAmbient = vec4(0.05, 0.05, 0.05, 1.0);
var lightDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
var lightSpecular = vec4(0.1, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4(0.3, 0.3, 0.3, 1.0);
var materialShininess = 1.0;

var ambientProduct, diffuseProduct, specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc, shininessLoc;

// variables for normal vector transformations
var normalTransform = mat4();
var normalTransformLoc;

// variables for constraining movement within the 3D world
var maxXRange = 29.9, minXRange = -29.9;
var maxZRange = 29.9, minZRange = -29.9;

// variables for the lookAt function
var cameraPosition = vec3(0, 0, -20);
var cameraTarget = vec3(0, 0, 10);
var cameraUp = vec3(0, 1, 0);

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

    // Load shaders and use the resulting shader program
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and initialize buffer objects
    var nBuffer = gl.createBuffer(); // normals buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    let vBuffer = gl.createBuffer(); // vertices buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // get locations of uniform variables
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    ambientProductLoc = gl.getUniformLocation(program, "uAmbientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "uDiffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
    shininessLoc = gl.getUniformLocation(program, "uShininess");
    normalTransformLoc = gl.getUniformLocation(program, "normalTransform");

    // set the projection matrix
    projectionMatrix = perspective(70, 1, 0.1, 90);

    // set normal transform matrix and light position
    gl.uniformMatrix4fv(normalTransformLoc, false, flatten(mat4()));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    // add logic for 3D movement within the world
    add3DKeyboardMovement();
    add3DMouseMovement();

    // begin rendering the scene
    render();
}

//----------------------------------------------------------------------------

var normalsArray = []; // variable for holding normal vectors
var vertices = []; // vertices for objects I've defined

vertices.push( 
    // vertices for walls of room
    vec4(-30.0, -10.0,  30.0, 1.0), // 0
    vec4(-30.0,  10.0,  30.0, 1.0), // 1
    vec4( 30.0,  10.0,  30.0, 1.0), // 2
    vec4( 30.0, -10.0,  30.0, 1.0), // 3
    vec4(-30.0, -10.0, -30.0, 1.0), // 4
    vec4(-30.0,  10.0, -30.0, 1.0), // 5
    vec4( 30.0,  10.0, -30.0, 1.0), // 6
    vec4( 30.0, -10.0, -30.0, 1.0), // 7

    // vertices for big pillar
    vec4(-6.5, -9.9,  0.5, 1.0), // 8
    vec4(-6.5, -9.9, -0.5, 1.0), // 9
    vec4(-7.5, -9.9,  0.5, 1.0), // 10
    vec4(-7.5, -9.9, -0.5, 1.0), // 11
    vec4(-6.5, -2.9,  0.5, 1.0), // 12
    vec4(-6.5, -2.9, -0.5, 1.0), // 13
    vec4(-7.5, -2.9,  0.5, 1.0), // 14
    vec4(-7.5, -2.9, -0.5, 1.0), // 15

    // vertices for little pillar
    vec4(-6.5, -6.1,  0.1, 1.0), // 16
    vec4(-6.5, -6.1, -0.1, 1.0), // 17
    vec4(-6.15, -6.1,  0.1, 1.0), // 18
    vec4(-6.15, -6.1, -0.1, 1.0), // 19
    vec4(-6.5, -5.92,  0.1, 1.0), // 20
    vec4(-6.5, -5.92, -0.1, 1.0), // 21
    vec4(-6.15, -5.92,  0.1, 1.0), // 22
    vec4(-6.15, -5.92, -0.1, 1.0), // 23

    // vertices for Bob (the little person model on the table)
    vec4(5.95, -5.85, 2.95, 1.0), // 24
    vec4(5.95, -5.85, 2.80, 1.0), // 25
    vec4(5.80, -5.85, 2.80, 1.0), // 26
    vec4(5.80, -5.85, 2.95, 1.0), // 27
    vec4(5.875, -5.75, 2.875, 1.0), // 28

    vec4(5.92, -5.85, 2.92, 1.0), // 29
    vec4(5.92, -5.85, 2.83, 1.0), // 30
    vec4(5.83, -5.85, 2.83, 1.0), // 31
    vec4(5.83, -5.85, 2.92, 1.0), // 32

    vec4(5.92, -6.0, 2.92, 1.0), // 33
    vec4(5.92, -6.0, 2.83, 1.0), // 34
    vec4(5.83, -6.0, 2.83, 1.0), // 35
    vec4(5.83, -6.0, 2.92, 1.0), // 36
);

// function for intializing points and normal vectors
function getPoints() {
    let points = [];

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
    getNormal(0, 2, 1, "1");

    // back wall
    getNormal(4, 6, 7, "1");

    // floor
    getNormal(0, 7, 3, "1");

    // ceiling
    getNormal(1, 2, 6, "1");

    // right wall
    getNormal(0, 5, 4, "1");

    // left wall
    getNormal(3, 7, 6, "1");

    // adding the table object
    let tableObject = parseOBJ(tableObj);
    tableObject = scaleObjectCoordinates(0.1, tableObject);
    tableObject = translateObjectCoordinates(0, -10, 0, tableObject);

    normalsArray = normalsArray.concat(tableObject.geometries[0].data.normal);
    normalsArray = normalsArray.concat(tableObject.geometries[1].data.normal);

    points = points.concat(tableObject.geometries[0].data.position);
    points = points.concat(tableObject.geometries[1].data.position);

    // adding the first button object
    let buttonObject = parseOBJ(buttonObj);

    let firstButton = translateObjectCoordinates(-7, -2.78, 0, buttonObject);

    normalsArray = normalsArray.concat(firstButton.geometries[0].data.normal);
    points = points.concat(firstButton.geometries[0].data.position);

    // adding the mesh
    for (let i = 0; i < 59; i++) {
        let x1 = -5.9 + i * 0.2;
        let x2 = -5.9 + i * 0.2;
        let x3 = -5.9 + (i + 1) * 0.2;
        let x4 = -5.9 + (i + 1) * 0.2;

        for (let j = 0; j < 29; j++) {
            let z1 = 2.9 - j * 0.2;
            let z2 = 2.9 - (j + 1) * 0.2;
            let z3 = 2.9 - j * 0.2;
            let z4 = 2.9 - (j + 1) * 0.2;

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
            
            getNormal(
                vec4(x1, y1, z1, 1.0),
                vec4(x2, y2, z2, 1.0),
                vec4(x4, y4, z4, 1.0),
                "2"
            );
        }
    }
    
    // adding the big pillar
    points.push(
        //bottom
        vertices[8], vertices[9], vertices[11], vertices[10],

        //top
        vertices[12], vertices[14], vertices[15], vertices[13],

        //left
        vertices[8], vertices[10], vertices[14], vertices[12],

        //right
        vertices[13], vertices[15], vertices[11], vertices[9],

        //front
        vertices[15], vertices[14], vertices[10], vertices[11],

        //back
        vertices[12], vertices[13], vertices[9], vertices[8],        
    );

    normalsArray.push(
        vec4(0, -1, 0, 0),
        vec4(0, -1, 0, 0),
        vec4(0, -1, 0, 0),
        vec4(0, -1, 0, 0),

        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),

        vec4(0.5, 0.5, 1, 0),
        vec4(0.5, 0.5, 1, 0),
        vec4(0.5, 0.5, 1, 0),
        vec4(0.5, 0.5, 1, 0),

        vec4(0.5, 0.5, -1, 0),
        vec4(0.5, 0.5, -1, 0),
        vec4(0.5, 0.5, -1, 0),
        vec4(0.5, 0.5, -1, 0),

        vec4(-1, 1, 1, 0),
        vec4(-1, 1, 1, 0),
        vec4(-1, 1, 1, 0),
        vec4(-1, 1, 1, 0),

        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0)
    );

    // adding the crosshair
    points.push( // the crosshair
        vec4(0, 0, 0, 1),

        vec4(0.03, 0, 0, 1),
        vec4(0.04, 0, 0, 1),
        vec4(0.05, 0, 0, 1),
        vec4(0.06, 0, 0, 1),

        vec4(-0.03, 0, 0, 1),
        vec4(-0.04, 0, 0, 1),
        vec4(-0.05, 0, 0, 1),
        vec4(-0.06, 0, 0, 1),

        vec4(0, 0.03, 0, 1),
        vec4(0, 0.04, 0, 1),
        vec4(0, 0.05, 0, 1),
        vec4(0, 0.06, 0, 1),

        vec4(0, -0.03, 0, 1),
        vec4(0, -0.04, 0, 1),
        vec4(0, -0.05, 0, 1),
        vec4(0, -0.06, 0, 1),
    );

    for (let i = 0; i < 17; i++) {
        normalsArray.push(vec4(1, 1, 1, 0));
    }

    // adding the second button
    let secondButton = parseOBJ(buttonObj);

    secondButton = scaleObjectCoordinates(0.1, secondButton);
    secondButton = translateObjectCoordinates(-6.25, -5.9, 0, secondButton);

    normalsArray = normalsArray.concat(secondButton.geometries[0].data.normal);
    points = points.concat(secondButton.geometries[0].data.position);

    // adding the small pillar
    points.push(
        //bottom
        vertices[16], vertices[17], vertices[19], vertices[18],

        //top
        vertices[20], vertices[22], vertices[23], vertices[21],

        //left
        vertices[16], vertices[18], vertices[22], vertices[20],

        //right
        vertices[21], vertices[23], vertices[19], vertices[17],

        //front
        vertices[23], vertices[22], vertices[18], vertices[19],

        //back
        vertices[20], vertices[21], vertices[17], vertices[16],
    );

    normalsArray.push(
        vec4(0, -1, 0, 0),
        vec4(0, -1, 0, 0),
        vec4(0, -1, 0, 0),
        vec4(0, -1, 0, 0),

        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),

        vec4(0.5, 0.5, 1, 0),
        vec4(0.5, 0.5, 1, 0),
        vec4(0.5, 0.5, 1, 0),
        vec4(0.5, 0.5, 1, 0),

        vec4(0.5, 0.5, -1, 0),
        vec4(0.5, 0.5, -1, 0),
        vec4(0.5, 0.5, -1, 0),
        vec4(0.5, 0.5, -1, 0),

        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),

        vec4(-1, 1, 1, 0),
        vec4(-1, 1, 1, 0),
        vec4(-1, 1, 1, 0),
        vec4(-1, 1, 1, 0),
    );
    
    // adding Bob
    points.push(
        // Bob's head
        vertices[24], vertices[25], vertices[26], vertices[27],

        vertices[24], vertices[25], vertices[28],
        vertices[25], vertices[26], vertices[28],
        vertices[26], vertices[27], vertices[28],
        vertices[27], vertices[24], vertices[28],

        vec4(5.85, -5.80, 2.833, 1.0), // Bob's eyes
        vec4(5.90, -5.80, 2.833, 1.0),

        vec4(5.855, -5.82, 2.82, 1.0), // Bob's smile
        vec4(5.860, -5.827, 2.815, 1.0),
        vec4(5.875, -5.83, 2.812, 1.0),
        vec4(5.890, -5.827, 2.815, 1.0),
        vec4(5.895, -5.82, 2.82, 1.0),

        // Bob's body
        vertices[29], vertices[30], vertices[31], vertices[32],
        vertices[33], vertices[34], vertices[35], vertices[36],

        vertices[29], vertices[30], vertices[34], vertices[33],
        vertices[31], vertices[32], vertices[36], vertices[35],

        vertices[30], vertices[31], vertices[35], vertices[34],
        vertices[29], vertices[32], vertices[36], vertices[33]
    );

    // Bob's head
    getNormal(24, 25, 26, "1");
    getNormal(24, 28, 25, "3");
    getNormal(25, 28, 26, "3");
    getNormal(26, 28, 27, "3");
    getNormal(27, 28, 24, "3");

    normalsArray.push(
        vec4(1, 1, 1, 0), // Bob's eyes
        vec4(1, 1, 1, 0),

        vec4(1, 1, 1, 0), // Bob's smile
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),
        vec4(1, 1, 1, 0),

        // Bob's body
        vec4(0, 1, 0, 0), vec4(0, 1, 0, 0), vec4(0, 1, 0, 0), vec4(0, 1, 0, 0),
        vec4(0, -1, 0, 0), vec4(0, -1, 0, 0), vec4(0, -1, 0, 0), vec4(0, -1, 0, 0),

        vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0),
        vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0),

        vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0),
        vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0), vec4(1, 1.75, 1, 0),
    );

    return points;
}

// function for calculating the normal in various ways
function getNormal(a, b, c, type) {
    if (type === "1") {
        var t1 = subtract(normalize(vertices[b]), normalize(vertices[a]));
        var t2 = subtract(normalize(vertices[c]), normalize(vertices[a]));
        var normal = cross(t2, t1);
        normal = vec4(normal[0], normal[1], normal[2], 0.0);
    
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    } else if (type === "2") {
        var t1 = subtract(b, a);
        var t2 = subtract(c, a);
        var normal = normalize(cross(t2, t1));
        normal = vec4(normal[0], normal[1], normal[2], 0.0);
    
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);    
    } else if (type === "3") {
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[a]);
        var normal = normalize(cross(t2, t1));
        normal = vec4(normal[0], normal[1], normal[2], 0.0);
    
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    }
}

//----------------------------------------------------------------------------

function renderRoom() {
    materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
    materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
    materialShininess = 1.1;

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);

    for (let i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    }
}

function renderTable() {
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0.4039, 0.4000, 0.3725, 0.0)));
    gl.uniform4fv(specularProductLoc, flatten(vec4(0.2980, 0.2980, 0.2980, 0.0)));

    // tabletop
    gl.drawArrays(gl.TRIANGLES, 24, 132);
    
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0.0039, 0.0039, 0.0039, 0.0)));
    gl.uniform4fv(specularProductLoc, flatten(vec4(0.0200, 0.0200, 0.0200, 0.0)));

    //metal legs
    gl.drawArrays(gl.TRIANGLES, 156, 1176);
}

function renderMesh() {
    materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
    materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
    materialShininess = 1.1;


    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);


    gl.drawArrays(gl.TRIANGLE_STRIP, 1878, 6844);

    gl.uniform4fv(ambientProductLoc, flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0.0, 0.0, 0.0, 0.0)));

    gl.drawArrays(gl.LINE_STRIP, 1878, 6844);
}

function renderButton() {
    materialAmbient = vec4(0.0, 1.0, 0.0, 1.0);
    materialDiffuse = vec4(0.0, 1.0, 0.0, 1.0);
    materialSpecular = vec4(0.2, 1.0, 0.6, 1.0);
    materialShininess = 1.0;

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);

    gl.drawArrays(gl.TRIANGLES, 1332, 444);
    gl.drawArrays(gl.TRIANGLES, 8763, 444);

    materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    materialDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
    materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
    materialShininess = 1.0;

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);

    gl.drawArrays(gl.TRIANGLES, 1734 + 42, 102);
    gl.drawArrays(gl.TRIANGLES, 8763 + 444, 102);


    for (let i = 8722; i < 8746; i+=4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }


    for (let i = 9309; i < 9333; i+=4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }
}

function renderCrosshair() {
    gl.uniform4fv(ambientProductLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));

    gl.drawArrays(gl.POINTS, 8746, 17);
}

// holds Bob's current offset
var bobPositionOffset = {
    x: -5.83,
    y: 0,
    z: -2.83
}

// holds Bob's original coordinates
var bobPositionOriginal = {
    x: 5.83,
    y: -6.0,
    z: 2.83
}

// holds Bob's rotation angles
var bobHeadRotation = {
    x: 0,
    y: 0
}

// variables for randomly generated rotation angles that Bob slowly turns his head with
var xRotationTarget = 0;
var yRotationTarget = 0;

var moving = false; // if Bob is moving around on the table
var changeStateProbability = 1.0; // decreasing variable that controls when Bob starts and stops moving

// Bob's movement speed
var xSpeed = 0;
var zSpeed = 0;

function renderBob() {
    let xPosition = bobPositionOriginal.x + bobPositionOffset.x;
    let zPosition = bobPositionOriginal.z + bobPositionOffset.z;

    // calculate Bob's y position based on mesh heightfield function
    bobPositionOffset.y = (5.95 - Math.abs(xPosition)) * (2.95 - Math.abs(zPosition)) * (Math.abs((2.44 - xPosition)) + Math.abs((0 - zPosition))) / 23;

    if (moving) { // if Bob is moving
        let newXPosition = xPosition + (0.005 * xSpeed);
        let newZPosition = zPosition + (0.005 * zSpeed);
        
        if (newXPosition <= 5.86 && newXPosition >= -5.95) { // set boundaries so Bob stays on table
            bobPositionOffset.x += 0.005 * xSpeed;
        } else { // when Bob hits border, reverse direction
            xSpeed *= -1;
        }

        if (newZPosition <= 2.86 && newZPosition >= -2.95) { // set boundaries so Bob stays on table
            bobPositionOffset.z += 0.005 * zSpeed;
        } else { // when Bob hits border, reverse direction
            zSpeed *= -1;
        }
    }

    if (Math.random() > 0.99) { // random chance to start rotating head
        let type = Math.random();
        if (type > 0.66) { // rotate only Y axis
            yRotationTarget += (Math.random() * 2 - 1) * 60;
        } else if (type > 0.33) { // rotate only X axis
            let additionalRotation = (Math.random() * 2 - 1) * 45;
            if (xRotationTarget + additionalRotation < 90 &&
                xRotationTarget + additionalRotation > -90) {
                    xRotationTarget += additionalRotation;
            }
        } else { // rotate both X and Y axis
            let additionalRotation = (Math.random() * 2 - 1) * 45;
            if (xRotationTarget + additionalRotation < 90 &&
                xRotationTarget + additionalRotation > -90) {
                    xRotationTarget += additionalRotation;
            }
            yRotationTarget += (Math.random() * 2 - 1) * 60;
        }
    }

    let xRotationDifference = bobHeadRotation.x - xRotationTarget;
    let yRotationDifference = bobHeadRotation.y - yRotationTarget;

    // rotate Bob's head based on randomly generated angles
    if (Math.abs(xRotationDifference) >= 0.5) {
        if (bobHeadRotation.x > xRotationTarget) {
            bobHeadRotation.x -= 0.5;
        } else {
            bobHeadRotation.x += 0.5;
        }
    }

    if (Math.abs(yRotationDifference) >= 0.5) {
        if (bobHeadRotation.y > yRotationTarget) {
            bobHeadRotation.y -= 0.5;
        } else {
            bobHeadRotation.y += 0.5;
        }
    }

    // set normal transform matrix (for changing normals on Bob's head when it rotates)
    gl.uniformMatrix4fv(normalTransformLoc, false, flatten(rotateY(bobHeadRotation.y)));

    // set matrices so Bob's head rotates properly
    let headViewMatrix = translate(-5.875, 5.85, -2.875);
    headViewMatrix = mult(rotateX(bobHeadRotation.x), headViewMatrix);
    headViewMatrix = mult(rotateY(bobHeadRotation.y), headViewMatrix);
    headViewMatrix = mult(translate(5.875 + bobPositionOffset.x, -5.85 + bobPositionOffset.y, 2.875 + bobPositionOffset.z), headViewMatrix);
    headViewMatrix = mult(modelViewMatrix, headViewMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(headViewMatrix));

    gl.drawArrays(gl.POINTS, 9349, 7); // draw Bob's eyes and smile
    
    // set colors for Bob
    materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    materialDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
    materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
    materialShininess = 0.3;

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambientProductLoc, flatten(vec4(.961/2, .961/2, .863/2, 1.0)));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);

    // draw Bob's head
    gl.drawArrays(gl.TRIANGLE_FAN, 9333, 4);
    gl.drawArrays(gl.TRIANGLES, 9337, 12);    

    // set matrices for Bob's body
    modelViewMatrix = mult(modelViewMatrix, translate(bobPositionOffset.x, bobPositionOffset.y, bobPositionOffset.z));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(normalTransformLoc, false, flatten(mat4()));

    // draw Bob's body
    for (let i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 9356 + (i * 4), 4);
    }

    if (Math.random() > changeStateProbability) { // change from moving to standing still, and vice-versa
        moving = !moving;

        if (moving) { // get new speeds every time movement starts again
            xSpeed = Math.random();
            zSpeed = Math.random();

            if (Math.random() < 0.5) { // random chance to go in negative direction
                xSpeed *= -1;
            }

            if (Math.random() < 0.5) { // random chance to go in positive direction
                zSpeed *= -1;
            }
        }

        changeStateProbability = 1.0; // reset the probability
    } else {
        changeStateProbability -= 0.00001;
    }
}

//----------------------------------------------------------------------------

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    moveCamera();

    // set matrices for drawing persistent crosshair on the screen
    gl.uniformMatrix4fv(projectionMatrixLoc,  false, flatten(ortho(-1, 1, -1, 1, -1, 1)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mat4()));
    
    renderCrosshair();

    // set matrices for 3D objects in the scene
    gl.uniformMatrix4fv(projectionMatrixLoc,  false, flatten(projectionMatrix));
    modelViewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    renderRoom();

    renderButton();

    renderMesh();

    renderTable();    

    renderBob();

    requestAnimationFrame(render);
}