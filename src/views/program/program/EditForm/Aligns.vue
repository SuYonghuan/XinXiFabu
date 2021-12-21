<template>
  <div class="aligns-row">
    <img
      :class="active && 'active'"
      v-for="icon in icons"
      :key="icon.type"
      :src="icon.url"
      alt=""
      @click="active && $emit('set', icon.type)"
    />
  </div>
</template>

<script>
import { aligns } from "./svgs";
export default {
  props: ["active"],
  computed: {
    icons() {
      return [
        "top",
        "middle",
        "bottom",
        "between-v",
        "left",
        "center",
        "right",
        "between-h",
      ].map((type) => ({
        type,
        url: aligns({ type, color: this.active ? "#666666" : "#999999" }),
      }));
    },
  },
};
</script>

<style lang="scss" scoped>
.aligns-row {
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  align-content: center;
  padding: 0 24px 12px 24px;
  img {
    width: 20px;
    height: 20px;
    &:active {
      opacity: 0.5;
    }
    cursor: not-allowed;
    &.active {
      cursor: default;
    }
  }
}
</style>
