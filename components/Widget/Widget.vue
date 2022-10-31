<template>
  <div :class="['widget', isShort ? 'widget--short' : '']">
    <div
      :class="
        isShort ? 'widget__header widget__header--short' : 'widget__header'
      "
    >
      <div>
        <button type="button" @click="closeWidget(isShort ? '1' : '0')">
          <Icon
            iconName="bigArrowDown"
            :class="[isShort ? 'rotated-icon' : '']"
          />
          <h4>
            {{
              widgetLbl
                ? formatHtml(widgetLbl)
                : widgetName == 'WebPage'
                ? 'Веб-страница'
                : 'Нет названия'
            }}
          </h4>
        </button>
      </div>
      <ActionsMenu
        v-if="widgetName == 'WebPage'"
        :actions="[
          {
            id: 'edit',
            name: 'Редактировать'
          }
        ]"
        :handle-command="handleCommand"
        color="black"
      />
    </div>
    <div v-if="!isShort">
      <div class="widget__body" v-if="widgetName == 'QuickActions'">
        <div v-if="noData">
          <div class="flex-row">
            <p class="no-data">
              {{ widget['no_widget_data'] }}
              <!-- Нет быстрых действий. Измените настройки видимости. -->
            </p>
          </div>
          <ButtonUI buttonColor="darkBlue" buttonText="Настроить" />
        </div>
        <QuickActionWidget
          v-else
          :widgetData="widget['widget_data']"
          @block-access="blockAccess"
        />
      </div>
      <div v-else-if="widgetName == 'WebPage'" class="widget__body">
        <iframe
          v-if="widget['widget_data']['data']['link']"
          :src="widget['widget_data']['data']['link']"
          height="514px"
          width="588px"
          style="border: none"
        ></iframe>
        <div v-else class="web-block">
          <div class="flex-row">
            <Icon iconName="globe" iconColor="#0075DB" />
            <p class="no-data">
              {{ widget['no_widget_data'] }}
              <!-- Веб-страница не указана -->
            </p>
          </div>
          <ButtonUI
            buttonColor="darkBlue"
            buttonText="Указать"
            @click="handleCommand"
          />
        </div>
      </div>
      <div v-if="widgetName == 'LastActions'" class="widget__body">
        <div v-if="noData" class="flex-row">
          <Icon iconName="history" iconColor="#0075DB" />
          <p class="no-data">
            {{ widget['no_widget_data'] }}
            <!-- Список действий пуст -->
          </p>
        </div>
        <RecentActivitiesWidget
          v-else
          :widgetData="widget['widget_data']"
          @block-access="blockAccess"
          @close-block="
            (mod, val) => closeWidget(isShort ? '0' : '1', mod, val)
          "
        />
      </div>
      <div v-if="widgetName == 'SavedFilters'" class="widget__body">
        <p v-if="noData" class="no-data">
          {{ widget['no_widget_data'] }}
          <!-- Нет сохраненных шаблонов -->
        </p>
        <SavedFilterWidget
          v-else
          :widgetData="widget['widget_data']"
          @block-access="blockAccess"
          @close-block="
            (mod, val) => closeWidget(isShort ? '0' : '1', mod, val)
          "
        />
      </div>
    </div>
  </div>
</template>
<script>
import 'Root/assets/scss/common.scss';
import Icon from 'Elements/Icon/Icon';
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { postController } from '@/controllers/request';
import ButtonUI from 'Elements/Button/Button';
import ActionsMenu from 'Elements/Menu/ActionsMenu';
import QuickActionWidget from 'Elements/Widget/QuickActionWidget';
import RecentActivitiesWidget from 'Elements/Widget/RecentActivitiesWidget';
import SavedFilterWidget from 'Elements/Widget/SavedFilterWidget';

export default {
  mixins: [mixin],
  components: {
    Icon,
    ButtonUI,
    ActionsMenu,
    QuickActionWidget,
    RecentActivitiesWidget,
    SavedFilterWidget
  },
  props: {
    type: {
      type: String
    },
    widget: {
      type: Object || Array
    }
  },
  data() {
    return {
      isShort: false
    };
  },
  created() {
    store.commit('widget/setOpenWidget', {
      widgetName: this.widget['widget_vardefs']['widget_action'],
      val: this.widget['widget_vardefs']['widget_show'] == '1' ? true : false
    });
    this.isShort = !store.state.widget.widget[this.widgetName];

    window.parent.postMessage([
      this.widgetName,
      store.state.widget.widget[this.widgetName]
    ]);

    let page = document.getElementsByTagName('body')[0];
    page.classList.add('body');
    page.style.overflow = 'hidden';
    page.style.margin = '0';
  },
  computed: {
    widgetName() {
      return this.widget['widget_vardefs']['widget_action'];
    },
    widgetLbl() {
      return this.widget['widget_vardefs']['widget_lbl'];
    },
    noData() {
      return this.widget['no_widget_data'] ? true : false;
    }
  },
  methods: {
    async closeWidget(showMore, module = '', val = '') {
      const options = new FormData();
      options.append('module', 'Home');
      options.append('action', 'saveWidget');
      options.append(
        'name_widget',
        this.widget['widget_vardefs']['widget_action']
      );
      options.append('show_widget', showMore);
      if (module.length > 0 && val.length > 0) {
        options.append(`params[${module}]`, val);
      }

      try {
        await postController({ options });
      } catch (err) {
        console.error(err);
      } finally {
        await store.commit('widget/setOpenWidget', {
          widgetName: this.widgetName,
          val: showMore == '1' ? true : false
        });
        this.isShort = !store.state.widget.widget[this.widgetName];
        window.parent.postMessage([
          this.widgetName,
          store.state.widget.widget[this.widgetName]
        ]);
      }
    },
    handleCommand() {
      window.parent.postMessage('edit');
    },
    blockAccess(wname) {
      window.parent.postMessage(`block,${wname}`);
    }
  }
};
</script>
<style lang="scss" scoped>
.widget {
  width: 588px;
  font-family: Roboto, 'Roboto', sans-serif;
  height: 563px;
  display: inherit;
  border-radius: 6px;
  background: $white;
  margin: 0 24px 20px 0;
  filter: drop-shadow(0px 1px 4px rgba(33, 39, 44, 0.09));

  .iframe {
    max-height: 514px;
    min-height: 48px;
    height: inherit;
  }

  &--short {
    height: 48px;
  }

  &:nth-child(2n) {
    margin: 0 0 20px 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    padding: 12px 12px 12px 24px;
    border-bottom: 1px solid $black-20;
    justify-content: space-between;

    &--short {
      border-bottom: none;
    }

    div {
      display: flex;
      flex-direction: row;

      button {
        border: none;
        background: transparent;
        display: flex;
        padding: 0;
        height: 24px;

        .rotated-icon {
          transform: rotate(-180deg);
        }

        h4 {
          margin: 0 0 0 8px;
          padding: 0;
          font-family: Roboto, 'Roboto', sans-serif;
          font-style: normal;
          font-weight: 700;
          font-size: 16px;
          line-height: 24px;
          color: $black-200;
        }
      }
    }
  }

  &__body {
    height: 514px;
    color: $black-10;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
    max-width: 588px;
    overflow-x: hidden;
    border-radius: 0 0 6px 6px;

    &-row {
      background: white;
      border-bottom: 1px solid $black-20;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 12px 24px;

      div {
        display: flex;
        flex-direction: row;
        align-items: center;

        p {
          font-weight: 400;
          font-size: 14px;
          line-height: 24px;
          color: $black;
          margin-left: 12px;
        }
      }
    }

    .web-block {
      text-align: center;
      div {
        margin-bottom: 16px;
      }
    }
  }

  .flex-row {
    display: flex;
    flex-direction: row;
  }

  .no-data {
    font-size: 15px;
    color: $black-100;
    margin: 0 0 0 8px;
    line-height: 24px;
    max-width: 209px;
  }
}
</style>
