<template>
  <el-slider
    class="time-slider"
    :show-tooltip="false"
    :max="86399"
    :disabled="!!disabled"
    :value="range ? range.map(hmsTo100) : null"
    @input="
      (val) => {
        if (!range && val[0] === 0 && val[1] === 86399) return;
        $emit('change', val.map(i00ToHms));
      }
    "
    range
  >
  </el-slider>
</template>

<script>
export default {
  props: ["range", "disabled"],
  methods: {
    i00ToHms(rest) {
      const hours = Math.floor(rest / 3600);
      rest -= 3600 * hours;
      const minutes = Math.floor(rest / 60);
      rest -= 60 * minutes;
      rest = Math.floor(rest);
      const hms = `${hours < 10 ? "0" + hours : hours}:${
        minutes < 10 ? "0" + minutes : minutes
      }:${rest < 10 ? "0" + rest : rest}`;
      return hms;
    },
    hmsTo100(str) {
      return str
        .split(":")
        .map((hms, i) => Number(hms) * Math.pow(60, 2 - i))
        .reduce((acc, nxt) => (acc += nxt));
    },
  },
};
</script>

<style lang="scss">
.time-slider {
  background: #fff;
  isolation: isolate;
  .el-slider__runway {
    height: 120px;
    margin: 0;
    background-image: url(./duration.svg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 8px;
    border: 1px solid #dadfe6;

    .el-slider__bar {
      opacity: 0.5;
      height: 120px;
    }
    .el-slider__button-wrapper {
      top: 42px;
      .el-slider__button {
        position: relative;
        width: 8px;
        height: 30px;
        background: #ffffff;
        border: 2px solid #2f6bff;
        opacity: 0.5;
        box-sizing: border-box;
        border-radius: 0;

        &::after {
          content: "";
          position: absolute;
          width: 0;
          height: 6px;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          opacity: 0.5;
          border: 2px solid #2f6bff;
        }
      }
    }
  }
}
</style>
