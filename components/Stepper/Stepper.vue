<template>
  <div>
    <el-input-number
      v-model="number"
      :min="min"
      :max="max || max == 0 ? max : Infinity"
      :size="size"
      :required="required"
      :step-strictly="isRound"
      :disabled="disabled"
      :class="{
        'is-error': !!required && !number
      }"
      @change="handleChange"
    ></el-input-number>
  </div>
</template>
<script>
import { InputNumber } from 'element-ui';
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium'
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    isInteger: {
      type: Boolean,
      default: false
    },
    isRound: {
      type: Boolean,
      default: false
    },
    value: {
      type: [Number, String],
      default: 0
    },
    required: Boolean
  },
  data() {
    return {
      number: this.value
    };
  },
  methods: {
    handleChange: function (currentValue, oldValue) {
      if (this.isInteger) {
        if (typeof +currentValue == 'number') {
          this.number = parseInt(currentValue);
          this.$emit('diffChange', this.number);
        } else {
          this.number = oldValue;
        }
      }
    }
  },
  watch: {
    value: function () {
      this.number = this.value;
    }
  },
  components: { 'el-input-number': InputNumber }
};
</script>
<style lang="scss" scoped>
.el-input-number {
  width: 100%;

  & ::v-deep &__decrease {
    border-right: transparent;
    background: transparent;

    .el-icon-minus {
      padding-top: 5px;

      &::before {
        content: url('../../../assets/img/arrow-left.svg');
      }
    }
  }

  & ::v-deep .el-input__inner {
    border-radius: 4px;
    color: $black-200;
    border-color: $black-30;

    &:hover {
      background: $black-10;
    }
  }

  & ::v-deep &__increase {
    border-left: transparent;
    background: transparent;

    .el-icon-plus {
      padding-top: 5px;

      &::before {
        content: url('../../../assets/img/arrow-right.svg');
      }
    }
  }
}
</style>
