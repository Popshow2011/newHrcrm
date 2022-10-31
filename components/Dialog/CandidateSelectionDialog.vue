<template>
  <el-dialog
    :visible="is_visible"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    class="dialog form"
  >
    <CandidateConsideredDialog
      v-if="innerDialog.visible"
      :dialog="innerDialog"
      :visible.sync="innerDialog.visible"
      :status="status"
      @confirm="confirmSelection"
      @close="closeInnerDialog"
    />
    <div class="dialog__content-wrap">
      <div class="dialog__panel-wrap">
        <MassActionsPanel
          mode="candidate"
          class="dialog__panel"
          display_type="popup"
          @switchSelect="switchAllCandidates"
          @switch="switchMyList"
          :allSelected="allSelected"
          :apply-loading="applyLoading"
          @saveCandidatesData="saveCandidatesData"
          :list-length="candidates.length"
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
            <CandidateListItem
              v-for="(candidate, id) in candidates"
              v-infinite-scroll="loadMore"
              :key="candidate.id.value"
              :candidate="candidate"
              :editable-fields="editableFields"
              :selected="selected.includes(candidate.id.value)"
              :infinite-scroll-last="id == candidates.length - 1"
            />
            <Loader v-if="loading" />
          </div>
          <empty-list v-if="!candidates.length && !loading"></empty-list>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { mixin } from '@/utils/mixins';
import { MODULE } from '@/utils/constants';
import { store } from '@/store';
import { detailView } from '@/utils/helpers';
import { postController } from '@/controllers/request.js';
import Filters from 'Elements/Filters/NewFilters';
import Loader from 'Elements/Loader/Loader';
import MassActionsPanel from 'Elements/Dialog/Details/MassActionsPanel';
import CandidateListItem from 'Parts/Candidate/Item/CandidateListItem';
import CandidateConsideredDialog from './CandidateConsideredDialog.vue';
import EmptyList from 'Elements/Dialog/Details/EmptyList';
import Icon from 'Elements/Icon/Icon';

export default {
  components: {
    Filters,
    'el-dialog': Dialog,
    Loader,
    MassActionsPanel,
    CandidateListItem,
    CandidateConsideredDialog,
    EmptyList,
    Icon
  },
  mixins: [mixin],
  props: {
    dateFormat: {
      type: String,
      default: 'd/m/Y'
    },
    outerModule: String // внешний модуль, с которым будет создана связь
  },
  data() {
    return {
      loading: false,
      filters: {},
      status: null,
      blocked_candidates: null,
      innerDialog: {
        visible: false,
        subtitle: ''
      },
      applyLoading: false
    };
  },
  created() {
    // фиксация приоритета средств связи:
    const contactsStructure = {
      priority: ['phone', 'email', 'telegram'],
      excluded: ['freelance', 'livejournal', 'icq'],
      value_type_list: {
        phone: 'Телефон',
        email: 'E-mail',
        telegram: 'Telegram',
        skype: 'Skype',
        facebook: 'Facebook',
        linkedin: 'LinkedIn',
        habr: 'Хабр.Карьера',
        site: 'Сайт'
      }
    };
    store.commit('common/setConfig', { ...this.config, contactsStructure });
  },
  mounted() {
    this.$emit('set-loading', false);
  },
  computed: {
    config() {
      return store.state.common.config || {};
    },
    // currentUserOnly() {
    //   return store.state.filters.currentUserOnly;
    // },
    selected() {
      return store.state.common.selected;
    },
    candidates() {
      return store.state.selectionPopup.popupList || [];
    },
    editableFields() {
      return store.state.selectionPopup.metadataFields || [];
    },
    baseParams() {
      return store.state.selectionPopup.baseParams;
    },
    vacancyId() {
      return store.state.vacancy.fields.id.value;
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
        return store.state.common.visible_dialog.selection_dialog;
      },
      set(val) {
        store.commit('common/setVisibleDialog', {
          name: 'selection_dialog',
          val
        });
      }
    },
    allSelected() {
      return (
        this.candidates.length && this.selected.length == this.candidates.length
      );
    }
  },
  methods: {
    saveCandidatesData() {
      if (!this.requestSent) {
        this.requestSent = true;
        this.applyLoading = true;

        if (this.outerModule == MODULE.VACANCY_MODULE) {
          this.addToVacancy();
        } else if (this.outerModule == MODULE.BOT_AUDITORY) {
          this.addToMailings();
        }
      }
    },
    addToVacancy() {
      const formData = new FormData();
      const params = {
        module: this.outerModule,
        record: this.vacancyId,
        action: 'add_from_vacancy',
        return_module: this.outerModule,
        return_id: this.vacancyId,
        isDuplicate: false,
        child_field: 'hrpac_vacancy_hrpac_candidates_1',
        subpanel_field_name: 'hrpac_vacancy_hrpac_candidates_1',
        subpanel_module_name: 'hrpac_vacancy_hrpac_candidates_1',
        refresh_page: 1,
        to_pdf: true
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }

      this.selected.forEach(item => formData.append('subpanel_id[]', item));

      postController({ options: formData })
        .then(resp => {
          const { status, data } = resp.data;
          const noArrayLength =
            !!data && data.hasOwnProperty('length') && !data.length;

          this.status = status;
          this.blocked_candidates = Object.keys(data);

          if (status === 'completed' && noArrayLength) {
            this.redirect();
          } else {
            this.innerDialog.subtitle = '';

            for (let id in data) {
              data[id].forEach(vacancy => {
                const mes = `<p data-id="${id}"><span>${vacancy.mes}</span></p>`;
                this.innerDialog.subtitle += mes;
              });
            }
            this.$set(this.innerDialog, 'visible', true);
          }
        })
        .catch(err =>
          this.catchError(
            err,
            ' при прикреплении кандидатов к вакансии',
            'save candidates to the vacancy'
          )
        )
        .finally(() => {
          this.requestSent = false;
          this.applyLoading = false;
        });
    },
    addToMailings() {
      const formData = new FormData();
      const botMailing = store.state.mailing.fields;
      const mailingId = botMailing.id ? botMailing.id.value : '';
      const auditoryId = botMailing.bot_auditory_id
        ? botMailing.bot_auditory_id.value
        : '';
      const params = {
        module: this.outerModule,
        action: 'addCandidatesToAuditory',
        bot_mailings_id: mailingId,
        bot_auditory_id: auditoryId,
        to_pdf: true
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }

      this.selected.forEach(item => formData.append('candidate_ids[]', item));

      postController({ options: formData })
        .then(async resp => {
          if (resp.data && resp.data.bot_auditory_id) {
            await store.dispatch(
              'mailing/updateReceiversCount',
              resp.data.bot_auditory_id
            );
            store.dispatch('mailing/loadAuditoryEntries');
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка при прикреплении кандидатов к бот аудитории',
            'save candidates to the bot auditory'
          )
        )
        .finally(() => {
          this.requestSent = false;
          this.applyLoading = false;
          store.commit('common/setVisibleDialog', {
            name: 'selection_dialog',
            val: false
          });
        });
    },
    scrollTop() {
      this.$refs.list.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    async loadPopupData(params, replace = false) {
      this.loading = true;

      await store.dispatch('selectionPopup/loadPopupData', {
        params,
        replace
      });

      this.loading = false;
      this.requestSent = false;
    },
    switchAllCandidates(value) {
      const arr = this.candidates.map(v => v.id.value);

      store.commit('common/setSelected', {
        arr: value ? [] : arr,
        replace: true
      });
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
        // current_user_only_advanced: Number(this.currentUserOnly),
        HRPAC_CANDIDATES2_HRPAC_CANDIDATES_offset: 0
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
        // current_user_only_advanced: Number(this.currentUserOnly),
        HRPAC_CANDIDATES2_HRPAC_CANDIDATES_offset: offset
      };

      this.loadPopupData(params, false);
    },
    switchMyList(/*val*/) {
      store.commit('common/setSelected', {
        arr: [],
        replace: true
      });
      // store.commit('filters/setCustomFilter', { val, filter: name });

      const params = {
        ...this.baseParams,
        ...this.filters
        // current_user_only_advanced: Number(val)
      };

      this.loadPopupData(params, true);
      this.scrollTop();
    },
    closeDialog() {
      this.is_visible = false;

      store.commit('common/setSelected', {
        arr: [],
        replace: true
      });
      store.commit('filters/resetCustomFilters');
    },
    closeInnerDialog() {
      this.innerDialog.visible = false;
    },
    confirmSelection() {
      if (this.blocked_candidates.length) {
        const formData = new FormData();
        const params = {
          module: 'HRPAC_VACANCY',
          record: this.vacancyId,
          action: 'add_from_vacancy',
          forse_add: 1
        };

        for (let key in params) {
          formData.set(key, params[key]);
        }

        this.blocked_candidates.forEach(item =>
          formData.append('subpanel_id[]', item)
        );
        this.$set(this.innerDialog, 'visible', false);
        // this.selectLoading = true;
        postController({ options: formData })
          .then(() => this.redirect())
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка сохранения выбранных кандидатов',
              'confirm selection'
            )
          );
      }
    },
    redirect() {
      if (this.selected.length === 1) {
        // this.selectLoading = false;
        location.replace(detailView('HRPAC_CANDIDATES', this.selected[0]));
      } else {
        location.reload();
      }
    },
    closeCallback() {
      this.innerDialog.visible = false;
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
    overflow-y: auto;
    height: 100%;
    -ms-overflow-style: none !important;
    scrollbar-width: 0 !important;
    margin-top: 112px;
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
  margin: 0 auto;
}
</style>
