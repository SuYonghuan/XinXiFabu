<template>
  <div class="system-content">
    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  时间轴  -->
    <el-card class="box-card">
      <div class="top-div">
        <div>
          <p>时间轴长度</p>
          <p>{{timeRange[0]}}-{{timeRange[1]}}</p>
        </div>
        <div>
          <el-button type="primary" @click="handleEdit()" v-if="pageMenu.moduleset">编辑</el-button>
        </div>
      </div>
      <el-collapse class="collapse-div">
        <el-collapse-item title="时间段" name="1">
          <div class="grid-content" v-if="timeList" v-for="item of timeList.timeRelateList">
            <span>{{item.beginTimeSlot}}-{{item.endTimeSlot}}</span>
            <span>
              开放给商家时间:
              <el-select v-model="item.openTime" placeholder="请选择">
                <el-option v-for="item in timeArray" :label="item.value" :value="item.value"></el-option>
              </el-select>
              分
            </span>
          </div>
          <p class="button-p">
            <el-button type="primary" @click="submitAdForm()">确 定</el-button>
          </p>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!--  素材到期时间  -->
    <el-card class="box-card">
      <div class="top-div">
        <p>
          素材到期提醒：提前
          <el-input-number v-model="programMonitorList.days" :min="1" :max="365"></el-input-number>
          天 <span style="margin-left: 30px"></span> 提醒时间
          <el-time-picker
                  arrow-control
                  v-model="programMonitorList.clockTime"
                  :picker-options="{
                    selectableRange: '00:00:00 - 23:59:59'
                  }"
                  :format="'HH:mm'"
                  :value-format="'HH:mm'"
                  placeholder="提醒时间">
          </el-time-picker>
          <span style="margin-left: 30px"></span>
          提醒频率
          <el-radio v-model="programMonitorList.repeatExecution" label="false">仅一次</el-radio>
          <el-radio v-model="programMonitorList.repeatExecution" label="true">每天一次</el-radio>
        </p>
        <el-button type="primary" @click="submitPgForm()" v-if="pageMenu.progSet">保存</el-button>
      </div>
    </el-card>

    <!--  审核权限设置  -->
    <el-card class="box-card" v-show="pageMenu.progauditset">
      <div class="top-div">
        <p>
          <span class="title-span">审核权限设置</span>
          <el-radio v-model="programAudit" :label="0" @change="changeAudit" :disabled="!pageMenu.setprogsaudit">不审核</el-radio>
          <el-radio v-model="programAudit" :label="1" @change="changeAudit" :disabled="!pageMenu.setprogsaudit">审核</el-radio>
        </p>
        <!-- <el-button type="primary" @click="submitPgForm()" v-if="pageMenu.progSet">保存</el-button> -->
      </div>
    </el-card>

    <!--  应用功能  -->
    <el-card class="box-card">
      <p class="switch-p" v-for="item of moduleList">
        {{ item.moduleName }}
        <el-switch v-model="item.isOpen" @change="changeSwitch(item)" v-show="item.isHas"></el-switch>
      </p>
    </el-card>

    <!--  弹窗  -->
    <el-dialog title="时间轴设置" :visible.sync="dialogVisible" width="50%" :before-close="handleClose" append-to-body :close-on-click-modal="false">
      <p style="margin-bottom: 30px;text-align: center;">时间轴：{{timeRange[0]}}-{{timeRange[1]}}</p>
      <div class="slider-div">
        <el-slider v-model="editForm.time" range show-stops :max="23" :marks="marks" v-if="dialogVisible" @change="changeTime"></el-slider>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    GetRolePermissions,
    GetMallModuleList,
    getTimeAxis,
    SetTimeAxis,
    setTimeRelate,
    ModulesSet,
    GetModuleList,
    GetProgramMonitor,
    SettingProgramMonitor,
    ProgramAuditSetting,
    SetProgramAudit,
  } from 'http/api/system'
  import {ERR_OK} from 'http/config'
  import {mapGetters} from 'vuex'

  export default {
    name: "system",
    data() {
      return {
        dialogVisible: false,
        marks: {
          0: '00:00',
          6: '06:00',
          12: '12:00',
          18: '18:00',
          24: '24:00',
        },
        editForm: {
          time: [0, 24]
        },
        timeArray: [
          {
            value: 0
          },
          {
            value: 10
          },
          {
            value: 20
          },
          {
            value: 30
          },
          {
            value: 40
          },
          {
            value: 50
          },
          {
            value: 60
          }
        ],
        moduleList: [],
        localModuleList: [],
        timeList: {},
        timeRange: [
          '00:00','00:00'
        ],
        programMonitorList: {days: '', clockTime: '', repeatExecution: 'false'},
        pageMenu: {},
        programAudit: 0,
      }
    },
    created() {
      this.GetRolePermissions()
      this.GetProgramMonitor()
      this.getTimeAxis()
      this.GetModuleList()
      this.ProgramAuditSetting()
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
            this.$forceUpdate()
            // console.log(this.pageMenu)
          }
        })
      },
      GetMallModuleList() {
        const param = {
          MallCode: this.user.mallCode,
        }
        GetMallModuleList(param).then(res => {
          if (res.code === ERR_OK) {
            this.moduleList = res.data
            if (this.moduleList.length > 0) {
              for (let i = 0; i < this.moduleList.length; i++) {
                this.moduleList[i].isOpen = false;
                if (this.localModuleList.length > 0) {
                  for (let j = 0; j < this.localModuleList.length; j++) {
                    if (this.moduleList[i].code === this.localModuleList[j].code && this.localModuleList[j].isOpen) {
                      this.moduleList[i].isOpen = true;
                    }
                  }
                }
              }
            }
          }
        })
      },
      GetModuleList() {
        GetModuleList({}).then(res => {
          if (res.code === ERR_OK) {
            this.localModuleList = res.data
            // console.log(this.localModuleList)
          }
        })
      },
      ProgramAuditSetting() {
        ProgramAuditSetting({}).then(res => {
          if (res.code === ERR_OK) {
            this.programAudit = res.data
          }
        })
      },
      GetProgramMonitor() {
        GetProgramMonitor({}).then(res => {
          if (res.code === ERR_OK) {
            if (res.data) {
              this.programMonitorList = res.data
              this.programMonitorList.repeatExecution = this.programMonitorList.repeatExecution.toString()
            }
            // console.log(this.programMonitorList)
          }
        })
      },
      getTimeAxis() {
        const param = {
          MallCode: this.user.mallCode,
        }
        getTimeAxis(param).then(res => {
          if (res.code === ERR_OK) {
            if ( res.data ) {
              this.timeList = res.data
              if (this.timeList.timeRelateList.length > 0) {
                this.timeRange[0] = this.timeList.timeRelateList[0].beginTimeSlot
                this.timeRange[1] = this.timeList.timeRelateList[this.timeList.timeRelateList.length - 1].beginTimeSlot
                this.$forceUpdate()
              }
            }

            const param = {"MallCode": this.user.mallCode}
            this.GetMallModuleList(param)
          }
        })
      },
      SetTimeAxis(param) {
        SetTimeAxis(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getTimeAxis()
            return
          }
          this.$message.error(res.msg);
        })
      },
      setTimeRelate(param) {
        setTimeRelate(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getTimeAxis()
            return
          }
          this.$message.error(res.msg);
        })
      },
      ModulesSet(param) {
        ModulesSet(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.GetModuleList()
            setTimeout(() => {
              this.GetMallModuleList()
            }, 200)
            return
          }
          this.$message.error(res.msg);
        })
      },
      SettingProgramMonitor(param) {
        SettingProgramMonitor(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            return
          }
          this.$message.error(res.msg);
        })
      },
      SetProgramAudit(param) {
        SetProgramAudit(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            return
          }
          this.$message.error(res.msg);
        })
      },
      /**
       * End
       */
      handleEdit() {
        this.editForm.time = []

        if ( this.timeRange.length > 0 ) {
          if (this.timeRange[0].slice(0, 1) == 0) {
            this.editForm.time[0] = this.timeRange[0].slice(1, 2)
          } else {
            this.editForm.time[0] = this.timeRange[0].slice(0, 2)
          }
          if (this.timeRange[1].slice(0, 1) == 0) {
            this.editForm.time[1] = this.timeRange[1].slice(1, 2)
          } else {
            this.editForm.time[1] = this.timeRange[1].slice(0, 2)
          }
        }

        this.dialogVisible = true
      },
      //关闭弹窗
      handleClose() {
        this.dialogVisible = false
      },
      changeTime() {
        console.log(this.editForm)
      },
      //设置时间轴
      submitUpForm() {
        const param = {
          "MallCode": this.user.mallCode,
          "BeginAxis": this.editForm.time[0],
          "EndAxis": this.editForm.time[1],
          "TimeAxisCode": this.timeList.timeAxis ? this.timeList.timeAxis.code : ''
        }
        this.SetTimeAxis(param)
      },
      //设置开放时间
      submitAdForm() {
        let param = {}
        param.TimeRelateList = this.timeList.timeRelateList
        this.setTimeRelate(param)
      },
      //开关系统应用
      changeSwitch(item) {
        if (item.isHas) {
          this.ModulesSet(item)
        }
      },
      //素材到期提醒
      submitPgForm() {
        this.programMonitorList.mallCode = this.user.mallCode
        this.SettingProgramMonitor(this.programMonitorList);
      },
      //修改审核设置
      changeAudit() {
        if ( this.programAudit == 0 ) {
          this.$confirm("将审核类型切换为“不审核”，会将审核状态下的节目组都进行审核通过的操作，是否继续修改？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            const param = {
              IsAudit: 0
            }
            this.SetProgramAudit(param)
          }).catch(() => {
            this.programAudit = 1
            this.$message({
              type: 'info',
              message: '已取消操作'
            });
          });
        }else {
          const param = {
            IsAudit: 1
          }
          this.SetProgramAudit(param)
        }
        
      },
    },
    computed: {
      ...mapGetters(['presentMenu', 'user'])
    },
  }
</script>

<style>
  .el-slider__marks-text:nth-last-child(1) {
    right: -37px;
  }

  .el-collapse-item__content {
    padding-bottom: 0px;
  }
</style>
<style scoped lang="scss">
  .box-card {
    margin-top: 40px;

    .top-div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title-span{
        margin-right: 50px;
      }
    }

    .collapse-div {
      margin-top: 15px;
    }

    .switch-p {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #DCDFE6;
      height: 50px;
      align-items: center;
    }
  }

  .slider-div {
    padding: 0 20px;
  }

  .grid-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 40px;
    border-top: 1px solid #DCDFE6;
    height: 60px;
  }

  .button-p {
    text-align: center;
    margin-bottom: 20px;
  }
</style>
