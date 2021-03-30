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
          this._getMenu(userInfo.nickName);
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
    _getMenu(nickName) {
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

#app {
  width: 100%;
  position: relative;
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
  .el-breadcrumb {
    font-size: 12px;
    line-height: 18px;
  }
  .el-table {
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
      padding: 7px 0;
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
      }
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
