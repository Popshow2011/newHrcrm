<template>
  <el-dialog
    :title="title"
    width="80%"
    :visible.sync="is_visible"
    :close-on-click-modal="true"
    @close="$emit('reset-callback')"
    class="dialog"
  >
    <div class="full-resume" v-html="formattedResume"></div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
export default {
  props: {
    is_visible: {
      type: Boolean
    },
    resume: String,
    source: String,
    resumeLink: String,
    mode: {
      type: String,
      default: 'fullText'
    }
  },
  computed: {
    title() {
      return this.mode == 'fullText'
        ? 'Полный текст резюме'
        : 'Предпросмотр резюме';
    },
    formattedResume() {
      if (this.resume) {
        let resume = this.resume;
        if (resume.match(/\\"/) != null || resume.match(/\\r\\n/) != null) {
          let i = 0;
          while (
            (resume.match(/\\"/) != null && i != 10000) ||
            (resume.match(/\\r\\n/) != null && i != 10000)
          ) {
            resume = resume.replace(/\\"/, '"');
            resume = resume.replace(/\\r\\n/, ' ');
            i++;
          }

          resume = resume.replace(
            '<title xml:lang="en-US"/>',
            '<title xml:lang="en-US"></title>'
          );
        }

        if (
          (this.source === 'HH.ru' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('hh.ru') > -1)) &&
          resume.search('/plugin/hh/hh-main.css') === -1
        ) {
          // фикс проблемы отображения резюме
          // в зависимости от источника резюме - на бэке нужно подгружать соотв.ссылки в карточке!
          resume =
            `<link rel="stylesheet" type="text/css" href="/plugin/hh/hh-font.css" />
          <link rel="stylesheet" type="text/css" href="/plugin/hh/hh-main.css" />` +
            resume;
        }

        if (
          (this.source === 'Linkedin' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('linkedin.com') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/linkedIn/linkedIn.css" />' +
            resume;
        }

        if (
          (this.source === 'career.habr' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('career.habr.com') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/career-habr/career-habr.css" />' +
            resume;
        }
        if (
          (this.source === 'Rabota.ru' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('rabota.ru') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/rabota_ru/rabota.css" />' +
            resume;
        }
        if (
          (this.source === 'Zarplata.ru' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('hr.zarplata.ru') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/zarplata_ru/zarplata.css" />' +
            resume;
        }
        if (
          (this.source === 'Joblab' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('joblab.ru') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/joblab/joblab.css" />' +
            resume;
        }
        if (
          (this.source === 'Podbor' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('app.podbor.io') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/podbor/podbor.css" />' +
            resume;
        }
        if (
          (this.source === 'suprejob' ||
            (!this.source &&
              this.resumeLink &&
              this.resumeLink.indexOf('superjob.ru') > -1)) &&
          resume.length
        ) {
          resume =
            '<link rel="stylesheet" type="text/css" href="/plugin/superjob/superjob.css" />' +
            resume;
        }
        return resume;
      }

      return '';
    }
  },
  components: {
    'el-dialog': Dialog
  }
};
</script>
<style lang="scss" scoped>
.dialog {
  & ::v-deep .el-dialog {
    max-width: 1200px !important;
  }
}
</style>
<style lang="scss">
.dialog .full-resume {
  z-index: 8000;

  * {
    word-break: break-word !important;
    white-space: normal !important;
    max-width: 100%;
  }

  table {
    width: 100% !important;
  }

  p span {
    vertical-align: middle !important;
  }

  h1,
  .h1,
  h2,
  .h2 {
    font-size: 20px;
  }

  .fr1,
  .fr1 + div {
    float: none !important;
    left: unset !important;
    top: unset !important;
  }

  .resume-header-main h2 {
    font-size: 2.333em;
  }

  img {
    max-height: 250px;
    color: transparent;
  }

  .bloko-columns-wrapper,
  .bloko-column_m-12,
  .bloko-column_m-9,
  .bloko-columns-row {
    width: 100% !important;
  }

  .bloko-column_m-7,
  .bloko-column_s-6 {
    width: calc(100% - 160px) !important;
  }

  .resume-sidebar-background {
    width: 0 !important;
  }
}
</style>
