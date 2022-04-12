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

    <el-tree
      v-if="deviceQueryType === 'group'"
      :data="devices"
      show-checkbox
      @check="handleDeviceCheck"
    ></el-tree>
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
        :disabled="!selectedDevices.length"
        @click="submit"
        >发 布</el-button
      >
    </div>
  </el-form>
</template>

<script>
import { cPost } from "http/http";
const getDeviceList = cPost("/Api/AppManager/VersionDeviceList");
const publish = cPost("/Api/AppManager/PublishVersion");
export default {
  data() {
    return {
      devices: [],
      selectedDevices: [],
      pageIndex: 1,
      total: 0,
      deviceQueryType: "group",
      deviceQueryTypes: [
        { v: "group", k: "分组筛选" },
        { v: "", k: "所有" },
      ],
    };
  },
  props: ["showForm", "app"],
  computed: {},
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
      await Promise.all([this.getDevices()]);
    },
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    async getDevices() {
      const { deviceQueryType } = this;
      this.devices = [];
      this.selectedDevices = [];
      const { code, data, msg } = await getDeviceList({
        searchMode: deviceQueryType,
        versionCode: this.app.code,
      });
      if (code == "200") {
        this.devices = !deviceQueryType
          ? data.map(({ devNum, code, floorName }) => ({
              label: devNum,
              key: code,
              floorName,
            }))
          : data.map(({ groupByName, devices }) => ({
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
      const { selectedDevices, app, deviceQueryType } = this;
      const devices = deviceQueryType
        ? selectedDevices.map(({ code }) => code)
        : selectedDevices;
      const { code, msg } = await publish({
        versionCode: app.code,
        devices,
        confirm: false,
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
