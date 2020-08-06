<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item class="right-button">
        <el-button type="info" @click="handleEdit({})" v-if="pageMenu.addbuild">新增楼栋</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table :data="tableData" style="width: 100%;margin-top: 20px;" max-height="620">
      <el-table-column prop="name" label="楼栋名称"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editbuild">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.delbuild">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  发布  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :before-close="handleClose"
               append-to-body>
      <el-form :label-width="'120px'" :model="editForm" :rules="rules" ref="editForm">
        <el-form-item label="楼栋名称" prop="name">
          <el-input type="text" v-model="editForm.name" placeholder="请输入楼栋名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	import pagination from 'components/pagination/pagination'
	import transferView from 'components/transfer-view/transfer-view'
	import {
		GetRolePermissions,
		GetBuildingList,
		AddBuilding,
		EditBuilding,
		DelBuilding,
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
				dialogVisibleDevice: false,
				dialogTitle: '新增',
				editForm: {},
				tableChecked: [],
				deviceForm: {},
				rules: {
					name: [{required: true, message: '请输入楼栋名称', trigger: 'blur'}]
				},
				pageMenu: {},
			}
		},
		created() {
			this.GetRolePermissions()
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
					"UserName": this.user.accountName,
					"MallCode": this.user.mallCode,
					"Paging": "0",
					"PageIndex": "",
					"PageSize": ""
				}
				GetBuildingList(param).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data
					}
				})
			},
			AddBuilding(param) {
				AddBuilding(param).then(res => {
					if (res.code === ERR_OK) {
						this.handleClose()
						this.$message.success(res.msg);
						this.getList()
						return
					}
					this.$message.error(res.msg);
				})
			},
			EditBuilding(param) {
				EditBuilding(param).then(res => {
					if (res.code === ERR_OK) {
						this.handleClose()
						this.$message.success(res.msg);
						this.getList()
						return
					}
					this.$message.error(res.msg);
				})
			},
			DelBuilding(param) {
				DelBuilding(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList()
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
			//打开弹窗
			handleEdit(item) {
				this.dialogVisible = true
				if (JSON.stringify(item) != '{}') {
					this.editForm = JSON.parse(JSON.stringify(item))
					this.dialogTitle = '编辑'
				}
			},
			//关闭弹窗
			handleClose() {
				this.dialogVisible = false
				this.dialogVisibleDevice = false
				this.$refs["editForm"].resetFields()
				this.editForm = {}
			},
			//提交
			submitUpForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
						const param = {
							"BuildingName": this.editForm.name,
							"MallCode": this.user.mallCode,
							"UserName": this.user.accountName
						}
						if (this.editForm.code) {
							param.BuildingCode = this.editForm.code
							this.EditBuilding(param)
							return
						}
						this.AddBuilding(param)
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
						"Code": [item.code],
						"MallCode": this.user.mallCode,
						"UserName": this.user.accountName
					}
					this.DelBuilding(param)
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
		},
		computed: {
			...mapGetters(['presentMenu', 'user'])
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
    margin-top: 80px;
  }

  .time-tag {
    margin: 2px;
    cursor: pointer;
  }
</style>
