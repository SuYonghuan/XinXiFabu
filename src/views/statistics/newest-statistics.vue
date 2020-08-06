<template>
  <div class="newest-statistics">
    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>统计分析</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="选择时间">
        <el-date-picker
                v-model="search.time"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                style="width: 400px"
                :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
      </el-form-item>
      <el-form-item class="right-button">
        <el-button type="success" @click="export2Excel()">导出</el-button>
      </el-form-item>
    </el-form>

    <div id="lineChart"></div>
  </div>
</template>

<script>
	import {
		GetDeptPublishProgram,
	} from 'http/api/statistics'
	import {ERR_OK} from 'http/config'
	import {timeFormatting} from 'common/js/mixins'

	let echarts = require('echarts')
	export default {
		name: "newest-statistics",
		mixins: [timeFormatting],
		data() {
			return {
				search: {time: []},
				pickerOptions: {
					shortcuts: [{
						text: '今日',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime());
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '昨日',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24);
							end.setTime(start.getTime());
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				chartTitle: [],
				chartData: [],
				excelData: [],
			}
		},
		created() {
			this.search.time = [
				this.dateFormat('y-m-d', new Date()),
				this.dateFormat('y-m-d', new Date())
			];
			this.GetDeptPublishProgram()
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			GetDeptPublishProgram() {
				const param = {
					"BeginTime": this.search.time[0],
					"EndTime": this.search.time[1] + ' 23:59:59',
					"TakeNum": 5
				}
				GetDeptPublishProgram(param).then(res => {
					if (res.code === ERR_OK) {
						this.excelData = res.data
						if (res.data.length > 0) {
							for (let i = 0; i < res.data.length; i++) {
								this.chartTitle[i] = res.data[i].name
								this.chartData[i] = res.data[i].count
							}
						}
					}
					this.initChart();
				})
			},
			/**
			 * End
			 */
			//搜索
			onSearch() {
				this.chartTitle = []
				this.chartData = []
				this.GetDeptPublishProgram()
			},
			initChart() {
				// 基于准备好的dom，初始化echarts实例
				var myChart = echarts.init(document.getElementById('lineChart'));

				// 绘制图表
				myChart.setOption({
					xAxis: {
						type: 'category',
						data: this.chartTitle
					},
					yAxis: {
						type: 'value'
					},
					series: [{
						data: this.chartData,
						barWidth: '10%',
						type: 'bar'
					}]
				});
			},
			//导出excel
			export2Excel() {
				require.ensure([], () => {
					const {export_json_to_excel} = require('../../vendor/Export2Excel');
					//头
					const tHeader = ['部门', '数量'];
					//对应的标签
					const filterVal = ['name', 'count'];
					//标签对应的内容  是一个数组结构
					const list = this.excelData;
					//一个方法 我也不知道干嘛的
					const data = this.formatJson(filterVal, list);
					export_json_to_excel(tHeader, data, '素材上新统计');
				})
			},
			formatJson(filterVal, jsonData) {
				return jsonData.map(v => filterVal.map(j => v[j]))
			},
		},
		mounted() {
			// this.initChart();
		},
	}
</script>

<style scoped lang="scss">
  .newest-statistics {
    .demo-form-inline {
      margin-top: 40px;

      .right-button {
        float: right;
      }
    }

    #lineChart {
      width: 80%;
      height: 700px;
    }
  }
</style>
