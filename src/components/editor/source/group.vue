<template>
	<div class="group-box">
		<div v-for="(item,index) in group" :class="['wrapper',{active:index==activeGroup}]">
			<div class="title" @click="checkIndex(index)">
				{{item.title}} <i :class="['tbzico','ico-arrow3',{ico180:index!==activeGroup}]"></i>
			</div>
			<div class="list u-scroll" v-if="index==activeGroup&&item.data.length>0||item.full" ref="box" @scroll="scroll">
				<Waterfall  :line-gap="item.gap" :watch="item.data" align="left" ref="waterfall">
					<WaterfallSlot v-for="(row,i) in item.data" :width="row.owidth" :height="row.oheight" :key="row.id" :order="index">
						<p draggable="true" @click="addElement(row)" @dragstart="handleDragstart(row)">
							<img :src="row.thumbnail" alt="" width="100%">
						</p>
					</WaterfallSlot>
				</Waterfall>
				<div class="underline" v-show="item.full">你已经触及了我的底线！</div>
			</div>
		</div>
	</div>
</template>
<script>
import Dispatch from "@/common/dispatch.js";
import Waterfall from "vue-waterfall/lib/waterfall";
import WaterfallSlot from "vue-waterfall/lib/waterfall-slot";
import eventBus from "@/common/eventBus.js";
import common from "@/common/common.js";

export default {
  name: "group",
  components: { Waterfall, WaterfallSlot },
  data() {
    return {
      request: false,
      group: [
        {
          title: "图文组合",
          url: "/editorApi/v1/element/group-list",
          data: [],
					gap:130,
          page: 1,
          type: 1,
          full: 0
        },
        {
          title: "文字组合",
          url: "/editorApi/v1/element/group-list",
          data: [],
					gap:90,
          page: 1,
          type: 2,
          full: 0
        }
      ],
      activeGroup: 0
    };
  },
  methods: {
    scroll(e) {
      var _group = this.group[this.activeGroup];
      if (_group.full || this.request) {
        return;
      }
      var t1 = e.target.scrollTop,
        box = this.$refs.box[0].offsetHeight,
        waterfall = this.$refs.waterfall[0].$el.offsetHeight,
        offset = waterfall - box - t1;
      if (offset < 50) {
        this.request = true;
        _group.page++;
        this.loadData();
      }
    },
    checkIndex(i) {
      if (this.activeGroup == i) {
        this.activeGroup = -1;
      } else {
        this.activeGroup = i;
        if (this.group[i].data.length == 0 && this.group[i].full == 0) {
          this.loadData();
        }
      }
    },
    loadData() {
      var _group = this.group[this.activeGroup];
			console.log('load',_group)
      Dispatch.getWaterfallData({
        url: _group.url,
        page: _group.page,
        type: _group.type
      }).then(result => {
        var _data = result.data.data.list;
        if (_data.length == 0) {
          _group.full = 1;
        } else if(this.activeGroup==0){//图文
					_data.forEach(item => {
            var _edit_data = JSON.parse(item.edit_data);
            item.owidth = 135;
            item.oheight =
              _edit_data.info.height * 129 / _edit_data.info.width + 6;
          });4
					_group.data = _group.data.concat(_data);
				}else{//文字
          _data.forEach(item => {
            var _edit_data = JSON.parse(item.edit_data);
            item.owidth = 90;
            item.oheight =
              _edit_data.info.height * 84 / _edit_data.info.width + 6;
          });
          _group.data = _group.data.concat(_data);
        }
        this.request = false;
      });
    },
    addElement(item) {
      let groupData = JSON.parse(item.edit_data);
      groupData.elements = groupData.elements.map(item => {
        return common.formatElement(item);
      });
      console.log("添加数据->", groupData);
      eventBus.$emit("addElement", {
        type: "group",
        url: "",
        item: groupData
      });
    },
    handleDragstart(item) {
      this.$store.state.editor.dragEvent.type = item.type;
      this.$store.state.editor.dragEvent.url = item.url;
      this.$store.state.editor.dragEvent.item = item;
    }
  },
  created() {
    this.loadData();
  }
};
</script>
<style lang="scss">
.group-box {
  height: 100%;
  .wrapper {
		height: 46px;
		transition: height ease-in-out .2s;
		overflow: hidden;
		margin-bottom: 1px;
		&.active{
			height:calc(100vh - 47px - 50px);
		}
    .title {
      height: 46px;
      background: #545961;
      color: #fff;
      font-size: 14px;
      line-height: 46px;
      padding: 0 23px;
      cursor: pointer;
			position: relative;
			z-index: 2;
      i {
        font-size: 35px;
        float: right;
      }
    }
    .list {
      height: calc(100vh - 144px);
      overflow-y: auto;
      padding: 15px 0 15px 20px;
      .vue-waterfall {
        .vue-waterfall-slot {
          padding: 3px;
          p {
            cursor: pointer;
          }
        }
      }
      .underline {
        padding: 30px;
        color: #757c86;
        text-align: center;
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// group.vue?5877c9c2