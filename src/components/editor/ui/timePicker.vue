<template>
  <span class="time-picker" @mouseup.stop="">
    <!--当前时间-->
    <div class="value" @click="onValueClick">{{dateTimeText}}</div>
    <!--时间选择器-->
    <div class="modal-content" v-if="show">
        <!--年月选择器-->
        <div class="year-month-picker">
            <!--上一个月-->
            <!-- <button class="gray-button">
                 <i class="tbzico ico-left"></i>
            </button> -->
            <!--月份选择-->
            <select v-model="dateTime.month" @input="(e)=>{
                dateTime.month = e.target.value;
                emitValue();    
            }">
                <option v-for="item in month" :value="item">{{item}}</option>
            </select>
            <!--年份选择-->
            <select v-model="dateTime.year" @input="(e)=>{
                dateTime.year = e.target.value;
                emitValue();    
            }">
                <option v-for="item in year" :value="item">{{item}}</option>
            </select>
            <!--下一个月-->
            <!-- <button class="gray-button"  style="transform:scaleX(-1)">
                 <i class="tbzico ico-left"></i>
            </button> -->
        </div>
         <hr/>
        <!--日期选择器-->
        <div class="day-picker">
            <div :class="getDateItemClass(item)" v-for="item in days" @click="()=>{
                dateTime.day = item;
                emitValue();    
            }">{{item}}</div>
        </div>
        <hr/>
        <!--时间(小时:分钟)选择器-->
        <div class="hour-min-picker">
            <!--小时选择-->
            <select v-model="dateTime.hour" @input="(e)=>{
                dateTime.hour = e.target.value;
                emitValue();    
            }">
                <option v-for="item in hour" :value="item">{{item}}</option>
            </select>
            <span>:</span>
            <!--分钟选择-->
            <select v-model="dateTime.min" @input="(e)=>{
                dateTime.min = e.target.value;
                emitValue();    
            }">
                <option v-for="item in min" :value="item">{{item}}</option>
            </select>
        </div>
    </div>
  </span>
</template>
<script>
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      year: [],
      month: [],
      hour: [],
      min: [],
      show: false,
      dateTime: {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        min: 0
      }
    };
  },
  props: ["value"],
  computed: {
    //获取格式化日期文本
    dateTimeText() {
      let dateObject = new Date(this.value);
      let year = dateObject.getFullYear();
      let month =
        dateObject.getMonth() + 1 < 10
          ? "0" + (dateObject.getMonth() + 1)
          : dateObject.getMonth() + 1;
      let day =
        dateObject.getDate() < 10
          ? "0" + dateObject.getDate()
          : dateObject.getDate();

      let h =
        dateObject.getHours() < 10
          ? "0" + dateObject.getHours()
          : dateObject.getHours();
      let m =
        dateObject.getMinutes() < 10
          ? "0" + dateObject.getMinutes()
          : dateObject.getMinutes();

      return `${year}/${month}/${day} ${h}:${m}`;
    },
    //获取日期
    days() {
      let days = [];
      let totalDays = this.getCountDays(new Date(this.value));
      for (let i = 1; i <= totalDays; i++) {
        days.push(i);
      }
      return days;
    }
  },
  watch: {
    value(val) {
      this.updateDateTime();
    }
  },
  methods: {
    emitValue() {
      let dateObject = new Date(
        `${this.dateTime.year}-${this.dateTime.month}-${this.dateTime
          .day} ${this.dateTime.hour}:${this.dateTime.min}:00`
      );

      if (dateObject != "Invalid Date") {
        this.$emit("input", dateObject);
      }
    },
    updateDateTime() {
      let date = new Date(this.value);
      if (date != "Invalid Date") {
        this.dateTime.year = date.getFullYear();
        this.dateTime.month = date.getMonth() + 1;
        this.dateTime.day = date.getDate();
        this.dateTime.hour =
          date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        this.dateTime.min =
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      }
    },
    getDateItemClass(item) {
      let date = new Date(this.value);

      if (date.getDate() == item) {
        return ["item", "active"];
      } else {
        return ["item"];
      }
    },
    //当value被点击
    onValueClick() {
      if (this.show) {
        this.show = false;
      } else {
        this.show = true;
        this.updateDateTime();
      }
    },
    //获取指定月份有几天
    getCountDays(curDate) {
      /* 获取当前月份 */
      var curMonth = curDate.getMonth();
      /*  生成实际的月份: 由于curMonth会比实际月份小1, 故需加1 */
      curDate.setMonth(curMonth + 1);
      /* 将日期设置为0, 这里为什么要这样设置, 我不知道原因, 这是从网上学来的 */
      curDate.setDate(0);
      /* 返回当月的天数 */
      return curDate.getDate();
    }
  },
  mounted() {
    for (let i = 2000; i <= 2030; i++) {
      this.year.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      this.month.push(i);
    }

    for (let i = 0; i <= 23; i++) {
      this.hour.push(i < 10 ? "0" + i : i);
    }
    for (let i = 0; i <= 59; i++) {
      this.min.push(i < 10 ? "0" + i : i);
    }
    eventBus.$on("closeModal", () => {
      this.show = false;
    });
  }
};
</script>
<style lang="scss">
.time-picker {
  width: 100%;
  height: 28px;
  line-height: 28px;
  border: 1px solid #767b81;
  background: #676c73;
  padding: 5px;
  position: relative;

  .value {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0.8;
    cursor: pointer;
    transition: 0.2s all;
    .close-btn {
    }
    &:hover {
      opacity: 1;
    }
  }
  .modal-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 30px;
    border-radius: 3px;
    padding: 10px;
    background: white;
    color: #2b2b2b;
    .year-month-picker {
    }
    .day-picker {
      .item {
        $size: 30px;
        width: $size;
        height: $size;
        line-height: $size;
        text-align: center;
        color: #2b2b2b;
        float: left;
        border-radius: 3px;
        margin: 2px;
        cursor: pointer;
        transition: 0.2s all;
        &:hover,
        &.active {
          color: white;
          background-color: #00a2eb;
        }
      }
    }
    .hour-min-picker {
      .item {
      }
    }
  }
  .gray-button {
    border-radius: 3px;
    color: #ababab;
    background-color: #f1f1f1;
    margin: 0 10px;
    padding: 3px;
    i {
      font-size: 12px;
    }
  }
  hr {
    clear: both;
    border: none;
    border-bottom: 1px solid #f1f1f1;
    margin: 5px;
    padding: 0;
  }
  select {
    height: 28px;

    color: #515151;
    background-color: transparent;
    border-radius: 0px;
    font-size: 13px;
    padding: 5px;
    transition: 0.2s all;
    border: 1px solid #dedede;
    border-radius: 3px;
    option {
      text-align: center;
    }
    &:hover {
      border-color: #00a2eb;
      box-shadow: 0 0 5px #00a2eb;
    }
  }
}
</style>



// WEBPACK FOOTER //
// timePicker.vue?56e78704