<template>
  <div class="transfer-view">
    <el-row :gutter="20">
      <el-col :span="11">
        <el-table
                ref="staffTable"
                :data="staffList"
                :key="tableKey"
                :row-key="getRowKeys"
                v-loading="listLoading"
                max-height="450px"
                @row-dblclick="dblClickLeft"
                fit
                highlight-current-row
                @selection-change="handleStaffChange">
          <el-table-column type="selection" :reserve-selection="true" width="30"></el-table-column>
          <el-table-column prop="previewSrc" label="预览" width="60">
            <template slot-scope="scope">
              <img :src="scope.row.previewSrc" width="30" height="30" slot="reference">
            </template>
          </el-table-column>
          <el-table-column prop="programName" label="节目名称" sortable min-width="180">
            <template slot-scope="scope">
              <div class="overflow-div" slot="reference">{{scope.row.programName}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="progType" label="类型" sortable></el-table-column>
          <el-table-column label="有效期" min-width="230">
            <template slot-scope="scope">
              {{timestampToTime(scope.row.launchTime)}}至{{timestampToTime(scope.row.expiryDate)}}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1" style="text-align:center;">
        <el-button
                @click="addStaff"
                type="primary"
                :disabled="!staffData.length"
                icon="el-icon-arrow-right"
                circle
        ></el-button>
        <el-button
                @click="removeStaff"
                type="primary"
                :disabled="!selectedStaffData.length"
                icon="el-icon-arrow-left"
                circle
                style="margin-left: 0;margin-top: 10px;"
        ></el-button>
      </el-col>
      <el-col :span="11">
        <el-table
                ref="selectedStaffTable"
                :data="selectedStaffList"
                :key="tableKey"
                :row-key="getRowKeys"
                v-loading="listLoading"
                max-height="450px"
                @row-dblclick="dblClickRight"
                fit
                highlight-current-row
                @selection-change="handleSelectedStaffChange">
          <el-table-column type="selection" :reserve-selection="true" width="30"></el-table-column>
          <el-table-column prop="previewSrc" label="预览" width="60">
            <template slot-scope="scope">
              <img :src="scope.row.previewSrc" width="30" height="30" slot="reference">
            </template>
          </el-table-column>
          <el-table-column prop="programName" label="节目名称" sortable min-width="100">
            <template slot-scope="scope">
              <div class="overflow-div" slot="reference">{{scope.row.programName}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="progType" label="类型"></el-table-column>
          <el-table-column label="有效期" min-width="230">
            <template slot-scope="scope">
              {{timestampToTime(scope.row.launchTime)}}至{{timestampToTime(scope.row.expiryDate)}}
            </template>
          </el-table-column>
          <el-table-column label="排序" align="center" min-width="100">
            <template slot-scope="scope">
              <i class="sort-i el-icon-upload2" @click="sort(scope.$index,1)"></i>
              <i class="sort-i el-icon-top" @click="sort(scope.$index,2)"></i>
              <i class="sort-i el-icon-bottom" @click="sort(scope.$index,3)"></i>
              <i class="sort-i el-icon-download" @click="sort(scope.$index,4)"></i>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
	import {timeFormatting} from 'common/js/mixins'

	export default {
		name: "transfer-view",
		mixins: [timeFormatting],
		props: {
			List: {
				default: () => {
				},
				required: true
			},
		},
		data() {
			return {
				listLoading: true,
				staffList: [],
				selectedStaffList: [],
				staffData: [],
				selectedStaffData: [],
				tableKey: 0,
			}
		},
		created() {
			setTimeout(() => {
				this.listLoading = false
				this.staffList = this.List.unIncludeDevice
				this.selectedStaffList = this.List.includeDevice
			}, 500)
		},
		methods: {
			//时间转换
			timestampToTime(item) {
				return this.dateFormat('y-m-d h:i:s', new Date(item))
			},
			//排序
			sort(index, type) {
				if (this.selectedStaffList.length > 1) {
					if (type == 1) {
						let newArray = this.selectedStaffList.splice(index, 1);
						this.selectedStaffList = newArray.concat(this.selectedStaffList)
					} else if (type == 2) {
						if (index > 0) this.sortData(this.selectedStaffList, index - 1, index)
					} else if (type == 3) {
						if (index < this.selectedStaffList.length - 1) this.sortData(this.selectedStaffList, index + 1, index)
					} else if (type == 4) {
						let newArray = this.selectedStaffList.splice(index, 1);
						this.selectedStaffList.push(newArray[0])
					}

					this.$emit('changeTransfer', this.selectedStaffList)
				}
			},
			sortData(arr, index1, index2) {
				arr[index1] = arr.splice(index2, 1, arr[index1])[0];
				return arr;
			},
			getRowKeys(row) {
				return row.staffTypeId;
			},
			// 将左边表格选择项存入staffData中
			handleStaffChange(rows) {
				this.staffData = [];
				if (rows) {
					rows.forEach(row => {
						if (row) {
							this.staffData.push(row);
						}
					});
				}
			},
			// 左边表格选择项移到右边
			addStaff() {
				setTimeout(() => {
					this.$refs["staffTable"].clearSelection();
					this.$refs["selectedStaffTable"].clearSelection();
				}, 0);
				let repeat = false;
				this.selectedStaffList.forEach(item => {
					if (this.staffData[0] && item.code === this.staffData[0].code) {
						repeat = true;
						// alert("此员工已添加");
						return;
					}
				});
				if (repeat === false) {
					this.staffData.forEach(item => {
						this.selectedStaffList.push(item);
					});
					for (let i = 0; i < this.staffList.length; i++) {
						for (let j = 0; j < this.staffData.length; j++) {
							if (
								this.staffList[i] &&
								this.staffData[j] &&
								this.staffList[i].code === this.staffData[j].code
							) {
								this.staffList.splice(i, 1);
							}
						}
					}
					this.$emit('changeTransfer', this.selectedStaffList)
				}
			},
			// 右边表格选择项移到左边
			removeStaff() {
				setTimeout(() => {
					this.$refs["staffTable"].clearSelection();
					this.$refs["selectedStaffTable"].clearSelection();
				}, 0);
				this.selectedStaffData.forEach(item => {
					this.staffList.push(item);
				});
				for (let i = 0; i < this.selectedStaffList.length; i++) {
					for (let j = 0; j < this.selectedStaffData.length; j++) {
						if (
							this.selectedStaffList[i] &&
							this.selectedStaffData[j] &&
							this.selectedStaffList[i].code === this.selectedStaffData[j].code
						) {
							this.selectedStaffList.splice(i, 1);
						}
					}
				}
			},
			// 将右边表格选择项存入selectedStaffData中
			handleSelectedStaffChange(rows) {
				this.selectedStaffData = [];
				if (rows) {
					rows.forEach(row => {
						if (row) {
							this.selectedStaffData.push(row);
						}
					});
				}
			},
			//双击左边表格
			dblClickLeft(row) {
				for (let i = 0; i < this.staffList.length; i++) {
					if (this.staffList[i].code === row.code) {
						this.staffList.splice(i, 1);
						this.selectedStaffList.push(row);
					}
				}
				this.$emit('changeTransfer', this.selectedStaffList)
			},
			//双击右边表格
			dblClickRight(row) {
				for (let i = 0; i < this.selectedStaffList.length; i++) {
					if (this.selectedStaffList[i].code === row.code) {
						this.selectedStaffList.splice(i, 1);
						this.staffList.push(row);
					}
				}
				this.$emit('changeTransfer', this.selectedStaffList)
			},
		}
	}
</script>

<style scoped lang="scss">
  .transfer-view {
    .overflow-div {
      text-overflow: -o-ellipsis-lastline;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .sort-i {
      font-size: 20px;
      cursor: pointer;
    }
  }
</style>
