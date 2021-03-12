<template>
  <table-page class="index">
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>信息发布</el-breadcrumb-item>
        <el-breadcrumb-item>素材管理</el-breadcrumb-item>
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
          <span class="prefix">审核状态</span>
          <el-select
            class="prefix"
            v-model="statusCode"
            placeholder="请选择"
            size="small"
            style="width: 250px"
            :clearable="true"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
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
            v-if="canI.addstaticmaterial"
            @click="addStatic"
            >上传本地文件</el-button
          >
          <el-button
            size="small"
            type="primary"
            v-if="canI.adddynamicmaterial"
            @click="addDynamic"
            >创建动态素材</el-button
          >
          <el-button size="small" type="danger" v-if="canI.deletematerial"
            >批量删除</el-button
          >
        </div>
      </el-row>
    </template>

    <el-table
      v-if="canI.getmateriallist"
      :data="list"
      @selection-change="handleSelectionChange"
      border
      stripe
      ref="table"
    >
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        key="selection"
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column prop="name" key="name" label="素材名"></el-table-column>
      <el-table-column
        prop="typeName"
        key="typeName"
        label="素材类型"
      ></el-table-column>
      <el-table-column key="size" label="大小">
        <template slot-scope="scope">
          {{
            !scope.row.size
              ? ""
              : scope.row.size > 1073741824
              ? (scope.row.size / 1073741824).toFixed(1) + "G"
              : scope.row.size > 1048576
              ? (scope.row.size / 1048576).toFixed(1) + "M"
              : scope.row.size > 1024
              ? (scope.row.size / 1024).toFixed(1) + "kb"
              : scope.row.size + "b"
          }}
        </template>
      </el-table-column>
      <el-table-column
        prop="statusName"
        key="statusName"
        label="审核状态"
      ></el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="上传者"
      ></el-table-column>
      <el-table-column
        prop="auditorName"
        key="auditorName"
        label="审核人"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        key="createTime"
        label="上传时间"
      ></el-table-column>
      <el-table-column prop="desc" key="desc" label="描述"></el-table-column>
      <el-table-column prop="operating" key="operating" label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            v-if="canI.editmaterial"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" type="success" @click="preview(scope.row)"
            >查看</el-button
          >
          <el-popconfirm
            v-if="canI.deletematerial"
            confirm-button-text="好的"
            cancel-button-text="不用了"
            icon="el-icon-info"
            icon-color="red"
            title="确定删除该素材吗？"
            @confirm="handleDelete(scope.row)"
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

    <el-dialog
      :title="dialogTitle"
      :visible.sync="showForm"
      :close-on-click-modal="false"
      close-on-press-escape
      append-to-body
    >
      <el-form
        label-width="120px"
        class="form"
        :model="form"
        :rules="rules"
        ref="form"
      >
        <template v-if="isStatic">
          <el-form-item label="素材名称" prop="name">
            <el-input
              v-model="form.name"
              maxlength="250"
              placeholder="请输入素材名称"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="素材选择" prop="file">
            <el-upload
              class="uploadImg"
              :action="config.url + config.uploadFile"
              ref="upload"
              list-type="picture-card"
              :limit="1"
              :file-list="form.file"
              :show-file-list="false"
              :on-change="onUpload"
              @remove="form.file = []"
              :on-progress="handleProgress"
            >
              <img
                v-if="form.file && form.file.length"
                :src="form.file[0].url"
                class="avatar"
              />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="审核方式" prop="auditTypeCode">
            <el-radio-group v-model="form.auditTypeCode">
              <el-radio :label="3">AI审核</el-radio>
              <el-radio :label="6">人工审核</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="素材描述" prop="desc">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入素材描述"
              v-model="form.desc"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="上传进度">
            <el-progress
              style="margin-top: 12.5px"
              :percentage="progress"
              status="success"
            ></el-progress>
          </el-form-item>
        </template>
        <template v-else-if="isIPC"></template>
        <template v-else>
          <el-form-item label="素材类型" prop="name">
            <el-select
              class="prefix"
              v-model="form.typeCode"
              placeholder="请选择"
              size="small"
              style="width: 250px"
            >
              <el-option
                v-for="item in [
                  { code: '在线网页', name: '在线网页' },
                  { code: 'IPC', name: '网络摄像机' },
                  { code: '流媒体', name: '流媒体服务器' },
                ]"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="素材名称" prop="name">
            <el-input
              v-model="form.name"
              maxlength="250"
              placeholder="请输入素材名称"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="url" prop="url">
            <el-input
              v-model="form.url"
              maxlength="250"
              placeholder="请输入url"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="素材描述" prop="desc">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入素材描述"
              v-model="form.desc"
            >
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import pagination from "../../components/pagination/pagination";
import { MaterialApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";

export default {
  data() {
    return {
      name: "",
      creator: "",
      list: [],
      pageIndex: 0,
      total: 0,
      statusCode: "",
      statusOptions: [
        { code: "0", name: "审核通过" },
        { code: "1", name: "待审核" },
        { code: "2", name: "运行中" },
      ],
      canI: {},
      showForm: false,
      isStaticForm: false,
      form: {},
      progress: 0,
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
        this.form.typeCode !== "IPC"
      );
    },
    isIPC() {
      return this.form.typeCode === "IPC";
    },
    rules() {
      return this.form.typeCode === "在线网页" ||
        this.form.typeCode === "流媒体"
        ? {
            typeCode: [
              {
                required: true,
                message: "请选择动态素材类型",
                trigger: "blur",
              },
            ],
            name: [
              { required: true, message: "请输入素材名称", trigger: "blur" },
            ],
            url: [{ required: true, message: "请输入url", trigger: "blur" }],
            desc: [
              { required: true, message: "请输入素材描述", trigger: "blur" },
            ],
          }
        : this.form.typeCode === "IPC"
        ? {
            name: [
              { required: true, message: "请输入素材名称", trigger: "blur" },
            ],
            ipType: [
              { required: true, message: "请选择IP类型", trigger: "blur" },
            ],
            ipAddress: [
              { required: true, message: "请输入IP地址", trigger: "blur" },
            ],
            port: [
              { required: true, message: "请输入端口号", trigger: "blur" },
            ],
            channel: [
              { required: true, message: "请输入通道号", trigger: "blur" },
            ],
            userName: [
              { required: true, message: "请输入用户名", trigger: "blur" },
            ],
            password: [
              { required: true, message: "请输入密码", trigger: "blur" },
            ],
            protocol: [
              { required: true, message: "请选择传输协议", trigger: "blur" },
            ],
            bitRateType: [
              { required: true, message: "请选择码率类型", trigger: "blur" },
            ],
            desc: [
              { required: true, message: "请输入素材描述", trigger: "blur" },
            ],
          }
        : {
            name: [
              { required: true, message: "请输入素材名称", trigger: "blur" },
            ],
            file: [
              {
                type: "array",
                required: true,
                message: "请上传素材",
                trigger: "blur",
              },
            ],
            auditTypeCode: [
              { required: true, message: "请选择审核方式", trigger: "blur" },
            ],
            desc: [
              { required: true, message: "请输入素材描述", trigger: "blur" },
            ],
          };
    },
  },
  async mounted() {
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.getmateriallist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },

  methods: {
    handleProgress({ percent }) {
      this.progress = percent;
    },
    addStatic() {
      this.form = {
        name: "",
        file: [],
        auditTypeCode: "",
        desc: "",
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
    submit() {},
    onUpload(change) {
      if (change.response) {
        const { data, msg, code } = change.response;
        if (code === ERR_OK) {
          this.form.file = [
            {
              name: data.code,
              url: change.url,
            },
          ];
          this.progress = 100;
          this.$refs.form && this.$refs.form.validateField(["file"]);
        } else this.$message({ message: msg, type: "error" });
      }
    },
    preview() {},
    handleDelete() {},
    handleEdit() {},
    handleSelectionChange() {},
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
      const { code, data, msg } = await MaterialApi.get({
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
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
