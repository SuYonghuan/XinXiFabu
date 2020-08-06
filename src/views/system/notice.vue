<template>
  <div class="deptManager-content">

    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-tabs type="border-card" style="margin-top: 20px" @tab-click="tabClick">
      <el-tab-pane v-for="item of tabData" :label="item">
        <!--  表格  -->
        <el-table :data="tableData" style="width: 100%;margin-top: 20px;" max-height="677px">
          <el-table-column label="标题">
            <template slot-scope="scope">
              素材到期提醒
            </template>
          </el-table-column>
          <el-table-column prop="msg" label="内容"></el-table-column>
          <el-table-column prop="name" label="操作">
            <template slot-scope="scope">
              <el-button type="danger" size="small" @click="handleDelete(scope.row)" v-show="tabTxt != '已读消息'">已读
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--  分页  -->
        <pagination class="page-div" :list="tableData" :total="total" :page="currentPage" :pageSize="pageSize"
                    @handleCurrentChange="handleCurrentChange" v-show="tabTxt == '已读消息'"></pagination>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
	import pagination from 'components/pagination/pagination'
	import transferView from 'components/transfer-view/transfer-view'
	import {timeFormatting} from 'common/js/mixins'
	import {
		GetNoReadMessage,
		GetAlreadyReadMessage,
		GetMessageInfo,
	} from 'http/api/login'
	import {ERR_OK} from 'http/config'
	import {mapGetters} from 'vuex'

	export default {
		name: "notice",
	  inject:['reload'],
		mixins: [timeFormatting],
		data() {
			return {
				tableData: [],
				total: 0,
				currentPage: 0,
				pageSize: 10,
				tabData: [
					'未读消息', '已读消息'
				],
				tabTxt: '',
			}
		},
		created() {
			this.GetNoReadMessage()
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			GetNoReadMessage() {
				GetNoReadMessage({}).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
					}
				})
			},
			GetAlreadyReadMessage(pageSize, page) {
				const param = {
					"paging": 1,
					"PageIndex": page,
					"PageSize": pageSize
				}
				GetAlreadyReadMessage(param).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data.list
						this.total = res.data.count
					}
				})
			},
			GetMessageInfo(param) {
				GetMessageInfo(param).then(res => {
					if (res.code === ERR_OK) {
						this.GetNoReadMessage()
						this.$message.success('操作成功');
						this.reload()
						return
					}
					this.$message.error(res.msg);
				})
			},
			/**
			 * End
			 * @param val
			 */
			//时间转换
			timestampToTime(item) {
				return this.dateFormat('y-m-d h:i:s', new Date(item))
			},
			//当前页码
			handleCurrentChange(val) {
				this.currentPage = val;
				this.GetAlreadyReadMessage(this.pageSize, val)
			},
			//切换tab卡
			tabClick(e) {
				this.tabTxt = e.label
				if (e.label == '已读消息') {
					this.GetAlreadyReadMessage(this.pageSize, this.currentPage)
					return
				}
				this.GetNoReadMessage()
			},
			//已读
			handleDelete(item) {
				this.GetMessageInfo({'Code': item.code})
			},
		},
		computed: {
			...mapGetters(['presentMenu', 'user', 'config'])
		},
		components: {
			pagination,
			transferView,
		},

	}
</script>

<style scoped lang="scss">
  .demo-form-inline {
    .right-button {
      float: right;
    }
  }

  .page-div {
    margin-top: 80px;
  }

  .time-tag {
    margin: 2px;
    cursor: pointer;
  }
</style>
