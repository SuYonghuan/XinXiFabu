<template>
  <table-page>
    <template v-slot:header>
      <el-button
        style="float: right"
        class="svg-suffix"
        type="primary"
        v-if="pageMenu.addbuild"
        @click="handleEdit({})"
        ><svg class="icon" aria-hidden="true">
          <use xlink:href="#iconjia"></use></svg
        >新增</el-button
      >
    </template>

    <!--  表格  -->
    <el-table :data="tableData" :max-height="$root.tableMaxHeight + 'px'">
      <el-table-column prop="name" label="楼栋名称"></el-table-column>
      <el-table-column label="操作" width="120px">
        <template slot-scope="scope">
          <el-tooltip
            transition="none"
            effect="light"
            content="编辑"
            placement="top"
          >
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="pageMenu.editbuild"
                @click="handleEdit(scope.row)"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconbianji"></use></svg
              ></el-button>
            </span>
          </el-tooltip>
          <el-tooltip
            transition="none"
            effect="light"
            content="删除"
            placement="top"
          >
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="pageMenu.delbuild"
                @click="handleDelete(scope.row)"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconshanchu"></use></svg
              ></el-button>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <div type="flex" style="margin-top: 16px;">
      <pagination
        style="float:right"
        :list="tableData"
        :total="total"
        :page="currentPage"
        :pageSize="pageSize"
        @handleCurrentChange="handleCurrentChange"
        @handleSizeChange="handleSizeChange"
      ></pagination>
    </div>

    <!--  发布  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="楼栋名称" prop="name">
          <el-input
            type="text"
            v-model="editForm.name"
            maxlength="5"
            placeholder="请输入楼栋名称"
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
  </table-page>
</template>

<script>
import transferView from "components/transfer-view/transfer-view";
import {
  GetRolePermissions,
  GetBuildingList,
  AddBuilding,
  EditBuilding,
  DelBuilding,
} from "http/api/mall";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "deptManager",
  data() {
    return {
      search: {},
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      dialogVisible: false,
      dialogVisibleDevice: false,
      dialogTitle: "新增",
      editForm: {},
      tableChecked: [],
      deviceForm: {},
      rules: {
        name: [{ required: true, message: "请输入楼栋名称", trigger: "blur" }],
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
          // console.log(this.pageMenu)
        }
      });
    },
    getList(pageSize, page) {
      const param = {
        UserName: this.user.accountName,
        MallCode: this.user.mallCode,
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      GetBuildingList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
        }
      });
    },
    AddBuilding(param) {
      AddBuilding(param).then((res) => {
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
    EditBuilding(param) {
      EditBuilding(param).then((res) => {
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
    DelBuilding(param) {
      DelBuilding(param).then((res) => {
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

    //当前页码
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getList(this.pageSize, val);
    },
    //每页数量
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList(this.pageSize, this.currentPage);
    },
    //打开弹窗
    handleEdit(item) {
      this.dialogVisible = true;
      if (JSON.stringify(item) != "{}") {
        this.editForm = JSON.parse(JSON.stringify(item));
        this.dialogTitle = "编辑";
      }
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleDevice = false;
      this.$refs["editForm"].resetFields();
      this.editForm = {};
      this.loading = false;
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          const param = {
            BuildingName: this.editForm.name,
            MallCode: this.user.mallCode,
            UserName: this.user.accountName,
          };
          if (this.editForm.code) {
            param.BuildingCode = this.editForm.code;
            this.EditBuilding(param);
            return;
          }
          this.AddBuilding(param);
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
            Code: [item.code],
            MallCode: this.user.mallCode,
            UserName: this.user.accountName,
          };
          this.DelBuilding(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
  computed: {
    ...mapGetters(["presentMenu", "user"]),
  },
  components: {
    transferView,
  },
};
</script>

<style scoped lang="scss">
.demo-form-inline {
  .right-button {
    float: right;
  }
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}
</style>
