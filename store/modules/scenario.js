import { getController, postController } from '@/controllers/request.js';
import { MODULE, ACTION } from '@/utils/constants';
import { uuidv4 } from '@/utils/helpers';
export default {
  namespaced: true,
  state: {
    fields: {},
    mailingId: '',
    botScriptId: '',
    instance: {},
    scenarioElements: [],
    variables: [],
    ENDPOINT_TYPE: {
      ANSWER: 'Answer',
      MESSAGE_DOT: 'MessageDot',
      RECTANGLE: 'Rectangle',
      BLANK: 'Blank'
    },
    options: {},
    selectedAnswerOptions: {}
  },
  getters: {
    firstMessageElem: state =>
      state.scenarioElements.filter(el => el.box_type === 'message').length
        ? state.scenarioElements.filter(el => el.box_type === 'message')[0]
        : null
  },
  mutations: {
    setFields(state, data) {
      state.fields = data;
    },
    setMailingId(state, data = '') {
      state.mailingId = data;
    },
    setBotScriptId(state, id = '') {
      state.botScriptId = id;

      // обновляем bot_script_id во всех элементах сообщений
      state.scenarioElements = state.scenarioElements.map(elem =>
        elem.box_type == 'message'
          ? {
              ...elem,
              fields: {
                ...elem.fields,
                bot_script_id: {
                  ...elem.bot_script_id,
                  value: id
                }
              }
            }
          : elem
      );
    },
    initScenarioElements(state, data) {
      state.scenarioElements = [
        ...data.map(el =>
          el.box_type == 'answer'
            ? {
                ...el,
                answers: el.answers.map(answer => {
                  const selectedAnswers = answer.answers_collection
                    .filter(opt => !+opt.deleted.value) // возможно лишнее
                    .map(variant => variant.bot_answer_id.value);
                  state.selectedAnswerOptions[`${el.id}__${answer.id}`] =
                    selectedAnswers;
                  return { ...answer, value: selectedAnswers };
                })
              }
            : el
        )
      ];
    },
    addElement(state, el) {
      state.scenarioElements.push(el);
    },
    deleteEmptyAnswer(state, elem) {
      state.scenarioElements.splice(
        state.scenarioElements.findIndex(el => el.id == elem.id),
        1
      );
    },
    setParentMessage(state, { sourceId, targetId }) {
      const index = state.scenarioElements.findIndex(
        ({ id }) => id === targetId
      );
      state.scenarioElements[index].parent_message_id = sourceId;
    },
    changeMessageField(state, { index, data = {} }) {
      state.scenarioElements[index].fields = {
        ...state.scenarioElements[index].fields,
        ...data
      };
    },
    addAnswer(state, { elementIndex, answer = {} }) {
      state.scenarioElements[elementIndex].answers.push(answer);
    },
    changeAnswer(state, { index, data = [] }) {
      state.scenarioElements[index].answers = data;
    },
    updateElemCoords(state, { id, coords }) {
      const index = state.scenarioElements.findIndex(el => el.id === id);
      state.scenarioElements[index].coordinates_x = coords.x;
      state.scenarioElements[index].coordinates_y = coords.y;
    },
    setOptions(state, data = {}) {
      state.options = data;
    },
    updateAnswerOptions(state, { add = null, remove = null }) {
      if (add) {
        state.options.answers.unshift(add);
      } else if (remove) {
        state.options.answers = state.options.answers.filter(
          ({ id }) => id !== remove.id
        );
      }
    },
    updateDeletedAnswers(state, id) {
      state.scenarioElements = state.scenarioElements.slice().map(el =>
        el.box_type == 'answer'
          ? {
              ...el,
              answers: el.answers.map(answer => ({
                ...answer,
                value: answer.value.filter(opt => opt !== id),
                answers_collection: answer.answers_collection.map(opt =>
                  opt.bot_answer_id.value == id
                    ? { ...opt, deleted: { ...opt.deleted, value: '1' } }
                    : opt
                )
              }))
            }
          : el
      );
      state.options.answers = state.options.answers.filter(
        opt => opt.id !== id
      );
      // update not deleted answer options
    },
    updateSelectedAnswerOptions(state, { action, element, data = null, id }) {
      switch (action) {
        case 'add':
          if (data) {
            data.forEach(
              answer =>
                (state.selectedAnswerOptions[`${element.id}__${answer.id}`] =
                  answer.value)
            );
          } else {
            state.selectedAnswerOptions[`${element.id}__${id}`] = [];
          }
          break;
        case 'remove':
          delete state.selectedAnswerOptions[`${element.id}__${id}`];
          break;
        case 'removeElem':
          element.answers.forEach(
            answer =>
              delete state.selectedAnswerOptions[`${element.id}__${answer.id}`]
          );
          break;

        default:
          break;
      }
    },
    updateAllSelectedAnswerOptions(state, optionId) {
      for (let opt in state.selectedAnswerOptions) {
        if (state.selectedAnswerOptions[opt].includes(optionId)) {
          state.selectedAnswerOptions[opt] = state.selectedAnswerOptions[
            opt
          ].filter(optId => optId !== optionId);
        }
      }
    },
    resetForm(state) {
      if (state.mailingId) {
        location.href = `/index.php?module=BOT_MAILINGS&action=EditView&record=${state.mailingId}`;
      } else if (state.botScriptId) {
        location.href = `/index.php?module=BOT_SCRIPT&action=EditView&record=${state.botScriptId}`;
      }
    }
  },
  actions: {
    async getScenarioData({ state, commit }) {
      try {
        const resp = await getController({
          params: {
            module: MODULE.BOT_SCRIPT,
            action: 'bot_script_structure_retrieve',
            record: state.fields.id.value,
            to_pdf: true
          }
        });
        if (!resp.data) return;
        state.scenarioElements = resp.data.map(elem => {
          if (
            !elem.hasOwnProperty('id') &&
            elem.hasOwnProperty('parent_message_id')
          ) {
            elem.id = uuidv4();
          }

          if (elem.hasOwnProperty('answers')) {
            elem.answers.forEach(
              answer => (answer.id = `${elem.id}_${uuidv4()}_${answer.sort}`)
            );
          }
          return elem;
        });
        commit('initScenarioElements', state.scenarioElements);
      } catch (e) {
        console.error(e);
      }
    },
    uploadPicture({ commit }, { index, data }) {
      commit('changeMessageField', { index, data });
    },
    async getVariablesList({ state }) {
      try {
        const resp = await getController({
          params: {
            module: MODULE.BOT_MESSAGES,
            action: 'getVariableListForMessages',
            to_pdf: true
          }
        });
        if (!resp.data) return;
        state.variables = resp.data;
      } catch (e) {
        console.error(e);
      }
    },
    async createAnswerOption({ dispatch, commit }, name) {
      const formData = new FormData();

      formData.set('module', MODULE.BOT_ANSWER);
      formData.set('record', '');
      formData.set('action', ACTION.SAVE);
      formData.set('name', name);
      formData.set('to_pdf', true);
      formData.set('jsqon_return', 1);

      try {
        const resp = await postController({ options: formData });

        if (resp.data) {
          // update & filter options
          commit('updateAnswerOptions', { add: { id: resp.data.id, name } });
          return resp.data.id;
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при создании новых ответов',
            action: 'create new answer'
          },
          { root: true }
        );
      }
    },
    async uploadImage({ dispatch }, { id = '', file = null }) {
      const formData = new FormData();

      formData.set('module', MODULE.BOT_MESSAGES);
      formData.set('action', 'saveImage');
      formData.set('bot_images_id', id);
      formData.set('deleted', file ? '0' : '1');
      formData.set('to_pdf', true);

      if (file) {
        const { raw: blob } = file;
        formData.append('image_file', blob);
      }

      const params = {
        header: {
          'Content-Type': 'multipart/form-data'
        }
      };

      try {
        const resp = await postController({ params, options: formData });
        return resp.data;
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при загрузке картинки',
            action: 'upload image'
          },
          { root: true }
        );
      }
    },
    async deleteAnswerOption({ dispatch, commit }, opt) {
      const formData = new FormData();

      formData.set('module', MODULE.BOT_ANSWER);
      formData.set('record', opt.id);
      formData.set('action', ACTION.DELETE);
      formData.set('to_pdf', true);

      try {
        await postController({ options: formData });
        commit('updateDeletedAnswers', opt.id);
        commit('updateAllSelectedAnswerOptions', opt.id);
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при удалении ответа из списка',
            action: 'remove answer'
          },
          { root: true }
        );
      }
    },
    async saveScenarioData({ state, dispatch, commit }) {
      const formData = new FormData();
      const params = {
        module: MODULE.BOT_SCRIPT,
        action: 'bot_script_structure_save',
        record: state.botScriptId,
        to_pdf: true,
        script_structure: JSON.stringify(state.scenarioElements)
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }

      try {
        const resp = await postController({ options: formData });
        if (resp.data.error_message) {
          dispatch(
            'common/catchError',
            {
              err: resp.data.error_message,
              msg: resp.data.error_message,
              action: 'save scenario'
            },
            { root: true }
          );
        }
        commit('resetForm');
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при сохранении сценария',
            action: 'save scenario'
          },
          { root: true }
        );
      }
    },
    async deleteElement({ state, commit, dispatch }, elem) {
      const formData = new FormData();
      const params = {
        module: MODULE.BOT_SCRIPT,
        action: 'script_element_delete',
        record: state.botScriptId,
        data: JSON.stringify(elem),
        to_pdf: 1
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }

      try {
        const resp = await postController({ options: formData });

        if (!resp.data.result && resp.data.error) {
          dispatch(
            'common/catchError',
            {
              err: resp.data.error,
              msg: resp.data.error,
              action: 'delete scenario element'
            },
            { root: true }
          );
          return resp.data.error;
        }

        if (Array.isArray(resp.data)) {
          state.instance = {};
          commit('initScenarioElements', resp.data);
          return true;
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: err,
            action: 'delete scenario element'
          },
          { root: true }
        );
        return err;
      }
    }
  }
};
