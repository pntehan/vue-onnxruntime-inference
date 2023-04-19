<template>
    <!-- 导航栏 -->
    <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="1" style="font-size: 30px; color: darkorange;">深度学习图像去雾系统</el-menu-item>
      </el-menu>
</template>

<script>
export default {
  name: 'Navbar',
  data () {
    return {
      size: 50
    }
  }
}
</script>
