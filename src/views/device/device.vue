<template>
  <table-page>
    <template v-slot:header>
      <el-form :inline="true" :model="search" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input
            v-model="search.SearchKey"
            style="width: 220px"
            placeholder="根据IP、设备名称、备注搜索"
          ></el-input>
        </el-form-item>
        <el-form-item label="屏幕属性">
          <el-select v-model="search.ScreenCode" placeholder="请选择">
            <el-option
              v-for="item in searchDeviceList"
              :label="item.sName"
              :value="item.code"
              :key="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋/楼层">
          <el-cascader
            v-model="search.FloorCode"
            :options="floorData"
            :props="floorProps"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item>
          <span class="btn1" @click="onSearch">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconsousuo"></use>
            </svg>
          </span>
          <span class="btn1" @click="replaySearch">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshanchu"></use>
            </svg>
          </span>
        </el-form-item>
        <p class="right-button">
          <el-button
            class="svg-suffix"
            type="primary"
            v-if="pageMenu.exportDevice"
            @click="handleDeviceExcel({})"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#icondaochuzuwendang"></use></svg
            >导出设备</el-button
          >
          <el-button
            class="svg-suffix"
            type="primary"
            v-if="pageMenu.devexport"
            @click="handleExcel({})"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#icondaochudanwendang"></use></svg
            >导出设备节目</el-button
          >
          <span class="btn1" style="margin-left:8px;" @click="refresh()">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshuaxin"></use>
            </svg>
          </span>
        </p>
      </el-form>
    </template>
    <!--  表格  -->
    <el-table
      :data="tableData"
      @selection-change="handleDeletion"
      :max-height="$root.tableMaxHeight + 'px'"
      style="width: 100%"
      ref="table"
      @filter-change="filterTag"
    >
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column prop="devNum" label="设备名称" min-width="150px">
        <template slot-scope="scope">
          <p @click="clickName(scope.row)" style="cursor:pointer">
            {{ scope.row.devNum }}
            <i class="el-icon-edit"></i>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP"></el-table-column>
      <el-table-column prop="name" label="标签">
        <template slot-scope="scope">
          <svg
            class="icon"
            aria-hidden="true"
            v-if="scope.row.systemType == 'Android'"
          >
            <use xlink:href="#iconanzhuo"></use>
          </svg>
          <svg
            class="icon"
            aria-hidden="true"
            v-if="scope.row.systemType == 'Windows'"
          >
            <use xlink:href="#iconweiruan"></use>
          </svg>
          <!--          <img src="../../common/images/map.png" v-show="scope.row.position" width="25" alt="">-->
          <el-popover
            placement="top-start"
            v-show="
              scope.row.deviceType == '触摸屏' &&
                scope.row.systemType == 'Windows'
            "
            trigger="hover"
          >
            <p>
              触摸状态：
              <el-switch
                v-model="scope.row.operable"
                :disabled="!pageMenu.devscreenoper"
                @change="changScreenOper(scope.row)"
              ></el-switch>
            </p>
            <svg slot="reference" class="icon" aria-hidden="true">
              <use xlink:href="#iconchumo"></use>
            </svg>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="sName" label="屏幕属性"></el-table-column>
      <el-table-column prop="floor" label="楼栋/楼层"></el-table-column>
      <el-table-column label="设备所在组">
        <template slot-scope="scope">
          {{ scope.row.groupList.length }}
        </template>
      </el-table-column>
      <el-table-column prop="shutdownTime" label="关机时间"></el-table-column>
      <el-table-column
        prop="name"
        label="设备状态"
        column-key="deviceOnline"
        :filters="status"
        :filter-multiple="false"
      >
        <template slot-scope="scope">
          <span
            :class="['dot', scope.row.deviceOnline ? 'green' : 'red']"
          ></span
          >{{ scope.row.deviceOnline ? "在线" : "离线" }}
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="前端状态"
        column-key="frontOnline"
        :filters="status"
        :filter-multiple="false"
      >
        <template slot-scope="scope">
          <el-tooltip placement="bottom">
            <div slot="content">
              <p>前端应用：{{ scope.row.appName }}</p>
              <p>应用版本号：{{ scope.row.appVersion }}</p>
              <p>容器版本号：{{ scope.row.containerVersion }}</p>
            </div>
            <span
              ><span
                :class="['dot', scope.row.frontOnline ? 'green' : 'red']"
              ></span
              >{{ scope.row.frontOnline ? "在线" : "离线" }}</span
            >
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="同屏设备">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isSyn"
            @change="changeSyn(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="132px">
        <template slot-scope="scope">
          <el-button
            class="svg-button"
            type="text"
            v-if="pageMenu.devoper"
            @click="handleDetail(scope.row)"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshebeiguanli"></use></svg
          ></el-button>
          <el-button
            class="svg-button"
            type="text"
            v-if="pageMenu.devicescreenshot"
            :loading="scope.row.loading"
            @click="screenshot(scope.row, scope.$index)"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconjieping"></use></svg
          ></el-button>
          <el-dropdown style="margin-left: 20px">
            <el-button class="svg-button" type="text">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icongengduo"></use></svg
            ></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                ><p @click="reboot(scope.row)" v-if="pageMenu.devrestart">
                  重启
                </p></el-dropdown-item
              >
              <el-dropdown-item
                ><p @click="shut(scope.row)" v-if="pageMenu.devshutdown">
                  关机
                </p></el-dropdown-item
              >
              <el-dropdown-item
                ><p
                  @click="handleEdit(scope.row, 2)"
                  v-if="pageMenu.devsetshutdowntime"
                >
                  关机时间
                </p>
              </el-dropdown-item>
              <el-dropdown-item
                ><p
                  @click="cleanShutTime(scope.row)"
                  v-if="pageMenu.devclearshutdowntime"
                >
                  清除关机时间
                </p>
              </el-dropdown-item>
              <el-dropdown-item v-if="pageMenu.devdel"
                ><p @click="handleDelete(scope.row)">删除</p></el-dropdown-item
              >
              <el-dropdown-item
                v-if="pageMenu.startexplorer"
                v-show="scope.row.systemType == 'Windows'"
                ><p @click="handleExplorer(scope.row, 2)">
                  开启Explorer
                </p></el-dropdown-item
              >
              <el-dropdown-item
                v-if="pageMenu.killexplorer"
                v-show="scope.row.systemType == 'Windows'"
                ><p @click="handleExplorer(scope.row, 1)">
                  关闭Explorer
                </p></el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col>
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.devshutdown"
          @click="shut(tableChecked, 1)"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconguanji"></use></svg
          >关机</el-button
        >
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.devrestart"
          @click="reboot(tableChecked, 1)"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconzhongqi"></use></svg
          >重启</el-button
        >
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.devsetshutdowntime"
          @click="handleEdit(tableChecked, 1)"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconguanjishijian"></use></svg
          >关机时间</el-button
        >
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.devclearshutdowntime"
          @click="cleanShutTime(tableChecked, 1)"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconqingchuguanjishijian"></use></svg
          >清除关机时间</el-button
        >
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.devdel"
          @click="batchDelete(tableChecked)"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconshanchu"></use></svg
          >删除</el-button
        >
      </el-col>
      <pagination
        :list="tableData"
        :total="total"
        :page="currentPage"
        :pageSize="pageSize"
        @handleCurrentChange="handleCurrentChange"
        @handleSizeChange="handleSizeChange"
      ></pagination>
    </el-row>

    <!--  关机时间  -->
    <el-dialog
      title="关机时间"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="formLabelWidth"
        :model="editForm"
        :rules="rules1"
        ref="editForm"
      >
        <el-form-item label="关机时间" prop="shutdownTime">
          <el-time-picker
            v-model="editForm.shutdownTime"
            :format="'HH:mm'"
            :value-format="'HH:mm'"
            placeholder="关机时间"
          >
          </el-time-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitDownForm(tableChecked)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!--  修改设备名  -->
    <el-dialog
      title="修改信息"
      :visible.sync="nameDialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        label-width="120px"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="设备名称" prop="devNum">
          <el-input
            size="small"
            v-model="editForm.devNum"
            auto-complete="off"
            placeholder="请输入设备名称"
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

    <div class="max-div" v-show="shotImg" @click="clickMaxImg">
      <img :src="shotImg" alt="" style="max-width: 1920px;max-height: 900px;" />
    </div>
  </table-page>
</template>

<script>
import {
  GetDeviceList,
  GetDeviceOptionsNew,
  GetRolePermissions,
  DeviceCommandReStart,
  DeviceCommandShutDown,
  DeviceCleanShutDownTime,
  SetSynStatus,
  ScreenOper,
  DelDevices,
  ExportDevProgs,
  DevNumEdit,
  DeviceSetShutDownTime,
  DeviceScreenshot,
  KillExplorer,
  StartExplorer,
} from "http/api/device";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "deptManager",
  data() {
    return {
      search: {
        SearchKey: "",
        ScreenCode: "",
        FloorCode: "",
        DevStatus: -1,
        FontStatus: -1,
      },
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      nameDialogVisible: false,
      dialogTitle: "新增",
      editForm: { shutdownTime: "" },
      formLabelWidth: "120px",
      tableChecked: [],
      status: [
        { text: "在线", value: 1 },
        { text: "离线", value: 0 },
      ],
      pageMenu: [],
      searchDeviceList: [],
      floorProps: {
        label: "floorName",
        value: "code",
        children: "floors",
        emitPath: false,
      },
      floorData: [],
      excelData: [],
      rules: {
        devNum: [
          { required: true, message: "请输入设备名称", trigger: "blur" },
        ],
      },
      rules1: {
        shutdownTime: [
          { required: true, message: "请选择关机时间", trigger: "blur" },
        ],
      },
      downType: 1,
      shotImg: "",
      loadingStatus: null,
    };
  },
  created() {
    this.GetRolePermissions();
    this.GetDeviceOptionsNew();
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
    getList(pageSize, page, Paging = 1) {
      const param = {
        SearchKey: this.search.SearchKey,
        ScreenCode: this.search.ScreenCode,
        FloorCode: this.search.FloorCode,
        DevStatus: this.search.DevStatus,
        FontStatus: this.search.FontStatus,
        Paging: Paging,
        PageIndex: page,
        PageSize: pageSize,
      };
      GetDeviceList(param).then((res) => {
        if (res.code === ERR_OK) {
          if (Paging == 1) {
            this.tableData = res.data.list;
            this.total = res.data.allCount;
          } else {
            this.excelData = res.data;
            for (let i = 0; i < this.excelData.length; i++) {
              this.excelData[i].deviceOnlineTxt = "设备不在线";
              this.excelData[i].frontOnlineTxt = "前端不在线";

              if (this.excelData[i].deviceOnline) {
                this.excelData[i].deviceOnlineTxt = "设备在线";
              }
              if (this.excelData[i].frontOnline) {
                this.excelData[i].frontOnlineTxt = "前端在线";
              }
            }
            this.export2Excel1();
          }
          // console.log(this.tableData)
        }
      });
    },
    GetDeviceOptionsNew() {
      GetDeviceOptionsNew({}).then((res) => {
        if (res.code === ERR_OK) {
          this.searchDeviceList = res.data.screenInfos;
          this.floorData = res.data.buildings;
          if (this.floorData.length > 0) {
            for (let i = 0; i < this.floorData.length; i++) {
              this.floorData[i].floorName = this.floorData[i].buildingName;
            }
          }
        }
      });
    },
    DeviceScreenshot(param, item) {
      DeviceScreenshot(param).then((res) => {
        item.loading = false;
        this.loadingStatus = null;
        if (res.code === ERR_OK) {
          this.shotImg = res.data;
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    ExportDevProgs() {
      ExportDevProgs({}).then((res) => {
        if (res.code === ERR_OK) {
          this.excelData = res.data;
          this.export2Excel();
        }
      });
    },
    DeviceCommandReStart(param) {
      DeviceCommandReStart(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DeviceCommandShutDown(param) {
      DeviceCommandShutDown(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DeviceCleanShutDownTime(param) {
      DeviceCleanShutDownTime(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    SetSynStatus(param, item) {
      SetSynStatus(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        item.isSyn = !item.isSyn;
        this.$message.error(res.msg);
      });
    },
    ScreenOper(param, item) {
      ScreenOper(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        item.operable = !item.operable;
        this.$message.error(res.msg);
      });
    },
    DelDevices(param) {
      DelDevices(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DevNumEdit(param) {
      DevNumEdit(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DeviceSetShutDownTime(param) {
      DeviceSetShutDownTime(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    KillExplorer(param) {
      KillExplorer(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    StartExplorer(param) {
      StartExplorer(param).then((res) => {
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
    //搜索
    onSearch() {
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //重置搜索
    replaySearch() {
      this.search = {
        SearchKey: "",
        ScreenCode: "",
        FloorCode: "",
        DevStatus: -1,
        FontStatus: -1,
      };
      this.currentPage = 1;
      this.$refs.table.clearFilter();
      this.getList(this.pageSize, this.currentPage);
    },
    //表格筛选
    filterTag(value) {
      //设备状态
      if (value.deviceOnline) {
        this.search.DevStatus = value.deviceOnline[0];
      }
      //前端状态
      if (value.frontOnline) {
        this.search.FontStatus = value.frontOnline[0];
      }

      this.getList(this.pageSize, this.currentPage);
    },
    //打开弹窗
    handleEdit(item, type) {
      this.downType = type;
      if (type == 1 && item.length === 0) {
        this.$message.error("请选择您要操作的选项");
        return;
      }
      if (type == 2) {
        this.editForm = JSON.parse(JSON.stringify(item));
      }
      this.dialogVisible = true;
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.nameDialogVisible = false;
      this.$refs["editForm"].resetFields();
      this.editForm = { shutdownTime: "" };
    },
    //提交
    submitDownForm(row) {
      this.$refs["editForm"].validate((valid) => {
        if (valid) {
          let ids = [];
          if (this.downType == 1) {
            for (let i = 0; i < row.length; i++) {
              ids.push(row[i].code);
            }
          } else {
            ids = [this.editForm.code];
          }
          const param = {
            ShutdownTime: this.editForm.shutdownTime,
            Code: ids,
          };
          this.DeviceSetShutDownTime(param);
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
          const param = { Codes: [item.code] };
          this.DelDevices(param);
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
              Codes: ids,
            };
            this.DelDevices(param);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    //刷新
    refresh() {
      this.getList(this.pageSize, this.currentPage);
    },
    //重启
    reboot(item, type = 0) {
      if (type == 1 && item.length === 0) {
        this.$message.error("请选择您要操作的选项");
        return;
      }
      this.$confirm("此操作将重启设备, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let ids = [];
          let param = {};
          if (type == 1) {
            for (var i = 0; i < item.length; i++) {
              ids.push(item[i].code);
            }
            param = {
              Code: ids,
            };
          } else {
            param = {
              Code: [item.code],
            };
          }
          this.DeviceCommandReStart(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    //关机
    shut(item, type = 0) {
      if (type == 1 && item.length === 0) {
        this.$message.error("请选择您要操作的选项");
        return;
      }
      this.$confirm("此操作将使设备关机, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let ids = [];
          let param = {};
          if (type == 1) {
            for (var i = 0; i < item.length; i++) {
              ids.push(item[i].code);
            }
            param = {
              Code: ids,
            };
          } else {
            param = {
              Code: [item.code],
            };
          }
          this.DeviceCommandShutDown(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    //清除关机时间
    cleanShutTime(item, type = 0) {
      if (type == 1 && item.length === 0) {
        this.$message.error("请选择您要操作的选项");
        return;
      }
      this.$confirm("此操作将清除关机时间, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let param = {};
          let ids = [];
          if (type == 1) {
            for (var i = 0; i < item.length; i++) {
              ids.push(item[i].code);
            }
            param = {
              Code: ids,
            };
          } else {
            param = {
              Code: [item.code],
            };
          }
          this.DeviceCleanShutDownTime(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    handleDetail(item) {
      this.$router.push({
        path: "/device/device-details",
        query: {
          code: item.code,
        },
      });
    },
    //同屏开关
    changeSyn(item) {
      let msg =
        "如果取消了同屏状态，设备将被移出原有的同屏组，会导致不能与其他的设备保持屏幕同步。";
      if (item.isSyn) {
        msg =
          "当设备设为同屏设备后，该设备无法被商家可见并且会移出现有的所在组。设备上已关联的排期也会被去除。";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const param = {
            Code: item.code,
            Status: item.isSyn ? 1 : 0,
          };
          this.SetSynStatus(param);
        })
        .catch(() => {
          item.isSyn = !item.isSyn;
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    //关闭触摸
    changScreenOper(item) {
      if (!item.deviceOnline) {
        item.operable = !item.operable;
        this.$message.error("前端设备不在线，不能进行该操作");
        return;
      }
      const param = {
        Code: item.code,
        Type: item.operable,
      };
      this.ScreenOper(param, item);
    },
    //修改设备名弹窗
    clickName(item) {
      this.nameDialogVisible = true;
      this.editForm = JSON.parse(JSON.stringify(item));
    },
    //修改设备名
    submitUpForm() {
      let param = {
        Code: this.editForm.code,
        DevNum: this.editForm.devNum,
      };
      this.DevNumEdit(param);
    },
    //导出excel
    handleExcel() {
      this.ExportDevProgs();
    },
    //导出excel
    handleDeviceExcel() {
      this.getList(this.pageSize, this.currentPage, 0);
    },
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require("../../vendor/Export2Excel");
        //头
        const tHeader = ["设备名称", "节目组名", "节目名称"];
        //对应的标签
        const filterVal = ["devNum", "groupName", "programName"];
        //标签对应的内容  是一个数组结构
        const list = this.excelData;
        //一个方法 我也不知道干嘛的
        const data = this.formatJson(filterVal, list);
        export_json_to_excel(tHeader, data, "设备节目单");
      });
    },
    export2Excel1() {
      require.ensure([], () => {
        const { export_json_to_excel } = require("../../vendor/Export2Excel");
        //头
        const tHeader = [
          "设备名称",
          "IP地址",
          "屏幕分辨率",
          "楼层",
          "关机时间",
          "设备状态",
          "前端状态",
        ];
        //对应的标签
        const filterVal = [
          "devNum",
          "ip",
          "sName",
          "floor",
          "shutdownTime",
          "deviceOnlineTxt",
          "frontOnlineTxt",
        ];
        //标签对应的内容  是一个数组结构
        const list = this.excelData;
        //一个方法 我也不知道干嘛的
        const data = this.formatJson(filterVal, list);
        export_json_to_excel(tHeader, data, "设备列表");
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    //截图
    screenshot(item, row) {
      if (!item.frontOnline) {
        this.$message.error("设备离线");
        return;
      }
      if (this.loadingStatus) {
        return this.$message.error("只能对一台设备截图，请稍等...");
      }
      this.loadingStatus = true;
      item.loading = true;
      const param = { Code: item.code };
      this.DeviceScreenshot(param, item);
    },
    //关闭大图
    clickMaxImg() {
      this.shotImg = "";
    },
    //修改explorer
    handleExplorer(item, type) {
      this.$confirm("此操作将修改Explorer, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let param = {
            Code: [item.code],
          };
          if (type === 1) {
            this.KillExplorer(param);
            return;
          }
          this.StartExplorer(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
  },
  computed: {
    ...mapGetters(["presentMenu"]),
  },
  components: {},
};
</script>

<style scoped lang="scss">
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  &.red {
    background: #ff4949;
  }
  &.green {
    background: #12b362;
  }
}

.demo-form-inline {
}

.right-button {
  float: right;
  display: flex;
}

.bottom-button {
  margin-top: 20px;
  float: right;
}

.el-icon-edit {
  color: #409eff;
}

.max-div {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
