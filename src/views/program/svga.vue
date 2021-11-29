<template>
  <canvas class="svga" ref="canvas"></canvas>
</template>

<script>
import { Parser, Player } from "svga";
const parser = new Parser();
export default {
  props: ["src"],
  data() {
    return { player: null };
  },
  watch: {
    src(value) {
      this.play(value);
    },
  },
  mounted() {
    this.player = new Player({
      container: this.$refs.canvas,
      loop: 0,
    });
    if (this.src) this.play(this.src);
  },
  beforeDestroy() {
    this.player.destroy();
    this.player = null;
  },
  methods: {
    async play(src) {
      const svga = await parser.load(src);
      await this.player.mount(svga);
      this.player.start();
    },
  },
};
</script>

<style lang="scss" scoped>
.svga {
  width: 100%;
  height: 100%;
  cursor: default;
}
</style>
