<template>
  <el-dialog
    :visible.sync="is_visible"
    ref="dialog"
    title="Настройка колонок"
    :close-on-click-modal="false"
    @close="$emit('close-popup')"
    class="search-col-dialog"
  >
    <div v-loading="loading">
      <div class="dialog__content content-offer">
        <draggable
          group="columns"
          :list="columns"
          @end="recalculateOrder"
          handle=".icon-handle"
          ><SearchColumn
            v-for="column in columns"
            :key="column.name"
            :column="column"
            @set-selected="handleSelectColumn"
        /></draggable>
      </div>
    </div>
    <div slot="footer">
      <div class="dialog__footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          class="footer__button-ok"
          @click="saveColumns"
          v-loading="loading"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          @click="$emit('close-popup')"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
import SearchColumn from 'Elements/Search/SearchColumn';
import draggable from 'vuedraggable';
import { MODULE, ACTION } from '@/utils/constants';
import { getController, postController } from '@/controllers/request';

export default {
  props: {
    is_visible: Boolean
  },
  data() {
    return {
      loading: true,
      columns: [],
      key: 0
    };
  },
  async created() {
    try {
      const data = await getController({
        params: {
          module: MODULE.HRPAC_SEARCH_COLUMNS,
          to_pdf: true,
          action: ACTION.GET_POPUP_VIEW
        }
      });
      if (!data.data.error) {
        let columns = data.data.metadata.panels[0].rows[0][0].value;
        for (let column of Object.keys(columns)) {
          this.columns.push(columns[column]);
        }
        this.columns.sort((prev, next) => prev.order - next.order);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    recalculateOrder() {
      for (let i in this.columns) {
        this.columns[i].order = i++;
      }
    },
    handleSelectColumn(val) {
      this.columns.find(elem => elem.order == val.order).selected = val.value;
    },
    async saveColumns() {
      this.loading = true;
      const columns = {};
      for (let column of this.columns) {
        columns[column.name] = column;
      }

      const options = new FormData();

      options.append('module', MODULE.HRPAC_SEARCH_COLUMNS);
      options.append('action', ACTION.SAVE_SEARCH_FIELDS);
      options.append('contents', JSON.stringify(columns));
      options.append('to_pdf', 1);

      try {
        const data = await postController({ options });
        if (data.data.status === 'ok') {
          this.$emit('close-update');
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  },
  components: {
    draggable,
    'el-dialog': Dialog,
    Button,
    SearchColumn
  }
};
</script>

<style lang="scss" scoped>
#front .el-dialog__wrapper.search-col-dialog {
  & ::v-deep .el-dialog {
    padding: 0px !important;

    & > .el-dialog__header {
      display: flex;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid $black-20;

      & > .el-dialog__headerbtn {
        display: flex;
      }
    }

    & > .el-dialog__body,
    & > .el-dialog__footer {
      padding: 24px;
    }

    & > .el-dialog__footer {
      margin: 0;
      border-top: 1px solid $black-20;
    }
  }
}

.el-button:not(:last-of-type) {
  margin-right: 8px;
}
</style>
