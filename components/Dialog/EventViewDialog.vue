<template>
  <el-dialog
    ref="dialog"
    :title="isEvent ? 'Встреча' : 'Напоминание'"
    :visible="is_visible"
    :close-on-click-modal="true"
    width="483px"
    @close="cancel"
    class="dialog meta-dialog"
  >
    <div class="dialog__content" v-loading="loading">
      <h3 class="fz-18 bold">
        {{
          loading
            ? 'Информация загружается'
            : (metaData.bean && metaData.bean.name.value) ||
              (isEvent ? 'Встреча' : 'Напоминание') | format
        }}
      </h3>
      <div class="event-info" v-if="metaData.panels">
        <template v-for="panel in metaData.panels">
          <div
            :key="panel.panel_id"
            class="event-info__panel"
            v-if="panel.panel_id != 'lbl_files_panel'"
          >
            <div
              v-for="(row, i) in panel.rows"
              v-show="
                !Array.isArray(row[0].value)
                  ? row[0].value
                  : row[0].value && row[0].value.length
              "
              :key="panel.panel_id + '_' + i"
              class="event-info__row fz-16"
            >
              <div class="event-info__field-name secondary">
                {{ row[0].lbl }}
              </div>
              <div class="event-info__field-value primary">
                <span
                  v-if="!Array.isArray(row[0].value)"
                  v-html="formatHtml(row[0].value)"
                >
                </span>
                <div v-else v-for="item in row[0].value" :key="item.id">
                  {{
                    `${item.last_name} ${item.first_name} ${item.middle_name}`.trim()
                      | format
                  }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-else-if="
              isEvent &&
              panel.panel_id == 'lbl_files_panel' &&
              panel.rows[0][0].value &&
              panel.rows[0][0].value.length &&
              panel.rows[0][0].value.some(f => !!f.id.value)
            "
            :key="panel.panel_id"
            class="event-files"
          >
            <div v-for="(row, i) in panel.rows" :key="panel.panel_id + '_' + i">
              <DocumentRow
                v-for="(file, i) in row[0].value"
                v-show="!!file.id.value"
                :key="file.id.value"
                :document="file"
                :index="i"
                :details-text="fileSize(file)"
                :document-link="`/index.php?entryPoint=download&id=${file.id.value}&type=Notes`"
                :document-name="file.name.value || file.filename.value"
                :allow-remove="false"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div
      class="other-event"
      v-if="
        metaData.bean &&
        metaData.bean.calendar_type &&
        metaData.bean.calendar_type.value != 'talentforce'
      "
    >
      <div v-if="!isAuthor" class="other-event__info">
        Событие было создано в другой системе. Отредактировать его можно только
        в
        {{
          metaData.bean.calendar_type.options[metaData.bean.calendar_type.value]
        }}
        календаре.
      </div>
      <div
        class="other-event__warn"
        v-if="
          metaData.bean.has_external_attachments &&
          metaData.bean.has_external_attachments.value
        "
      >
        <Icon iconName="fill-warning" />
        <p>
          Встреча содержит вложения. Для просмотра вложений перейдите в
          {{
            metaData.bean.calendar_type.options[
              metaData.bean.calendar_type.value
            ]
          }}
          календарь.
        </p>
      </div>
    </div>
    <div slot="footer" v-if="metaData.buttons_menu">
      <div class="footer buttons-panel footer--auto-width">
        <Button
          v-for="btn in metaData.buttons_menu[0]"
          :key="btn.id"
          buttonSize="big"
          :buttonColor="buttonParams(btn).btnColor"
          :buttonText="btn.name"
          :hasLeftIcon="true"
          :iconName="buttonParams(btn).icon"
          :iconColor="buttonParams(btn).iconColor"
          @click.prevent="buttonParams(btn).callback()"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { getController } from '@/controllers/request.js';
import { MODULE, ACTION } from '@/utils/constants';
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
import DocumentRow from 'Elements/Document/DocumentRow';
import Icon from 'Elements/Icon/Icon';

export default {
  mixins: [mixin],
  props: {
    is_visible: {
      type: Boolean
    },
    params: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      metaData: {},
      selectedEventData: {},
      loading: true
      // uploadedFiles: [
      //   { id: 1, name: 'File number one', size: 6666666 },
      // ]
    };
  },
  created() {
    getController({
      params: {
        action: ACTION.GET_DETAILVIEW,
        to_pdf: true,
        ...this.params
      }
    })
      .then(resp => {
        if (!resp.data || typeof resp.data !== 'object') return;

        const { bean, metadata, metaData, user_dat_format } = resp.data;
        const meta = metadata || metaData;

        meta.panels.forEach(panel => {
          panel.rows.forEach(row => {
            row.forEach(field => {
              if (field.type == 'group') {
                field.fields.forEach(f => {
                  this.setValueByType(f, user_dat_format);
                });

                if (field.fields.every(f => f.type == 'datetime' && f.value)) {
                  field.value = field.fields
                    .map((f, i) =>
                      !!i &&
                      f.value.split(' ')[0] ==
                        field.fields[0].value.split(' ')[0]
                        ? f.value.split(' ')[1]
                        : f.value
                    )
                    .join(' — ');
                }
              }
              this.setValueByType(field, user_dat_format);
            });
          });
        });

        this.metaData = {
          ...meta,
          bean,
          buttons_menu: meta.buttons_menu
        };
        this.selectedEventData = bean;
        if (this.params.reminder_id) {
          this.$set(
            this.selectedEventData,
            'reminder_id',
            this.params.reminder_id
          );
        }
      })
      .catch(err => {
        this.catchError(
          err,
          'Возникла ошибка получения данных',
          'get form data'
        );
      })
      .finally(() => {
        this.loading = false;
      });
  },
  mounted() {
    // отслеживание изменения высоты попапа (изм-е DOM и стилей) с целью фиксации
    // deprecated method, maybe it needs the ResizeObserver
    const dialog = this.$refs.dialog?.$el;
    dialog.addEventListener('DOMSubtreeModified', this.resizeDialog, false);
    // bad cross-browser support
    dialog.addEventListener('transitionend', this.resizeDialog, false);
  },
  computed: {
    dialogMounted() {
      return store.state.common.metaDialogLoaded;
    },
    isEvent() {
      return this.params.module == MODULE.HRPAC_EVENT;
    },
    isAuthor() {
      return (
        this.metaData.bean?.current_user?.value?.id ==
        this.metaData.bean?.created_by?.value
      );
    }
  },
  methods: {
    setValueByType(f, format) {
      if (f.type == 'datetime' && f.value) {
        const date = f.value.split(' ')[0];
        const time = f.value.split(' ')[1].slice(0, 5);
        f.value = `${this.formatDate(
          this.rawDate(date, format),
          format
        )} ${time}`;
      } else if (f.value && typeof f.value == 'string') {
        f.value = this.formatHtml(f.value);
      }
    },
    closePopup() {
      this.$emit('confirm-close');
    },
    makeDecision(decision) {
      getController({
        params: {
          module: this.params.module,
          action: 'MakeDecision',
          event_id: this.params.event_id,
          external_event_id: this.params.external_event_id,
          calendar_type: this.params.calendar_type,
          decision,
          to_pdf: true
        }
      })
        .then(resp => {
          if (resp.data?.data?.result && resp.data.status == 'ok') {
            this.cancel();
            location.reload();
          } else if (resp.data.status == 'error') {
            this.catchError(resp.data.code, resp.data.message, 'make decision');
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка при принятии решения',
            'make decision'
          )
        );
    },
    cancel() {
      this.closePopup();
      this.$emit('reset-selected-event');
    },
    cancelByAuthor() {
      // only author
      getController({
        params: {
          module: this.params.module,
          action: 'CancelEvent',
          event_id: this.params.event_id,
          to_pdf: true
        }
      })
        .then(resp => {
          if (!resp.data || typeof resp.data !== 'object') return;

          if (resp.data.status == 'ok' && resp.data.data) {
            this.cancel();
            location.reload();
          } else if (resp.data.status == 'error') {
            this.catchError(
              resp.data.code,
              resp.data.message,
              'cancel event bad code'
            );
          }
        })
        .catch(err => {
          this.catchError(
            err,
            'Возникла ошибка при отмене встречи',
            'cancel event'
          );
        });
    },
    buttonParams(btn) {
      switch (btn.id) {
        case 'accept_event':
          return {
            btnColor: 'darkBlue',
            icon: 'agreed',
            iconColor: '#ffffff',
            callback: () => this.makeDecision(btn.decision)
          };

        case 'cancel_event':
          return {
            btnColor: 'blue',
            icon: 'rejected',
            iconColor: '#0075DB',
            callback: () => this.makeDecision(btn.decision)
          };

        case 'cancel_event_created_by':
          return {
            btnColor: 'blue',
            icon: 'rejected',
            iconColor: '#0075DB',
            callback: () => this.cancelByAuthor()
          };

        case 'delete':
          return {
            btnColor: 'blue',
            icon: 'rejected',
            iconColor: '#0075DB',
            callback: () => this.delete()
          };

        case 'edit':
          return {
            btnColor: 'transparent',
            icon: 'pen',
            iconColor: '#0075DB',
            callback: () => this.edit()
          };

        default:
          return {};
      }
    },
    delete() {
      this.$emit('set-selected-event', this.selectedEventData);
      this.closePopup();
      this.$emit('delete-notification', this.selectedEventData);
    },
    edit() {
      // only author
      // close this dialog and open another
      this.$emit('set-selected-event', this.selectedEventData);
      this.closePopup();
      store.commit('common/setVisibleDialog', {
        name: 'create_event_dialog',
        val: true
      });
    },
    fileSize(file) {
      return file.filesize && file.filesize.value
        ? Number(file.filesize.value / 1024 / 1024).toFixed(2) + ' Мб'
        : '0 Мб';
    }
  },
  watch: {
    dialogMounted: function () {
      // для диалоговых длинных окон высчитываем высоту контента
      if (this.dialogMounted) {
        this.resizeDialog();
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    Button,
    DocumentRow,
    Icon
  }
};
</script>

<style lang="scss" scoped>
#front .dialog {
  & ::v-deep .el-dialog__header {
    padding: 14px 24px;
  }

  & ::v-deep .el-dialog__footer {
    margin: 0 !important;
  }

  &__content {
    text-align: left;

    & > * {
      padding: 12px 24px !important;
      margin: 0 !important;

      &:first-child {
        padding-top: 24px !important;
      }

      &:last-child {
        padding-bottom: 24px !important;
      }
    }
  }

  h3 {
    color: $primary-text;
    word-break: break-word;
    // margin: 24px 0;
  }

  .buttons-panel {
    // margin: 0 !important;
    padding: 16px 24px;
  }
}

.event-info {
  &__panel:not(:last-child) {
    margin-bottom: 24px;
  }

  &__row {
    display: flex;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__field {
    &-name {
      width: 120px;
      min-width: 120px;
      margin-right: 24px;
    }

    &-value {
      word-break: break-word;

      & > div:not(:last-child) {
        margin-bottom: 4px;
      }

      & ::v-deep * {
        font-size: 16px;
        line-height: 24px;
      }
    }
  }
}

.other-event {
  font-size: 15px;
  line-height: 24px;
  font-weight: 400;
  padding: 0 24px 24px;
  word-break: normal;
  text-align: left;

  &__info {
    color: $black-100;
  }

  &__warn {
    display: flex;
    flex-direction: row;
    background: $yellow-10;
    padding: 12px;
    margin-top: 24px;
    color: $black-200;

    p {
      padding-left: 8px;
    }
  }
}
</style>
