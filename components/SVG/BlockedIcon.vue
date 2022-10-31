<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      v-if="unblocked"
      d="M8 12H16H16.9C16.9552 12 17 12.0448 17 12.1V18C17 18.5523 16.5523 19 16 19H8C7.44772 19 7 18.5523 7 18V12.1C7 12.0448 7.04477 12 7.1 12H8ZM8 12V9C8 6.79086 9.79086 5 12 5V5C14.2091 5 16 6.79086 16 9V9"
      stroke="white"
      stroke-width="2"
    />
    <path
      v-else
      d="M16 12V9C16 6.79086 14.2091 5 12 5V5C9.79086 5 8 6.79086 8 9V12M16 12H8M16 12H16.9C16.9552 12 17 12.0448 17 12.1V18C17 18.5523 16.5523 19 16 19H8C7.44772 19 7 18.5523 7 18V12.1C7 12.0448 7.04477 12 7.1 12H8"
      stroke="white"
      stroke-width="2"
    />
  </svg>
  <!-- :style="unblocked ? 'margin-top: -1px' : ''" -->
</template>
<script>
export default {
  props: {
    unblocked: {
      type: Boolean,
      default: false
    }
  }
};
</script>
