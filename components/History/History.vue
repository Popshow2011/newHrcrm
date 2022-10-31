<template>
  <div class="s-history" v-if="data">
    <div class="messages-items">
      <el-link
        :href="userLink"
        :underline="false"
        type="primary"
        target="_blank"
        class="messages-items-author"
      >
        <Icon iconName="User-light" iconColor="#0075DB" />
        <p class="text-author primary fw-500">
          {{ data.created_by_full_name }}
        </p>
      </el-link>
      <div class="items-text">
        <p class="text-margin-right secondary">{{ time }}</p>
        <p class="s-history__value" v-html="historyText"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { Link } from 'element-ui';
import { detailView } from '@/utils/helpers';
import { MODULE } from '@/utils/constants';
import { mixin } from '@/utils/mixins';
import Icon from '../Icon/Icon';

export default {
  mixins: [mixin],
  props: {
    data: Object,
    module: String
  },
  data() {
    return {
      isFullText: false,
      visibleTextHelp: false
    };
  },
  computed: {
    time() {
      return this.data.date_created.split(' ')[1];
    },
    userLink() {
      return this.data.created_by_id
        ? detailView(MODULE.EMPLOYEES, this.data.created_by_id)
        : '#';
    },
    historyText() {
      const text = this.data.display_value_text || this.data.after_value_string;
      return this.formatHtml(text);
    }
  },
  components: {
    'el-link': Link,
    Icon
  }
};
</script>

<style lang="scss" scoped>
.messages-items {
  display: flex;
  flex-direction: column;
  align-self: center;
  -ms-grid-row-align: center;
  margin-top: 16px;

  &-author {
    display: flex;
    align-self: flex-start;
    -ms-grid-row-align: flex-start;
    flex-direction: row;
    margin-bottom: 4px;
    text-decoration: none;
  }

  p {
    margin: 0;
    align-self: flex-start;
    -ms-grid-row-align: flex-start;
    font-size: 16px;
    color: $black-170;
    overflow: visible;
    white-space: normal;
  }

  .text {
    &-author {
      align-self: center;
      -ms-grid-row-align: center;
      margin-left: 8px;
    }

    &-margin-right {
      margin-right: 12px;
    }
  }

  // .blue {
  //   color: $blue-120;
  // }

  // .grey {
  //   color: $black-40;
  // }
}

.items {
  &-text {
    display: flex;
    flex-direction: row;
    justify-self: center;
    line-height: 24px;

    p {
      font-size: 15px;
    }
  }
}
</style>

<style lang="scss">
.messages-items-author {
  .el-link--inner {
    display: flex;
  }
}

.s-history__value {
  color: $black-170;

  b {
    color: $blue-120;
    font-weight: normal;
  }
}
</style>
