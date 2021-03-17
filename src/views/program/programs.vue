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
        prop="editor"
        key="editor"
        label="修改人"
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
            @click="editProgram(scope.row.code)"
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
    <el-dialog
      title="节目制作"
      class="edit"
      append-to-body
      :visible.sync="showEditForm"
      fullscreen
    >
      <el-row
        v-if="editForm"
        type="flex"
        justify="space-between"
        style="margin-bottom:30px;"
      >
        <el-col>
          <span class="prefix">节目名称：{{ editForm.name }}</span>
          <span class="prefix">分辨率：{{ editForm.resolution }}</span>
        </el-col>
        <el-col style="text-align: right;">
          <el-button @click="showEditForm = false">预 览</el-button>
          <el-button type="primary" @click="submitAddForm">保 存</el-button>
          <el-button @click="showEditForm = false">关 闭</el-button>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="5">
          <el-row>
            <el-col
              style="text-align: center;height: 140px;"
              :span="8"
              :key="code"
              v-for="code in componentTypeOrder"
            >
              <img
                @click="appendComponent(code)"
                class="logo"
                :src="logos[code]"
                :alt="componentTypes[code]"
              />
              <div @click="appendComponent(code)">
                {{ componentTypes[code] }}
              </div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="14" class="canvas-wrapper">2</el-col>
        <el-col :span="5">
          <el-form
            v-if="editForm"
            class="form"
            label-width="100px"
            ref="editForm"
            :model="editForm"
            :rules="editRules"
          >
            <h5>节目设置</h5>
            <el-form-item label="节目时长" prop="duration">
              <el-time-picker
                v-model="editForm.duration"
                value-format="HH:mm:ss"
                placeholder="选择时长"
              >
              </el-time-picker>
            </el-form-item>
            <h5>页面控件</h5>
            <div
              :class="(activeComponent ? '' : 'selected') + ' component-item'"
              @click="activeComponent = null"
            >
              背景
            </div>
            <div
              v-for="(component, i) in editForm.components"
              :key="i"
              :class="
                (activeComponent === component ? 'selected' : '') +
                  ' component-item'
              "
              @click="activeComponent = component"
            >
              <span>{{ componentTypes[component.typeCode] }}组件</span>
              <template v-if="editForm.components.length === 1"></template>
              <el-button-group v-else-if="i === 0">
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-bottom"
                  @click="down(i)"
                ></el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-download"
                  @click="bottom(i)"
                ></el-button>
              </el-button-group>
              <el-button-group v-else-if="i === editForm.components.length - 1">
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-top"
                  @click="up(i)"
                ></el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  style="transform: rotate(180deg)"
                  icon="el-icon-download"
                  @click="top(i)"
                ></el-button>
              </el-button-group>
              <el-button-group v-else>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  style="transform: rotate(180deg)"
                  icon="el-icon-download"
                  @click="top(i)"
                ></el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-top"
                  @click="up(i)"
                ></el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-bottom"
                  @click="down(i)"
                ></el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-download"
                  @click="bottom(i)"
                ></el-button>
              </el-button-group>
            </div>
            <h5>{{ activeComponent ? "元素属性" : "背景属性" }}</h5>
            <template v-if="!activeComponent">
              <el-form-item label="背景颜色" prop="backgroundColor">
                <el-color-picker v-model="editForm.backgroundColor" show-alpha>
                </el-color-picker>
              </el-form-item>
              <el-form-item label="背景图片" prop="backgroundMaterial">
                <div style="width: 20px;height: 20px;">12</div>
              </el-form-item>
            </template>
            <template v-else>
              <el-form
                style="padding-left:20px;"
                label-width="20px"
                :model="activeComponent"
              >
                <el-form-item label="X" prop="offsetX">
                  <el-input
                    type="number"
                    v-model="activeComponent.offsetX"
                  ></el-input>
                </el-form-item>
                <el-form-item label="Y" prop="offsetY">
                  <el-input
                    type="number"
                    v-model="activeComponent.offsetY"
                  ></el-input>
                </el-form-item>
                <el-form-item label="宽" prop="width">
                  <el-input
                    type="number"
                    v-model="activeComponent.width"
                  ></el-input>
                </el-form-item>
                <el-form-item label="高" prop="height">
                  <el-input
                    type="number"
                    v-model="activeComponent.height"
                  ></el-input>
                </el-form-item>
              </el-form>
            </template>
          </el-form>
        </el-col>
      </el-row>
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
function importAll(r) {
  let obj = {};
  r.keys().forEach((key) => {
    obj[key.replace("./", "").replace(".svg", "")] = r(key);
  });
  return obj;
}
const logos = importAll(require.context("./logo", false, /\.(png|jpe?g|svg)$/));
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
      componentTypes: {},
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
      editForm: null,
      editRules: {
        duration: [
          { required: true, message: "请选择节目时长", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value === "00:00:00") callback(new Error("节目时长不能为0"));
            },
            trigger: "blur",
          },
        ],
      },
      activeComponent: null,
      componentTypeOrder: [
        "video",
        "image",
        "text",
        "html",
        "weather",
        "clock",
        "url",
        "audio",
        "stream",
      ],
      logos,
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
    await this.getResolutions();
    const componentTypes = await ProgramApi.getComponentTypes();
    this.componentTypes = componentTypes;
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
    setComponents() {
      this.editForm.components.forEach(
        (component, i) => (component.zIndex = i + 1)
      );
      this.editForm = {
        ...this.editForm,
      };
    },
    appendComponent(typeCode) {
      if (!this.editForm.components) this.editForm.components = [];
      const component = {
        typeCode,
        zIndex: this.editForm.components.length,
        width: 200,
        height: 200,
        offsetX: 0,
        offsetY: 0,
        materials: [],
      };
      this.activeComponent = component;
      this.editForm.components.push(component);
      this.editForm = {
        ...this.editForm,
      };
    },
    down(i) {
      const tmp = this.editForm.components[i + 1];
      this.editForm.components[i + 1] = this.editForm.components[i];
      this.editForm.components[i] = tmp;
      this.setComponents();
    },
    up(i) {
      const tmp = this.editForm.components[i - 1];
      this.editForm.components[i - 1] = this.editForm.components[i];
      this.editForm.components[i] = tmp;
      this.setComponents();
    },
    top(i) {
      const component = this.editForm.components[i];
      this.editForm.components.splice(i, 1);
      this.editForm.components.unshift(component);
      this.setComponents();
    },
    bottom(i) {
      const component = this.editForm.components[i];
      this.editForm.components.splice(i, 1);
      this.editForm.components.push(component);
      this.setComponents();
    },
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
    async editProgram(code) {
      const res = await ProgramApi.getDetail({ code });
      if (res.code === "200") {
        this.editForm = res.data;
        this.showEditForm = true;
      } else {
        this.$message({ type: "error", message: res.msg });
      }
    },
    dateFormatter(row) {
      let [date, time] = row.updateTime.split("T");
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
.logo {
  width: 57px;
  height: 57px;
}
.prefix {
  margin-right: 10px;
}
.edit .el-dialog {
  width: 100%;
  height: 100%;
}
.canvas-wrapper {
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  height: calc(100vh - 200px);
}
.form {
  margin-left: 36px;
  border-left: 1px solid #999;
  height: calc(100vh - 200px);
  overflow-y: scroll;
}
h5 {
  padding-left: 19px;
  color: rgba(80, 80, 80, 1);
  font-size: 19px;
  line-height: 50px;
  font-weight: bold;
  border-top: 1px solid #999;
}
.component-item {
  display: flex;
  padding-left: 25px;
  font-size: 14px;
  line-height: 28px;
  margin-bottom: 12px;
  justify-content: space-between;
}
.selected {
  background: #eff9ff;
}
.updown {
  width: 30px;
}
</style>
