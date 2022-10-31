<template>
  <div class="buttons-panel" v-loading="loading">
    <div v-for="(row, i) in buttons_menu" :key="i" class="buttons-row">
      <template v-for="btn in filteredButtons(row)">
        <Tooltip
          v-if="btn.id === BTN.ID.SHARE_BY_CANDIDATE"
          :key="btn.id"
          :content="btn.help"
        >
          <Button
            @click="btn.callback"
            :buttonText="btn.name"
            :buttonColor="btnColor(btn)"
            :disabled="disabledBtns[btn.id] || btn.disabled"
            buttonSize="big"
            hasLeftIcon
            :iconName="btnIcons[btn.id]"
          ></Button>
        </Tooltip>
        <actions-button
          v-else-if="btn.id === BTN.ID.ACTIONS"
          :key="btn.id"
          :btn="btn"
          :disabled-btns="disabledBtns"
          :btn-icons="btnIcons"
        ></actions-button>
        <Button
          v-else
          v-loading="btnWithLoader(btn.id)"
          :key="btn.id"
          :buttonText="btn.name || 'без имени'"
          :type="btn.id !== BTN.ID.CANCEL ? 'primary' : 'default'"
          :buttonColor="btnColor(btn)"
          :disabled="disabledBtns[btn.id] || btn.disabled"
          buttonSize="big"
          hasLeftIcon
          :iconName="btnIcons[btn.id]"
          @click="btn.callback"
        >
          <!-- :link="btn.url" -->
        </Button>
      </template>
    </div>
  </div>
</template>

<script>
import { form } from '@/utils/mixins';
import { BUTTON, ACTION } from '@/utils/constants';
import Tooltip from 'Elements/Tooltip/Tooltip';
import Button from 'Elements/Button/Button';
import ActionsButton from 'Elements/Button/ActionsButton';
export default {
  mixins: [form],
  props: {
    action: String,
    buttons_menu: {
      type: Array,
      default() {
        return [];
      }
    },
    disabledBtns: {
      type: Object,
      default() {
        return {};
      }
    },
    viewType: {
      type: String,
      default: 'detail'
    },
    loading: Boolean
  },
  data() {
    return {
      BTN: BUTTON
    };
  },
  computed: {
    editView() {
      return this.action === ACTION.EDIT_VIEW;
    },
    btnIcons() {
      return {
        edit: 'pencilMin',
        delete: 'deleteMin',
        generate_link: 'LinkBold',
        send_mail: 'Mail',
        share_candidate_in_telegram: 'Share',
        add_tag: 'Tag',
        form_offer: 'document',
        actions: 'VerticalEllepsis',
        send_questionnaire: 'send_message',
        send_pd: 'send_message',
        add_contact: 'add',
        open_questionnaire: 'document',
        form_exit_request: 'document',
        open_positions: 'OpenPositions',
        cancel_positions: 'CancelPositions',
        duplicate: 'Copy',
        upload_list: 'Download-thin',
        save_as_template: 'Bookmark',
        preview: 'Search',
        save_and_download: 'Download',
        attach_file: 'attachFile',
        attach_document: 'attachDoc',
        save_resume: 'Download',
        create_event: 'event',
        open_coordination_request: 'LinkBold'
      };
    }
  },
  methods: {
    btnWithLoader(id) {
      return id === BUTTON.ID.PICK_CANDIDATE; //&& this.loading;
    },
    filteredButtons(btns) {
      return btns.filter(btn => !btn.custom_display);
    },
    btnColor(btn) {
      if (this.viewType == 'edit') {
        return btn.id == BUTTON.ID.CANCEL ||
          btn.id == 'back_to_edit' ||
          btn.id == 'save_template'
          ? 'blue'
          : 'darkBlue';
      } else if (this.viewType == 'popup') {
        // в попапах обязательные кнопки - save, send, cancel, publish и дополнительные (голубого цвета)
        return btn.id == BUTTON.ID.CANCEL
          ? this.buttons_menu.length == 1
            ? 'blue'
            : 'transparent'
          : btn.id == BUTTON.ID.OK ||
            btn.id == BUTTON.ID.SAVE ||
            btn.id == BUTTON.ID.SAVE_MEETING ||
            btn.id == BUTTON.ID.SEND_EMAIL ||
            btn.id == BUTTON.ID.PUBLISH
          ? 'darkBlue'
          : 'blue';
      } else if (this.viewType == 'detail') {
        return 'blue';
      } else return 'blue';
    }
  },
  components: {
    Tooltip,
    Button,
    ActionsButton
  }
};
</script>
>
<style lang="scss">
.buttons-panel {
  /* display: flex;
  flex-direction: row;
  justify-content: space-between; */
  display: block;
  width: 100%;
  /* margin: 12px 0 12px 0; */
}

.buttons-row + .buttons-row {
  margin-top: 12px;
}
/* .buttons-panel-buttons {
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  width: 80%;
  margin: 12px 0 12px 0;
} */
</style>
