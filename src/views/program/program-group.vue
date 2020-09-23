<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>节目管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="节目组名称">
        <el-input v-model="search.SearchKey" placeholder="节目组名称"></el-input>
      </el-form-item>
      <el-form-item label="屏幕属性">
        <el-select v-model="search.ScreenCode" placeholder="屏幕属性">
          <el-option
                  v-for="item in searchDeviceList"
                  :label="item.sName"
                  :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item label="组名称排序">-->
      <!--<el-select v-model="search.NameOrder" placeholder="组名称排序">-->
      <!--<el-option-->
      <!--v-for="item in sort"-->
      <!--:label="item.label"-->
      <!--:value="item.value">-->
      <!--</el-option>-->
      <!--</el-select>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="节目组排序">-->
      <!--<el-select v-model="search.Order" placeholder="节目组排序">-->
      <!--<el-option-->
      <!--v-for="item in sort"-->
      <!--:label="item.label"-->
      <!--:value="item.value">-->
      <!--</el-option>-->
      <!--</el-select>-->
      <!--</el-form-item>-->
      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>
      <el-form-item class="right-button">
        <el-button type="success" @click="handleEdit({})" v-if="pageMenu.addproggroup">新增组</el-button>
        <el-button type="danger" @click="batchDelete(tableChecked)" v-if="pageMenu.delproggroup">删除</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table
            :data="tableData"
            @selection-change="handleDeletion"
            ref="table"
            @filter-change="filterTag"
            height="620"
            style="width: 100%">
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column prop="groupName" label="组名称" min-width="150" column-key="NameOrder" :filters=sort :filter-multiple="false"></el-table-column>
      <el-table-column prop="screenInfo" label="屏幕属性"></el-table-column>
      <el-table-column label="节目数量" column-key="Order" :filters=sort :filter-multiple="false">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleProgramDetail(scope.row)">{{ scope.row.programCount }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="founderName" label="创建用户"></el-table-column>
      <el-table-column prop="addTime" label="创建时间">
        <template slot-scope="scope">{{ timestampToTime(scope.row.addTime) }}</template>
      </el-table-column>
      <el-table-column prop="updateUserName" label="更新用户"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template slot-scope="scope">{{ timestampToTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="250px">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editproggroup">编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.delproggroup">删除
          </el-button>
          <el-dropdown style="margin-left: 15px" v-if="pageMenu.publishproggroup">
            <el-button type="primary" size="small">
              发布<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item><p @click="handleDevice(scope.row)">发布设备</p></el-dropdown-item>
              <el-dropdown-item><p @click="handleDeviceGroup(scope.row)">发布设备组</p></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></pagination>

    <!--  新增  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="80%" :before-close="handleClose" class="dialog"
               append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" :rules="rules" ref="editForm">
        <el-form-item label="节目组名称" prop="groupName">
          <el-input type="text" v-model="editForm.groupName" placeholder="请输入节目组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="screenInfoCode">
          <el-select v-model="editForm.screenInfoCode" :disabled="dialogTitle == '编辑'" placeholder="分辨率"
                     @change="changeDevice">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="intro">
          <transferViewProgram :List="staffList" ref="transferView" v-if="transferStatus"
                               @changeTransfer="changeTransfer"></transferViewProgram>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  发布设备  -->
    <el-dialog title="发布设备" :visible.sync="dialogVisibleDevice" width="80%" :before-close="handleClose" append-to-body>
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="editForm">
        <el-form-item label="设备组名称" prop="name">
          <el-input type="text" v-model="deviceForm.groupName" placeholder="请输入设备组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="name">
          <el-input type="text" v-model="deviceForm.screenInfo" :disabled="true" placeholder="请输入分辨率"></el-input>
        </el-form-item>
        <el-form-item label="组类型" prop="name">
          <el-checkbox v-model="deviceForm.isSyn" label="true" @change="clickSyn">多屏同步组</el-checkbox>
          <el-tooltip placement="bottom">
            <div slot="content">同步组内可选择的设备都是已被标为可同步的设备，这些设备上的节目将同步播放。<br/>正常组内的设备可以存在在多个组中，节目也不一定会同步播放。</div>
            <i class="el-icon-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="设备" prop="intro">
          <transferView :List="staffList" ref="transferView" @changeTransfer="changeTransfer"
                        v-if="transferStatus"></transferView>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitDeForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  发布设备组  -->
    <el-dialog title="发布设备组" :visible.sync="dialogVisibleDeviceGroup" width="80%" :before-close="handleClose"
               append-to-body>
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="editForm">
        <el-form-item label="节目组名称" prop="name">
          <el-input type="text" v-model="deviceForm.groupName" :disabled="true" placeholder="请输入节目组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="name">
          <el-input type="text" v-model="deviceForm.screenInfo" :disabled="true" placeholder="请输入分辨率"></el-input>
        </el-form-item>
        <el-form-item label="设备" prop="intro">
          <transferViewProgram1 :List="staffList" ref="transferView" v-if="transferStatus"
                                @changeTransfer="changeTransfer"></transferViewProgram1>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitDgForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  节目详情  -->
    <el-dialog title="节目单" :visible.sync="dialogVisibleProgram" width="50%" :before-close="handleClose" append-to-body>
      <el-table :data="groupProgram" style="width: 100%">
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column label="预览">
          <template slot-scope="scope">
            <img :src="scope.row.previewSrc" width="30" height="30">
          </template>
        </el-table-column>
        <el-table-column prop="programName" label="节目名称" min-width="150">
          <template slot-scope="scope">
            <div class="overflow-div" slot="reference">{{scope.row.programName}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="progType" label="节目类型"></el-table-column>
        <el-table-column prop="launchTime" label="上线时间" min-width="150"></el-table-column>
        <el-table-column prop="expiryDate" label="下线时间" min-width="150"></el-table-column>
        <el-table-column prop="switchMode" label="切换模式"></el-table-column>
        <el-table-column prop="switchTime" label="切换间隔"></el-table-column>
        <el-table-column prop="screenMatch" label="屏幕适应"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  import pagination from 'components/pagination/pagination'
  import transferViewProgram from 'components/transfer-view-program/transfer-view-program'
  import transferViewProgram1 from 'components/transfer-view-program1/transfer-view-program1'
  import transferView from 'components/transfer-view/transfer-view'
  import {timeFormatting} from 'common/js/mixins'
  import {
    GetDeviceOptionsNew,
    GetRolePermissions,
    GetProgGroupsByPage,
    GetProgByGroupCode,
    AddProgramGroup,
    UpdateGroupInfo,
    DelProgramGroup,
    GetDeviceByGroupCode,
    PublishProgramToDevice,
    GetDeviceGroupByProgGroup,
    PublishProgToDeviceGroup,
    GetProgramListByGroupCode,
  } from 'http/api/program'
  import {ERR_OK} from 'http/config'
  import {mapGetters} from 'vuex'

  export default {
    name: "deptManager",
    mixins: [timeFormatting],
    data() {
      return {
        search: {
          SearchKey: '', ScreenCode: '', Order: '', NameOrder: ''
        },
        tableData: [],
        total: 0,
        currentPage: 0,
        pageSize: 10,
        dialogVisible: false,
        dialogVisibleDevice: false,
        dialogVisibleDeviceGroup: false,
        dialogVisibleProgram: false,
        dialogTitle: '新增',
        editForm: {},
        formLabelWidth: "120px",
        rules: {
          groupName: [{required: true, message: '请输入节目组名称', trigger: 'blur'}],
          screenInfoCode: [{required: true, message: '请选择分辨率', trigger: 'blur'}]
        },
        tableChecked: [],
        deviceForm: {},
        staffList: {},
        selectedStaffList: [],
        sort: [
          {text: '升序', value: 'ASC'},
          {text: '降序', value: 'Desc'}
        ],
        pageMenu: {},
        searchDeviceList: [],
        groupInfo: [],
        transferStatus: false,
        groupProgram: [],
      }
    },
    created() {
      this.GetRolePermissions()
      this.GetDeviceOptionsNew()
    },
    methods: {
      /**
       * 网络请求
       * @param val
       */
      GetRolePermissions() {
        const param = {
          MenuCode: this.presentMenu.code,
        }
        GetRolePermissions(param).then(res => {
          if (res.code === ERR_OK) {
            for (let a = 0; a < res.data.length; a++) {
              this.pageMenu[res.data[a].actionId] = true;
            }
            this.getList(this.pageSize, this.currentPage)
            // console.log(this.pageMenu)
          }
        })
      },
      GetDeviceOptionsNew() {
        GetDeviceOptionsNew({}).then(res => {
          if (res.code === ERR_OK) {
            this.searchDeviceList = res.data.screenInfos
          }
        })
      },
      getList(pageSize, page) {
        const param = {
          "SearchKey": this.search.SearchKey,
          "ScreenCode": this.search.ScreenCode,
          "Order": this.search.Order,
          "NameOrder": this.search.NameOrder,
          "Paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
        }
        GetProgGroupsByPage(param).then(res => {
          if (res.code === ERR_OK) {
            this.tableData = res.data.list
            this.total = res.data.allCount
            // console.log(this.tableData)
          }
        })
      },
      GetProgByGroupCode(screenCode, GroupCode = '') {
        const param = {
          "GroupCode": GroupCode,
          "ScreenCode": screenCode
        }
        GetProgByGroupCode(param).then(res => {
          if (res.code === ERR_OK) {
            this.staffList.unIncludeDevice = res.data.unGroupProg
            this.staffList.includeDevice = res.data.groupProg
            this.selectedStaffList = res.data.groupProg
          }
        })
      },
      AddProgramGroup(param) {
        AddProgramGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)()
            return
          }
          this.$message.error(res.msg);
        })
      },
      UpdateGroupInfo(param) {
        UpdateGroupInfo(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)()
            return
          }
          this.$message.error(res.msg);
        })
      },
      DelProgramGroup(param) {
        DelProgramGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)()
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetDeviceByGroupCode(ScreenCode, IsSyn = false, GroupCode = '') {
        const param = {
          "GroupCode": GroupCode,
          "ScreenCode": ScreenCode,
          "IsSyn": IsSyn
        }
        GetDeviceByGroupCode(param).then(res => {
          if (res.code === ERR_OK) {
            this.staffList.unIncludeDevice = res.data.unGroupDevice
            this.staffList.includeDevice = res.data.groupDevice
            this.selectedStaffList = res.data.groupDevice
            return
          }
          this.$message.error(res.msg);
        })
      },
      PublishProgramToDevice(param) {
        PublishProgramToDevice(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)()
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetDeviceGroupByProgGroup(ProgGroupCode) {
        const param = {
          "ProgGroupCode": ProgGroupCode
        }
        GetDeviceGroupByProgGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.staffList.unIncludeDevice = res.data.undDeviceGroup
            this.staffList.includeDevice = res.data.deviceGroup
            this.selectedStaffList = res.data.deviceGroup
            return
          }
          this.$message.error(res.msg);
        })
      },
      PublishProgToDeviceGroup(param) {
        PublishProgToDeviceGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)()
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetProgramListByGroupCode(code) {
        const param = {"Code": code}
        GetProgramListByGroupCode(param).then(res => {
          if (res.code === ERR_OK) {
            this.groupProgram = res.data
          }
        })
      },
      /**
       * End
       * @param val
       */
      //时间转换
      timestampToTime(item) {
        return this.dateFormat('y-m-d h:i:s', new Date(item))
      },
      //当前页码
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getList(this.pageSize, val)
      },
      //每页数量
      handleSizeChange(val) {
        this.pageSize = val;
        this.currentPage = 1;
        this.getList(this.pageSize, this.currentPage)
      },
      //搜索
      onSearch() {
        this.currentPage = 1
        this.getList(this.pageSize, this.currentPage, this.search)
      },
      //重置搜索
      replaySearch() {
        this.search = {
          SearchKey: '', ScreenCode: '', Order: '', NameOrder: ''
        }
        this.currentPage = 1
        this.$refs.table.clearFilter()
        this.getList(this.pageSize, this.currentPage)
      },
      //表格筛选
      filterTag(value) {
        //设备状态
        if ( value.NameOrder ) {
          this.search.NameOrder = value.NameOrder[0]
        }
        //前端状态
        if ( value.Order ) {
          this.search.Order = value.Order[0]
        }

        this.getList(this.pageSize, this.currentPage)
      },
      //打开弹窗
      handleEdit(item) {
        this.dialogVisible = true
        this.transferStatus = true

        if (JSON.stringify(item) != '{}') {
          this.dialogTitle = '编辑'
          this.editForm = JSON.parse(JSON.stringify(item));
          this.GetProgByGroupCode(this.editForm.screenInfoCode, this.editForm.code)
        } else {
          this.GetProgByGroupCode(this.searchDeviceList[0].code)
          this.editForm = {
            groupName: this.dateFormat('y-m-d h:i:s') + ' 新建节目组',
            screenInfoCode: this.searchDeviceList[0].code
          }
        }
      },
      //切换分辨率
      changeDevice() {
        this.GetProgByGroupCode(this.editForm.screenInfoCode)
        this.transferStatus = false;
        this.$nextTick(() => {
          this.transferStatus = true;
        })
      },
      //发布设备
      handleDevice(item) {
        console.log(item)
        this.dialogVisibleDevice = true
        this.GetDeviceByGroupCode(item.screenInfoCode, false)
        this.deviceForm = {
          groupName: this.dateFormat('y-m-d h:i:s') + ' 新建设备',
          screenInfo: item.screenInfo,
          screenInfoCode: item.screenInfoCode,
          ProgramGroupCode: item.code,
        }
        this.transferStatus = true
      },
      //发布到设备组
      handleDeviceGroup(item) {
        this.dialogVisibleDeviceGroup = true
        this.deviceForm = JSON.parse(JSON.stringify(item));
        this.transferStatus = true
        this.GetDeviceGroupByProgGroup(item.code);
      },
      //节目详情
      handleProgramDetail(item) {
        this.dialogVisibleProgram = true
        this.GetProgramListByGroupCode(item.code)
      },
      //关闭弹窗
      handleClose() {
        this.dialogVisible = false
        this.dialogVisibleDevice = false
        this.dialogVisibleDeviceGroup = false
        this.dialogVisibleProgram = false
        this.$refs["editForm"].resetFields()
        this.transferStatus = false
      },
      //提交
      submitUpForm(item) {
        this.$refs[item].validate(valid => {
          if (valid) {
            let ids = []
            if (this.selectedStaffList.length > 0) {
              for (let i = 0; i < this.selectedStaffList.length; i++) {
                ids.push(this.selectedStaffList[i].code)
              }
            }
            const param = {
              "GroupName": this.editForm.groupName,
              "ScreenInfoCode": this.editForm.screenInfoCode,
              "Programs": ids
            }
            if (this.editForm.code) {
              param.Code = this.editForm.code
              this.UpdateGroupInfo(param)
              return
            }
            this.AddProgramGroup(param)
          }
        })
      },
      //删除
      handleDelete(item) {
        this.$confirm("此操作将永久删除, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          const param = {
            "Codes": [item.code]
          }
          this.DelProgramGroup(param)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      //批量删除
      handleDeletion(val) {
        this.tableChecked = val
      },
      //获取用户的选中
      batchDelete(row) {
        if (row.length === 0) {
          this.$message.error("请选择您要删除的选项");
          return
        } else {
          this.$confirm("此操作将永久删除, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            let ids = []
            for (let i = 0; i < row.length; i++) {
              ids.push(row[i].code)
            }
            const param = {
              Codes: ids
            }
            this.DelProgramGroup(param)
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        }
      },
      //发布设备
      submitDeForm() {
        let ids = []
        if (this.selectedStaffList.length > 0) {
          for (let i = 0; i < this.selectedStaffList.length; i++) {
            ids.push(this.selectedStaffList[i].code)
          }
        }
        const param = {
          "GName": this.deviceForm.groupName,
          "ScreenInfoCode": this.deviceForm.screenInfoCode,
          "Devices": ids,
          "IsSync": this.deviceForm.isSyn,
          "ProgramGroupCode": this.deviceForm.ProgramGroupCode
        }

        this.PublishProgramToDevice(param)
      },
      //发布设备组
      submitDgForm() {
        let ids = []
        if (this.selectedStaffList.length > 0) {
          for (let i = 0; i < this.selectedStaffList.length; i++) {
            ids.push(this.selectedStaffList[i].code)
          }
        }
        const param = {
          "ProgramGroupCode": this.deviceForm.code,
          "DeviceGroupCodes": ids
        }
        this.PublishProgToDeviceGroup(param)
      },
      //获取选中值
      changeTransfer(item) {
        this.selectedStaffList = item
      },
      //点击同屏
      clickSyn() {
        this.GetDeviceByGroupCode(this.deviceForm.screenInfoCode, this.deviceForm.isSyn)
        this.transferStatus = false;
        this.$nextTick(() => {
          this.transferStatus = true;
        })
      },
    },
    components: {
      pagination,
      transferView,
      transferViewProgram,
      transferViewProgram1,
    },
    computed: {
      ...mapGetters(['presentMenu', 'config'])
    },
  }
</script>

<style lang="scss">
  .dialog .el-dialog {
    margin-top: 3vh !important;
  }
</style>
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

  .overflow-div {
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }
</style>
