import { getController, postController } from '@/controllers/request';

export default {
  namespaced: true,
  state: {
    datepicker: {
      dateFormat: '',
      timeFormat: 'HH:mm'
    },
    vacancySkillsData: {},
    templateVacancyForm: {}
  },
  mutations: {
    setDatePicker(state, value) {
      state.datepicker = value;
    },
    setTemplateVacancyForm(state, payload) {
      state.templateVacancyForm = payload;
    },
    setVacancySkills(state, skills) {
      state.vacancySkillsData = skills;
    }
  },
  actions: {
    async loadVacancyTemplateData(
      { commit, dispatch, rootState },
      { id, module }
    ) {
      if (id && !rootState.common.requestSent) {
        rootState.common.requestSent = true;

        try {
          const request = await getController({
            params: {
              module,
              action: 'fillVacancyFields',
              vacancy_template_id: id,
              to_pdf: true
            }
          });

          commit('setTemplateVacancyForm', request.data);
        } catch (err) {
          dispatch(
            'common/catchError',
            {
              err,
              msg: 'Возникла ошибка при получении данных шаблона вакансии',
              action: 'get vacancy template data'
            },
            { root: true }
          );
        }
        rootState.common.requestSent = false;
      }
    },
    async addNewSkill({ commit, dispatch }, { name, skills, type }) {
      const formData = new FormData();

      formData.set('module', 'HRPAC_SKILLS');
      formData.set('action', 'create_skill');
      formData.set('skill_type', type);
      formData.set('skill_name', skills[name]);
      formData.set('to_pdf', true);
      formData.set('jsqon_return', 1);

      try {
        const request = await postController({ options: formData });

        if (request.data) {
          commit('setVacancySkills', request.data);
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при создании новых навыков',
            action: 'create new skill'
          },
          { root: true }
        );
      }
    },
    async addNewOption({ commit, dispatch }, { name, skills }) {
      const formData = new FormData();

      formData.set('module', 'HRPAC_VACANCY_NAMES');
      formData.set('action', 'createVacancyNames');
      formData.set('vacancy_name', skills[name]);
      formData.set('to_pdf', true);

      try {
        const request = await postController({ options: formData });

        if (request.data) {
          commit('setVacancySkills', request.data?.vacancy_id);
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при создании новой опции',
            action: 'create new option'
          },
          { root: true }
        );
      }
    },
    async saveForm(ctx, data = {}) {
      // передаем параметры запроса
      const options = new FormData();

      for (let key in data) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => options.append(`${key}[]`, item));
        } else options.append(key, data[key]);
      }

      try {
        await postController({
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
    }
  }
};
