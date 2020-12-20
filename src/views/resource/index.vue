<template>
  <div class="resource">
    <Resource-list />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ResourceList from './components/list.vue'

export default Vue.extend({
  name: 'ResourceIndex',
  components: {
    ResourceList
  }
})
</script>

<style lang="scss" scoped></style>
