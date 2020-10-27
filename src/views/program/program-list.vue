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
      <el-form-item label="节目名称">
        <el-input v-model="search.searchKey" placeholder="节目名称"></el-input>
      </el-form-item>
      <el-form-item label="屏幕属性">
        <el-select v-model="search.screenCode" placeholder="屏幕属性">
          <el-option
                  v-for="item in searchDeviceList"
                  :label="item.sName"
                  :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>

      <el-form-item class="right-button">
        <!--<el-button type="success" @click="handleAdd(1)" v-if="pageMenu.addprog">快速发布</el-button>-->
        <el-button type="success" @click="handleAdd(2)" v-if="pageMenu.addprog">新增素材</el-button>
        <el-button type="danger" @click="batchDelete(tableChecked)" v-if="pageMenu.delprog">删除</el-button>
      </el-form-item>

    </el-form>

    <!--  表格  -->
    <el-table
            :data="tableData"
            height="620"
            @selection-change="handleDeletion"
            ref="table"
            @filter-change="filterTag"
            style="width: 100%">
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column prop="name" label="预览" width="100">
        <template slot-scope="scope">
          <el-popover placement="top-start" trigger="hover">
            <div>
              <p>实际分辨率大小：{{ scope.row.width }}*{{ scope.row.height }}</p>
              <p>素材大小：{{ fileSize(scope.row.fileSize) }}</p>
            </div>
            <img :src="scope.row.previewSrc" width="30" height="30" slot="reference" @click="clickImage(scope.row)">
          </el-popover>
          <el-popover placement="top-start" trigger="hover">
            <div>
              <p>实际分辨率大小：{{ scope.row.vWidth }}*{{ scope.row.vHeight }}</p>
              <p>素材大小：{{ fileSize(scope.row.vFileSize) }}</p>
            </div>
            <img :src="scope.row.vPreviewSrc" width="30" height="30" v-show="scope.row.vPreviewSrc" slot="reference" style="margin-left: 5px" @click="clickImage(scope.row,1)">
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="programName" label="节目名称" min-width="130">
        <template slot-scope="scope">
          <el-popover placement="top-start" trigger="hover">
            <div>
              <p>创建用户：{{ scope.row.founderName }}</p>
              <p>创建时间：{{ scope.row.addTime }}</p>
              <p>更新用户：{{ scope.row.updateUserName }}</p>
              <p>更新时间：{{ scope.row.updateTime }}</p>
            </div>
            <div class="overflow-div" slot="reference">{{scope.row.programName}}</div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="progType" label="节目类型" min-width="80" column-key="progType" :filters=programType :filter-multiple="false"></el-table-column>
      <el-table-column prop="sName" label="屏幕属性" min-width="130"></el-table-column>
      <el-table-column prop="name" label="有效期" min-width="300">
        <template slot-scope="scope">
          {{ scope.row.launchTime }} ~ {{ scope.row.expiryDate }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="节目状态" column-key="progStatus" :filters=programStatus :filter-multiple="false">
        <template slot-scope="scope">
          <span :style="scope.row.status == '排期中' ? 'color:#67C23A;' : 'color:#909399;'">{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="switchMode" label="切换效果" column-key="switchMode" :filters=programEffect :filter-multiple="false"></el-table-column>
      <el-table-column prop="switchTime" label="切换间隔"></el-table-column>
      <el-table-column prop="screenMatch" label="屏幕适应" column-key="screenMatch" :filters=screenAdapt :filter-multiple="false"></el-table-column>
      <el-table-column label="关联店铺">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleEditShop(scope.row)" :disabled="!pageMenu.setprogshop">
            {{scope.row.shopInfo ? scope.row.shopInfo : '未关联'}}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="设置标签">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleEditLabel(scope.row)" :disabled="!pageMenu.setproglabel">
            {{scope.row.labels ? scope.row.labels : '未关联'}}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editprog">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.delprog">删除</el-button>
          <el-dropdown style="margin-left: 15px">
            <el-button type="primary" size="small">
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item><p @click="handleCopy(scope.row)" v-if="pageMenu.addprog">复制</p></el-dropdown-item>
              <el-dropdown-item><p @click="handleDevice(scope.row)">已发布设备</p></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></pagination>

    <!--  新增  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" :rules="rules" ref="editForm">
        <el-form-item label="节目组名称" v-show="releaseType == 1">
          <el-input size="small" v-model="editForm.groupName" maxlength="50" auto-complete="off"
                    placeholder="请输入节目组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="screenInfo">
          <el-select v-model="editForm.screenInfo" placeholder="分辨率" @change="changeScreen">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="time">
          <el-date-picker
                  v-model="editForm.time"
                  type="datetimerange"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上传素材" prop="progFiles">
          <el-upload
                  class="upload-demo"
                  ref="upload"
                  :action="config.updateFile"
                  :before-upload="handleProgress"
                  :on-change="changeProgress"
                  :on-progress='uploaded'
                  :file-list="fileList"
                  :show-file-list="false"
                  :limit="uploadNum"
                  :auto-upload="true"
                  :on-success="handleAvatarSuccess">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-card class="box-card file-list-card">
              <div v-for="(item,index) of fileList" class="card-input">
                <div>
                  <el-input v-model="item.name" style="width: 300px"
                            @change="changeFileName(index,item.name)"></el-input>
                  /
                  <span>{{fileSize(item.size)}}</span>
                </div>
                <p>
                  <el-button type="danger" size="small" @click="handleDeleteFile(index)">删除</el-button>
                </p>
                <el-progress v-if="item.uid == uid" :percentage="Math.round(item.percentage)"
                             class="el-progress"></el-progress>
              </div>
            </el-card>
            <div slot="tip" class="el-upload__tip">支持最多5个素材文件;建议每个图片大小不超过5M，最大尺寸不超过5000x5000分辨率;视频大小不大于500M</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="屏幕设置">
          <el-select v-model="editForm.screenMatch" placeholder="屏幕适应">
            <el-option
                    v-for="item in screenAdapt"
                    :label="item.text"
                    :value="item.text">
            </el-option>
          </el-select>
          <el-select v-model="editForm.switchMode" placeholder="切换效果" style="margin-left: 20px">
            <el-option
                    v-for="item in programEffect"
                    :label="item.text"
                    :value="item.text">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="切换时间">
          <p style="display: flex;justify-content: space-between">
            <el-input-number v-model="editForm.switchTime" @change="handleChange" :min="1" :max="3600"
                             label="切换时间"></el-input-number>
          </p>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  编辑单个素材  -->
    <el-dialog title="素材编辑" :visible.sync="dialogVisibleDetails" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="updateForm" ref="editForm">
        <el-form-item label="分辨率" prop="name">
          <el-select v-model="updateForm.screenInfo" placeholder="分辨率" @change="changeScreen1">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="time">
          <el-date-picker
                  v-model="updateForm.time"
                  type="datetimerange"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上传素材" prop="file">
          <el-upload
                  class="upload-demo"
                  ref="upload"
                  :action="config.updateFile"
                  :before-upload="handleProgress"
                  :on-change="changeProgress"
                  :on-progress='uploaded1'
                  :file-list="fileList"
                  :show-file-list="false"
                  :limit="uploadNum"
                  :auto-upload="true"
                  :on-success="handleAvatarSuccess1">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-card class="box-card file-list-card">
              <div v-for="(item,index) of updateForm.progFiles" class="card-input">
                <div>
                  <p>{{item.name}}</p>
                </div>
                <p>
                  <el-button type="danger" size="small" @click="handleDeleteFile1(index)">删除</el-button>
                </p>
                <el-progress v-if="item.uid == uid" :percentage="Math.round(item.percentage)"
                             class="el-progress"></el-progress>
              </div>
            </el-card>
            <div slot="tip" class="el-upload__tip">支持最多5个素材文件;建议每个图片大小不超过5M，最大尺寸不超过5000x5000分辨率;视频大小不大于500M</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="屏幕设置">
          <el-select v-model="updateForm.screenMatch" placeholder="屏幕适应">
            <el-option
                    v-for="item in screenAdapt"
                    :label="item.text"
                    :value="item.text">
            </el-option>
          </el-select>
          <el-select v-model="updateForm.switchMode" placeholder="切换效果" style="margin-left: 20px">
            <el-option
                    v-for="item in programEffect"
                    :label="item.text"
                    :value="item.text">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="切换时间">
          <p style="display: flex;justify-content: space-between">
            <el-input-number v-model="updateForm.switchTime" @change="handleChange" :min="1" :max="3600"
                             label="切换时间"></el-input-number>
          </p>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitEdForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  已发布设备  -->
    <el-dialog title="已发布设备" :visible.sync="dialogVisibleDevice" width="50%" :before-close="handleClose"
               :close-on-click-modal="true" append-to-body>
      <el-table :data="postionList" style="width: 100%">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="devNum" label="设备名称"></el-table-column>
        <el-table-column prop="ip" label="IP地址"></el-table-column>
        <el-table-column prop="floor" label="楼栋/楼层">
          <template slot-scope="scope">
            {{ scope.row.buildingName }}/{{ scope.row.floorName }}
          </template>
        </el-table-column>
        <el-table-column prop="mark" label="备注">
          <template slot-scope="scope">{{ scope.row.mark }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!--  关联店铺  -->
    <el-dialog title="关联店铺" :visible.sync="dialogVisibleShop" width="50%" :before-close="handleClose"
               :close-on-click-modal="true" append-to-body>
      <el-form :inline="true" :model="search1">
        <el-form-item>
          <el-input v-model="search1.name" placeholder="店铺名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSearch1">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="shopList" style="width: 100%">
        <el-table-column prop="name" label="店铺名称"></el-table-column>
        <el-table-column prop="name" label="楼栋/楼层">
          <template slot-scope="scope">
            {{ scope.row.buildingName }}/{{ scope.row.floorName }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-link type="primary" @click="progToShop(scope.row)" v-if="scope.row.prog == 0">关联</el-link>
            <el-link type="primary" @click="progToShop(scope.row)" v-if="scope.row.prog == 1">取消</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!--  设置标签  -->
    <el-dialog title="设置标签" :visible.sync="dialogVisibleLabel" width="50%" :before-close="handleClose"
               :close-on-click-modal="true" append-to-body>

      <el-form :label-width="formLabelWidth" :model="search">
        <el-form-item label="店铺名称">
          <el-input v-model="programInfo.programName" :disabled="true" placeholder="店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="选择标签">
          <div>
            <el-checkbox class="checkbox-div" v-for="item of labelList" v-model="labelActive" :label="item.code" border>
              {{item.name}}
            </el-checkbox>
          </div>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button @click="handleClose('editForm')">取 消</el-button>
          <el-button type="primary" @click="submitLbForm('editForm')">确 定</el-button>
        </span>
    </el-dialog>

    <bigImage :src="bigFile.src" :type="bigFile.type" v-if="bigFile" @closeImg="closeImg"></bigImage>
  </div>
</template>

<script>
  import pagination from 'components/pagination/pagination'
  import transferView from 'components/transfer-view/transfer-view'
  import {timeFormatting} from 'common/js/mixins'
  import {
    GetDeviceOptionsNew,
    GetRolePermissions,
    GetList,
    ProgAddFast,
    ProgAdd,
    ProgEdit,
    DelProgram_Pre,
    DelProgram,
    GetPostionList,
    QueryProgShopList,
    SetProgToShop,
    GetProgLabelList,
    SetLabel,
  } from 'http/api/program'
  import {ERR_OK} from 'http/config'
  import {mapGetters} from 'vuex'
  import bigImage from 'components/big-image/big-image'

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
        dialogVisibleDetails: false,
        dialogVisibleDevice: false,
        dialogVisibleShop: false,
        dialogVisibleLabel: false,
        dialogTitle: '快速发布',
        editForm: {},
        updateForm: {},
        formLabelWidth: "120px",
        rules: {
          screenInfo: [{required: true, message: '请选择分辨率', trigger: 'blur'}],
          time: [{required: true, message: '请选择时间范围', trigger: 'blur'}],
          progFiles: [{required: true, message: '请上传素材', trigger: 'blur'}],
        },
        tableChecked: [],
        deviceForm: {},
        staffList: [],
        selectedStaffList: [],
        screenData: [
          {label: '1920*1080横屏', value: 1},
          {label: '1920*1080竖屏', value: 2}
        ],
        programType: [
          {text: '视频', value: '视频'},
          {text: '图片', value: '图片'}
        ],
        programStatus: [
          {text: '未开始', value: '未开始'},
          {text: '排期中', value: '排期中'},
          {text: '已过期', value: '已过期'}
        ],
        programEffect: [
          {text: '随机', value: '随机'},
          {text: '马赛克', value: '马赛克'},
          {text: '上下滑动', value: '上下滑动'},
          {text: '左右滑动', value: '左右滑动'},
          {text: '渐入', value: '渐入'}
        ],
        screenAdapt: [
          {text: '无', value: '无'},
          {text: '填充', value: '填充'},
          {text: '适应', value: '适应'},
          {text: '拉伸', value: '拉伸'},
          {text: '平铺', value: '平铺'},
          {text: '居中', value: '居中'}
        ],
        fileList: [],
        releaseType: 1,
        pageMenu: {},
        searchDeviceList: {},
        delError: '',
        postionList: [],
        shopList: [],
        programInfo: {},
        labelList: [],
        labelActive: [],
        bigFile: null,
        otherSearch: false,
        uid: 1,
        uploadNum: 1,
        fileType: 0, //文件类型， 0图片  1视频
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
          "SearchKey": this.search.searchKey,
          "ProgType": this.search.progType,
          "ScreenCode": this.search.screenCode,
          "SwitchMode": this.search.switchMode,
          "ScreenMatch": this.search.screenMatch,
          "ProgStatus": this.search.progStatus,
          "paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
        }
        GetList(param).then(res => {
          if (res.code === ERR_OK) {
            this.tableData = res.data.list
            this.total = res.data.allCount
            console.log(this.tableData)
          }
        })
      },
      ProgAddFast(param) {
        ProgAddFast(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      ProgAdd(param) {
        ProgAdd(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      ProgEdit(param) {
        ProgEdit(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      DelProgram_Pre(param) {
        DelProgram_Pre(param).then(res => {
          if (res.code === ERR_OK) {
            this.delError = res.data
            return
          }
          this.$message.error(res.msg);
        })
      },
      DelProgram(param) {
        DelProgram(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetPostionList(param) {
        GetPostionList(param).then(res => {
          if (res.code === ERR_OK) {
            for (let i = 0; i < res.data.length; i++) {
              this.postionList = this.postionList.concat(res.data[i].devlist)
            }
            return
          }
          this.$message.error(res.msg);
        })
      },
      QueryProgShopList(name = '') {
        const param = {
          "ProgramCode": this.programInfo.code,
          "Name": name,
          "FloorCode": "",
          "ShopFormatCode": ""
        }
        QueryProgShopList(param).then(res => {
          if (res.code === ERR_OK) {
            this.shopList = res.data
            return
          }
          this.$message.error(res.msg);
        })
      },
      SetProgToShop(param) {
        SetProgToShop(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      SetLabel(param) {
        SetLabel(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetProgLabelList() {
        const param = {"ShopCode": this.programInfo.code}
        GetProgLabelList(param).then(res => {
          if (res.code === ERR_OK) {
            this.labelList = res.data.alreadylist.concat(res.data.labels)
            if (res.data.alreadylist.length > 0) {
              for (let i = 0; i < res.data.alreadylist.length; i++) {
                this.labelActive.push(res.data.alreadylist[i].code)
              }
            }
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
      //店铺搜索
      onSearch1() {
        this.QueryProgShopList(this.search1.name)
      },
      //重置搜索
      replaySearch() {
        this.search = {}
        this.currentPage = 1
        this.$refs.table.clearFilter()
        this.getList(this.pageSize, this.currentPage)
      },
      //表格筛选
      filterTag(value) {
        //节目类型
        if ( value.progType ) {
          this.search.progType = value.progType[0]
        }
        //切换效果
        if ( value.switchMode ) {
          this.search.switchMode = value.switchMode[0]
        }
        //屏幕适应
        if ( value.screenMatch ) {
          this.search.screenMatch = value.screenMatch[0]
        }
        //节目状态
        if ( value.progStatus ) {
          this.search.progStatus = value.progStatus[0]
        }

        this.getList(this.pageSize, this.currentPage)
      },
      //打开新增弹窗
      handleAdd(item) {
        this.dialogVisible = true
        this.releaseType = item
        this.editForm = {
          "screenInfo": "",
          "launchTime": "",
          "expiryDate": "",
          "switchMode": "随机",
          "switchTime": "15",
          "screenMatch": "无",
          "groupName": "",
          "progFiles": []
        }
        this.editForm.groupName = this.dateFormat("y-m-d h:i:s") + ' 新建节目组'
        this.dialogTitle = '快速发布'
        if (item == 2) {
          this.dialogTitle = '新增素材'
        }
      },
      //复制
      handleCopy(item) {
        this.dialogVisible = true
        this.dialogTitle = '新增素材'
        this.releaseType = 2
        this.editForm = {
          "time": [item.launchTime, item.expiryDate],
          "screenInfo": item.progScreenInfo,
          "launchTime": item.launchTime,
          "expiryDate": item.expiryDate,
          "switchMode": item.switchMode,
          "switchTime": item.switchTime,
          "screenMatch": item.screenMatch,
          "groupName": item.groupName,
          "progFiles": []
        }
      },
      //打开编辑弹窗
      handleEdit(item) {
        let data = JSON.parse(JSON.stringify(item));
        data.time = [data.launchTime, data.expiryDate]
        data.screenInfo = data.progScreenInfo
        this.updateForm = data
        this.dialogVisibleDetails = true
        let newArray = data.progSrc.split("\\")
        let newArray1 = data.vProgSrc ? data.vProgSrc.split("\\") : [];
        this.fileList = []
        const typeImg = ['jpg', 'png', 'jpeg', 'gif']
        let fileType = data.progSrc.split(".")
        let dataType = 'image/jpg'
        if ( typeImg.indexOf(fileType[fileType.length-1]) < 0 ) {
          dataType = 'video/mp4'
        }
        this.fileList.push(
            {
              name: newArray[newArray.length-1],
              FileGUID: data.fileGuid,
              PreviewFileGUID: data.previewFileGuid,
              type: dataType,
              uid: 102,
            } )
        if ( newArray1.length > 0 ) {
          this.fileList.push( {
            name: newArray1[newArray1.length-1],
            FileGUID: data.vFileGuid,
            PreviewFileGUID: data.vPreviewFileGuid,
            type: 'video/mp4',
            uid: 101,
          } )
        }

        this.updateForm.progFiles = JSON.parse(JSON.stringify(this.fileList))

        if ( data.sName.includes('横屏') ) {
          this.uploadNum = 1;
        } else {
          this.uploadNum = 2;
        }
        console.log(this.updateForm)
      },
      //已发布设备
      handleDevice(item) {
        this.dialogVisibleDevice = true
        const param = {"Code": item.code}
        this.GetPostionList(param)
      },
      //关联店铺
      handleEditShop(item) {
        this.programInfo = item
        this.dialogVisibleShop = true
        this.QueryProgShopList()
      },
      //设置标签
      handleEditLabel(item) {
        this.dialogVisibleLabel = true
        this.programInfo = item
        this.GetProgLabelList();
      },
      //关闭弹窗
      handleClose() {
        this.dialogVisible = false
        this.dialogVisibleDetails = false
        this.dialogVisibleDevice = false
        this.dialogVisibleShop = false
        this.dialogVisibleLabel = false
        this.$refs["editForm"] && this.$refs["editForm"].resetFields()
        this.labelActive = [];
        this.$refs.videoRef && this.$refs.videoRef.pause()
        this.fileList = []
      },
      //提交
      submitUpForm(item) {
        this.$refs[item].validate(valid => {
          if (valid) {
            const param = {
              "ScreenInfo": this.editForm.screenInfo,
              "LaunchTime": this.editForm.time[0],
              "ExpiryDate": this.editForm.time[1],
              "SwitchMode": this.editForm.switchMode,
              "SwitchTime": this.editForm.switchTime,
              "ScreenMatch": this.editForm.screenMatch,
            }
            param.ProgramName = this.editForm.progFiles[0].ProgramName

            const typeFileImg = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif']
            for ( let i=0;i<this.editForm.progFiles.length;i++ ) {
              if ( typeFileImg.indexOf(this.editForm.progFiles[i].type) > -1 || this.uploadNum === 1 || this.editForm.progFiles.length === 1 ) {
                param.FileGUID = this.editForm.progFiles[i].FileGUID
                param.PreviewFileGUID = this.editForm.progFiles[i].PreviewFileGUID
              } else {
                param.VFileGUID = this.editForm.progFiles[i].FileGUID
                param.VPreviewFileGUID = this.editForm.progFiles[i].PreviewFileGUID
              }
            }

            //快速发布
            if (this.releaseType == 1) {
              param.GroupName = this.editForm.groupName
              this.ProgAddFast(param)
              return
            }
            //素材发布
            this.ProgAdd(param)
          }
        })
      },
      //编辑提交
      submitEdForm(item) {
        if ( this.updateForm.progFiles.length < 1 ) {
          this.$message.error('请上传素材');
          return
        }
        this.$refs[item].validate(valid => {
          if (valid) {
            const param = {
              "Code": this.updateForm.code,
              "ScreenInfo": this.updateForm.screenInfo,
              "LaunchTime": this.updateForm.time[0],
              "ExpiryDate": this.updateForm.time[1],
              "SwitchMode": this.updateForm.switchMode,
              "SwitchTime": this.updateForm.switchTime,
              "ScreenMatch": this.updateForm.screenMatch,
              "ProgramName": this.updateForm.programName,
            }

            const typeFileImg = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif']
            for ( let i=0;i<this.updateForm.progFiles.length;i++ ) {
              if ( typeFileImg.indexOf(this.updateForm.progFiles[i].type) > -1 || this.uploadNum === 1 || this.updateForm.progFiles.length === 1 ) {
                param.FileGUID = this.updateForm.progFiles[i].FileGUID
                param.PreviewFileGUID = this.updateForm.progFiles[i].PreviewFileGUID
              } else {
                param.VFileGUID = this.updateForm.progFiles[i].FileGUID
                param.VPreviewFileGUID = this.updateForm.progFiles[i].PreviewFileGUID
              }
            }

            this.ProgEdit(param)
          }
        })
      },
      //删除
      handleDelete(item) {
        this.DelProgram_Pre({"Codes": [item.code]});
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
      //分配设备
      submitDeForm() {
        console.log(this.selectedStaffList)
      },
      //获取选中值
      changeTransfer(item) {
        this.selectedStaffList = item
      },
      //数字加减
      handleChange(value) {
        console.log(value);
      },
      //修改屏幕分辨率
      changeScreen() {
        for ( let i=0;i<this.searchDeviceList.length;i++ ) {
          if ( this.searchDeviceList[i].code === this.editForm.screenInfo ) {
            if ( this.searchDeviceList[i].sName.includes('横屏') ) {
              this.uploadNum = 1;
              if ( this.fileList.length > 1 ) {
                this.handleDeleteFile(1)
              }
            } else {
              this.uploadNum = 2;
            }
          }
        }
      },
      //修改屏幕分辨率
      changeScreen1() {
        for ( let i=0;i<this.searchDeviceList.length;i++ ) {
          if ( this.searchDeviceList[i].code === this.updateForm.screenInfo ) {
            if ( this.searchDeviceList[i].sName.includes('横屏') ) {
              this.uploadNum = 1;
              this.handleDeleteFile1(1)
            } else {
              this.uploadNum = 2;
            }
          }
        }
      },
      /**
       * 上传素材
       */
      submitUpload() {
        this.$refs.upload.submit();
      },
      uploaded(event, file, fileList) {
        this.uid = file.uid
        this.fileList = fileList
      },
      uploaded1(event, file, fileList) {
        this.uid = file.uid
        this.fileList = [fileList[fileList.length-1]]
        console.log(file)
      },
      //修改文件名
      changeFileName(index, name) {
        this.editForm.progFiles[index].programName = name
      },
      handleProgress(file) {

        //限制两个文件上传的组合方式
        if ( this.fileList.length > 1 ) {
          const typeImg = ['jpg', 'png', 'jpeg', 'gif']
          const typeFileImg = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif']
          let fileType = this.fileList[0].name.split(".")
          //是否为图片
          if ( (typeImg.indexOf(fileType[1]) > -1 && typeFileImg.indexOf(file.type) > -1) || (typeImg.indexOf(fileType[1]) === -1 && typeFileImg.indexOf(file.type) === -1) ) {
            this.$message.error('上传文件形式只能是图片+视频!');
            return false
          }
        }

        const isLt2M = file.size / 1024 / 1024 < 500;
        const type = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'video/avi', 'video/flv', 'video/3gpp']

        if (type.indexOf(file.type) === -1 && file.name.substr(-3) !== 'flv') {
          this.$message.error('上传文件只能是 jpg、png、gif、mp4、avi、3gp、flv格式!');
          return false
        }
        if (!isLt2M) {
          this.$message.error('上传文件大小不能超过 500MB!');
          return false
        }
        if ( this.uid > 1 ) {
          this.$message.error('文件正在上传中，请稍后操作');
          return false
        }
      },
      changeProgress(file, fileList) {
        this.fileList = []
        this.fileList = fileList
      },
      handleAvatarSuccess(res, file) {
        if (res.code === '200') {
          this.uid = 1
          this.editForm.progFiles.push({
            FileGUID: res.data.fileGuid,
            ProgramName: file.name,
            Size: file.size,
            PreviewFileGUID: res.data.previewFileGuid,
            type: file.raw.type
          });
          console.log(this.editForm.progFiles)
        } else {
          this.$message.error('上传失败!');
        }
      },
      handleAvatarSuccess1(res, file) {
        if (res.code === '200') {
          this.uid = 1
          this.updateForm.progFiles.push({
            name: file.name,
            FileGUID: res.data.fileGuid,
            Size: file.size,
            PreviewFileGUID: res.data.previewFileGuid,
            type: file.raw.type
          });
        } else {
          this.$message.error('上传失败!');
        }
      },
      //大小换算
      fileSize(item) {
        if (item > 1048576) {
          return (item / 1024 / 1024).toFixed(2) + 'M';
        }
        return (item / 1024).toFixed(2) + 'K';
      },
      //删除文件
      handleDeleteFile(index) {
        this.editForm.progFiles.splice(index, 1)
        this.fileList.splice(index, 1)
      },
      //删除文件
      handleDeleteFile1(index) {
        this.updateForm.progFiles.splice(index, 1)
        this.fileList.splice(index, 1)
      },
      //关联店铺
      progToShop(item) {
        const param = {
          "ProgramCode": this.programInfo.code,
          "ShopCode": item.code
        }
        this.SetProgToShop(param)
      },
      //设置标签
      submitLbForm() {
        const param = {
          "LabelCodeList": this.labelActive,
          "ObjectCode": this.programInfo.code
        }
        this.SetLabel(param)
      },
      //放大图片
      clickImage(item,type = 0) {
        this.bigFile = {}
        if ( type === 1 ) {
          this.bigFile.src = item.vProgSrc
          this.bigFile.type = '视频'
          return
        }
        const typeImg = ['jpg', 'png', 'jpeg', 'gif']
        let fileType = item.progSrc.split(".")
        this.bigFile.type = '图片'
        if ( typeImg.indexOf(fileType[fileType.length-1]) < 0 ) {
          this.bigFile.type = '视频'
        }
        this.bigFile.src = item.progSrc
      },
      //关闭放大
      closeImg() {
        this.bigFile = null
      },
      //打开更多搜索
      clickSearchOther() {
        this.otherSearch = !this.otherSearch
      },
    },
    computed: {
      ...mapGetters(['presentMenu', 'config'])
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
    height: 300px;
    position: relative;

    .card-input{
      width: 100%;
      position: relative;
    }

    div {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    bottom: -20px;
  }
</style>
