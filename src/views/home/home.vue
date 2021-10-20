<template>
  <div class="home-content">
    <div class="welcome-div">
      <p class="text">欢迎你来，{{ user.nickName }}</p>
      <p class="time">今天是 {{ newTime }}</p>
    </div>
    <div class="top-table">
      <div class="table2">
        <div id="bingChart"></div>
        <div class="table-right" v-if="chartData.totalGuideUser">
          <p><span>AR导航</span><span>{{ chartData.totalGuideUser.aiPercent }}%</span><span>{{ chartData.totalGuideUser.ai }}</span></p>
          <p><span>模拟导航</span><span>{{ chartData.totalGuideUser.simuPercent }}%</span><span>{{ chartData.totalGuideUser.simulation }}</span></p>
          <p><span>导航总人数</span><span>{{ chartData.totalGuideUser.totalNum }}</span></p>
        </div>
      </div>

      <div class="table1">
        <div class="table-title">
          <p>导航人数（7日）</p>
        </div>
        <div id="lineChart"></div>
      </div>
      <div class="table3">
        <div class="table-title">
          <p>导航次数（7日）</p>
        </div>
        <div id="lineChart1"></div>
      </div>
    </div>

    <div class="bottom-table">
      <div class="table2">
        <div id="bingChart1"></div>
        <div class="table-right" v-if="chartData.totalGuide">
          <p><span>AR导航</span><span>{{ chartData.totalGuide.aiPercent }}%</span><span>{{ chartData.totalGuide.ai }}</span></p>
          <p><span>模拟导航</span><span>{{ chartData.totalGuide.simuPercent }}%</span><span>{{ chartData.totalGuide.simulation }}</span></p>
          <p><span>导航总次数</span><span>{{ chartData.totalGuide.totalNum }}</span></p>
        </div>
      </div>

      <div class="table1">
        <div class="table-title">
          <p>业态导航排行榜（30日）</p>
        </div>
        <div id="formatChart"></div>
      </div>
      <div class="table3">
        <div class="table-title">
          <p>店铺导航排行榜（30日）</p>
        </div>
        <div id="shopChart"></div>
      </div>
    </div>
  </div>
</template>

<script>
	import {
		StatisticsBoard,
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
			}
		},
		mounted() {
			// this.initChart();
		},
		created() {
			this.newTime = this.dateFormat('y年m月d日', new Date())
			this.StatisticsBoard()
			// this.GetNowStatus()
      // this.$nextTick(()=>{
      //   this.initChart();
      // })
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			StatisticsBoard() {
				StatisticsBoard().then(res => {
          console.log(res,1111)
					if (res) {
						this.chartData = res
            this.initChart();
					}
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

        const guideUser = this.chartData.guideUser
        let newGuideUser = []
        for ( let i=0;i<guideUser.length;i++ ) {
          newGuideUser.push([guideUser[i].dataDay,guideUser[i].ai,guideUser[i].simulation])
        }

				// 绘制图表
				myChart.setOption({
          legend: {},
          tooltip: {},
          dataset: {
            source: [
              ['product', 'AR导航', '模拟导航'],
              ...newGuideUser
            ]
          },
          xAxis: { type: 'category' },
          yAxis: {},
          series: [{ type: 'bar' }, { type: 'bar' }]
				});

				// 基于准备好的dom，初始化echarts实例
				var myChart1 = echarts.init(document.getElementById('bingChart'));

        const totalguideUser = this.chartData.totalGuideUser

				// 绘制图表
				myChart1.setOption({
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center'
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: totalguideUser.ai, name: 'AR导航' },
                { value: totalguideUser.simulation, name: '模拟导航' }
              ]
            }
          ]
				});


        // 基于准备好的dom，初始化echarts实例
				var myChart2 = echarts.init(document.getElementById('lineChart1'));

        const guide = this.chartData.guide
        let newGuide = []
        for ( let i=0;i<guide.length;i++ ) {
          newGuide.push([guide[i].dataDay,guide[i].ai,guide[i].simulation])
        }

				// 绘制图表
				myChart2.setOption({
          legend: {},
          tooltip: {},
          dataset: {
            source: [
              ['product', 'AR导航', '模拟导航'],
              ...newGuide
            ]
          },
          xAxis: { type: 'category' },
          yAxis: {},
          // Declare several bar series, each will be mapped
          // to a column of dataset.source by default.
          series: [{ type: 'bar' }, { type: 'bar' }]
				});


        // 基于准备好的dom，初始化echarts实例
				var myChart3 = echarts.init(document.getElementById('formatChart'));

        const formatGuide = this.chartData.formatGuide
        let newformatName = []
        let newformatValue = []
        for ( let i=0;i<formatGuide.length;i++ ) {
          newformatName.push(formatGuide[i].name)
          newformatValue.push(formatGuide[i].count)
        }

				// 绘制图表
				myChart3.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {},
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
          },
          yAxis: {
            type: 'category',
            data: newformatName
          },
          series: [
            {
              type: 'bar',
              data: newformatValue
            }
          ]
				});

        // 基于准备好的dom，初始化echarts实例
				var myChart4 = echarts.init(document.getElementById('bingChart1'));

				// 绘制图表
				myChart4.setOption({
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center'
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: this.chartData.totalGuide.ai, name: 'AR导航' },
                { value: this.chartData.totalGuide.simulation, name: '模拟导航' }
              ]
            }
          ]
				});

        // 基于准备好的dom，初始化echarts实例
				var myChart5 = echarts.init(document.getElementById('shopChart'));

        const shopGuide = this.chartData.shopGuide
        let newShopName = []
        let newShopValue = []
        for ( let i=0;i<shopGuide.length;i++ ) {
          newShopName.push(shopGuide[i].name)
          newShopValue.push(shopGuide[i].count)
        }

				// 绘制图表
				myChart5.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          xAxis: {
            type: 'category',
            data: newShopName
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: newShopValue,
              type: 'bar'
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

    .top-table {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;

      div {
        width: 32%;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .table-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        box-shadow: none;
      }
      .table2{
        display: flex;
        margin-right: 50px;
        .table-right{
          width: 45%;
          box-shadow: none;
          text-align: left;
          padding-top: 150px;
          p{
            margin-bottom: 10px;
            width: 100%;
            display: flex;
            justify-content: space-between;
          }
        }
      }

      #lineChart,#bingChart,#lineChart1 {
        width: 100%;
        height: 300px;
        padding-top: 30px;
      }
      #bingChart{
        width: 50%;
        padding-top: 50px;
        height: 340px;
        box-shadow: none;
      }
    }
    .bottom-table {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;

      div {
        width: 32%;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .table-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        box-shadow: none;
      }

      .table2{
        display: flex;
        margin-right: 50px;
        .table-right{
          width: 45%;
          box-shadow: none;
          text-align: left;
          padding-top: 150px;
          p{
            margin-bottom: 10px;
            width: 100%;
            display: flex;
            justify-content: space-between;
          }
        }
      }

      #formatChart,#bingChart1,#shopChart {
        width: 100%;
        height: 300px;
      }
      #bingChart1{
        padding-top: 50px;
        height: 340px;
        box-shadow: none;
        width: 50%;
      }
    }
  }
</style>
