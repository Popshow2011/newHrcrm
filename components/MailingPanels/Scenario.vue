<template>
  <div class="item shadow-lvl-1">
    <div class="item-header">
      <h4 class="item-title">Сценарий</h4>
      <div>
        <span class="item-header__create fw-500" @click="saveAndRedirect">
          Создать
        </span>
      </div>
    </div>
    <div v-if="scenarios && scenarios.length" class="item-body">
      <div v-for="item in scenarios" :key="item.id" class="form-item">
        <Radio
          :label="item.id"
          :model="selectedScenario"
          :text="item.name"
          @set-value="val => selectScenario(val)"
        />
        <div>
          <span @click="editScenario(item)">
            <Icon class="pen" iconName="Pen" />
          </span>
          <span @click="duplicateScenario(item)">
            <Icon class="copy" iconName="Copy" iconColor="#CDD4DA" />
          </span>
        </div>
      </div>
    </div>
    <div v-else class="item-clear">
      <p>Список сценариев пуст</p>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import { errorMsg } from '@/utils/mixins';
import { MODULE } from '@/utils/constants';
import Icon from 'Elements/Icon/Icon';
import Radio from 'Elements/Radio/Radio';
export default {
  mixins: [errorMsg],
  props: {
    fields: Object
  },
  data() {
    return {
      selectedScenario: this.fields.bot_script_id.value || ''
    };
  },
  computed: {
    scenarios() {
      return this.fields.bot_script_name.options || [];
    },
    disabledSave() {
      return store.getters['mailing/hasRequiredFields'];
    }
  },
  methods: {
    editScenario(item) {
      location.href = `index.php?module=BOT_SCRIPT&action=EditView&record=${item.id}&return_module=${this.fields.id.value}`;
    },
    duplicateScenario(item) {
      location.href = `index.php?module=${MODULE.BOT_SCRIPT}&isDuplicate=true&action=EditView&record=${item.id}&return_module=${this.fields.id.value}`;
    },
    selectScenario(val) {
      this.selectedScenario = val;
      const form = { [this.fields.bot_script_id.name]: val };
      store.commit('mailing/updateForm', form);
    },
    saveAndRedirect() {
      if (this.disabledSave) {
        this.showNotification({
          offset: 100,
          showClose: true,
          duration: 25000,
          message:
            'Переход к сценарию с предварительным сохранением рассылки не может быть выполнен. Проверьте заполнение обязательных полей: Название, Провайдер, Аудитория (при активном статусе), Сценарий (при активном статусе).',
          type: 'error'
        });
      } else {
        store.dispatch('mailing/saveMailing', {
          redirectToScenario: true
        });
      }
    }
  },
  components: { Icon, Radio }
};
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: column;
  width: 384px;
  height: 100%;
  background: $white;
  border-radius: 6px;
  overflow: hidden;

  .el-radio {
    max-width: 65%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 16px;
    border-bottom: 1px solid $black-20;

    .item-title {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      line-height: 28px;
      color: $black-200;
    }

    &__create {
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: $blue-120;
      cursor: pointer;
    }
  }
  &-body {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
    overflow-y: auto;
    overflow-x: hidden;

    .form-item {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .pen,
      .copy {
        cursor: pointer;
      }

      svg {
        margin-left: 20px;
      }

      label {
        display: flex;
        align-items: center;
        margin: 0;
      }
    }
    .form-item:not(:first-child) {
      margin-top: 20px;
    }
  }

  &-clear {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 74px;

    p {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: $black-100;
      text-align: center;
    }
  }
}
</style>
