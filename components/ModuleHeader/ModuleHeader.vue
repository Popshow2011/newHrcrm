<template>
  <div class="module-part">
    <img :src="moduleData.icon" alt="icon" height="48" width="48" />
    <div class="module-part__labels">
      <BreadCrumbs :crumbs="moduleData.main" />
      <div>secondaryLabel</div>
    </div>
  </div>
</template>
<script>
import { mixin } from '@/utils/mixins';
import BreadCrumbs from 'Elements/BreadCrumbs/BreadCrumbs';
export default {
  mixins: [mixin],
  props: {
    // объект из title
    moduleData: {
      type: Object
    }
  },
  components: { BreadCrumbs }
};
</script>
<style lang="scss" scoped>
.module-part {
  display: flex;
  flex-direction: row;
  width: 467px;
  height: 48px;

  &__labels {
    padding-left: 8px;
    display: flex;
    text-align: left;
    width: calc(100% - 48px);
    flex-direction: column;
  }
}
</style>
