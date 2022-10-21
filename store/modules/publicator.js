import { getController, postController } from '@/controllers/request';
import { MODULE, ACTION, SUBPANEL, PUBLICATOR_STATUS } from '@/utils/constants';
import { mixin, errorMsg, update } from '@/utils/mixins';

export const errorTypes = error => {
  const types = {};

  function detectErrorType(code) {
    switch (code) {
      case 403:
        types.forbidden = true;
        break;
      case 404:
        types.notfound = true;
        break;
      case 401:
        types.forbidden = true;
        break;
      case 400:
        types.bad_request = true;
        break;
    }
  }

  if (Array.isArray(error)) {
    error.forEach(err => {
      detectErrorType(err.code);
    });
  } else {
    detectErrorType(error);
  }

  return types;
};

export default {
  namespaced: true,
  state: {
    publishedVacancy: [],
    authForm: [],
    work_site_list: ['hh', 'avito', 'superjob'],
    selectedPublishedVacancy: null,
    hhData: {},
    importData: {},
    interval: null,
    billingTypes: [],
    billingType: null,
    nextEvent: null,
    command: '',
    vacancyItem: null,
    allTab: [],
    sendData: {}
  },
  mixins: [mixin, errorMsg, update],
  mutations: {
    setImportData(state, payload) {
      state.importData = payload;
    },
    setAvailableOptions(state, payload) {
      if (payload.action === 'addOpt') {
        state.work_site_list.push(payload.name);
      } else {
        state.work_site_list = state.work_site_list.filter(
          item => item !== payload.name
        );
      }
    },
    setAuthorize(state, payload) {
      state.authForm = state.authForm.map(item => {
        if (item.name === payload.work_site) {
          return { ...item, authData: payload.auth };
        } else {
          return { ...item };
        }
      });
    },
    setAuthForm(state, payload) {
      if (state.authForm.some(f => f.name == payload.name)) return;

      state.authForm = [
        ...state.authForm,
        {
          id: Date.now(),
          name: payload.name,
          options: state.work_site_list,
          authData: {}
        }
      ];
    },
    setSendData(state, { workSite, form }) {
      for (let item in state.authForm) {
        if (
          state.authForm[item].authData.work_site &&
          workSite == state.authForm[item].name.toLowerCase()
        ) {
          state.sendData[state.authForm[item].name.toLowerCase()] = form;
        }
      }
      for (let item in state.sendData) {
        const auth = state.authForm.filter(el => item === el.name)[0];
        for (const [key, value] of Object.entries(auth.billingTypes)) {
          if (value === auth.activeBilling) {
            state.sendData[item].billing_type = key;
          }
        }

        if (state.selectedPublishedVacancy?.billing_type?.value) {
          state.sendData[item].billing_type =
            state.selectedPublishedVacancy.billing_type.value;
        }

        if (state.sendData[item].specializations) {
          state.sendData[item].specializations = Array.isArray(
            state.sendData[item].specializations
          )
            ? state.sendData[item].specializations.join(',')
            : state.sendData[item].specializations;
        }
        if (state.sendData[item].key_skills) {
          state.sendData[item].key_skills = Array.isArray(
            state.sendData[item].key_skills
          )
            ? state.sendData[item].key_skills.join(',')
            : state.sendData[item].key_skills;
        }

        if (state.sendData[item].working_time_modes) {
          state.sendData[item].working_time_modes = Array.isArray(
            state.sendData[item].working_time_modes
          )
            ? state.sendData[item].working_time_modes.join(',')
            : state.sendData[item].working_time_modes;
        }

        if (state.sendData[item].driver_license_types) {
          state.sendData[item].driver_license_types = Array.isArray(
            state.sendData[item].driver_license_types
          )
            ? state.sendData[item].driver_license_types.join(',')
            : state.sendData[item].driver_license_types;
        }
        if (state.sendData[item].can_response) {
          state.sendData[item].can_response = Array.isArray(
            state.sendData[item].can_response
          )
            ? state.sendData[item].can_response.join(',')
            : state.sendData[item].can_response;
        }
        if (state.sendData[item].areas) {
          state.sendData[item].areas = Array.isArray(state.sendData[item].areas)
            ? state.sendData[item].areas.join(',')
            : state.sendData[item].areas;
        }

        if (
          state.sendData[item]?.language_level &&
          state.sendData[item]?.language_level.length
        ) {
          state.sendData[item].language_level = state.sendData[
            item
          ].language_level.map(item =>
            item.fields
              ? {
                  [item.fields[0].name]: item.fields[0].value,
                  [item.fields[1].name]: item.fields[1].value
                }
              : item
          );
        }

        if (state.sendData[item].get_responds == 0) {
          state.sendData[item].get_responds_date = '';
          state.sendData[item].answer_responds = '';
          state.sendData[item].mass_vacancy = '';
        }
      }
    },
    setAuthTabs(state, payload) {
      state.authTabs &&
        state.authTabs.map((item, idx) => {
          if (item.name === payload.name) return;
          const result = {
            id: idx,
            label: payload.name,
            name: payload.name,
            loading: false,
            lazy: idx ? true : false
          };
          state.authTabs = [...state.authTabs, { ...result }];
        });
    },
    setDeleteAuthElement(state, payload) {
      state.authForm = state.authForm.filter(item => item.id !== payload.id);
    },
    setPlatformName(state, payload) {
      state.authForm = state.authForm.map(item => {
        if (item.id === payload.id) {
          // Добавляем по условию имя опции которую изменили
          state.work_site_list.map(el => {
            if (el === payload.name) {
              state.work_site_list = [
                ...state.work_site_list,
                payload.item.name
              ];
              // Удаляем опцию из списка на которую изменили
              state.work_site_list.splice(
                state.work_site_list.indexOf(payload.name),
                1
              );
            }
          });
          return { ...payload.item, name: payload.name };
        } else {
          return { ...item };
        }
      });
    },
    setNextEvent(state, nextEvent) {
      state.nextEvent = nextEvent;
    },
    setPublishedVacancy(state, publishedVacancy = []) {
      state.publishedVacancy = publishedVacancy;
    },
    setSelectedPublishedVacancy(state, vacancy) {
      state.selectedPublishedVacancy = vacancy;
    },
    setSubpanelName(state, subpanel) {
      state.allTab.push(subpanel);
    },
    setDeauthenticate(state, payload) {
      state.authForm = state.authForm.map(item => {
        if (item.name === payload.work_site) {
          return { ...item, authData: {} };
        } else {
          return item;
        }
      });
    },
    setBillingTypes(state, payload) {
      state.authForm = state.authForm.map(item => {
        if (item.name === payload.work_site) {
          return {
            ...item,
            billingTypes: payload.billingTypes,
            activeBilling:
              payload?.billingTypes?.standard || payload?.billingTypes?.package
          };
        } else {
          return item;
        }
      });
    },
    setBillingType(state, payload) {
      state.authForm = state.authForm.map(item => {
        if (item.name === payload.work_site) {
          return { ...item, activeBilling: payload.billingType };
        } else {
          return item;
        }
      });
    },
    setCommand(state, payload) {
      state.command = payload;
    },
    setVacancyItem(state, payload) {
      state.vacancyItem = payload;
    }
  },
  actions: {
    errorTypes(ctx, error) {
      const types = {};

      function detectErrorType(code) {
        switch (code) {
          case 403:
            types.unauthorized = true;
            break;
          case 404:
            types.notfound = true;
            break;
          case 400:
            types.bad_request = true;
            break;
        }
      }

      if (Array.isArray(error)) {
        error.forEach(err => {
          detectErrorType(err.code);
        });
      } else {
        detectErrorType(error);
      }

      return types;
    },
    confirmAuth({ state, dispatch, commit }) {
      const command = state.command;

      switch (command) {
        case 'toArchive':
          // if (state.hhData && !state.hhData.is_employer) {
          //   return dispatch(
          //     'common/catchError',
          //     {
          //       msg: 'Текущий пользователь не является работодателем'
          //     },
          //     { root: true }
          //   );
          // }
          // dispatch('archivePublishedVacancy', {
          //   external_id: state.vacancyItem.external_id.value
          // });
          break;
        case 'delete':
          // if (state.hhData && !state.hhData.is_employer) {
          //   return dispatch(
          //     'common/catchError',
          //     {
          //       msg: 'Текущий пользователь не является работодателем'
          //     },
          //     { root: true }
          //   );
          // }
          // commit(
          //   'common/setVisibleDialog',
          //   {
          //     name: 'publicator_delete_dialog',
          //     val: true
          //   },
          //   { root: true }
          // );
          // commit('setSelectedPublishedVacancy', state.vacancyItem);
          break;
        case 'publish':
          // dispatch('savePublishedVacancy', state.vacancyItem);
          break;
        case 'import':
          // if (state.hhData && !state.hhData.is_employer) {
          //   return dispatch(
          //     'common/catchError',
          //     {
          //       msg: 'Текущий пользователь не является работодателем'
          //     },
          //     { root: true }
          //   );
          // }
          commit(
            'common/setVisibleDialog',
            { name: 'publicator_import_dialog', val: true },
            { root: true }
          );
          break;
        case 'publishCopy':
          dispatch('copyPublishedVacancy', {
            external_id: state.vacancyItem.external_id.value
          });
          break;
        case 'refresh':
          // if (state.hhData && !state.hhData.is_employer) {
          //   return dispatch(
          //     'common/catchError',
          //     {
          //       msg: 'Текущий пользователь не является работодателем'
          //     },
          //     { root: true }
          //   );
          // }
          commit(
            'common/setVisibleDialog',
            { name: 'publicator_refresh_dialog', val: true },
            { root: true }
          );
          break;
        default:
          break;
      }
    },
    async loadBillngTypes({ commit }, work_site) {
      try {
        const { data } = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            to_pdf: true,
            action: 'getLists',
            work_site
          }
        });

        commit('setBillingTypes', {
          billingTypes: data.result.vacancy_billing_type,
          work_site
        });
      } catch (error) {
        console.error(error);
      }
    },

    async checkLink({ rootState, dispatch, commit, state }, url) {
      try {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            to_pdf: true,
            action: 'me',
            url
          }
        });
        const error = errorTypes(response.data.code);

        if (!response.error && !error.forbidden) {
          dispatch('searchPublishedVacancy', { external_id: url });
        } else if (error.forbidden) {
          commit('setImportData', {
            url,
            work_site: response.data.work_site || null
          });

          const availableElement = state.authForm.filter(
            item => item.name.toLowerCase() === response.data.work_site
          );

          if (!availableElement.length) {
            await commit('setAuthForm', {
              name: response.data.work_site || null,
              delete: response.data.work_site === 'hh' ? false : true
            });
          }

          rootState.common.visible_dialog.publicator_auth_dialog = true;
        }
      } catch (error) {
        console.error(error);
        if (error.response.data.error == 'token error') {
          commit('setImportData', {
            url,
            work_site: error.response.data.work_site || null
          });
          await commit('setAuthForm', {
            name: error.response.data.work_site || null,
            delete: error.response.data.work_site !== 'hh'
          });
          rootState.common.visible_dialog.publicator_auth_dialog = true;
        }
      }
    },
    async checkAuth({ commit, state }, work_site = '') {
      try {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            to_pdf: true,
            action: 'me',
            work_site
          }
        });

        if (work_site && !response.data.error) {
          commit('setAuthorize', {
            work_site,
            auth: response.data.result
          });
        } else if (
          !work_site &&
          response.data &&
          !response.data.error &&
          !state.authForm.length
        ) {
          response.data.map(item => {
            if (!item.error) {
              commit('setAuthForm', {
                name: item.work_site,
                delete: item.work_site === 'hh' ? false : true
              });
              commit('setAuthorize', {
                work_site: item.work_site,
                auth: item.result
              });
              commit('setAvailableOptions', { name: item.work_site });
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    },

    authenticate({ dispatch }, payload) {
      window.open(
        `/index.php?module=HRPAC_PUBLISHED_VACANCY&action=get_code&to_pdf=true&work_site=${payload.work_site}`
      );

      dispatch('createAuthInterval', payload.work_site);
    },
    createAuthInterval({ dispatch, state }, work_site) {
      state.interval = setInterval(checkAuth, 4000);

      async function checkAuth() {
        const authElement = state.authForm.filter(
          item => item.name === work_site
        )[0];

        if (authElement.authData && !authElement.authData.work_site) {
          await dispatch('checkAuth', work_site);
        } else {
          dispatch('destroyAuthInterval');
        }
      }
    },
    destroyAuthInterval({ state }) {
      clearInterval(state.interval);
    },
    async deauthenticate({ commit }, work_site) {
      try {
        const params = {
          module: MODULE.HRPAC_PUBLISHED_VACANCY,
          action: 'unauth',
          to_pdf: true,
          work_site
        };

        await getController({ params });

        commit('setDeauthenticate', { work_site });
      } catch (err) {
        console.error(err);
      }
    },
    async deletePublishedVacancy(
      { state, dispatch },
      { external_id, work_site, employer_id }
    ) {
      try {
        // if (state.hhData) {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            action: ACTION.DELETE_PUBLISHED_VACANCY,
            subpanel: 'hrpac_vacancy_hrpac_published_vacancy',
            external_id,
            work_site,
            employer_id,
            id: state.selectedPublishedVacancy.id.value,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        const error = dispatch('errorTypes', response.status);

        if (error.not_found || error.bad_request) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            duration: 25000,
            message: 'Ошибка удаления вакансии',
            type: 'error'
          });
        } else if (error.forbidden) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            duration: 25000,
            message: 'Для продолжения требуется авторизация на работном сайте',
            type: 'error'
          });
        } else if (response.data && response.data.error) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: errorMsg.methods.errorText(response.data.error).msg,
            duration: 25000,
            type: errorMsg.methods.errorText(response.data.error).type
          });
        } else {
          update.methods.updateSubpanels(SUBPANEL.ID.PUBLICATOR);

          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Вакансия удалена',
            duration: 15000,
            customClass: 'toast-black'
          });
        }
        // } else {
        //   errorMsg.methods.showNotification({
        //     offset: 100,
        //     showClose: true,
        //     duration: 25000,
        //     message: 'Для продолжения требуется авторизация на работном сайте',
        //     type: 'error'
        //   });
        // }
      } catch (err) {
        console.error(err);

        errorMsg.methods.showNotification({
          offset: 100,
          showClose: true,
          duration: 25000,
          message: 'Ошибка удаления вакансии',
          type: 'error'
        });
      }
    },
    async archivePublishedVacancy(
      { dispatch },
      { external_id, employer_id, work_site }
    ) {
      try {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            action: ACTION.ARCHIVE_PUBLISHED_VACANCY,
            subpanel: 'hrpac_vacancy_hrpac_published_vacancy',
            external_id,
            employer_id,
            work_site,
            jsqon_return: 1,
            to_pdf: true
          }
        });
        const errors = dispatch('errorTypes', response.status);

        if (errors.notfound || errors.bad_request) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Ошибка архивирования вакансии',
            duration: 15000,
            type: 'error'
          });
        } else if (response.data && response.data.error) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: errorMsg.methods.errorText(response.data.error).msg,
            duration: 25000,
            type: errorMsg.methods.errorText(response.data.error).type
          });
        } else {
          update.methods.updateSubpanels(SUBPANEL.ID.PUBLICATOR);

          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Вакансия архивирована',
            duration: 15000,
            type: 'info'
          });
        }
        // } else {
        //   errorMsg.methods.showNotification({
        //     offset: 100,
        //     showClose: true,
        //     duration: 25000,
        //     message: 'Для продолжения требуется авторизация на работном сайте',
        //     type: 'error'
        //   });
        // }
      } catch (err) {
        errorMsg.methods.showNotification({
          offset: 100,
          showClose: true,
          message: 'Ошибка архивирования вакансии',
          duration: 15000,
          type: 'error'
        });

        console.error(err);
      }
    },
    async searchAllPublishVacancy({ commit }, id) {
      try {
        const data = await getController({
          params: {
            module: MODULE.VACANCY_MODULE,
            action: ACTION.GET_SUBPANEL_JSON_DATA,
            subpanel: 'hrpac_vacancy_hrpac_published_vacancy',
            record: id,
            jsqon_return: 1,
            to_pdf: true
          }
        });
        commit('setPublishedVacancy', data.data.List);
      } catch (err) {
        console.error(err);
      }
    },
    async searchPublishedVacancy({ rootState, dispatch }, { external_id }) {
      try {
        // if (state.hhData && state.hhData.employer) {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            action: ACTION.SEARCH_PUBLISHED_VACANCY,
            subpanel: 'hrpac_vacancy_hrpac_published_vacancy',
            record: rootState.vacancy.fields.id.value,
            external_id,
            vacancy_id: rootState.vacancy.fields.id.value,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        const error = dispatch('errorTypes', response.status);

        if (error.not_found || error.bad_request) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Ошибка импорта вакансии',
            duration: 15000,
            type: 'error'
          });
        } else if (error.forbidden) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            duration: 25000,
            message: 'Текущий пользователь не является работодателем',
            type: 'error'
          });
        } else if (response.data && response.data.error) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: errorMsg.methods.errorText(response.data.error).msg,
            duration: 25000,
            type: errorMsg.methods.errorText(response.data.error).type
          });
        } else {
          update.methods.updateSubpanels(SUBPANEL.ID.PUBLICATOR);

          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Вакансия успешно импортирована',
            duration: 15000,
            type: 'info'
          });
        }
        // } else {
        //   errorMsg.methods.showNotification({
        //     offset: 100,
        //     showClose: true,
        //     duration: 25000,
        //     message: 'Текущий пользователь не является работодателем',
        //     type: 'error'
        //   });
        // }
      } catch (err) {
        console.error(err);

        errorMsg.methods.showNotification({
          offset: 100,
          showClose: true,
          message: 'Ошибка импорта вакансии',
          duration: 15000,
          type: 'error'
        });
      }
    },
    async prolongateVacancy({ dispatch }, { external_id, work_site }) {
      try {
        // if (state.hhData && state.hhData.employer) {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            action: ACTION.PROLONGATE_VACANCY,
            subpanel: 'hrpac_vacancy_hrpac_published_vacancy',
            external_id,
            work_site,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        const errors = dispatch('errorTypes', response.status);

        if (errors.notfound) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Вакансия обновлена',
            duration: 15000,
            type: 'info'
          });
        } else if (errors.forbidden) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            duration: 25000,
            message: 'Вакансия не найдена',
            type: 'error'
          });
        } else if (response.data && response.data.error) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: errorMsg.methods.errorText(response.data.error).msg,
            duration: 25000,
            type: errorMsg.methods.errorText(response.data.error).type
          });
        } else {
          update.methods.updateSubpanels(SUBPANEL.ID.PUBLICATOR);
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Вакансия обновлена',
            duration: 15000,
            type: 'info'
          });
        }
        // } else {
        //   errorMsg.methods.showNotification({
        //     offset: 100,
        //     showClose: true,
        //     duration: 25000,
        //     message: 'Текущий пользователь не является работодателем',
        //     type: 'error'
        //   });
        // }
      } catch (err) {
        console.error(err);

        errorMsg.methods.showNotification({
          offset: 100,
          showClose: true,
          message: 'Ошибка продления вакансии',
          duration: 15000,
          type: 'error'
        });
      }
    },
    async copyPublishedVacancy({ dispatch }, { external_id, work_site }) {
      try {
        // if (state.hhData && state.hhData.employer) {
        const response = await getController({
          params: {
            module: MODULE.HRPAC_PUBLISHED_VACANCY,
            action: ACTION.COPY_PUBLISHED_VACANCY,
            subpanel: 'hrpac_vacancy_hrpac_published_vacancy',
            external_id,
            work_site,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        const error = dispatch('errorTypes', response.status);

        if (error.forbidden) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            duration: 25000,
            message: 'Текущий пользователь не является работодателем',
            type: 'error'
          });
        } else if (error.not_found || error.bad_request) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Ошибка публикации вакансии',
            duration: 15000,
            type: 'error'
          });
        } else if (response.data && response.data.error) {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: errorMsg.methods.errorText(response.data.error).msg,
            duration: 25000,
            type: errorMsg.methods.errorText(response.data.error).type
          });
        } else {
          update.methods.updateSubpanels(SUBPANEL.ID.PUBLICATOR);

          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message: 'Вакансия опубликована повторно',
            duration: 15000,
            type: 'info'
          });
        }
        // } else {
        //   errorMsg.methods.showNotification({
        //     offset: 100,
        //     showClose: true,
        //     duration: 25000,
        //     message: 'Текущий пользователь не является работодателем',
        //     type: 'error'
        //   });
        // }
      } catch (err) {
        console.error(err);

        errorMsg.methods.showNotification({
          offset: 100,
          showClose: true,
          message: 'Ошибка публикации вакансии',
          duration: 15000,
          type: 'error'
        });
      }
    },
    async savePublishedVacancy({ rootState, state }, fields) {
      try {
        const formData = new FormData();
        formData.set('module', MODULE.HRPAC_PUBLISHED_VACANCY);
        formData.set('action', ACTION.SAVE_PUBLISHED_VACANCY);

        if (
          state.selectedPublishedVacancy?.status?.value !=
            PUBLICATOR_STATUS.DRAFT ||
          !fields.id
        ) {
          formData.set('record', fields?.id?.value || '');
        }

        formData.set('prefill[vacancy_id]', rootState.vacancy.fields.id.value);
        formData.set('jsqon_return', 1);
        formData.set('to_pdf', true);
        formData.set('work_sites', JSON.stringify(state.sendData));

        if (fields.only_publish == true) {
          formData.set(
            'work_site',
            typeof fields.work_site === 'string'
              ? fields.work_site
              : fields.work_site.value
          );
          formData.set('only_publish', true);
        } else {
          if (fields.only_publish == false) {
            formData.set('only_publish', false);
            formData.set('publish', false);
          } else {
            formData.set('publish', true);
          }
        }

        const response = await postController({ options: formData });
        let errors = {};

        const infoMsgEdit = (work_site, action) => {
          const form = state.sendData[work_site];
          // Публикация //
          if (
            action === 'publish' &&
            form &&
            !form.nextDate &&
            !+form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия опубликована. Система загрузит отклики, оставленные с ${form.get_responds_date}`;
          }
          if (
            action === 'publish' &&
            form &&
            form.nextDate &&
            !+form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия опубликована. Сбор откликов начнётся с ${form.get_responds_date}`;
          }
          if (
            action === 'publish' &&
            form &&
            !form.nextDate &&
            +form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия опубликована. Система загрузит отклики, оставленные с ${form.get_responds_date} и переведёт кандидатов на этап "добавлен"`;
          }
          if (
            action === 'publish' &&
            form &&
            form.nextDate &&
            +form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия опубликована. Сбор откликов начнётся с ${form.get_responds_date}. Система переведёт кандидатов на этап "добавлен"`;
          }
          if (
            action === 'publish' &&
            form &&
            !form.nextDate &&
            !+form.mass_vacancy &&
            !form.get_responds_date
          ) {
            return `Вакансия опубликована`;
          }
          if (action === 'publish' && !form) {
            return `Вакансия опубликована`;
          }
          // Редактирование //
          if (
            action === 'edit' &&
            form &&
            !form.nextDate &&
            !+form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия отредактирована. Система загрузит отклики, оставленные с ${form.get_responds_date}`;
          }
          if (
            action === 'edit' &&
            form &&
            form.nextDate &&
            !+form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия отредактирована. Сбор откликов начнётся с ${form.get_responds_date}`;
          }
          if (
            action === 'edit' &&
            form &&
            !form.nextDate &&
            +form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия отредактирована. Система загрузит отклики, оставленные с ${form.get_responds_date} и переведёт кандидатов на этап "добавлен"`;
          }
          if (
            action === 'edit' &&
            form &&
            form.nextDate &&
            +form.mass_vacancy &&
            form.get_responds_date
          ) {
            return `вакансия отредактирована. Сбор откликов начнётся с ${form.get_responds_date}. Система переведёт кандидатов на этап "добавлен"`;
          }
          if (
            action === 'edit' &&
            form &&
            !form.nextDate &&
            !+form.mass_vacancy &&
            !form.get_responds_date
          ) {
            return `Вакансия сохранена`;
          }
        };

        if (response && response.data) {
          for (let i in response.data) {
            let nubbersOfErrors = response.data[i].length;
            for (let j = 0; j < nubbersOfErrors; j++) {
              errors[i] = response.data[i][j].error
                ? errorMsg.methods.errorText(response.data[i][j].error)
                : {
                    msg:
                      fields.only_publish || fields.publish
                        ? infoMsgEdit(i, 'publish')
                        : infoMsgEdit(i, 'edit'),
                    type: 'info'
                  };
            }
          }
          state.publishedVacancy = [];
          state.authForm = [];
          state.sendData = {};
        }

        if (errors) {
          for (let i in errors) {
            setTimeout(
              () =>
                errorMsg.methods.showNotification({
                  offset: 100,
                  showClose: true,
                  message: `${i}: ${errors[i].msg}`,
                  duration: 15000,
                  type: errors[i].type
                }),
              100
            );
          }
        } else {
          errorMsg.methods.showNotification({
            offset: 100,
            showClose: true,
            message:
              fields.only_publish || fields.publish
                ? 'Вакансия опубликована'
                : 'Вакансия сохранена',
            duration: 15000,
            type: 'info'
          });
        }

        state.sendData = {};
        rootState.common.requestSent = false;
      } catch (err) {
        errorMsg.methods.showNotification({
          offset: 100,
          showClose: true,
          message: 'Ошибка публикации вакансии',
          duration: 15000,
          type: 'error'
        });
        state.sendData = {};
      }
      setTimeout(
        () => update.methods.updateSubpanels(SUBPANEL.ID.PUBLICATOR),
        1000
      );
    }
  }
};
