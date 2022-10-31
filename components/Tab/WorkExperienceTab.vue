<template>
  <div>
    <div class="dialog__panel-right">
      <p class="work__text">Раскрыть весь опыт работы</p>
      <Switcher size="small" @switch="showAllWorks" :model="allWorksShown" />
    </div>
    <el-collapse v-model="activeNames">
      <el-collapse-item
        v-for="(job, index) in jobs"
        :key="index"
        :name="getJobFieldValue(job, 'company_name')"
      >
        <template slot="title">
          <div class="description__title">
            <h3
              class="description__title-text"
              v-html="formatHtml(getJobFieldValue(job, 'company_name')) || ''"
            />
            <div class="description__info">
              <p
                class="description__info-text description__info-blue"
                v-html="
                  formatHtml(getJobFieldValue(job, 'post')) || 'не указано'
                "
              />
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14 12L10 8V16L14 12Z" fill="#9E9E9E" />
              </svg>

              <p class="description__info-text description__info-grey">
                {{ getJobFieldValue(job, 'period_length') || 'не указано' }}
              </p>
            </div>
          </div>
        </template>
        <div class="work__details">
          <p
            class="work__details-text"
            v-html="
              formatHtml(getJobFieldValue(job, 'post_desc')) || 'не указано'
            "
          ></p>
          <p class="description__info-text description__info-grey">
            {{
              `${
                formatHtml(getJobFieldValue(job, 'period_begin')) ||
                'не указано'
              } - ${
                formatHtml(getJobFieldValue(job, 'checkbox_job_now')) == 0
                  ? formatHtml(getJobFieldValue(job, 'period_end')) ||
                    'не указано'
                  : 'По настоящее время'
              }`
            }}
          </p>
        </div></el-collapse-item
      >
    </el-collapse>
  </div>
</template>
<script>
import Switcher from 'Elements/Switch/Switch';
import { Collapse, CollapseItem } from 'element-ui';
import { mixin } from '@/utils/mixins';
export default {
  mixins: [mixin],
  props: {
    jobs: Array
  },
  components: {
    Switcher,
    'el-collapse': Collapse,
    'el-collapse-item': CollapseItem
  },
  data() {
    return {
      activeNames: []
    };
  },
  created() {
    this.$emit('set-loading', false);
  },
  computed: {
    allWorksShown() {
      return this.activeNames.length == this.jobs.length ? true : false;
    }
  },
  methods: {
    getJobFieldValue(job, value) {
      return job.fields.find(field => field.name == value).value;
    },
    showAllWorks(value) {
      if (value) {
        this.jobs.forEach(job => {
          if (
            !this.activeNames.includes(
              job.fields.find(field => field.name == 'company_name').value
            )
          )
            this.activeNames.push(
              job.fields.find(field => field.name == 'company_name').value
            );
        });
      } else {
        this.activeNames = [];
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog__panel-right {
  display: flex;
  padding-left: 20px;
  padding-top: 8px;
  background: $black-10;
  margin: 24px 0 -15px 0;
  border-radius: 4px 4px 0 0;
}

.description {
  &__title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 640px;

    &-text {
      margin: 0;
      line-height: 24px;
      font-size: 16px;
      font-weight: bold;
      color: $black-190;
    }
  }

  &__info {
    display: flex;
    margin-top: 10px;
    height: fit-content !important;
    min-height: 24px !important;
    line-height: 24px;
    font-size: 14px;

    &-text {
      margin: 0;
      min-width: 100px;
      font-weight: bold;
      font-size: 14px;
    }

    &-blue {
      color: $blue-130;
    }

    &-grey {
      color: $black-100;
    }
  }
}

.el-collapse {
  border-color: transparent;

  &__contacts {
    background: $black-10;
    padding: 6px 12px;
    font-size: 14px;
    // line-height: 20px;
  }

  &-item {
    background: $black-10;
    color: $black-190;
    display: inline;
    height: 32px;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    margin-bottom: 4px;

    & ::v-deep &__content {
      background: $black-10;
      border-radius: 0 0 4px 4px;
      padding-bottom: 24px;
    }

    & ::v-deep &__arrow {
      height: 24px;
      width: 24px;
      background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 7L12 16L21 7' stroke='%2321272C' stroke-width='2'/%3E%3C/svg%3E%0A");

      &::before {
        color: transparent;
      }

      &.is-active {
        transform: rotate(180deg);
      }

      a {
        margin-left: 12px;
        text-decoration: none;
        font-size: 14px;
        line-height: 20px;
        color: $blue-130;
        word-wrap: normal;
        overflow-wrap: normal;

        svg {
          margin-left: 0;
          padding: 0;
          position: relative;
        }
      }
    }

    &-form {
      background: $black-10;
      height: 96px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      padding-bottom: 0;
    }

    & ::v-deep &__header {
      border-bottom: none;
      background: $black-10;
      padding: 8px 20px;
      height: fit-content;
      border-radius: 4px;
      margin-top: 4px;
    }

    & ::v-deep &__wrap {
      background-color: transparent;
      border-bottom: none;
      margin-top: -6px;
    }
  }

  &-text {
    margin: 22px 0 12px 0;
  }

  &__task {
    list-style-type: none;

    &-list {
      margin-left: 0;
      padding-left: 0;
    }
  }
}

.description {
  &__items {
    display: flex;
    margin-top: 4px;
    flex-flow: wrap;
    word-wrap: normal;

    &-name {
      margin: 0;
    }

    &-value {
      margin: 0;
    }
  }

  &__item {
    display: flex;
    margin: 0;
    font-size: 14px;
    line-height: 20px;

    &-name {
      color: $black-190;
      margin-right: 4px;
    }

    &-value {
      color: $blue-120;
    }
  }

  &__part {
    display: flex;
    flex-direction: column;
    margin-top: -4px;
    width: 317px;
  }

  &__progressbar {
    margin-top: 20px;
  }

  &__title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &-text {
      margin: 0;
      line-height: 24px;
      font-size: 16px;
      font-weight: bold;
      color: $black-190;
    }
  }

  &__info {
    display: flex;
    margin-top: 10px;
    height: 24px;
    line-height: 24px;
    font-size: 14px;

    &-text {
      margin: 0;
      font-weight: bold;
      font-size: 14px;
    }

    &-blue {
      color: $blue-130;
    }

    &-grey {
      color: $black-100;
    }
  }

  &__contacts {
    background: $black-10;
    padding: 6px 12px;
    font-size: 14px;
  }
}

.dropdown ::v-deep .el-input__inner {
  width: 190px;
}

.work {
  &__text {
    margin: 0 12px 20px 0 !important;
    font-size: 15px !important;
    line-height: 24px;
    color: $black-70;
  }

  &__details {
    &-text {
      padding: 12px 20px 12px 0;
      font-size: 15px;
    }

    p {
      text-align: left;
      margin-left: 20px;
    }
  }
}
</style>
