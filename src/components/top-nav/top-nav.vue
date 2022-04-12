/** * 头部菜单 */
<template>
  <div class="nav_right">
    <div style="flex: 1">
      <el-breadcrumb>
        <el-breadcrumb-item>{{ presentMenu.parent }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ presentMenu.textCH }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    {{ user.nickName }}
    <el-dropdown
      trigger="click"
      v-show="!autoAuth"
      class="user-contianer"
      style="width: 44px;height: 80px;margin-left:24px"
    >
      <div class="user">
        <img src="./user.svg" alt="" />
      </div>
      <el-dropdown-menu slot="dropdown">
        <div class="user-div">
          <p class="user-name">您好! {{ user.nickName }}</p>
          <p class="user-menu" @click="clickName">
            <el-link type="primary">个人中心</el-link>
          </p>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="exit" v-show="!autoAuth">
      <img src="./exit.svg" @click="exit()" />
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import { delCookie, getCookie } from "common/js/cookie";

export default {
  name: "navcon",
  data() {
    return {
      collapsed: true,
      dialogFormVisible: false,
      ruleForm: {
        pass: "",
        checkPass: "",
      },
      noticeData: {},
      dropdownStatus: true,
      autoAuth: false,
    };
  },
  computed: {
    ...mapGetters(["user", "presentMenu"]),
  },
  created() {
    this.autoAuth = getCookie("autoauth") ? true : false;
  },
  methods: {
    cancel() {
      this.dialogFormVisible = false;
      this.resetForm();
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this._resetPwd(
            this.ruleForm.pass,
            this.ruleForm.checkPass,
            this.user.userCode
          );
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm() {
      this.$refs["ruleForm"].resetFields();
    },
    // 退出登录
    exit() {
      this.$confirm("退出登录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$router.push({ path: "/login" });
          this.setuser("");
          delCookie("userInfo");
          delCookie("presentMenu");
          // delCookie()
        })
        .catch(() => {
          console.log(this.user);
        });
    },
    //用户信息
    clickName() {
      this.$router.push("/system/personal");
    },
    ...mapMutations({
      setuser: "SET_USER",
    }),
  },
};
</script>
<style lang="scss">
.notice-badge {
  .el-badge__content.is-fixed {
    top: 30px;
  }
}
</style>
<style scoped lang="scss">
.exit {
  position: relative;
  display: inline-block;
  width: 22px;
  height: 80px;
  margin-left: 18px;
  img {
    position: absolute;
    width: 22px;
    top: 32px;
    left: 0;
  }
}
.stick {
  position: relative;
  width: 101px;
  height: 80px;
  display: inline-block;
  &::before {
    position: absolute;
    content: "";
    left: 53px;
    top: 30px;
    height: 20px;
    border-left: 1px solid #e6e7ec;
  }
}
.nav_right {
  .user-badge {
    position: relative;
  }
}
.user {
  position: absolute;
  width: 44px;
  height: 44px;
  background: #eceff4;
  border-radius: 50%;
  top: 18px;
  img {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }
}
:focus {
  outline: 0 !important;
}

.nav_right {
  display: flex;
  height: 80px;
  line-height: 80px;
  margin-right: 28px;
}

.nav_right p,
a,
img {
  display: inline-block;
  cursor: pointer;
}

.nav_right p,
a {
  margin: 0;
  padding: 0;
}

.nav_right a {
  width: 75px;
  line-height: 31px;
  font-size: 15px;
  border-radius: 4px;
  text-align: center;
  height: 31px;
  color: rgba(255, 255, 255, 1);
  margin-left: 42px;
  background-color: #409eff;
}

.el-menu-demo {
  z-index: 9;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  border: none;
}

.buttonimg {
  height: 60px;
  background-color: transparent;
  border: none;
}

.showimg {
  width: 26px;
  height: 26px;
  position: absolute;
  top: 17px;
  left: 17px;
}

.showimg:active {
  border: none;
}

.item {
  margin: 8px 20px 0;
}

.notice-div {
  width: 250px;
  height: 400px;
  padding: 10px 20px;

  .notice-list {
    height: 350px;
    overflow-y: auto;
    overflow-x: hidden;
    border-bottom: 1px solid #dcdfe6;

    .notice-item {
      border-bottom: 1px solid #dcdfe6;
      padding: 10px 0;

      .notice-title {
        font-size: 16px;
        line-height: 18px;

        .el-icon-close {
          margin-left: 5px;
          color: #f56c6c;
          font-weight: 700;
        }
      }

      .notice-content {
        margin-top: 5px;
        font-size: 13px;
        line-height: 15px;
        color: #606266;
      }
    }
  }

  .notice-txt {
    text-align: center;
    line-height: 20px;
    margin-top: 13px;
  }
}

.el-dropdown-link {
  img {
    position: relative;
    top: 10px;
    margin-right: 9px;
    border-radius: 17px;
    width: 34px;
    height: 34px;
  }

  p {
    font-size: 20px;
    color: #505050;
  }
}

.user-div {
  width: 140px;
  padding: 10px 20px;
  .user-name {
    width: 100%;
    height: 50px;
    overflow: hidden;
  }
  .user-menu {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
}
</style>
