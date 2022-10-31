<template>
  <input
    type="color"
    class="input-color"
    @change="e => $emit('change', e.target.value)"
    :value="color"
    :disabled="disabled"
  />
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: '#000000'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<style lang="scss" scoped>
.input-color {
  background: $white;
  border: 1px solid $black-30;
  box-sizing: border-box;
  border-radius: 4px;
  width: 60px;
  margin-left: 24px;
  height: 32px;

  &:hover {
    background: $black-10;
  }

  &:focus {
    border-color: $blue-120;
  }
}
</style>
