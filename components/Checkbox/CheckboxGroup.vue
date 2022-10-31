<template>
  <el-checkbox-group :max="max" v-model="model">
    <el-checkbox
      v-for="(el, key) in elements"
      :key="key"
      :label="el"
      :disabled="disabled"
      @change.native="$emit('change', el, key)"
      class="custom-checkbox"
      :class="[classes ? classes[key] : '', error == true ? 'is-error' : '']"
      >{{ el }}</el-checkbox
    >
  </el-checkbox-group>
</template>

<script>
import { Checkbox, CheckboxGroup } from 'element-ui';
export default {
  props: {
    trueValue: {
      type: [Array, Object, String]
    },
    elements: {
      type: [Array, Object]
    },
    max: {
      type: Number,
      default: 100
    },
    disabled: {
      type: Boolean,
      default: false
    },
    classes: {
      type: Object,
      default: () => null
    },
    error: { type: Boolean, default: false }
  },
  computed: {
    model: {
      get() {
        return this.trueValue || [];
      }
    }
  },
  components: {
    'el-checkbox': Checkbox,
    'el-checkbox-group': CheckboxGroup
  }
};
</script>

<style lang="scss">
.el-checkbox-group {
  .is-error {
    .el-checkbox__input {
      .el-checkbox__inner {
        background-image: url('assets/img/checkbox-error.svg') !important;
      }
    }
  }

  .custom-checkbox {
    display: inline-flex;
    margin-bottom: 8px;
    max-height: none;
    width: 100%;
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
      padding-left: 0 !important;
      word-break: break-word;
      white-space: normal;
    }

    .el-checkbox__input {
      height: 28px;
      width: 28px;
      padding: 4px;
      margin-right: 10px;

      .el-checkbox__inner {
        border: none;
        background-color: transparent;
        background-image: url('../../../assets/img/checkbox_square.svg');
        background-position: center;
        background-size: contain;
        height: 20px;
        width: 20px;

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

    &.is-checked {
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
}
</style>
