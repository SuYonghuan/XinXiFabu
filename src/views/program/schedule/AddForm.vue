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
              {{ prog.addTime ? prog.addTime.substring(0, 10) : "" }}
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
                :clearable="false"
                :disabled="isEdit"
              >
              </el-time-picker>
              <div class="btn1" @click="form.timeIntervals[0].range = null">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconshanchu"></use>
                </svg>
              </div>
            </el-form-item>
            <time-slider
              :range="form.timeIntervals[0].range"
              @change="(val) => (form.timeIntervals[0].range = val)"
            />
          </template>
          <template v-else-if="form.playMode == 'week'">
            <el-form-item
              class="ghost"
              prop="timeIntervals"
              style="display:block;"
            >
            </el-form-item>
            <template v-for="(interval, i) in form.timeIntervals">
              <el-form-item class="duration" :key="interval.typeCode">
                <span slot="label">
                  <span class="label-prefix">{{
                    ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i]
                  }}</span
                  >时间段
                </span>
                <el-time-picker
                  is-range
                  :disabled="isEdit"
                  v-model="interval.range"
                  range-separator="-"
                  value-format="HH:mm:ss"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  :clearable="false"
                >
                </el-time-picker>
                <div
                  class="btn1"
                  @click="
                    weekdayFrom = weekdayMap[interval.typeCode];
                    showSelectWeekday = true;
                  "
                >
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#iconfuzhi"></use>
                  </svg>
                </div>
                <div class="btn1" @click="interval.range = null">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#iconshanchu"></use>
                  </svg>
                </div>
              </el-form-item>
              <time-slider
                :key="'slider_' + interval.typeCode"
                :range="interval.range"
                @change="(val) => (interval.range = val)"
              />
            </template>
          </template>
          <template v-else>
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
                {{ k }} <span>月</span>
              </div>
            </div>
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
            <el-form-item class="duration" prop="ranges">
              <span slot="label"
                ><span class="label-prefix">{{ month }}月{{ date }}日</span
                >时间段</span
              >
              <el-time-picker
                is-range
                :disabled="isEdit"
                v-model="range"
                value-format="HH:mm:ss"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                :clearable="false"
                @change="setRange"
              >
              </el-time-picker>
              <div
                class="btn1"
                @click="
                  monthDayFrom = month + '_' + date;
                  showSelectMonthDay = true;
                "
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconfuzhi"></use>
                </svg>
              </div>
              <div
                class="btn1"
                @click="
                  range = null;
                  setRange(null);
                "
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconshanchu"></use>
                </svg>
              </div>
            </el-form-item>
            <time-slider
              :range="range"
              @change="
                (val) => {
                  range = val;
                  setRange(range);
                }
              "
            />
          </template>
        </template>
        <template v-if="form.playMode === 'carousel'">
          <el-form-item prop="playList" class="ghost"> </el-form-item>

          <div
            :class="['playlist', currentPlayList === playList ? 'active' : '']"
            v-for="(playList, i) in form.playList"
            :key="i"
            @click="currentPlayList = playList"
          >
            <div class="playlist-header">
              播放列表{{ i + 1 }}
              <div class="btn1" @click="handlePlayListDelete(i)">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconguanbi"></use>
                </svg>
              </div>
            </div>
            <div class="datetype">
              <el-select v-model="playList.dateType">
                <el-option
                  v-for="(k, v) in dateTypes"
                  :key="v"
                  :label="k"
                  :value="Number(v)"
                >
                </el-option>
              </el-select>
              <span class="meta" v-if="playList.dateType == 2">时间段</span>
              <el-date-picker
                v-if="playList.dateType == 2"
                v-model="playList.range"
                :disabled="isEdit"
                type="datetimerange"
                value-format="yyyy-MM-ddTHH:mm:ss"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                :clearable="false"
              >
              </el-date-picker>
            </div>
            <draggable
              class="programs"
              :list="playList.programmes"
              :sort="true"
            >
              <div
                :class="[
                  'program',
                  form.playMode !== 'carousel' &&
                  form.programme &&
                  form.programme.code === prog.code
                    ? 'active'
                    : '',
                ]"
                v-for="(prog, i) in playList.programmes"
                :key="prog.code + i"
              >
                <div class="left">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#iconjiemubao"></use>
                  </svg>
                </div>
                <div class="r1">{{ prog.name }}</div>
                <div class="r2">
                  {{ prog.addTime ? prog.addTime.substring(0, 10) : "" }}
                  <span style="display:inline-block; width:24px;"></span>
                  时长
                  {{ prog.duration }}
                </div>
                <div class="right-btns">
                  <template>
                    <svg
                      class="icon"
                      aria-hidden="true"
                      v-if="playList.programmes.length === 1"
                      @click="removeProgram(playList, i)"
                    >
                      <use xlink:href="#iconshanchu"></use>
                    </svg>

                    <template v-else>
                      <template v-if="i === 0">
                        <svg
                          class="icon"
                          aria-hidden="true"
                          @click="down(playList, i)"
                        >
                          <use xlink:href="#iconxia"></use>
                        </svg>
                      </template>
                      <template
                        v-else-if="i === playList.programmes.length - 1"
                      >
                        <svg
                          class="icon"
                          aria-hidden="true"
                          @click="up(playList, i)"
                        >
                          <use xlink:href="#iconshang"></use>
                        </svg>
                      </template>
                      <template v-else>
                        <svg
                          class="icon"
                          aria-hidden="true"
                          @click="up(playList, i)"
                        >
                          <use xlink:href="#iconshang"></use>
                        </svg>
                        <svg
                          class="icon"
                          aria-hidden="true"
                          @click="down(playList, i)"
                        >
                          <use xlink:href="#iconxia"></use>
                        </svg>
                      </template>
                      <svg
                        class="icon"
                        aria-hidden="true"
                        @click="removeProgram(playList, i)"
                      >
                        <use xlink:href="#iconshanchu"></use>
                      </svg>
                    </template>
                  </template>
                </div>
              </div>
            </draggable>
          </div>
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
    <el-dialog title="复制到" append-to-body :visible.sync="showSelectWeekday">
      <copy-to-weekday
        :from="weekdayFrom"
        :visible="showSelectWeekday"
        @close="showSelectWeekday = false"
        @submit="handleCopyToWeekday"
      ></copy-to-weekday>
    </el-dialog>
    <el-dialog title="复制到" append-to-body :visible.sync="showSelectMonthDay">
      <copy-to-month-day
        :monthDates="monthDates"
        :from="monthDayFrom"
        :visible="showSelectMonthDay"
        @close="showSelectMonthDay = false"
        @submit="handleCopyToMonthDay"
      />
    </el-dialog>
  </el-form>
</template>

<script>
import { ScheduleApi } from "../program.js";
import ProgramPicker from "./ProgramPicker";
import TimeSlider from "./TimeSlider";
import CopyToWeekday from "./CopyToWeekday";
import CopyToMonthDay from "./CopyToMonthDay";
import draggable from "vuedraggable";
const getCurrentYmd = () =>
  `${new Date().getFullYear()}-${new Date().getMonth() +
    1}-${new Date().getDate()}`;
export default {
  components: {
    ProgramPicker,
    TimeSlider,
    CopyToWeekday,
    CopyToMonthDay,
    draggable,
  },
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
      showSelectWeekday: false,
      weekdayFrom: null,
      weekdayMap: {
        1: "周一",
        2: "周二",
        3: "周三",
        4: "周四",
        5: "周五",
        6: "周六",
        7: "周日",
      },
      showSelectMonthDay: false,
      monthDayFrom: null,
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
                    return callback(new Error("请选择至少一天的时间段"));
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
    handleCopyToMonthDay(monthDays) {
      const range = this.range;
      const val = !!range;
      Object.entries(monthDays)
        .filter(([_, selected]) => selected)
        .forEach(([key]) => {
          const [month] = key.split("_");
          this.form.ranges[key] = range ? [...range] : null;
          const keys = this.monthKeys[month];
          if (!val) {
            this.monthKeys[month] = this.monthKeys[month].filter(
              (lkey) => lkey !== key
            );
          } else if (!keys.includes(key)) {
            this.monthKeys[month] = [...keys, key];
          }
        });
      this.showSelectMonthDay = false;
    },
    handleCopyToWeekday(checked) {
      const range = this.form.timeIntervals.find(
        ({ typeCode }) => this.weekdayMap[typeCode] === this.weekdayFrom
      ).range;
      this.form.timeIntervals.forEach((element) => {
        if (checked.includes(this.weekdayMap[element.typeCode])) {
          element.range = range ? [...range] : null;
        }
      });
      this.showSelectWeekday = false;
    },

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
    down(playList, i) {
      const { programmes } = playList;
      const tmp = programmes[i + 1];
      programmes[i + 1] = programmes[i];
      programmes[i] = tmp;
      playList.programmes = [...programmes];
    },
    up(playList, i) {
      const { programmes } = playList;
      const tmp = programmes[i - 1];
      programmes[i - 1] = programmes[i];
      programmes[i] = tmp;
      playList.programmes = [...programmes];
    },
    removeProgram({ programmes }, i) {
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
        this.month = 1;
        this.date = 1;
      } else {
        this.form.timeIntervals = this.newTimeIntervalsByPlayMode(key);
      }
      this.$refs.form && this.$refs.form.clearValidate();
    },
    handleProgram(program) {
      if (this.form.playMode === "carousel") {
        if (this.currentPlayList) {
          this.currentPlayList.programmes.push(program);
          this.setForm();
        }
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
            this.currentPlayList = this.form.playList[0];
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
    .programs {
      .program {
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
        }
      }
    }
    .middle {
      flex: 1;
      height: calc(100vh - 80px);
      padding: 0 64px 64px 64px;
      position: relative;
      background: #f6f6f6;
      overflow-x: hidden;
      overflow-y: auto;
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
        margin-bottom: 16px;
        .label-prefix {
          font-size: 18px;
          color: #868f9f;
          margin-right: 40px;
        }
        .el-form-item__label {
          font-size: 14px;
          color: #868f9f;
        }
        .el-input__inner {
          width: 300px;
          height: 44px;
          line-height: 44px;
          font-weight: bold;
          font-size: 18px;
        }
      }
      .ghost {
        margin-bottom: 10px;
        .el-form-item__content {
          width: 200px;
        }
      }
      .time-slider + .duration {
        margin-top: 64px;
      }
      .playlist {
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        padding-bottom: 8px;
        &.active {
          border: 2px solid #2f6bff;
        }
        .playlist-header {
          position: relative;
          font-weight: bold;
          font-size: 18px;
          line-height: 75px;
          height: 75px;
          color: #3a4763;
          padding-left: 16px;
          .btn1 {
            position: absolute;
            top: 8px;
            right: 8px;
            line-height: 44px;
            border: 1px solid #e6eaf0;
            svg {
              color: #868f9f;
            }
          }
        }
        .datetype {
          padding-left: 16px;
          .el-select {
            input {
              border: 1px solid #e6eaf0;
              height: 44px;
              line-height: 44px;
              padding-left: 12px;
              width: 200px;
              font-size: 14px;
              color: #3a4763;
            }
          }
          .meta {
            margin-left: 32px;
            margin-right: 16px;
            font-size: 14px;
            color: #868f9f;
          }
          .el-date-editor {
            width: 495px;
            font-size: 18px;
            height: 44px;
            line-height: 44px;
            color: #3a4763;
          }
        }
        .programs {
          padding: 8px;
          padding-top: 24px;
          .program {
            background: #fafafa;
            .right-btns {
              position: absolute;
              top: 20px;
              right: 20px;
              line-height: 20px;
              font-size: 20px;
              text-align: right;
              color: #868f9f;
              svg {
                font-size: 20px;
              }
              svg + svg {
                margin-left: 8px;
              }
            }
          }
        }
      }
      .playlist + .playlist {
        margin-top: 24px;
      }
    }
  }
  .updown {
    width: 30px;
  }
  .months {
    display: flex;
    justify-content: space-between;
    color: #868f9f;
    cursor: pointer;
    height: 120px;
    line-height: 120px;
    border: 1px solid #dadfe6;
    border-radius: 8px;
    font-size: 20px;
    background: #ffffff;
    overflow: hidden;
    .month {
      flex: 1;
      text-align: center;

      &.orange {
        background: #fda521;
        color: #fff;
      }
      &.active {
        background: #2f6bff;
        color: #fff;
      }
    }
    .month + .month {
      border-left: 1px solid #dadfe6;
    }
  }
  .dates {
    margin-top: 16px;
    margin-bottom: 40px;
    display: flex;
    justify-content: space-between;
    border: 1px solid #dadfe6;
    cursor: pointer;
    height: 120px;
    line-height: 120px;
    background: #ffffff;
    font-size: 24px;
    color: #868f9f;
    .date {
      flex: 1;
      text-align: center;
      &.orange {
        background: #fda521;
        color: #fff;
      }
      &.active {
        background: #2f6bff;
        color: #fff;
      }
    }
    .date + .date {
      border-left: 1px solid #dadfe6;
    }
  }
}
</style>
