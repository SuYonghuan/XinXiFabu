<template>
  <el-menu
    :collapse="collapsed"
    collapse-transition
    router
    :default-active="$route.path"
    unique-opened
    class="el-menu-vertical-demo"
    background-color="#171F46"
    text-color="#fff"
    active-text-color="#2F6BFF"
  >
    <div class="logobox">
      <svg
        class="icon svgi"
        aria-hidden="true"
        @click="$emit('toggleCollapse')"
      >
        <use xlink:href="#iconzhedie"></use>
      </svg>
      <img
        class="logoimg"
        v-if="!collapsed"
        :src="website.logo ? website.logo : '../../common/images/logo.png'"
        alt=""
      />
    </div>
    <router-link class="submenu el-submenu" to="/index/home">
      <div
        class="router-link-title"
        @click="menuClick({ textCH: '首页', parent: '首页' })"
      >
        <svg class="icon svgi" aria-hidden="true">
          <use xlink:href="#iconshouye"></use></svg
        >首页
      </div>
    </router-link>
    <el-submenu
      v-for="menu in menus"
      :key="menu.code"
      :index="menu.textCH"
      class="submenu"
    >
      <template slot="title">
        <svg class="icon svgi" aria-hidden="true">
          <use :xlink:href="menu.icon"></use>
        </svg>
        <span slot="title">{{ menu.textCH }}</span>
      </template>
      <el-menu-item-group>
        <el-menu-item
          v-for="chmenu in menu.child"
          :index="chmenu.href"
          :key="chmenu.code"
          @click="menuClick({ ...chmenu, parent: menu.textCH })"
        >
          <span slot="title">{{ chmenu.textCH }}</span>
        </el-menu-item>
      </el-menu-item-group>
    </el-submenu>
  </el-menu>
</template>

<script>
import { mapGetters } from "vuex";
import { setCookie } from "common/js/cookie";
import { mapMutations } from "vuex";
import svgi from "./svgi";
export default {
  name: "leftNav",
  props: ["collapsed"],
  methods: {
    menuClick(item) {
      setCookie(JSON.stringify({ code: item.code }), "presentMenu", 1);
      this.setPresentMenu(item);
    },
    ...mapMutations({
      setPresentMenu: "SET_PRESENT_MENUS",
    }),
  },
  computed: {
    ...mapGetters(["menus", "website"]),
  },
  components: { svgi },
};
</script>

<style lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 256px !important;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  overflow: hidden auto;

  /*min-height: 400px;*/
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  border: none;
  text-align: left;
}

.logobox {
  color: #9d9d9d;
  height: 80px;
  background: #171f46;
  padding-left: 24px;
  line-height: 80px;
  .svgi {
    vertical-align: middle;
    margin-right: 17px;
    width: 24px;
    text-align: center;
    font-size: 20px;
  }
  .logoimg {
    display: inline-block;
    height: 80px;
    vertical-align: middle;
  }
}
.el-menu {
  border: none;
  z-index: 10;
  * {
    font-weight: bold;
  }
  .submenu {
    &:hover {
      background-color: #1f2d3d !important;
    }
    .el-menu-bg {
      background-color: #1f2d3d !important;
    }
    &.is-active,
    &.router-link-exact-active {
      .el-submenu__title,
      .router-link-title {
        position: relative;
        background-image: url(./submenu-active-bg.svg);
        background-position-x: 8px;
        background-repeat: no-repeat;
        .svgi {
          color: #fff;
        }
        i {
          color: #fff;
        }
      }
    }
    .el-submenu__title,
    .router-link-title {
      padding-left: 24px !important;
      i {
        color: #868f9f;
        &.el-submenu__icon-arrow {
          font-size: 14px;
        }
      }
    }
    .router-link-title {
      height: 56px;
      line-height: 56px;
      font-size: 14px;
      color: #fff;
      padding: 0 20px;
      list-style: none;
      cursor: pointer;
      position: relative;
      transition: border-color 0.3s, background-color 0.3s, color 0.3s;
      box-sizing: border-box;
      white-space: nowrap;
    }
    .el-menu-item {
      min-width: 256px !important;
      box-sizing: border-box;
      background: #141a3e !important;
      z-index: 10;
      padding-left: 60px !important;
      &.is-active {
        box-sizing: border-box !important;
      }
    }
    .el-menu-item-group__title {
      padding: 0px !important;
    }
  }
  .el-submenu .svgi {
    vertical-align: middle;
    margin-right: 24px;
    text-align: center;
    font-size: 20px;
    color: #868f9f;
  }
  .el-menu-item-group {
    margin: 0 8px;
    border-radius: 8px;
  }
}
.el-menu--collapse {
  width: 68px;
  height: 100%;
  .submenu {
    &.is-active,
    &.router-link-exact-active {
      .el-submenu__title,
      .router-link-title {
        background-image: url(./active-bg-small.svg);
      }
    }
  }
}
</style>
