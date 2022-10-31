<template>
  <el-date-picker
    v-model="localModel"
    v-bind="$attrs"
    :ref="field.name"
    :type="pickerType || dateType"
    :name="field.name"
    :size="size"
    :required="field.required"
    :placeholder="field.placeholder || ''"
    :readonly="field.readonly"
    :format="visibleDateFormat"
    :clearable="false"
    :value-format="dateFormat"
    :disabled="disabled(field) || field.disabled"
    :picker-options="pickerOptions"
    :class="{
      big: size === 'big',
      medium: size === 'medium',
      small: size === 'small',
      'is-error': !!field.error,
      'no-label': !!$attrs['no-label'],
      'day-prefix': !!field.prefix_week_day
    }"
    @change="handleChange"
    @blur="blur"
  >
  </el-date-picker>
</template>
<script>
import { DatePicker } from 'element-ui';
import { form } from '@/utils/mixins';
import { FIELD } from '@/utils/constants';
export default {
  inheritAttrs: false,
  mixins: [form],
  props: {
    field: {
      type: Object,
      default: () => ({
        name: '',
        type: 'date',
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
    datepicker: {
      type: Object,
      default() {
        return {
          dateFormat: 'dd.MM.yyyy',
          timeFormat: 'HH:mm'
        };
      }
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    size: {
      type: String,
      default: 'big'
    },
    pickerType: String,
    blur: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      localModel: this.model || null,
      pickerOptions: {
        ...this.options,
        firstDayOfWeek: 1
      }
    };
  },
  mounted() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, false);
    }
  },
  computed: {
    dateType() {
      return this.field.type === FIELD.TYPE.DATE ? 'date' : 'datetime';
    },
    dateFormat() {
      return this.pickerType == 'year'
        ? 'yyyy'
        : this.dateType === 'date'
        ? this.datepicker.dateFormat
        : `${this.datepicker.dateFormat} ${this.datepicker.timeFormat}`;
    },
    visibleDateFormat() {
      return `${
        this.options.showWeekDay
          ? `${this.weekday || ''} ${this.dateFormat}`
          : this.dateFormat
      }`;
    },
    weekday() {
      if (!this.localModel) return '';

      let comps = this.localModel.split('.');
      let date = new Date(
        Number(comps[2]),
        Number(comps[1] - 1),
        Number(comps[0])
      );
      let options = { weekday: 'short' };
      return new Intl.DateTimeFormat('ru-RU', options)
        .format(date)
        .toUpperCase();
    }
  },
  methods: {
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
  },
  destroyed() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, true);
    }
  },
  components: { 'el-date-picker': DatePicker }
};
</script>
<style lang="scss" scoped>
.el-date-editor ::v-deep {
  width: 100%;

  &.el-input {
    &__inner {
      padding: 0 10px 0 16px;
    }

    // &--prefix &__inner {
    //   padding-left: 44px;
    // }

    &__prefix {
      left: 16px;

      .el-icon-date,
      .el-input__icon {
        display: none !important;
      }
    }

    &__suffix .el-input__icon:before {
      content: '';
      width: 24px;
      height: 24px;
      display: inline-block;
      background-image: url('/front/public/style/img/calendar.svg');
      background-size: 20px 20px;
      background-repeat: no-repeat;
      background-position: center center;
      position: absolute;
      top: 50%;
      right: 0;
      margin-top: -12px;
    }

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

    // &[required] input {
    //   padding-left: 65px !important;

    //   & + .el-input__prefix {
    //     left: 0 !important;

    //     &:before {
    //       content: '';
    //       width: 24px;
    //       height: 24px;
    //       display: inline-block;
    //       background-image: url(/front/public/style/img/required-star.svg);
    //       background-repeat: no-repeat;
    //       background-position: 50%;
    //       position: absolute;
    //       top: 50%;
    //       left: 12px;
    //       margin-top: -12px;
    //       pointer-events: none;
    //     }

    //     .el-icon-date:before {
    //       left: 36px !important;
    //     }
    //   }
    // }
  }

  // &.day-prefix {}
}
</style>
<style lang="scss">
.el-date-editor {
  &:not(.timepicker) {
    & > .el-input__suffix > .el-input__suffix-inner {
      & > .el-input__icon::after {
        content: '';
        width: 24px;
        height: 24px;
        display: inline-block;
        background-image: url('/front/public/style/img/calendar.svg');
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center center;
        position: absolute;
        top: 50%;
        right: 0;
        margin-top: -12px;
      }
    }
  }

  &.timepicker {
    & > .el-input__prefix > .el-input__icon::before {
      display: none !important;
    }
  }
}
</style>
