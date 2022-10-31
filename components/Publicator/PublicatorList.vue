<template>
  <div class="publicator__list">
    <PublicatorRow
      v-for="(item, i) in publicVacancy"
      :key="item.id"
      :index="i"
      :item="item"
    />
  </div>
</template>
<script>
import PublicatorRow from './PublicatorRow';
export default {
  components: { PublicatorRow },
  props: {
    publicVacancy: {
      type: [Array, Object],
      default: () => []
    },
    userId: {
      type: String
    }
  }
};
</script>
<style lang="scss" scoped>
.publicator__list {
  padding-top: 20px;
}
</style>
