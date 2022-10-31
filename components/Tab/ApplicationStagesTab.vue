<template>
  <div class="stage-tab stage-tab--default">
    <div class="content-top">
    </div>
    <div class="content-center">
      <StageList
        v-if="stages.length"
        :stageList="stages"
      ></StageList>
      <div v-else class="no-plan">Нет плана согласования</div>
    </div>
  </div>
</template>

<script>
import { store } from '@/store';
import StageList from './Details/StageList';

export default {
  props: {
    module: String,
    id: String,
    userId: String,
    tableSql: String,
    mode: {
      type: String,
      default: 'default'
    },
    countId: String
  },
  computed: {
    stages() {
      return store.state.application.stageList || [];
    },
  },
  components: {
    StageList
  },
}
</script>

<style lang="scss" scoped>
.content {
  &-center {
    overflow-y: auto;
    height: 100%;
    -ms-overflow-style: none;
  }
}

.stage-tab {
  position: relative;
  height: 100%;
  overflow: hidden;

  &--selection .content-center {
    max-height: 254px;
  }
}

.no-plan {
  margin: 24px;
  padding: 16px;
  color: #787b7f;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  background: #f9f9f9;
  border: 1px solid #cdd4da;
  font-family: 'Roboto', sans-serif;
}
</style>
