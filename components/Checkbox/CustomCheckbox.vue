<template>
  <el-checkbox
    v-bind="$attrs"
    v-model="model"
    v-on="{ ...$listeners, change: () => {} }"
    :true-label="1"
    :false-label="0"
    :class="[
      model ? 'checked' : '',
      'custom-checkbox',
      error == true ? 'is-error' : ''
    ]"
    :disabled="disabled"
    >{{ text }}
  </el-checkbox>
</template>

<script>
import { Checkbox } from 'element-ui';

export default {
  inheritAttrs: false,
  components: {
    'el-checkbox': Checkbox
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: { type: Boolean, default: false }
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('change', value);
      }
    }
  }
};
</script>

<style lang="scss">
.custom-checkbox {
  max-height: 28px;
  display: flex;
  align-items: center;

  .is-focus {
    padding: 2px !important;
    border: 2px solid $blue80;
    height: 28px;
    width: 28px;
    border-radius: 4px;
    max-height: none !important;
    margin-right: 10px;
  }

  .el-checkbox__label {
    cursor: pointer;
    color: $grey80;
    font-size: 14px;
    align-content: center;
    line-height: 24px;
    padding-left: 0;
  }

  .el-checkbox__input {
    height: 28px;
    width: 28px;
    padding: 4px;
    margin-right: 10px;

    .el-checkbox__inner {
      background-color: transparent;
      background-position: center;
      background-image: url('../../../assets/img/checkbox_square.svg');
      background-size: contain;
      height: 20px;
      width: 20px;
      border: 0;

      &::after {
        display: none;
      }
    }
  }

  &:hover {
    .el-checkbox__inner {
      background-image: url('../../../assets/img/checkbox-hover_square.svg');
    }
  }

  &:not(.is-disabled) .el-checkbox__inner {
    cursor: pointer;
  }

  &.is-disabled {
    cursor: default;

    .el-checkbox__inner {
      background-image: url('../../../assets/img/checkbox-disabled_square.svg');
    }

    .el-checkbox__label {
      color: $grey40;
    }
  }

  &.checked {
    .el-checkbox__inner {
      background-image: url('../../../assets/img/checkbox-checked_square.svg');
    }

    &:hover {
      .el-checkbox__inner {
        background-image: url('../../../assets/img/checkbox-checked-hover_square.svg');
      }
    }

    &.is-disabled {
      .el-checkbox__inner {
        background-image: url('../../../assets/img/checkbox-checked-disabled_square.svg');
      }

      .el-checkbox__label {
        color: $grey40;
      }
    }
  }
}

.is-error {
  .el-checkbox__input {
    .el-checkbox__inner {
      background-image: url('../../../assets/img/checkbox-error.svg') !important;
    }
  }
}
</style>
