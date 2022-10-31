<template>
  <div
    class="el-input"
    :class="{
      big: size === 'big',
      medium: size === 'medium',
      small: size === 'small',
      'is-error': !!field.error
    }"
  >
    <the-mask
      v-bind="$attrs"
      v-model.lazy="localModel"
      :mask="mask"
      :ref="field.name"
      type="text"
      :name="field.name"
      :required="field.required"
      @change.native="handleChange"
      @blur.native="handleChange"
      @input.native="checkPhoneInput"
      :placeholder="field.placeholder"
      :readonly="field.readonly"
      :disabled="disabled(field) || field.disabled"
      :masked="false"
      :autofocus="autofocus"
      :class="[
        inputClass,
        {
          big: size === 'big',
          medium: size === 'medium',
          small: size === 'small',
          'no-label': !!$attrs['no-label']
        }
      ]"
      :value="
        numberType
          ? localModel == 0 || localModel == ''
            ? (localModel = '')
            : (localModel = Number(localModel))
          : localModel
      "
    ></the-mask>
    <!-- <div v-if="field.required && !$attrs['no-label']" class="red-star"></div> -->
  </div>
</template>
<script>
import { mixin, form } from '@/utils/mixins';
import { TheMask } from 'vue-the-mask';
import { FIELD } from '@/utils/constants';
export default {
  inheritAttrs: false,
  mixins: [mixin, form],
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
    model: String,
    emitEvent: { type: String, default: 'set-value' },
    size: {
      type: String,
      default: 'big'
    },
    callback: {
      type: Object,
      default: () => null
    },
    mask: {
      type: Array,
      default: () => [
        '### ',
        '# ###',
        '## ###',
        '### ### ',
        '# ### ###',
        '## ### ###'
      ]
    }
  },
  data() {
    return {
      localModel: this.model || '',
      autofocus: false
    };
  },
  mounted() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, false);
    }
  },
  computed: {
    inputClass() {
      const disabledClass = this.disabled(this.field) ? 'is-disabled' : '';
      return ['el-input__inner el-input--masked', disabledClass];
    },
    numberType() {
      return (
        this.field.type &&
        (this.field.type == FIELD.TYPE.DECIMAL ||
          this.field.type == FIELD.TYPE.CURRENCY)
      );
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

      if (this.autofocus) this.autofocus = false;
    },
    checkPhoneInput() {
      if (
        this.field.type == FIELD.TYPE.VARCHAR &&
        this.localModel.slice(0, 3) !== '880' &&
        this.localModel.slice(0, 1) === '8' &&
        this.localModel.length > 2
      ) {
        // проверка на код Бангладеша и коды городов РФ, чтобы заменить +8 на +7
        const val = '7' + this.localModel.slice(1);
        this.localModel = val;
        this.handleChange();
        this.autofocus = true;
      }
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
  components: { TheMask }
};
</script>
