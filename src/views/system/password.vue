<template>
  <div class="password-content">
    <!--  面包屑  -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <p class="content-p">
        <span>密码长度</span>
        <span>
          最小长度
          <el-input-number
            :min="6"
            :max="15"
            v-model="list.minLength"
          ></el-input-number>
          位 / 最大长度
          <el-input-number
            :min="6"
            :max="15"
            v-model="list.maxLength"
          ></el-input-number>
          位
          <el-button
            style="margin-left: 20px;"
            type="primary"
            @click="clickSubmit(1)"
            >保存</el-button
          >
        </span>
      </p>
      <p class="remark-p">
        备注：密码可配置最小长度不低于6位，可配置最大长度不高于15位。
      </p>
      <el-divider></el-divider>
      <p class="content-p">
        <span>密码复杂性(包括但不限于)</span>
        <span>
          组合方式:
          <el-radio
            v-for="item of complexity"
            v-model="list.complexity"
            :label="item.value"
            >{{ item.name }}</el-radio
          >
          <el-button
            style="margin-left: 20px;"
            type="primary"
            @click="clickSubmit(2)"
            >保存</el-button
          >
        </span>
      </p>
      <p class="remark-p">
        备注：密码由数字（0-9）、大小写字母（a-z,A-Z）和特殊符号(!@#$%^&*)组成，禁止使用连续或相同的数字、字母组合（如123456等）和其他易于破译的组合作为密码，区分大小写。
      </p>
      <el-divider></el-divider>
      <p class="content-p">
        <span>密码有效期</span>
        <span>
          有效时间:
          <el-input-number
            :min="1"
            :max="90"
            v-model="list.expirationDate"
          ></el-input-number>
          天
          <el-button
            style="margin-left: 20px;"
            type="primary"
            @click="clickSubmit(3)"
            >保存</el-button
          >
        </span>
      </p>
      <p class="remark-p">
        备注：密码有效期到期之后，用户登录时系统强制进行密码修改，新密码不能与最近5次密码记录重复。
      </p>
      <el-divider></el-divider>
      <p class="content-p">
        <span>密码连续错误</span>
        <span>
          连续输错:
          <el-input-number
            :min="3"
            :max="5"
            v-model="list.errorCount"
          ></el-input-number>
          次
          <el-button
            style="margin-left: 20px;"
            type="primary"
            @click="clickSubmit(4)"
            >保存</el-button
          >
        </span>
      </p>
      <p class="remark-p">
        备注：连续输错次数超过设定值之后，将会锁定账号，需要管理员账号进行解锁。
      </p>
    </el-card>
  </div>
</template>

<script>
import { GetConfig, UpdateConfig } from "http/api/system";
import { ERR_OK } from "http/config";

export default {
  name: "password",
  data() {
    return {
      complexity: [
        { name: "字母+数字", value: 0 },
        { name: "字母+符号", value: 1 },
        { name: "数字+符号", value: 2 },
        { name: "字母+数字+符号", value: 3 },
      ],
      list: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /**
     * 网络请求
     * @param val
     */
    getList() {
      const param = {};
      GetConfig(param).then((res) => {
        if (res.code === ERR_OK) {
          this.list = res.data;
        }
      });
    },
    UpdateConfig(param) {
      UpdateConfig(param).then((res) => {
        if (res.code === ERR_OK) {
          this.getList();
          this.$message.success(res.msg);
          return;
        }
        this.$message.error(res.msg);
      });
    },
    /**
     * End
     */
    clickSubmit(type) {
      let param = {};
      if (type == 1) {
        param = {
          FieldName: "length",
          FieldValue: this.list.minLength,
          MaxFieldValue: this.list.maxLength,
        };
      } else if (type == 2) {
        param = {
          FieldName: "complex",
          FieldValue: this.list.complexity,
        };
      } else if (type == 3) {
        param = {
          FieldName: "expire",
          FieldValue: this.list.expirationDate,
        };
      } else if (type == 4) {
        param = {
          FieldName: "error",
          FieldValue: this.list.errorCount,
        };
      }
      this.UpdateConfig(param);
    },
  },
};
</script>

<style scoped lang="scss">
.box-card {
  margin-top: 40px;

  .content-p {
    height: 40px;
    line-height: 40px;
    display: flex;
    justify-content: space-between;
  }

  .remark-p {
    color: #f56c6c;
  }
}
</style>
