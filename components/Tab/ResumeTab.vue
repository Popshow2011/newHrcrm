<template>
  <div class="candidate-info">
    <resume-dialog
      v-if="fields.resume_text && visibleResumePopup"
      :is_visible="visibleResumePopup"
      :resume="formatHtml(fields.resume_text.value)"
      :source="fields.resume_source_id.value"
      :resume-link="fields.resume_url.value"
      mode="fullText"
      @reset-callback="visibleResumePopup = false"
    ></resume-dialog>
    <div class="candidate-info__update" v-if="fields.resume_date_upd">
      <p
        class="candidate-info__update-text secondary"
        v-if="fields.resume_date_upd.value"
      >
        Обновлено {{ fields.resume_date_upd.value.split(' ')[0] }}
      </p>
      <p
        class="candidate-info__update-text secondary"
        v-if="fields.created_by_name.value"
      >
        Добавил: {{ fields.created_by_name.value | format }}
      </p>
    </div>
    <div class="vacancy-info">
      <div
        class="vacancy-info__wrapper"
        v-if="fields.salary || fields.specialty"
      >
        <h3 class="vacancy-info__specialty primary" v-if="fields.specialty">
          {{ fields.specialty.value || '[нет наименования]' | format }}
        </h3>
        <h3
          class="vacancy-info__price primary"
          v-if="Number(fields.salary.value)"
        >
          {{
            `${numberWithSpace(fields.salary.value)} ${
              fields.currency_id ? fields.currency_id.symbol : '₽'
            } ${
              fields.income_type &&
              fields.income_type.value &&
              fields.income_type.value !== 'empty'
                ? `(${fields.income_type.value})`
                : ''
            }`
          }}
        </h3>
      </div>
      <div
        class="vacancy-link"
        v-if="fields.resume_url || fields.resume_source_id"
      >
        <Divider hasLine dividerSize="1" />
        <Divider dividerSize="24" />
        <div class="vacancy-link__source" v-if="fields.resume_url.value">
          <p class="link-label secondary">Ссылка на источник резюме</p>
          <Link
            hasRightIcon
            target="_blank"
            :text="formatHtml(fields.resume_source_id.value) || '[источник]'"
            :href="fields.resume_url.value"
          />
        </div>
        <div
          class="vacancy-link__source"
          v-if="!fields.resume_url.value && fields.resume_source_id.value"
        >
          <p class="link-label">
            Источник резюме: {{ fields.resume_source_id.value | format }}
          </p>
        </div>
        <Divider dividerSize="24" hasLine />
      </div>
      <div
        v-if="fields.candidates_jobs && fields.candidates_jobs.value.length"
        class="candidate-experience"
      >
        <h3
          v-if="fields.total_experience"
          class="resume-section-title"
          v-html="'Опыт работы ' + experiencePeriod"
        ></h3>
        <div
          v-show="detail.length"
          class="candidate-work"
          v-for="work in detail"
          :key="work.period_begin"
        >
          <div class="candidate-work__time">
            <p
              v-if="work.period_begin"
              class="candidate-work__time-title primary"
            >
              {{ work.period_begin }} —
              {{ work.period_end ? work.period_end : 'по настоящее время' }}
            </p>
            <p v-else class="candidate-work__time-title secondary">
              [период не указан]
            </p>
            <p
              v-if="work.period_length"
              class="candidate-work__time-count secondary"
              v-html="work.period_length"
            ></p>
          </div>
          <div class="candidate-work__place">
            <div v-if="work.company_name" class="candidate-work__place-company">
              <p
                class="candidate-work__place-title primary fw-500"
                v-html="formatHtml(work.company_name)"
              ></p>
              <p v-if="work.area" class="candidate-work__place-city primary">
                {{ formatHtml(work.area.name) }}
              </p>
              <p
                v-show="work.industries"
                v-for="item in work.industries"
                :key="item.id"
                class="candidate-work__place-text-grey secondary"
              >
                {{ item.name | format }}
              </p>
            </div>
            <div
              v-if="work.post || work.post_desc"
              class="candidate-work__place-position"
            >
              <p
                v-if="work.post"
                class="candidate-work__place-title primary fw-500"
              >
                {{ work.post | format }}
              </p>
              <p
                v-if="work.post_desc"
                class="candidate-work__place-text primary"
                v-html="formatHtml(work.post_desc)"
              ></p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="skillsArray.length" class="candidate-skills">
        <h3 class="candidate-skills__title">Ключевые навыки</h3>
        <div class="candidate-skills__wrapper">
          <Tag
            v-for="skill in skillsArray"
            :key="skill"
            :closable="false"
            class="candidate-skills__tag"
            disabled
            :name="skill"
          />
        </div>
      </div>

      <div v-if="fields.about_oneself" class="candidate-about">
        <h3 class="resume-section-title">Обо мне</h3>
        <p
          class="candidate-about__text primary"
          v-html="formatHtml(fields.about_oneself.value)"
        ></p>
      </div>

      <div
        v-if="fields.education && fields.education.value.length"
        class="candidate-educ"
      >
        <div v-for="item in fields.education.value" :key="item.id">
          <h3 v-if="item.fields[3].value" class="resume-section-title">
            {{
              item.fields[3].options
                ? item.fields[3].options[item.fields[3].value]
                : item.fields[3].value | format
            }}
            образование
          </h3>
          <div class="candidate-educ__box">
            <p v-if="item.fields[2].value" class="candidate-educ__year primary">
              {{ item.fields[2].value }}
            </p>
            <p class="candidate-educ__text primary">
              <b v-if="item.fields[0].value">
                {{ item.fields[0].value | format }}
              </b>
              <span v-if="item.fields[1].value">
                {{ item.fields[1].value | format }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div
        class="candidate-qualif"
        v-if="fields.skills_training && fields.skills_training.value.length"
      >
        <h3 class="candidate-qualif__title">Повышение квалификации</h3>
        <div
          v-for="item in fields.skills_training.value"
          :key="item.id"
          class="candidate-qualif__box"
        >
          <p v-if="item.fields[2].value" class="candidate-qualif__year primary">
            {{ item.fields[2].value }}
          </p>
          <p class="candidate-qualif__text primary">
            <b v-if="item.fields[0].value">
              {{ item.fields[0].value | format }}
            </b>
            <span v-if="item.fields[1].value">
              {{ item.fields[1].value | format }}
            </span>
          </p>
        </div>
      </div>
      <div
        class="candidate-lang"
        v-if="
          fields.language_proficiency &&
          fields.language_proficiency.value.length
        "
      >
        <h3 class="candidate-lang__title">Знание языков</h3>
        <p
          v-for="item in fields.language_proficiency.value"
          :key="item.id"
          class="candidate-lang__text primary"
        >
          {{
            item.fields[0].options
              ? item.fields[0].options[item.fields[0].value]
              : item.fields[0].value | format
          }}
          —
          {{
            item.fields[1].options
              ? item.fields[1].options[item.fields[1].value]
              : item.fields[1].value | format
          }}
        </p>
      </div>
      <Button
        v-if="fields.resume_text && formatHtml(fields.resume_text.value)"
        buttonSize="big"
        buttonColor="blue"
        buttonText="Смотреть полный текст резюме"
        class="full-resume-btn"
        @click="visibleResumePopup = true"
      />
    </div>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixins';
import { numberWithSpace } from '@/utils/helpers';
import Divider from 'Elements/Divider/Divider';
import Link from 'Elements/Link/Link';
import Tag from 'Elements/Tag/Tag';
import ResumeDialog from 'Elements/Dialog/ResumeDialog';
import Button from 'Elements/Button/Button';
export default {
  mixins: [mixin],
  props: {
    fields: {
      type: Object
    }
  },
  data() {
    return {
      loaded: false,
      numberWithSpace,
      visibleResumePopup: false,
      detail: []
    };
  },
  created() {
    this.$emit('set-loading', false);
    this.loaded = true;
    this.detail = this.getExperience(this.fields.detail_experience.value);
  },
  methods: {
    getExperience(arr) {
      return arr.reduce((acc, cur) => {
        let result = {};
        cur.fields.map(el => {
          result[el.name] = this.formatHtml(el.value);
        });
        acc.push(result);
        return acc;
      }, []);
    }
  },
  computed: {
    skillsArray() {
      if (!this.fields.skills_ids || !this.fields.skills_ids.value) {
        return [];
      }
      const skills = this.fields.skills_ids.value;
      return !Array.isArray(skills)
        ? this.formatHtml(skills).split(',')
        : skills.map(({ name }) => name);
    },

    experiencePeriod() {
      return this.fields.total_experience
        ? this.formatHtml(this.fields.total_experience.value)
        : this.fields.experience
        ? this.formatHtml(this.fields.experience.value)
        : '';
    }
  },
  components: { Divider, Link, Tag, ResumeDialog, Button }
};
</script>

<style lang="scss">
#pane-resume .candidate-info .candidate-work .candidate-work__place-text > ul,
ol > li {
  list-style-type: disc;
  margin-left: 16px;
}
</style>

<style lang="scss" scoped>
.resume-section-title {
  line-height: 32px;
  color: $black-40;
  font-size: 24px;
  margin: 0 0 32px 0;

  & ::v-deep * {
    display: inline-block;
  }
}

.candidate {
  &-about,
  &-experience,
  &-lang {
    margin-top: 40px;
  }

  &-lang__text {
    font-size: 15px;
    margin: 8px 0 0 0;
    line-height: 24px;
  }

  &-about__text {
    width: 712px;
    text-align: left;
    font-size: 15px;
    margin: 0;
    line-height: 24px;
  }

  &-skills__title,
  &-lang__title,
  &-qualif__title {
    line-height: 32px;
    color: $black-40;
    font-size: 24px;
    margin: 0 0 24px 0;
  }

  &-educ,
  &-qualif {
    margin-top: 40px;

    &__box {
      display: flex;

      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    &__year {
      margin: 0;
      font-size: 15px;
      line-height: 24px;
      width: 164px;
    }

    &__text {
      margin: 0;
      font-size: 15px;
      line-height: 24px;
      width: 354px;
    }
  }

  &-skills {
    &__wrapper {
      display: flex;
      flex-wrap: wrap;
      column-gap: 4px;
      row-gap: 8px;
      text-align: left;
      // display: inline-block;
    }

    &__tag {
      margin: 8px 4px 0 0;
      // color: $black-80;
      // border-color: $black-30;
      // background-color: $black-10;
    }
  }

  &-experience + &-skills {
    margin-top: 40px;
  }

  &-info__update {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;

    &-text {
      margin: 0;
      font-size: 16px;
      color: $black-40;

      &:only-child {
        margin-left: auto;
      }
    }
  }

  &-work {
    display: flex;
    flex-direction: row;
    text-align: left;

    &__place {
      width: 548px;
      margin-left: 25px;
      word-break: break-word;

      &-position {
        margin-top: 28px;
        display: flex;
        flex-direction: column;
        width: 484px;
      }

      &-company {
        display: flex;
        flex-direction: column;
      }

      &-city,
      &-text {
        margin: 8px 0 0 0;
        font-size: 15px;
        line-height: 24px;
        color: $black-170;

        &-grey {
          margin: 8px 0 0 0;
          font-size: 15px;
          line-height: 24px;
          color: $black-40;
        }
      }

      &-title {
        margin: 0;
        font-size: 16px;
        line-height: 24px;
        color: $black-170;
      }
    }

    &__time {
      width: 138px;

      &-title {
        margin: 0 0 8px 0;
        font-size: 15px;
        line-height: 24px;
        color: $black-170;
      }

      &-count {
        margin: 0;
        font-size: 15px;
        line-height: 24px;
        color: $black-40;
      }
    }
  }
}

.link-label {
  margin: 0 4px 0 0;
  align-self: center;
  -ms-grid-row-align: center;
}

.vacancy {
  &-about {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 120px;

    &__text {
      margin: 0;
      padding-left: 40px;
      line-height: 24px;
      font-size: 15px;

      &-main {
        line-height: 24px;
        font-size: 15px;
        margin: 0;
      }
    }
  }

  &-info {
    &__wrapper {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      color: $black-170;
      margin: 24px 0 32px 0;
    }

    &__price,
    &__specialty {
      margin: 0;
      font-size: 24px;
    }

    &__price {
      white-space: nowrap;
    }

    & > .divider:only-child {
      display: none;
    }
  }

  &-link__source {
    display: flex;
    flex-direction: row;
    justify-content: center;
    // font-size: 15px;
    color: $black-50;

    p {
      font-size: 15px;
      line-height: 24px;
    }
  }
}

.full-resume-btn {
  margin-top: 40px;
}

.candidate-educ,
.candidate-qualif {
  &__text > * {
    width: 100%;
    display: block;
  }
}

@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  /* IE10 IE11 */
  .candidate-skills__tag {
    margin: 8px 4px 0 0;
  }
}
</style>
