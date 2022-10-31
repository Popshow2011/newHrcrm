<template>
  <el-form-item :label="label" :prop="name" class="ql-editor-container row">
    <textarea
      :id="`${id}_${name}`"
      v-html="value"
      :disabled="disabled"
      :data-name="name"
    ></textarea>
    <span
      v-if="maxLength"
      :class="['el-input__count', disabled ? 'is-disabled' : '']"
      :style="`width: ${width};`"
    >
      <span>{{ `${textLength}/${maxLength}` }}</span>
    </span>
    <input type="hidden" :name="name" :value="value" />
  </el-form-item>
</template>

<script>
import { FormItem } from 'element-ui';
import tinymce from 'tinymce/tinymce.min.js'; // use only ^4.7.7 version
import 'tinymce/themes/modern/theme.min.js';
import 'tinymce/skins/lightgray/skin.min.css';

import 'tinymce/plugins/advlist/plugin.min.js';
import 'tinymce/plugins/autolink/plugin.min.js';
import 'tinymce/plugins/insertdatetime/plugin.min.js';
import 'tinymce/plugins/link/plugin.min.js';
import 'tinymce/plugins/template/plugin.min.js';
import 'tinymce/plugins/textpattern/plugin.min.js';
import 'tinymce/plugins/bbcode/plugin.min.js';
import 'tinymce/plugins/colorpicker/plugin.min.js';
import 'tinymce/plugins/lists/plugin.min.js';
import 'tinymce/plugins/preview/plugin.min.js';
import 'tinymce/plugins/textcolor/plugin.min.js';
// import './ql-editor.scss';

export default {
  name: 'tinymce',
  props: {
    id: String,
    name: {
      type: String,
      required: true
    },
    label: {
      type: String
    },
    maxLength: {
      type: Number,
      default: 0
    },
    width: {
      type: String,
      default: '100%'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: { default: '' },
    plugins: {
      default: function() {
        return [
          'advlist autolink lists link preview',
          'insertdatetime textpattern',
          'template textcolor colorpicker'
        ];
      },
      type: Array
    },
    toolbar1: {
      default:
        'fontsizeselect fontselect | bold italic strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | link | numlist bullist | preview',
      type: String
    },
    other_options: {
      default: function() {
        return {
          menubar: false,
          height: 300
        };
      },
      type: Object
    }
  },
  data() {
    return {
      content: '',
      editor: null,
      cTinyMce: null,
      checkerTimeout: null,
      isTyping: false,
      textLength: 0,
      iframeEditor: null
    };
  },
  mounted() {
    this.content = this.value;
    this.init();
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    handleChange() {
      if (this.maxLength) {
        this.countTextLength();
      }
    },
    init() {
      let options = {
        selector: `#${this.id}_${this.name}`,
        skin: false,
        toolbar1: this.toolbar1,
        width: this.width,
        plugins: this.plugins,
        init_instance_callback: this.initEditor,
        convert_urls: false
      };
      tinymce.init(this.concatAssciativeArrays(options, this.other_options));
    },
    initEditor(editor) {
      this.editor = editor;
      editor.on('KeyUp', e => {
        if (this.editor.getContent() !== this.value) {
          this.submitNewContent();
        }
        this.$emit('editorChange', e);
        this.handleChange();
      });
      editor.on('KeyDown', e => {
        if (
          this.maxLength &&
          this.textLength === this.maxLength &&
          e.keyCode != 8
        ) {
          return false;
        }
      });
      editor.on('Change', e => {
        if (this.editor.getContent() !== this.value) {
          this.submitNewContent();
        }
        this.$emit('editorChange', e);
        this.handleChange();
      });
      editor.on('init', () => {
        editor.setContent(this.content);
        this.$emit('input', this.content);
      });
      if (this.disabled) {
        this.editor.setMode('readonly');
      } else {
        this.editor.setMode('design');
      }

      this.$emit('editorInit', editor);
      const frame = frames[`${this.id}_${this.name}_ifr`];
      this.iframeEditor = $(`#${this.id}_${this.name}_ifr`).contents();
      if (this.disabled) {
        frame.classList.add('is-disabled');
      }

      frame.onload = function() {
        if (this.maxLength) {
          this.countTextLength();
        }
      }.call(this);
    },
    concatAssciativeArrays(array1, array2) {
      if (array2.length === 0) return array1;
      if (array1.length === 0) return array2;
      let dest = [];
      for (let key in array1) dest[key] = array1[key];
      for (let key in array2) dest[key] = array2[key];
      return dest;
    },
    submitNewContent() {
      this.isTyping = true;
      if (this.checkerTimeout !== null) clearTimeout(this.checkerTimeout);
      this.checkerTimeout = setTimeout(() => {
        this.isTyping = false;
      }, 300);

      this.$emit('input', this.editor.getContent());
    },
    countTextLength() {
      // получаем доступ к содержимому iframe
      let count = 0;
      let max = this.maxLength;
      var doc = this.iframeEditor.find('body');
      if (doc.length) {
        doc.children().each(function() {
          // пробегаемся по вложенным тегам и текстовым узлам
          // обрезаем превышающую длину текста
          const nodes = $(this).contents();

          nodes.each((i, node) => {
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
        });
        this.textLength = count;
      }
    }
  },
  watch: {
    value: function(newValue) {
      if (!this.isTyping) {
        if (this.editor !== null) this.editor.setContent(newValue);
        else this.content = newValue;
      }
      this.$emit('set-text-value', this.name, this.value);
    },
    disabled(value) {
      if (value) {
        this.editor.setMode('readonly');
      } else {
        this.editor.setMode('design');
      }
    }
  },
  components: {
    'el-form-item': FormItem
  }
};
</script>
