<template>
  <v-text
    :config="{
      x: component.offsetX,
      y: component.offsetY,
      width: component.width,
      height: component.height,
      strokeEnabled: false,
      fill: component.fontColor,
      listening: false,
      fontStyle:
        component.fontStyle === '正常'
          ? 'normal'
          : component.fontStyle === '加粗'
          ? 'bold'
          : component.fontStyle === '斜体'
          ? 'italic'
          : component.fontStyle === '加粗、斜体'
          ? 'bold italic'
          : 'normal',
      wrap: 'none',
      fontSize: component.fontSize,
      text: component.materials.length
        ? component.materials[0].text
        : '请选择素材',
    }"
  ></v-text>
</template>
<script>
export default {
  props: ["form", "i"],
  computed: {
    component() {
      return this.form.components[this.i];
    },
  },
};
</script>
