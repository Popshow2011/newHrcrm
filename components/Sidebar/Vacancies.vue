<template>
  <div class="sidebar-vacancies">
    <div v-if="data.length > 0" class="info-vac">
      <Briefcase />
      <p class="info-vac__text primary fw-500">{{ vacanciesTitle }}</p>
    </div>
    <div class="info-vac__content" v-if="data.length > 0">
      <Vacancy
        v-for="item in data"
        v-loading="item.loading"
        :key="item.vacancy_id"
        :item="item"
        @select-vacancy="item => $emit('select-vacancy', item)"
      />
    </div>

    <div v-else class="empty">
      Кандидат не прикреплен <br />
      ни к одной вакансии
    </div>
    <div class="footer-bar">
      <Button
        v-loading="loading"
        @click="openPopup"
        :disabled="customButtons.apply_for && customButtons.apply_for.disabled"
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Прикрепить к вакансии"
        class="footer-bar__button"
      />
    </div>
  </div>
</template>

<script>
import { errorMsg, dialogMixin } from '@/utils/mixins';
import Vacancy from 'Parts/Candidate/Details/Vacancy';
import Briefcase from 'Elements/SVG/Briefcase';
import Button from 'Elements/Button/Button';
import { store } from '@/store';

export default {
  mixins: [errorMsg, dialogMixin],
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    customButtons() {
      return store.state.common.customButtons || {};
    },
    vacanciesTitle() {
      const amount = String(this.data.length);
      const lastSymbol = amount[amount.length - 1];
      const lastTwoSymbols = amount.length > 1 ? amount.slice(-2) : false;

      if (lastSymbol == 1 && lastTwoSymbols !== '11') {
        return `${amount} вакансия на рассмотрении`;
      } else if (
        Number(lastSymbol) >= 2 &&
        Number(lastSymbol) <= 4 &&
        lastTwoSymbols !== '12' &&
        lastTwoSymbols !== '13' &&
        lastTwoSymbols !== '14'
      ) {
        return `${amount} вакансии на рассмотрении`;
      } else {
        return `${!this.data.length ? 'Нет' : amount} вакансий на рассмотрении`;
      }
    }
  },
  methods: {
    async openPopup() {
      const params = {
        module: 'HRPAC_VACANCY',
        action: 'Popup',
        jsqon_return: 1,
        to_pdf: true,
        user_id: store.state.common.config.userId,
        only_assigned: 1,
        status_id_advanced: 'Открыта'
      };

      this.loading = true;
      store.commit('selectionPopup/setBaseParams', params);
      await store.dispatch('selectionPopup/loadPopupData', {
        params: { ...params, lvso: 'DESC' }
      });
      this.setVisibleDialog('vacancies_popup', true);
      this.loading = false;
    }
  },
  components: { Vacancy, Briefcase, Button }
};
</script>

<style lang="scss" scoped>
.sidebar-vacancies {
  position: relative;
  height: 100%;
}

.empty {
  height: 100%;
}

.footer-bar {
  padding: 24px;
  border-top: 1px solid $black-20;
  vertical-align: bottom;
  align-items: stretch;
  flex-direction: column;
  display: flex;
  background-color: $white;
  position: absolute;
  bottom: 0;
  width: 100%;

  &__button {
    align-self: stretch;
    -ms-grid-row-align: stretch;
  }
}

.info-vac {
  align-items: center;
  border-bottom: 1px solid $black-20;
  display: flex;
  padding: 24px 0 24px 24px;

  &__text {
    font-size: 16px;
    line-height: 24px;
    color: $blue-100;
    margin-left: 4px;
  }

  &__content {
    padding: 0 8px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(100% - 170px);
    -ms-overflow-style: none;
    background-color: $white;
  }
}

.space {
  color: $black-20;
  margin-top: 4px;
}
</style>
