<template>
  <div class="deptManager-content">
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item class="right-button">
        <el-button
          type="success"
          @click="handleEdit({})"
          v-if="pageMenu.addarea"
          >新增区域</el-button
        >
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table
      :data="tableData"
      height="620"
      style="width: 100%;margin-top: 20px;"
    >
      <el-table-column prop="areaName" label="区域名称"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-if="pageMenu.delarea"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-if="pageMenu.delarea"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination
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
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="区域名称" prop="areaName">
          <el-input
            type="text"
            v-model="editForm.areaName"
            :maxlength="20"
            show-word-limit
            placeholder="请输入区域名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')"
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
  GetRegionList,
  AddRegion,
  EditRegion,
  DelRegion,
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
        areaName: [
          { required: true, message: "请输入区域名称", trigger: "blur" },
        ],
      },
      pageMenu: {},
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
        MallCode: this.user.mallCode,
      };
      GetRegionList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          console.log(this.tableData);
        }
      });
    },
    AddRegion(param) {
      AddRegion(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    EditRegion(param) {
      EditRegion(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DelRegion(param) {
      DelRegion(param).then((res) => {
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
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          const param = {
            AreaName: this.editForm.areaName,
            MallCode: this.user.mallCode,
          };
          if (this.editForm.code) {
            param.AreaCode = this.editForm.code;
            this.EditRegion(param);
            return;
          }
          this.AddRegion(param);
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
          };
          this.DelRegion(param);
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
  margin-top: 40px;

  .right-button {
    float: right;
  }
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}
</style>
