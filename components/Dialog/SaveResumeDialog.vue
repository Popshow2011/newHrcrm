<template>
  <el-dialog
    ref="dialog"
    v-loading="formLoading"
    title="Сохранить резюме"
    :visible="is_visible"
    :close-on-click-modal="false"
    width="540px"
    @close="resetCallback"
    class="dialog"
  >
    <div class="dialog-body">
      <label> Выберите вакансию</label>
      <Dropdown
        :field="{ name: 'vacancy', type: 'enum', required: true }"
        :options="vacancies"
        :filterable="true"
        :model="form.vacancy"
        size="big"
        @set-value="(name, val) => $set(form, name, val)"
        class="dropdown"
      ></Dropdown>
      <label> Выберите шаблон</label>
      <Dropdown
        :field="{ name: 'template', type: 'enum', required: true }"
        :options="templates"
        :filterable="true"
        :model="form.template"
        size="big"
        @set-value="(name, val) => $set(form, name, val)"
        class="dropdown"
      ></Dropdown>

      <Textarea
        :field="{ name: 'comment', placeholder: 'Комментарий' }"
        :model="form.comment"
        :size="fieldSize"
        @change="(name, val) => $set(form, name, val)"
        class="textarea"
      />
      <p class="dialog-body__text">Сохранить в формате</p>

      <div class="radio-form">
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
    </div>

    <div class="dialog-footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Сохранить"
        :disabled="!form.template || !form.action"
        @click.prevent="saveData"
      />
      <Button
        buttonSize="big"
        buttonColor="blue"
        hasLeftIcon
        iconName="Search"
        buttonText="Предпросмотр"
        :disabled="!form.template || !form.action"
        @click.prevent="preload"
        class="preload-button"
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
import Button from 'Elements/Button/Button';
import Textarea from 'Elements/Textarea/Textarea';
import Dropdown from 'Elements/Select/Dropdown';
import { MODULE, ACTION } from '@/utils/constants';
import { getController } from '@/controllers/request.js';
import Radio from 'Elements/Radio/Radio';
import {
  mixin,
  rules,
  form,
  metadata,
  saveForm,
  dialogMixin
} from '@/utils/mixins';

export default {
  mixins: [mixin, rules, form, metadata, saveForm, dialogMixin],
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
  created() {
    getController({
      params: {
        module: 'HRPAC_CANDIDATES',
        action: ACTION.GET_VACANCIES_LIST,
        id: this.data.id.value,
        to_pdf: true
      }
    })
      .then(answer => {
        if (answer.data && !answer.data.error) {
          this.vacancies = [...answer.data];
        }
      })
      .catch(err =>
        this.catchError(
          err,
          'Возникла ошибка при получении списка прикрепленных вакансий',
          'vacancies list loading'
        )
      );

    getController({
      params: {
        module: MODULE.AOS_PDF_Templates,
        action: 'getTemplateByType',
        template_type: MODULE.CANDIDATES_MODULE,
        to_pdf: 1
      }
    })
      .then(resp => {
        if (!resp.data || typeof resp.data !== 'object') return;
        this.formLoading = false;
        this.templates = resp.data.data;
      })
      .catch(err => {
        this.catchError(err, 'Возникла ошибка получения шаблонов');
      });
  },
  methods: {
    downloadFile(url) {
      const e = document.createElement('a');
      e.href = url;
      e.target = '_blank';
      e.download = url.substr(url.lastIndexOf('/') + 1);
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
    },
    saveData() {
      if (this.form.template && this.form.action) {
        getController({
          params: {
            module: MODULE.AOS_PDF_Templates,
            action:
              this.form.action == 'pdf'
                ? 'generateFileResumePDF'
                : 'generateFileResumeDOCX',
            candidate_id: this.data.id.value,
            template_id: this.form.template,
            vacancy_id: this.form.vacancy,
            comment: this.form.comment,
            to_pdf: 1
          }
        })
          .then(respond => {
            const docId = respond.data.document_id;
            this.downloadFile(
              `index.php?entryPoint=download&id=${docId}&type=Documents`
            );
          })
          .catch(err => {
            this.catchError(err, 'Возникла ошибка предпросмотра');
          })
          .finally(() => {
            this.resetCallback();
          });
      }
    },
    resetCallback() {
      this.$emit('reset-callback');
    },
    preload() {
      getController({
        params: {
          module: MODULE.AOS_PDF_Templates,
          action: 'generatePreviewResume',
          candidate_id: this.data.id.value,
          vacancy_id: this.form.vacancy,
          template_id: this.form.template,
          comment: this.form.comment,
          to_pdf: 1
        }
      })
        .then(response => {
          this.resumeText = response.data;
          this.$emit('preload', this.resumeText);
        })
        .catch(err => {
          this.catchError(err, 'Возникла ошибка предпросмотра');
        });
    }
  },
  components: {
    'el-dialog': Dialog,
    Button,
    Textarea,
    Dropdown,
    Radio
  }
};
</script>
<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  padding-top: 24px;

  button {
    margin-right: 0;
  }

  .preload-button {
    margin-left: 8px;
  }

  .cancel-button {
    position: absolute;
    right: 24px;
  }

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
  padding: 45px 0 24px 0;

  label {
    font-family: Roboto, sans-serif;
    font-size: 14px;
    line-height: 24px;
    color: $black-200;
    word-break: keep-all;
    margin-bottom: 0;
    font-weight: normal;
  }

  &__text {
    color: $black-100;
    margin-bottom: 20px;
    font-size: 16px;
  }

  .radio-form {
    display: flex;
    flex-direction: row;
  }

  &__label {
    font-size: 14px;
  }

  .dropdown {
    margin-bottom: 20px;
  }

  .textarea {
    margin-bottom: 24px;
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
