<template>
  <table class="table">
    <tr>
      <th style="width: 40px"></th>
      <th style="width: 355px">Название</th>
      <th style="width: 669px">Текст сообщения</th>
      <th style="width: 56px"></th>
    </tr>
    <tr
      v-for="message in messages"
      :key="message.ID"
      v-infinite-scroll="loadMore"
      :infinite-scroll-last="message.INDEX == messages.length - 1"
    >
      <td>
        <Button
          hasLeftIcon
          iconName="pencilMin"
          buttonSize="small"
          buttonText=""
          buttonColor="transparent"
          @click="$emit('edit-message', message)"
        />
      </td>
      <td>{{ message.NAME }}</td>
      <td>{{ message.DESCRIPTION }}</td>
      <td>
        <Button
          hasLeftIcon
          iconName="delete"
          buttonColor="transparent"
          buttonText=""
          iconColor="#CDD4DA"
          buttonSize="small"
          style="margin-left: 24px"
          @click="deleteMessage(messages, message.ID)"
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
    store.dispatch('admin/getMessageData', { type: 'reanswer_message' });
  },
  computed: {
    messages() {
      return store.state.admin.messages || [];
    }
  },
  methods: {
    async loadPopupData(params) {
      await store.dispatch('admin/getMessageData', {
        params,
        type: 'reanswer_message'
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

        await store.dispatch('admin/confirmDelete', 'messages');
        await store.dispatch('admin/getMessageData', {
          type: 'reanswer_message'
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
.table {
  color: $black-200;
  font-family: 'Roboto';
  width: 100%;

  button {
    width: 24px;
  }

  tr {
    vertical-align: top;

    th {
      color: $black-200;
      font-family: 'Roboto Medium';
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      background: $black-20;
      padding: 6px 8px;
    }

    td {
      padding: 12px 8px;
      font-size: 14px;
      line-height: 24px;
      word-break: break-word;
    }
  }

  tr:not(:first-child) {
    border-bottom: 1px solid #dadfe4;
  }

  .color-block {
    display: flex;
    justify-content: space-between;
  }
}
</style>
