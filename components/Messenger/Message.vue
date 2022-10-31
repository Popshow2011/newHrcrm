<template>
  <div :data-id="msg.id" :class="leftRight">
    <div class="message-item" :class="messageType">
      <div class="communication-header" v-if="mode != 'bot'">
        <div>
          <Avatar
            :size="40"
            :url="botMsg ? 'bot' : msg.assigned_user_id ? avatar : ''"
          />
          <div class="text-block">
            <p class="primary fw-500">{{ author }}</p>
            <p class="secondary">{{ msg.date_entered }}</p>
          </div>
        </div>
        <Button
          class="message-delete"
          hasLeftIcon
          iconName="deleteMin"
          iconColor="#B3BDC6"
          buttonText=""
          disabled
          buttonColor="transparent"
        />
      </div>
      <div v-if="isEmail" class="message-item__email-info">
        <Tag :name="emailFrom" :closable="false" />
        <Icon iconName="corner" />
        <div class="message-item__addressees">
          <Tag
            v-for="email in editedEmails"
            :key="email"
            :name="email"
            :closable="false"
          />
        </div>
      </div>
      <div class="message-container">
        <div
          :ref="`msg-${msg.id}`"
          :class="[
            'message-item__text',
            visibleTextHelp ? 'message-item__with-help' : '',
            isFullText ? 'message-item__text_height_full' : ''
          ]"
        >
          <ActionsMenu
            v-if="isEmail"
            :actions="[
              { id: 'ReplyTo', name: 'Ответить' },
              { id: 'ReplyToAll', name: 'Ответить всем' },
              { id: 'Forward', name: 'Переслать' }
            ]"
            :handle-command="handleCommand"
            :disabled="!emails.length"
            class="message-item__actions"
          />
          <div
            class="message-item__theme"
            v-if="msg.name && isEmail"
            v-html="msg.name"
          ></div>
          <div
            v-html="isFullText ? msgText + '<br>' + '<br>' + '<br>' : msgText"
            class="message-item__description primary"
            :class="[isFullText ? '' : 'message-item__description--short']"
          ></div>
          <span
            v-if="visibleTextHelp"
            class="message-item__show-more blue fw-500"
            @click="isFullText = !isFullText"
          >
            Показать полностью
            <Icon iconName="showMoreArrow" />
          </span>
        </div>
        <template v-if="hasAttachment.length">
          <MessageAttachment
            v-for="file in hasAttachment"
            :key="file.id || file.name"
            :file="file"
            class="attachment"
          />
        </template>

        <div class="message-item__info">
          <p class="secondary fw-500">
            {{ `Отправлено через ${msg.type_channel}` }}
          </p>
          <message-status
            v-if="recruiterMesg"
            :status="msg.status_code || msg.status"
          ></message-status>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { postController } from '@/controllers/request.js';
import { store } from '@/store';
import { mixin, dialogMixin, errorMsg } from '@/utils/mixins';
import Button from 'Elements/Button/Button';
import Tag from 'Elements/Tag/Tag';
import MessageAttachment from 'Elements/Messenger/MessageAttachment';
import ActionsMenu from 'Elements/Menu/ActionsMenu';
import Avatar from 'Elements/Avatar/Avatar';
import Icon from 'Elements/Icon/Icon';
import MessageStatus from 'Elements/SVG/MessageStatus';
export default {
  mixins: [mixin, dialogMixin, errorMsg],
  props: {
    mode: {
      type: String,
      default: ''
    },
    msg: {
      type: Object,
      default() {
        return {};
      }
    },
    emails: {
      type: Array,
      default() {
        return [];
      }
    },
    id: String,
    name: String
  },
  data() {
    return {
      isFullText: false,
      visibleTextHelp: false
    };
  },
  mounted() {
    this.visibleTextHelp = this.visibleTextElem;
  },
  computed: {
    editedEmails() {
      return this.msg.to_addrs_names
        ? this.msg.to_addrs_names.split(/,\s*/g)
        : '';
    },
    botMsg() {
      return this.isWhatsApp && this.recruiterMesg; //|| this.msg.bot;
    },
    isEmail() {
      return this.msg.type_channel == 'Email';
    },
    isTelegram() {
      return this.msg.type_channel == 'Telegram';
    },
    isWhatsApp() {
      return this.msg.type_channel == 'WhatsApp';
    },
    recruiterMesg() {
      // const types = ['Отправлено', 'Исходящее'];
      return (
        (this.isTelegram && !!Number(this.msg.is_out)) ||
        (this.isEmail && this.msg.type == 'Отправлено') ||
        (this.isWhatsApp && this.msg.type == 'Исходящее') ||
        (this.mode == 'bot' && this.msg.type_messages == 'out')
      );
    },
    candidateMsg() {
      return (
        (this.isTelegram && !Number(this.msg.is_out)) ||
        (this.isEmail && this.msg.type == 'Входящее') ||
        (this.isWhatsApp && this.msg.type == 'Входящее') ||
        (this.mode == 'bot' && this.msg.type_messages == 'in')
      );
    },
    msgText() {
      return (
        this.formatHtml(this.msg.description_html_subpanel) ||
        this.msg.description_subpanel ||
        this.msg.description ||
        '[текст сообщения отсутствует]'
      ).replace(/(\r\n)|(\n)/gi, '<br/>');
    },
    visibleTextElem() {
      return (
        this.$refs[`msg-${this.msg.id}`].offsetHeight == 300 && !this.isFullText
      );
    },
    messageType: function () {
      return this.isEmail ? 'email' : 'message';
    },
    leftRight: function () {
      return this.candidateMsg ? '' : 'message-item__right';
    },
    author() {
      return (
        (this.candidateMsg ? this.name : this.msg.assigned_user_name) ||
        (this.botMsg ? 'Чат бот' : '[нет имени]')
      );
    },
    avatar() {
      return this.candidateMsg
        ? `/index.php?entryPoint=download&id=${this.id}_photo&type=HRPAC_CANDIDATES`
        : `/index.php?entryPoint=download&id=${this.msg.assigned_user_id}_photo&type=Users`;
    },
    emailFrom() {
      const email = this.msg.from_addr_name;
      return email && email !== 'null' ? email : '[email не указан]';
    },
    hasAttachment() {
      const file = this.msg.filename;
      return file && file !== 'unknown_file'
        ? Array.isArray(file)
          ? file
          : [{ name: file }]
        : [];
    },
    noEmailSettings() {
      return store.state.common.notifications.send_mail;
    }
  },
  methods: {
    async handleCommand(command) {
      if (this.noEmailSettings) {
        this.showErrorMessage(this.noEmailSettings);
        return;
      }

      store.commit('subpanels/setSelectedMessage', {
        action: command,
        msg: this.msg
      });
      this.setVisibleDialog('send_mail_dialog', true);
    }
  },
  components: {
    MessageAttachment,
    ActionsMenu,
    Avatar,
    Tag,
    MessageStatus,
    Icon,
    Button
  }
};
</script>

<style lang="scss">
.message-item {
  p,
  span {
    font-size: 14px;
    line-height: 20px;
  }

  .message-item__show-more {
    padding: 10px 0 0;

    &:before {
      display: none;
    }
  }

  &__right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  &__email-info {
    display: flex;
    margin: 0px 8px;

    svg {
      min-width: 24px;
      margin: 4px;
    }

    .el-tag {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__addressees {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;

    .el-tag + .el-tag {
      margin-top: 4px;
    }
  }

  &__text {
    word-break: break-word;
    overflow: hidden;
    position: relative;
    // padding-bottom: 12px;
    background-color: inherit;
    font-size: 15px;
    line-height: 24px;
    max-height: 300px;

    &_height_full {
      max-height: unset;
      overflow: unset;

      .message-item__show-more {
        svg {
          transform: rotate(180deg);
        }
      }
    }
  }

  &__actions {
    position: absolute;
    z-index: 2;
    background: $white;
    right: 0;
  }

  &__description {
    padding-right: 36px;

    &_short {
      overflow: hidden;
      font-size: 15px;
      line-height: 24px;
      word-break: break-word;
    }

    * {
      background-color: inherit !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
      white-space: normal;
      max-width: 100% !important;
      font-size: 14px !important;
    }
  }

  &__show-more {
    display: flex;
    align-items: center;
    color: $blue-120;
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;
    padding: 4px 0 8px 0;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: inherit;

    &:before {
      content: '';
      display: block;
      height: 10px;
      width: 100%;
      position: absolute;
      top: -9px;
      background: linear-gradient(0deg, $white, transparent);
    }

    svg {
      transition: all 0.5s;
    }
  }

  &__theme {
    margin-bottom: 24px;
    font-weight: bold;
    font-size: 18px;
    line-height: 28px;
  }

  &__info {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }
}

.communication-header {
  position: relative;

  div {
    display: inline-flex;

    .text-block {
      margin-left: 8px;
      color: $black-40;
      line-height: 20px;
      align-self: left;
      -ms-grid-row-align: left;
      display: flex;
      flex-direction: column;

      p {
        margin: 0;
      }
    }
  }

  .message-delete {
    position: absolute;
    right: 0;
    top: 0;
    // background: none !important;
    // border: none !important;
    // padding: 0;
    // align-self: end;
    // -ms-grid-row-align: end;
    // top: 0;
    // right: 0;
    // fill: $black-40 !important;
    // text-align: right;
    // float: right;
    // justify-self: right;
    // display: none;

    &:hover {
      path {
        stroke: $black-70 !important;
      }
    }
  }
}

.email {
  align-items: flex-start;
  width: 522px;
  margin-bottom: 12px;

  .message-container {
    width: 522px;
  }

  .message-item__info {
    align-items: center;
  }

  .communication-header {
    width: 522px;
    height: 40px;
    justify-content: space-between;

    div {
      display: inline-flex;
    }
  }
}

.message-container {
  padding: 8px;
  background: $white;
  border: 1px solid $black-20;
  box-sizing: border-box;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  font-size: 15px;
  line-height: 24px;

  .attachment:hover {
    svg {
      circle {
        fill: $blue-130;
      }
    }
  }
}

.message {
  align-items: flex-start;
  margin-bottom: 12px;
  width: 310px;

  .message-container {
    width: 310px;
  }

  .communication-header {
    width: 310px;
    height: 40px;
    display: inline-flex;
    justify-content: space-between;
  }
}
</style>
