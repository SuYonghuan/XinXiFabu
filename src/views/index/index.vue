<template>
  <div class="index-content">
    <!--<leftNav></leftNav>-->
    <!--<topNav></topNav>-->
    <router-view class="child-view"/>
  </div>
</template>

<script>
	import leftNav from 'components/left-nav/left-nav'
	import topNav from 'components/top-nav/top-nav'
	export default {
		name: "index",
	  components: {
		  leftNav,
	    topNav,
	  },
	}
</script>

<style scoped lang="scss">
.index-content{
  position: relative;
  z-index: 5;
  .child-view{
    /*margin-left: 170px;*/
    /*padding: 40px 40px 0px 40px;*/
  }
}
</style>
