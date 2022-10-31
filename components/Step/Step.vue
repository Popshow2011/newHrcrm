<template>
  <div class="step">
    <div
      :class="[checkedStep ? 'checked-box' : 'unchecked-box', disabledClass]"
      @click="selectStep($event)"
    >
      <p class="text-stage primary">{{ stage.name }}</p>
      <div class="stage-bottom-info">
        <div class="done-status">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <template v-if="checkedStep">
              <circle cx="12" cy="12" r="10" fill="#0075DB" />
              <path
                d="M8 12.6L10.5714 15L17 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
            </template>
            <template v-else>
              <circle cx="12" cy="12" r="9.5" stroke="#DADFE4" />
            </template>
          </svg>
          <p class="secondary">{{ stageDate }}</p>
        </div>

        <div v-if="stageAttachment" class="stage-link">
          <a
            :href="stageAttachment.link || 'javascript:void(0);'"
            :target="stageAttachment.link ? '_blank' : ''"
            @click.stop="stageAttachment.callback"
          >
            {{ stageAttachment.text }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { store } from '@/store';
import { MODULE, ACTION } from '@/utils/constants';
import { getController } from '@/controllers/request.js';
import { stage, dialogMixin, errorMsg } from '@/utils/mixins';
import { detailView } from '@/utils/helpers';

export default {
  mixins: [stage, dialogMixin, errorMsg],
  props: {
    stage: {
      type: Object
    },
    currentVacancy: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      MODULE,
      ACTION
    };
  },
  computed: {
    stageDate() {
      return this.stage.date_start_stage
        ? new Date(
            this.stage.date_start_stage.split(' ')[0]
          ).toLocaleDateString()
        : 'Не назначено';
    },
    disabledClass() {
      const {
        this_stage,
        stage_data,
        stage: stageInfo,
        visibility
      } = this.data;
      const isEqual = this.stage.id === this_stage;
      const isLimited = this.isLimited(this.stage, stageInfo, stage_data);

      return isEqual || isLimited || visibility == 'disabled' ? 'no-focus' : '';
    },
    checkedStep() {
      return Number(this.stage.done) || Number(this.stage.this_stage);
    },
    stageAttachment() {
      const thisOrDone = +this.stage.done || +this.stage.this_stage;
      // const finalAcceptStages = Object.values(this.data.stage_data).slice(
      //   -3,
      //   -1
      // ); // Подготовка к выходу и Принят
      // const isFinalStage = finalAcceptStages.some(
      //   ({ id }) => id === this.stage.id
      // );
      // const acceptStageAsLast =
      //   (+finalAcceptStages.slice(-1)[0].done ||
      //     +finalAcceptStages.slice(-1)[0].this_stage) &&
      //   !this.isAcceptStage(this.stage, this.data.stage_data); // ссылка заявки только на последнем из двух этапов
      // const lastByTypeStage = finalAcceptStages.every(
      //   ({ this_stage, done }) => !+this_stage && !+done
      // );
      const callback = dialog => {
        store.commit('candidate/setVacancyForWindow', {
          data: this.data,
          dialog
        });
        this.setVisibleDialog(dialog, true);
      };

      return thisOrDone &&
        (+this.stage.show_window_for_data ||
          +this.stage.show_window_for_new_employ_exit)
        ? // thisOrDone &&
          // +this.stage.show_window_for_data &&
          // lastByTypeStage) ||
          // (isFinalStage &&
          //   (+this.stage.this_stage || (+this.stage.done && !acceptStageAsLast))
          {
            text: 'Заявка на выход',
            link: null,
            callback: () => callback('employee_exit_dialog')
          }
        : thisOrDone && +this.stage.show_window_for_offer
        ? {
            text: 'Оффер',
            link: null,
            callback: () => callback('form_offer_dialog')
          }
        : thisOrDone && +this.stage.show_custom_popup
        ? {
            text: 'Анкета СБ',
            link: store.state.candidate.fields.questionnaire.value
              ? detailView(
                  MODULE.LKK_CANDIDATE_QUESTIONNAIRE,
                  store.state.candidate.fields.questionnaire.value
                )
              : '',
            callback: null
          }
        : null;
    }
  },
  methods: {
    selectStep(e) {
      if (
        e.target.className != 'stage-link' &&
        e.target.parentElement.className != 'stage-link'
      ) {
        //проверяем наличие свободных позиций у вакансии, если выбранный этап не Отказ
        !this.isRejectStage(this.stage, this.data.stage_data)
          ? getController({
              params: {
                module: MODULE.VACANCY_MODULE,
                action: ACTION.GET_MODULE_FIELDS,
                'fields[]': 'amount_final',
                id: this.currentVacancy,
                to_pdf: true
              }
            })
              .then(resp => {
                resp.data[0].value != 0
                  ? this.$emit(
                      'select-stage',
                      this.currentVacancy,
                      this.stage,
                      this.data
                    )
                  : this.showErrorMessage(
                      'Нет открытых позиций по выбранной вакансии'
                    );
              })
              .catch(err =>
                this.catchError(
                  err,
                  'Возникла ошибка при проверке наличия открытых позиций'
                )
              )
          : this.$emit(
              'select-stage',
              this.currentVacancy,
              this.stage,
              this.data
            );
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.step {
  background-color: $background-light;
  padding: 4px 8px 0;

  .stage-link {
    color: $blue-120;
    text-decoration: none;
    margin-right: 0;
    font-size: 14px;
    line-height: 24px;
    margin-right: 1px;
    pointer-events: all;

    a {
      cursor: pointer !important;
    }
  }

  .done-status {
    display: flex;
    align-items: center;
  }

  .stage-bottom-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    line-height: 24px;
    justify-content: space-between;
    margin: 0;

    p {
      margin: 0 0 0 8px;
      font-weight: normal;
      font-size: 14px;
      line-height: 24px;
    }
  }

  .text-stage {
    line-height: 20px;
    margin: 0 0 12px 0;
    font-weight: bold;
    font-size: 14px;
  }

  & > div {
    border: 1px solid $black-20;
    box-sizing: border-box;
    border-radius: 4px;
    align-items: flex-start;
    padding: 16px;
  }
}

.checked-box,
.unchecked-box {
  background-color: $white;

  &:not(.no-focus):hover {
    border: 1px solid $blue-100;
  }

  .stage-bottom-info {
    color: $black-40;
  }

  .text-stage {
    color: $black-130;
  }

  .stage-bottom-info {
    color: $black-40;
  }

  .text-stage {
    color: $black-200;
  }

  &:not(.no-focus),
  &:not(.no-focus) * {
    cursor: pointer;
  }

  &.no-focus {
    background-color: $black-10;
    pointer-events: none;

    .text-stage {
      color: $black-60;
    }

    .stage-bottom-info p {
      color: $black-80;
    }
  }
}
</style>
