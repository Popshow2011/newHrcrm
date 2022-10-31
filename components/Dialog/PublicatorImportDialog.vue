<template>
  <el-dialog
    title="Импорт вакансии"
    width="440px"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    @close="$emit('reset-callback')"
    class="dialog"
  >
    <div class="dialog-body">
      <p class="dialog-body__text">
        Чтобы связать вакансию на работном сайте и в TalentForce скопируйте
        ссылку на вакансию с работного сайта и вставьте в поле.
      </p>
      <p class="dialog-body__label">Ссылка на вакансию</p>
      <el-form :model="dynamicValidateForm" :rules="rules">
        <el-form-item prop="link">
          <el-input
            v-model="dynamicValidateForm.link"
            placeholder="Вставь ссылку сюда"
          ></el-input>
          <!-- <Input
            name="link"
            :model="dynamicValidateForm.link"
            :field="{
              type: 'text',
              placeholder: 'Вставить ссылку сюда'
            }"
            @set-value="(name, val) => (dynamicValidateForm.link = val)"
          /> -->
        </el-form-item>
      </el-form>
    </div>
    <div class="dialog-footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Импортировать"
        :disabled="!dynamicValidateForm.link || invalidValue"
        @click="closeDialog"
      />
      <Button
        buttonSize="big"
        buttonColor="blue"
        buttonText="Отмена"
        @click="$emit('reset-callback')"
      />
    </div>
  </el-dialog>
</template>
<script>
import { store } from '@/store';
import { Dialog, Form, FormItem, Input } from 'element-ui';
import Button from 'Elements/Button/Button';

export default {
  props: {
    is_visible: {
      type: Boolean
    }
  },
  data() {
    const validateUrlInput = (rule, value, callback) => {
      const regexp = /^(https?:\/\/)/i;
      this.invalidValue = !regexp.test(value);

      if (!regexp.test(value)) {
        callback(new Error('Введен некорректный URL адрес'));
      } else {
        callback();
      }
    };
    return {
      form: {
        link: ''
      },
      invalidValue: true,
      dynamicValidateForm: {
        link: ''
      },
      rules: {
        link: [
          {
            validator: validateUrlInput,
            trigger: ['blur', 'focus', 'change', 'input']
          }
        ]
      }
    };
  },
  created() {
    this.dynamicValidateForm.link = this.importUrl || '';
    if (this.importUrl) this.invalidValue = false;
    store.commit('publicator/setImportData', {});
  },
  methods: {
    closeDialog() {
      this.$emit('save-callback', this.dynamicValidateForm.link);
      this.$emit('reset-callback');
    }
  },
  computed: {
    importUrl() {
      return store.state.publicator.importData.url;
    }
  },
  components: {
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    Button
  }
};
</script>
<style lang="scss" scoped>
.el-dialog {
  position: relative;
}

.dialog-footer {
  display: flex;
  padding-top: 24px;

  &:before {
    content: '';
    position: absolute;
    bottom: 88px;
    left: 0;
    right: 0;
    border-top: 1px solid $black-20;
  }
}

.dialog-body {
  padding: 43px 0 40px 0;
  font-family: Roboto, sans-serif;
  font-size: 15px;
  color: $black-200;
  word-break: keep-all;

  &__text {
    color: $black-100;
    margin-bottom: 16px;
  }

  &__label {
    font-size: 14px;
  }

  &:before {
    content: '';
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    border-top: 1px solid $black-20;
  }
}
</style>
