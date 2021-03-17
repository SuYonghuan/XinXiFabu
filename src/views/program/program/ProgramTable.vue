<template>
  <el-table v-if="canI.getprogrammelist" :data="list" border stripe ref="table">
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
      width="220px;"
      key="operating"
      label="操作"
    >
      <template slot-scope="scope">
        <el-button
          v-if="canI.editprogramme"
          size="mini"
          type="primary"
          @click="$emit('editProgram', scope.row.code)"
          >编辑</el-button
        >
        <el-popconfirm
          v-if="canI.deleteprogramme"
          style="margin-left: 10px;"
          confirm-button-text="好的"
          cancel-button-text="不用了"
          icon="el-icon-info"
          icon-color="red"
          title="确定删除该节目吗？"
          @confirm="$emit('deleteProgram', [scope.row.code])"
        >
          <el-button slot="reference" size="mini" type="danger">删除</el-button>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: ["list", "canI", "dateFormatter"],
};
</script>

<style></style>
