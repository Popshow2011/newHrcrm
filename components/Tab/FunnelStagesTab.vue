<template>
  <table style="width: 491px" class="table-stage">
    <tr>
      <th style="width: 40px"></th>
      <th style="width: 355px">Название</th>
      <th style="width: 96px">Цвет</th>
    </tr>
    <tr
      v-for="stage in stages"
      :key="stage.ID"
      v-infinite-scroll="loadMore"
      :infinite-scroll-last="stage.INDEX == stages.length - 1"
    >
      <td>
        <Button
          hasLeftIcon
          iconName="pencilMin"
          buttonSize="small"
          buttonText=""
          buttonColor="transparent"
          @click="$emit('edit-color', stage)"
        />
      </td>
      <td>{{ stage.NAME }}</td>
      <td class="color-block">
        <Icon iconName="circle" :iconColor="stage.COLOR" />

        <Button
          hasLeftIcon
          iconName="delete"
          buttonColor="transparent"
          iconColor="#CDD4DA"
          buttonText=""
          buttonSize="small"
          style="margin-left: 24px"
          @click="deleteRow(stages, stage.ID)"
        />
      </td>
    </tr>
  </table>
</template>
<script>
import { store } from '@/store';
import { MODULE, ACTION } from '@/utils/constants';
import { getController } from '@/controllers/request.js';
import Button from 'Elements/Button/Button';
import Icon from 'Elements/Icon/Icon';

export default {
  created() {
    store.dispatch('admin/getStagesData');
  },
  computed: {
    stages() {
      return store.state.admin.stages || [];
    }
  },
  methods: {
    async loadPopupData(params) {
      await store.dispatch('admin/getStagesData', params);
    },
    loadMore() {
      const offset = store.state.admin.offsets.next;
      if (offset == -1) return;

      const params = {
        BOT_STAGES_OF_SCRIPT2_BOT_STAGES_OF_SCRIPT_offset: offset
      };

      this.loadPopupData(params, false);
    },
    async deleteRow(ctx, id) {
      try {
        await getController({
          params: {
            module: MODULE.BOT_STAGES_OF_SCRIPT,
            action: ACTION.DELETE,
            record: id,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        await store.dispatch('admin/confirmDelete', 'stages');
        await store.dispatch('admin/getStagesData');
      } catch (error) {
        console.error(error);
      }
    }
  },
  components: {
    Button,
    Icon
  }
};
</script>
<style lang="scss">
.table-stage {
  color: $black-200;
  font-family: 'Roboto';

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
