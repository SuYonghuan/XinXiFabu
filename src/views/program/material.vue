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
          <el-button
            size="small"
            :disabled="!toDelCodes.length"
            type="danger"
            v-if="canI.deletematerial"
            @click="bulkDelete"
            >批量删除</el-button
          >
        </div>
      </el-row>
    </template>

    <el-table
      v-if="canI.getmateriallist"
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
      <el-table-column prop="name" key="name" label="素材名"></el-table-column>
      <el-table-column
        prop="typeCode"
        key="typeCode"
        column-key="typeCode"
        label="素材类型"
        :filters="materialTypeFilters"
        :filter-multiple="false"
      >
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
      <el-table-column
        prop="statusCode"
        key="statusCode"
        column-key="statusCode"
        label="审核状态"
        :filters="statusTypeFilters"
        :filter-multiple="false"
      >
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
        prop="auditor"
        key="auditor"
        label="审核人"
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
            v-if="canI.editmaterial"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="success"
            @click="preview(scope.row)"
            :disabled="!scope.row.fileUrl"
            >查看</el-button
          >
          <el-popconfirm
            v-if="canI.deletematerial"
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
              :maxlength="50"
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
              <div class="object" v-if="form.file && form.file.length">
                <object :data="form.file[0].url"> </object>
              </div>
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="审核方式" prop="auditType">
            <el-radio-group v-model="form.auditType">
              <el-radio
                v-for="(name, code) in auditTypes"
                :key="code"
                :label="code"
                >{{ name }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
          <el-form-item label="素材描述" prop="desc">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入素材描述"
              :maxlength="200"
              v-model="form.desc"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="同名素材替换">
            <el-switch v-model="form.sameReplace"> </el-switch>
          </el-form-item>
          <el-form-item label="上传进度">
            <el-progress
              style="margin-top: 12.5px"
              :percentage="progress"
              status="success"
            ></el-progress>
          </el-form-item>
        </template>
        <template v-else-if="isIpc">
          <el-form-item label="素材类型" prop="typeCode">
            <el-select
              class="prefix"
              v-model="form.typeCode"
              placeholder="请选择"
              size="small"
              style="width: 250px"
              :disabled="isEdit"
              @change="handleTypeCodeChange"
            >
              <el-option
                v-for="item in [
                  { code: '在线网页', name: '在线网页' },
                  { code: 'ipc', name: '网络摄像机' },
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
              :maxlength="50"
              placeholder="请输入素材名称"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="IP类型" prop="ipType">
            <el-select
              class="prefix"
              v-model="form.ipType"
              placeholder="请选择"
              size="small"
              style="width: 250px"
            >
              <el-option
                v-for="item in [
                  { code: 'IPV4', name: 'IPV4' },
                  { code: 'IPV6', name: 'IPV6' },
                ]"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="IP地址" prop="ipAddress">
            <el-input
              v-model="form.ipAddress"
              maxlength="250"
              placeholder="请输入IP地址"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="端口号" prop="port">
            <el-input
              type="number"
              v-model="form.port"
              :maxlength="5"
              placeholder="请输入端口号"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="通道号" prop="channel">
            <el-input
              v-model="form.channel"
              :maxlength="3"
              placeholder="请输入通道号"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="userName">
            <el-input
              v-model="form.userName"
              :maxlength="50"
              placeholder="请输入用户名"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              :maxlength="50"
              placeholder="请输入密码"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="传输协议" prop="protocol">
            <el-select
              class="prefix"
              v-model="form.protocol"
              placeholder="请选择"
              size="small"
              style="width: 250px"
            >
              <el-option
                v-for="(name, code) in protocols"
                :key="code"
                :label="name + '(' + code + ')'"
                :value="code"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="码率类型" prop="bitRateType">
            <el-select
              class="prefix"
              v-model="form.bitRateType"
              placeholder="请选择"
              size="small"
              style="width: 250px"
            >
              <el-option
                v-for="(name, code) in bitRateTypes"
                :key="code"
                :label="name"
                :value="code"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="素材描述" prop="desc">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入素材描述"
              :maxlength="200"
              v-model="form.desc"
            >
            </el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="素材类型" prop="typeCode">
            <el-select
              class="prefix"
              v-model="form.typeCode"
              placeholder="请选择"
              size="small"
              style="width: 250px"
              @change="handleTypeCodeChange"
              :disabled="isEdit"
            >
              <el-option
                v-for="item in [
                  { code: '在线网页', name: '在线网页' },
                  { code: 'ipc', name: '网络摄像机' },
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
              :maxlength="50"
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
              :maxlength="200"
              v-model="form.desc"
            >
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div class="dialog-footer">
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
      pageSize: 10,
      total: 0,
      statusCode: null,
      canI: {},
      showForm: false,
      isStaticForm: false,
      form: {},
      progress: 0,
      materialTypes: {},
      typeCode: null,
      auditTypes: {},
      statusTypes: {
        0: "待审核",
        1: "审核通过",
        2: "不通过",
      },
      protocols: {
        TCP: "传输控制协议",
        RTMP: "实时流协议",
        UDP: "数据报协议",
        HTTP: "超文本传输协议",
        RTP: "实时传输协议",
      },
      bitRateTypes: {
        main: "主码流",
        sub: "副码流",
      },
      showModal: false,
      modalMat: null,
      toDelCodes: [],
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
        : this.form.typeCode === "ipc"
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
            auditType: [
              { required: true, message: "请选择审核方式", trigger: "blur" },
            ],
            desc: [
              { required: true, message: "请输入素材描述", trigger: "blur" },
            ],
            sameReplace: [
              {
                type: "boolean",
                required: true,
                message: "请选择是否同名替换",
                trigger: "blur",
              },
            ],
          };
    },
    isEdit() {
      return !!this.form.code;
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
    const [materialTypes, auditTypes] = await Promise.all([
      MaterialApi.getMaterialTypes(),
      MaterialApi.getAuditTypes(),
    ]);
    this.materialTypes = materialTypes;
    this.auditTypes = auditTypes;
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
      const { code, msg } = await MaterialApi.delete({ codes });
      this.$message({
        type: code === "200" ? "success" : "error",
        message: code === "200" ? "删除成功" : msg,
      });
      if (code === "200") this.getList();
    },
    async bulkDelete() {
      await this.handleDelete(this.toDelCodes);
      this.toDelCodes = [];
    },
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    handleProgress({ percent }) {
      this.progress = percent;
    },
    handleEdit(row) {
      const {
        code,
        name,
        fileCode,
        fileUrl,
        auditType,
        desc,
        typeCode,
        url,
        ipType,
        ipAddress,
        port,
        channel,
        userName,
        password,
        protocol,
        bitRateType,
      } = row;
      if (["流媒体", "在线网页"].includes(typeCode)) {
        this.isStaticForm = false;
        this.form = {
          code,
          typeCode,
          name,
          url,
          desc,
        };
      } else if (typeCode === "ipc") {
        this.isStaticForm = false;
        this.form = {
          code,
          typeCode,
          name,
          ipType,
          ipAddress,
          port,
          channel,
          userName,
          password,
          protocol,
          bitRateType,
          desc,
        };
      } else {
        this.form = {
          code,
          typeCode,
          name,
          file: [
            {
              name: fileCode,
              url: fileUrl,
            },
          ],
          auditType,
          desc,
          sameReplace: true,
        };
        this.isStaticForm = true;
        this.progress = 0;
      }

      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
        this.showForm = true;
      });
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
    async submit() {
      const isValid = await new Promise((resolve) =>
        this.$refs.form.validate(resolve)
      );
      if (!isValid) return;
      if (this.isStatic) {
        const { name, file, auditType, desc, sameReplace, code } = this.form;
        const res = await (this.isEdit ? MaterialApi.put : MaterialApi.post)({
          name,
          fileCode: file[0].name,
          auditType,
          desc,
          sameReplace,
          code,
        });
        if (res.code !== "200") return this.$message.error(res.msg);
        this.$message.success(res.msg);
        if (!this.isEdit) {
          this.reset();
        }
        this.getList();
        this.showForm = false;
      } else if (this.isIpc) {
        const {
          code,
          typeCode,
          name,
          ipType,
          ipAddress,
          port,
          channel,
          userName,
          password,
          protocol,
          bitRateType,
          desc,
        } = this.form;
        const res = await (this.isEdit
          ? MaterialApi.put
          : MaterialApi.postDynamic)({
          code,
          typeCode,
          name,
          ipType,
          ipAddress,
          port,
          channel,
          userName,
          password,
          protocol,
          bitRateType,
          desc,
        });
        if (res.code !== "200") return this.$message.error(res.msg);
        this.$message.success(res.msg);
        if (!this.isEdit) {
          this.reset();
        }
        this.getList();
        this.showForm = false;
      } else {
        const { code, typeCode, name, url, desc } = this.form;
        const res = await (this.isEdit
          ? MaterialApi.put
          : MaterialApi.postDynamic)({
          code,
          typeCode,
          name,
          url,
          desc,
        });
        if (res.code !== "200") return this.$message.error(res.msg);
        this.$message.success(res.msg);
        if (!this.isEdit) {
          this.reset();
        }
        this.getList();
        this.showForm = false;
      }
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
              url: this.config.url + data.filePath,
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
      const { code, data, msg } = await MaterialApi.get({
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
</style>
