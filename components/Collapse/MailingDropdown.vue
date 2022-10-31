<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item name="1">
      <template slot="title">
        <div class="collapse">
          <div
            class="collapse__color"
            :style="{ 'background-color': stage.color }"
          ></div>
          <p class="collapse__title">{{ stage.name }}</p>
        </div>
      </template>
      <MailingCandidate
        v-for="(candidate, index) in stage.candidates"
        :candidate="candidate"
        :key="index"
    /></el-collapse-item>
  </el-collapse>
</template>
<script>
import { Collapse, CollapseItem } from 'element-ui';
import MailingCandidate from 'Parts/Mailing/Item/MailingCandidate';
export default {
  props: {
    stage: Object
  },
  components: {
    MailingCandidate,
    'el-collapse': Collapse,
    'el-collapse-item': CollapseItem
  }
};
</script>
<style lang="scss" scoped>
.el-collapse {
  margin: 12px;
  border: none;

  & ::v-deep &-item {
    &__arrow {
      margin: 0 12px 0 auto;
    }

    &__header {
      border: 1px solid $black-30;
      border-radius: 4px;
      height: fit-content;
    }

    &__content {
      padding-bottom: 0;
    }

    &__wrap {
      border: none;
    }
  }

  & ::v-deep .el-icon-arrow-right::before {
    content: url('/front/src/assets/img/arrow-right.svg');
  }
}

.collapse {
  display: flex;
  padding: 4px;
  min-height: 32px;

  &__color {
    width: 4px;
    border-radius: 4px;
    background-color: red;
  }

  &__title {
    display: flex;
    align-self: center;
    color: $black-200;
    font-size: 14px;
    line-height: 20px;
    font-weight: bold;
    margin: 0 0 0 16px;
    max-width: 300px;
  }
}
</style>
