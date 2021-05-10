<template>
  <v-image
    :config="{
      ...getVideoImageProp(component.image, component),
      strokeEnabled: false,
      listening: false,
      zIndex: i + 0.5,
      image: component.image,
    }"
  />
</template>
<script>
export default {
  props: ["form", "i", "component"],
  methods: {
    getVideoImageProp(image, component) {
      const width = component.width;
      const height = component.height;
      const aspectRatio = width / height;

      let newWidth;
      let newHeight;

      const imageRatio = image.width / image.height;

      if (aspectRatio >= imageRatio) {
        newHeight = height;
        newWidth = height * imageRatio;
      } else {
        newWidth = width;
        newHeight = width / imageRatio;
      }
      let x = (width - newWidth) / 2 + component.offsetX;
      let y = (height - newHeight) / 2 + component.offsetY;
      return {
        x,
        y,
        width: newWidth,
        height: newHeight,
      };
    },
  },
};
</script>
