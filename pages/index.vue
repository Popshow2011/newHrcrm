<template>
  <div>
    <div v-html="link"></div>
    <avatar />
  </div>
</template>

<script>
import { formatHtml } from '@/utils/helpers';
import Avatar from '~/components/Avatar/Avatar.vue';
export default {
  components: { Avatar },
  mixin: [formatHtml],
  data: function () {
    return {
      link: null
    };
  },
  mounted() {
    this.link = '';
  }
};
</script>
