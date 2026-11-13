import DefaultTheme from 'vitepress/theme'
import './style.css'
import './components.css'
import DemoCard from './components/DemoCard.vue'
import StackSwitcher from './components/StackSwitcher.vue'
import ComponentOverview from './components/ComponentOverview.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('DemoCard',DemoCard)
    app.component('StackSwitcher',StackSwitcher)
    app.component('ComponentOverview',ComponentOverview)
  },
}
