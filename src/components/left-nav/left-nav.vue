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
      <i
        :class="collapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
        @click="$emit('toggleCollapse')"
      ></i>
      <img
        class="logoimg"
        v-if="!collapsed"
        :src="website.logo ? website.logo : '../../common/images/logo.png'"
        alt=""
      />
    </div>
    <el-submenu
      v-for="menu in menus"
      :key="menu.code"
      :index="menu.textCH"
      class="submenu"
    >
      <template slot="title">
        <i :class="menu.icon"></i>
        <span slot="title">{{ menu.textCH }}</span>
      </template>
      <el-menu-item-group>
        <el-menu-item
          v-for="chmenu in menu.child"
          :index="chmenu.href"
          :key="chmenu.code"
          @click="menuClick(chmenu)"
        >
          <!--          <i class="iconfont" :class="chmenu.icon"></i>-->
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
  padding-left: 25px;
  line-height: 80px;
  i {
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
    .el-menu-bg {
      background-color: #1f2d3d !important;
    }
    &.is-active {
      .el-submenu__title {
        background: #2f6bff !important;
        margin: 0 8px;
        border-radius: 8px;
        padding-left: 15px !important;
        i {
          color: #fff;
        }
      }
    }
    .el-submenu__title {
      padding-left: 25px !important;
      i {
        color: #868f9f;
        &.el-submenu__icon-arrow {
          font-size: 14px;
        }
      }
    }

    .el-submenu [class^="el-icon-"] {
      margin-right: 17px;
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
  .el-submenu [class^="el-icon-"] {
    vertical-align: middle;
    margin-right: 17px;
    width: 24px;
    text-align: center;
    font-size: 20px;
  }
}
.el-menu--collapse {
  width: 68px;
  height: 100%;
}
</style>
