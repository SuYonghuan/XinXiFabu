<template>
  <v-text
    :config="{
      x,
      y,
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
      fontSize,
      fontFamily,
      text,
    }"
  ></v-text>
</template>
<script>
export default {
  props: ["form", "i", "component", "componentTypes"],
  computed: {
    fontFamily() {
      return this.component.fontFamily ? this.component.fontFamily : undefined;
    },
    fontSize() {
      return this.component.fontSize ? this.component.fontSize : 24;
    },
    text() {
      const { component, componentTypes } = this;
      return component.materials && component.materials.length
        ? component.materials[0].text
        : componentTypes[component.typeCode];
    },
    x() {
      const { component, text, fontSize } = this;
      let { offsetX, width } = component;
      return text.length * fontSize > width
        ? offsetX
        : offsetX + (width - text.length * fontSize) / 2;
    },
    y() {
      const { component, fontSize } = this;
      return component.offsetY + (component.height - fontSize) / 2;
    },
  },
};
</script>
