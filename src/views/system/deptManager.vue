<template>
  <table-page>
    <template v-slot:header>
      <!--  搜索  -->
      <el-form :inline="true" :model="search" class="demo-form-inline">
        <el-form-item label="部门名称">
          <el-input v-model="search.name" placeholder="部门名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSearch">查询</el-button>
          <el-button @click="replaySearch">清空</el-button>
        </el-form-item>
        <el-form-item class="right-button">
          <el-button
            type="success"
            @click="handleEdit({})"
            v-if="pageMenu.adddept"
            >新增部门</el-button
          >
        </el-form-item>
      </el-form>
    </template>
    <!--  表格  -->
    <el-table
      :data="tableData"
      @selection-change="handleDeletion"
      :max-height="$root.tableMaxHeight + 'px'"
      style="width: 100%"
    >
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column prop="name" label="部门名称"></el-table-column>
      <el-table-column prop="intro" label="备注"></el-table-column>
      <el-table-column
        prop="deviceCount"
        label="可管理设备数"
      ></el-table-column>
      <el-table-column prop="founderName" label="创建用户"></el-table-column>
      <el-table-column prop="addTime" label="创建时间"></el-table-column>
      <el-table-column prop="updateUserName" label="更新用户"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间"></el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-if="pageMenu.editdept"
            >编辑</el-button
          >
          <el-button
            type="warning"
            size="small"
            @click="handleEditDevice(scope.row)"
            v-if="pageMenu.pubdeptdev"
            >分配设备
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-if="pageMenu.deldept"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col
        ><el-button
          type="danger"
          @click="batchDelete(tableChecked)"
          v-if="pageMenu.deldept"
          >删除</el-button
        ></el-col
      >
      <pagination
        class="page-div"
        :list="tableData"
        :total="total"
        :page="currentPage"
        :pageSize="pageSize"
        @handleCurrentChange="handleCurrentChange"
        @handleSizeChange="handleSizeChange"
      ></pagination>
    </el-row>

    <!--  新增  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="formLabelWidth"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input
            type="text"
            v-model="editForm.name"
            :maxlength="50"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="intro">
          <el-input
            type="textarea"
            rows="5"
            :maxlength="50"
            v-model="editForm.intro"
            placeholder="请输入备注"
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

    <el-dialog
      title="分配设备"
      :visible.sync="dialogVisibleDevice"
      width="80%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form :label-width="formLabelWidth" :model="editForm">
        <el-form-item label="部门名称" prop="name">
          <el-input
            type="text"
            v-model="editForm.name"
            :disabled="true"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="设备" prop="intro">
          <transferView
            v-if="dialogVisibleDevice"
            :List="staffList"
            ref="transferView"
            @changeTransfer="changeTransfer"
          ></transferView>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose(1)">取 消</el-button>
        <el-button type="primary" @click="submitDeForm('editForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </table-page>
</template>

<script>
import transferView from "components/transfer-view/transfer-view";
import {
  getDeptList,
  GetRolePermissions,
  addDept,
  editDept,
  delDept,
  GetDeviceList,
  UpdateGroupInfo,
} from "http/api/system";
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
      formLabelWidth: "120px",
      rules: {
        name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
      },
      tableChecked: [],
      deviceForm: {},
      staffList: [],
      selectedStaffList: [],
      pageMenu: [],
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
          this.getList(this.currentPage, this.pageSize);
          // console.log(this.pageMenu)
        }
      });
    },
    getList(page, pageSize, keyWord = "") {
      const param = {
        PageIndex: page,
        PageSize: pageSize,
        KeyWord: keyWord,
        Paging: 1,
      };
      getDeptList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          // console.log(res)
        }
      });
    },
    addDept(param) {
      addDept(param).then((res) => {
        this.loading = false;
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.currentPage, this.pageSize);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    editDept(param) {
      editDept(param).then((res) => {
        this.loading = false;
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.currentPage, this.pageSize);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    delDept(param) {
      delDept(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.currentPage, this.pageSize);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    GetDeviceList(code) {
      const param = {
        DeptCode: code,
        FloorCode: "",
        KeyWord: "",
        ScreenCode: "",
      };
      GetDeviceList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.staffList = res.data;
        }
      });
    },
    UpdateGroupInfo(param) {
      UpdateGroupInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose(1);
          this.$message.success(res.msg);
          this.getList(this.currentPage, this.pageSize);
          return;
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    /**
     * End
     * @param val
     */

    //当前页码
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getList(val, this.pageSize);
    },
    //每页数量
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList(this.currentPage, this.pageSize);
    },
    //搜索
    onSearch() {
      this.getList(this.currentPage, this.pageSize, this.search.name);
    },
    //重置搜索
    replaySearch() {
      this.search = {};
      this.currentPage = 1;
      this.getList(this.currentPage, this.pageSize);
    },
    //打开弹窗
    handleEdit(item) {
      this.editForm = JSON.parse(JSON.stringify(item));
      this.dialogVisible = true;
      if (JSON.stringify(item) != "{}") {
        this.dialogTitle = "编辑";
      }
    },
    //分配设备
    handleEditDevice(item) {
      this.dialogVisibleDevice = true;
      this.editForm = JSON.parse(JSON.stringify(item));
      this.GetDeviceList(item.code);
    },
    //关闭弹窗
    handleClose(item = "") {
      this.dialogVisible = false;
      this.dialogVisibleDevice = false;
      this.$refs["editForm"] && this.$refs["editForm"].resetFields();
      this.editForm = {};
      this.selectedStaffList = [];
      this.loading = false;
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.editForm.code) {
            this.editDept(this.editForm);
            return;
          }
          this.addDept(this.editForm);
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
          };
          this.delDept(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //批量删除
    handleDeletion(val) {
      this.tableChecked = val;
    },
    //获取用户的选中
    batchDelete(row) {
      if (row.length === 0) {
        this.$message.error("请选择您要删除的选项");
        return;
      } else {
        this.$confirm("此操作将永久删除, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            let ids = [];
            for (let i = 0; i < row.length; i++) {
              ids.push(row[i].code);
            }
            const param = {
              Code: ids,
            };
            this.delDept(param);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    //分配设备
    submitDeForm() {
      let ids = [];
      if (this.selectedStaffList.length > 0) {
        for (let i = 0; i < this.selectedStaffList.length; i++) {
          ids.push(this.selectedStaffList[i].code);
        }
      }
      const param = {
        Code: this.editForm.code,
        Devices: ids,
      };
      this.UpdateGroupInfo(param);
    },
    //获取选中值
    changeTransfer(item) {
      this.selectedStaffList = item;
    },
  },
  computed: {
    ...mapGetters(["presentMenu"]),
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

.page-div {
  margin-top: 40px;
}
</style>
