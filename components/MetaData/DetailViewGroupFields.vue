<template>
  <div v-if="!allEmptyFields">
    <Divider dividerSize="24" />
    <h3 class="section-title primary fw-500">{{ panel.lbl }}</h3>
    <Divider dividerSize="12" />
    <DetailViewGroupField
      v-for="item in panel.rows"
      :key="item.name"
      :item="item"
      :store-module="storeModule"
      :countId="countId"
      :rows-count="panel.rows.length"
    />
  </div>
</template>

<script>
import DetailViewGroupField from './DetailViewGroupField';
import Divider from 'Elements/Divider/Divider';
export default {
  components: { DetailViewGroupField, Divider },
  props: {
    panel: {
      type: Object,
      default: () => ({
        lbl: '',
        rows: []
      })
    },
    storeModule: String,
    countId: String
  },
  computed: {
    allEmptyFields() {
      return this.panel.rows.every(row =>
        row.every(field => field.name === null && field.lbl === null)
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.section-title {
  margin: 0;
  font-size: 16px;
  line-height: 24px;
}
</style>
