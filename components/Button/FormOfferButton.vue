<template>
  <el-submenu :index="btn.id" :disabled="itemDisabled">
    <template slot="title">
      <Icon
        :iconName="icon"
        :iconColor="itemDisabled ? '#B3BCC6' : '#0075DB'"
      />
      <span>{{ btn.name }}</span>
    </template>
    <template v-if="!btn.disabled">
      <el-menu-item
        v-for="sub in vacancies"
        :key="sub.vacancy_id"
        @click="selectVacancy(sub)"
      >
        {{ formatHtml(sub.vacancy_data.name_id) }}
      </el-menu-item>
    </template>
  </el-submenu>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { MenuItem, Submenu } from 'element-ui';
import Icon from 'Elements/Icon/Icon';

export default {
  mixins: [mixin],
  props: {
    btn: Object,
    disabled: Boolean,
    icon: String
  },
  computed: {
    itemDisabled() {
      return this.disabled || !this.vacancies.length;
    },
    vacancies() {
      return [...store.state.candidate.vacancyData].filter(vacancy =>
        Object.values(vacancy.stage_data).filter(
          stage =>
            Number(stage.show_window_for_offer) &&
            (Number(stage.this_stage) || Number(stage.done))
        ).length
          ? vacancy
          : null
      );
    }
  },
  methods: {
    selectVacancy(item) {
      store.commit('candidate/setVacancyForWindow', {
        data: item,
        dialog: 'form_offer_dialog'
      });
    }
  },
  components: { 'el-menu-item': MenuItem, 'el-submenu': Submenu, Icon }
};
</script>
