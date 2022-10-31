<template>
  <div class="auditory shadow-lvl-1">
    <div class="auditory__header">
      <div class="auditory__header-title">
        <h4 class="auditory__title">Аудитория</h4>
        <div>
          <Icon iconName="Avatar" />
          <p class="primary fw-500">{{ fields.receivers_count.value || 0 }}</p>
        </div>
      </div>
      <button
        class="auditory__button fw-500"
        @click="openPopup"
        :disabled="loadingPopup"
      >
        Добавить
      </button>
    </div>
    <div class="auditory__body">
      <CandidateItem
        v-for="(item, index) in auditory"
        v-infinite-scroll="loadMore"
        :key="`${item.id}_${index}`"
        :candidate="item"
        :allowRemove="true"
        :iconSize="40"
        :infinite-scroll-last="index == auditory.length - 1"
        :loading="deleteLoader[item.id]"
        @remove-candidate="removeCandidate"
      />
      <Loader v-if="loader" />
    </div>
    <div v-if="!auditory.length" class="auditory__clear">
      <p>Для выбора кандидатов нажмите кнопку “добавить”</p>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import { mixin, errorMsg } from '@/utils/mixins';
import CandidateItem from 'Parts/Candidate/Item/CandidateItemSmall';
import Icon from 'Elements/Icon/Icon';
import Loader from 'Elements/Loader/Loader';
export default {
  mixins: [mixin, errorMsg],
  props: {
    fields: Object
  },
  data() {
    return {
      loader: false,
      deleteLoader: {},
      loadingPopup: false
    };
  },
  mounted() {
    this.requestSent = false;
    this.getAuditoryEntries();

    if (this.fields.id.value && !this.fields.bot_auditory_id.value) {
      this.showNotification({
        offset: 80,
        showClose: true,
        message:
          'Список кандидатов не может быть получен из-за отсутствия данных по аудитории',
        duration: 15000,
        type: 'warning'
      });
    }
  },
  computed: {
    auditoryLoaded() {
      return store.state.mailing.auditoryLoaded;
    },
    auditory() {
      return store.state.mailing.auditory || [];
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
    async openPopup() {
      const params = {
        module: 'HRPAC_CANDIDATES',
        action: 'Popup',
        jsqon_return: 1,
        to_pdf: true,
        user_id: store.state.common.config.userId
      };

      this.loadingPopup = true;
      store.commit('selectionPopup/setBaseParams', params);

      await store.dispatch('selectionPopup/loadPopupData', {
        params: { ...params, lvso: 'DESC' }
      });

      store.commit('common/setVisibleDialog', {
        name: 'selection_dialog',
        val: true
      });

      this.loadingPopup = false;
    },
    async getAuditoryEntries() {
      if (!this.requestSent) {
        this.requestSent = true;
        this.loader = true;

        await store.dispatch('mailing/loadAuditoryEntries');

        this.requestSent = false;
        this.loader = false;
      }
    },
    async loadMore() {
      if (!this.requestSent && !this.auditoryLoaded) {
        this.requestSent = true;
        this.loader = true;

        await store.dispatch('mailing/loadMoreAuditoryEntries');

        this.requestSent = false;
        this.loader = false;
      }
    },
    async removeCandidate(item) {
      this.$set(this.deleteLoader, item.id, true);
      await store.dispatch('mailing/removeCandidate', item.id);
      await store.dispatch('mailing/updateReceiversCount');
      this.$set(this.deleteLoader, item.id, false);
    }
  },
  components: { CandidateItem, Icon, Loader }
};
</script>

<style lang="scss" scoped>
.auditory {
  display: flex;
  flex-direction: column;
  width: 384px;
  height: 100%;
  background: $white;
  border-radius: 6px;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 16px;
    border-bottom: 1px solid $black-20;
  }

  &__header-title {
    display: flex;

    div {
      display: flex;
      align-items: center;
    }

    svg {
      margin: 0 4px 0 8px;
    }

    p {
      font-weight: normal;
      font-size: 16px;
      line-height: 24px;
      color: $black-60;
    }
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    line-height: 28px;
    color: $black-200;
  }

  &__button {
    font-size: 16px;
    line-height: 24px;
    color: $blue-120;
    cursor: pointer;
    border: none;
    background: transparent;

    &:disabled {
      pointer-events: none;
      color: $blue-80;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 16px;
  }

  &__clear {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 74px;

    p {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: $black-100;
      text-align: center;
    }
  }
}
</style>
