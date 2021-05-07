<template>
  <v-rect
    name="backgroundColor"
    :config="{
      x: 0,
      y: 0,
      width: form.width,
      height: form.height,
      draggable: false,
      fill: form.backgroundColor,
      strokeEnabled: false,
      zIndex: -2,
    }"
  ></v-rect>
</template>
<script>
export default {
  props: ["form"],
};
</script>
