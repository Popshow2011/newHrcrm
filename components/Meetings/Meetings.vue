<template>
  <div class="meetings">
    <ConfirmRemoveMeetingDialog
      v-if="is_visible.confirm_remove_meeting_dialog"
      :is_visible="is_visible.confirm_remove_meeting_dialog"
      :data="fields"
      :confirmDeleteMeeting="true"
      title="Удалить встречу?"
      @reset-callback="closeDialog('confirm_remove_meeting_dialog')"
      @confirm="removeMeeting"
    />
    <h3 class="fz-16 bold primary">Ближайшие события</h3>
    <div
      v-for="item in meetings"
      :key="item.id.value"
      class="meeting brs-4 shadow-lvl-1"
      @click="viewMeeting(item)"
    >
      <div class="meeting__date">
        <Icon iconName="calendar" iconColor="#0075DB" />
        <span class="fz-16 primary bold">{{ meetingDate(item) }}</span>
      </div>
      <div class="meeting__time">
        <Icon iconName="clock" iconColor="#0075DB" />
        <span class="fz-16 primary bold">{{ meetingTime(item) }}</span>
      </div>
      <div class="meeting__name">{{ item.name.value | format }}</div>
      <span
        v-if="+item.is_creator.value"
        class="meeting__remove"
        @click.stop="confirmRemove(item)"
      >
        <Icon iconName="delete" iconColor="#CDD4DA" />
      </span>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import Icon from 'Elements/Icon/Icon';
import ConfirmRemoveMeetingDialog from 'Elements/Dialog/EmailDialog';
export default {
  mixins: [mixin],
  data() {
    return {
      selectedMeeting: null
    };
  },
  computed: {
    meetings() {
      return store.state.candidate.meetings || [];
    },
    is_visible() {
      return store.state.common.visible_dialog;
    },
    fields() {
      return store.state.candidate.fields || {};
    }
  },
  methods: {
    meetingDate(item) {
      return item.date_start.value
        .split(' ')[0]
        .split('.')
        .slice(0, 2)
        .join('.');
    },
    meetingTime(item) {
      return item.date_start.value.split(' ')[1];
    },
    viewMeeting(item) {
      store.commit('candidate/setSelectedMeeting', item);
      store.commit('common/setVisibleDialog', {
        name: 'event_view_dialog',
        val: true
      });
    },
    confirmRemove(item) {
      if (!+item.is_creator.value) return;
      store.commit('common/setVisibleDialog', {
        name: 'confirm_remove_meeting_dialog',
        val: true
      });
      this.selectedMeeting = item;
    },
    async removeMeeting() {
      if (!this.selectedMeeting) return;
      this.closeDialog('confirm_remove_meeting_dialog');
      await store.dispatch(
        'candidate/removeMeeting',
        this.selectedMeeting.id.value
      );
      store.commit('subpanels/updateActiveSubpanel', 'audit');
      this.selectedMeeting = null;
    }
  },
  components: { Icon, ConfirmRemoveMeetingDialog }
};
</script>
<style lang="scss" scoped>
.meetings {
  margin: 24px 0;

  h3 {
    margin-top: 0;
    margin-bottom: 12px;
  }

  .meeting {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding: 16px;
    border: 1px solid $black-20;
    cursor: pointer;

    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &:hover {
      border: 1px solid $blue-120;
    }

    &__date,
    &__time {
      display: flex;
      flex-wrap: nowrap;
      margin-right: 20px;

      span {
        margin-left: 4px;
      }
    }

    &__name {
      font-size: 15px;
      line-height: 24px;
      width: 100%;
      margin-right: 48px;
    }

    &__remove {
      position: absolute;
      right: 16px;
      top: 16px;
      cursor: pointer;
    }

    * {
      cursor: pointer;
    }
  }
}
</style>
