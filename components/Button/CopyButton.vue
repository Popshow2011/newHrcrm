<template>
  <div class="copy">
    <input v-if="false" type="text" v-model="text" />
    <button
      type="button"
      v-clipboard="text"
      v-clipboard:success="onCopy"
      v-clipboard:error="onError"
      class="copy-button"
    >
      <Icon iconName="Copy" iconColor="#CDD4DA" />
    </button>
  </div>
</template>
<script>
import Vue from 'vue';
import Clipboard from 'v-clipboard';
import Icon from '../Icon/Icon';
import { errorMsg } from '@/utils/mixins';

Vue.use(Clipboard);

export default {
  mixins: [errorMsg],
  props: {
    text: {
      type: String
    }
  },
  components: {
    Icon
  },
  methods: {
    onCopy() {
      this.showNotification({
        offset: 100,
        showClose: true,
        message: `Успешно скопировано`,
        duration: 6500,
        type: 'success'
      });
    },
    onError() {
      this.showNotification({
        offset: 100,
        showClose: true,
        message: `Ошибка копирования`,
        duration: 6500,
        type: 'error'
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.copy {
  margin-left: auto;

  &-button {
    border: transparent;
    background: transparent;
  }
}
</style>
