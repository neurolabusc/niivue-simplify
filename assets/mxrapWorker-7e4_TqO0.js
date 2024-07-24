var Q=(a,c)=>()=>(c||a((c={exports:{}}).exports,c),c.exports);var ee=Q((te,D)=>{var H=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var a=0,c=arguments.length;c--;)a+=arguments[c]*arguments[c];return Math.sqrt(a)});function d(){var a=new H(3);return H!=Float32Array&&(a[0]=0,a[1]=0,a[2]=0),a}function L(a,c){return a[0]=c[0],a[1]=c[1],a[2]=c[2],a}function B(a,c,m){return a[0]=c[0]-m[0],a[1]=c[1]-m[1],a[2]=c[2]-m[2],a}function b(a,c){var m=c[0]-a[0],V=c[1]-a[1],u=c[2]-a[2];return Math.hypot(m,V,u)}function X(a,c){return a[0]=-c[0],a[1]=-c[1],a[2]=-c[2],a}function S(a,c){var m=c[0],V=c[1],u=c[2],g=m*m+V*V+u*u;return g>0&&(g=1/Math.sqrt(g)),a[0]=c[0]*g,a[1]=c[1]*g,a[2]=c[2]*g,a}function x(a,c){return a[0]*c[0]+a[1]*c[1]+a[2]*c[2]}function W(a,c,m){var V=c[0],u=c[1],g=c[2],N=m[0],v=m[1],E=m[2];return a[0]=u*E-g*v,a[1]=g*N-V*E,a[2]=V*v-u*N,a}(function(){var a=d();return function(c,m,V,u,g,N){var v,E;for(m||(m=3),V||(V=0),u?E=Math.min(u*m+V,c.length):E=c.length,v=V;v<E;v+=m)a[0]=c[v],a[1]=c[v+1],a[2]=c[v+2],g(a,a,N),c[v]=a[0],c[v+1]=a[1],c[v+2]=a[2];return c}})();const Z=function(){const a={};function u(e,r){return e>r?e:r}function g(e,r){return e<r?e:r}a.TAHelp={},a.TAHelp.slice=function(e,r,t){r=r||0,t=t||e.length,r=r<0?u(r+e.length,0):r,t=t<0?u(t+e.length,0):t;for(var i=new e.constructor(t-r),h=0;h<i.length;++h)i[h]=e[r+h];return i};function N(e){throw new Error(e)}function v(e,r){var t=new e._ctor(r);(!t||typeof t.length>"u")&&N("Couldn't allocate space for "+r+" elements.");var i=e._internal,h=g(e._length,r);e._length=h;for(var T=0;T<h;++T)t[T]=i[T];e._internal=t}function E(e){const t=1073741824/new e(1).BYTES_PER_ELEMENT-1,i=function(s){s=s||0,this._ctor=e,this._length=s,this._internal=new e(u(s,8)),this.TypedArray=e},h=[];function T(s){const n=function(l,o){this._wrappedArray=l,this._begin=o};for(let l=0;l<s;++l){const o=l;n.prototype.__defineGetter__(o,function(){return this._wrappedArray._internal[this._begin+o]}),n.prototype.__defineSetter__(o,function(f){this._wrappedArray._internal[this._begin+o]=f})}return n.prototype.__defineGetter__("length",function(){return s}),n}function p(s,n,l){if(l>10)throw new Error("length '"+l+"' exceeds small_subarray limit.");var o=h[l];return o||(o=h[l]=T(l)),new o(s,n)}return i.prototype.indexOf=function(s,n){typeof n!="number"&&(n=0);var l=this.internal,o=this.length,f;if(n<0&&(n=u(0,n+o)),s===s){for(f=n;f<o;++f)if(l[f]===s)return f}else for(f=n;f<o;++f)if(l[f]!==l[f])return f;return-1},i.prototype.push=function(s){if(this._length===this._internal.length)if(this._internal.length<t){var n=2*this._internal.length;n>t&&(n=t),v(this,n)}else N("WrappedTypedArray already at maximum length "+t);this._internal[this._length]=s,this._length++},i.prototype.toTypedArray=function(){for(var s=this.length,n=this.internal,l=new this.TypedArray(s),o=0;o<s;++o)l[o]=n[o];return l},Object.defineProperties(i.prototype,{_expand_if_needed:{value:function(s){const n=this._length+s;if(n<=t){if(n>this._internal.length){for(var l=2*this._internal.length||8;n>l;)l=2*l;l>t&&(l=t),v(this,l)}}else N("new length "+n+" exceeds maximum element count "+t)}},length:{enumerable:!0,get:function(){return this._length},set:function(s){if(s>this._length)s>this._internal.length&&(s<=t?v(this,s):N("new length "+s+" exceeds maximum element count "+t));else if(s<this._length)for(var n=s;n<this._length;++n)this._internal[n]=0;this._length=s}},copyWithin:{value:function(s,n,l){const o=this.length,f=this.internal;typeof n!="number"&&(n=0),typeof l!="number"&&(l=o),s<0?s=u(0,s+o):s=g(s,o),n<0?n=u(0,n+o):n=g(n,o),l<0?l=u(0,l+o):l=g(l,o);const M=l-n;if(s<n)for(let A=0;A<M;++A)f[s+A]=f[n+A];else if(s>n){const R=g(s+M,this.length)-s;for(let _=R-1;_>=0;--_)f[s+_]=f[n+_]}}},every:{value:function(s,n){for(var l=this.internal,o=0;o<this.length;++o)if(!s.call(n,l[o],o,this))return!1;return!0}},join:{value:function(s){var n=this.length,l=this.internal;s=s||",";var o="";if(n){o+=l[0];for(var f=1;f<n;++f)o+=s+l[f]}return o}},pop:{enumerable:!0,value:function(){if(this._length>0)return this._internal[--this._length]}},reverse:{enumerable:!0,value:function(){for(var s=this.length,n=this.internal,l=0;l<s/2;++l){var o=n[s-l-1];n[s-l-1]=n[l],n[l]=o}}},slice:{enumerable:!0,value:function(s,n){s=s||0,n=n||this._length,s=s<0?u(this._length+s,0):s,n=n<0?u(this._length+n,0):n;for(var l=new i(n-s),o=0;o<l._internal.length;++o)l._internal[o]=this._internal[s+o];return l}},some:{enumerable:!0,value:function(s,n){for(var l=this.internal,o=0;o<this.length;++o)if(s.call(n,l[o],o,this))return!0;return!1}},internal:{enumerable:!0,get:function(){return this._internal}},get:{enumerable:!0,value:function(s){return this._internal[s]}},set:{enumerable:!0,value:function(s,n){this._internal[s]=n}},reserve:{enumerable:!0,value:function(s){s>this._internal.length&&(s<=t?v(this,s):N("reserving "+s+" elements exceeds maximum element count "+t))}},push_array:{enumerable:!0,value:function(s){this._expand_if_needed(s.length);for(var n=0;n<s.length;++n)this._internal[this._length+n]=s[n];this._length+=s.length}},smallsubarray:{enumerable:!0,value:function(s,n){return n=typeof n=="number"?n:this._length,p(this,s,n-s)}}}),i}const y={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};for(let e in y)a["Wrapped"+e]=E(y[e]);try{typeof D<"u"&&D.exports&&(D.exports=a)}catch{}return a}(),{WrappedInt32Array:O}=Z,$=function(){var a={};const c=Float64Array,m=Int32Array,V=3;return a.MESHTA_FLOAT_ARRAY=c,a.MESHTA_ID_ARRAY=m,a.Mesh=function(u,g,N,v,E,y,e){if(typeof u!="number"||typeof g!="number")throw new Error("NumVertices and/or NumTriangles parameters are not numbers - are you looking for the oldMeshConstructor function?");if(u*3>N.length)throw new Error("NumVertices is too large for length of provided VertexPositions");if(g*3>v.length)throw new Error("NumTriangles is too large for length of provided TriangleVertices");if(E&&g*3>E.length)throw new Error("NumTriangles is too large for length of provided TriangleNormals");if(y&&g*3>y.length)throw new Error("NumTriangles is too large for length of provided TriangleCentroids");for(let r=0;r<g*3;++r){if(v[r]!==v[r])throw new Error("Triangle "+Math.ceil(r/3)+" has a NaN vertex index.");if(v[r]<0)throw new Error("Triangle "+Math.ceil(r/3)+" has a negative vertex index.");if(v[r]>=u)throw new Error("Triangle "+Math.ceil(r/3)+" has a too-large vertex index.")}this.NumVertices=u,this.NumTriangles=g,this.VertexPositions=N,this.TriangleVertices=v,E?this.TriangleNormals=E:(this.TriangleNormals=new c(V*this.NumTriangles),this.TriangleNormals.fill(NaN)),y?this.TriangleCentroids=y:(this.TriangleCentroids=new c(V*this.NumTriangles),this.TriangleCentroids.fill(NaN)),e&&e.vertTableByID&&"getIndexForID"in e.vertTableByID&&(this.VertTableByID=e.vertTableByID)},a.Mesh.prototype.getVertexPositionOffset=function(u){return V*u},a.Mesh.prototype.getVertexPosition=function(u){if(u<0||u>=this.NumVertices)throw new Error("invalid vertex index "+u);var g=V*u;return new this.VertexPositions.constructor(this.VertexPositions.buffer,this.VertexPositions.BYTES_PER_ELEMENT*g,3)},a.Mesh.prototype.getTriangleVerticesOffset=function(u){return 3*u},a.Mesh.prototype.getTriangleVertices=function(u){if(u<0||u>=this.NumTriangles)throw new Error("invalid triangle index "+u);var g=3*u;return new this.TriangleVertices.constructor(this.TriangleVertices.buffer,this.TriangleVertices.BYTES_PER_ELEMENT*g,3)},a.Mesh.prototype.getTriangleNormalOffset=function(u){return V*u},a.Mesh.prototype.getTriangleNormal=function(u){if(u<0||u>=this.NumTriangles)throw new Error("invalid triangle index "+u);var g=V*u;return new this.TriangleNormals.constructor(this.TriangleNormals.buffer,this.TriangleNormals.BYTES_PER_ELEMENT*g,3)},a.Mesh.prototype.calculateNormalsCW=function(){for(var u=d(),g=d(),N=d(),v=0;v<this.NumTriangles;++v){var E=this.TriangleVertices[v*3+0],y=this.TriangleVertices[v*3+1],e=this.TriangleVertices[v*3+2];g[0]=this.VertexPositions[y*3+0]-this.VertexPositions[E*3+0],g[1]=this.VertexPositions[y*3+1]-this.VertexPositions[E*3+1],g[2]=this.VertexPositions[y*3+2]-this.VertexPositions[E*3+2],N[0]=this.VertexPositions[e*3+0]-this.VertexPositions[E*3+0],N[1]=this.VertexPositions[e*3+1]-this.VertexPositions[E*3+1],N[2]=this.VertexPositions[e*3+2]-this.VertexPositions[E*3+2],W(u,g,N),u[0]||u[1]||u[2]?(S(u,u),this.TriangleNormals[v*3+0]=u[0],this.TriangleNormals[v*3+1]=u[1],this.TriangleNormals[v*3+2]=u[2]):(this.TriangleNormals[v*3+0]=NaN,this.TriangleNormals[v*3+1]=NaN,this.TriangleNormals[v*3+2]=NaN)}},a}(),J=$.Mesh,K=function(){var a={};function c(e,r){return e>r?e:r}function m(e,r){return e<r?e:r}function V(e){return e<0?-e:e}var u={};u.setPlane=function(e,r,t,i,h){e[0]=r*r,e[1]=r*t,e[2]=r*i,e[3]=r*h,e[4]=t*t,e[5]=t*i,e[6]=t*h,e[7]=i*i,e[8]=i*h,e[9]=h*h},u.det=function(e,r,t,i,h,T,p,s,n,l){var o=e[r]*e[T]*e[l]+e[i]*e[h]*e[n]+e[t]*e[p]*e[s]-e[i]*e[T]*e[s]-e[r]*e[p]*e[n]-e[t]*e[h]*e[l];return o},u.add=function(e,r,t,i,h){e[0]=r[0][t]+i[0][h],e[1]=r[1][t]+i[1][h],e[2]=r[2][t]+i[2][h],e[3]=r[3][t]+i[3][h],e[4]=r[4][t]+i[4][h],e[5]=r[5][t]+i[5][h],e[6]=r[6][t]+i[6][h],e[7]=r[7][t]+i[7][h],e[8]=r[8][t]+i[8][h],e[9]=r[9][t]+i[9][h]},u.addLeft=function(e,r,t,i){e[0][r]+=t[0][i],e[1][r]+=t[1][i],e[2][r]+=t[2][i],e[3][r]+=t[3][i],e[4][r]+=t[4][i],e[5][r]+=t[5][i],e[6][r]+=t[6][i],e[7][r]+=t[7][i],e[8][r]+=t[8][i],e[9][r]+=t[9][i]},u.addLeftFlat=function(e,r,t){e[0][r]+=t[0],e[1][r]+=t[1],e[2][r]+=t[2],e[3][r]+=t[3],e[4][r]+=t[4],e[5][r]+=t[5],e[6][r]+=t[6],e[7][r]+=t[7],e[8][r]+=t[8],e[9][r]+=t[9]};const g=d(),N=d(),v=d(),E=d(),y=g.constructor;a.Simplify=function(e,r){if(r=r||{},this.Mesh=e,this.PreserveBorders=r.PreserveBorders||!1,this.PreserveTunnels=r.PreserveTunnels||!1,"MinimumInteriorAngleDegrees"in r){const i=r.MinimumInteriorAngleDegrees;if(typeof i!="number")throw new Error("MinimumInteriorAngleDegrees must be a number");const h=Math.PI*i/180;this.CheckMinimumInteriorAngle=!0,this.MinimumInteriorAngleCosine=Math.cos(h)}else this.CheckMinimumInteriorAngle=!1,this.MinimumInteriorAngleCosine=-1;if("MaximumEdgeLengthRatio"in r){const i=r.MaximumEdgeLengthRatio;if(typeof i!="number")throw new Error("MaximumEdgeLengthRatio must be a number");this.CheckEdgeLengthRatio=!0,this.MaximumEdgeLengthRatio=i}else this.CheckEdgeLengthRatio=!1,this.MaximumEdgeLengthRatio=0;this.TriErr0=new y(this.Mesh.NumTriangles),this.TriErr1=new y(this.Mesh.NumTriangles),this.TriErr2=new y(this.Mesh.NumTriangles),this.TriErr3=new y(this.Mesh.NumTriangles),this.TriErrs=[this.TriErr0,this.TriErr1,this.TriErr2,this.TriErr3],this.TriDeleted=new Int8Array(this.Mesh.NumTriangles),this.TriDirty=new Int8Array(this.Mesh.NumTriangles),this.TriOriginalIndex=new Int32Array(this.Mesh.NumTriangles);for(var t=0;t<this.Mesh.NumTriangles;++t)this.TriOriginalIndex[t]=t;this.TriEdgeLength=new y(3*this.Mesh.NumTriangles),this.VertTStart=new Int32Array(this.Mesh.NumVertices),this.VertTCount=new Int32Array(this.Mesh.NumVertices),this.VertBorder=new Int8Array(this.Mesh.NumVertices),this.VertSymmetricMatrix=[new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices),new y(this.Mesh.NumVertices)],this.RefsTID=new O,this.RefsTVertex=new O,this.RefsTID.reserve(this.Mesh.NumTriangles),this.RefsTVertex.reserve(this.Mesh.NumTriangles),this.RefsTID.push(-1),this.RefsTVertex.push(-1)},a.Simplify.prototype.getTriErrOffset=function(e){return 4*e},a.Simplify.prototype.resizeRefs=function(e){if(this.RefsTID.length>e)this.RefsTID.length=e,this.RefsTVertex.length=e;else for(var r=this.RefsTID.length;r<e;++r)this.RefsTID.push(-1),this.RefsTVertex.push(-1)},a.Simplify.prototype.resizeDeleted=function(e,r){if(e.length<r){if(e.data.length<r){for(var t=new Int8Array(r),i=0;i<e.length;++i)t=e.data[i];e.data=t}for(var h=e.length;h<r;++h)e.data[h]=0}e.length=r},a.Simplify.prototype.distance=function(e,r){var t=this.Mesh.getVertexPosition(e),i=this.Mesh.getVertexPosition(r);return b(t,i)},a.Simplify.prototype.removeVerticesAndMarkDeletedTriangles=function(){const e={data:new Int8Array(100),length:0},r={data:new Int8Array(100),length:0},t=d(),i=[],h=[],T=[];return function(p){var s=0;e.length=0,r.length=0;for(var n=this.Mesh.TriangleVertices,l=0;l<this.Mesh.NumTriangles;++l)if(!(this.TriErr3[l]>p)&&!this.TriDeleted[l]&&!this.TriDirty[l]){for(var o=this.Mesh.getTriangleVerticesOffset(l),f=0;f<3;++f)if(this.TriErrs[f][l]<p){var M=n[o+f],A=n[o+(f+1)%3];if(this.PreserveBorders&&(this.VertBorder[M]||this.VertBorder[A]))continue;if(this.VertBorder[M]!==this.VertBorder[A]||(this.calculateError(M,A,t),this.resizeDeleted(e,this.VertTCount[M]),this.resizeDeleted(r,this.VertTCount[A]),i.length=0,h.length=0,T.length=0,this.flipped(t,M,A,e,i,h))||this.flipped(t,A,M,r,i,T))continue;if(this.PreserveTunnels){i.forEach(function(w){h[w]=!1,T[w]=!1});var R=Object.keys(h).some(function(w){if(h[w]&&T[w])return!0});if(R)continue}L(this.Mesh.getVertexPosition(M),t),u.addLeft(this.VertSymmetricMatrix,M,this.VertSymmetricMatrix,A);var _=this.RefsTID.length;s+=this.updateTriangles(M,M,e),s+=this.updateTriangles(M,A,r);var I=this.RefsTID.length-_;this.VertTStart[M]=_,this.VertTCount[M]=I;break}}return s}}(),a.Simplify.prototype.minMaxError=function(e){if(this.TriErr0.length>0){for(var r=this.TriErr0[0],t=this.TriErr0[0],i=0;i<this.TriErrs.length;++i)for(var h=this.TriErrs[i],T=1;T<h.length;++T)r=h[T]<r?h[T]:r,t=h[T]>t?h[T]:t;e[0]=r,e[1]=t}},a.Simplify.prototype.simplifyMesh=function(e){e.breakFn||(e.targetTriangleCount?e.breakFn=function(M){return M<=e.targetTriangleCount}:e.breakFn=function(M){return!1});var r=e.breakFn;e.thresholdFn||(e.aggressiveness=e.aggressiveness||7,e.thresholdFn=function(M){return 1e-9*Math.pow(M+3,e.aggressiveness)});for(var t=e.thresholdFn,i=e.maxIterations||50,h=0,T=0,p=this.Mesh.NumTriangles,s=new Date,n=0;n<i&&!r(p-h);++n){n%5==0&&T<h&&(T=h,this.updateMesh(n));for(var l=0;l<this.Mesh.NumTriangles;++l)this.TriDirty[l]=0;var o=t(n);h+=this.removeVerticesAndMarkDeletedTriangles(o)}var f=new Date;console.log("time taken = "+(f-s)/1e3+"s")},a.Simplify.prototype.flipped=function(e,r,t,i,h,T){for(var p=this.VertTStart[r],s=g,n=N,l=v,o=E,f=this.Mesh.TriangleVertices,M=0;M<this.VertTCount[r];++M){var A=this.RefsTID.internal[p+M];if(!this.TriDeleted[A]){var R=this.Mesh.getTriangleVerticesOffset(A),_=this.RefsTVertex.internal[p+M],I=f[R+(_+1)%3],w=f[R+(_+2)%3];if(I===t){h.includes(w)||h.push(w),i[M]=1;continue}else if(w===t){h.includes(I)||h.push(I),i[M]=1;continue}else T[I]=!0,T[w]=!0;var C=this.Mesh.getVertexPosition(I),P=this.Mesh.getVertexPosition(w);B(s,C,e),B(n,P,e),S(s,s),S(n,n);var F=x(s,n);if(V(F)>.999||(W(o,s,n),S(o,o),i[M]=0,x(o,this.Mesh.getTriangleNormal(A))<.2))return!0;if(this.CheckMinimumInteriorAngle){if(F>this.MinimumInteriorAngleCosine)return!0;if(B(l,P,C),S(l,l),x(n,l)>this.MinimumInteriorAngleCosine)return!0;if(X(s,s),x(s,l)>this.MinimumInteriorAngleCosine)return!0}if(this.CheckEdgeLengthRatio){var Y=b(e,C),k=this.TriEdgeLength[R+(_+1)%3],U=b(P,e),G=m(Y,m(k,U)),z=c(Y,c(k,U));if(z>G*this.MaximumEdgeLengthRatio)return!0}}}return!1},a.Simplify.prototype.updateTriangles=function(e,r,t){for(var i=this.VertTCount[r],h=0,T=this.Mesh.TriangleVertices,p=0;p<i;++p){var s=this.RefsTID.internal[this.VertTStart[r]+p];if(!this.TriDeleted[s]){if(t[p]){this.TriDeleted[s]=1,h++;continue}var n=this.RefsTVertex.internal[this.VertTStart[r]+p],l=this.Mesh.getTriangleVerticesOffset(s);T[l+n]=e,this.TriDirty[s]=1,this.TriErr0[s]=this.calculateError(T[l+0],T[l+1],g),this.TriErr1[s]=this.calculateError(T[l+1],T[l+2],g),this.TriErr2[s]=this.calculateError(T[l+2],T[l+0],g),this.TriErr3[s]=m(this.TriErr0[s],m(this.TriErr1[s],this.TriErr2[s])),this.RefsTID.push(s),this.RefsTVertex.push(n),this.CheckEdgeLengthRatio&&(this.TriEdgeLength[l+n]=this.distance(e,T[l+(n+1)%3]),this.TriEdgeLength[l+(n+2)%3]=this.distance(T[l+(n+2)%3],e))}}return h},a.Simplify.prototype.copyTriangle=function(e,r){if(e!=r){var t=this.Mesh.TriangleVertices,i=this.Mesh.getTriangleVerticesOffset(e),h=this.Mesh.getTriangleVerticesOffset(r);t[i+0]=t[h+0],t[i+1]=t[h+1],t[i+2]=t[h+2],L(this.Mesh.getTriangleNormal(e),this.Mesh.getTriangleNormal(r)),this.TriErr0[e]=this.TriErr0[r],this.TriErr1[e]=this.TriErr1[r],this.TriErr2[e]=this.TriErr2[r],this.TriErr3[e]=this.TriErr3[r];var T=this.TriEdgeLength;T[i+0]=T[h+0],T[i+1]=T[h+1],T[i+2]=T[h+2],this.TriDeleted[e]=this.TriDeleted[r],this.TriDirty[e]=this.TriDirty[r],this.TriOriginalIndex[e]=this.TriOriginalIndex[r]}},a.Simplify.prototype.compactTriangles=function(){for(var e=0,r=0;r<this.Mesh.NumTriangles;++r)this.TriDeleted[r]||this.copyTriangle(e++,r);this.Mesh.NumTriangles=e},a.Simplify.prototype.initQuadricsByPlaneAndEdgeErrors=function(){var e,r=new Date,t=this.Mesh.TriangleVertices,i,h,T=new y(10);for(i=0;i<this.Mesh.NumTriangles;++i){var p=this.Mesh.getTriangleNormal(i);if(Number.isNaN(p[0])){this.TriDeleted[i]=1;continue}var s=this.Mesh.getTriangleVerticesOffset(i),n=this.Mesh.getVertexPosition(t[s+0]);for(u.setPlane(T,p[0],p[1],p[2],-x(p,n)),h=0;h<3;++h)u.addLeftFlat(this.VertSymmetricMatrix,t[s+h],T)}for(e=new Date,console.log("  planes initialized @ "+(e-r)/1e3+"s"),i=0;i<this.Mesh.NumTriangles;++i){const l=this.Mesh.getTriangleVerticesOffset(i);for(h=0;h<3;++h)this.TriErrs[h][i]=this.calculateError(t[l+h],t[l+(h+1)%3],g);this.TriErr3[i]=m(this.TriErr0[i],m(this.TriErr1[i],this.TriErr2[i]))}e=new Date,console.log("  edge error calculated @ "+(e-r)/1e3+"s")},a.Simplify.prototype.initReferenceIDList=function(){var e;for(e=0;e<this.Mesh.NumVertices;++e)this.VertTStart[e]=0,this.VertTCount[e]=0;var r=this.Mesh.TriangleVertices;for(e=0;e<this.Mesh.NumTriangles;++e)for(var t=this.Mesh.getTriangleVerticesOffset(e),i=0;i<3;++i)this.VertTCount[r[t+i]]++;var h=0;for(e=0;e<this.Mesh.NumVertices;++e)this.VertTStart[e]=h,h+=this.VertTCount[e],this.VertTCount[e]=0},a.Simplify.prototype.writeReferences=function(){this.resizeRefs(this.Mesh.NumTriangles*3);for(var e=this.Mesh.TriangleVertices,r=0;r<this.Mesh.NumTriangles;++r)for(var t=this.Mesh.getTriangleVerticesOffset(r),i=0;i<3;++i){var h=e[t+i],T=this.VertTStart[h]+this.VertTCount[h];this.RefsTID.internal[T]=r,this.RefsTVertex.internal[T]=i,this.VertTCount[h]++}},a.Simplify.prototype.identifyBoundaries=function(){var e=new Int32Array(this.Mesh.NumVertices),r=new Int32Array(this.Mesh.NumVertices),t=0,i=0,h,T;for(h=0;h<this.Mesh.NumVertices;++h)this.VertBorder[h]=0;var p=this.Mesh.TriangleVertices;for(h=0;h<this.Mesh.NumVertices;++h){t=0,i=0;var s=this.VertTStart[h];for(T=0;T<this.VertTCount[h];++T)for(var n=this.RefsTID.internal[s+T],l=this.Mesh.getTriangleVerticesOffset(n),o=0;o<3;++o){for(var f=0,M=p[l+o];f<t&&r[f]!=M;)f++;f==t?(e[t++]=1,r[i++]=M):e[f]++}for(T=0;T<t;++T)e[T]==1&&(this.VertBorder[r[T]]=1)}},a.Simplify.prototype.calculateEdgeLengths=function(){for(var e=this.Mesh.TriangleVertices,r=0;r<this.Mesh.NumTriangles;++r)if(!this.TriDeleted[r])for(var t=this.Mesh.getTriangleVerticesOffset(r),i=0;i<3;++i){var h=e[t+i],T=e[t+(i+1)%3];this.TriEdgeLength[t+i]=this.distance(h,T)}},a.Simplify.prototype.initializeAndUpdateMesh=function(){this.initQuadricsByPlaneAndEdgeErrors(),this.initReferenceIDList(),this.writeReferences(),this.identifyBoundaries(),this.CheckEdgeLengthRatio&&this.calculateEdgeLengths()},a.Simplify.prototype.updateMesh=function(e){console.log("updating mesh @iteration "+e),this.compactTriangles(),this.initReferenceIDList(),this.writeReferences()},a.Simplify.prototype.compactMesh=function(){var e=this.Mesh.TriangleVertices,r=0,t,i;for(t=0;t<this.Mesh.NumVertices;++t)this.VertTCount[t]=0;for(t=0;t<this.Mesh.NumTriangles;++t)if(!this.TriDeleted[t]){const h=this.Mesh.getTriangleVerticesOffset(t);for(i=0;i<3;++i)this.VertTCount[e[h+i]]=1;this.copyTriangle(r++,t)}this.Mesh.NumTriangles=r;{for(r=0,t=0;t<this.Mesh.NumVertices;++t)this.VertTCount[t]&&(this.VertTStart[t]=r,L(this.Mesh.getVertexPosition(r),this.Mesh.getVertexPosition(t)),r++);for(t=0;t<this.Mesh.NumTriangles;++t){const h=this.Mesh.getTriangleVerticesOffset(t);for(i=0;i<3;++i)e[h+i]=this.VertTStart[e[h+i]]}this.Mesh.NumVertices=r}},a.Simplify.prototype.vertexError=function(e,r,t,i){return e[0]*r*r+2*e[1]*r*t+2*e[2]*r*i+2*e[3]*r+e[4]*t*t+2*e[5]*t*i+2*e[6]*t+e[7]*i*i+2*e[8]*i+e[9]},a.Simplify.prototype.calculateError=function(){const e=d(),r=new y(10);return function(t,i,h){u.add(r,this.VertSymmetricMatrix,t,this.VertSymmetricMatrix,i);var T=this.VertBorder[t]&this.VertBorder[i],p=0,s=u.det(r,0,1,2,1,4,5,2,5,7);if(s!=0&&!T)h[0]=-1/s*u.det(r,1,2,3,4,5,6,5,7,8),h[1]=1/s*u.det(r,0,2,3,1,5,6,2,7,8),h[2]=-1/s*u.det(r,0,1,3,1,4,6,2,5,8),p=this.vertexError(r,h[0],h[1],h[2]);else{var n=this.Mesh.VertexPositions,l=this.Mesh.getVertexPositionOffset(t),o=this.Mesh.getVertexPositionOffset(i);e[0]=.5*(n[l+0]+n[o+0]),e[1]=.5*(n[l+1]+n[o+1]),e[2]=.5*(n[l+2]+n[o+2]);var f=this.vertexError(r,n[l+0],n[l+1],n[l+2]),M=this.vertexError(r,n[o+0],n[o+1],n[o+2]),A=this.vertexError(r,e[0],e[1],e[2]);f<=M&&f<=A?(p=f,h[0]=n[l+0],h[1]=n[l+1],h[2]=n[l+2]):M<=A?(p=M,h[0]=n[o+0],h[1]=n[o+1],h[2]=n[o+2]):(p=A,L(h,e))}return p}}();try{typeof D<"u"&&D.exports&&(D.exports=a)}catch{}return a}(),{Simplify:q}=K;function j(a,c,m=.5,V=7,u=!0){const g=Math.ceil(c.length/3*m),N=new Float64Array(a.length);for(let i=0;i<a.length;++i)N[i]=a[i];const v=new Int32Array(c.length);for(let i=0;i<c.length;++i)v[i]=c[i];const E=new J(a.length/3,c.length/3,N,v);E.calculateNormalsCW();const y=new q(E,{PreserveBorders:!0,PreserveTunnels:!0});y.initializeAndUpdateMesh();const e=[];y.minMaxError(e),y.simplifyMesh({maxIterations:50,aggressiveness:V,targetTriangleCount:g}),y.compactMesh();const r=E.VertexPositions.slice(0,3*E.NumVertices),t=E.TriangleVertices.slice(0,3*E.NumTriangles);return{vertices:r,triangles:t}}self.onmessage=function(a){const{verts:c,tris:m,shrinkValue:V,verbose:u=!0}=a.data,g=new Date,N=j(c,m,V);u&&console.log(new Date-g+"ms elapsed"),postMessage({vertices:N.vertices,triangles:N.triangles})}});export default ee();
