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
              src="../../common/images/logo.png"
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
		    // menus: [
        //   {
        //     menuid: 33,
        //     icon: "el-icon-s-tools",
        //     menuname: "系统管理",
        //     hasThird: null,
        //     url: null,
        //     menus: [
        //       {
        //         menuid: 35,
        //         icon: "icon-order-manage",
        //         menuname: "部门管理",
        //         hasThird: "N",
        //         url: "/system/deptManager",
        //         menus: null
        //       },
	      //       {
		    //         menuid: 36,
		    //         icon: "icon-order-manage",
		    //         menuname: "角色管理",
		    //         hasThird: "N",
		    //         url: "/system/role",
		    //         menus: null
	      //       },
        //       {
        //         menuid: 35,
        //         icon: "icon-order-manage",
        //         menuname: "用户管理",
        //         hasThird: "N",
        //         url: "/system/user",
        //         menus: null
        //       },
        //       {
        //         menuid: 35,
        //         icon: "icon-order-manage",
        //         menuname: "系统设置",
        //         hasThird: "N",
        //         url: "/system/system",
        //         menus: null
        //       },
        //       {
        //         menuid: 38,
        //         icon: "icon-order-manage",
        //         menuname: "屏保管理",
        //         hasThird: "N",
        //         url: "/system/screensaver",
        //         menus: null
        //       },
        //       {
        //         menuid: 37,
        //         icon: "icon-order-manage",
        //         menuname: "日志查询",
        //         hasThird: "N",
        //         url: "/system/log",
        //         menus: null
        //       },
        //       {
        //         menuid: 37,
        //         icon: "icon-order-manage",
        //         menuname: "密码配置",
        //         hasThird: "N",
        //         url: "/system/password",
        //         menus: null
        //       }
        //     ]
        //   },
        //   {
        //     menuid: 71,
        //     icon: "el-icon-s-platform",
        //     menuname: "设备管理",
        //     hasThird: null,
        //     url: null,
        //     menus: [
        //       {
        //         menuid: 72,
        //         icon: "icon-promotion-manage",
        //         menuname: "终端设备列表",
        //         hasThird: "N",
        //         url: "/device/device",
        //         menus: null
        //       },
        //       {
        //         menuid: 73,
        //         icon: "icon-cms-manage",
        //         menuname: "终端组管理",
        //         hasThird: "N",
        //         url: "/device/device-group",
        //         menus: null
        //       }
        //     ]
        //   },
        //   {
        //     menuid: 128,
        //     icon: "el-icon-video-camera-solid",
        //     menuname: "节目管理",
        //     hasThird: null,
        //     url: null,
        //     menus: [
        //       {
        //         menuid: 129,
        //         icon: "icon-provider-manage",
        //         menuname: "节目管理列表",
        //         hasThird: "N",
        //         url: "/program/program-list",
        //         menus: null
        //       },
        //       {
        //         menuid: 127,
        //         icon: "icon-provider-manage",
        //         menuname: "节目组管理",
        //         hasThird: "N",
        //         url: "/program/program-group",
        //         menus: null
        //       },
        //       {
        //         menuid: 126,
        //         icon: "icon-provider-manage",
        //         menuname: "插播管理",
        //         hasThird: "N",
        //         url: "/program/news",
        //         menus: null
        //       },
        //     ]
        //   },
        //   {
        //     menuid: 150,
        //     icon: "el-icon-menu",
        //     menuname: "应用管理",
        //     hasThird: null,
        //     url: null,
        //     menus: [
        //       {
        //         menuid: 159,
        //         icon: "icon-provider-manage",
        //         menuname: "我的应用",
        //         hasThird: "N",
        //         url: "/app/app-list",
        //         menus: null
        //       },
        //       {
        //         menuid: 160,
        //         icon: "icon-provider-manage",
        //         menuname: "应用时间轴",
        //         hasThird: "N",
        //         url: "/app/app-time",
        //         menus: null
        //       },
        //     ]
        //   },
        //   {
        //     menuid: 120,
        //     icon: "el-icon-s-claim",
        //     menuname: "信息管理",
        //     hasThird: null,
        //     url: null,
        //     menus: [
        //       {
        //         menuid: 21,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "楼栋管理",
        //         hasThird: "N",
        //         url: "/mall/building",
        //         menus: null
        //       },
        //       {
        //         menuid: 22,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "楼层管理",
        //         hasThird: "N",
        //         url: "/mall/floor",
        //         menus: null
        //       },
        //       {
        //         menuid: 23,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "业态管理",
        //         hasThird: "N",
        //         url: "/mall/format",
        //         menus: null
        //       },
        //       {
        //         menuid: 23,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "品牌数据",
        //         hasThird: "N",
        //         url: "/mall/shop",
        //         menus: null
        //       },
        //       {
        //         menuid: 23,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "写字楼数据",
        //         hasThird: "N",
        //         url: "/mall/office",
        //         menus: null
        //       }
        //     ]
        //   },
        //   {
        //     menuid: 121,
        //     icon: "el-icon-s-data",
        //     menuname: "统计分析",
        //     hasThird: null,
        //     url: null,
        //     menus: [
        //       {
        //         menuid: 24,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "素材上新",
        //         hasThird: "N",
        //         url: "/statistics/newest-statistics",
        //         menus: null
        //       },
        //       {
        //         menuid: 25,
        //         icon: "icon-cat-skuQuery",
        //         menuname: "节目播放",
        //         hasThird: "N",
        //         url: "/statistics/program-statistics",
        //         menus: null
        //       }
        //     ]
        //   }
        // ]
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
		  ...mapGetters(['menus'])
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
    height: 80px;
    background: #001529 !important;
    padding: 20px 0px;
    text-align: center;
  }
  .logoimg {
    height: 40px;
  }
</style>
