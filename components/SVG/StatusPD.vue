<template>
  <svg
    v-if="status == 'sent'"
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14 3.11111C7.98623 3.11111 3.11111 7.98623 3.11111 14C3.11111 20.0138 7.98623 24.8889 14 24.8889C20.0138 24.8889 24.8889 20.0138 24.8889 14C24.8889 7.98623 20.0138 3.11111 14 3.11111ZM0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14ZM12.4444 15.5556V6.22222H15.5556V15.5556H12.4444ZM15.5556 17.1111V21.7778H12.4444V17.1111H15.5556Z"
      fill="#FDB94D"
    />
  </svg>
  <svg
    v-else-if="status == 'denied'"
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14 3.11111C7.98623 3.11111 3.11111 7.98623 3.11111 14C3.11111 20.0138 7.98623 24.8889 14 24.8889C20.0138 24.8889 24.8889 20.0138 24.8889 14C24.8889 7.98623 20.0138 3.11111 14 3.11111ZM0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14ZM14 16.1999L9.76661 20.4333L7.56672 18.2334L11.8001 14L7.56672 9.76661L9.76661 7.56672L14 11.8001L18.2334 7.56672L20.4333 9.76661L16.1999 14L20.4333 18.2334L18.2334 20.4333L14 16.1999Z"
      fill="#F1666A"
    />
  </svg>
  <svg
    v-else-if="status == 'accepted'"
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
  >
    <circle cx="12.5" cy="12.5" r="12.5" fill="#76C769" />
    <path
      d="M5.83334 12.4445L10.0758 17.5L19.1667 6.66669"
      stroke="white"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
<script>
export default {
  props: {
    status: {
      type: String,
      default: 'sent'
    }
  }
}
</script>
