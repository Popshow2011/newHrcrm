<template>
  <div class="side-steps" v-if="selectedVacancy" ref="panel">
    <component :is="'style'">
      .stage-box {max-height: calc(100% - {{ areaOffset }}px) !important}
    </component>
    <div class="top-step" ref="top">
      <div class="top-step-flex">
        <div class="flex-row">
          <a class="vacancy-name" :href="viewRoute(selectedVacancy.id)">
            {{
              selectedVacancy.name_id
                ? formatHtml(selectedVacancy.name_id)
                : '[нет наименования]'
            }}
          </a>
        </div>
        <button class="button-info" @click="deselectVacancy">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12Z"
              fill="#E9EDF2"
            />
            <path
              d="M17.6568 17.6572L12 12.0004M12 12.0004L6.34314 6.34352M12 12.0004L17.6568 6.34352M12 12.0004L6.34314 17.6572"
              stroke="#21272C"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
      <span
        v-if="selectedVacancy.hrpac_vacancy_user_name"
        class="header__title-description"
        type="text"
        v-html="formatHtml(selectedVacancy.hrpac_vacancy_user_name) || ' '"
      />
      <div class="step-progress-bar">
        <Progressbar
          :percentage="selectedVacancy.progressbar"
          :stroke-width="12"
          :show-text="false"
        ></Progressbar>
      </div>
    </div>
    <div class="top__buttons" ref="buttons">
      <Button
        class="top__buttons--deselect-all"
        buttonSize="small"
        buttonText="Снять все"
        @click="deselectAllStages"
      />
      <Button
        class="top__buttons--select-all"
        buttonSize="small"
        buttonText="Выбрать все"
        @click="selectAllStages"
      />
    </div>
    <div class="stage-box">
      <StagePanel mode="response" :stage="responseData" v-if="showResponses" />
      <StagePanel
        v-for="(stage, index) in stages"
        :key="index"
        :stage="stage"
        @selectStage="selectStage"
        @deselectStage="deselectStage"
      />
    </div>
  </div>
</template>

<script>
import Progressbar from 'Elements/Progressbar/Progressbar';
import StagePanel from './SelectionStagePanel';
import { detailView } from '@/utils/helpers';
import { MODULE } from '@/utils/constants';
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import Button from 'Elements/Button/Button';

export default {
  mixins: [mixin],
  components: {
    StagePanel,
    Progressbar,
    Button
  },
  mounted() {
    const totalArea = this.$refs.panel;
    const top = this.$refs.top;
    const buttons = this.$refs.buttons;
    this.areaOffset =
      totalArea.offsetHeight -
      (totalArea.offsetHeight - top.offsetHeight - buttons.offsetHeight + 1);
  },
  data() {
    return {
      activeName: 'selection',
      showList: false,
      showMessageInput: false,
      listToShow: 0,
      idToEdit: 0,
      editMode: false,
      defaultCommentText: '',
      defaultRecruitOnly: false,
      areaOffset: 0
    };
  },
  methods: {
    selectAllStages() {
      const filters = JSON.parse(localStorage.getItem('filters'));
      const allStages = [];
      this.stages.forEach(stage =>
        allStages.push(`${stage.vacancy_id}_${stage.id}`)
      );
      const filteredStages = filters.stages;
      const parsed = JSON.stringify({
        usr_vacancy: filters.usr_vacancy,
        stages: [...filteredStages, ...allStages],
        selectedVacancies: filters.selectedVacancies
      });
      localStorage.setItem('filters', parsed);
      this.$emit('selectStage');
    },
    deselectAllStages() {
      const filters = JSON.parse(localStorage.getItem('filters'));
      const allStagesToRemove = [];
      this.stages.forEach(stage => {
        stage.selected = false;
        allStagesToRemove.push(`${stage.vacancy_id}_${stage.id}`);
      });
      const filteredStages = filters.stages.reduce((acc, item) => {
        if (!allStagesToRemove.includes(item)) acc.push(item);
        return acc;
      }, []);
      const parsed = JSON.stringify({
        usr_vacancy: filters.usr_vacancy,
        stages: [...filteredStages],
        selectedVacancies: filters.selectedVacancies
      });
      localStorage.setItem('filters', parsed);
      this.$emit('deselectAllStages');
    },
    selectStage(value) {
      const filters = JSON.parse(localStorage.getItem('filters'));
      const filteredStages = filters.stages;
      const parsed = JSON.stringify({
        usr_vacancy: filters.usr_vacancy,
        stages: [...filteredStages, value],
        selectedVacancies: filters.selectedVacancies
      });
      localStorage.setItem('filters', parsed);
      this.$emit('selectStage');
    },
    deselectStage(value) {
      const filters = JSON.parse(localStorage.getItem('filters'));
      const filteredStages = filters.stages.filter(stage => stage != value);
      const parsed = JSON.stringify({
        usr_vacancy: filters.usr_vacancy,
        stages: [...filteredStages],
        selectedVacancies: filters.selectedVacancies
      });
      localStorage.setItem('filters', parsed);
      this.$emit('deselectStage');
    },
    // countCandidates(stage_id) {
    //   return this.selectedVacancy.stageCandidatesCount[stage_id];
    // },
    viewRoute(vacancyId) {
      return detailView(MODULE.VACANCY_MODULE, vacancyId);
    },
    comput_color(stage) {
      return stage == 'Добавлен'
        ? 'orange'
        : stage == 'Телефонное интервью'
        ? 'orange'
        : stage == 'Назначено интервью с рекрутером'
        ? 'orange'
        : stage == 'Резюме у заказчика'
        ? 'yellow'
        : stage == 'Тестовое задание'
        ? 'yellow'
        : stage == 'Назначено интервью с внутренним заказчиком'
        ? 'yellow'
        : stage == 'Оффер'
        ? 'green'
        : stage == 'Проверка службы безопасности'
        ? 'green'
        : stage == 'Принят на работу'
        ? 'green'
        : stage == 'Отказ'
        ? 'red'
        : 'gray';
    },
    deselectVacancy() {
      this.$emit('deselectVacancy');
    }
  },
  props: {
    comment: String
  },
  computed: {
    responses() {
      return store.state.selectionPanel.responses;
    },
    showResponses() {
      return store.state.selectionPanel.showResponses;
    },
    responseData() {
      return {
        count: store.state.selectionPanel.respondsCount,
        name: 'Отклики',
        selected: false
      };
    },
    selectedVacancy() {
      return store.state.selectionPanel.activeVacancy;
    },
    vacancyLoading() {
      return this.selectedVacancy ? false : true;
    },
    stagesLoading() {
      return this.stages ? false : true;
    },
    stages() {
      return store.state.selectionPanel.stages;
    },
    vacancyCalc() {
      return this.selectedVacancy
        ? this.selectedVacancy
        : { id: '', name_id: '' };
    }
  }
};
</script>

<style lang="scss" scoped>
.header__title-description {
  background: $yellow-10;
  padding: 2px 4px;
  font-size: 14px;
  line-height: 24px;
  border-radius: 4px;
  width: max-content;
  color: $yellow-160;
  border: none;
  min-width: 70px;
  text-align: left;
  outline: none;
  overflow: hidden;
  max-width: 100%;
  word-break: break-word;

  &:empty:not(:focus):not(:hover):before {
    content: attr(data-placeholer);
    color: $yellow-90;
    display: block;
  }
}

.footer-bar {
  align-content: center;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  border-top: 1px solid $black-20;
  border-radius: 0 0 12px 12px;
  padding: 24px;
  box-sizing: border-box;

  .add-vacancy {
    width: 100%;
    position: relative;

    .el-button {
      width: 100%;
    }
  }
}

.margin-bot {
  margin-bottom: 20px;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    margin-right: 6px;
  }

  svg {
    margin-right: 4px;
  }
}

.vacancy-name {
  font-weight: bold;
  font-size: 16px;
  margin: 0 4px 0 0;
  line-height: 24px;
  align-items: bottom;
  padding: 0;

  a {
    color: $black-190;
    text-decoration: none;
    line-height: 24px;
  }
}

.text-about-blue {
  font-weight: normal;
  font-size: 14px;
  color: $blue-120;
  margin: 0 0 0 0;
  line-height: 20px;
}

.text-about-gray {
  color: $black-40;
}

.step-progress-bar {
  margin: 12px 0 0 0;
}

.text-stage {
  font-weight: bold;
  margin: 0;
}

.top {
  &-step {
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border-bottom: 1px solid $black-20;

    .top-step-flex {
      justify-content: space-between;
      display: flex;
      flex-direction: row;
      vertical-align: center;
      line-height: 24px;
      padding-bottom: 4px;

      .flex-row {
        line-height: 24px;
      }
    }
  }

  &__buttons {
    display: flex;
    padding: 12px 8px;
    border-bottom: 1px solid $black-20;

    &--deselect-all {
      max-width: 92px;
      margin-right: 8px !important;
    }

    &--select-all {
      max-width: 113px;
    }
  }
}

.button-info {
  position: static;
  padding: 0;
  border: none;
  background: none;
  align-items: right;
  height: 24px;
}

.box {
  text-align: left;
  padding: 16px;
  background: $background-light;
  border: 1px solid $black-20;
  box-sizing: border-box;
  border-radius: 12px;
  width: 368px;

  /* height: 184px; */
  margin: 8px 8px 0 8px;
  height: fit-content;
}

.el-progress {
  &-bar {
    background-color: $black-20;
    border-radius: 4px;
    width: 336px;
    height: 12px;
    position: static;
  }

  &.orange ::v-deep &-bar__inner {
    border-radius: 4px;
    background-color: #ffb800;
  }

  &.yellow ::v-deep &-bar__inner {
    border-radius: 4px;
    background: #ffe500;
  }

  &.green ::v-deep &-bar__inner {
    border-radius: 4px;
    background: #009e2f;
  }

  &.red ::v-deep &-bar__inner {
    border-radius: 4px;
    background: #d92e1e;
  }
}

.vacancy-steps {
  &-top {
    color: #ececec;
    margin-top: 0;
  }

  &-bottom {
    color: #ececec;
    margin-top: 4px;
  }
}

.side-steps {
  height: calc(100% - 73px);
  max-width: 385px;
}

.stage-box {
  overflow-y: auto;
  height: 100%;
  -ms-overflow-style: none;
  background: $black-10;
  border-radius: 0 0 6px 6px;

  &::-webkit-scrollbar {
    width: 0;
  }
}
</style>
