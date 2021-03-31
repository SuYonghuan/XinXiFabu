<template>
  <el-container class="table-page">
    <el-header
      style="padding:0"
      :height="headerHeight ? headerHeight : '100px'"
    >
      <h2>{{ presentMenu.textCH }}</h2>
      <slot name="header"></slot>
    </el-header>
    <el-main style="padding:0">
      <slot></slot>
    </el-main>
  </el-container>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["presentMenu"]),
  },
  props: ["headerHeight"],
};
</script>

<style lang="scss">
.table-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
