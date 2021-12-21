<template>
  <canvas class="svga" ref="canvas"></canvas>
</template>

<script>
import { Parser, Player } from "svga";
export default {
  props: ["src"],
  data() {
    return { parser: null, player: null };
  },
  watch: {
    src(value) {
      this.play(value);
    },
  },
  mounted() {
    this.parser = new Parser();
    this.player = new Player({
      container: this.$refs.canvas,
      loop: 0,
    });

    if (this.src) this.play(this.src);
  },
  beforeDestroy() {
    this.player.destroy();
    this.player = null;
    this.parser.destroy();
    this.parser = null;
  },
  methods: {
    async play(src) {
      const svga = await this.parser.load(src);
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
