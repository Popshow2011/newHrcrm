<template>
  <el-dialog
    :visible.sync="is_visible"
    ref="dialog"
    title="Форма ввода корпоративной почты"
    :close-on-click-modal="false"
    @close="$emit('close-popup')"
    class="dialog corporate-email"
  >
    <div class="dialog__content content-offer">
      <form ref="corporate-email-form" @submit.prevent="save">
        <div class="corporate-email__input-container">
          <label for="email" class="corporate-email__label">
            Укажите корп. Email сотрудника
          </label>

          <Input
            ref="email"
            :field="field"
            id="email"
            @set-value="handleChange"
            class="content-item"
          />
          <p v-if="field.error" class="corporate-email__input-error">
            Введенный email указан некорректно
          </p>
        </div>
      </form>
    </div>
    <div slot="footer">
      <div class="footer footer--multiple-buttons">
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
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
import Input from 'Elements/Input/Input';
import Button from 'Elements/Button/Button';
import { store } from '@/store';

export default {
  props: {
    is_visible: Boolean
  },
  data() {
    return {
      email: '',
      field: {
        htmlType: 'email',
        required: true,
        placeholder: 'Ваш email',
        error: false
      }
    };
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.field, 'error', false);
      this.email = val;
    },
    async save() {
      const invalid = !this.$refs.email.$el.children[0].validity.valid;
      this.$set(this.field, 'error', invalid);

      if (!this.field.error) {
        await store.dispatch('candidate/saveCorporateMailForm', this.email);

        this.$emit('save', this.email);
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    Input,
    Button
  }
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/colors';

.corporate-email {
  & ::v-deep .el-dialog {
    max-width: 375px !important;
  }

  &__label {
    font-size: 18px;
    line-height: 28px;
    color: #242424;
    word-break: break-word;
    text-align: left;
  }

  &__input-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 30px;
  }

  &__input-error {
    color: $red-600;
    margin-top: 6px;
    font-size: 14px;
  }
}
</style>
