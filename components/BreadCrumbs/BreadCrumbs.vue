<template>
  <div class="bread-crumbs">
    <span v-for="(label, index) in crumbs" :key="index" :value="label">
      <p
        class="bread-crumbs__label--black bread-crumbs__label"
        v-if="index == crumbs.length - 1"
      >
        {{
          formatHtml(
            (crumbs.length == 1 ? '' : ' / ') + crumbs[index].lbl.value
          )
        }}
      </p>
      <a :href="generateLink(crumbs[index])" class="bread-crumbs__label" v-else>
        {{ formatHtml((index == 0 ? '' : ' / ') + crumbs[index].lbl.value) }}
      </a>
    </span>
  </div>
</template>
<script>
import { mixin } from '@/utils/mixins';
export default {
  mixins: [mixin],
  props: {
    crumbs: {
      type: Array
    }
  },
  methods: {
    generateLink(val) {
      let link = '';
      if (val.intents && val.intents.request) {
        link = val.intents.request.url;
        if (!Array.isArray(val.intents.request.request_params)) {
          for (var opt in val.intents.request.request_params) {
            console.log('opt', opt, val.intents.request.request_params[opt]);

            link += '&' + opt + '=' + val.intents.request.request_params[opt];
          }
        }
      }
      return link;
    }
  }
};
</script>
<style lang="scss" scoped>
.bread-crumbs {
  margin-top: 3px;
  width: 100%;
  height: 19px;
  display: flex;
  flex-direction: row;

  .bread-crumbs__label {
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    color: $grey40;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-decoration: none;

    &:hover,
    &:visited {
      color: $grey40 !important;
    }
  }

  span:nth-child(2) {
    overflow: hidden;
    text-overflow: ellipsis;
    color: $grey40;
  }

  span {
    margin-right: 4px;
  }

  .bread-crumbs__label--black {
    color: $grey80;
    margin-right: 0;

    &:hover,
    &:visited {
      color: $grey80 !important;
    }
  }
}
</style>
