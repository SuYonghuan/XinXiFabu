<template>
  <table-page>
    <template v-slot:header>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col style="display:flex;"> </el-col>
        <div style="width: 400px; text-align: right">
          <el-button
            v-if="canI.addmapeditor"
            class="svg-suffix"
            type="primary"
            @click="showAdd"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#iconjia"></use></svg
            >新增</el-button
          >
        </div>
      </el-row>
    </template>
    <el-table :data="list" :max-height="$root.tableMaxHeight + 'px'">
      <el-table-column
        prop="index"
        key="index"
        type="index"
        label="序号"
      ></el-table-column>
      <el-table-column
        prop="name"
        key="name"
        label="地图名称"
      ></el-table-column>
      <el-table-column prop="mallKey" key="mallKey" label="地图类型">
        <template slot-scope="scope">
          {{ mallKeys[scope.row.mallKey] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        key="updateTime"
        label="更新时间"
      ></el-table-column>
      <el-table-column
        prop="operating"
        width="160px;"
        key="operating"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button class="svg-button" type="text" @click="preview(scope.row)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconyanjing"></use></svg
          ></el-button>
          <el-button class="svg-button" type="text" @click="edit(scope.row)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconbianji"></use></svg
          ></el-button>
          <el-button
            class="svg-button"
            type="text"
            @click="deleteRow(scope.row)"
            v-if="canI.deletemapeditor"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconshanchu"></use></svg
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="新增" append-to-body :visible.sync="showAddModal">
      <el-form
        :model="form"
        ref="form"
        label-width="140px"
        label-position="left"
        v-if="showAddModal"
      >
        <el-form-item
          prop="name"
          label="地图名称"
          :rules="[{ required: true, message: '地图名称不能为空' }]"
          ><el-input v-model="form.name" :maxlength="200"></el-input
        ></el-form-item>
        <el-form-item
          prop="mallKey"
          label="选择类型"
          :rules="[{ required: true, message: '类型不能为空' }]"
        >
          <el-select v-model="form.mallKey">
            <el-option
              v-for="(k, v) in mallKeys"
              :key="v"
              :label="k"
              :value="v"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </table-page>
</template>
<script>
import { mapGetters } from "vuex";
import { GetRolePermissions } from "http/api/mall";
import { ERR_OK } from "http/config";
import { cPostForYun } from "http/http";
export default {
  data() {
    return {
      canI: {},
      mallKeys: {},
      form: {},
      showAddModal: false,
      list: [],
      rules: [],
    };
  },
  computed: {
    ...mapGetters(["presentMenu", "config", "user"]),
  },

  async mounted() {
    const res = await cPostForYun("/Api/MapEditor/MapDataDict")();
    this.mallKeys = Object.entries(res.data)
      .map(([k, v]) => [v, k])
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    let { code, data, msg } = await GetRolePermissions({
      MenuCode: this.presentMenu.code,
    });
    if (code === ERR_OK) {
      this.canI = data
        .map(({ actionId }) => actionId)
        .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});
      if (this.canI.listmapeditor) {
        this.getList();
      }
    } else this.$message({ message: msg, type: "error" });
  },
  methods: {
    showAdd() {
      this.form = {};
      this.showAddModal = true;
    },
    edit({ mapAddress }) {
      window.open(mapAddress);
    },
    preview({ mapAddress }) {
      window.open(mapAddress);
    },
    async deleteRow(row) {
      try {
        await this.$confirm("此操作将永久删除, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const { mallCode, accountName: userName } = this.user;
        const { code, data, msg } = await cPostForYun("/Api/MapEditor/Del")({
          mallCode,
          userName,
          codes: [row.code],
        });
        this.$message({
          type: code === ERR_OK ? "success" : "error",
          message: msg,
        });
        this.getList();
      } catch (error) {
        this.$message({
          type: "info",
          message: "删除取消",
        });
      }
    },
    async getList() {
      const { mallCode, accountName: userName } = this.user;
      const { code, data, msg } = await cPostForYun("/Api/MapEditor/MapList")({
        mallCode,
        userName,
        paging: 0,
      });
      if (code == "200") {
        this.list = data;
      } else {
        this.$message({ message: msg, type: "error" });
      }
    },
    async submit() {
      try {
        const isvalid = await this.$refs.form.validate();
        const { mallCode, accountName: userName } = this.user;
        const { name, mallKey } = this.form;
        if (isvalid) {
          const { code, data, msg } = await cPostForYun("/Api/MapEditor/Add")({
            mallCode,
            userName,
            name,
            mallKey,
          });
          if (code !== "200") return this.$message.error(msg);
          this.$message.success(msg);
          this.showAddModal = false;
          this.getList();
        }
      } catch (error) {}
    },
  },
};
</script>
<style scoped lang="scss"></style>
