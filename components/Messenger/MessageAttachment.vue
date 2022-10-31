<template>
  <div class="message-attach flex-row">
    <Button
      hasLeftIcon
      iconName="document"
      buttonText=""
      buttonColor="darkBlue"
      buttonSize="big"
      :disabled="!file.download_url"
      round
      class="attach-btn"
      :link="file.download_url"
    >
    </Button>
    <div class="flex-column">
      <a
        v-if="file.download_url"
        :href="file.download_url"
        class="primary fw-500"
      >
        {{ file.name }}
      </a>
      <p v-else class="primary fw-500">{{ file.name }}</p>
      <!-- <p class="secondary">{{ file.size }}</p> -->
    </div>
  </div>
</template>

<script>
import Button from 'Elements/Button/Button';
export default {
  props: {
    file: {
      type: Object,
      default: () => ({})
    }
    // size: { type: String, default: '0 mb' }
  },
  components: { Button }
};
</script>

<style lang="scss">
.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.message-attach {
  // width: 304px;
  padding: 12px;
  margin: 10px 0 0 0;
  overflow: hidden;
  word-break: break-word;

  .attach-btn {
    height: 40px;
    width: 40px;
    min-width: 40px;
    margin-right: 8px !important;

    .button-content {
      margin: 0;
    }
  }
}
</style>
