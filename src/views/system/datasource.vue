<template>
  <div class="password-content">
    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
			<el-form :model="paramJson" :label-width="'120px'" :rules="rules" ref="editForm">
				<div class="content-p">
					<span class="left-span">数据来源</span>
					<div class="right-div">
						<el-radio v-model="source" label="MallCoo">猫酷</el-radio>
						<el-radio v-model="source" label="QianMu">自主维护</el-radio>
					</div>
				</div>
				<el-divider></el-divider>
				<div v-show="source === 'MallCoo'">
					<el-form-item label="AppId" prop="appID">
						<el-input style="width: 500px;" v-model="paramJson.appID" placeholder="请输入AppId"></el-input>
					</el-form-item>
					<el-form-item label="PublicKey" prop="publicKey">
						<el-input style="width: 500px;" v-model="paramJson.publicKey" placeholder="请输入AppId"></el-input>
					</el-form-item>
					<el-form-item label="PrivateKey" prop="privateKey">
						<el-input style="width: 500px;" v-model="paramJson.privateKey" placeholder="请输入AppId"></el-input>
					</el-form-item>
					<el-form-item label="MallId" prop="mallId">
						<el-input style="width: 500px;" v-model="paramJson.mallId" placeholder="请输入AppId"></el-input>
					</el-form-item>
					<el-form-item label="Url" prop="url">
						<el-input style="width: 500px;" v-model="paramJson.url" placeholder="请输入AppId"></el-input>
					</el-form-item>
					
				</div>
				
				<p>
					<el-button type="primary" size="small" @click="clickSubmit('editForm')">保存</el-button>
				</p>
			</el-form>
    </el-card>
  </div>
</template>

<script>
	import {
		GetSourceInfo,
		SetSourceInfo,
	} from 'http/api/system'
	import {ERR_OK} from 'http/config'

	export default {
		name: "password",
		data() {
			return {
				source: 'QianMu',
				paramJson: {
					appID: '',
					url: '',
					publicKey: '',
					privateKey: '',
					mallId: '',
				},
				rules: {},
				showForm: true,
			}
		},
		created() {
			this.getList()
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			getList() {
				const param = {}
				GetSourceInfo(param).then(res => {
					if (res.code === ERR_OK) {
						this.source = res.data.source
						if ( res.data.paramsJson.appID ) {
							this.paramJson = res.data.paramsJson
						} else {
							this.paramJson = {
								appID: '',
								url: '',
								publicKey: '',
								privateKey: '',
								mallId: '',
							}
						}
						console.log(this.paramJson)
					}
				})
			},
			SetSourceInfo(param) {
				SetSourceInfo(param).then(res => {
					if (res.code === ERR_OK) {
						this.getList()
						this.$message.success(res.msg);
						return
					}
					this.$message.error(res.msg);
				})
			},
			/**
			 * End
			 */
			clickSubmit(item) {
				this.$refs[item].validate(valid => {
					console.log(valid)
					if (valid) {
						let param = {
							source: this.source,
							paramsJson: {
								appID: this.paramJson.appID,
								url: this.paramJson.url,
								publicKey: this.paramJson.publicKey,
								privateKey: this.paramJson.privateKey,
								mallId: this.paramJson.mallId
							}
						}
						// if ( this.source === 'MallCoo' ) {
						// 	param.paramsJson.appID = this.paramJson.appID;
						// 	param.paramsJson.url = this.paramJson.url;
						// 	param.paramsJson.publicKey = this.paramJson.publicKey;
						// 	param.paramsJson.privateKey = this.paramJson.privateKey;
						// 	param.paramsJson.mallId = this.paramJson.mallId;
						// }
						this.SetSourceInfo(param)
					}
				})
			},
		},
		watch: {
			source(val) {
				if ( val === 'MallCoo' ) {
					this.rules = {
						appID: [{required: true, message: '请输入appID', trigger: "blur"}],
						url: [{required: true, validator: '请输入url', trigger: "blur"}],
						publicKey: [{required: true, validator: '请输入publicKey', trigger: "blur"}],
						privateKey: [{required: true, validator: '请输入privateKey', trigger: "blur"}],
						mallId: [{required: true, validator: '请输入mallId', trigger: "blur"}]
					}
				} else {
					this.rules = {}
				}
				
			}
		},
	}
</script>

<style scoped lang="scss">
  .box-card {
    margin-top: 40px;

    .content-p {
      height: 20px;
      line-height: 20px;
      display: flex;
			.left-span{
				width: 200px;
			}
			.right-div{
				display: flex;
				align-items: center;
			}
    }

    
  }
</style>
