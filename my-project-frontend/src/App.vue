<script setup>
// 禁用暗色主题，强制使用浅色主题
// import { useDark, useToggle } from '@vueuse/core'

// useDark({
//   selector: 'html',
//   attribute: 'class',
//   valueDark: 'dark',
//   valueLight: 'light'
// })

// useDark({
//   onChanged(dark) { useToggle(dark) }
// })

// 强制设置浅色主题
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark')
  document.documentElement.classList.add('light')
}

</script>

<template>
  <header>
    <div class="wrapper">
      <router-view/>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}
</style>
