<template>
  <div>
    <el-tabs
      v-model="activeName"
      class="mt10"
      style="background: #fafafb;"
      @tab-click="onTabChange"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab"
        :label="tab"
        :name="tab"
        class="wrap"
      >
        <div class="page-collections-wrap">
          <div
            class="block-collection"
            v-for="theme in list"
            :key="theme.code"
            @click="showIconsModal(theme)"
          >
            <ul v-if="canI.listsigntheme">
              <li v-for="icon in theme.icons.slice(0, 15)" :key="icon.objCode">
                <img class="icon" :src="icon.filePath" alt="" />
              </li>
            </ul>

            <div class="collection-info mt10 ">
              <span
                @click.stop="canI.editthemename && showEditNameModal(theme)"
                >{{ theme.name }}</span
              >
              <span class="info-item fr">icons {{ theme.icons.length }}</span>
            </div>
            <div class="collection-info mt10 clearfix">
              <el-button
                style="width:100%"
                v-if="theme.readOnly && canI.addsigntheme"
                type="primary"
                @click.stop="showCopyModal(theme)"
                >复制图标库</el-button
              >
              <el-button
                style="width:100%"
                v-else-if="canI.deletesigntheme"
                type="danger"
                @click.stop="showDeletePrompt(theme)"
                >删除图标库</el-button
              >
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :visible.sync="showModal"
      append-to-body
      :title="theme && theme.name"
    >
      <div v-if="theme">
        <div class="arrow" v-for="icon in theme.icons" :key="icon.objCode">
          <img
            :src="icon.filePath"
            @click="canI.editsigntheme && handleEdit(icon)"
          />
          {{ icon.name }}
        </div>
      </div>
    </el-dialog>
    <el-dialog
      title="图标替换"
      :visible.sync="showEditModal"
      append-to-body
      style="text-align: center"
    >
      <el-upload
        v-if="form"
        class="uploadImg"
        style="margin: auto;"
        :action="uploadUrl"
        ref="upload"
        list-type="picture-card"
        :on-success="postUpload"
        :auto-upload="true"
        :file-list="form.fileList"
        :show-file-list="false"
        :on-remove="
          () => {
            form.fileList = [];
          }
        "
      >
        <img
          style="width:148px;height:148px;"
          v-if="form.fileList.length"
          :src="form.fileList[0].url"
        />
        <i v-else class="el-icon-plus"></i>
      </el-upload>

      <div slot="footer" v-if="form">
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button
          :disabled="!form.fileList || !form.fileList.length"
          type="primary"
          @click="submit"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { cPostForYun } from "../../http/http.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/mall";
const nameTypeCodeMap = { 图标管理: 0, 箭头管理: 1 };
const api = {
  get: cPostForYun("/Api/SignTheme/SignThemeList"),
  post: cPostForYun("/Api/SignTheme/Add"),
  delete: cPostForYun("/Api/SignTheme/Del"),
  put: cPostForYun("/Api/SignTheme/EditThemeName"),
  putIcon: cPostForYun("/Api/SignTheme/EditIcon"),
};
export default {
  data() {
    return {
      activeName: "图标管理",
      tabs: ["图标管理", "箭头管理"],
      lists: { 0: [], 1: [] },
      theme: null,
      showModal: false,
      showEditModal: false,
      form: null,
      canI: {},
    };
  },
  computed: {
    ...mapGetters(["config", "presentMenu", "user"]),
    uploadUrl() {
      return this.config.fileUrl + this.config.yunUpdateFile;
    },
    typeCode() {
      return nameTypeCodeMap[this.activeName];
    },
    list() {
      return this.lists[this.typeCode];
    },
  },
  async mounted() {
    await this.GetRolePermissions();
    console.log(this.canI);
    this.refresh();
  },
  methods: {
    async GetRolePermissions() {
      const param = {
        MenuCode: this.presentMenu.code,
      };
      const res = await GetRolePermissions(param);
      if (res.code === "200") {
        for (let a = 0; a < res.data.length; a++) {
          this.canI[res.data[a].actionId] = true;
        }
      }
    },
    async showEditNameModal(theme) {
      if (theme.readOnly) return;
      try {
        const { value: name } = await this.$prompt("图标库名称", "编辑", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValidator(val) {
            if (!val) return "请填写图标库名称";
            if (val.length < 4 || val.length > 24) return "名称长度4-24位";
            return true;
          },
        });
        const { code, msg } = await api.put({
          mallCode: this.user.mallCode,
          name,
          themeCode: theme.code,
        });
        if (code !== "200")
          return this.$message({ type: "error", message: msg });
        this.refresh();
      } catch (error) {}
    },
    async submit() {
      const { code, msg } = await api.putIcon({
        mallCode: this.user.mallCode,
        themeCode: this.theme.code,
        objCode: this.form.objCode,
        filePath: this.form.fileList[0].name,
      });
      if (code == "200") {
        await this.refresh();
        this.theme = this.list.find(({ code }) => code === this.theme.code);
        this.showEditModal = false;
      } else {
        this.$message.error(msg);
      }
    },
    handleEdit({ objCode, filePath }) {
      if (this.theme.readOnly) return;
      this.form = {
        objCode,
        fileList: [{ name: filePath, url: filePath }],
      };
      this.showEditModal = true;
    },
    postUpload({ data, code, msg }, file) {
      if (code != "200") {
        this.form.fileList = [];
        this.$message.error(msg);
      } else this.form.fileList = [{ name: data.filePath, url: file.url }];
    },
    showIconsModal(theme) {
      this.theme = theme;
      this.showModal = true;
    },
    async showCopyModal(theme) {
      try {
        const { value: themeName } = await this.$prompt("图标库名称", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValidator(val) {
            if (!val) return "请填写图标库名称";
            if (val.length < 4 || val.length > 24) return "名称长度4-24位";
            return true;
          },
        });
        const { code, msg } = await api.post({
          mallCode: this.user.mallCode,
          themeName,
          sourceCode: theme.code,
        });
        if (code !== "200")
          return this.$message({ type: "error", message: msg });
        this.refresh();
      } catch (error) {}
    },
    async showDeletePrompt(theme) {
      try {
        await this.$confirm("您确定要删除该图标库", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        });
        const { code, msg } = await api.delete({
          mallCode: this.user.mallCode,
          codes: [theme.code],
        });
        if (code !== "200")
          return this.$message({ type: "error", message: msg });
        this.refresh();
      } catch (error) {}
    },
    onTabChange() {
      this.refresh();
    },
    refresh() {
      return this.getList();
    },
    async getList() {
      const { code, data, msg } = await api.get({
        mallCode: this.user.mallCode,
        dataType: this.typeCode,
        paging: 0,
      });
      if (code === "200") {
        this.lists[this.typeCode] = data;
      } else {
        this.$message({ type: "error", message: msg });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.arrow {
  display: inline-block;
  width: 106px;
  text-align: center;
  margin-right: 73px;
  margin-bottom: 23px;
  img {
    display: block;
    width: 90px;
    height: 90px;
    margin-bottom: 23px;
    cursor: pointer;
  }
}

.clearfix {
  *zoom: 1;
  &::before,
  &::after {
    display: table;
    content: "";
  }
}
.mt10 {
  margin-top: 10px;
}
.fr {
  float: right;
}
.icon {
  width: 25px;
  height: 25px;
}
ul {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  li {
    height: 50px;
    padding-top: 12.5px;
  }
}
.wrap {
  margin: 0 auto;

  .page-collections-wrap {
    padding-top: 30px;
    text-align: left;
    min-height: 700px;
    .block-collection {
      width: 316px;
      padding: 15px;
      background: #fff;
      border-radius: 5px;
      margin-right: 20px;
      margin-bottom: 20px;
      text-align: center;
      display: inline-block;
      vertical-align: top;
      transition: box-shadow 0.4s, transform 0.4s;
      position: relative;
      overflow: hidden;
      margin: 20px 33px 20px 12px;
      cursor: pointer;
      &:hover {
        transform: translateY(-2%);
        box-shadow: 1px 4px 10px 2px #ccc;
      }
      .icons-container {
        cursor: pointer;
        overflow: hidden;
        position: relative;
        color: #666;
        display: block;
        height: 210px;
      }

      .collection-info {
        height: 30px;
        line-height: 30px;
        text-align: left;
        .info-item {
          color: #999;
          margin-right: 15px;
        }
      }
    }
  }
}
</style>
