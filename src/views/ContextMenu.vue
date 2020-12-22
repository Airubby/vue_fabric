<template>
  <div :style="style" class="context-menu" v-show="show" @mousedown.stop @contextmenu.prevent >
    <slot></slot>
  </div>
</template>

<script>
export default {
    name: 'context-menu',
    data () {
        return {
            triggerShowFn: () => {},
            triggerHideFn: () => {},
            x: null,
            y: null,
            style: {},
            binded: false
        }
    },
    props: {
        target: null,
        show: Boolean
    },
    mounted () {
        this.bindEvents()
    },
    watch: {
        show (show) {
            if (show) {
                this.bindHideEvents()
            } else {
                this.unbindHideEvents()
            }
        },
        target (target) {
            this.bindEvents()
        }
    },
    methods: {
        // 初始化事件
        bindEvents () {
            this.$nextTick(() => {
                if (!this.target || this.binded) return 
                this.triggerShowFn = this.contextMenuHandler.bind(this)
                this.target.addEventListener('contextmenu', this.triggerShowFn)
                this.binded = true
            })
        },

        // 取消绑定事件
        unbindEvents () {
            if (!this.target) return
            this.target.removeEventListener('contextmenu', this.triggerShowFn)
        },

        // 绑定隐藏菜单事件
        bindHideEvents () {
            this.triggerHideFn = this.clickDocumentHandler.bind(this)
            document.addEventListener('mousedown', this.triggerHideFn)
            document.addEventListener('mousewheel', this.triggerHideFn)
        },

        // 取消绑定隐藏菜单事件
        unbindHideEvents () {
            document.removeEventListener('mousedown', this.triggerHideFn)
            document.removeEventListener('mousewheel', this.triggerHideFn)
        },

        // 鼠标按压事件处理器
        clickDocumentHandler (e) {
            this.$emit('update:show', false)
        },

        // 右键事件事件处理
        contextMenuHandler (e) {
            this.x = e.clientX
            this.y = e.clientY
            this.layout()
            this.$emit('update:show', true)
            e.preventDefault()
        },

        // 布局
        layout () {
            this.style = {
                left: this.x + 'px',
                top: this.y + 'px'
            }
        }
    }
}
</script>
<style lang="less" scoped>
    .context-menu{
        display: block;
        position: fixed;
        background: #fff;
        border: solid 1px rgba(0, 0, 0, .2);
        border-radius: 3px;
        z-index: 99999;
        a {
            width: 75px;
            height: 28px;
            line-height: 28px;
            text-align: center;
            display: block;
            color: #1a1a1a;
        }
        a:hover {
            background: #eee;
            color: #fff;
        }
    }
</style>