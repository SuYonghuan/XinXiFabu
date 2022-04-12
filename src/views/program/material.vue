<template>
  <table-page class="matlist">
    <template v-slot:header>
      <el-row type="flex" justify="space-between">
        <el-col style="display: flex;">
          <span class="meta1">素材名称</span>
          <el-input
            class="input1"
            v-model="name"
            placeholder="关键字搜索"
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
            style="width: 200px"
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
        </div>
      </el-row>
    </template>

    <el-table
      v-if="canI.getmateriallist"
      :data="list"
      @selection-change="handleSelectionChange"
      :max-height="$root.tableMaxHeight + 'px'"
      ref="table"
      @filter-change="handleFilterChange"
    >
      <el-table-column
        key="selection"
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column type="index" key="index"></el-table-column>
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
      <el-table-column prop="sub" key="sub" label="副广告绑定">
        <template slot-scope="scope">
          <el-link
            @click="
              bindMaterial = scope.row;
              showBindModal = true;
            "
            >{{ scope.row.shopName || "绑定" }}</el-link
          >
        </template></el-table-column
      >
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
        width="170px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <div style="text-align: right;">
            <el-button
              class="svg-button"
              type="text"
              v-if="canI.getmaterialproglist && scope.row.progs"
              @click="showProgsModal(scope.row)"
            >
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#iconjiemubao"></use></svg
            ></el-button>
            <el-button
              class="svg-button"
              type="text"
              v-if="canI.editmaterial"
              @click="handleEdit(scope.row)"
            >
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#iconbianji"></use></svg
            ></el-button>
            <el-button
              class="svg-button"
              type="text"
              @click="preview(scope.row)"
              :disabled="!scope.row.fileUrl"
              ><svg class="icon" aria-hidden="true">
                <use xlink:href="#iconyanjing"></use></svg
            ></el-button>
            <el-button
              v-if="canI.deletematerial"
              class="svg-button"
              @click="deleteRow(scope.row.code)"
              type="text"
              ><svg class="icon" aria-hidden="true">
                <use xlink:href="#iconshanchu"></use></svg
            ></el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col>
        <el-button
          class="svg-suffix s"
          plain
          :disabled="!toDelCodes.length"
          v-if="canI.deletematerial"
          @click="bulkDelete"
        >
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconshanchu"></use></svg
          >删除</el-button
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
              :action="config.url + config.uploadFile"
              ref="upload"
              class="uploader"
              :file-list="form.file"
              :disabled="isEdit"
              :on-change="onUpload"
              :on-remove="
                () => {
                  form.file = [];
                }
              "
              :before-upload="beforeUpload"
            >
              <el-button
                v-if="!form.file || form.file.length === 0"
                type="primary"
                >点击上传</el-button
              >
            </el-upload>
          </el-form-item>
          <el-form-item
            label="审核方式"
            style="line-height: 40px"
            prop="auditType"
          >
            <el-radio-group
              v-model="form.auditType"
              :disabled="
                !isEdit
                  ? false
                  : form.statusCode == 1 || form.statusCode == 0
                  ? true
                  : form.auditType === 'manual'
                  ? true
                  : false
              "
            >
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
    <el-dialog title="引用节目列表" append-to-body :visible.sync="showProgs">
      <el-table :data="progs" @selection-change="handleProgsSelectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="resolution" label="分辨率"></el-table-column>
        <el-table-column label="操作" width="100px;">
          <template slot-scope="scope">
            <el-button
              class="svg-button"
              type="text"
              @click="editProgram(scope.row)"
            >
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#iconbianji"></use></svg
            ></el-button>
            <el-button
              v-if="canI.getmaterialprogdel"
              class="svg-button"
              @click="deleteMatProgRel(scope.row)"
              type="text"
              ><svg class="icon" aria-hidden="true">
                <use xlink:href="#iconshanchu"></use></svg
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row type="flex" style="margin-top: 16px;" justify="space-between">
        <el-col>
          <el-button
            class="svg-suffix s"
            plain
            :disabled="!selectedProgs.length"
            v-if="canI.getmaterialprogdel"
            @click="bulkDeleteRel"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshanchu"></use></svg
            >删除</el-button
          >
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      class="edit-program"
      append-to-body
      :visible.sync="showEditForm"
      fullscreen
    >
      <edit-form
        :showEditForm="showEditForm"
        :code="editCode"
        @close="showEditForm = false"
        @saved="
          refreshProgs();
          showEditForm = false;
        "
      ></edit-form>
    </el-dialog>
    <el-dialog :visible.sync="showBindModal" class="material-shop">
      <material-shop
        v-if="showBindModal"
        :material="bindMaterial"
        @change="getList"
      ></material-shop>
    </el-dialog>
  </table-page>
</template>

<script>
import { MaterialApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";
import EditForm from "./program/EditForm.vue";
import svga from "./svga.vue";
import MaterialShop from "./material/MaterialShop.vue";
export default {
  components: { EditForm, svga, MaterialShop },
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
      showProgs: false,
      progs: [],
      showEditForm: false,
      editCode: null,
      progMaterialCode: null,
      selectedProgs: [],
      showBindModal: false,
      bindMaterial: null,
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
        this.form.typeCode !== "在线网页" && this.form.typeCode !== "流媒体"
      );
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
    async bulkDeleteRel() {
      await this.$confirm("您确认要在这些节目中删除该素材?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      const { code, msg } = await MaterialApi.deleteMatProgRel({
        programmeCode: this.selectedProgs,
        materialCode: this.progMaterialCode,
      });
      this.$message({
        type: code === "200" ? "success" : "error",
        message: msg,
      });
      this.refreshProgs();
    },
    handleProgsSelectionChange(data) {
      this.selectedProgs = data.map(({ code }) => code);
    },
    async deleteMatProgRel(row) {
      await this.$confirm("您确认要在节目中删除该素材?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      const { code, msg } = await MaterialApi.deleteMatProgRel({
        programmeCode: [row.code],
        materialCode: this.progMaterialCode,
      });
      this.$message({
        type: code === "200" ? "success" : "error",
        message: msg,
      });
      this.refreshProgs();
    },
    editProgram(row) {
      this.editCode = row.code;
      this.showEditForm = true;
    },
    async showProgsModal(row) {
      this.progMaterialCode = row.code;
      await this.refreshProgs();
      this.showProgs = true;
    },
    async refreshProgs() {
      const { data } = await MaterialApi.getProgList({
        code: this.progMaterialCode,
      });
      this.progs = data;
    },
    deleteRow(code) {
      this.$confirm("您确认要删除该素材?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.handleDelete([code]);
      });
    },
    beforeUpload(file) {
      const type =
        (file.name && file.name.toLowerCase().endsWith(".flv")) ||
        file.type.includes("video")
          ? "视频"
          : file.type.includes("audio")
          ? "音频"
          : file.type.includes("image")
          ? "图片"
          : file.type === "text/plain"
          ? "文本"
          : file.name && file.name.toLowerCase().endsWith(".svga")
          ? "svga"
          : null;
      if (!type) {
        this.$message.error("文件类型不支持");
        return false;
      }
      const unit = type === "文本" ? "KB" : "MB";
      const number = type === "文本" ? 5 : 500;
      const limit = (unit === "KB" ? 1024 : 1024 * 1024) * number;
      if (file.size > limit) {
        this.$message.error(`${type}大小不能超过 ${number}${unit}!`);
        return false;
      }
    },

    handleFilterChange({ typeCode, statusCode }) {
      this.typeCode = !typeCode || !typeCode.length ? null : typeCode[0];
      this.statusCode =
        !statusCode || !statusCode.length ? null : statusCode[0];
      this.getList();
    },
    handleTypeCodeChange(val) {
      this.form = {
        typeCode: val,
        name: "",
        url: "",
        desc: "",
      };
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
    },
    async handleDelete(codes) {
      try {
        let { code, msg } = await MaterialApi.delete({ codes });
        if (code === "200") {
          this.$message({
            type: "success",
            message: msg,
          });
          this.getList();
        } else if (code !== "201") {
          this.$message({
            type: "error",
            message: msg,
          });
        } else {
          await this.$confirm(msg, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          });
          const res = await MaterialApi.delete({
            codes,
            confirm: true,
          });
          if (res.code === "200") {
            this.$message({
              type: "success",
              message: res.msg,
            });
            this.getList();
          } else {
            this.$message({
              type: "error",
              message: res.msg,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async bulkDelete() {
      try {
        await this.$confirm("您确认要删除该素材?", "提示", {
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
        statusCode,
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
      } else {
        const path = fileUrl;
        const fileName = path.split("\\").pop();
        this.form = {
          code,
          typeCode,
          name,
          statusCode,
          file: [
            {
              name: fileName,
              code: fileCode,
              url: fileUrl,
            },
          ],
          auditType,
          desc,
        };
        this.isStaticForm = true;
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
      };
      this.isStaticForm = true;
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
        const { name, file, auditType, desc, code } = this.form;
        const res = await (this.isEdit ? MaterialApi.put : MaterialApi.post)({
          name,
          fileCode: file[0].code,
          auditType,
          desc,
          code,
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
      this.$refs.table && this.$refs.table.clearFilter();
      this.statusCode = null;
      this.typeCode = null;
      this.pageIndex = 1;
      this.list = [];
      this.total = 0;
    },
    onUpload(change) {
      if (change.response) {
        const { data, msg, code } = change.response;
        if (code === ERR_OK) {
          const path = data.filePath;
          const name = path.split("\\").pop();
          this.form.file = [
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
    preview(row) {
      this.modalMat = null;
      this.$nextTick(() => {
        this.modalMat = row;
        this.showModal = true;
      });
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
.material-shop .el-dialog {
  background: #f6f6f6;
}
</style>
<style scoped lang="scss">
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
