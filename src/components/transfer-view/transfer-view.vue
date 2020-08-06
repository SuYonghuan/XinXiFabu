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
          <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
          <el-table-column prop="devNum" label="设备名称"></el-table-column>
          <el-table-column prop="ip" label="IP地址" sortable></el-table-column>
          <el-table-column prop="sName" label="分辨率"></el-table-column>
          <el-table-column label="楼栋/楼层">
            <template slot-scope="scope">
              {{scope.row.buildingName}}/{{scope.row.floorName}}
            </template>
          </el-table-column>
          <el-table-column prop="mark" label="备注"></el-table-column>
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
          <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
          <el-table-column prop="devNum" label="设备名称"></el-table-column>
          <el-table-column prop="ip" label="IP地址" sortable></el-table-column>
          <el-table-column prop="sName" label="分辨率"></el-table-column>
          <el-table-column label="楼栋/楼层">
            <template slot-scope="scope">
              {{scope.row.buildingName}}/{{scope.row.floorName}}
            </template>
          </el-table-column>
          <el-table-column prop="mark" label="备注"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
	export default {
		name: "transfer-view",
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

  }
</style>
