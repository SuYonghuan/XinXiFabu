<template>
  <table-page>
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>信息发布</el-breadcrumb-item>
        <el-breadcrumb-item>节目制作</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col>
          <span class="prefix">节目名称</span>
          <el-input
            class="prefix"
            v-model="name"
            placeholder="请输入节目名称"
            style="width: 200px"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <el-button
            @click="getList"
            size="small"
            type="primary"
            icon="el-icon-search"
            >搜索</el-button
          >
        </el-col>
        <div style="width: 400px; text-align: right">
          <el-button
            size="small"
            type="primary"
            v-if="canI.addprogramme"
            @click="addProgram"
            >新增</el-button
          >
        </div>
      </el-row>
    </template>
    <program-table
      :list="list"
      :canI="canI"
      :dateFormatter="dateFormatter"
      @editProgram="editProgram"
      @deleteProgram="deleteProgram"
    ></program-table>
    <pagination
      :list="list"
      :page="pageIndex"
      :total="total"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />
    <el-dialog title="新增节目" append-to-body :visible.sync="showAddForm">
      <add-form
        :resolutions="resolutions"
        :showAddForm="showAddForm"
        @closeAddForm="showAddForm = false"
        @submitAddForm="submitAddForm"
      ></add-form>
    </el-dialog>
    <el-dialog
      title="节目制作"
      append-to-body
      :visible.sync="showEditForm"
      fullscreen
    >
      <edit-form
        :showEditForm="showEditForm"
        :code="editCode"
        @close="showEditForm = false"
        @saved="
          getList();
          showEditForm = false;
        "
      ></edit-form>
    </el-dialog>
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import pagination from "../../components/pagination/pagination";
import { ProgramApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";
import ProgramTable from "./program/ProgramTable";
import AddForm from "./program/AddForm";
import EditForm from "./program/EditForm";

export default {
  data() {
    return {
      name: "",
      list: [],
      pageIndex: 0,
      pageSize: 10,
      total: 0,
      canI: {},
      showAddForm: false,
      showEditForm: false,
      showSelectMaterial: false,
      resolutions: [],

      editCode: null,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
    await this.getResolutions();
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.getprogrammelist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },
  methods: {
    async getResolutions() {
      const { code, data, msg } = await ProgramApi.getResolutions();
      if (code === "200") this.resolutions = data;
      else this.$message({ message: msg, type: "error" });
    },
    async submitAddForm({ name, resolution }) {
      const res = await ProgramApi.post({
        name,
        resolution,
      });
      if (res.code !== "200") return this.$message.error(res.msg);
      this.$message.success(res.msg);
      this.getList();
      this.showAddForm = false;
    },
    async deleteProgram(codes) {
      const { code, msg } = await ProgramApi.delete({ codes });
      this.$message({
        type: code === "200" ? "success" : "error",
        message: code === "200" ? "删除成功" : msg,
      });
      if (code === "200") this.getList();
    },
    addProgram() {
      this.showAddForm = true;
    },
    editProgram(code) {
      this.editCode = code;
      this.showEditForm = true;
    },
    dateFormatter(row) {
      let [date, time] = row.updateTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getList();
    },
    async getList() {
      const { pageIndex, pageSize, name } = this;
      const { code, data, msg } = await ProgramApi.get({
        name,
        paging: 1,
        pageIndex,
        pageSize,
      });
      if (code == "200") {
        const { list, allCount } = data;
        this.list = list;
        this.total = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
  },
  components: { TablePage, pagination, ProgramTable, AddForm, EditForm },
};
</script>

<style scoped>
.gap {
  margin: 20px auto;
}

.prefix {
  margin-right: 10px;
}
</style>
