<template>
  <div class="password-content">
    <el-card class="box-card">
      <div class="content-p">
        <div>
          <p class="content-t">用户名</p>
          <span>{{ userInfo.accountName }}</span>
        </div>
        <p>
          <el-button type="primary" size="small" @click="handlePsd()"
            >修改密码</el-button
          >
        </p>
      </div>
      <el-divider></el-divider>
      <div class="content-p">
        <div>
          <p class="content-t">角色</p>
          <span>{{ userInfo.roleName }}</span>
        </div>
      </div>
      <el-divider></el-divider>
      <div class="content-p">
        <div class="content-other">
          <p class="content-t">基本信息</p>
          <span>昵称：{{ userInfo.nickName }}</span>
          <span>邮箱：{{ userInfo.email }}</span>
          <span>手机：{{ userInfo.phone }}</span>
        </div>
        <p>
          <el-button type="primary" size="small" @click="handleOther()"
            >修改信息</el-button
          >
        </p>
      </div>
      <el-divider></el-divider>
      <div class="content-p">
        <div>
          <p class="content-t" style="position: absolute">网站logo</p>
          <el-upload
            class="avatar-uploader"
            :action="config.url + config.uploadFile"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <p>
          <el-button type="primary" size="small" @click="handleLogo()"
            >保存</el-button
          >
        </p>
      </div>
      <el-divider></el-divider>
      <div class="content-p">
        <div>
          <p class="content-t">网站标题</p>
          <el-input
            v-model="title"
            size="small"
            style="width: auto"
            placeholder="请输入标题"
            maxlength="20"
          ></el-input>
        </div>
        <p>
          <el-button type="primary" size="small" @click="handleTitle()"
            >保存</el-button
          >
        </p>
      </div>
    </el-card>

    <!--  修改密码  -->
    <el-dialog
      title="修改密码"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            type="password"
            v-model="editForm.oldPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="pass">
          <el-input
            type="password"
            v-model="editForm.pass"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input
            type="password"
            v-model="editForm.checkPass"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm('editForm')">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <!--  修改基本信息  -->
    <el-dialog
      title="修改基本信息"
      :visible.sync="dialogVisibleOther"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules1"
        ref="editForm"
      >
        <el-form-item label="昵称" prop="nickName">
          <el-input
            type="text"
            v-model="editForm.nickName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            type="text"
            v-model="editForm.email"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input
            type="text"
            v-model="editForm.phone"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitUserForm('editForm')">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  GetUserInfo,
  ChangeSelfPassWord,
  SelfEdit,
  GetSiteInfo,
  EditSiteLogo,
  EditSiteTitle,
} from "http/api/login";
import { ERR_OK } from "http/config";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "personal",
  data() {
    const PassRegular = (rule, value, callback) => {
      if (value != "") {
        if (value.length < 6) {
          callback(new Error("请输入至少6位字符"));
        } else {
          callback();
        }
      } else {
        callback(new Error("请输入至少6位字符"));
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.editForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    const PhoneRegular = (rule, value, callback) => {
      const reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/;
      if (value != "") {
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
      if (value != "") {
        if (!reg.test(value)) {
          callback(new Error("邮箱错误"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return {
      userInfo: {},
      editForm: {},
      dialogVisible: false,
      dialogVisibleOther: false,
      rules: {
        oldPassword: [
          { required: true, message: "请输入原密码", trigger: "blur" },
        ],
        pass: [{ required: true, validator: PassRegular, trigger: "blur" }],
        checkPass: [
          { required: true, validator: validatePass2, trigger: "blur" },
        ],
      },
      rules1: {
        nickName: [{ required: true, message: "输入昵称", trigger: "blur" }],
        phone: [
          {
            required: true,
            message: "输入正确的手机号",
            validator: PhoneRegular,
            trigger: "blur",
          },
        ],
        email: [{ required: true, validator: emailRegular, trigger: "blur" }],
      },
      imageUrl: "",
      logoPath: "",
      title: "",
    };
  },
  created() {
    this.GetUserInfo();
    this.GetSiteInfo();
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    GetUserInfo() {
      const param = { Code: this.user.userCode };
      GetUserInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          this.userInfo = res.data;
          // console.log(this.userInfo)
        }
      });
    },
    ChangeSelfPassWord(param) {
      ChangeSelfPassWord(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.GetUserInfo();
          return;
        }
        this.$message.error(res.msg);
      });
    },
    SelfEdit(param) {
      SelfEdit(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.GetUserInfo();
          let user = this.user;
          user.nickName = param.nickName;
          user.phone = param.phone;
          user.email = param.email;
          this.setUser(user);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    GetSiteInfo() {
      GetSiteInfo({}).then((res) => {
        if (res.code === ERR_OK) {
          if (res.data.siteLogo) {
            this.imageUrl = this.config.url + res.data.siteLogo;
            this.logoPath = res.data.siteLogo;
          }

          this.title = res.data.siteTitle ? res.data.siteTitle : "";
        }
      });
    },
    EditSiteLogo(param) {
      EditSiteLogo(param).then((res) => {
        if (res.code === ERR_OK) {
          let website = JSON.parse(JSON.stringify(this.website));
          website.logo = this.config.url + param.LogoPath;
          this.setWebsite(website);
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    EditSiteTitle(param) {
      EditSiteTitle(param).then((res) => {
        if (res.code === ERR_OK) {
          document.title = param.Title;
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    /**
     * End
     */

    //修改密码
    handlePsd() {
      this.dialogVisible = true;
    },
    //修改其他信息
    handleOther() {
      this.dialogVisibleOther = true;
      this.editForm = JSON.parse(JSON.stringify(this.userInfo));
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleOther = false;
      this.$refs["editForm"].resetFields();
      this.editForm = {};
    },
    //保存密码
    submitForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          const param = {
            UserCode: this.user.userCode,
            OldPassword: this.editForm.oldPassword,
            Password: this.editForm.pass,
            ConfirmPassword: this.editForm.checkPass,
            AccountName: this.user.accountName,
          };
          this.ChangeSelfPassWord(param);
        }
      });
    },
    //修改其他信息
    submitUserForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          const param = {
            UserCode: this.user.userCode,
            nickName: this.editForm.nickName,
            email: this.editForm.email,
            phone: this.editForm.phone,
          };
          this.SelfEdit(param);
        }
      });
    },
    handleLogo() {
      const param = {
        LogoPath: this.logoPath,
      };

      this.EditSiteLogo(param);
    },
    handleTitle() {
      const param = {
        Title: this.title,
      };
      this.EditSiteTitle(param);
    },
    //上传图片
    handleAvatarSuccess(res, file) {
      if (res.code === "200") {
        this.imageUrl = URL.createObjectURL(file.raw);
        this.logoPath = res.data.filePath;
      } else {
        this.$message.error("上传失败!");
      }
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 10;
      const type = ["image/jpg", "image/png", "image/jpeg"];

      if (type.indexOf(file.type) === -1) {
        this.$message.error("上传图片只能是 jpg、png格式!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 10MB!");
        return false;
      }
    },
    ...mapMutations({
      setUser: "SET_USER",
      setWebsite: "SET_WEBSITE",
    }),
  },
  computed: {
    ...mapGetters(["presentMenu", "user", "config", "website"]),
  },
};
</script>

<style>
.avatar-uploader {
  margin-left: 100px;
  height: 43px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 80px;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 40px;
  display: block;
}
</style>
<style scoped lang="scss">
.box-card {
  margin-top: 40px;

  .content-p {
    height: 40px;
    line-height: 40px;
    display: flex;
    justify-content: space-between;

    .content-t {
      width: 100px;
      display: inline-block;
    }

    .content-other {
      span {
        margin-right: 50px;
      }
    }

    span {
      color: #909399;
    }
  }
}
</style>
