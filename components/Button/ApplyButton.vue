<template>
  <el-menu
    ref="menu2"
    :collapse="true"
    mode="horizontal"
    menu-trigger="click"
    :unique-opened="true"
    class="apply-btn-menu"
    :class="{
      blocked: disabled
    }"
  >
    <el-submenu
      index="1"
      v-click-outside="close"
      popper-class="apply-btn-menu-list"
      popper-append-to-body
      :disabled="loading"
    >
      <template slot="title">
        <!-- <el-popover placement="top" width="400" trigger="click">
    <div v-loading="loading" class="vacancies-list">
      <span v-if="!vacancies.length || disabled" disabled>
        {{ loading ? 'Список грузится' : 'Нет данных' }}
      </span>
      <ul
        v-else
        v-for="vacancy in vacancies"
        :key="vacancy.ID"
        :data-id="vacancy.ID"
        @click="selectVacancy(vacancy)"
        class="el-dropdown-menu el-popper shadow-lvl-2"
      >
        <el-link :underline="false" v-html="vacancyInfo(vacancy)"></el-link>
      </ul>
    </div> -->
        <ButtonEl
          v-loading="loading"
          slot="reference"
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Прикрепить к вакансии"
          :full-width="true"
          :disabled="disabled"
          @click.once="load"
          class="footer-bar__button"
        />
        <!-- </el-popover> -->
      </template>
      <el-menu-item
        v-if="!vacancies.length || disabled"
        disabled
        class="empty-list"
      >
        {{ loading ? 'Список грузится' : 'Список вакансий пуст' }}
      </el-menu-item>
      <el-menu-item
        v-for="vacancy in vacancies"
        :key="vacancy.ID"
        :data-id="vacancy.ID"
        :index="vacancy.ID"
        @click="selectVacancy(vacancy)"
      >
        <el-link :underline="false" v-html="vacancyInfo(vacancy)"></el-link>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</template>
<script>
import { store } from '@/store';
import { Menu, MenuItem, Submenu, Link } from 'element-ui';
import { getController } from '@/controllers/request.js';
import { mixin } from '@/utils/mixins';
import { listUrlParams } from '@/utils/helpers';
import { ACTION, MODULE } from '@/utils/constants';
import ButtonEl from 'Elements/Button/Button';

export default {
  mixins: [mixin],
  data() {
    return {
      vacancies: [],
      loading: false
    };
  },
  computed: {
    disabled() {
      return store.state.candidate.blockedApplyVacancies || false;
    },
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    }
  },
  methods: {
    close() {
      if (this.$refs.menu2.openedMenus.length) {
        this.$refs['menu2'].closeMenu('1');
      }
    },
    open() {
      this.$refs['menu2'].openMenu('1');
    },
    async load() {
      this.loading = true;
      this.close();

      const result = await getController({
        params: {
          ...listUrlParams(
            MODULE.VACANCY_MODULE,
            MODULE.CANDIDATES_MODULE,
            store.state.candidate.fields.id.value
          ),
          status_id_advanced: 'Открыта'
        }
      })
        .then(resp => {
          const respData = resp.data.data.data;
          const vacancies = Array.isArray(respData)
            ? respData
            : Object.values(respData);
          this.vacancies = vacancies || [];

          return true;
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка загрузки списка вакансий для подбора',
            'vacancy list loading'
          )
        );

      if (result) this.loading = false;
      setTimeout(() => this.open(), 500);
    },
    vacancyInfo(vacancy) {
      const isStack = vacancy.STACK_SKILLS_IDS
        ? `,&nbsp;${vacancy.STACK_SKILLS_IDS.split(',').join(', ')}`
        : '';
      const isProject = vacancy.PROJECT_LINK_ID
        ? `,&nbsp;${vacancy.PROJECT_LINK_ID}`
        : '';
      const isManager = vacancy.MANAGER_ID
        ? `,&nbsp;${vacancy.MANAGER_ID}`
        : '';
      return '<p>' + vacancy.NAME_ID + isStack + isProject + isManager + '</p>';
    },
    selectVacancy(vacancy) {
      if (!this.requestSent) {
        const { action, module, record } = this.urlParams;
        this.requestSent = true;
        getController({
          params: {
            module,
            action: ACTION.SAVE2,
            record,
            subpanel_id: vacancy.ID,
            value: action || ACTION.DETAIL_VIEW,
            http_method: 'get',
            isDuplicate: false,
            inline: 1,
            select_entire_list: 0,
            child_field: MODULE.HRPAC_VACANCY_HRPAC_CANDIDATES_1,
            subpanel_field_name: MODULE.HRPAC_VACANCY_HRPAC_CANDIDATES_1,
            subpanel_module_name: MODULE.HRPAC_VACANCY_HRPAC_CANDIDATES_1,
            refresh_page: 1
          }
        })
          .then(() => location.reload())
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при отборе на вакансию',
              'vacancy selection'
            )
          )
          .finally(() => (this.requestSent = false));
      }
    }
  },
  components: {
    'el-menu': Menu,
    'el-menu-item': MenuItem,
    'el-submenu': Submenu,
    'el-link': Link,
    ButtonEl
  }
};
</script>
<style lang="scss">
.actions-btn-wrapper .el-button {
  align-self: stretch;
  -ms-grid-row-align: center;
}

.apply-btn-menu {
  &.blocked {
    pointer-events: none;
  }

  .el-button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
  }

  &.el-menu {
    border: none;
    width: 100%;

    & > .el-submenu .el-submenu__title {
      border: none;
      padding: 0 !important;
      height: auto;
    }
  }

  & > .el-menu-item span,
  &.el-menu--collapse > .el-submenu > .el-submenu__title span {
    visibility: visible;
    width: 100%;
    height: auto;
  }

  .el-submenu {
    width: 100%;
  }

  .el-button {
    display: flex;
    width: 100%;
    opacity: 1;
  }

  &-list {
    max-width: 500px;
    max-height: 500px;
    overflow-x: hidden;
    overflow-y: auto;
    text-align: left;

    .el-menu-item .el-link {
      max-width: 100%;
      overflow: hidden;
      justify-content: flex-start;

      &,
      & > *:last-child {
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}

.el-menu .empty-list {
  opacity: 1;
}
</style>
