<template>
  <el-form-item :rules="rules" :prop="item.id" class="row">
    <el-input
      v-if="!phoneType"
      :ref="item.id"
      v-model="fieldValue"
      :data-name="item.id"
      :type="item.htmlType"
      :disabled="disabled"
      maxlength="255"
      @change="$emit('set-value', item, index, fieldValue)"
    />
    <div :class="inputClass" v-else>
      <the-mask
        v-model="fieldValue"
        :ref="item.id"
        :type="item.htmlType"
        :data-name="item.id"
        :disabled="disabled"
        @input.native="checkPhoneInput"
        @change.native="handleChange"
        @blur.native="handleChange"
        :masked="false"
        :mask="[
          '+#######',
          '+########',
          '+#########',
          '+##########',
          '+###########',
          '+############',
          '+#############',
          '+##############',
          '+###############'
        ]"
        :autofocus="autofocus"
        class="el-input__inner"
      ></the-mask>
    </div>
  </el-form-item>
</template>

<script>
import { FormItem, Input } from 'element-ui';
import { TheMask } from 'vue-the-mask';
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number
    },
    contactOpts: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const validateUrlInput = (rule, value, callback) => {
      // /^(https?:\/\/)?([a-z0-9ёа-я-]+)(\.[\w-]+?)*\.([a-zа-я]{2,6}\.?)(\/[\w.]*)*(\/?\?)?(([a-z0-9ёа-я][&\-_+/.;%@=]?)*)#?([-\w]*)$/i
      const regexp = /^(https?:\/\/)/i;
      if (!regexp.test(value)) {
        callback(new Error('Введен некорректный URL адрес'));
      } else {
        callback();
      }
    };
    return {
      fieldValue: this.item.value || '',
      autofocus: false,
      rules: [
        {
          required: true,
          message: 'Необходимо заполнить поле',
          trigger: ['blur', 'focus', 'change']
        },
        this.item.value_type === 'email'
          ? {
              type: 'email',
              message: 'Введенный email указан некорректно',
              trigger: ['blur', 'focus', 'change']
            }
          : {},
        this.item.value_type === 'phone'
          ? {
              min: 7,
              max: 15,
              message: 'Номер должен содержать как минимум 7 цифр',
              trigger: ['blur', 'focus', 'change']
            }
          : {},
        this.item.htmlType === 'url'
          ? {
              validator: validateUrlInput,
              trigger: ['blur', 'focus', 'change']
            }
          : {}
      ],
      inputField: {
        name: this.item.id,
        htmlType: this.item.htmlType,
        required: true,
        maxlength: this.item.htmlType !== 'url' ? 64 : ''
      }
    };
  },
  mounted() {
    if (!this.fieldValue) {
      // the-mask component hasn't focus function
      const field = this.phoneType
        ? this.$refs[this.item.id].$el
        : this.$refs[this.item.id];
      if (field.focus) field.focus();
    }
  },
  computed: {
    inputClass() {
      return [
        // 'el-input el-input--mini el-input-group el-input-group--prepend',
        'input-type el-input big',
        this.disabled ? 'is-disabled' : ''
      ];
    },
    phoneType() {
      return this.item.value_type === 'phone';
    }
  },

  methods: {
    checkPhoneInput() {
      if (
        this.fieldValue.slice(0, 3) !== '880' &&
        this.fieldValue.slice(0, 1) === '8' &&
        this.fieldValue.length > 2
      ) {
        // проверка на код Бангладеша и коды городов РФ, чтобы заменить +8 на +7
        const val = '7' + this.fieldValue.slice(1);
        this.fieldValue = val;
        this.autofocus = true;
      }
    },
    handleChange() {
      this.$parent.validateField(this.item.id);
      if (this.item.value == this.fieldValue) return;

      this.$emit('set-value', this.item, this.index, this.fieldValue);
      this.autofocus = false;
    },
    changeContactType(type) {
      this.$emit(
        'change-type',
        { type, lbl: this.contactOpts[type] },
        this.index
      );
    }
  },
  components: {
    'el-form-item': FormItem,
    'el-input': Input,
    TheMask
  }
};
</script>
<style lang="scss" scoped>
.middle {
  display: flex;
}

.row {
  & ::v-deep .el-form-item__content {
    flex-direction: column;

    .el-form-item__error {
      position: inherit;
    }
  }
}
</style>
