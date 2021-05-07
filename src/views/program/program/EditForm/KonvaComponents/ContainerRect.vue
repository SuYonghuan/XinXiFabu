<template>
  <v-rect
    :key="i"
    :name="'name_' + i"
    :config="{
      x: component.offsetX,
      y: component.offsetY,
      width: component.width,
      height: component.height,
      draggable: true,
      strokeEnabled: false,
      zIndex: i,
      dragBoundFunc: (pos) => {
        return {
          x:
            pos.x < 0
              ? 0
              : pos.x > form.width - component.width
              ? form.width - component.width
              : pos.x,
          y:
            pos.y < 0
              ? 0
              : pos.y > form.height - component.height
              ? form.height - component.height
              : pos.y,
        };
      },
      ...(component.typeCode === 'text'
        ? {
            fill: component.backgroundColor,
            opacity: component.backgroundOpacity / 100,
          }
        : component.typeCode === 'video'
        ? {}
        : { fill: component.color }),
    }"
    @dragend="(e) => $emit('dragend', e)"
    @transformend="(e) => $emit('transformend', e)"
  ></v-rect>
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
