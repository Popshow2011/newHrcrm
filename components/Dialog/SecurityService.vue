<template>
  <el-dialog
    :visible.sync="is_visible"
    ref="dialog"
    title="Перевод на этап “Служба безопасности”"
    :close-on-click-modal="false"
    @close="$emit('close-popup')"
    class="dialog security-service"
  >
    <div class="dialog__content content-offer">
      <form novalidate ref="security-service-form">
        <div
          class="security-service__input-container"
          v-for="field in fields"
          :key="field.name"
        >
          <label :for="field.name" class="security-service__label">
            {{ field.label }}
            <font v-if="field.required" style="color: #CC0E0E;">*</font>
          </label>
          <Dropdown
            v-if="selectType(field.type)"
            :field="field"
            :id="field.name"
            :ref="field.name"
            :model="form[field.name]"
            defaultFirstOption
            @set-value="handleChange"
            @set-hidden="setHidden"
            filterable
            :options="
              field.options.map(({ key, value }) => ({ id: key, name: value }))
            "
            class="content-item"
          />
          <Textarea
            v-else-if="textType(field.type)"
            :field="field"
            :id="field.name"
            :ref="field.name"
            :hasResizeIcon="true"
            :model="form[field.name]"
            @change="handleChange"
            @set-hidden="setHidden"
            class="content-item"
          />
          <DatePicker
            v-else-if="dateType(field.type)"
            :model="form[field.name]"
            :field="field"
            :id="field.name"
            :ref="field.name"
            @set-value="handleChange"
            @set-hidden="setHidden"
            class="content-item"
          />
          <Input
            v-else
            :field="field"
            :id="field.name"
            :ref="field.name"
            :model="form[field.name]"
            @set-value="handleChange"
            @set-hidden="setHidden"
            class="content-item"
          />
        </div>
      </form>
    </div>
    <div slot="footer">
      <div class="footer footer--multiple-buttons">
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отменить"
          @click="$emit('close-popup')"
          class="footer__button-cancel"
        />
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          class="footer__button-ok"
          @click.prevent="save"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { store } from '@/store';
import { form, rules } from '@/utils/mixins';
import { scrollToErrorField } from '@/utils/helpers';
import DatePicker from 'Elements/DatePicker/DatePicker';
import Textarea from 'Elements/Textarea/Textarea';
import Input from 'Elements/Input/Input';
import Dropdown from 'Elements/Select/Dropdown';
import Button from 'Elements/Button/Button';
export default {
  mixins: [form, rules],
  props: {
    is_visible: Boolean
  },
  data() {
    return {
      fields: store.state.candidate.customPopupFields.reduce(
        (acc, el) => ({ ...acc, [el.name]: el }),
        {}
      ),
      form: {},
      rules: {}
    };
  },
  mounted() {
    Object.values(this.fields).forEach(field => {
      if (field.required) {
        this.setRequiredFields(true, field.name);
      }
      this.$set(field, 'hidden', true);
    });
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.form, name, val);
      this.validateForm(this.form, name);
    },
    async save() {
      const valid = this.validateForm(this.form);
      scrollToErrorField(this.fields, this.$refs.dialog.$el, this);

      if (valid) {
        this.$emit('save', this.form);
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    DatePicker,
    Textarea,
    Input,
    Dropdown,
    Button
  }
};
</script>

<style lang="scss" scoped>
.security-service {
  & ::v-deep .el-dialog {
    max-width: 375px !important;
  }

  &__label {
    font-size: 18px;
    line-height: 28px;
    color: $black-170;
    word-break: break-word;
    text-align: left;
  }

  &__input-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 30px;
  }
}
</style>
