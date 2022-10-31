<template>
  <div class="progress-parent" v-show="backgroundResumeLoading">
    <Icon v-if="loadStatus == 'success'" iconName="agreed-filled" />
    <Icon v-if="loadStatus == 'error'" iconName="rejected-filled" />
    <Icon v-if="loadStatus == 'failed'" iconName="warning-filled" />
    <div v-if="loadStatus == 'running'" class="loader">
      <Loader v-if="loading" />
    </div>

    <button class="colapse-btn" @click="expandProgressDialog">
      <Icon iconName="expand" />
    </button>

    <MassSaveResumeProgressDialog
      v-if="is_visible.mass_save_resume_progress_dialog"
      :is_visible="is_visible.mass_save_resume_progress_dialog"
    />
  </div>
</template>

<script>
import { store } from '@/store';
import { getController } from '@/controllers/request.js';
import Icon from 'Elements/Icon/Icon';
import Loader from 'Elements/Loader/Loader';
import MassSaveResumeProgressDialog from 'Elements/Dialog/MassSaveResumeProgressDialog';

export default {
  data() {
    return {
      loadStatus: '',
      counter: 0,
      loading: true
    };
  },
  created() {
    document.addEventListener(
      'onOpenProgressDialog',
      this.onOpenProgressDialog
    );
    store.commit(
      'common/setBackgroundResumeLoading',
      Boolean(localStorage.getItem('backgroundResumeLoading'))
    );
    if (localStorage.getItem('backgroundResumeLoading')) {
      this.startCheckingStatus();
    }
  },
  beforeDestroy() {
    document.removeEventListener(
      'onOpenProgressDialog',
      this.onOpenProgressDialog
    );
  },
  methods: {
    onOpenProgressDialog() {
      this.startCheckingStatus();
      store.commit('common/setVisibleDialog', {
        name: 'mass_save_resume_progress_dialog',
        val: true
      });
      store.commit('common/setBackgroundResumeLoading', true);
      localStorage.setItem('backgroundResumeLoading', true);
    },
    expandProgressDialog() {
      store.commit('common/setVisibleDialog', {
        name: 'mass_save_resume_progress_dialog',
        val: true
      });
    },
    async startCheckingStatus() {
      const params = {
        action: 'massSaveResumeStatus',
        module: 'AOS_PDF_Templates',
        to_pdf: 1,
        jsqon_return: 1
      };

      let finished = false;

      let theInterval = setInterval(async () => {
        try {
          const data = await getController({ params });

          this.loadStatus = data.data.status ? data.data.status : 'empty';

          if (this.loadStatus != 'running') {
            finished = true;
          }

          if (this.loadStatus == 'success') {
            this.downloadArchive();
          }

          if (this.loadStatus == 'empty') {
            this.hideMassSaveProgress();
          }
        } catch (err) {
          this.loadStatus = 'error';
        }
        if (finished) {
          clearInterval(theInterval); // this stops the loop
        }
      }, 1500);
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
    }
  },
  computed: {
    backgroundResumeLoading() {
      return store.state.common.backgroundResumeLoading;
    },
    is_visible() {
      return store.state.common.visible_dialog;
    }
  },
  components: {
    Icon,
    Loader,
    MassSaveResumeProgressDialog
  }
};
</script>

<style lang="scss" scoped>
.navbar-container__right {
  display: flex;
  align-items: center;
  height: 100%;

  .loader {
    background: none;
    width: 24px !important;
    height: 24px !important;

    & ::v-deep .circular {
      background: none;
      width: 24px !important;
      height: 24px !important;
    }
  }

  & ::v-deep .el-loading-mask {
    width: 24px !important;
    height: 24px !important;

    & ::v-deep .circular {
      width: 24px !important;
      height: 24px !important;
    }
  }
}

.colapse-btn {
  margin-left: 8px;
  margin-right: 24px;
  background: none;
  border: none;
  padding: 0px;
}

.progress-parent {
  display: flex;
}
</style>
