<template>
  <el-menu
    ref="menu"
    class="dropdown"
    mode="horizontal"
    @select="checkStages"
    @open="handleOpen"
    menu-trigger="click"
  >
    <el-submenu index="1" class="submenu-1" v-click-outside="close">
      <template slot="title">
        Действия
        <Icon
          class="el-submenu-icon"
          iconName="showMoreArrow"
          iconColor="#0075db"
      /></template>
      <div v-for="action in actions" :key="action.name">
        <el-menu-item
          v-if="action.name === 'export_resume_to_xls' && action.access"
          :index="action.name"
          class="menu-item"
        >
          <span>{{ action.lbl }}</span>
        </el-menu-item>

        <el-menu-item
          v-if="action.name === 'save_resume_to_zip' && action.access"
          :index="action.name"
          class="menu-item"
          :disabled="backgroundResumeLoading"
        >
          <span>{{ action.lbl }}</span>
          <div v-if="backgroundResumeLoading" class="loader">
            <Loader />
          </div>
        </el-menu-item>

        <el-menu-item
          v-if="action.name === 'mass_add_to_vacancy' && action.access"
          :index="action.name"
          class="menu-item"
        >
          <span>{{ action.lbl }}</span>
        </el-menu-item>
        <el-submenu
          v-if="
            action.name === 'mass_change_this_stage_for_candidates' &&
            action.access
          "
          index="1-1"
          class="submenu-2"
        >
          <template slot="title">{{ action.lbl }}</template>
          <el-menu-item
            v-for="stage in massActionStages"
            :key="stage.id"
            :class="['action', { disabled: !stage.available }]"
            :index="stage.id"
          >
            <Icon
              class="el-submenu-icon"
              :iconName="
                stage.direction !== 'this'
                  ? getIcon(stage.direction, stage.available)
                  : ''
              "
              :iconColor="!stage.available ? '#B3BCC6' : '#0075DB'"
            />
            <Tooltip
              popper-class="dark"
              placement="top-start"
              :content="stage.message"
              v-if="stage.direction != 'this' && !stage.available"
            >
              <span>{{ stage.name }}</span>
            </Tooltip>
            <span v-else class="black-text">{{ stage.name }}</span>
          </el-menu-item>
        </el-submenu>
      </div>
    </el-submenu>
  </el-menu>
</template>
<script>
import { Menu, Submenu, MenuItem } from 'element-ui';
import { store } from '@/store';
import Icon from 'Elements/Icon/Icon';
import Tooltip from 'Elements/Tooltip/Tooltip';
import Loader from 'Elements/Loader/Loader';
import { getController, postController } from '@/controllers/request';
import { ACTION, MODULE } from '@/utils/constants';
import { dialogMixin, errorMsg } from '@/utils/mixins';
import { Notification } from 'element-ui';

export default {
  mixins: [dialogMixin, errorMsg],
  data() {
    return {
      backgroundResumeLoading: false
    }
  },
  computed: {
    actions() {
      if (store.state.massAction.actions?.some(
        el => el.name == 'mass_change_this_stage_for_candidates'
      ))
        this.getStages();

      return store.state.massAction.actions || [];
    },
    massActionStages() {
      return store.state.massAction.stages;
    },
    selectedCandidates() {
      return store.state.massAction.selectedCandidates;
    }
  },
  methods: {
    getStages() {
      getController({
        params: {
          module: MODULE.VACANCY_MODULE,
          action: ACTION.GET_STAGES_FOR_MASS_TRANSFER,
          vacancy_id: store.state.vacancy.fields.id.value,
          stage_id: store.state.vacancy.selectedStage.id,
          to_pdf: true
        }
      })
        .then(result => {
          store.commit('massAction/setStages', result.data);
        })
        .catch(err => {
          console.log(err);
        });
    },
    getIcon(direction, available) {
      return available
        ? direction === 'backward'
          ? 'FullArrowLeft'
          : 'FullArrowRight'
        : 'Lock';
    },
    handleOpen() {
      this.backgroundResumeLoading = Boolean(localStorage.getItem('backgroundResumeLoading'));
    },
    checkStages(key) {
      if (key == 'save_resume_to_zip') {
        this.showSaveResumeDialog();
        return;
      }

      if (key == 'export_resume_to_xls') {
        this.showExportResumeDialog();
        return;
      }

      if (key == 'mass_add_to_vacancy') {
        this.showVacancyPopup();
        return;
      }

      let stage = this.massActionStages.find(elem => elem.id == key);
      if (stage.available && stage.direction !== 'this') {
        if (
          key == this.massActionStages[this.massActionStages.length - 1]['id']
        ) {
          this.setVisibleDialog('rejection_dialog', true);
          store.commit('massAction/setNewStage', key);
        } else if (
          store.state.vacancy.selectedStage.id ==
          this.massActionStages[this.massActionStages.length - 1]['id']
        ) {
          this.setVisibleDialog('no_rejection_dialog', true);
          store.commit('massAction/setNewStage', key);
        } else {
          this.switchStage(key);
        }
      }

      for (let i in this.massActionStages) {
        if (this.massActionStages[i]['id'] == key) {
          store.commit(
            'massAction/setStageName',
            this.massActionStages[i]['name']
          );
        }
      }
    },
    async showVacancyPopup() {
      store.commit('massAction/setLoading', true);
      store.commit('common/setSelected', {arr: [], replace: true});
      const params = {
        module: 'HRPAC_VACANCY',
        action: 'Popup',
        jsqon_return: 1,
        to_pdf: true,
        user_id: store.state.common.config.userId,
        status_id_advanced: 'Открыта'
      };

      store.commit('selectionPopup/setBaseParams', params);
      await store.dispatch('selectionPopup/loadPopupData', {
        params: { ...params, lvso: 'DESC' }
      });

      store.commit('selectionPopup/setAttachingCandidates', true);
      this.setVisibleDialog('vacancies_popup', true);
      store.commit('massAction/setLoading', false);
    },
    showExportResumeDialog() {
      this.setVisibleDialog('export_resume_to_xls_dialog', true);
    },
    showSaveResumeDialog() {
      this.setVisibleDialog('mass_save_resume_dialog', true);
    },
    switchStage(key) {
      Notification.closeAll();

      const params = {
        module: MODULE.VACANCY_MODULE,
        action: ACTION.MASS_CHANGE_STAGE,
        vacancy_id: store.state.vacancy.fields.id.value,
        stage_id: key,
        to_pdf: true
      };
      const formData = new FormData();

      for (let key in params) {
        formData.set(key, params[key]);
      }

      for (let candidate of this.selectedCandidates) {
        formData.append('candidates_arr[]', candidate);
      }

      postController({ options: formData })
        .then(resp => {
          if (
            resp.data &&
            resp.data['successfully'] &&
            resp.data['successfully'].length
          ) {
            this.showFullNotification({
              title: 'Этап подбора изменен',
              showClose: true,
              message: `${resp.data['successfully'].length} чел. переведен${
                resp.data['successfully'].length == 1 ? '' : 'ы'
              } на этап “${store.state.massAction.stageName}”`,
              type: 'success',
              customClass: 'success-toast',
              position: 'top-left',
              duration: 0,
              offset: 100
            });
          }

          this.updateStages();
          this.updateFields();
        })
        .catch(err => {
          console.log(err);
        });
    },
    updateFields() {
      getController({
        params: {
          module: MODULE.VACANCY_MODULE,
          action: ACTION.GET_MODULE_FIELDS,
          'fields[]': 'progresbar',
          id: store.state.vacancy.fields.id.value,
          to_pdf: true
        }
      }).then(resp => {
        store.commit('vacancy/setProgressbar', resp.data[0].value);
      });
    },
    updateStages() {
      getController({
        params: {
          module: MODULE.VACANCY_MODULE,
          action: 'getStagesFromVacansy',
          vacancy_id: store.state.vacancy.fields.id.value,
          to_pdf: true
        }
      })
        .then(result => {
          store.commit('vacancy/setParam', {
            name: 'stages',
            val: result.data
          });
          store.commit('vacancy/setParam', {
            name: 'selectedStage',
            val: null
          });
          store.commit('massAction/clearSelectedCandidates');
          store.commit('massAction/setActions', null);
          store.commit('massAction/setSelection', false);
          store.commit('massAction/selectCandidate', {
            arr: [],
            replace: true
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    close() {
      if (this.$refs.menu.openedMenus.length) {
        this.$refs['menu'].closeMenu('1');
      }
    }
  },
  components: {
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-menu-item': MenuItem,
    Icon,
    Tooltip,
    Loader
  }
};
</script>

<style lang="scss" scoped>
.dropdown {
  height: 32px;
  border: none;
  border-radius: 4px;
  width: fit-content;
  background: $blue-10;
}

.el-menu:not(.actions-btn-wrapper):not(.apply-btn-menu) {
  box-shadow: none !important;
}

.menu-item {
  color: $black-200 !important;
  display: flex;
  gap: 8px;

  .loader {
    background: none;
    width: 24px !important;
    height: 24px !important;

    & ::v-deep .circular {
      background: none;
      width: 24px !important;
      height: 24px !important;
    }
  }
}

.menu-item:hover {
  background: $blue-10;
}

.menu-item.is-disabled {
  opacity: 1;

  & ::v-deep span {
    opacity: .25;
  }
}

.submenu-1 {
  height: inherit;

  .el-submenu-icon {
    margin: 0;
  }

  & ::v-deep .el-submenu__title {
    padding: 0px 12px !important;
    height: inherit;
    color: $blue-120 !important;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    font-family: Roboto Medium;
  }

  & ::v-deep i {
    display: none;
  }
}

.submenu-2 {
  height: auto;
  border-radius: 4px;
  border: 1px solid $black-20;

  & ::v-deep .el-submenu__title {
    border-radius: 4px;
    color: $black;
  }

  & ::v-deep .el-submenu__icon-arrow {
    right: 12px;
    margin-top: -5px;
  }

  & ::v-deep .action {
    border-radius: 0 !important;

    span {
      cursor: pointer;
    }
  }

  & ::v-deep .action.disabled {
    color: $black-100;
    cursor: default;
  }
}

.black-text {
  color: $black-200 !important;
}

.dropdown:hover {
  & ::v-deep .el-submenu__title {
    background-color: $blue-20;
    color: $blue-120;
    border-radius: 4px;
  }
}
</style>
