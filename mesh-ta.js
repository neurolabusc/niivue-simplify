/**
 * <kbd>require.mx('mxjs/mesh/mesh-ta.js');</kbd>
 * 
 * This is the MeshTA library. It provides a common representation for
 * triangular meshes, and standard implementations of some operations on meshes.
 * 
 * @library MeshTA
 * @mXrap
 */


/*
// Create a Mesh from a table (without existing normals):

const LibMeshTA = require.mx('mxjs/mesh/mesh-ta.js');
const Mesh = new LibMeshTA.Mesh(
  Vertices,
  Vertices.read_ID,
  Vertices.read_Location,
  Faces.size(),
  function (i) { return Faces.read_V1(i); },
  function (i) { return Faces.read_V2(i); },
  function (i) { return Faces.read_V3(i); });

Mesh.calculateNormalsCCW();
*/


/*
// Create a Mesh from a table (with existing normals):

const LibMeshTA = require.mx('mxjs/mesh/mesh-ta.js');
const Mesh = new LibMeshTA.Mesh(
  Vertices,
  Vertices.read_ID,
  Vertices.read_Location,
  Faces.size(),
  function (i) { return Faces.read_V1(i); },
  function (i) { return Faces.read_V2(i); },
  function (i) { return Faces.read_V3(i); },
  Faces.read_Normal);
*/


/*
// Create an EdgeList for a Mesh (used for some mesh-processing functions)

const EdgeList = new LibMeshTA.EdgeList(Mesh);
*/


/*
// Calculate normals on an existing Mesh:

Mesh.calculateNormalsCW(); // Clockwise winding
Mesh.calculateNormalsCCW(); // Counter-clockwise winding
*/


/*
// Calculate triangle centroids on an existing Mesh:

Mesh.calculateTriangleCentroids();
*/


/*
// Try to make all normals face out on an existing Mesh:

Mesh.calculateNormalsCW();
Mesh.calculateTriangleCentroids();
LibMeshTA.makeNormalsFaceOutwards(Mesh, EdgeList);
*/

import { vec3 } from 'gl-matrix';

const exports = (function () {
  "use strict";

  var exports = {};

  const MESHTA_FLOAT_ARRAY = Float64Array;
  const MESHTA_ID_ARRAY = Int32Array;
  const DIMENSIONS = 3;

  exports.MESHTA_FLOAT_ARRAY = MESHTA_FLOAT_ARRAY;
  exports.MESHTA_ID_ARRAY = MESHTA_ID_ARRAY;

  /**
   * @class Mesh
   * 
   * The meshes are internally stored using TypedArrays. They can never grow in
   * size after their initial allocation. However, they can be shrunk
   * by manipulating the NumTriangles and NumVertices properties.
   * 
   * @member {Number} NumVertices
   * @member {Number} NumTriangles
   * @member {MESHTA_FLOAT_ARRAY} VertexPositions
   * @member {MESHTA_ID_ARRAY} TriangleVertices
   * @member {MESHTA_FLOAT_ARRAY} TriangleNormals
   * @member {MESHTA_FLOAT_ARRAY} TriangleCentroids
   */
  const tempVec3 = new MESHTA_FLOAT_ARRAY(3);
  
  /**
   * Mesh object constructor (use new Mesh(...)).
   * @function Mesh
   * @param {Number} NumVertices number of vertices in the mesh
   * @param {Number} NumTriangles number of triangles in the mesh
   * @param {MESHTA_FLOAT_ARRAY} VertexPositions vertex positions [x1, y1, z1, x2, y2, z2, ...]
   * @param {MESHTA_ID_ARRAY} TriangleVertices triangle vertex IDs [t1v1, t1v2, t1v3, t2v1, t2v2, t2v3, ...]
   * @param {MESHTA_FLOAT_ARRAY} TriangleNormals (optional) triangle normal vectors (same layout as VertexPositions)
   * @param {MESHTA_FLOAT_ARRAY} TriangleCentroids (optional) triangle centroids (same layout as VertexPositions)
   */
  exports.Mesh = function (NumVertices, NumTriangles, VertexPositions,
    TriangleVertices, TriangleNormals, TriangleCentroids, properties)
  {
    if (typeof(NumVertices) !== "number" || typeof(NumTriangles) !== "number") {
      throw new Error("NumVertices and/or NumTriangles parameters are not numbers - are you looking for the oldMeshConstructor function?");
    }

    if (NumVertices * 3 > VertexPositions.length) {
      throw new Error("NumVertices is too large for length of provided VertexPositions");
    }

    if (NumTriangles * 3 > TriangleVertices.length) {
      throw new Error("NumTriangles is too large for length of provided TriangleVertices");
    }

    if (TriangleNormals && NumTriangles * 3 > TriangleNormals.length) {
      throw new Error("NumTriangles is too large for length of provided TriangleNormals");
    }

    if (TriangleCentroids && NumTriangles * 3 > TriangleCentroids.length) {
      throw new Error("NumTriangles is too large for length of provided TriangleCentroids");
    }

    // quick sanity check on the vertex IDs
    for (let i = 0; i < NumTriangles*3; ++i) {
      if (TriangleVertices[i] !== TriangleVertices[i]) {
        throw new Error("Triangle " + Math.ceil(i/3) + " has a NaN vertex index.");
      }

      if (TriangleVertices[i] < 0) {
        throw new Error("Triangle " + Math.ceil(i/3) + " has a negative vertex index.");
      }

      if (TriangleVertices[i] >= NumVertices) {
        throw new Error("Triangle " + Math.ceil(i/3) + " has a too-large vertex index.");
      }
    }

    this.NumVertices = NumVertices;
    this.NumTriangles = NumTriangles;
    this.VertexPositions = VertexPositions;
    this.TriangleVertices = TriangleVertices;

    if (TriangleNormals) {
      this.TriangleNormals = TriangleNormals;
    }
    else {
      this.TriangleNormals = new MESHTA_FLOAT_ARRAY(DIMENSIONS * this.NumTriangles);
      this.TriangleNormals.fill(NaN);
    }

    if (TriangleCentroids) {
      this.TriangleCentroids = TriangleCentroids;
    }
    else {
      this.TriangleCentroids = new MESHTA_FLOAT_ARRAY(DIMENSIONS * this.NumTriangles);
      this.TriangleCentroids.fill(NaN);
    }

    if (properties) {
      if (properties.vertTableByID && 'getIndexForID' in properties.vertTableByID) {
        this.VertTableByID = properties.vertTableByID;
      }
    }
  };

  /**
   * @method getVertexPositionOffset
   * @param {Number} vertIdx
   * @return {Number} offset
   */
  exports.Mesh.prototype.getVertexPositionOffset = function (vertIdx) {
    return DIMENSIONS * vertIdx;
  };

  /**
   * @method getVertexPosition
   * @param {Number} vertIdx
   * @return {SubarrayVec3} position
   */
  exports.Mesh.prototype.getVertexPosition = function (vertIdx) {
    if (vertIdx < 0 || vertIdx >= this.NumVertices) {
      throw new Error("invalid vertex index " + vertIdx);
    }

    var base = DIMENSIONS * vertIdx;

    return new this.VertexPositions.constructor(this.VertexPositions.buffer, this.VertexPositions.BYTES_PER_ELEMENT * base, 3);
  };

  /**
   * @method getTriangleVerticesOffset
   * @param {Number} triangleIdx
   * @return {Number} offset
   */
  exports.Mesh.prototype.getTriangleVerticesOffset = function (triangleIdx) {
    return 3 * triangleIdx;
  };

  /**
   * @method getTriangleVertices
   * @param {Number} triangleIdx
   * @return {SubarrayVec3} vertices
   */
  exports.Mesh.prototype.getTriangleVertices = function (triangleIdx) {
    if (triangleIdx < 0 || triangleIdx >= this.NumTriangles) {
      throw new Error("invalid triangle index " + triangleIdx);
    }

    var base = 3 * triangleIdx;

    return new this.TriangleVertices.constructor(this.TriangleVertices.buffer, this.TriangleVertices.BYTES_PER_ELEMENT * base, 3);
  };

  /**
   * @method getTriangleNormalOffset
   * @param {Number} triangleIdx
   * @return {Number} offset
   */
  exports.Mesh.prototype.getTriangleNormalOffset = function (triangleIdx) {
    return DIMENSIONS * triangleIdx;
  };

  /**
   * @method getTriangleNormal
   * @param {Number} triangleIdx
   * @return {SubarrayVec3} normal
   */
  exports.Mesh.prototype.getTriangleNormal = function (triangleIdx) {
    if (triangleIdx < 0 || triangleIdx >= this.NumTriangles) {
      throw new Error("invalid triangle index " + triangleIdx);
    }

    var base = DIMENSIONS * triangleIdx;

    return new this.TriangleNormals.constructor(this.TriangleNormals.buffer, this.TriangleNormals.BYTES_PER_ELEMENT * base, 3);
  };

  /**
   * Calculates triangle normals (using clockwise winding).
   * 
   * @method calculateNormalsCW
   */
  exports.Mesh.prototype.calculateNormalsCW = function() {
    var normal = vec3.create();
    var ab = vec3.create();
    var ac = vec3.create();

    for (var i = 0; i < this.NumTriangles; ++i) {
      var va = this.TriangleVertices[i*3+0];
      var vb = this.TriangleVertices[i*3+1];
      var vc = this.TriangleVertices[i*3+2];

      ab[0] = this.VertexPositions[vb*3+0] - this.VertexPositions[va*3+0];
      ab[1] = this.VertexPositions[vb*3+1] - this.VertexPositions[va*3+1];
      ab[2] = this.VertexPositions[vb*3+2] - this.VertexPositions[va*3+2];

      ac[0] = this.VertexPositions[vc*3+0] - this.VertexPositions[va*3+0];
      ac[1] = this.VertexPositions[vc*3+1] - this.VertexPositions[va*3+1];
      ac[2] = this.VertexPositions[vc*3+2] - this.VertexPositions[va*3+2];

      vec3.cross(normal, ab, ac);

      if (normal[0] || normal[1] || normal[2]) {
        vec3.normalize(normal, normal);
        this.TriangleNormals[i*3+0] = normal[0];
        this.TriangleNormals[i*3+1] = normal[1];
        this.TriangleNormals[i*3+2] = normal[2];
      }
      else {
        this.TriangleNormals[i*3+0] = NaN;
        this.TriangleNormals[i*3+1] = NaN;
        this.TriangleNormals[i*3+2] = NaN;
      }
    }
  };

  return exports;
})();

const Mesh = exports.Mesh;

export { Mesh };
