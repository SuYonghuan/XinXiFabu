<template>
  <div class="ctmd">
    <div class="months">
      <div
        :class="[
          'month',
          monthKeys[k].length ? 'orange' : '',
          month == k ? 'active' : '',
        ]"
        v-for="(v, k) in monthDates"
        :key="k"
        @click="month = k"
      >
        {{ k }} <span>月</span>
      </div>
    </div>
    <div class="dates">
      <div
        :class="['date', monthDays[`${month}_${n}`] ? 'orange' : '']"
        v-for="n in monthDates[month]"
        :key="n"
        @click="handleMonthDateChange(month, n)"
      >
        {{ n }}
      </div>
    </div>
    <div style="margin-top:40px;">
      <el-button
        class="svg-suffix s"
        type="success"
        @click="$emit('submit', monthDays)"
        ><svg class="icon" aria-hidden="true">
          <use xlink:href="#icondui"></use></svg
        >确认</el-button
      >
      <el-button class="svg-suffix s" type="primary" @click="$emit('close')"
        ><svg class="icon" aria-hidden="true">
          <use xlink:href="#iconguanbi"></use></svg
        >取消</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  props: ["visible", "monthDates", "from"],
  data() {
    return {
      month: 1,
      monthDays: {},
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
    };
  },
  watch: {
    visible(val) {
      if (val) this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.monthDays = { [this.from]: true };
      const [month] = this.from.split("_");
      this.month = Number(month);
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
      this.monthKeys[month] = [...this.monthKeys[month], this.from];
    },
    handleMonthDateChange(month, date) {
      const key = month + "_" + date;
      this.monthDays[key] = !this.monthDays[key];
      const selected = this.monthDays[key];
      this.monthKeys[month] = this.monthKeys[month].filter(
        (key1) => key1 != key
      );
      if (selected) this.monthKeys[month].push(key);
    },
  },
};
</script>

<style lang="scss">
.ctmd {
  text-align: center;
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
    user-select: none;
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
  .el-button {
    &.svg-suffix {
      padding: 0 32px;
      height: 44px;
      line-height: 44px;
      font-weight: bold;
      font-size: 14px;
      border-radius: 8px;
      svg {
        font-size: 20px;
        margin-right: 8px;
      }
      &.s {
        + .s {
          margin-left: 8px;
        }
        &.is-disabled {
          color: #bbc1cc;
          &:focus,
          &:hover {
            color: #bbc1cc;
          }
        }

        padding: 0 16px;
        color: #fff;
        border: none;
      }
    }
  }
}
</style>
