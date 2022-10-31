<template>
  <el-rate
    v-model="localModel"
    v-bind="$attrs"
    :name="name"
    @change="$emit(emitEvent, name, localModel)"
  >
  </el-rate>
</template>
<script>
import { Rate } from 'element-ui';
export default {
  inheritAttrs: false,
  props: {
    model: { type: Number, default: 0 },
    name: String,
    emitEvent: { type: String, default: 'set-value' }
  },
  data() {
    return {
      localModel: this.model || 0,
      colors: ['#ECD402']
    };
  },
  components: { 'el-rate': Rate }
};
</script>
<style lang="scss">
.el-icon-star-on:before {
  content: '';
  width: 24px;
  height: 24px;
  display: inline-block;
  background-image: url('/front/public/style/img/star-filled.svg');
  background-size: 22px 22px;
  background-repeat: no-repeat;
  background-position: center center;
}

.el-icon-star-off {
  color: $yellow-600 !important;
}

.el-rate {
  // display: flex;
  height: 24px;

  &__item:not(:last-child) {
    .el-rate__icon {
      margin-right: 12px;
    }
  }

  &__item:hover {
    height: 27px;
  }
}
</style>
