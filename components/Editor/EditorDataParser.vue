<template>
  <div class="message-text">
    <div v-for="block in blocks" :key="block.id">
      <ol v-if="block.data.style == 'ordered'" class="list">
        <li v-for="(item, index) in block.data.items" :key="index">
          {{ item }}
        </li>
      </ol>

      <ul v-else-if="block.data.style == 'unordered'" class="list">
        <li v-for="(item, index) in block.data.items" :key="index">
          {{ item }}
        </li>
      </ul>

      <div v-else v-html="block.data.text"></div>
    </div>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixins';
import anchorme from 'anchorme';

export default {
  props: {
    data: String
  },
  mixins: [mixin],

  computed: {
    blocks() {
      let data = this.formatHtml(this.data)
        .replace(/\\"/g, '')
        .replace(' class="cdx-underline"', '');

      return [
        {
          data: {
            text: anchorme(data)
          },
          type: 'paragraph',
          id: Date.now()
        }
      ];
    }
  }
};
</script>

<style lang="scss">
.message-text {
  a {
    text-decoration: underline;
    color: $blue-100;
  }

  ul,
  ol {
    padding-left: 16px;
    list-style: inside;
  }
}
</style>
