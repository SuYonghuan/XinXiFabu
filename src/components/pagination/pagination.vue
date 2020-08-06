<template>
  <el-pagination
    @current-change="handleCurrentChange"
    :page-sizes="pageSizes"
    :current-page="page"
    :page-size="pageSize"
    layout="total, prev, pager, next, jumper"
    :total="total"
    :prev-click="prevClick"
    :next-click="nextClick"
  />
</template>
<script>
export default {
  name: 'Pagination',
  props: {
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30, 40]
    },
    list: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },

  methods: {
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val)
    },
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val)
    },
    prevClick() {
      this.$emit('prevClick', this.page)
    },
    nextClick() {
      this.$emit('nextClick', this.page)
    }
  }
}
</script>
