<template>
  <el-tag
    :closable="closable"
    :class="{ closable }"
    :effect="effect"
    :size="size"
    @close="id ? $emit('close', $event, id) : null"
  >
    <Icon
      v-if="icon"
      :icon-name="icon"
      :icon-color="iconColor"
      class="tag-icon"
    />
    {{ name }}
  </el-tag>
</template>

<script>
import { Tag } from 'element-ui';
import Icon from 'Elements/Icon/Icon';

export default {
  props: {
    id: String,
    name: String,
    effect: String,
    icon: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: ''
    },
    closable: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small' // extra-small
    }
  },
  components: {
    'el-tag': Tag,
    Icon
  }
};
</script>
<style lang="scss" scoped>
.closable {
  padding-right: 28px !important;
}

.tag-icon {
  width: 16px;
  height: 16px;
}

.el-tag {
  background: $black-20;
  color: $black-100;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  position: relative;
  border: none;

  &--primary {
    background: $blue-100;
    color: $white;

    & ::v-deep .el-icon-close {
      content: url('../../../assets/img/close.svg') !important;
    }
  }

  &--dark {
    background: #555555;
    color: $white;

    & ::v-deep .el-icon-close {
      content: url('../../../assets/img/close.svg') !important;
    }
  }

  &--bordered {
    border: 1px solid $grey12;
  }

  & ::v-deep .el-icon-close {
    content: url('../../../assets/img/close-gray.svg');
    position: absolute;
    top: 6px;
    right: 6px;
  }

  & ::v-deep .el-icon-close:hover {
    background: transparent;
  }

  &--extra-small {
    height: 20px;
    padding: 0px 6px;

    & ::v-deep .el-icon-close {
      top: 2px;
    }
  }

  &--small {
    height: 24px;
    padding: 2px 8px;

    & ::v-deep .el-icon-close {
      top: 4px;
    }
  }
}

.el-tag:disabled {
  background: $black-10;
  color: $black-80;
  border: 1px solid $black-30;

  & ::v-deep .el-icon-close:hover {
    background: transparent;
    color: $black-80;
  }
}
</style>
