<template>
  <el-container>
    <el-header :height="headerHeight ? headerHeight : '70px'">
      <slot name="header"></slot>
    </el-header>
    <el-main>
      <slot></slot>
    </el-main>
    <el-footer height="32px">
      <slot name="footer"></slot>
    </el-footer>
  </el-container>
</template>
<script>
export default {
  props: ["headerHeight"],
};
</script>

<style></style>
