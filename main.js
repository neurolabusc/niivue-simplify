import { Niivue, NVMeshUtilities } from '@niivue/niivue'
// Dynamically load the worker modules

async function createNiivueWorker() {
  if (window.Worker) {
    const { default: niivueWorker } = await import('./niivueWorker?worker')
    return new niivueWorker()
  }
  throw new Error('Web Workers are not supported in this environment.')
}

async function createMxrapWorker() {
  if (window.Worker) {
    const { default: MxrapWorker } = await import('./mxrapWorker?worker')
    return new MxrapWorker()
  }
  throw new Error('Web Workers are not supported in this environment.')
}

async function main() {
  const niivueWorker = await createNiivueWorker()
  const MxrapWorker = await createMxrapWorker()
  const WasmWorker = new Worker('./wasmWorker.js?rnd=' + Math.random())
  const loadingCircle = document.getElementById('loadingCircle')
  let startTime = Date.now()
  function meshStatus(isTimed = true) {
    let str = `Mesh has ${nv1.meshes[0].pts.length / 3} vertices and ${nv1.meshes[0].tris.length / 3} triangles`
    if (isTimed)
      str += ` ${Date.now() - startTime}ms`
    document.getElementById('location').innerHTML = str
    shaderSelect.onchange()
  }
  async function loadMz3(meshBuffer) {
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
    }
    await nv1.loadFromArrayBuffer(meshBuffer, 'test.mz3')
    loadingCircle.classList.add('hidden')
    meshStatus()
  }
  async function loadMesh(vertices, triangles) {
    const verticesArray = new Float32Array(vertices)
    const trianglesArray = new Uint32Array(triangles)
    const meshBuffer = NVMeshUtilities.createMZ3(verticesArray, trianglesArray, false)
    await loadMz3(meshBuffer)
  }
  niivueWorker.onmessage = async function (e) {
    const { vertices, triangles } = e.data
    await loadMesh(vertices, triangles)
  }
  MxrapWorker.onmessage = async function (e) {
    const { vertices, triangles } = e.data
    await loadMesh(vertices, triangles)
  }
  WasmWorker.onmessage = async function (e) {
    if (e.data.blob instanceof Blob) {
        var reader = new FileReader()
        reader.onload = () => {
            console.log(reader.result)
            loadMz3(reader.result)
        }
        reader.readAsArrayBuffer(e.data.blob)
    }
  }
  saveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.")
    } else {
      saveDialog.show()
    }
  }
  volumeSelect.onchange = function () {
    const selectedOption = volumeSelect.options[volumeSelect.selectedIndex]
    const txt = selectedOption.text
    let fnm = './' + txt
    if (volumeSelect.selectedIndex > 1) {
      fnm = 'https://niivue.github.io/niivue/images/' + txt
    }
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
    }
    nv1.loadMeshes([{ url: fnm }])
  }
  applySaveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      return
    }
    let format = 'obj'
    if (formatSelect.selectedIndex === 0) {
      format = 'mz3'
    }
    if (formatSelect.selectedIndex === 2) {
      format = 'stl'
    }
    NVMeshUtilities.saveMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, `mesh.${format}`, true)
  }
  simplifyBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert('No mesh open to simplify.')
    } else {
      simplifyDialog.show()
    }
  }
  applySimpleBtn.onclick = async function () {
    if (nv1.meshes.length < 1) {
      console.log('No mesh open to simplify.')
      return
    }
    startTime = Date.now()
    const verts = nv1.meshes[0].pts.slice()
    const tris = nv1.meshes[0].tris.slice()
    const shrinkValue = Math.min(Math.max(Number(shrinkSimplePct.value) / 100, 0.01), 1)
    loadingCircle.classList.remove('hidden')
    if (methodSelect.value === 'mxrap') {
        MxrapWorker.postMessage({
          verts,
          tris,
          shrinkValue
        })
    } else if (methodSelect.value === 'wasm') {
        const meshBuffer = NVMeshUtilities.createMZ3(verts, tris, false)
        let mz3 = new Blob([meshBuffer], {
            type: 'application/octet-stream'
        })
        let inName = `em${Math.round(Math.random() * 0xffffff)}.mz3`
        let fileMZ3 = new File([mz3], inName)
        let outName = `em${Math.round(Math.random() * 0xffffff)}.mz3`
        WasmWorker.postMessage({
            blob: fileMZ3,
            percentage: shrinkValue,
            simplify_name: outName,
            agressiveness: 7,
        })
    } else {
        niivueWorker.postMessage({
          verts,
          tris,
          shrinkValue
        })
    }
  }
  function handleLocationChange(data) {
    document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string
  }
  shaderSelect.onchange = function () {
    nv1.setMeshShader(nv1.meshes[0].id, this.value)
  }
  function handleMeshLoaded() {
    meshStatus(false)
  }
  const defaults = {
    onMeshLoaded: handleMeshLoaded,
    onLocationChange: handleLocationChange,
    backColor: [0.2, 0.2, 0.3, 1],
    show3Dcrosshair: true
  }
  const nv1 = new Niivue(defaults)
  nv1.attachToCanvas(gl1)
  nv1.setRenderAzimuthElevation(245, 15)
  await nv1.loadMeshes([{url: "./lh.mz3",},])
}

main()
