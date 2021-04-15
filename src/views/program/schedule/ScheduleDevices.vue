<template>
  <div>
    <el-table :data="list">
      <el-table-column prop="devNum" label="设备名称"></el-table-column>
      <el-table-column prop="ip" label="IP" width="150"></el-table-column>
      <el-table-column prop="publisher" label="发布人"></el-table-column>
      <el-table-column
        prop="addTime"
        :formatter="dateFormatter"
        label="发布时间"
        width="190"
      ></el-table-column>
    </el-table>
    <el-pagination
      align="center"
      layout="prev, pager, next"
      :current-page.sync="pageIndex"
      @current-change="getList"
      :total="total"
    />
  </div>
</template>

<script>
import { ScheduleApi } from "../program.js";
export default {
  data() {
    return {
      list: [],
      total: 0,
      pageIndex: 1,
    };
  },
  props: ["code"],
  methods: {
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    async getList() {
      const { code, data, msg } = await ScheduleApi.getScheduleDevices({
        code: this.code,
        paging: 1,
        pageIndex: this.pageIndex,
        pageSize: 10,
      });
      if (code == "200") {
        const { list, allCount, allPage } = data;
        if (this.pageIndex > allPage) {
          this.total = allCount;
          this.pageIndex = allPage;
          return this.getList();
        }
        this.list = list;
        this.total = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
  },
  mounted() {
    this.getList();
  },
  watch: {
    code(val) {
      if (val) this.getList();
    },
  },
};
</script>

<style></style>
