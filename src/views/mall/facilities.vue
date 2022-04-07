<template>
  <table-page>
    <template v-slot:header>
      <el-row class="gap" type="flex" justify="space-between">
        <el-col style="display:flex;">
          <span class="meta1">设施名称</span>
          <el-input
            class="input1"
            v-model="search.Name"
            placeholder="设施名称"
            size="small"
            :clearable="true"
            @keyup.enter.native="onSearch"
          >
          </el-input>

          <div class="btn1" @click="onSearch">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconsousuo"></use>
            </svg>
          </div>
          <div class="btn1" @click="replaySearch">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconqingchu"></use>
            </svg>
          </div>
        </el-col>
        <div style="width: 400px;display:flex;justify-content: flex-end;">
          <el-button
            style="float: right"
            class="svg-suffix"
            type="primary"
            v-if="pageMenu.addfacility"
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
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column
        prop="customFacilityName"
        label="设施名称"
      ></el-table-column>
      <el-table-column prop="name" label="类型名"></el-table-column>
      <el-table-column prop="name" label="图标">
        <template slot-scope="scope">
          <img
            :src="scope.row.fileFullPath"
            v-if="scope.row.fileFullPath"
            style="height: 30px"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-if="pageMenu.editfacility"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-if="pageMenu.delfacility"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div type="flex" style="margin-top: 16px;">
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
    <!--  发布  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
      class="dialog"
    >
      <el-form
        :label-width="'160px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="项目类型" prop="facilityType">
          <el-select
            v-model="editForm.facilityType"
            placeholder="请选择"
            @change="changeType"
            :disabled="dialogTitle === '编辑'"
          >
            <el-option
              v-for="item in facilitiesType"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型名" prop="name">
          <el-autocomplete
            class="inline-input"
            v-model="editForm.name"
            value-key="name"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            @select="handleSelect"
            :disabled="dialogTitle === '编辑'"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="类型名（英文）" prop="nameEN">
          <el-input
            type="text"
            v-model="editForm.nameEN"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="设施名称" prop="CustomFacilityName">
          <el-input
            type="text"
            v-model="editForm.customFacilityName"
            placeholder="请输入设施名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="设施名称（英文）" prop="CustomFacilityNameEN">
          <el-input
            type="text"
            v-model="editForm.customFacilityNameEN"
            placeholder="请输入英文设施名称"
          ></el-input>
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
import pagination from "components/pagination/pagination";
import transferView from "components/transfer-view/transfer-view";
import {
  GetRolePermissions,
  GetFacilityList,
  GetFacilitiesTypeList,
  GetMallFacilityList,
  AddFacility,
  EditFacility,
  DelFacility,
} from "http/api/mall";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "deptManager",
  data() {
    return {
      search: { Name: "" },
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogVisibleDevice: false,
      dialogTitle: "新增",
      editForm: {},
      tableChecked: [],
      deviceForm: {},
      rules: {
        facilityType: [
          { required: true, message: "请选择项目类型", trigger: "change" },
        ],
        name: [
          { required: true, message: "请输入类型名称", trigger: "change" },
        ],
      },
      pageMenu: {},
      loading: false,
      facilityTips: [],
      state1: "",
      state2: "",
      facilitiesType: [],
      imageUrl: "",
      modelList: [],
    };
  },
  created() {
    this.GetRolePermissions();
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
          this.pageMenu = res.data
            .map(({ actionId }) => actionId)
            .reduce((acc, nxt) => ({ ...acc, [nxt]: true }), {});

          this.getList(this.pageSize, this.currentPage);
          // console.log(this.pageMenu)
        }
      });
    },
    onSearch() {
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage, this.search);
    },
    replaySearch() {
      this.search = { Name: "" };
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    getList(pageSize, page) {
      const param = {
        Name: this.search.Name,
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
        MallCode: this.user.mallCode,
      };
      GetFacilityList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          console.log(res);
        }
      });
    },
    GetFacilitiesTypeList() {
      const param = {};
      GetFacilitiesTypeList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.facilitiesType = res.data;
          console.log(res);
        }
      });
    },
    GetMallFacilityList(FacilitiesTypeCode) {
      const param = {
        Name: "",
        FacilitiesTypeCode: FacilitiesTypeCode,
      };
      console.log(FacilitiesTypeCode);
      this.facilityTips = [];
      GetMallFacilityList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.facilityTips = res.data;
          console.log(res);
        }
      });
    },
    AddFacility(param) {
      AddFacility(param).then((res) => {
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
    EditFacility(param) {
      EditFacility(param).then((res) => {
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
    DelFacility(param) {
      DelFacility(param).then((res) => {
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
      this.dialogTitle = "新增";
      this.modelList = [];
      if (JSON.stringify(item) != "{}") {
        this.editForm = JSON.parse(JSON.stringify(item));
        this.modelList = this.editForm.customMatrixFilePath
          ? [{ name: this.editForm.customMatrixFileName }]
          : [];
        this.dialogTitle = "编辑";
        this.imageUrl = this.editForm.customFacilityFileFullPath;
      }
      this.GetFacilitiesTypeList();
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleDevice = false;
      this.$refs["editForm"].resetFields();
      this.editForm = {};
      this.loading = false;
      this.imageUrl = "";
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          const param = {
            FacilityCode: this.editForm.FacilityCode,
            MallCode: this.user.mallCode,
            FacilityType: this.editForm.facilityType,
            CustomFacilityName: this.editForm.customFacilityName,
            CustomFacilityNameEN: this.editForm.customFacilityNameEN,
            CustomFacilityFilePath: this.editForm.customFacilityFilePath,
            customMatrixFilePath: this.editForm.customMatrixFilePath,
          };
          if (this.editForm.code) {
            param.Code = this.editForm.code;
            this.EditFacility(param);
            return;
          }
          this.AddFacility(param);
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
            Codes: [item.code],
            MallCode: this.user.mallCode,
          };
          this.DelFacility(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //选中项目类型
    changeType(code) {
      this.editForm.facilityType = this.facilitiesType.filter((item) => {
        return item.code === code;
      })[0].name;
      this.GetMallFacilityList(code);
    },
    //模糊搜索
    querySearch(queryString, cb) {
      var facilityTips = this.facilityTips;
      console.log(queryString);
      var results = queryString
        ? facilityTips.filter(this.createFilter(queryString))
        : facilityTips;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (facility) => {
        return (
          facility.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    //选中类型
    handleSelect(item) {
      this.editForm.FacilityCode = item.code;
      this.editForm.nameEN = item.nameEN;
      this.editForm.fileCode = item.fileCode;
      this.editForm.filePath = item.filePath;
      console.log(item);
    },

    handleModelSuccess(res, file) {
      if (res.code === "200") {
        this.editForm.customMatrixFilePath = res.data.filePath;
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
  },
  computed: {
    ...mapGetters(["presentMenu", "user", "config"]),
  },
  components: {
    pagination,
    transferView,
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

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
.dialog .el-dialog {
  margin-top: 5vh !important;
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
  margin-top: 40px;
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}
</style>
