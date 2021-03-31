<template>
  <div class="device-details">
    <el-card class="box-card top-card">
      <div class="device-card">
        <div>
          <p class="device-name">设备名称：{{ deviceInfo.devNum }}</p>
          <p>IP地址：{{ deviceInfo.ip }}</p>
        </div>
        <p class="back-p" @click="back"><i class="el-icon-back"></i> 返回</p>
      </div>
    </el-card>

    <el-card class="box-card">
      <div class="device-card-title">
        基本信息
        <el-dropdown style="margin-left: 15px">
          <el-button type="primary" size="small">
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              ><p @click="handleEdit(1)">修改信息</p></el-dropdown-item
            >
            <el-dropdown-item
              ><p @click="handleEdit(2)">修改备注</p></el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="detail-table">
        <div>
          <p>
            MAC地址： <span>{{ deviceInfo.mac }}</span>
          </p>
          <p>
            分辨率： <span>{{ deviceInfo.screenInfo }}</span>
          </p>
        </div>
        <div>
          <p>
            所在楼栋： <span>{{ deviceInfo.building }}</span>
          </p>
          <p>
            所在楼层： <span>{{ deviceInfo.floor }}</span>
          </p>
        </div>
        <div>
          <p>
            关机时间：
            <span>{{
              deviceInfo.shutdownTime ? deviceInfo.shutdownTime : "-"
            }}</span>
          </p>
          <p>
            备注：
            <span>{{ deviceInfo.remarks ? deviceInfo.remarks : "-" }}</span>
          </p>
        </div>
      </div>
    </el-card>

    <el-tabs
      value="1"
      type="border-card"
      @tab-click="clickTab"
      style="margin-top: 20px;"
    >
      <el-tab-pane label="设备位置" name="1">
        <div class="map-div">
          <div id="threeDiv" @click="clickThree"></div>
          <div class="device-map">
            <p>
              设备点位：
              <el-input-number
                v-model="devCoordinate.yaxis"
                :min="0"
                :max="99999"
                @change="changeNavPoint"
                :controls="false"
              ></el-input-number>
            </p>
            <p>
              设备角度：
              <el-input-number
                @change="changeAngle"
                v-model="devCoordinate.angle"
                :min="-180"
                :max="180"
              ></el-input-number>
            </p>
            <p>
              <el-button type="primary" @click="clickMap">保存</el-button>
            </p>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="节目列表" name="2">
        <p>节目发布类型：</p>
        <div class="program-list">
          <el-card class="box-card program-item" v-for="item of programData">
            <img
              :src="item.previewSrc"
              alt=""
              @click="clickImage(item)"
              class="program-img"
            />
            <p>
              <i class="el-icon-date"></i>
              {{ timestampToTime(item.launchTime, "y-m-d") }} 至
              {{ timestampToTime(item.expiryDate, "y-m-d") }}
            </p>
          </el-card>
        </div>
      </el-tab-pane>
      <el-tab-pane label="管理部门列表" name="3">
        <el-table :data="departmentData">
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column prop="name" label="部门名称"></el-table-column>
          <el-table-column prop="addTime" label="设置时间">
            <template slot-scope="scope">
              {{ timestampToTime(scope.row.addTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!--  新增  -->
    <el-dialog
      title="修改信息"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      append-to-body
    >
      <el-form label-width="120px" :model="editForm" ref="editForm">
        <el-form-item v-show="type == 1" label="设备名称" prop="name">
          <el-input
            size="small"
            v-model="editForm.devNum"
            auto-complete="off"
            placeholder="请输入设备名称"
          ></el-input>
        </el-form-item>
        <el-form-item v-show="type == 2" label="备注" prop="name">
          <el-input
            size="small"
            v-model="editForm.remarks"
            auto-complete="off"
            placeholder="请输入备注"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose('editForm')">取 消</el-button>
        <el-button type="primary" @click="submitUpForm('editForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <bigImage
      :src="bigFile.src"
      :type="bigFile.type"
      v-if="bigFile"
      @closeImg="closeImg"
    ></bigImage>
  </div>
</template>

<script>
import {
  GetDeviceInfo,
  GetLocalProgram,
  GetDeptListByDeviceCode,
  DevNumEdit,
  RemarksEdit,
  GetDevCoordinate,
  DevCoordinateEdit,
} from "http/api/device";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";
import { timeFormatting } from "common/js/mixins";
import bigImage from "components/big-image/big-image";

export default {
  name: "device-details",
  mixins: [timeFormatting],
  data() {
    return {
      dialogVisible: false,
      editForm: {},
      type: 1,
      deviceInfo: {},
      devCoordinate: {},
      programData: [],
      departmentData: [],
      code: this.$route.query.code,
      bigFile: null,
    };
  },
  created() {
    this.GetDeviceInfo();
    // this.GetLocalProgram()
    this.GetDevCoordinate();
    // Config.setDeviceSite({floorOrder:0})
    // Config.getMapInfo("9d9ccf33-9ee6-49d7-8cc3-e1aaa75f896c","http://saas.1000my.com:8013","nbfbc",0);
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    GetDeviceInfo() {
      const param = {
        Code: this.code,
      };
      GetDeviceInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          this.deviceInfo = res.data;
          console.log(this.deviceInfo);
          Config.setDeviceSite({ floorOrder: this.deviceInfo.floorOrder });
          // Config.setDeviceSite({floorOrder:1})
          //商场Code，云地址，名称，当前楼栋
          Config.getMapInfo(this.user.mallCode, this.config.mapKey, 0);
          // Config.getMapInfo('398424aa-e79c-4033-977b-c8eba2b4e6b9',this.config.mapKey,0);
        }
      });
    },
    GetLocalProgram() {
      const param = {
        DevCode: this.code,
        EffcTime: this.dateFormat("y-m-d"),
      };
      GetLocalProgram(param).then((res) => {
        if (res.code === ERR_OK) {
          this.programData = res.data;
          // console.log(this.programData)
        }
      });
    },
    GetDevCoordinate() {
      const param = {
        Code: this.code,
      };
      GetDevCoordinate(param).then((res) => {
        if (res.code === ERR_OK) {
          this.devCoordinate = res.data;
          console.log(this.devCoordinate);
        }
      });
    },
    GetDeptListByDeviceCode() {
      const param = {
        DeviceCode: this.code,
      };
      GetDeptListByDeviceCode(param).then((res) => {
        if (res.code === ERR_OK) {
          this.departmentData = res.data;
          // console.log(this.departmentData)
        }
      });
    },
    DevNumEdit(param) {
      DevNumEdit(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.GetDeviceInfo();
          return;
        }
        this.$message.error(res.msg);
      });
    },
    RemarksEdit(param) {
      RemarksEdit(param).then((res) => {
        if (res.code === ERR_OK) {
          this.handleClose();
          this.$message.success(res.msg);
          this.GetDeviceInfo();
          return;
        }
        this.$message.error(res.msg);
      });
    },
    DevCoordinateEdit(param) {
      DevCoordinateEdit(param).then((res) => {
        if (res.code === ERR_OK) {
          this.$message.success(res.msg);
          this.GetDevCoordinate();
          return;
        }
        this.$message.error(res.msg);
      });
    },
    /**
     * End
     */
    //时间转换
    timestampToTime(item, type = "yyyy-mm-dd hh:ii:ss") {
      return this.dateFormat(type, new Date(item));
    },
    back() {
      this.$router.back();
    },
    handleEdit(index) {
      this.dialogVisible = true;
      this.type = index;
      this.editForm = JSON.parse(JSON.stringify(this.deviceInfo));
    },
    handleClose() {
      this.dialogVisible = false;
    },
    submitUpForm() {
      let param = { Code: this.code };
      if (this.type == 1) {
        param.DevNum = this.editForm.devNum;
        this.DevNumEdit(param);
      } else {
        param.Remarks = this.editForm.remarks;
        this.RemarksEdit(param);
      }
    },
    //切换tab
    clickTab(val) {
      if (val.index == 0) {
        this.GetDevCoordinate();
      } else if (val.index == 1) {
        this.GetLocalProgram();
      } else {
        this.GetDeptListByDeviceCode();
      }
    },
    //点击地图
    clickThree() {
      setTimeout(() => {
        if (deviceSite.navPoint >= 0) {
          this.devCoordinate.yaxis = deviceSite.navPoint;
          this.devCoordinate.angle = deviceSite.angle;
        }
      }, 10);
    },
    //修改设备点位
    changeNavPoint() {
      Config.setDeviceSite({ navPoint: this.devCoordinate.yaxis });
    },
    //修改设备角度
    changeAngle() {
      Map_QM.rotateSite(this.devCoordinate.angle);
    },
    //保存
    clickMap() {
      if (typeof this.devCoordinate.yaxis == "undefined") {
        this.$message.error("设备点位不能为空");
        return;
      }
      const param = {
        Code: this.code,
        Xaxis: this.devCoordinate.yaxis,
        Yaxis: this.devCoordinate.yaxis,
        Angle: this.devCoordinate.angle,
        AreaCode: "",
      };
      this.DevCoordinateEdit(param);
    },
    //放大图片
    clickImage(item) {
      this.bigFile = {};
      this.bigFile.src = item.filePath;
      this.bigFile.type = item.progType;
    },
    //关闭放大
    closeImg() {
      this.bigFile = null;
    },
  },
  computed: {
    ...mapGetters(["presentMenu", "config", "user"]),
  },
  components: {
    bigImage,
  },
};
</script>

<style scoped lang="scss">
.device-details {
  .box-card {
    margin-top: 20px;
  }

  .top-card {
    margin-top: 40px;

    .device-card {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .device-name {
        font-size: 18px;
        font-weight: 700;
      }

      .back-p {
        font-size: 18px;
        cursor: pointer;
      }
    }
  }

  .detail-table {
    div {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #909399;

      p {
        width: 50%;

        span {
          color: #303133;
        }
      }
    }
  }

  .device-card-title {
    display: flex;
    justify-content: space-between;
  }

  .program-list {
    display: flex;
    flex-wrap: wrap;

    .program-item {
      width: 250px;
      height: 300px;
      text-align: center;
      line-height: 20px;
      margin: 10px;

      .program-img {
        height: 250px;
        max-width: 210px;
      }
    }
  }

  .device-map {
    p {
      height: 60px;
      display: flex;
      align-items: center;
    }
  }

  .map-div {
    display: flex;
    #threeDiv {
      width: 1200px;
      height: 370px;
      overflow: hidden;
    }
    .device-map {
      width: 350px;
      padding: 50px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
