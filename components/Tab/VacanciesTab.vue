<template>
  <VacancySteps
    v-if="selectedVacancy"
    :selected-vacancy="selectedVacancy"
    @select-vacancy="selectVacancy"
    @set-selected-stage="setSelectedStage"
  />
  <Vacancies v-else :data="vacancies" @select-vacancy="selectVacancy" />
</template>

<script>
import { store } from '@/store';
import { errorMsg, dialogMixin } from '@/utils/mixins';
import { uniqueOfferStageNames } from '@/utils/helpers';
import Vacancies from 'Elements/Sidebar/Vacancies';
import VacancySteps from 'Elements/Sidebar/VacancySteps';
export default {
  mixins: [errorMsg, dialogMixin],
  props: {
    config: Object
  },
  data() {
    return {
      selectedVacancyId: null
    };
  },
  computed: {
    vacancies() {
      return store.state.candidate.vacancyData || [];
    },
    selectedVacancy() {
      if (!this.selectedVacancyId) return;

      return this.vacancies.filter(
        ({ vacancy_id }) => vacancy_id == this.selectedVacancyId
      )[0];
    }
  },
  methods: {
    selectVacancy(id = null) {
      this.selectedVacancyId = id;
    },
    setSelectedStage(stage, dialog) {
      if (!stage) return;

      if (
        this.config.hasOfferAccess &&
        Number(stage.stage.show_window_for_offer) &&
        !this.config.offerStages[stage.vacancy_id].length &&
        Object.values(this.config.offerStages).some(vac => vac.length)
      ) {
        // запрет перевода если есть уже др. вакансия с текущим этапом с галкой
        const offerStageNames = uniqueOfferStageNames(this.config.offerStages);
        this.showErrorMessage(
          `Ошибка. Кандидат должен находиться на ${
            offerStageNames.split(', ').length > 1 ? 'этапах' : 'этапе'
          } "${offerStageNames}" только по одной вакансии`
        );
      } else {
        store.commit('candidate/setSelectedStage', stage);
        this.setVisibleDialog(dialog, true);
      }
    }
  },
  components: {
    Vacancies,
    VacancySteps
  }
};
</script>
<style lang="scss">
.sidebar-panel {
  &__wrapper {
    width: 384px;
    background: $white;
    text-align: left;
    margin-left: 24px;
    position: fixed;
    height: 90vh;
    border-radius: 0px 0px 4px 4px;
    // scrollbar-width: none;
  }

  .top {
    position: relative;
    display: flex;
    flex-direction: column;
  }
}

.sidebar-panel__wrapper::-webkit-scrollbar {
  width: 0;
}

.side-tab-bar .el-tabs__nav {
  margin-left: 24px;
}
</style>
