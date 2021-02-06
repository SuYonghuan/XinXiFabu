<template>
  <el-menu
          default-active="2"
          :collapse="collapsed"
          collapse-transition
          router
          :default-active="$route.path"
          unique-opened
          class="el-menu-vertical-demo"
          background-color="#334157"
          text-color="#fff"
          active-text-color="#ffd04b"
  >
    <div class="logobox">
      <img
              class="logoimg"
              :src="website.logo ? website.logo : '../../common/images/logo.png'"
              alt=""
      />
    </div>
    <el-submenu
            v-for="menu in menus"
            :key="menu.code"
            :index="menu.textCH"
            class="children"
    >
      <template slot="title">
        <i :class="menu.icon"></i>
        <span>{{ menu.textCH }}</span>
      </template>
      <el-menu-item-group>
        <el-menu-item
                v-for="chmenu in menu.child"
                :index="chmenu.href"
                :key="chmenu.code"
                @click="menuClick(chmenu)"
        >
          <!--          <i class="iconfont" :class="chmenu.icon"></i>-->
          <span>{{ chmenu.textCH }}</span>
        </el-menu-item>
      </el-menu-item-group>
    </el-submenu>
  </el-menu>
</template>

<script>
	import { mapGetters } from 'vuex'
  import { setCookie } from 'common/js/cookie'
  import {mapMutations} from 'vuex'
	export default {
		name: "leftNav",
	  data() {
		  return {
			  collapsed: false,
		  };
	  },
	  methods: {
		  menuClick(item) {
			  setCookie(JSON.stringify({"code":item.code}),'presentMenu',1);
			  this.setPresentMenu(item)
		  },
		  ...mapMutations({
			  setPresentMenu: 'SET_PRESENT_MENUS'
		  })
	  },
	  computed: {
		  ...mapGetters(['menus','website'])
	  },
	}
</script>

<style lang="scss">
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 170px !important;
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
  .el-menu-item-group__title {
    padding: 0px !important;
  }
  .el-menu-item {
    min-width: 170px !important;
    box-sizing: border-box;
    background: #001529 !important;
    z-index: 10;
  }
  .children ul li {
  }
  .children ul li.is-active {
    color: #1890ff !important;
    box-sizing: border-box !important;

    /*width: 5px;*/
    /*height: 5px;*/
    /*background:#ff1818;*/
    /*position: absolute;*/
    /*right: 0;*/
    /*top: 0;*/
  }
  .el-menu-bg {
    background-color: #1f2d3d !important;
  }
  .el-menu {
    border: none;
    z-index: 10;
  }
  .logobox {
    color: #9d9d9d;
    height: 60px;
    background: #ffffff !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .logoimg {
    height: 40px;
  }
</style>
