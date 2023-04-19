/* eslint-disable no-array-constructor */
/* eslint-disable camelcase */
import { InferenceSession, Tensor } from 'onnxruntime-web'
let cv = require('@techstark/opencv-js')

export default class AIDehaze {
  // 构造器
  constructor (model_path) {
    this.model_path = model_path
    this.session = null
    this.status = false
  }

  async loadModel () {
    this.session = await InferenceSession.create(this.model_path, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })
    this.status = true
  }

  getImageData = async function (blob) {
    let blobUrl = URL.createObjectURL(blob)
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => resolve(img)
      img.onerror = err => reject(err)
      img.src = blobUrl
    }).then(img => {
      URL.revokeObjectURL(blobUrl)
      let [w, h] = [img.width, img.height]
      let canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      return ctx.getImageData(0, 0, w, h)
    })
  }

  async run (file) {
    let imageData = await this.getImageData(file)
    let mat = cv.matFromImageData(imageData)
    let w = mat.rows
    let h = mat.cols
    let inputTensor = await this.imageProcess(mat)
    // inference
    let result = await this.runInference(inputTensor, h, w)
    return result
  }

  async imageProcess (img) {
    cv.resize(img, img, new cv.Size(400, 400), 0, 0, cv.INTER_CUBIC)
    let imageBufferData = img.data
    // create the Float32Array size 3 * 224 * 224 for these dimensions output
    let [redArray, greenArray, blueArray] = new Array(new Array(), new Array(), new Array())
    for (let i = 0; i < imageBufferData.length; i += 4) {
      redArray.push(imageBufferData[i])
      greenArray.push(imageBufferData[i + 1])
      blueArray.push(imageBufferData[i + 2])
    }
    // array to tensor
    let transposedData = redArray.concat(greenArray).concat(blueArray)
    let l = transposedData.length
    // create the Float32Array size 3 * 224 * 224 for these dimensions output
    const float32Data = new Float32Array(3 * 400 * 400)
    for (let i = 0; i < l; i++) {
      float32Data[i] = (transposedData[i] / 255.0) * 2.0 - 1.0
    }
    // create tensor with float32
    const inputTensor = new Tensor('float32', float32Data, [1, 3, 400, 400])
    return inputTensor
  }

  async runInference (inputTensor, h, w) {
    const feeds = {}
    // create feeds with the input name from model export and the preprocessed data.
    feeds[this.session.inputNames[0]] = inputTensor
    // Run the session inference.
    const outputData = await this.session.run(feeds)
    // Get output results with the output name from the model export.
    const output = outputData[this.session.outputNames[0]]
    // Get the array
    let results = new Array(output.data.length)
    // decode
    for (let i = 0; i < 400; i++) {
      for (let j = 0; j < 400; j++) {
        for (let t = 0; t < 3; t++) {
          let srcInd = t * 400 * 400 + i * 400 + j
          let dstInd = i * 3 * 400 + j * 3 + t
          results[dstInd] = (output.data[srcInd] * 0.5 + 0.5) * 255.0
          // 范围限制
          if (results[dstInd] < 0) {
            results[dstInd] = 0
          }
          if (results[dstInd] > 255) {
            results[dstInd] = 255
          }
        }
      }
    }
    // to Mat
    let mat = cv.matFromArray(400, 400, cv.CV_8UC3, [].concat(results))
    cv.resize(mat, mat, new cv.Size(h, w), 0, 0, cv.INTER_CUBIC)
    return mat
  }
}
