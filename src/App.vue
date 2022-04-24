<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>
<script>
import { setCookie, getCookie } from "common/js/cookie";
import { mapMutations, mapGetters } from "vuex";
import { getMenu, GetUserInfo, GetSiteInfo } from "http/api/login";
import { ERR_OK } from "http/config";

export default {
  provide() {
    //父组件中通过provide来提供变量，在子组件中通过inject来注入变量。
    return {
      reload: this.reload,
    };
  },
  data() {
    return {
      isRouterAlive: true, //控制视图是否显示的变量
    };
  },
  created() {
    if (this.$route != "/login") {
      this._getLogin();
    }
    this.GetSiteInfo();
  },
  methods: {
    reload() {
      this.isRouterAlive = false; //先关闭，
      this.$nextTick(function() {
        this.isRouterAlive = true; //再打开
      });
    },
    _getLogin() {
      if (getCookie("userInfo")) {
        let userInfo = JSON.parse(getCookie("userInfo"));
        if (userInfo.userCode) {
          !getCookie("autoauth") && this.GetUserInfo(userInfo);
          getCookie("presentMenu") &&
            this.setPresentMenu(JSON.parse(getCookie("presentMenu")));
          this._getMenu();
          return;
        }
      }
      this.$router.push("/login");
    },
    GetUserInfo(user) {
      const param = { Code: user.userCode };
      GetUserInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          let userInfo = res.data;
          userInfo.userCode = user.userCode;
          userInfo.mallCode = user.mallCode;
          this.setUser(userInfo);
        }
      });
    },
    _getMenu() {
      const param = {
        // "accountName": nickName
      };
      getMenu(param).then((res) => {
        if (res.code == ERR_OK) {
          this.setMenu(res.data);
        }
      });
    },
    GetSiteInfo() {
      GetSiteInfo({}).then((res) => {
        if (res.code === ERR_OK) {
          if (res.data.siteLogo) {
            const website = {
              logo: this.config.url + res.data.siteLogo,
            };
            this.setWebsite(website);
          }

          if (res.data.siteTitle) {
            document.title = res.data.siteTitle;
          }
        }
      });
    },
    ...mapMutations({
      setUser: "SET_USER",
      setMenu: "SET_MENUS",
      setPresentMenu: "SET_PRESENT_MENUS",
      setWebsite: "SET_WEBSITE",
    }),
  },
  computed: {
    ...mapGetters(["presentMenu", "user", "config", "website"]),
  },
};
</script>
<style lang="scss">
html,
body,
#app {
  height: 100%;
}
.bstd {
  font-family: BrownStd;
}
.avatar-uploader {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover {
      border-color: #409eff;
    }
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
}

#app {
  width: 100%;
  position: relative;
  color: #606266;
  font-size: 14px;
  line-height: 1.7;

  .tooltip-wrapper + .tooltip-wrapper {
    margin-left: 20px;
  }
  .svg-button {
    font-size: 20px;
    color: #868f9f;
    &.is-disabled {
      color: #bbc1cc;
      &:focus,
      &:hover {
        color: #bbc1cc;
      }
    }
    &:focus,
    &:hover {
      color: #2f6bff;
    }
  }
  .svg-button + .svg-button {
    margin-left: 20px;
  }
  .el-button {
    &.svg-suffix {
      padding: 0 32px;
      height: 44px;
      line-height: 44px;
      font-weight: bold;
      font-size: 14px;
      border-radius: 8px;
      svg {
        font-size: 20px;
        margin-right: 8px;
      }
      &.s {
        + .s {
          margin-left: 8px;
        }
        &.is-disabled {
          color: #bbc1cc;
          &:focus,
          &:hover {
            color: #bbc1cc;
          }
        }
        &:focus,
        &:hover {
          color: #2f6bff;
        }
        padding: 0 16px;
        color: #868f9f;
        border: none;
      }
    }
  }
  .el-breadcrumb {
    font-family: Source Han Sans CN;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 80px;
    padding-left: 44px;
    .el-breadcrumb__separator {
      color: #bbc1cc;
    }
  }
  .el-table {
    position: relative;
    ::-webkit-scrollbar {
      width: 4px;
      height: 349px;
      border-radius: 6px;
    }

    ::-webkit-scrollbar-track {
      width: 4px;
      height: 349px;
      background: #f6f6f6;
    }

    ::-webkit-scrollbar-thumb {
      background: #2f6bff;
      border-radius: 6px;
    }

    ::-webkit-scrollbar-track-piece:start {
      background: #e6eaf0;
    }
    ::-webkit-scrollbar-track-piece:end {
      background: #e6eaf0;
      margin-bottom: 98px;
    }
    &::before {
      content: none;
    }
    background-color: transparent;
    color: #868f9f;
    .el-table__header {
      font-family: Source Han Sans CN;
      font-style: normal;
      font-weight: bold;
      font-size: 14px;
      thead {
        color: #868f9f;
      }
      th,
      tr {
        background-color: transparent;
      }
    }
    th,
    td {
      border: none;
      height: 58px;
      padding: 0;
    }
    .el-table__body {
      border-spacing: 0 4px;
      .el-table__row {
        border: none;
        margin-top: 4px;
        border-radius: 8px;
        overflow: hidden;
        background-color: transparent;
        td {
          background-color: #fff;
        }
        td:first-child {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        td:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .cell {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  h2 {
    font-family: Source Han Sans CN;
    font-style: normal;
    font-weight: bold;
    font-size: 24px;
    line-height: 36px;
    color: #172647;
    margin-bottom: 16px;
  }
  .el-pagination {
    padding: 0;
    span:not([class*="suffix"]),
    button {
      font-size: 12px;
      line-height: 32px;
      height: 32px;
      color: #868f9f;
    }
    .el-pagination__total {
      margin-right: 16px;
    }

    .el-select {
      input {
        font-size: 12px;
        height: 32px;
        line-height: 32px;
        color: #868f9f;
        padding-left: 0;
        padding-right: 26px;
        border-radius: 6px;
        border: 1px solid #e6eaf0;
      }
      .el-input {
        width: 95px;
        margin: 0;
      }
    }
    .el-input__suffix {
      right: 5px;
      top: -2px;
    }
    .btn-prev,
    .btn-next {
      width: 32px;
      height: 32px;
      background: #ffffff;
      border-radius: 6px;
      color: #868f9f;
      margin: 0 6px;
    }
    .btn-next {
      margin-right: 0;
    }
    .el-pager {
      .number {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 6px;
        font-family: BrownStd;
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        color: #868f9f;
        line-height: 32px;
        margin: 0 2px;
        &.active {
          background: #2f6bff;
          color: #fff;
        }
      }
    }
  }
  .meta1 {
    font-family: Source Han Sans CN;
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 44px;
    color: #868f9f;
    margin-right: 16px;
    white-space: nowrap;
  }
  .input1 {
    height: 44px;
    line-height: 44px;
    width: 200px;
    margin-right: 32px;
    input {
      height: 44px;
      line-height: 44px;
      width: 200px;
      padding-left: 12px;
      color: #868f9f;
      &::placeholder {
        color: #bbc1cc;
        opacity: 1; /* Firefox */
      }
    }
    &.big {
      width: 400px;
      input {
        width: 400px;
      }
    }
  }
  .btn1 {
    display: inline-block;
    width: 44px;
    height: 44px;
    background: #ffffff;
    border-radius: 8px;
    padding: 10px;
    svg {
      width: 24px;
      height: 24px;
      color: #2f6bff;
    }
    &:hover {
      background: #eaf0ff;
    }
    &:active {
      border: 1px solid #2f6bff;
    }
  }
  .btn1 + .btn1 {
    margin-left: 8px;
  }
  .btn2 {
    height: 44px;
    line-height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    font-family: Source Han Sans CN;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    color: #868f9f;
    svg {
      margin-right: 8px;
    }
  }
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
