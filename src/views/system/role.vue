<template>
  <div class="deptManager-content">
    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item class="right-button">
        <el-button
          type="success"
          @click="handleEdit({})"
          v-if="pageMenu.addrole"
          >新增角色</el-button
        >
        <el-button
          type="danger"
          @click="batchDelete(tableChecked)"
          v-if="pageMenu.delrole"
          >删除</el-button
        >
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table
      :data="tableData"
      @selection-change="handleDeletion"
      height="680px"
      style="width: 100%"
    >
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column prop="name" label="角色名称"></el-table-column>
      <el-table-column prop="description" label="角色描述"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-if="pageMenu.editrole"
            :disabled="scope.row.name == '超级管理员'"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-if="pageMenu.delrole"
            :disabled="scope.row.name == '超级管理员'"
            >删除</el-button
          >
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

    <!--  新增  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      max-height="560px"
      append-to-body
    >
      <el-form
        :label-width="formLabelWidth"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
            type="text"
            v-model="editForm.name"
            :maxlength="10"
            placeholder="请输入角色名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="intro">
          <el-input
            type="textarea"
            rows="5"
            v-model="editForm.description"
            :maxlength="50"
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限" prop="authority">
          <el-tree
            v-model="editForm.authority"
            v-if="dialogVisible"
            :data="treeData"
            show-checkbox
            node-key="code"
            ref="tree"
            :default-checked-keys="editForm.authority"
            @check-change="handleCheckChange"
            :props="defaultProps"
          >
          </el-tree>
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
  </div>
</template>

<script>
import pagination from "components/pagination/pagination";
import {
  getRolesList,
  GetRolePermissions,
  addRoles,
  editRoles,
  delRoles,
  GetMenuActionTree,
  GetPermissionsList,
} from "http/api/system";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "deptManager",
  data() {
    const authority = (rule, value, callback) => {
      if (this.editForm.authority.length === 0) {
        callback(new Error("请选择权限"));
      } else {
        callback();
      }
    };
    return {
      search: {},
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: "新增",
      editForm: {},
      formLabelWidth: "120px",
      rules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        authority: [{ required: true, validator: authority, trigger: "blur" }],
      },
      tableChecked: [],
      treeData: [],
      defaultProps: {
        children: "childList",
        label: "textCH",
      },
      authority: [],
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
          this.getList(this.currentPage, this.pageSize);
          // console.log(this.pageMenu)
        }
      });
    },
    getList(page, pageSize) {
      const param = {
        PageIndex: page,
        PageSize: pageSize,
        Paging: 1,
      };
      getRolesList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          // console.log(res)
        }
      });
    },
    GetMenuActionTree() {
      GetMenuActionTree().then((res) => {
        if (res.code === ERR_OK) {
          this.treeData = res.data;
          for (let i = 0; i < this.treeData.length; i++) {
            for (let j = 0; j < this.treeData[i].childList.length; j++) {
              for (
                let k = 0;
                k < this.treeData[i].childList[j].actions.length;
                k++
              ) {
                this.treeData[i].childList[j].actions[k].textCH = this.treeData[
                  i
                ].childList[j].actions[k].actionName;
              }
              this.treeData[i].childList[j].childList = this.treeData[
                i
              ].childList[j].actions;
            }
          }
          // console.log(this.treeData)
        }
      });
    },
    GetPermissionsList(param) {
      GetPermissionsList(param).then((res) => {
        if (res.code === ERR_OK) {
          let array = [];
          for (let i = 0; i < res.data.length; i++) {
            array[i] = res.data[i].code;
          }
          this.editForm.authority = array;
          this.$forceUpdate();
        }
      });
    },
    addRoles(param) {
      addRoles(param).then((res) => {
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
    editRoles(param) {
      editRoles(param).then((res) => {
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
    delRoles(param) {
      delRoles(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.currentPage, this.pageSize);
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
      this.getList(val, this.pageSize);
    },
    //每页数量
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList(this.currentPage, this.pageSize);
    },
    //打开弹窗
    handleEdit(item) {
      this.treeData.length < 1 && this.GetMenuActionTree();
      this.editForm.authority = [];
      this.dialogVisible = true;
      if (JSON.stringify(item) != "{}") {
        this.editForm = JSON.parse(JSON.stringify(item));
        this.dialogTitle = "编辑";
        const param = {
          RoleCode: this.editForm.code,
        };
        this.GetPermissionsList(param);
      }
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.$refs["editForm"].resetFields();
      this.editForm = {};
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          const param = {
            Name: this.editForm.name,
            Description: this.editForm.description,
            PermissionCode: this.editForm.authority,
          };
          if (this.editForm.code) {
            param.Code = this.editForm.code;
            this.editRoles(param);
            return;
          }
          this.addRoles(param);
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
            code: [item.code],
          };
          this.delRoles(param);
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
            this.delRoles(param);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    //树形结构点击
    handleCheckChange(obj, ele, oth) {
      let res = this.$refs.tree.getCheckedNodes(true, true); //这里两个true，1. 是否只是叶子节点 2. 是否包含半选节点（就是使得选择的时候不包含父节点）
      this.editForm.authority = res.map((item) => item.code);
      this.$refs.editForm.validateField("authority");
    },
  },
  computed: {
    ...mapGetters(["presentMenu"]),
  },
  components: {
    pagination,
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
  margin-top: 40px;
}
</style>
