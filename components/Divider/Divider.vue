<template>
  <div
    class="divider"
    :class="{ 'horizontal-line': hasLine }"
    :style="{ height: dividerSize + 'px' }"
  />
</template>

<script>
export default {
  name: 'vacancy-divider',
  props: {
    dividerSize: {
      type: String,
      default: '24'
    },
    hasLine: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.horizontal-line {
  border-bottom: 1px solid $black-20;
}
</style>
