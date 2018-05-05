<!--背景音乐选择器-->
<template>
    <div class="bgm-selector">
        <audio ref="player" :src="playingBgmUrl"></audio>

        <div class="tab-heading">
            <div :class="['item',(index==selected?'active':'')]" v-for="(item,index) in tabItems" @click="onTabItemClickHandler(index)">
              <span>{{item.text}}</span>
            </div>
        </div>
        <div class="music-list">
            <div :class="getMusicItemClass(item)" v-for="item in musicItems">
              <!--音乐标题-->
              <div class="title"  @click="playMusic(item)">
                    <i class="tbzico ico-music"></i>
                  <span>{{item.title}}</span>
              </div>
              <!--播放动画-->
              <div class="play-ico" v-show="playingBgmUrl==item.url && playing==true"  @click="playMusic(item)">
                <img src="./../../../../assets/images/player2-playing.gif"/>
              </div>
              <!--填充-->
              <div style="flex:1"  @click="playMusic(item)"></div>
              <!--播放图标-->
              <div class="play-btn"  @click="playMusic(item)">
                 <i :class="['tbzico',(playingBgmUrl==item.url && playing==true?'ico-zanting':'ico-play')]" />
              </div>
              <!--选择状态-->
              <div :class="['select-ico',(singlePageConfig.bgm_url==item.url?'active':'')]"  @click="setMusic(item)">
                <i class="tbzico ico-ok"/>
              </div>
            </div>

        </div>
    </div>
</template>
<script>
import $ from "jquery";
import common from "@/common/common.js";
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      //播放状态
      playing: false,
      //分类
      tabItems: [],
      //当前选择选择
      selected: 0,
      playingBgmUrl: ""
    };
  },
  computed: {
    musicItems() {
      if (this.tabItems.length == 0) {
        return [];
      }
      return this.tabItems[this.selected].items;
    },
    singlePageConfig() {
      return (
        this.$store.state.docData.edit_config.singlePageConfig || {
          bgm_url: "",
          bgm_title: ""
        }
      );
    }
  },
  methods: {
    getMusicItemClass(item) {
      if (this.playing == true && item.url == this.playingBgmUrl) {
        return ["item", "active"];
      } else {
        return ["item"];
      }
    },
    playMusic(item) {
      if (this.playingBgmUrl == item.url && this.playing) {
        this.playing = false;
        this.playingBgmUrl = "";
      } else {
        this.playing = true;
        this.playingBgmUrl = item.url;
        let self = this;
        this.$refs.player.oncanplay = function() {
          self.$refs.player.play();
        };
        this.$refs.player.onended = function() {
          self.playing = false;
          self.playingBgmUrl = "";
        };
      }
    },
    setMusic(item) {
      if (this.singlePageConfig.bgm_url == item.url) {
        this.singlePageConfig.bgm_title = "";
        this.singlePageConfig.bgm_url = "";
      } else {
        this.singlePageConfig.bgm_title = item.title;
        this.singlePageConfig.bgm_url = item.url;
      }
      eventBus.$emit("infoChange", {
        type: "singlePage",
        snap: false
      });
    },
    onTabItemClickHandler(index) {
      this.selected = index;
    },
    onStopClickHandler() {
      if (this.playing) {
        this.playing = false;
        this.$refs.player.pause();
      } else {
        if (this.singlePageConfig.bgm_url != "") {
          this.playing = true;
          this.$refs.player.play();
        } else {
          alert("请选择一首音乐进行播放");
        }
      }
    },
    onRemoveClickHandler() {
      this.singlePageConfig.bgm_url = "";
      this.singlePageConfig.bgm_title = "";
      this.$refs.player.pause();
      this.playing = false;
      eventBus.$emit("infoChange", {
        type: "singlePage"
      });
    }
  },
  mounted() {
    $.get({
      url: "/editor/getMaterial4/query/t-19-r-1000-c--p-1.html",
      success: res => {
        //------
        let resObj = JSON.parse(res);
        resObj.forEach(item => {
          let tabItemsFindIndex = common.findArrayIndex(
            this.tabItems,
            "text",
            item.classify
          );
          if (tabItemsFindIndex != -1) {
            this.tabItems[tabItemsFindIndex].items.push({
              title: item.title,
              url: item.url
            });
          } else {
            this.tabItems.push({
              text: item.classify,
              items: [
                {
                  title: item.title,
                  url: item.url
                }
              ]
            });
          }
        });
        //------
      }
    });
  }
};
</script>
<style lang="scss" scoped>
.bgm-selector {
  .tab-heading {
    display: flex;
    .item {
      background-color: #545961;
      flex: 1;
      cursor: pointer;
      border-right: 1px solid #414750;
      border-top: 2px solid #414750;
      border-bottom: 1px solid #414750;
      height: 32px;
      line-height: 28px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      span {
        opacity: 0.5;
      }
      &.active {
        border-bottom: none;
        box-shadow: none;
        span {
          opacity: 1;
        }
      }
    }
    .item:last-child {
      border-right: none;
    }
  }
  .music-list {
    transition: all 0.2s;
    &::-webkit-scrollbar {
      width: 2px;
      height: 5px;
    }
    &::-webkit-scrollbar-corner {
      background-color: rgba(0, 0, 0, 0.5);
    }
    &::-webkit-scrollbar-thumb:vertical {
      background-color: rgba(0, 0, 0, 0.5);
    }
    &::-webkit-scrollbar-thumb:horizontal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    * {
      transition: all 0.2s;
    }
    height: 220px;
    overflow-y: auto;
    .item {
      cursor: pointer;
      * {
        cursor: pointer;
      }
      height: 32px;
      line-height: 32px;
      padding: 0 8px 0 8px;
      display: flex;
      border-bottom: 1px solid #414750;
      border-left: 2px solid transparent;
      .title {
        i {
          padding-right: 5px;
          font-size: 14px;
        }
      }
      .play-ico {
        width: 32px;
        text-align: center;
      }
      .play-btn {
        i {
          font-size: 18px;
          color: #00a2eb;
        }
      }
      .select-ico {
        $size: 18px;
        width: $size;
        height: $size;
        line-height: $size;
        text-align: center;
        border: 1px solid #00a2eb;
        margin-top: 7px;
        margin-left: 10px;
        margin-right: 10px;

        i {
          font-size: 12px;
          color: #fff;
          opacity: 0;
        }
        &.active {
          background-color: #00a2eb;
          i {
            opacity: 1;
          }
        }
      }
      &:hover {
        background-color: #4c5158;
      }
      &.active {
        background-color: #4c5158;
        border-left: 2px solid #059ce1;
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// player.vue?2c36f96a