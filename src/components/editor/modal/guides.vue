<template>
    <div class="guides" v-if="show" @mousedown.stop="">
        <div class="guides-content">
            <div class="top">
                <div class="title">添加参考线</div>
                <div class="close" @mousedown.stop="closeModal">
                    <i class="tbzico ico-close"></i>
                </div>
            </div>
            <div class="select">
                <span class="radio-item">
                    <input id="item1" v-model="type" name="guides-type" type="radio" value="x" checked />
                    <label for="item1"></label>
                    <span>水平</span>
                </span>
                <span class="radio-item">
                    <input id="item2" v-model="type" name="guides-type" type="radio" value="y" />
                    <label for="item2"></label>
                    <span>垂直</span>
                </span>
            </div>
            <div class="add">
                <button @click="addGuide">添加</button>
            </div>
        </div>
    </div>
</template>
<script>

export default {
    data() {
        return {
            type: 'x'
        }
    },
    computed: {
        show() {
            return this.$store.state.editor.modal['guides'];
        },
        //获取svg的宽度
        getSvgWidth() {

            if (this.$store.state.docData.edit_config.unit == "px") {
                //像素
                return (this.$store.state.docData.edit_config.width);
            } else if (this.$store.state.docData.edit_config.unit == "mm") {
                //毫米
                return ((this.$store.state.docData.edit_config.width * this.$store.state.docData.edit_config.dpi / 25.4));
            }

        },
        //获取svg的高度
        getSvgHeight() {
            if (this.$store.state.docData.edit_config.unit == "px") {
                //像素
                return (this.$store.state.docData.edit_config.height);
            } else if (this.$store.state.docData.edit_config.unit == "mm") {
                //毫米
                return ((this.$store.state.docData.edit_config.height * this.$store.state.docData.edit_config.dpi / 25.4));
            }
        },
        //获取当前文档,当前页的数据
        getNowPageData() {
            if (this.$store.state.docData.page.length > 0) {

                return this.$store.state.docData.page[this.$store.state.docData.editor.nowPage];
            } else {
                console.log('没有任何页面数据,无法完成载入')
                return [];
            }
        },
    },
    methods: {
        closeModal() {
            this.$store.commit('callModal');
        },
        addGuide() {
            console.log('type!!', this.type)
            if (this.type == 'y') {
                this.getNowPageData.edit_config.guides.push({
                    type: 'x',
                    pos: this.getSvgWidth / 2
                })
            } else {
                this.getNowPageData.edit_config.guides.push({
                    type: 'y',
                    pos: this.getSvgHeight / 2
                })
            }
            this.closeModal();

        }
    }
}
</script>

<style lang="scss" scoped>
.guides {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10000;
    background-color: rgba(0, 0, 0, 0.2);
    .guides-content {
        width: 260px;
        height: 180px;
        background: white;
        border-radius: 5px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        padding: 10px;
        .top {
            display: flex;
            .title {
                flex: 1;
                color: #515151;
                font-size: 12px;
            }
            .close {
                i {
                    font-size: 12px;
                    color: #b8b8b8;
                    cursor: pointer;
                    &:hover {
                        color: #32c46e;
                    }
                }
            }
        }
        .select {
            margin-top: 15px;
            background-color: #e7e7e7;
            border-radius: 5px;
            padding: 20px;
            text-align: center;
            .radio-item {
                position: relative;
                margin: 15px;
                input[type=radio] {
                    width: 16px;
                    height: 16px;
                    opacity: 0;
                }


                label {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 16px;
                    height: 16px;
                    background: #ffffff;
                    border-radius: 50%;
                }
                label::after {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    background-color: #32c46e;
                    border-radius: 50%;

                    transition: all 0.2s;
                }
                input:checked+label::after {
                    transform: translate(-50%, -50%) scale(1);
                }
                span {
                    color: #515151;
                    font-size: 14px;
                }
            }
        }
        .add {
            margin-top: 15px;
            button {
                width: 100%;
                height: 50px;
                background-color: #32c46e;
                color: white;
                font-size: 14px;
                border-radius: 5px;

                &:hover {
                    opacity: 0.8;
                }
            }
        }
    }
}
</style>



// WEBPACK FOOTER //
// guides.vue?743314ac