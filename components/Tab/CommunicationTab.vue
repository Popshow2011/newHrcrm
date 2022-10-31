<template>
  <div class="communication-tab" :id="id">
    <AuthDialog
      v-if="visibleAuthForm"
      :is_visible="visibleAuthForm"
      :module="telegramModule"
      :session-id="sessionId"
      :user-id="userId"
      @close-popup="visibleAuthForm = false"
    />
    <div class="communications">
      <div
        v-if="communications.length"
        v-loading="visibleLoader"
        :class="['messages', visibleScrollbar ? 'messages--scrollable' : '']"
        @scroll="handleScroll"
      >
        <Message
          v-for="msg in communications"
          :key="msg.id"
          :msg="msg"
          :id="id"
          :name="name"
          :emails="emails"
        ></Message>
      </div>
      <div v-else class="empty">
        Список сообщений пуст. <br />
        Вы можете отправить кандидату первое сообщение
      </div>
    </div>
    <form
      :id="`msg-form-${id}`"
      enctype="multipart/form-data"
      class="communications-control"
    >
      <div v-if="uploaded_files.length" class="upload-list shadow-lvl-3 brs-4">
        <DocumentRow
          v-for="(file, i) in uploaded_files"
          :key="file.uid"
          :document="file"
          :index="i"
          :details-text="Number(file.size / 1024 / 1024).toFixed(2) + ' Мб'"
          :document-name="file.name"
          :allow-remove="true"
          :visible-delete-icon="true"
          @delete-file="deleteFile"
        />
      </div>
      <div v-else class="communications-control__btns">
        <div class="communication-inputbox">
          <div class="message__area">
            <div :style="{ visibility: 'hidden' }" class="select-messengers">
              <Switcher v-on:switchMessenger="switchMessenger" />
            </div>
            <button
              v-if="!allowCreateMessage"
              v-loading="btnVisibleLoader"
              type="button"
              @click="initMessengerMode"
              @mouseenter="dialogBtnHovered = true"
              @mouseleave="dialogBtnHovered = false"
              :class="[
                params.hasTelegram ? 'start-dialog-btn' : 'check-dialog-btn',
                'fw-500'
              ]"
            >
              <template v-if="params.hasTelegram">
                <blocked-icon :unblocked="dialogBtnHovered"></blocked-icon>
                Нажмите, чтобы начать диалог
              </template>
              <template v-else>
                <Icon iconName="info" />
                Нажмите, чтобы проверить канал
              </template>
            </button>
            <div v-else class="message__area-input">
              <div class="message__area-buttons">
                <form
                  v-if="id"
                  id="upload-msg-file"
                  enctype="multipart/form-data"
                >
                  <Upload
                    :file="uploaded_files"
                    :id="'-' + id + '-msg'"
                    name="test-upload"
                    :drag="false"
                    :multiple="true"
                    :size="20 * 1024 ** 2"
                    :showFileList="false"
                    :disabled="true"
                    @upload-file="uploadFile"
                  >
                    <Button
                      class="message__area-button"
                      buttonColor="transparent"
                      buttonText=""
                      hasLeftIcon
                      disabled
                      iconName="attach"
                    />
                  </Upload>
                </form>
                <Button
                  class="message__area-template"
                  buttonColor="transparent"
                  buttonText="Шаблоны"
                />
              </div>
              <TextArea
                ref="newMsg"
                resize="none"
                :hasResizeIcon="false"
                :model="newMessage"
                :field="{ placeholder: 'Сообщение' }"
                maxlength="4096"
                @change="changeText"
                @keydown.native.enter.exact="sendMsg($event)"
                class="message__area-textarea"
              />
              <Button
                class="message__area-button"
                :disabled="!newMessage.trim()"
                buttonColor="transparent"
                buttonText=""
                hasLeftIcon
                iconName="send_message"
                @click="sendMsg"
              />
            </div>
            <Button
              buttonSize="big"
              class="email-button"
              buttonColor="blue"
              buttonText="E-mail"
              hasLeftIcon
              noPointer
              iconName="Mail"
              :disabled="!emails.length || notAccess"
              @click="sendEmail"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import { store } from '@/store';
import { mixin, errorMsg } from '@/utils/mixins';
import { getController, postController } from '@/controllers/request.js';
import {
  ACTION,
  SUBPANEL,
  FIELD,
  MODULE,
  BUTTON,
  SORT_PARAMS,
  SORT_ORDER
} from '@/utils/constants';
import Message from 'Elements/Messenger/Message';
import TextArea from 'Elements/Textarea/Textarea';
import Button from 'Elements/Button/Button';
import Switcher from 'Elements/Switch/CommunicationTypeSwitch';
import Upload from 'Elements/Upload/Upload';
import BlockedIcon from 'Elements/SVG/BlockedIcon';
import Icon from 'Elements/Icon/Icon';
import AuthDialog from 'Elements/Dialog/AuthTelegramDialog';
import DocumentRow from 'Elements/Document/DocumentRow';

export default {
  mixins: [mixin, errorMsg],
  props: {
    module: String,
    id: String,
    tab: Object,
    tableSql: String,
    userId: String,
    name: String,
    emails: Array,
    allowedScroll: Boolean,
    params: {
      type: Object,
      default() {
        return {
          hasTelegram: Boolean,
          messagesCount: Number,
          lastEmailId: {
            type: [Number, String],
            default: 0
          },
          telegram: {
            type: String,
            default: ''
          }
        };
      }
    }
  },
  data() {
    return {
      // MODULE,
      telegramModule: MODULE.HRPAC_TELEGRAM_MESSAGES,
      SORT_PARAMS,
      no_profile_photo: '/front/public/style/img/avatar.jpg',
      formParams: {
        [SORT_PARAMS.SORT_ORDER]: SORT_ORDER.DESC,
        [SORT_PARAMS.CANDIDATES_EMAILS_CELL_ORDER_BY]: FIELD.ID.DATE_ENTERED,
        [SORT_PARAMS.CANDIDATES_EMAILS_CELL_OFFSET]: 0
      },
      // pageData: null,
      endPage: false,
      communications: [],
      allowCreateMessage: false,
      dialogBtnHovered: false,
      newMessage: '',
      lastTelegramMsgID: 0,
      lastEmailMsgID: this.params.lastEmailId,
      // lastScrolledMsg: '',
      visibleLoader: false,
      btnVisibleLoader: false,
      visibleScrollbar: false,
      visibleAuthForm: false,
      sessionId: '',
      // contactChecked: false
      // showUpload: false,
      uploaded_files: []
      // dragging: false
      // emailFields: {}
    };
  },
  created() {
    this.getCommunications();
  },
  computed: {
    noEmailSettings() {
      return store.state.common.notifications.send_mail;
    },
    notAccess() {
      return (
        store.state.candidate.metaData &&
        store.state.candidate.metaData.buttons_menu.some(row =>
          row.some(
            btn => btn.id == BUTTON.ID.SEND_MAIL && btn.visibility == 'disabled'
          )
        )
      );
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
    // emailIsNull(val) {
    //   return !val || val === 'null';
    // },
    changeText(a, b) {
      this.newMessage = b;
    },
    updateTab(count) {
      if (!this.params.messagesCount) {
        this.$emit('set-tab-name', this.tab, { count });
      }
    },
    getCommunications() {
      getController({
        params: {
          module: this.module,
          subpanel: this.tableSql || SUBPANEL.EMAILS,
          action: ACTION.SUBPANEL_JSON_DATA,
          record: this.id,
          inline: 1,
          to_pdf: true,
          ...this.formParams
        }
      })
        .then(resp => {
          const errors = resp.data ? resp.data.error || resp.data.errors : null;
          if (resp.data && !errors) {
            const { PAGINATION, ROWS } = resp.data;

            if (PAGINATION.offsets.next !== -1) {
              this.$set(
                this.formParams,
                SORT_PARAMS.CANDIDATES_EMAILS_CELL_OFFSET,
                PAGINATION.offsets.next
              );
            } else {
              this.endPage = true;
            }

            const newMsgs = ROWS.slice().reverse();
            this.communications = [...newMsgs, ...this.communications];

            if (ROWS.length) {
              const startIteration = PAGINATION.offsets.current == 0;
              this.scrollMsgToBottom(!startIteration ? ROWS[0].id : null);
              this.updateTab(ROWS.length);
            }
          }

          if (errors) {
            this.showErrorMessage(errors);
          }
        })
        .catch(err => {
          this.catchError(
            err,
            err || 'Возникла ошибка загрузки списка коммуникаций',
            'communications loading'
          );
        })
        .finally(() => {
          this.$emit('set-loading', false);
          this.visibleLoader = false;
          // this.updateEmails();
        });
    },
    checkTelegramAccount() {
      // this.contactChecked = true;
      getController({
        params: {
          module: 'Communications',
          action: 'check_communication',
          candidate_id: this.id,
          type: 'telegram'
        }
      })
        .then(resp => {
          const errors = resp.data ? resp.data.error || resp.data.errors : null;
          if (resp.data && resp.data.communication) {
            this.allowCreateMessage = true;
          }
          if (errors) {
            this.showErrorMessage(errors);
          }

          if (!resp.data.communication && resp.data.result) {
            this.showNotification({
              offset: 80,
              showClose: true,
              message:
                'Кандидат еще не зарегистрирован в Телеграм. Попробуйте другой канал связи.',
              duration: 15000,
              type: 'warning'
            });
          }
        })
        .catch(err =>
          this.catchError(
            err,
            err || 'Возникла ошибка при проверке наличия аккаунта телеграм',
            'telegram check'
          )
        )
        .finally(() => (this.btnVisibleLoader = false));
    },
    initMessengerMode() {
      this.btnVisibleLoader = true;
      if (!this.params.hasTelegram) {
        this.checkTelegramAccount();
        return;
      }

      // получение переписки и инициализация общения
      const action = 'init_telegram_session';
      getController({
        params: {
          module: this.telegramModule,
          action,
          user_id: this.userId,
          candidate_id: this.id,
          to_pdf: true
        }
      })
        .then(resp => {
          const errors = resp.data ? resp.data.error || resp.data.errors : null;
          if (!errors) {
            this.processMessageData(resp, action);

            if (resp.data.result) {
              this.allowCreateMessage = true;
            }
          } else {
            this.showErrorMessage(errors);
          }
        })
        .catch(err =>
          this.catchError(
            err,
            err || 'Возникла ошибка при получении списка коммуникаций',
            'communications load'
          )
        )
        .finally(() => (this.btnVisibleLoader = false));
    },
    processMessageData(resp, action) {
      if (!resp.data || !resp.data.result) return;

      if (action == 'check_new_emails') {
        this.communications = [...this.communications, ...resp.data.result];
        this.lastEmailMsgID = resp.data.result[0].id;

        if (!this.params.messagesCount) this.updateTab(resp.data.result.length);
        this.scrollMsgToBottom();
      } else {
        const msgsCount = resp.data.messages.length;
        this.communications = [
          ...this.communications,
          ...resp.data.messages.reverse()
        ];

        if (action == 'init_telegram_session') {
          this.lastTelegramMsgID = resp.data.offset_id;
        }

        if (msgsCount) {
          this.scrollMsgToBottom();
          this.updateTab(msgsCount);
          this.lastTelegramMsgID =
            resp.data.messages[0].message_id || resp.data.messages[0].id;
        }
      }
    },
    scrollMsgToBottom(lastScrolledMsgId) {
      // для телеграм-режима только скролл вниз
      this.$nextTick(() => {
        const msgs = $(`#${this.id} .messages`);
        const scrollValue = lastScrolledMsgId
          ? msgs.find(`[data-id="${lastScrolledMsgId}"]`)[0].offsetTop
          : msgs[0].scrollHeight;

        if (this.allowedScroll) {
          window.scrollTo(0, document.body.scrollHeight);
        }
        msgs.animate({ scrollTop: scrollValue }, 500);
      });
    },
    sendEmail() {
      // в окне заполняется поле "Текст сообщения" (+наименование) в соотв-и с шаблоном
      if (this.noEmailSettings) {
        this.showErrorMessage(this.noEmailSettings);
        return;
      }

      if (this.emails.length) {
        store.commit('common/setVisibleDialog', {
          name: 'send_mail_dialog',
          val: true
        });
      }
    },
    sendMsg(e) {
      // отправка нового сообщ-я доступна, если введен текст или добавлен файл
      // Максимальный размер файла - 30 мб
      if (this.newMessage.trim() && !e.shiftKey && !e.ctrlKey) {
        const defaultParams = {
          module: this.telegramModule,
          action: 'send_telegram_message',
          user_id: this.userId,
          parent_id: this.id,
          message: this.newMessage
        };
        // const form = document.getElementById('msg-form-' + this.id);
        let formData = new FormData();

        for (let key in defaultParams) {
          formData.set(key, defaultParams[key]);
        }
        // formData.set('msg', this.newMessage);

        if (this.uploaded_files.length) {
          this.uploaded_files.forEach(file => {
            const { raw: blob, name } = file;
            formData.set('file', blob, name);
          });
        }

        postController({ options: formData })
          .then(resp => {
            const errors = resp.data
              ? resp.data.error || resp.data.errors
              : null;

            this.$refs.newMsg.$children[0].blur();
            this.$refs.newMsg.$children[0].clear();
            this.newMessage = '';

            if (errors) {
              this.showErrorMessage(errors);
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при отправке нового сообщения',
              'send telegram message'
            )
          );
      }
    },
    checkTelegramMessages() {
      const subscriber = setInterval(() => {
        if (!this.allowCreateMessage) {
          clearInterval(subscriber);
        }

        const action = 'check_new_telegram_messages';
        getController({
          params: {
            module: this.telegramModule,
            action,
            user_id: this.userId,
            candidate_id: this.id,
            offset_id: this.lastTelegramMsgID
          }
        })
          .then(resp => {
            const errors = resp.data
              ? resp.data.error || resp.data.errors
              : null;
            if (errors) {
              this.showErrorMessage(errors);
            } else {
              this.processMessageData(resp, action);
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при получении новых сообщений Telegram',
              'check new telegram messages'
            )
          );
      }, 10000); // временно на 10 с
    },
    handleScroll(e) {
      if (e.target.scrollTop == 0 && !this.endPage) {
        this.visibleLoader = true;
        this.getCommunications();
      }
    },
    showAuthForm() {
      if (!this.requestSent) {
        this.requestSent = true;

        getController({
          url: `index.php?module=Users&action=getFieldsForModule&fields[]=user_name&id=${this.userId}&to_pdf=true`
        })
          .then(resp => {
            if (resp.data && resp.data.length) {
              this.sessionId = `${resp.data[0].value}_${Date.now()}`;
              this.visibleAuthForm = true;
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при получении логина пользователя для сессии телеграм',
              'get user login'
            )
          )
          .finally(() => (this.requestSent = false));
      }
    },
    uploadFile(file) {
      console.log(file, 'upload');
      // this.uploaded_files.push(file); //эта строка не понадобится
    },
    deleteFile(file, index) {
      console.log('remove', file);
      this.uploaded_files.splice(index, 1);
    },
    updateEmails() {
      // проверка новых емейлов
      getController({
        params: {
          module: 'Communications',
          action: 'check_new_emails',
          user_id: this.userId,
          candidate_id: this.id,
          offset_id: this.lastEmailMsgID,
          to_pdf: true
        }
      })
        .then(resp => {
          if (resp.data.result) {
            if (resp.data.result.length == 1 && resp.data.result[0].id == null)
              return;
            this.processMessageData(resp, 'check_new_emails');
          } else {
            throw new Error(resp.data.error || resp.data.errors);
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка при получении новых email-сообщений',
            'new email messages load'
          )
        );
    }
    // updateEmails() {
    //   // проверка новых емейлов
    //   getController({
    //     params: {
    //       module: 'Communications',
    //       action: 'check_new_emails',
    //       user_id: this.userId,
    //       candidate_id: this.id,
    //       offset_id: this.lastEmailMsgID,
    //       to_pdf: true
    //     }
    //   })
    //     .then(resp => {
    //       if (resp.data.result) {
    //         if (resp.data.result.length == 1 && resp.data.result[0].id == null)
    //           return;
    //         this.processMessageData(resp, 'check_new_emails');
    //       } else {
    //         throw new Error(resp.data.error || resp.data.errors);
    //       }
    //     })
    //     .catch(err =>
    //       this.catchError(
    //         err,
    //         'Возникла ошибка при получении новых email-сообщений',
    //         'new email messages load'
    //       )
    //     );
    // }
  },
  watch: {
    allowCreateMessage: function () {
      if (this.allowCreateMessage) {
        this.checkTelegramMessages();
      }
    },
    'communications.length': function () {
      // корректировка отступов враппера при наличии скроллбара
      this.$nextTick(() => {
        const msgs = $(`#${this.id} .messages`);
        this.visibleScrollbar = msgs[0]
          ? msgs[0].offsetHeight < msgs[0].scrollHeight
          : false;
      });
    }
  },
  components: {
    Message,
    BlockedIcon,
    Icon,
    AuthDialog,
    // 'el-upload': Upload,
    TextArea,
    Button,
    Switcher,
    Upload,
    DocumentRow
  }
};
</script>
<style lang="scss">
.el-message.el-message--telegram {
  z-index: 3020 !important;
}

.el-tabs__item {
  &.no-msg:after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    background-color: inherit;
    border: 1.3px solid $green-600;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 8px;
  }

  &.has-msg:after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    background-color: $green-600;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 8px;
  }
}
</style>

<style lang="scss" scoped>
.communications {
  background: $black-10;
  padding: 20px 28px 18px 20px;

  &-control {
    background-color: $black-10;

    &__btns {
      position: relative;
      background-color: $white;
      box-shadow: 0px -3px 9px rgba(0, 0, 0, 0.04);
      z-index: 2;
    }
  }
}

.messages {
  padding-top: 20px;
  height: 680px;
  overflow-x: hidden;
  overflow-y: auto;
  margin-right: -20px;
  // scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 12px;
    background-color: $blue-20;
    border-radius: 4px;
  }
}

.communication-inputbox {
  padding-top: 8px;
  display: inline-flex;
  width: 100%;
}

.email-button {
  align-self: flex-end;
  -ms-grid-row-align: flex-end;
}

.message__area {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;

  .select-messengers {
    justify-content: center;
    align-self: flex-end;
    -ms-grid-row-align: flex-end;
  }

  &-button {
    &::v-deep .button-content {
      margin: 0;
    }
  }

  &-template {
    &::v-deep .button-content {
      margin: 0;

      .content-text {
        font-size: 14px !important;
      }
    }
  }

  &-buttons {
    display: flex;
  }

  &-input {
    border: 1px solid $black-30;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: stretch;
    width: 455px;
    min-height: 24px;
    padding: 0 16px;
    background-color: $white;
  }

  &-textarea {
    min-height: 40px;
    align-self: center;
    -ms-grid-row-align: center;
    width: 100%;

    & ::v-deep .el-textarea__inner {
      border: transparent;
      min-height: 40px !important;
      padding: 8px 8px 8px 12px;
      line-height: 24px;
      max-height: 446px;
      -ms-overflow-style: none;
      // scrollbar-width: none;

      // &::-webkit-scrollbar {
      //   width: 12px;
      //   background-color: $blue-20;
      //   border-radius: 4px;
      // }
    }
  }
}

.start-dialog-btn,
.check-dialog-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $white;
  font-size: 16px;
  border-radius: 4px;
  width: 455px; //455
  padding: 0 16px;
  border: none;

  svg {
    margin-right: 10px;
  }
}

.start-dialog-btn {
  background: $black-170;
}

.check-dialog-btn {
  background: $yellow-90;
}

.upload-list {
  position: relative;
  background-color: $white;
  width: 455px;
  margin: 0 auto;
}
</style>
