<template>
  <el-input
    v-model.lazy="localModel"
    v-bind="$attrs"
    :ref="field.name || 'input'"
    :type="field.htmlType || (numType ? 'number' : 'text')"
    :required="field.required || required"
    :min="min || $attrs.min"
    :max="max || $attrs.max"
    :maxlength="Number(field.maxlength || field.len || $attrs.maxlength)"
    :name="field.name"
    :placeholder="
      hidden(field) ? 'Не доступно для редактирования' : field.placeholder
    "
    :readonly="field.readonly"
    :disabled="hidden(field) ? true : disabled(field) || field.disabled"
    v-bind:class="{
      big: size === 'big',
      medium: size === 'medium',
      small: size === 'small',
      'is-error':
        !!field.error || (simpleErrors && field.required && !localModel),
      'no-label': !!$attrs['no-label'],
      clearable: showClearButton,
      'has-suffix': suffixIcon,
      'no-border shadow-level-1': noBorder
    }"
    @change.native="inputValue"
    @input.native="inputValue"
    :key="updateKey"
  >
    <Icon
      v-if="prefixIcon"
      :iconName="prefixIcon"
      slot="prefix"
      class="el-input__icon"
    />
    <!-- <i
      v-if="field.required && !$attrs['no-label']"
      slot="prefix"
      class="red-star"
    ></i> -->
    <i
      v-if="showClearButton"
      slot="suffix"
      @click="clear"
      :class="[
        'el-input__icon el-icon-close',
        !localModel ? 'el-icon__blocked' : ''
      ]"
    ></i>
    <Icon
      v-if="suffixIcon"
      :iconName="suffixIcon"
      slot="suffix"
      class="el-input__icon"
    />
  </el-input>
</template>

<script>
import { Input } from 'element-ui';
import { form } from '@/utils/mixins';
import { FIELD } from '@/utils/constants';
import Icon from 'Elements/Icon/Icon';
export default {
  inheritAttrs: false,
  mixins: [form],
  props: {
    field: {
      type: Object,
      default: () => ({
        name: '',
        type: 'text',
        required: false,
        placeholder: '',
        disabled: false,
        htmlType: '',
        visibility: ''
      })
    },
    model: String,
    emitEvent: { type: String, default: 'set-value' },
    size: {
      type: String,
      default: 'big'
    },
    clearable: {
      //временная отмашка от форм метаданных
      type: Boolean,
      default: false
    },
    callback: {
      type: Function,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    changeOnly: {
      type: Boolean,
      default: false
    },
    prefixIcon: {
      type: String,
      default: ''
    },
    suffixIcon: {
      type: String,
      default: ''
    },
    simpleErrors: {
      type: Boolean, // искусственная подсветка ошибок
      default: false
    },
    noBorder: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localModel: this.model || '',
      focused: false,
      hovered: false,
      updateKey: 0
    };
  },
  created() {
    setTimeout(() => {
      let input = this.$refs[this.field.name || 'input'].$el;
      input.addEventListener('focusin', this.handleFocus);
      input.addEventListener('focusout', this.handleFocus);
      input.addEventListener('mouseenter', this.handleHover);
      input.addEventListener('mouseleave', this.handleHover);
    }, 0);
  },
  mounted() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, false);
    }
  },
  computed: {
    showClearButton() {
      return (
        this.clearable &&
        this.localModel &&
        !this.field.readonly &&
        !this.field.disabled &&
        (this.focused || this.hovered)
      );
    },
    numType() {
      const { type, subtype } = this.field;
      return (subtype && subtype === FIELD.TYPE.INT) || type === FIELD.TYPE.INT;
    },
    min() {
      const { validation } = this.field;
      return validation ? validation.min : '';
    },
    max() {
      const { validation } = this.field;
      return validation ? validation.max : '';
    }
  },
  methods: {
    handleFocus() {
      this.focused = !this.focused;
    },
    handleHover() {
      this.hovered = !this.hovered;
    },
    clear() {
      if (this.localModel && !this.disabled(this.field)) {
        this.localModel = '';
        this.$emit(
          this.emitEvent,
          this.field.name,
          this.localModel,
          this.field.blocked
        );
        this.updateKey++;
      }
    },
    inputValue(event) {
      if (this.numType) {
        // недопустимы символы +-,.e
        this.localModel = this.localModel
          ? String(Number(this.localModel.replace(/,|\.|-|\+|e|\s/g, '')))
          : '';
      }
      if (event.type != 'input' || (event.type == 'input' && !this.changeOnly))
        if (this.callback) {
          this.callback(this.localModel);
        } else {
          this.$emit(
            this.emitEvent,
            this.field.name,
            this.localModel,
            this.field.blocked
          );
        }
    }
  },
  destroyed() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, true);
    }
  },
  watch: {
    model() {
      this.localModel = this.model;
    }
  },
  components: { 'el-input': Input, Icon }
};
</script>
<style lang="scss" scoped>
.el-input {
  // &--mini {
  //   & ::v-deep .el-input__inner {
  //     height: 24px;
  //   }
  // }

  & ::v-deep &__inner {
    border-radius: 4px;
    color: $black-200;
    font-size: 16px;
    padding-left: 12px;
    padding-right: 16px;
    line-height: 24px;

    &:hover {
      background: $black-10;
    }

    &:focus {
      border-color: $blue-120;
    }

    // &:invalid {
    //   border: 1px solid red;
    // }

    // &:focus:invalid {
    //   outline: none;
    // }
  }

  & ::v-deep &__suffix {
    margin-right: 8px;
    &-inner {
      display: flex;
      height: 100%;
      align-items: center;
      gap: 4px;
    }
  }

  & .el-input__icon.el-icon-close {
    content: url('/style/img/cross-small.svg');
    width: 16px;
    height: 16px;
    pointer-events: all;
  }

  // &.is-disabled {
  //   & ::v-deep .el-input__inner {
  //     background-color: $black-10;
  //     color: $black-80;
  //   }
  // }

  // & ::v-deep .el-input__inner[readonly] {
  //   cursor: default;

  //   &:hover {
  //     background-color: $white;
  //   }

  //   &:focus {
  //     border-color: $black-30;
  //   }
  // }

  // пока не актуально:
  // & ::v-deep &__icon {
  //   &.search {
  //     margin-left: 5px;
  //     content: url('../../assets/img/search-grey.svg');
  //   }

  //   &.date {
  //     margin-left: 5px;
  //     content: url('../../assets/img/date.svg');
  //   }
  // }
}
</style>
