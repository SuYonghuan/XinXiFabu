<template
  ><table-page>
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>审核管理</el-breadcrumb-item>
        <el-breadcrumb-item>素材审核</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col>
          <span class="prefix">素材名称</span>
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
          <span class="prefix">上传者</span>
          <el-input
            class="prefix"
            v-model="creator"
            placeholder="请输入上传者"
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
            v-if="canI.auditmaterial"
            :disabled="!codes.length"
            @click="bulkAudit"
            >审核</el-button
          >
        </div>
      </el-row>
    </template>
    <el-table
      v-if="canI.auditmateriallist"
      :data="list"
      @selection-change="handleSelectionChange"
      height="620px"
      ref="table"
    >
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        key="selection"
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column prop="name" key="name" label="素材名"></el-table-column>
      <el-table-column prop="typeName" key="typeName" label="素材类型">
        <template slot-scope="scope">
          {{ materialTypes[scope.row.typeCode] }}
        </template>
      </el-table-column>
      <el-table-column key="fileSize" label="大小">
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
      <el-table-column prop="statusCode" key="statusCode" label="审核状态">
        <template slot-scope="scope">
          {{ statusTypes[scope.row.statusCode] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="上传者"
      ></el-table-column>
      <el-table-column
        prop="addTime"
        key="addTime"
        label="上传时间"
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
            @click="preview(scope.row)"
            :disabled="!scope.row.fileUrl"
            >查看</el-button
          >
          <el-button
            size="mini"
            type="primary"
            @click="audit(scope.row)"
            v-if="canI.auditmaterial"
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
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import { GetRolePermissions } from "http/api/program";
import { MaterialApi } from "../program/program.js";
import pagination from "../../components/pagination/pagination";
import { mapGetters } from "vuex";
import { ERR_OK } from "http/config";

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
      auditTypes: {},
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
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
    const [materialTypes, auditTypes] = await Promise.all([
      MaterialApi.getMaterialTypes(),
      MaterialApi.getAuditTypes(),
    ]);
    console.log("materialTypes", materialTypes);
    console.log("auditTypes", auditTypes);
    this.materialTypes = materialTypes;
    this.auditTypes = auditTypes;
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.auditmateriallist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },
  methods: {
    async submit() {
      const isValid = await new Promise((resolve) =>
        this.$refs.form.validate(resolve)
      );
      if (!isValid) return;
      const { codes } = this;
      const { statusCode, auditOpinion } = this.form;
      const res = await MaterialApi.audit({
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
      const { code, data, msg } = await MaterialApi.getAuditList({
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

  components: { TablePage, pagination },
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
