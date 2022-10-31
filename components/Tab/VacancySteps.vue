<template>
  <div class="vacancy-steps">
    <div class="content-top">
      <PanelProgressBar
        v-if="!selectedStage && !respondsVisible"
        :candidates="acceptedAmount"
        :maxCandidates="fields.total_amount.value"
        :progress="+fields.progresbar.value"
        :key="updateKey"
      />
      <div v-else class="back-to-stages">
        <button class="back-to-stages__button" v-if="!showSelection">
          <div class="button-content" @click="backToStages">
            <Icon iconName="goBack" />
            <p class="button-content__text fw-500">Назад к этапам подбора</p>
          </div>
        </button>
        <div class="back-to-stages__select-count" v-if="showSelection">
          <p class="fw-500" v-if="selectedCandidates.length == 0">
            Выберите кандидатов
          </p>
          <p class="fw-500" v-if="selectedCandidates.length > 0">
            Выбрано {{ selectedCandidates.length }} чел.
          </p>

          <button @click="cancelSelection">
            <Icon iconName="close" iconColor="#21272C" />
          </button>
        </div>
        <div class="action-buttons">
          <Button
            buttonSize="medium"
            buttonColor="blue"
            :buttonText="selectAllButtonText"
            @click="switchAll"
            v-if="massActions.length && showSelection"
          />
          <Button
            v-if="massActions.length && !showSelection"
            buttonSize="medium"
            buttonColor="blue"
            buttonText="Выбрать"
            @click="startSelection"
          />

          <MassActionDropdown
            v-loading="massActionsLoading"
            v-show="selectedCandidates.length"
            @switching-stages="setSwitchingStagesStatus"
          ></MassActionDropdown>
        </div>
      </div>
    </div>
    <div class="content-center">
      <div
        v-if="!selectedStage && !respondsVisible && respond_subpanel_display"
      >
        <responds-step
          :count="respondsCount"
          @select-responds="selectResponds"
        />
      </div>
      <div v-if="!selectedStage && !respondsVisible">
        <Step v-for="step in templateStages" :key="step.id" :step="step" />
      </div>
      <CandidateList v-if="selectedStage && !respondsVisible" />
      <RespondsList v-if="respondsVisible && !selectedStage" />
    </div>
    <div class="footer-bar">
      <Button
        v-loading="loading"
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Прикрепить кандидата"
        :full-width="true"
        :disabled="
          getRoleStatus ||
          (customButtons.pick_candidate &&
            customButtons.pick_candidate.disabled)
        "
        @click="showCandidatePopup"
      />
    </div>
  </div>
</template>

<script>
import { store } from '@/store';
import PanelProgressBar from 'Parts/Vacancy/Details/PanelProgressBar';
import Step from 'Elements/Step/VacancyStep';
import RespondsStep from 'Elements/Step/RespondsStep';
import CandidateList from 'Parts/Candidate/List/CandidateListSmall';
import RespondsList from 'Parts/Vacancy/Details/RespondsList';
import Button from 'Elements/Button/Button';
import Icon from 'Elements/Icon/Icon';
import MassActionDropdown from 'Elements/Select/MassActionDropdown';

export default {
  mounted() {
    store.dispatch('respond/getRespondsPage', {
      id: this.fields.id.value,
      page: this.page
    });
  },
  data() {
    return {
      loading: false,
      respondsVisible: false,
      updateKey: 0
    };
  },
  computed: {
    selectAllButtonText() {
      return this.selectedCandidates.length == this.candidates.length
        ? 'Снять все'
        : 'Выбрать все';
    },
    massActionsLoading() {
      return store.state.massAction.loading;
    },
    massActions() {
      return store.state.massAction.actions || [];
    },
    candidates() {
      return store.state.massAction.candidates;
    },
    selectedCandidates() {
      return store.state.massAction.selectedCandidates;
    },
    actionsLoad() {
      return store.state.massAction.actionLoad || false;
    },
    showSelection() {
      return store.state.massAction.showSelection;
    },
    respond_subpanel_display() {
      return store.state.respond.respond_subpanel_display || false;
    },
    getRoleStatus() {
      return store.state.vacancy.roleStatus?.value !== 'Открыта';
    },
    customButtons() {
      return store.state.common.customButtons || {};
    },
    respondsCount() {
      return store.state.respond.responds_stage_condidates_count;
    },
    fields() {
      return store.state.vacancy.fields || {};
    },
    stages() {
      return store.state.vacancy.stages || [];
    },
    selectedStage() {
      return store.state.vacancy.selectedStage || null;
    },
    templateStages() {
      // вывод всех уникальных этапов в правильной последовательности
      return this.stages.length
        ? [
            ...this.stages
              .filter(stage =>
                Number(stage.in_stage_templates) || Number(stage.count)
                  ? stage
                  : null
              )
              .sort((x, y) => {
                return x.sort === y.sort
                  ? Number(y.in_stage_templates) - Number(x.in_stage_templates)
                  : Number(x.sort) - Number(y.sort);
              })
          ]
        : [];
    },
    acceptedAmount() {
      return String(
        +this.fields.total_amount.value.replace(/\s/g, '') -
          +this.fields.amount_final.value.replace(/\s/g, '')
      );
    }
  },
  methods: {
    startSelection() {
      store.commit('massAction/setSelection', true);
    },
    switchAll() {
      this.selectedCandidates.length !== this.candidates.length
        ? store.commit('massAction/selectAllCandidates')
        : store.commit('massAction/clearSelectedCandidates');
    },
    cancelSelection() {
      store.commit('massAction/setSelection', false);
      store.commit('massAction/selectCandidate', { arr: [], replace: true });
    },
    backToStages() {
      store.commit('vacancy/setParam', { name: 'selectedStage', val: null });
      store.commit('massAction/setActions', null);
      store.commit('massAction/clearSelectedCandidates');
      if (this.respondsVisible) this.respondsVisible = false;
    },
    selectResponds(visible) {
      this.respondsVisible = visible;
    },
    async showCandidatePopup() {
      const params = {
        module: 'HRPAC_CANDIDATES',
        action: 'Popup',
        jsqon_return: 1,
        to_pdf: true,
        user_id: store.state.common.config.userId
      };

      this.loading = true;
      store.commit('selectionPopup/setBaseParams', params);
      await store.dispatch('selectionPopup/loadPopupData', {
        params: { ...params, lvso: 'DESC' }
      });
      store.commit('common/setVisibleDialog', {
        name: 'selection_dialog',
        val: true
      });
      this.loading = false;
    }
  },
  components: {
    PanelProgressBar,
    Step,
    RespondsStep,
    CandidateList,
    RespondsList,
    Button,
    Icon,
    MassActionDropdown
  }
};
</script>

<style lang="scss" scoped>
.content-center {
  overflow-y: auto;
  -ms-overflow-style: none;

  // &::-webkit-scrollbar {
  //   width: 12px;
  //   background-color: $blue-20;
  //   border-radius: 4px;
  // }
}

.footer-bar {
  padding: 24px;
  border-top: 1px solid $black-20;
  vertical-align: bottom;
  align-items: stretch;
  flex-direction: column;
  display: flex;
  position: absolute;
  width: 100%;
  bottom: 0;
}

.vacancy-steps {
  display: flex;
  flex-direction: column;
  height: calc(100% - 90px);
}

.back-to-stages {
  display: flex;
  flex-direction: column;
  padding: 12px 24px;
  border-bottom: 1px solid $black-20;

  &__button {
    padding: 0;
    border: none;
    background: none;
    margin-bottom: 16px;
  }

  &__select-count {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    button {
      background: none;
      border: none;
      padding: 0;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;

  .el-button {
    margin-right: 0;
  }
}

.button-content {
  display: flex;
  flex-direction: row;
  align-items: center;

  &__text {
    margin-left: 12px;
  }
}
</style>
