<template>
  <div class="el-pagination is-background">
    <button
      type="button"
      class="btn-prev btn-limit"
      @click="selectPage('startPage')"
      :disabled="offsets.prev == -1"
    >
      <i class="el-icon el-icon-d-arrow-left"></i>
    </button>
    <button
      type="button"
      class="btn-prev"
      @click="selectPage('prevPage')"
      :disabled="offsets.prev == -1"
    >
      <i class="el-icon el-icon-arrow-left"></i>
    </button>
    <span>
      {{ `${startValue} - ${endValue} из ${offsets.total}` }}
    </span>
    <button
      type="button"
      class="btn-next"
      @click="selectPage('nextPage')"
      :disabled="offsets.next == -1"
    >
      <i class="el-icon el-icon-arrow-right"></i>
    </button>
    <button
      type="button"
      class="btn-next btn-limit"
      @click="selectPage('endPage')"
      :disabled="offsets.next == -1"
    >
      <i class="el-icon el-icon-d-arrow-right"></i>
    </button>
  </div>
</template>

<script>
import './pagination.scss';
import { store } from '@/store';
import { getController } from '@/controllers/request.js';
import { MODULE, SORT_PARAMS } from '@/utils/constants';
export default {
  props: {
    queries: {
      type: Object
    },
    offsets: {
      type: Object
    },
    pModule: {
      type: String
    }
  },
  computed: {
    startValue() {
      return !this.offsets.total
        ? this.offsets.current
        : Number(this.offsets.current) + 1;
    },
    endValue() {
      return Number(this.offsets.next) > -1
        ? this.offsets.next
        : this.offsets.total;
    },
    pageParam() {
      if (this.pModule === MODULE.EMAILS) {
        return SORT_PARAMS.CANDIDATES_EMAILS_CELL_OFFSET;
      }
      return `${this.pModule}2_${this.pModule}_offset`;
    },
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    }
  },
  methods: {
    selectPage(url) {
      this.$emit('set-page', this.queries[url][this.pageParam]);

      if (this.$listeners.hasOwnProperty('set-data')) {
        if (!this.requestSent) {
          this.requestSent = true;

          if (this.$listeners['set-loader']) {
            this.$emit('set-loader', true);
          }

          getController({ params: { ...this.queries[url] } })
            .then(resp => this.$emit('set-data', resp))
            .catch(err =>
              this.catchError(
                err,
                'Возникла ошибка перехода на другую страницу',
                'page loading'
              )
            )
            .finally(() => (this.requestSent = false));
        }
      }
    }
  }
};
</script>
