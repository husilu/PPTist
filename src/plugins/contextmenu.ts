import { Directive, createVNode, render, DirectiveBinding } from 'vue'
import ContextmenuComponent from '@/components/Contextmenu/index.vue'

const CTX_CONTEXTMENU_HANDLER = 'CTX_CONTEXTMENU_HANDLER'

const contextmenuListener = (el: HTMLElement, event: MouseEvent, binding: DirectiveBinding) => {
  event.stopPropagation()
  event.preventDefault()

  const menus = binding.value(el)
  if (!menus) return

  let container: HTMLDivElement | null = null

  // 移除右键菜单并取消相关的事件监听
  const removeContextmenu = () => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
    el.classList.remove('contextmenu-active')
    document.body.removeEventListener('scroll', removeContextmenu)  
    window.removeEventListener('resize', removeContextmenu)
  }

  // 创建自定义菜单
  const options = {
    axis: { x: event.x, y: event.y },
    el,
    menus,
    removeContextmenu,
  }
  container = document.createElement('div')
  const vm = createVNode(ContextmenuComponent, options, null)
  render(vm, container) // 虚拟节点渲染成真实节点 并且挂载到真实节点上
  document.body.appendChild(container)

  // 为目标节点添加菜单激活状态的className
  el.classList.add('contextmenu-active')

  // 页面变化时移除菜单
  document.body.addEventListener('scroll', removeContextmenu)
  window.addEventListener('resize', removeContextmenu)
}

const ContextmenuDirective: Directive = {
  mounted(el: HTMLElement, binding) {
    el[CTX_CONTEXTMENU_HANDLER] = (event: MouseEvent) => contextmenuListener(el, event, binding)
    el.addEventListener('contextmenu', el[CTX_CONTEXTMENU_HANDLER])
  },

  unmounted(el: HTMLElement) {
    if (el && el[CTX_CONTEXTMENU_HANDLER]) {
      el.removeEventListener('contextmenu', el[CTX_CONTEXTMENU_HANDLER])
      delete el[CTX_CONTEXTMENU_HANDLER]
    }
  },
}

export default ContextmenuDirective