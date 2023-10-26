"use strict";

var canvas, gl, program;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var modelViewMatrixLoc;

var lightPosition = vec4(0.0, 10.0, 0.0, 1.0);
var lightAmbient = vec4(0.05, 0.05, 0.05, 1.0);
var lightDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
var lightSpecular = vec4(0.8, 0.8, 0.8, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4(0.3, 0.3, 0.3, 1.0);
var materialShininess = 0.5;

var ambientProduct, diffuseProduct, specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc, shininessLoc;

var maxXRange = 29.9, minXRange = -29.9;
var maxZRange = 29.9, minZRange = -29.9;

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

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix));

    ambientProductLoc = gl.getUniformLocation(program, "uAmbientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "uDiffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
    shininessLoc = gl.getUniformLocation(program, "uShininess");

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(shininessLoc, materialShininess);

    add3DKeyboardMovement();
    add3DMouseMovement();

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
            maxXRange = 5.95;
            minXRange = -5.95;
            maxZRange = 2.95;
            minZRange = -2.95;
            cameraPosition = vec3(-5.95, -5.8, -2.95);
            cameraTarget = vec3(-5.95, -5.8, 10);

            angles = {
                x: 0,
                y: 0,
                z: 0
            }
        }
    };

    render();
}

//----------------------------------------------------------------------------

var vertices = [];

vertices.push( // vertices for walls of room
    vec4(-30.0, -10.0,  30.0, 1.0), // 0
    vec4(-30.0,  10.0,  30.0, 1.0), // 1
    vec4( 30.0,  10.0,  30.0, 1.0), // 2
    vec4( 30.0, -10.0,  30.0, 1.0), // 3
    vec4(-30.0, -10.0, -30.0, 1.0), // 4
    vec4(-30.0,  10.0, -30.0, 1.0), // 5
    vec4( 30.0,  10.0, -30.0, 1.0), // 6
    vec4( 30.0, -10.0, -30.0, 1.0), // 7

    vec4(-6.5, -9.9,  0.5, 1.0), // 8
    vec4(-6.5, -9.9, -0.5, 1.0), // 9
    vec4(-7.5, -9.9,  0.5, 1.0), // 10
    vec4(-7.5, -9.9, -0.5, 1.0), // 11
    vec4(-6.5, -2.9,  0.5, 1.0), // 12
    vec4(-6.5, -2.9, -0.5, 1.0), // 13
    vec4(-7.5, -2.9,  0.5, 1.0), // 14
    vec4(-7.5, -2.9, -0.5, 1.0), // 15
);

var normalsArray = []; // TODO clean this code up later!!

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

    let tableObject = parseOBJ(tableObj);
    tableObject = scaleObjectCoordinates(0.1, tableObject);
    tableObject = translateObjectCoordinates(0, -10, 0, tableObject);

    normalsArray = normalsArray.concat(tableObject.geometries[0].data.normal);
    normalsArray = normalsArray.concat(tableObject.geometries[1].data.normal);

    points = points.concat(tableObject.geometries[0].data.position);
    points = points.concat(tableObject.geometries[1].data.position);

    let buttonObject = parseOBJ(buttonObj);
    console.log('Button object:');
    console.log(buttonObject);

    // buttonObject = scaleObjectCoordinates(0.1, buttonObject);
    buttonObject = translateObjectCoordinates(-7, -2.78, 0, buttonObject);
    normalsArray = normalsArray.concat(buttonObject.geometries[0].data.normal);
    points = points.concat(buttonObject.geometries[0].data.position);

    //! mesh coordinates:
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

    // vec4(6.5, -9.9,  0.25, 1.0), // 8
    // vec4(6.5, -9.9, -0.25, 1.0), // 9
    // vec4(7.0, -9.9,  0.25, 1.0), // 10
    // vec4(7.0, -9.9, -0.25, 1.0), // 11
    // vec4(6.5, -2.9,  0.25, 1.0), // 12
    // vec4(6.5, -2.9, -0.25, 1.0), // 13
    // vec4(7.0, -2.9,  0.25, 1.0), // 14
    // vec4(7.0, -2.9, -0.25, 1.0), // 15
    
    points.push(
        vertices[8], vertices[9], vertices[10], vertices[11],

        vertices[12], vertices[13], vertices[14], vertices[15],

        vertices[14], vertices[10], vertices[8], vertices[12],

        vertices[13], vertices[9], vertices[11], vertices[15],

        vertices[15], vertices[11], vertices[10], vertices[14],

        vertices[12], vertices[8], vertices[9], vertices[13],
    );

    getNormal(8, 9, 10, "1");
    getNormal(12, 13, 14, "1");
    getNormal(14, 10, 8, "1");
    getNormal(13, 9, 11, "1");
    getNormal(15, 11, 10, "1");
    getNormal(12, 8, 9, "1");

    console.log('weeewoo');
    console.log(tableObject);

    console.log('Points:');
    console.log(points);
    console.log(points.length);

    console.log('Normals:');
    console.log(normalsArray);
    console.log(normalsArray.length);

    return points;
}

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
    } else { // type === "2"
        var t1 = subtract(b, a);
        var t2 = subtract(c, a);
        var normal = normalize(cross(t2, t1));
        normal = vec4(normal[0], normal[1], normal[2], 0.0);
    
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);    
    }
}

//----------------------------------------------------------------------------

function room() {
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);

    for (let i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    }
}

//----------------------------------------------------------------------------

// ! change y values of cameraPosition and cameraTarget to make yourself "shrink"
var cameraPosition = vec3(0, 0, -20);
var cameraTarget = vec3(0, 0, 10);
var cameraUp = vec3(0, 1, 0);

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    moveCamera();

    modelViewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    room();

    renderButton();

    renderMesh();

    renderTable();    

    requestAnimationFrame(render);
}

// 
function renderTable() {
    //! different material/light stuff came from .mtl file
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0.4039, 0.4000, 0.3725, 0.0)));
    gl.uniform4fv(specularProductLoc, flatten(vec4(0.2980, 0.2980, 0.2980, 0.0)));

    // tabletop
    gl.drawArrays(gl.TRIANGLES, 24, 132); // TODO do I even need this anymore, since the mesh is rendered directly on top???
    
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0.0039, 0.0039, 0.0039, 0.0)));
    gl.uniform4fv(specularProductLoc, flatten(vec4(0.0200, 0.0200, 0.0200, 0.0)));

    //metal legs
    gl.drawArrays(gl.TRIANGLES, 156, 1176);
}

function renderMesh() {
    gl.drawArrays(gl.TRIANGLE_STRIP, 1878, 6844);

    gl.uniform4fv(ambientProductLoc, flatten(vec4(0.0, 0.0, 0.0, 0.0)));
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0.0, 0.0, 0.0, 0.0)));

    gl.drawArrays(gl.LINE_STRIP, 1878, 6844);
}

function renderButton() {
    gl.drawArrays(gl.TRIANGLES, 1332, 546);

    for (let i = 8722; i < 8746; i+=4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }
}

// articulated motion idea: PERSON ON TABLE 