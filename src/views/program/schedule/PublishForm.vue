<template>
  <el-form>
    <el-form-item label="设备选择" />
    <el-select v-model="deviceQueryType" @change="getDevices">
      <el-option
        v-for="type in deviceQueryTypes"
        :key="type.v"
        :value="type.v"
        :label="type.k"
      ></el-option>
    </el-select>
    <div
      v-if="deviceQueryType === 'group'"
      style="width: 50%;padding-top: 10px;"
    >
      <div
        v-for="group in devices"
        :key="group.label"
        style="display: flex;align-items: baseline;"
      >
        <el-checkbox
          style="flex: 0 0 20px"
          @change="handleGroupCheckChange($event, group)"
        >
        </el-checkbox>
        <el-collapse style="flex: 1">
          <el-collapse-item>
            <template slot="title">
              {{ group.label }}<span v-if="group.isSyn">【同屏】</span>
            </template>
            <div v-for="device in group.children" :key="device.code">
              {{ device.label }}
            </div>
          </el-collapse-item></el-collapse
        >
      </div>
    </div>

    <el-transfer
      v-else
      filterable
      :filter-method="filterMethod"
      :titles="['所有设备', '已选设备']"
      filter-placeholder="请输入设备名称"
      v-model="selectedDevices"
      :data="devices"
    >
      <span slot-scope="{ option }"
        >{{ option.label }} <el-tag>{{ option.floorName }}</el-tag></span
      >
    </el-transfer>
    <div style="text-align: right;">
      <el-button @click="$emit('closeForm')">取 消</el-button>
      <el-button
        type="primary"
        :disabled="
          deviceQueryType ? !selectedGroups.length : !selectedDevices.length
        "
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
      devices: [],
      selectedDevices: [],
      selectedGroups: [],
      pageIndex: 1,
      total: 0,
      deviceQueryType: "group",
      deviceQueryTypes: [
        { v: "group", k: "分组筛选" },
        { v: "", k: "所有" },
      ],
    };
  },
  props: ["showForm", "schedule"],
  computed: {
    resolution() {
      return !this.schedule ? null : this.schedule.resolution;
    },
  },
  watch: {
    showForm(val) {
      this.reset();
      if (val) this.init();
    },
  },
  mounted() {
    this.init();
  },

  methods: {
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    handleGroupCheckChange(isChecked, group) {
      if (isChecked) this.selectedGroups = [...this.selectedGroups, group];
      else this.selectedGroups = this.selectedGroups.filter((g) => g !== group);
    },
    handleDeviceCheck(_, { checkedNodes }) {
      this.selectedDevices = checkedNodes.filter(({ children }) => !children);
    },
    reset() {
      this.devices = [];
      this.selectedDevices = [];
    },
    async init() {
      this.devices = [];
      this.selectedDevices = [];
      this.selectedGroups = [];
      await Promise.all([this.getDevices()]);
    },
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    async getDevices() {
      const { deviceQueryType, schedule } = this;
      this.devices = [];
      this.selectedDevices = [];
      const { code, data, msg } = await ScheduleApi.getDeviceList({
        scheduleCode: schedule.code,
        searchMode: deviceQueryType,
      });
      if (code == "200") {
        this.devices = !deviceQueryType
          ? data.map(({ devNum, code, floorName }) => ({
              label: devNum,
              key: code,
              floorName,
            }))
          : data.map(({ groupByName, isSyn, devices }) => ({
              label: groupByName,
              isSyn,
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
        selectedDevices,
        selectedGroups,
        schedule,
        deviceQueryType,
      } = this;
      const devices = deviceQueryType
        ? selectedGroups.reduce(
            (acc, nxt) => [...acc, ...nxt.children.map(({ code }) => code)],
            []
          )
        : selectedDevices;
      const { code, msg } = await ScheduleApi.publish({
        schedule: schedule.code,
        devices,
        confirm: false,
      });
      if (code === "200") {
        this.$message({ type: "success", message: msg });
        this.$emit("published");
      } else if (code === "409") {
        try {
          await this.$confirm(msg, "提示", {
            confirmButtonText: "覆盖",
            cancelButtonText: "取消",
            type: "warning",
          });
          const { code: code1, msg: msg1 } = await ScheduleApi.publish({
            schedule: schedule.code,
            devices,
            confirm: true,
          });
          if (code1 === "200") {
            this.$message({ type: "success", message: msg1 });
            this.$emit("published");
          } else this.$message({ type: "error", message: msg1 });
        } catch (error) {}
      } else this.$message({ type: "error", message: msg });
    },
  },
};
</script>

<style></style>
