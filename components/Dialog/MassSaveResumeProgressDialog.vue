<template>
  <el-dialog
    ref="dialog"
    :visible="is_visible"
    :show-close="false"
    width="400px"
    class="dialog"
  >
    <el-dialog
      width="343px"
      title="Остановить процесс?"
      :visible.sync="visibleConfirmation"
      append-to-body
      @close="
        () => {
          visibleConfirmation = false;
        }
      "
      class="dialog new-dialog"
    >
      <div class="dialog-body">
        <p class="dialog__text">Резюме кандидатов не будут сохранены</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="footer">
          <Button
            buttonSize="big"
            buttonColor="darkBlue"
            buttonText="Не останавливать"
            @click="visibleConfirmation = false"
            class="footer__button-ok"
          />
          <Button
            buttonSize="big"
            buttonColor="blue"
            buttonText="Остановить"
            @click="resetCallback"
            class="footer__button-cancel"
          />
        </div>
      </div>
    </el-dialog>
    <template slot="title">
      <span class="title">Сохранить резюме кандидатов</span>
      <button
        v-if="loadStatus == 'success' || loadStatus == 'error'"
        class="colapse-btn"
        @click.prevent="collapseDialog"
      >
        <Icon iconName="close" />
      </button>
      <Tooltip
        v-else
        popper-class="dark"
        placement="top-start"
        content="Свернуть окно"
      >
        <button class="colapse-btn" @click.prevent="collapseDialog">
          <Icon iconName="collapse" />
        </button>
      </Tooltip>
    </template>

    <div class="dialog-body">
      <div class="load">
        <p v-if="fileName" class="load__text--loading load__text--sub">
          {{ fileName }}
        </p>
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
          :color="progresbarColors"
          class="load__progressbar"
        ></ProgressBar>
      </div>
    </div>

    <div class="dialog-footer">
      <Button
        v-if="loadingError"
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Повторить запрос"
        @click.prevent="startDownloadResume"
      />
      <Button
        v-if="false"
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Скачать архив"
        @click.prevent="downloadArchive"
      />
      <Button
        v-if="loadStatus != 'success' && loadStatus != 'error'"
        buttonSize="big"
        buttonColor="blue"
        buttonText="Отмена"
        @click.prevent="visibleConfirmation = true"
        class="cancel-button"
      />
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { mixin, errorMsg } from '@/utils/mixins';
import { getController, postController } from '@/controllers/request.js';
import { store } from '@/store';
import Button from 'Elements/Button/Button';
import ProgressBar from 'Elements/Progressbar/Progressbar';
import Icon from 'Elements/Icon/Icon';
import Tooltip from 'Elements/Tooltip/Tooltip';

export default {
  mixins: [mixin, errorMsg],
  props: {
    is_visible: {
      type: Boolean
    }
  },
  data() {
    return {
      loading: false,
      fileName: '',
      loadStatus: '',
      loadProgress: 0,
      totalProgress: 0,
      percentageProgress: 0,
      loadingError: false,
      visibleConfirmation: false
    };
  },
  created() {
    this.checkImportStatusOnCreated();
  },
  mounted() {
    document.getElementById('front').appendChild(this.$refs.dialog.$el);
  },
  computed: {
    loadStatusText() {
      switch (this.loadStatus) {
        case 'running':
          return 'Сохраняем резюме ...';
        case 'failed':
          return 'Сервер недоступен';
        case 'success':
          return 'Резюме сохранены';
        case 'empty':
          return 'Процесс не запущен...';
        case 'cancelling':
          return 'Происходит процесс отмены...';
        case 'error':
          return 'Проблемы с соединением';
        default:
          return 'Загрузка...';
      }
    },
    progresbarColors() {
      switch (this.loadStatus) {
        case 'failed':
          return '#FFD338';
        case 'success':
          return '#3DB449';
        case 'error':
          return '#ee1c1c';
        default:
          return '#0075DB';
      }
    }
  },
  methods: {
    resetCallback() {
      getController({
        params: {
          action: 'massSaveResumeCancel',
          module: 'AOS_PDF_Templates',
          to_pdf: 1,
          jsqon_return: 1
        }
      })
        .then(() => {
          this.collapseDialog();
          this.visibleConfirmation = false;
        })
        .catch(err =>
          this.catchError(err, 'Возникла ошибка при отмене процесса генерации')
        );
    },
    collapseDialog() {
      document.getElementById('menu').appendChild(this.$refs.dialog.$el);
      this.closeDialog('mass_save_resume_progress_dialog');
      this.closeDialog('mass_save_resume_dialog');
    },
    downloadArchive() {
      const e = document.createElement('a');
      let url =
        '/index.php?module=AOS_PDF_Templates&action=massSaveResumeDownload';
      e.href = url;
      e.target = '_blank';
      e.download = url.substr(url.lastIndexOf('/') + 1);
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
      this.hideMassSaveProgress();
    },
    hideMassSaveProgress() {
      localStorage.removeItem('backgroundResumeLoading');
      store.commit('common/setBackgroundResumeLoading', false);
    },
    startDownloadResume() {
      const formData = new FormData();
      const params = {
        action: 'massSaveResumeRun',
        module: 'AOS_PDF_Templates',
        format: localStorage.getItem('format'),
        resume_template: localStorage.getItem('resume_template'),
        to_pdf: 1,
        jsqon_return: 1
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }
      for (let candidate of JSON.parse(localStorage.getItem('candidate'))) {
        formData.append('candidate_id[]', candidate);
      }

      postController({ options: formData })
        .then(() => {
          this.loadStatus = '';
          this.loadProgress = 0;
          this.totalProgress = 0;
          this.percentageProgress = 0;
          this.checkImportStatusOnCreated();
        })
        .catch(err => {
          this.catchError(
            err,
            'Возникла ошибка при скачивании списка резюме',
            'error while getting list of resume templates'
          );
        });
    },
    async checkImportStatusOnCreated() {
      this.fileName = '';
      this.loadingError = false;
      const params = {
        action: 'massSaveResumeStatus',
        module: 'AOS_PDF_Templates',
        to_pdf: 1,
        jsqon_return: 1
      };
      let finished = false;
      var theInterval = setInterval(async () => {
        try {
          const data = await getController({ params });
          if (data.data.status !== null) {
            this.loadStatus = data.data.status;
            this.totalProgress = data.data.total || 0;
            this.loadProgress = data.data.progress || 0;
            this.percentageProgress =
              (this.loadProgress / this.totalProgress) * 100;

            if (this.loadStatus == 'success') {
              localStorage.removeItem('format');
              localStorage.removeItem('resume_template');
              localStorage.removeItem('candidate');

              // this.downloadArchive();
            } else if (this.loadStatus == 'failed') {
              this.fileName = 'Что-то пошло не так..';
              this.loadingError = true;
            } else if (this.loadStatus == 'empty') {
              this.collapseDialog();
              this.hideMassSaveProgress();
            }
            if (this.loadStatus != 'running') {
              finished = true;
            }
            if (this.loadStatus != 'failed') {
              this.fileName = '';
              this.loadingError = false;
            }
          }
        } catch (err) {
          this.loadStatus = 'error';
          this.fileName = 'Обновите страницу и повторите снова';
        }
        if (finished) {
          clearInterval(theInterval);
        }
      }, 1500);
    }
  },
  components: {
    'el-dialog': Dialog,
    Button,
    ProgressBar,
    Icon,
    Tooltip
  }
};
</script>

<style lang="scss" scoped>
.el-dialog__wrapper.dialog {
  & ::v-deep .el-dialog {
    background: $white !important;
    margin-top: 15vh !important;
    padding: 0px !important;

    &__header {
      padding: 12px 24px !important;

      .el-dialog__title {
        font-size: 18px !important;
        line-height: 28px !important;
        color: $black-200;
        font-family: 'Roboto Medium';
        font-weight: 500;
      }
    }
  }
}

.title {
  font-size: 18px;
  font-family: Roboto, sans-serif;
  font-weight: 700;
}

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
      margin-bottom: auto;
    }
  }

  &__status {
    display: flex;
    justify-content: space-between;
    // margin-top: 32px;
  }
}

.load {
  display: flex;
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

.dialog-body {
  padding: 0px 24px;
}

.dialog-footer {
  padding: 24px;
}

.colapse-btn {
  background: none;
  border: none;
  padding: 0px;
}
</style>
