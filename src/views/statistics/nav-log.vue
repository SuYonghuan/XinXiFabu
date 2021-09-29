<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>统计分析</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="时间">
        <el-date-picker
                v-model="search.time"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table :data="tableData" style="width: 100%" height="620px">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="datdaDate" label="日期"></el-table-column>
      <el-table-column prop="aiUser" label="AR导航人数（人）"></el-table-column>
      <el-table-column prop="ai" label="AR导航次数（次）"></el-table-column>
      <el-table-column prop="simulationUser" label="模拟导航人数（人数）"></el-table-column>
      <el-table-column prop="simulation" label="模拟导航次数"></el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></pagination>
  </div>
</template>

<script>
	import pagination from 'components/pagination/pagination'
	import {
    QueryGuideRecord,
	} from 'http/api/statistics'
	import {ERR_OK} from 'http/config'

	export default {
		name: "deptManager",
		data() {
			return {
				search: {time: ['', '']},
				tableData: [],
				total: 0,
				currentPage: 0,
				pageSize: 10,
				dialogVisible: false,
				editForm: {},
				formLabelWidth: "120px",
			}
		},
		created() {
			this.getList(this.pageSize, this.currentPage)
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			getList(pageSize, page) {
				const param = {
					"BeginTime": this.search.time[0],
					"EndTime": this.search.time[1],
					"Paging": 1,
					"PageIndex": page,
					"PageSize": pageSize
				}
        QueryGuideRecord(param).then(res => {
          console.log(res,5555)
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
						this.total = res.data.allCount
					}
				})
			},
			/**
			 * End
			 */

			//当前页码
			handleCurrentChange(val) {
				this.currentPage = val;
				this.getList(this.pageSize, val)
			},
      //每页数量
      handleSizeChange(val) {
        this.currentPage = 1;
        this.pageSize = val;
        this.getList(this.pageSize, this.currentPage)
      },
			//搜索
			onSearch() {
				this.currentPage = 1
				this.getList(this.pageSize, this.currentPage)
			},
			//重置搜索
			replaySearch() {
				this.search = {time: ['', '']}
				this.currentPage = 1
				this.getList(this.pageSize, this.currentPage)
			},
			//打开弹窗
			handleEdit(item) {
				this.editForm = item
				this.dialogVisible = true
			},
			//关闭弹窗
			handleClose() {
				this.dialogVisible = false
			},
		},
		components: {
			pagination,
		},

	}
</script>

<style>
  .el-range-separator {
    width: auto !important;
  }
</style>
<style scoped lang="scss">
  .demo-form-inline {
    margin-top: 40px;

    .right-button {
      float: right;
    }
  }

  .page-div {
    margin-top: 20px;
  }

  .scroll-div {
    width: 100%;
    max-height: 300px;
    overflow-x: hidden;
    line-height: 30px;
    margin-top: 5px;
  }
</style>
