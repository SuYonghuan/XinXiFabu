<template>
  <table-page>
    <template v-slot:header>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col style="display:flex;">
          <span class="meta1">楼栋</span>
          <el-select
            v-model="buildingCode"
            placeholder="请选择"
            @change="tabClick"
          >
            <el-option
              v-for="item of buildingData"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-col>
        <div style="width: 400px; text-align: right">
          <el-button
            class="svg-suffix"
            type="primary"
            v-if="pageMenu.addfloor"
            @click="handleEdit({})"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#iconjia"></use></svg
            >新增</el-button
          >
        </div>
      </el-row>
    </template>

    <!--  表格  -->
    <el-table :data="tableData" :max-height="$root.tableMaxHeight + 'px'">
      <el-table-column prop="name" label="楼层名称"></el-table-column>
      <el-table-column prop="addTime" label="添加时间">
        <template slot-scope="scope">{{
          timestampToTime(scope.row.addTime)
        }}</template>
      </el-table-column>
      <el-table-column prop="name" label="地图">
        <template slot-scope="scope">
          <img
            :src="scope.row.map"
            style="height: 30px"
            @click="clickImg(scope.row.map)"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="排序">
        <template slot-scope="scope">
          <i class="sort-i el-icon-top" @click="sort(scope.row, 1)"></i>
          <i class="sort-i el-icon-bottom" @click="sort(scope.row, 2)"></i>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120px">
        <template slot-scope="scope">
          <el-tooltip
            transition="none"
            effect="light"
            content="编辑"
            placement="top"
          >
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="pageMenu.editfloor"
                @click="handleEdit(scope.row)"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconbianji"></use></svg
              ></el-button>
            </span>
          </el-tooltip>
          <el-tooltip
            transition="none"
            effect="light"
            content="删除"
            placement="top"
          >
            <span class="tooltip-wrapper">
              <el-button
                class="svg-button"
                type="text"
                v-if="pageMenu.delfloor"
                @click="handleDelete(scope.row)"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconshanchu"></use></svg
              ></el-button>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px;">
      <pagination
        style="float:right"
        :list="tableData"
        :total="total"
        :page="currentPage"
        :pageSize="pageSize"
        @handleCurrentChange="handleCurrentChange"
        @handleSizeChange="handleSizeChange"
      ></pagination>
    </div>

    <!--  图片放大  -->
    <div class="max-img" v-show="maxImg" @click="maxDiv">
      <img :src="maxImg" alt="" />
    </div>

    <!--  发布  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="楼层名称" prop="name">
          <el-input
            type="text"
            v-model="editForm.name"
            placeholder="请输入楼层名称"
            maxlength="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="地图" prop="image">
          <el-upload
            class="avatar-uploader"
            :action="config.fileUrl + config.yunUpdateFile"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button
          type="primary"
          @click="submitUpForm('editForm')"
          :loading="loading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </table-page>
</template>

<script>
import transferView from "components/transfer-view/transfer-view";
import { timeFormatting } from "common/js/mixins";
import {
  GetRolePermissions,
  GetBuildingList,
  GetFloorList,
  AddFloor,
  FloorEdit,
  FloorDel,
  FloorOrderEdit,
} from "http/api/mall";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "deptManager",
  mixins: [timeFormatting],
  data() {
    return {
      search: {},
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      dialogVisible: false,
      dialogVisibleDevice: false,
      dialogTitle: "新增",
      editForm: {},
      tableChecked: [],
      deviceForm: {},
      rules: {
        name: [{ required: true, message: "请输入楼层名称", trigger: "blur" }],
      },
      buildingData: [],
      imageUrl: "",
      maxImg: "",
      buildingCode: "",
      pageMenu: {},
      loading: false,
    };
  },
  created() {
    this.GetRolePermissions();
    this.GetBuildingList();
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    GetRolePermissions() {
      const param = {
        MenuCode: this.presentMenu.code,
      };
      GetRolePermissions(param).then((res) => {
        if (res.code === ERR_OK) {
          for (let a = 0; a < res.data.length; a++) {
            this.pageMenu[res.data[a].actionId] = true;
          }
          // this.GetBuildingList()
          // console.log(this.pageMenu)
        }
      });
    },
    GetBuildingList() {
      const param = {
        UserName: this.user.accountName,
        MallCode: this.user.mallCode,
        Paging: "0",
        PageIndex: "",
        PageSize: "",
      };
      GetBuildingList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.buildingData = res.data;
          this.buildingCode = this.buildingData[0].code;
          this.getList(this.pageSize, this.currentPage);
          this.$forceUpdate();
        }
      });
    },
    getList(pageSize, page) {
      const param = {
        Code: this.buildingCode,
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      GetFloorList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          // console.log(this.tableData)
        }
      });
    },
    AddFloor(param) {
      AddFloor(param).then((res) => {
        this.loading = false;
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    FloorEdit(param) {
      FloorEdit(param).then((res) => {
        this.loading = false;
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    FloorDel(param) {
      FloorDel(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    FloorOrderEdit(param) {
      FloorOrderEdit(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    /**
     * End
     * @param val
     */
    //时间转换
    timestampToTime(item) {
      return this.dateFormat("yyyy-mm-dd hh:ii:ss", new Date(item));
    },
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
    //打开弹窗
    handleEdit(item) {
      this.dialogVisible = true;
      if (JSON.stringify(item) != "{}") {
        this.editForm = JSON.parse(JSON.stringify(item));
        this.imageUrl = this.editForm.map;
        console.log(this.editForm);
        this.dialogTitle = "编辑";
      }
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleDevice = false;
      this.$refs["editForm"].resetFields();
      this.imageUrl = "";
      this.editForm = {};
      this.loading = false;
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          const param = {
            Map: this.editForm.mapFile,
            BuildingCode: this.buildingCode,
            Name: this.editForm.name,
            MallCode: this.user.mallCode,
            UserName: this.user.accountName,
          };

          if (this.editForm.floorCode) {
            param.code = this.editForm.floorCode;
            param.FileGUID = this.editForm.mapFile;
            this.FloorEdit(param);
            return;
          }
          this.AddFloor(param);
        }
      });
    },
    //删除
    handleDelete(item) {
      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const param = {
            Code: [item.floorCode],
            MallCode: this.user.mallCode,
            UserName: this.user.accountName,
          };
          this.FloorDel(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //切换tab卡
    tabClick(e) {
      console.log(this.buildingCode);
      this.getList(this.pageSize, this.currentPage);
    },
    //放大图片
    clickImg(item) {
      this.maxImg = item;
    },
    //关闭大图
    maxDiv(item) {
      this.maxImg = "";
    },
    handleAvatarSuccess(res, file) {
      if (res.code === "200") {
        this.imageUrl = URL.createObjectURL(file.raw);
        this.editForm.mapFile = res.data.fileGuid;
      } else {
        this.$message.error("上传失败!");
      }
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 10;
      const type = ["image/jpg", "image/png", "image/jpeg"];

      if (type.indexOf(file.type) === -1) {
        this.$message.error("上传图片只能是 jpg、png格式!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 10MB!");
        return false;
      }
    },
    //排序
    sort(item, type) {
      if (
        (item.order == 0 && type == 1) ||
        (item.order == this.tableData.length - 1 && type == 2)
      ) {
        return;
      }
      const param = {
        Order: type == 1 ? item.order - 1 : item.order + 1,
        FloorCode: item.floorCode,
        MallCode: this.user.mallCode,
      };

      this.FloorOrderEdit(param);
    },
  },
  computed: {
    ...mapGetters(["presentMenu", "user", "config"]),
  },
  components: {
    transferView,
  },
};
</script>

<style>
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style scoped lang="scss">
.demo-form-inline {
  .right-button {
    float: right;
  }
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}

.max-img {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-height: 1080px;
    max-width: 1920px;
  }
}

.sort-i {
  font-size: 20px;
  cursor: pointer;
}
</style>
