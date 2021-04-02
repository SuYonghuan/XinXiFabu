<template>
  <div>
    <div
      :class="(activeComponent ? '' : 'selected') + ' component-item'"
      @click="$emit('selectBg')"
    >
      <svg class="icon icon-avatar" aria-hidden="true">
        <use xlink:href="#iconhuaban"></use>
      </svg>
      背景
    </div>
    <draggable :list="list" @change="handleChange" :sort="true">
      <div
        v-for="(component, i) in list"
        :key="'a' + i"
        :class="
          (activeComponent === component ? 'selected' : '') + ' component-item'
        "
        @click="$emit('selectComponent', i)"
      >
        <svg
          class="icon icon-avatar"
          aria-hidden="true"
          :style="`color:${component.color}`"
        >
          <use :xlink:href="logos[component.typeCode]"></use>
        </svg>
        <span>{{ componentTypes[component.typeCode] }}组件</span>
        <div>
          <svg
            class="icon btn"
            aria-hidden="true"
            style="margin-left: 16px"
            @click="$emit('remove', i)"
          >
            <use xlink:href="#iconshanchu"></use>
          </svg>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
export default {
  props: ["list", "activeComponent", "logos", "componentTypes"],
  components: { draggable },
  methods: {
    handleChange(data) {
      console.log(data);
    },
  },
};
</script>

<style lang="scss" scoped>
.component-item {
  position: relative;
  display: flex;
  margin: 0 12px;
  padding-left: 48px;
  padding-right: 12px;
  font-size: 14px;
  line-height: 45px;
  height: 45px;
  justify-content: space-between;
  cursor: pointer;
  color: #868f9f;
  border-radius: 6px;
  white-space: nowrap;
  .icon-avatar {
    position: absolute;
    font-size: 20px;
    top: 13px;
    left: 12px;
  }
  .btn {
    font-size: 20px;
    &.hidden {
      visibility: hidden;
      cursor: none;
    }
  }
  .btn + .btn {
    margin-left: 8px;
  }
  &.selected {
    background: #2f6bff;
    color: #fff;
  }
}
</style>
