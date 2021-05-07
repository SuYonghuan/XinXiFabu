<template>
  <v-image
    :config="{
      x: 0,
      y: 0,
      width: form.width,
      height: form.height,
      draggable: false,
      image: backgroundImage,
      strokeEnabled: false,
      zIndex: -1,
    }"
  ></v-image>
</template>
<script>
export default {
  props: ["form", "backgroundImage"],
};
</script>
