<template>
  <div class="dialog-panel shadow-lvl-1">
    <div class="dialog-panel__left">
      <div v-if="mode !== 'selection'" class="dialog-panel__buttons">
        <a
          :href="`/index.php?module=${urlModule}&action=EditView`"
          target="_blank"
          v-if="mode !== 'default' && display_type === 'default'"
        >
          <Button
            v-if="mode != 'selection'"
            buttonSize="medium"
            buttonColor="darkBlue"
            buttonText="Создать"
            hasLeftIcon
            iconName="Plus-bold"
            class="button-create"
          />
        </a>
        <Button
          v-if="display_type !== 'default'"
          v-loading="loading"
          buttonSize="medium"
          buttonColor="darkBlue"
          buttonText="Прикрепить"
          class="button-create"
          :disabled="selected.length === 0"
          @click="attach"
        />
        <Tooltip
          content="Импорт кандидатов"
          v-if="mode === 'candidate' && getImportButtonVisible"
        >
          <Button
            buttonSize="medium"
            buttonColor="blue"
            buttonText="Импортировать"
            hasLeftIcon
            iconName="Import"
            @click="showImportDialog"
          />
        </Tooltip>
        <Button
          v-if="
            (mode === 'vacancy' &&
              customFilters.hasOwnProperty('mode_advanced')) ||
            (mode === 'coordination' &&
              customFilters.hasOwnProperty('show_archive_advanced'))
          "
          buttonSize="medium"
          buttonColor="blue"
          buttonText="Архив"
          hasLeftIcon
          :iconName="archiveIcon"
          class="button-archive"
          @click="setShowArchive"
        />
      </div>
      <div
        v-if="
          mode !== 'mailings' &&
          mode !== 'coordination' &&
          attachingCandidates == false
        "
        :class="[
          'dialog-panel__selection',
          mode !== 'selection' ? 'dialog-panel__selection_margin' : ''
        ]"
      >
        <tooltip :content="selectionLabel">
          <div
            class="dialog-panel__checkbox"
            @click="$emit('switchSelect', allSelected)"
          >
            <custom-checkbox
              :value="allSelected"
              class="message__area-checkbox"
              @change="$emit('switchSelect', allSelected)"
            />
          </div>
        </tooltip>
        <span v-if="selected.length > 0" class="select-info">
          Выделено {{ selected.length }}/{{ recordsTotal }}
        </span>
        <span v-else class="dialog-panel__selection-label">
          {{
            loadedLabel !== null
              ? loadedLabel
              : `Показано ${listLength} из ${recordsTotal}`
          }}
        </span>
        <MassActionDropdown
          v-show="
            selected.length &&
            mode != 'vacancy' &&
            massActions.length &&
            !(display_type == 'popup' && mode == 'candidate')
          "
        ></MassActionDropdown>
      </div>
    </div>

    <div
      class="dialog-panel__right"
      v-if="
        ((customFilters.hasOwnProperty('current_user_only_advanced') ||
          customFilters.hasOwnProperty('action_required_advanced')) &&
          mode !== 'selection') ||
        mode === 'mailings' ||
        (mode === 'coordination' &&
          customFilters.hasOwnProperty('action_required_advanced') &&
          customFilters.hasOwnProperty('my_requests_advanced'))
      "
    >
      <div v-if="mode === 'coordination'">
        <p class="filter-text secondary">Требуют действия</p>
        <Switcher
          name="action_required_advanced"
          :model="!!+customFilters.action_required_advanced"
          class="dialog-panel__switcher"
          @switch="
            val => {
              $emit('switch', String(+val), 'action_required_advanced');
              // $emit('switch', String(+val), 'my_requests_advanced');
            }
          "
        />
      </div>
      <div v-if="mode != 'coordination'">
        <p class="filter-text secondary">
          {{ switcherLabel }}
        </p>
        <Switcher
          :name="
            mode === 'coordination'
              ? 'my_requests_advanced'
              : 'current_user_only_advanced'
          "
          :model="
            mode === 'coordination'
              ? !!+customFilters.my_requests_advanced
              : !!+customFilters.current_user_only_advanced
          "
          :disabled="
            !userId ||
            mode == 'candidate' ||
            (mode === 'coordination' &&
              customFilters.action_required_advanced == 0)
          "
          class="dialog-panel__switcher"
          @switch="switchUserItems"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import CustomCheckbox from 'Elements/Checkbox/CustomCheckbox';
import Button from 'Elements/Button/Button';
import Switcher from 'Elements/Switch/Switch';
import Tooltip from 'Elements/Tooltip/Tooltip';
import MassActionDropdown from 'Elements/Select/MassActionDropdown';

export default {
  components: {
    Switcher,
    Button,
    Tooltip,
    CustomCheckbox,
    MassActionDropdown
  },
  props: {
    mode: {
      type: String,
      default: 'default'
    },
    display_type: {
      type: String,
      default: 'default'
    },
    allSelected: {
      type: Boolean,
      default: false
    },
    applyLoading: {
      type: Boolean,
      default: false
    },
    listLength: {
      type: Number,
      default: 0
    },
    loadedLabel: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loading: this.applyLoading,
      selectionLabel: store.state.common.mod.LBL_CHOOSE_ALL
    };
  },
  computed: {
    massActions() {
      return store.state.massAction.actions
        ? store.state.massAction.actions.filter(
            action => action.access == true
          ) || []
        : [];
    },
    getImportButtonVisible() {
      return store.state.candidate.importButtonVisible;
    },
    urlModule() {
      switch (this.mode) {
        case 'vacancy':
          return 'HRPAC_VACANCY';
        case 'candidate':
          return 'HRPAC_CANDIDATES';
        case 'mailings':
          return 'BOT_MAILINGS';
        case 'coordination':
          return 'HRPAC_COORDINATION_REQUESTS';
        default:
          return '';
      }
    },
    recordsTotal() {
      switch (this.mode) {
        case 'candidate':
          return store.state.selectionPopup.popupPageConfig.offsets
            ? store.state.selectionPopup.popupPageConfig.offsets.total
            : 0;
        case 'vacancy':
          return store.state.selectionPopup.popupPageConfig.offsets
            ? store.state.selectionPopup.popupPageConfig.offsets.total
            : 0;
        case 'selection':
          return store.state.selectionPanel.totalCandidates;
        default:
          return 0;
      }
    },
    switcherLabel() {
      switch (this.mode) {
        case 'candidate':
          return 'Мои кандидаты';
        case 'vacancy':
          return 'Мои вакансии';
        case 'mailings':
          return 'Мои рассылки';
        case 'coordination':
          return 'Мои заявки';
        default:
          return '';
      }
    },
    attachingCandidates() {
      return store.state.selectionPopup.attachingCandidates;
    },
    selected() {
      return store.state.common.selected;
    },
    userId() {
      return store.state.common.config.userId;
    },
    customFilters() {
      return store.state.filters.customFilters;
    },
    archiveIcon() {
      return (this.mode === 'coordination' &&
        !!+this.customFilters.show_archive_advanced) ||
        !!+this.customFilters.mode_advanced
        ? 'open-eye'
        : 'close-eye';
    }
  },
  methods: {
    setShowArchive() {
      this.mode === 'coordination'
        ? this.$emit(
            'switch-archive-mode',
            +this.customFilters.show_archive_advanced ? '0' : '1',
            'show_archive_advanced'
          )
        : this.$emit(
            'switch-archive-mode',
            +this.customFilters.mode_advanced ? '0' : '1',
            'mode_advanced'
          );
    },
    switchUserItems(val) {
      this.mode === 'coordination'
        ? this.$emit('switch', String(+val), 'my_requests_advanced')
        : this.$emit('switch', String(+val), 'current_user_only_advanced');
    },
    showImportDialog() {
      store.commit('common/setVisibleDialog', {
        name: 'candidate_import_type_dialog',
        val: true
      });
    },
    attach() {
      this.loading == true;
      this.mode === 'candidate'
        ? this.$emit('saveCandidatesData')
        : this.$emit('saveVacanciesData');
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-panel {
  display: flex;
  justify-content: space-between;
  background: $white;
  border-radius: 6px;
  padding: 28px 16px;
  height: 32px;
  box-sizing: border-box;

  &__left {
    align-items: center;
    display: flex;
  }

  &__right {
    display: flex;

    div {
      display: flex;
      align-self: center;

      &:first-child {
        margin-right: 16px;
      }
    }
  }

  &__checkbox {
    background: $black-10;
    height: 32px;
    min-width: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
  }

  &__switcher {
    height: 24px;
  }

  &__selection {
    display: flex;
    align-items: center;

    &::v-deep .el-submenu__title {
      display: flex;
      align-items: center;
      border-bottom: none !important;
    }

    &_margin {
      margin-left: 24px;
    }
  }

  &__selection-label {
    margin: 0px 8px;
    font-size: 14px;
    line-height: 24px;
    color: $black-200;
  }

  &__buttons {
    min-width: 390px;
  }
}

.button {
  &-create {
    margin-right: 8px;
  }

  &-import,
  &-select-all,
  &-deselect {
    margin: 0 4px 0 0;

    &::v-deep .button-content {
      margin: 0;
      padding: 0;
      width: 32px;
    }
  }
}

.filter-text {
  margin: 0 12px 0 0 !important;
  font-size: 15px !important;
  line-height: 24px;
  color: $black-100;
}

.select-info {
  color: $black-200;
  margin: 0px 8px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}
</style>

<style lang="css">
.dialog-panel__checkbox label {
  margin-bottom: 0;
}
</style>
