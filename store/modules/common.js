import { postController, getController } from '@/controllers/request';
import { setContactData, randomNumber } from '@/utils/helpers';
import { Message } from 'element-ui';

const getIcon = name => {
  switch (name) {
    case 'Emails':
      return 'Mail';
    case 'HRPAC_NEW_EPLOYEE_EXIT':
      return 'document';
    case 'HRPAC_OFFERS':
      return 'document';
    case 'HRPAC_EVENT':
      return 'calendar';
    case 'HRPAC_CUSTOM_POPUP':
      return 'question';
    case 'CORPORATE_EMAIL':
      return 'mail_outgoing';

    default:
      return 'document';
  }
};

const getDefaultParams = item => {
  let params = {
    open: {},
    save: {}
  };
  //Добавляем дефолтные параметры для открытия
  item.open
    .split('?')[1]
    .split('&')
    .map(param => {
      if (param.split('=')[0] === 'action') {
        params.open.loadedAction = param.split('=')[1];
      }
      params.open[param.split('=')[0]] = param.split('=')[1];
    });
  // Добавляем дефолтные параметры для сохранения
  item.save
    .split('?')[1]
    .split('&')
    .map(param => {
      if (param.split('=')[0] === 'action')
        params.save.action = param.split('=')[1];
      params.save[param.split('=')[0]] = param.split('=')[1];
    });

  // Типы для скачивания файлов
  if (item.actions === 'HRPAC_NEW_EPLOYEE_EXIT')
    params.open.type = 'employee-exit';
  if (item.actions === 'HRPAC_OFFERS') params.open.type = 'offer';

  return params;
};

export default {
  namespaced: true,
  state: {
    backgroundResumeLoading: false,
    requestSent: false,
    config: {},
    pageConfig: {},
    selected: [],
    customButtons: {}, //обособленные кнопки из метаданных
    mod: {},
    visible_dialog: {
      confirm_close_dialog: {
        display: false,
        title: '',
        text: '',
        buttons: []
      },
      relation_dialog: false,
      stage_dialog: false,
      rejection_dialog: false,
      no_rejection_dialog: false,
      employee_exit_dialog: false,
      form_offer_dialog: false,
      send_mail_dialog: false,
      share_candidate_in_telegram_dialog: false,
      delete_dialog: false,
      security_dialog: false,
      add_contact_dialog: false,
      comment_dialog: false,
      selection_dialog: false,
      open_positions_dialog: false,
      cancel_positions_dialog: false,
      corporate_email_dialog: false,
      vacancies_popup: false,
      publicator_dialog: false,
      publicator_import_dialog: false,
      publicator_delete_dialog: false,
      publicator_auth_dialog: false,
      save_resume: false,
      preload_resume: false,
      mailings_conflict_dialog: false,
      publicator_refresh_dialog: false,
      scenario_dialog: true,
      admin_changes_dialog: false,
      admin_stages_dialog: false,
      candidate_import_dialog_single: false,
      candidate_import_dialog_multi: false,
      candidate_import_type_dialog: false,
      create_event_dialog: false,
      application_dialog: false,
      questionnaire_dialog: false,
      training_dialog: false,
      event_view_dialog: false,
      confirm_remove_meeting_dialog: false,
      search_column_edit_dialog: false,
      mass_save_resume_dialog: false,
      mass_save_resume_progress_dialog: false,
      mass_send_resume_dialog: false,
      export_resume_to_xls_dialog: false,
      candidate_general_dialog: false
    },
    detachedEmailForm: {},
    detachedForm: {
      // данные по обособленным формам
      fields: {
        detail_experience: [],
        communications: [],
        education: [],
        skills_training: [],
        language_proficiency: [],
        language_level: []
      },
      saveMode: false,
      validateStatus: {}
    },
    metaDialogLoaded: false, // проверка монтирования всех компонентов активного окна
    notifications: {},
    newOptions: {},
    generalStepsDialog: {
      loading: true,
      schema: {},
      steps: [],
      currentStep: {},
      stepKey: 0
    }
  },
  mutations: {
    setDetachedEmailForm(state, form) {
      state.detachedEmailForm = form;
    },
    setMod(state, obj) {
      state.mod = obj;
    },
    setBackgroundResumeLoading(state, val) {
      state.backgroundResumeLoading = val;
    },
    setNewCurrentStep(state, step) {
      state.generalStepsDialog.currentStep.loading = true;
      state.generalStepsDialog.currentStep = step;
      state.generalStepsDialog.stepKey = randomNumber();
    },
    setNewOptions(state, val) {
      state.newOptions[val.name] = val.val;
    },
    setGeneralSchema(state, schema) {
      state.generalStepsDialog.schema = schema;
    },
    setRemoveGeneralDialog(state) {
      state.generalStepsDialog = {
        loading: true,
        schema: {},
        steps: [],
        currentStep: {},
        stepKey: 0
      };
    },
    setDialogValue(state, { name, value, id }) {
      if (id === state.generalStepsDialog.currentStep.id) {
        state.generalStepsDialog.currentStep[name] = value;
      }
      state.generalStepsDialog.steps.map(item => {
        if (item.id === id) {
          item[name] = value;
        } else {
          return item;
        }
      });
      state.generalStepsDialog.stepKey = randomNumber();
    },
    setGeneralSteps(state, steps) {
      if (!steps) return;

      state.generalStepsDialog.loading = true;
      state.generalStepsDialog.steps = steps.map(item => {
        return {
          ...item,
          id: randomNumber(),
          skip: Number(item.skip),
          error: false,
          icon: getIcon(item.actions),
          defaultParams: getDefaultParams(item)
        };
      });
      state.generalStepsDialog.currentStep =
        state.generalStepsDialog.steps.find(item => item.warning === true) ||
        state.generalStepsDialog.steps[0];
      state.generalStepsDialog.loading = false;
    },
    setSelected(state, { replace = false, arr }) {
      if (replace) state.selected = arr;
      else state.selected.push(...arr);
    },
    setRequestState(state, val) {
      state.requestSent = val;
    },
    setParam(state, { name, val, param }) {
      if (param) {
        state[name][param] = val;
      } else {
        state[name] = val;
      }
    },
    setConfig(state, data) {
      state.config = data;
    },
    setPageConfig(state, obj) {
      state.pageConfig = obj;
    },
    setVisibleDialog(state, { name, val, params = null }) {
      if (!val) state.metaDialogLoaded = false;
      if (name == 'confirm_close_dialog') {
        state.visible_dialog[name] = params
          ? {
              display: val,
              title: params.title,
              text: params.text,
              buttons: params.buttons || []
            }
          : { display: false };
      } else {
        state.visible_dialog[name] = val;
      }
    },
    setDetachedFormFields(state, { fieldName, form }) {
      state.detachedForm.fields[fieldName] = form;
    },
    setDetachedFormMode(state, bool) {
      state.detachedForm.saveMode = bool;
    },
    setDetachedFormStatus(state, { name, valid }) {
      state.detachedForm.validateStatus[name] = valid;
    },
    addDetachFormField(state, { data, form }) {
      state.detachedForm.fields[form].splice(
        state.detachedForm.fields[form].length,
        0,
        data
      );
    },
    addContact(state, { opts = {}, index }) {
      const defaultFirstOption = {
        type: Object.keys(opts)[0],
        lbl: Object.values(opts)[0]
      };
      const isNumber = typeof index == 'number';
      const option = isNumber ? opts : defaultFirstOption;
      const { label, htmlType } = setContactData(option.type, null, option.lbl);
      const contact = {
        value_type: option.type,
        id: `${randomNumber()}`,
        label,
        htmlType,
        value: ''
      };

      state.detachedForm.fields.communications.splice(
        isNumber ? index : state.detachedForm.fields.communications.length,
        0,
        contact
      );
    },
    setNotification(state, data = {}) {
      for (let key in data) {
        state.notifications[key] = data[key];
      }
    }
  },
  actions: {
    catchError(ctx, { err, msg, action }) {
      console.error(action + ' error.', err);

      Message({
        offset: 100,
        showClose: true,
        duration: 25000,
        message: msg,
        type: 'error'
      });
    },
    successMessage(ctx, { msg }) {
      Message({
        offset: 100,
        showClose: true,
        duration: 25000,
        message: msg,
        type: 'success'
      });
    },
    async saveGeneralForm({ state }) {
      let allStatus = [];
      try {
        for (
          let index = 0;
          index < state.generalStepsDialog.steps.length;
          index++
        ) {
          const item = state.generalStepsDialog.steps[index];
          if (item.required) {
            const options = new FormData();
            for (let key in item.form) {
              options.append(key, item.form[key]);
            }
            for (let key in item.defaultParams.save) {
              options.append(key, item.defaultParams.save[key]);
            }

            const data = await postController({ options });
            allStatus.push({ index, status: data.data?.status });
          }
        }

        const status = allStatus.map(item => item.status === 'ok');
        if (status.includes(false)) {
          return false;
        } else {
          return true;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getSteps(
      { commit },
      {
        candidate_id,
        selection_stage_actions,
        vacancy_id = '',
        selection_stage_id = ''
      }
    ) {
      try {
        const params = {
          action: 'checkActionsBeforeChangeStage',
          module: 'HRPAC_SELECTION_STAGE',
          selection_stage_actions: JSON.stringify(selection_stage_actions),
          candidate_id,
          vacancy_id,
          selection_stage_id,
          jsqon_return: 1,
          to_pdf: true
        };
        const { data } = await getController({ params });
        commit('setGeneralSteps', data);
      } catch (error) {
        console.error(error);
      }
    },
    getAddExperience({ commit }) {
      const experience = {
        id: randomNumber(),
        sort: null,
        fields: [
          {
            name: 'company_name',
            value: ''
          },
          {
            name: 'period_begin',
            value: ''
          },
          {
            name: 'period_end',
            value: ''
          },
          {
            name: 'checkbox_job_now',
            value: true
          },
          {
            name: 'post',
            value: ''
          },
          {
            name: 'post_desc',
            value: ''
          },
          {
            name: 'period_length',
            value: ''
          }
        ]
      };

      commit('addDetachFormField', {
        data: experience,
        form: 'detail_experience'
      });
      return experience;
    },
    getAddEducation({ commit }) {
      const education = {
        id: randomNumber(),
        sort: null,
        fields: [
          {
            name: 'university',
            value: ''
          },
          {
            name: 'specialization',
            value: ''
          },
          {
            name: 'year_of_graduation',
            value: ''
          },
          {
            name: 'education_lvl',
            value: ''
          }
        ]
      };

      commit('addDetachFormField', { data: education, form: 'education' });
      return education;
    },
    getAddLanguage({ commit }) {
      const language = {
        id: randomNumber(),
        sort: null,
        fields: [
          {
            name: 'language_proficiency',
            value: ''
          },
          {
            name: 'language_proficiency_lvl',
            value: ''
          }
        ]
      };

      commit('addDetachFormField', {
        data: language,
        form: 'language_proficiency'
      });
      return language;
    },
    getAddLanguageLevel({ commit }, language) {
      commit('addDetachFormField', {
        data: language,
        form: 'language_level'
      });
      return language;
    },
    getAddQualification({ commit }) {
      const qualification = {
        id: randomNumber(),
        sort: null,
        fields: [
          {
            name: 'organization',
            value: ''
          },
          {
            name: 'course_name',
            value: ''
          },
          {
            name: 'year_of_graduation',
            value: ''
          }
        ]
      };

      commit('addDetachFormField', {
        data: qualification,
        form: 'skills_training'
      });
      return qualification;
    },
    async saveForm(context, { options }) {
      try {
        return await postController({
          options,
          params: {
            header: {
              'Content-Type': 'multipart/form-data'
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    },
    async sendRequest(context, { params }) {
      try {
        return await getController({ params });
      } catch (e) {
        console.error(e);
      }
    },
    async sendPostRequest(context, { params, form }) {
      let formData = new FormData();
      const defaultParams = { ...params };

      for (let key in form) {
        if (Array.isArray(form[key])) {
          if (!form[key].length) {
            defaultParams[`${key}[]`] = '';
          } else {
            defaultParams[key] = form[key];
          }
        } else {
          formData.set(key, form[key] || '');
        }
      }
      try {
        return await postController({
          params: defaultParams,
          options: formData
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
