<template>
  <div class="deptManager-content">
    <!--  表格  -->
    <el-table
      :data="tableData"
      style="width: 100%;margin-top: 20px;"
      height="620"
    >
      <el-table-column prop="devNum" label="设备名称"></el-table-column>
      <el-table-column prop="ip" label="IP地址"></el-table-column>
      <el-table-column prop="floor" label="楼层/楼栋"></el-table-column>
      <el-table-column prop="appCount" label="应用数"></el-table-column>
      <el-table-column prop="defaultApp" label="底部应用"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEditDevice(scope.row)"
            v-if="pageMenu.appslotset"
            >设置
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
      title="管理应用"
      :visible.sync="dialogVisibleDevice"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-table
        :data="appInfo"
        style="width: 100%;margin-top: 20px;"
        max-height="700px"
      >
        <el-table-column prop="name" label="设为底部">
          <template slot-scope="scope">
            <el-radio
              size="mini"
              v-model="editForm[scope.$index].Default"
              :label="1"
              @change="changeCheckbox(scope.$index)"
              >选择
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="应用名称"></el-table-column>
        <el-table-column prop="name" label="置顶时间" width="500px">
          <template slot-scope="scope">
            <el-checkbox
              size="mini"
              v-for="(item, index) of timeInfo.timeRelateList"
              v-show="editForm[scope.$index].Default == 0"
              v-model="editForm[scope.$index].TimeSlot"
              :label="item.timeSlotCode"
              :key="item.timeSlotCode"
            >
              {{ item.beginTimeSlot }}
            </el-checkbox>
          </template>
        </el-table-column>
      </el-table>
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
  GetAppDev,
  GetTimeInfo,
  GetAppListByDev,
  SetDev,
} from "http/api/app";
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
      editForm: [],
      tableChecked: [],
      deviceForm: {},
      pageMenu: {},
      timeInfo: {},
      appInfo: [],
    };
  },
  created() {
    this.GetRolePermissions();
    this.GetTimeInfo();
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
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
        MallCode: this.user.mallCode,
      };
      GetAppDev(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          // console.log(this.tableData)
        }
      });
    },
    GetTimeInfo() {
      const param = {
        MallCode: this.user.mallCode,
      };
      GetTimeInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          this.timeInfo = res.data;
        }
      });
    },
    GetAppListByDev(code) {
      const param = {
        DevCode: code,
        MallCode: this.user.mallCode,
      };
      GetAppListByDev(param).then((res) => {
        if (res.code === ERR_OK) {
          this.appInfo = res.data;
          if (this.appInfo.length > 0) {
            this.editForm = [];
            for (let i = 0; i < this.appInfo.length; i++) {
              let timeSlot = [];
              if (this.appInfo[i].timeSlot.length > 0) {
                for (let j = 0; j < this.appInfo[i].timeSlot.length; j++) {
                  timeSlot[j] = this.appInfo[i].timeSlot[j].timeSlot;
                }
              }
              this.editForm.push({
                AppCode: this.appInfo[i].code,
                Default: this.appInfo[i].default ? 1 : 0,
                TimeSlot: timeSlot,
              });
            }
          }
        }
      });
    },
    SetDev(param) {
      SetDev(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
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
      this.pageSize = val;
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //分配设备
    handleEditDevice(item) {
      this.GetAppListByDev(item.devCode);
      this.dialogVisibleDevice = true;
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleDevice = false;
    },
    //提交
    submitUpForm(item) {
      const param = {
        App: this.editForm,
      };
      this.SetDev(param);
    },
    changeCheckbox(index) {
      for (let i = 0; i < this.editForm.length; i++) {
        this.editForm[i].TimeSlot = [];
        if (i != index) {
          this.editForm[i].Default = 0;
        }
      }
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

<style>
.el-dialog {
}
</style>
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
