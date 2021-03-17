<template>
  <div>
    <el-form
      label-width="120px"
      ref="addForm"
      :model="addForm"
      :rules="addRules"
    >
      <el-form-item label="节目名称" prop="name">
        <el-input
          placeholder="请输入节目名称"
          :maxlength="200"
          v-model="addForm.name"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="分辨率" prop="resolution">
        <el-select
          class="prefix"
          v-model="addForm.resolution"
          placeholder="请选择"
          size="small"
          style="width: 250px"
          :clearable="true"
        >
          <el-option
            v-for="data in resolutions"
            :key="data.code"
            :label="data.sName"
            :value="data.sName"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div style="text-align: right;">
      <el-button @click="$emit('closeAddForm')">取 消</el-button>
      <el-button type="primary" @click="checkValid">确 定</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addForm: {
        name: "",
        resolution: null,
      },
      addRules: {
        name: [{ required: true, message: "请填写节目名称", trigger: "blur" }],
        resolution: [
          { required: true, message: "请选择分辨率", trigger: "change" },
        ],
      },
    };
  },
  props: ["resolutions", "showAddForm"],
  watch: {
    showAddForm(val) {
      if (!val) {
        this.addForm = {
          name: "",
          resolution: null,
        };
      }
      this.$refs.addForm.clearValidate();
    },
  },
  methods: {
    async checkValid() {
      const isValid = await new Promise((resolve) =>
        this.$refs.addForm.validate(resolve)
      );
      if (isValid) this.$emit("submitAddForm", this.addForm);
    },
  },
};
</script>

<style></style>
