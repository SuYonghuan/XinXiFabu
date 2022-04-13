<template>
  <table-page class="shop-page">
    <template v-slot:header>
      <div style="display:flex">
        <span class="meta1">店铺名称</span>
        <el-input
          class="input1"
          v-model="search.Name"
          placeholder="店铺名称、店铺编号"
          size="small"
          :clearable="true"
          style="flex: 0 0 170px;"
          @keyup.enter.native="onSearch"
        >
        </el-input>
        <span class="meta1">楼栋</span>
        <el-select
          class="input1"
          size="small"
          v-model="search.BuildingCode"
          placeholder="请选择"
          @change="changeBuilding1()"
        >
          <el-option
            v-for="item in buildingList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
        <span class="meta1">楼层</span>
        <el-select
          class="input1"
          size="small"
          v-model="search.FloorCode"
          placeholder="请选择"
        >
          <el-option
            v-for="item in floorList"
            :label="item.name"
            :value="item.floorCode"
            :key="item.floorCode"
          ></el-option>
        </el-select>

        <span class="meta1">业态</span>
        <el-select
          class="input1"
          size="small"
          v-model="search.ShopFormatCode"
          placeholder="请选择"
        >
          <el-option
            v-for="item in formatList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
        <span class="meta1">启用状态</span>
        <el-select
          class="input1"
          size="small"
          v-model="search.isShow"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in [
              { name: '启用', code: true },
              { name: '禁用', code: false },
            ]"
            :label="item.name"
            :value="item.code"
            :key="item.code"
            clearable
          ></el-option>
        </el-select>
        <span class="meta1">关键信息状况</span>
        <el-select
          size="small"
          class="input1"
          v-model="search.degree"
          clearable
          placeholder="关键信息状况"
        >
          <el-option
            v-for="name in [
              'Logo',
              '英文名称',
              '中文简介',
              '英文简介',
              '已完善',
            ]"
            :key="name"
            :label="name === '已完善' ? '已完善' : '缺' + name"
            :value="name"
          >
          </el-option>
        </el-select>

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
        <el-button
          class="svg-suffix"
          type="primary"
          v-if="pageMenu.addShop"
          style="margin-left: 8px;"
          @click="handleEdit({})"
          ><svg class="icon" aria-hidden="true">
            <use xlink:href="#iconjia"></use></svg
          >新增</el-button
        >
        <span
          class="btn1"
          v-if="pageMenu.syndata"
          style="margin-left:8px;"
          @click="handleSysData()"
        >
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconshuaxin"></use>
          </svg>
        </span>
      </div>
    </template>

    <!--  表格  -->
    <el-table
      :data="tableData"
      style="width: 100%;"
      :max-height="$root.tableMaxHeight + 'px'"
    >
      <el-table-column prop="name" label="店铺名称"></el-table-column>
      <el-table-column prop="nameEn" label="英文名称"></el-table-column>
      <el-table-column
        prop="shopFormat"
        label="所属业态"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="floorName"
        label="所属楼层"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="houseNum"
        label="门牌号"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="phone"
        label="联系方式"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="degree"
        key="degree"
        label="关键信息状况"
      ></el-table-column>
      <el-table-column label="启用状态" width="80">
        <template slot-scope="scope">
          <el-switch
            :value="scope.row.isShow"
            v-if="pageMenu.changeShopStatus"
            @change="changeShow(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-if="pageMenu.editShop"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-if="pageMenu.delShop"
            >删除</el-button
          >
          <el-button
            type="primary"
            size="small"
            @click="handleLabel(scope.row)"
            v-if="pageMenu.setshoplabel"
            >标签</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-row type="flex" style="margin-top: 16px;" justify="space-between">
      <el-col>
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.exportShop"
          @click="handleExcel()"
          >导出数据</el-button
        >
        <el-button
          class="svg-suffix s"
          plain
          v-if="pageMenu.exporttemplate"
          @click="handleExcelExport()"
          >导出模板</el-button
        >
        <el-upload
          style="display:inline-block;margin-left: 8px;"
          ref="upload"
          :action="config.mallYunUrl + '/api/FileManage/UpLoadFilesSec'"
          :show-file-list="false"
          :auto-upload="true"
          :accept="'.xls, .xlsx'"
          :on-success="handleShopSuccess"
        >
          <el-button
            slot="trigger"
            class="svg-suffix s"
            plain
            v-if="pageMenu.importshopdata"
            >导入店铺</el-button
          >
        </el-upload>
        <el-upload
          style="display:inline-block;margin-left: 8px;"
          ref="upload"
          :action="config.fileUrl + '/Api/MallFileManage/UpLoadLogoFiles'"
          :show-file-list="false"
          :auto-upload="true"
          :accept="'.zip'"
          :data="logoData"
          :on-success="handleLogoSuccess"
        >
          <el-button
            slot="trigger"
            class="svg-suffix s"
            plain
            v-if="pageMenu.UpLoadLogoFiles"
            >导入店铺LOGO</el-button
          >
        </el-upload>
      </el-col>
      <!--  分页  -->
      <pagination
        :list="tableData"
        :total="total"
        :page="currentPage"
        :pageSize="pageSize"
        @handleCurrentChange="handleCurrentChange"
        @handleSizeChange="handleSizeChange"
      ></pagination>
    </el-row>

    <!--  新增  -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleClose"
      append-to-body
    >
      <el-form
        :label-width="'120px'"
        :model="editForm"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="商铺名称" prop="name">
          <el-input
            type="text"
            v-model="editForm.name"
            class=""
            style="width: 40%"
            placeholder="请输入中文商铺名称"
          ></el-input>
          <el-input
            type="text"
            v-model="editForm.nameEn"
            style="width: 40%;margin-left: 10px;"
            placeholder="请输入英文商铺名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属业态" prop="shopFormat">
          <el-select
            v-model="editForm.shopFormat"
            placeholder="请选择业态"
            @change="changeFormat()"
          >
            <el-option
              v-for="item in formatList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
          <el-select
            v-model="editForm.secFormat"
            style="margin-left: 10px;"
            placeholder="请选择子业态"
            @change="changeFloor()"
          >
            <el-option
              v-for="item in formatInfo.child"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属楼栋楼层" prop="floorCode">
          <el-select
            v-model="editForm.buildingCode"
            placeholder="请选择楼栋"
            @change="changeBuilding()"
          >
            <el-option
              v-for="item in buildingList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
          <el-select
            v-model="editForm.floorCode"
            style="margin-left: 10px;"
            placeholder="请选择楼层"
            @change="changeFloor()"
          >
            <el-option
              v-for="item in floorList"
              :label="item.name"
              :value="item.floorCode"
              :key="item.floorCode"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属区域" prop="areaCode">
          <el-select v-model="editForm.areaCode" placeholder="请选择区域">
            <el-option label="暂无区域" value=""></el-option>
            <el-option
              v-for="item in regionList"
              :label="item.areaName"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门牌号" prop="houseNum">
          <el-input
            type="text"
            v-model="editForm.houseNum"
            class=""
            placeholder="请输入门牌号"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input
            type="text"
            v-model="editForm.phone"
            class=""
            placeholder="请输入联系方式"
          ></el-input>
        </el-form-item>
        <el-form-item label="营业时间" prop="businessHours">
          <el-input
            type="text"
            v-model="editForm.businessHours"
            class=""
            placeholder="请输入营业时间"
          ></el-input>
        </el-form-item>
        <el-form-item label="商铺LOGO" prop="logo">
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
        <el-form-item label="简介" prop="intro">
          <el-input
            type="textarea"
            style="width: 40%;"
            rows="5"
            maxlength="2000"
            :show-word-limit="true"
            v-model="editForm.intro"
            placeholder="请输入中文简介"
          ></el-input>
          <el-input
            type="textarea"
            style="width: 40%;margin-left: 10px;"
            rows="5"
            maxlength="2000"
            :show-word-limit="true"
            v-model="editForm.introEn"
            placeholder="请输入英文简介"
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

    <!--  设置标签  -->
    <el-dialog
      title="设置标签"
      :visible.sync="dialogVisibleLabel"
      width="50%"
      :before-close="handleClose"
      :close-on-click-modal="true"
      append-to-body
    >
      <el-form label-width="60">
        <el-form-item>
          <div>
            <div v-for="items of labelList" :key="items.name">
              <p>{{ items.name }}</p>
              <el-checkbox
                class="checkbox-div"
                v-for="item of items.child"
                v-model="labelActive"
                :disabled="item.type"
                :label="item.code"
                :key="item.code"
                border
              >
                {{ item.name }}
              </el-checkbox>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button
          type="primary"
          @click="submitLbForm('editForm')"
          :loading="loading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </table-page>
</template>

<script>
import transferView from "components/transfer-view/transfer-view";
import {
  GetRolePermissions,
  PageShopList,
  GetBuildingList,
  GetShopFormatList,
  GetShopFormatInfo,
  GetFloorList,
  ShopAdd,
  GetShopInfo,
  ShopEdit,
  ShopDel,
  ChangeShopStatus,
  QueryShopList,
  GetSynData,
  GetShopLabelList,
  SetLabel,
  GetRegionList,
  ExportTemplate,
  ImportShopData,
  UpLoadLogoFiles,
} from "http/api/mall";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "deptManager",
  data() {
    return {
      search: {
        Name: "",
        FloorCode: "",
        BuildingCode: "",
        ShopFormatCode: "",
      },
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      dialogVisible: false,
      dialogVisibleLabel: false,
      dialogTitle: "新增",
      editForm: {
        logo: "",
        floorCode: "",
        secFormat: "",
        nameEn: "",
        introEn: "",
      },
      tableChecked: [],
      deviceForm: {},
      rules: {
        name: [{ required: true, message: "请输入商铺名称", trigger: "blur" }],
        shopFormat: [
          { required: true, message: "请选择所属业态", trigger: "blur" },
        ],
        floorCode: [
          { required: true, message: "请选择所属楼层", trigger: "blur" },
        ],
        houseNum: [
          { required: true, message: "请输入商铺编号", trigger: "blur" },
        ],
        logo: [{ required: true, message: "请上传logo信息", trigger: "blur" }],
      },
      building: [
        { label: "1栋", value: "1" },
        { label: "2栋", value: "2" },
      ],
      imageUrl: "",
      pageMenu: {},
      buildingList: [],
      formatList: [],
      formatInfo: {},
      floorList: [],
      excelData: [],
      labelList: [],
      shopInfo: {},
      labelActive: [],
      labelActiveBrand: [],
      loadingStatus: false,
      regionList: [],
      logoData: {},
      loading: false,
    };
  },
  created() {
    this.GetRolePermissions();
    this.GetBuildingList();
    this.GetShopFormatList();
    this.GetRegionList();
    this.logoData.MallCode = this.user.mallCode;
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
          this.getList(this.pageSize, this.currentPage);
          console.log(this.pageMenu);
        }
      });
    },
    getList(pageSize, page) {
      const param = {
        Name: this.search.Name,
        FloorCode: this.search.FloorCode,
        BuildingCode: this.search.BuildingCode,
        ShopFormatCode: this.search.ShopFormatCode,
        degree: this.search.degree,
        isShow: this.search.isShow,
        MallCode: this.user.mallCode,
        UserName: this.user.accountName,
        Paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      PageShopList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.allCount;
          // console.log(this.tableData)
        }
      });
    },
    GetBuildingList() {
      const param = { MallCode: this.user.mallCode };
      GetBuildingList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.buildingList = res.data;
        }
      });
    },
    GetShopFormatList() {
      const param = { MallCode: this.user.mallCode };
      GetShopFormatList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.formatList = res.data;
        }
      });
    },
    GetShopFormatInfo(code) {
      const param = {
        Code: code,
      };
      GetShopFormatInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          this.formatInfo = res.data;
        }
      });
    },
    GetFloorList(code) {
      const param = {
        Code: code,
      };
      GetFloorList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.floorList = res.data;
        }
      });
    },
    ShopAdd(param) {
      ShopAdd(param).then((res) => {
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
    ShopEdit(param) {
      ShopEdit(param).then((res) => {
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
    ChangeShopStatus(param) {
      ChangeShopStatus(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    GetShopInfo(code) {
      const param = { code: code };
      GetShopInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          this.editForm = res.data;
          this.imageUrl = res.data.logoPath;
          this.GetShopFormatInfo(res.data.shopFormat);
          this.GetFloorList(res.data.buildingCode);
        }
      });
    },
    ShopDel(param) {
      ShopDel(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.getList(this.pageSize, this.currentPage);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    GetSynData() {
      GetSynData({}).then((res) => {
        this.loadingStatus = false;
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    QueryShopList() {
      const param = {
        Name: this.search.Name,
        FloorCode: this.search.FloorCode,
        BuildingCode: this.search.BuildingCode,
        ShopFormatCode: this.search.ShopFormatCode,
        MallCode: this.user.mallCode,
        UserName: this.user.accountName,
        Paging: 1,
        PageIndex: 1,
        PageSize: 10,
      };
      QueryShopList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.excelData = res.data;
          this.export2Excel();
        }
      });
    },
    GetShopLabelList() {
      const param = {
        ShopCode: this.shopInfo.code,
      };
      GetShopLabelList(param).then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data);
          //合并各种状态标签
          let allLabels = [];
          allLabels = res.data.alreadylist.concat(res.data.labels);
          if (res.data.brandLabels.length > 0) {
            for (let i = 0; i < res.data.brandLabels.length; i++) {
              res.data.brandLabels[i].type = true;
              allLabels.push(res.data.brandLabels[i]);
              this.labelActive.push(res.data.brandLabels[i].code);
              this.labelActiveBrand.push(res.data.brandLabels[i].code);
            }
          }

          //标签分组
          let labelList = res.data.alllabels;
          for (let i = 0; i < labelList.length; i++) {
            labelList[i].child = [];
            for (let j = 0; j < allLabels.length; j++) {
              if (labelList[i].code === allLabels[j].parentCode) {
                labelList[i].child.push(allLabels[j]);
              }
            }
          }
          this.labelList = labelList;

          //已选中标签
          if (res.data.alreadylist.length > 0) {
            for (let i = 0; i < res.data.alreadylist.length; i++) {
              this.labelActive.push(res.data.alreadylist[i].code);
            }
          }
          console.log(this.labelList);
        }
      });
    },
    SetLabel(param) {
      SetLabel(param).then((res) => {
        this.loading = false;
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    GetRegionList() {
      const param = {
        MallCode: this.user.mallCode,
      };
      GetRegionList(param).then((res) => {
        if (res.code === ERR_OK) {
          this.regionList = res.data;
          console.log(this.regionList);
        }
      });
    },
    ExportTemplate() {
      const param = {
        MallCode: this.user.mallCode,
        username: this.user.accountName,
      };
      ExportTemplate(param).then((res) => {
        if (res.code === ERR_OK) {
          window.location.href = res.data;
          console.log(res.data);
        }
      });
    },
    ImportShopData(FileGuid) {
      const param = {
        MallCode: this.user.mallCode,
        username: this.user.accountName,
        FileGuid: FileGuid,
      };
      ImportShopData(param).then((res) => {
        if (res.code === ERR_OK) {
          this.getList(this.pageSize, this.currentPage);
          this.$message.success(res.msg);
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
      this.pageSize = val;
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //搜索
    onSearch() {
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage, this.search);
    },
    //重置搜索
    replaySearch() {
      this.search = {};
      this.currentPage = 1;
      this.getList(this.pageSize, this.currentPage);
    },
    //打开弹窗
    handleEdit(item) {
      this.dialogVisible = true;
      if (JSON.stringify(item) != "{}") {
        this.GetShopInfo(item.code);
        this.dialogTitle = "编辑";
      }
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleLabel = false;
      this.$refs["editForm"] && this.$refs["editForm"].resetFields();
      this.editForm = {
        logo: "",
        floorCode: "",
        secFormat: "",
        nameEn: "",
        introEn: "",
      };
      this.formatInfo = {};
      this.floorList = [];
      this.imageUrl = "";
      this.shopInfo = {};
      this.labelList = [];
      this.labelActive = [];
      this.loading = false;
    },
    //提交
    submitUpForm(item) {
      this.$refs[item].validate((valid) => {
        if (valid) {
          this.loading = true;
          const param = {
            Code: "",
            ShopFormat: this.editForm.shopFormat,
            SecFormat: this.editForm.secFormat,
            BuildingCode: this.editForm.buildingCode,
            FloorCode: this.editForm.floorCode,
            Name: this.editForm.name,
            NameEn: this.editForm.nameEn,
            HouseNum: this.editForm.houseNum,
            Phone: this.editForm.phone,
            OpenTime: "",
            BusinessHours: this.editForm.businessHours,
            Logo: this.editForm.logo,
            Haswifi: 0,
            SupportQueuing: 0,
            Intro: this.editForm.intro,
            FileID: "",
            AreaCode: this.editForm.areaCode,
            IntroEN: this.editForm.introEn,
            MallCode: this.user.mallCode,
            UserName: this.user.accountName,
            BrandCode: "",
          };

          if (this.editForm.code) {
            param.Code = this.editForm.code;
            this.ShopEdit(param);
            return;
          }
          this.ShopAdd(param);
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
          const param = { Code: item.code, MallCode: this.user.mallCode };
          this.ShopDel(param);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //上传图片
    handleAvatarSuccess(res, file) {
      if (res.code === "200") {
        this.imageUrl = URL.createObjectURL(file.raw);
        this.editForm.logo = res.data.fileGuid;
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
    //选中业态
    changeFormat() {
      this.formatInfo = {};
      this.editForm.secFormat = "";
      this.GetShopFormatInfo(this.editForm.shopFormat);
    },
    //选中楼栋
    changeBuilding() {
      this.floorList = [];
      this.editForm.floorCode = "";
      this.GetFloorList(this.editForm.buildingCode);
    },
    //选中楼层
    changeFloor() {
      this.$forceUpdate();
    },
    //选中楼栋
    changeBuilding1() {
      this.floorList = [];
      this.GetFloorList(this.search.BuildingCode);
    },
    //修改启用状态
    changeShow(item) {
      const param = {
        Code: item.code,
        IsShow: !item.isShow,
        UserName: this.user.accountName,
        MallCode: this.user.mallCode,
      };
      this.ChangeShopStatus(param);
    },
    //同步数据
    handleSysData() {
      this.loadingStatus = true;
      this.GetSynData();
    },
    //标签管理
    handleLabel(item) {
      this.shopInfo = item;
      this.GetShopLabelList();
      this.dialogVisibleLabel = true;
    },
    //设置标签
    submitLbForm() {
      this.loading = true;
      const param = {
        LabelCodeList: this.labelActive,
        ObjectCode: this.shopInfo.code,
        MallCode: this.user.mallCode,
      };
      this.SetLabel(param);
    },
    //导出excel
    handleExcel() {
      this.QueryShopList();
    },
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require("../../vendor/Export2Excel");
        //头
        const tHeader = [
          "店铺名称",
          "所属业态",
          "所属楼层",
          "门牌号",
          "联系方式",
        ];
        //对应的标签
        const filterVal = [
          "name",
          "shopFormat",
          "floorName",
          "houseNum",
          "phone",
        ];
        //标签对应的内容  是一个数组结构
        const list = this.excelData;
        //一个方法 我也不知道干嘛的
        const data = this.formatJson(filterVal, list);
        export_json_to_excel(tHeader, data, "店铺数据");
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    //导出excel模板
    handleExcelExport() {
      this.ExportTemplate();
    },
    //导入店铺
    handleShopSuccess(res, file) {
      if (res.code === "200") {
        this.ImportShopData(res.data.fileGuid);
      } else {
        this.$message.error("上传失败!");
      }
    },
    //导入店铺logo
    handleLogoSuccess(res, file) {
      if (res.code === "200") {
        this.$message.success("上传成功!");
      } else {
        this.$message.error("上传失败!");
      }
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
<style lang="scss">
#app {
  .shop-page {
    .meta1 {
      margin-right: 8px;
    }
    .input1 {
      flex: 1;
      width: auto;
      margin-right: 8px;
      input {
        width: 100%;
      }
    }
  }
}
</style>
<style scoped lang="scss">
.gap {
  margin: 20px auto;
}
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

.el-dialog {
}
</style>
<style scoped lang="scss">
.demo-form-inline {
  .right-button {
    float: right;
  }
}

.bottom-div {
}

.bottom-button {
  float: right;
  margin-top: -40px;
  display: flex;
  .el-button {
    margin: 0 5px;
  }
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}

.checkbox-div {
  margin-top: 10px;
  margin-right: 0;
  margin-left: 10px;
}

/deep/.el-textarea .el-input__count {
  height: 12px;
  line-height: 12px;
}
</style>
