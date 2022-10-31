<template>
  <el-dialog
    :title="title"
    :visible="is_visible"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    class="dialog-import"
  >
    <div class="core">
      <p class="core__text core__text--info">
        {{ subtitleText }}
      </p>
      <p
        class="core__text core__text--info core__text--sub"
        v-if="mode == 'single'"
      >
        Если потребуется, вы можете отменить результат.
      </p>
      <div class="template" v-if="mode == 'single'">
        <p class="template__text template__text--black">Вы можете</p>
        <a
          class="template__link"
          :href="'/include/file_template/import_candidate_template.xlsx'"
          ><p class="template__text">скачать шаблон</p></a
        >
      </div>

      <div class="source" v-if="mode == 'multi'">
        <label for="textAr">Источник для резюме</label>
        <Select
          id="textAr"
          :field="{
            type: 'enum',
            disabled: multiFileUploading || multiFileParsing
          }"
          :options="options.hrpac_sources"
          :model="attractionSource"
          @set-value="handleSelect"
        />
      </div>

      <form
        class="core__upload"
        id="upload-doc"
        v-if="fileLoadStates.readyToLoad"
      >
        <Upload
          ref="upload"
          v-loading="addFileLoading"
          mode="import"
          name="userfile"
          :file="filenameFile"
          :multiple="multiFile"
          :show-file-list="false"
          :uploadText="uploadText"
          :trackFormat="fileFormats"
          @upload-file="uploadDocument"
          @new-import="clearFiles"
        />
      </form>
      <div
        v-if="fileLoadStates.fileImporting || fileLoadStates.fileImported"
        class="load"
      >
        <p v-if="fileName" class="load__text">{{ fileName }}</p>
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
      </div>
      <div class="switcher" v-if="fileLoadStates.fileLoaded">
        <Switcher
          :model="importFirstRow"
          size="small"
          @switch="val => updateShowFirstRow(val)"
        />
        <p class="switcher__text">Импортировать первую строчку</p>
      </div>
      <div class="core__table" v-if="fileLoadStates.fileLoaded">
        <table class="table">
          <tr :class="['table__header', { hide: importFirstRow }]">
            <th
              class="table__header-text"
              v-for="(column, index) in dataColumns"
              :key="index"
            >
              {{ column }}
            </th>
          </tr>
          <tr
            class="table__row"
            v-for="(row, rowIndex) in dataRows"
            :key="rowIndex"
          >
            <td
              class="table__cell"
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
            >
              {{ cell }}
            </td>
          </tr>
        </table>
      </div>
      <div v-if="fileLoadStates.fileLoaded">
        <Checkbox
          text="Добавить файлы резюме"
          :value="addResumeFiles"
          @change="handleCheckbox"
        />
      </div>
    </div>
    <div v-if="addResumeFiles && fileLoadStates.fileLoaded">
      <!-- Здесь будет условие показа формы в зависимости от загрузки как выше -->
      <CandidateImportDialogProgressbar />
    </div>
    <div class="footer">
      <div class="buttons">
        <Button
          v-if="fileLoadStates.fileLoaded || fileLoadStates.fileImported"
          buttonSize="big"
          buttonColor="darkBlue"
          :buttonText="confirmButtonText"
          @click="confirmButtonAction"
        />
        <Button
          v-if="
            (fileLoadStates.fileImported ||
              !fileLoadStates.fileImporting ||
              (mode == 'single' &&
                (fileLoadStates.fileImported ||
                  !fileLoadStates.fileImporting))) &&
            loadStatus != 'cancelling'
          "
          class="buttons__button-cancel"
          footer
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          :disabled="fileLoadStates.fileImporting"
          @click="closeDialog"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { mixin } from '@/utils/mixins';
import { store } from '@/store';
import { getController, postController } from '@/controllers/request';
import { MODULE, ACTION } from '@/utils/constants';
import Upload from 'Elements/Upload/Upload';
import Button from 'Elements/Button/Button';
import ProgressBar from 'Elements/Progressbar/Progressbar';
import Switcher from 'Elements/Switch/Switch';
import Select from 'Elements/Select/Dropdown';
import Checkbox from 'Elements/Checkbox/CustomCheckbox';
import CandidateImportDialogProgressbar from './Details/CandidateImportDialogProgressbar';

export default {
  components: {
    'el-dialog': Dialog,
    Upload,
    Button,
    ProgressBar,
    Switcher,
    Select,
    Checkbox,
    CandidateImportDialogProgressbar
  },
  mixins: [mixin],
  props: {
    options: {
      type: Object
    },
    title: String,
    is_visible: Boolean,
    mode: {
      type: String,
      default: 'single'
    }
  },
  data() {
    return {
      addResumeFiles: false,
      attractionSource: '',
      filenameFile: [],
      fileName: '',
      loadStatus: '',
      showOnlyFirstRow: false,
      addFileLoading: false,
      dataColumns: [],
      dataRows: [],
      fileLoadStates: {
        readyToLoad: true,
        fileLoaded: false,
        fileImporting: false,
        fileImported: false
      },
      importFirstRow: false,
      loadProgress: 0,
      totalProgress: 0,
      percentageProgress: 0,
      filesToImport: [],
      totalUploadedFiles: 0,
      multiFileUploading: false,
      multiFileParsing: false,
      startDateTime: '',
      origRows: {}
    };
  },
  async created() {
    if (this.mode == 'single') this.checkImportStatusOnCreated();
    else {
      this.attractionSource = this.options.hrpac_sources.find(
        source => source.name == 'Архив'
      )?.id;
      const parsingChecking = await this.checkParsingMultiFilesStatus();
      if (parsingChecking.data) {
        this.loadStatus = parsingChecking.data.status;
        this.multiFileParsing = true;
        this.totalProgress = parsingChecking.data.total || 0;
        this.loadProgress = parsingChecking.data.progress || 0;
        this.percentageProgress =
          (this.loadProgress / this.totalProgress) * 100;
        this.startCheckingParsingMultiFilesStatus();
      } else {
        const uploadChecking = await this.checkUploadMultiFilesStatus();
        if (uploadChecking.data) {
          this.loadStatus = uploadChecking.data.status;
          this.multiFileUploading = true;
          this.totalProgress = uploadChecking.data.total || 0;
          this.loadProgress = uploadChecking.data.progress || 0;
          this.percentageProgress =
            (this.loadProgress / this.totalProgress) * 100;
          this.startCheckingUploadMultiFilesStatus();
        }
      }
    }
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
    confirmButtonText() {
      return this.fileLoadStates.fileLoaded ? 'Далее' : 'Завершить';
    },
    loadStatusText() {
      if (this.mode != 'multi') {
        switch (this.loadStatus) {
          case 'importing':
            return 'Импорт файла...';
          case 'done':
            return 'Завершено.';
          case 'cancelling':
            return 'Отмена импорта...';
          default:
            return 'Загрузка...';
        }
      } else {
        if (this.multiFileUploading) {
          return this.percentageProgress < 100
            ? 'Загрузка файлов резюме...'
            : 'Загрузка завершена';
        } else if (this.multiFileParsing) {
          return this.percentageProgress < 100
            ? 'Распознавание файлов резюме...'
            : 'Распознавание завершено';
        } else return '';
      }
    },
    subtitleText() {
      return this.mode == 'single'
        ? 'Кандидаты будут загружены, даже если часть ячеек пуста.'
        : 'Резюме кандидатов будут распознаны и автоматически добавлены в систему.';
    },
    uploadText() {
      return this.mode == 'single'
        ? 'Перетащите сюда файл для загрузки'
        : 'Перетащите сюда файлы для загрузки';
    },
    fileFormats() {
      return this.mode == 'single' ? 'xlsx' : 'pdf,doc,docx,rtf';
    },
    multiFile() {
      return this.mode == 'single' ? false : true;
    },
    dialogToClose() {
      return this.mode == 'single'
        ? 'candidate_import_dialog_single'
        : 'candidate_import_dialog_multi';
    },
    allFilesReadyToImport() {
      return (
        this.totalUploadedFiles &&
        this.totalUploadedFiles == this.filesToImport.length
      );
    }
  },
  methods: {
    handleSelect(name, val) {
      this.attractionSource = val;
    },
    handleCheckbox(value) {
      this.addResumeFiles = value;
    },
    getFormattedDate() {
      const currDateTime = new Date();
      const year = currDateTime.getFullYear();
      const month =
        currDateTime.getMonth() < 10
          ? `0${currDateTime.getMonth() + 1}`
          : currDateTime.getMonth();
      const day =
        currDateTime.getDate() < 10
          ? `0${currDateTime.getDate()}`
          : currDateTime.getDate();
      const hour =
        currDateTime.getHours() < 10
          ? `0${currDateTime.getHours()}`
          : currDateTime.getHours();
      const minutes =
        currDateTime.getMinutes() < 10
          ? `0${currDateTime.getMinutes()}`
          : currDateTime.getMinutes();
      const seconds =
        currDateTime.getSeconds() < 10
          ? `0${currDateTime.getSeconds()}`
          : currDateTime.getSeconds();
      return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
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
        let isLastPack = i == packages.length - 1 ? 1 : 0;
        formData.append('action', 'upload_files');
        formData.append(
          'hrpac_source',
          this.attractionSource ? this.attractionSource : ''
        );
        formData.append('module', MODULE.HRPAC_CUSTOM_IMPORT);
        formData.append('import_module', MODULE.CANDIDATES_MODULE);
        formData.append('lastPackage', isLastPack);
        formData.append('totalCountFiles', this.totalUploadedFiles);
        packages[i].forEach(pack => {
          formData.append('filesResume[]', pack);
        });
        formData.append('to_pdf', '1');

        const params = {
          header: {
            'Content-Type': 'multipart/form-data'
          }
        };
        try {
          const resp = await postController({ options: formData, params });
          if (resp && resp.data.success && (i == 0 || isLastPack)) {
            this.multiFileUploading = true;
            this.fileLoadStates.readyToLoad = false;
            this.fileLoadStates.fileImporting = true;
            this.startCheckingUploadMultiFilesStatus(isLastPack);
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
    async checkUploadMultiFilesStatus() {
      const params = {
        action: 'status_files',
        type: 'import_files',
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
    async checkParsingMultiFilesStatus() {
      const params = {
        action: 'status_files',
        type: 'import_resume',
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
          'Возникла ошибка при распознавании файлов резюме',
          'upload file'
        );
      }
    },
    async startCheckingUploadMultiFilesStatus(isLastPack) {
      if (this.fileLoadStates.readyToLoad)
        this.fileLoadStates.readyToLoad = false;
      if (!this.fileLoadStates.fileImporting)
        this.fileLoadStates.fileImporting = true;
      if (!this.multiFileUploading) this.multiFileUploading = true;
      if (this.multiFileParsing) this.multiFileParsing = false;
      let finished = false;
      let isError = false;

      var theInterval = setInterval(async () => {
        try {
          let data = await this.checkUploadMultiFilesStatus();
          if (data && data.data) {
            this.loadStatus = data.data.status;
            this.totalProgress = data.data.total || 0;
            this.loadProgress = data.data.progress || 0;
            this.percentageProgress =
              (this.loadProgress / this.totalProgress) * 100;
            if (this.percentageProgress == 100) finished = true;
          } else finished = true;
        } catch (err) {
          finished = true;
          isError = true;
        }
        if (finished) {
          clearInterval(theInterval); // this stops the loop
        }
      }, 1500);

      if (!isError && isLastPack) this.startCheckingParsingMultiFilesStatus();
    },
    async startCheckingParsingMultiFilesStatus() {
      if (this.fileLoadStates.readyToLoad)
        this.fileLoadStates.readyToLoad = false;
      if (!this.fileLoadStates.fileImporting)
        this.fileLoadStates.fileImporting = true;
      let finished = false;
      let isError = false;

      var theInterval = setInterval(async () => {
        try {
          let data = await this.checkParsingMultiFilesStatus();
          if (data && data.data) {
            if (this.multiFileUploading) this.multiFileUploading = false;
            if (!this.multiFileParsing) this.multiFileParsing = true;
            this.loadStatus = data.data.status;
            this.totalProgress = data.data.total || 0;
            this.loadProgress = data.data.progress || 0;
            this.percentageProgress =
              (this.loadProgress / this.totalProgress) * 100;
            if (this.percentageProgress == 100) finished = true;
          } else finished = true;
        } catch (err) {
          finished = true;
          isError = true;
        }

        if (finished) {
          if (!isError) {
            this.fileLoadStates.fileImporting = false;
            this.fileLoadStates.fileImported = true;
          }
          clearInterval(theInterval); // this stops the loop
        }
      }, 3000);
    },
    updateShowFirstRow(val) {
      this.importFirstRow = val;
      this.dataRows = this.convertTableDate(this.origRows, val);
    },
    closeDialog() {
      if (this.fileLoadStates.fileImported) {
        this.cancelImport();
      }
      store.commit('common/setVisibleDialog', {
        name: this.dialogToClose,
        val: false
      });
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
              20 * 1024 ** 2 &&
            pack.length < 20
          )
            pack.push(blob);
          else if (pack.length <= 20) {
            packages.push(pack);
            pack = [];
            pack.push(blob);
          }
        }
        if (pack.length != 0 && i == files.length - 1 && pack.length <= 20)
          packages.push(pack);
      }
      return packages;
    },
    async checkImportStatusOnCreated() {
      const params = {
        action: ACTION.STATUS,
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        to_pdf: true,
        jsqon_return: true
      };
      try {
        const data = await getController({ params });
        if (data.data.status !== null) {
          this.loadStatus = data.data.status;
          this.fileLoadStates.readyToLoad = false;
          this.fileLoadStates.fileImporting = true;
          this.startCheckingStatus();
        }
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при проверке наличия рабочего импорта',
          'upload file'
        );
      }
    },
    async uploadDocument(file, totalFilesCount) {
      if (this.mode == 'single') {
        const formData = new FormData();
        if (file && file.size < 20 * 1024 ** 2) {
          const { raw: blob } = file;

          formData.append('userfile', blob);
          formData.append('action', ACTION.UPLOAD);
          formData.append('module', MODULE.HRPAC_CUSTOM_IMPORT);
          formData.append('import_module', MODULE.CANDIDATES_MODULE);
          formData.append('file_type', 'xlsx');
          formData.append('to_pdf', '1');
          formData.append('jsqon_return', '1');

          const params = {
            header: {
              'Content-Type': 'multipart/form-data'
            }
          };

          try {
            const resp = await postController({ options: formData, params });
            if (resp.data && resp.data.preview) {
              this.origRows = resp.data.preview.filter(
                elem => !elem.every(el => el == '')
              );
              this.dataColumns = this.origRows[0];
              this.fileName = resp.data.filename;
              localStorage.setItem('import_files', [resp.data.filename]);

              this.dataRows = this.convertTableDate(
                this.origRows,
                this.importFirstRow
              );
              this.fileLoadStates.readyToLoad = false;
              this.fileLoadStates.fileLoaded = true;
            }
          } catch (err) {
            this.catchError(
              err,
              'Возникла ошибка при загрузке документа',
              'upload file'
            );
          }
        } else {
          this.fileLoadStates.fileImporting = false;
        }
      } else {
        if (this.newMultiUpload) this.newMultiUpload = false;
        let totalFiles = totalFilesCount
          ? totalFilesCount
          : document.getElementsByClassName('el-upload__input')[0].files.length;
        if (
          this.totalUploadedFiles == 0 ||
          this.totalUploadedFiles != totalFiles
        )
          this.totalUploadedFiles = totalFiles;
        this.filesToImport.push(file);
      }
    },
    confirmButtonAction() {
      this.fileLoadStates.fileLoaded ? this.startImport() : this.finishImport();
    },
    convertTableDate(rows, importFirstRow) {
      let columns = rows[0];
      let data = importFirstRow ? rows : rows.slice(1, rows.length);
      let convertedData = [];
      let dO = {};
      for (let i = 0; i < data.length; i++) {
        dO = {};
        for (let j = 0; j < columns.length; j++) {
          dO[`Table_${j}`] = data[i][j];
        }
        convertedData.push(dO);
      }
      return convertedData;
    },
    async startImport() {
      const params = {
        action: ACTION.RUN,
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        file_type: 'xlsx',
        to_pdf: true,
        jsqon_return: true
      };
      if (!this.importFirstRow) params['exclude'] = [0];
      try {
        const data = await getController({ params });
        if (data.data == 'ok') this.startCheckingStatus();
        else if (data.data.error) {
          this.catchError(data.data.error, data.data.error, 'upload file');
        }
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при запуске импорта',
          'upload file'
        );
      }
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async startCheckingStatus(cancel) {
      const params = {
        action: ACTION.STATUS,
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        to_pdf: true,
        jsqon_return: true
      };

      let finished = false;

      var theInterval = setInterval(async () => {
        try {
          if (!this.fileName)
            this.fileName = localStorage.getItem('import_files');
          const data = await getController({ params });
          if (this.fileLoadStates.fileLoaded)
            this.fileLoadStates.fileLoaded = false;
          if (!this.fileLoadStates.fileImporting)
            this.fileLoadStates.fileImporting = true;

          this.loadStatus = data.data.status ? data.data.status : 'cancelling';
          this.totalProgress = data.data.total || 0;
          this.loadProgress = data.data.progress || 0;
          this.percentageProgress =
            (this.loadProgress / this.totalProgress) * 100;
          if (this.loadStatus == 'cancelling' && !data.data.status) {
            store.commit('common/setVisibleDialog', {
              name: this.dialogToClose,
              val: false
            });
            finished = true;
          } else if (data.data.status == 'done') {
            this.percentageProgress = 100;
            finished = true;
            localStorage.removeItem('import_files');
            // if (cancel) {
            // location.reload();
            // }
            if (!cancel) {
              this.fileLoadStates.fileImporting = false;
              this.fileLoadStates.fileImported = true;
            }
          }
        } catch (err) {
          this.catchError(err, 'Возникла ошибка при импорте', 'upload file');
          finished = true;
        }
        if (finished) {
          clearInterval(theInterval); // this stops the loop
        }
      }, 1000);
    },
    async finishImport() {
      const params = {
        action:
          this.mode != 'multi' ? ACTION.FINISH_SINGLE : ACTION.FINISH_MULTI,
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        to_pdf: true,
        jsqon_return: true
      };
      try {
        const data = await getController({ params });
        if (data.data == 'ok' || data.data == 'success') {
          location.reload();
        } else if (data.data.error) {
          this.catchError(data.data.error, data.data.error, 'upload file');
        }
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при завершении импорта',
          'upload file'
        );
      }
    },
    async cancelImport() {
      const params = {
        action:
          this.mode == 'single' ? ACTION.CANCEL_SINGLE : ACTION.CANCEL_MULTI,
        module: MODULE.HRPAC_CUSTOM_IMPORT,
        import_module: MODULE.CANDIDATES_MODULE,
        to_pdf: true,
        jsqon_return: true,
        type: this.mode == 'single' ? '' : 'deleteCandidates'
      };
      try {
        const data = await getController({ params });
        if (data.data == 'ok' || data.data.success || data.data == 'success') {
          this.startCheckingStatus(true);
        } else if (data.data.error) {
          this.catchError(data.data.error, data.data.error, 'upload file');
        }
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при завершении импорта',
          'upload file'
        );
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.el-dialog__wrapper.dialog-import {
  & ::v-deep .el-dialog {
    width: 556px !important;
    background: $white !important;
    margin-top: 15vh !important;
    padding: 14px 24px 24px 24px !important;

    &__header {
      // padding: 14px 24px !important;

      .el-dialog__title {
        font-size: 18px !important;
        line-height: 28px !important;
        color: $black-200;
        font-family: 'Roboto Medium';
        font-weight: 500;
      }
    }

    .el-dialog__headerbtn {
      display: none;
    }
  }
}

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

    &--sub {
      margin-top: 0 !important;
    }
  }

  &__status {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
  }
}

.load {
  width: 508px;
  margin-top: 20px;
  min-height: 132px;
  background: $black-10;
  border-radius: 4px;
  padding: 16px;

  &__progressbar {
    margin-top: 12px;

    &::v-deep .el-progress-bar {
      max-width: none;
    }
  }
}

.core {
  &__upload {
    margin-top: 20px;
  }

  &__text {
    &--info {
      // max-width: 425px;
      color: $black-100;
      margin-top: 14px;
      word-break: keep-all;
    }
  }

  &__table {
    max-height: 220px;
    max-width: 508px;
    overflow: auto;
  }
}

.table {
  width: max-content;
  max-width: max-content;

  &__header {
    background: $black-10;
    height: 44px;
    border-bottom: 1px solid $black-40;

    &-text {
      font-size: 14px;
      font-weight: bold;
      color: $black-200;
      padding: 0 38px 0 12px;
    }
  }

  &__row {
    height: 40px;
    border-bottom: 1px solid $black-20;
  }

  &__cell {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $black-200;
    padding: 0 38px 0 12px;
  }
}

.template {
  display: flex;
  margin: 12px 0 0 0;

  &__link {
    font-size: 15px;
    margin-left: 4px;
    color: $blue-120;
  }
}

.core__text,
.template__text {
  font-size: 15px;
  line-height: 24px;

  &--black {
    color: $black-200;
  }
}

.footer {
  display: flex;
  margin-top: 24px;
}

.buttons {
  &__button {
    &--cancel {
      margin-left: 8px;
    }
  }
}

.el-switch {
  width: fit-content;
}

.switcher {
  display: flex;
  margin: 12px 0;

  &__text {
    font-size: 14px;
    line-height: 20px;
    margin: 0 0 0 12px;
    color: $black-200;
  }
}

.source {
  margin-top: 20px;
  width: 50%;

  label {
    color: $black-200;
  }
}

label {
  margin-top: 20px;
  margin-bottom: 0;
}

.hide {
  display: none;
}
</style>
