<template>
  <div class="deptManager-content">
    <!--  面包屑  -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  搜索  -->
    <el-form :inline="true" :model="search" class="demo-form-inline">
      <el-form-item label="时间">
        <el-date-picker
          v-model="search.time"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input v-model="search.name" placeholder="请输入关键字"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="replaySearch">清空</el-button>
      </el-form-item>
    </el-form>

    <!--  表格  -->
    <el-table :data="tableData" style="width: 100%" height="620px">
      <el-table-column prop="moduleName" label="操作模块"></el-table-column>
      <el-table-column prop="type" label="操作类型"></el-table-column>
      <el-table-column prop="addTime" label="操作时间"></el-table-column>
      <el-table-column prop="ip" label="IP地址"></el-table-column>
      <el-table-column prop="accountName" label="用户名"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)"
            >查看</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!--  分页  -->
    <pagination
      class="page-div"
      :list="tableData"
      :total="total"
      :page="currentPage"
      :pageSize="pageSize"
      @handleCurrentChange="handleCurrentChange"
      @handleSizeChange="handleSizeChange"
    ></pagination>

    <!--  查看  -->
    <el-dialog
      title="查看"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form :label-width="formLabelWidth" ref="editForm">
        <el-form-item label="用户名称:">
          {{ editForm.accountName }}
        </el-form-item>
        <el-form-item label="操作模块:">
          {{ editForm.moduleName }}
        </el-form-item>
        <el-form-item label="操作类型:">
          {{ editForm.type }}
        </el-form-item>
        <el-form-item label="操作内容:">
          <div class="scroll-div">
            {{ editForm.logMsg }}
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import pagination from "components/pagination/pagination";
import { QueryLogPageList } from "http/api/system";
import { ERR_OK } from "http/config";

export default {
  name: "deptManager",
  data() {
    return {
      search: { time: ["", ""] },
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      dialogVisible: false,
      editForm: {},
      formLabelWidth: "120px",
      rules: {
        name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList(this.pageSize, this.currentPage);
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    getList(pageSize, page) {
      const param = {
        Keywords: this.search.name,
        BeginTime: this.search.time[0],
        EndTime: this.search.time[1],
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      QueryLogPageList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
        }
      });
    },
    /**
     * End
     */

    //当前页码
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getList(this.pageSize, val);
    },
    //每页数量
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList(this.pageSize, this.currentPage);
    },
    //搜索
    onSearch() {
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //重置搜索
    replaySearch() {
      this.search = { time: ["", ""] };
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //打开弹窗
    handleEdit(item) {
      this.editForm = item;
      this.dialogVisible = true;
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
    },
  },
  components: {
    pagination,
  },
};
</script>

<style>
.el-range-separator {
  width: auto !important;
}
</style>
<style scoped lang="scss">
.demo-form-inline {
  margin-top: 40px;

  .right-button {
    float: right;
  }
}

.page-div {
  margin-top: 20px;
}

.scroll-div {
  width: 100%;
  max-height: 300px;
  overflow-x: hidden;
  line-height: 30px;
  margin-top: 5px;
}
</style>
