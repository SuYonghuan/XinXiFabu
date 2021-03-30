<template>
  <el-container class="index-container">
    <el-aside class="left" :width="(collapsed ? 68 : 256) + 'px'">
      <leftNav
        :collapsed="collapsed"
        @toggleCollapse="collapsed = !collapsed"
      ></leftNav>
    </el-aside>
    <el-container class="right">
      <el-header class="header" height="80px"><topNav></topNav></el-header>
      <el-main class="main"> <router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script>
import leftNav from "components/left-nav/left-nav";
import topNav from "components/top-nav/top-nav";
export default {
  name: "index",
  data() {
    return { collapsed: false };
  },
  components: {
    leftNav,
    topNav,
  },
};
</script>

<style scoped lang="scss">
.index-container {
  width: 100vw;
  height: 100vh;
  background: #f6f6f6;
  > .left {
    transition: all 0.3s;
    overflow: hidden;
  }
  > .right {
    > .header {
      border-bottom: 1px solid #e6e7ec;
    }
    > .main {
      padding: 21px 64px;
    }
  }
}
</style>
