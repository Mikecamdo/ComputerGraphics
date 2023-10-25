// Utility functions that I created
// TODO should I rename this file??

// code found at: https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
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