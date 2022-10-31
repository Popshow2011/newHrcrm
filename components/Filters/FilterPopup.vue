<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="Сохранить фильтр"
    :before-close="closeDialog"
    class="dialog"
    :append-to-body="true"
    @open="setFilterName"
  >
    <div>
      <p class="dialog__text" v-if="value">
        Вы хотите перезаписать изменения или сохранить фильтр как отдельный
        шаблон?
      </p>
      <p class="dialog__text" v-else>
        Введите название для фильтра
      </p>
      <div v-if="value" class="radio-form">
        <Radio
          label="update"
          :model="action"
          text="Перезаписать"
          @set-value="changeAction"
        />
        <Radio
          label="create"
          :model="action"
          text="Сохранить как новый"
          @set-value="changeAction"
        />
      </div>
      <Input
        :field="{
          name: 'saved_filter',
          placeholder: 'Название',
          disabled: action === 'update'
        }"
        :model="filterName"
        class="no-enter"
        @set-value="(name, val) => (filterName = val)"
      />
    </div>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          class="footer__button-ok no-enter"
          @click="saveFilters"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          @click="closeDialog"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import Button from 'Elements/Button/Button';
import { Dialog } from 'element-ui';
import Input from 'Elements/Input/Input';
import Radio from 'Elements/Radio/Radio';

export default {
  components: {
    Button,
    Input,
    'el-dialog': Dialog,
    Radio
  },
  data() {
    return {
      diff: 1,
      filterName: '',
      action: 'create'
    };
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    num: {
      type: Number
    },
    model: {
      type: [String, Array, Object, Boolean, Number]
    },
    value: {
      type: String
    }
  },
  methods: {
    setFilterName() {
      this.filterName = this.value;
    },
    changeAction(lbl, val) {
      this.action = val;

      if (this.action == 'update') {
        this.setFilterName();
      }
    },
    saveFilters() {
      this.$emit('saveFilters', this.filterName, this.action);
      this.action = 'create';
      this.closeDialog();
    },
    showDialog: function() {
      this.dialogVisible = true;
    },
    closeDialog: function() {
      this.filterName = '';
      this.$emit('closeForm');
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog .radio-form {
  margin-bottom: 16px;
}
</style>
