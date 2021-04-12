<template>
  <el-form
    v-if="form"
    ref="form"
    :model="form"
    :rules="addRules"
    inline
    :validate-on-rule-change="false"
    class="saf"
  >
    <el-row class="header" type="flex" justify="space-between">
      <el-col class="left">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconrichengguanli"></use>
        </svg>
        日程管理
      </el-col>
      <el-col class="middle">
        <el-form-item prop="name">
          <span slot="label" class="meta1">日程名称</span>
          <el-input
            class="input1"
            placeholder="请输入日程名称"
            :maxlength="200"
            v-model="form.name"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="playMode">
          <span slot="label" class="meta1">播放方式</span>
          <el-select
            class="input1"
            v-model="form.playMode"
            placeholder="请选择"
            :disabled="isEdit"
            @change="handlePlayModeChange"
          >
            <el-option
              v-for="(k, v) in playModes"
              :key="k"
              :label="k"
              :value="v"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="desc">
          <span slot="label" class="meta1">日程描述</span>
          <el-input
            class="input1"
            placeholder="请输入日程描述"
            :maxlength="500"
            v-model="form.desc"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="resolution">
          <span slot="label" class="meta1">分辨率选择</span>
          <el-select
            class="input1"
            v-model="form.resolution"
            placeholder="请选择"
            size="small"
            :disabled="isEdit"
            @change="handleResolutionChange"
          >
            <el-option
              v-for="data in resolutions"
              :key="data.code"
              :label="data.sName"
              :value="data.sName"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col class="right">
        <div style="flex: 1"></div>
        <div class="btn success" @click="submit">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconchucun"></use>
          </svg>
          保存
        </div>
        <div class="btn primary" @click="$emit('closeAddForm')">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconcha"></use>
          </svg>
          关闭
        </div>
      </el-col>
    </el-row>
    <div class="main">
      <div class="left">
        <el-form-item class="program-header" prop="programme">
          <el-input type="text" placeholder="搜索" v-model="q" />
          <div class="btn1" @click="getPrograms">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconsousuo"></use>
            </svg>
          </div>
          <div
            class="btn1"
            @click="
              q = '';
              getPrograms();
            "
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#iconqingchu"></use>
            </svg>
          </div>
        </el-form-item>
        <div class="programs">
          <div
            :class="[
              'program',
              form.playMode !== 'carousel' &&
              form.programme &&
              form.programme.code === prog.code
                ? 'active'
                : '',
            ]"
            v-for="prog in programs"
            :key="prog.code"
          >
            <div class="left">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#iconjiemubao"></use>
              </svg>
            </div>
            <div class="r1">{{ prog.name }}</div>
            <div class="r2">
              {{ prog.addTime.substring(0, 10) }}
              <span style="display:inline-block; width:24px;"></span>
              时长
              {{ prog.duration }}
            </div>
            <div
              @click="handleProgram(prog)"
              :class="
                form.playMode === 'carousel'
                  ? ['right']
                  : [
                      'right',
                      's',
                      form.programme && form.programme.code === prog.code
                        ? 'active'
                        : '',
                    ]
              "
            >
              <svg
                class="icon"
                v-if="form.playMode === 'carousel'"
                aria-hidden="true"
              >
                <use xlink:href="#iconjia"></use>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="middle">
        <el-row type="flex" justify="space-between" class="mid-header">
          <el-col>
            播放方式：<span class="value">
              {{ playModes[form.playMode] }}</span
            ></el-col
          >
          <el-button
            class="svg-suffix"
            type="primary"
            v-if="form.playMode === 'carousel'"
            @click="addPlayList"
            ><svg class="icon" aria-hidden="true">
              <use xlink:href="#iconjia"></use></svg
            >新增</el-button
          >
        </el-row>
        <template v-if="form.playMode !== 'carousel'">
          <template v-if="form.playMode == 'day'">
            <el-form-item class="duration" label="时间段" prop="timeIntervals">
              <el-time-picker
                is-range
                v-model="form.timeIntervals[0].range"
                value-format="HH:mm:ss"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                :disabled="isEdit"
              >
              </el-time-picker>
            </el-form-item>
            <!-- <el-slider v-model="form.timeIntervals[0].range" range>
              </el-slider> -->
          </template>
          <template v-else-if="form.playMode == 'week'">
            <el-form-item prop="timeIntervals" label="时间段"> </el-form-item>
            <el-form-item
              :label="
                ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]
              "
              :key="interval.typeCode"
              v-for="(interval, i) in form.timeIntervals"
            >
              <el-time-picker
                is-range
                :disabled="isEdit"
                v-model="interval.range"
                range-separator="-"
                value-format="HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
              >
              </el-time-picker>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="月">
              <div class="months">
                <div
                  :class="[
                    'month',
                    monthKeys[k].length ? 'orange' : '',
                    month == k ? 'active' : '',
                  ]"
                  v-for="(v, k) in monthDates"
                  :key="k"
                  @click="
                    month = k;
                    handleMonthDateChange();
                  "
                >
                  {{ k }}
                </div>
              </div>
            </el-form-item>
            <el-form-item label="日">
              <div class="dates">
                <div
                  :class="[
                    'date',
                    form.ranges[`${month}_${n}`] ? 'orange' : '',
                    date == n ? 'active' : '',
                  ]"
                  v-for="n in monthDates[month]"
                  :key="n"
                  @click="
                    date = n;
                    handleMonthDateChange();
                  "
                >
                  {{ n }}
                </div>
              </div>
            </el-form-item>
            <el-form-item label="时间段" prop="ranges">
              <el-time-picker
                is-range
                :disabled="isEdit"
                v-model="range"
                value-format="HH:mm:ss"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                @change="setRange"
              >
              </el-time-picker>
            </el-form-item>
          </template>
        </template>
        <template v-if="form.playMode === 'carousel'">
          <el-form-item prop="playList"> </el-form-item>

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

              <el-button-group style="float: right; padding: 3px 0">
                <el-button
                  type="text"
                  class="updown"
                  icon="el-icon-plus"
                  @click="
                    currentPlayList = playList;
                    showSelectProgram = true;
                  "
                ></el-button>
                <el-button
                  type="text"
                  class="updown"
                  icon="el-icon-delete"
                  :disabled="isEdit"
                  @click="handlePlayListDelete(i)"
                ></el-button>
              </el-button-group>
            </div>
            <el-date-picker
              v-if="playList.dateType == 2"
              v-model="playList.range"
              :disabled="isEdit"
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
              <el-table-column label="操作" prop="op">
                <template slot-scope="scope">
                  <el-button
                    v-if="playList.programmes.length === 1"
                    size="mini"
                    type="text"
                    class="updown"
                    icon="el-icon-delete-solid"
                    @click="removeProgram(playList, scope)"
                  ></el-button>
                  <el-button-group v-else>
                    <template v-if="scope.$index === 0">
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="down(playList, scope)"
                      ></el-button>
                    </template>
                    <template
                      v-else-if="
                        scope.$index === playList.programmes.length - 1
                      "
                    >
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="up(playList, scope)"
                      ></el-button>
                    </template>
                    <template v-else>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="up(playList, scope)"
                      ></el-button>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="down(playList, scope)"
                      ></el-button>
                    </template>
                    <el-button
                      size="mini"
                      type="text"
                      class="updown"
                      icon="el-icon-delete-solid"
                      @click="removeComponent(scope.$index)"
                    ></el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </template>
      </div>
    </div>

    <el-dialog
      title="节目列表"
      append-to-body
      :visible.sync="showSelectProgram"
    >
      <program-picker
        ref="ProgramPicker"
        :resolution="form && form.resolution"
        @change="
          (program) => {
            selectedProgram = program;
          }
        "
      ></program-picker>
      <div style="text-align: right;">
        <el-button @click="showSelectProgram = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedProgram"
          @click="handleProgram"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </el-form>
</template>

<script>
import { ScheduleApi } from "../program.js";
import ProgramPicker from "./ProgramPicker";
const getCurrentYmd = () =>
  `${new Date().getFullYear()}-${new Date().getMonth() +
    1}-${new Date().getDate()}`;
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
      month: 1,
      date: 1,
      monthDates: {
        1: 31,
        2: 29,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
      },
      monthKeys: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [],
      },
      range: null,
      q: "",
      programs: [],
    };
  },
  props: ["code", "playModes", "showAddForm", "intervalTypes", "resolutions"],
  watch: {
    showAddForm(val) {
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
    addRules() {
      return this.form.playMode === "carousel"
        ? {
            name: [
              { required: true, message: "请填写日程名称", trigger: "blur" },
            ],
            playMode: [
              { required: true, message: "请选择播放方式", trigger: "change" },
            ],
            resolution: [
              { required: true, message: "请选择分辨率", trigger: "blur" },
            ],
            playList: [
              {
                required: true,
                validator: (_, value, callback) => {
                  if (!value.length)
                    return callback(new Error("请新增播放列表"));
                  if (value.filter(({ dateType }) => dateType == 1).length > 1)
                    return callback(new Error("轮播最多只能有一个普通模式"));
                  if (
                    value.find(
                      ({ programmes }) => !programmes || !programmes.length
                    )
                  )
                    return callback(new Error("请为播放列表添加节目"));
                  const durationPlayLists = value.filter(
                    ({ dateType }) => dateType == 2
                  );
                  if (!durationPlayLists.length) return callback();
                  if (
                    !durationPlayLists.find(
                      ({ range }) => range && range[0] && range[1]
                    )
                  )
                    return callback(new Error("请选择时间段"));
                  if (
                    durationPlayLists.find(
                      ({ range }) =>
                        range && range[0] === range[1] && range[0] !== ""
                    )
                  )
                    return callback(new Error("存在相同的开始结束时间"));
                  callback();
                },
              },
            ],
          }
        : this.form.playMode === "customize"
        ? {
            name: [
              { required: true, message: "请填写日程名称", trigger: "blur" },
            ],
            playMode: [
              { required: true, message: "请选择播放方式", trigger: "change" },
            ],
            resolution: [
              { required: true, message: "请选择分辨率", trigger: "blur" },
            ],
            programme: [{ required: true, message: "请选择节目" }],
            ranges: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  if (
                    !Object.values(value).find(
                      (range) => range && range[0] && range[1]
                    )
                  )
                    return callback(new Error("请选择某天的时间段"));
                  const sameKV = Object.entries(value).find(
                    ([_, range]) =>
                      range && range[0] === range[1] && range[0] !== ""
                  );
                  if (sameKV)
                    return callback(
                      new Error(
                        `${sameKV[0].split("_")[0]}月${
                          sameKV[0].split("_")[1]
                        }日开始结束时间不能相等`
                      )
                    );
                  callback();
                },
              },
            ],
          }
        : {
            name: [
              { required: true, message: "请填写日程名称", trigger: "blur" },
            ],
            playMode: [
              { required: true, message: "请选择播放方式", trigger: "change" },
            ],
            resolution: [
              { required: true, message: "请选择分辨率", trigger: "blur" },
            ],
            programme: [{ required: true, message: "请选择节目" }],
            timeIntervals: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  if (!value.find(({ range }) => range && range[0] && range[1]))
                    return callback(new Error("请选择时间段"));
                  if (
                    value.find(
                      ({ range }) =>
                        range && range[0] === range[1] && range[0] !== ""
                    )
                  )
                    return callback(new Error("开始结束时间不能相等"));
                  if (value[0].typeCode == 8 && !value[0].dateDay)
                    return callback(new Error("自定义播放模式需要选择日期"));
                  callback();
                },
              },
            ],
          };
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    handleMonthDateChange() {
      if (this.date > this.monthDates[this.month]) {
        this.date = 1;
      }
      this.range = this.form.ranges[`${this.month}_${this.date}`];
    },
    setRange(val) {
      const key = `${this.month}_${this.date}`;

      const keys = this.monthKeys[this.month];
      if (!val) {
        this.monthKeys[this.month] = this.monthKeys[this.month].filter(
          (lkey) => lkey !== key
        );
      } else if (!keys.includes(key)) {
        this.monthKeys[this.month] = [...keys, key];
      }
      this.form.ranges[key] = val;
    },
    down(playList, { $index: i }) {
      const { programmes } = playList;
      const tmp = programmes[i + 1];
      programmes[i + 1] = programmes[i];
      programmes[i] = tmp;
      playList.programmes = [...programmes];
    },
    up(playList, { $index: i }) {
      const { programmes } = playList;
      const tmp = programmes[i - 1];
      programmes[i - 1] = programmes[i];
      programmes[i] = tmp;
      playList.programmes = [...programmes];
    },
    removeProgram({ programmes }, { $index: i }) {
      this.$confirm("您确认要删除该节目?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        programmes.splice(i, 1);
      });
    },
    handlePlayListDelete(i) {
      this.$confirm("此操作将删除该播放列表, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.form.playList.splice(i, 1);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
      });
    },
    handleResolutionChange() {
      if (this.form.playMode === "carousel") {
        this.form.playList = [];
      } else this.form.programme = null;
    },
    setForm() {
      this.form = {
        ...this.form,
      };
    },
    addPlayList() {
      this.form = {
        ...this.form,
        playList: [
          ...this.form.playList,
          {
            dateType: 2,
            range: [
              getCurrentYmd() + " 00:00:00",
              getCurrentYmd() + " 23:59:59",
            ],
            programmes: [],
          },
        ],
      };
      this.currentPlayList = this.form.playList[this.form.playList.length - 1];
    },
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
    handlePlayModeChange(key) {
      if (key === "carousel") {
        this.form.playList = [];
      } else if (key === "customize") {
        this.form.ranges = {};
      } else {
        this.form.timeIntervals = this.newTimeIntervalsByPlayMode(key);
      }
      this.$refs.form && this.$refs.form.clearValidate();
    },
    handleProgram(program) {
      if (this.form.playMode === "carousel") {
        this.currentPlayList.programmes.push(program);
        this.setForm();
      } else {
        this.form.programme = program;
      }
    },
    async openProgramModal() {
      await this.getPrograms();
      this.showSelectMaterial = true;
    },
    async getPrograms() {
      const { q, form } = this;
      const { data, code, msg } = await ScheduleApi.getPrograms({
        name: q,
        resolution: form.resolution,
        paging: 0,
      });
      if (code === "200") {
        this.programs = data;
      } else this.$message({ type: "error", message: msg });
    },
    async init() {
      this.form = null;
      this.range = null;
      this.month = 1;
      this.date = 1;
      this.monthKeys = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [],
      };
      this.q = "";
      if (!this.code) {
        this.form = {
          name: "",
          playMode: "day",
          desc: "",
          programme: null,
          timeIntervals: [{ typeCode: 0, range: null }],
          resolution: this.resolutions[0].sName,
        };
      } else {
        const { code, data, msg } = await ScheduleApi.getDetail({
          code: this.code,
        });
        if (code == "200") {
          this.form = data;
          if (this.form.timeIntervals) {
            if (this.form.playMode === "customize") {
              this.form.ranges = this.form.timeIntervals.reduce(
                (acc, { typeCode, beginTime, endTime, dateDay, dateMonth }) => {
                  const key = dateMonth + "_" + dateDay;
                  this.monthKeys[dateMonth].push(key);
                  return {
                    ...acc,
                    [key]: [beginTime, endTime],
                  };
                },
                {}
              );
              this.range = this.form.ranges[`${this.month}_${this.date}`];
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
      await this.getPrograms();
      if (this.$refs.ProgramPicker) this.$refs.ProgramPicker.reset();
    },
    form2Body() {
      const {
        code,
        name,
        playMode,
        desc,
        resolution,
        programme,
        timeIntervals,
        playList,
        ranges,
      } = this.form;
      return {
        code,
        name,
        playMode,
        desc,
        resolution,
        ...(playMode === "carousel"
          ? {
              playList: playList.map(({ dateType, programmes, range }) => ({
                dateType: Number(dateType),
                programmes: programmes.map(({ code }) => code),
                ...(dateType == 1
                  ? {}
                  : {
                      beginTime: range[0],
                      endTime: range[1],
                    }),
              })),
            }
          : playMode === "customize"
          ? {
              programCode: programme.code,
              timeIntervals: Object.entries(ranges)
                .filter(([_, range]) => range)
                .map(([key, range]) => {
                  let [month, date] = key.split("_");
                  return {
                    typeCode: 8,
                    beginTime: range[0],
                    endTime: range[1],
                    dateDay: Number(date),

                    dateMonth: Number(month),
                  };
                }),
            }
          : {
              programCode: programme.code,
              timeIntervals: timeIntervals
                .filter(({ range }) => range)
                .map(({ typeCode, dateDay, range }) => ({
                  typeCode,
                  beginTime: range[0],
                  endTime: range[1],
                  ...(typeCode === 8
                    ? {
                        dateDay,
                      }
                    : {}),
                })),
            }),
      };
    },
    async submit() {
      const isValid = await new Promise((resolve) =>
        this.$refs.form.validate(resolve)
      );
      if (isValid) {
        const { code, msg } = await ScheduleApi[this.isEdit ? "put" : "post"](
          this.form2Body()
        );
        if (code === "200") {
          this.$message({ type: "success", message: msg });
          this.$emit(this.isEdit ? "saved" : "added");
        } else this.$message({ type: "error", message: msg });
      }
    },
  },
  components: { ProgramPicker },
};
</script>

<style lang="scss">
.saf {
  overflow: hidden;

  .header {
    height: 80px;
    flex: 0 0 80px;
    line-height: 80px;
    border-bottom: 1px solid #dadfe6;
    .left {
      background: #ffffff;
      position: relative;
      padding-left: 80px;
      flex: 0 0 352px;
      font-family: Source Han Sans CN;
      font-style: normal;
      font-weight: bold;
      font-size: 18px;
      color: #868f9f;
      svg {
        position: absolute;
        left: 24px;
        top: 24px;
        font-size: 32px;
        color: #2f6bff;
      }
    }

    .middle {
      background: #f6f6f6;
      padding-left: 64px;
      padding-right: 10px;
      flex: 1;
      display: flex;
      .el-form-item__content {
        vertical-align: middle;
      }
      .el-form-item {
        flex: 1 1 25%;
        display: flex;
        margin: auto;
      }
      .meta1 {
        font-family: Source Han Sans CN;
        font-style: normal;
        font-weight: bold;
        font-size: 12px;
        color: #868f9f;
        margin-right: 4px;
      }
      .input1 {
        max-width: 200px;
        input {
          height: 44px;
          max-width: 200px;
          margin-right: 32px;
          padding-left: 12px;
          color: #3a4763;
          font-weight: bold;
          font-size: 14px;
          border: 1px solid #e6eaf0;
          box-sizing: border-box;
          border-radius: 8px;
        }
      }
    }
    .right {
      background: #f6f6f6;
      flex: 0 0 248px;
      display: flex;
      padding: 18px 64px 18px 0;
      .btn {
        vertical-align: middle;
        text-align: left;
        position: relative;
        display: inline-block;
        width: 88px;
        height: 44px;
        line-height: 44px;
        padding-left: 44px;
        border: 1px solid #e6eaf0;
        border-radius: 8px;
        color: #868f9f;
        cursor: pointer;
        svg {
          position: absolute;
          top: 12.5px;
          left: 16px;
          font-weight: bold;
          font-size: 20px;
        }
        &.success,
        &.primary {
          border: none;
          color: #fff;
        }
        &.success {
          background: #12b362;
        }
        &.primary {
          background: #2f6bff;
        }
      }
      .btn + .btn {
        margin-left: 8px;
      }
    }
  }
  .main {
    flex: 1;
    display: flex;
    > .left {
      flex: 0 0 352px;
      height: calc(100vh - 80px);
      background: #fff;
      text-align: center;
      padding-top: 8px;
      user-select: none;
      display: flex;
      flex-direction: column;
      text-align: left;
      .program-header {
        flex: 0 0 76px;
        display: flex;
        padding-left: 24px;
        padding-top: 16px;
        line-height: 44px;
        margin: 0;
        .el-input {
          width: 200px;
        }
        input {
          width: 200px;
          background: #fcfcfc;
          border: 1px solid #e6eaf0;
          box-sizing: border-box;
          border-radius: 6px;
          height: 44px;
        }
        .btn1 {
          display: inline-block;
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e6eaf0;
          margin-left: 8px;
          text-align: center;
          svg {
            font-size: 20px;
            color: #2f6bff;
          }
        }
      }
      .programs {
        flex: 1;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 0 16px 4px 16px;

        .program {
          &:nth-child(2n + 1) {
            background: #fafafa;
          }
          position: relative;
          height: 60px;
          border-radius: 8px;
          padding: 10px 60px 0 68px;
          &.active {
            background: #e6eaf0;
          }
          > .left {
            position: absolute;
            width: 44px;
            height: 44px;
            left: 8px;
            top: 8px;
            background: #ffffff;
            border: 1px solid #e6eaf0;
            box-sizing: border-box;
            border-radius: 6px;
            text-align: center;
            line-height: 44px;
            > svg {
              font-size: 24px;
              color: 868f9f;
            }
          }
          > .right {
            position: absolute;
            width: 44px;
            height: 44px;
            right: 8px;
            top: 8px;
            background: #ffffff;
            border: 1px solid #e6eaf0;
            box-sizing: border-box;
            border-radius: 6px;
            text-align: center;
            line-height: 44px;
            &.s {
              width: 16px;
              height: 16px;
              top: 22px;
              right: 22px;
              background: #f5f8fe;
              border: 1px solid #dadfe6;
              box-sizing: border-box;
              border-radius: 3px;
              &.active {
                background: #2f6bff;
                border: 1px solid #2f6bff;
              }
            }

            > svg {
              font-size: 24px;
              color: 868f9f;
            }
          }
          > .r1 {
            font-size: 14px;
            line-height: 21px;
            color: #3a4763;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          > .r2 {
            font-size: 12px;
            line-height: 23px;
            color: #868f9f;
          }
        }
        .program + .program {
          margin-top: 8px;
        }
      }
    }
    .middle {
      flex: 1;
      height: calc(100vh - 80px);
      padding: 0 64px;
      position: relative;
      background: #f6f6f6;
      .mid-header {
        font-weight: bold;
        font-size: 18px;
        line-height: 80px;
        color: #171f46;
        .value {
          font-size: 24px;
        }
        .svg-suffix {
          padding: 0 32px;
          height: 44px;
          line-height: 44px;
          font-weight: bold;
          font-size: 14px;
          border-radius: 8px;
          margin: auto;
          svg {
            font-size: 20px;
            margin-right: 8px;
          }
        }
      }
      .duration {
        display: block;
        width: 100%;
      }
    }
  }
  .updown {
    width: 30px;
  }
  .months {
    display: flex;
    justify-content: space-between;
    color: #fff;
    cursor: pointer;
    .month {
      background: #a6a6a6;
      flex: 1;
      text-align: center;

      &.orange {
        background: lightcoral;
      }
      &.active {
        background: rgba(255, 195, 0, 1);
      }
    }
    .month + .month {
      margin-left: 1px;
    }
  }
  .dates {
    display: flex;
    justify-content: space-between;
    border: 1px solid #dbdbdb;
    cursor: pointer;
    .date {
      flex: 1;
      text-align: center;
      &.orange {
        background: lightcoral;
      }
      &.active {
        background: rgba(255, 195, 0, 1);
      }
    }
    .date + .date {
      border-left: 1px solid #dbdbdb;
    }
  }
}
</style>
