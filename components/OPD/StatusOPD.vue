<template>
  <div>
    <div class="opd fw-500" :class="statusClass[id]">{{ name }}</div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  computed: {
    statusClass() {
      return {
        accepted: 'opd-green',
        denied: 'opd-red',
        sent: 'opd-yellow'
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.opd {
  display: inline-flex;
  vertical-align: middle;
  margin-bottom: 20px;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  line-height: 20px;
  color: $white;

  &-green {
    background-color: $green-20;
    color: $green-130;
  }

  &-yellow {
    background-color: $orange;
  }

  &-red {
    background-color: $red;
  }
}
</style>
