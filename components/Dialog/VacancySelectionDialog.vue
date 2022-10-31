<template>
  <el-dialog
    :visible="is_visible"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    class="dialog form"
  >
    <div class="dialog__content-wrap">
      <div class="dialog__panel-wrap">
        <MassActionsPanel
          mode="vacancy"
          :key="panelKey"
          class="dialog__panel"
          display_type="popup"
          @switchSelect="switchAllVacancies"
          @switch="switchMyList"
          :allSelected="allSelected"
          :apply-loading="applyLoading"
          @saveVacanciesData="saveVacanciesData"
          :list-length="vacancies.length"
        />
        <button class="close-button" @click="closeDialog">
          <Icon iconName="selectionPopupClose" />
        </button>
      </div>
      <div class="dialog__content">
        <Filters
          class="dialog__filters"
          @filter="filter"
          :date-format="dateFormat"
          :f-module="baseParams.module"
          :f-action="baseParams.action"
        />

        <div class="dialog__content-center">
          <div class="dialog__list" ref="list">
            <VacancyListItem
              v-for="(vacancy, id) in vacancies"
              v-infinite-scroll="loadMore"
              :key="vacancy.id.value"
              :vacancy="vacancy"
              :editable-fields="editableFields"
              :selected="selected.includes(vacancy.id.value)"
              :infinite-scroll-last="id == vacancies.length - 1"
            />
            <Loader v-if="loading" />
          </div>
          <empty-list v-if="!vacancies.length && !loading"></empty-list>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { Dialog } from 'element-ui';
import { mixin, errorMsg } from '@/utils/mixins';
import { store } from '@/store';
import { postController } from '@/controllers/request.js';
import { MODULE } from '@/utils/constants';
import { detailView } from '@/utils/helpers';
import MassActionsPanel from './Details/MassActionsPanel';
import Loader from 'Elements/Loader/Loader';
import VacancyListItem from 'Parts/Vacancy/Item/VacancyListItem';
import Filters from 'Elements/Filters/NewFilters';
import EmptyList from 'Elements/Dialog/Details/EmptyList';
import Icon from 'Elements/Icon/Icon';

export default {
  mixins: [mixin, errorMsg],
  props: {
    dateFormat: {
      type: String,
      default: 'd/m/Y'
    },
    candidateId: {
      type: String
    }
  },
  components: {
    Filters,
    VacancyListItem,
    'el-dialog': Dialog,
    MassActionsPanel,
    Loader,
    EmptyList,
    Icon
  },
  data() {
    return {
      loading: false,
      filters: {},
      applyLoading: false,
      panelKey: 0
    };
  },
  mounted() {
    this.$emit('set-loading', false);

    this.$nextTick(() => {
      this.panelKey++;
    });
  },
  computed: {
    config() {
      return store.state.common.config || {};
    },
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    },
    is_visible: {
      get() {
        return store.state.common.visible_dialog.vacancies_popup;
      },
      set(val) {
        store.commit('common/setVisibleDialog', {
          name: 'vacancies_popup',
          val
        });
      }
    },
    customFilters() {
      return store.state.filters.customFilters;
    },
    vacancies() {
      return (
        store.state.selectionPopup.popupList.filter(
          vac => !this.alreadyAttached(vac.id.value)
        ) || []
      );
    },
    selected() {
      return store.state.common.selected;
    },
    editableFields() {
      return store.state.selectionPopup.metadataFields || [];
    },
    baseParams() {
      return store.state.selectionPopup.baseParams;
    },
    allSelected() {
      return (
        this.vacancies.length && this.selected.length == this.vacancies.length
      );
    }
  },
  methods: {
    alreadyAttached(id) {
      return store.state.candidate.vacancyData.some(
        item => item.vacancy_id == id
      );
    },
    scrollTop() {
      this.$refs.list.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    async loadPopupData(params, replace = false) {
      this.loading = true;

      try {
        await store.dispatch('selectionPopup/loadPopupData', {
          params,
          replace
        });

        this.loading = false;
        this.requestSent = false;
      } catch (e) {
        console.error(e);
      }
    },
    filter(filters = {}) {
      store.commit('common/setSelected', {
        arr: [],
        replace: true
      });
      this.filters = filters;

      const params = {
        ...this.baseParams,
        ...filters,
        ...this.customFilters,
        // current_user_only_advanced: Number(this.currentUserOnly),
        HRPAC_VACANCY2_HRPAC_VACANCY_offset: 0
      };

      this.loadPopupData(params, true);
      this.scrollTop();
    },
    loadMore() {
      const offset = store.state.selectionPopup.popupPageConfig.offsets.next;
      if (offset == -1) return;

      const params = {
        ...this.baseParams,
        ...this.filters,
        ...this.customFilters,
        // current_user_only_advanced: Number(this.currentUserOnly),
        HRPAC_VACANCY2_HRPAC_VACANCY_offset: offset
      };

      this.loadPopupData(params, false);
    },
    switchMyList(val, name) {
      store.commit('common/setSelected', {
        arr: [],
        replace: true
      });
      store.commit('filters/setCustomFilter', { val, filter: name });

      const params = {
        ...this.baseParams,
        ...this.filters,
        ...this.customFilters
        // current_user_only_advanced: Number(val)
      };

      this.loadPopupData(params, true);
      this.scrollTop();
    },
    switchAllVacancies(value) {
      const arr = this.vacancies.map(v => v.id.value);

      store.commit('common/setSelected', {
        arr: value ? [] : arr,
        replace: true
      });
    },
    closeDialog() {
      this.is_visible = false;
      store.commit('common/setSelected', {
        arr: [],
        replace: true
      });
      store.commit('filters/resetCustomFilters');
      store.commit('selectionPopup/setAttachingCandidates', false);
    },
    saveVacanciesData() {
      if (
        !this.requestSent &&
        store.state.selectionPopup.attachingCandidates == true
      ) {
        this.applyLoading = true;
        this.requestSent = true;
        const formData = new FormData();
        const params = {
          module: 'HRPAC_VACANCY',
          action: 'massAddCandidates',
          vacancy_id: store.state.common.selected[0],
          to_pdf: 1
        };

        for (let key in params) {
          formData.set(key, params[key]);
        }

        store.state.massAction.selectedCandidates.forEach(item =>
          formData.append('candidate_id[]', item)
        );

        postController({ options: formData })
          .then(resp => {
            if (
              resp.data.successfully &&
              resp.data.successfully.messages.length
            ) {
              this.showFullNotification({
                title: 'Действие выполнено успешно',
                dangerouslyUseHTMLString: true,
                showClose: true,
                message: `<p class="notification-text">${
                  resp.data.successfully.messages
                }</p><a href="${detailView(
                  MODULE.VACANCY_MODULE,
                  store.state.common.selected[0]
                )}" target="_blank" class="link-button blue-button">Открыть вакансию</a>`,
                type: 'success',
                customClass: 'vacancy-success__toast',
                position: 'top-left',
                duration: 0,
                offset: 100
              });
            }

            if (
              resp.data.unsuccessfully &&
              resp.data.unsuccessfully.messages.length
            ) {
              let message = '';
              if (resp.data.unsuccessfully.messages.length > 1) {
                for (
                  let i = 0;
                  i < resp.data.unsuccessfully.messages.length;
                  i++
                ) {
                  message += `<li>${resp.data.unsuccessfully.messages[i]}</li>`;
                }
                message = `<ul class="notification-text">${message}</ul>`;
              } else {
                message = `<p class="notification-text">${resp.data.unsuccessfully.messages[0]}</p>`;
              }
              setTimeout(() => {
                this.showFullNotification({
                  title: 'Кандидаты не прикреплены к вакансии',
                  dangerouslyUseHTMLString: true,
                  showClose: true,
                  message: `${message}<a href="${detailView(
                    MODULE.VACANCY_MODULE,
                    store.state.common.selected[0]
                  )}" target="_blank" class="link-button blue-button">Открыть вакансию</a>`,
                  type: 'error',
                  customClass: 'vacancy-error__toast',
                  position: 'top-left',
                  duration: 0,
                  offset: 100
                });
              }, 10);
            }
          })
          .catch(err => {
            this.catchError(err, err, 'add vacancy error');
          })
          .finally(() => {
            store.commit('massAction/setSelection', false);
            store.commit('massAction/selectCandidate', {
              arr: [],
              replace: true
            });
            this.is_visible = false;
            this.requestSent = false;
            this.applyLoading = false;
          });
      }

      if (
        !this.requestSent &&
        store.state.selectionPopup.attachingCandidates == false
      ) {
        this.applyLoading = true;
        this.requestSent = true;
        const formData = new FormData();
        const params = {
          module: 'HRPAC_CANDIDATES',
          action: 'addToVacancy',
          record: this.candidateId,
          refresh_page: 1,
          to_pdf: true
        };

        for (let key in params) {
          formData.set(key, params[key]);
        }

        this.selected.forEach(item => formData.append('vacancy_ids[]', item));

        postController({ options: formData })
          .then(resp => {
            if (resp.data && resp.data.result) {
              location.reload();
            }
            if (resp.data && resp.data.error)
              throw `Возникла ошибка при прикреплении в вакансиям. ${resp.data.error}`;
          })
          .catch(err => {
            this.catchError(err, err, 'add vacancy error');
          })
          .finally(() => {
            this.requestSent = false;
            this.applyLoading = false;
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.close-button {
  height: 40px;
  border-radius: 4px;
  border: none;
  background-color: $blue-10;
  color: $blue-100;
  width: 56px;
  position: absolute;
  right: -70px;
  top: 40px;
}

.dialog {
  &__filters {
    margin-right: 12px;
    max-height: 1000px;
    height: calc(100vh - 130px);
    margin-top: 112px;
    position: fixed;
  }

  &__panel-wrap {
    position: fixed;
    padding-bottom: 16px;
    padding-top: 40px;
    z-index: 2000;
    background: grey;
  }

  &__panel {
    width: 1200px;
  }

  &__content-wrap {
    height: 100%;
    width: fit-content;
    margin: auto;
  }

  &__content {
    display: flex;

    &-center {
      display: flex;
      flex-direction: column;
      width: 795px;
      margin: 0 0 0 405px;
    }
  }

  &__list {
    margin-top: 112px;
    overflow-y: auto;
    height: 100%;
    -ms-overflow-style: none !important;
    scrollbar-width: 0 !important;
    border-radius: 6px;

    &::-webkit-scrollbar {
      width: 0;
      display: none !important;
    }
  }
}

#front .form.el-dialog__wrapper {
  position: fixed;
  overflow-y: auto;

  & ::v-deep .el-dialog {
    background: transparent;
    box-shadow: none;
    width: 1261px;
    margin-top: 0 !important;
    padding: 0;
    max-width: none;

    & > .el-dialog__header {
      display: none;
    }

    & > .el-dialog__body {
      padding: 0;
    }
  }
}
</style>

<style lang="scss">
.form .el-dialog {
  margin: 0 auto !important;
}
</style>
