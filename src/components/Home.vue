<template>
  <div>
    <!-- 文字描述 -->
    <div style="background-color:antiquewhite; height: 150px; width: 100%;">
      <h1>基于深度学习的图像去雾技术</h1>
      <b>基于图像增强的去雾算法出发点是尽量去除图像噪声，提高图像对比度，从而恢复出无雾清晰图像。</b>
      <br>
      <b>代表性方法有：直方图均衡化（HLE）、自适应直方图均衡化（AHE）、限制对比度自适应直方图均衡化（CLAHE） 、Retinex算法、小波变换、同态滤波等等。</b>
      <br>
      <b>由于CNN近年在一些任务上取得了较大的进展，去雾算法自然也有大量基于CNN的相关工作。这类方法是主要可以分为两类，
        第一类仍然是于大气退化模型，利用神经网络对模型中的参数进行估计，早期的方法大多数是基于这种思想。</b>
      <br>
      <b style="padding-bottom;: 1%">第二类则是利用输入的有雾图像，直接输出得到去雾后的图像，也即是深度学习中常说的end2end。</b>
    </div>
    <!-- 中间核心区域 -->
    <el-row>
      <el-col :span="6">
        <div style="margin-top: 30px; width: 90%; padding: 5%;">
          <img src="../assets/GUNet.png" height="90%" width="90%">
          <p><strong>GUNet去雾算法</strong></p>
          <li>去雾网络的发展历史上，有两个方法带来了显著的性能提升。一个是引入提取多尺度特征的方法，另一个是引入注意力机制的深度网络。</li>
          <li>GUnet采用U-Net作为基础架构，能够生成不同尺寸的特征图，引入局部残差和全局残差提取多尺度信息，使用深度可分离卷积有效地聚集信息特征；</li>
          <li>大气散射模型方程中，大气光A是共享的全局变量，t(x)是与位置相关的局部变量。在FFA网络中通道注意力机制能够有效提取计算A所需要的信息，因此设计了SK融合模块，动态融合来自不同路径的特征图，起到通道注意力机制相同的效果，有效提取A所需的信息。提取t(x)所需信息的任务可以由像素注意力模块来实现，旨在使网络更关注信息特征。而GLU中的门控机制具有类似的作用，因此在卷积块中引入了门控机制，使其充当像素注意模块和非线性激活函数，这样也可以省去传统的激活函数。</li>
        </div>
      </el-col>
      <el-col :span="12">
        <el-tabs type="border-card" style="margin-top: 30px;">
          <el-tab-pane label="上传图片去雾">
            <!-- 图片上传 -->
            <el-upload
              ref="uploadMutiple"
              class="avatar-uploader"
              :auto-upload="false"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-change="handleChange"
              :http-request="handleUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <el-button type="primary" @click="submitUpload" plain>点击上传图片</el-button>
            <!-- 进度展示 -->
            <el-steps :active="active" style="width: 600px; margin: auto;">
              <el-step title="图片上传" icon="el-icon-upload"></el-step>
              <el-step title="特征提取" icon="el-icon-edit"></el-step>
              <el-step title="图片去雾" icon="el-icon-picture"></el-step>
            </el-steps>
            <!-- 分割线 -->
            <el-divider style="margin-bottom: 1%; margin-top: 1%;"><i class="el-icon-success"></i>去雾结果</el-divider>
            <div class="result">
                <canvas id="dstImg" width="640" height="480"></canvas>
            </div>
          </el-tab-pane>
          <el-tab-pane label="调用摄像头去雾">
            <video ref="video" width="640" height="480" autoplay style="margin: auto; text-align: center; width: 640; height: 480;"></video>
            <div style="width: 100%; marigin: auto">
              <el-button type="primary" @click="callCamera" plain>打开摄像头</el-button>
              <el-button type="primary" @click="videoDehaze" plain>点击去雾</el-button>
            </div>
            <!-- 分割线 -->
            <el-divider style="margin-bottom: 1%; margin-top: 1%;"><i class="el-icon-success"></i>去雾结果</el-divider>
            <div class="result">
                <canvas id="dstImg2" width="640" height="480"></canvas>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="6">
        <div style="margin-top: 30px; width: 90%; padding: 5%;">
          <img src="../assets/dataset.png" height="90%" width="90%">
          <p><strong>RESIDE数据集</strong></p>
          <li>该数据集使用由合成和真实世界模糊图像组成的新的大规模基准，称为真实单图像去雾 (RESIDE)，对现有的单图像去雾算法进行了全面的研究和评估。</li>
          <li>REISDE训练集包含13,990个合成模糊图像，使用来自现有室内深度数据集NYU2和米德尔伯里立体数据库的1,399个清晰图像生成。每个清晰图像合成10个模糊图像。提供了13,000个用于训练和990个用于验证。</li>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AIDehaze from '@/ai/ImageDehaze.js'
const cv = require('@techstark/opencv-js')

export default {
  name: 'Home',

  data () {
    return {
      imageUrl: '',
      active: -1
    }
  },

  methods: {
    beforeUpload (file) {
      this.active = 0
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      if (!(isJPG | isPNG)) {
        this.$message.error('上传头像图片只能是 JPG或者PNG 格式!')
      }
      return isJPG | isPNG
    },

    async submitUpload () {
      this.$refs.uploadMutiple.submit()
    },

    handleChange (file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      this.file = file
      this.active++
    },

    async handleUpload (file) {
      this.imgList = []
      this.download = false
      // 图片特征提取
      let dehaze = await this.dehazeImage(this.file.raw)
      this.active++
      this.$notify({
        title: '去雾成功',
        message: '请在去雾结果里查看~',
        type: 'success'
      })
      cv.imshow('dstImg', dehaze)
      dehaze.delete()
      this.active++
    },

    async dehazeImage (file) {
      // 判断是否已有模型加载
      let model = new AIDehaze('/best.onnx')
      await model.loadModel()
      let dehaze = await model.run(file)
      return dehaze
    },

    callCamera () {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then(success => {
        this.$refs['video'].srcObject = success
        this.$refs['video'].play()
      }).catch(() => {
        this.$notify.error({
          title: '摄像头打开失败',
          message: '请确认设备连接了摄像头~'
        })
      })
    },

    videoDehaze () {
      let canvas = document.createElement('canvas')
      canvas.height = this.$refs['video'].videoHeight
      canvas.width = this.$refs['video'].videoWidth
      let ctx = canvas.getContext('2d')
      ctx.drawImage(this.$refs['video'], 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async blob => {
        let file = new File([blob], 'videoFrame.jpg')
        // 图片特征提取
        let dehaze = await this.dehazeImage(file)
        this.$notify({
          title: '去雾成功',
          message: '请在去雾结果里查看~',
          type: 'success'
        })
        cv.resize(dehaze, dehaze, new cv.Size(640, 480), 0, 0, cv.INTER_CUBIC)
        cv.imshow('dstImg2', dehaze)
        dehaze.delete()
      })
    }
  }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin-top: 30px;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }
  .image {
    width: 100%;
    display: block;
  }
  .text {
    font-size: 14px;
  }

  .item {
    padding: 18px 0;
  }

  .box-card {
    width: 480px;
  }
</style>
