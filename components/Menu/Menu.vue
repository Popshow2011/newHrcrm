<template>
  <el-menu
    ref="menu"
    :collapse="true"
    mode="vertical"
    menu-trigger="hover"
    :unique-opened="true"
    class="menu-wrapper"
  >
    <!-- @close="closeCallback" -->
    <el-submenu
      v-for="item in menu"
      :key="item.id"
      :index="item.id"
      :disabled="menu.loading"
      ref="submenu"
    >
      <!-- v-click-outside="close" -->
      <template slot="title"> {{ item.name }} </template>
      <el-menu-item-group v-for="(val, key) in item.submenu" :key="key">
        <el-menu-item
          v-tooltip
          :index="`${item.id}-${key}`"
          @click="$emit('click', key)"
        >
          {{ val }}
        </el-menu-item>
      </el-menu-item-group>
    </el-submenu>
  </el-menu>
</template>
<script>
import { Menu, MenuItem, Submenu, MenuItemGroup } from 'element-ui';
import '@/assets/scss/common.scss';
export default {
  props: {
    menu: {
      type: Array
    }
  },
  components: {
    'el-menu': Menu,
    'el-menu-item': MenuItem,
    'el-submenu': Submenu,
    'el-menu-item-group': MenuItemGroup
  }
};
</script>
<style lang="scss">
.menu-wrapper.el-menu {
  float: right;
  width: 181px;
  left: 47px;
  z-index: 100;
  top: 7px;
  border: none;

  .el-submenu__icon-arrow::before {
    content: url('/front/public/style/img/arrow-right.svg') !important;
  }

  .el-submenu__title {
    height: 40px !important;
    line-height: 40px !important;
    padding: 0 12px;
  }

  & > .el-submenu > .el-submenu__title svg {
    margin: 0 !important;
  }
}

.submenu {
  .el-submenu__icon-arrow::before {
    content: url('/front/public/style/img/arrow-right.svg') !important;
    height: 20px;
    width: 10px;
    background: black;
  }
}

.el-menu {
  &--popup {
    border-radius: 4px;
    width: auto;
    padding: 0;
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .el-menu__icon-arrow::before {
    content: url('/front/public/style/img/arrow-right.svg');
  }

  & &-item,
  .el-submenu__title {
    padding: 0 16px !important;

    &:hover {
      background-color: $blue-10;
    }
  }

  & &-item,
  & .el-submenu {
    &.is-disabled {
      opacity: 1;

      .el-submenu__title {
        opacity: 1;
      }

      svg + span,
      // svg ~ i,
      svg + a > span,
      .el-submenu__icon-arrow {
        color: $black-80;
        // display: flex;
      }
    }
  }

  & &-item-group {
    width: 200px;
    color: black;

    .el-menu-item {
      height: 40px;
      line-height: 40px;
      margin: 0;
      font-size: 15px;
      color: $black-200;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__title {
      display: none;
    }
  }

  .el-submenu {
    height: 40px;

    &__title > span,
    .el-menu-item {
      margin: 0;
      font-size: 15px;
      color: $black-200;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        color: $black-200;
      }
    }

    &-icon,
    &__title > svg {
      margin-right: 10px;
      min-width: 24px;
    }

    .el-submenu__icon-arrow::before {
      content: url('/front/public/style/img/arrow-right.svg');
      //   display: flex;
    }

    &__title {
      display: flex;
      align-items: center;
      height: 40px;
      line-height: 24px;
      font-family: 'Roboto', sans-serif;
      font-size: 15px;
      padding: 0 16px;
      border-bottom: none;
    }

    .el-menu-item {
      &:first-child {
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
      }

      &:last-child {
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 16px;
      }
    }

    &.is-active .el-submenu__title {
      border: none;
    }
  }
}
</style>
