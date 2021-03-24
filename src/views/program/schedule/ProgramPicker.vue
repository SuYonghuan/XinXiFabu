<template>
  <div>
    <el-input
      v-model="q"
      placeholder="节目搜索"
      suffix-icon="el-icon-search"
      @blur="getPrograms"
      @keyup.enter.native="getPrograms"
    ></el-input>

    <el-table
      :data="programs"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column type="expand" label="素材">
        <template slot-scope="props">
          <el-form label-position="left">
            <el-form-item
              v-for="mat in props.row.materials"
              :key="mat.code"
              :label="mat.name"
            >
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-view"
                @click="preview(mat)"
              ></el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="name" label="名称"> </el-table-column>
    </el-table>

    <el-pagination
      align="center"
      layout="prev, pager, next"
      :current-page.sync="pageIndex"
      @current-change="getPrograms"
      :total="total"
    />
    <el-dialog
      :title="previewMaterial && previewMaterial.name"
      append-to-body
      :visible.sync="showPreview"
    >
      <template v-if="previewMaterial">
        <object
          style="width:100%;min-height:500px;"
          :data="
            previewMaterial.fileUrl
              ? previewMaterial.fileUrl
              : previewMaterial.url
          "
        ></object>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ScheduleApi } from "../program.js";

export default {
  data() {
    return {
      programs: [],
      total: 0,
      pageIndex: 1,
      q: "",
      showPreview: false,
      previewMaterial: null,
    };
  },
  props: ["resolution"],
  mounted() {
    this.reset();
  },
  watch: {
    resolution() {
      this.getPrograms();
    },
  },
  methods: {
    preview(material) {
      this.previewMaterial = material;
      this.showPreview = true;
    },
    async getPrograms() {
      const { pageIndex, q, resolution } = this;
      const { data, code, msg } = await ScheduleApi.getPrograms({
        name: q,
        resolution,
        paging: 1,
        pageIndex,
        pageSize: 8,
      });
      if (code === "200") {
        const { list, allCount } = data;
        this.programs = list;
        this.total = allCount;
      } else this.$message({ type: "error", message: msg });
    },
    reset() {
      this.programs = [];
      this.total = 0;
      this.pageIndex = 1;
      this.q = "";
      this.getPrograms();
    },
    handleCurrentChange(program) {
      this.$emit("change", program);
    },
    handleCollapseChange(code) {
      if (code)
        this.$emit(
          "change",
          this.programs.find((program) => program.code === code)
        );
    },
  },
};
</script>

<style></style>
