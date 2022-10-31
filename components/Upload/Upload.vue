<template>
  <div :class="['upload-area', wrongFormat || isOversize ? 'file-error' : '']">
    <el-upload
      :name="name"
      :class="name == 'photo_file' && uploaded ? 'uploaded' : ''"
      :ref="'upload' + id"
      action=""
      :auto-upload="false"
      :list-type="listType"
      :disabled="disabled || file.length == limit"
      :drag="drag"
      :accept="accept"
      :limit="limit"
      :on-change="changeFile"
      :on-remove="removeFile"
      :multiple="multiple"
      :show-file-list="showFileList"
    >
      <slot></slot>
      <template v-if="!Object.keys($slots).length">
        <div
          class="upload-counter"
          @drop="drop"
          @dragover="dragover"
          @dragleave="dragleave"
        >
          <input type="file" multiple ref="file" style="display: none" />
          <div class="upload-area__content">
            <div
              v-if="wrongFormat || isOversize"
              class="content__title red"
              v-html="errorText"
            ></div>
            <div
              v-if="uploadText && !wrongFormat && !isOversize"
              class="content__title primary"
              v-html="uploadText"
            ></div>

            <img
              v-if="listType == 'picture-card'"
              src="../../../assets/img/bigEmpty.png"
              width="96"
              height="96"
              class="picture-default"
            />
            <span
              v-if="
                this.mode != 'import' &&
                (isOversize ||
                  (listType !== 'picture-card' &&
                    listType !== 'picture' &&
                    mode != 'import' &&
                    mode != 'group'))
              "
              :class="isOversize ? 'content__error' : 'content__help secondary'"
            >
              Размер не более
              {{ this.size / 1024 / 1024 }} Мб
            </span>
            <span v-if="mode == 'import'" :class="'content__import-text'">
              {{ importSubText }}
            </span>
            <Button
              v-if="listType == 'picture-card'"
              class="content__button"
              buttonText="Загрузить фото"
              buttonSize="big"
            />
            <Button
              v-else-if="listType == 'picture'"
              buttonSize="big"
              buttonColor="blue"
              buttonText=""
              hasLeftIcon
              :disabled="disabled || file.length == limit"
              iconName="picture"
              class="picture-button"
            />
            <Button
              v-else
              class="content__button"
              hasLeftIcon
              iconName="Search"
              buttonText="Обзор"
            />
          </div>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual';
import { errorMsg } from '@/utils/mixins';
import Button from 'Elements/Button/Button';
import { Upload } from 'element-ui';

export default {
  mixins: [errorMsg],
  components: {
    'el-upload': Upload,
    Button
  },
  props: {
    mode: {
      type: String,
      default: ''
    },
    file: {
      type: [Object, Array],
      default: () => (this.file.hasOwnProperty('length') ? [] : {})
    },
    accept: {
      type: String,
      default: ''
    },
    listType: {
      type: String,
      default: 'text'
    },
    uploadText: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: Infinity
    },
    size: {
      // byte value:
      type: Number,
      default: 20 * 1024 ** 2 // 2e7 or 20Mb
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    drag: {
      type: Boolean,
      default: true
    },
    summarySize: {
      type: Number,
      default: Infinity
    },
    trackFormat: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      uploaded: false,
      isOversize: false,
      wrongFormat: false,
      newMultiImport: true,
      fileCount: 0,
      totalFilesCount: 0
    };
  },
  methods: {
    drop(event) {
      event.preventDefault();
      this.totalFilesCount = event.dataTransfer.files.length;
      event.currentTarget.classList.remove('is-dragover');
    },
    dragover(event) {
      event.preventDefault();
      if (!event.currentTarget.classList.contains('is-dragover')) {
        event.currentTarget.classList.add('is-dragover');
      }
    },
    dragleave(event) {
      event.currentTarget.classList.remove('is-dragover');
    },
    currentSummarySize(files) {
      return files.reduce((acc, el) => acc + el.size || 0, 0);
    },
    validateBySummarySize(files) {
      const currentSummarySize = this.currentSummarySize(files);
      const oversize = currentSummarySize <= this.size ? false : true;

      this.isOversize = oversize;
      this.$emit('oversize', oversize);
    },
    invalidFormatType(formats, files) {
      return files.some(file => {
        const fileType = file.name.split('.').slice(-1).join('');
        return !formats.includes(fileType);
      });
    },
    changeFile() {
      let uploadFiles = this.$refs['upload' + this.id].uploadFiles;
      const newFile = uploadFiles[uploadFiles.length - 1];
      const onlyImageFormats = ['jpg', 'jpeg', 'png'];
      const imageAllFormats = ['jpg', 'jpeg', 'png', 'heic', 'gif', 'svg'];

      if (
        this.accept == 'image/png, image/jpeg, image/jpg' &&
        this.invalidFormatType(onlyImageFormats, uploadFiles)
      ) {
        this.$refs['upload' + this.id].uploadFiles = [];
        this.showErrorMessage(
          'Неверный формат файла. Могут быть загружены только файлы форматов png, jpg, jpeg'
        );
        return;
      }
      if (
        this.accept == 'image/*' &&
        this.invalidFormatType(imageAllFormats, uploadFiles)
      ) {
        this.$refs['upload' + this.id].uploadFiles = [];
        this.showErrorMessage(
          'Неверный формат файла. Могут быть загружены только изображения'
        );
        return;
      }

      if (this.mode == 'import') {
        const fileElems = newFile.name.split('.');
        const format = fileElems[fileElems.length - 1];
        if (!this.multiple) {
          if (this.wrongFormat) this.wrongFormat = false;
          if (newFile.size > this.size) this.isOversize = true;
          if (this.trackFormat && this.trackFormat != format) {
            this.wrongFormat = true;
          } else {
            this.$emit('upload-file', newFile);
          }
        } else {
          if (this.newMultiImport) {
            this.newMultiImport = false;
            this.wrongFormat = false;
            this.isOversize = false;
            this.fileCount = 0;
            this.$emit('new-import');
          }
          this.fileCount++;
          if (
            this.trackFormat &&
            !this.trackFormat.split(',').includes(format)
          ) {
            this.wrongFormat = true;
          }
          if (newFile.size > this.size) this.isOversize = true;
          if (!this.wrongFormat && !this.isOversize)
            document.getElementsByClassName('el-upload__input')[0].files.length
              ? this.$emit('upload-file', newFile)
              : this.$emit('upload-file', newFile, this.totalFilesCount);
          if (
            this.fileCount ==
              document.getElementsByClassName('el-upload__input')[0].files
                .length ||
            this.fileCount == this.totalFilesCount
          ) {
            this.newMultiImport = true;
            console.log('Все файлы проверены!');
          }
        }
      } else {
        const validSize = newFile.size < this.size;

        if (this.summarySize < Infinity) {
          this.validateBySummarySize(uploadFiles);

          uploadFiles = uploadFiles.filter((el, i, arr) => {
            const slicedFiles = arr.slice(0, i + 1);
            const currentSummarySize = this.currentSummarySize(slicedFiles);

            if (currentSummarySize <= this.size) {
              this.file.push(el);
              return el;
            }
          });

          this.$refs['upload' + this.id].uploadFiles = uploadFiles;
          this.$emit('upload-file', uploadFiles);
          return;
        }

        if (validSize) {
          this.isOversize = false;
          this.file.push(newFile);
          this.uploaded = true;

          // if (this.name === 'filename_file' || this.name === 'resume_file') {
          this.$emit('upload-file', newFile);
          this.$emit('oversize', false);
          // }
        } else {
          this.isOversize = true;
          this.$refs['upload' + this.id].uploadFiles.pop();
          this.$emit('oversize', true);
        }
      }
    },
    removeFile() {
      this.uploaded = false;
      this.isOversize = false;
      this.file.pop();
    }
  },
  computed: {
    errorText() {
      if (this.multiple) {
        if (this.wrongFormat) return 'Один из файлов имеет неверный формат';
        if (this.isOversize)
          return 'Один из файлов превышает допустимый размер';
        else return '';
      } else {
        if (this.wrongFormat) return 'Неверный формат файла';
        if (this.isOversize) return 'Файл превышает допустимый размер';
        else return '';
      }
    },
    importSubText() {
      if (this.trackFormat && this.multiple) {
        let formats = this.trackFormat
          .split(',')
          .map(el => el.toUpperCase())
          .join(', ');
        return `файлы не более чем в ${
          this.size / 1024 / 1024
        } МБайт в ${formats} формате`;
      } else return `шаблоны в ${this.trackFormat.toUpperCase()} формате`;
    }
  },
  watch: {
    'file.length': function () {
      // отслеживаем удаление или добавление
      if (!isEqual(this.file, this.$refs['upload' + this.id].uploadFiles)) {
        this.$refs['upload' + this.id].uploadFiles = this.file;

        if (this.summarySize < Infinity) {
          this.validateBySummarySize(this.file);
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.upload-counter {
  position: absolute;
  height: inherit;
  z-index: 1;
  width: inherit;
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-dragover {
    background-color: rgba($color: #209fff, $alpha: 0.06);
  }
}

.el-upload {
  & ::v-deep &-dragger {
    border: 2px dashed $blue-20;
  }
}

.upload-area {
  &.file-error ::v-deep .el-upload {
    display: flex;
    flex-direction: column;

    & > .el-upload-dragger {
      background: $red-10;
      border: 2px dashed $red;
      border-radius: 4px; //12
      display: flex;
      height: auto;
      flex-direction: column;
      justify-content: center;
      width: 100%;
    }
  }

  & ::v-deep .el-upload {
    display: flex;
    flex-direction: column;

    & > .el-upload-dragger {
      border: 2px dashed $blue-50;
      border-radius: 4px; //12
      display: flex;
      height: auto;
      min-height: 128px;
      flex-direction: column;
      justify-content: center;
      width: 100%;
    }
  }

  & ::v-deep .el-upload--picture {
    & > .el-upload-dragger {
      border: none;
      border-radius: 4px; //12
      display: flex;
      height: auto;
      width: 56px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 20px 0;
    align-content: center;
  }
}

.content {
  &__title {
    align-self: center;
    -ms-grid-row-align: center;
    font-size: 15px;
    // color: $blue-120;
    margin: 0;
    line-height: 24px;
  }

  .picture-default {
    align-self: center;
  }

  &__button {
    margin-top: 12px;
    align-self: center;
    -ms-grid-row-align: center;
  }

  &__error {
    font-size: 14px;
    color: $red-700;
    line-height: 24px;
  }

  &__help {
    font-size: 14px;
    // color: $black-50;
    line-height: 24px;
  }

  &__import {
    &-text {
      color: $black-100;
    }
  }
}

.picture-button {
  &:disabled:hover {
    & ::v-deep * {
      cursor: not-allowed;
    }
  }
}
</style>
