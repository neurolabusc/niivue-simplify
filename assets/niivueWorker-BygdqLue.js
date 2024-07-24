class b{constructor(t,e,s,o=7,r=!1,n=!0){this.vertices=[],this.triangles=[],this.refs=new Array(e.length),this.targetCount=s,this.aggressiveness=o,this.finishLossless=r,this.verbose=n,this.init(t,e)}init(t,e){for(let s=0;s<t.length;s+=3)this.vertices.push({p:{x:t[s],y:t[s+1],z:t[s+2]},tstart:0,tcount:0,q:new Float32Array(10).fill(0),border:0});for(let s=0;s<e.length;s+=3)this.triangles.push({v:[e[s],e[s+1],e[s+2]],err:new Float32Array(4).fill(0),dirty:!1,deleted:!1,n:{x:0,y:0,z:0}})}symMat1(t,e){t.fill(e)}symMat4(t,e,s,o,r){t[0]=e*e,t[1]=e*s,t[2]=e*o,t[3]=e*r,t[4]=s*s,t[5]=s*o,t[6]=s*r,t[7]=o*o,t[8]=o*r,t[9]=r*r}symMat10(t,e,s,o,r,n,i,h,l,f,v){t[0]=e,t[1]=s,t[2]=o,t[3]=r,t[4]=n,t[5]=i,t[6]=h,t[7]=l,t[8]=f,t[9]=v}symMatAdd(t,e,s){for(let o=0;o<10;o++)t[o]=e[o]+s[o]}symMatDet(t,e,s,o,r,n,i,h,l,f){return t[e]*t[n]*t[f]+t[o]*t[r]*t[l]+t[s]*t[i]*t[h]-t[o]*t[n]*t[h]-t[e]*t[i]*t[l]-t[s]*t[r]*t[f]}vCross(t,e){return{x:t.y*e.z-t.z*e.y,y:t.z*e.x-t.x*e.z,z:t.x*e.y-t.y*e.x}}vSum(t,e){return{x:t.x+e.x,y:t.y+e.y,z:t.z+e.z}}vSubtract(t,e){return{x:t.x-e.x,y:t.y-e.y,z:t.z-e.z}}vNormalize(t){const e=Math.sqrt(t.x*t.x+t.y*t.y+t.z*t.z);e<=0||(t.x/=e,t.y/=e,t.z/=e)}vDot(t,e){return t.x*e.x+t.y*e.y+t.z*e.z}vMult(t,e){return{x:t.x*e,y:t.y*e,z:t.z*e}}vertexError(t,e,s,o){return t[0]*e*e+2*t[1]*e*s+2*t[2]*e*o+2*t[3]*e+t[4]*s*s+2*t[5]*s*o+2*t[6]*s+t[7]*o*o+2*t[8]*o+t[9]}calculateErrorFast(t,e){const s=new Float32Array(10);this.symMatAdd(s,this.vertices[t].q,this.vertices[e].q);const o=this.vertices[t].border+this.vertices[e].border,r=this.symMatDet(s,0,1,2,1,4,5,2,5,7);if(r!==0&&o===0){const c=-1/r*this.symMatDet(s,1,2,3,4,5,6,5,7,8),a=1/r*this.symMatDet(s,0,2,3,1,5,6,2,7,8),y=-1/r*this.symMatDet(s,0,1,3,1,4,6,2,5,8);return this.vertexError(s,c,a,y)}const n=this.vertices[t].p,i=this.vertices[e].p,h=this.vMult(this.vSum(n,i),.5),l=this.vertexError(s,n.x,n.y,n.z),f=this.vertexError(s,i.x,i.y,i.z),v=this.vertexError(s,h.x,h.y,h.z);return Math.min(l,Math.min(f,v))}calculateError(t,e,s){const o=new Float32Array(10);this.symMatAdd(o,this.vertices[t].q,this.vertices[e].q);const r=this.vertices[t].border+this.vertices[e].border,n=this.symMatDet(o,0,1,2,1,4,5,2,5,7);if(n!==0&&r===0)return s.x=-1/n*this.symMatDet(o,1,2,3,4,5,6,5,7,8),s.y=1/n*this.symMatDet(o,0,2,3,1,5,6,2,7,8),s.z=-1/n*this.symMatDet(o,0,1,3,1,4,6,2,5,8),this.vertexError(o,s.x,s.y,s.z);const i=this.vertices[t].p,h=this.vertices[e].p,l=this.vMult(this.vSum(i,h),.5),f=this.vertexError(o,i.x,i.y,i.z),v=this.vertexError(o,h.x,h.y,h.z),u=this.vertexError(o,l.x,l.y,l.z),c=Math.min(f,Math.min(v,u));return f===c&&(s=i),v===c&&(s=h),u===c&&(s=l),c}updateMesh(t){if(t>0){let r=0;for(let n=0;n<this.triangles.length;n++)this.triangles[n].deleted||(this.triangles[r++]=this.triangles[n]);this.triangles.length=r}for(const r of this.vertices)r.tstart=0,r.tcount=0;for(let r=0;r<this.triangles.length;r++)for(let n=0;n<3;n++)this.vertices[this.triangles[r].v[n]].tcount++;let e=0;for(const r of this.vertices)r.tstart=e,e+=r.tcount,r.tcount=0;this.refs.length=this.triangles.length*3;for(let r=0;r<this.triangles.length;r++){const n=this.triangles[r];for(let i=0;i<3;i++){const h=this.vertices[n.v[i]];this.refs[h.tstart+h.tcount]={tid:r,tvertex:i},h.tcount++}}if(t!==0)return;for(const r of this.vertices)r.border=0;const s=new Uint32Array(this.vertices.length),o=new Uint32Array(this.vertices.length);for(let r=0;r<this.vertices.length;r++){let n=0;const i=this.vertices[r];for(let h=0;h<i.tcount;h++){const l=this.refs[i.tstart+h].tid,f=this.triangles[l];for(let v=0;v<3;v++){const u=f.v[v];let c=0;for(;c<n&&s[c]!==u;)c++;c===n?(o[n]=1,s[n]=u,n++):o[c]++}}for(let h=0;h<n;h++)o[h]===1&&(this.vertices[s[h]].border=1)}for(const r of this.vertices)this.symMat1(r.q,0);for(let r=0;r<this.triangles.length;r++){const n=this.triangles[r],i=[];for(let l=0;l<3;l++)i[l]=this.vertices[n.v[l]].p;const h=this.vCross(this.vSubtract(i[1],i[0]),this.vSubtract(i[2],i[0]));this.vNormalize(h),n.n=h;for(let l=0;l<3;l++){const f=new Float32Array(10);this.symMat4(f,h.x,h.y,h.z,-this.vDot(h,i[0])),this.symMatAdd(this.vertices[n.v[l]].q,this.vertices[n.v[l]].q,f)}}for(let r=0;r<this.triangles.length;r++){const n=this.triangles[r];for(let i=0;i<3;i++)n.err[i]=this.calculateErrorFast(n.v[i],n.v[(i+1)%3]);n.err[3]=Math.min(n.err[0],Math.min(n.err[1],n.err[2]))}}compactMesh(){let t=0;for(const e of this.vertices)e.tcount=0;for(let e=0;e<this.triangles.length;e++)if(!this.triangles[e].deleted){this.triangles[t++]=this.triangles[e];for(let s=0;s<3;s++)this.vertices[this.triangles[e].v[s]].tcount=1}this.triangles.length=t,t=0;for(let e=0;e<this.vertices.length;e++)this.vertices[e].tcount&&(this.vertices[e].tstart=t,this.vertices[t].p=this.vertices[e].p,t++);for(let e=0;e<this.triangles.length;e++){const s=this.triangles[e];for(let o=0;o<3;o++)s.v[o]=this.vertices[s.v[o]].tstart}this.vertices.length=t}updateTriangles(t,e,s,o){for(let r=0;r<e.tcount;r++){const n=this.refs[e.tstart+r],i=this.triangles[n.tid];if(!i.deleted){if(s[r]){i.deleted=!0,o++;continue}i.v[n.tvertex]=t,i.dirty=!0,i.err[0]=this.calculateErrorFast(i.v[0],i.v[1]),i.err[1]=this.calculateErrorFast(i.v[1],i.v[2]),i.err[2]=this.calculateErrorFast(i.v[2],i.v[0]),i.err[3]=Math.min(i.err[0],Math.min(i.err[1],i.err[2])),this.refs.push(n)}}return o}flipped(t,e,s,o,r,n){for(let i=0;i<o.tcount;i++){const h=this.triangles[this.refs[o.tstart+i].tid];if(h.deleted)continue;const l=this.refs[o.tstart+i].tvertex,f=h.v[(l+1)%3],v=h.v[(l+2)%3];if(f===s||v===s){n[i]=!0;continue}const u=this.vSubtract(this.vertices[f].p,t);this.vNormalize(u);const c=this.vSubtract(this.vertices[v].p,t);if(this.vNormalize(c),Math.abs(this.vDot(u,c))>.999)return!0;const a=this.vCross(u,c);if(this.vNormalize(a),n[i]=!1,this.vDot(a,h.n)<.2)return!0}return!1}simplify(t=!0){let e=0;const s=this.triangles.length,o=new Array(s*3).fill(!1),r=new Array(s*3).fill(!1),n=s;let i=100,h=!0,l=Number.EPSILON;this.aggressiveness<=5&&(i=500),this.targetCount>=n&&(h=!1,i=1e3);let f=0;for(let a=0;a<i;a++){if(h&&s-e<=this.targetCount){if(!this.finishLossless)break;h=!1,l=Number.EPSILON,i=1e3}if(h)a%5===0&&this.updateMesh(a),l=1e-9*Math.pow(a+3,this.aggressiveness);else{if(f===s-e)break;this.updateMesh(a)}f=s-e;for(let y=0;y<this.triangles.length;y++)this.triangles[y].dirty=!1;t&&a%5===0&&console.log(`iteration ${a} - triangles ${s-e} threshold ${l}`);for(let y=0;y<this.triangles.length;y++){const d=this.triangles[y];if(!(d.err[3]>l)&&!d.deleted&&!d.dirty){for(let M=0;M<3;M++)if(d.err[M]<l){const x=d.v[M],g=this.vertices[x],E=d.v[(M+1)%3],p=this.vertices[E];if(g.border!==p.border)continue;const w={x:0,y:0,z:0};if(this.calculateError(x,E,w),this.flipped(w,x,E,g,p,o)||this.flipped(w,E,x,p,g,r))continue;g.p=w,this.symMatAdd(g.q,p.q,g.q);const A=this.refs.length;e=this.updateTriangles(x,g,o,e),e=this.updateTriangles(x,p,r,e);const m=this.refs.length-A;m<=g.tcount?m&&this.refs.splice(g.tstart,m,...this.refs.slice(A,A+m)):g.tstart=A,g.tcount=m;break}if(h&&s-e<=this.targetCount)break}}}this.compactMesh();const v=new Float32Array(this.vertices.length*3);let u=0;for(const a of this.vertices)v[u++]=a.p.x,v[u++]=a.p.y,v[u++]=a.p.z;const c=new Uint32Array(this.triangles.length*3);u=0;for(const a of this.triangles)c[u++]=a.v[0],c[u++]=a.v[1],c[u++]=a.v[2];if(t){const a=Math.round(100*(c.length/3)/s);console.log(`Vertices ${v.length/3} Triangles ${c.length/3} ${a}%`)}return{vertices:v,triangles:c}}}function D(z,t,e=.5,s=7,o=!1,r=!0){const n=Math.ceil(t.length/3*e);return new b(z,t,n,s,o,r).simplify()}self.onmessage=function(z){const{verts:t,tris:e,shrinkValue:s,verbose:o=!0}=z.data,r=new Date,n=D(t,e,s);o&&console.log(new Date-r+"ms elapsed"),postMessage({vertices:n.vertices,triangles:n.triangles})};
