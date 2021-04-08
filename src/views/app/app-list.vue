<template>
  <div class="deptManager-content">
    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="应用名称">
        <el-input v-model="search.Keywords" placeholder="应用名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table
      :data="tableData"
      style="width: 100%"
      :max-height="$root.tableMaxHeight + 'px'"
    >
      <el-table-column prop="name" label="应用名称"></el-table-column>
      <el-table-column prop="filePath" label="ICON">
        <template slot-scope="scope">
          <img :src="scope.row.logoPath" width="30" height="30" />
        </template>
      </el-table-column>
      <el-table-column prop="appType" label="应用类型">
        <template slot-scope="scope">
          {{ appType[scope.row.appType] }}
        </template>
      </el-table-column>
      <el-table-column prop="screen" label="分辨率"></el-table-column>
      <el-table-column prop="shelfTime" label="下架时间">
        <template slot-scope="scope">
          {{
            scope.row.shelfTime ? timestampToTime(scope.row.shelfTime) : "----"
          }}
        </template>
      </el-table-column>
      <el-table-column prop="appUrl" label="后台管理">
        <template slot-scope="scope">
          <el-link
            type="primary"
            :underline="false"
            v-show="scope.row.appUrl"
            :href="scope.row.appUrl"
            target="_blank"
          >
            点击跳转
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEditDevice(scope.row)"
            v-if="pageMenu.appdevlist"
            >发布
          </el-button>
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
      title="发布到设备"
      :visible.sync="dialogVisibleDevice"
      width="80%"
      :before-close="handleClose"
      append-to-body
      class="dialog"
    >
      <el-form :model="deviceForm" ref="editForm">
        <el-form-item prop="intro">
          <transferView
            :List="staffList"
            ref="transferView"
            @changeTransfer="changeTransfer"
            v-if="transferStatus"
          ></transferView>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitDeForm('editForm')"
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
  GetMallAppList,
  GetAppDevList,
  PublishApp,
} from "http/api/app";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";
import { timeFormatting } from "common/js/mixins";

export default {
  name: "deptManager",
  mixins: [timeFormatting],
  data() {
    return {
      search: { Keywords: "" },
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
      pageMenu: {},
      appType: { 1: "微信小程序", 2: "H5网页应用", 3: "APK" },
      transferStatus: false,
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
        Keywords: this.search.Keywords,
        MallCode: this.user.mallCode,
        AppScreen: "",
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      GetMallAppList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          // console.log(this.tableData)
        }
      });
    },
    GetAppDevList(Code, Screen) {
      const param = {
        AppCode: Code,
        Screen: Screen,
      };
      GetAppDevList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.staffList.unIncludeDevice = res.data.unGroupDevice;
          this.staffList.includeDevice = res.data.groupDevice;
          this.selectedStaffList = res.data.groupDevice;
          this.transferStatus = true;
          return;
        }
      });
    },
    PublishApp(param) {
      PublishApp(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.GetSubtitleList();
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
      this.getList(this.pageSize, this.currentPage);
    },
    //重置搜索
    replaySearch() {
      this.search = { Keywords: "" };
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //打开弹窗
    handleEdit(item) {
      this.dialogVisible = true;
    },
    //分配设备
    handleEditDevice(item) {
      this.GetAppDevList(item.code, item.screen);
      this.editForm = item;
      this.dialogVisibleDevice = true;
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleDevice = false;
      this.$refs["editForm"].resetFields();
      this.transferStatus = false;
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
        DevCodes: ids,
        AppCode: this.editForm.code,
      };
      this.PublishApp(param);
    },
    //获取选中值
    changeTransfer(item) {
      this.selectedStaffList = item;
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

<style lang="scss">
.dialog .el-dialog {
}
</style>
<style scoped lang="scss">
.demo-form-inline {
  .right-button {
    float: right;
  }
}
</style>
