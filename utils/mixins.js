import { Message, Notification } from 'element-ui';
import { FIELD, MODULE, BUTTON, SCROLL_VALUE, ACTION } from '@/utils/constants';
import { scrollToError, detailView, setContactData } from '@/utils/helpers';
import { postController, getController } from '@/controllers/request.js';
import isPlainObject from 'lodash/isPlainObject';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { store } from '@/store';
// import { errorTypes } from '../store/modules/publicator';

dayjs.extend(customParseFormat);

export const dialogMixin = {
  methods: {
    setVisibleDialog(name, val) {
      // учесть разные модули стор
      store.commit('common/setVisibleDialog', { name, val });
    }
  }
};

export const mixin = {
  computed: {
    urlParams() {
      // bad support of matchAll
      const regexp = /&|module=|action=|record=/gi;
      const str = location.href.slice(location.href.indexOf('?') + 1);
      const result = [...str.match(regexp)];
      const config = {};

      result.some((res, i) => {
        if (res === '&') return false;

        const index = str.indexOf(res);
        if (str[index - 1] && str[index - 1] !== '&') return false;

        const param = res.slice(0, res.length - 1);
        const nextRes = result[i + 1];
        const startIdx = res.length + index;
        const endIdx =
          nextRes && nextRes === '&'
            ? str.slice(index).indexOf(nextRes) + index
            : str.length;
        if (!config[param]) {
          config[param] = str.slice(startIdx, endIdx);
        }
      });

      return config;
    }
  },
  methods: {
    rawDate(date = '', format) {
      // raw dateformat by new date
      if (!date) return new Date();
      if (date && typeof date !== 'string') return date;

      const splitedFormat = format.toUpperCase().split(' ')[0].split(/[./-]/g);
      const splitedDate = date.split(' ')[0].split(/[./-]/g);
      const splitedTime = date.split(' ')[1];
      const dayIndex = splitedFormat.findIndex(f => f == 'DD');
      const monthIndex = splitedFormat.findIndex(f => f == 'MM');
      const yearIndex = splitedFormat.findIndex(f => f == 'YYYY');
      const hours = splitedTime ? splitedTime.split(':')[0] : 0;
      const minutes = splitedTime ? splitedTime.split(':')[1] : 0;

      if (splitedDate[0].length == 4) {
        // yyyy-mm-dd
        return new Date(
          splitedDate[0],
          splitedDate[1] - 1,
          splitedDate[2],
          hours,
          minutes
        );
      }

      let day = splitedDate[dayIndex];
      let month = splitedDate[monthIndex];
      const year = splitedDate[yearIndex];

      if (+month > 12) {
        day = splitedDate[monthIndex];
        month = splitedDate[dayIndex];
      }

      return new Date(year, month - 1, day, hours, minutes);
    },
    formatDate(date = '', format) {
      // formatted date
      return dayjs(this.rawDate(date, format)).format(format.toUpperCase());
    },
    getNewDate(date) {
      if (!date) return new Date();

      const [day, month, year] = date.split(' ')[0].split(/[./-]/g);
      const [hour, minute] = date.includes(':')
        ? date.split(' ')[1].split(':')
        : '00:00';

      return new Date(year, month - 1, day, hour, minute);
    },
    getTableData(data, columns) {
      let result = [];

      data.forEach(item => {
        let row = {};
        Object.keys(columns).forEach(col => {
          let column = (row[col.toLowerCase()] = {});
          Object.keys(columns[col]).forEach(colParam => {
            column[colParam] = columns[col][colParam];
          });
          column['value'] = item[col];
        });
        result.push(row);
      });

      return result;
    },
    formatHtml(text) {
      if (typeof text === 'string' && text) {
        const replacement = [
          [/&quot;/g, '"'],
          [/&gt;/g, '>'],
          [/&lt;/g, '<'],
          [/&#039;/g, "'"],
          [/&#38;/g, '"'],
          [/&#96;/g, '`'],
          [/%3A/g, ':']
        ];
        return text
          .replace(...replacement[0])
          .replace(...replacement[1])
          .replace(...replacement[2])
          .replace(...replacement[3])
          .replace(...replacement[4])
          .replace(...replacement[5])
          .replace(...replacement[6]);
      }
      return text;
    },
    confirmCloseDialog(params = {}, display, param) {
      // const confirm = window.confirm(text);
      // if (confirm) {
      //   this.closeDialog(params);
      // } else return null;

      store.commit('common/setVisibleDialog', {
        name: 'confirm_close_dialog',
        val: display,
        params
      });
      if (param && this[param]) this[param] = null;
    },
    closeDialog(dialogs, formName = 'form', ...params) {
      const hideDialog = dialog => {
        if (this.hasOwnProperty('is_visible')) {
          const dialogParams = this.is_visible
            ? [this['is_visible'], dialog]
            : [this[dialog], 'visible'];
          this.$set(...dialogParams, false);
        } else {
          dialogMixin.methods.setVisibleDialog(dialog, false);
        }
      };

      if (formName && this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }

      if (dialogs && Array.isArray(dialogs)) {
        dialogs.forEach(d => hideDialog(d));
      } else {
        hideDialog(dialogs);
      }

      const paramsForChange = params
        ? Array.isArray(params)
          ? params
          : [params]
        : [];

      paramsForChange.forEach(i => {
        if (this.hasOwnProperty(i)) {
          this[i] = null;
        } else {
          const module =
            this.module == MODULE.CANDIDATES_MODULE
              ? 'candidate'
              : this.module == MODULE.VACANCY_MODULE
              ? 'vacancy'
              : '';

          if (i) {
            store.commit(`${module}/setParam`, { name: i, val: null });
          }
        }
      });
    },
    validateNumberRange(required = false, value, callback, range) {
      if (Array.isArray(range)) {
        const [min, max] = range;

        if (
          (!min && typeof min == 'string') ||
          (!max && typeof max == 'string')
        )
          callback();

        if (min || max) {
          if (Number(min) > Number(max)) {
            callback(new Error('Введен неверный числовой диапазон'));
          } else callback();
        } else {
          callback();
        }
      } else {
        const [a, b] = Object.keys(range);
        const [signA, signB] = Object.values(range);
        const condition1 = signA === '<=' && signB === '>='; // error при > <
        const condition2 = signA === '<' && signB === '>'; // error при >= <=
        const min = this.form[a];
        const max = this.form[b];

        if (min && Number(max) !== 0) {
          if (condition1) {
            if (Number(min) > Number(max)) {
              callback(new Error('Введен неверный числовой диапазон'));
            }
          }
          if (condition2) {
            if (Number(min) >= Number(max)) {
              callback(new Error('Введен неверный числовой диапазон'));
            }
          }
        }
      }

      if (required && !value) {
        callback(new Error('Необходимо заполнить поле'));
      } else {
        callback();
      }
    },
    invalidDateRange(range, dateFormat) {
      let [start, end] = range;

      if (end && start) {
        start = this.rawDate(start, dateFormat);
        end = this.rawDate(end, dateFormat);

        return start > end;
      }

      return false;
    },
    invalidTimeRange(range, timeFormat) {
      let [start, end] = range;

      if (end && start) {
        start = dayjs(start, timeFormat).toDate();
        end = dayjs(end, timeFormat).toDate();

        return start > end;
      }

      return false;
    },
    validateDateRange(required = false, value, callback, range, dateFormat) {
      if (this.invalidDateRange(range, dateFormat)) {
        callback(new Error('Введен неверный диапазон дат'));
      }

      if (required && !value) {
        callback(new Error('Необходимо заполнить поле'));
      } else {
        callback();
      }
    },
    validateTimeRange(required = false, value, callback, range, timeFormat) {
      if (this.invalidTimeRange(range, timeFormat)) {
        callback(new Error('Введен неверный диапазон времени'));
      }

      if (required && !value) {
        callback(new Error('Необходимо заполнить поле'));
      } else {
        callback();
      }
    },
    handleChangeRange(start, end, formName) {
      if (!this.$refs[formName]) return;

      if (start && this[formName].hasOwnProperty(start)) {
        this.$refs[formName].validateField(start);
      }
      if (end && this[formName].hasOwnProperty(end)) {
        this.$refs[formName].validateField(end);
      }
    },
    catchError(err, msg, action) {
      console.log(action + ' error.', err);
      Message({
        offset: 100,
        showClose: true,
        duration: 25000,
        message: msg,
        type: 'error'
      });
    },
    recalcSelectHeight(name) {
      // пересчет высоты мультиселекта (фикс от подергивания элемента)
      setTimeout(() => {
        const input = document.querySelector(`.front input[name="${name}"]`);
        const select = input.closest('.el-select');
        const tagWrapper = select.querySelector('.el-select__tags');
        const tagSpan = select.querySelector('.el-select__tags>span');

        if (tagSpan) {
          const withScrollbar =
            tagSpan.offsetWidth > tagWrapper.offsetWidth ? 7 : 0;
          input.style.maxHeight =
            select.querySelector('.el-select__tags').offsetHeight -
            withScrollbar +
            'px';
        }
      }, 100);
    },
    resizeDialog() {
      const dialog =
        this.$parent.$refs.dialog ||
        (this.$refs.form && this.$refs.form.$el.closest('.el-dialog')) ||
        this.$refs.dialog?.$el.querySelector('.el-dialog');

      if (!dialog) return;

      const title = dialog.querySelector('.el-dialog__header');
      const buttons = dialog.querySelector('.buttons-panel');

      if (!title || !buttons) return;

      this.$nextTick(() => {
        // const dialogIndents = document.body.offsetHeight - dialog.offsetHeight;

        dialog
          .closest('.el-dialog__wrapper')
          .classList.remove('dialog--scrollable');
        dialog.querySelector('.el-dialog__body').style.maxHeight = '';

        if (dialog.offsetHeight >= document.body.offsetHeight) {
          const contentBodyHeight = title.offsetHeight + buttons.offsetHeight;
          /* + (dialogIndents > -1 ? dialogIndents : 0); */

          dialog
            .closest('.el-dialog__wrapper')
            .classList.add('dialog--scrollable');
          dialog.querySelector(
            '.el-dialog__body'
          ).style.maxHeight = `calc(100% - ${contentBodyHeight}px`;
        }

        if (
          buttons.offsetWidth !== dialog.offsetWidth &&
          dialog.querySelector('.buttons-panel')
        ) {
          dialog.querySelector('.buttons-panel').style.maxWidth =
            dialog.offsetWidth + 'px';
        }
      });
    }
  },
  components: { Message }
};

export const rules = {
  methods: {
    setRequiredFields(required, key) {
      if (required) {
        const validation = {
          required: true,
          message: 'Необходимо заполнить поле',
          trigger: ['change', 'input', 'blur']
        };
        const rule = this.rules[key]
          ? [...this.rules[key], validation]
          : [validation];

        this.$set(this.rules, key, rule);
      }
    },
    setRule(formName, name, rule = null) {
      if (rule && typeof rule === 'object') {
        const arrayRule = Array.isArray(rule) ? rule : [rule];
        this.$set(this.rules, name, arrayRule);
      } else {
        this.$delete(this.rules, name);
      }
      this.$nextTick(function () {
        this.$refs[formName].clearValidate();
      });
    },
    validateForm(form, fieldName) {
      let valid = [];
      const validateField = name => {
        // вынести в миксины setHidden, validateForm, handleChange + поменять во всех окнах
        if (this.fields[name].hidden) return true; // скрытые поля не проверяем

        this.rules[name].some(rule => {
          // вернуть первую ошибку поля
          let isCorrect = false;

          if (rule.required && !form[name]) {
            this.$set(this.fields[name], 'error', true);
          } else if (rule.validator) {
            const { invalid, fields } = rule.validator();
            isCorrect = !invalid;
            fields.forEach(field => {
              this.$set(this.fields[field], 'error', invalid);
              this.$set(
                this.fields[field],
                'message',
                invalid ? rule.message : ''
              );
            });
          } else {
            this.$set(this.fields[name], 'error', false);
            isCorrect = true;
          }

          valid.push(isCorrect);
          return !isCorrect;
        });
      };

      if (fieldName && this.rules[fieldName]) {
        validateField(fieldName);
      } else {
        for (let key in this.rules) {
          if (this.rules[key]) {
            validateField(key);
          }
        }
      }

      return valid.every(correct => correct);
    },
    setHidden(name, val) {
      this.$set(this.fields[name], 'hidden', val);
    },
    checkPhoneInput(form, name) {
      // временный хардкод для поля Телефон
      const phone = form[name];
      if (
        phone.slice(0, 3) !== '880' &&
        phone.slice(0, 1) === '8' &&
        phone.length > 2
      ) {
        // проверка на код Бангладеша и коды городов РФ, чтобы заменить +8 на +7
        const val = '7' + phone.slice(1);
        this.$set(form, name, val);
      }
    }
  }
};

export const metadata = {
  methods: {
    setButtonsData(metadata) {
      if (!metadata) return;

      metadata.forEach(btn => {
        if (Array.isArray(btn)) {
          this.setButtonsData(btn);
        } else {
          const {
            type,
            id,
            url,
            child,
            visibility,
            custom_display,
            error_text,
            popup_type,
            selection_stage_actions
          } = btn;
          let callback;

          if (error_text) {
            store.commit('common/setNotification', { [btn.id]: error_text });
          }

          switch (type) {
            case BUTTON.TYPE.LINK:
              if (id == BUTTON.ID.CANCEL) {
                callback = () => {
                  const confirm = window.confirm(
                    'Закрыть без сохранения изменений?'
                  );
                  if (confirm) {
                    location.href = url;
                  }
                };
              } else if (id == BUTTON.ID.OPEN_QUESTIONNAIRE) {
                callback = () =>
                  this.fields.questionnaire.value
                    ? window.open(this.fields.questionnaire.value, '_blank')
                    : null;
              } else if (id == BUTTON.ID.TUNE) {
                callback = () => {
                  const user_id = store.state.common.config.userId;
                  location.href = `index.php?module=Users&action=EditView&record=${user_id}`;
                };
              } else {
                callback = () => (location.href = url);
              }

              break;

            case BUTTON.TYPE.POPUP:
              if (!popup_type && !selection_stage_actions)
                dialogMixin.methods.setVisibleDialog(`${id}_dialog`, false);

              callback = async () => {
                if (selection_stage_actions) {
                  await store.dispatch('common/getSteps', {
                    candidate_id: this.fields?.id?.value,
                    selection_stage_actions: selection_stage_actions
                  });

                  dialogMixin.methods.setVisibleDialog(
                    'candidate_general_dialog',
                    true
                  );

                  return;
                }

                if (error_text) {
                  errorMsg.methods.showErrorMessage(error_text);
                  return;
                }

                if (popup_type) {
                  store.commit('application/setPopupType', popup_type);

                  dialogMixin.methods.setVisibleDialog(
                    `application_dialog`,
                    true
                  );
                } else
                  dialogMixin.methods.setVisibleDialog(`${id}_dialog`, true);

                if (
                  id === BUTTON.ID.OPEN_POSITIONS ||
                  id === BUTTON.ID.CANCEL_POSITIONS
                ) {
                  this.setAmountIncrement(`${id}_dialog`);
                }
              };
              break;

            case BUTTON.TYPE.DROPDOWN:
              this.$set(btn, 'submenu', this.data.length ? this.data : null);
              break;

            case BUTTON.TYPE.AJAX:
              switch (id) {
                case BUTTON.ID.PICK_CANDIDATE:
                  callback = () => this.showCandidatesList();
                  break;
                case BUTTON.ID.OK:
                case BUTTON.ID.SAVE:
                case BUTTON.ID.SAVE_AND_DOWNLOAD:
                case BUTTON.ID.SEND_EMAIL:
                case BUTTON.ID.PUBLISH:
                case BUTTON.ID.SAVE_PUBLICATOR:
                case BUTTON.ID.SAVE_AS_TEMPLATE:
                case BUTTON.ID.SAVE_AS_TEMPLATE_NOT_PUBLISH:
                  callback = () => {
                    if (
                      this.defaultParams &&
                      this.defaultParams.module ===
                        MODULE.HRPAC_PUBLISHED_VACANCY &&
                      this.defaultParams.action === 'savePublishedVacancy'
                    ) {
                      if (
                        store.state.publicator.hhData &&
                        !store.state.publicator.hhData.is_employer
                      ) {
                        return store.dispatch('common/catchError', {
                          msg: 'Текущий пользователь не является работодателем'
                        });
                      }
                      if (
                        store.state.publicator.hhData &&
                        store.state.publicator.hhData.employer.id
                      ) {
                        this.saveForm(
                          'form',
                          id == BUTTON.ID.SAVE_AND_DOWNLOAD ||
                            id == BUTTON.ID.PUBLISH
                        );
                      } else {
                        errorMsg.methods.showErrorMessage({
                          offset: 100,
                          showClose: true,
                          duration: 25000,
                          message:
                            'Для продолжения требуется авторизация на работном сайте',
                          type: 'error'
                        });
                      }
                    } else {
                      this.saveForm(
                        'form',
                        id == BUTTON.ID.SAVE_AND_DOWNLOAD ||
                          id == BUTTON.ID.PUBLISH
                      );
                    }
                  };

                  break;
                case BUTTON.ID.APPLY_FOR:
                  callback = () => this.getVacanciesForSelect();
                  break;
                case BUTTON.ID.SEND_PD:
                  callback = () => this.sendPD();
                  break;
                // case BUTTON.ID.SEND_QUESTIONNAIRE:
                //   callback = () => this.sendQuestionnaire();
                //   break;
                case BUTTON.ID.SAVE_RESUME:
                  callback = () => this.saveResume();
                  break;
                case BUTTON.ID.ADD_TAG:
                  callback = () => this.createTag();
                  break;
                case BUTTON.ID.CANCEL:
                  callback = () => this.$emit('reset-callback', 'form');
                  break;
                case BUTTON.ID.PREVIEW:
                  callback = () => this.preview();
                  break;
                case BUTTON.ID.SAVE_MEETING:
                  callback = () => {
                    this.form?.email_switcher == '' ||
                    this.form?.email_switcher == '0'
                      ? this.saveForm(
                          'form',
                          id == BUTTON.ID.SAVE_AND_DOWNLOAD ||
                            id == BUTTON.ID.PUBLISH
                        )
                      : this.handleMeetingWithEmail();
                  };
                  break;

                default:
                  break;
              }

              break;

            case BUTTON.TYPE.PARENT:
            default:
              break;
          }

          if (custom_display) {
            store.commit('common/setParam', {
              name: 'customButtons',
              param: id,
              val: btn
            });
          }

          if (callback) {
            this.$set(btn, 'callback', callback);
          }
          // как идея с помощью личного параметра контролировать через стор состояние загрузки:
          // this.$set(btn, 'loading', false);

          if (visibility && visibility === BUTTON.PARAM.DISABLED && !child) {
            this.$set(btn, 'disabled', true);
          }

          // учитываем структуру с глубокой вложенностью кнопок
          if (child && child.length) {
            this.setButtonsData(btn.child);
          }
        }
      });
    },
    handleMeetingWithEmail() {
      //проверям все ли поля заполнены в обычной форме
      const meetingForm = this.$refs.form;
      let errorFields = this.getErrorValidFields(meetingForm);
      if (errorFields.length) {
        scrollToError(errorFields);
      }
      const mainFormHasErrors = errorFields.length;
      //проверям все поля в форме отправки email-сообщения
      const emailForm = store.state.common.detachedEmailForm;
      errorFields = this.getErrorValidFields(emailForm);
      if (!mainFormHasErrors) {
        scrollToError(
          errorFields,
          document.getElementsByClassName('el-dialog__body')[0]
        );
      }
      const emailFormHasErrors = errorFields.length;
      //если ошибок нет, сохраняем обе формы
      if (!mainFormHasErrors && !emailFormHasErrors) {
        this.saveMeetingWithEmail(emailForm);
      }
    },
    async saveMeetingWithEmail() {
      this.loading = true;
      let params = this.defaultParams;
      const formData = new FormData();
      for (let key in this.form) {
        params[key] = this.form[key];
      }
      for (let key in params) {
        if (Array.isArray(params[key])) {
          params[key].forEach(element => {
            formData.append(`${key}[]`, element);
          });
        } else {
          formData.set(key, params[key]);
        }
      }

      const response = await postController({
        options: formData,
        params: {
          header: {
            'Content-Type': 'multipart/form-data'
          }
        }
      });

      if (response.data.status == 'ok') {
        this.$emit('saveEmailForm');
      } else {
        this.showErrorMessage(response.error);
        this.loading = false;
        return;
      }
    },
    getErrorValidFields(form) {
      form.validate();
      return form.fields
        .filter(field => field.isRequired && field.validateState == 'error')
        .map(field => field?.labelFor);
    },
    setSubpanelData(subpanels) {
      if (!subpanels) return;

      const filteredSubpanels = subpanels.panelColumn.map(col =>
        col
          .filter(tab => tab.visibility !== 'hidden')
          .map((tab, i) => ({ ...tab, lazy: i !== 0 }))
      );
      const loadedTabs = {};

      store.commit('subpanels/setSubpanels', filteredSubpanels);

      filteredSubpanels.forEach((panelCol, i) => {
        if (panelCol.length) {
          const col = { id: panelCol[0].id, loading: false };
          store.commit('subpanels/setActiveSubpanel', { i, data: col });
          panelCol.forEach(tab => {
            store.commit('subpanels/setLoadedTabs', {
              tab: tab.id,
              loaded: !tab.lazy
            });
            loadedTabs[tab.id] = !tab.lazy;
          });
        }
      });

      return { filteredSubpanels, loadedTabs };
    },
    setFieldsData(fields = {}, module) {
      // новые метаданные для detailView
      const formattedFields = { ...fields };
      const blockedFields = {};

      this.metaData.panels.forEach(panel => {
        panel.rows.forEach(field => {
          const { value, name, type, lbl } = field[0];

          if (!name && !lbl) return;

          const blocked = fields[name].blocked;
          let formattedVal =
            value && Array.isArray(value)
              ? value.map(v => mixin.methods.formatHtml(v))
              : mixin.methods.formatHtml(value);

          if (type === FIELD.TYPE.DECIMAL || type === FIELD.TYPE.CURRENCY) {
            formattedVal = formattedVal
              ? Number(formattedVal.split('.')[0])
              : formattedVal;
          }

          if (type == FIELD.TYPE.BOOL && blocked && Array.isArray(blocked)) {
            blockedFields[name] = [...blocked];
          }
          formattedFields[name] = {
            ...fields[name],
            value: formattedVal
          };
        });
      });

      // параметр для отслеживания родительского bool-поля
      Object.values(blockedFields).forEach(
        (name, i) =>
          (formattedFields[name].parent_field = Object.keys(blockedFields)[i])
      );

      store.commit(`${module}/setFields`, { ...formattedFields });
      store.commit(`${module}/setParam`, {
        name: 'metaData',
        val: this.metaData
      });
    },
    setDeepMenu(...params) {
      // формирование структуры многоуровневого меню для el-menu, поддерживаемой ui-библиотекой
      function isObject(val) {
        return typeof val === 'object';
      }
      const labels = {};
      const levels = {};
      const setOpt = (obj, targetObj = null, iterationNum = 0, level = 1) => {
        for (let key in obj) {
          const target = targetObj || {}; // || this.contactOpts;
          const prevLevel = level - 1;

          ++iterationNum;
          levels[level] = prevLevel
            ? `${levels[prevLevel]}-${iterationNum}`
            : `${level}-${iterationNum}`;

          if (isObject(obj[key])) {
            target[levels[level]] = {
              title: obj[key].name,
              submenu: {}
            };

            setOpt(obj[key].list, target[levels[level]].submenu, 0, level + 1);
          } else {
            labels[key] = obj[key];
            target[levels[level]] = {
              title: obj[key],
              type: key
            };
          }
        }
      };

      setOpt(...params);
      return labels;
    },
    setCommunications(cValue, option = null) {
      if (!option) return;
      const labels = this.setDeepMenu(option.value_type_list || {});

      // обработка данных средств связи
      cValue.forEach((contact /*, idx*/) => {
        const { id, value, value_type } = contact;
        if (value) {
          const { label, /*icon,*/ htmlType } = setContactData(
            value_type,
            null,
            labels[value_type] || ''
          );
          contact.label = label;
          // contact.icon = icon;
          contact.htmlType = htmlType;
          this.$set(this.form, id, mixin.methods.formatHtml(value));
        }
      });
    },
    processMetadata() {
      if (this.metaData) {
        this.setButtonsData(this.metaData.buttons_menu);
        // this.setSubpanelData(this.metaData.subpanels);
        this.metaData.panels.forEach(item => {
          const { panelColumn } = item;
          // временно, потом убрать условие:
          if (panelColumn) {
            panelColumn.forEach(panel => {
              this.iterateRows(panel);
            });
          } else {
            this.iterateRows(item);
          }
        });

        if (this.metaData.custom_panels) {
          this.metaData.custom_panels.forEach(item => {
            const { panelColumn } = item;
            // временно, потом убрать условие:
            if (panelColumn) {
              panelColumn.forEach(panel => {
                if (Array.isArray(panel) && panel.rows) {
                  this.iterateRows(panel);
                }
              });
            } else {
              this.iterateRows(item);
            }
          });
        }

        // if (this.form.location_id) {
        //   this.filterCities();
        // }
      }
    },
    iterateRows(panel) {
      panel.rows?.forEach(row => {
        const fields = row.fields || row;
        fields.forEach(field => {
          if (!field.name) return;

          const {
            name,
            id_name,
            value,
            default: defaultVal,
            front_field_type,
            type,
            option,
            options,
            fields,
            fields_arr,
            isMultiSelect,
            multiple,
            blocked,
            visibility,
            buttons,
            visual_type,
            visual_value,
            quick_create
          } = field;
          const isMultiple = multiple || isMultiSelect;
          const communication = type === FIELD.TYPE.COMMUNICATION;
          const conditionVal = isMultiple || communication ? [] : '';
          const defaultValue = defaultVal || conditionVal;

          if (type === FIELD.TYPE.GROUP && fields) {
            fields.forEach(subfield => {
              const {
                name,
                option,
                options,
                value,
                type,
                blocked,
                buttons,
                id_name,
                default: defaultVal,
                multiple,
                visual_type,
                visual_value
              } = subfield;

              if (type === FIELD.TYPE.DECIMAL || type === FIELD.TYPE.CURRENCY) {
                this.$set(
                  this.form,
                  name,
                  value ? Number(value.split('.')[0]) : value
                );
              } else if (
                (type == FIELD.TYPE.DATE || type == FIELD.TYPE.DATETIME) &&
                this.datepicker?.dateFormat
              ) {
                this.$set(
                  this.form,
                  name,
                  this.formatDate(value, this.datepicker.dateFormat)
                );
              } else if (type === FIELD.TYPE.INT) {
                this.$set(this.form, name, +value.replace(/\s*/g, ''));
              } else if (visual_type == FIELD.VISUAL_TYPE.TIMEPICKER) {
                this.$set(this.form, name, value.split(' ')[1]);
              } else {
                this.$set(
                  this.form,
                  name,
                  this.formatHtml(value || defaultVal || value)
                );
              }

              if (visibility === FIELD.PARAM.DISABLED) {
                this.$set(
                  subfield,
                  FIELD.PARAM.VISIBILITY,
                  FIELD.PARAM.DISABLED
                );
              }

              if (buttons) {
                this.setButtonsData(buttons);
              }

              this.setValidation(subfield, fields_arr);
              if (visual_type !== FIELD.VISUAL_TYPE.ENUM) {
                this.setOptions(option || options, name, type);
              }
              this.setBlocked(blocked, value, id_name || name, multiple);

              if (fields_arr && this.blocked[name]) {
                this.$set(
                  this.form,
                  name,
                  Array.isArray(this.form[name]) ? [] : ''
                );
              }

              if (visual_value && type == FIELD.TYPE.RELLINK) {
                this.setOptions(visual_value, name, type);
              } else if (
                visual_value &&
                type == FIELD.TYPE.RELATE &&
                !!visual_value.name &&
                !!visual_value.id &&
                visual_type !== FIELD.VISUAL_TYPE.ENUM
              ) {
                this.setOptions(
                  { [visual_value.id]: visual_value.name },
                  name,
                  type
                );
              }

              // if (this.module === MODULE.VACANCY_MODULE) {
              //   // убрать эту настройку для попапа, если сделаем crm-ный попап на карточку шаблона
              //   this.setSubfieldParam(name, row.length);
              // }
            });
          } else {
            const textType = this.textType(type);

            const fieldVal =
              type === FIELD.TYPE.MULTIENUM && value && typeof value == 'number'
                ? String(value)
                : typeof value == 'string' &&
                  value &&
                  type === FIELD.TYPE.MULTIENUM
                ? value.replace(/\^/g, '').split(',')
                : visual_type == FIELD.VISUAL_TYPE.TIMEPICKER
                ? value.split(' ')[1]
                : type === FIELD.TYPE.INT
                ? +value.replace(/\s*/g, '')
                : textType
                ? this.formatHtml(value)
                : type === FIELD.TYPE.MULTIARRAY && value.length
                ? value.map(({ id_language, level }) => ({
                    id_language: String(id_language),
                    level: String(level)
                  }))
                : (type == FIELD.TYPE.DATE || type == FIELD.TYPE.DATETIME) &&
                  this.datepicker?.dateFormat
                ? this.formatDate(value, this.datepicker.dateFormat)
                : type == FIELD.TYPE.BOOL
                ? String(+value || +defaultValue)
                : this.formatHtml(value || defaultValue);

            if (
              type == FIELD.TYPE.RELLINK &&
              Array.isArray(value) &&
              value[0] != ''
            ) {
              this.$set(this.form, name, fieldVal);
            } else if (
              type != FIELD.TYPE.RELLINK ||
              (type == FIELD.TYPE.RELLINK && !Array.isArray(value))
            ) {
              this.$set(this.form, name, fieldVal);
            }

            this.setValidation(field, fields_arr);
            if (visual_type !== FIELD.VISUAL_TYPE.ENUM) {
              this.setOptions(option || options, name, type);
            }
            this.setBlocked(blocked, value, id_name || name, multiple);

            if (fields_arr && this.blocked[name]) {
              this.$set(
                this.form,
                name,
                Array.isArray(this.form[name]) ? [] : ''
              );
            }

            if (visual_value && type == FIELD.TYPE.RELLINK) {
              this.setOptions(visual_value, name, type);
            } else if (
              visual_value &&
              type == FIELD.TYPE.RELATE &&
              !!visual_value.name &&
              !!visual_value.id &&
              visual_type !== FIELD.VISUAL_TYPE.ENUM
            ) {
              this.setOptions(
                { [visual_value.id]: visual_value.name },
                name,
                type
              );
            }

            if (quick_create) {
              getController({
                url: `/index.php?module=HRPAC_VACANCY&action=check_access&field_name=${name}&to_pdf=true`
              })
                .then(resp => {
                  if (resp.data && typeof resp.data.data != 'string') {
                    store.commit('common/setConfig', {
                      ...store.state.common.config,
                      createOptionAccess: {
                        [name]: !!resp.data.data
                      }
                    });
                  } else throw new Error(resp?.data?.data);
                })
                .catch(err => {
                  this.catchError(
                    err,
                    'Возникла ошибка при проверке доступа создания записи в справочнике',
                    'error access to create'
                  );

                  store.commit('common/setConfig', {
                    ...store.state.common.config,
                    createOptionAccess: { [name]: false }
                  });
                });
            }

            // if (
            //   this.module === MODULE.VACANCY_MODULE &&
            //   row.fields.length > 1
            // ) {
            //   // убрать эту настройку для попапа, если сделаем crm-ный попап на карточку шаблона
            //   this.setSubfieldParam(name, row.fields.length);
            // }
          }

          if (this.skillFields && front_field_type) {
            this.skillFields.push(name);
          }

          if (id_name) {
            const { name, value, default: defaultVal } = id_name;
            this.$set(
              this.form,
              name,
              this.formatHtml(value || defaultVal || value)
            );
            this.setBlocked(blocked, value, id_name, multiple); // id_name || name
          }

          if (buttons) {
            this.setButtonsData(buttons);
          }

          if (communication && value && Array.isArray(value)) {
            this.setCommunications(value, option);
          }
        });
      });
    }
  }
};

// обновление без перезагрузки определенных компонентов
export const update = {
  // computed: {
  //   activeTabs() {
  //     return store.getters['subpanels/getActiveSubpanels'];
  //   }
  // },
  methods: {
    updateSubpanels(tabs) {
      // учесть что обращение в стор может быть к разным модулям или к единому (subpanels)
      const tabs_arr = Array.isArray(tabs) ? tabs : [tabs];
      const loadedTabs = store.state.subpanels.loadedTabs;
      tabs_arr.forEach(tab => {
        if (loadedTabs[tab]) {
          // возможно потом вынести в общий store модуль:
          store.commit('subpanels/updateActiveSubpanel', tab);
        }
      });
    }
  }
};

export const form = {
  methods: {
    handleScroll(evt, el) {
      if (window.scrollY > SCROLL_VALUE) {
        el.classList.add('scroll');
      } else {
        el.classList.remove('scroll');
      }
    },
    selectType(type) {
      return (
        type === FIELD.TYPE.RELATE ||
        type === FIELD.TYPE.RELLINK ||
        type === FIELD.TYPE.ENUM ||
        type === FIELD.TYPE.MULTIENUM ||
        type === FIELD.TYPE.CURRENCY_ID
      );
    },
    dateType(type) {
      return (
        type === FIELD.TYPE.DATE ||
        type === FIELD.TYPE.DATETIME ||
        type === FIELD.TYPE.DATETIMECOMBO
      );
    },
    textType(type) {
      return (
        type === FIELD.TYPE.TEXT ||
        type === FIELD.TYPE.WYSIWYG ||
        type === FIELD.TYPE.EMAILBODY
      );
    },
    hidden(field) {
      return (
        field.hasOwnProperty(FIELD.PARAM.VISIBILITY) &&
        field.visibility === FIELD.PARAM.HIDDEN
      );
    },
    disabled(field) {
      return (
        field.hasOwnProperty(FIELD.PARAM.VISIBILITY) &&
        field.visibility === FIELD.PARAM.DISABLED
      );
    },
    switcherField(field) {
      return field.type === FIELD.TYPE.BOOL && field.visual_type == 'switcher';
    },
    isEmptyField(field, value) {
      const hasNoValue = Array.isArray(value)
        ? !value.length
        : field.type == 'currency' || field.type == 'decimal'
        ? !Number(value)
        : !value || !String(value).trim();

      return field.required && hasNoValue;
    },
    fieldColumnClass(row, item, index) {
      if (row.length == 1 || item.type === FIELD.TYPE.IMAGE) {
        return `${this.prefixClass}-form__section-row`;
      } else if (item.type) {
        return [
          `${this.prefixClass}-form__section-column`,
          index == 0
            ? `${this.prefixClass}-form__section-column--left`
            : `${this.prefixClass}-form__section-column--right`
        ];
      }
    },
    // fieldRowClass(row, item) {
    // if (row.length == 1 || item.type === FIELD.TYPE.IMAGE) {
    //   console.log('onecolumn');
    //   return 'onecolumn';
    // }
    // return type === FIELD.TYPE.IMAGE ? '' : 'el-form-item row';
    // },
    setOptions(opt, name, type) {
      if (type == FIELD.TYPE.RADIOBUTTON || type == FIELD.TYPE.LANGUAGE_LEVEL)
        return;

      if (opt) {
        let options = Array.isArray(opt) ? opt : [];

        if (!opt.hasOwnProperty('length')) {
          for (let key in opt) {
            if (opt[key] && !opt[key].hasOwnProperty('length')) {
              const val =
                type && type === FIELD.TYPE.CURRENCY_ID
                  ? opt[key].symbol
                  : FIELD.VISUAL_TYPE.SUB_RADIO ||
                    FIELD.VISUAL_TYPE.SUB_CHECKBOX
                  ? opt[key].category
                  : opt[key].name;
              options.push({ id: key, name: val });
            } else {
              options.push({ id: key, name: this.formatHtml(opt[key]) });
            }
          }
        } else if (Array.isArray(opt)) {
          if (opt.filter(i => i.constructor.name == 'Object').length > 0) {
            options = opt.map(i => ({ ...i, name: this.formatHtml(i.name) }));
          } else {
            options = opt;
          }
        }

        this.$set(
          this.options,
          name,
          type != FIELD.TYPE.ENUM ? this.sortNameByAZ(options) : options
        );
      }
    },
    sortNameByAZ(list) {
      if (!list || !Array.isArray(list)) return;

      if (list.some(i => i.hasOwnProperty('name') && !i.name)) return list;
      else return list.sort((a, b) => a.name.localeCompare(b.name));
    },
    setBlocked(blocked, value, name, multiple = false) {
      if (blocked && Array.isArray(blocked)) {
        blocked.forEach(key => {
          if (this.fields[name]?.type == FIELD.TYPE.BOOL) {
            this.$set(this.blocked, key, !Number(value));
            this.$set(this.form, key, Array.isArray(value) ? [] : '');
          }
        });
      } else if (blocked && isPlainObject(blocked)) {
        for (let key in blocked) {
          const values = blocked[key];
          const idFieldVal = this.form[name];
          this.$set(this.blocked, key, !values.includes(idFieldVal));

          if (!values.includes(idFieldVal)) {
            this.$set(this.form, key, multiple ? [] : '');
          }
        }
      }
    },
    setValidation(field, range) {
      const { required, name, validation, type } = field;
      this.setRequiredFields(required, name);

      if (validation && validation.rules && range) {
        const { target, rules } = validation;

        if (!this.fields[target]) return;

        const sourceIdx = range.findIndex(i => i === name);
        const targetIdx = range.findIndex(i => i === target);
        const min =
          Math.min(sourceIdx, targetIdx) === sourceIdx
            ? { [name]: rules }
            : { [target]: this.fields[target].validation.rules };
        const max =
          Math.max(sourceIdx, targetIdx) === sourceIdx
            ? { [name]: rules }
            : { [target]: this.fields[target].validation.rules };

        const rangeRules = {
          validator: (rule, value, callback) => {
            this.validateNumberRange(required, value, callback, {
              ...min,
              ...max
            });
          },
          trigger: 'blur'
        };
        const rule = this.rules[name]
          ? [...this.rules[name], rangeRules]
          : [rangeRules];
        this.$set(this.rules, name, rule);
        this.$set(this.fields[name], 'trigger', target);
      }

      if (type === FIELD.TYPE.URL) {
        const urlRules = {
          validator: (rule, value, callback) => {
            const regexp = /^(https?:\/\/)/i;
            if (value && !regexp.test(value)) {
              callback(new Error('Введен некорректный URL адрес'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        };
        this.$set(this.rules, name, urlRules);
      }
    },
    setFieldValue(name, val, blocked, formName = 'form') {
      this.$set(this.form, name, val);

      if (this.fields[name]?.trigger) {
        // для полей-диапазонов
        this.handleChangeRange(name, this.fields[name].trigger, 'form');
      } else if (this.$refs[formName]) {
        this.$refs[formName].validateField(name);
      }

      const checkBlocked = (name, val, blocked) => {
        if (this.fields[name] && this.fields[name].type == FIELD.TYPE.VARCHAR)
          return;
        if (blocked && Array.isArray(blocked)) {
          if (this.fields[name].type !== FIELD.TYPE.BOOL) {
            blocked.forEach(key => {
              const updateBlockedFields = name => {
                if (val.length == 1) {
                  this.$delete(this.blocked, name);
                } else {
                  this.$set(this.blocked, name, true);
                  this.$set(this.form, name, this.fields[name].default || '');
                }

                if (this.fields[name].blocked) {
                  checkBlocked(
                    name,
                    this.form[name],
                    this.fields[name].blocked
                  );
                }
              };

              if (typeof key !== 'object') {
                updateBlockedFields(key);
              }
            });
          } else {
            // для связи с булевыми полями
            blocked.forEach(key => {
              if (!Number(val) && !this.fields[key].visibility == 'disabled') {
                this.$set(this.form, key, '');
              }
              this.$set(this.blocked, key, !Number(val));
            });
          }
        } else if (blocked && isPlainObject(blocked)) {
          for (let key in blocked) {
            const values = blocked[key];
            this.$set(this.blocked, key, !values.includes(val));

            if (!values.includes(val)) {
              this.$set(this.form, key, this.fields[key].multiple ? [] : '');
              this.$refs[formName].validate();
            }
          }
        }
      };

      checkBlocked(name, val, blocked);

      if (name == 'date_start' || name == 'date_end') {
        this.handleChangeRange('date_start', 'date_end', 'form');
        this.$emit('update-time', name, val);

        if (
          this.fields[name]?.validation?.rules == '<' ||
          this.fields[name]?.validation?.rules == '<='
        ) {
          let hours = val.split(':')[0];
          const minutes = val.split(':')[1];
          const nextHour = String(+hours + 1);
          hours = hours != 23 ? (nextHour < 10 ? '0' : '') + nextHour : '00';
          this.$set(
            this.form,
            this.fields[name]?.validation.target,
            hours + ':' + minutes
          );
          this.$emit(
            'update-time',
            this.fields[name]?.validation.target,
            hours + ':' + minutes
          );
        }
      }

      if (name == 'date_event') {
        this.$emit('update-time', name, val);
      }

      if (this.module == 'HRPAC_COORDINATION_REQUESTS') {
        this.addToCash(this.form);
      }
    },
    async addToCash(form) {
      try {
        const formData = new FormData();
        formData.set('module', 'HRPAC_COORDINATION_REQUESTS');
        formData.set('action', 'save_in_cache');
        formData.set('form', JSON.stringify(form));

        await postController({ options: formData });
      } catch (err) {
        console.error(err);
      }
    },
    changeOption(name, idField = {}, option, formName = 'form') {
      if (name && option) {
        this[formName][idField.name] = option.id;

        if (this.fields[name]?.blocked) {
          this.setBlocked(this.fields[name].blocked, null, idField);
        }
      }

      if (
        name === FIELD.ID.EMAILS_EMAIL_TEMPLATES_NAME ||
        name === FIELD.ID.HRPAC_VACANCY_TEMPLATE_NAME
      ) {
        this.selectTemplate(this[formName][idField.name]);
      }

      if (
        name === FIELD.ID.SUBDIVISION_NAME ||
        name === FIELD.ID.REASON_FOR_OPENING
      ) {
        const subdivisionId =
          name === FIELD.ID.SUBDIVISION_NAME
            ? this[formName][idField.name]
            : this[formName][FIELD.ID.SUBDIVISION_ID];
        const reasonForOpeningId =
          name === FIELD.ID.REASON_FOR_OPENING
            ? this[formName][idField.name]
            : this[formName][FIELD.ID.REASON_FOR_OPENING_ID];
        this.selectDivision(name, subdivisionId, reasonForOpeningId);
      }

      if (name === FIELD.ID.MANNING_TABLE_NAME) {
        this.updateVacancyName(this[formName][idField.name]);
      }
    },
    clearFields(exceptFields = []) {
      for (let field in this.form) {
        if (exceptFields.indexOf(field) == -1) {
          if (Array.isArray(this.form[field])) {
            this.$set(this.form, field, []);
          } else if (typeof this.form[field] == 'number') {
            this.$set(this.form, field, field == 'amount' ? 1 : 0);
          } else if (typeof this.form[field] == 'object') {
            this.$set(this.form, field, {});
          } else if (typeof this.form[field] == 'string') {
            this.$set(this.form, field, '');
          }
        }
      }
      this.addToCash(this.form);
    },
    formatSalary(val, key, precision = 2) {
      this.setFieldValue(key, Number(val).toFixed(precision));
    }
    // filterCities() {
    //   // упорядочиваем список городов, две столицы - в топ списка
    //   if (this.options.location_id) {
    //     const cities = this.options.location_id;
    //     const thisCity = this.form.location_id;
    //     cities.sort((a, b) => a && b ? a.name.localeCompare(b.name) : null);
    //     const priorityCities = [CITIES.SPB_CITY, CITIES.MSK_CITY];
    //     if (
    //       !priorityCities.filter(city => !thisCity || city === thisCity).length
    //     ) {
    //       priorityCities.push(thisCity);
    //     }
    //     priorityCities.forEach(city => {
    //       const idx = cities.findIndex(({ name }) => name && name == city);
    //       if (idx == -1) return;
    //       const movedCity = cities.filter(({ name }) => name == city)[0];
    //       cities.splice(idx, 1);
    //       cities.unshift(movedCity);
    //     });
    //   }
    // }
  }
};

export const saveForm = {
  methods: {
    formDefaultParams(module, id) {
      return {
        module: module,
        record: id || '',
        action: ACTION.SAVE,
        jsqon_return: 1
      };
    },
    async saveForm(formName = 'form', specialParam = false) {
      let validateStatus = false;
      const defaultParams = this.defaultParams
        ? this.defaultParams
        : this.formDefaultParams(this.module, this.fields.id.value);

      const sendForm = async () => {
        if (this.requestSent) return;

        this.requestSent = true;

        const formData = new FormData();
        const form = { ...defaultParams, ...this.form };
        const params = {};

        for (let key in form) {
          if (
            this.fields.hasOwnProperty(key) ||
            defaultParams[key] ||
            key === FIELD.ID.RECOGNITION_RESUME_ID
          ) {
            if (Array.isArray(form[key])) {
              if (key === FIELD.ID.COMMUNICATIONS) {
                if (this.form.communications.length) {
                  this.form.communications.forEach((item, idx) => {
                    const contact = {
                      value_type: item.value_type,
                      value: item.value,
                      sort: idx, // меняем его
                      id: item.id || ''
                    };
                    for (let key in contact) {
                      const prop = `${FIELD.ID.COMMUNICATIONS}[${idx}][${key}]`;
                      formData.set(prop, contact[key]);
                    }
                  });
                } else {
                  formData.set(FIELD.ID.COMMUNICATIONS, []);
                }
              } else if (key === FIELD.ID.DETAIL_EXPERIENCE) {
                if (this.form.detail_experience.length) {
                  this.form.detail_experience.forEach(item => {
                    item.fields.forEach(field => {
                      const detail = {
                        [field.name]: field.value
                      };
                      for (let key in detail) {
                        const prop = `${'detail_experience'}[${
                          item.id
                        }][${key}]`;
                        formData.set(prop, detail[key]);
                      }
                    });
                  });
                } else {
                  formData.set('detail_experience', []);
                }
              } else if (key === 'selection_stage_actions') {
                if (this.form.selection_stage_actions.length) {
                  this.form.selection_stage_actions.forEach((item, idx) => {
                    for (let key in item) {
                      const prop = `${'selection_stage_actions'}[${idx}][${key}]`;
                      formData.append(prop, item[key]);
                    }
                  });
                } else {
                  formData.append('selection_stage_actions', []);
                }
              } else if (
                key === FIELD.ID.EDUCATION &&
                this.fields[key].type != FIELD.TYPE.ENUM
              ) {
                if (this.form.education.length) {
                  this.form.education.map(item => {
                    item.fields.forEach(field => {
                      const education = {
                        [field.name]: field.value
                      };
                      for (let key in education) {
                        const prop = `${'education'}[${item.id}][${key}]`;
                        formData.set(prop, education[key]);
                      }
                    });
                  });
                } else {
                  formData.set('education', []);
                }
              } else if (key === FIELD.ID.LANGUAGE) {
                if (this.form.language_proficiency.length) {
                  this.form.language_proficiency.map(item => {
                    item.fields.forEach(field => {
                      const language = {
                        [field.name]: field.value
                      };
                      for (let key in language) {
                        const prop = `${'language_proficiency'}[${
                          item.id
                        }][${key}]`;
                        formData.set(prop, language[key]);
                      }
                    });
                  });
                } else {
                  formData.set('language_proficiency', []);
                }
              } else if (key == FIELD.ID.QUALIFICATION) {
                if (this.form.skills_training.length) {
                  this.form.skills_training.map(item => {
                    item.fields.forEach(field => {
                      const qualification = {
                        [field.name]: field.value
                      };
                      for (let key in qualification) {
                        const prop = `${'skills_training'}[${item.id}][${key}]`;
                        formData.set(prop, qualification[key]);
                      }
                    });
                  });
                } else {
                  formData.set('skills_training', []);
                }
              } else if (
                this.fields[key] &&
                this.fields[key].type == FIELD.TYPE.MULTIENUM
              ) {
                formData.set(key, form[key] ? form[key].join(',') : '');
              } else {
                if (
                  !form[key].length &&
                  this.defaultParams?.module !== MODULE.HRPAC_EVENT
                ) {
                  params[`${key}[]`] = '';
                } else {
                  params[key] = form[key];
                }
              }
            } else if (key === FIELD.ID.PHOTO && this.photo_file.length) {
              const { raw: blob, name } = this.photo_file[0];
              formData.set('photo_file', blob, name);
            } else if (
              this.fields[key] &&
              this.fields[key].type == FIELD.TYPE.DATETIME &&
              this.fields[key].visual_type == FIELD.VISUAL_TYPE.TIMEPICKER
            ) {
              const dateField =
                this.form[this.fields[key]?.validation?.parent] || '';
              formData.set(key, `${dateField} ${form[key]}`);
            } else {
              const keyName =
                this.fields[key] && this.fields[key].ajax_param_name
                  ? this.fields[key].ajax_param_name
                  : key;
              const options =
                this.fields[key] &&
                (this.fields[key].option ||
                  this.fields[key].options ||
                  this.options[key] ||
                  []);
              const keyValue =
                this.fields[key] &&
                this.fields[key].visual_type == FIELD.VISUAL_TYPE.ENUM
                  ? options
                      .filter(({ id }) => id === form[key])
                      .map(({ name }) => name)[0]
                  : form[key];
              formData.set(keyName, keyValue || '');
            }
          } else {
            formData.set(key, form[key] || '');
          }

          if (this.fields[key]?.blocked) {
            if (
              Array.isArray(this.fields[key].blocked) &&
              this.fields[key].blocked.some(
                fld => this.fields[fld].type == 'bool'
              )
            ) {
              this.fields[key].blocked.forEach(fld => {
                if (this.fields[fld].type == 'bool') {
                  formData.set(fld, form[key] ? '1' : '0');
                }
              });
            } else if (
              !Array.isArray(this.fields[key].blocked) &&
              this.fields[key].type == 'bool'
            ) {
              formData.set(this.fields[key].blocked, form[key] ? '1' : '0');
            }
          }
        }

        // обработка прикрепленных файлов в формах
        if (
          this.files &&
          Array.isArray(this.files) &&
          this.defaultParams.module == MODULE.EMAILS
        ) {
          this.files.forEach(file => {
            const { raw: blob, name } = file;
            if (file.type == 'template' || file.type == 'forward') {
              formData.append('template_attachment[]', file.id);
            } else if (file.type == 'removed') {
              formData.append('temp_remove_attachment[]', file.id);
            } else {
              formData.append('email_attachment[]', blob, name);
            }
          });
        }

        this.loading = true;
        if (defaultParams.module == MODULE.HRPAC_PUBLISHED_VACANCY) {
          return true;
        }

        try {
          const response = await postController({
            options: formData,
            params: {
              header: {
                'Content-Type': 'multipart/form-data'
              },
              params
            }
          });

          const error = response.data.errors || response.data.error;
          if (error) {
            if (Array.isArray(error)) {
              error.forEach(err => errorMsg.methods.showErrorMessage(err));
            } else {
              errorMsg.methods.showErrorMessage(error);

              if (this.isEmailForm) {
                this.$emit('savedFormData');
              }
              return;
            }
          }

          if (mixin.computed.urlParams().action === 'EditView') {
            const newId = response.data.id;
            if (
              mixin.computed.urlParams().module == 'HRPAC_COORDINATION_REQUESTS'
            ) {
              window.location.replace(
                `/index.php?module=HRPAC_COORDINATION_PLANS&action=DetailView&record=${newId}`
              );
            } else {
              window.location.replace(detailView(this.module, newId));
            }
          } else if (this.formView === 'popup') {
            if (response.data.reboot) location.reload();

            if (
              this.type &&
              (this.type === 'offer' || this.type === 'employee-exit')
            ) {
              console.log('type', this.type);
              if (specialParam) {
                const docId = response.data.document_id;
                this.downloadFile(
                  `index.php?entryPoint=download&id=${docId}&type=Documents`
                );
              }
            }

            this.requestSent = false;
            this.$emit('savedFormData');
          }
        } catch (err) {
          if (defaultParams.module == MODULE.HRPAC_PUBLISHED_VACANCY) {
            errorMsg.methods.showNotification({
              offset: 80,
              showClose: true,
              message: 'Проверьте заполнение обязательных полей',
              duration: 15000,
              type: 'error'
            });
          } else {
            mixin.methods.catchError(
              err,
              'Возникла ошибка отправки данных формы. Попробуйте еще раз.',
              'save form'
            );
          }
        } finally {
          this.requestSent = false;
          this.loading = false;
        }
      };

      // проверка валидации в обособленных формах
      const detachedForms = store.state.common.detachedForm;

      if (
        detachedForms &&
        Object.keys(detachedForms.fields).some(name => this.fields[name])
      ) {
        store.commit('common/setDetachedFormMode', true);

        const valid = Object.values(detachedForms.validateStatus).every(
          valid => valid
        );
        if (!valid) return;

        for (let name in detachedForms.fields) {
          this.$set(this.form, name, detachedForms.fields[name]);
        }
      }

      return await new Promise((resolve, reject) => {
        this.$refs[formName].validate(async (valid, fields) => {
          validateStatus = true;

          if (valid) {
            await sendForm();
            await resolve(valid);
          } else {
            const errorFields = Object.keys(fields).map(
              field => this.fields[field]
            );
            const wrapperEl =
              this.$refs[formName].$el.closest(
                '.dialog--scrollable .el-dialog__body'
              ) ||
              this.$refs[formName].$el.closest('.dialog') ||
              window;
            scrollToError(
              errorFields,
              wrapperEl,
              defaultParams.module == MODULE.HRPAC_PUBLISHED_VACANCY
                ? `#pane-${specialParam}`
                : null
            );

            reject(valid);
          }
        });

        if (!validateStatus) {
          // доп. кейс, если функция валидации не срабатывает
          let success = this.$refs[formName].fields
            .filter(field => field.isRequired)
            .every(
              field => field.fieldValue && field.validateState !== 'error'
            );

          if (success) {
            sendForm();
            resolve(success);
          } else {
            const errorFields = this.$refs[formName].fields
              .filter(field => field.isRequired)
              .every(
                field => field.fieldValue || field.validateState == 'error'
              )
              .map(({ field }) => this.fields[field]);

            scrollToError(errorFields);
            reject(success);
          }
        }

        store.commit('common/setDetachedFormMode', false);
      });
    }
  }
};

export const stage = {
  methods: {
    stagesLength(stages) {
      if (stages.hasOwnProperty('length')) {
        return stages.length;
      } else {
        return Object.keys(stages).length;
      }
    },
    isLimited(stage, currentStage, stages) {
      if (!stage || !currentStage) return;
      const stagesCount = this.stagesLength(stages);
      const requiredStages = Object.values(stages).filter(
        item =>
          item.required_stage == 'required' &&
          item.required_position === 'required_bottom' &&
          item.sort != stagesCount
      );

      if (
        currentStage.required_position !== 'required_bottom' ||
        (currentStage.sort == stagesCount && currentStage.required_stage)
      ) {
        const [, ...notFirstStage] = requiredStages;
        const hasStage = notFirstStage.filter(i => i.id === stage.id).length;
        return !!hasStage;
      } else {
        const acceptStage = requiredStages[requiredStages.length - 1];
        if (
          currentStage.sort === acceptStage.sort &&
          currentStage.required_stage
        ) {
          return true;
        } else {
          const sortIndex = String(Number(currentStage.sort) + 2);
          const hasStage = requiredStages.filter(i => i.id === stage.id).length;

          return Number(stage.sort) >= Number(sortIndex) && !!hasStage;
        }
      }
    },
    isAcceptStage(stage, stages) {
      if (!stage) return;
      return (
        stage.required_position === 'required_bottom' &&
        stage.sort == this.stagesLength(stages) - 1
      );
    },
    isRejectStage(stage, stages) {
      if (!stage) return;
      return (
        stage.required_position === 'required_bottom' &&
        stage.sort == this.stagesLength(stages)
      );
    }
  }
};

export const errorMsg = {
  methods: {
    showNotification(data = {}) {
      Message(data);
    },
    showFullNotification(data = {}) {
      Notification(data);
    },
    showErrorMessage(errors, params = {}) {
      if (!errors) return;

      const showError = (err, data = {}) => {
        const errObj = this.errorText(err.message || err.title || err, data);
        this.showNotification({
          offset: 80,
          showClose: true,
          message: errObj.msg,
          duration: 15000,
          type: errObj.type,
          customClass: errObj.className || ''
        });
      };

      if (Array.isArray(errors)) {
        errors.forEach(err => showError(err, params));
      } else {
        showError(errors, params);
      }
    },
    errorText(err, data = {}) {
      let obj = { msg: err, type: 'error', ...data };

      if (err === 'permission denied') {
        obj.msg =
          'У Вас нет доступа к данному действию. Свяжитесь с вашим системным администратором для получения соответствующих прав.';
      } else if (err === 'USERNAME_INVALID') {
        obj = {
          msg: 'Указан неверный логин Telegram. Попробуйте другой канал связи.',
          type: 'warning'
        };
      } else if (
        err === 'This peer is not present in the internal peer database' ||
        err == 'No user peer'
      ) {
        obj = {
          msg: 'Кандидат еще не зарегистрирован в Telegram. Попробуйте другой канал связи.',
          type: 'warning'
        };
      } else if (err === 'user has no telegram peer') {
        obj.msg =
          'Ошибка. Проверьте настройки синхронизации с Telegram в профиле';
      } else if (err === 'token error') {
        obj.msg = 'Ошибка токена';
      } else if (err === 'unknown error') {
        obj.msg =
          'Неизвестная ошибка! Вероятно, под Вашей учетной записью нельзя публиковать вакансии. Скорректируйте настройки учетной записи на работном сайте и повторите попытку.';
      } else if (err === 'token expired') {
        obj.msg = 'Токен просрочен';
      } else if (err === 'no or empty work_sites') {
        obj.msg = 'Не передан или пустой обязательный параметр work_sites';
      } else if (err === 'no or empty external_id') {
        obj.msg = 'Не передан или пустой обязательный параметр external_id';
      } else if (err === 'no or empty employer_id') {
        obj.msg = 'Не передан или пустой обязательный параметр employer_id';
      } else if (err === 'no or empty vacancy_id') {
        obj.msg = 'Не передан или пустой обязательный параметр vacancy_id';
      } else if (err === 'no or empty manager_id') {
        obj.msg = 'Не передан или пустой обязательный параметр manager_id';
      } else if (err === 'no or empty resume_id') {
        obj.msg = 'Не передан или пустой обязательный параметр resume_id';
      } else if (err === 'no vacancy found by this external_id') {
        obj.msg =
          'По переденному external_id не найден объект HRPAC_PUBLISHED_VACANCY';
      } else if (err === 'vacancy has no work_site') {
        obj.msg =
          'В найденном объекте HRPAC_PUBLISHED_VACANCY не указан work_site';
      } else if (err === 'unable to prolongate') {
        obj.msg = 'Невозможно пролонгировать опубликованную вакансию';
      } else if (err === 'method not available') {
        obj.msg = 'Метод не реализован или отсутствует для работного сайта';
      } else if (err === 'invalid external_id') {
        obj.msg =
          'переданный external_id (ссылка на вакансию) не соответствует формату выбранного работного сайта';
      } else if (err === 'invalid employer id') {
        obj.msg =
          'employer id импортируемой вакансии не соответствует employer id ни у одного авторизированного пользователя';
      } else if (err === 'no token') {
        obj.msg = 'На авторизационном сервисе нет токена';
      } else if (err === 'code exprired') {
        obj.msg = 'Истек срок годности code для авторизации';
      } else if (err === 'not found') {
        obj.msg = 'Не найдено (вакансия, резюме и т.д.)';
      } else if (err === 'validation error') {
        obj.msg = 'Переданы неверные параметры';
      } else if (err === 'access denied') {
        obj.msg = 'Ограничен доступ на совершение действия';
      } else if (err === 'app key required') {
        obj.msg = 'Необходимо передать ключ приложения';
      } else if (err === 'app not found') {
        obj.msg = 'Неверный ключ приложения';
      } else if (
        err === 'Path not found' ||
        err.split('\\').join('') ===
          'No sessions available. Call /system/addSession?session=%session_name% or restart server with --session option'
      ) {
        obj = {
          msg: 'Отсутствует настройка связи с Telegram. Создайте сессию в настройках профиля',
          type: 'warning'
        };
        setTimeout(() => this.showAuthForm(), 1000);
      } else if (err.indexOf('Session not found') > -1) {
        // err === 'Path not found' ||
        obj.msg =
          'Отсутствует настройка связи с Telegram. Пройдите повторную авторизацию';
        setTimeout(() => this.showAuthForm(), 1000);
      } else if (err === 'PHONE_NUMBER_INVALID') {
        obj.msg = 'Введите корректно номер телефона!';
        obj.className = 'el-message--telegram';
      } else if (err === 'AUTH_KEY_UNREGISTERED') {
        obj.msg =
          'Отсутствует настройка связи с Telegram. Пройдите повторную авторизацию';
        setTimeout(() => this.showAuthForm(), 1000);
      }
      return obj;
    }
  }
};

export const detailViewPage = {
  methods: {
    // getEnumFieldID(fieldName) {
    //   if (!this.fields[fieldName]) return null;

    //   const name = this.fields[fieldName].value;
    //   const options = this.fields[fieldName].options;
    //   return Object.keys(options).find(key => options[key] === name);
    // },
    getEnumFieldName(fieldName) {
      if (!this.fields[fieldName]) return null;

      const id = this.fields[fieldName].value;
      const options = this.fields[fieldName].options;
      return options[id];
    }
  }
};

// export const vuexMapFunc = {
//   methods: {
//     mapState(data = {}) {
//       // Пример вызова функции:
//       // ...this.mapState({
//       //   storePanelData: `candidate/hiddenPanelData/${this.id}`,
//       //   test1: 'candidate/test1'
//       // })

//       const keys = Object.keys(data);
//       const values = Object.values(data);
//       const funcs = {};

//       values.map((val, i) => {
//         const pathArr = val.split('/');
//         let storeVal = null;
//         pathArr.forEach(path => {
//           storeVal = storeVal ? storeVal[path] : store.state[path];
//         });
//         funcs[keys[i]] = storeVal;
//         console.log(storeVal)
//       });

//       return funcs;
//     }
//   }
// };
