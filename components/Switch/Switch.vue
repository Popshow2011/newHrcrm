<template>
  <el-switch
    v-bind="$attrs"
    v-model="value"
    :ref="$attrs.name || 'switch'"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :class="{
      big: size === 'big',
      medium: size === 'medium',
      small: size === 'small',
      'is-focused': focused
    }"
    @change="value => $emit('switch', value)"
    :disabled="disabled"
  >
  </el-switch>
</template>
<script>
import { Switch } from 'element-ui';
export default {
  inheritAttrs: false,
  props: {
    size: {
      type: String,
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    model: { type: Boolean, default: false },
    activeColor: {
      type: String,
      default: '#0075DB'
    },
    inactiveColor: {
      type: String,
      default: '#CDD4DA'
    }
  },
  created() {
    setTimeout(() => {
      let switcher = this.$refs[`${this.$attrs.name || 'switch'}`].$el;
      switcher.addEventListener('focusin', () => {
        if (!this.focused) this.focused = true;
      });
      switcher.addEventListener('focusout', () => {
        if (this.focused) this.focused = false;
      });
    }, 0);
  },
  data() {
    return {
      value: this.model,
      focused: false
    };
  },
  watch: {
    model() {
      this.value = this.model;
    }
  },
  components: {
    'el-switch': Switch
  }
};
</script>
<style lang="scss" scoped>
.el-switch {
  &.big {
    height: 32px;
    line-height: 32px;

    &.is-checked ::v-deep .el-switch__core,
    & ::v-deep .el-switch__core {
      height: 32px;
      width: 52px !important;

      &::after {
        width: 24px;
        height: 24px;
      }
    }

    &:not(.is-disabled) ::v-deep .el-switch__core {
      &:active::after {
        width: 26px;
        height: 24px;
      }
    }

    &.is-checked:not(.is-disabled) ::v-deep .el-switch__core {
      &:active::after {
        width: 26px;
        height: 24px;
        margin-left: -2px;
      }
    }
  }

  &.medium {
    height: 24px;
    line-height: 24px;

    &.is-checked ::v-deep .el-switch__core,
    &::v-deep .el-switch__core {
      height: 24px;
      width: 36px !important;

      &::after {
        width: 16px;
        height: 16px;
      }
    }

    &:not(.is-disabled) ::v-deep .el-switch__core {
      &:active::after {
        width: 20px;
        height: 16px;
      }
    }

    &.is-checked:not(.is-disabled) ::v-deep .el-switch__core {
      &:active::after {
        width: 20px;
        height: 16px;
        margin-left: -4px;
      }
    }
  }

  &.small {
    height: 20px;
    line-height: 20px;

    &.is-checked ::v-deep .el-switch__core,
    &::v-deep .el-switch__core {
      height: 20px;
      width: 30px !important;

      &::after {
        width: 12px;
        height: 12px;
      }
    }

    &:not(.is-disabled) ::v-deep .el-switch__core {
      &:active::after {
        width: 16px;
        height: 12px;
      }
    }

    &.is-checked:not(.is-disabled) ::v-deep .el-switch__core {
      &:active::after {
        width: 16px;
        height: 12px;
        margin-left: -4px;
      }
    }
  }

  & ::v-deep &__core {
    // background-color: $black-40;
    border-color: transparent;
    border-radius: 40px;
    border: 0;

    &::after {
      padding: 0;
      border-radius: 12px;
      margin-top: 3px;
      margin-left: 0;
      left: 4px;
    }

    &:not(.is-disabled):hover {
      background-color: $black-50 !important;
    }

    &:focus {
      border: 2px solid $blue80 !important;
    }
  }

  & ::v-deep &__label {
    margin-right: 12px;

    span {
      color: $black-100;
      font-size: 15px;
    }
  }

  &.is-checked ::v-deep .el-switch__core {
    background-color: $blue40 !important;

    &::after {
      left: 45%;
    }

    &:not(.is-disabled):hover {
      background-color: $blue64 !important;
    }
  }

  &.is-focused ::v-deep .el-switch__core {
    outline: 2px solid $blue80 !important;
  }

  &:not(.is-checked) ::v-deep .el-switch__core {
    background-color: $grey12 !important;

    &:hover {
      background-color: $grey16 !important;
    }

    &:focus {
      border: 2px solid red;
    }
  }

  &.is-disabled {
    opacity: 1;

    & ::v-deep .el-switch__core {
      background-color: $grey12 !important;

      &:hover {
        background-color: $grey12 !important;
      }

      &::after {
        background-color: $grey16;
      }
    }

    &.is-checked ::v-deep .el-switch__core {
      background-color: $blue24 !important;

      &:hover {
        background-color: $blue24 !important;
      }

      &::after {
        background-color: $white;
      }
    }
  }
}
</style>
