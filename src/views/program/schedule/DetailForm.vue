<template>
  <div class="schedule-add-form">
    <el-form label-width="120px" v-if="form">
      <el-form-item label="日程名称" prop="name">
        <el-input
          readonly
          placeholder="请输入日程名称"
          :maxlength="200"
          v-model="form.name"
        >
        </el-input>
      </el-form-item>

      <el-form-item label="日程描述" prop="desc">
        <el-input
          readonly
          placeholder="请输入日程描述"
          :maxlength="500"
          v-model="form.desc"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="分辨率" prop="resolution">
        <el-select
          disabled
          class="prefix"
          v-model="form.resolution"
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
          />
        </el-select>
      </el-form-item>
      <el-form-item label="播放方式" prop="playMode">
        <el-select
          disabled
          class="prefix"
          v-model="form.playMode"
          placeholder="请选择"
          style="width: 250px"
        >
          <el-option v-for="(k, v) in playModes" :key="k" :label="k" :value="v">
          </el-option>
        </el-select>
      </el-form-item>

      <template v-if="form && form.playMode !== 'carousel'">
        <el-form-item label="节目" prop="programme" v-if="form.resolution">
          <div>
            {{ form.programme.name }}
          </div>
        </el-form-item>

        <template v-if="form.playMode == 'day'">
          <el-form-item label="时间段" prop="timeIntervals">
            <el-time-picker
              readonly
              is-range
              v-model="form.timeIntervals[0].range"
              value-format="HH:mm:ss"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
            >
            </el-time-picker>
          </el-form-item>
        </template>
        <template v-else-if="form.playMode == 'week'">
          <el-form-item prop="timeIntervals" label="时间段"> </el-form-item>
          <el-form-item
            :label="['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]"
            :key="interval.typeCode"
            v-for="(interval, i) in form.timeIntervals"
          >
            <el-time-picker
              readonly
              is-range
              v-model="interval.range"
              range-separator="至"
              value-format="HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
            >
            </el-time-picker>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item prop="timeIntervals" label="时间段"> </el-form-item>
          <el-form-item
            :label="interval.dateMonth + '月' + interval.dateDay + '日'"
            :key="interval.code"
            v-for="interval in form.timeIntervals"
          >
            <el-time-picker
              readonly
              is-range
              v-model="interval.range"
              range-separator="至"
              value-format="HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
            >
            </el-time-picker>
          </el-form-item>
        </template>
      </template>
      <template v-if="form && form.playMode === 'carousel' && form.resolution">
        <el-form-item prop="playList" label="播放列表"> </el-form-item>
        <el-card
          style="margin-top: 10px;"
          v-for="(playList, i) in form.playList"
          :key="i"
        >
          <div slot="header" class="clearfix">
            <span
              >播放列表{{ i + 1 }}
              <el-tag>{{ dateTypes[playList.dateType] }}</el-tag></span
            >
          </div>
          <el-date-picker
            readonly
            v-if="playList.dateType == 2"
            v-model="playList.range"
            type="datetimerange"
            value-format="yyyy-MM-ddTHH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            :clearable="false"
          >
          </el-date-picker>
          <el-table
            :data="playList.programmes"
            v-if="playList.programmes.length"
          >
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="节目" prop="name"></el-table-column>
          </el-table>
        </el-card>
      </template>
    </el-form>
    <div style="text-align: right;">
      <el-button @click="$emit('closeForm')">关 闭</el-button>
    </div>
  </div>
</template>

<script>
import { ScheduleApi } from "../program.js";

export default {
  data() {
    return {
      form: null,
      dateTypes: {
        1: "普通模式",
        2: "插播模式",
      },
      showSelectProgram: false,
      selectedProgram: null,
      currentPlayList: null,
    };
  },
  props: [
    "code",
    "playModes",
    "showForm",
    "intervalTypes",
    "resolutions",
    "api",
  ],
  watch: {
    showForm(val) {
      if (val) {
        this.init();
      } else {
        this.form = null;
      }
      this.$refs.form && this.$refs.form.clearValidate();
    },
  },
  mounted() {
    this.init();
  },
  computed: {
    isEdit() {
      return !!this.form.code;
    },
    hasNormalDataType() {
      return !!(
        this.form && this.form.playList.find(({ dateType }) => dateType == 1)
      );
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    newTimeIntervalsByPlayMode(key) {
      return key === "day"
        ? [{ typeCode: 0, range: null }]
        : key === "week"
        ? new Array(7).fill(0).map((_, i) => ({
            typeCode: i + 1,
            range: null,
          }))
        : key === "customize"
        ? [{ typeCode: 8, range: null }]
        : null;
    },
    async init() {
      this.form = null;
      if (this.code) {
        const { code, data, msg } = await ScheduleApi[this.api]({
          code: this.code,
        });
        if (code == "200") {
          this.form = data;
          if (this.form.timeIntervals) {
            if (this.form.playMode === "customize") {
              this.form.timeIntervals = this.form.timeIntervals.map(
                ({ beginTime, endTime, dateDay, dateMonth }) => ({
                  range: [beginTime, endTime],
                  dateDay,
                  dateMonth,
                })
              );
              this.form.timeIntervals.sort((a, b) =>
                a.dateMonth === b.dateMonth
                  ? a.dateDay - b.dateDay
                  : a.dateMonth - b.dateMonth
              );
            } else {
              const intervalMap = this.form.timeIntervals.reduce(
                (acc, { typeCode, beginTime, endTime, dateDay }) => ({
                  ...acc,
                  [typeCode]: {
                    typeCode,
                    range: [beginTime, endTime],
                    dateDay,
                  },
                }),
                {}
              );
              const newIntervals = this.newTimeIntervalsByPlayMode(
                this.form.playMode
              );
              this.form.timeIntervals = newIntervals.map((interval) =>
                intervalMap[interval.typeCode]
                  ? intervalMap[interval.typeCode]
                  : interval
              );
            }
          }
          if (this.form.playList) {
            this.form.playList = this.form.playList.map(
              ({ dateType, programmes, beginTime, endTime }) => ({
                dateType,
                programmes,
                ...(dateType == 2 ? { range: [beginTime, endTime] } : {}),
              })
            );
          }
        } else this.$message({ type: "error", message: msg });
      }
    },
  },
  components: {},
};
</script>

<style>
.schedule-add-form .updown {
  width: 30px;
}
</style>
