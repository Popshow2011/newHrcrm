<template>
  <el-form
    :model="form"
    ref="form"
    label-width="0px"
    class="detail-form"
    hide-required-asterisk
  >
    <div v-for="(item, i) in storeQualification" :key="item.id">
      <div class="detail-item">
        <div class="flex-row">
          <qualification-item
            :item="item"
            :index="i"
            :schema="schema"
            :disabled="disabledField"
            @set-value="setValue"
            class="contact-value"
          >
          </qualification-item>
        </div>
        <div class="deleteOne">
          <Button
            buttonSize="big"
            :fullWidth="true"
            buttonText="Удалить квалификацию"
            @click.prevent="setValue(item, i)"
          />
        </div>
      </div>
    </div>

    <div class="addOne">
      <Button
        buttonSize="big"
        :fullWidth="true"
        buttonText="Добавить квалификацию"
        @click.prevent="addQualification"
      />
    </div>
  </el-form>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { Form } from 'element-ui';
import { scrollToError } from '@/utils/helpers';
import QualificationItem from 'Elements/Qualification/QualificationItem';
import Button from 'Elements/Button/Button';

export default {
  mixins: [mixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    schema: {
      type: Object,
      default: () => ({})
    },
    disabledField: { type: Boolean, default: false },
    model: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {}
    };
  },
  created() {
    const qualification = [];
    this.model &&
      this.model.forEach(item => {
        item.fields.forEach(({ name, value }) => {
          this.$set(this.form, `${item.id}__${name}`, value);
        });
        qualification.push(item);
      });
    this.storeQualification = {
      fieldName: this.field.name,
      form: qualification
    };
  },
  computed: {
    fields() {
      return store.state.candidate.fields || {};
    },
    saveMode() {
      return store.state.common.detachedForm.saveMode;
    },
    storeQualification: {
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
      const qualification = [...this.storeQualification.slice()];

      for (let name in fields) {
        const value = fields[name];

        qualification[index].fields = item.fields.map(field =>
          field.name === name ? { name, value } : field
        );

        this.$set(this.form, `${item.id}__${name}`, fields[name]);
      }

      if (!Object.values(fields).length) {
        qualification.splice(index, 1);
        item.fields.forEach(({ name }) =>
          this.$delete(this.form, `${item.id}__${name}`)
        );
      }

      this.storeQualification = {
        fieldName: this.field.name,
        form: qualification
      };
      this.validateForm();
    },
    addQualification() {
      store.dispatch('common/getAddQualification');
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
  watch: {
    saveMode: function () {
      if (this.saveMode) {
        const valid = this.validateForm();

        // эмит для форм редактирования
        if (valid) this.$emit('save');
      }
    }
  },
  components: { 'el-form': Form, QualificationItem, Button }
};
</script>
<style lang="scss" scoped>
.flex-row {
  display: flex;

  .detail-item {
    margin-bottom: 15px;
  }

  .addOne {
    margin-top: 16px;
  }

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
