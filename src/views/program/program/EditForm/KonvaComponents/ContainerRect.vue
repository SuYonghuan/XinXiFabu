<template>
  <v-rect
    :key="i"
    :name="'name_' + i + (j !== undefined ? '_' + j : '')"
    :config="config"
    @dragend="(e) => $emit('dragend', e)"
    @transformend="(e) => $emit('transformend', e)"
  ></v-rect>
</template>
<script>
export default {
  props: ["form", "i", "j", "component"],
  computed: {
    config() {
      const { form, i, component } = this;
      return {
        x: component.offsetX,
        y: component.offsetY,
        width: component.width,
        height: component.height,
        draggable: true,
        zIndex: i,
        stroke: component.color,
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
        ...(component.typeCode === "text" ||
        component.typeCode.includes("signTxt")
          ? {
              fill: component.backgroundColor,
              opacity: component.backgroundOpacity / 100,
            }
          : {}),
      };
    },
  },
};
</script>
