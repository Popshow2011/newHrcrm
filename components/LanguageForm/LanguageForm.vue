<template>
  <el-form
    :model="form"
    ref="form"
    class="language-form"
    hide-required-asterisk
  >
    <div class="flex-row" v-for="(item, i) in storeLanguages" :key="item.id">
      <language-item
        :item="item"
        :index="i"
        :schema="schema"
        :disabled="disabledField"
        @set-value="setValue"
      />
    </div>
    <Button
      buttonSize="big"
      buttonColor="blue"
      buttonText="Добавить"
      @click.prevent="addLanguage"
      class="add-button"
    />
  </el-form>
</template>
<script>
import { store } from '@/store';
import { Form } from 'element-ui';
// import isEqual from 'lodash/isEqual';
import LanguageItem from 'Elements/LanguageForm/LanguageFormItem';
import { scrollToError, randomNumber } from '@/utils/helpers';
import Button from 'Elements/Button/Button';
export default {
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    model: {
      type: Array,
      default: () => []
    },
    schema: {
      type: Object,
      default: () => ({})
    },
    isPopup: {
      type: Boolean,
      default: false
    },
    disabledField: { type: Boolean, default: false }
  },
  data() {
    return {
      form: {}
    };
  },
  created() {
    this.model && this.model.forEach(item => this.addLanguage(item));
  },
  computed: {
    fields() {
      return store.state.vacancy.fields || {};
    },
    saveMode() {
      return store.state.common.detachedForm.saveMode;
    },
    storeLanguages: {
      // обязательно в сторе в detachedForm.fields добавить пустое поле
      get() {
        return store.state.common.detachedForm.fields[this.field.name];
      },
      set(val) {
        store.commit('common/setDetachedFormFields', val);
      }
    }
  },
  methods: {
    setValue(item, index, fields = {}) {
      const languages = [...this.storeLanguages.slice()];

      for (let name in fields) {
        const value = fields[name];

        languages[index].fields = item.fields.map(field =>
          field.name == name ? { name, value } : field
        );

        this.$set(this.form, `${item.id}__${name}`, fields[name]);
      }

      if (!Object.values(fields).length) {
        const langIndex = languages.findIndex(
          el =>
            el.id == item.id &&
            el.fields[0].value == item.fields[0].value &&
            el.fields[1].value == item.fields[1].value
        );
        languages.splice(langIndex, 1);
        item.fields.forEach(({ name }) =>
          this.$delete(this.form, `${item.id}__${name}`)
        );
      }

      this.storeLanguages = {
        fieldName: this.field.name,
        form: languages
      };
      this.validateForm();
    },
    formatField(data) {
      return {
        id: randomNumber(),
        fields: [
          {
            name: 'id_language',
            value: data?.id_language || ''
          },
          {
            name: 'level',
            value: data?.level || ''
          }
        ]
      };
    },
    addLanguage(data = null) {
      const language = this.formatField(data);
      language.fields.forEach(({ name, value }) =>
        this.$set(this.form, `${language.id}__${name}`, value)
      );
      store.dispatch('common/getAddLanguageLevel', language);
      this.validateForm();
    },
    validateForm() {
      let success = '';
      this.$nextTick(() => {
        this.$refs.form.validate(async (valid, fields) => {
          store.commit('common/setDetachedFormStatus', {
            name: this.field.name,
            valid
          });
          // detachedRules можно объединить с общими rules
          if (!valid) {
            const errorFields = Object.keys(fields);
            scrollToError(
              errorFields,
              this.isPopup ? this.$el.closest('.el-dialog__body') : window
            );
            store.commit('common/setDetachedFormMode', false);
          }
          success = valid;
        });
      });
      return success;
    }
  },
  watch: {
    saveMode: function () {
      if (this.saveMode) {
        const valid = this.validateForm();
        if (!valid) return;
        // эмит для форм редактирования
        this.$emit('save');
      }
    }
  },
  components: {
    'el-form': Form,
    LanguageItem,
    Button
  }
};
</script>
<style lang="scss" scoped>
.flex-row {
  display: flex;
  margin-bottom: 12px;
}

.language-form {
  display: flex;
  flex-direction: column;
}

.add-button {
  display: flex;
  align-items: center;
  align-self: flex-start;
}
</style>
