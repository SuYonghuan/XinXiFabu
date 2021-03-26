<template>
  <el-form>
    <el-form-item label="分辨率" prop="resolution">
      <el-select
        class="prefix"
        v-model="resolution"
        placeholder="请选择"
        size="small"
        style="width: 250px"
        @change="init"
      >
        <el-option
          v-for="data in resolutions"
          :key="data.code"
          :label="data.sName"
          :value="data.sName"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="发布时间">
      <el-date-picker
        v-model="releaseTime"
        type="datetime"
        value-format="yyyy-MM-ddTHH:mm:ss"
        placeholder="选择发布时间"
      >
      </el-date-picker>
    </el-form-item>
    <el-form-item label="生效时间">
      <el-date-picker
        v-model="effectTime"
        type="datetime"
        value-format="yyyy-MM-ddTHH:mm:ss"
        placeholder="选择生效时间"
      >
      </el-date-picker>
    </el-form-item>
    <el-row v-if="resolution">
      <el-col :span="12">
        <el-form-item label="日程选择" />
        <el-table :data="schedules" @selection-change="handleSelectionChange">
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column
            prop="addTime"
            label="创建时间"
            :formatter="dateFormatter"
          ></el-table-column>
        </el-table>
        <el-pagination
          align="center"
          layout="prev, pager, next"
          :current-page.sync="pageIndex"
          @current-change="getList"
          :total="total"
        >
        </el-pagination>
      </el-col>
      <el-col :span="12">
        <el-form-item label="设备选择" />
        <el-select v-model="deviceQueryType" @change="getDevices">
          <el-option
            v-for="type in deviceQueryTypes"
            :key="type.v"
            :value="type.v"
            :label="type.k"
          ></el-option>
        </el-select>

        <el-tree
          :data="devices"
          default-expand-all
          show-checkbox
          @check="handleDeviceCheck"
        ></el-tree>
      </el-col>
    </el-row>
    <el-form-item label="覆盖冲突">
      <el-switch v-model="confirm"> </el-switch>
    </el-form-item>
    <div style="text-align: right;">
      <el-button @click="$emit('closeForm')">取 消</el-button>
      <el-button
        type="primary"
        :disabled="!selectedSchedules.length || !selectedDevices.length"
        @click="submit"
        >发 布</el-button
      >
    </div>
  </el-form>
</template>

<script>
import { ScheduleApi } from "../program.js";
export default {
  data() {
    return {
      resolution: null,
      schedules: [],
      devices: [],
      selectedSchedules: [],
      selectedDevices: [],
      pageIndex: 1,
      total: 0,
      deviceQueryType: "floor",
      deviceQueryTypes: [
        { v: "floor", k: "按楼层筛选" },
        { v: "group", k: "分组筛选" },
      ],
      releaseTime: null,
      effectTime: null,
      confirm: false,
    };
  },
  props: ["showForm", "resolutions"],
  watch: {
    showForm() {
      this.reset();
    },
  },
  methods: {
    handleDeviceCheck(_, { checkedNodes }) {
      this.selectedDevices = checkedNodes.filter(({ children }) => !children);
    },
    handleSelectionChange(data) {
      this.selectedSchedules = data;
    },
    reset() {
      this.resolution = null;
      this.schedules = [];
      this.devices = [];
      this.selectedSchedules = [];
      this.selectedDevices = [];
      this.releaseTime = null;
      this.effectTime = null;
      this.confirm = false;
    },
    async init() {
      this.schedules = [];
      this.selectedSchedules = [];
      this.devices = [];
      this.selectedDevices = [];
      await Promise.all([this.getList(), this.getDevices()]);
    },
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    async getList() {
      const { pageIndex, resolution } = this;
      const { code, data, msg } = await ScheduleApi.getAuditedList({
        statusCode: 1,
        resolution,
        paging: 1,
        pageIndex,
        pageSize: 10,
      });
      if (code == "200") {
        const { list, allCount } = data;
        this.schedules = list;
        this.total = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
    async getDevices() {
      const { deviceQueryType, resolution } = this;
      const { code, data, msg } = await ScheduleApi.getDeviceList({
        searchMode: deviceQueryType,
        resolution,
      });
      if (code == "200") {
        this.devices = data.map(({ groupByName, devices }) => ({
          label: groupByName,
          children: devices.map((device) => ({
            ...device,
            label: device.devNum,
          })),
        }));
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
    async submit() {
      const {
        releaseTime,
        effectTime,
        selectedSchedules,
        selectedDevices,
        confirm,
      } = this;
      const { code, msg } = await ScheduleApi.publish({
        releaseTime,
        effectTime,
        schedules: selectedSchedules.map(({ code }) => code),
        devices: selectedDevices.map(({ code }) => code),
        confirm,
      });
      if (code === "200") {
        this.$message({ type: "success", message: msg });
        this.$emit("published");
      } else this.$message({ type: "error", message: msg });
    },
  },
};
</script>

<style></style>
