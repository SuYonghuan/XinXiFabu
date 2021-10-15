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
      <el-form-item label="日程名称">
        <el-input v-model="search.searchKey" placeholder="日程名称"></el-input>
      </el-form-item>
      <el-form-item label="屏幕属性">
        <el-select v-model="search.screenCode" placeholder="屏幕属性">
          <el-option
                  v-for="item in searchDeviceList"
                  :label="item.sName"
                  :value="item.sName">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>

      <el-form-item class="right-button">
        <el-button type="success" @click="handleAdd()" v-if="pageMenu.addschedule">新增日程</el-button>
        <el-button type="danger" @click="batchDelete(tableChecked)" v-if="pageMenu.deleteschedule">删除</el-button>
      </el-form-item>

    </el-form>

    <!--  表格  -->
    <el-table
            :data="tableData"
            height="620"
            @selection-change="handleDeletion"
            ref="table"
            style="width: 100%">
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="name" label="日程名称" min-width="230"></el-table-column>
      <el-table-column prop="deviceCount" label="设备数"></el-table-column>
      <el-table-column prop="resolution" label="广告分辨率" min-width="130"></el-table-column>
      <el-table-column prop="period" label="有效期" min-width="130"></el-table-column>
      <el-table-column prop="updateTime" label="修改时间"></el-table-column>
      <el-table-column prop="isActivity" label="发布状态">
        <template slot-scope="scope">
          {{ scope.row.isActivity ? '已发布' : '待发布' }}
        </template>
      </el-table-column>
      <el-table-column prop="dateState" label="日程状态"></el-table-column>
      <el-table-column prop="creator" label="上传人"></el-table-column>
      <el-table-column label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editschedule">编辑</el-button>
          <el-button type="primary" size="small" @click="handleEdit(scope.row,1)" v-if="pageMenu.scheduleinfo">查看</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.deleteschedule">删除</el-button>
          <el-button type="primary" size="small" :disabled="scope.row.isActivity" @click="handlePublish(scope.row)" v-if="pageMenu.publishschedule">发布</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></pagination>

    <!--  新增  -->
    <el-dialog title="新增日程" :visible.sync="dialogVisible" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="deviceForm">
        <el-form-item label="分辨率" prop="screenInfo">
          <el-select v-model="deviceForm.screenInfo" placeholder="分辨率" @change="changeDevice">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="time">
          <el-date-picker
          v-model="deviceForm.time"
          type="datetimerange"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="选择设备" prop="Devices">
          <el-select v-model="deviceForm.Devices" multiple placeholder="选择设备">
            <el-option
                    v-for="item in deviceData"
                    :label="item.devNum"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('deviceForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('deviceForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  详情  -->
    <el-dialog title="日程管理" :visible.sync="dialogVisibleAdd" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :model="editForm" :rules="rules1" ref="editForm">
        <div class="stroke-div">
          <p>时间段：{{ editForm.period }}</p>
          <p>分辨率：{{ editForm.resolution }}</p>
          <p>设备：
            <span v-for="(item,index) of editForm.devices">{{ item }}<span v-show="index < editForm.devices.length - 1">、</span></span>
          </p>
        </div>
        <el-form-item label="日程名称" prop="name">
          <el-input type="text" v-model="editForm.name" :disabled="editForm.isActivity" placeholder="请输入日程名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-table :data="editForm.programs" style="width: 100%" height="620" ref="programsTab" v-if="isTable">
            <el-table-column prop="programName" label="广告位" width="200"></el-table-column>
            <el-table-column prop="alreadyCount" label="广告数量">
              <template slot-scope="scope">
                <img :src="scope.row.previewSrc" width="30" height="30" slot="reference" v-show="scope.row.previewSrc" @click="handleEditProgram(scope.row)">
                <div v-show="!scope.row.previewSrc">
                  <el-button type="primary" size="small" v-if="scope.row.allowEdit" :disabled="editForm.isActivity" @click="handleEditProgram(scope.row)">设置广告</el-button>
                  <span v-else>
                    <el-link type="primary" @click="handleProgram(scope.row)">{{scope.row.alreadyCount}}</el-link>
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpFormAbd('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  节目选择列表  -->
    <el-dialog title="节目选择" :visible.sync="dialogVisibleProgram" width="50%" :before-close="handleClosePro"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" ref="editForm">
        <el-table :data="programList" style="width: 100%" height="620" @current-change="handleTable">
          <el-table-column prop="name" label="预览">
            <template slot-scope="scope">
              <img :src="scope.row.previewSrc" width="30" height="30" slot="reference" @click="clickImage(scope.row)">
            </template>
          </el-table-column>
          <el-table-column prop="programName" label="节目名称" min-width="180"></el-table-column>
        </el-table>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClosePro('editForm')">取 消</el-button>
        <el-button type="primary" @click="handleClosePro('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  查看广告  -->
    <el-dialog title="查看广告" :visible.sync="dialogVisibleProgramDetail" width="50%" :before-close="handleCloseProDei"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" ref="editForm">
        <el-table :data="selectAbd.already" style="width: 100%" height="620">
          <el-table-column prop="programName" label="节目名称" min-width="180"></el-table-column>
          <el-table-column prop="creator" label="上传人"></el-table-column>
          <el-table-column prop="devNum" label="设备名称"></el-table-column>
          <el-table-column prop="filePath" label="预览" min-width="80">
            <template slot-scope="scope">
              <!-- <img :src="scope.row.filePath" width="30" height="30" slot="reference"> -->
              <el-image style="width: 30px; height: 30px" :src="scope.row.filePath" :preview-src-list="srcList"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="period" label="时间段" min-width="180"></el-table-column>
        </el-table>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseProDei('editForm')">取 消</el-button>
        <el-button type="primary" @click="handleCloseProDei('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import pagination from 'components/pagination/pagination'
  import transferView from 'components/transfer-view/transfer-view'
  import {timeFormatting} from 'common/js/mixins'
  import {
    GetDeviceOptionsNew,
    GetRolePermissions,
    ScheduleList,
    AddSchedule,
    EditSchedule,
    ScheduleInfo,
    DeleteSchedule,
    PublishSchedule,
    GetProgramList,
  } from 'http/api/program'
  import {ERR_OK} from 'http/config'
  import {mapGetters} from 'vuex'
  import bigImage from 'components/big-image/big-image'
  import {GetDeviceByGroupCode} from 'http/api/device'

  export default {
    name: "deptManager",
    mixins: [timeFormatting],
    data() {
      return {
        search: {},
        search1: {},
        tableData: [],
        total: 0,
        currentPage: 0,
        pageSize: 10,
        dialogVisible: false,
        dialogVisibleAdd: false,
        dialogVisibleProgram: false,
        dialogVisibleProgramDetail: false,
        editForm: {time:[]},
        formLabelWidth: "120px",
        rules: {
          screenInfo: [{required: true, message: '请选择分辨率', trigger: 'blur'}],
          time: [{required: true, message: '请选择时间范围', trigger: 'blur'}],
          Devices: [{required: true, message: '请选择素材', trigger: 'blur'}],
        },
        rules1: {
          name: [{required: true, message: '请输入日程名称', trigger: 'blur'}],
        },
        tableChecked: [],
        deviceForm: {time:[]},
        staffList: [],
        selectedStaffList: [],
        pageMenu: {},
        searchDeviceList: {},
        delError: '',
        loading: false,
        deviceData: [],
        departmentData: [],
        programList: [],
        selectAbd: {},
        isTable: true,

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
          "Name": this.search.searchKey,
          "Resolution": this.search.screenCode,
          "paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
        }
        ScheduleList(param).then(res => {
          if (res.code === ERR_OK) {
            this.tableData = res.data.list
            this.total = res.data.allCount
            console.log(this.tableData)
          }
        })
      },
      ScheduleInfo(param,type) {
        ScheduleInfo(param).then(res => {
          console.log(res)
          this.loading = false
          if (res.code === ERR_OK) {
            this.editForm = res.data
            this.editForm.isActivity = type == 1 ? true : false
            this.dialogVisible = false
            this.dialogVisibleAdd = true
            return
          }
          this.$message.error(res.msg);
        })
      },
      AddSchedule(param) {
        AddSchedule(param).then(res => {
          this.loading = false
          if (res.code === ERR_OK) {
            this.getList(this.pageSize, this.currentPage)
            this.ScheduleInfo({Code:res.data})
            return
          }
          this.$message.error(res.msg);
        })
      },
      EditSchedule(param) {
        EditSchedule(param).then(res => {
          this.loading = false
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      DelProgram(param) {
        DeleteSchedule(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetDeviceByGroupCode(GroupCode, ScreenCode) {
        const param = {
          "GroupCode": GroupCode,
          "ScreenCode": ScreenCode
        }
        GetDeviceByGroupCode(param).then(res => {
          if (res.code === ERR_OK) {
            console.log(res.data.unGroupDevice)
            this.deviceData = res.data.unGroupDevice
          }
        })
      },
      GetProgramList(Resolution) {
        const param = {
          "Resolution": Resolution
        }
        GetProgramList(param).then(res => {
          if (res.code === ERR_OK) {
            this.programList = res.data
            console.log(res.data)
          }
        })
      },
      PublishSchedule(param) {
        PublishSchedule(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      /**
       * End
       * @param val
       */

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
        this.search = {}
        this.currentPage = 1
        this.$refs.table.clearFilter()
        this.getList(this.pageSize, this.currentPage)
      },
      //打开新增弹窗
      handleAdd() {
        this.dialogVisible = true
      },
      //编辑
      handleEdit(item,type) {
        this.ScheduleInfo({Code:item.code},type)
      },

      //关闭弹窗
      handleClose() {
        this.dialogVisible = false
        this.dialogVisibleAdd = false
        this.dialogVisibleDevice = false
        this.$refs["editForm"] && this.$refs["editForm"].resetFields()
        this.$refs.videoRef && this.$refs.videoRef.pause()
        this.deviceForm = {time:[]}
      },
      //关闭节目
      handleClosePro() {
        this.dialogVisibleProgram = false
      },
      //关闭节目详情
      handleCloseProDei() {
        this.dialogVisibleProgramDetail = false
      },
      //提交
      submitUpForm(item) {
        this.$refs[item].validate(valid => {
          if (valid) {
            this.loading = true
            const param = {
              "Resolution": this.resolutionToName(this.deviceForm.screenInfo),
              "BeginTime": this.deviceForm.time[0],
              "EndTime": this.deviceForm.time[1],
              "Devices": this.deviceForm.Devices,
            }

            console.log(param)
            this.AddSchedule(param)
          }
        })
      },
      //编辑提交
      submitEdForm(item) {

      },
      //删除
      handleDelete(item) {
        this.$confirm("此操作将永久删除, 是否继续?" + this.delError, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.DelProgram({"Codes": [item.code]})
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
            this.DelProgram(param)
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        }
      },
      //放大图片
      clickImage(item) {
        this.bigFile = {}
        this.bigFile.src = item.progSrc
        this.bigFile.type = item.progType
      },
      //关闭放大
      closeImg() {
        this.bigFile = null
      },
      //点击搜索设备
      changeDevice() {
        this.GetDeviceByGroupCode('', this.deviceForm.screenInfo)
      },
      //分辨率筛选
      resolutionToName(code) {
        return this.searchDeviceList.filter(val=>{
          return val.code === code
        })[0].sName
      },
      //设置节目
      handleEditProgram(item) {
        if ( this.editForm.isActivity ) return
        this.selectAbd = item
        this.GetProgramList(this.editForm.resolution)
        this.dialogVisibleProgram = true
      },
      //点击素材
      handleTable(item) {
        this.selectAbd.programCode = item.code
        this.selectAbd.previewSrc = item.previewSrc
        this.handleClosePro()
        this.isTable = false
        this.$nextTick(()=>{
          this.isTable = true
        })
      },
      //保存日程
      submitUpFormAbd(item) {
        console.log(this.editForm)
        this.$refs[item].validate(valid => {
          if (valid) {
            const param = {
              code: this.editForm.code,
              name: this.editForm.name,
              Programs: this.editForm.programs,
            }
            this.EditSchedule(param)
          }
        })
      },
      handlePublish(item) {
        const param = {
          Code: item.code
        }
        this.PublishSchedule(param)
      },
      //广告详情
      handleProgram(item) {
        this.dialogVisibleProgramDetail = true
        this.selectAbd = item
      },
    },
    computed: {
      ...mapGetters(['presentMenu', 'config','user'])
    },
    components: {
      pagination,
      transferView,
      bigImage,
    },

  }
</script>

<style lang="scss">
  .dialog .el-dialog {
    margin-top: 5vh !important;
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
    margin-top: 30px;
  }

  .file-list-card {
    margin-top: 20px;
    height: 352px;
    position: relative;

    .card-input{
      width: 100%;
      height: 60px;
      position: relative;
    }

    div {
      display: flex;
      justify-content: space-between;
      margin: 2px;
    }
  }

  .checkbox-div {
    margin-top: 10px;
    margin-right: 0;
    margin-left: 10px;
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

  .demo-form-inline .el-select {
    width: 202px;
  }

  .el-progress {
    position: absolute;
    width: 100%;
    bottom: -3px;
  }

  .stroke-div{
    display: flex;
    flex-wrap: wrap;
    font-size: 16px;
    line-height: 25px;
    color: #606266;
    margin-bottom: 20px;
    p{
      margin-right: 30px;
    }
  }
</style>
