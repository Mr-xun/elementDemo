<template>
  <div id="app">

    <el-container>
        <el-main id="mainBox">
          <router-view/>
        </el-main>
    </el-container>

  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {}
    },
    created() {

    },
    mounted() {
    },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
  }

  .el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
    position: fixed;
    width: 100%;
    z-index: 2;
  }

  .el-aside {
    background-color: #545c64;
    margin-top: 60px;
    color: #333;
    text-align: center;
    overflow-y: scroll;
  }

  .el-main {
    margin-top: 60px;
    color: #333;
    overflow-y: scroll;
    /*height: 100%;*/
  }

  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }

  .affix {
    position: fixed;
    width: 201px;
  }
</style>
