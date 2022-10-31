<template>
  <el-submenu :index="btn.id" :disabled="btn.disabled || disabled">
    <template slot="title">
      <Icon
        :iconName="icon"
        :iconColor="btn.disabled || disabled ? '#B3BCC6' : '#0075DB'"
      />
      <span>{{ btn.name }}</span>
    </template>
    <template v-if="!btn.disabled && !disabled">
      <el-menu-item
        v-for="sub in vacancies"
        :key="sub.vacancy_id"
        @click="generateLink(sub)"
      >
        {{ sub.vacancy_data.name_id }}
      </el-menu-item>
      <input
        :id="`link_${urlParams.record}`"
        type="text"
        :value="generatedLink"
        readonly
        class="hidden-copy-input"
      />
    </template>
  </el-submenu>
</template>
<script>
import Vue from 'vue';
import Clipboard from 'v-clipboard';
import { store } from '@/store';
import { MenuItem, Submenu } from 'element-ui';
import { getController } from '@/controllers/request.js';
import { mixin, errorMsg } from '@/utils/mixins';
import { ACTION } from '@/utils/constants';
import Icon from 'Elements/Icon/Icon';

Vue.use(Clipboard);

export default {
  mixins: [mixin, errorMsg],
  props: {
    btn: Object,
    icon: String,
    disabled: Boolean
  },
  data() {
    return {
      generatedLink: ''
    };
  },
  mounted() {
    // перенос в body, т.к. копирование в буфер не работает, если список кнопок скрыт
    document.body.append(
      document.getElementById(`link_${this.urlParams.record}`)
    );
  },
  computed: {
    vacancies() {
      return store.state.candidate.vacancyData || [];
    }
  },
  methods: {
    generateLink({ vacancy_id, vacancy_data }) {
      if (this.btn.disabled || this.disabled) return;

      if (vacancy_data.test_url) {
        const { module, record } = this.urlParams;
        getController({
          params: {
            module,
            action: ACTION.GET_LINK,
            id_candidate: record,
            id_vacancy: vacancy_id || '',
            jsqon_return: 1,
            to_pdf: true
          }
        })
          .then(({ data }) => {
            if (data.error || (data.status && data.status === 'error')) {
              throw new Error(data.message);
            }

            if (data) {
              this.generatedLink = data;
            }
          })
          .then(() => {
            try {
              this.$clipboard(`link_${record}`);
              this.showNotification({
                offset: 100,
                showClose: true,
                message: 'Успешно скопировано.',
                duration: 6500,
                type: 'success'
              });
            } catch (err) {
              this.showNotification({
                offset: 100,
                showClose: true,
                message: 'Ошибка при копировании ссылки.',
                duration: 6500,
                type: 'error'
              });
            }
          })
          .catch(err => this.catchError(err, err, 'generate link'));
      } else {
        this.showNotification({
          offset: 100,
          showClose: true,
          message: `Не указана ссылка для тестирования по вакансии «${vacancy_data.name_id}»`,
          duration: 6500,
          type: 'error'
        });
      }
    }
  },
  components: { 'el-menu-item': MenuItem, 'el-submenu': Submenu, Icon }
};
</script>
<style lang="scss" scoped>
.hidden-copy-input {
  opacity: 0;
  position: fixed;
  left: 100%;
  top: -100%;
}
</style>
