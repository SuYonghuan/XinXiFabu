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
    <el-table
      v-if="canI.getprogrammelist"
      :data="list"
      border
      stripe
      ref="table"
    >
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        prop="name"
        key="name"
        label="节目名称"
      ></el-table-column>
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
        prop="updator"
        key="updator"
        label="修改人"
      ></el-table-column>
      <el-table-column
        prop="addTime"
        key="addTime"
        label="上传时间"
        :formatter="dateFormatter"
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
            @click="editProgram(scope.row)"
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
            @confirm="deleteProgram([scope.row.code])"
          >
            <el-button slot="reference" size="mini" type="danger"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <template v-slot:footer>
      <pagination
        :list="list"
        :page="pageIndex"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </template>
    <el-dialog title="新增节目" append-to-body :visible.sync="showAddForm">
      <el-form
        label-width="120px"
        ref="addForm"
        :model="addForm"
        :rules="addRules"
      >
        <el-form-item label="节目名称" prop="name">
          <el-input
            placeholder="请输入节目名称"
            :maxlength="200"
            v-model="addForm.name"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="resolution">
          <el-select
            class="prefix"
            v-model="addForm.resolution"
            placeholder="请选择"
            size="small"
            style="width: 250px"
            :clearable="true"
          >
            <el-option
              v-for="data in resolutions"
              :key="data.code"
              :label="data.sName"
              :value="data.sName"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align: right;">
        <el-button @click="showAddForm = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </div>
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
      resolutions: [],
      addForm: {
        name: "",
        resolution: null,
      },
      addRules: {
        name: [{ required: true, message: "请填写节目名称", trigger: "blur" }],
        resolution: [
          { required: true, message: "请选择分辨率", trigger: "change" },
        ],
      },
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
    async submitAddForm() {
      const isValid = await new Promise((resolve) =>
        this.$refs.addForm.validate(resolve)
      );
      if (!isValid) return;
      const { name, resolution } = this.addForm;
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
      this.addForm = {
        name: "",
        resolution: null,
      };
      this.$nextTick(() => {
        if (this.$refs.addForm) this.$refs.addForm.clearValidate();
        this.showAddForm = true;
      });
    },
    editProgram(program) {},
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
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
        console.log(list);
        this.total = allCount;
      } else {
        console.log(msg);
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
