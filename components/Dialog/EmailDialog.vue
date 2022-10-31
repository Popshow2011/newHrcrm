<template>
  <el-dialog
    v-loading="formLoading"
    ref="dialog"
    :title="title || 'Новое письмо'"
    :visible="is_visible"
    :close-on-click-modal="false"
    :width="confirmDeleteMeeting ? (!emailMode ? '377px' : '706px') : '610px'"
    @close="resetCallback"
    class="dialog meta-dialog emailDialog dialog--p-24"
  >
    <div v-if="confirmDeleteMeeting" class="dialog__subcontent">
      <p class="dialog__text">
        Встреча будет удалена из календарей Outlook и в TalentForce
      </p>
      <custom-checkbox
        :value="emailMode"
        text="Отправить письмо кандидату"
        class="message__area-checkbox"
        @change="
          val => {
            emailMode = val;
            resizeDialog();
          }
        "
      />
    </div>
    <div
      v-show="confirmDeleteMeeting ? !!emailMode : true"
      class="dialog__content"
      :class="confirmDeleteMeeting ? 'grey-bg' : ''"
    >
      <MetadataForm
        ref="meta"
        :defaultParams="defaultParams"
        :files="[...uploadedFiles, ...removedTemplateFiles]"
        :no-buttons="!!confirmDeleteMeeting"
        label-position="left"
        @savedFormData="onSavedFormData"
        @reset-callback="resetCallback"
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
    </div>
    <div slot="footer" v-if="confirmDeleteMeeting">
      <div class="footer buttons-panel footer--auto-width pd-24">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Отмена"
          @click="resetCallback"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Удалить"
          @click="confirmRemoveMeeting"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { getController } from '@/controllers/request.js';
import { MODULE, ACTION } from '@/utils/constants';
import MetadataForm from './MetadataForm';
import { Dialog } from 'element-ui';
import Upload from 'Elements/Upload/Upload';
import Button from 'Elements/Button/Button';
import DocumentRow from 'Elements/Document/DocumentRow';
import CustomCheckbox from 'Elements/Checkbox/CustomCheckbox';

export default {
  mixins: [mixin],
  props: {
    is_visible: {
      type: Boolean
    },
    data: {
      type: Object,
      default: () => ({})
    },
    title: String,
    confirmDeleteMeeting: Boolean
  },
  data() {
    return {
      defaultParams: {
        module: MODULE.EMAILS,
        action: ACTION.SEND,
        email_id: '',
        candidate_id: this.data.id.value,
        parent_type: MODULE.CANDIDATES_MODULE,
        parent_id: this.data.id.value,
        jsqon_return: 1,
        to_pdf: true
      },
      formLoading: true,
      removedTemplateFiles: [], // пушить шаблонные файлы при удалении
      uploadedFiles: [],
      oversize: false,
      size: 20 * 1024 ** 2,
      emailMode: false
    };
  },
  created() {
    if (this.selectedEmail && this.selectedEmail.action == 'Forward') {
      getController({
        params: {
          module: MODULE.EMAILS,
          action: 'GetDraftAttachmentData',
          id: this.selectedEmail.msg.id,
          to_pdf: true
        }
      })
        .then(resp => {
          if (!resp.data || typeof resp.data !== 'object') return;

          this.uploadFile(
            resp.data.data.attachments.map(file => ({
              ...file,
              name: file.filename,
              type: 'forward'
            }))
          );
        })
        .catch(err => {
          this.catchError(
            err,
            'Возникла ошибка получения вложений письма',
            'get email attachments'
          );
        });
    }
  },
  mounted() {
    if (this.selectedEmail) {
      this.defaultParams = {
        ...this.defaultParams,
        prefill_params: this.selectedEmail.action,
        email_id: this.selectedEmail.msg.id
      };
    } else {
      this.$set(this.defaultParams, 'type', 'out');
    }
  },
  computed: {
    selectedEmail() {
      return store.state.subpanels.selectedMessage || null;
    }
  },
  methods: {
    confirmRemoveMeeting() {
      if (this.confirmDeleteMeeting && !!this.emailMode) {
        this.$refs.meta.saveForm();
      }

      this.$emit('confirm');
    },
    onSavedFormData() {
      this.$emit('save-callback');
      store.commit('subpanels/setSelectedMessage', null);
      this.$emit('reset-callback');
    },
    resetCallback() {
      if (!this.confirmDeleteMeeting) {
        const params = {
          title: 'Закрыть письмо?',
          text: 'При закрытии данные не сохранятся',
          buttons: [
            {
              id: 'cancel',
              name: 'Отменить',
              color: 'darkBlue',
              reset: false
            },
            {
              id: 'ok',
              name: 'Ок',
              color: 'blue',
              reset: true,
              callback: () => {
                store.commit('subpanels/setSelectedMessage', null);
                this.$emit('reset-callback');
              }
            }
          ]
        };
        this.$emit('confirm-close', params);
      } else this.$emit('reset-callback');
    },
    uploadFile(file) {
      if (file && Array.isArray(file)) {
        this.uploadedFiles = [...file];
      } else {
        this.uploadedFiles.push(file); //эта строка не понадобится
      }
    },
    deleteFile(file, index) {
      if (file.type == 'template' || file.type == 'forward') {
        this.removedTemplateFiles.push({ ...file, type: 'removed' });
      }

      this.uploadedFiles.splice(index, 1);
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
    }
  },
  components: {
    MetadataForm,
    'el-dialog': Dialog,
    Upload,
    Button,
    DocumentRow,
    CustomCheckbox
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
</style>
