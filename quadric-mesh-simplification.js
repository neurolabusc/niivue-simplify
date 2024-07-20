/**
 * <kbd>require.mx('mxjs/mesh/quadric-mesh-simplification.js');</kbd>
 * 
 * An adaption of the mesh simplification method from
 * <a href="https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification">https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification</a>
 * 
 * Author Matt Heinsen Egan 2024
 *  This port maintains the MIT license of the C++ source
 * @mXrap
 * @library QuadricMeshSimplification
 * @alpha
 */

/*
function simplifyMesh(mesh) {
  mesh.calculateNormalsCW();

  const simplify = new LibSimplify.Simplify(mesh, {
    PreserveBorders: true,
    PreserveTunnels: true
  });

  simplify.initializeAndUpdateMesh();

  const minMax = [];
  simplify.minMaxError(minMax);

  simplify.simplifyMesh({
    maxIterations: 50,
    aggressiveness: 6
  });

  simplify.compactMesh();
}
*/

import { vec3 } from 'gl-matrix';
import { WrappedInt32Array } from './wrapped_typed_array';

const exports = (function () {
  "use strict";

  var exports = {};

  function max2(a, b) { return a > b ? a : b; }
  function min2(a, b) { return a < b ? a : b; }
  function abs(a) { return a < 0 ? -a : a; }

  var SymmetricMatrix = {};

  SymmetricMatrix.setPlane = function(m, a, b, c, d) {
    m[0] = a*a; m[1] = a*b; m[2] = a*c; m[3] = a*d;
                m[4] = b*b; m[5] = b*c; m[6] = b*d;
                            m[7] = c*c; m[8] = c*d;
                                        m[9] = d*d;
  };

  SymmetricMatrix.det = function(m, a11, a12, a13,
                                    a21, a22, a23,
                                    a31, a32, a33)
  {
    var det = m[a11]*m[a22]*m[a33]
      + m[a13]*m[a21]*m[a32]
      + m[a12]*m[a23]*m[a31] 
      - m[a13]*m[a22]*m[a31]
      - m[a11]*m[a23]*m[a32]
      - m[a12]*m[a21]*m[a33];
    return det;
  };

  SymmetricMatrix.add = function(out, m, moff, n, noff) {
    out[0]=m[0][moff]+n[0][noff]; out[1]=m[1][moff]+n[1][noff]; out[2]=m[2][moff]+n[2][noff]; out[3]=m[3][moff]+n[3][noff];
                                  out[4]=m[4][moff]+n[4][noff]; out[5]=m[5][moff]+n[5][noff]; out[6]=m[6][moff]+n[6][noff];
                                                                out[7]=m[7][moff]+n[7][noff]; out[8]=m[8][moff]+n[8][noff];
                                                                                              out[9]=m[9][moff]+n[9][noff];
  };

  SymmetricMatrix.addLeft = function(m, moff, n, noff) {
    m[0][moff] += n[0][noff]; m[1][moff] += n[1][noff]; m[2][moff] += n[2][noff]; m[3][moff] += n[3][noff];
                            m[4][moff] += n[4][noff]; m[5][moff] += n[5][noff]; m[6][moff] += n[6][noff];
                                                    m[7][moff] += n[7][noff]; m[8][moff] += n[8][noff];
                                                                            m[9][moff] += n[9][noff];
  };

  SymmetricMatrix.addLeftFlat = function(m, moff, n) {
    m[0][moff] += n[0]; m[1][moff] += n[1]; m[2][moff] += n[2]; m[3][moff] += n[3];
                        m[4][moff] += n[4]; m[5][moff] += n[5]; m[6][moff] += n[6];
                                            m[7][moff] += n[7]; m[8][moff] += n[8];
                                                                m[9][moff] += n[9];
  };

  const tempVecA = vec3.create();
  const tempVecB = vec3.create();
  const tempVecC = vec3.create();
  const tempVecD = vec3.create();

  const SIMPLIFY_FLOAT_ARRAY = tempVecA.constructor;

  /**
   * This class is used to acss the simplification algorithm. Here's a simple
   * example of using the simplifier:
   * <pre><code>// mesh is a MeshTA object.
   * // calculate normals (you can skip this if they already exist).
   * mesh.calculateNormalsCW();
   * 
   * // create the Simplify object.
   * const simplify = new LibSimplify.Simplify(mesh, {
   *   PreserveBorders: true,
   *   PreserveTunnels: true
   * });
   *
   * // initialize the simplifier.
   * simplify.initializeAndUpdateMesh();
   *
   * // after initialization, we can check the minimum and maximum error caused
   * // by collapsing any edge (if we want to).
   * const minMax = [];
   * simplify.minMaxError(minMax);
   *
   * // perform the actual simplification. see the documentation for the
   * // simplifyMesh function for more options.
   * simplify.simplifyMesh({
   *   maxIterations: 50,
   *   aggressiveness: 6
   * });
   *
   * // remove deleted triangles and vertices from the MeshTA object.
   * simplify.compactMesh();
   * 
   * // now we can write 'mesh' out to a table, etc.
   * </code></pre>
   * 
   * @class Simplify
   */

  /**
   * Construct a new <code>Simplify</code> object. The following properties are
   * supported in the <code>Settings</code> parameter:
   * <ul>
   *  <li><code>PreserveBorders</code> {Bool} should the simplifier avoid collapsing edges on the border of the mesh?</li>
   *  <li><code>PreserveTunnels</code> {Bool} should the simplifier try to avoid collapsing edges that would result in a tunnel closing (which would cause previously 2-manifold surfaces to become non-manifold)?</li>
   *  <li><code>MaximumEdgeLengthRatio</code> {Number} if present, the simplifier will check the minimum to maximum edge length ratio of triangles that would result from an edge collapse, and avoid the collapse if any triangle's ratio would exceed this value (enabling this check will greatly slow down the simplifier).</li>
   *  <li><code>MinimumInteriorAngleDegrees</code> {Number} if present, the simplifier will check the interior angles of triangles that would result from an edge collapse, and avoid the collapse if any triangle would have an interior angle lower than this value (in degrees).</li>
   * </ul>
   * 
   * @method (constructor)
   * @param {MeshTA} in_Mesh a <code>MeshTA</code> object containing the mesh to simplify.
   * @param {Object} in_Settings an object containing the settings for this simplifier.
   */
  exports.Simplify = function(_Mesh, _Settings) {
    _Settings = _Settings || {};

    this.Mesh = _Mesh;
    this.PreserveBorders = _Settings.PreserveBorders || false;
    this.PreserveTunnels = _Settings.PreserveTunnels || false;

    if ('MinimumInteriorAngleDegrees' in _Settings) {
      const degs = _Settings.MinimumInteriorAngleDegrees;
      if (typeof(degs) !== "number") {
        throw new Error("MinimumInteriorAngleDegrees must be a number");
      }

      const rads = Math.PI * degs / 180.0;
      this.CheckMinimumInteriorAngle = true;
      this.MinimumInteriorAngleCosine = Math.cos(rads);
    }
    else {
      this.CheckMinimumInteriorAngle = false;
      this.MinimumInteriorAngleCosine = -1;
    }

    if ('MaximumEdgeLengthRatio' in _Settings) {
      const ratio = _Settings.MaximumEdgeLengthRatio;
      if (typeof(ratio) !== "number") {
        throw new Error("MaximumEdgeLengthRatio must be a number");
      }

      this.CheckEdgeLengthRatio = true;
      this.MaximumEdgeLengthRatio = ratio;
    }
    else {
      this.CheckEdgeLengthRatio = false;
      this.MaximumEdgeLengthRatio = 0;
    }

    // this.TriErr = new SIMPLIFY_FLOAT_ARRAY(4*this.Mesh.NumTriangles);
    this.TriErr0 = new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumTriangles);
    this.TriErr1 = new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumTriangles);
    this.TriErr2 = new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumTriangles);
    this.TriErr3 = new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumTriangles);
    this.TriErrs = [this.TriErr0, this.TriErr1, this.TriErr2, this.TriErr3];
    this.TriDeleted = new Int8Array(this.Mesh.NumTriangles);
    this.TriDirty = new Int8Array(this.Mesh.NumTriangles);
    this.TriOriginalIndex = new Int32Array(this.Mesh.NumTriangles);

    for (var triangleIndex = 0; triangleIndex < this.Mesh.NumTriangles; ++triangleIndex) {
      this.TriOriginalIndex[triangleIndex] = triangleIndex;
    }

    this.TriEdgeLength = new SIMPLIFY_FLOAT_ARRAY(3*this.Mesh.NumTriangles);

    this.VertTStart = new Int32Array(this.Mesh.NumVertices);
    this.VertTCount = new Int32Array(this.Mesh.NumVertices);
    this.VertBorder = new Int8Array(this.Mesh.NumVertices);
    this.VertSymmetricMatrix = [
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
      new SIMPLIFY_FLOAT_ARRAY(this.Mesh.NumVertices),
    ];

    this.RefsTID = new WrappedInt32Array();
    this.RefsTVertex = new WrappedInt32Array();

    this.RefsTID.reserve(this.Mesh.NumTriangles);
    this.RefsTVertex.reserve(this.Mesh.NumTriangles);

    this.RefsTID.push(-1);
    this.RefsTVertex.push(-1);
  };

  exports.Simplify.prototype.getTriErrOffset = function(i) {
    return 4*i;
  };

  exports.Simplify.prototype.resizeRefs = function(count) {
    if (this.RefsTID.length > count) {
      this.RefsTID.length = count;
      this.RefsTVertex.length = count;
    }
    else {
      for (var i = this.RefsTID.length; i < count; ++i) {
        this.RefsTID.push(-1);
        this.RefsTVertex.push(-1);
      }
    }
  };

  exports.Simplify.prototype.resizeDeleted = function(deleted, count) {
    if (deleted.length < count) {
      if (deleted.data.length < count) {
        var newdata = new Int8Array(count);

        for (var i = 0; i < deleted.length; ++i) {
          newdata = deleted.data[i];
        }

        deleted.data = newdata;
      }

      for (var j = deleted.length; j < count; ++j) {
        deleted.data[j] = 0;
      }
    }

    deleted.length = count;
  };

  exports.Simplify.prototype.distance = function(i0, i1) {
    var v0 = this.Mesh.getVertexPosition(i0);
    var v1 = this.Mesh.getVertexPosition(i1);
    return vec3.distance(v0, v1);
  };

  exports.Simplify.prototype.removeVerticesAndMarkDeletedTriangles = (function() {
    const deleted0 = { data: new Int8Array(100), length: 0 };
    const deleted1 = { data: new Int8Array(100), length: 0 };
    const p = vec3.create();

    const sharedVerts = [];
    const incidentVerts0 = [];
    const incidentVerts1 = [];

    return function(threshold) {
      var deletedTriangles = 0;

      deleted0.length = 0;
      deleted1.length = 0;

      var TriangleVertices = this.Mesh.TriangleVertices;

      for (var i = 0; i < this.Mesh.NumTriangles; ++i) {
        if (this.TriErr3[i] > threshold) continue;
        if (this.TriDeleted[i]) continue;
        if (this.TriDirty[i]) continue;

        var vertOffset = this.Mesh.getTriangleVerticesOffset(i);

        for (var j = 0; j < 3; ++j) {
          if (this.TriErrs[j][i] < threshold) {
            var i0 = TriangleVertices[vertOffset +  j     ];
            var i1 = TriangleVertices[vertOffset + (j+1)%3];

            // Border check
            if (this.PreserveBorders && (this.VertBorder[i0] || this.VertBorder[i1])) {
              continue;
            }
            else if (this.VertBorder[i0] !== this.VertBorder[i1]) {
              continue;
            }

            // Compute vertex to collapse to
            this.calculateError(i0,i1,p);

            this.resizeDeleted(deleted0, this.VertTCount[i0]); // normals temporarily
            this.resizeDeleted(deleted1, this.VertTCount[i1]); // normals temporarily

            sharedVerts.length = 0;
            incidentVerts0.length = 0;
            incidentVerts1.length = 0;

            // dont remove if flipped
            if (this.flipped(p,i0,i1,deleted0,sharedVerts,incidentVerts0)) { continue; }
            if (this.flipped(p,i1,i0,deleted1,sharedVerts,incidentVerts1)) { continue; }

            if (this.PreserveTunnels) {
              sharedVerts.forEach(function(vert) {
                incidentVerts0[vert] = false;
                incidentVerts1[vert] = false;
              });

              var coincidentNonShared =
                Object.keys(incidentVerts0).some(function(vert){
                  if (incidentVerts0[vert] && incidentVerts1[vert]) {
                    return true;
                  }
                });
              
              if (coincidentNonShared) { continue; }
            }

            vec3.copy(this.Mesh.getVertexPosition(i0), p);
            SymmetricMatrix.addLeft(
              this.VertSymmetricMatrix, i0,
              this.VertSymmetricMatrix, i1);

            var tstart = this.RefsTID.length;

            deletedTriangles += this.updateTriangles(i0, i0, deleted0);
            deletedTriangles += this.updateTriangles(i0, i1, deleted1);
            
            var tcount = this.RefsTID.length - tstart;

            this.VertTStart[i0] = tstart;
            this.VertTCount[i0] = tcount;
            break;
          }
        }
      }

      return deletedTriangles;
    };
  })();

  /**
   * Can be called after <code>initializeAndUpdateMesh</code> to determine the
   * minimum and maximum error values associated with edge collapses throughout
   * the mesh. This can be used, for example, to determine what range of
   * thresholds should be iterated over for a threshold function.
   * 
   * @method minMaxError
   * @param {Array} out_minmax receives [min_error, max_error]
   */
  exports.Simplify.prototype.minMaxError = function(out) {
    if (this.TriErr0.length > 0) {
      var min = this.TriErr0[0];
      var max = this.TriErr0[0];

      for (var j = 0; j < this.TriErrs.length; ++j) {
        var triErr = this.TriErrs[j];
        for (var i = 1; i < triErr.length; ++i) {
          min = triErr[i] < min ? triErr[i] : min;
          max = triErr[i] > max ? triErr[i] : max;
        }
      }

      out[0] = min;
      out[1] = max;
    }
  };

  /**
   * Main simplification function. Several iterations are performed to simplify
   * the mesh. Typically, the threshold will increase with each iteration (so
   * that more edges are eligible for collapsing), and the process will cease
   * when a maximum number of iterations is reached, or a target triangle count
   * is reached. Alternatively, one might perform a fixed number of iterations
   * with their own thresholds, without regard to the triangle count achieved.
   * The <code>settings</code> parameter supports the following properties:
   * <ul>
   *  <li><code>breakFn</code> <code>function(triangleCount) -> boolean</code> (optional) a function that receives the current triangle count, and returns true if the simplification process should stop.</li>
   *  <li><code>targetTriangleCount</code> <code>number</code> (optional) stop the simplification process when the triangle count is less than or equal to this number. This is only used if <code>breakFn</code> is not defined.</li>
   *  <li><code>thresholdFn</code> <code>function(iteration) -> threshold</code> (optional) a function that receives the current iteration (number) and returns the threshold to use for this iteration (number). The simplifier will only consider collapsing edges if the error introduced by the edge collapse would be lower than this threshold.</li>
   *  <li><code>aggressivness</code> <code>number</code> (optional) used to determine a threshold for each iteration, if <code>thresholdFn</code> is not provided. 5..8 are reasonable values. If no <code>thresholdFn</code> is provided, and no <code>aggressiveness</code> is defined, then 8 will be used as a default.</li>
   *  <li><code>maxIterations</code> <code>number</code> maximum number of iterations to perform (defaults to 50).</li>
   * </ul>
   * 
   * @method simplifyMesh
   * @param {Object} settings the settings
   */
  exports.Simplify.prototype.simplifyMesh = function(settings) {
    // Determine the early-break function
    if (!settings.breakFn) {
      if (settings.targetTriangleCount) {
        settings.breakFn = function(count) {
          return count <= settings.targetTriangleCount;
        };
      }
      else {
        settings.breakFn = function(count) { return false; };
      }
    }

    var breakFn = settings.breakFn;

    // Determine the threshold function
    if (!settings.thresholdFn) {
      settings.aggressiveness = settings.aggressiveness || 7;
      settings.thresholdFn = function(iteration) {
        return 0.000000001*Math.pow(iteration+3,settings.aggressiveness);
      };
    }

    var thresholdFn = settings.thresholdFn;
    
    // Determine the iteration limit
    var maxIterations = settings.maxIterations || 50;

    var deletedTriangles = 0;
    var deletedTrianglesLastUpdate = 0;
    var triangleCount = this.Mesh.NumTriangles;

    var timeStart = (new Date());

    for (var iteration = 0; iteration < maxIterations; ++iteration) {
      // target number of triangles reached ? Then break
      if (breakFn(triangleCount - deletedTriangles)) {
        break;
      }

      // update mesh once in a while
      if (iteration%5 == 0 && deletedTrianglesLastUpdate < deletedTriangles) {
        deletedTrianglesLastUpdate = deletedTriangles;
        this.updateMesh(iteration);
      }

      // clear dirty flag
      for (var i = 0; i < this.Mesh.NumTriangles; ++i) {
        this.TriDirty[i] = 0;
      }

      // all triangles with edges below the threshold will be removed
      var threshold = thresholdFn(iteration);

      // remove vertices and mark deleted triangles
      deletedTriangles += this.removeVerticesAndMarkDeletedTriangles(threshold);
    }

    var timeEnd = (new Date());
    console.log("time taken = " + ((timeEnd-timeStart)/1000.0) + "s");
  };

  // Check if a triangle flips when this edge is removed 
  exports.Simplify.prototype.flipped = function(p, i0, i1, deleted, sharedVerts, incidentVerts) {
    var tstart = this.VertTStart[i0];

    var d1 = tempVecA;
    var d2 = tempVecB;
    var d3 = tempVecC;
    var n = tempVecD;

    var TriangleVertices = this.Mesh.TriangleVertices;

    for (var k = 0; k < this.VertTCount[i0]; ++k) {
      var tid = this.RefsTID.internal[tstart+k];
      if (this.TriDeleted[tid]) continue;

      var vertOffset = this.Mesh.getTriangleVerticesOffset(tid);
      var s = this.RefsTVertex.internal[tstart+k];
      var id1 = TriangleVertices[vertOffset + (s+1)%3];
      var id2 = TriangleVertices[vertOffset + (s+2)%3];

      // delete triangles that contain the collapsing edge
      if (id1 === i1) {
        if (!sharedVerts.includes(id2)) {
          sharedVerts.push(id2);
        }
        deleted[k] = 1;
        continue;
      }
      else if (id2 === i1) {
        if (!sharedVerts.includes(id1)) {
          sharedVerts.push(id1);
        }
        deleted[k] = 1;
        continue;
      }
      else {
        incidentVerts[id1] = true;
        incidentVerts[id2] = true;
      }

      var id1pos = this.Mesh.getVertexPosition(id1);
      var id2pos = this.Mesh.getVertexPosition(id2);

      vec3.subtract(d1, id1pos, p);
      vec3.subtract(d2, id2pos, p);

      vec3.normalize(d1, d1);
      vec3.normalize(d2, d2);

      var dotd1d2 = vec3.dot(d1,d2);

      if (abs(dotd1d2)>0.999) {
        return true;
      }

      vec3.cross(n,d1,d2);
      vec3.normalize(n,n);
      deleted[k] = 0;

      if (vec3.dot(n, this.Mesh.getTriangleNormal(tid))<0.2) {
        return true;
      }

      // INTERIOR ANGLE
      if (this.CheckMinimumInteriorAngle) {
        // check interior angles of potential new triangle
        if (dotd1d2 > this.MinimumInteriorAngleCosine) {
          return true;
        }
        else {
          vec3.subtract(d3, id2pos, id1pos);
          vec3.normalize(d3, d3);

          if (vec3.dot(d2, d3) > this.MinimumInteriorAngleCosine) {
            return true;
          }
          else {
            vec3.negate(d1, d1);
            if (vec3.dot(d1, d3) > this.MinimumInteriorAngleCosine) {
              return true;
            }
          }
        }
      }

      // EDGE LENGTH
      if (this.CheckEdgeLengthRatio) {
        // check min:max edge length ratio of potential new triangle
        var e0length = vec3.distance(p, id1pos);
        var e1length = this.TriEdgeLength[vertOffset + (s+1)%3];
        var e2length = vec3.distance(id2pos, p);

        var minlength = min2(e0length, min2(e1length, e2length));
        var maxlength = max2(e0length, max2(e1length, e2length));

        if (maxlength > minlength * this.MaximumEdgeLengthRatio) {
          return true;
        }
      }
    }

    return false;
  };

  // Update triangle connections and edge error after a edge is collapsed
  exports.Simplify.prototype.updateTriangles = function(i0, vidx, deleted) {
    var tcount = this.VertTCount[vidx];
    var deletedTriangles = 0;

    var TriangleVertices = this.Mesh.TriangleVertices;

    for (var k = 0; k < tcount; ++k) {
      var tid = this.RefsTID.internal[this.VertTStart[vidx]+k];

      if (this.TriDeleted[tid]) continue;

      if (deleted[k]) {
        this.TriDeleted[tid] = 1;
        deletedTriangles++;
        continue;
      }

      var tvertex = this.RefsTVertex.internal[this.VertTStart[vidx]+k];
      
      var vertOffset = this.Mesh.getTriangleVerticesOffset(tid);
      TriangleVertices[vertOffset+tvertex] = i0;

      this.TriDirty[tid] = 1;
      
      this.TriErr0[tid] = this.calculateError(TriangleVertices[vertOffset+0], TriangleVertices[vertOffset+1], tempVecA);
      this.TriErr1[tid] = this.calculateError(TriangleVertices[vertOffset+1], TriangleVertices[vertOffset+2], tempVecA);
      this.TriErr2[tid] = this.calculateError(TriangleVertices[vertOffset+2], TriangleVertices[vertOffset+0], tempVecA);
      this.TriErr3[tid] =
        min2(this.TriErr0[tid],
             min2(this.TriErr1[tid],
                  this.TriErr2[tid]));

      this.RefsTID.push(tid);
      this.RefsTVertex.push(tvertex);

      // only needed if checking edge length ratio
      if (this.CheckEdgeLengthRatio) {
        // vertex tvertex changed position, so two edge lengths need updating
        this.TriEdgeLength[vertOffset+tvertex] = this.distance(
          i0, TriangleVertices[vertOffset + (tvertex+1)%3]);
        this.TriEdgeLength[vertOffset+(tvertex+2)%3] = this.distance(
          TriangleVertices[vertOffset + (tvertex+2)%3], i0);
      }
    }

    return deletedTriangles;
  };

  // copy triangle information (in Mesh and Simplify) from src to dst
  exports.Simplify.prototype.copyTriangle = function(dst, src) {
    if (dst != src) {
      var TriangleVertices = this.Mesh.TriangleVertices;

      var dstVertOffset = this.Mesh.getTriangleVerticesOffset(dst);
      var srcVertOffset = this.Mesh.getTriangleVerticesOffset(src);

      TriangleVertices[dstVertOffset+0] = TriangleVertices[srcVertOffset+0];
      TriangleVertices[dstVertOffset+1] = TriangleVertices[srcVertOffset+1];
      TriangleVertices[dstVertOffset+2] = TriangleVertices[srcVertOffset+2];

      vec3.copy(this.Mesh.getTriangleNormal(dst), this.Mesh.getTriangleNormal(src));

      this.TriErr0[dst] = this.TriErr0[src];
      this.TriErr1[dst] = this.TriErr1[src];
      this.TriErr2[dst] = this.TriErr2[src];
      this.TriErr3[dst] = this.TriErr3[src];

      var TriEdgeLength = this.TriEdgeLength;
      TriEdgeLength[dstVertOffset+0] = TriEdgeLength[srcVertOffset+0];
      TriEdgeLength[dstVertOffset+1] = TriEdgeLength[srcVertOffset+1];
      TriEdgeLength[dstVertOffset+2] = TriEdgeLength[srcVertOffset+2];

      this.TriDeleted[dst] = this.TriDeleted[src];
      this.TriDirty[dst] = this.TriDirty[src];
      this.TriOriginalIndex[dst] = this.TriOriginalIndex[src];
    }
  };

  exports.Simplify.prototype.compactTriangles = function() {
    var dst = 0;

    for (var i = 0; i < this.Mesh.NumTriangles; ++i) {
      if (!this.TriDeleted[i]) {
        this.copyTriangle(dst++, i);
      }
    }

    this.Mesh.NumTriangles = dst;
  };

  exports.Simplify.prototype.initQuadricsByPlaneAndEdgeErrors = function() {
    var timeNow, timeStart = (new Date());

    var TriangleVertices = this.Mesh.TriangleVertices;

    var i, j; // #let-when-performant

    var planeMatrix = new SIMPLIFY_FLOAT_ARRAY(10);

    for (i = 0; i < this.Mesh.NumTriangles; ++i) {
      var n = this.Mesh.getTriangleNormal(i);
      // don't consider bad triangles
      if (Number.isNaN(n[0])) {
        this.TriDeleted[i] = 1;
        continue;
      }

      var vOffset = this.Mesh.getTriangleVerticesOffset(i);
      var p0 = this.Mesh.getVertexPosition(TriangleVertices[vOffset+0]);

      SymmetricMatrix.setPlane(planeMatrix, n[0], n[1], n[2], -vec3.dot(n, p0));

      for (j = 0; j < 3; ++j) {
        SymmetricMatrix.addLeftFlat(
          this.VertSymmetricMatrix,
          TriangleVertices[vOffset+j],
          planeMatrix);
      }
    }

    timeNow = (new Date());
    console.log("  planes initialized @ " + (timeNow-timeStart)/1000.0 + "s");

    for (i = 0; i < this.Mesh.NumTriangles; ++i) {
      // Calc Edge Error
      const vOffset = this.Mesh.getTriangleVerticesOffset(i);

      for (j = 0; j < 3; ++j) {
        this.TriErrs[j][i] = this.calculateError(
          TriangleVertices[vOffset + j],
          TriangleVertices[vOffset + (j+1)%3],
          tempVecA);
      }

      this.TriErr3[i] =
        min2(this.TriErr0[i],
             min2(this.TriErr1[i],
                  this.TriErr2[i]));
    }

    timeNow = (new Date());
    console.log("  edge error calculated @ " + (timeNow-timeStart)/1000.0 + "s");
  };

  exports.Simplify.prototype.initReferenceIDList = function() {
    var i; // #let-when-performant

    for (i = 0; i < this.Mesh.NumVertices; ++i) {
      this.VertTStart[i] = 0;
      this.VertTCount[i] = 0;
    }

    var TriangleVertices = this.Mesh.TriangleVertices;

    for (i = 0; i < this.Mesh.NumTriangles; ++i) {
      var vOffset = this.Mesh.getTriangleVerticesOffset(i);
      for (var j = 0; j < 3; ++j) {
        this.VertTCount[TriangleVertices[vOffset+j]]++;
      }
    }

    var tstart = 0;

    for (i = 0; i < this.Mesh.NumVertices; ++i) {
      this.VertTStart[i] = tstart;
      tstart += this.VertTCount[i];
      this.VertTCount[i] = 0;
    }
  };

  exports.Simplify.prototype.writeReferences = function() {
    this.resizeRefs(this.Mesh.NumTriangles*3);

    var TriangleVertices =  this.Mesh.TriangleVertices;

    for (var i = 0; i < this.Mesh.NumTriangles; ++i) {
      var vOffset = this.Mesh.getTriangleVerticesOffset(i);
      for (var j = 0; j < 3; ++j) {
        var vert = TriangleVertices[vOffset+j];
        var refIdx = this.VertTStart[vert] + this.VertTCount[vert];
        this.RefsTID.internal[refIdx] = i;
        this.RefsTVertex.internal[refIdx] = j;
        this.VertTCount[vert]++;
      }
    }
  };

  exports.Simplify.prototype.identifyBoundaries = function() {
    var vcount = new Int32Array(this.Mesh.NumVertices);
    var vids = new Int32Array(this.Mesh.NumVertices);
    var vcountlength = 0;
    var vidslength = 0;

    var i, j; // #let-when-performant

    for (i = 0; i < this.Mesh.NumVertices; ++i) {
      this.VertBorder[i] = 0;
    }

    var TriangleVertices = this.Mesh.TriangleVertices;
  
    for (i = 0; i < this.Mesh.NumVertices; ++i) {
      vcountlength = 0;
      vidslength = 0;
      
      var tstart = this.VertTStart[i];

      for (j = 0; j < this.VertTCount[i]; ++j) {
        var tid = this.RefsTID.internal[tstart+j];
        var tvertsOffset = this.Mesh.getTriangleVerticesOffset(tid);

        for (var k = 0; k < 3; ++k) {
          var ofs = 0;
          var id = TriangleVertices[tvertsOffset+k];
          while (ofs < vcountlength) {
            if (vids[ofs]==id) break;
            ofs++;
          }
          if (ofs==vcountlength) {
            vcount[vcountlength++] = 1;
            vids[vidslength++] = id;
          }
          else {
            vcount[ofs]++;
          }
        }
      }
      
      for (j = 0; j < vcountlength; ++j) {
        if (vcount[j] == 1) {
          this.VertBorder[vids[j]] = 1;
        }
      }
    }
  };

  exports.Simplify.prototype.calculateEdgeLengths = function() {
    var TriangleVertices = this.Mesh.TriangleVertices;

    for (var tid = 0; tid < this.Mesh.NumTriangles; ++tid) {
      if (this.TriDeleted[tid]) continue;

      var vertOffset = this.Mesh.getTriangleVerticesOffset(tid);

      for (var edge = 0; edge < 3; ++edge) {
        var v1 = TriangleVertices[vertOffset + (edge)];
        var v2 = TriangleVertices[vertOffset + (edge+1)%3];
        this.TriEdgeLength[vertOffset+edge] = this.distance(v1, v2);
      }
    }
  };

  /**
   * Called once, after the Simplify object is created, but before the
   * simplification process begins, to do initial error calculations.
   * 
   * @method initializeAndUpdateMesh
   */
  exports.Simplify.prototype.initializeAndUpdateMesh = function() {
    //
    // Init Quadrics by Plane & Edge Errors
    //
    // required at the beginning ( iteration == 0 )
    // recomputing during the simplification is not required,
    // but mostly improves the result for closed meshes
    //
    this.initQuadricsByPlaneAndEdgeErrors();
    this.initReferenceIDList();
    this.writeReferences();
    this.identifyBoundaries();

    if (this.CheckEdgeLengthRatio) {
      this.calculateEdgeLengths();
    }
  };

  // compact triangles, compute edge error and build reference list
  exports.Simplify.prototype.updateMesh = function(iteration) {
    console.log("updating mesh @iteration " + iteration);

    this.compactTriangles();

    //
    // Init Quadrics by Plane & Edge Errors
    //
    // required at the beginning ( iteration == 0 )
    // recomputing during the simplification is not required,
    // but mostly improves the result for closed meshes
    //
    // this.initQuadricsByPlaneAndEdgeErrors();
    
    this.initReferenceIDList();
    this.writeReferences();
  };

  /**
   * Called to perform final mesh compacting after the simplification process
   * is complete (i.e. after calling <code>simplifyMesh</code>). This will
   * delete unused triangles and vertices from the associated Mesh object.
   * 
   * @method compactMesh
   */
  exports.Simplify.prototype.compactMesh = function() {
    var TriangleVertices = this.Mesh.TriangleVertices;
    var dst = 0;

    var i, j; // #let-when-performant

    for (i = 0; i < this.Mesh.NumVertices; ++i) {
      this.VertTCount[i] = 0;
    }

    for (i = 0; i < this.Mesh.NumTriangles; ++i) {
      if (!this.TriDeleted[i]) {
        const vertsOffset = this.Mesh.getTriangleVerticesOffset(i);
        for (j = 0; j < 3; ++j) {
          this.VertTCount[TriangleVertices[vertsOffset+j]] = 1;
        }

        this.copyTriangle(dst++, i);
      }
    }

    this.Mesh.NumTriangles = dst;

    if (true) {
      dst = 0;

      // consolidate used vertices. after this, VertTStart[i] will hold the new
      // index for the vertex that was at index i.
      for (i = 0; i < this.Mesh.NumVertices; ++i) {
        if (this.VertTCount[i]) {
          this.VertTStart[i] = dst;
          vec3.copy(this.Mesh.getVertexPosition(dst), this.Mesh.getVertexPosition(i));
          dst++;
        }
      }

      // update the vertex indices in all triangles
      for (i = 0; i < this.Mesh.NumTriangles; ++i) {
        const vertsOffset = this.Mesh.getTriangleVerticesOffset(i);
        for (j = 0; j < 3; ++j) {
          TriangleVertices[vertsOffset+j] = this.VertTStart[TriangleVertices[vertsOffset+j]];
        }
      }

      this.Mesh.NumVertices = dst;
    }
  };

  // Error between vertex and Quadric
  exports.Simplify.prototype.vertexError = function(q, x, y, z) {
    return q[0]*x*x + 2*q[1]*x*y + 2*q[2]*x*z + 2*q[3]*x + q[4]*y*y
      + 2*q[5]*y*z + 2*q[6]*y + q[7]*z*z + 2*q[8]*z + q[9];
  };

  exports.Simplify.prototype.calculateError = (function() {
    const p3 = vec3.create();
    const qMatrix = new SIMPLIFY_FLOAT_ARRAY(10);

    return function(id_v1, id_v2, p_result) {
      // compute interpolated vertex
      SymmetricMatrix.add(qMatrix,
        this.VertSymmetricMatrix, id_v1,
        this.VertSymmetricMatrix, id_v2);
      
      var border = this.VertBorder[id_v1] & this.VertBorder[id_v2];
      var error = 0.0;
      var det = SymmetricMatrix.det(qMatrix, 0, 1, 2, 1, 4, 5, 2, 5, 7);

      if (det != 0 && !border)
      {
        // q_delta is invertible
        p_result[0] = -1/det*(SymmetricMatrix.det(qMatrix, 1, 2, 3, 4, 5, 6, 5, 7, 8)); // vx = A41/det(q_delta) 
        p_result[1] =  1/det*(SymmetricMatrix.det(qMatrix, 0, 2, 3, 1, 5, 6, 2, 7, 8)); // vy = A42/det(q_delta) 
        p_result[2] = -1/det*(SymmetricMatrix.det(qMatrix, 0, 1, 3, 1, 4, 6, 2, 5, 8)); // vz = A43/det(q_delta) 
        error = this.vertexError(qMatrix, p_result[0], p_result[1], p_result[2]);
      }
      else
      {
        // det = 0 -> try to find best result
        var VertexPositions = this.Mesh.VertexPositions;
        var p1offset = this.Mesh.getVertexPositionOffset(id_v1);
        var p2offset = this.Mesh.getVertexPositionOffset(id_v2);

        p3[0] = 0.5 * (VertexPositions[p1offset+0] + VertexPositions[p2offset+0]);
        p3[1] = 0.5 * (VertexPositions[p1offset+1] + VertexPositions[p2offset+1]);
        p3[2] = 0.5 * (VertexPositions[p1offset+2] + VertexPositions[p2offset+2]);

        var error1 = this.vertexError(qMatrix, VertexPositions[p1offset+0], VertexPositions[p1offset+1], VertexPositions[p1offset+2]);
        var error2 = this.vertexError(qMatrix, VertexPositions[p2offset+0], VertexPositions[p2offset+1], VertexPositions[p2offset+2]);
        var error3 = this.vertexError(qMatrix, p3[0], p3[1], p3[2]);

        if (error1 <= error2 && error1 <= error3) {
          error = error1;
          p_result[0] = VertexPositions[p1offset+0];
          p_result[1] = VertexPositions[p1offset+1];
          p_result[2] = VertexPositions[p1offset+2];
        }
        else if (error2 <= error3) {
          error = error2;
          p_result[0] = VertexPositions[p2offset+0];
          p_result[1] = VertexPositions[p2offset+1];
          p_result[2] = VertexPositions[p2offset+2];
        }
        else {
          error = error3;
          vec3.copy(p_result, p3);
        }
      }

      return error;
    };
  })();

  try {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = exports;
    }
  }
  catch (e) {}

  return exports;
})();

const { Simplify } = exports;

export { Simplify };

import { Mesh } from './mesh-ta';

export function simplifyXrap(verts, tris, tri_fraction = 0.5, aggressiveness = 7, verbose = true) {
  const targetCount = Math.ceil((tris.length / 3) * tri_fraction)

  const vertsTA = new Float64Array(verts.length);
  for (let i = 0; i < verts.length; ++i) {
    vertsTA[i] = verts[i];
  }

  const trisTA = new Int32Array(tris.length);
  for (let i = 0; i < tris.length; ++i) {
    trisTA[i] = tris[i];
  }

  const mesh = new Mesh(verts.length / 3, tris.length / 3, vertsTA, trisTA);

  mesh.calculateNormalsCW();

  const simplify = new Simplify(mesh, {
    PreserveBorders: true,
    PreserveTunnels: true
  });

  simplify.initializeAndUpdateMesh();

  const minMax = [];
  simplify.minMaxError(minMax);

  simplify.simplifyMesh({
    maxIterations: 50,
    aggressiveness: aggressiveness,
    targetTriangleCount: targetCount
  });

  simplify.compactMesh();

  const finalVs = mesh.VertexPositions.slice(0, 3 * mesh.NumVertices);
  const finalTs = mesh.TriangleVertices.slice(0, 3 * mesh.NumTriangles);

  return { vertices: finalVs, triangles: finalTs };
}
