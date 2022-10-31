<template>
  <el-dialog
    ref="dialog"
    v-loading="formLoading"
    :title="title"
    :visible="is_visible"
    :close-on-click-modal="false"
    width="672px"
    @close="resetCallback"
    class="dialog meta-dialog dialog--wide publicator"
  >
    <div class="dialog__content">
      <div v-if="authField" class="auth-form">
        <h4 class="block-title fw-500">Авторизация на карьерных сайтах</h4>
        <p class="auth-form__title">
          Для публикации вакансий авторизуйтесь на карьерном сайте
        </p>

        <div v-if="!selectedEdit">
          <div v-for="(item, idx) in authElements" :key="item.id">
            <AuthorizeForm
              :field="item"
              variant="multi"
              :deleteField="!!idx"
              :platformName="item.name"
              :options="availableOptions"
              :tabs="setAuthTabs"
              :is-popup="true"
              @delete="deleteElement"
              @setFormLoading="value => (formLoading = value)"
            />
          </div>
        </div>
        <div v-else>
          <AuthorizeForm
            :field="editAuth"
            variant="edit"
            :platformName="selectedEdit.work_site.value"
            :options="availableOptions"
            :tabs="setAuthTabs"
            :is-popup="true"
            @delete="deleteElement"
            @setFormLoading="value => (formLoading = value)"
          />
        </div>
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Добавить"
          hasLeftIcon
          :disabled="!availableOptions.length || selectedEdit"
          iconName="Plus-bold"
          class="auth-form__add"
          @click="addAuthItem"
        />
      </div>
      <el-tabs
        v-if="subpanels.length"
        v-model="activeSubpanel.name"
        @tab-click="tabClick($event)"
        v-loading="activeSubpanel.loading"
        class="big"
        :class="subpanels.length === 1 ? 'is-only' : ''"
      >
        <el-tab-pane
          v-for="tab in subpanels"
          :ref="tab.name"
          :key="`1_${tab.name}`"
          :label="workSiteLabel(tab.label)"
          :name="tab.name"
          :lazy="false"
        >
          <MetadataForm
            :ref="`form-${tab.name}`"
            :defaultParams="
              tab.name
                ? { ...defaultParams, work_site: tab.name }
                : defaultParams
            "
            field-size="big"
            @savedFormData="onSavedFormData"
            @reset-callback="resetCallback"
            :data="selectedPublishedVacancy || null"
            @setFormLoading="
              value => {
                (formLoading = value), (activeSubpanel.loading = value);
              }
            "
            class="publicator-form"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div slot="footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        :buttonText="publishButtonText"
        @click="submit('publish')"
        class="publish-button"
      />

      <Button
        buttonSize="big"
        buttonColor="blue"
        :buttonText="buttonText"
        @click="submit('save')"
      />
    </div>
  </el-dialog>
</template>

<script>
import { store } from '@/store';
import { Tabs, TabPane } from 'element-ui';
import { Dialog } from 'element-ui';
import MetadataForm from './MetadataForm';
import AuthorizeForm from 'Elements/AuthorizeForm/AuthorizeForm';
import { errorMsg } from '@/utils/mixins';
import { MODULE, PUBLICATOR_STATUS } from '@/utils/constants';
import Button from 'Elements/Button/Button';
import authField from './authorise.json';

export default {
  mixins: [errorMsg],
  props: {
    is_visible: {
      type: Boolean
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultParams: {
        module: MODULE.HRPAC_PUBLISHED_VACANCY,
        action: 'savePublishedVacancy',
        'fields[id]': '',
        jsqon_return: 1,
        to_pdf: true
      },
      editVacancy: {},
      formLoading: true,
      authField,
      contentBodyHeight: 0,
      loadedTab: [],
      subpanels: [],
      activeSubpanel: {},
      options: {}
    };
  },
  created() {
    if (!this.authElements.length && !this.selectedEdit) {
      store.commit('publicator/setAuthForm', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
      store.commit('publicator/setAvailableOptions', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
      this.setAuthTabs();
      store.dispatch('publicator/checkAuth', 'hh');
    } else {
      this.setAuthTabs();
    }
  },
  mounted() {
    if (this.selectedPublishedVacancy) {
      this.defaultParams = {
        ...this.defaultParams,
        id: this.selectedPublishedVacancy.id.value,
        'fields[id]': this.selectedPublishedVacancy.id.value
      };
    } else {
      this.$set(this.defaultParams, 'prefill[vacancy_id]', this.data.id.value);

      this.$set(this.defaultParams, 'work_site', 'hh');
    }

    this.activeSubpanel = { ...this.subpanels.find(tab => tab.name == 'hh') };
    this.tabClick({ ...this.activeSubpanel, index: '0' });
  },
  computed: {
    editAuth() {
      const work_site = this.selectedEdit
        ? this.selectedEdit.work_site.value
        : '';
      const auth =
        work_site != ''
          ? this.authElements.filter(item => item.name === work_site)
          : '';
      if (auth.length) {
        this.editSubpanels(work_site);

        return auth[0];
      } else if (work_site) {
        store.commit('publicator/setAuthForm', {
          name: work_site
        });

        this.setAuthTabs();
        this.editSubpanels(work_site);
        store.dispatch('publicator/checkAuth', work_site);
        return this.authElements.filter(item => item.name === work_site)[0];
      } else {
        return '';
      }
    },
    selectedEdit() {
      return store.state.publicator.selectedPublishedVacancy;
    },
    availableOptions() {
      return store.state.publicator.work_site_list;
    },
    authElements() {
      return store.state.publicator.authForm;
    },
    title: function () {
      const status = this.selectedPublishedVacancy
        ? this.selectedPublishedVacancy.status.value
        : '';

      return status == PUBLICATOR_STATUS.ARCHIVED
        ? 'Публикация вакансиии из архива'
        : status == PUBLICATOR_STATUS.DRAFT
        ? 'Публикация вакансиии из черновика'
        : status == PUBLICATOR_STATUS.DELETED
        ? 'Публикация вакансии из удаленных'
        : 'Публикация вакансии';
    },
    buttonText() {
      const status = this.selectedPublishedVacancy
        ? this.selectedPublishedVacancy.status.value
        : '';

      return status == PUBLICATOR_STATUS.ARCHIVED
        ? 'Сохранить изменения'
        : status == PUBLICATOR_STATUS.DRAFT
        ? 'Сохранить изменения'
        : status == PUBLICATOR_STATUS.DELETED
        ? 'Сохранить как черновик'
        : 'Сохранить как черновик';
    },
    publishButtonText() {
      const status = this.selectedPublishedVacancy
        ? this.selectedPublishedVacancy.status.value
        : '';

      return status == PUBLICATOR_STATUS.PUBLISHED
        ? 'Изменить публикацию'
        : status == PUBLICATOR_STATUS.DRAFT
        ? 'Опубликовать'
        : 'Опубликовать';
    },
    selectedPublishedVacancy() {
      return store.state.publicator.selectedPublishedVacancy || null;
    },
    billingType() {
      return store.state.publicator.billingType;
    }
  },
  methods: {
    editSubpanels(work_site) {
      this.subpanels = this.subpanels.filter(item => item.name === work_site);
      this.activeSubpanel = this.subpanels.filter(
        item => item.name === work_site
      )[0];
    },
    workSiteLabel(label) {
      return label == 'hh'
        ? 'HH.ru'
        : label == 'avito'
        ? 'Avito'
        : label == 'superjob'
        ? 'SuperJob'
        : label;
    },
    deleteElement(payload) {
      this.formLoading = true;
      store.commit('publicator/setDeleteAuthElement', {
        id: payload.id
      });
      store.commit('publicator/setAvailableOptions', { name: payload.name });
      this.setAuthTabs(payload.name);
    },
    setAuthTabs(deleteTabName, stopLoading = false) {
      this.formLoading = true;
      let result = [];
      this.authElements.map((item, idx) => {
        const newItem = {
          id: idx,
          label: item.name,
          name: item.name.toLowerCase(),
          loading: false,
          lazy: false
        };

        result = [...result, { ...newItem }];
      });

      let newResult = result;

      if (this.subpanels.length > 0) {
        if (this.subpanels.length >= newResult.length) {
          for (let item in this.subpanels) {
            if (
              newResult[item] &&
              newResult[item].name !== this.subpanels[item].name
            ) {
              this.loadedTab[item] = '0';

              if (
                this.activeSubpanel.name == this.subpanels[item].name &&
                this.activeSubpanel.name != newResult[item].name
              ) {
                this.activeSubpanel = newResult[item];
                this.loadedTab[item] = newResult[item].name;
              }
            }
          }
        }

        this.subpanels = newResult;
      } else {
        this.subpanels = newResult;
        if (this.subpanels[0]) {
          this.loadedTab.push(this.subpanels[0].name);
          this.activeSubpanel = { ...this.subpanels[0] };
        }
      }

      if (this.activeSubpanel.name == deleteTabName) {
        this.activeSubpanel = { ...this.subpanels[this.subpanels.length - 1] };
      }

      if (stopLoading) this.formLoading = false;
    },
    tabClick(tab) {
      this.activeSubpanel = { ...this.subpanels[tab.index] };

      if (this.loadedTab.indexOf(this.activeSubpanel.name) >= 0) {
        this.activeSubpanel.loading = false;
      } else {
        this.loadedTab.push(this.activeSubpanel.name);
      }
    },
    async submit(action) {
      this.formLoading = true;
      const validForms = [];

      for (let index = 0; index < this.subpanels.length; index++) {
        const tab = this.subpanels[index];
        const context = this.$refs['form-' + tab.name][0];

        try {
          const result = await context.saveForm('form', tab.name);
          store.commit('publicator/setSendData', {
            workSite: tab.name,
            form: context.form
          });
          validForms.push(result);
          if (!result) {
            this.tabClick({ ...tab, index });

            // повторный скролл к полю после переключения вкладки
            this.$nextTick(() =>
              setTimeout(
                async () => await context.saveForm('form', tab.name),
                0
              )
            );
            this.formLoading = false;
            break;
          } else if (
            result &&
            index == this.subpanels.length - 1 &&
            validForms.length > 0 &&
            validForms.every(valid => !!valid)
          ) {
            if (this.editAuth != '' && !this.editAuth.authData.work_site) {
              setTimeout(
                () =>
                  this.showNotification({
                    offset: 100,
                    showClose: true,
                    duration: 10000,
                    message:
                      'Для продолжения требуется авторизация на работном сайте ' +
                      this.workSiteLabel(this.editAuth.name),
                    type: 'error'
                  }),
                500
              );

              this.formLoading = false;
              break;
            } else if (
              this.authElements.some(
                item => !Object.keys(item.authData).length
              ) &&
              this.editAuth == ''
            ) {
              this.authElements.filter(item =>
                !Object.keys(item.authData).length
                  ? setTimeout(
                      () =>
                        this.showNotification({
                          offset: 100,
                          showClose: true,
                          duration: 10000,
                          message:
                            'Для продолжения требуется авторизация на работном сайте ' +
                            this.workSiteLabel(item.name),
                          type: 'error'
                        }),
                      500
                    )
                  : null
              );
              this.formLoading = false;
              break;
            }
            if (action === 'publish') {
              await this.publish();
            } else if (action === 'save') {
              await this.saveChanges();
            }
            this.formLoading = false;
            store.state.common.detachedForm.fields.language_level = [];
          }
        } catch (error) {
          this.$set(validForms, tab.name, false);
          // повторный скролл к полю после переключения вкладки
          this.tabClick({ ...tab, index });
          this.$nextTick(() =>
            setTimeout(async () => await context.saveForm('form', tab.name), 0)
          );
          validForms.push(false);
          this.formLoading = false;
          break;
        }
      }
    },
    async publish() {
      const status = this.selectedPublishedVacancy
        ? this.selectedPublishedVacancy.status.value
        : '';
      if (
        this.defaultParams['fields[id]'] &&
        status == PUBLICATOR_STATUS.DRAFT
      ) {
        this.$set(this.defaultParams, 'publish', true);
        if (this.$refs[0]) {
          this.$set(
            this.defaultParams,
            'work_site',
            this.$refs[0][0].$children[0].metaData.hidden_fields[1].value
          );
        }
      } else {
        this.$set(this.defaultParams, 'publish', true);
      }

      await store.dispatch(
        'publicator/savePublishedVacancy',
        this.defaultParams
      );
      this.$emit('save-callback');

      this.$emit('reset-callback');
    },
    async saveChanges() {
      this.$set(this.defaultParams, 'only_publish', false);
      this.$set(this.defaultParams, 'publish', false);

      await store.dispatch(
        'publicator/savePublishedVacancy',
        this.defaultParams
      );
      this.$emit('save-callback');

      this.$emit('reset-callback');
    },

    addAuthItem() {
      store.commit('publicator/setAuthForm', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
      store.commit('publicator/setAvailableOptions', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
      this.setAuthTabs();
    },
    resetCallback() {
      store.commit('publicator/setSelectedPublishedVacancy', null);
      this.$emit('reset-callback');
      store.state.common.detachedForm.fields.language_level = [];
    }
  },
  watch: {
    billingType(value) {
      this.$set(this.defaultParams, 'billing_type', value);
    }
  },
  components: {
    'el-dialog': Dialog,
    AuthorizeForm,
    MetadataForm,
    Button,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  }
};
</script>
<style lang="scss" scoped>
#front .dialog {
  & ::v-deep .el-dialog {
    &__body {
      max-height: calc(100% - 162px) !important;

      .auth-form {
        background-color: $black-10;
        padding: 20px 32px 24px 32px;
        margin-bottom: 24px;

        &__title {
          font-weight: normal;
          font-size: 14px;
          line-height: 20px;
          color: $black-100;
          margin-bottom: 12px;
        }

        &__add {
          margin-top: 12px;
        }
      }

      .el-tabs {
        padding: 0;

        &__header {
          padding: 0 32px;
        }
      }

      .publicator-form {
        padding: 32px;

        .buttons-panel {
          display: none;
        }

        .el-switch {
          justify-content: space-between;
        }

        .panel-row--switch {
          &:first-of-type {
            padding-top: 12px;
          }

          &:not(:last-child) {
            padding-bottom: 16px;
            border-bottom: 1px solid $black-20;
          }
        }
      }

      .publicator-form,
      .auth-form {
        h4 {
          margin-top: 0;
        }

        .block-title {
          color: $black-200;
          font-weight: 500;
          font-size: 18px;
          line-height: 28px;
          text-align: left;
          margin: 0;
          margin-bottom: 12px;
          padding: 0;
        }
      }
    }

    &__footer {
      padding: 24px !important;
      border: 1px solid #e9edf2;
      border-radius: 0px 0px 6px 6px;
      margin-top: 0 !important;

      .footer {
        justify-content: flex-start !important;

        .publish-button {
          flex: 0 !important;
          margin-right: 8px;
        }
      }
    }
  }
}

.publicator {
  height: 100%;

  & ::v-deep .panel-row > .form-field:not(:only-child) {
    width: calc(50% - 6px);

    &:first-child {
      margin-right: 12px;
    }
  }
}
</style>
