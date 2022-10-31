<template>
  <el-form
    :model="form"
    ref="form"
    label-width="0px"
    class="detail-form"
    hide-required-asterisk
  >
    <div v-for="(item, i) in storeExperience" :key="item.id">
      <div class="detail-item">
        <div class="flex-row">
          <detail-experience-form-item
            :item="item"
            :index="i"
            :schema="schema"
            :date-format="dateFormat"
            :disabled="disabledField"
            @set-value="setValue"
            @validate="validateForm"
            class="contact-value"
          >
          </detail-experience-form-item>
        </div>
        <div class="deleteOne">
          <Button
            buttonSize="big"
            :fullWidth="true"
            buttonText="Удалить опыт работы"
            @click.prevent="setValue(item, i)"
          />
        </div>
      </div>
    </div>

    <div class="addOne">
      <Button
        buttonSize="big"
        :fullWidth="true"
        buttonText="Добавить опыт работы"
        @click.prevent="addExperience"
      />
    </div>
  </el-form>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { Form } from 'element-ui';
import { scrollToError } from '@/utils/helpers';
import { FIELD } from '@/utils/constants';
import DetailExperienceFormItem from 'Elements/DetailExperienceForm/DetailExperienceFormItem';
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
    },
    dateFormat: String
  },
  data() {
    return {
      form: {}
    };
  },
  created() {
    const experience = [];
    this.model &&
      this.model.forEach(item => {
        item.fields.forEach(({ name, value }) => {
          const fieldValue = this.schema[name]
            ? this.schema[name].type == FIELD.TYPE.DATE ||
              this.schema[name].type == FIELD.TYPE.DATETIME
              ? this.formatDate(value, this.dateFormat)
              : value
            : value;
          this.$set(this.form, `${item.id}__${name}`, fieldValue);
        });
        experience.push(item);
      });
    this.storeExperience = {
      fieldName: this.field.name,
      form: experience
    };
  },
  computed: {
    fields() {
      return store.state.candidate.fields || {};
    },
    saveMode() {
      return store.state.common.detachedForm.saveMode;
    },
    storeExperience: {
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
      const experience = [...this.storeExperience.slice()];

      for (let name in fields) {
        const value = fields[name];

        experience[index].fields = item.fields.map(field =>
          field.name === name ? { name, value } : field
        );

        this.$set(this.form, `${item.id}__${name}`, fields[name]);
      }

      if (!Object.values(fields).length) {
        experience.splice(index, 1);
        item.fields.forEach(({ name }) =>
          this.$delete(this.form, `${item.id}__${name}`)
        );
      }

      this.storeExperience = {
        fieldName: this.field.name,
        form: experience
      };
      this.validateForm();
    },
    addExperience() {
      store.dispatch('common/getAddExperience');
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
  components: { 'el-form': Form, DetailExperienceFormItem, Button }
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
