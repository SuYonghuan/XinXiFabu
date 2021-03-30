<template>
  <el-container class="table-page">
    <el-header
      style="padding:0"
      :height="headerHeight ? headerHeight : '144px'"
    >
      <el-breadcrumb>
        <el-breadcrumb-item>{{ presentMenu.parent }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ presentMenu.textCH }}</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>{{ presentMenu.textCH }}</h2>
      <slot name="header"></slot>
    </el-header>
    <el-main style="padding:0">
      <slot></slot>
    </el-main>
    <el-footer height="32px">
      <slot name="footer"></slot>
    </el-footer>
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
}
</style>
