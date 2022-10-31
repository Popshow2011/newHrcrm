<template>
  <el-dialog
    title="Сохранить резюме кандидатов"
    :visible="is_visible"
    :close-on-click-modal="false"
    width="400px"
    @close="resetCallback"
    class="dialog"
  >
    <div class="dialog-body">

      <div class="message">
        Будет сформирован архив с резюме 112 чел. и сохранен на устройство.<br>
        Файлы резюме будут сформированы согласно выбранному шаблону.
      </div>

      <div class="radio-form">
        <p class="radio-form__text">Формат</p>
        <Radio
          label="pdf"
          text="pdf"
          :model="form.action"
          @set-value="val => $set(form, 'action', val)"
        />
        <Radio
          label="docx"
          text="docx"
          :model="form.action"
          @set-value="val => $set(form, 'action', val)"
        />
      </div>

      <Dropdown
        :field="{ name: 'vacancy', type: 'enum', required: true }"
        :options="vacancies"
        :filterable="true"
        :model="form.vacancy"
        size="big"
        @set-value="(name, val) => $set(form, name, val)"
        class="dropdown"
      ></Dropdown>

    </div>

    <div class="dialog-footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Сохранить"
        @click.prevent="saveData"
      />
      <Button
        buttonSize="big"
        buttonColor="transparent"
        buttonText="Отмена"
        @click.prevent="resetCallback"
        class="cancel-button"
      />
    </div>

  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import Dropdown from 'Elements/Select/Dropdown';
import Button from 'Elements/Button/Button';
import Radio from 'Elements/Radio/Radio';
import { mixin } from '@/utils/mixins';
// import { MODULE, ACTION } from '@/utils/constants';
// import { getController } from '@/controllers/request.js';

export default {
  mixins: [mixin],
  props: {
    is_visible: {
      type: Boolean
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: {
        action: 'pdf',
        template: '',
        comment: '',
        vacancy: ''
      },
      templates: [],
      formLoading: true,
      resumeText: '',
      vacancies: []
    };
  },
  components: {
    'el-dialog': Dialog,
    Dropdown,
    Button,
    Radio
  },
  methods: {
    resetCallback() {
      this.closeDialog('mass_send_resume_dialog');
      // this.$emit('reset-callback');
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dialog__wrapper.dialog {
  & ::v-deep .el-dialog {
    // width: 585px !important;
    background: $white !important;
    margin-top: 15vh !important;
    padding: 12px 24px 24px 24px !important;

    &__header {
      margin-bottom: 12px;

      .el-dialog__title {
        font-size: 18px !important;
        line-height: 28px !important;
        color: $black-200;
        font-family: 'Roboto Medium';
        font-weight: 500;
      }
    }

    // .el-dialog__headerbtn {
    //   display: none;
    // }
  }
}

.dialog-body {
  margin-bottom: 24px;

  .message {
    font-size: 15px;
    line-height: 24px;
    color: $black-100;
    margin-top: 24px;
    margin-bottom: 12px;
    word-break: normal;
  }

  .radio-form {
    background: $black-10;
  }

  .radio-form {
    padding: 16px;
    display: flex;
    flex-direction: column;
    background: $black-10;
    gap: 12px;
    margin-bottom: 12px;

    &__text {
      color: $black-200;
      font-size: 16px;
      line-height: 24px;
    }
  }

  .dropdown {
    width: 260px;
    margin-bottom: 24px;
  }
}

</style>