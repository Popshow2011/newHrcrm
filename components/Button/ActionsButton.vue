<template>
  <el-menu
    ref="menu"
    :collapse="true"
    mode="horizontal"
    menu-trigger="click"
    :unique-opened="true"
    class="actions-btn-wrapper"
    @close="closeCallback"
  >
    <el-submenu
      index="1"
      :disabled="btn.loading"
      ref="submenu"
      v-click-outside="close"
    >
      <template slot="title">
        <Icon :iconName="btnIcons[btn.id]" />
      </template>
      <el-menu-item-group v-for="item in btn.child" :key="item.id">
        <generate-link-button
          v-if="item.id === BTN.ID.GENERATE_LINK"
          :disabled="disabledBtns[item.id] || item.disabled"
          :icon="btnIcons[item.id]"
          :btn="item"
        />
        <form-offer-button
          v-else-if="item.id === BTN.ID.FORM_OFFER"
          :disabled="disabledBtns[item.id] || item.disabled"
          :icon="btnIcons[item.id]"
          :btn="item"
        />
        <form-exit-button
          v-else-if="item.id === BTN.ID.FORM_EXIT_REQUEST"
          :disabled="disabledBtns[item.id] || item.disabled"
          :icon="btnIcons[item.id]"
          :btn="item"
        />
        <el-menu-item
          v-else
          :index="item.id"
          :disabled="disabledBtns[item.id] || item.disabled"
          @click="!item.disabled && item.callback ? item.callback() : null"
        >
          <span class="el-submenu-block">
            <Icon
              class="el-submenu-icon"
              :iconName="btnIcons[item.id]"
              :iconColor="
                disabledBtns[item.id] || item.disabled ? '#B3BCC6' : '#0075DB'
              "
            />
            <el-link
              v-if="item.type === BTN.TYPE.LINK"
              :underline="false"
              :href="!item.disabled ? item.url : null"
              :target="item.target || '_self'"
              type="primary"
              class="el-submenu-text"
            >
              {{ item.name }}
            </el-link>
            <span v-else class="el-submenu-text">{{ item.name }}</span>
          </span>
        </el-menu-item>
      </el-menu-item-group>
    </el-submenu>
  </el-menu>
</template>
<script>
import { Menu, MenuItem, Submenu, MenuItemGroup, Link } from 'element-ui';
import { BUTTON } from '@/utils/constants';
import Icon from 'Elements/Icon/Icon';
import GenerateLinkButton from 'Elements/Button/GenerateLinkButton';
import FormOfferButton from 'Elements/Button/FormOfferButton';
import FormExitButton from 'Elements/Button/FormExitButton';
export default {
  props: {
    btn: {
      loading: Boolean,
      name: String,
      child: Array
    },
    disabledBtns: Object,
    btnIcons: Object
  },
  data() {
    return {
      BTN: BUTTON
    };
  },
  methods: {
    closeCallback() {
      for (let key in this.btn.child) {
        if (this.btn.child[key].hasOwnProperty('submenu')) {
          this.$refs.menu.close(key);
        }
      }
    },
    close() {
      if (this.$refs.menu.openedMenus.length) {
        this.$refs['menu'].closeMenu('1');
      }
    }
  },
  components: {
    GenerateLinkButton,
    FormOfferButton,
    FormExitButton,
    'el-menu': Menu,
    'el-menu-item': MenuItem,
    'el-submenu': Submenu,
    'el-menu-item-group': MenuItemGroup,
    'el-link': Link,
    Icon
  }
};
</script>
<style lang="scss">
.actions-btn-wrapper.el-menu {
  float: right;
  width: auto;
  border: none;

  .el-submenu__title {
    height: 40px !important;
    line-height: 40px !important;
    padding: 0 12px;
  }

  & > .el-submenu > .el-submenu__title {
    padding: 0 !important;

    svg {
      margin: 0 !important;
    }
  }
}

.actions-btn {
  background-color: transparent;
  border: transparent;
  position: static;
}

.el-menu {
  &--popup {
    border-radius: 4px;
    width: auto;
    padding: 0;
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
      }
    }
  }

  & &-item-group {
    width: 300px;
    color: black;

    // &:first-child .el-menu-item,
    // &:first-child .el-submenu__title {
    //   border-top-left-radius: 16px;
    //   border-top-right-radius: 16px;
    // }

    // &:last-child .el-menu-item,
    // &:last-child .el-submenu__title {
    //   border-bottom-left-radius: 16px;
    //   border-bottom-right-radius: 16px;
    // }

    .el-menu-item {
      height: 40px;
      line-height: 40px;
    }

    &__title {
      display: none;
    }
  }

  .el-submenu {
    height: 40px;

    &-text,
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

    &-block {
      display: flex;
      align-items: center;
    }

    .el-submenu__icon-arrow::before {
      content: url('/front/public/style/img/arrow-right.svg');
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
