<template>
  <div class="modal">
    <div class="btn primary" @click="$emit('close')">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconcha"></use>
      </svg>
      关闭
    </div>
    <div
      class="bg"
      :style="{
        width: program.width + 'px',
        height: program.height + 'px',
        background: program.backgroundColor,
        transform: 'scale(' + scale + ')',
      }"
    >
      <img
        class="bg-img"
        v-if="
          (program.backgroundMaterial && program.backgroundMaterial.fileUrl) ||
            program.backgroundMaterialUrl
        "
        :src="
          program.backgroundMaterial
            ? program.backgroundMaterial.fileUrl
            : program.backgroundMaterialUrl
        "
      />
      <template v-for="(component, i) in program.components">
        <el-carousel
          v-if="
            component.typeCode === 'image' &&
              component.materials &&
              component.materials.length
          "
          class="component"
          indicator-position="none"
          :key="i"
          :height="component.height + 'px'"
          trigger="none"
          :interval="
            (component.config
              ? component.config.transitionPeriod
              : component.transitionPeriod) * 1000
          "
          arrow="never"
          :style="{
            top: component.offsetY + 'px',
            left: component.offsetX + 'px',
            width: component.width + 'px',
            height: component.height + 'px',
            zIndex: 1000 + i,
          }"
        >
          <el-carousel-item v-for="(mat, j) in component.materials" :key="j">
            <img
              :style="{
                width: component.width + 'px',
                height: component.height + 'px',
              }"
              :src="mat.fileUrl"
            />
          </el-carousel-item>
        </el-carousel>
        <video
          :key="i"
          class="component"
          v-else-if="
            component.typeCode === 'video' &&
              component.materials &&
              component.materials.length
          "
          autoplay
          playsinline
          :src="component.materials[handle[i]].fileUrl"
          @ended="handleEnded($event, component, i)"
          :style="{
            top: component.offsetY + 'px',
            left: component.offsetX + 'px',
            width: component.width + 'px',
            height: component.height + 'px',
            zIndex: 1000 + i,
          }"
        ></video>
        <div
          :key="i"
          class="component"
          v-else-if="
            component.typeCode === 'text' &&
              component.materials &&
              component.materials.length
          "
          :style="{
            fontSize:
              (component.config ? component.config : component).fontSize + 'px',
            color: (component.config ? component.config : component).fontColor,
            lineHeight: 1,
            fontWeight: (component.config
              ? component.config
              : component
            ).fontStyle.includes('加粗')
              ? 'bold'
              : 'normal',
            fontStyle: (component.config
              ? component.config
              : component
            ).fontStyle.includes('斜体')
              ? 'italic'
              : 'normal',
            top: component.offsetY + 'px',
            left: component.offsetX + 'px',
            width: component.width + 'px',
            height: component.height + 'px',
            zIndex: 1000 + i,
          }"
        >
          <div
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (component.config ? component.config : component)
                .backgroundColor,
              opacity:
                (component.config ? component.config : component)
                  .backgroundOpacity + '%',
            }"
          ></div>
          <v-text-marquee
            :content="component.materials[0].text"
          ></v-text-marquee>
        </div>
        <img
          :key="i"
          class="component"
          :src="
            svgs({
              type: component.typeCode,
              style:
                (component.config ? component.config : component).style || 0,
              backgroundColor: (component.config ? component.config : component)
                .backgroundColor,
              color: (component.config ? component.config : component)
                .fontColor,
            })
          "
          v-else-if="
            component.typeCode === 'weather' || component.typeCode === 'clock'
          "
          :style="{
            top: component.offsetY + 'px',
            left: component.offsetX + 'px',
            width: component.width + 'px',
            height: component.height + 'px',
            zIndex: 1000 + i,
          }"
        />
        <iframe
          :key="i"
          :id="i"
          scrolling="no"
          class="component"
          v-else-if="
            (component.typeCode === 'html' || component.typeCode === 'url') &&
              component.materials &&
              component.materials.length
          "
          :src="
            component.typeCode === 'html'
              ? component.materials[0].fileUrl
              : component.materials[0].url
          "
          :style="{
            top: component.offsetY + 'px',
            left: component.offsetX + 'px',
            width: component.width + 'px',
            height: component.height + 'px',
            zIndex: 1000 + i,
          }"
          frameborder="0"
        ></iframe>
        <audio
          :key="i"
          v-else-if="
            component.typeCode === 'audio' &&
              component.materials &&
              component.materials.length
          "
          :src="component.materials[handle[i]].fileUrl"
          autoplay
          loop
        ></audio>
      </template>
    </div>
    <div
      class="progress"
      :style="{
        width: program.width * scale + 'px',
      }"
    >
      <div class="green" :style="{ width: percent }"></div>
      <div class="key" :style="{ left: percent }"></div>
      <div>{{ hms(seconds) }}/{{ hms(duration) }}</div>
    </div>
  </div>
</template>

<script>
import videoPlaceHolder from "./video-unsupported.png";
import { VTextMarquee } from "vue-text-marquee";
import { svgs } from "./EditForm/svgs.js";
export default {
  components: { VTextMarquee },
  data() {
    return {
      seconds: 0,
      duration: 60,
      handle: new Array(16).fill(0),
      intervals: [],
    };
  },
  props: ["program"],
  computed: {
    scale() {
      if (!this.program) return 0;
      return Math.min(
        (this.$root.ww - 80) / this.program.width,
        (this.$root.wh - 120) / this.program.height
      );
    },
    percent() {
      return (this.seconds / this.duration) * 100 + "%";
    },
  },
  mounted() {
    let duration = this.program.duration
      ? this.program.duration
          .split(":")
          .reduce(
            (acc, nxt, i) => (acc += Number(nxt) * Math.pow(60, 2 - i)),
            0
          )
      : 60;
    if (!duration) duration = 60;
    this.duration = duration;

    this.intervals.push(
      setInterval(() => {
        if (this.seconds >= duration)
          this.$emit("refresh", new Date().getTime());
        this.seconds++;
      }, 1000)
    );
    this.program.components.forEach((component, i) => {
      if (component.typeCode === "url") {
        let refreshPeriod = (component.config || component).refreshPeriod;
        if (!refreshPeriod || refreshPeriod === "00:00:00") return;
        const period =
          refreshPeriod
            .split(":")
            .reduce(
              (acc, nxt, i) => (acc += Number(nxt) * Math.pow(60, 2 - i)),
              0
            ) * 1000;
        this.intervals.push(
          setInterval(() => {
            document.getElementById(i).src = document.getElementById(i).src;
          }, period)
        );
      }
    });
  },
  beforeDestroy() {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
  },

  methods: {
    handleEnded(e, component, i) {
      const video = e.target;
      video.pause();
      this.handle[i] = (this.handle[i] + 1) % component.materials.length;
      const mat = component.materials[this.handle[i]];
      video.src = mat.fileUrl;
      video.poster = mat.previewPath;
      video.load();
      const promise = video.play();
      if (promise) {
        promise.catch(() => {
          video.poster = videoPlaceHolder;
          setTimeout(() => {
            this.handleEnded(e, component, i);
          }, mat.duration);
        });
      }
    },
    svgs,
    hms(seconds) {
      const hours = Math.floor(seconds / 3600);
      seconds -= 3600 * hours;
      const minutes = Math.floor(seconds / 60);
      seconds -= 60 * minutes;
      seconds = Math.floor(seconds);
      const hms = `${hours < 10 ? "0" + hours : hours}:${
        minutes < 10 ? "0" + minutes : minutes
      }:${seconds < 10 ? "0" + seconds : seconds}`;
      return hms;
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .progress {
    position: absolute;
    top: calc(100vh - 53px);
    border-top: 2px solid #ccd0d9;
    left: 0;
    right: 0;
    margin: auto;
    padding-top: 9px;
    font-family: BrownStd;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 17px;
    color: #3a4763;
    .green {
      position: absolute;
      top: -2px;
      left: 0;
      z-index: 1;
      border-top: 2px solid #12b362;
      transition: all 1s linear;
    }
    .key {
      z-index: 2;
      position: absolute;
      width: 20px;
      height: 20px;
      top: -11px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 1s linear;
    }
  }
  .btn {
    vertical-align: middle;
    text-align: left;
    position: absolute;
    top: 18px;
    right: 64px;
    display: inline-block;
    width: 88px;
    height: 44px;
    line-height: 44px;
    padding-left: 44px;
    border: 1px solid #e6eaf0;
    border-radius: 8px;
    color: #868f9f;
    cursor: pointer;
    svg {
      position: absolute;
      top: 12.5px;
      left: 16px;
      font-weight: bold;
      font-size: 20px;
    }
    &.success,
    &.primary {
      border: none;
      color: #fff;
    }
    &.success {
      background: #12b362;
    }
    &.primary {
      background: #2f6bff;
    }
  }
  .bg {
    position: relative;
    overflow: hidden;
    transform-origin: top center;
    margin: auto;
    border: 2px solid #2f6bff;
    margin-top: 40px;
    * {
      user-select: none;
    }
    .bg-img {
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    .component {
      position: absolute;
    }
    video {
      object-fit: contain;
    }
    iframe {
      overflow: hidden;
      pointer-events: none;
    }
  }
}
</style>
