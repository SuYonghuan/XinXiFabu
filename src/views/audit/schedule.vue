<template
  ><table-page>
    <template v-slot:header>
      <el-row type="flex" justify="space-between">
        <el-col>
          <span class="meta1">日程名称</span>
          <el-input
            class="input1"
            v-model="name"
            placeholder="请输入日程名称"
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
      </el-row>
    </template>
    <el-table
      v-if="canI.auditschedulelist"
      :data="list"
      @selection-change="handleSelectionChange"
      :max-height="$root.tableMaxHeight + 'px'"
      ref="table"
    >
      <el-table-column type="index" key="index"></el-table-column>
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
        width="120px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            class="svg-button"
            type="text"
            v-if="canI.auditscheduleinfo"
            @click="handleDetail(scope.row)"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconyanjing"></use></svg
          ></el-button>
          <el-button
            class="svg-button"
            type="text"
            @click="audit(scope.row)"
            v-if="canI.auditschedule"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshenhe"></use></svg
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col> </el-col>
      <pagination
        :list="list"
        :page="pageIndex"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </el-row>
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
    <el-dialog
      class="audit-schedule"
      fullscreen
      append-to-body
      :visible.sync="showDetailForm"
    >
      <add-form
        :playModes="playModes"
        :showAddForm="showDetailForm"
        :intervalTypes="intervalTypes"
        :resolutions="resolutions"
        :code="editCode"
        :readonly="true"
        api="getAuditDetail"
        @closeAddForm="showDetailForm = false"
      ></add-form>
    </el-dialog>
  </table-page>
</template>

<script>
import { GetRolePermissions } from "http/api/program";
import { ScheduleApi, ProgramApi } from "../program/program.js";
import { mapGetters } from "vuex";
import { ERR_OK } from "http/config";
import AddForm from "../program/schedule/AddForm";

export default {
  data() {
    return {
      name: "",
      creator: "",
      list: [],
      pageIndex: 1,
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

  components: { AddForm },
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
<style lang="scss">
.audit-schedule {
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
