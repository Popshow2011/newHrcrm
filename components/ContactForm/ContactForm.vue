<template>
  <el-form :model="form" ref="form" label-width="0px" class="contact-form">
    <div
      class="middle flex-row"
      v-for="(item, i) in storeCommunications"
      :key="item.id"
    >
      <Dropdown
        :options="options"
        :field="{ type: 'enum', placeholder: 'Выберите' }"
        :model="item.value_type"
        placeholder="Выберите"
        :callback="type => changeContactType({ type, lbl: options[type] }, i)"
        class="contact-type"
      />
      <contact-form-item
        :item="item"
        :index="i"
        :disabled="disabledField"
        @set-value="setValue"
        class="contact-value"
        :class="[isEmptyField(field, item.value) ? 'is-empty-field' : '']"
      >
      </contact-form-item>
      <button
        size="mini"
        :disabled="disabledField"
        class="delete-button"
        @click="setValue(item, i)"
      >
        <Icon iconName="delete" iconColor="#cdd4da" />
      </button>
    </div>
  </el-form>
</template>
<script>
import { store } from '@/store';
import isEqual from 'lodash/isEqual';
import { Form } from 'element-ui';
import { form } from '@/utils/mixins';
import { unmaskedPhone, scrollToError } from '@/utils/helpers';
import ContactFormItem from 'Elements/ContactForm/ContactFormItem';
import Dropdown from 'Elements/Select/Dropdown';
import Icon from 'Elements/Icon/Icon';
export default {
  mixins: [form],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    options: {
      type: Object,
      default: () => ({})
    },
    isPopup: {
      type: Boolean,
      default: false
    },
    disabledField: { type: Boolean, default: false },
    model: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {},
      etalonList: [], // нужен для проверки наличия изменений в форме (hasEdited)
      hasEdited: false,
      unsubscribe: null
    };
  },
  created() {
    this.unsubscribe = store.subscribe(mutation => {
      if (mutation.type == 'common/addContact') {
        const index = mutation.payload.hasOwnProperty('index')
          ? mutation.payload.index
          : this.storeCommunications.length - 1;
        this.$set(this.form, this.storeCommunications[index].id, '');
        this.validateForm();
      }
    });

    const contacts = [];
    this.model.forEach(item => {
      let value = item.value;

      if (item.value_type === 'phone') {
        value = unmaskedPhone(value);
      }

      this.$set(this.form, item.id, value);
      contacts.push({ ...item, value });
      this.etalonList.push({ ...item, value });
    });

    this.storeCommunications = {
      fieldName: this.field.name,
      form: contacts
    };
  },
  computed: {
    fields() {
      return store.state.candidate.fields || {};
    },
    saveMode() {
      return store.state.common.detachedForm.saveMode;
    },
    storeCommunications: {
      get() {
        return store.state.common.detachedForm.fields[this.field.name];
      },
      set(val) {
        store.commit('common/setDetachedFormFields', val);
      }
    }
  },
  methods: {
    setValue(item, index, value = null) {
      const contacts = [...this.storeCommunications];

      if (value || value !== null) {
        contacts.splice(index, 1, { ...item, value, sort: item.sort || index });
        this.$set(this.form, item.id, value);
      } else {
        contacts.splice(index, 1);
        this.$delete(this.form, item.id);
      }

      this.storeCommunications = {
        fieldName: this.field.name,
        form: contacts
      };

      this.validateForm();
      // this.contactsHasChanged(contacts);
    },
    changeContactType(opts = {}, index) {
      this.setValue(this.storeCommunications[index], index);
      store.commit('common/addContact', { opts, index });
      this.validateForm();
    },
    contactsHasChanged(list) {
      if (this.etalonList) {
        this.hasEdited = !isEqual(this.etalonList, list);
      }
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
              this.isPopup ? this.$refs.form.$el : window
            );
            store.commit('common/setDetachedFormMode', false);
          }
          success = valid;
        });
      });

      return success;
    }
  },
  destroyed() {
    this.unsubscribe();
  },
  watch: {
    model: function () {
      if (!isEqual(this.model, this.storeCommunications)) {
        this.storeCommunications = {
          fieldName: this.field.name,
          form: this.model
        };
        this.model.forEach(item => this.$set(this.form, item.id, item.value));
        this.validateForm();
      }
    },
    saveMode: function () {
      if (this.saveMode) {
        const valid = this.validateForm();
        // эмит для форм редактирования
        if (valid) this.$emit('save');
      }
    }
  },
  components: { 'el-form': Form, ContactFormItem, Dropdown, Icon }
};
</script>
<style lang="scss" scoped>
.flex-row {
  display: flex;
  margin-bottom: 12px;

  .contact-type {
    // min-width: 544px;
    width: 50%;
    margin-right: 32px;
  }

  .contact-value {
    // min-width: 504px;
    width: calc(50% - 40px);
    margin-right: 16px;
    margin-bottom: 12px;

    input {
      color: $blue-130 !important;
    }
  }

  .delete-button {
    align-self: flex-start;
    height: 40px;
    position: relative;
    cursor: pointer;
    // margin-left: 12px;

    &:hover {
      background: none;

      & ::v-deep path {
        fill: $black-50 !important;
      }
    }

    &:disabled {
      background: $black-30;
      color: $black-40;
    }
  }
}

.contact-form {
  .middle {
    margin: 12px 0;

    button {
      background: none;
      border: none;
      box-sizing: border-box;
      padding: 0;
      color: $black-40;
    }

    & ::v-deep .el-button {
      width: 24px;
      padding: 0;
      margin: 0;
    }
  }
}
</style>
