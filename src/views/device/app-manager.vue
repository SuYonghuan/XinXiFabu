<template>
  <table-page>
    <template v-slot:header>
      <div
        style="display: flex;justify-content: space-between;align-items: center;"
      >
        <div style="display:inline-flex">
          <span class="meta1">安装包名称</span>
          <el-input
            class="input1"
            v-model="name"
            placeholder="根据安装包名称搜索"
            size="small"
            clearable
            @keyup.enter.native="getList"
          >
          </el-input>
          <span class="meta1">类型</span>
          <el-select
            class="input1"
            v-model="appType"
            placeholder="请选择"
            size="small"
            clearable
          >
            <el-option
              v-for="item in [
                { code: 'APP', name: 'APP' },
                { code: '应用', name: '应用' },
              ]"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
          <span class="meta1">系统</span>
          <el-select
            class="input1"
            v-model="systemType"
            placeholder="请选择"
            size="small"
            clearable
          >
            <el-option
              v-for="item in [
                { code: 'Windows', name: 'Windows' },
                { code: 'Android', name: 'Android' },
              ]"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
          <span class="meta1">分辨率</span>
          <el-select
            class="input1"
            v-model="resolution"
            placeholder="请选择"
            size="small"
            clearable
          >
            <el-option
              v-for="data in resolutions"
              :key="data.sName"
              :label="data.sName"
              :value="data.sName"
            >
            </el-option>
          </el-select>

          <div class="btn1" @click="getList">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconsousuo"></use>
            </svg>
          </div>
          <div
            class="btn1"
            @click="
              reset();
              getList();
            "
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconqingchu"></use>
            </svg>
          </div>
        </div>
        <el-button
          class="svg-suffix"
          type="primary"
          v-if="canI.addversion"
          @click="showAddForm"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconjia"></use></svg
          >添加安装包</el-button
        >
      </div>
    </template>

    <el-table
      v-if="canI.versionlist"
      :data="list"
      :max-height="$root.tableMaxHeight + 'px'"
      ref="table"
    >
      <el-table-column type="index" key="index"></el-table-column>

      <el-table-column
        prop="name"
        key="name"
        label="安装包名称"
      ></el-table-column>
      <el-table-column prop="logo" label="logo">
        <template slot-scope="scope">
          <img :src="scope.row.logo" width="30" height="30" />
        </template>
      </el-table-column>
      <el-table-column
        prop="version"
        key="version"
        label="版本号"
      ></el-table-column>
      <el-table-column
        prop="appType"
        key="appType"
        label="类型"
      ></el-table-column>
      <el-table-column
        prop="systemType"
        key="systemType"
        label="系统"
      ></el-table-column>
      <el-table-column
        prop="resolution"
        key="resolution"
        label="分辨率"
      ></el-table-column>
      <el-table-column
        prop="devNum"
        key="devNum"
        label="设备数量"
      ></el-table-column>
      <el-table-column
        prop="addTime"
        key="addTime"
        label="上传时间"
        :formatter="dateFormatter"
      ></el-table-column>

      <el-table-column
        prop="operating"
        width="240px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <div>
            <el-button
              type="text"
              v-if="canI.editversion"
              @click="handleEdit(scope.row)"
            >
              编辑</el-button
            >
            <el-button
              type="text"
              v-if="canI.delversion"
              @click="deleteRow(scope.row.code)"
            >
              删除</el-button
            >
            <el-button
              type="text"
              v-if="canI.publishpackage"
              @click="
                appToPublish = scope.row;
                showPublishForm = true;
              "
            >
              下发设备</el-button
            >
            <el-button
              type="text"
              v-if="canI.appdevinfo"
              :disabled="!scope.row.devNum"
              @click="showAppDevs(scope.row)"
            >
              设备信息</el-button
            >
          </div>
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
    <el-dialog
      class="matmodal"
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
        <el-form-item label="安装包名称" prop="name">
          <el-input
            v-model="form.name"
            :maxlength="100"
            placeholder="输入安装包名称"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="安装包类型" prop="appType">
          <el-select v-model="form.appType" placeholder="请选择">
            <el-option
              v-for="item in [
                { code: 'APP', name: 'APP' },
                { code: '应用', name: '应用' },
              ]"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统" prop="systemType">
          <el-select v-model="form.systemType" placeholder="请选择">
            <el-option
              v-for="item in [
                { code: 'Windows', name: 'Windows' },
                { code: 'Android', name: 'Android' },
              ]"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="logo" prop="logoFile" v-if="form.logoFile">
          <el-upload
            :action="config.url + config.uploadFile"
            ref="upload"
            class="avatar-uploader"
            :file-list="form.logoFile"
            :show-file-list="false"
            :on-change="onLogoUpload"
            :on-remove="
              () => {
                form.logoFile = [];
              }
            "
            :before-upload="beforeImageUpload"
          >
            <img
              class="avatar"
              v-if="form.logoFile.length"
              :src="form.logoFile[0].url"
            />
            <i v-else class="avatar-uploader-icon el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="分辨率" prop="resolution">
          <el-select v-model="form.resolution" placeholder="请选择">
            <el-option
              v-for="data in resolutions"
              :key="data.code"
              :label="data.sName"
              :value="data.sName"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="安装包" prop="packageFile">
          <el-upload
            :action="config.url + '/Api/AppManager/UploadPackage' + query"
            accept=".zip, .ZIP, .apk, .APK"
            ref="upload"
            class="uploader"
            :file-list="form.packageFile"
            :on-success="onPackageUpload"
            :limit="1"
            :on-remove="
              () => {
                form.packageFile = [];
              }
            "
            :before-upload="setTimestamp"
            :headers="headers"
          >
            <el-button
              v-if="!form.packageFile || form.packageFile.length === 0"
              type="primary"
              >点击上传</el-button
            >
            <div>支持APK、ZIP格式</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="部署包描述" prop="appDesc">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="输入安装包描述（最多200字）"
            :maxlength="200"
            v-model="form.appDesc"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="下发设备" append-to-body :visible.sync="showPublishForm">
      <publish-form
        :showForm="showPublishForm"
        @closeForm="showPublishForm = false"
        :app="appToPublish"
        @published="handlePublished"
      ></publish-form>
    </el-dialog>
    <el-dialog
      title="设备信息"
      :visible.sync="showAppDevModal"
      class="app-dev-modal"
    >
      <div style="background:#f6f6f6">
        <div style="display: flex">
          <span class="meta1">设备名称</span>
          <el-input
            class="input1"
            v-model="appDevName"
            placeholder="请输入设备名称"
            size="small"
            clearable
            @keyup.enter.native="getAppDevList"
          >
          </el-input>
          <div class="btn1" @click="getAppDevList">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconsousuo"></use>
            </svg>
          </div>
        </div>

        <el-table :data="appDevs">
          <el-table-column
            prop="devNum"
            key="devNum"
            label="设备名称"
          ></el-table-column>
          <el-table-column prop="ip" label="IP"></el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span
                :class="['dot', scope.row.deviceOnline ? 'green' : 'red']"
              ></span
              >{{ scope.row.deviceOnline ? "在线" : "离线" }}
            </template>
          </el-table-column>
          <el-table-column label="前端状态">
            <template slot-scope="scope">
              <span
                ><span
                  :class="['dot', scope.row.frontOnline ? 'green' : 'red']"
                ></span
                >{{ scope.row.frontOnline ? "在线" : "离线" }}</span
              >
            </template>
          </el-table-column>
        </el-table>
        <el-row type="flex" style="margin-top: 16px;" justify="space-between">
          <el-col> </el-col>
          <pagination
            :list="appDevs"
            :page="appDevPageIndex"
            :total="appDevTotal"
            @handleSizeChange="
              (val) => {
                appDevPageSize = val;
                getAppDevList();
              }
            "
            @handleCurrentChange="
              (val) => {
                appDevPageIndex = val;
                getAppDevList();
              }
            "
          />
        </el-row>
      </div>
    </el-dialog>
  </table-page>
</template>

<script>
import { mapGetters } from "vuex";
import { ERR_OK } from "http/config";
import { cPost } from "http/http";
import { ProgramApi } from "../program/program";
import { encrypt, decrypt } from "common/js/utils";
import { getCookie } from "common/js/cookie";
import PublishForm from "./AppManager/PublishForm.vue";
const API = {
  systemVersionList: cPost("/Api/AppManager/SystemVersionList"),
  versionDeviceList: cPost("/Api/AppManager/VersionDeviceList"),
  editVersion: cPost("/Api/AppManager/EditVersion"),
  addVersion: cPost("/Api/AppManager/AddVersion"),
  deleteVersion: cPost("/Api/AppManager/DeleteVersion"),
  publishVersion: cPost("/Api/AppManager/PublishVersion"),
  getRolePermissions: cPost("/api/RolePermissions/GetRolePermissions"),
  publishedDevList: cPost("/Api/AppManager/PublishedDevList"),
};
export default {
  components: { PublishForm },
  data() {
    return {
      name: "",
      appType: "",
      systemType: "",
      resolution: "",
      list: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      resolutions: [],
      canI: {},
      showForm: false,
      form: {},
      toDelCodes: [],
      rules: {
        appName: [
          { required: true, message: "请输入安装包名称", trigger: "blur" },
        ],
        appType: [
          { required: true, message: "请选择安装包类型", trigger: "blur" },
        ],
        systemType: [
          { required: true, message: "请选择系统", trigger: "blur" },
        ],
        logoFile: [
          {
            type: "array",
            required: true,
            message: "请上传logo",
            trigger: "blur",
          },
        ],
        packageFile: [
          {
            type: "array",
            required: true,
            message: "请上传安装包",
            trigger: "blur",
          },
        ],
      },
      timestamp: parseInt(new Date().getTime() / 1000),
      uploadLoading: null,
      showPublishForm: false,
      appToPublish: null,
      showAppDevModal: false,
      appVersionCode: null,
      appDevName: "",
      appDevs: [],
      appDevPageSize: 10,
      appDevTotal: 0,
      appDevPageIndex: 1,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
    dialogTitle() {
      return (this.form.code ? "编辑" : "添加") + "安装包";
    },

    isEdit() {
      return !!this.form.code;
    },
    query() {
      return `?token=${encodeURIComponent(
        encrypt("/Api/AppManager/UploadPackage" + this.timestamp)
      )}&time=${this.timestamp}`;
    },
    headers() {
      const userInfo = getCookie("userInfo")
        ? JSON.parse(getCookie("userInfo"))
        : {};
      const jwtToken = userInfo.jwtToken;

      return {
        Authorization: "Bearer " + jwtToken,
      };
    },
  },
  async mounted() {
    await this.getResolutions();
    let { code, data, msg } = await API.getRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.versionlist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },

  methods: {
    async getAppDevList() {
      const {
        appDevPageIndex,
        appDevPageSize,
        appVersionCode,
        appDevName,
      } = this;
      const { code, data, msg } = await API.publishedDevList({
        versionCode: appVersionCode,
        name: appDevName,
        paging: 1,
        pageIndex: appDevPageIndex,
        pageSize: appDevPageSize,
      });
      if (code == "200") {
        const { list, allCount, allPage } = data;
        if (appDevPageIndex > allPage) {
          this.appDevTotal = allCount;
          this.appDevPageIndex = allPage;
          return this.getAppDevList();
        }
        this.appDevs = list;
        this.appDevTotal = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
    async showAppDevs({ code }) {
      this.appVersionCode = code;
      this.appDevPageIndex = 1;
      this.appDevTotal = 0;
      this.appDevPageSize = 10;
      this.appDevName = "";
      await this.getAppDevList();
      this.showAppDevModal = true;
    },
    handlePublished() {
      this.showPublishForm = false;
      this.getList();
    },
    setTimestamp() {
      this.timestamp = parseInt(new Date().getTime() / 1000);
      this.uploadLoading = this.$loading({
        lock: true,
        text: "上传中",
        spinner: "el-icon-loading",
      });
    },

    async getResolutions() {
      const { code, data, msg } = await ProgramApi.getResolutions();
      if (code === "200") this.resolutions = data;
      else this.$message({ message: msg, type: "error" });
    },

    deleteRow(code) {
      this.$confirm("您确认要删除该安装包?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.handleDelete([code]);
      });
    },
    beforeImageUpload(file) {
      if (!file.type.includes("image")) {
        this.$message.error("文件类型不支持");
        return false;
      }
      if (file.size > 1024 * 1024) {
        this.$message.error(`大小不能超过1M!`);
        return false;
      }
    },
    async handleDelete(codes) {
      try {
        let { code, msg } = await API.deleteVersion({ codes });
        if (code === "200") {
          this.$message({
            type: "success",
            message: msg,
          });
          this.getList();
        } else
          this.$message({
            type: "error",
            message: msg,
          });
      } catch (error) {
        console.log(error);
      }
    },

    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    handleEdit(row) {
      const {
        code,
        name,
        appType,
        packageCode,
        packagePath,
        resolution,
        systemType,
        logo,
        appDesc,
      } = row;
      this.form = {
        code,
        name,
        appType,
        resolution,
        systemType,
        packageFile: [
          {
            name: packageCode,
            code: packageCode,
            url: packagePath,
          },
        ],
        logoFile: [
          {
            name: logo,
            code: logo,
            url: logo,
          },
        ],
        appDesc,
      };

      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
        this.showForm = true;
      });
    },
    showAddForm() {
      this.form = {
        appName: "",
        logoFile: [],
        resolution: "",
        version: "",
        systemType: "",
        appType: "",
        packageFile: [],
      };

      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
        this.showForm = true;
      });
    },
    async submit() {
      const isValid = await new Promise((resolve) =>
        this.$refs.form.validate(resolve)
      );
      if (!isValid) return;

      const {
        code,
        name,
        appType,
        systemType,
        logoFile,
        resolution,
        packageFile,
        appDesc,
      } = this.form;
      const res = await (this.isEdit ? API.editVersion : API.addVersion)({
        name,
        appType,
        systemType,
        resolution,
        appDesc,
        logo: logoFile[0].url,
        packageCode: packageFile[0].code,
        code,
      });
      if (res.code !== "200") return this.$message.error(res.msg);
      this.$message.success(res.msg);
      if (!this.isEdit) {
        this.reset();
      }
      this.getList();
      this.showForm = false;
    },
    reset() {
      this.name = "";
      this.appType = "";
      this.systemType = "";
      this.resolution = "";
      this.$refs.table && this.$refs.table.clearFilter();
      this.pageIndex = 1;
      this.list = [];
      this.total = 0;
    },
    onLogoUpload(change) {
      if (change.response) {
        const { data, msg, code } = change.response;
        if (code === ERR_OK) {
          const path = data.filePath;
          const name = path.split("\\").pop();
          this.form.logoFile = [
            {
              name,
              code: data.fileGuid,
              url: this.config.url + path,
            },
          ];
          this.$refs.form && this.$refs.form.validateField(["file"]);
        } else this.$message({ message: msg, type: "error" });
      }
    },
    onPackageUpload(responseData) {
      if (this.uploadLoading) {
        this.uploadLoading.close();
        this.uploadLoading = null;
      }
      const response = JSON.parse(decrypt(responseData));
      const { code, data, msg } = response;
      if (code === "200") {
        this.form.packageFile = [{ name: data, code: data, url: data }];
      } else {
        this.form.packageFile = [];
        this.$message.error(msg);
      }
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
      const {
        pageIndex,
        pageSize,
        name,
        appType,
        systemType,
        resolution,
      } = this;
      const { code, data, msg } = await API.systemVersionList({
        name,
        appType,
        systemType,
        resolution,
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
};
</script>
<style>
.app-dev-modal .el-dialog {
  background: #f6f6f6;
}
</style>
<style scoped lang="scss">
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  &.red {
    background: #ff4949;
  }
  &.green {
    background: #12b362;
  }
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: contain;
  object-position: center;
}
.gap {
  margin: 20px auto;
}
.prefix {
  margin-right: 10px;
}
.dialog-footer {
  text-align: center;
}
.object {
  position: relative;
  width: 148px;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.object object {
  max-width: 100%;
  max-height: 100%;
}
.svg-button {
  font-size: 20px;
  color: #868f9f;
  &.is-disabled {
    color: #bbc1cc;
    &:focus,
    &:hover {
      color: #bbc1cc;
    }
  }
  &:focus,
  &:hover {
    color: #2f6bff;
  }
}
.svg-button + .svg-button {
  margin-left: 20px;
}
</style>
<style lang="scss">
.matmodal {
  .uploader {
    .el-upload-list {
      margin-top: -12px;
    }
  }
}
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
