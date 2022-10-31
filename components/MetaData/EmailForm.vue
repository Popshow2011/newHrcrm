<template>
  <MetadataForm
    ref="metadata"
    v-loading="formLoading"
    isEmailForm
    :defaultParams="defaultParams"
    :files="[...uploadedFiles, ...removedTemplateFiles]"
    :no-buttons="true"
    label-position="left"
    @savedFormData="onSavedFormData"
    @setFormLoading="value => (formLoading = value)"
    @set-template-files="setTemplateFiles"
  >
    <template slot="bottom-content">
      <div class="email-files">
        <div class="email-files__control">
          <form id="upload-email-file">
            <Upload
              :file="uploadedFiles"
              id="email-upload"
              name="email-upload"
              :drag="false"
              :multiple="true"
              :showFileList="false"
              :summary-size="size"
              @upload-file="uploadFile"
              @oversize="val => (oversize = val)"
            >
              <Button
                buttonSize="small"
                buttonText="Вложить"
                hasLeftIcon
                iconName="attach"
              />
              <span
                class="email-files__help"
                :class="oversize ? 'red' : 'secondary'"
              >
                Размер вложений не более {{ size / 1024 / 1024 }} Мб
              </span>
            </Upload>
          </form>
        </div>
        <div v-if="uploadedFiles.length" class="email-files__list">
          <DocumentRow
            v-for="(file, i) in uploadedFiles"
            :key="file.uid || file.id"
            :document="file"
            :index="i"
            :details-text="fileSize(file)"
            :document-name="file.name"
            :allow-remove="true"
            :visible-delete-icon="true"
            @delete-file="deleteFile"
          />
        </div>
      </div>
    </template>
  </MetadataForm>
</template>

<script>
import { errorMsg } from '@/utils/mixins';
import { MODULE, ACTION } from '@/utils/constants';
import MetadataForm from 'Elements/Dialog/MetadataForm';
import Upload from 'Elements/Upload/Upload';
import Button from 'Elements/Button/Button';
import DocumentRow from 'Elements/Document/DocumentRow';

export default {
  mixins: [errorMsg],
  props: {
    params: Object
  },
  data() {
    return {
      defaultParams: {
        module: MODULE.EMAILS,
        action: ACTION.SEND,
        email_id: '',
        parent_id: this.params?.parent_id,
        parent_type: MODULE.HRPAC_EVENT,
        jsqon_return: 1,
        to_pdf: true,
        type: 'out'
      },
      removedTemplateFiles: [], // пушить шаблонные файлы при удалении
      uploadedFiles: [],
      formLoading: false,
      size: 20 * 1024 ** 2
    };
  },
  components: {
    MetadataForm,
    Upload,
    Button,
    DocumentRow
  },
  methods: {
    uploadFile(file) {
      if (file && Array.isArray(file)) {
        this.uploadedFiles = [...file];
      } else {
        this.uploadedFiles.push(file); //эта строка не понадобится
      }
    },
    setTemplateFiles(files = []) {
      this.removedTemplateFiles = this.removedTemplateFiles
        .slice()
        .filter(file => file.type == 'forward');
      this.uploadedFiles = [
        ...this.uploadedFiles.filter(
          file => !file.type || file.type == 'forward'
        ),
        ...files.map(f => ({ ...f, type: 'template', size: f.filesize || 0 }))
      ];
    },
    fileSize(file) {
      return (
        (file.filesize ||
          (file.size ? Number(file.size / 1024 / 1024).toFixed(2) : 0)) + ' Мб'
      );
    },
    onSavedFormData() {
      this.showFullNotification({
        title: 'Встреча запланирована',
        message: 'Ответы от участников будут направлены на вашу почту',
        type: 'success'
      });
      this.$emit('reset-callback');
      location.reload();
    },
    deleteFile(file, index) {
      if (file.type == 'template' || file.type == 'forward') {
        this.removedTemplateFiles.push({ ...file, type: 'removed' });
      }

      this.uploadedFiles.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
#front .dialog {
  & ::v-deep .el-dialog__title {
    margin-bottom: 8px;
  }

  & ::v-deep .el-dialog__footer {
    margin: 0;
  }

  &__text {
    margin-top: 0;
    margin-bottom: 16px;
  }

  &__subcontent {
    padding: 0 24px;

    & + .dialog__content {
      margin-top: 24px;
      margin-bottom: 0;

      .el-form {
        padding: 24px !important;
      }
    }
  }

  &--p-24 {
    & ::v-deep .el-dialog__title {
      margin: 0;
    }

    & ::v-deep .el-dialog__header {
      padding: 24px;
    }

    & ::v-deep .form-panel {
      margin-bottom: 12px;
    }

    .buttons-panel {
      margin-top: 0;
    }
  }
}

.email-files {
  &__control {
    margin-bottom: 12px;

    & ::v-deep .el-upload {
      flex-direction: row;

      & > button {
        width: auto;
        margin-right: 8px;
      }
    }
  }

  &__help {
    font-size: 15px;
    line-height: 24px;
  }
}

.v-application .red {
  background-color: transparent !important;
  border-color: transparent !important;
}
</style>
