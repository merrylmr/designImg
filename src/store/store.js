import Vue from "vue";
import Vuex from "vuex";

import mutations from  './mutations';
import  getters from './getters';
Vue.use(Vuex);

const state = {
  //编辑器状态
  editor: {
    //手机上传推送
    uploadPush: null,
    //上次保存之后,是否进行过编辑
    saveChange: false,
    themeColor: "red",
    color: {},
    colorList: [],
    isDiy: false,
    diyColor: '',
    //上次是否断开
    lastDisconnect: false,
    //tpl_mode
    tpl_mode: 0,
    //是否已载入模板
    tplLoaded: false,

    //锁定编辑(撤销恢复过程中进行错定)
    lock: false,
    //左侧列表是否打开
    isSourceOpen: true,
    //右侧列表是否打开
    isPageOpen: true,
    //右侧表单面板是否打开
    isConfigOpen: true,
    //是否登录
    loginMode: 'visitor',
    //用户UID
    uid: 0,
    username: '',
    userFace: '',
    //自动保存
    autoSave: true,
    //用户桌面DPI
    userDPI: [
      0, 0
    ],
    //商户版信息
    coorpId: undefined,
    coop_allow_download: false,
    coop_download_data: null,
    coorpName: '',
    coorpLinks: null,
    coopAllowDownload: false,
    //开放API信息
    openId: undefined,
    openUrl: '',
    openAccessToken: '',
    open_on_finish: 'insert',
    admin_level: false,
    //拖动图片进入容器
    dragEvent: {
      type: '',
      length: 0,
      index: -1,
      overTarget: '',
      overContain: undefined,
      activeColor: 'rgba(0,0,0,.5)',
      dropContain: {},
      allowDrop: false,
      disallowDrop: false,
      drop: {
        target: '',
        x: 0,
        y: 0
      },
      clipImg: {
        url: '',
        width: 0,
        height: 0
      }
    },
    // 舞台上拖动图片时被激活的container
    stageOverContainer: null,
    //当前正在被编辑的文本元件(现设置为dom对象)
    nowEditText: null,
    //当前正在被编辑的组合文字元件
    nowEditGroupText: null,
    //当前正在编辑的表格
    nowEditTable: null,
    //滑动组件数据
    slide: {
      data: [],
      pos: ''
    },

    // 二维码配置文本
    qrcodeText: '',
    qrcodeTip: '',
    //模态框
    modal: {
      'unit': false,
      'savebox': false,
      'save': false,
      'wait': false,
      'share': false,
      'download': false,
      // 二维码
      'code': false,
      'wechatCode': false,
      //消息模态框
      'alert': false,
      'color': false,
      //预览
      'preview': false,
      //toolbar
      'size': false,
      'slide': false,
      'layer': false,
      'revert': false,
      'align': false,
      //登录注册
      'register': false,
      'login': false,
      'imageFilter': false,
      'coorp': false,
      //表格
      'tableMenu': false,
      //阴影
      'shadow': false,
      'textRadian': false,
      'cropper': false,
      'newPage': false,
      'userset': false,
      'colorset': false,
      //参考线窗口
      'guides': false,
      //添加表单元素
      'formList': false,
      'uploadGroup': false,
      'jianyePreview': false,
      'shanghuPay': false,
      'saleAction': false
    },
    //提示模态集合
    tip: {
      'container': false,
      'lock': false,
      'forbidden': false
    },
    modalOver: false,
    modalIsAlert: true,
    /*消息模态框信息
     *state(ok,danger) ico
     *text 消息文本
     *fn 确认回调
     */
    modalInfo: {
      cls: 'ok',
      text: '',
      fn: null
    },
    //容器编辑模态
    containerEditor: false,
    //是否开启网格
    grid: false,
    guides: {
      moving: false,
      movingItem: null
    },
    printBuyUrl: ''
  },
  //编辑器舞台状态,大部分编辑器功能的状态都在这里
  stage: {
    stageStyle: {
      left: 0,
      right: 0
    },
    //当前舞台缩放比例(百分比)
    zoom: 100,
    zoomType: 0, //{0:点击缩放，1：滚轮缩放}
    //鼠标相关信息
    mouse: {
      //当前坐标
      x: 0,
      y: 0,
      //移动向量
      vectorX: 0,
      vectorY: 0,
      //是否按下
      isDown: false,
      //鼠标按下时所在位置
      downX: 0,
      downY: 0,
      //是否正在选择selection的操作点
      controlPoint: '',
      //鼠标按下时,相对于当前物体的坐标(在元素内的坐标)
      parentX: 0,
      parentY: 0
    },
    //正在被单选的元素
    selectedItem: null,
    //正在被框选的元素数组以及其他属性
    selectionBox: {
      //当前选中的对象数组
      items: [],
      show: false,
      start: false,
      //矩形选择框
      left: 0,
      top: 0,
      width: 0,
      height: 0
    },
    //待复制数据(注意深复制)
    copyData: [],
    //文档快照记录表(用于撤销恢复)
    docSnap: [],
    //最近两次的整个文档快照记录,用于获取oldData
    docSnap2: [],
    //文档快照指针位置
    docSnapIndex: 0,
    groupId: 0,

    //团队颜色
    groupColor: ['#e60012', '#91cce8', '#644498']
  },
  //当前正在编辑文档的信息
  docData: {
    //文档基本信息 文档ID
    id: '',
    //标题
    title: '未命名文档',
    //模板类型
    product: "",
    //是否是自定义创建的模板
    is_diy: 0,
    // 是否可打印
    printable: 1,
    edit_config: {
      //舞台尺寸
      width: 1,
      height: 1,
      //单位(毫米mm|像素px)
      unit: 'px',
      //出血(单位:像素)
      bleed: 0,
      //模板DPI
      dpi: 300,
      //是否可修改大小
      sizeAble: true,
      //是否允许增加页面
      pageAddable: true,
      //用户���示器DPI(备用)
      userDPI: [
        0, 0
      ],
      //分割辅助线(水平切分页面生成辅助线,用于三折页等印刷品)
      splitSubline: 0,
      //使用过的颜色
      usedColor: [],
      //使用过的背景颜色
      usedBgColor: [],
      //文本快速编辑
      quick_design: false,
      //参考线颜色
      guidesColor: '#BABABA'
    },
    //文档每个页面的数据
    page: [{
      id: 'page_1',
      tpl_id: '0',
      edit_config: {
        backgroundID: '',
        backgroundColor: '#ffffff',
        customBackgroundUrl: ''
      },
      //页面数据
      data: [],
      //生成的svg代码结果
      svg: '',
      //被删除的元素列表(用于手动保存) deleteElements:[],
      index: 0
    }],
    //editor临时数据存储,传入后端请删除
    editor: {
      //当前正在编辑的页索引
      nowPage: 0
    }
  }
};
//图帮主状态中心,vuex
const store = new Vuex.Store({
  state,
  getters,
  mutations
});

export default store
