<template>
  <div class="widget-block">
    <div v-for="row in widgetData" :key="row">
      <div class="widget-block__row" v-if="row['role_access']">
        <div>
          <Icon
            :iconName="
              row['module'] == 'HRPAC_COORDINATION_REQUESTS'
                ? 'document'
                : row['module'] == 'HRPAC_VACANCY'
                ? 'suitcase'
                : row['module'] == 'HRPAC_CANDIDATES'
                ? 'User-bold'
                : 'document'
            "
            iconColor="#0075DB"
          />
          <p>{{ row['lbl'] }}</p>
        </div>
        <a :href="newEdit(row['module'])" target="_blank">
          <ButtonUI buttonColor="darkBlue" buttonText="Создать"
        /></a>
      </div>
    </div>
  </div>
</template>
<script>
import Icon from 'Elements/Icon/Icon';
import ButtonUI from 'Elements/Button/Button';
import { editView } from '@/utils/helpers';

export default {
  components: { Icon, ButtonUI },
  props: {
    widgetData: {
      type: Object || Array
    }
  },
  data() {
    return {
      isShort: false,
      noData: true,
      roleAccess: false
    };
  },
  created() {
    for (let i = 0; i < this.widgetData.length; i++) {
      this.roleAccess = this.widgetData[i]['role_access']
        ? true
        : this.roleAccess;
    }
    if (!this.roleAccess) {
      this.$emit('block-access', 'QuickActions');
    }
  },
  methods: {
    newEdit(module) {
      return editView(module, '');
    }
  }
};
</script>
<style lang="scss" scoped>
.widget-block {
  height: 100%;
  width: 100%;
  background: $black-10;
  border-radius: 6px;

  &__row {
    background: $white;
    border-bottom: 1px solid $black-20;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 24px;

    div {
      display: flex;
      flex-direction: row;
      align-items: center;

      p {
        font-weight: 400;
        font-size: 14px;
        line-height: 24px;
        color: $black;
        margin: 0 0 0 12px;
      }
    }
  }

  .flex-row {
    display: flex;
    flex-direction: row;
  }
}
</style>
