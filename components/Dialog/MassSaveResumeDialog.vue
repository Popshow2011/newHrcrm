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
        Будет сформирован архив с резюме {{ selected.length }} чел. и сохранен
        на устройство.<br />
        Файлы резюме будут сформированы согласно выбранному шаблону.
      </div>

      <div class="radio-form">
        <p class="radio-form__text">Формат</p>
        <Radio
          label="pdf"
          text="pdf"
          :model="form.format"
          @set-value="val => $set(form, 'format', val)"
        />
        <Radio
          label="docx"
          text="docx"
          :model="form.format"
          @set-value="val => $set(form, 'format', val)"
        />
      </div>

      <Dropdown
        :field="{ name: 'template', type: 'enum', required: true }"
        :options="templates"
        :filterable="true"
        :model="form.template"
        size="big"
        @set-value="(name, val) => $set(form, name, val)"
        class="dropdown"
      ></Dropdown>
    </div>

    <div class="dialog-footer">
      <Button
        buttonSize="big"
        v-loading="loading.save"
        buttonColor="darkBlue"
        buttonText="Сохранить"
        @click.prevent="startDownloadResume"
      />
      <Button
        v-loading="loading.cancel"
        buttonSize="big"
        buttonColor="blue"
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
import { mixin, dialogMixin } from '@/utils/mixins';
import { store } from '@/store';
import { getController, postController } from '@/controllers/request.js';

export default {
  mixins: [mixin, dialogMixin],
  props: {
    is_visible: {
      type: Boolean
    }
  },
  data() {
    return {
      form: {
        format: 'pdf',
        template: ''
      },
      templates: [],
      loading: { save: false, cancel: false }
    };
  },
  created() {
    getController({
      params: {
        module: 'HRPAC_CANDIDATES',
        action: 'get_rel_fields_values',
        field: 'resume_template',
        to_pdf: 1,
        iteration: 0
      }
    })
      .then(resp => {
        this.templates = resp.data;
        this.$set(this.form, 'template', Object.keys(resp.data)[0]);
      })
      .catch(err =>
        this.catchError(
          err,
          'Возникла ошибка при получении списка шаблонов резюме',
          'error while getting list of resume templates'
        )
      );
  },
  computed: {
    selected() {
      return store.state.common.selected;
    }
  },
  methods: {
    startDownloadResume() {
      this.loading.save = true;
      const formData = new FormData();
      const params = {
        action: 'massSaveResumeRun',
        module: 'AOS_PDF_Templates',
        format: this.form.format,
        resume_template: this.form.template,
        candidate_id: store.state.common.selected.join(";"),
        to_pdf: 1,
        jsqon_return: 1
      };

      localStorage.setItem('format', this.form.format);
      localStorage.setItem('resume_template', this.form.template);
      localStorage.setItem(
        'candidate',
        JSON.stringify(store.state.common.selected)
      );

      for (let key in params) {
        formData.set(key, params[key]);
      }

      postController({ options: formData })
        .then(() => {
          let event = new Event('onOpenProgressDialog'); // объявляем кастомный ивент
          document.dispatchEvent(event); // вызываем кастомный ивент для открытия попапа в меню

          store.commit('common/setSelected', {
            arr: [],
            replace: true
          });

          this.loading.save = false;
          this.closeDialog('mass_save_resume_dialog');
        })
        .catch(err => {
          this.catchError(
            err,
            'Возникла ошибка при скачивании списка резюме',
            'error while getting list of resume templates'
          );
          this.loading.save = false;
        });
    },
    resetCallback() {
      this.loading.cancel = true;
      getController({
        params: {
          action: 'massSaveResumeCancel',
          module: 'AOS_PDF_Templates',
          to_pdf: 1,
          jsqon_return: 1
        }
      })
        .then(() => {
          this.closeDialog('mass_save_resume_dialog');
        })
        .catch(err => {
          this.catchError(err, 'Возникла ошибка при отмене процесса генерации');
          this.loading.cancel = false;
        });
    }
  },
  components: {
    'el-dialog': Dialog,
    Dropdown,
    Button,
    Radio
  }
};
</script>

<style lang="scss" scoped>
.el-dialog__wrapper.dialog {
  & ::v-deep .el-dialog {
    background: $white !important;
    margin-top: 15vh !important;
    padding: 0px !important;
    z-index: 3300 !important;

    &__header {
      padding: 12px 24px !important;

      .el-dialog__title {
        font-size: 18px !important;
        line-height: 28px !important;
        color: $black-200;
        font-family: 'Roboto Medium';
        font-weight: 500;
      }
    }
  }
}

.dialog-body {
  padding: 24px;
  border-top: 1px solid $black-20;
  border-bottom: 1px solid $black-20;
  max-height: 420px;
  overflow-y: auto;

  .message {
    font-size: 15px;
    line-height: 24px;
    color: $black-100;
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
  }

  .el-button {
    margin-right: 8px;
  }
}

.dialog-footer {
  padding: 24px;
}
</style>
