<template>
  <el-form
    ref="form"
    :model="form"
    :rules="rules"
    :label-position="labelPosition"
    enctype="multipart/form-data"
  >
    <template v-if="metaData.hidden_fields">
      <input
        v-if="!defaultParams.email_id"
        type="hidden"
        name="record"
        :value="form.record"
      />
      <input
        v-for="field in metaData.hidden_fields"
        :key="field.name"
        type="hidden"
        :name="field.name"
        :value="field.value"
      />
    </template>
    <div
      v-for="(panel, i) in metaData.panels"
      :key="panel.panel_id"
      class="form-panel"
    >
      <p v-if="panel.lbl" class="block-title fw-500">{{ panel.lbl }}</p>
      <div v-if="panel.panel_id !== 'LBL_COMMUNICATIONS'">
        <div
          class="panel-row"
          v-for="(row, index) in panel.rows"
          :key="index"
          :class="{ 'panel-row--switch': switcherField(row[0]) }"
        >
          <template v-for="(field, j) in row">
            <span v-if="!field.name" :key="field.name"></span>
            <form-field
              v-else-if="!hidden(field) && !blocked[field.name]"
              :key="`${i}_${index}_${j}_${field.name}`"
              :item="field"
              :form="form"
              :module="defaultParams.module"
              :is-popup="true"
              :noRequiredStar="noRequiredStar"
              :datepicker="datepicker"
              :options="options"
              :blocked="blocked"
              :callback="callback"
              :field-size="fieldSize"
              @set-value="setFieldValue"
              @change-option="changeOption"
              @save-form="saveForm('form', defaultParams.work_site)"
            ></form-field>
          </template>
        </div>
      </div>
      <div v-else :key="formKey">
        <div
          class="panel-row"
          v-for="(row, index) in mutationMetaDataPanels"
          :key="index"
          :class="{ 'panel-row--switch': switcherField(row[0]) }"
        >
          <template v-for="(field, j) in row">
            <span v-if="!field.name" :key="field.name"></span>
            <form-field
              v-else-if="!hidden(field) && !blocked[field.name]"
              :key="`${i}_${index}_${j}_${field.name}`"
              :item="field"
              :form="form"
              :module="defaultParams.module"
              :is-popup="true"
              :noRequiredStar="noRequiredStar"
              :datepicker="datepicker"
              :options="options"
              :blocked="blocked"
              :callback="callback"
              :field-size="fieldSize"
              @set-value="setFieldValue"
              @change-option="changeOption"
              @save-form="saveForm('form', defaultParams.work_site)"
            ></form-field>
          </template>
        </div>
      </div>
    </div>

    <slot name="bottom-content"></slot>
    <div v-show="metaData.custom_panels" class="custom-panels">
      <div
        v-for="panel in metaData.custom_panels"
        :key="panel.switcher_fields"
        class="custom-panels__item panel"
        :id="panel.switcher_fields"
      >
        <div class="custom-panels__switcher panel__header">
          <Switcher
            :model="form[panel.switcher_fields] == '1'"
            @switch="
              val => {
                $set(form, panel.switcher_fields, String(+val));
                if (panel.switcher_fields == 'email_switcher') {
                  $emit('emailSwitch', val);
                }
              }
            "
          />
          <p class="custom-panels__label panel__label">
            {{ panel.lbl || '[нет имени]' }}
          </p>
        </div>
        <div
          v-if="
            panel.switcher_fields == 'switcher_files' &&
            panel.rows &&
            form[panel.switcher_fields] == 1
          "
        >
          <div
            class="panel-row custom-panels__row"
            v-for="(row, index) in panel.rows"
            :key="index"
          >
            <div
              v-for="(field, j) in row"
              :key="`${i}_${index}_${j}`"
              :class="[
                `panel-row__column`,
                j == 0 ? `panel-row__column--left` : `panel-row__column--right`
              ]"
            >
              <span v-if="!field.name" :key="field.name"></span>
              <form-field
                v-else-if="!hidden(field) && !blocked[field.name]"
                :key="`${i}_${index}_${j}_${field.name}`"
                :item="field"
                :form="form"
                :module="defaultParams.module"
                :is-popup="true"
                :noRequiredStar="noRequiredStar"
                :datepicker="datepicker"
                :options="options"
                :blocked="blocked"
                :callback="callback"
                :field-size="fieldSize"
                @set-value="setFieldValue"
                @update-documents-list="updateDocumentsList"
                @change-option="changeOption"
                @save-form="saveForm('form')"
              ></form-field>
            </div>
          </div>
          <DocumentList
            v-loading="removeFile_loading"
            :documents="documents"
            allowRemove
            :user-id="form.record"
            class="documents-list"
            module="Notes"
            detailsType="size"
            @deleteFile="removeDocument"
          />
        </div>
      </div>
    </div>

    <form-buttons
      v-if="metaData.buttons_menu && !noButtons"
      v-scroll="handleScroll"
      v-loading="loading"
      :buttons_menu="metaData.buttons_menu"
      :action="urlParams.action"
      :view-type="formView"
    />
  </el-form>
</template>

<script>
import { store } from '@/store';
import { Form } from 'element-ui';
import {
  mixin,
  rules,
  metadata,
  form,
  saveForm,
  errorMsg
} from '@/utils/mixins';
import { setDateFormat, unmaskedPhone } from '@/utils/helpers';
import { getController, postController } from '@/controllers/request.js';
import { FIELD, ACTION, MODULE } from '@/utils/constants';
import FormField from 'Elements/Form/FormField';
import FormButtons from 'Elements/Form/FormButtons';
import Switcher from 'Elements/Switch/Switch';
import DocumentList from 'Elements/Document/DocumentList';

export default {
  mixins: [mixin, rules, metadata, form, saveForm, errorMsg],
  props: {
    data: {
      type: Object,
      default: null
    },
    defaultParams: {
      type: Object,
      default: () => ({})
    },
    files: {
      // прикрепленные файлы в форме
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: ''
    },
    buttonsMeta: {
      type: Array,
      default: () => []
    },
    noButtons: {
      // не показывать кнопки по метаданным
      type: Boolean,
      default: false
    },
    labelPosition: { type: String, default: 'top' },
    fieldSize: {
      type: String,
      default: 'medium'
    },
    noRequiredStar: Boolean,
    loadedAction: {
      type: String,
      default: ACTION.GET_EDITVIEW
    },
    isEmailForm: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      log: 0,
      formKey: 0,
      FIELD,
      formView: 'popup', // для миксина сохранения формы
      fields: {},
      btnLoading: {
        preview: false,
        save_download: false
      },
      datepicker: {
        dateFormat: 'dd.MM.yyyy',
        timeFormat: 'HH:mm'
      },
      documents: [],
      removeFile_loading: false,
      loading: false,
      form: {},
      options: {},
      rules: {},
      metaData: {},
      blocked: {},
      callback: {
        field: {
          change: (field, val) => {
            switch (field.name) {
              case FIELD.ID.SALARY_MIN:
              case FIELD.ID.SALARY_MAX:
              case FIELD.ID.SALARY_FROM:
              case FIELD.ID.SALARY_TO:
                this.formatSalary(val, field.name, field.precision);
                break;

              case FIELD.ID.VACANCY_NAME:
                this.$nextTick(() =>
                  this.$emit(
                    'select-vacancy',
                    this.form[field.id_name.name],
                    this.form.date_start
                  )
                );
                break;
              case 'date_event':
                this.$emit('update-date', val);
                break;

              case 'calendar_type':
                this.$emit('update-slots', val);
                break;

              default:
                break;
            }
          }
        }
      },
      initialForm: {}
    };
  },
  created() {
    if (
      !this.isEmailForm ||
      (this.isEmailForm && this.defaultParams.parent_id)
    ) {
      getController({
        params: {
          ...this.defaultParams,
          action: this.loadedAction,
          to_pdf: true
        }
      })
        .then(resp => {
          if (!resp.data || typeof resp.data !== 'object') return;

          const { bean, metadata, metaData, user_dat_format, message, status } =
            resp.data;

          if (!metadata && message && status) {
            this.$emit('reset-callback');
            store.dispatch('common/catchError', { msg: message });
            return;
          }

          const record = bean.id.value;
          const meta = metadata || metaData;

          if (
            !this.defaultParams.email_id &&
            this.defaultParams.module != MODULE.HRPAC_COORDINATION_REQUESTS
          ) {
            this.$set(this.form, 'record', record);
          }

          if (bean?.published_at?.value) {
            this.$set(this.form, 'published_at', bean.published_at.value);
          }

          if (this.defaultParams.module == MODULE.HRPAC_EVENT) {
            this.$set(this.form, 'event_id', record);
            this.$emit('get-busy-slots', {
              date_event:
                bean?.date_event?.value ||
                bean?.date_start?.value.split(' ')[0],
              calendar_type: bean.calendar_type.value
            });
          }

          if (
            this.defaultParams.module === MODULE.HRPAC_EVENT &&
            !this.defaultParams.event_id
          ) {
            this.$emit('add-member', bean.current_user.value);
            this.$emit('update-members', bean.current_user.value);
          }

          if (meta.hidden_fields) {
            meta.hidden_fields.forEach(field =>
              this.$set(this.form, field.name, this.formatHtml(field.value))
            );
          }

          meta.panels.forEach(panel => {
            panel.rows.forEach(row => {
              row.forEach(field => this.setField(field, bean));
            });
          });

          meta?.custom_panels?.forEach(panel => {
            if (panel?.switcher_fields == 'email_switcher') {
              let params = panel.uri.split('?');
              let paramsArray = {};
              let param = [];
              for (let elem of params[1].split('&')) {
                param = elem.split('=');
                if (param[0] == 'to_pdf') {
                  paramsArray[param[0]] = Boolean(param[1]);
                } else if (param[0] == 'jsqon_return') {
                  paramsArray[param[0]] = Number(param[1]);
                } else paramsArray[param[0]] = param[1];
              }
              store.commit('subpanels/setEmailData', paramsArray);
              store.commit('subpanels/setEmailParams', this.defaultParams);

              this.$nextTick(() => {
                let form = document.getElementById('email_form');
                let container = document.getElementById('email_switcher');
                container.append(form);
              });
            }
            this.$set(
              this.form,
              panel.switcher_fields,
              bean[panel.switcher_fields]?.value
            );

            if (panel.switcher_fields == 'switcher_files') {
              this.updateDocumentsList();
            }

            panel?.rows?.forEach(row => {
              row.forEach(field => this.setField(field, bean));
            });
          });

          this.metaData = {
            ...meta,
            buttons_menu: meta.buttons_menu || this.buttonsMeta
          };

          if (user_dat_format) {
            this.$set(
              this.datepicker,
              'dateFormat',
              setDateFormat(user_dat_format)
            );
          }

          if (!this.form.layout_form && this.options.layout_form_list) {
            this.$set(
              this.form,
              'layout_form',
              Object.keys(this.options.layout_form_list)[0]
            );
          }

          if (
            this.type &&
            (this.type == 'offer' || this.type == 'employee-exit')
          ) {
            this.fillWithCandidateData();
          }

          if (bean.get_responds && bean.get_responds?.value == 1) {
            this.form.get_responds_date = this.formatDate(
              bean.get_responds_date.value.split(' ')[0],
              this.datepicker.dateFormat
            );
          }

          this.processMetadata();
          this.initialForm = Object.assign({}, this.form);
        })
        .catch(err => {
          this.catchError(
            err,
            'Возникла ошибка получения данных',
            'get form data'
          );
        })
        .finally(() => {
          this.$emit('setFormLoading', false);
          store.commit('common/setParam', {
            name: 'metaDialogLoaded',
            val: true
          });
          if (this.isEmailForm) {
            store.commit('common/setDetachedEmailForm', this.$refs.form);
          }
        });
    }
  },
  mounted() {
    // отслеживание изменения высоты попапа (изм-е DOM и стилей) с целью фиксации
    // deprecated method, maybe it needs the ResizeObserver
    const dialog =
      this.$parent.$refs.dialog || this.$refs.form.$el.closest('.el-dialog');
    dialog.addEventListener('DOMSubtreeModified', this.resizeDialog, false);
    // bad cross-browser support
    dialog.addEventListener('transitionend', this.resizeDialog, false);
    this.log++;
  },
  computed: {
    mutationMetaDataPanels() {
      let rows = this.metaData.panels[this.metaData.panels.length - 1].rows;
      const { invite, refuse } = this.inviteAndRefuse;

      if (!Number(this.form.get_responds)) {
        rows.map(item => {
          if (item[0].name === 'mass_vacancy') {
            item[0].disabled = true;
            this.form.mass_vacancy = '0';
          }
          if (item[0].name === 'answer_responds') {
            item[0].disabled = true;
            this.form.answer_responds = '0';
          }
          this.formKey = Date.now();
        });
      } else {
        rows.map(item => {
          if (item[0].name === 'mass_vacancy') {
            item[0].disabled = false;
          }
          if (
            item[0].name === 'answer_responds' &&
            (invite.length || refuse.length)
          ) {
            item[0].disabled = false;
          }
          this.formKey = Date.now();
        });
      }

      return rows;
    },
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    },
    inviteAndRefuse() {
      return store.state.vacancy.inviteAndRefuseText;
    },
    dialogMounted() {
      return store.state.common.metaDialogLoaded;
    }
  },
  methods: {
    removeDocument(doc) {
      this.removeFile_loading = true;
      if (doc) {
        getController({
          params: {
            module: MODULE.NOTES,
            action: ACTION.DELETE,
            record: doc.id.value
          }
        })
          .then(() => {
            this.updateDocumentsList();
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при удалении документа',
              'document remove'
            )
          );
      }
    },
    updateDocumentsList() {
      getController({
        params: {
          module: MODULE.HRPAC_EVENT,
          action: 'get_event_notes',
          record: this.form.record,
          to_pdf: true
        }
      })
        .then(resp => {
          const format = 'DD.MM.YYYY HH:mm';
          const sortedList = resp.data.List.sort(
            (a, b) =>
              this.rawDate(b.date_modified.value, format) -
              this.rawDate(a.date_modified.value, format)
          );
          this.documents = resp.data.List || sortedList || [];
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка обновления списка загруженных документов',
            'documents loading'
          )
        )
        .finally(() => {
          this.removeFile_loading = false;
        });
    },
    setField(field, bean = {}) {
      if (!field.name) return;

      if (
        field.name === 'answer_responds' &&
        (!this.inviteAndRefuse.invite.length ||
          !this.inviteAndRefuse.refuse.length)
      ) {
        field.disabled = true;
      }

      if (field.type == FIELD.TYPE.GROUP) {
        field.fields.forEach(subField =>
          !this.fields[field] ? this.setField(subField, bean) : null
        );
        return;
      } else if (field.blocked && field.type != FIELD.TYPE.GROUP) {
        const blockedFields = Array.isArray(field.blocked)
          ? field.blocked
          : Object.keys(field.blocked);
        blockedFields.forEach(field =>
          !this.fields[field] ? this.setField(bean[field], bean) : null
        );
      }

      if (
        field.name == FIELD.ID.PHONE_NUMBER ||
        field.name == FIELD.ID.CONTACTS_PHONES
      ) {
        field.value = unmaskedPhone(field.value);
      }

      this.$set(this.form, field.name, this.formatHtml(field.value));

      // if (field.name == 'date_event' && this.defaultParams.event_id)
      //   this.$emit('update-date', field.value);
      this.setSpecialRules(field);
      this.fields[field.name] = field;

      if (field.id_name) {
        this.fields[field.id_name.name] = field.id_name;
      }

      if (field.name == 'date_start' || field.name == 'date_end') {
        let dateTimeElements = field.value.split(':');
        if (dateTimeElements.length > 2) {
          field.value = `${dateTimeElements[0]}:${dateTimeElements[1]}`;
        }
      }
    },
    setSpecialRules(field) {
      const { name, type, validation, visual_type } = field;
      const rule = this.rules[name] || [];

      if (
        name == FIELD.ID.PHONE ||
        name == FIELD.ID.PHONE_NUMBER ||
        name == FIELD.ID.CONTACTS_PHONES ||
        field.htmlType == 'phone'
      ) {
        rule.push({
          min: 7,
          max: 15,
          message: 'Номер должен содержать как минимум 7 цифр',
          trigger: ['blur', 'focus', 'change']
        });
      } else if (name == FIELD.ID.CONTACTS_EMAIL || field.htmlType == 'email') {
        rule.push({
          type: 'email',
          message: 'Введенный email указан некорректно',
          trigger: ['blur', 'focus', 'change']
        });
      } else if (field.htmlType == 'url' || field.type === FIELD.TYPE.URL) {
        rule.push({
          validator: (rule, value, callback) => {
            const regexp = /^(https?:\/\/)/i;
            if (!regexp.test(value)) {
              callback(new Error('Введен некорректный URL адрес'));
            } else {
              callback();
            }
          },
          trigger: ['blur', 'focus', 'change']
        });
      } else if (!this.dateType(type) && validation && validation.target) {
        const start =
          validation.rules == '<' || validation.rules == '<='
            ? name
            : validation.target;
        const end =
          validation.rules == '>' || validation.rules == '>='
            ? name
            : validation.target;

        rule.push({
          validator: (rule, value, callback) =>
            this.validateNumberRange(true, value, callback, [start, end]),
          // message: 'Неверно введен диапазон чисел',
          trigger: ['blur', 'change']
        });
      } else if (this.dateType(type) && validation && validation.target) {
        const start =
          validation.rules == '<' || validation.rules == '<='
            ? name
            : validation.target;
        const end =
          validation.rules == '>' || validation.rules == '>='
            ? name
            : validation.target;

        rule.push({
          validator: (rule, value, callback) =>
            type == FIELD.TYPE.DATETIME &&
            visual_type == FIELD.VISUAL_TYPE.TIMEPICKER
              ? this.validateTimeRange(
                  true,
                  value,
                  callback,
                  [this.form[start], this.form[end]],
                  this.datepicker.timeFormat
                )
              : this.validateDateRange(
                  true,
                  value,
                  callback,
                  [this.form[start], this.form[end]],
                  this.datepicker.dateFormat
                ),
          // message: 'Неверно введен диапазон дат',
          trigger: ['blur', 'change']
        });
      } else if (this.textType(type)) {
        rule.push({
          validator: (rule, value, callback) => {
            const validLength = field.minlength
              ? value.replace(/<\/?[^>]+(>|$)/g, '').length >= field.minlength
              : true;

            if (!validLength)
              callback(
                new Error(
                  `Минимальная длина сообщения ${field.minlength} символов`
                )
              );
            else callback();
          },
          trigger: ['blur', 'change']
        });
      }

      this.$set(this.rules, name, rule);
      if (!this.$refs.form) return;
      this.$refs.form.validate();
    },
    downloadFile(url) {
      const e = document.createElement('a');
      e.href = url;
      e.target = '_blank';
      e.download = url.substr(url.lastIndexOf('/') + 1);
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
    },
    preview() {
      this.$set(this.defaultParams, 'mode', 'preview');
      this.btnLoading.preview = true;

      const formData = new FormData();
      const form = { ...this.defaultParams, ...this.form };

      for (let key in form) {
        formData.set(key, form[key]);
      }

      postController({ options: formData })
        .then(resp => {
          if (resp.data) {
            const windowParams = `location=no,toolbar=no,menubar=no,width=800,height=1000,left=100,top=100`;
            window
              .open(
                resp.data.file_path,
                `Предпросмотр сформированно${
                  this.type === 'offer' ? 'го оффера' : 'й заявки'
                }:blank`,
                windowParams
              )
              .focus();
          }

          if (resp.data.errors && resp.data.errors.length) {
            this.showErrorMessage(resp.data.errors);
          }
        })
        .catch(err =>
          this.catchError(
            err,
            `Возникла ошибка предпросмотра ${
              this.type === 'offer' ? 'оффера' : 'заявки на выход сотрудника'
            }. Попробуйте еще раз.`,
            `preview ${this.type === 'offer' ? 'offer' : 'employee exit'} form`
          )
        )
        .finally(() => {
          this.requestSent = false;
          this.btnLoading.preview = false;
          this.$delete(this.defaultParams, 'mode');
        });
    },
    fillWithCandidateData() {
      if (!this.data) return;

      Object.values(this.fields).forEach(field => {
        const prop = field.name;
        const { candidates_data, vacancy_data } = this.data;
        const communications = candidates_data.communications;
        const phoneIndex =
          communications &&
          communications.findIndex(({ value_type }) => value_type === prop);
        const excludedFields = [FIELD.ID.DESCRIPTION, FIELD.ID.GRADE];
        if (
          candidates_data.hasOwnProperty(prop) &&
          !excludedFields.includes(prop) &&
          !field.value
        ) {
          this.$set(this.form, prop, this.formatHtml(candidates_data[prop]));
        }

        if (
          vacancy_data.hasOwnProperty(prop) &&
          !excludedFields.includes(prop) &&
          !field.value
        ) {
          this.$set(this.form, prop, this.formatHtml(vacancy_data[prop]));
        }

        if (phoneIndex > -1) {
          const phoneVal = unmaskedPhone(
            this.formatHtml(communications[phoneIndex].value)
          );
          this.$set(this.form, prop, phoneVal);
        }
      });
    },
    selectTemplate(templateId) {
      getController({
        url: `/index.php?entryPoint=emailTemplateData&emailTemplateId=${templateId}&to_pdf=true`
      })
        .then(resp => {
          const { data, error } = resp.data;

          if (error) {
            this.showErrorMessage(error);
            return;
          }

          if (!data || !data.field_mapping) return;

          for (let key in data.field_mapping) {
            if (key != 'attachments') {
              this.$set(
                this.form,
                data.field_mapping[key],
                this.formatHtml(data[key])
              );
            } else {
              this.$emit('set-template-files', data[key]);
            }
          }
        })
        .catch(err => {
          this.catchError(
            err,
            'Возникла ошибка выбора шаблона письма',
            'select email template'
          );
        });
    }
  },
  watch: {
    dialogMounted: function () {
      // для диалоговых длинных окон высчитываем высоту контента
      if (this.dialogMounted) {
        this.resizeDialog();
      }
    }
  },
  components: {
    'el-form': Form,
    FormField,
    FormButtons,
    Switcher,
    DocumentList
  }
};
</script>

<style lang="scss" scoped>
label {
  text-align: left;
  color: $black-200;
  font-weight: normal;
}

.label {
  line-height: 24px;
  font-weight: normal;
  padding: 0;
  text-align: left;
  word-break: break-word;
  white-space: normal;
}

.red-star {
  width: 9px;
  height: 8px;
  display: inline-block;
  background-image: url(/front/public/style/img/required-star.svg);
  background-repeat: no-repeat;
  background-position: 50%;
  margin-left: 7px;
}

// .form-panel + .form-panel {
//   margin-top: 28px;
// }

.form {
  &-panel {
    margin-bottom: 32px;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: $black-10;
  border-radius: 4px;

  &__header {
    display: flex;
    gap: 16px;
  }

  &__label {
    color: $black-200;
    font-size: 16px;
    line-height: 24px;
  }
}

.custom-panels {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;

  &__switcher {
    display: flex;
    width: 100%;
  }

  &__row {
    &:not(:last-of-type) {
      margin-bottom: 0 !important;
    }

    margin-top: 16px;
  }

  &__item {
    display: block;
    padding: 16px;
    gap: 16px;
    background-color: $black-10;
    border-radius: 4px;

    .documents-list {
      padding-top: 8px;

      // .documents__list {
      //   padding-top: 8px;
      // }
      & ::v-deep .document {
        background: white;

        &__row-delete {
          display: block;
        }
      }
    }
  }

  &__label {
    color: $black-200;
  }
}

.form-custom {
  display: flex;
  flex-direction: column;
  background-color: $black-10;
  border-radius: 4px;
  // margin-top: 8px;
  padding: 16px;

  &__switcher {
    display: flex;
    gap: 20px;
    align-items: center;

    &--label {
      color: $black-200;
      font-size: 16px;
      line-height: 24px;
    }
  }
}

.panel-row {
  display: flex;
  justify-content: space-between;

  &:not(:last-of-type) {
    margin-bottom: 12px;
  }

  &:empty {
    display: none;
  }

  &__column {
    width: calc(50% - 4px);

    & ::v-deep .form-field {
      div {
        .el-form-item {
          .el-form-item__content {
            display: flex;
            flex-direction: column !important;
          }
        }
      }
    }
  }

  & ::v-deep > .form-field {
    &:not(:only-child):first-child {
      margin-right: 24px;
      width: calc(50% - 12px);
    }

    &:not(:only-child):last-child {
      width: calc(50% - 12px);
    }

    &:only-child {
      width: 100%;
    }
  }

  & ::v-deep .el-form-item {
    width: 100%;

    &__label {
      padding: 0;
      left: 0;
      top: 100%;
    }

    &__error {
      position: relative;
      padding: 0;
      left: 0 !important;
      top: 100% !important;
      text-align: left;
    }

    &__content {
      margin-left: 0;
      width: 100%;
    }
  }

  & ::v-deep .el-switch__label span {
    font-size: 16px;
    line-height: 24px;
    color: $primary-text;
  }

  & ::v-deep .el-switch,
  & ::v-deep .el-switch__label {
    height: 24px;
  }
}

.el-form {
  &.el-form--label-top ::v-deep .el-form-item {
    &__content {
      flex-direction: column;
    }

    &.sub-fields > .el-form-item__content {
      flex-direction: row;
    }
  }

  &.el-form--label-left {
    & ::v-deep .panel-row {
      align-items: center;
    }

    & ::v-deep .el-form-item {
      &__content {
        flex-direction: row;
      }

      &__label {
        white-space: nowrap;
        min-width: 115px;
        margin-right: 16px;
      }
    }
  }
}

.el-form {
  &.el-form--label-top ::v-deep .el-form-item {
    &__content {
      flex-direction: column;
    }
  }

  &.el-form--label-left {
    & ::v-deep .panel-row {
      align-items: center;
    }

    & ::v-deep .el-form-item {
      &__content {
        flex-direction: row;
      }

      &__label {
        white-space: nowrap;
        min-width: 115px;
        margin-right: 16px;
      }

      &__error {
        display: none !important;
      }
    }
  }
}

.block-title {
  color: $black-190;
  font-weight: 500;
  font-size: 18px;
  line-height: 28px;
  text-align: left;
  margin-bottom: 8px;
  margin-top: 20px;
}

#front .el-dialog__wrapper .footer {
  &__row {
    display: flex;
  }

  &__button {
    width: auto;

    &:nth-child(2) {
      margin-left: 12px;
    }
  }
}

.dialog__content .el-form .buttons-panel {
  display: flex;
  margin-top: 16px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
