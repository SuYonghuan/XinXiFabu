<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="店铺名称">
        <el-input v-model="search.Name" placeholder="店铺名称"></el-input>
      </el-form-item>
      <el-form-item label="楼栋">
        <el-select v-model="search.BuildingCode" placeholder="请选择" @change="changeBuilding1()">
          <el-option v-for="item in buildingList" :label="item.name" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="楼层">
        <el-select v-model="search.FloorCode" placeholder="请选择">
          <el-option v-for="item in floorList" :label="item.name" :value="item.floorCode"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>
      <el-form-item class="right-button">
        <el-button type="success" @click="handleEdit({})" v-if="pageMenu.addOffice">新增租户</el-button>
        <el-button type="primary" @click="handleSysData()" :loading="loadingStatus">同步数据</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="name" label="公司名称"></el-table-column>
      <el-table-column prop="floorName" label="所属楼层"></el-table-column>
      <el-table-column prop="houseNum" label="门牌号"></el-table-column>
      <el-table-column prop="phone" label="联系方式"></el-table-column>
      <el-table-column label="启用状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isShow" @change="changeShow(scope.row)"
                     :disabled="!pageMenu.changeOfficeStatus"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editOffice">编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.delOffice">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange"></pagination>

    <!--  发布  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false"
               :before-close="handleClose" append-to-body>
      <el-form :label-width="'120px'" :model="editForm" :rules="rules" ref="editForm">
        <el-form-item label="公司名称" prop="name">
          <el-input type="text" v-model="editForm.name" class="" style="width: 40%" placeholder="请输入中文公司名称"></el-input>
          <el-input type="text" v-model="editForm.nameEn" style="width: 40%;margin-left: 10px;"
                    placeholder="请输入英文公司名称"></el-input>
        </el-form-item>
        <el-form-item label="所属楼栋楼层" prop="floorCode">
          <el-select v-model="editForm.buildingCode" placeholder="请选择楼栋" @change="changeBuilding()">
            <el-option v-for="item in buildingList" :label="item.name" :value="item.code"></el-option>
          </el-select>
          <el-select v-model="editForm.floorCode" style="margin-left: 10px;" placeholder="请选择楼层">
            <el-option v-for="item in floorList" :label="item.name" :value="item.floorCode"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门牌号" prop="houseNum">
          <el-input type="text" v-model="editForm.houseNum" class="" placeholder="请输入门牌号"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input type="text" v-model="editForm.phone" class="" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item label="营业时间" prop="businessHours">
          <el-input type="text" v-model="editForm.businessHours" class="" placeholder="请输入营业时间"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input type="textarea" style="width: 40%;" rows="5" v-model="editForm.intro"
                    placeholder="请输入中文简介"></el-input>
          <el-input type="textarea" style="width: 40%;margin-left: 10px;" rows="5"
                    v-model="editForm.introEn" placeholder="请输入英文简介"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	import pagination from 'components/pagination/pagination'
	import transferView from 'components/transfer-view/transfer-view'
	import {
		GetRolePermissions,
		PageOfficeList,
		GetBuildingList,
		GetFloorList,
		OfficeAdd,
		GetOfficeInfo,
		OfficeEdit,
		OfficeDel,
		ChangeOfficeStatus,
    GetSynData,
	} from 'http/api/mall'
	import {ERR_OK} from 'http/config'
	import {mapGetters} from 'vuex'

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
				dialogTitle: '新增',
				editForm: {
          floorCode: '',
        },
				tableChecked: [],
				deviceForm: {},
				rules: {
					name: [{required: true, message: '请输入楼栋名称', trigger: 'blur'}],
					floorCode: [{required: true, message: '请选择所属楼层', trigger: 'blur'}],
					houseNum: [{required: true, message: '请输入门牌号', trigger: 'blur'}],
				},
				building: [
					{label: '1栋', value: '1'},
					{label: '2栋', value: '2'}
				],
				imageUrl: '',
				pageMenu: {},
				buildingList: [],
				floorList: [],
        loadingStatus: false,
        loading: false,
			}
		},
		created() {
			this.GetRolePermissions()
			this.GetBuildingList()
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
			getList(pageSize, page) {
				const param = {
					"Name": this.search.Name,
					"FloorCode": this.search.FloorCode,
					"BuildingCode": this.search.BuildingCode,
					"ShopFormatCode": this.search.ShopFormatCode,
					"MallCode": this.user.mallCode,
					"UserName": this.user.accountName,
					"Paging": 1,
					"PageIndex": page,
					"PageSize": pageSize
				}
				PageOfficeList(param).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
						this.total = res.data.allCount
						// console.log(this.tableData)
					}
				})
			},
			GetBuildingList() {
				const param = {"MallCode": this.user.mallCode}
				GetBuildingList(param).then(res => {
					if (res.code === ERR_OK) {
						this.buildingList = res.data
					}
				})
			},
			GetFloorList(code) {
				const param = {
					"Code": code
				}
				GetFloorList(param).then(res => {
					if (res.code === ERR_OK) {
						this.floorList = res.data
					}
				})
			},
			OfficeAdd(param) {
				OfficeAdd(param).then(res => {
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
			OfficeEdit(param) {
				OfficeEdit(param).then(res => {
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
			GetOfficeInfo(code) {
				const param = {"code": code}
				GetOfficeInfo(param).then(res => {
					if (res.code === ERR_OK) {
						this.editForm = res.data
						this.GetFloorList(res.data.buildingCode)
					}
				})
			},
			OfficeDel(param) {
				OfficeDel(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList(this.pageSize, this.currentPage)
						return
					}
					this.$message.error(res.msg);
				})
			},
			ChangeOfficeStatus(param) {
				ChangeOfficeStatus(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList(this.pageSize, this.currentPage)
						return
					}
					this.$message.error(res.msg);
				})
			},
      GetSynData() {
        GetSynData({}).then(res => {
          this.loadingStatus = false
          if (res.code === ERR_OK) {
            this.$message.success(res.msg);
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
			//搜索
			onSearch() {
				this.currentPage = 1
				this.getList(this.pageSize, this.currentPage, this.search)
			},
			//重置搜索
			replaySearch() {
				this.search = {}
				this.currentPage = 1
				this.getList(this.pageSize, this.currentPage)
			},
			//打开弹窗
			handleEdit(item) {
				this.dialogVisible = true
				if (JSON.stringify(item) != '{}') {
					this.dialogTitle = '编辑'
					this.GetOfficeInfo(item.code)
				}
			},
			//关闭弹窗
			handleClose() {
				this.dialogVisible = false
				this.$refs["editForm"].resetFields()
				this.editForm = {}
				this.floorList = []
        this.loading = false
			},
			//提交
			submitUpForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
					  this.loading = true
						this.editForm.mallCode = this.user.mallCode
						if (this.editForm.code) {
							this.OfficeEdit(this.editForm)
							return
						}
						this.OfficeAdd(this.editForm)
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
					this.OfficeDel({"Code": item.code, "MallCode": this.user.mallCode})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
			//选中楼栋
			changeBuilding() {
				this.floorList = []
				this.editForm.floorCode = ''
				this.GetFloorList(this.editForm.buildingCode)
			},
			//选中楼栋
			changeBuilding1() {
				this.floorList = []
				this.GetFloorList(this.search.BuildingCode)
			},
			//修改启用状态
			changeShow(item) {
				const param = {
					"Code": item.code,
					"IsShow": item.isShow,
					"UserName": this.user.accountName,
					"MallCode": this.user.mallCode
				}
				this.ChangeOfficeStatus(param)
			},
      //同步数据
      handleSysData() {
        this.loadingStatus = true
        this.GetSynData()
      },
		},
		computed: {
			...mapGetters(['presentMenu', 'user', 'config'])
		},
		components: {
			pagination,
			transferView,
		},

	}
</script>

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

  .time-tag {
    margin: 2px;
    cursor: pointer;
  }
</style>
