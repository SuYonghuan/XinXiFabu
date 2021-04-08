<template>
  <div class="deptManager-content">
    <!--  搜索  -->
    <el-form class="demo-form-inline">
      <el-form-item class="right-button">
        <el-button
          type="success"
          @click="handleEdit({})"
          v-show="pageMenu.addappkey"
          >新增</el-button
        >
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table :data="tableData" style="width: 100%;" height="620">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="description" label="项目名称"></el-table-column>
      <el-table-column prop="operator" label="创建人"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template slot-scope="scope">
          {{ timestampToTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="锁定状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isLock"
            @change="changeShow(scope.row)"
            :disabled="!pageMenu.lockappkey"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleWatch(scope.row)"
            v-show="pageMenu.getappkey"
            >查看
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-show="pageMenu.delappkey"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination
      class="page-div"
      :list="tableData"
      :total="total"
      :page="currentPage"
      :pageSize="pageSize"
      @handleCurrentChange="handleCurrentChange"
      @handleSizeChange="handleSizeChange"
    ></pagination>

    <!--  发布  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="项目名称" prop="description">
          <el-input
            type="text"
            v-model="editForm.description"
            maxlength="20"
            style="width: 40%"
            placeholder="请输入项目名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button
          type="primary"
          @click="submitUpForm('editForm')"
          :loading="loading"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!--  查看  -->
    <el-dialog
      title="详情"
      :visible.sync="dialogVisibleWatch"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <div class="det-div">
        <p class="title">项目名称:</p>
        {{ watchForm.description }}
      </div>
      <div class="det-div">
        <p class="title">开发者ID（Appkey）:</p>
        {{ watchForm.appKey }}
        <el-link
          type="success"
          class="copy-link"
          :underline="false"
          @click="clickCopy(watchForm.appKey)"
          >复制</el-link
        >
        <p class="intro">开发识别码，配合开发者调用系统的接口能力</p>
      </div>
      <div class="det-div">
        <p class="title">开发者ID（AppSecret）:</p>
        {{ watchForm.secret }}
        <el-link
          type="success"
          class="copy-link"
          :underline="false"
          @click="clickCopy(watchForm.secret)"
          >复制</el-link
        >
        <p class="intro">
          校验开发者身份的密码，具有极高的安全性。切记勿把密码直接交给第三方开发者或直接存储在代码中。
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose('editForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import transferView from "components/transfer-view/transfer-view";
import {
  GetRolePermissions,
  AppKeyList,
  AddAppkey,
  LockAppkey,
  DelAppkey,
} from "http/api/system";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";
import { timeFormatting } from "common/js/mixins";

export default {
  name: "deptManager",
  mixins: [timeFormatting],
  data() {
    return {
      search: {},
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      dialogVisible: false,
      dialogVisibleWatch: false,
      dialogTitle: "新增",
      editForm: {},
      watchForm: {},
      deviceForm: {},
      rules: {
        description: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
        ],
      },
      pageMenu: {},
      loading: false,
    };
  },
  created() {
    this.GetRolePermissions();
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    GetRolePermissions() {
      const param = {
        MenuCode: this.presentMenu.code,
      };
      GetRolePermissions(param).then((res) => {
        if (res.code === ERR_OK) {
          for (let a = 0; a < res.data.length; a++) {
            this.pageMenu[res.data[a].actionId] = true;
          }
          this.getList(this.pageSize, this.currentPage);
          console.log(this.pageMenu);
        }
      });
    },
    getList(pageSize, page) {
      const param = {
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      AppKeyList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          console.log(this.tableData);
        }
      });
    },
    AddAppkey(param) {
      AddAppkey(param).then((res) => {
        this.loading = false;
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    LockAppkey(param) {
      LockAppkey(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DelAppkey(param) {
      DelAppkey(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    /**
     * End
     * @param val
     */
    //时间转换
    timestampToTime(item) {
      return this.dateFormat("yyyy-mm-dd hh:ii:ss", new Date(item));
    },
    //当前页码
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getList(this.pageSize, val);
    },
    //每页数量
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //搜索
    onSearch() {
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage, this.search);
    },
    //打开弹窗
    handleEdit(item) {
      this.dialogVisible = true;
    },
    //查看详情
    handleWatch(item) {
      this.dialogVisibleWatch = true;
      this.watchForm = JSON.parse(JSON.stringify(item));
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleWatch = false;
      this.$refs["editForm"].resetFields();
      this.editForm = {};
      this.watchForm = {};
      this.loading = false;
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.AddAppkey(this.editForm);
        }
      });
    },
    //删除
    handleDelete(item) {
      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const param = {
            Code: item.code,
          };
          this.DelAppkey(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //修改启用状态
    changeShow(item) {
      const param = {
        Code: item.code,
      };
      this.LockAppkey(param);
    },
    //复制
    clickCopy(content) {
      let input = document.createElement("input"); // 直接构建input
      input.value = content; // 设置内容
      document.body.appendChild(input); // 添加临时实例
      input.select(); // 选择实例内容
      document.execCommand("Copy"); // 执行复制
      document.body.removeChild(input); // 删除临时实例
      this.$message.success("复制成功！");
    },
  },
  computed: {
    ...mapGetters(["presentMenu", "user", "config"]),
  },
  components: {
    transferView,
  },
};
</script>

<style scoped lang="scss">
.demo-form-inline {
  margin-top: 40px;

  .right-button {
    float: right;
  }
}

.page-div {
  margin-top: 20px;
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}

.det-div {
  width: 100%;
  height: 60px;
  line-height: 40px;
  position: relative;
  display: flex;
  .title {
    width: 200px;
  }
  .intro {
    position: absolute;
    left: 200px;
    top: 20px;
    color: rgba(166, 166, 166, 1);
  }
  .copy-link {
    display: inline-block;
    line-height: 40px;
    margin-left: 20px;
  }
}
</style>
