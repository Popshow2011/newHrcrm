<template>
  <el-time-select
    v-model="localModel"
    :ref="field.name"
    :name="field.name"
    :size="size"
    :placeholder="field.placeholder || ''"
    :readonly="field.readonly"
    :format="format"
    :clearable="false"
    :value-format="format"
    :disabled="disabled(field) || field.disabled"
    :picker-options="options"
    class="timepicker"
    :class="{
      big: size === 'big',
      medium: size === 'medium',
      small: size === 'small',
      'is-error': !!field.error,
      'no-label': !!$attrs['no-label']
    }"
    @input.native="handleInput"
    @change="handleChange"
  >
  </el-time-select>
</template>
<script>
import { TimeSelect } from 'element-ui';
import { form } from '@/utils/mixins';

export default {
  components: { 'el-time-select': TimeSelect },
  mixins: [form],
  props: {
    field: {
      type: Object,
      default: () => ({
        name: '',
        type: 'time',
        required: false,
        placeholder: '',
        disabled: false
      })
    },
    emitEvent: { type: String, default: 'set-value' },
    model: [String, Object],
    callback: {
      type: Object,
      default: () => null
    },
    format: {
      type: String,
      default: 'HH:mm'
    },
    options: {
      type: Object,
      default: () => {}
    },
    size: {
      type: String,
      default: 'big'
    }
  },
  data() {
    return {
      localModel: this.model || null
    };
  },
  // mounted() {
  //   if (this.$listeners['set-hidden']) {
  //     this.$emit('set-hidden', this.field.name, false);
  //   }
  // },
  methods: {
    handleInput(e) {
      const value = e.target.value;
      let hours = value.split(':')[0];
      let minutes = value.split(':')[1];

      if (
        hours < 24 &&
        hours.length == 2 &&
        minutes.length == 2 /* && minutes != 0 && minutes != 30 */ &&
        minutes < 60
      ) {
        // const nextHour = String(+hours + 1);
        // hours =
        //   minutes > 0 && minutes < 30
        //     ? hours
        //     : hours != 23
        //     ? (nextHour < 10 ? '0' : '') + nextHour
        //     : '00';
        // minutes = minutes > 0 && minutes < 30 ? '30' : '00';
        this.localModel = hours + ':' + minutes;
        this.handleChange();
      }
    },
    handleChange() {
      this.$emit(
        this.emitEvent,
        this.field.name,
        this.localModel,
        this.field.blocked
      );

      if (this.callback && this.callback.field) {
        this.callback.field.change(
          this.field,
          this.localModel,
          this.field.blocked
        );
      }
    }
  },
  watch: {
    model: function () {
      this.localModel = this.model;
    }
  }
  // destroyed() {
  //   if (this.$listeners['set-hidden']) {
  //     this.$emit('set-hidden', this.field.name, true);
  //   }
  // }
};
</script>

<style lang="scss" scoped>
.el-date-editor ::v-deep {
  width: 100%;

  &.el-input {
    &__inner {
      width: 120px;
      padding: 0 12px;
    }

    &__prefix {
      // left: 16px;

      .el-icon-date,
      .el-input__icon {
        display: none !important;
      }
    }

    // &__suffix .el-input__icon:before {
    //   content: '';
    //   width: 24px;
    //   height: 24px;
    //   display: inline-block;
    //   background-size: 20px 20px;
    //   background-repeat: no-repeat;
    //   background-position: center center;
    //   position: absolute;
    //   top: 50%;
    //   right: 0;
    //   margin-top: -12px;
    // }

    &--big .el-input__inner {
      height: 40px;
    }

    &--middle .el-input__inner {
      height: 32px;
    }

    &--small .el-input__inner {
      height: 24px;
    }

    input {
      padding-left: 12px !important;

      & + .el-input__prefix {
        left: 0 !important;
      }
    }
  }
}
</style>
