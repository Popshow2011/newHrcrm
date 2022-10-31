<template>
  <div v-loading="loader.visible" v-scroll="handleScroll" class="history-tab">
    <div v-for="(item, index) in history" :key="`${index}_${item.id}`">
      <div v-if="showDate(getDate(item.date_created), index)">
        <Tag
          class="header-messages-tag"
          :name="getDate(item.date_created)"
          :closable="false"
        />
      </div>
      <s-history :data="item" :module="module" />
    </div>
    <div class="empty" v-if="!history.length">Данные отсутствуют</div>
  </div>
</template>
<script>
const AUDIT_COUNT_CONFIG = 25;
import { getController } from '@/controllers/request.js';
import { store } from '@/store';
import { MODULE, ACTION } from '@/utils/constants';
import SHistory from 'Elements/History/History';
import Tag from 'Elements/Tag/Tag';
export default {
  props: {
    module: String,
    id: String,
    tabId: String
  },
  data() {
    return {
      history: [],
      audit_iteration: 0,
      loader: {
        visible: false,
        accept_scroll: false
      }
    };
  },
  created() {
    this.getAuditEntries();
  },
  computed: {
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    },
    isActiveSubpanel() {
      return Object.values(store.state.subpanels.activeSubpanel).some(
        tab => tab.id == this.tabId
      );
    }
  },
  methods: {
    getAuditEntries() {
      if (!this.requestSent && this.isActiveSubpanel) {
        this.requestSent = true;
        getController({
          params: {
            module: MODULE.AUDIT,
            action: ACTION.POPUP,
            module_name: this.module,
            record: this.id,
            count: AUDIT_COUNT_CONFIG,
            iteration: this.audit_iteration,
            jsqon_return: 1
          }
        })
          .then(resp => {
            if (resp.data && !resp.data.error) {
              localStorage.removeItem('lastDate');
              this.history = [...this.history, ...resp.data];
              this.audit_iteration++;
              this.loader = {
                visible: false,
                accept_scroll: resp.data.length === AUDIT_COUNT_CONFIG
              };
              if (!this.history.length) return;

              this.$nextTick(() =>
                store.commit('vacancy/setParam', {
                  name: 'activityDate',
                  val: this.history[0].date_created.split(' ')[0]
                })
              );
            }
          })
          .catch(err => {
            this.catchError(
              err,
              'Возникла ошибка загрузки истории работы с кандидатом',
              'history loading'
            );
          })
          .finally(() => {
            this.requestSent = false;
            this.$emit('set-loading', false);
          });
      }
    },
    handleScroll() {
      if (this.loader.accept_scroll) {
        const windowHeight = document.body.offsetHeight;
        const auditWrapper = $(`[data-id="${this.id}"] .history-tab`)[0];
        const bottomCoordY = auditWrapper
          ? auditWrapper.getBoundingClientRect().bottom
          : 0;
        // меньше 25 записей -> не слать запрос
        if (auditWrapper && bottomCoordY <= windowHeight) {
          this.$set(this.loader, 'visible', true);
          this.getAuditEntries();
        }
      }
    },
    getDate(datetime) {
      return datetime ? datetime.split(' ')[0] : '';
    },
    showDate: function (value) {
      let lastDate = localStorage.getItem('lastDate');
      if (lastDate === null || lastDate !== value) {
        localStorage.setItem('lastDate', value);
        lastDate = value;
        return true;
      }
      return false;
    }
  },
  components: { SHistory, Tag },
  mounted() {
    localStorage.removeItem('lastDate');
  }
};
</script>

<style scoped lang="scss">
.history-tab {
  & ::v-deep .el-loading-mask {
    top: 99%;
  }
}

.header-messages-tag {
  margin-top: 32px;
  margin-bottom: 4px;
}
</style>
