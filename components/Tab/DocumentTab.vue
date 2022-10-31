<template>
  <div class="document-tab documents">
    <Dialog
      v-if="is_visible.document_dialog"
      :is_visible="is_visible.document_dialog"
      title="Удалить документ"
      text="Вы действительно хотите удалить этот документ?"
      button-ok-color="blue"
      button-cancel-color="darkBlue"
      @ok-callback="removeDocument(deletedDoc)"
      @cancel-callback="closeDialog('document_dialog', null, 'deletedDoc')"
    >
    </Dialog>
    <form v-if="id" id="upload-doc" enctype="multipart/form-data">
      <Upload
        v-loading="addFile_loading"
        name="filename_file"
        :file="filename_file"
        :multiple="true"
        :show-file-list="false"
        uploadText="Перетащите сюда любой документ"
        class="document-tab__upload"
        @upload-file="uploadDocument"
      ></Upload>
    </form>
    <DocumentList
      v-loading="removeFile_loading"
      :documents="documents"
      :user-id="userId"
      @deleteFile="showDocumentDialog"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getController, postController } from '@/controllers/request.js';
import { mixin } from '@/utils/mixins';
import Upload from 'Elements/Upload/Upload';
import DocumentList from 'Elements/Document/DocumentList';
import Dialog from 'Elements/Dialog/Dialog';
import { MODULE, ACTION } from '@/utils/constants';
import './document.scss';
dayjs.extend(customParseFormat);

export default {
  mixins: [mixin],
  props: {
    userId: {
      type: String
    },
    module: {
      type: String
    },
    id: {
      type: String
    },
    tableSql: {
      type: String
    }
  },
  data() {
    return {
      documents: [],
      deletedDoc: null,
      filename_file: [],
      removeFile_loading: false,
      addFile_loading: false,
      is_visible: {
        document_dialog: false
      }
    };
  },
  created() {
    this.updateDocumentsList();
  },
  methods: {
    updateDocumentsList() {
      getController({
        params: {
          module: this.module,
          action: ACTION.GET_SUBPANEL_JSON_DATA,
          record: this.id,
          subpanel: this.tableSql,
          to_pdf: true
        }
      })
        .then(resp => {
          const format = 'DD.MM.YYYY HH:mm';
          const sortedList = resp.data.List.sort(
            (a, b) =>
              this.rawDate(b.date_modified.value, format) -
              this.rawDate(a.date_modified.value, format)
          );
          this.documents = sortedList || [];
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка обновления списка загруженных документов',
            'documents loading'
          )
        )
        .finally(() => {
          this.removeFile_loading = false;
          this.addFile_loading = false;
          this.$emit('set-loading', false);
        });
    },
    showDocumentDialog(doc) {
      this.deletedDoc = doc;
      this.$set(this.is_visible, 'document_dialog', true);
    },
    removeDocument(doc) {
      const isAuthor = doc && this.userId === doc.created_by.value;
      this.removeFile_loading = true;
      this.$set(this.is_visible, 'document_dialog', false);

      if (isAuthor) {
        getController({
          params: {
            module: this.module,
            action: ACTION.DELETE_RELATIONSHIP,
            record: this.id,
            return_action: ACTION.DELETE_RELATIONSHIP,
            return_module: this.module,
            return_id: this.id,
            linked_field: this.tableSql,
            linked_id: doc.id.value,
            refresh_page: 1,
            inline: 1,
            ajaxSubpanel: true
          }
        })
          .then(() => {
            this.deletedDoc = null;
            this.updateDocumentsList();
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при удалении документа',
              'document remove'
            )
          );
      }
    },
    updateFormData(newId, formData) {
      formData.set('module', MODULE.DOCUMENTS);
      formData.set('record', newId);
      formData.set('action', ACTION.SAVE);
      formData.set('relate_to', this.tableSql);
      formData.set('relate_id', newId);
      formData.set('parent_type', this.module);
      formData.set('parent_id', newId);
      formData.set('revision', 1);
      formData.set('jsqon_return', 1);
      return formData;
    },
    uploadDocument(file) {
      const form = document.getElementById('upload-doc');
      let formData = new FormData(form);
      formData = this.updateFormData(this.id, formData);
      this.addFile_loading = true;

      if (file) {
        const { raw: blob, name } = file;
        formData.set('filename_file', blob, name);

        const params = {
          header: {
            'Content-Type': 'multipart/form-data'
          }
        };

        postController({ options: formData, params })
          .then(() => {
            this.filename_file = [];
            this.updateDocumentsList();
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при загрузке документа',
              'upload file'
            )
          );
      }
    }
  },
  components: { Upload, DocumentList, Dialog }
};
</script>

<style lang="scss" scoped>
.documents {
  display: flex;
  flex-direction: column;
  margin-top: 32px;
}
</style>
