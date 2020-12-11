<template>
  <div class="login-wrap">
    <div class="login-page">
      <div class="left-tab">
      </div>
      <el-form
              label-position="left"
              :model="ruleForm"
              :rules="rules"
              ref="ruleForm"
              label-width="0px"
              class="demo-ruleForm login-container"
      >
        <h3 class="title"></h3>
        <div class="tab_change">
          <h2 class="logo_txt"><span>登录</span><b>SIGN IN</b></h2>
          <el-form-item prop="username" class="username">
            <el-input
                    type="text"
                    v-model="ruleForm.username"
                    auto-complete="off"
                    placeholder="用户账号"
            ></el-input>
          </el-form-item>
          <el-form-item
                  prop="password"
                  class="password"
                  style="margin-bottom: 39px"
          >
            <el-input
                    type="text"
                    v-model="ruleForm.password"
                    auto-complete="off"
                    placeholder="用户密码"
                    show-password
                    @keyup.enter.native="submitForm('ruleForm')"
            ></el-input>
          </el-form-item>
        </div>
        <el-form-item style="width:100%;" class="submit">
          <el-button
                  type="primary"
                  @click="submitForm('ruleForm')"
                  :loading="logining"
          >登录
          </el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!--  修改密码  -->
    <el-dialog :title="dialogVisibleTitle" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false"
               :before-close="handleClose" append-to-body>
      <el-form :label-width="'120px'" :model="editForm" :rules="rules1" ref="editForm">
        <el-form-item label="新密码" prop="pass">
          <el-input type="password" v-model="editForm.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="editForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitPsdForm('editForm')">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script type="text/ecmascript-6">
	import {mapMutations} from 'vuex'
	import {setCookie, getCookie} from 'common/js/cookie'
	import {login, getMenu, ChangeSelfWord} from 'http/api/login'
	import {ERR_OK} from 'http/config'

	export default {
		name: 'login',
		data() {
			const UserRegular = (rule, value, callback) => {
				const reg = /^[a-zA-Z0-9_-]{5,18}$/;
				if (value != '') {
					if (!reg.test(value)) {
						callback(new Error('无效的用户名'));
					} else {
						callback()
					}
				} else {
					callback(new Error('账号不得为空'));
				}

			}
			const PassRegular = (rule, value, callback) => {
				const reg = /^[a-zA-Z0-9_-]{6,18}$/;
				if (value != '') {
					callback()
				} else {
					callback(new Error('密码不得为空'));
				}

			}

			let validatePass2 = (rule, value, callback) => {
				if (value === "") {
					callback(new Error("请再次输入密码"));
				} else if (value !== this.editForm.pass) {
					callback(new Error("两次输入密码不一致!"));
				} else {
					callback();
				}
			};
			return {
				//定义loading默认为false
				logining: false,
				TabState: true, //
				rememberpwd: false,
				dialogVisible: false,
				ruleForm: {
					// username: 'admin',
					// password: '123456'
				},
				//rules前端验证
				rules: {
					username: [{required: true, validator: UserRegular, trigger: 'blur'}],
					password: [{required: true, validator: PassRegular, trigger: 'blur'}]
				},
				rules1: {
					pass: [{required: true, validator: PassRegular, trigger: "blur"}],
					checkPass: [{required: true, validator: validatePass2, trigger: "blur"}]
				},
				editForm: {},
				dialogVisibleTitle: '',
				userInfo: '',
			}
		},
		// 创建完毕状态(里面是操作)
		created() {
			this.getuserpwd()
		},
		activated() {
			this.logining = true;
		},
		// 里面的函数只有调用才会执行
		methods: {
			ChangeSelfWord(param) {
				ChangeSelfWord(param).then(res => {
					if (res.code === ERR_OK) {
						this.handleClose()
						this.$message.success(res.msg);
						this.GetUserInfo()
						return
					}
					this.$message.error(res.msg);
				})
			},
			//账号密码登陆
			Login() {
				const params = {
					"AccountName": this.ruleForm.username,
					"password": this.ruleForm.password
				}
				login(params).then(res => {
					this.userInfo = res.data
					if (res.code == ERR_OK) {
						//修改初始密码
						if (res.data.default) {
							this.dialogVisibleTitle = '请修改初始密码'
							this.dialogVisible = true
							this.logining = false
							return;
						}
						//修改过期密码
						if (res.data.cpd) {
							this.dialogVisibleTitle = '密码已过期，请修改密码'
							this.dialogVisible = true
							this.logining = false
							return;
						}
						this.setUser(res.data)
						let cookieData = {
							"userCode": res.data.userCode,
							"mallCode": res.data.mallCode,
              "jwtToken": res.data.jwtToken
						}
						//保存帐号到cookie，有效期30天
						setCookie(JSON.stringify(cookieData), 'userInfo', 30)
						this.$message({
							message: '登录成功',
							type: 'success'
						})
						this.logining = true;
						this._getMenu(res.data.nickName);
						this.$router.push('/')
					} else if (res.code == '505') {
						this.$message.error(res.msg + ',还有[' + res.data + ']次机会，超过将锁定')
						this.logining = false
					} else {
						this.$message.error(res.msg)
						this.logining = false
					}
				})
			},
			_getMenu(nickName) {
				const param = {
					// "accountName": nickName
				}
				getMenu(param).then(res => {
					if (res.code == ERR_OK) {
						this.setMenu(res.data)
					}
				})
			},
			// 获取用户名密码
			getuserpwd() {
				if (getCookie('user') != '' && getCookie('pwd') != '') {
					this.ruleForm.phone = getCookie('user')
					this.ruleForm.password = getCookie('pwd')
					this.rememberpwd = true
				}
			},
			//获取info列表
			submitForm(formName) {
				this.$refs[formName].validate(valid => {
					if (valid) {
						this.logining = true
						if (this.TabState) {
							this.Login()
						}
					} else {

						this.logining = false
						return false
					}
				})
			},
			//修改密码
			submitPsdForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
						const param = {
							"UserCode": this.userInfo.userCode,
							"Password": btoa(this.editForm.pass),
							"ConfirmPassword": btoa(this.editForm.checkPass)
						}
						this.ChangeSelfWord(param)
					}
				})
			},
			//关闭弹窗
			handleClose() {
				this.dialogVisible = false
				this.$refs["editForm"].resetFields()
				this.editForm = {}
			},
			...mapMutations({
				setlogin: 'SET_LOGIN',
				setUser: 'SET_USER',
				setMenu: 'SET_MENUS',
				setRolePermissions: 'SET_ROLE_PERMISSIONS',
			})
		},

	}
</script>

<style scoped>
  .login-page {
    width: 717px;
    margin: 0 auto;
  }

  .login-wrap >>> .username .el-input__inner {
    height: 44px !important;
  }

  .login-wrap >>> .password .el-input__inner {
    height: 44px !important;
  }

  .code {
    margin-bottom: 39px;
    position: relative;
  }

  .submit .el-button--primary {
    width: 246px;
    height: 44px;
    border-radius: 50px;
    background-image: -webkit-linear-gradient(0deg, #3da8f8, #32b2fd);
    color: #ffffff;

    font-size: 15px;
  }

  .submit {
    margin-bottom: 0 !important;
    position: relative;
    top: 38px;
    text-align: center;
  }

  @font-face {
    font-family: "HYQiHei-40S";
    src: url("../../common/fonts/HYQiHei-40S.ttf");
  }

  @font-face {
    font-family: "HYQiHei-35S";
    src: url("../../common/fonts/HYQiHei-35S.ttf");
  }

  .left-tab {
    background: url("../../common/images/bg-pic01.jpg") no-repeat;
    width: 310px;
    height: 453px;
    float: left;
    display: block;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }

  .left-tab p {
    font-size: 18px;
    text-align: center;
    line-height: 49px;
    width: 183px;
    color: #ffffff;
    background: #464646;
    cursor: pointer;
    margin: 203px auto;
    height: 49px;
    line-height: 49px;
    border: 1px solid #808080;
    border-radius: 40px;
  }

  .login-wrap {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding-top: 10%;
    background-color: #38383c;
  }

  .login-container {
    border-radius: 10px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    float: right;
    width: 407px;
    height: 453px;
    padding: 34px 47px 0px 47px;
    background: #fff;
    border: 1px solid #eaeaea;
    text-align: left;
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
  }

  .login-container p {
    padding: 0 !important;
    margin: 0px 0px 56px 0px;
    font-size: 18px;
    color: #4a4a4a;
  }

  .logo_txt {
    padding: 0;
    margin: 0px 0px 34px 0px;
  }

  .logo_txt span {
    font-size: 36px;
    color: #4a4a4a;
    font-family: HYQiHei-40S;
    font-weight: normal;
  }

  .logo_txt b {
    font-size: 24px;
    color: #4a4a4a;
    margin-left: 9px;
    font-family: HYQiHei-35S;
    font-weight: normal;
  }

  .title {
    margin: 0px 0px 46px 0;
    text-align: center;
    color: #505458;
    background: url("../../common/images/login.png") no-repeat;
    width: 177px;
    height: 18px;
  }

  .remember {
    margin: 0px 0px 35px 0px;
  }

  .code-box {
    text-align: right;
  }

  .codeimg {
    height: 40px;
  }
</style>
