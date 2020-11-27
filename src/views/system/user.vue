<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item class="right-button">
        <el-button type="success" @click="handleAdd({})" v-if="pageMenu.addaccount">新增用户</el-button>
        <el-button type="danger" @click="batchDelete(tableChecked)" v-if="pageMenu.delaccount">删除</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table
            :data="tableData"
            @selection-change="handleDeletion"
            height="620px"
            style="width: 100%">
      <el-table-column align="center" type="selection" width="60">
      </el-table-column>
      <el-table-column prop="accountName" label="用户名"></el-table-column>
      <el-table-column prop="nickName" label="姓名"></el-table-column>
      <el-table-column prop="roleName" label="所属角色"></el-table-column>
      <el-table-column prop="addTime" label="创建时间">
        <template slot-scope="scope">
          {{timestampToTime(scope.row.addTime)}}
        </template>
      </el-table-column>
      <el-table-column prop="deptName" label="所属部门"></el-table-column>
      <el-table-column label="邮件报警">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.warning" @change="warningEmail(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="是否锁定">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isLock" v-if="pageMenu.unLockUser" @change="lockUser(scope.row)" :disabled="scope.row.roleName == '超级管理员'"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240px">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editaccount" :disabled="scope.row.roleName == '超级管理员'">编辑
          </el-button>
          <el-button type="warning" size="small" @click="handleEditPsd(scope.row)" v-if="pageMenu.changepwd" :disabled="scope.row.roleName == '超级管理员'">修改密码
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.delaccount" :disabled="scope.row.roleName == '超级管理员'">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></pagination>

    <!--  新增  -->
    <el-dialog title="新增" :visible.sync="dialogVisible" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" append-to-body>
      <el-form :label-width="formLabelWidth" :model="addForm" :rules="rules" ref="addForm">
        <el-form-item label="用户名" prop="accountName">
          <el-input type="text" v-model="addForm.accountName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="small" v-model="addForm.password" auto-complete="off" placeholder="请输入至少6位字符"
                    show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="passagin">
          <el-input size="small" v-model="addForm.passagin" auto-complete="off" placeholder="请保持密码一致"
                    show-password></el-input>
        </el-form-item>
        <el-form-item label="真实名" prop="nickName">
          <el-input size="small" v-model="addForm.nickName" auto-complete="off"
                    placeholder="请输入正确的姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input size="small" v-model="addForm.phone" auto-complete="off"
                    placeholder="请输入正确的手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="addForm.email" auto-complete="off"
                    placeholder="请输入正确的邮箱"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="deptCode">
          <el-select v-model="addForm.deptCode" placeholder="选择部门">
            <el-option v-for="item in deptList" :label="item.name" :value="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleCode">
          <el-select v-model="addForm.roleCode" placeholder="选择角色">
            <el-option v-for="item in roleList" :label="item.name" :value="item.code"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('addForm')">取 消</el-button>
        <el-button type="primary" @click="submitAdForm('addForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  编辑  -->
    <el-dialog title="编辑" :visible.sync="dialogVisibleUpdate" width="50%" :before-close="handleClose"
               :close-on-click-modal="false"
               append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" :rules="editRules" ref="editForm">
        <el-form-item label="用户名" prop="accountName">
          <el-input type="text" v-model="editForm.accountName" :disabled="true" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="真实名" prop="nickName">
          <el-input size="small" v-model="editForm.nickName" auto-complete="off"
                    placeholder="请输入正确的姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input size="small" v-model="editForm.phone" auto-complete="off"
                    placeholder="请输入正确的手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="editForm.email" auto-complete="off"
                    placeholder="请输入正确的邮箱"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="deptCode">
          <el-select v-model="editForm.deptCode" placeholder="选择部门">
            <el-option v-for="item in deptList" :label="item.name" :value="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleCode">
          <el-select v-model="editForm.roleCode" placeholder="选择角色">
            <el-option v-for="item in roleList" :label="item.name" :value="item.code"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>

    <!--  修改密码  -->
    <el-dialog title="修改密码" :visible.sync="dialogVisiblePsd" width="50%" :before-close="handleClose"
               :close-on-click-modal="false" append-to-body>
      <el-form :label-width="formLabelWidth" :model="editForm" :rules="pwdRules" ref="pwdForm">
        <el-form-item label="密码" prop="password">
          <el-input size="small" v-model="editForm.password" auto-complete="off"
                    placeholder="请输入至少6位字符"
                    show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="passagin">
          <el-input size="small" v-model="editForm.passagin" auto-complete="off" placeholder="请保持密码一致"
                    show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('pwdForm')">取 消</el-button>
        <el-button type="primary" @click="submitPwdForm('pwdForm')" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	import pagination from 'components/pagination/pagination'
	import {
		GetUserList,
		GetRolePermissions,
		addUser,
		editUser,
		delUser,
		getDeptList,
		GetUserRolesList,
		UnLockUser,
		SetWarningUser,
		ChangePassWord,
	} from 'http/api/system'
	import {ERR_OK} from 'http/config'
	import {mapGetters} from 'vuex'
	import {timeFormatting} from 'common/js/mixins'

	export default {
		name: "deptManager",
		mixins: [timeFormatting],
		data() {
			let validatePass2 = (rule, value, callback) => {
				if (value === "") {
					callback(new Error("请再次输入密码"));
				} else if (value !== this.ruleForm.pass) {
					callback(new Error("两次输入密码不一致!"));
				} else {
					callback();
				}
			};
			const UserRegular = (rule, value, callback) => {
				const reg = /^[a-zA-Z0-9_-]{6,18}$/;
				if (value && value != "") {
					if (!reg.test(value)) {
						callback(new Error("无效的用户名"));
					} else {
						callback();
					}
				} else {
					callback(new Error("账号不得为空"));
				}
			};
			const PassRegular = (rule, value, callback) => {
				if (value && value != "") {
					if (value.length < 6) {
						callback(
							new Error("请输入至少6位字符")
						);
					} else {
						callback();
					}
				} else {
					callback(
						new Error("请输入至少6位字符")
					);
				}
			};
			const AgainRegular = (rule, value, callback) => {
				const reg = this.addForm.password;
				if (value && value != "") {
					if (value != reg) {
						callback(new Error("两次密码输入不一致"));
					} else {
						callback();
					}
				} else {
					callback(new Error("确认密码不得为空"));
				}
			};
			const AgainRegular2 = (rule, value, callback) => {
				const reg = this.editForm.password;
				if (value && value != "") {
					if (value != reg) {
						callback(new Error("两次密码输入不一致"));
					} else {
						callback();
					}
				} else {
					callback(new Error("确认密码不得为空"));
				}
			};
			const PhoneRegular = (rule, value, callback) => {
				const reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/;
				if (value && value != "") {
					if (!reg.test(value)) {
						callback(new Error("手机号格式不正确"));
					} else {
						callback();
					}
				} else {
					callback(new Error("输入正确的手机号"));
				}
			};
			const emailRegular = (rule, value, callback) => {
				const reg = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
				if (value && value != "") {
					if (!reg.test(value)) {
						callback(new Error("邮箱错误"));
					} else {
						callback();
					}
				} else {
					callback(new Error("输入正确的邮箱"));
				}
			};
			const zuzhiRegular = (rule, value, callback) => {
				if (this.manager == "") {
					callback(new Error("请选择子组织"));
				} else {
					callback();
				}
			};
			return {
				search: {},
				tableData: [],
				total: 0,
				currentPage: 0,
				pageSize: 10,
				dialogVisible: false,
				dialogTitle: '新增',
				addForm: {},
				editForm: {},
				formLabelWidth: "120px",
				rules: {
					accountName: [{required: true, validator: UserRegular, trigger: "blur"}],
					password: [{required: true, validator: PassRegular, trigger: "blur"}],
					passagin: [{required: true, validator: AgainRegular, trigger: "blur"}],
					roleCode: [{required: true, message: "请选择角色类别", trigger: "change"}],
					nickName: [{required: true, message: "请输入正确的姓名", trigger: "blur"}],
					phone: [{required: true, message: "输入正确的手机号", validator: PhoneRegular, trigger: "blur"}],
					email: [{required: true, validator: emailRegular, trigger: "blur"}],
				},
				editRules: {
					accountName: [{required: true, validator: UserRegular, trigger: "blur"}],
					roleCode: [{required: true, message: "请选择角色类别", trigger: "change"}],
					nickName: [{required: true, message: "请输入正确的姓名", trigger: "blur"}],
					phone: [{required: true, message: "输入正确的手机号", validator: PhoneRegular, trigger: "blur"}],
					email: [{required: true, validator: emailRegular, trigger: "blur"}],
				},
				pwdRules: {
					password: [{required: true, validator: PassRegular, trigger: "blur"}],
					passagin: [{required: true, validator: AgainRegular2, trigger: "blur"}],
				},
				tableChecked: [],
				dialogVisibleUpdate: false,
				dialogVisiblePsd: false,
				pageMenu: {},
				deptList: [],
				roleList: [],
				switchData: [],
        loading: false,
			}
		},
		created() {
			this.GetRolePermissions()
			this.getDeptList()
			this.GetUserRolesList()
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
						this.getList(this.currentPage, this.pageSize)
						// console.log(this.pageMenu)
					}
				})
			},
			getList(page, pageSize) {
				const param = {
          PageIndex: page,
          PageSize: pageSize,
          "Paging": 1
        }
				GetUserList(param).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
            this.total = res.data.allCount
						for (let i = 0; i < this.tableData.length; i++) {
							this.tableData[i].warning = this.tableData[i].status == 1 ? true : false;
						}
						// console.log(this.tableData)
					}
				})
			},
			getDeptList() {
				const param = {
					"KeyWord": "",
					"Paging": 0
				}
				getDeptList(param).then(res => {
					if (res.code === ERR_OK) {
						this.deptList = res.data
						// console.log(res.data)
					}
				})
			},
			GetUserRolesList() {
				const param = {}
				GetUserRolesList(param).then(res => {
					if (res.code === ERR_OK) {
						this.roleList = res.data
						// console.log(res.data)
					}
				})
			},
			addUser(param) {
				addUser(param).then(res => {
          this.loading = false
					if (res.code === ERR_OK) {
						this.handleClose()
						this.$message.success(res.msg);
						this.getList(this.currentPage, this.pageSize)
						return
					}
					this.$message.error(res.msg);
				})
			},
			editUser(param) {
				editUser(param).then(res => {
          this.loading = false
					if (res.code === ERR_OK) {
						this.handleClose()
						this.$message.success(res.msg);
						this.getList(this.currentPage, this.pageSize)
						return
					}
					this.$message.error(res.msg);
				})
			},
			delUser(param) {
				delUser(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList(this.currentPage, this.pageSize)
						return
					}
					this.$message.error(res.msg);
				})
			},
			UnLockUser(param,item) {
				UnLockUser(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList(this.currentPage, this.pageSize)
						return
					}
					item.isLock = false
					this.$message.error(res.msg);
				})
			},
			SetWarningUser(param) {
				SetWarningUser(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.getList(this.currentPage, this.pageSize)
						return
					}
					this.$message.error(res.msg);
				})
			},
			ChangePassWord(param) {
				ChangePassWord(param).then(res => {
          this.loading = false
					if (res.code === ERR_OK) {
						this.handleClose()
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
        this.getList(val, this.pageSize)
      },
      //每页数量
      handleSizeChange(val) {
        this.currentPage = 1;
        this.pageSize = val;
        this.getList(this.currentPage, this.pageSize)
      },
			//时间转换
			timestampToTime(item) {
				return this.dateFormat('yyyy-mm-dd hh:ii:ss', new Date(item))
			},
			//打开弹窗
			handleAdd(item) {
				this.dialogVisible = true
			},
			//打开编辑弹窗
			handleEdit(item) {
				this.editForm = JSON.parse(JSON.stringify(item));
				this.dialogVisibleUpdate = true
			},
			//打开修改密码弹窗
			handleEditPsd(item) {
				this.editForm = JSON.parse(JSON.stringify(item));
				this.dialogVisiblePsd = true
			},
			//关闭弹窗
			handleClose() {
				this.editForm = {}
				this.addForm = {}
				this.dialogVisible = false
				this.dialogVisibleUpdate = false
				this.dialogVisiblePsd = false
				this.$refs["editForm"] && this.$refs["editForm"].resetFields()
				this.$refs["addForm"] && this.$refs["addForm"].resetFields()
				this.$refs["pwdForm"] && this.$refs["pwdForm"].resetFields()
        this.loading = false
			},
			//新增
			submitAdForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
            this.loading = true
						const param = {
							AccountName: this.addForm.accountName,
							Password: this.addForm.password,
							ConfirmPassword: this.addForm.passagin,
							DeptCode: this.addForm.deptCode,
							RoleCode: this.addForm.roleCode,
							NickName: this.addForm.nickName,
							Phone: this.addForm.phone,
							Email: this.addForm.email
						}
						this.addUser(param)
					}
				})
			},
			//编辑
			submitUpForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
            this.loading = true
						const param = {
							Code: this.editForm.code,
							AccountName: this.editForm.accountName,
							DeptCode: this.editForm.deptCode,
							RoleCode: this.editForm.roleCode,
							NickName: this.editForm.nickName,
							Phone: this.editForm.phone,
							Email: this.editForm.email
						}
						this.editUser(param)
					}
				})
			},
			//修改密码
			submitPwdForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
            this.loading = true
						const param = {
							UserCode: this.editForm.code,
							AccountName: this.editForm.accountName,
							Password: this.editForm.password,
							ConfirmPassword: this.editForm.passagin,
						}
						console.log(param.DeptCode, 333)
						this.ChangePassWord(param)
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
						Codes: [item.code]
					}
					this.delUser(param)
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
						this.delUser(param)
					}).catch(() => {
						this.$message({
							type: 'info',
							message: '已取消删除'
						});
					});
				}
			},
			//邮件警报
			warningEmail(item) {
				const param = {
					"Code": item.code,
					"Status": item.warning ? 1 : 0
				}
				this.SetWarningUser(param)
			},
			//锁定用户
			lockUser(item) {
				const param = {
					"UserCode": item.code
				}
				this.UnLockUser(param,item)
			},
		},
		computed: {
			...mapGetters(['presentMenu'])
		},
		components: {
			pagination,
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
    margin-top: 40px;
  }
</style>
