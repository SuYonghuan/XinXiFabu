<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>设备管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="组名称">
        <el-input v-model="search.SearchKey" placeholder="组名称"></el-input>
      </el-form-item>
      <el-form-item label="屏幕属性">
        <el-select v-model="search.ScreenInfoCode" placeholder="屏幕属性">
          <el-option
                  v-for="item in searchDeviceList"
                  :label="item.sName"
                  :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item label="组名称排序">-->
        <!--<el-select v-model="search.NameOrder" @change="changSelect(1)" placeholder="组名称排序">-->
          <!--<el-option-->
                  <!--v-for="item in sort"-->
                  <!--:label="item.label"-->
                  <!--:value="item.value">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="设备数量排序">-->
        <!--<el-select v-model="search.Order" @change="changSelect(2)" placeholder="设备数量排序">-->
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
        <el-button type="success" @click="handleEditDevice({})" v-if="pageMenu.adddevgroup">新增组</el-button>
        <el-button type="danger" @click="batchDelete(tableChecked)" v-if="pageMenu.deldevgroup">删除</el-button>
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
      <el-table-column prop="gName" label="组名称" width="360px" column-key="NameOrder" :filters=sort :filter-multiple="false"></el-table-column>
      <el-table-column prop="sName" label="屏幕属性" width="160px"></el-table-column>
      <el-table-column prop="typeStr" label="类型" width="60px"></el-table-column>
      <el-table-column label="设备数量" width="100px" column-key="Order" :filters=sort :filter-multiple="false">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleEdit(scope.row)">{{scope.row.devCount}}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="包含节目组" width="100px">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleEditGroup(scope.row)">{{scope.row.pgCount}}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="founderName" label="创建用户"></el-table-column>
      <el-table-column prop="addTime" label="创建时间">
        <template slot-scope="scope">
          {{timestampToTime(scope.row.addTime)}}
        </template>
      </el-table-column>
      <el-table-column prop="updateUserName" label="更新用户"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template slot-scope="scope">
          {{timestampToTime(scope.row.updateTime)}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditDevice(scope.row)" v-if="pageMenu.updatedevgroup">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.deldevgroup">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-tooltip placement="bottom" class="tip-div">
      <div slot="content">同步组内可选择的设备都是已被标为可同步的设备，这些设备上的节目将同步播放。<br/>正常组内的设备可以存在在多个组中，节目也不一定会同步播放。</div>
      <i class="el-icon-info"></i>
    </el-tooltip>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange"></pagination>

    <!--  编辑新增  -->
    <el-dialog title="分配设备" :visible.sync="dialogVisibleDevice" width="80%" :before-close="handleClose" append-to-body
               class="dialog">
      <el-form :label-width="formLabelWidth" :model="deviceForm" :rules="rules" ref="editForm">
        <el-form-item label="设备组名称" prop="gName">
          <el-input type="text" v-model="deviceForm.gName" placeholder="请输入设备组名称"></el-input>
        </el-form-item>
        <el-form-item label="分辨率" prop="name">
          <el-select v-model="deviceForm.screenInfoCode" :disabled="dialogType" @change="changeDevice"
                     placeholder="屏幕属性">
            <el-option
                    v-for="item in searchDeviceList"
                    :label="item.sName"
                    :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组类型" prop="name">
          <el-checkbox v-model="deviceForm.isSync" :disabled="dialogType" @change="changeDevice">多屏同步组
          </el-checkbox>
          <el-tooltip placement="bottom">
            <div slot="content">同步组内可选择的设备都是已被标为可同步的设备，这些设备上的节目将同步播放。<br/>正常组内的设备可以存在在多个组中，节目也不一定会同步播放。</div>
            <i class="el-icon-info" style="margin-left: 10px"></i>
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

    <!--  设备数量详情  -->
    <el-dialog title="设备数量详情" :visible.sync="dialogVisible" width="50%" :before-close="handleClose" append-to-body>
      <el-table :data="deviceList" style="width: 100%">
        <el-table-column prop="devNum" label="设备名称"></el-table-column>
        <el-table-column prop="ip" label="IP地址"></el-table-column>
        <el-table-column prop="floor" label="楼层"></el-table-column>
        <el-table-column label="设备状态">
          <template slot-scope="scope">
            <el-tag type="success" v-show="scope.row.deviceOnline">在线</el-tag>
            <el-tag type="danger" v-show="!scope.row.deviceOnline">离线</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!--  节目组详情  -->
    <el-dialog title="节目组详情" :visible.sync="dialogVisibleGroup" width="50%" :before-close="handleClose" append-to-body>
      <el-button type="danger" style="float: right" @click="batchDeleteGroup(tableCheckedGroup)">批量删除</el-button>
      <el-table :data="programList" @selection-change="handleDeletionGroup" style="width: 100%">
        <el-table-column align="center" type="selection" width="60"></el-table-column>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.programList" style="width: 100%">
              <el-table-column prop="programName" label="文件名"></el-table-column>
              <el-table-column prop="fileType" label="类型"></el-table-column>
              <el-table-column prop="switchTime" label="时间"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="组名称" prop="groupName"></el-table-column>
        <el-table-column label="节目数量">
          <template slot-scope="scope">
            {{ scope.row.programList.length }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="handleDeleteGroup(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
	import pagination from 'components/pagination/pagination'
	import transferView from 'components/transfer-view/transfer-view'
	import {
		GetDevGroupList,
		GetDeviceOptionsNew,
		GetRolePermissions,
		GetDeviceByGroupCode,
		AddDeviceGroup,
		GetGroupInfo,
		UpdateGroupInfo,
		DelDeviceGroup,
		GetDeviceListByGroupCode,
		GetProgramGroupByDeviceGroup,
		DelProgramDevice,
	} from 'http/api/device'
	import {ERR_OK} from 'http/config'
	import {mapGetters} from 'vuex'
	import {timeFormatting} from 'common/js/mixins'

	export default {
		name: "deptManager",
		mixins: [timeFormatting],
		data() {
			return {
				search: {
					"SearchKey": '',
					"Order": '',
					"NameOrder": '',
					"ScreenInfoCode": ''
				},
				tableData: [],
				total: 0,
				currentPage: 0,
				pageSize: 10,
				dialogVisible: false,
				dialogVisibleDevice: false,
				dialogVisibleGroup: false,
				dialogTitle: '新增',
				editForm: {},
				formLabelWidth: "120px",
				rules: {
					gName: [{required: true, message: '请输入设备组名称', trigger: 'blur'}]
				},
				tableChecked: [],
				tableCheckedGroup: [],
				deviceForm: {gName: '', screenInfoCode: '', isSync: false},
				staffList: {includeDevice: [], unIncludeDevice: []},
				selectedStaffList: [],
				sort: [
					{text: '升序', value: 'ASC'},
					{text: '降序', value: 'Desc'}
				],
				pageMenu: [],
				searchDeviceList: [],
				transferStatus: true,
				dialogType: false,
				deviceList: [],
				programList: [],
				groupCode: '',
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
			GetDeviceByGroupCode(GroupCode, ScreenCode, IsSyn) {
				const param = {
					"GroupCode": GroupCode,
					"ScreenCode": ScreenCode,
					"IsSyn": IsSyn
				}
				GetDeviceByGroupCode(param).then(res => {
					if (res.code === ERR_OK) {
						this.staffList.includeDevice = res.data.groupDevice
						this.staffList.unIncludeDevice = res.data.unGroupDevice
						this.selectedStaffList = res.data.groupDevice
						// console.log(this.staffList)
					}
				})
			},
			getList(pageSize, page) {
				const param = {
					"SearchKey": this.search.SearchKey,
					"Order": this.search.Order,
					"NameOrder": this.search.NameOrder,
					"ScreenInfoCode": this.search.ScreenInfoCode,
					"Paging": 1,
					"PageIndex": page,
					"PageSize": pageSize
				}
				GetDevGroupList(param).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
						this.total = res.data.allCount
						// console.log(this.tableData)
					}
				})
			},
			AddDeviceGroup(param) {
				AddDeviceGroup(param).then(res => {
					if (res.code === ERR_OK) {
						this.handleClose()
						this.$message.success(res.msg);
						this.getList(this.pageSize, this.currentPage)
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
						this.getList(this.pageSize, this.currentPage)
						return
					}
					this.$message.error(res.msg);
				})
			},
			DelDeviceGroup(param) {
				DelDeviceGroup(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList(this.pageSize, this.currentPage)
						return
					}
					this.$message.error(res.msg);
				})
			},
			DelProgramDevice(param) {
				DelProgramDevice(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.GetProgramGroupByDeviceGroup(this.groupCode);
						this.getList(this.pageSize, this.currentPage)
						return
					}
					this.$message.error(res.msg);
				})
			},
			GetGroupInfo(code) {
				const param = {"Code": code}
				GetGroupInfo(param).then(res => {
					if (res.code === ERR_OK) {
						this.deviceForm = res.data
						this.deviceForm.code = code
						this.GetDeviceByGroupCode(code, this.deviceForm.screenInfoCode, this.deviceForm.isSync)
					}
				})
			},
			GetDeviceListByGroupCode(code) {
				const param = {
					"GroupCode": code,
					"ScreenCode": "",
					"BuildingCode": "",
					"FloorCode": "",
					"OrderBy": "",
					"Paging": 0,
					"PageIndex": 1,
					"PageSize": 100
				}
				GetDeviceListByGroupCode(param).then(res => {
					if (res.code === ERR_OK) {
						this.deviceList = res.data
						// console.log(this.deviceList)
					}
				})
			},
			GetProgramGroupByDeviceGroup(code) {
				const param = {"Code": code}
				GetProgramGroupByDeviceGroup(param).then(res => {
					if (res.code === ERR_OK) {
						this.programList = res.data
					}
				})
			},
			/**
			 * End
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
			//搜索
			onSearch() {
				this.currentPage = 1
				this.getList(this.pageSize, this.currentPage, this.search)
			},
			//重置搜索
			replaySearch() {
				this.search = {
					"SearchKey": '',
					"Order": '',
					"NameOrder": '',
					"ScreenInfoCode": ''
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
				this.GetDeviceListByGroupCode(item.code)
			},
			//分配设备
			handleEditDevice(item) {
				this.dialogVisibleDevice = true
				this.transferStatus = true
				this.dialogType = false
				if (JSON.stringify(item) != '{}') {
					this.GetGroupInfo(item.code)
					this.dialogTitle = '编辑'
					this.dialogType = true
				} else {
					this.deviceForm.gName = this.dateFormat("y-m-d h:i:s") + ' 新建节目组'
					this.deviceForm.screenInfoCode = this.searchDeviceList[0].code
					this.deviceForm.isSync = false
					this.GetDeviceByGroupCode('', this.deviceForm.screenInfoCode, this.deviceForm.isSync)
				}
			},
			//点击搜索设备
			changeDevice() {
				this.GetDeviceByGroupCode('', this.deviceForm.screenInfoCode, this.deviceForm.isSync)
				this.transferStatus = false;
				this.$nextTick(() => {
					this.transferStatus = true;
				})
			},
			//分配设备
			handleEditGroup(item) {
				this.dialogVisibleGroup = true
				this.groupCode = item.code
				this.GetProgramGroupByDeviceGroup(this.groupCode);
			},
			//关闭弹窗
			handleClose() {
				this.dialogVisible = false
				this.dialogVisibleDevice = false
				this.dialogVisibleGroup = false
				this.$refs["editForm"] && this.$refs["editForm"].resetFields()
				this.transferStatus = false
			},
			//删除
			handleDelete(item) {
				this.$confirm("此操作将永久删除, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}).then(() => {
					const param = {
						Codes: [item.code]
					}
					this.DelDeviceGroup(param)
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
						this.DelDeviceGroup(param)
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
				let ids = []
				if (this.selectedStaffList.length > 0) {
					for (let i = 0; i < this.selectedStaffList.length; i++) {
						ids.push(this.selectedStaffList[i].code)
					}
				}
				const param = {
					"GName": this.deviceForm.gName,
					"ScreenInfoCode": this.deviceForm.screenInfoCode,
					"Devices": ids,
					"IsSync": this.deviceForm.isSync
				}

				if (this.deviceForm.code) {
					param.Code = this.deviceForm.code
					this.UpdateGroupInfo(param)
					return
				}
				this.AddDeviceGroup(param)
			},
			//获取选中值
			changeTransfer(item) {
				this.selectedStaffList = item
			},

			/**
			 * 节目组操作
			 * @param item
			 */
			//删除
			handleDeleteGroup(item) {
				this.$confirm("此操作将永久删除, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}).then(() => {
					const param = {
						ProgramGroupCodes: [item.programDeviceCode]
					}
					this.DelProgramDevice(param)
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
			//批量删除
			handleDeletionGroup(val) {
				this.tableCheckedGroup = val
			},
			//获取用户的选中
			batchDeleteGroup(row) {
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
							ids.push(row[i].programDeviceCode)
						}
						const param = {
							ProgramGroupCodes: ids
						}
						this.DelProgramDevice(param)
					}).catch(() => {
						this.$message({
							type: 'info',
							message: '已取消删除'
						});
					});
				}
			},
      //排序置空
			changSelect(type) {
				if (type == 2) {
					this.search.NameOrder = ''
					return
				}
				this.search.Order = ''
			},
		},
		computed: {
			...mapGetters(['presentMenu'])
		},
		components: {
			pagination,
			transferView,
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
    margin-top: 20px;
  }

  .tip-div {
    position: absolute;
    top: 234px;
    left: 700px;
  }
</style>
