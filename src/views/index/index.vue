<template>
  <el-container style="width:100vw;height:100vh;">
    <el-aside :width="(collapsed ? 68 : 256) + 'px'">
      <leftNav
        :collapsed="collapsed"
        @toggleCollapse="collapsed = !collapsed"
      ></leftNav>
    </el-aside>
    <el-container style="background: #f6f6f6;">
      <el-header height="80px" style="border-bottom: 1px solid #e6e7ec;"
        ><topNav></topNav
      ></el-header>
      <el-main class="child-view"> <router-view /></el-main>
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
.index-content {
  position: relative;
  z-index: 5;
  background: #f6f6f6;
  display: flex;
  width: 100vw;
  height: 100vh;

  .child-view {
    height: calc(100vh - 81px) !important;
    padding: 40px 40px 0px 40px;
    background: #f6f6f6;
  }
}
</style>
