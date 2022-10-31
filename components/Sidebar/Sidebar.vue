<template>
  <div
    id="sidebar"
    class="sidebar-panel"
    :class="{ 'sidebar-panel--fixed': oversize }"
  >
    <div class="sidebar-panel__wrapper shadow-lvl-1">
      <Subpanel
        v-if="subpanels && subpanels.length > 1"
        :subpanelCol="subpanels[1]"
        :col-index="1"
        :module="module"
        :record="fields.id.value"
        :data="fields"
        :mod="mod"
        :emails="emails"
        :allowed-scroll="true"
      >
      </Subpanel>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import Subpanel from 'Elements/Subpanel/SubpanelEl';

export default {
  components: { Subpanel },
  props: {
    fields: {
      type: Object
    },
    mod: {
      type: Object
    },
    module: String,
    emails: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      oversize: false
    };
  },
  computed: {
    subpanels() {
      return store.state.subpanels.subpanels;
    }
  }
};
</script>
<style lang="scss" scoped>
.el-tabs {
  & ::v-deep &__nav-scroll {
    margin: 24px 0 0 24px;
  }
}

.sidebar-panel__wrapper {
  background: $white;
  border-radius: 6px;
  margin: 20px 0 0 24px;
  width: 384px;
  word-wrap: break-word;
  position: fixed;
  height: calc(100% - 100px);
  bottom: 20px;
  overflow: hidden;

  & ::v-deep .footer-bar {
    background-color: $white;
  }
}
</style>
<style lang="scss">
.sidebar-panel--fixed {
  .footer-bar {
    position: fixed;
    bottom: 0;
    width: 384px;
  }
}

#sidebar .el-tabs {
  height: 100%;

  .el-tabs__content {
    height: calc(100% - 67px);
  }

  .el-tab-pane {
    height: 100%;
  }
}
</style>
