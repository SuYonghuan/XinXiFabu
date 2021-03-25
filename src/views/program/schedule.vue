<template>
  <table-page class="index schedule">
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>信息发布</el-breadcrumb-item>
        <el-breadcrumb-item>日程管理</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col>
          <span class="prefix">日程名称</span>
          <el-input
            class="prefix"
            v-model="name"
            placeholder="请输入素材名称"
            style="width: 200px"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <span class="prefix">创建者</span>
          <el-input
            class="prefix"
            v-model="creator"
            placeholder="请输入创建者"
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
            v-if="canI.publishschedule"
            @click="addStatic"
            >日程发布</el-button
          >
          <el-button
            size="small"
            type="primary"
            v-if="canI.addschedule"
            @click="handleAdd"
            >新建日程</el-button
          >
          <el-button
            size="small"
            :disabled="!toDelCodes.length"
            type="danger"
            v-if="canI.deleteschedule"
            @click="bulkDelete"
            >批量删除</el-button
          >
        </div>
      </el-row>
    </template>

    <el-table
      v-if="canI.getschedulelist"
      :data="list"
      @selection-change="handleSelectionChange"
      height="620px"
      ref="table"
      @filter-change="handleFilterChange"
    >
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        key="selection"
        type="selection"
        width="55"
      ></el-table-column>
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
          {{ statusTypes[scope.row.statusCode] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="创建者"
      ></el-table-column>
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
          <el-tooltip placement="top">
            <div slot="content" style="max-width:300px;">
              {{ scope.row.desc }}
            </div>
            <div
              style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
            >
              {{ scope.row.desc }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="operating"
        width="300px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            v-if="canI.editschedule"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="success"
            v-if="canI.getscheduleinfo"
            @click="handleDetail(scope.row)"
            >查看</el-button
          >
          <el-button size="mini" type="warning" v-if="canI.unpublishschedule"
            >下架</el-button
          >
          <el-popconfirm
            v-if="canI.deleteschedule"
            style="margin-left: 10px;"
            confirm-button-text="好的"
            cancel-button-text="不用了"
            icon="el-icon-info"
            icon-color="red"
            title="确定删除该素材吗？"
            @confirm="handleDelete([scope.row.code])"
          >
            <el-button slot="reference" size="mini" type="danger"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :list="list"
      :page="pageIndex"
      :total="total"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />
    <el-dialog
      :title="editCode ? '编辑日程' : '新建日程'"
      append-to-body
      :visible.sync="showAddForm"
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
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import pagination from "../../components/pagination/pagination";
import { ScheduleApi, ProgramApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";
import AddForm from "./schedule/AddForm";
import DetailForm from "./schedule/DetailForm";

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
      typeCode: null,
      auditTypes: {},
      statusTypes: {
        0: "待审核",
        1: "审核通过",
        2: "不通过",
      },
      showModal: false,
      modalMat: null,
      toDelCodes: [],
      showAddForm: false,
      showDetailForm: false,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
    dialogTitle() {
      return (
        (this.form.code ? "编辑" : "创建") +
        (this.isStaticForm ? "本地" : "动态") +
        "素材"
      );
    },
    isStatic() {
      return (
        this.form.typeCode !== "在线网页" &&
        this.form.typeCode !== "流媒体" &&
        this.form.typeCode !== "ipc"
      );
    },
    isIpc() {
      return this.form.typeCode === "ipc";
    },

    materialTypeFilters() {
      return Object.entries(this.materialTypes).map(([v, k]) => ({
        text: k,
        value: v,
      }));
    },
    statusTypeFilters() {
      return Object.entries(this.statusTypes).map(([v, k]) => ({
        text: k,
        value: Number(v),
      }));
    },
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
      console.log(this.canI);
      if (this.canI.getschedulelist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },

  methods: {
    postAdd() {
      this.reset();
      this.getList();
      this.showAddForm = false;
    },
    postSave() {
      this.getList();
      this.showAddForm = false;
    },
    handleFilterChange({ typeCode, statusCode }) {
      this.typeCode = !typeCode || !typeCode.length ? null : typeCode[0];
      this.statusCode =
        !statusCode || !statusCode.length ? null : statusCode[0];
      this.getList();
    },
    handleTypeCodeChange(val) {
      if (val === "ipc") {
        this.form = {
          typeCode: val,
          ipType: "IPV4",
          ipAddress: "",
          port: 554,
          channel: "ch1",
          userName: "",
          password: "",
          protocol: "TCP",
          bitRateType: "main",
          desc: "",
        };
      } else {
        this.form = {
          typeCode: val,
          name: "",
          url: "",
          desc: "",
        };
      }

      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
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
    addStatic() {
      this.form = {
        name: "",
        file: [],
        auditType: "",
        desc: "",
        sameReplace: true,
      };
      this.isStaticForm = true;
      this.progress = 0;
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
        this.showForm = true;
      });
    },
    addDynamic() {
      this.form = {
        typeCode: "在线网页",
        name: "",
        url: "",
        desc: "",
      };
      this.isStaticForm = false;
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
        this.showForm = true;
      });
    },

    reset() {
      this.name = "";
      this.creator = "";
      this.pageIndex = 0;
      this.list = [];
      this.total = 0;
    },
    onUpload(change) {
      if (change.response) {
        const { data, msg, code } = change.response;
        if (code === ERR_OK) {
          this.form.file = [
            {
              name: data.fileGuid,
              url: change.url,
            },
          ];
          this.progress = 100;
          this.$refs.form && this.$refs.form.validateField(["file"]);
        } else this.$message({ message: msg, type: "error" });
      }
    },
    preview(row) {
      this.modalMat = row;
      this.$nextTick(() => {
        this.showModal = true;
      });

      // window.open(row.fileUrl);
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
      const { pageIndex, pageSize, name, creator, statusCode, typeCode } = this;
      const { code, data, msg } = await ScheduleApi.get({
        name,
        creator,
        statusCode,
        typeCode,
        paging: 1,
        pageIndex,
        pageSize,
      });
      if (code == "200") {
        const { list, allCount } = data;
        this.list = list;
        console.log(list);
        this.total = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
  },

  components: { TablePage, pagination, AddForm, DetailForm },
};
</script>

<style scoped>
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
