<template>
  <div class="home-content">
    <p class="text">欢迎你来，{{ user.nickName }}</p>
    <p class="time">今天是 {{ newTime }}</p>
    <!--<div class="welcome-div">-->
      <!--<p class="text">欢迎你来，{{ user.nickName }}</p>-->
      <!--<p class="time">今天是 {{ newTime }}</p>-->
    <!--</div>-->
    <!--<div class="device-div">-->
      <!--<p>设备运行状态</p>-->
      <!--<div class="echart-div">-->
        <!--<div id="lineChart"></div>-->
        <!--<div class="right-div">-->
          <!--<div class="device-num">-->
            <!--<p>设备总数</p>-->
            <!--<p style="color: #E6A23C;font-size: 30px">{{ deviceData.totalDev }}</p>-->
          <!--</div>-->
          <!--<div class="device-run">-->
            <!--<p>当前运行数量</p>-->
            <!--<p style="color: #67C23A;font-size: 30px">{{ deviceData.runDev }}</p>-->
          <!--</div>-->
        <!--</div>-->
      <!--</div>-->
    <!--</div>-->
    <!--<div class="bottom-table">-->
      <!--<div class="table1">-->
        <!--<div class="table-title">-->
          <!--<p>排期订单</p>-->
          <!--<el-link type="primary">更多</el-link>-->
        <!--</div>-->
        <!--<el-table-->
                <!--:data="tableData"-->
                <!--stripe-->
                <!--style="width: 100%">-->
          <!--<el-table-column-->
                  <!--prop="date"-->
                  <!--label="日期"-->
                  <!--width="180">-->
          <!--</el-table-column>-->
          <!--<el-table-column-->
                  <!--prop="name"-->
                  <!--label="姓名"-->
                  <!--width="180">-->
          <!--</el-table-column>-->
          <!--<el-table-column-->
                  <!--prop="address"-->
                  <!--label="地址">-->
          <!--</el-table-column>-->
        <!--</el-table>-->
      <!--</div>-->
      <!--<div class="table2">-->
        <!--<div class="table-title">-->
          <!--<p>素材订单</p>-->
          <!--<el-link type="primary">更多</el-link>-->
        <!--</div>-->
        <!--<el-table-->
                <!--:data="tableData"-->
                <!--stripe-->
                <!--style="width: 100%">-->
          <!--<el-table-column-->
                  <!--prop="date"-->
                  <!--label="日期"-->
                  <!--width="180">-->
          <!--</el-table-column>-->
          <!--<el-table-column-->
                  <!--prop="name"-->
                  <!--label="姓名"-->
                  <!--width="180">-->
          <!--</el-table-column>-->
          <!--<el-table-column-->
                  <!--prop="address"-->
                  <!--label="地址">-->
          <!--</el-table-column>-->
        <!--</el-table>-->
      <!--</div>-->

    <!--</div>-->
  </div>
</template>

<script>
	import {
		GetLineData,
		GetNowStatus,
	} from 'http/api/login'
	import {ERR_OK} from 'http/config'
	import {mapGetters} from 'vuex'
	import {timeFormatting} from 'common/js/mixins'

	let echarts = require('echarts')
	export default {
		name: "home",
		mixins: [timeFormatting],
		data() {
			return {
				date: new Date(),
				eChart: null,
				tableData: [],
				chartData: [],
				newTime: '',
				deviceData: {},
			}
		},
		mounted() {
			// this.initChart();
		},
		created() {
			this.newTime = this.dateFormat('y年m月d日', new Date())
			// this.GetLineData()
			// this.GetNowStatus()
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			GetLineData() {
				GetLineData({}).then(res => {
					if (res.code === ERR_OK) {
						this.chartData = res.data
					}
					this.initChart();
				})
			},
			GetNowStatus() {
				GetNowStatus({}).then(res => {
					if (res.code === ERR_OK) {
						this.deviceData = res.data
					}
				})
			},
			/**
			 * End
			 */
			initChart() {
				// 基于准备好的dom，初始化echarts实例
				var myChart = echarts.init(document.getElementById('lineChart'));

				// 绘制图表
				myChart.setOption({
					tooltip: {
						trigger: 'axis'
					},
					legend: {
						data: ['故障设备', '正常设备']
					},
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					toolbox: {
						feature: {
							saveAsImage: {}
						}
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						data: this.chartData.weeks
					},
					yAxis: {
						type: 'value'
					},
					series: [
						{
							name: '故障设备',
							type: 'line',
							stack: '总量',
							data: this.chartData.faultDev
						},
						{
							name: '正常设备',
							type: 'line',
							stack: '总量',
							data: this.chartData.runDev
						}
					]
				});
			},
		},
		computed: {
			...mapGetters(['user', 'config'])
		},
	}
</script>

<style scoped lang="scss">
  .home-content {
    text-align: center;
    padding-top: 200px !important;
    .welcome-div {
      width: 100%;
      height: 80px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      padding: 20px;

      .text {
        font-size: 20px;
        color: #303133;
      }

      .time {
        font-size: 14px;
        line-height: 30px;
        text-align: right;
        color: #909399;
      }
    }

    .device-div {
      width: 100%;
      height: 350px;
      margin-top: 20px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .echart-div {
        display: flex;

        #lineChart {
          width: 80%;
          height: 300px;
        }

        .right-div {
          width: 20%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #909399;

          div {
            width: 200px;
            height: 100px;
            padding: 10px 0;
            line-height: 40px;
          }

          .device-num {
            border-right: 1px solid #efefef;
          }

          .device-run {
          }
        }
      }
    }

    .bottom-table {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;

      div {
        width: 49%;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .table-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
