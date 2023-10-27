// This file contains utility functions that I created or adapted from online sources

/*----------------------------------------------------------------------------*/
// Functions for loading in .obj files
// Heavily inspired by code found at: https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];
    
    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
    ];
    
    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
    ];

    const geometries = [];
    let geometry;
    const materialLibs = [];
    let material = 'default';
    let object = 'default';
    let groups = ['default'];


    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
          geometry = undefined;
        }
    }
     
    function setGeometry() {
        if (!geometry) {
          const position = [];
          const texcoord = [];
          const normal = [];
          const color = [];
          webglVertexData = [
            position,
            texcoord,
            normal,
            color,
          ];
          geometry = {
            object,
            groups,
            material,
            data: {
              position,
              texcoord,
              normal,
              color,
            },
          };
          geometries.push(geometry);
        }
    }
    
    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
            // if this is the position index (index 0) and we parsed
            // vertex colors then copy the vertex colors to the webgl vertex color data
            if (i === 0 && objColors.length > 1) {
                geometry.data.color.push(...objColors[index]);
            }
        });
    }

    const noop = () => {};
    
    const keywords = {
        v(parts) {
            // if there are more than 3 values here they are vertex colors
            if (parts.length > 3) {
                objPositions.push(parts.slice(0, 3).map(parseFloat));
                objColors.push(parts.slice(3).map(parseFloat));
            } else {
                objPositions.push(parts.map(parseFloat));
            }
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        mtllib(parts, unparsedArgs) {
            materialLibs.push(unparsedArgs);
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
        s: noop,
        g(parts) {
            groups = parts;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('Unhandled keyword:', keyword, 'at line', lineNo + 1);
            continue;
        }
        handler(parts, unparsedArgs);
    }

    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(([, array]) => array.length > 0));

        let counter = 0;
        let vertexPositions = [];
        let newPositions = [];
        for (const positions of geometry.data.position) {
            counter += 1;
            vertexPositions.push(positions);
            if (counter % 3 === 0) {
                newPositions.push(vec4(vertexPositions[0], vertexPositions[1], vertexPositions[2], 1.0));
                vertexPositions = [];
            }
        }

        counter = 0;
        let normalPositions = [];
        let newNormals = [];
        for (const normals of geometry.data.normal) {
            counter += 1;
            normalPositions.push(normals);
            if (counter % 3 === 0) {
                newNormals.push(vec4(normalPositions[0], normalPositions[1], normalPositions[2], 0.0));
                normalPositions = [];
            }
        }

        geometry.data.position = newPositions;
        geometry.data.normal = newNormals;
    }

    return {
        materialLibs,
        geometries,
    };
}

function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }
    return {min, max};
}

function getGeometriesExtents(geometries) {
    return geometries.reduce(({min, max}, {data}) => {
      const minMax = getExtents(data.position);
      return {
        min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
        max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
      };
    }, {
      min: Array(3).fill(Number.POSITIVE_INFINITY),
      max: Array(3).fill(Number.NEGATIVE_INFINITY),
    });
}

/*----------------------------------------------------------------------------*/
// Functions for applying matrix transformations to .obj models

function scaleObjectCoordinates(scaleFactor, object) {
    let scalingMatrix = mat4(
        scaleFactor, 0, 0, 0,
        0, scaleFactor, 0, 0,
        0, 0, scaleFactor, 0,
        0, 0, 0, 1
    );

    for (const geometry of object.geometries) {
        let scaledPositions = [];
        for (const position of geometry.data.position) {
            scaledPositions.push(mult(scalingMatrix, position));
        }
        geometry.data.position = scaledPositions;
    }

    return object;
}

function translateObjectCoordinates(xTranslate, yTranslate, zTranslate, object) {
    let translationMatrix = mat4(
        1, 0, 0, xTranslate,
        0, 1, 0, yTranslate,
        0, 0, 1, zTranslate,
        0, 0, 0, 1
    );

    for (const geometry of object.geometries) {
        let translatedPositions = [];
        for (const position of geometry.data.position) {
            translatedPositions.push(mult(translationMatrix, position));
        }
        geometry.data.position = translatedPositions;
    }

    return object;
}

/*----------------------------------------------------------------------------*/



// Variables that keep track of the buttons that are currently being pressed
var eActive = false;
var qActive = false;
var wActive = false;
var sActive = false;
var aActive = false;
var dActive = false;

function add3DKeyboardMovement () {
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
}

function add3DMouseMovement() {
    canvas.onclick = function() {
        canvas.requestPointerLock();
    }

    canvas.onmousedown = function(event) {
        if (event.button === 0 && document.pointerLockElement === canvas) {
            let direction = normalize(subtract(cameraTarget, cameraPosition));

            if (normalSize) {
                var alpha = (-cameraPosition[1] - 2.9) / direction[1];
            } else {
                var alpha = (-cameraPosition[1] - 5.9) / direction[1];
            }
            
            let xValue = cameraPosition[0] + alpha * direction[0];
            let zValue = cameraPosition[2] + alpha * direction[2];

            if (xValue >= -7.55 && xValue <= -6.30
             && zValue >= -0.60 && zValue <= 0.60
             && alpha < 7.0 && normalSize) {
                normalSize = false;

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
            } else if (xValue >= -6.28 && xValue <= -6.20
                    && zValue >= -0.06 && zValue <= 0.06
                    && alpha <= 0.7 && !normalSize) {
                    
                normalSize = true;

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
            }
        }
    }
    
    document.addEventListener("pointerlockchange", function () {
        if (document.pointerLockElement === canvas) {
          document.addEventListener("mousemove", moveCameraWithMouse);
        } else {
          document.removeEventListener("mousemove", moveCameraWithMouse);
        }
    });    
}

var angles = {
    x: 0,
    y: 0,
    z: 0
}

function moveCameraWithMouse(event) {
    let targetPosition = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
    let xAxisChange =  0.5 * event.movementY;
    let yAxisChange = -0.5 * event.movementX;

    if (angles.x + xAxisChange >= 90 || angles.x + xAxisChange <= -90 || xAxisChange >= 25) {
        xAxisChange = 0;
    }

    if (yAxisChange >= 100 || yAxisChange <= -100) { // needed, as sometimes the event movements can be super high for no apparent reason
        yAxisChange = 0;
    }

    angles.x += xAxisChange;
    angles.y += yAxisChange;

    let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
    backToOrigin = mult(rotateY(-angles.y), backToOrigin);
    
    let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    backToOriginal = mult(backToOriginal, rotateY(angles.y));

    let finalMatrix = mult(backToOriginal, rotateX(xAxisChange));
    finalMatrix = mult(finalMatrix, rotateY(yAxisChange));
    finalMatrix = mult(finalMatrix, backToOrigin);

    targetPosition = mult(finalMatrix, targetPosition);

    cameraTarget[0] = targetPosition[0];
    cameraTarget[1] = targetPosition[1];
    cameraTarget[2] = targetPosition[2];
}

var walkingSpeed = 0.5;
var normalSize = true;

function moveCamera() {
    if (eActive) {
        let targetPosition = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
        angles.y -= 1.5;

        let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
        let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

        let finalMatrix = mult(backToOriginal, rotateY(-1.5));
        finalMatrix = mult(finalMatrix, backToOrigin);

        targetPosition = mult(finalMatrix, targetPosition);
        cameraTarget[0] = targetPosition[0];
        cameraTarget[1] = targetPosition[1];
        cameraTarget[2] = targetPosition[2];
    }
    if (qActive) {
        let targetPosition = vec4(cameraTarget[0], cameraTarget[1], cameraTarget[2], 1);
        angles.y += 1.5;

        let backToOrigin = translate(-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
        let backToOriginal = translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

        let finalMatrix = mult(backToOriginal, rotateY(1.5));
        finalMatrix = mult(finalMatrix, backToOrigin);

        targetPosition = mult(finalMatrix, targetPosition);
        cameraTarget[0] = targetPosition[0];
        cameraTarget[1] = targetPosition[1];
        cameraTarget[2] = targetPosition[2];
    }

    // to walk straight, apply same values to both camera and target
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