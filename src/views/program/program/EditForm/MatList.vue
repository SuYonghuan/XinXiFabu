<template>
  <div>
    <h5>
      素材列表
      <el-button
        type="primary"
        @click="$emit('selectMat')"
        :disabled="data.length >= limit"
      >
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconjia"></use></svg
        >添加素材
        <span class="bstd">{{ data.length }}/{{ limit }}</span></el-button
      >
    </h5>
    <div v-for="(mat, i) in data" :key="mat.code + '_' + i" class="mat">
      <div :class="['ellipsis', mat.duration ? 'double' : '']">
        {{ mat.name }}
        <div class="duration" v-if="mat.duration">
          {{ formatter(mat.duration) }}
        </div>
      </div>
      <div class="btns">
        <svg
          v-if="i !== 0"
          class="icon"
          aria-hidden="true"
          @click="$emit('swap', [i, i - 1])"
        >
          <use xlink:href="#iconshang"></use>
        </svg>
        <svg
          v-if="i !== data.length - 1"
          class="icon"
          aria-hidden="true"
          @click="$emit('swap', [i, i + 1])"
        >
          <use xlink:href="#iconxia"></use>
        </svg>
        <svg class="icon" aria-hidden="true" @click="$emit('preview', mat)">
          <use xlink:href="#iconyanjing"></use>
        </svg>
        <svg class="icon" aria-hidden="true" @click="$emit('remove', i)">
          <use xlink:href="#iconshanchu"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["data", "limit"],
  methods: {
    formatter(ms) {
      return new Date(ms).toISOString().substr(11, 8);
    },
  },
};
</script>
<style lang="scss" scoped>
h5 {
  display: flex;
  justify-content: space-between;
  margin-top: -1px;
  font-weight: bold;
  font-size: 18px;
  line-height: 27px;
  padding-top: 24px;
  padding-left: 24px;
  padding-right: 12px;
  padding-bottom: 12px;
  color: #3a4763;
  border-top: 1px solid #e6e7ec;
  .el-button {
    width: 170px;
    height: 33px;
    line-height: 33px;
    font-weight: bold;
    font-size: 14px;
    border-radius: 6px;
    padding: 0;
    svg {
      font-size: 20px;
      margin-right: 8px;
      vertical-align: middle;
    }
    .bstd {
      margin-left: 8px;
    }
  }
}
.ellipsis {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .duration {
    font-size: 12px;
    font-family: BrownStd;
  }
  &.double {
    line-height: 22px;
  }
}
.mat {
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
  width: 284px;
  line-height: 45px;
  height: 45px;
  margin-left: 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #868f9f;
  .icon {
    font-size: 20px;
    cursor: pointer;
  }
  .icon + .icon {
    margin-left: 16px;
  }
  &:active {
    background: #f2f5fa;
  }
}
.mat + .mat {
  margin-top: 8px;
}
</style>
