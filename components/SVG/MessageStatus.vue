<template>
  <svg
    v-if="readedStatus || deliveredStatus"
    width="21"
    height="13"
    viewBox="0 0 21 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 7L5 11L15 1M8.53846 9.57143L10 11L20 1"
      :stroke="readedStatus ? readedColor : sendedColor"
      stroke-width="2"
    />
  </svg>
  <svg
    v-else-if="queuedStatus"
    width="16"
    height="13"
    viewBox="0 0 16 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 7L5 11L15 1" :stroke="sendedColor" stroke-width="2" />
  </svg>
  <svg
    v-else-if="errorStatus"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 11L11 5M5 5L11 11M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
      :stroke="errorColor"
    />
  </svg>
</template>
<script>
export default {
  props: {
    status: String
  },
  data() {
    return {
      sendedColor: '#006BC9',
      readedColor: '#4DA0FF',
      errorColor: '#EC2222'
    };
  },
  computed: {
    readedStatus() {
      return this.status === 'read';
    },
    queuedStatus() {
      return (
        this.status === 'enqueued' ||
        this.status === 'queued' ||
        this.status === 'delayed' ||
        this.status === 'sent' ||
        this.status === 'Отправлено'
      );
    },
    deliveredStatus() {
      return this.status === 'delivered';
    },
    errorStatus() {
      return (
        this.status === 'error' ||
        this.status === 'failed' ||
        this.status === 'undelivered' ||
        this.status === 'no-match-template' ||
        this.status === 'cancelled'
      );
    }
  }
};
</script>
