<template>
  <table-page>
    <template v-slot:header>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col style="display:flex;">
          <span class="meta1">日程名称</span>
          <el-input
            class="input1"
            v-model="name"
            placeholder="请输入素材名称"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <span class="meta1">创建者</span>
          <el-input
            class="input1"
            v-model="creator"
            placeholder="请输入创建者"
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
            v-if="canI.addschedule"
            @click="handleAdd"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#iconjia"></use></svg
            >新增</el-button
          >
        </div>
      </el-row>
    </template>

    <el-table
      v-if="canI.getschedulelist"
      :data="list"
      @selection-change="handleSelectionChange"
      :max-height="$root.tableMaxHeight + 'px'"
      ref="table"
    >
      <el-table-column
        key="selection"
        type="selection"
        width="55"
        :selectable="(row) => !row.deviceCount"
      ></el-table-column>
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        prop="name"
        key="name"
        label="日程名称"
      ></el-table-column>
      <el-table-column
        prop="playMode"
        key="playMode"
        column-key="playMode"
        label="播放方式"
      >
        <template slot-scope="scope">
          {{ playModes[scope.row.playMode] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="statusCode"
        key="statusCode"
        column-key="statusCode"
        label="审核状态"
      >
        <template slot-scope="scope">
          <el-popover
            trigger="hover"
            v-if="scope.row.auditOpinion && scope.row.statusCode != 0"
            placement="top"
          >
            <div>
              {{ scope.row.auditOpinion }}
            </div>
            <el-link :underline="false" type="primary" slot="reference">
              {{ statusTypes[scope.row.statusCode] }}
            </el-link>
          </el-popover>
          <div v-else>{{ statusTypes[scope.row.statusCode] }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="创建者"
      ></el-table-column>
      <el-table-column prop="deviceCount" key="deviceCount" label="日程状态">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.deviceCount > 0"
            trigger="click"
            placement="bottom"
            width="550"
          >
            <schedule-devices :code="scope.row.code"></schedule-devices>
            <el-link :underline="false" type="primary" slot="reference">
              已发布
            </el-link>
          </el-popover>
          <div v-else>待发布</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="auditor"
        key="auditor"
        label="审核人"
      ></el-table-column>
      <el-table-column
        prop="addTime"
        key="addTime"
        label="创建时间"
        :formatter="dateFormatter"
      ></el-table-column>
      <el-table-column prop="desc" key="desc" label="描述">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div>
              {{ scope.row.desc }}
            </div>
            <div
              slot="reference"
              style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
            >
              {{ scope.row.desc }}
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        prop="operating"
        width="250px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <el-tooltip effect="light" content="编辑" placement="top">
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="canI.editschedule"
                @click="handleEdit(scope.row)"
                :disabled="scope.row.deviceCount > 0"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconbianji"></use></svg
              ></el-button>
            </span>
          </el-tooltip>
          <el-tooltip effect="light" content="查看" placement="top">
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="canI.getscheduleinfo"
                @click="handleDetail(scope.row)"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconyanjing"></use></svg
              ></el-button>
            </span>
          </el-tooltip>

          <el-tooltip effect="light" content="删除" placement="top">
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="canI.deleteschedule"
                @click="singleDelete([scope.row.code])"
                :disabled="scope.row.deviceCount > 0"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconshanchu"></use></svg
              ></el-button>
            </span>
          </el-tooltip>

          <el-tooltip effect="light" content="下架" placement="top">
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="canI.unpublishschedule"
                @click="handleUnpublish([scope.row.code])"
                :disabled="!(scope.row.deviceCount > 0)"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconxiajia"></use></svg
              ></el-button>
            </span>
          </el-tooltip>

          <el-tooltip effect="light" content="发布" placement="top">
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="canI.publishschedule"
                @click="
                  scheduleToPublish = scope.row;
                  showPublishForm = true;
                "
                :disabled="scope.row.statusCode != 1"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconfabu"></use></svg
              ></el-button>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col>
        <el-button
          class="svg-suffix s"
          plain
          :disabled="!toDelCodes.length"
          v-if="canI.deleteschedule"
          @click="bulkDelete"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconshanchu"></use></svg
          >删除</el-button
        ></el-col
      >
      <pagination
        :list="list"
        :page="pageIndex"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </el-row>
    <el-dialog
      :title="editCode ? '编辑日程' : '新建日程'"
      class="edit-schedule"
      append-to-body
      :visible.sync="showAddForm"
      fullscreen
    >
      <add-form
        :playModes="playModes"
        :showAddForm="showAddForm"
        :intervalTypes="intervalTypes"
        :resolutions="resolutions"
        :code="editCode"
        @closeAddForm="showAddForm = false"
        @added="postAdd"
        @saved="postSave"
      ></add-form>
    </el-dialog>
    <el-dialog title="日程详情" append-to-body :visible.sync="showDetailForm">
      <detail-form
        :playModes="playModes"
        :showForm="showDetailForm"
        :intervalTypes="intervalTypes"
        :resolutions="resolutions"
        :code="editCode"
        api="getDetail"
        @showForm="showDetailForm = false"
        @closeForm="showDetailForm = false"
      ></detail-form>
    </el-dialog>
    <el-dialog title="日程发布" append-to-body :visible.sync="showPublishForm">
      <publish-form
        :showForm="showPublishForm"
        @closeForm="showPublishForm = false"
        :resolutions="resolutions"
        :schedule="scheduleToPublish"
        @published="handlePublished"
      ></publish-form>
    </el-dialog>
  </table-page>
</template>

<script>
import { ScheduleApi, ProgramApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";
import AddForm from "./schedule/AddForm";
import DetailForm from "./schedule/DetailForm";
import PublishForm from "./schedule/PublishForm";
import ScheduleDevices from "./schedule/ScheduleDevices";

export default {
  data() {
    return {
      name: "",
      creator: "",
      list: [],
      pageIndex: 0,
      pageSize: 10,
      total: 0,
      statusCode: null,
      canI: {},
      showForm: false,
      isStaticForm: false,
      form: {},
      progress: 0,
      materialTypes: {},
      playModes: {},
      intervalTypes: {},
      resolutions: [],
      editCode: null,
      statusTypes: {
        0: "待审核",
        1: "审核通过",
        2: "不通过",
      },
      toDelCodes: [],
      showAddForm: false,
      showDetailForm: false,
      showPublishForm: false,
      scheduleToPublish: null,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    const [
      playModes,
      intervalTypes,
      { data: resolutions },
    ] = await Promise.all([
      ScheduleApi.getPlayModes(),
      ScheduleApi.getIntervalTypes(),
      ProgramApi.getResolutions(),
    ]);
    Object.assign(this, {
      playModes,
      intervalTypes,
      resolutions,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.getschedulelist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },

  methods: {
    handlePublished() {
      this.showPublishForm = false;
      this.getList();
    },
    postAdd() {
      this.reset();
      this.getList();
      this.showAddForm = false;
    },
    postSave() {
      this.getList();
      this.showAddForm = false;
    },
    async handleUnpublish(codes) {
      try {
        await this.$confirm("确定下架该日程吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const { code, msg } = await ScheduleApi.unpublish({ codes });
        this.$message({
          type: code === "200" ? "success" : "error",
          message: code === "200" ? "下架成功" : msg,
        });
        if (code === "200") this.getList();
      } catch (error) {}
    },
    async singleDelete(codes) {
      try {
        await this.$confirm("确定删除该日程吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const { code, msg } = await ScheduleApi.delete({ codes });
        this.$message({
          type: code === "200" ? "success" : "error",
          message: code === "200" ? "删除成功" : msg,
        });
        if (code === "200") this.getList();
      } catch (error) {}
    },
    async handleDelete(codes) {
      const { code, msg } = await ScheduleApi.delete({ codes });
      this.$message({
        type: code === "200" ? "success" : "error",
        message: code === "200" ? "删除成功" : msg,
      });
      if (code === "200") this.getList();
    },
    async bulkDelete() {
      try {
        await this.$confirm("您确认要进行批量删除吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await this.handleDelete(this.toDelCodes);
        this.toDelCodes = [];
      } catch (error) {}
    },
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    handleProgress({ percent }) {
      this.progress = percent;
    },
    handleAdd() {
      this.editCode = null;
      this.showAddForm = true;
    },
    handleEdit(row) {
      this.editCode = row.code;
      this.showAddForm = true;
    },
    handleDetail(row) {
      this.editCode = row.code;
      this.showDetailForm = true;
    },
    reset() {
      this.name = "";
      this.creator = "";
      this.pageIndex = 0;
      this.list = [];
      this.total = 0;
    },
    handleSelectionChange(data) {
      this.toDelCodes = data.map(({ code }) => code);
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
      const { pageIndex, pageSize, name, creator, statusCode } = this;
      const { code, data, msg } = await ScheduleApi.get({
        name,
        creator,
        statusCode,
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

  components: {
    AddForm,
    DetailForm,
    PublishForm,
    ScheduleDevices,
  },
};
</script>

<style scoped>
.tooltip-wrapper + .tooltip-wrapper {
  margin-left: 20px;
}
.gap {
  margin: 20px auto;
}
.prefix {
  margin-right: 10px;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.dialog-footer {
  text-align: center;
}
</style>
<style lang="scss">
.edit-schedule {
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
