<template>
  <div class="publicator">
    <div class="publicator__row">
      <div class="publicator__row-wrapper">
        <Avatar class="info__avatar" :url="getAvatarImage" :size="40" />
        <div class="publicator__row-wrapper-button">
          <Button
            buttonSize="big"
            buttonColor="blue"
            :buttonText="statusButton.status"
            :disabled="statusButton.disabled"
            class="accept-button"
            @click="handleCommand('refresh')"
          />
        </div>

        <div class="publicator__row-wrapper-content">
          <a
            :href="`https://${item.url.value}` || 'javascript:void(0)'"
            class="content__title fw-500"
            target="_blank"
            >{{ item.name.value | format }}</a
          >
          <p class="content__text secondary">
            {{
              item.area_name.value
                ? `${item.area_name.value}`
                : `${item.area.value}`
            }}
            {{
              item.updated_at.value
                ? `, обновлено ${item.updated_at.value}`
                : ' '
            }}
          </p>
        </div>
      </div>
      <ActionsMenu
        :actions="getCurrentActions"
        :handle-command="handleCommand"
        color="#CDD4DA"
        class="publicator__actions"
      />
    </div>
    <PublicatorDeleteDialog
      v-if="is_visible.publicator_delete_dialog"
      @reset-callback="closeDialog('publicator_delete_dialog', null)"
      :external_id="item.external_id.value"
      :vacancy_id="item.id.value"
      :work_site="item.work_site.value"
      :is_visible="visibleDeletePopup"
    />
    <PublicatorRefreshDialog
      @reset-callback="visibleRefreshPopup = false"
      :external_id="item.external_id.value"
      :work_site="item.work_site.value"
      :is_visible="visibleRefreshPopup"
    />
  </div>
</template>

<script>
import Button from 'Elements/Button/Button';
import Avatar from 'Elements/Avatar/Avatar';
import { store } from '@/store';
import PublicatorDeleteDialog from 'Elements/Dialog/PublicatorDeleteDialog';
import PublicatorRefreshDialog from 'Elements/Dialog/PublicatorRefreshDialog';
import ActionsMenu from 'Elements/Menu/ActionsMenu';
import { mixin, errorMsg } from '@/utils/mixins';
export default {
  components: {
    PublicatorRefreshDialog,
    PublicatorDeleteDialog,
    Avatar,
    Button,
    ActionsMenu
  },
  mixins: [mixin, errorMsg],
  data() {
    return {
      vacancyActions: [
        {
          id: 'edit',
          name: 'Редактировать'
        },
        {
          id: 'edit_publish',
          name: 'Редактировать и опубликовать'
        },
        {
          id: 'toArchive',
          name: 'В архив'
        },
        {
          id: 'publish',
          name: 'Опубликовать'
        },
        {
          id: 'delete',
          name: 'Удалить'
        }
      ],
      statusButton: {
        disabled: false,
        status: 'Обновить'
      },
      visibleDeletePopup: false,
      visibleRefreshPopup: false
    };
  },
  props: {
    index: Number,
    item: {
      type: Object
    }
  },
  methods: {
    closeDeletePopup() {
      this.visibleDeletePopup = false;
    },
    btnConfig() {
      if (this.item.status.value === 'published') {
        this.statusButton.status = 'Обновить';
        this.statusButton.disabled = false;
      }
      if (this.item.status.value === 'archived') {
        this.statusButton.status = 'В архиве';
        this.statusButton.disabled = true;
      }
      if (this.item.status.value === 'draft') {
        this.statusButton.status = 'Черновик';
        this.statusButton.disabled = true;
      }
      if (this.item.status.value === 'deleted') {
        this.statusButton.status = 'Удалена';
        this.statusButton.disabled = true;
      }
    },
    handleCommand(command) {
      store.commit('publicator/setVacancyItem', this.item);

      switch (command) {
        case 'toArchive':
          if (!this.auth.length) {
            return store.dispatch('common/catchError', {
              msg: 'Требуется авторизация'
            });
          } else {
            if (this.auth[0].authData && !this.auth[0].authData.employer) {
              return store.dispatch('common/catchError', {
                msg: 'Текущий пользователь не является работодателем'
              });
            } else {
              store.dispatch('publicator/archivePublishedVacancy', {
                external_id: this.item.external_id.value,
                employer_id: this.auth[0].authData.employer.id,
                work_site: this.item.work_site.value
              });
            }
          }

          break;
        case 'delete':
          if (!this.auth.length || !Object.keys(this.auth[0].authData).length) {
            return store.dispatch('common/catchError', {
              msg: 'Требуется авторизация'
            });
          } else {
            if (
              this.auth[0].authData &&
              !this.auth[0].authData.employer &&
              this.item.status.value != 'draft'
            ) {
              return store.dispatch('common/catchError', {
                msg: 'Текущий пользователь не является работодателем'
              });
            } else {
              store.commit('publicator/setSelectedPublishedVacancy', this.item);
              this.is_visible.publicator_delete_dialog = true;
              this.visibleDeletePopup = true;
            }
          }

          break;
        case 'refresh':
          if (!this.auth.length) {
            return store.dispatch('common/catchError', {
              msg: 'Требуется авторизация'
            });
          } else {
            if (this.auth[0].authData && !this.auth[0].authData.employer) {
              return store.dispatch('common/catchError', {
                msg: 'Текущий пользователь не является работодателем'
              });
            } else {
              this.visibleRefreshPopup = true;
            }
          }

          break;
        case 'publish':
          if (this.item.status.value === 'draft') {
            store.dispatch('publicator/savePublishedVacancy', {
              ...this.item,
              only_publish: true
            });
          } else {
            store.dispatch('publicator/copyPublishedVacancy', {
              external_id: this.item.external_id.value,
              work_site: this.item.work_site.value
            });
          }
          break;
        case 'edit':
          store.commit('publicator/setSelectedPublishedVacancy', this.item);
          this.is_visible.publicator_dialog = true;
          break;

        case 'edit_publish':
          store.commit('publicator/setSelectedPublishedVacancy', this.item);
          this.is_visible.publicator_dialog = true;
          break;

        default:
          break;
      }
    }
  },
  computed: {
    getAvatarImage() {
      let site = this.item.work_site.value;
      if (site == 'hh') {
        return 'front/src/assets/img/hh.png';
      } else if (site == 'superjob') {
        return 'front/src/assets/img/superjob.png';
      } else if (site == 'avito') {
        return 'front/src/assets/img/avito.png';
      } else {
        return 'front/src/assets/img/head_hunter.png';
      }
    },

    auth() {
      return store.state.publicator.authForm.filter(
        el => el.name === this.item.work_site.value
      );
    },
    authorized() {
      return store.state.publicator.authForm;
    },
    isEmployer() {
      return store.state.publicator.hhData.is_employer;
    },
    is_visible() {
      return store.state.common.visible_dialog;
    },
    getCurrentActions() {
      return (
        (this.item.status.value === 'published' &&
          this.vacancyActions.filter(
            item =>
              item.id !== 'edit_publish' &&
              item.id !== 'publish' &&
              item.id !== 'delete'
          )) ||
        (this.item.status.value === 'archived' &&
          this.vacancyActions.filter(
            item =>
              item.id !== 'edit_publish' &&
              item.id !== 'toArchive' &&
              item.id !== 'edit'
          )) ||
        this.vacancyActions.filter(
          item => item.id !== 'edit' && item.id !== 'toArchive'
        )
      );
    },
    dateModifer() {
      if (!this.item.published_at.value) return;
      return this.item.published_at.value.split(' ').shift();
    }
  },
  beforeMount() {
    this.btnConfig();
  }
};
</script>
<style lang="scss" scoped>
.publicator {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 4px;
  padding: 12px;
  align-items: center;

  &:hover {
    background: $blue-10;

    .publicator__row {
      &-wrapper-content {
        a {
          color: $blue-120;
        }
      }
    }
  }

  &__row {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    &-wrapper {
      display: flex;
      width: 100%;

      &-button {
        width: 17%;
      }

      .info__avatar {
        margin-right: 16px;
      }

      &-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: 16px;

        a {
          color: $black-200;
          max-width: 468px;
        }
      }

      &-download {
        height: 48px;
        width: 48px;

        &::v-deep .button-content {
          margin: 0;
        }
      }

      &-delete {
        margin: 0 12px 0 0;
        display: none;

        &::v-deep .button-content {
          margin: 0;
        }
      }
    }
  }
}

.document:hover .document__row-delete,
.document .document__row-delete.is-visible {
  margin: 0 12px 0 0;
  display: inline;
}

.content {
  &__title {
    margin: 0;
    font-size: 16px;
    color: $blue-120;
    line-height: 24px;
  }

  &__text {
    margin: 0;
    font-size: 14px;
    // color: $black-40;
    line-height: 20px;
    font-weight: normal;
  }
}
</style>
