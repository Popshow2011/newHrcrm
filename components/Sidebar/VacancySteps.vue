<template>
  <div v-if="selectedVacancy" class="vacancy-steps" ref="panel">
    <div class="top-step" ref="top">
      <component :is="'style'">
        .stage-box {max-height: calc(100% - {{ areaOffset }}px) !important}
      </component>
      <div class="top-step-flex">
        <div class="flex-row">
          <a
            :href="viewRoute(selectedVacancy.vacancy_id)"
            class="vacancy-name fw-500"
          >
            {{
              selectedVacancy.vacancy_data.name_id ||
                '[нет наименования]' | format
            }}
          </a>
          <Response
            v-if="Number(selectedVacancy.candidates_data.self_response)"
          />
        </div>
        <button class="button-info" @click="$emit('select-vacancy', null)">
          <CloseRound />
        </button>
      </div>
      <span
        v-if="selectedVacancy.vacancy_data.hrpac_vacancy_user_name"
        class="vacancy-label text-about brs-4"
      >
        {{ selectedVacancy.vacancy_data.hrpac_vacancy_user_name | format }}
      </span>
      <div class="step-progress-bar">
        <Progressbar
          :percentage="+selectedVacancy.progress || 0"
          :type="thisRejectionStage && 'warning'"
        />
      </div>
    </div>
    <div
      ref="stages"
      class="stage-box"
      v-if="Object.values(selectedVacancy.stage_data).length"
    >
      <div class="steps">
        <Step
          v-for="stage in selectedVacancy.stage_data"
          v-loading="
            selectedStage && selectedStage.stage.id == stage.id
              ? selectedStage.loading
              : null
          "
          :key="stage.id"
          :ref="stage.id"
          :stage="stage"
          :data="selectedVacancy"
          :current-vacancy="selectedVacancy.vacancy_id"
          @select-stage="selectStage"
        />
      </div>
    </div>
    <div v-else class="empty-stages">нет данных по этапам</div>
    <div class="footer-bar" ref="footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Открепить кандидата"
        :full-width="true"
        :disabled="!isFirstStage"
        @click="showRelationDialog"
        class="add-vacancy"
      />
    </div>
  </div>
</template>

<script>
import { store } from '@/store';
import { mixin, stage } from '@/utils/mixins';
import { MODULE } from '@/utils/constants';
import { detailView } from '@/utils/helpers';
import Step from 'Elements/Step/Step';
import Button from 'Elements/Button/Button';
import CloseRound from 'Elements/SVG/CloseRound';
import Response from 'Elements/SVG/Response';
import Progressbar from 'Elements/Progressbar/Progressbar';

export default {
  mixins: [mixin, stage],
  props: {
    selectedVacancy: {
      type: Object,
      default() {
        return {
          vacancy_id: String,
          stage_data: Object,
          vacancy_data: Object,
          candidates_data: Object,
          this_stage: String
        };
      }
    }
  },
  data() {
    return {
      vacancyModule: MODULE.VACANCY_MODULE,
      listMounted: false,
      areaOffset: 0
    };
  },
  watch: {
    listMounted() {
      if (this.listMounted) {
        const totalArea = this.$refs.panel;
        const top = this.$refs.top;
        const footer = this.$refs.footer;
        this.areaOffset =
          totalArea?.offsetHeight -
          (totalArea?.offsetHeight -
            top?.offsetHeight -
            footer?.offsetHeight +
            69);
      }
    }
  },
  mounted() {
    this.listMounted = true;
    if (this.$refs[this.selectedVacancy.this_stage]) {
      const thisStage = this.$refs[this.selectedVacancy.this_stage][0].$el;
      this.$refs.stages.scrollTo({
        top: thisStage.offsetTop - thisStage.offsetHeight,
        behavior: 'smooth'
      });
    }
  },
  computed: {
    isFirstStage() {
      const { stage_data, stage } = this.selectedVacancy;
      if (!stage) return
      if (Object.values(stage_data).length) {
        return stage.required_position === 'required_top' && stage.sort == 1;
      }
      return null;
    },
    selectedStage() {
      return store.state.candidate.selectedStage || null;
    },
    thisRejectionStage() {
      if (!Object.values(this.selectedVacancy.stage_data).length) return;
      return this.isRejectStage(
        this.selectedVacancy.stage,
        this.selectedVacancy.stage_data
      );
    }
  },
  methods: {
    viewRoute(vacancyId) {
      return detailView(this.vacancyModule, vacancyId);
    },
    selectStage(vacancy_id, stage, item) {
      const {
        this_stage,
        stage_data,
        stage: stageInfo,
        vacancy_data,
        candidates_data
      } = item;
      const isAccept = this.isAcceptStage(stageInfo, stage_data);
      const isRejection = this.isRejectStage(stageInfo, stage_data);
      const selectedRejection = this.isRejectStage(stage, stage_data);
      const isLimited = this.isLimited(stage, item.stage, stage_data);

      if (stage.id !== this_stage && !isAccept && !isLimited) {
        const selectedStage = {
          stage,
          vacancy_id,
          candidates_id: candidates_data.id,
          this_stage,
          stage_data,
          candidates_data: candidates_data,
          vacancy_data
        };
        const dialog = !isRejection
          ? !selectedRejection
            ? 'stage_dialog' // обычный этап
            : 'rejection_dialog' // отказ
          : 'no_rejection_dialog'; // возврат отказа

        this.$emit('set-selected-stage', selectedStage, dialog);
      }
    },
    showRelationDialog() {
      const { vacancy_data } = this.selectedVacancy;
      // если 1 этап "добавлен" - единственный активный/выполненный
      if (this.isFirstStage && vacancy_data.name_id) {
        const deletedVacancy = {
          id: vacancy_data.id,
          name: vacancy_data.name_id
        };
        store.commit('candidate/setDeletedVacancy', deletedVacancy);
      }
    }
  },
  components: { Step, CloseRound, Response, Progressbar, Button }
};
</script>

<style lang="scss" scoped>
.footer-bar {
  align-content: center;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  border-top: 1px solid $black-20;
  border-radius: 0 0 4px 4px;
  padding: 24px;
  box-sizing: border-box;
  background-color: $white;
  position: absolute;
  width: 100%;
  bottom: 12px;

  .add-vacancy {
    width: 100%;
    position: relative;

    .el-button {
      width: 100%;
    }
  }
}

.text-about {
  font-weight: normal;
  font-size: 14px;
  margin: 0;
  line-height: 20px;
}

.top-step {
  margin: 13px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-bottom: 1px solid $black-20;
  overflow: hidden;

  .top-step-flex {
    justify-content: space-between;
    display: flex;
    flex-direction: row;
    vertical-align: center;
    margin-bottom: 4px;
  }
}

.step-progress-bar {
  margin: 12px 0 0 0;
}

.top-step-flex .flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    margin-right: 4px;
  }

  svg {
    margin-right: 4px;
  }
}

.vacancy-steps {
  max-width: 385px;
  height: calc(100% - 100px);
}

.steps {
  overflow-y: auto;
}

.vacancy-name {
  font-size: 16px;
  line-height: 24px;
  align-items: bottom;
  padding: 0;
  color: $black-190;

  a {
    color: $black-190;
    text-decoration: none;
    line-height: 24px;
  }
}

.vacancy-label {
  padding: 2px 4px;
  background-color: $yellow-10;
  color: $yellow-160;
  white-space: nowrap;
  margin-right: auto;
}

.button-info {
  position: static;
  padding: 0;
  border: none;
  background: none;
  align-items: right;
  height: 24px;
}

.stage-box {
  overflow-y: auto;
  height: 100%;
  -ms-overflow-style: none;
  background-color: $background-light;
}

.empty-stages {
  height: calc(100% - 89px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 16px;
  color: $black-80;
}
</style>
