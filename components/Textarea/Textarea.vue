<template>
  <div
    :class="{
      'is-required': field.required
    }"
  >
    <el-input
      v-bind="$attrs"
      v-model.lazy="localModel"
      :ref="field.name"
      :name="field.name"
      :required="field.required || required"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :readonly="field.readonly"
      type="textarea"
      @change.native="changeValue"
      @input.native="changeValue"
      autosize
      v-bind:class="{
        'is-error': !!field.error,
        'el-textarea--resize-icon': !!hasResizeIcon,
        'el-textarea--no-resize-icon': !!hiddenResizeIcon,
        'no-label': !!$attrs['no-label']
      }"
    >
    </el-input>
    <!-- <div v-if="field.required && !$attrs['no-label']" class="red-star">
      поле обязательно
    </div> -->
  </div>
</template>

<script>
import { Input } from 'element-ui';
export default {
  inheritAttrs: false,
  data() {
    return {
      localModel: this.model || ''
    };
  },
  props: {
    field: {
      type: Object,
      default: () => ({
        name: '',
        required: false,
        placeholder: '',
        disabled: false
      })
    },
    model: {
      type: String,
      default: ''
    },
    hasResizeIcon: {
      type: Boolean,
      default: true
    },
    hiddenResizeIcon: {
      type: Boolean,
      default: false
    },
    emitEvent: { type: String, default: 'change' },
    required: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, false);
    }
  },
  methods: {
    changeValue: function () {
      this.$emit(this.emitEvent, this.field.name, this.localModel);
    }
  },
  watch: {
    model: function () {
      this.localModel = this.model || '';
    }
  },
  destroyed() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, true);
    }
  },
  components: { 'el-input': Input }
};
</script>

<style lang="scss" scoped>
.el-textarea {
  &--no-resize-icon:after {
    content: '';
    width: 28px;
    height: 28px;
    background-color: $white !important;
    background-image: none !important;
    display: inline-block;
    position: absolute;
    bottom: 1px;
    right: 1px;
    pointer-events: none;
  }

  &--no-resize-icon.is-disabled:after {
    background-color: $black-10 !important;
  }

  & ::v-deep &__inner {
    border-radius: 4px;
    color: $black-200;
    border: 1px solid $grey16;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    line-height: 18.75px;
    width: 400px;
    min-height: 64px !important;
    max-height: 189px;
    padding: 7px 11px 25.75px 11px;
    word-break: break-word;

    &:hover {
      border-color: $black-100;
    }

    &:focus {
      border-color: $blue-120;
    }
  }

  &--resize-icon::after {
    content: '';
    width: 28px;
    height: 28px;
    display: inline-block;
    position: absolute;
    background-image: url('/front/public/style/img/resizer.svg');
    background-size: 24px 24px;
    background-repeat: no-repeat;
    bottom: 1px;
    right: 1px;
    background-color: $white;
    border-radius: 4px;
    pointer-events: none;
  }

  &--resize-icon .el-textarea {
    resize: vertical;
  }

  &.is-disabled.el-textarea {
    opacity: 1;

    &--resize-icon::after {
      background-color: $black-10;
      background-image: url('/front/public/style/img/resizer-disabled.svg');
    }
  }

  &.is-disabled .el-textarea__inner {
    background-color: $black-10;
    border-color: $black-30;
    color: $black-80;
  }
}

.el-input {
  & ::v-deep &__inner {
    border-radius: 4px;
    color: $black-190;
    font-family: 'Roboto', sans-serif;
    min-height: 120px;
  }
}

// .is-required {
//   position: relative;

//   & ::v-deep .el-textarea textarea {
//     padding-bottom: 24px;
//   }

//   .red-star {
//     color: $red-700;
//     font-size: 14px;
//     line-height: 24px;
//     position: absolute;
//     padding-left: 24px;
//     bottom: 4px;
//     left: 12px;
//     z-index: 1;
//     pointer-events: none;

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
//       left: 0;
//       margin-top: -12px;
//     }
//   }
// }
</style>
