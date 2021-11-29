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
        flex: `0 0 ${program.width}px`,
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

        <template
          v-else-if="
            component.typeCode === 'video' &&
              component.materials &&
              component.materials.length
          "
        >
          <video
            :key="`video_${i}_video`"
            class="component"
            :ref="`video_${i}_video`"
            playsinline
            :style="{
              top: component.offsetY + 'px',
              left: component.offsetX + 'px',
              width: component.width + 'px',
              height: component.height + 'px',
              zIndex: 1000 + i,
            }"
          ></video>
          <img
            :key="`video_${i}_img`"
            :ref="`video_${i}_img`"
            class="component"
            :style="{
              top: component.offsetY + 'px',
              left: component.offsetX + 'px',
              width: component.width + 'px',
              height: component.height + 'px',
              zIndex: 1000 + i,
            }"
          />
        </template>
        <svga
          class="component"
          :style="{
            top: component.offsetY + 'px',
            left: component.offsetX + 'px',
            width: component.width + 'px',
            height: component.height + 'px',
            zIndex: 1000 + i,
          }"
          v-else-if="
            component.typeCode === 'svga' &&
              component.materials &&
              component.materials.length
          "
          :key="i"
          :src="component.materials[0].fileUrl"
        ></svga>
        <div
          :key="i"
          class="component"
          v-else-if="
            component.typeCode === 'text' &&
              component.materials &&
              component.materials.length
          "
          :style="textComponentStyle(component, i)"
        >
          <div
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: (component.config ? component.config : component)
                .backgroundColor,
              opacity:
                (component.config ? component.config : component)
                  .backgroundOpacity + '%',
            }"
          ></div>
          <template
            v-if="
              (component.config ? component.config : component).animation ===
                '自动'
            "
          >
            <span
              style="white-space: nowrap;"
              v-if="
                component.materials[0].text.length *
                  (component.config ? component.config : component).fontSize <
                  component.width
              "
              >{{ component.materials[0].text }}</span
            >
            <v-text-marquee
              v-else
              :content="component.materials[0].text"
            ></v-text-marquee>
          </template>
          <span
            style="white-space: nowrap;"
            v-else-if="
              (component.config ? component.config : component).animation ===
                '固定'
            "
            >{{ component.materials[0].text }}</span
          >
          <v-text-marquee
            v-else
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
import svga from "../svga.vue";
const playVideo = (video, src, poster, duration) =>
  new Promise((resolve, reject) => {
    if (video.id === "destroyed") reject();
    video.pause();
    video.src = src;
    video.style.visibility = "visible";
    video.poster = poster;
    video.load();
    video
      .play()
      .then(() => {
        const listener = video.addEventListener("ended", () => {
          video.pause();
          video.removeEventListener("ended", listener);
          video.style.visibility = "hidden";
          resolve();
        });
      })
      .catch(() => {
        video.pause();
        video.poster = videoPlaceHolder;
        setTimeout(() => {
          video.style.visibility = "hidden";
          resolve();
        }, duration);
      });
  });
const playImage = (img, src, duration) =>
  new Promise((resolve, reject) => {
    if (img.id === "destroyed") reject();
    img.src = src;
    img.style.visibility = "visible";
    setTimeout(() => {
      img.style.visibility = "hidden";
      img.src = "";
      resolve();
    }, duration);
  });
export default {
  components: { VTextMarquee, svga },
  data() {
    return {
      seconds: 0,
      duration: 60,
      handle: new Array(16).fill(0),
      intervals: [],
      doms: [],
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
      } else if (component.typeCode === "video") {
        let transitionPeriod =
          (component.config || component).transitionPeriod || 15;
        const video = this.$refs[`video_${i}_video`][0];
        const img = this.$refs[`video_${i}_img`][0];
        this.doms.push(video, img);
        const playSeries = async () => {
          for (let mat of component.materials) {
            const { typeCode, fileUrl, previewPath, duration } = mat;
            await (typeCode === "图片"
              ? playImage(img, fileUrl, transitionPeriod * 1000)
              : playVideo(video, fileUrl, previewPath, duration));
          }

          await playSeries();
        };
        playSeries();
      }
    });
  },
  beforeDestroy() {
    this.doms.forEach((dom) => {
      if (dom.pause) dom.pause();
      dom.id = "destroyed";
    });
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
  },

  methods: {
    textComponentStyle(component, i) {
      return {
        fontSize:
          (component.config ? component.config : component).fontSize + "px",
        fontFamily: (component.config ? component.config : component)
          .fontFamily,
        color: (component.config ? component.config : component).fontColor,
        lineHeight: component.height + "px",
        fontWeight: (component.config
          ? component.config
          : component
        ).fontStyle.includes("加粗")
          ? "bold"
          : "normal",
        fontStyle: (component.config
          ? component.config
          : component
        ).fontStyle.includes("斜体")
          ? "italic"
          : "normal",
        top: component.offsetY + "px",
        left: component.offsetX + "px",
        width: component.width + "px",
        height: component.height + "px",
        zIndex: 1000 + i,
        overflow: "hidden",
        textAlign: "center",
      };
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
  display: flex;
  justify-content: center;
  align-items: center;
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
    top: 5px;
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
