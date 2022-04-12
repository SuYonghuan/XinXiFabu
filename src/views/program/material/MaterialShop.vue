<template>
  <div>
    <H2>
      副广告绑定
      <el-popover trigger="hover" placement="top">
        仅开启人脸功能用户可使用副广告功能
        <span
          slot="reference"
          style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
        >
          <i class="el-icon-warning-outline"></i>
        </span> </el-popover
    ></H2>

    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="name" placeholder="店铺名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="name" label="店铺名称"></el-table-column>
      <el-table-column prop="name" label="楼栋/楼层">
        <template slot-scope="scope">
          {{ scope.row.buildingName }}/{{ scope.row.floorName }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240">
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="handleBinding(scope.row)"
            v-if="!scope.row.prog"
            >绑定</el-link
          >
          <el-link type="primary" @click="handleBinding(scope.row)" v-else
            >取消</el-link
          >
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col> </el-col>
      <pagination
        :list="list"
        :page="pageIndex"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </el-row>
  </div>
</template>

<script>
import { cPost } from "http/http";
const API = {
  getList: cPost("/Api/Material/MaterialToShopList"),
  bind: cPost("/Api/Material/SetMaterialToShop"),
};
export default {
  props: ["material"],
  data() {
    return { name: "", pageIndex: 1, pageSize: 10, total: 0, list: [] };
  },
  mounted() {
    this.getList();
  },
  methods: {
    async getList() {
      const { material, name, pageIndex, pageSize } = this;
      const { code, data, msg } = await API.getList({
        name,
        materialCode: material.code,
        paging: 1,
        pageIndex,
        pageSize,
      });
      if (code == "200") {
        const { list, allCount, allPage } = data;
        if (pageIndex > allPage) {
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
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getList();
    },
    async handleBinding(shop) {
      const { code, msg } = await API.bind({
        materialCode: this.material.code,
        shopCode: shop.code,
      });
      this.$message({
        message: msg,
        type: code === "200" ? "success" : "error",
      });
      this.getList();
      if (code === "200") this.$emit("change");
    },
  },
};
</script>

<style></style>
