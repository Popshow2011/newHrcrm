<template>
  <div style="width: 100%">
    <ckeditor
      v-model="editorModel"
      :editor="editor"
      :ref="name"
      :name="name"
      :config="editorConfig"
      :autoFocus="autofocus"
      :disabled="disabled"
      @keyup.native="countTextLength"
      @blur="$emit('blur')"
      class="el-textarea__inner"
    />
    <span
      v-if="maxLength && textLength"
      :class="['text-limit', disabled ? 'is-disabled' : '']"
    >
      {{ `${textLength}/${maxLength}` }}
    </span>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixins';
import BalloonEditor from 'ckeditor5-build-balloon-underline';
import CKEditor from '@ckeditor/ckeditor5-vue2';
import '@ckeditor/ckeditor5-basic-styles/build/translations/ru';
import '@ckeditor/ckeditor5-list/build/translations/ru';

export default {
  mixins: [mixin],
  components: {
    ckeditor: CKEditor.component
  },
  props: {
    autofocus: {
      type: Boolean,
      default: false
    },
    name: String,
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    minLength: Number,
    maxLength: Number
  },
  data() {
    return {
      editor: BalloonEditor,
      editorConfig: {
        placeholder: this.placeholder,
        toolbar: ['bold', 'italic', 'underline', 'bulletedList'],
        language: 'ru'
      },
      textLength: 0
    };
  },
  computed: {
    editorModel: {
      set(value) {
        if (this.maxLength && this.textLength == this.maxLength) return false;

        this.value = value;
        this.$emit('change', value);
      },
      get() {
        return this.formatHtml(this.value)
          .replace(/\\"/g, '')
          .replace(' class="cdx-underline"', '');
      }
    }
  },
  methods: {
    countTextLength() {
      if (!this.maxLength) return;

      let count = 0;
      let max = this.maxLength;

      this.$refs[this.name].$el.childNodes.forEach(node => {
        // подсчет длины текста без учета вложенности html-тегов
        const text = node.nodeType !== 3 ? node.innerText : node.nodeValue;
        count += text.length;

        if (count > max) {
          const num = max - count;

          if (node.innerText) {
            node.innerText = node.innerText.replace(
              node.innerText.slice(num),
              ''
            );
          }
          if (node.nodeValue) {
            node.nodeValue = node.nodeValue.replace(
              node.nodeValue.slice(num),
              ''
            );
          }
          count = max;
        }
      });

      this.textLength = count;

      if (count == max) {
        this.editorModel = this.$refs[this.name].$el.innerHTML;
        this.value = this.$refs[this.name].$el.innerHTML;
      }

      return count;
    }
  }
};
</script>

<style lang="scss">
.ck {
  background-color: $white;

  &::-webkit-scrollbar {
    width: 16px !important;
  }

  .ck-placeholder::before {
    color: $black-60;
  }

  & ~ .text-limit {
    position: absolute;
    bottom: 1px;
    left: 1px;
    text-align: right;
    line-height: 24px;
    background-color: $white;
    width: calc(100% - 32px);
    border-radius: 4px;
  }

  &.ck-focused,
  &.ck-blurred {
    border-radius: 4px !important;
    border: 1px solid $black-30;
    box-shadow: none !important;
    min-height: 120px;
    max-height: 480px;
    overflow-y: auto;
    word-break: break-word;

    &:after {
      content: '';
      width: 28px;
      height: 28px;
      display: inline-block;
      position: absolute;
      background-image: url(/front/public/style/img/resizer.svg) !important;
      background-size: 24px 24px;
      background-repeat: no-repeat;
      bottom: 1px;
      right: 1px;
      background-color: $white;
      border-radius: 4px;
      pointer-events: none;
    }

    &:focus {
      border-color: $blue-120;
      border-radius: 4px;
    }

    &:invalid {
      border: 1px solid $red-700;
      border-radius: 4px;
    }
  }

  &.ck-read-only {
    background-color: $black-10;
    border: 1px solid $black-30;

    &:hover {
      border: 1px solid $black-30;
    }

    &:after {
      content: '';
      width: 28px;
      height: 28px;
      display: inline-block;
      position: absolute;
      background-image: url(/front/public/style/img/resizer-disabled.svg) !important;
      background-size: 24px 24px;
      background-repeat: no-repeat;
      bottom: 1px;
      right: 1px;
      background-color: $black-10 !important;
      border-radius: 4px;
      pointer-events: none;
    }
  }

  &.ck-editor__editable_inline {
    padding: 0 12px 12px 12px !important;
    & > p {
      font-size: 16px;
      line-height: 24px;
      color: $black-200;
    }
  }

  &.ck-reset_all,
  &.ck-reset_all *:not(.ck-tooltip):not(.ck-tooltip__text) {
    background: $blue-130;
    color: $white;
  }

  &.ck-balloon-panel_arrow_s:after,
  &.ck-balloon-panel_arrow_s:before {
    content: unset !important;
  }

  &.ck-button:hover,
  &.ck-button:hover > *:not(.ck-tooltip):not(.ck-tooltip__text) {
    background: $blue-150 !important;
  }

  .ck-balloon-rotator {
    border-radius: 4px !important;
  }

  ol,
  ul {
    list-style: inside;
  }

  .ck-icon {
    color: $blue-130 !important;
  }

  &:hover ~ .text-limit {
    background-color: $black-10;
  }
}
</style>
