<template>
	<transition name="fade-modal">
	<div class="save-modal modal" v-if="saveShow"  @mousedown.stop="">
		<span class="modal-close" @click="closeModal"></span>
		<div class="save-box">
			<div class="item">
				<span>文件名</span>
				<input type="text" placeholder="给文件命名" v-model="saveData.fileName">
			</div>
			<div class="item" v-if="$store.state.editor.tpl_mode==1">
				<span>选择样式</span>
				<select v-model="activeTag">
					<option v-for="item in tags" :value="item.product">{{item.name}}</option>
				</select>
			</div>
		</div>
		<div class="btn-box">
			<button @click="saveFile">确定</button>
			<button @click="closeModal">取消</button>
		</div>
	</div>
	</transition>
</template>
<script>
import socket from "@/common/socket.js";
import Dispatch from "@/common/dispatch.js";
export default {
  data() {
    return {
      fold: [
        {
          id: 0,
          name: "我的设计"
        }
      ],
      tags: [],
      activeTag: "",
      saveData: {
        foldIndex: 0, // index对应fold数组下标,获取文件夹id
        fileName: ""
      }
    };
  },
  methods: {
    closeModal() {
      this.$store.commit("callModal");
    },
    saveFile() {
      var _self = this;
      var foldId = this.fold[this.saveData.foldIndex].id;
      this.closeModal();
      this.$store.commit("callModal", {
        type: "wait",
        modalOver: true,
        notAlert: true
      });
      //执行保存
      var pageArr = [];

      for (var i = 0; i < this.getDocData.page.length; i++) {
        //只有页面已经加载的时候,才向后台传递更新
        if (this.getDocData.page[i].loaded) {
          pageArr.push({
            tpl_id: this.getDocData.id,
            id: this.getDocData.page[i].id,
            edit_config: this.getDocData.page[i].edit_config,
            index: i,
            elements: this.getDocData.page[i].data
          });
        } else {
          pageArr.push({
            tpl_id: this.getDocData.id,
            id: this.getDocData.page[i].id,
            edit_config: this.getDocData.page[i].edit_config,
            index: i
          });
        }
      }

      var params = {
        tpl_id: this.getDocData.id,
        uid: this.$store.state.editor.uid,
        title: this.saveData.fileName,
        edit_config: this.getDocData.edit_config,
        team_id: this.$store.state.stage.groupId,
        folder_id: foldId,
        pages: pageArr
      };
      if (this.$store.state.editor.tpl_mode == 1) {
        params.product = this.activeTag;
      }
      window.onbeforeunload = null;
      socket.editorEmit("templateSaveAs", params, function(e) {
        if (typeof _self.$store.state.editor.tpl_mode != "undefined") {
          window.location.href =
            "/diy4/" +
            e.data.tpl_id +
            "/" +
            _self.$store.state.editor.tpl_mode +
            "/";
        } else {
          window.location.href = "/diy4/" + e.data.tpl_id;
        }
      });
    }
  },
  computed: {
    saveShow() {
      return this.$store.state.editor.modal["save"];
    },
    //获取文档快照表
    getDocData() {
      return this.$store.state.docData;
    }
  },
  watch: {
    saveShow: function(val) {
      if (val && this.$store.state.editor.tpl_mode == 1) {
        Dispatch.getTags({
          tpl_id: this.$store.state.docData.id,
          success: data => {
            this.activeTag = data.nowProduct;
            this.tags = data.productList;
          }
        });
      }
    }
  }
};
</script>
<style lang="scss">
.save-modal {
  width: 478px;
  margin-top: -125px;
  margin-left: -240px;
  &:before {
    content: "另存为";
  }
  .save-box {
    padding: 20px;
    .item {
      padding-bottom: 15px;
      span {
        width: 56px;
        display: inline-block;
        height: 43px;
        line-height: 43px;
        font-size: 14px;
        color: #666;
        margin-right: 10px;
      }
      select {
        width: 350px;
        height: 43px;
        appearance: none;
        background: url(../../../../assets/images/arrow7.png) 325px 50%
          no-repeat #dadada;
        border: 0;
        padding-left: 10px;
        padding-right: 10px;
        line-height: 43px;
        color: #666;
        font-size: 14px;
        border-radius: 4px;
        cursor: pointer;
      }
      input {
        width: 350px;
        height: 39px;
        border: 2px solid #dedede;
        padding-left: 10px;
        padding-right: 10px;
        color: #666;
        font-size: 14px;
        border-radius: 4px;
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// saveas.vue?e86228d0