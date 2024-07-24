### NiiVue voxels to mesh

A basic example of simplifying meshes. Open the [live demo](https://neurolabusc.github.io/niivue-simplify/).

### Comparisons

This repository includes different ports of Sven Forstmann's C++ [Fast Quadric Mesh Simplification](https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification). The table below shows the time to simplify the `mni152_2009.mz3` mesh to 10% of its input size.

| Method   | Files                                                     | Size (kb) | Speed (ms) |
|----------|-----------------------------------------------------------|-----------|------------|
| nii2mesh | nii2mesh.js                                               |      213  |       650  |
| WASM C++ | a.js                                                      |      200  |       800  |
| mXrap    | mesh-ta, quadric-mesh-simplification, wrapped_typed_array |       65  |      2100  |
| NiiVue   | simplify                                                  |       15  |      2150  |

Neuroimaging meshes do not use [UV mapping](https://en.wikipedia.org/wiki/UV_mapping). For simplification of meshes with UV mapping, see this [live demo](https://neurolabusc.github.io/simplifyjs/).

### For Developers

You can serve a hot-reloadable web page that allows you to interactively modify the source code.

```bash
git clone https://github.com/niivue/niivue-simplify
cd niivue-simplify
npm install
npm run dev
```

### Links

 - This project includes four ports of Sven Forstmann's C++ [Fast Quadric Mesh Simplification](https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification): a direct web assembly compilation, the [mXrap](https://mxrap.com/js_docs/lib_QuadricMeshSimplification.html) pure JavaScript, the NiiVue team pure JavaScript and the nii2mesh C code compiled as web assembly.
 - This repository assumes mesh-based inputs. To convert voxels to meshes and simplify them, see [this companion project](https://github.com/niivue/niivue-mesh).
