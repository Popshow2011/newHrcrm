<template>
  <div :class="[showMore ? '' : 'expanded-row--short', 'expanded-row']">
    <div class="expanded-row--main">
      <button type="button" @click="closeBlock(row.module, showMore)">
        <Icon
          iconName="smallArrowDown"
          :class="[showMore ? '' : 'rotated-icon']"
        />
        <p>{{ formatHtml(row.name) }}</p>
      </button>
    </div>
    <div v-if="showMore">
      <div
        class="expanded-row--secondary"
        v-for="part in row.children"
        :key="`${row}_${part}`"
      >
        <a
          :href="redirect(part.module, part.id)"
          :class="type == 'LastActions' ? 'short-name' : ''"
          target="_blank"
          :title="
            part.name && part.name.length && type == 'LastActions' > 48
              ? part.name
              : ''
          "
        >
          {{
            type == 'LastActions' && !part.name
              ? '[нет полного имени]'
              : formatHtml(part.name)
          }}</a
        >
        <p :class="type == 'LastActions' ? 'short-date' : ''">
          {{ type == 'LastActions' ? part.date : '' }}
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import 'Root/assets/scss/common.scss';
import Icon from 'Elements/Icon/Icon';
import { mixin } from '@/utils/mixins';
import { detailView } from '@/utils/helpers';

export default {
  mixins: [mixin],
  components: {
    Icon
  },
  props: {
    row: {
      type: Object || Array
    },
    type: {
      type: String
    }
  },
  computed: {
    showMore() {
      return this.row.show_module == '0' ? false : true;
    }
  },
  methods: {
    redirect(module, id) {
      if (this.type == 'SavedFilters') {
        return `/index.php?action=index&module=${module}&saved_search_select=${id}`;
      } else if (this.type == 'LastActions') {
        return detailView(module, id);
      } else {
        return;
      }
    },
    closeBlock(module, val) {
      this.showMore = !val;
      this.$emit('close-block', module, !val ? '1' : '0');
    }
  }
};
</script>
<style lang="scss" scoped>
.expanded-row {
  font-family: Roboto, 'Roboto', sans-serif;

  &--short {
    border-bottom: 1px solid $black-20;
  }

  &--main {
    padding: 8px 12px 11px 24px;
    background: $black-10;

    button {
      border: none;
      background: transparent;
      display: flex;
      height: 24px;
      padding: 0;

      .rotated-icon {
        transform: rotate(-90deg);
      }

      p {
        font-weight: 400;
        font-size: 15px;
        line-height: 24px;
        color: $black-200;
        margin: 0 0 0 8px;
        font-family: Roboto, 'Roboto', sans-serif;
      }
    }
  }

  &--secondary {
    background: white;
    display: flex;
    padding: 8px 12px 7px 24px;
    border-bottom: 1px solid $black-20;

    a {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      color: $blue-120;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      text-decoration: none;
      font-family: Roboto, 'Roboto', sans-serif;
    }

    .short-name {
      width: 336px;
    }

    .short-date {
      margin: 0 0 0 24px;
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      color: $black-100;
    }
  }
}
</style>
