<template>
  <table-page class="index">
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>信息发布</el-breadcrumb-item>
        <el-breadcrumb-item>素材管理</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col>
          <span class="prefix">素材名称</span>
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
          <span class="prefix">上传者</span>
          <el-input
            class="prefix"
            v-model="creator"
            placeholder="请输入上传者"
            style="width: 200px"
            size="small"
            :clearable="true"
            @keyup.enter.native="getList"
          >
          </el-input>
          <span class="prefix">审核状态</span>
          <el-select
            class="prefix"
            v-model="statusCode"
            placeholder="请选择"
            size="small"
            style="width: 250px"
            :clearable="true"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
          <el-button
            @click="getList"
            size="small"
            type="primary"
            icon="el-icon-search"
            >搜索</el-button
          >
        </el-col>
        <div style="width: 400px; text-align: right">
          <el-button size="small" type="primary" v-if="canI.addstatic"
            >上传本地文件</el-button
          >
          <el-button size="small" type="primary" v-if="canI.adddynamic"
            >创建动态素材</el-button
          >
          <el-button size="small" type="danger" v-if="canI.bulkdelete"
            >批量删除</el-button
          >
        </div>
      </el-row>
    </template>

    <el-table
      v-if="canI.getlist"
      :data="list"
      @selection-change="handleSelectionChange"
      border
      stripe
      ref="table"
    >
      <el-table-column type="index" key="index"></el-table-column>
      <el-table-column
        key="selection"
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column prop="name" key="name" label="素材名"></el-table-column>
      <el-table-column
        prop="typeName"
        key="typeName"
        label="素材类型"
      ></el-table-column>
      <el-table-column key="size" label="大小">
        <template slot-scope="scope">
          {{
            !scope.row.size
              ? ""
              : scope.row.size > 1073741824
              ? (scope.row.size / 1073741824).toFixed(1) + "G"
              : scope.row.size > 1048576
              ? (scope.row.size / 1048576).toFixed(1) + "M"
              : scope.row.size > 1024
              ? (scope.row.size / 1024).toFixed(1) + "kb"
              : scope.row.size + "b"
          }}
        </template>
      </el-table-column>
      <el-table-column
        prop="statusName"
        key="statusName"
        label="审核状态"
      ></el-table-column>
      <el-table-column
        prop="creator"
        key="creator"
        label="上传者"
      ></el-table-column>
      <el-table-column
        prop="auditorName"
        key="auditorName"
        label="审核人"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        key="createTime"
        label="上传时间"
      ></el-table-column>
      <el-table-column prop="desc" key="desc" label="描述"></el-table-column>
      <el-table-column prop="operating" key="operating" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" v-if="canI.edit" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            v-if="canI.preview"
            type="success"
            @click="preview(scope.row)"
            >查看</el-button
          >
          <el-popconfirm
            v-if="canI.delete"
            confirm-button-text="好的"
            cancel-button-text="不用了"
            icon="el-icon-info"
            icon-color="red"
            title="确定删除该素材吗？"
            @confirm="handleDelete(scope.row)"
          >
            <el-button slot="reference" size="mini" type="danger"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <template v-slot:footer>
      <pagination
        :list="list"
        :page="pageIndex"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </template>
  </table-page>
</template>

<script>
import TablePage from "../../components/TablePage";
import pagination from "../../components/pagination/pagination";
import { MaterialApi } from "./program.js";
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/program";
import { ERR_OK } from "http/config";
export default {
  data() {
    return {
      name: "",
      creator: "",
      list: [],
      pageIndex: 0,
      total: 0,
      statusCode: "",
      statusOptions: [
        { code: "0", name: "审核通过" },
        { code: "1", name: "待审核" },
        { code: "2", name: "运行中" },
      ],
      canI: {},
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config"]),
  },
  async mounted() {
    const { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    console.log(code, data, msg);
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.getlist) {
        this.getList();
      }
    } else this.$message.error(msg);
  },
  methods: {
    GetRolePermissions() {},
    preview() {},
    handleDelete() {},
    handleEdit() {},
    handleSelectionChange() {},
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getList();
    },
    async getList() {
      const { pageIndex, pageSize, name, creator, statusCode } = this;
      const { code, data } = await MaterialApi.get({
        name,
        creator,
        statusCode,
        paging: 1,
        pageIndex,
        pageSize,
      });
      if (code == "200") {
        const { list, allCount } = data;
        this.list = list;
        this.total = allCount;
      } else {
        this.$message.error(res.msg);
      }
    },
  },

  components: { TablePage, pagination },
};
</script>

<style scoped>
.gap {
  margin: 20px auto;
}
.prefix {
  margin-right: 10px;
}
</style>                                                     