<template
  ><table-page>
    <template v-slot:header>
      <el-row type="flex" justify="space-between">
        <el-col style="display:flex">
          <span class="meta1">素材名称</span>
          <el-input
            class="input1"
            v-model="name"
            placeholder="请输入素材名称"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <span class="meta1">上传者</span>
          <el-input
            class="input1"
            v-model="creator"
            placeholder="请输入上传者"
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
      v-if="canI.auditmateriallist"
      :data="list"
      @selection-change="handleSelectionChange"
      :max-height="$root.tableMaxHeight + 'px'"
      ref="table"
    >
      <el-table-column
        key="selection"
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column type="index" key="index"></el-table-column>
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
        width="120px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            class="svg-button"
            type="text"
            @click="
              scope.row.fileUrl ? preview(scope.row) : openDetail(scope.row)
            "
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconyanjing"></use></svg
          ></el-button>
          <el-button
            class="svg-button"
            type="text"
            @click="audit(scope.row)"
            v-if="canI.auditmaterial"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshenhe"></use></svg
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col>
        <el-button
          class="svg-suffix s"
          plain
          :disabled="!codes.length"
          v-if="canI.auditmaterial"
          @click="bulkAudit"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconshenhe"></use></svg
          >审核</el-button
        >
      </el-col>
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
      class="matmodal"
      title="素材详情"
      :visible.sync="showDetail"
      append-to-body
    >
      <el-form
        v-if="detail"
        label-width="120px"
        class="form"
        disabled
        ref="form"
      >
        <template v-if="isIpc">
          <el-form-item label="素材类型" prop="typeCode">
            <el-select
              class="prefix"
              v-model="detail.typeCode"
              placeholder="请选择"
              size="small"
              style="width: 250px"
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
              v-model="detail.name"
              :maxlength="50"
              placeholder="请输入素材名称"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="IP类型" prop="ipType">
            <el-select
              class="prefix"
              v-model="detail.ipType"
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
              v-model="detail.ipAddress"
              maxlength="250"
              placeholder="请输入IP地址"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="端口号" prop="port">
            <el-input
              type="number"
              v-model="detail.port"
              :maxlength="5"
              placeholder="请输入端口号"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="通道号" prop="channel">
            <el-input
              v-model="detail.channel"
              :maxlength="3"
              placeholder="请输入通道号"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="userName">
            <el-input
              v-model="detail.userName"
              :maxlength="50"
              placeholder="请输入用户名"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="detail.password"
              :maxlength="50"
              placeholder="请输入密码"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="传输协议" prop="protocol">
            <el-select
              class="prefix"
              v-model="detail.protocol"
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
              v-model="detail.bitRateType"
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
              v-model="detail.typeCode"
              placeholder="请选择"
              size="small"
              style="width: 250px"
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
              v-model="detail.name"
              :maxlength="50"
              placeholder="请输入素材名称"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="url" prop="url">
            <el-input
              v-model="detail.url"
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
              v-model="detail.desc"
            >
            </el-input>
          </el-form-item>
        </template>
      </el-form>
    </el-dialog>
    <el-dialog
      :title="modalMat && modalMat.name"
      append-to-body
      :visible.sync="showModal"
    >
      <template v-if="modalMat">
        <el-alert
          v-if="modalMat.typeCode === '视频'"
          :closable="false"
          type="info"
        >
          <div slot="title">
            如视频无法播放可点击下载
            <a :href="modalMat.fileUrl" target="_blank" download>下载</a>
          </div>
        </el-alert>
        <video
          v-if="modalMat.typeCode === '视频'"
          style="width:100%;min-height:500px;object-fit:contain;"
          controls
          :src="modalMat.fileUrl"
        ></video>
        <svga
          v-else-if="modalMat.typeCode === 'svga'"
          style="width:100%;min-height:500px;object-fit:contain;"
          :src="modalMat.fileUrl"
        ></svga>
        <img
          v-else-if="modalMat.typeCode === '图片'"
          style="width:100%;min-height:500px;object-fit:contain;"
          :src="modalMat.fileUrl"
        />
        <audio
          v-else-if="modalMat.typeCode === '音频'"
          controls
          :src="modalMat.fileUrl"
        ></audio>
        <object
          v-else
          style="width:100%;min-height:500px;object-fit:contain;"
          :data="modalMat.fileUrl"
        ></object>
      </template>
    </el-dialog>
  </table-page>
</template>

<script>
import { GetRolePermissions } from "http/api/program";
import { MaterialApi } from "../program/program.js";
import { mapGetters } from "vuex";
import { ERR_OK } from "http/config";
import svga from "../program/svga.vue";
export default {
  components: { svga },
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
      showDetail: false,
      isStaticForm: false,
      progress: 0,
      materialTypes: {},
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
      detail: null,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
    isIpc() {
      return this.detail && this.detail.typeCode === "ipc";
    },
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
    openDetail(row) {
      this.detail = row;
      this.showDetail = true;
    },
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
      this.modalMat = null;
      this.$nextTick(() => {
        this.modalMat = row;
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

<style scoped>
.gap {
  margin: 20px auto;
}
.prefix {
  margin-right: 10px;
}
</style>
