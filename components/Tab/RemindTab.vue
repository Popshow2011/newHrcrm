<template>
  <table class="table">
    <tr>
      <th style="width: 40px"></th>
      <th style="width: 355px">Название</th>
      <th style="width: 669px">Текст сообщения</th>
      <th style="width: 56px"></th>
    </tr>
    <tr
      v-for="reminder in reminders"
      :key="reminder.ID"
      v-infinite-scroll="loadMore"
      :infinite-scroll-last="reminder.INDEX == reminders.length - 1"
    >
      <td>
        <Button
          hasLeftIcon
          iconName="pencilMin"
          buttonSize="small"
          buttonColor="transparent"
          buttonText=""
          @click="$emit('edit-message', reminder)"
        />
      </td>
      <td>{{ reminder.NAME }}</td>
      <td>{{ reminder.DESCRIPTION }}</td>
      <td>
        <Button
          hasLeftIcon
          iconName="delete"
          buttonColor="transparent"
          buttonText=""
          iconColor="#CDD4DA"
          buttonSize="small"
          style="margin-left: 24px"
          @click="deleteMessage(reminders, reminder.ID)"
        />
      </td>
    </tr>
  </table>
</template>
<script>
import { MODULE, ACTION } from '@/utils/constants';
import { getController } from '@/controllers/request.js';
import { store } from '@/store';
import Button from 'Elements/Button/Button';

export default {
  created() {
    store.dispatch('admin/getMessageData', { type: 'reminder_message' });
  },
  computed: {
    reminders() {
      return store.state.admin.reminders || [];
    }
  },
  methods: {
    async loadPopupData(params) {
      await store.dispatch('admin/getMessageData', {
        params,
        type: 'reminder_message'
      });
    },
    loadMore() {
      const offset = store.state.admin.offsets.next;
      if (offset == -1) return;

      const params = {
        BOT_MESSAGES2_BOT_MESSAGES_offset: offset
      };

      this.loadPopupData(params, false);
    },
    async deleteMessage(ctx, id) {
      try {
        await getController({
          params: {
            module: MODULE.BOT_MESSAGES,
            action: ACTION.DELETE,
            record: id,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        await store.dispatch('admin/confirmDelete', 'reminders');
        await store.dispatch('admin/getMessageData', {
          type: 'reminder_message'
        });
      } catch (error) {
        console.error(error);
      }
    }
  },
  components: {
    Button
  }
};
</script>
<style lang="scss">
.el-table {
  color: $black-200;
  font-family: 'Roboto';

  &__fixed:before &__fixed-right:before &__fixed-left:before {
    display: none;
  }

  button {
    width: 24px;
  }

  .el-table__body tr.hover-row > td.el-table__cell {
    background-color: unset;
  }

  thead {
    color: $black-200;
    font-family: 'Roboto Medium';
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
  }

  .el-table__cell {
    vertical-align: top;
  }

  &__cell {
    .cell {
      padding: 0 8px;
      font-size: 14px;
      line-height: 24px;
    }
  }

  th.el-table__cell {
    background: $black-20;

    .cell {
      padding: 0 8px;
    }
  }

  .is-leaf {
    padding: 6px 8px;
    border-color: $black-30;
    line-height: 20px;
  }

  .is-leaf:last-child {
    border: none;
  }
}
</style>
