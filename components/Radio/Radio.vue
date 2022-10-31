<template>
  <el-radio
    v-model="localModel"
    v-bind="$attrs"
    :label="label"
    size="medium"
    :class="{
      'el-radio__hidden-label': isHiddenLabel,
      'is-error': !!error
    }"
    @change="$emit(emitEvent, label, localModel)"
    >{{ text }}
  </el-radio>
</template>

<script>
import { Radio } from 'element-ui';
export default {
  inheritAttrs: false,
  props: {
    emitEvent: { type: String, default: 'set-value' },
    label: String,
    model: String,
    text: String,
    isHiddenLabel: Boolean,
    error: { type: Boolean, default: false }
  },
  data() {
    return { localModel: this.model || '' };
  },
  watch: {
    model: function () {
      this.localModel = this.model || '';
    }
  },
  components: { 'el-radio': Radio }
};
</script>
<style lang="scss">
.el-radio {
  height: 28px;

  &__label {
    display: inline-block;
    vertical-align: middle;
    line-height: 24px;
    font-size: 16px;
    padding: 0;
    color: $grey80 !important;
  }

  .el-radio__input {
    height: 28px;
    padding: 4px;
    width: 28px;
    margin-right: 10px;

    .el-radio__inner {
      height: 20px;
      width: 20px;
      background-color: inherit;
      border: 2px solid $grey40;

      &::after {
        height: 6px;
        width: 6px;
      }
    }

    &.is-checked {
      .el-radio__inner {
        background: $white;
        border-color: $blue40;
        font-size: 20px;
        height: 20px;
        width: 20px;

        &::after {
          height: 6px;
          width: 6px;
          background-color: $blue40;
        }

        &:hover {
          border-color: $blue64;

          &::after {
            background-color: $blue64;
          }
        }
      }
    }
  }

  &.is-focus {
    .el-radio__input {
      border: 2px solid $blue80;
      border-radius: 20px;
      height: 28px;
      padding: 2px;
      width: 28px;
    }
  }

  &.is-disabled {
    color: $black-80;

    .el-radio__label {
      color: $grey40 !important;
    }

    .el-radio__inner {
      background: inherit;
      border-color: $grey40;
    }

    .el-radio__input.is-checked {
      .el-radio__inner {
        background-color: $white;
        border-color: $grey24;

        &:after {
          background-color: $grey24;
        }
      }
    }
  }

  &.is-error {
    .el-radio__input {
      .el-radio__inner {
        background-color: $red16;
        border: 2px solid $red;
      }
    }
  }

  &__hidden-label .el-radio__label {
    display: none;
  }
}
</style>
