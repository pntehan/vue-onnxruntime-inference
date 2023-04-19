<template>
  <div id="app">
    <el-container>
      <!-- header -->
      <el-header class="header">
        <navbar></navbar>
      </el-header>
      <!-- main -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
      <!-- footer -->
      <el-footer class="foot">
        <footer>
          <a class="foot-text">2023@Copy Right.</a>
          <a class="foot-text">Author: Han Zhou</a>
          <a class="foot-text" style="margin-right: 0%;">pntehan@gmail.com</a>
        </footer>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: absolute;
  width: 100%;
  height: 100%;
}
.header {
  position: relative;
  width: 100%;
}
.main {
  position: relative;
  width: 100%;
  height: 100%;
}
.foot {
  position:relative;
  bottom: 0;
  width: 100%;
  background-color: #2c3e50;
  /* height: 20%; */
}
.foot-text {
  height: 60px;
  line-height: 60px;
  margin-right: 5%;
  color:aliceblue;
}
</style>
