<template>
  <span class="circle-el" :style="styles"></span>
  <!-- <component :is="`style`">
      .circle-el { max-width: {{ maxOptionsWidth }}; }
    </component> -->
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: '#f6f8f9'
    },
    size: {
      type: Number,
      default: 24
    }
  },
  computed: {
    styles() {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
        minWidth: this.size + 'px',
        backgroundColor: this.color
      }
    }
  },
}
</script>
<style lang="scss" scoped>
  .circle-el {
    // height: 24px;
    // width: 24px;
    // min-width: 24px;
    // line-height: 24px;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
  }
</style>
