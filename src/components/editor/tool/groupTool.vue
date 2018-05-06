<!-- 框选对齐 -->
<template>
	<div class="groupAlign">
		<!--编组-->
		<span class="tool-text" @click="createGroup" v-if="selectedGroup==-1 && hasGroupElement==false">编组</span>
		 <span class="tool-text" @click="uploadGroup" v-if="selectedGroup!=-1 && adminLevel">上传组合</span>
		<span class="tool-text" @click="unGroup" v-if="selectedGroup!=-1">取消编组</span>

		<div class="split" style="margin-left:0px" v-if="hasGroupElement==false"></div>
		<color-picker class="item" v-if="groupColor!='no'" :mult="groupColor.mult" :color="groupColor.newColor" type="color" @onChange="onColorChange"></color-picker>
		<!-- 左对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gl" v-if="hasGroupElement==false" @click="handleGroupAlign('left')"></span>
		<!-- 水平居中对齐 -->
		<span class="tool-text tool-ico galign-ico ico-ghc" v-if="hasGroupElement==false" @click="handleGroupAlign('hCenter')"></span>
		<!-- 右对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gr" v-if="hasGroupElement==false" @click="handleGroupAlign('right')"></span>
		<div class="split" v-if="hasGroupElement==false"></div>
		<!-- 顶对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gt" v-if="hasGroupElement==false" @click="handleGroupAlign('top')"></span>
		<!-- 垂直居中对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gvc" v-if="hasGroupElement==false" @click="handleGroupAlign('vCenter')"></span>
		<!-- 底对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gb" v-if="hasGroupElement==false" @click="handleGroupAlign('bottom')"></span>
		<div class="split" v-if="hasGroupElement==false"></div>
		<!-- 垂直居中分布 -->
		<span class="tool-text tool-ico galign-ico ico-gv" v-if="hasGroupElement==false" @click="handleGroupAlign('v')"></span>
		<!-- 水平居中分布 -->
		<span class="tool-text tool-ico galign-ico ico-gh" v-if="hasGroupElement==false" @click="handleGroupAlign('h')"></span>

	</div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import colorPicker from "./../modal/colorPicker";

import $ from "jquery";
export default {
  //获取当前正在单选或多选的对象,返回一个数组
  computed: {
    hasGroupElement() {
      let grouped = false;
      this.selectedItems.forEach(selectedItem => {
        this.getNowPageData.edit_config.groups.forEach(groupItem => {
          groupItem.forEach(groupEleItem => {
            if (
              selectedItem.id == groupEleItem ||
              selectedItem.front_id == groupEleItem
            ) {
              grouped = true;
            }
          });
        });
      });
      return grouped;
    },
    //当前正在选择的组合,如果为空则返回false
    selectedGroup() {
      let items = this.$store.state.stage.selectionBox.items;
      let groups = this.getNowPageData.edit_config.groups;
      //遍历所有组,对比当前选中元素
      for (let groupIndex in groups) {
        let groupItem = groups[groupIndex];
        //计数器
        let counter = 0;
        //循环当前组的元素ID
        for (let eleIndex in groupItem) {
          let groupEleItem = groupItem[eleIndex];
          //循环选中的元素
          for (let selIndex in items) {
            let selItem = items[selIndex];
            if (
              selItem.id == groupEleItem ||
              selItem.front_id == groupEleItem
            ) {
              counter++;
            }
          }
          //判断counter是否和groupItem的数组长度相等,若相等,则说明当前选中的元素属于这个组
          if (counter == groupItem.length) {
            return groupIndex;
          }
        }
      }
      return -1;
    },
    selectedItems() {
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;
      if (selectedItem != null) {
        return [selectedItem];
      } else if (selectedItemsGroup.length > 0) {
        return selectedItemsGroup;
      } else {
        return [];
      }
    },
    groupColor() {
      //只获取一个颜色,分析当前选中元素的所有颜色,如果有不同的颜色,则返回'#000000',否则则返回改颜色,如果选中的对象中没有带color的属性,则返回no
      var colorArr = [];
      for (var i in this.selectedItems) {
        var item = this.selectedItems[i];

        switch (item.type) {
          case "svg":
          case "pattern":
          case "grid":
          case "container":
            var color = item.edit_data.color;
            for (var c in color) {
              if (this.colorInArray(colorArr, color[c]) == false) {
                colorArr.push(color[c]);
              }
            }
            break;
          case "text":
            var textJson = item.edit_data.textJson;
            for (var line in textJson) {
              for (var char in textJson[line].text) {
                var colorObj = {
                  oldColor: textJson[line].text[char].color,
                  newColor: textJson[line].text[char].color
                };
                if (this.colorInArray(colorArr, colorObj) == false) {
                  colorArr.push(colorObj);
                }
              }
            }
            break;
          /*case 'groupText':
						//svg颜色
						var color = item.edit_data.color;
						for(var c in color){
							if(this.colorInArray(colorArr,color[c])==false){
								colorArr.push(color[c]);
							}
						}
						//文本颜色
						var text = item.edit_data.text;
						for(var c in text){

							if(this.colorInArray(colorArr,text[c].color)==false){
								colorArr.push(text[c].color);
							}
						}
					break;*/
        }
      }
      if (colorArr.length == 1) {
        //颜色全部相同
        return colorArr[0];
      } else if (colorArr.length > 1) {
        //颜色不一致
        return {
          oldColor: "#000000",
          newColor: "#000000",
          mult: true
        };
      } else {
        //没有带颜色的属性
        return "no";
      }
    },
    adminLevel() {
      return this.$store.state.editor.admin_level;
    },
    //获取当前页的groups属性
    nowGroups() {
      return this.getNowPageData.edit_config.groups;
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      return this.$store.state.docData.page[
        this.$store.state.docData.editor.nowPage
      ];
    }
  },
  methods: {
    //上传编组
    uploadGroup() {
      this.$store.commit("callModal");
      this.$store.commit("callModal", { type: "uploadGroup" });
    },
    //编组
    createGroup() {
      let grouped = false;
      this.selectedItems.forEach(selectedItem => {
        this.getNowPageData.edit_config.groups.forEach(groupItem => {
          groupItem.forEach(groupEleItem => {
            if (selectedItem.id == groupEleItem) {
              grouped = true;
            }
          });
        });
      });
      if (grouped) {
        alert("存在已编组的元素,无法完成编组");
        return;
      }
      //加入到编组
      this.getNowPageData.edit_config.groups.push(
        this.selectedItems.map(item => {
          return item.id;
        })
      );

      eventBus.$emit("pageChange", {
        type: "update",
        targets: [this.getNowPageData]
      });
    },
    //取消编组
    unGroup() {
      let findEleItem = this.selectedItems[0];
      for (let a = 0; a < this.getNowPageData.edit_config.groups.length; a++) {
        for (
          let b = 0;
          b < this.getNowPageData.edit_config.groups[a].length;
          b++
        ) {
          if (
            this.getNowPageData.edit_config.groups[a][b] == findEleItem.id ||
            this.getNowPageData.edit_config.groups[a][b] == findEleItem.front_id
          ) {
            this.getNowPageData.edit_config.groups.splice(a, 1);
            break;
          }
        }
      }
      eventBus.$emit("pageChange", {
        type: "update",
        targets: [this.getNowPageData]
      });
    },
    //搜索颜色是否存在一个数组
    colorInArray(arr, color) {
      for (var i in arr) {
        if (arr[i].newColor.toUpperCase() == color.newColor.toUpperCase()) {
          return true;
        }
      }
      return false;
    },
    handleGroupAlign(type) {
      // 通知舞台方法
      eventBus.$emit("handleGroupAlign", type);
    },
    onColorChange(newColor) {
      //				console.log('color',color);

      for (var i in this.selectedItems) {
        var item = this.selectedItems[i];

        switch (item.type) {
          case "svg":
          case "pattern":
          case "grid":
          case "container":
            var color = item.edit_data.color;
            for (var c in color) {
              color[c].newColor = newColor;
            }
            break;
          case "text":
            var zoom = item.edit_config.width / item.edit_config.originalWidth;
            var size = item.edit_data.textJson[0].text[0].size * zoom;
            console.log("更新文字大小", size);
            var textJson = item.edit_data.textJson;
            for (var i = 0; i < textJson.length; i++) {
              for (var a = 0; a < textJson[i].text.length; a++) {
                textJson[i].text[a].size = size;
              }
            }

            var textJson = item.edit_data.textJson;
            for (var line in textJson) {
              for (var char in textJson[line].text) {
                textJson[line].text[char].color = newColor;
              }
            }
            //遍历html所有带style并带font-size的属性

            var $text = $("<div>" + item.edit_data.text + "</div>");

            //删除所有font的颜色属性
            $text.find("font").attr("color", "");
            $text.find("font").css("color", "");
            //删除所有font
            if ($text.find(".warp").length > 0) {
              //添加颜色
              $text.find(".warp").css("color", newColor);
            } else {
              //添加颜色
              $text.children("p").css("color", newColor);
            }

            item.edit_data.text = $text.html();
            //提交文字生成请求
            eventBus.$emit("updateTextElement", { item, snap: true });
            break;
        }
      }
      eventBus.$emit("elementChange", {
        type: "update",
        targets: this.selectedItems
      });
    }
  },
  components: { colorPicker }
};
</script>
<style lang="scss">
.split {
  margin-left: 0px !important;
}
</style>




// WEBPACK FOOTER //
// groupTool.vue?9edfa6c4