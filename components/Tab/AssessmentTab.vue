<template>
  <div class="assessment-tab">
    <el-collapse
      v-if="vacancies.length"
      v-model="assessmentCollapse"
      accordion
      @change="setAssessmentCollapseTab"
    >
      <el-collapse-item
        v-for="{ id, name } in vacancies"
        :key="id"
        :name="id"
        :title="formatHtml(name)"
        v-loading="loading[id]"
        :disabled="requestSent"
      >
        <el-form
          v-if="mainForm[id] && Object.keys(mainForm[id].panels).length"
          v-scroll="scrollTab"
          :model="mainForm[id].form"
          :rules="rules"
          :ref="id"
          status-icon
          class="assessment-form demo-ruleForm"
          label-position="top"
          size="mini"
        >
          <div :id="`check-list-${id}`" class="assessment-form__wrapper">
            <div
              class="assessment-form__section"
              v-for="(section, key) in mainForm[id].panels"
              v-show="section.rows && section.rows.length"
              :key="key"
            >
              <h3 v-if="section.LBL" class="primary">{{ section.LBL }}</h3>
              <div
                v-for="(item, j) in section.rows"
                :key="`${key}_${j}`"
                :class="[
                  'row',
                  asmRowWithBorderClass(item.fields[0], section.name),
                  section.name === QUESTION_TYPE.INTERVIEW_RESULTS
                    ? 'row--white-bg'
                    : ''
                ]"
              >
                <div
                  v-if="section.name === QUESTION_TYPE.JOB_EXPERIENCE"
                  class="candidate-jobs"
                >
                  <div class="candidate-jobs__header">
                    <Input
                      :field="{ readonly: true }"
                      :model="formatHtml(item.job.company_name)"
                      class="candidate-jobs__header-item"
                    />
                    <Input
                      :field="{ readonly: true }"
                      :model="formatHtml(item.job.post)"
                      class="candidate-jobs__header-item"
                    />
                    <Input
                      :field="{ readonly: true }"
                      :model="`${item.job.period_begin} — ${
                        item.job.period_end || 'настоящее время'
                      }`"
                      class="candidate-jobs__header-item"
                    />
                  </div>
                  <AssessmentRow
                    v-for="(field, k) in item.fields"
                    :key="`${key}_${j}_${k}_${field.question_id}`"
                    :field="field"
                    :model="
                      mainForm[id].job_experience[item.job.id][
                        field.question_id
                      ]
                    "
                    :options="options"
                    :datepicker="datepicker"
                    :item="item"
                    :vacancy_id="id"
                    :select-type="selectType(field.answer_type)"
                    class-name="row row--with-border"
                    @set-value="setAnswerValue"
                  ></AssessmentRow>
                </div>
                <div
                  v-else-if="section.name === QUESTION_TYPE.INTERVIEW_RESULTS"
                  class="interview-results"
                >
                  <div class="interview-results__top">
                    <div
                      class="interview-results__person primary"
                      v-if="item.subfields.person"
                      v-html="assessmentPerson(item.subfields.person)"
                    ></div>
                    <div
                      class="interview-results__rate"
                      v-if="item.subfields.rate"
                    >
                      <Rating
                        :name="item.subfields.rate.name"
                        :model="
                          mainForm[id].interview_results[
                            item.subfields.rate.name
                          ]
                        "
                        @set-value="
                          (name, val) =>
                            $set(mainForm[id].interview_results, name, val)
                        "
                      />
                    </div>
                  </div>
                  <Textarea
                    v-if="item.subfields.text"
                    :field="item.subfields.text"
                    :hasResizeIcon="true"
                    :model="
                      mainForm[id].interview_results[item.subfields.text.name]
                    "
                    @change="
                      (name, val) =>
                        $set(mainForm[id].interview_results, name, val)
                    "
                  />
                </div>
                <assessment-row
                  v-else
                  v-for="(field, k) in item.fields"
                  :key="`${key}_${j}_${k}_${field.question_id}`"
                  :field="field"
                  :model="mainForm[id].form[field.question_id]"
                  :options="options"
                  :datepicker="datepicker"
                  :item="item"
                  :vacancy_id="id"
                  :select-type="selectType(field.answer_type)"
                  @set-value="setAnswerValue"
                ></assessment-row>
              </div>
            </div>
          </div>
          <div :id="`button-${id}`" class="assessment-form__button-panel">
            <Button
              buttonSize="big"
              buttonColor="blue"
              buttonText="Сохранить изменения"
              @click="saveAssessmentForm(id)"
            />
          </div>
        </el-form>
        <div class="empty" v-else>Нет данных</div>
      </el-collapse-item>
    </el-collapse>
    <div v-else>У кандидата нет прикрепленных вакансий</div>
  </div>
</template>
<script>
import { store } from '@/store';
import { Collapse, CollapseItem, Form } from 'element-ui';
import { mixin } from '@/utils/mixins';
import { setDateFormat } from '@/utils/helpers';
import { MODULE, ACTION, ANSWER_TYPE, QUESTION_TYPE } from '@/utils/constants';
import AssessmentRow from 'Elements/Tab/AssessmentRow';
import Button from 'Elements/Button/Button';
import Textarea from 'Elements/Textarea/Textarea';
import Input from 'Elements/Input/Input';
import Rating from 'Elements/Rating/Rating';
import merge from 'lodash/merge';
import { getController, postController } from '@/controllers/request.js';
import './assessment.scss';

export default {
  mixins: [mixin],
  props: {
    module: String,
    candidateId: String
  },
  data() {
    return {
      QUESTION_TYPE,
      assessmentCollapse: '',
      loading: {},
      mainForm: {},
      options: {},
      datepicker: {
        dateFormat: '',
        timeFormat: 'HH:mm'
      },
      rules: {},
      vacancies: []
    };
  },
  created() {
    getController({
      params: {
        module: this.module,
        action: ACTION.GET_VACANCIES_LIST,
        id: this.candidateId,
        to_pdf: true
      }
    })
      .then(resp => {
        if (resp.data && !resp.data.error) {
          this.vacancies = [...resp.data];
        }
      })
      .catch(err =>
        this.catchError(
          err,
          'Возникла ошибка при получении списка прикрепленных вакансий',
          'vacancies list loading'
        )
      )
      .finally(() => this.$emit('set-loading', false));
  },
  computed: {
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
    handleChange(name, val, form) {
      this.$set(form, name, val);
    },
    scrollTab() {
      const id = this.assessmentCollapse;
      const form = document.getElementById(`check-list-${id}`);
      if (!form) return;

      const button = document.getElementById(`button-${id}`);
      const formTop = form.getBoundingClientRect().top - form.offsetTop;
      const formHeight = form.offsetHeight;

      if (window.scrollY >= formTop && window.scrollY < formHeight) {
        if (button.classList.contains('relative')) {
          button.classList.remove('relative');
        }
        return;
      }

      button.classList.add('relative');
    },
    selectType(type) {
      return (
        type === ANSWER_TYPE.DROPDOWN_ANSWER ||
        type === ANSWER_TYPE.MULTIENUM_ANSWER
      );
    },
    setAssessmentCollapseTab(vacancy_id) {
      // расставить rules
      if (vacancy_id && !this.mainForm[vacancy_id] && !this.requestSent) {
        this.requestSent = true;
        this.$set(this.loading, vacancy_id, true);

        getController({
          params: {
            module: MODULE.IR_INTERVIEW_REPORT,
            action: ACTION.GET_IR_FIELDS_DATA,
            vacancy_id,
            candidate_id: this.candidateId,
            to_pdf: true,
            orderBy: 'question_type'
          }
        })
          .then(resp => {
            if (resp.data && !resp.data.error) {
              const { panels, current_date_format } = resp.data;
              // временная проработка упорядочивания разделов:
              const sectionsOrder = [
                QUESTION_TYPE.GENERAL,
                QUESTION_TYPE.MOTIVATION,
                QUESTION_TYPE.JOB_EXPERIENCE,
                QUESTION_TYPE.SKILLS_ASSESSMENT,
                QUESTION_TYPE.INTERVIEW_RESULTS
              ];
              const sortedPanels = [];
              sectionsOrder.forEach(section => {
                if (panels.hasOwnProperty(section)) {
                  sortedPanels.push({ ...panels[section], name: section });
                }
              });
              const data = !Array.isArray(resp.data)
                ? { ...resp.data, panels: sortedPanels } // потом убрать panels
                : {};
              const form = {};
              const radioForm = {
                // для radio вынужденное хранение верного формата value, иначе v-model с массивом не работает
                job_experience: {},
                answers: {}
              };
              const interview_results = {};
              const job_experience = {};

              if (current_date_format) {
                this.$set(
                  this.datepicker,
                  'dateFormat',
                  setDateFormat(current_date_format)
                );
              }

              for (let section in data.panels) {
                const sections = [
                  QUESTION_TYPE.JOB_EXPERIENCE,
                  QUESTION_TYPE.SKILLS_ASSESSMENT
                ];
                const sectionName = data.panels[section].name;
                if (
                  sections.includes(sectionName) &&
                  Object.keys(data.panels[section]).length > 1
                ) {
                  // обработка данных с одинаковой структурой в panels
                  const { rows, candidateJobsData, skillsData } =
                    data.panels[section];
                  const dataKey = candidateJobsData
                    ? 'job'
                    : skillsData
                    ? 'skill'
                    : 'data';
                  const objData = candidateJobsData || skillsData;
                  const dataIds = Object.keys(rows);
                  const fields = Object.values(rows);
                  const fieldsData = Array.from(fields, (field, idx) => {
                    if (candidateJobsData) {
                      this.$set(job_experience, dataIds[idx], {});
                      this.$set(radioForm.job_experience, dataIds[idx], {});
                    }

                    return Object.assign(
                      {},
                      {
                        ...field,
                        [dataKey]: {
                          id: dataIds[idx],
                          ...objData[dataIds[idx]]
                        }
                      }
                    );
                  });
                  this.$set(data.panels[section], 'rows', fieldsData);
                }

                if (Array.isArray(data.panels[section].rows)) {
                  const { name, rows } = data.panels[section];
                  rows.forEach(row => {
                    if (name === QUESTION_TYPE.INTERVIEW_RESULTS) {
                      const subfields = {};
                      row.fields.forEach(field => {
                        subfields[field.subtype] = field;
                        switch (field.subtype) {
                          case 'rate':
                            interview_results[field.name] = Number(field.value);
                            break;

                          case 'text':
                            interview_results[field.name] = this.formatHtml(
                              field.value
                            );
                            break;

                          default:
                            break;
                        }
                      });
                      this.$set(row, 'subfields', subfields);
                    } else {
                      row.fields.forEach(field => {
                        const {
                          answer_type,
                          answer_options,
                          question_id,
                          value
                        } = field;
                        // определяем путь к форме в зависимости от раздела
                        const localForm =
                          name === QUESTION_TYPE.JOB_EXPERIENCE
                            ? job_experience[row.job.id]
                            : form;
                        const localRadioForm =
                          name === QUESTION_TYPE.JOB_EXPERIENCE
                            ? radioForm.job_experience[row.job.id]
                            : radioForm.answers;

                        switch (answer_type) {
                          case ANSWER_TYPE.RATING_ANSWER:
                          case ANSWER_TYPE.SCALE_ANSWER:
                            localForm[question_id] = Number(value);
                            break;

                          case ANSWER_TYPE.TEXT_ANSWER:
                          case ANSWER_TYPE.LINE_ANSWER:
                            localForm[question_id] = this.formatHtml(value);
                            break;

                          case ANSWER_TYPE.OPTION_ANSWER:
                            localForm[question_id] = value[0] || '';
                            localRadioForm[question_id] = value;
                            break;

                          default:
                            localForm[question_id] = value;
                            break;
                        }

                        if (this.selectType(answer_type) && answer_options) {
                          const options = [];
                          for (let optKey in answer_options) {
                            options.push({
                              id: optKey,
                              name: this.formatHtml(answer_options[optKey])
                            });
                          }
                          this.options[question_id] = options;
                        }
                      });
                    }
                  });
                }
              }

              this.$set(this.mainForm, vacancy_id, {
                ...data,
                form,
                radioForm,
                job_experience,
                interview_results
              });
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при получении данных по оценке по выбранной вакансии',
              'assessment data loading'
            )
          )
          .finally(() => {
            this.$set(this.loading, vacancy_id, false);
            this.requestSent = false;
          });
      }
    },
    assessmentPerson(data) {
      const { lbl_text, value } = data;
      return `${lbl_text} ${value || ''}`;
    },
    asmRowWithBorderClass(field, sectionName) {
      return field.answer_type && sectionName !== QUESTION_TYPE.JOB_EXPERIENCE
        ? 'row--with-border'
        : '';
    },
    setAnswerValue(value, vacancyId, field, jobId) {
      const { question_id, answer_type } = field;
      const form = jobId
        ? this.mainForm[vacancyId].job_experience[jobId]
        : this.mainForm[vacancyId].form;
      const radioForm = jobId
        ? this.mainForm[vacancyId].radioForm.job_experience[jobId]
        : this.mainForm[vacancyId].radioForm.answers;

      switch (answer_type) {
        case ANSWER_TYPE.DATE_ANSWER:
        case ANSWER_TYPE.DATETIME_ANSWER:
          this.$set(form, question_id, value || '');
          break;

        case ANSWER_TYPE.OPTION_ANSWER:
          this.$set(radioForm, question_id, value ? [value] : []);
          break;

        default:
          this.$set(form, question_id, value);
          break;
      }
    },
    saveAssessmentForm(vacancyId) {
      this.$refs[vacancyId][0].validate((valid, fields) => {
        if (valid) {
          if (!this.requestSent) {
            this.requestSent = true;
            this.$set(this.loading, vacancyId, true);
            const data = this.mainForm[vacancyId];
            const {
              form,
              interview_report_id,
              radioForm,
              interview_results,
              job_experience
            } = data;
            const formData = new FormData();
            const params = {
              module: MODULE.IR_INTERVIEW_REPORT,
              action: ACTION.SAVE_IR_DATA,
              to_pdf: true,
              data: JSON.stringify({
                interview_report_id,
                answers: merge(form, radioForm.answers),
                job_experience: merge(job_experience, radioForm.job_experience),
                interview_results
              })
            };

            for (let key in params) {
              formData.set(key, params[key]);
            }

            postController({ options: formData })
              .then(() => {
                location.reload();
              })
              .catch(err =>
                this.catchError(
                  err,
                  'Возникла ошибка сохранения формы оценки',
                  'save assessment form'
                )
              )
              .finally(() => {
                this.requestSent = false;
                this.$set(this.loading, vacancyId, false);
              });
          }
        } else {
          console.log('error', fields);
        }
      });
    }
  },
  components: {
    AssessmentRow,
    'el-collapse': Collapse,
    'el-collapse-item': CollapseItem,
    Rating,
    'el-form': Form,
    Button,
    Input,
    Textarea
  }
};
</script>
