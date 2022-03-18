<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>节目管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-tabs type="border-card" style="margin-top: 40px" @tab-click="tabClick">
      <el-tab-pane label="节目">
        <!--  搜索  -->
        <el-form :inline="true" :model="search" class="demo-form-inline">
          <el-form-item label="插播名称">
            <el-input v-model="search.SearchKey" placeholder="插播名称"></el-input>
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

          <el-form-item>
            <el-button @click="onSearch">查询</el-button>
            <el-button @click="replaySearch">清空</el-button>
            <!--<el-link type="primary" :underline="false" style="margin-left: 10px" @click="clickSearchOther()">-->
            <!--高级查询-->
            <!--<i class="el-icon-view el-icon-caret-top" v-show="otherSearch"></i>-->
            <!--<i class="el-icon-view el-icon-caret-bottom" v-show="!otherSearch"></i>-->
            <!--</el-link>-->
          </el-form-item>
          <el-form-item class="right-button">
            <el-button type="success" @click="handleEdit({})" v-if="pageMenu.addnewsgroup">新增插播</el-button>
            <el-button type="danger" @click="batchDelete(tableChecked,1)" v-if="pageMenu.delnewsgroup">删除</el-button>
          </el-form-item>

          <div v-show="otherSearch">

            <!--<el-form-item label="素材数量排序">-->
            <!--<el-select v-model="search.NewsOrder" placeholder="素材数量排序">-->
            <!--<el-option-->
            <!--v-for="item in sort"-->
            <!--:label="item.label"-->
            <!--:value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="设备数量排序">-->
            <!--<el-select v-model="search.Order" placeholder="设备数量排序">-->
            <!--<el-option-->
            <!--v-for="item in sort"-->
            <!--:label="item.label"-->
            <!--:value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="设备状态">-->
            <!--<el-select v-model="search.State" placeholder="设备状态">-->
            <!--<el-option-->
            <!--v-for="item in stateList"-->
            <!--:label="item.text"-->
            <!--:value="item.text">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <!--</el-form-item>-->
          </div>
        </el-form>

        <!--  表格  -->
        <el-table
                :data="tableData"
                @selection-change="handleDeletion"
                ref="table"
                @filter-change="filterTag"
                height="560"
                style="width: 100%">
          <el-table-column align="center" type="selection" width="60">
          </el-table-column>
          <el-table-column prop="groupName" label="插播名称" min-width="200">
            <template slot-scope="scope">
              <div class="overflow-div" slot="reference">{{scope.row.groupName}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="sName" label="屏幕属性" min-width="100"></el-table-column>
          <el-table-column label="素材数量" column-key="NewsOrder" :filters=sort :filter-multiple="false">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleProgramDetail(scope.row)">{{ scope.row.pgCount }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="设备数量" column-key="Order" :filters=sort :filter-multiple="false">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDeviceDetail(scope.row)">{{ scope.row.devCount }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="播放策略">
            <template slot-scope="scope">
              {{ scope.row.playStrategy == 1 ? '即时播报' : '定时播报' }}
            </template>
          </el-table-column>
          <el-table-column prop="launchTime" label="开始时间" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.launchTime == '0001-01-01T00:00:00' ? '----' : timestampToTime(scope.row.launchTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="expiryDate" label="结束时间" min-width="100">
            <template slot-scope="scope">{{ timestampToTime(scope.row.expiryDate) }}</template>
          </el-table-column>
          <el-table-column prop="state" label="状态" column-key="State" :filters=stateList :filter-multiple="false"></el-table-column>
          <el-table-column prop="founderName" label="创建用户"></el-table-column>
          <el-table-column label="操作" width="250px">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)" :disabled="scope.row.state != '未开始'"
                         v-if="pageMenu.editnewsgroup">编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row,1)"
                         :disabled="scope.row.state == '进行中'" v-if="pageMenu.delnewsgroup">删除
              </el-button>
              <el-dropdown style="margin-left: 15px">
                <el-button type="primary" size="small">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :disabled="scope.row.state != '进行中'"><p @click="handleStop(scope.row)"
                                                                            v-if="pageMenu.stopnewsgroup">停止</p>
                  </el-dropdown-item>
                  <el-dropdown-item :disabled="scope.row.state == '已结束'"><p @click="handleDevice(scope.row)"
                                                                            v-if="pageMenu.publishnewsgroup">发布设备</p>
                  </el-dropdown-item>
                  <el-dropdown-item :disabled="scope.row.state == '已结束'"><p @click="handleDeviceGroup(scope.row)"
                                                                            v-if="pageMenu.publishnewsgroup">发布设备组</p>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!--  分页  -->
        <pagination class="page-div" :list="tableData" :total="total" :page="currentPage"
                    @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"
                    :pageSize="pageSize"></pagination>

      </el-tab-pane>
      <el-tab-pane label="字幕">
        <!--  搜索  -->
        <el-form :inline="true" :model="search" class="demo-form-inline">
          <el-form-item label="字幕名称">
            <el-input v-model="search.SearchKey" placeholder="字幕名称"></el-input>
          </el-form-item>
          <!--<el-form-item label="设备数量排序">-->
          <!--<el-select v-model="search.Order" placeholder="设备数量排序">-->
          <!--<el-option-->
          <!--v-for="item in sort"-->
          <!--:label="item.label"-->
          <!--:value="item.value">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</el-form-item>-->
          <!--<el-form-item label="设备状态">-->
          <!--<el-select v-model="search.State" placeholder="设备状态">-->
          <!--<el-option-->
          <!--v-for="item in stateList"-->
          <!--:label="item.label"-->
          <!--:value="item.label">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</el-form-item>-->
          <el-form-item>
            <el-button @click="onSearchSub">查询</el-button>
            <el-button @click="replaySearchSub">清空</el-button>
          </el-form-item>
          <el-form-item class="right-button">
            <el-button type="success" @click="handleSubtitle({})" v-if="pageMenu.addsubtitle">新增字幕</el-button>
            <el-button type="danger" @click="batchDelete(tableChecked,2)" v-if="pageMenu.delsubtitle">删除</el-button>
          </el-form-item>
        </el-form>

        <!--  表格  -->
        <el-table
                :data="tableData"
                @selection-change="handleDeletion"
                ref="table1"
                @filter-change="filterTag1"
                height="560"
                style="width: 100%">
          <el-table-column align="center" type="selection" width="60">
          </el-table-column>
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column label="位置">
            <template slot-scope="scope">
              {{ position[scope.row.location] }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="播放模式">
            <template slot-scope="scope">{{ scope.row.type == 'Immediate' ? '即时播报' : '定时播报' }}</template>
          </el-table-column>
          <el-table-column label="设备数量" column-key="Order" :filters=sort :filter-multiple="false">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDeviceDetail(scope.row)">{{ scope.row.devCount }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="beginTime" label="开始时间">
            <template slot-scope="scope">{{ timestampToTime(scope.row.beginTime) }}</template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间">
            <template slot-scope="scope">{{ timestampToTime(scope.row.endTime) }}</template>
          </el-table-column>
          <el-table-column prop="state" label="状态" column-key="State" :filters=stateList :filter-multiple="false"></el-table-column>
          <el-table-column prop="founderName" label="创建用户"></el-table-column>
          <el-table-column label="操作" width="250px">
            <template slot-scope="scope">
              <el-button type="primary" size="small" :disabled="scope.row.state != '未开始'"
                         @click="handleSubtitle(scope.row)" v-if="pageMenu.addsubtitle">编辑
              </el-button>
              <el-button type="danger" size="small" :disabled="scope.row.state == '进行中'"
                         @click="handleDelete(scope.row,2)" v-if="pageMenu.delsubtitle">删除
              </el-button>
              <el-dropdown style="margin-left: 15px">
                <el-button type="primary" size="small">
                  发布<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :disabled="scope.row.state != '进行中'"><p @click="handleSubStop(scope.row)"
                                                                            v-if="pageMenu.stopsubtitle">停止</p>
                  </el-dropdown-item>
                  <el-dropdown-item :disabled="scope.row.state == '已结束'"><p
                          @click="handleSubtitleDeviceGroup(scope.row)" v-if="pageMenu.publishsubtitle">
                    发布设备组</p></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!--  分页  -->
        <pagination class="page-div" :list="tableData" :total="total" :page="currentPage"
                    @handleCurrentChange="handleCurrentChange1" @handleSizeChange="handleSizeChange1"
                    :pageSize="pageSize"></pagination>

      </el-tab-pane>
      <el-tab-pane label="日程">
        <!--  搜索  -->
        <el-form :inline="true" :model="search" class="demo-form-inline">
          <el-form-item label="日程名称">
            <el-input v-model="search.SearchKey" placeholder="日程名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="onSearchStr">查询</el-button>
            <el-button @click="replaySearchStr">清空</el-button>
          </el-form-item>
          <el-form-item class="right-button">
            <el-button type="success" @click="handleStroke({})" v-if="pageMenu.addinsschedule">新增日程</el-button>
            <el-button type="danger" @click="batchDelete(tableChecked,3)" v-if="pageMenu.deleteinsschedule">删除</el-button>
          </el-form-item>
        </el-form>

        <!--  表格  -->
        <el-table
                :data="tableData"
                @selection-change="handleDeletion"
                ref="table2"
                @filter-change="filterTag1"
                height="560"
                style="width: 100%">
          <el-table-column align="center" type="selection" width="60">
          </el-table-column>
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column label="设备数量">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDeviceDetail(scope.row)">{{ scope.row.deviceCount }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="resolution" label="广告分辨率"></el-table-column>
          <el-table-column prop="creator" label="上传人"></el-table-column>
          <el-table-column prop="period" label="有效期"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间"></el-table-column>
          <el-table-column prop="isActivity" label="状态">
            <template slot-scope="scope">
              {{ scope.row.isActivity ? '已发布' : '待发布' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280px">
            <template slot-scope="scope">
              <el-button type="primary" size="small" :disabled="scope.row.isActivity"
                         @click="handleEditStoke(scope.row)" v-if="pageMenu.editinsschedule">编辑
              </el-button>
              <el-button type="primary" size="small" @click="handleEditStoke(scope.row,1)" v-if="pageMenu.insscheduleinfo">查看</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row,3)" v-if="pageMenu.deleteinsschedule">删除</el-button>
              <el-button type="primary" v-show="!scope.row.isActivity" @click="handlePublish(scope.row)" size="small" v-if="pageMenu.changeschestate">发布</el-button>
              <el-button type="danger" v-show="scope.row.isActivity" @click="handlePublish(scope.row)" size="small" v-if="pageMenu.changeschestate">停止</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!--  分页  -->
        <pagination class="page-div" :list="tableData" :total="total" :page="currentPage"
                    @handleCurrentChange="handleCurrentChange1" @handleSizeChange="handleSizeChange1"
                    :pageSize="pageSize"></pagination>

      </el-tab-pane>
    </el-tabs>

    <!--  新增  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="newsForm" :rules="rules" ref="editForm">
        <el-form-item label="插播名称" prop="groupName">
          <el-input type="text" v-model="newsForm.groupName" placeholder="请输入插播名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="screenInfo">
          <el-select v-model="newsForm.screenInfo" placeholder="分辨率" @change="changeScreen">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="插播模式" prop="playStrategy">
          <el-radio v-for="item of newsPlayType" v-model="newsForm.playStrategy" :label="item.value">{{ item.label }}
          </el-radio>
        </el-form-item>
        <el-form-item label="插播时间" prop="expiryDate">
          <el-date-picker v-model="newsForm.launchTime" v-show="newsForm.playStrategy == 2" type="datetime"
                          placeholder="选择上线时间"
                          format="yyyy-MM-dd HH:mm"
                          value-format="yyyy-MM-dd HH:mm" style="margin-right: 20px">
          </el-date-picker>
          <el-date-picker v-model="newsForm.expiryDate" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"
                          type="datetime" placeholder="选择下线时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上传素材" prop="progFiles">
          <el-upload
                  class="upload-demo"
                  ref="upload"
                  :action="config.url+config.uploadFile"
                  :before-upload="handleProgress"
                  :on-change="changeProgress"
                  :on-progress='uploaded'
                  :file-list="fileList"
                  :show-file-list="false"
                  :multiple="true"
                  :limit="5"
                  :on-success="handleAvatarSuccess"
                  :auto-upload="true">
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
                <el-progress v-if="item.percentage <= 100" :percentage="Math.round(item.percentage)"
                             class="el-progress"></el-progress>
              </div>
            </el-card>
            <div slot="tip" class="el-upload__tip">支持最多5个素材文件;建议每个图片大小不超过5M，最大尺寸不超过5000x5000分辨率;视频大小不大于500M</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="屏幕设置">
          <el-select v-model="newsForm.screenMatch" placeholder="屏幕适应">
            <el-option
                    v-for="item in screenAdapt"
                    :label="item.label"
                    :value="item.label">
            </el-option>
          </el-select>
          <el-select v-model="newsForm.switchMode" placeholder="切换效果" style="margin-left: 20px">
            <el-option
                    v-for="item in programEffect"
                    :label="item.label"
                    :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="切换时间">
          <p style="display: flex;justify-content: space-between">
            <el-input-number v-model="newsForm.switchTime" :min="1" label="切换时间"></el-input-number>
          </p>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  发布设备  -->
    <el-dialog title="发布设备" :visible.sync="dialogVisibleDevice" width="80%" :before-close="handleClose" append-to-body
               class="dialog">
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="editForm">
        <el-form-item label="设备组名称" prop="name">
          <el-input type="text" v-model="deviceForm.groupName" placeholder="请输入设备组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="name">
          <el-input type="text" v-model="deviceForm.sName" :disabled="true" placeholder="请输入分辨率"></el-input>
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
               class="dialog"
               append-to-body>
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="editForm">
        <el-form-item label="节目组名称" prop="name">
          <el-input type="text" v-model="deviceForm.groupName" :disabled="true" placeholder="请输入节目组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="name">
          <el-input type="text" v-model="deviceForm.sName" :disabled="true" placeholder="请输入分辨率"></el-input>
        </el-form-item>
        <el-form-item label="设备" prop="intro">
          <transferViewProgram1 :List="staffList" ref="transferView" v-if="transferStatus"
                                @changeTransfer="changeTransfer"></transferViewProgram1>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitDegForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  节目详情  -->
    <el-dialog title="节目单" :visible.sync="dialogVisibleProgram" width="50%" :before-close="handleClose" append-to-body>
      <el-table :data="newsProgram" style="width: 100%">
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column prop="previewSrc" label="预览">
          <template slot-scope="scope">
            <img :src="scope.row.previewSrc" width="30" height="30">
          </template>
        </el-table-column>
        <el-table-column prop="programName" label="节目名称" min-width="200">
          <template slot-scope="scope">
            <div class="overflow-div" slot="reference">{{scope.row.programName}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="progType" label="节目类型"></el-table-column>
        <el-table-column prop="switchMode" label="切换模式"></el-table-column>
        <el-table-column prop="switchTime" label="切换间隔"></el-table-column>
        <el-table-column prop="screenMatch" label="屏幕适应"></el-table-column>
      </el-table>
    </el-dialog>

    <!--  设备详情  -->
    <el-dialog title="设备详情" :visible.sync="dialogVisibleDeviceDetails" width="50%" :before-close="handleClose"
               append-to-body>
      <el-table :data="newsProgram" style="width: 100%">
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column prop="devNum" label="设备名称"></el-table-column>
        <el-table-column prop="ip" label="IP地址"></el-table-column>
        <el-table-column prop="name" label="楼层"></el-table-column>
        <el-table-column prop="deviceOnline" label="设备状态">
          <template slot-scope="scope">
            <el-tag type="success" v-show="scope.row.deviceOnline">在线</el-tag>
            <el-tag type="danger" v-show="!scope.row.deviceOnline">离线</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!--  新增字幕  -->
    <el-dialog title="新增字幕" :visible.sync="dialogVisibleSubtitle" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" :rules="rulesSub" ref="editForm">
        <el-form-item label="字幕名称" prop="name">
          <el-input type="text" v-model="editForm.name" placeholder="请输入字幕名称"></el-input>
        </el-form-item>
        <el-form-item label="字体颜色" prop="fontColor">
          <el-color-picker v-model="editForm.fontColor"></el-color-picker>
        </el-form-item>
        <el-form-item label="播放模式" prop="type">
          <el-radio v-for="item of playType" v-model="editForm.type" :label="item.value">{{ item.label }}</el-radio>
        </el-form-item>
        <el-form-item label="插播时间" prop="endTime">
          <el-date-picker v-model="editForm.beginTime" v-show="editForm.type == 'Regular'" type="datetime"
                          placeholder="选择上线时间"
                          format="yyyy-MM-dd HH:mm"
                          value-format="yyyy-MM-dd HH:mm"
                          style="margin-right: 20px">
          </el-date-picker>
          <el-date-picker v-model="editForm.endTime" type="datetime"
                          format="yyyy-MM-dd HH:mm"
                          value-format="yyyy-MM-dd HH:mm"
                          placeholder="选择下线时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="消息位置" prop="location">
          <el-radio v-for="item of messagePosition" v-model="editForm.location" :label="item.value">{{ item.label }}
          </el-radio>
        </el-form-item>
        <el-form-item label="字体大小">
          <p style="display: flex;justify-content: space-between">
            <el-input-number v-model="editForm.fontSize" :min="10" :max="80" label="字体大小"></el-input-number>
          </p>
        </el-form-item>
        <el-form-item label="输入字幕文字">
          <el-input
                  type="textarea"
                  :autosize="{ minRows: 4}"
                  placeholder="请输入输入字幕文字"
                  v-model="editForm.text">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitSubForm('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  发布字幕设备组  -->
    <el-dialog title="发布字幕设备组" :visible.sync="dialogVisibleSubtitleDeviceGroup" width="80%" :before-close="handleClose"
               append-to-body>
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="editForm">
        <el-form-item label="字幕名称" prop="name">
          <el-input type="text" v-model="deviceForm.name" :disabled="true" placeholder="请输入字幕名称"></el-input>
        </el-form-item>
        <el-form-item label="设备" prop="intro">
          <transferViewProgram1 :List="staffList" ref="transferView" v-if="transferStatus"
                                @changeTransfer="changeTransfer"></transferViewProgram1>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitDesForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!--  新增  -->
    <el-dialog title="新增日程" :visible.sync="dialogVisibleStroke" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="strokeForm" :rules="rulesStroke" ref="strokeForm">
        <el-form-item label="分辨率" prop="screenInfo">
          <el-select v-model="strokeForm.screenInfo" placeholder="分辨率" @change="changeDevice">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="time">
          <el-date-picker
                  v-model="strokeForm.time"
                  type="datetimerange"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="选择设备" prop="Devices">
          <el-select v-model="strokeForm.Devices" multiple placeholder="选择设备">
            <el-option
                    v-for="item in deviceData"
                    :label="item.devNum"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('strokeForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpFormStroke('strokeForm')" :loading="loading">确 定</el-button>
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
            <el-table-column type="index" label="广告位" width="200"></el-table-column>
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
    <el-dialog title="节目选择" :visible.sync="dialogVisibleProgram1" width="50%" :before-close="handleClosePro"
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

    <!--  节目选择列表  -->
    <el-dialog title="查看广告" :visible.sync="dialogVisibleProgramDetail" width="50%" :before-close="handleCloseProDei"
               :close-on-click-modal="false" class="dialog" append-to-body>
      <el-form :label-width="formLabelWidth" :model="selectAbd" ref="editForm">
        <el-table :data="selectAbd.already" style="width: 100%" height="620">
          <el-table-column prop="programName" label="节目名称" min-width="180"></el-table-column>
          <el-table-column prop="creator" label="上传人" min-width="180"></el-table-column>
          <el-table-column prop="devNum" label="设备名称" min-width="180"></el-table-column>
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
  import transferViewProgram from 'components/transfer-view-program/transfer-view-program'
  import transferViewProgram1 from 'components/transfer-view-program1/transfer-view-program1'
  import transferView from 'components/transfer-view/transfer-view'
  import {timeFormatting} from 'common/js/mixins'
  import {
    GetDeviceOptionsNew,
    GetRolePermissions,
    GetNewsGroupList,
    NewsAddFast,
    GetNewsGroupInfo,
    UpdateGroupNews,
    DelNewsGroup,
    GetDeviceByGroupCode,
    PublishNewsToDevice,
    GetDeviceGroupByNewsGroup,
    PublishNewsToDeviceGroup,
    NewsStop,
    GetNewsListByGroupCode,
    GetDevicesByNewsGroupCode,
    GetDevicesByCode,
    GetSubtitleList,
    SetSubtitle,
    UpdateSubtitle,
    getSubtitle,
    DelSubtitle,
    GetGroupList,
    PublishSubtitle,
    SubtitleStop,
    GetDevicesBySubtitleCode,
    InsScheduleList,
    AddInsSchedule,
    EditInsSchedule,
    InsScheduleInfo,
    DeleteInsSchedule,
    ChangeScheduleState,
    GetProgramList,
  } from 'http/api/program'
  import {ERR_OK} from 'http/config'
  import {mapGetters} from 'vuex'

  export default {
    name: "deptManager",
    mixins: [timeFormatting],
    data() {
      return {
        search: {SearchKey: '', ScreenCode: '', Order: '', NameOrder: '', State: ''},
        tableData: [],
        total: 0,
        currentPage: 0,
        pageSize: 10,
        dialogVisible: false,
        dialogVisibleDevice: false,
        dialogVisibleDeviceGroup: false,
        dialogVisibleProgram: false,
        dialogVisibleProgram1: false,
        dialogVisibleDeviceDetails: false,
        dialogVisibleSubtitle: false,
        dialogVisibleSubtitleDeviceGroup: false,
        dialogVisibleAdd: false,
        dialogVisibleProgramDetail: false,
        dialogVisibleStroke: false,
        dialogTitle: '新增',
        editForm: {},
        newsForm: {},
        formLabelWidth: "120px",
        rules: {
          screenInfo: [{required: true, message: '请选择分辨率', trigger: 'blur'}],
          expiryDate: [{required: true, message: '请选择下线时间', trigger: 'blur'}],
          progFiles: [{required: true, message: '请上传素材', trigger: 'blur'}],
        },
        rulesSub: {
          name: [{required: true, message: '请输入字幕名称', trigger: 'blur'}],
          endTime: [{required: true, message: '请选择下线时间', trigger: 'blur'}],
          fontColor: [{required: true, message: '请选择字体颜色', trigger: 'blur'}],
        },
        rulesStroke: {
          screenInfo: [{required: true, message: '请选择分辨率', trigger: 'blur'}],
          time: [{required: true, message: '请选择时间范围', trigger: 'blur'}],
          Devices: [{required: true, message: '请选择素材', trigger: 'blur'}],
        },
        rules1: {
          name: [{required: true, message: '请输入字幕名称', trigger: 'blur'}],
        },
        tableChecked: [],
        deviceForm: {},
        staffList: [],
        selectedStaffList: [],
        sort: [
          {text: '升序', value: 'ASC'},
          {text: '降序', value: 'Desc'}
        ],
        stateList: [
          {text: '未开始', value: '未开始'},
          {text: '进行中', value: '进行中'},
          {text: '已结束', value: '已结束'}
        ],
        fileList: [],
        newsPlayType: [
          {label: '即时播报', value: 1},
          {label: '定时播报', value: 2}
        ],
        playType: [
          {label: '即时播报', value: 'Immediate'},
          {label: '定时播报', value: 'Regular'}
        ],
        messagePosition: [
          {label: '屏幕上方', value: 'top'},
          {label: '屏幕下方', value: 'foot'}
        ],
        programEffect: [
          {label: '随机', value: 1},
          {label: '马赛克', value: 2},
          {label: '上下滑动', value: 3},
          {label: '左右滑动', value: 4},
          {label: '渐入', value: 5}
        ],
        screenAdapt: [
          {label: '无', value: 1},
          {label: '填充', value: 2},
          {label: '适应', value: 3},
          {label: '拉伸', value: 4},
          {label: '平铺', value: 5},
          {label: '居中', value: 6}
        ],
        tabName: '节目',
        searchDeviceList: [],
        pageMenu: [],
        newsInfo: {},
        transferStatus: false,
        newsProgram: [],
        position: {
          'left': '左侧', 'right': '右侧', 'top': '上方', 'foot': '下方'
        },
        otherSearch: false,
        loading: false,
        isTable: true,
        deviceData: [],
        programList: [],
        strokeForm: {time:[]},
        selectAbd: {},
      }
    },
    created() {
      this.tabName = '节目'
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
            console.log(this.pageMenu)
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
          "ScreenInfoCode": this.search.ScreenCode,
          "Order": this.search.Order,
          "NewsOrder": this.search.NewsOrder,
          "State": this.search.State,
          "Paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
        }
        GetNewsGroupList(param).then(res => {
          if (res.code === ERR_OK) {
            this.tableData = res.data.list
            this.total = res.data.allCount
            // console.log(this.tableData)
          }
        })
      },
      NewsAddFast(param) {
        NewsAddFast(param).then(res => {
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
      UpdateGroupNews(param) {
        UpdateGroupNews(param).then(res => {
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
      PublishNewsToDevice(param) {
        PublishNewsToDevice(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetNewsGroupInfo(code) {
        const param = {
          "Code": code
        }
        GetNewsGroupInfo(param).then(res => {
          if (res.code === ERR_OK) {
            this.newsForm = res.data
            this.newsForm.progFiles = []
            this.newsForm.screenInfo = res.data.screenInfoCode
            for (let i = 0; i < res.data.newsList.length; i++) {
              this.newsForm.progFiles.push({
                FileGUID: res.data.newsList[i].fileCode,
                ProgramName: res.data.newsList[i].fileName,
                Size: res.data.newsList[i].filesize,
                PreviewFileGUID: res.data.newsList[i].previewFileGuid,
              })
              this.fileList.push({
                uid: res.data.newsList[i].fileCode,
                name: res.data.newsList[i].fileName,
                size: res.data.newsList[i].filesize,
              })
            }
          }
        })
      },
      DelNewsGroup(param) {
        DelNewsGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
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
            this.transferStatus = true
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetDeviceGroupByNewsGroup(Code) {
        const param = {
          "NewsGroupCode": Code
        }
        GetDeviceGroupByNewsGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.staffList.unIncludeDevice = res.data.undDeviceGroup
            this.staffList.includeDevice = res.data.deviceGroup
            this.selectedStaffList = res.data.deviceGroup
            this.transferStatus = true
            return
          }
          this.$message.error(res.msg);
        })
      },
      PublishNewsToDeviceGroup(param) {
        PublishNewsToDeviceGroup(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      NewsStop(param) {
        NewsStop(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.getList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetNewsListByGroupCode(param) {
        GetNewsListByGroupCode(param).then(res => {
          if (res.code === ERR_OK) {
            this.newsProgram = res.data
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetDevicesByCode(param) {
        GetDevicesByCode(param).then(res => {
          if (res.code === ERR_OK) {
            this.newsProgram = res.data
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetSubtitleList(pageSize, page) {
        const param = {
          "SearchKey": this.search.SearchKey,
          "Order": this.search.Order,
          "NewsOrder": this.search.NewsOrder,
          "State": this.search.State,
          "Paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
        }
        GetSubtitleList(param).then(res => {
          if (res.code === ERR_OK) {
            this.tableData = res.data.list
            this.total = res.data.allCount
            // console.log(this.tableData)
          }
        })
      },
      SetSubtitle(param) {
        SetSubtitle(param).then(res => {
          this.loading = false
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.GetSubtitleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      UpdateSubtitle(param) {
        UpdateSubtitle(param).then(res => {
          this.loading = false
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.GetSubtitleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      getSubtitle(code) {
        const param = {"Code": code}
        getSubtitle(param).then(res => {
          if (res.code === ERR_OK) {
            this.editForm = res.data
          }
        })
      },
      DelSubtitle(param) {
        DelSubtitle(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.GetSubtitleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetGroupList(Code) {
        const param = {
          "Code": Code
        }
        GetGroupList(param).then(res => {
          if (res.code === ERR_OK) {
            this.staffList.unIncludeDevice = res.data.undDeviceGroup
            this.staffList.includeDevice = res.data.deviceGroup
            this.selectedStaffList = res.data.deviceGroup
            this.transferStatus = true
            return
          }
          this.$message.error(res.msg);
        })
      },
      PublishSubtitle(param) {
        PublishSubtitle(param).then(res => {
          if (res.code === ERR_OK) {
            this.handleClose()
            this.$message.success(res.msg);
            this.GetSubtitleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      SubtitleStop(param) {
        SubtitleStop(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.GetSubtitleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      GetDeviceByGroupCode1(GroupCode, ScreenCode) {
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
      //插播日程
      InsScheduleList(pageSize, page) {
        const param = {
          "Name": this.search.SearchKey,
          "Paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
        }
        InsScheduleList(param).then(res => {
          if (res.code === ERR_OK) {
            this.tableData = res.data.list
            this.total = res.data.allCount
            console.log(this.tableData)
          }
        })
      },
      InsScheduleInfo(param,type) {
        InsScheduleInfo(param).then(res => {
          if (res.code === ERR_OK) {
            this.dialogVisibleStroke = false
            this.dialogVisibleAdd = true
            this.editForm = res.data
            this.editForm.isActivity = type == 1 ? true : false
            console.log(res.data)
            return
          }
          this.$message.error(res.msg);
        })
      },
      AddInsSchedule(param) {
        AddInsSchedule(param).then(res => {
          this.loading = false
          if (res.code === ERR_OK) {
            this.InsScheduleList(this.pageSize, this.currentPage)
            this.InsScheduleInfo({Code:res.data})
            return
          }
          this.$message.error(res.msg);
        })
      },
      EditInsSchedule(param) {
        EditInsSchedule(param).then(res => {
          this.loading = false
          if (res.code === ERR_OK) {
            this.handleClose()
            this.InsScheduleList(this.pageSize, this.currentPage)
            return
          }
          this.$message.error(res.msg);
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
      DeleteInsSchedule(param) {
        DeleteInsSchedule(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.InsScheduleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      ChangeScheduleState(param) {
        ChangeScheduleState(param).then(res => {
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
            this.InsScheduleList()
            return
          }
          this.$message.error(res.msg);
        })
      },
      /**
       * End
       * @param val
       */
      //时间转换
      timestampToTime(item) {
        return this.dateFormat('yyyy-mm-dd hh:ii', new Date(item))
      },
      //当前页码
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getList(this.pageSize, val)
      },
      //当前页码
      handleCurrentChange1(val) {
        this.currentPage = val;
        this.GetSubtitleList(this.pageSize, val)
      },
      //每页数量
      handleSizeChange(val) {
        this.pageSize = val;
        this.currentPage = 1;
        this.getList(this.pageSize, this.currentPage)
      },
      //每页数量
      handleSizeChange1(val) {
        this.pageSize = val;
        this.currentPage = 1;
        this.GetSubtitleList(this.pageSize, this.currentPage)
      },
      //搜索
      onSearch() {
        this.currentPage = 1
        this.getList(this.pageSize, this.currentPage, this.search)
      },
      //搜索字幕
      onSearchSub() {
        this.currentPage = 1
        this.GetSubtitleList(this.pageSize, this.currentPage)
      },
      //搜索字幕
      onSearchStr() {
        this.currentPage = 1
        this.InsScheduleList(this.pageSize, this.currentPage)
      },
      //重置搜索
      replaySearch() {
        this.search = {
          "SearchKey": "", "ScreenInfoCode": "", "Order": "", "NameOrder": "", "State": "", "NewsOrder": ""
        }
        this.currentPage = 1
        this.$refs.table.clearFilter()
        this.getList(this.pageSize, this.currentPage)
      },
      //重置搜索字幕
      replaySearchSub() {
        this.search = {
          "SearchKey": "", "Order": "", "NameOrder": "", "State": "", "NewsOrder": ""
        }
        this.currentPage = 1
        this.$refs.table1.clearFilter()
        this.GetSubtitleList(this.pageSize, this.currentPage)
      },
      //重置搜索字幕
      replaySearchStr() {
        this.search = {
          "SearchKey": "", "Order": "", "NameOrder": "", "State": "", "NewsOrder": ""
        }
        this.currentPage = 1
        this.$refs.table2.clearFilter()
        this.InsScheduleList(this.pageSize, this.currentPage)
      },
      //表格筛选
      filterTag(value) {
        //素材数量
        if ( value.NewsOrder ) {
          this.search.NewsOrder = value.NewsOrder[0]
        }
        //设备数量
        if ( value.Order ) {
          this.search.Order = value.Order[0]
        }
        //前端状态
        if ( value.State ) {
          this.search.State = value.State[0]
        }

        this.getList(this.pageSize, this.currentPage)
      },
      //表格筛选
      filterTag1(value) {
        //设备数量
        if ( value.Order ) {
          this.search.Order = value.Order[0]
        }
        //前端状态
        if ( value.State ) {
          this.search.State = value.State[0]
        }

        this.GetSubtitleList(this.pageSize, this.currentPage)
      },
      //打开弹窗
      handleEdit(item) {
        this.dialogVisible = true
        if (JSON.stringify(item) != '{}') {
          this.dialogTitle = '编辑'
          this.GetNewsGroupInfo(item.code)
        } else {
          this.newsForm = {
            "groupName": this.dateFormat('yyyy-mm-dd hh:ii:ss') + ' 新建插播',
            "screenInfo": "",
            "launchTime": "",
            "expiryDate": "",
            "switchMode": "随机",
            "switchTime": "15",
            "screenMatch": "无",
            "playStrategy": 1,
            "progFiles": []
          }
        }
      },
      //发布设备
      handleDevice(item) {
        this.GetDeviceByGroupCode(item.screenInfoCode)
        this.dialogVisibleDevice = true
        this.deviceForm = {
          groupName: this.dateFormat('yyyy-mm-dd hh:ii:ss') + ' 新建设备',
          screenInfo: item.screenInfoCode,
          sName: item.sName,
          newsGroupCode: item.code,
        }
      },
      //发布到设备组
      handleDeviceGroup(item) {
        this.dialogVisibleDeviceGroup = true
        this.GetDeviceGroupByNewsGroup(item.code)
        this.deviceForm = {
          groupName: item.groupName,
          screenInfo: item.screenInfoCode,
          sName: item.sName,
          newsGroupCode: item.code,
        }
      },
      //节目详情
      handleProgramDetail(item) {
        const param = {"Code": item.code}
        this.GetNewsListByGroupCode(param)
        this.dialogVisibleProgram = true
      },
      //设备详情
      handleDeviceDetail(item) {
        const param = {"Code": item.code}
        this.GetDevicesByCode(param)
        this.dialogVisibleDeviceDetails = true
      },
      //设备详情
      handleDeviceDetail1(item) {
        const param = {"Code": item.code}
        this.GetDevicesBySubtitleCode(param)
        this.dialogVisibleDeviceDetails = true
      },
      //发布字幕
      handleSubtitle(item) {
        this.dialogVisibleSubtitle = true
        this.editForm = {
          fontSize: 12, location: 'top', type: 'Immediate'
        }
        if (JSON.stringify(item) != '{}') {
          this.getSubtitle(item.code)
        }
      },
      //发布字幕
      handleSubtitleDeviceGroup(item) {
        this.GetGroupList(item.code);
        this.deviceForm = {
          name: item.name,
          code: item.code
        }
        this.dialogVisibleSubtitleDeviceGroup = true
      },
      //关闭弹窗
      handleClose() {
        this.dialogVisible = false
        this.dialogVisibleDevice = false
        this.dialogVisibleDeviceGroup = false
        this.dialogVisibleProgram = false
        this.dialogVisibleDeviceDetails = false
        this.dialogVisibleSubtitle = false
        this.dialogVisibleSubtitleDeviceGroup = false
        this.transferStatus = false
        this.dialogVisibleAdd = false
        this.dialogVisibleStroke = false
        this.$refs["editForm"] && this.$refs["editForm"].resetFields()
        this.newsForm = {}
        this.fileList = []
        this.loading = false
        this.strokeForm = {time:[]}
      },
      //关闭节目
      handleClosePro() {
        this.dialogVisibleProgram1 = false
      },
      //关闭节目详情
      handleCloseProDei() {
        this.dialogVisibleProgramDetail = false
      },
      //提交插播
      submitUpForm(item) {
        this.$refs[item].validate(valid => {
          if (valid) {
            this.loading = true
            const param = {
              "GroupName": this.newsForm.groupName,
              "ScreenInfo": this.newsForm.screenInfo,
              "LaunchTime": this.newsForm.launchTime,
              "ExpiryDate": this.newsForm.expiryDate,
              "SwitchMode": this.newsForm.switchMode,
              "SwitchTime": this.newsForm.switchTime,
              "ScreenMatch": this.newsForm.screenMatch,
              "ProgFiles": this.newsForm.progFiles,
              "PlayStrategy": this.newsForm.playStrategy
            }
            if (this.newsForm.code) {
              param.Code = this.newsForm.code
              this.UpdateGroupNews(param)
              return
            }
            this.NewsAddFast(param)
          }
        })
      },
      //提交字幕
      submitSubForm(item) {
        this.$refs[item].validate(valid => {
          if (valid) {
            this.loading = true
            const param = {
              "Name": this.editForm.name,
              "Text": this.editForm.text,
              "BeginTime": this.editForm.beginTime,
              "EndTime": this.editForm.endTime,
              "Location": this.editForm.location,
              "Type": this.editForm.type,
              "Code": this.editForm.code,
              "FontSize": this.editForm.fontSize,
              "FontColor": this.editForm.fontColor
            }
            if (this.editForm.code) {
              param.Code = this.editForm.code
              this.UpdateSubtitle(param)
              return
            }
            this.SetSubtitle(param)
          }
        })
      },
      //提交字幕设备组
      submitDesForm(item) {
        let ids = []
        if (this.selectedStaffList.length > 0) {
          for (let i = 0; i < this.selectedStaffList.length; i++) {
            ids.push(this.selectedStaffList[i].code)
          }
        }
        const param = {
          "Code": this.deviceForm.code,
          "GroupCode": ids
        }
        this.PublishSubtitle(param)
      },
      //切换分辨率刷新页面
      changeScreen() {
        this.$forceUpdate()
      },
      //停止服务
      handleStop(item) {
        this.$confirm("此操作将停止当前插播, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          const param = {
            "Codes": [item.code]
          }
          this.NewsStop(param)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      },
      //删除
      handleDelete(item, type) {
        this.$confirm("此操作将永久删除, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          const param = {
            "Codes": [item.code]
          }
          if (type == 1) {
            this.DelNewsGroup(param)
            return
          } else if( type == 2 ) {
            //删除字幕
            this.DelSubtitle({"Code": [item.code]})
          } else if( type == 3 ) {
            //删除日程
            this.DeleteInsSchedule(param)
          }
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
      batchDelete(row, type) {
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
            if (type == 1) {
              const param = {
                Codes: ids
              }
              this.DelNewsGroup(param)
              return
            } else if( type == 2 ) {
              //删除字幕
              const param = {
                Code: ids
              }
              this.DelSubtitle(param)
            } else if( type == 3 ) {
              //删除字幕
              const param = {
                Codes: ids
              }
              //删除日程
              this.DeleteInsSchedule(param)
            }

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        }
      },
      //提交发布设备
      submitDeForm() {
        let ids = []
        if (this.selectedStaffList.length > 0) {
          for (let i = 0; i < this.selectedStaffList.length; i++) {
            ids.push(this.selectedStaffList[i].code)
          }
        }
        const param = {
          "GName": this.deviceForm.groupName,
          "ScreenInfoCode": this.deviceForm.screenInfo,
          "Devices": ids,
          "IsSync": this.deviceForm.isSync,
          "NewsGroupCode": this.deviceForm.newsGroupCode,
        }

        this.PublishNewsToDevice(param)
      },
      //提交发布设备组
      submitDegForm() {
        let ids = []
        if (this.selectedStaffList.length > 0) {
          for (let i = 0; i < this.selectedStaffList.length; i++) {
            ids.push(this.selectedStaffList[i].code)
          }
        }
        const param = {
          "DeviceGroupCodes": ids,
          "NewsGroupCode": this.deviceForm.newsGroupCode,
        }
        this.PublishNewsToDeviceGroup(param)
      },
      //获取选中值
      changeTransfer(item) {
        this.selectedStaffList = item
      },
      //切换tab卡
      tabClick(e) {
        this.tabName = e.label
        this.search = {
          "SearchKey": "", "ScreenInfoCode": "", "Order": "", "NameOrder": "", "State": "", "NewsOrder": ""
        }
        this.currentPage = 1
        if (this.tabName == '节目') {
          this.getList(this.pageSize, this.currentPage)
        } else if (this.tabName == '字幕') {
          this.GetSubtitleList(this.pageSize, this.currentPage)
        } else if (this.tabName == '日程') {
          this.InsScheduleList(this.pageSize, this.currentPage)
        }
        this.$refs.table.clearFilter()
        this.$refs.table1.clearFilter()
        this.$refs.table2.clearFilter()
      },
      /**
       * 上传素材
       */
      submitUpload() {
        this.$refs.upload.submit();
      },
      uploaded(event, file, fileList) {
        this.fileList = fileList
      },
      //修改文件名
      changeFileName(index, name) {
        this.editForm.progFiles[index].programName = name
      },
      handleProgress(file) {
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
          for ( let i=0;i<this.fileList.length;i++ ) {
            if ( this.fileList[i].uid === file.uid ) {
              this.fileList[i].percentage = 101
            }
          }
          this.newsForm.progFiles.push({
            FileGUID: res.data.fileGuid,
            ProgramName: file.name,
            Size: file.size,
            PreviewFileGUID: res.data.previewFileGuid
          });
          this.$forceUpdate()
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
        this.newsForm.progFiles.splice(index, 1)
        this.fileList.splice(index, 1)
        this.$forceUpdate()
      },
      //点击同屏
      clickSyn() {
        this.GetDeviceByGroupCode(this.deviceForm.screenInfoCode, this.deviceForm.isSyn)
        this.transferStatus = false;
        this.$nextTick(() => {
          this.transferStatus = true;
        })
      },
      //停止字幕
      handleSubStop(item) {
        this.SubtitleStop({"Codes": [item.code]})
      },
      //打开更多搜索
      clickSearchOther() {
        this.otherSearch = !this.otherSearch
      },
      //点击搜索设备
      changeDevice() {
        this.GetDeviceByGroupCode1('', this.strokeForm.screenInfo)
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
        this.dialogVisibleProgram1 = true
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
      //编辑日程
      handleStroke(item) {
        this.dialogVisibleStroke = true
        this.editForm = {}
        if (JSON.stringify(item) != '{}') {
          this.InsScheduleInfo(item.code)
        }
      },
      //新增日程1
      submitUpFormStroke(item) {
        this.$refs[item].validate(valid => {
          if (valid) {
            this.loading = true
            const param = {
              "Resolution": this.resolutionToName(this.strokeForm.screenInfo),
              "BeginTime": this.strokeForm.time[0],
              "EndTime": this.strokeForm.time[1],
              "Devices": this.strokeForm.Devices,
            }

            console.log(param)
            this.AddInsSchedule(param)
          }
        })
      },
      //编辑
      handleEditStoke(item,type) {
        this.InsScheduleInfo({Code:item.code},type)
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
            this.EditInsSchedule(param)
          }
        })
      },
      //发布停止
      handlePublish(item) {
        const param = {
          Code: item.code,
          IsActivity: !item.isActivity
        }
        this.ChangeScheduleState(param)
      },
      //广告详情
      handleProgram(item) {
        this.dialogVisibleProgramDetail = true
        this.selectAbd = item
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
    margin-top: 5vh !important;
  }
</style>
<style scoped lang="scss">
  .demo-form-inline {

    .right-button {
      float: right;
    }
  }

  .page-div {
    margin-top: 40px;
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

  .overflow-div {
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .el-icon-info {
    margin-left: 10px;
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
