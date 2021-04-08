<template>
  <el-table
    v-if="canI.getprogrammelist"
    :data="list"
    :max-height="$root.tableMaxHeight + 'px'"
    ref="table"
  >
    <el-table-column type="index" key="index"></el-table-column>
    <el-table-column prop="name" key="name" label="节目名称"></el-table-column>
    <el-table-column prop="resolution" key="resolution" label="分辨率">
    </el-table-column>
    <el-table-column prop="duration" key="duration" label="时长">
    </el-table-column>
    <el-table-column key="fileSize" label="素材大小">
      <template slot-scope="scope">
        {{
          !scope.row.fileSize
            ? ""
            : scope.row.fileSize > 1073741824
            ? (scope.row.fileSize / 1073741824).toFixed(1) + "G"
            : scope.row.fileSize > 1048576
            ? (scope.row.fileSize / 1048576).toFixed(1) + "M"
            : scope.row.fileSize > 1024
            ? (scope.row.fileSize / 1024).toFixed(1) + "kb"
            : scope.row.fileSize + "b"
        }}
      </template>
    </el-table-column>
    <el-table-column
      prop="updateTime"
      key="updateTime"
      label="更新时间"
      :formatter="dateFormatter"
    ></el-table-column>
    <el-table-column
      prop="editor"
      key="editor"
      label="修改人"
    ></el-table-column>
    <el-table-column
      prop="operating"
      width="92px;"
      key="operating"
      label="操作"
    >
      <template slot-scope="scope">
        <el-button
          v-if="canI.editprogramme"
          class="svg-button"
          type="text"
          @click="$emit('editProgram', scope.row.code)"
        >
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconbianji"></use></svg
        ></el-button>
        <el-button
          v-if="canI.deleteprogramme"
          slot="reference"
          class="svg-button"
          type="text"
          @click="deleteRow(scope.row.code)"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconshanchu"></use></svg
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: ["list", "canI", "dateFormatter"],
  methods: {
    deleteRow(code) {
      this.$confirm("您确认要删除该节目?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$emit("deleteProgram", [code]);
      });
    },
  },
};
</script>

<style></style>
