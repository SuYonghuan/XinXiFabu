<template>
  <table-page class="index schedule">
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>信息发布</el-breadcrumb-item>
        <el-breadcrumb-item>发布列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col>
          <span class="prefix">日程名称</span>
          <el-input
            class="prefix"
            v-model="name"
            placeholder="请输入素材名称"
            style="width: 200px"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <span class="prefix">发布人</span>
          <el-input
            class="prefix"
            v-model="publisher"
            placeholder="请输入发布人"
            style="width: 200px"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <el-button
            @click="getList"
            size="small"
            type="primary"
            icon="el-icon-search"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </template>

    <el-table v-if="canI.publishedlist" :data="list" height="680px" ref="table">
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        prop="name"
        key="name"
        label="日程名称"
      ></el-table-column>
      <el-table-column
        prop="playMode"
        key="playMode"
        column-key="playMode"
        label="播放方式"
      >
        <template slot-scope="scope">
          {{ playModes[scope.row.playMode] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="publisher"
        key="publisher"
        label="发布人"
      ></el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="创建人"
      ></el-table-column>
      <el-table-column
        prop="auditor"
        key="auditor"
        label="审核人"
      ></el-table-column>
      <el-table-column
        prop="addTime"
        key="addTime"
        label="发布时间"
        :formatter="dateFormatter"
      ></el-table-column>
      <el-table-column prop="desc" key="desc" label="描述">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div>
              {{ scope.row.desc }}
            </div>
            <div
              slot="reference"
              style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
            >
              {{ scope.row.desc }}
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="devNum" key="devNum" label="设备名称">
      </el-table-column>
    </el-table>
    <pagination
      :list="list"
      :page="pageIndex"
      :total="total"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import pagination from "../../components/pagination/pagination";
import { ScheduleApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";
import AddForm from "./schedule/AddForm";
import DetailForm from "./schedule/DetailForm";
import PublishForm from "./schedule/PublishForm";

export default {
  data() {
    return {
      name: "",
      publisher: "",
      list: [],
      pageIndex: 0,
      pageSize: 10,
      total: 0,
      canI: {},
      playModes: {},
      statusTypes: {
        0: "待审核",
        1: "审核通过",
        2: "不通过",
      },
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    const [playModes] = await Promise.all([ScheduleApi.getPlayModes()]);
    Object.assign(this, {
      playModes,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.publishedlist) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },

  methods: {
    dateFormatter(row) {
      let [date, time] = row.addTime.split("T");
      [time] = time.split(".");
      return `${date} ${time}`;
    },
    reset() {
      this.name = "";
      this.publisher = "";
      this.pageIndex = 0;
      this.list = [];
      this.total = 0;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getList();
    },
    async getList() {
      const { pageIndex, pageSize, name, publisher } = this;
      const { code, data, msg } = await ScheduleApi.getPublishedList({
        name,
        publisher,
        paging: 1,
        pageIndex,
        pageSize,
      });
      if (code == "200") {
        const { list, allCount } = data;
        this.list = list;
        this.total = allCount;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
  },

  components: { TablePage, pagination, AddForm, DetailForm, PublishForm },
};
</script>

<style scoped>
.gap {
  margin: 20px auto;
}
.prefix {
  margin-right: 10px;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.dialog-footer {
  text-align: center;
}
</style>
