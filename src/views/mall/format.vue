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
        <el-button type="success" @click="handleEdit({})" v-if="pageMenu.addformat">新增业态</el-button>
        <el-button type="danger" @click="batchDelete(tableChecked)" v-if="pageMenu.delformat">删除</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table :data="tableData" @selection-change="handleDeletion" style="width: 100%;margin-top: 20px;"
              height="620px">
      <el-table-column align="center" type="selection" width="60"></el-table-column>
      <el-table-column prop="name" label="业态名称"></el-table-column>
      <el-table-column prop="nameEn" label="业态英文"></el-table-column>
      <el-table-column prop="name" label="业态图标">
        <template slot-scope="scope">
          <img :src="scope.row.iconFilePath" v-if="scope.row.iconFilePath" style="height: 30px"
               @click="clickImg(scope.row.iconFilePath)" alt="">
        </template>
      </el-table-column>
      <el-table-column prop="name" label="关联店铺数量">
        <template slot-scope="scope">
          {{ scope.row.shopCount }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="子业态">
        <template slot-scope="scope">
          {{ scope.row.childCount }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="业态颜色">
        <template slot-scope="scope">
          <div class="color-div" :style="`background-color: ${scope.row.color}`"></div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="边框颜色">
        <template slot-scope="scope">
          <div class="color-div" :style="`background-color: ${scope.row.borderColor}`"></div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="修改时间">
        <template slot-scope="scope">{{ timestampToTime(scope.row.addTime) }}</template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" v-if="pageMenu.editformat">编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-if="pageMenu.delformat">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></pagination>

    <!--  图片放大  -->
    <div class="max-img" v-show="maxImg" @click="maxDiv">
      <img :src="maxImg" alt="">
    </div>

    <!--  发布  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :before-close="handleClose"
               append-to-body>
      <el-tabs type="border-card" v-model="tabDefa">
        <el-tab-pane label="父级业态" name="父级业态">
          <el-form :label-width="'120px'" :model="editForm" :rules="rules" ref="editForm">
            <el-form-item label="业态名称" prop="name">
              <el-input type="text" v-model="editForm.name" maxlength="8" placeholder="请输入业态名称"></el-input>
            </el-form-item>
            <el-form-item label="英文名称" prop="nameEn">
              <el-input type="text" v-model="editForm.nameEn" maxlength="24" placeholder="请输入业态英文名称"></el-input>
            </el-form-item>
            <el-form-item label="业态图标" prop="iconFile">
              <el-upload
                      class="avatar-uploader"
                      :action="config.fileUrl+config.yunUpdateFile"
                      :show-file-list="false"
                      :on-success="handleAvatarSuccess"
                      :before-upload="beforeAvatarUpload">
                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
            <el-form-item label="业态颜色" prop="color">
              <el-input type="text" v-model="editForm.color" style="width: 200px;top: -15px"
                        placeholder="请输入业态颜色"></el-input>
              <el-color-picker v-model="editForm.color"></el-color-picker>
            </el-form-item>
            <el-form-item label="边框颜色" prop="borderColor">
              <el-input type="text" v-model="editForm.borderColor" style="width: 200px;top: -15px"
                        placeholder="请输入边框颜色"></el-input>
              <el-color-picker v-model="editForm.borderColor"></el-color-picker>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="子级业态" name="子级业态">
          <el-form :label-width="'120px'" ref="childForm">
            <el-row :gutter="20" v-for="(item,index) of childForm">
              <el-col :span="10">
                <div class="grid-content bg-purple">
                  <el-form-item label="业态名称">
                    <el-input type="text" v-model="item.Name" ref="childName"  maxlength="8"
                              placeholder="请输入业态名称"></el-input>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :span="10">
                <div class="grid-content bg-purple">
                  <el-form-item label="英文名称">
                    <el-input type="text" v-model="item.NameEn" ref="childNameEn" maxlength="24"
                              placeholder="请输入业态英文名称"></el-input>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :span="3">
                <i class="del-i el-icon-close" @click="delChild(index)"></i>
              </el-col>
            </el-row>
          </el-form>
          <el-button type="success" style="width: 100%" @click="addChild">添加子业态</el-button>
        </el-tab-pane>
      </el-tabs>

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
	import {timeFormatting} from 'common/js/mixins'
	import {
		GetRolePermissions,
		GetShopFormatList,
		ShopFormatAdd,
		GetShopFormatInfo,
		EditFormat,
		ShopFormatDel,
	} from 'http/api/mall'
	import {ERR_OK} from 'http/config'
	import {mapGetters} from 'vuex'

	export default {
		name: "deptManager",
		mixins: [timeFormatting],
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
				childForm: [{Name: '', NameEn: ''}],
				tableChecked: [],
				deviceForm: {},
				rules: {
					name: [{required: true, message: '请输入业态名称', trigger: 'blur'}]
				},
				imageUrl: '',
				maxImg: '',
				childNum: 1,
				pageMenu: {},
				tabDefa: '父级业态',
        loading: false,
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
					"MallCode": this.user.mallCode,
          "Paging": 1,
          "PageIndex": page,
          "PageSize": pageSize
				}
				GetShopFormatList(param).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
            this.total = res.data.allCount
						// console.log(this.tableData)
					}
				})
			},
			GetShopFormatInfo(code) {
				const param = {
					"Code": code
				}
				GetShopFormatInfo(param).then(res => {
					if (res.code === ERR_OK) {
						this.editForm = res.data
						this.imageUrl = this.editForm.iconFilePath
						if (this.editForm.child.length > 0) {
							this.childForm = [];
							for (let i = 0; i < this.editForm.child.length; i++) {
								this.childForm.push({
									Code: this.editForm.child[i].code,
									Name: this.editForm.child[i].name,
									NameEn: this.editForm.child[i].nameEn
								})
							}
						}
					}
				})
			},
			ShopFormatAdd(param) {
				ShopFormatAdd(param).then(res => {
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
			EditFormat(param) {
				EditFormat(param).then(res => {
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
			ShopFormatDel(param) {
				ShopFormatDel(param).then(res => {
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
        this.currentPage = 1;
        this.pageSize = val;
        this.getList(this.pageSize, this.currentPage)
      },
			//打开弹窗
			handleEdit(item) {
				this.tabDefa = '父级业态'
				this.dialogVisible = true
				if (JSON.stringify(item) != '{}') {
					this.GetShopFormatInfo(item.code)
					this.dialogTitle = '编辑'
				}
			},
			//分配设备
			handleEditDevice() {
				this.dialogVisibleDevice = true
			},
			//关闭弹窗
			handleClose() {
				this.dialogVisible = false
				this.dialogVisibleDevice = false
				this.$refs["editForm"].resetFields()
				this.childNum = 1
				this.imageUrl = ''
				this.editForm = {}
				this.childForm = [{Name: '', NameEn: ''}]
        this.loading = false
			},
			//提交
			submitUpForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
					  this.loading = true
						//过滤空数据
						let child = []
						if (this.childForm.length > 0) {
							for (let i = 0; i < this.childForm.length; i++) {
								if (this.childForm[i].Name) {
									child.push(this.childForm[i])
								}
							}
						}
						const param = {
							"Parameter": {
								"Name": this.editForm.name,
								"NameEn": this.editForm.nameEn,
								"Color": this.editForm.color,
								"BorderColor": this.editForm.borderColor,
								"IconFile": this.editForm.iconFile,
								"Child": child,
								"MallCode": this.user.mallCode,
								"UserName": this.user.accountName
							}
						}

						if (this.editForm.code) {
							param.Parameter.code = this.editForm.code
							this.EditFormat(param)
							return
						}
						this.ShopFormatAdd(param)
					}
				})
			},
			//删除子业态
			delChild(index) {
				this.childForm.splice(index, 1)
			},
			//删除
			handleDelete(item) {
				this.$confirm("此操作将永久删除, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}).then(() => {
					const param = {
						"Codes": [item.code],
						"UserName": "saasyun",
						"MallCode": "b233c544-3d1d-4000-b2d1-1c3fef570079"
					}
					this.ShopFormatDel(param)
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
							"Codes": ids,
							"UserName": "saasyun",
							"MallCode": "b233c544-3d1d-4000-b2d1-1c3fef570079"
						}
						this.ShopFormatDel(param)
					}).catch(() => {
						this.$message({
							type: 'info',
							message: '已取消删除'
						});
					});
				}
			},
			//放大图片
			clickImg(item) {
				this.maxImg = item;
			},
			//关闭大图
			maxDiv(item) {
				this.maxImg = '';
			},
			//添加子业态
			addChild() {
				this.childForm.push({Name: '', NameEn: ''})
			},
			//上传图片
			handleAvatarSuccess(res, file) {
				if (res.code === '200') {
					this.imageUrl = URL.createObjectURL(file.raw);
					this.editForm.iconFile = res.data.fileGuid;
				} else {
					this.$message.error('上传失败!');
				}
			},
			beforeAvatarUpload(file) {
				const isLt2M = file.size / 1024 / 1024 < 10;
				const type = ['image/jpg', 'image/png', 'image/jpeg']

				if (type.indexOf(file.type) === -1) {
					this.$message.error('上传图片只能是 jpg、png格式!');
					return false
				}
				if (!isLt2M) {
					this.$message.error('上传图片大小不能超过 10MB!');
					return false
				}
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

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
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

  .time-tag {
    margin: 2px;
    cursor: pointer;
  }

  .max-img {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-height: 1080px;
      max-width: 1920px;
    }
  }

  .color-div {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .del-i {
    font-size: 20px;
    cursor: pointer;
    margin-top: 12px;
  }
</style>
