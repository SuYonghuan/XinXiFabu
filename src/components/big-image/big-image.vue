<template>
  <div class="big-image-content" @click="close">
    <img :src="src" alt="" v-if="type == '图片'">
    <video :src="src" controls="controls" autoplay v-else></video>
  </div>
</template>

<script>
	export default {
		name: "big-image",
		props: {
			src: {
				type: String,
				default: ''
			},
			type: {
				type: String,
				default: '图片'
			},
		},
      created() {
			  console.log(this.src)
      },
		methods: {
			close() {
				this.$emit('closeImg');
			}
		},
	}
</script>

<style scoped lang="scss">
  .big-image-content {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;

    img, video {
      max-height: 1080px;
    }
  }
</style>
