<template>
  <canvas
    :class="'svga ' + (played ? 'played' : '')"
    ref="canvas"
    @click="played && replay()"
  ></canvas>
</template>

<script>
import { Parser, Player } from "svga";
const parser = new Parser();
export default {
  props: ["src"],
  data() {
    return { player: null, played: false };
  },
  watch: {
    src(value) {
      this.play(value);
    },
  },
  mounted() {
    this.player = new Player({
      container: this.$refs.canvas,
      loop: 1,
    });
    if (this.src) this.play(this.src);
  },
  beforeDestroy() {
    this.player.destroy();
    this.player = null;
    this.played = false;
  },
  methods: {
    async play(src) {
      const svga = await parser.load(src);
      await this.player.mount(svga);
      this.played = false;
      this.player.start();
      this.player.onEnd = () => {
        console.log("onEnd ");
        this.played = true;
      };
    },
    replay() {
      if (this.player) {
        this.played = false;
        this.player.start();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.svga {
  width: 100%;
  height: 100%;
  cursor: default;
  &.played {
    cursor: pointer;
  }
}
</style>
