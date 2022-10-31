<template>
  <div class="messages__panel">
    <p class="messages__panel-text" v-html="formatHtml(text)" />
  </div>
</template>
<script>
import { mixin } from '@/utils/mixins';
import { MODULE, ACTION } from '@/utils/constants';
import { getController } from '@/controllers/request.js';
import { store } from '@/store';
export default {
  mixins: [mixin],
  data() {
    return {
      text: ''
    };
  },
  created() {
    const params = {
      module: MODULE.CANDIDATE_RESPONDS,
      action: ACTION.GET_MODULE_FIELDS,
      id: this.activeResponseId,
      fields: ['messages'],
      to_pdf: true
    };
    getController({ params })
      .then(resp => {
        this.text = resp.data[0].value;
      })
      .finally(() => {
        this.$emit('set-loading', false);
      });
  },
  computed: {
    activeResponseNumber() {
      return store.state.selectionPanel.activeResponse;
    },
    activeResponseId() {
      return store.state.selectionPanel.responses[this.activeResponseNumber]
        .fields.id.value;
    }
  }
};
</script>
<style lang="scss" scoped>
.messages__panel {
  margin-top: 24px;

  &-text {
    line-height: 24px;
  }
}
</style>
