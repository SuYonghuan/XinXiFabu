<template
  ><table-page>
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>审核管理</el-breadcrumb-item>
        <el-breadcrumb-item>日程审核</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col>
          <span class="prefix">日程名称</span>
          <el-input
            class="prefix"
            v-model="name"
            placeholder="请输入日程名称"
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
            v-if="canI.auditschedule"
            :disabled="!codes.length"
            @click="bulkAudit"
            >审核</el-button
          >
        </div>
      </el-row>
    </template>
    <el-table
      v-if="canI.auditschedulelist"
      :data="list"
      @selection-change="handleSelectionChange"
      height="680px"
      ref="table"
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
      <el-table-column prop="playMode" key="playMode" label="播放方式">
        <template slot-scope="scope">
          {{ playModes[scope.row.playMode] }}
        </template>
      </el-table-column>
      <el-table-column prop="statusCode" key="statusCode" label="审核状态">
        <template slot-scope="scope">
          {{ statusTypes[scope.row.statusCode] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="创建人"
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
        width="220px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="success"
            v-if="canI.auditscheduleinfo"
            @click="handleDetail(scope.row)"
            >查看</el-button
          >
          <el-button
            size="mini"
            type="primary"
            @click="audit(scope.row)"
            v-if="canI.auditschedule"
            >审核</el-button
          >
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
    <el-dialog title="审核" append-to-body :visible.sync="showForm">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item label="审核结果" prop="statusCode">
          <el-radio-group v-model="form.statusCode">
            <el-radio
              v-for="(name, code) in auditOptions"
              :key="code"
              :label="Number(code)"
              >{{ name }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="auditOpinion">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
            :maxlength="200"
            v-model="form.auditOpinion"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div style="text-align: right;">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="modalMat && modalMat.name"
      append-to-body
      :visible.sync="showModal"
    >
      <template v-if="modalMat">
        <object
          style="width:100%;min-height:500px;"
          :data="modalMat.fileUrl"
        ></object>
      </template>
    </el-dialog>
    <el-dialog title="日程详情" append-to-body :visible.sync="showDetailForm">
      <detail-form
        :playModes="playModes"
        :showForm="showDetailForm"
        :intervalTypes="intervalTypes"
        :resolutions="resolutions"
        :code="editCode"
        api="getAuditDetail"
        @closeForm="showDetailForm = false"
      ></detail-form>
    </el-dialog>
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import { GetRolePermissions } from "http/api/program";
import { ScheduleApi, ProgramApi } from "../program/program.js";
import pagination from "../../components/pagination/pagination";
import { mapGetters } from "vuex";
import { ERR_OK } from "http/config";
import DetailForm from "../program/schedule/DetailForm";

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
      playModes: {},
      intervalTypes: {},
      resolutions: [],
      statusTypes: {
        0: "待审核",
        1: "审核通过",
        2: "不通过",
      },
      showModal: false,
      modalMat: null,
      codes: [],
      auditOptions: {
        1: "通过",
        2: "不通过",
      },
      form: {
        statusCode: 1,
        auditOpinion: "",
      },
      rules: {
        statusCode: [
          { required: true, message: "请选择审核结果", trigger: "blur" },
        ],
        auditOpinion: [
          { required: true, message: "请输入审批意见", trigger: "blur" },
        ],
      },
      showDetailForm: false,
      editCode: null,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
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
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      console.log(this.canI);
      if (this.canI.auditschedulelist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },
  methods: {
    handleDetail(row) {
      this.editCode = row.code;
      this.showDetailForm = true;
    },
    async submit() {
      const isValid = await new Promise((resolve) =>
        this.$refs.form.validate(resolve)
      );
      if (!isValid) return;
      const { codes } = this;
      const { statusCode, auditOpinion } = this.form;
      const res = await ScheduleApi.audit({
        codes,
        statusCode,
        auditOpinion,
      });
      if (res.code !== "200") return this.$message.error(res.msg);
      this.$message.success(res.msg);
      this.getList();
      this.showForm = false;
    },
    resetForm() {
      this.form = { statusCode: 1, auditOpinion: "" };
    },
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    preview(row) {
      this.modalMat = row;
      this.$nextTick(() => {
        this.showModal = true;
      });

      // window.open(row.fileUrl);
    },

    handleSelectionChange(data) {
      this.codes = data.map(({ code }) => code);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getList();
    },
    audit(row) {
      this.codes = [row.code];
      this.resetForm();
      this.showForm = true;
    },
    bulkAudit() {
      this.resetForm();
      this.showForm = true;
    },
    async getList() {
      const { pageIndex, pageSize, name, creator } = this;
      const { code, data, msg } = await ScheduleApi.getAuditList({
        name,
        creator,
        statusCode: 0,
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

  components: { TablePage, pagination, DetailForm },
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
