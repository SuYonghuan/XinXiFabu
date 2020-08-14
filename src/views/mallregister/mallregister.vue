<template>
  <div class="mallregister-content">
    <el-card class="box-card">
      <p class="top-p">
        <img src="../../common/images/qianmu.png" alt="">
      </p>
      <el-divider class="version-p">{{ config.version }}</el-divider>

      <el-form :label-width="'80px'" :model="editForm" :rules="rules" ref="editForm" class="form-div">
        <el-form-item label="用户名" prop="username">
          <el-input type="text" v-model="editForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input type="password" v-model="editForm.pass" autocomplete="off" placeholder="请输入6-12位密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="editForm.checkPass" autocomplete="off" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邀请码" prop="regKey">
          <el-input type="text" v-model="editForm.regKey" placeholder="请输入邀请码"></el-input>
        </el-form-item>
      </el-form>
      <p class="button-p">
        <el-button type="primary" @click="submitUpForm('editForm')">注 册</el-button>
      </p>
    </el-card>
  </div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import {MallRegister} from 'http/api/login'
	import {ERR_OK} from 'http/config'

	export default {
		name: "mallregister",
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
				const reg = /^[a-zA-Z0-9_-]{6,12}$/;
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
				editForm: {},
				rules: {
					username: [{required: true, validator: UserRegular, trigger: 'blur'}],
					pass: [{required: true, validator: PassRegular, trigger: "blur"}],
					checkPass: [{required: true, validator: validatePass2, trigger: "blur"}],
					regKey: [{required: true, message: '请输入邀请码', trigger: "blur"}]
				},
			}
		},
		methods: {
			MallRegister(param) {
				MallRegister(param).then(res => {
					if (res.code === ERR_OK) {
						this.$message.success(res.msg);
						this.$router.push('/login')
						return
					}
					this.$message.error(res.msg);
				})
			},
			//提交
			submitUpForm(item) {
				this.$refs[item].validate(valid => {
					if (valid) {
						const param = {
							"AccountName": this.editForm.username,
							"Password": this.editForm.pass,
							"ConfirmPassword": this.editForm.checkPass,
							"RegKey": this.editForm.regKey
						}
						this.MallRegister(param)
					}
				})
			},
		},
		computed: {
			...mapGetters(['config'])
		},
	}
</script>

<style scoped lang="scss">
  .mallregister-content {
    background-color: #38383C;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .box-card {
      width: 600px;
      height: 600px;

      .top-p {
        text-align: center;

        img {
          width: 200px;
        }
      }

      .version-p {
        margin: 50px 0;
        margin-bottom: 120px;
      }

      .button-p {
        margin-top: 80px;
        text-align: right;
      }
    }
  }
</style>
