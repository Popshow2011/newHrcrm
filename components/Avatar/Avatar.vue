<template>
  <div class="avatar">
    <div class="block">
      <el-avatar
        v-if="shape == 'circle'"
        :size="32"
        :src="url"
        :fit="fit"
        :class="url ? '' : 'circle-empty'"
      >
        <!-- <img v-if="url == 'bot'" src="../../../assets/img/smallBot.png" /> -->
        <img v-if="url == 'bot'" src="Assets/img/smallBot.png" />
        <img v-else-if="url" :src="url" />
        <span v-else>{{ initials || avatarName }}</span>
      </el-avatar>
      <el-avatar
        v-else-if="shape == 'square'"
        shape="square"
        :size="144"
        :fit="fit"
        :src="url"
        :class="url ? '' : 'square-empty'"
      >
        <img v-if="url" :src="url" />
        <span v-else>{{ initials || avatarName }}</span>
      </el-avatar>
    </div>
  </div>
</template>
<script>
import { Avatar } from 'element-ui';
export default {
  components: {
    'el-avatar': Avatar
  },
  props: {
    fit: { String, default: 'cover' }, // cover
    url: {
      type: String,
      default: ''
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    fullName: {
      type: String,
      default: ''
    },
    initials: {
      type: String,
      default: ''
    },
    shape: {
      type: String,
      default: 'circle'
    }
  },
  computed: {
    avatarName() {
      if (this.firstName && this.lastName) {
        return (this.lastName[0] + this.firstName[0]).toUpperCase();
      } else if (this.firstName) {
        return this.firstName[0].toUpperCase();
      } else if (this.lastName) {
        return this.lastName[0].toUpperCase();
      } else if (this.fullName) {
        return (
          this.fullName[0] +
          (!this.fullName.includes(' ')
            ? ''
            : this.fullName[this.fullName.indexOf(' ') + 1])
        ).toUpperCase();
      } else {
        return '??';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.avatar {
  padding: 0;
  margin: 0;
  display: flex;

  & ::v-deep .block {
    display: inherit;
  }

  & ::v-deep img {
    display: block;
    height: 100%;
    // width: auto;
    margin: 0 auto;
  }

  & ::v-deep .el-avatar--square {
    border-radius: 8px;
  }

  & ::v-deep.square-empty {
    background: $white;
    border: 1px solid $grey8;
    font-weight: 700;
    font-size: 64px;
    line-height: 75px;
    color: $grey16;
  }

  & ::v-deep .circle-empty {
    background: $grey16;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: $white;
  }
}
</style>
