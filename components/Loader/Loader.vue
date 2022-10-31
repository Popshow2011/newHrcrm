<template>
  <div class="el-loading-mask">
    <div class="el-loading-spinner">
      <svg
        class="circular"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          stroke="#EFF8FF"
          stroke-width="6"
          class="path"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="24"
            y1="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#2D81CE" />
            <stop offset="900" stop-color="#D6EBFF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
.el-loading-mask {
  position: inherit !important;
  height: fit-content;
  list-style: none;
  background: transparent;
}

.el-loading-spinner {
  margin: 0;
  position: inherit !important;
  height: 60px;
  align-content: center;
}

::v-deep .circular {
  height: 48px;
  width: 48px;

  .path {
    stroke-width: 6;
    stroke: url(#paint0_linear);
  }
}
</style>
