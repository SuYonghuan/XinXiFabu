<template>
  <div class="ctw">
    <el-checkbox-group v-model="checked" size="medium">
      <el-checkbox-button
        v-for="weekday in [
          '周一',
          '周二',
          '周三',
          '周四',
          '周五',
          '周六',
          '周日',
        ]"
        :label="weekday"
        :key="weekday"
        >{{ weekday }}</el-checkbox-button
      >
    </el-checkbox-group>
    <div style="margin-top:40px;">
      <el-button
        class="svg-suffix s"
        type="success"
        @click="$emit('submit', checked)"
        ><svg class="icon" aria-hidden="true">
          <use xlink:href="#icondui"></use></svg
        >确认</el-button
      >
      <el-button class="svg-suffix s" type="primary" @click="$emit('close')"
        ><svg class="icon" aria-hidden="true">
          <use xlink:href="#iconguanbi"></use></svg
        >取消</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checked: [],
    };
  },
  props: ["visible", "from"],
  watch: {
    visible(val) {
      if (val) this.checked = [this.from];
    },
  },
  mounted() {
    this.checked = [this.from];
  },
};
</script>

<style lang="scss">
.ctw {
  text-align: center;
  .el-button {
    &.svg-suffix {
      padding: 0 32px;
      height: 44px;
      line-height: 44px;
      font-weight: bold;
      font-size: 14px;
      border-radius: 8px;
      svg {
        font-size: 20px;
        margin-right: 8px;
      }
      &.s {
        + .s {
          margin-left: 8px;
        }
        &.is-disabled {
          color: #bbc1cc;
          &:focus,
          &:hover {
            color: #bbc1cc;
          }
        }

        padding: 0 16px;
        color: #fff;
        border: none;
      }
    }
  }
}
</style>
