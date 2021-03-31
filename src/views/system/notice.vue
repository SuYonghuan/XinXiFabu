<template>
  <div class="deptManager-content">
    <el-tabs type="border-card" style="margin-top: 20px" @tab-click="tabClick">
      <el-tab-pane v-for="item of tabData" :label="item">
        <!--  表格  -->
        <el-table
          :data="tableData"
          style="width: 100%;margin-top: 20px;"
          max-height="677px"
        >
          <el-table-column label="标题">
            <template slot-scope="scope">
              素材到期提醒
            </template>
          </el-table-column>
          <el-table-column prop="msg" label="内容"></el-table-column>
          <el-table-column prop="name" label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleWatch(scope.row)"
                >查看</el-button
              >
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
                v-if="tabTxt != '已读消息'"
                >已读</el-button
              >
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteNotice(scope.row)"
                v-else
                >删除</el-button
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
          v-show="tabTxt == '已读消息'"
        ></pagination>
      </el-tab-pane>
    </el-tabs>

    <!--  查看详情  -->
    <el-dialog
      title="详情"
      :visible.sync="dialogVisibleDevice"
      width="50%"
      :before-close="handleClose"
      :close-on-click-modal="true"
      append-to-body
    >
      <el-form :label-width="'120'" ref="editForm">
        <el-form-item label="素材名称" prop="groupName">
          <el-input
            type="text"
            v-model="editForm.programName"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="到期日期" prop="groupName">
          <el-input
            type="text"
            v-model="editForm.expiryDate"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item :label="'已发布设备 ' + editForm.device.length + ' 台'">
          <el-table :data="editForm.device" style="width: 100%;height: 400px">
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="devNum" label="设备名称"></el-table-column>
            <el-table-column prop="ip" label="IP地址"></el-table-column>
            <el-table-column prop="floor" label="楼栋/楼层">
              <template slot-scope="scope">
                {{ scope.row.buildingName }}/{{ scope.row.floorName }}
              </template>
            </el-table-column>
            <el-table-column prop="mark" label="备注">
              <template slot-scope="scope">{{ scope.row.mark }}</template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import pagination from "components/pagination/pagination";
import transferView from "components/transfer-view/transfer-view";
import { timeFormatting } from "common/js/mixins";
import {
  GetNoReadMessage,
  GetAlreadyReadMessage,
  GetMessageInfo,
  DelMessage,
} from "http/api/login";
import { ERR_OK } from "http/config";
import { mapGetters } from "vuex";

export default {
  name: "notice",
  inject: ["reload"],
  mixins: [timeFormatting],
  data() {
    return {
      tableData: [],
      total: 0,
      currentPage: 0,
      pageSize: 10,
      tabData: ["未读消息", "已读消息"],
      tabTxt: "",
      dialogVisibleDevice: false,
      editForm: { device: [] },
    };
  },
  created() {
    this.GetNoReadMessage();
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    GetNoReadMessage() {
      GetNoReadMessage({}).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
        }
      });
    },
    GetAlreadyReadMessage(pageSize, page) {
      const param = {
        paging: 1,
        PageIndex: page,
        PageSize: pageSize,
      };
      GetAlreadyReadMessage(param).then((res) => {
        if (res.code === ERR_OK) {
          this.tableData = res.data.list;
          this.total = res.data.count;
        }
      });
    },
    DelMessage(param) {
      DelMessage(param).then((res) => {
        if (res.code === ERR_OK) {
          this.GetAlreadyReadMessage(this.pageSize, this.currentPage);
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    GetMessageInfo(param, type = 1) {
      GetMessageInfo(param).then((res) => {
        if (res.code === ERR_OK) {
          if (type == 1) {
            this.GetNoReadMessage();
            this.$message.success("操作成功");
            this.reload();
            return;
          }
          this.dialogVisibleDevice = true;
          this.editForm = res.data;
          this.editForm.device = [];
          if (this.editForm.list.length > 0) {
            for (let i = 0; i < this.editForm.list.length; i++) {
              this.editForm.device = this.editForm.device.concat(
                this.editForm.list[i].devlist
              );
            }
          }
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
      this.GetAlreadyReadMessage(this.pageSize, val);
    },
    //切换tab卡
    tabClick(e) {
      this.tabTxt = e.label;
      if (e.label == "已读消息") {
        this.GetAlreadyReadMessage(this.pageSize, this.currentPage);
        return;
      }
      this.GetNoReadMessage();
    },
    //已读
    handleDelete(item) {
      this.GetMessageInfo({ Code: item.code });
    },
    //查看
    handleWatch(item) {
      this.GetMessageInfo({ Code: item.code }, 2);
    },
    //删除已读消息
    handleDeleteNotice(item) {
      this.DelMessage({ Code: item.code });
    },
    //关闭
    handleClose() {
      this.dialogVisibleDevice = false;
      if (this.tabTxt == "未读消息") {
        this.GetNoReadMessage();
        this.reload();
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

<style scoped lang="scss">
.demo-form-inline {
  .right-button {
    float: right;
  }
}

.page-div {
  margin-top: 80px;
}

.time-tag {
  margin: 2px;
  cursor: pointer;
}
</style>
