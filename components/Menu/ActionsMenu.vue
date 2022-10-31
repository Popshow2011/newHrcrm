<template>
  <el-dropdown trigger="click" @command="handleCommand" class="dropdown-el">
    <span>
      <Icon :iconColor="color" iconName="VerticalEllepsis" />
    </span>
    <el-dropdown-menu slot="dropdown" class="dropdown-el__list shadow-lvl-2">
      <el-dropdown-item
        v-for="action in actions"
        :key="action.id"
        :command="action.id"
        :disabled="disabled"
      >
        <div class="dropdown-el__item" v-if="action.id">
          <Icon
            class="dropdown-el__item-icon"
            :iconName="actionIcons[action.id]"
            iconColor="#0075DB"
            :disabled="disabled"
          />
          <p class="dropdown-el__item-text">{{ action.name }}</p>
        </div>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import { Dropdown, DropdownMenu, DropdownItem } from 'element-ui';
import Icon from 'Elements/Icon/Icon';
export default {
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    handleCommand: {
      type: Function,
      default: null
    },
    color: {
      type: String,
      default: () => ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      actionIcons: {
        edit: 'pencilMin',
        edit_publish: 'pencilMin',
        delete: 'deleteMin',
        duplicate: 'Copy',
        toArchive: 'toArchive',
        publish: 'publish',
        ReplyTo: 'ReplyTo',
        ReplyToAll: 'ReplyToAll',
        Forward: 'Forward',
        exit: 'exit'
      }
    };
  },
  components: {
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    'el-dropdown': Dropdown,
    Icon
  }
};
</script>
<style lang="scss" scoped>
.dropdown-el {
  width: auto;

  &__item {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 40px;
    border-radius: 4px;

    &-icon {
      margin-right: 8px;
    }

    &-text {
      margin: 0;
      color: $black-190;
      font-size: 15px;
      font-family: 'Roboto', sans-serif;
      line-height: 24px;
    }
  }

  &__list {
    margin: 0 !important;
  }
}

.el-dropdown-menu {
  border-radius: 4px;
  padding: 0;
  width: auto;

  &__item {
    // border-radius: 4px;
    padding: 0 16px;

    &.is-disabled {
      & ::v-deep .dropdown-el__item-text {
        color: $black-40;
      }
    }
  }
}
</style>
