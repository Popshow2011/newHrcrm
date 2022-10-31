<template>
  <div>
    <form
      v-if="fileLoadStates.readyToLoad"
      class="core__upload"
      id="upload-doc"
    >
      <Upload
        ref="upload"
        v-loading="false"
        mode="import"
        name="userfile"
        :file="filenameFile"
        :multiple="true"
        :show-file-list="true"
        uploadText="Перетащите сюда файлы для загрузки"
        :trackFormat="'pdf,doc,docx,rtf'"
        @upload-file="uploadDocument"
        @new-import="clearFiles"
      />
    </form>
    <div
      v-if="fileLoadStates.fileImporting || fileLoadStates.fileImported"
      class="load"
    >
      <div class="load__status">
        <p class="load__text load__text--loading">{{ loadStatusText }}</p>
        <p class="load__text">
          {{ `${loadProgress} / ${totalProgress}` }}
        </p>
      </div>
      <ProgressBar
        :percentage="percentageProgress"
        :stroke-width="12"
        :show-text="false"
        color="#3DB449"
        class="load__progressbar"
      ></ProgressBar>

      <Button
        class="buttons__button-cancel"
        buttonSize="big"
        buttonColor="blue"
        buttonText="Добавить ещё"
        hasLeftIcon
        iconName="Plus-bold"
        @click="addResumeFiles"
      />
    </div>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixins';
import { getController, postController } from '@/controllers/request';
import { MODULE } from '@/utils/constants';
import Upload from 'Elements/Upload/Upload';
import Button from 'Elements/Button/Button';
import ProgressBar from 'Elements/Progressbar/Progressbar';

export default {
  components: {
    ProgressBar,
    Upload,
    Button
  },
  mixins: [mixin],
  data() {
    return {
      filenameFile: [],
      fileLoadStates: {
        readyToLoad: true,
        fileLoaded: false,
        fileImporting: false,
        fileImported: false
      },
      loadProgress: 0,
      totalProgress: 0,
      percentageProgress: 0,
      filesToImport: [],
      totalUploadedFiles: 0,
    };
  },
  watch: {
    allFilesReadyToImport(val) {
      if (val) {
        this.sendPackages();
        this.clearFiles();
      }
    }
  },
  computed: {
    loadStatusText() {
      return this.percentageProgress < 100
        ? 'Загрузка файлов резюме...'
        : 'Загрузка завершена';
    },
    allFilesReadyToImport() {
      return this.totalUploadedFiles && this.totalUploadedFiles == this.filesToImport.length;
    }
  },
  methods: {
    addResumeFiles() {
      this.fileLoadStates.fileImporting = false;
      this.fileLoadStates.readyToLoad = true;
      this.loadProgress = 0;
      this.totalProgress = 0;
      this.percentageProgress = 0;
    },
    async sendPackages() {
      //разделение файлов по пакетам, каждый не более 20Мб
      const packages = this.sortFilesToPackages(this.filesToImport);
      let sizes = [];
      packages.forEach(pack => {
        let packageSize = pack.reduce(function (p, c) {
          return Number(p) + Number(c.size);
        }, '');
        sizes.push(packageSize / 1024 / 1024);
      });
      //отправка пакетов на сервер
      for (let i = 0; i < packages.length; i++) {
        const formData = new FormData();
        formData.append('module', MODULE.HRPAC_CUSTOM_IMPORT);
        formData.append('action', 'upload_documents');
        formData.append('import_module', MODULE.CANDIDATES_MODULE);
        formData.append('to_pdf', '1');
        formData.append('totalCountFiles', this.totalUploadedFiles); // 25 (обязательный, общее количество файлов)
        packages[i].forEach(pack => {
          formData.append('documents[]', pack);
        });

        const params = {
          header: {
            'Content-Type': 'multipart/form-data'
          }
        };
        try {
          const resp = await postController({ options: formData, params });
          if (resp && resp.data.success) {
            // this.multiFileUploading = true;
            this.fileLoadStates.readyToLoad = false;
            this.fileLoadStates.fileImporting = true;
            this.startCheckingUploadMultiFilesStatus();
          }
        } catch (err) {
          this.catchError(
            err,
            'Возникла ошибка при загрузке файлов резюме',
            'upload file'
          );
        }
      }
    },
    async finishUploadDocuments() {
      const params = {
        action: 'finish_upload_documents',
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        to_pdf: true
      };
      try {
        const data = await getController({ params });
        return data;
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при окончании загрузки документов',
          'upload file'
        );
      }
    },
    async checkUploadMultiFilesStatus() {
      const params = {
        action: 'status_files',
        type: 'import_documents',
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        to_pdf: true
      };
      try {
        const data = await getController({ params });
        return data;
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при загрузке файлов резюме',
          'upload file'
        );
      }
    },
    async startCheckingUploadMultiFilesStatus() {
      if (this.fileLoadStates.readyToLoad) this.fileLoadStates.readyToLoad = false;
      if (!this.fileLoadStates.fileImporting) this.fileLoadStates.fileImporting = true;
      let finished = false;
      do {
        try {
          let data = await this.checkUploadMultiFilesStatus();
          if (data && data.data) {
            this.totalProgress = data.data.total || 0;
            this.loadProgress = data.data.progress || 0;
            this.percentageProgress = (this.loadProgress / this.totalProgress) * 100;
            if (this.percentageProgress == 100) {
              finished = true;
              this.finishUploadDocuments();
            }
            await this.sleep(1000);
          } else {
            finished = true;
            this.finishUploadDocuments();
          }
        } catch (err) {
          {
            finished = true;
            this.finishUploadDocuments();
          }
        }
      } while (!finished);
    },
    clearFiles() {
      this.filesToImport = [];
    },
    sortFilesToPackages(files) {
      let packages = [];
      let pack = [];
      for (let i = 0; i < files.length; i++) {
        //если текущий пакет пустой, то добавляем туда файл
        const { raw: blob } = files[i];
        if (pack.length == 0) pack.push(blob);
        //если он не пустой, вычисляем его размер + файл. Если
        //суммарный размер > 20Мб, то пакет заполнен, отправляем его в общий
        //массив пакетов, а файл - в новый пакет
        else {
          let currentPackageSize = pack.reduce(function (p, c) {
            return Number(p) + Number(c.size);
          }, '');
          if (
            Number(currentPackageSize) + Number(files[i].size) <
            20 * 1024 ** 2
          )
            pack.push(blob);
          else {
            packages.push(pack);
            pack = [];
            pack.push(blob);
          }
        }
        if (pack.length != 0 && i == files.length - 1) packages.push(pack);
      }
      return packages;
    },
    async uploadDocument(file) {
      if (this.newMultiUpload) this.newMultiUpload = false;
      let totalFiles = document.getElementsByClassName('el-upload__input')[0].files.length;
      if (
        this.totalUploadedFiles == 0 ||
        this.totalUploadedFiles != totalFiles
      )
        this.totalUploadedFiles = totalFiles;
      this.filesToImport.push(file);
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
  }
};
</script>

<style lang="scss" scoped>
.core,
.load {
  justify-content: flex-end;
  flex-direction: column;

  &__text {
    font-size: 14px;
    line-height: 24px;
    color: $black-100;

    &--loading {
      line-height: 20px;
      color: $black-200;
    }
  }

  &__status {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
  }
}

.load {
  margin-top: 20px;
  width: 508px;
  min-height: 132px;
  background: $black-10;
  border-radius: 4px;
  padding: 16px;

  &__progressbar {
    margin-top: 12px;
    margin-bottom: 16px;

    &::v-deep .el-progress-bar {
      max-width: none;
    }
  }
}

.core {
  &__upload {
    margin-top: 20px;
  }
}

#upload-doc {
  margin-top: 12px;
}

</style>
