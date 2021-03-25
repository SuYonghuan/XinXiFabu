<template>
  <div class="schedule-add-form">
    <el-form
      label-width="120px"
      v-if="form"
      ref="form"
      :model="form"
      :rules="addRules"
      :validate-on-rule-change="false"
    >
      <el-form-item label="日程名称" prop="name">
        <el-input
          placeholder="请输入日程名称"
          :maxlength="200"
          v-model="form.name"
        >
        </el-input>
      </el-form-item>

      <el-form-item label="日程描述" prop="desc">
        <el-input
          placeholder="请输入日程描述"
          :maxlength="500"
          v-model="form.desc"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="分辨率" prop="resolution">
        <el-select
          class="prefix"
          v-model="form.resolution"
          placeholder="请选择"
          size="small"
          style="width: 250px"
          :clearable="true"
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
      <el-form-item label="播放方式" prop="playMode">
        <el-select
          class="prefix"
          v-model="form.playMode"
          placeholder="请选择"
          style="width: 250px"
          :disabled="isEdit"
          @change="handlePlayModeChange"
        >
          <el-option v-for="(k, v) in playModes" :key="k" :label="k" :value="v">
          </el-option>
        </el-select>
      </el-form-item>

      <template v-if="form && form.playMode !== 'carousel'">
        <el-form-item label="节目" prop="programme" v-if="form.resolution">
          <el-button
            type="primary"
            v-if="!form.programme"
            @click="showSelectProgram = true"
            >选择节目</el-button
          >
          <div v-else>
            {{ form.programme.name }}
            <el-button
              size="mini"
              type="text"
              class="updown"
              icon="el-icon-delete-solid"
              @click="form.programme = null"
            ></el-button>
          </div>
        </el-form-item>

        <template v-if="form.playMode == 'day'">
          <el-form-item label="时间段" prop="timeIntervals">
            <el-time-picker
              is-range
              v-model="form.timeIntervals[0].range"
              value-format="HH:mm:ss"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
              :disabled="isEdit"
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
              is-range
              :disabled="isEdit"
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
          <el-form-item label="日期" prop="dateDay">
            <el-date-picker
              :disabled="isEdit"
              v-model="form.timeIntervals[0].dateDay"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="时间段" prop="timeIntervals">
            <el-time-picker
              is-range
              :disabled="isEdit"
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
      </template>
      <template v-if="form && form.playMode === 'carousel' && form.resolution">
        <el-form-item prop="playList" label="播放列表">
          <el-dropdown @command="addPlayList">
            <el-button type="primary">
              新增<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :disabled="hasNormalDataType" :command="1"
                >普通模式</el-dropdown-item
              >
              <el-dropdown-item :command="2">时段模式</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>

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
                    v-else-if="scope.$index === playList.programmes.length - 1"
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
    </el-form>
    <div style="text-align: right;">
      <el-button @click="$emit('closeAddForm')">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
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
  </div>
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
        2: "时段模式",
      },
      showSelectProgram: false,
      selectedProgram: null,
      currentPlayList: null,
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
    addPlayList(dateType) {
      this.form = {
        ...this.form,
        playList: [
          ...this.form.playList,
          {
            dateType,
            range: [
              getCurrentYmd() + " 00:00:00",
              getCurrentYmd() + " 23:59:59",
            ],
            programmes: [],
          },
        ],
      };
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
      } else {
        this.form.timeIntervals = this.newTimeIntervalsByPlayMode(key);
      }
      this.$refs.form && this.$refs.form.clearValidate();
    },
    handleProgram() {
      const program = this.selectedProgram;
      if (this.form.playMode === "carousel") {
        this.currentPlayList.programmes.push(program);
        this.setForm();
      } else {
        this.form.programme = program;
      }
      this.showSelectProgram = false;
    },
    async openProgramModal() {
      await this.getPrograms();
      this.showSelectMaterial = true;
    },
    async getPrograms() {
      const { pageIndex, q } = this;
      const { data, code, msg } = await ScheduleApi.getPrograms({
        name: q,
        paging: 1,
        pageIndex,
        pageSize: 10,
      });
      if (code === "200") {
        const { list, allCount } = data;
        this.programs = list;
        this.total = allCount;
      } else this.$message({ type: "error", message: msg });
    },
    async init() {
      this.form = null;
      if (!this.code) {
        this.form = {
          name: "",
          playMode: "day",
          desc: "",
          programme: null,
          timeIntervals: [{ typeCode: 0, range: null }],
          resolution: null,
        };
      } else {
        const { code, data, msg } = await ScheduleApi.getDetail({
          code: this.code,
        });
        if (code == "200") {
          this.form = data;
          if (this.form.timeIntervals) {
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

<style>
.schedule-add-form .updown {
  width: 30px;
}
</style>
