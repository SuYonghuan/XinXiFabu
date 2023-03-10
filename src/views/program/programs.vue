<template>
  <table-page>
    <template v-slot:header>
      <el-row type="flex" justify="space-between">
        <el-col style="display:flex;">
          <span class="meta1">节目名称</span>
          <el-input
            class="input1 big"
            v-model="name"
            placeholder="关键字搜索"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <div class="btn1" @click="getList">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconsousuo"></use>
            </svg>
          </div>
        </el-col>
        <div style="width: 400px; text-align: right">
          <el-button
            class="svg-suffix"
            type="primary"
            v-if="canI.addprogramme"
            @click="addProgram"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#iconjia"></use></svg
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
      @getSchedules="getSchedules"
    ></program-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col></el-col>
      <pagination
        :list="list"
        :page="pageIndex"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </el-row>
    <el-dialog title="新增节目" append-to-body :visible.sync="showAddForm">
      <add-form
        :resolutions="resolutions"
        :showAddForm="showAddForm"
        @closeAddForm="showAddForm = false"
        @submitAddForm="submitAddForm"
      ></add-form>
    </el-dialog>
    <el-dialog
      class="edit-program"
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
    <el-dialog
      title="关联日程列表"
      append-to-body
      :visible.sync="showSchedules"
    >
      <el-table :data="schedules">
        <el-table-column
          prop="name"
          key="name"
          label="日程名称"
        ></el-table-column>

        <el-table-column
          prop="addTime"
          key="addTime"
          label="创建时间"
          :formatter="dateFormatter"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </table-page>
</template>

<script>
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
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      canI: {},
      showAddForm: false,
      showEditForm: false,
      showSelectMaterial: false,
      resolutions: [],
      editCode: null,
      showSchedules: false,
      schedules: [],
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
    async getSchedules(code) {
      const { data } = await ProgramApi.getSchedules({
        code,
      });
      this.schedules = data;
      this.showSchedules = true;
    },
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
      const programCode = res.data;
      this.editProgram(programCode);
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
        const { list, allCount, allPage } = data;
        if (pageIndex > allPage) {
          this.total = allCount;
          this.pageIndex = allPage;
          return this.getList();
        }
        this.list = list;
        this.total = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
  },
  components: { ProgramTable, AddForm, EditForm },
};
</script>

<style lang="scss" scoped>
.gap {
  margin: 20px auto;
}

.prefix {
  margin-right: 10px;
}
</style>
<style lang="scss">
.edit-program {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    width: 100%;
    height: 100%;
    padding: 0;
  }
}
</style>
