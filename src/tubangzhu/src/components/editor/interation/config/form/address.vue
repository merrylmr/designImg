<template>
  <div class="address-form-element">
    <div class="label-text">
      <div class="label">标题</div>
      <input type="text" placeholder="请输入标题" v-model="itemData.name" @change="onInputChange"/>
    </div>
    <!--地址层级-->
    <div class="address-wrap">
      <!--省-->
      <div class="address-item">
        <div class="checkbox">
          <input type="checkbox" v-model="itemData.items.province.use" @change="onUseChange('province')"/>
          <span></span>
        </div>
        <div class="content-wrap">
          <select class="input" v-model="itemData.items.province.value" @change="onProvinceInputHandler">
            <option value="default">省/自治区/直辖市</option>
            <option v-for="item in provinceList" :value="item.value">
              {{item.text}}
            </option>
          </select>
        </div>
      </div>
      <!--市-->
      <div class="address-item">
        <div class="checkbox">
          <input type="checkbox" v-model="itemData.items.city.use" @change="onUseChange('city')"/>
          <span></span>
        </div>
        <div class="content-wrap">
          <select class="input" v-model="itemData.items.city.value" @change="onCityInputHandler"> 
            <option value="default">市</option>
            <option v-for="item in cityList" :value="item.value">
              {{item.text}}
            </option>
          </select>
        </div>
      </div>
      <!--区-->
      <div class="address-item">
        <div class="checkbox">
          <input type="checkbox" v-model="itemData.items.area.use" @change="onUseChange('area')"/>
          <span></span>
        </div>
        <div class="content-wrap">
          <select class="input" v-model="itemData.items.area.value" @change="onInputChange">
            <option value="default">区/县</option>
            <option v-for="item in areaList" :value="item.value">
              {{item.text}}
            </option>
          </select>
        </div>
      </div>
      <!--详细地址-->
      <div class="address-item">
        <div class="checkbox">
          <input type="checkbox" v-model="itemData.items.address.use" @change="onUseChange('address')"/>
          <span></span>
        </div>
        <div class="content-wrap">
          <input class="input text" type="text" placeholder="详细地址填写框" disabled="disabled" v-model="itemData.items.address.value"/>
        </div>
      </div>
    </div>
    <div class="bottom-content">
      <span class="left">
        <checkbox title="必填" :checked="itemData.required" @onChange="onRequiredChange" />
      </span>
      <span class="right">
      <button class="remove-btn" @click="onRemoveHandler">
      <i class="tbzico ico-remove1"></i>
      </button>
      </span>
      <div class="clear"></div>

    </div>
  </div>
</template>
<script>
import checkbox from "@/components/editor/ui/checkbox";
import eventBus from "@/common/eventBus.js";
import $ from "jquery";
export default {
  data() {
    return {
      provinceList: [],
      cityList: [],
      areaList: []
    };
  },
  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },

  props: ["itemData"],
  methods: {
    onRequiredChange(val) {
      this.$props.itemData.required = val;
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    //所有input发生更改触发
    onInputChange(e) {
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    setUse(province, city, area, address) {
      this.itemData.items.province.use = province;
      this.itemData.items.city.use = city;
      this.itemData.items.area.use = area;
      this.itemData.items.address.use = address;
    },
    onUseChange(level) {
      let use = this.itemData.items[level].use;
      switch (level) {
        case "province":
          if (use) {
            this.setUse(true, false, false, false);
          } else {
            this.setUse(false, false, false, false);
          }
          break;
        case "city":
          if (use) {
            this.setUse(true, true, false, false);
          } else {
            this.setUse(true, false, false, false);
          }
          break;
        case "area":
          if (use) {
            this.setUse(true, true, true, false);
          } else {
            this.setUse(true, true, false, false);
          }
          break;
        case "address":
          if (use) {
            this.setUse(true, true, true, true);
          } else {
            this.setUse(true, true, true, false);
          }
          break;
      }
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    onRemoveHandler() {
      this.$emit("onEvent", {
        type: "remove"
      });
    },
    onProvinceInputHandler(e) {
      //获取市联动
      $.get({
        url: "/editorApi/v1/main/get-district?id=" + e.target.value,
        success: res => {
          this.cityList = res.data;
          this.$props.itemData.items.city.value = "default";
          this.$props.itemData.items.area.value = "default";
        }
      });
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    onCityInputHandler(e) {
      //获取区联动
      $.get({
        url: "/editorApi/v1/main/get-district?id=" + e.target.value,
        success: res => {
          this.areaList = res.data;

          this.$props.itemData.items.area.value = "default";
        }
      });
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    }
  },
  components: {
    checkbox
  },
  mounted() {
    $.get("/editorApi/v1/main/get-district?id=0").then(res => {
      this.provinceList = res.data;
    });
    //如果city和area的value不是default,则查询其联动
    if (this.$props.itemData.items.city.value != "default") {
      $.get({
        url:
          "/editorApi/v1/main/get-district?id=" +
          this.$props.itemData.items.province.value,
        success: res => {
          this.cityList = res.data;
        }
      });
      $.get({
        url:
          "/editorApi/v1/main/get-district?id=" +
          this.$props.itemData.items.city.value,
        success: res => {
          this.areaList = res.data;
        }
      });
    }
  }
};
</script>
<style lang="scss">
.address-form-element {
  padding: 5px 10px;
  .address-wrap {
    margin: 10px 18px 4px 10px;
    .address-item {
      margin-top: 5px;
      display: flex;
      .checkbox {
        margin-top: 3px;
        cursor: pointer;
        width: 22px;
        height: 22px;
        position: relative;
        input {
          opacity: 0;
          width: 100%;
          height: 100%;
          &:checked + span::before {
            transform: scale(1);
          }
          &:checked + span {
            background-color: #00a2eb;
          }
        }

        span {
          position: absolute;
          pointer-events: none;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          border: 1px solid #dbdbdb;
          transition: 0.2s all;
          &::before {
            font-family: "tbzico" !important;
            content: "\E647";
            position: absolute;
            left: 3.5px;
            top: 3.5px;
            color: white;
            transition: 0.2s all;
            transform: scale(0);
          }
        }
      }
      .content-wrap {
        flex: 1;
        .input {
          margin-left: 8px;
          height: 28px;
          width: 100%;
          -webkit-appearance: none;
          border: 1px solid #dbdbdb;
          background-color: white;
          border-radius: 0px;
          font-size: 13px;
          padding: 5px;
          &:disabled {
            background: #efefef;
          }
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// address.vue?32a515ab