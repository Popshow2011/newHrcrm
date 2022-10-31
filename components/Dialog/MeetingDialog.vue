<template>
  <el-dialog
    v-loading="formLoading"
    width="840px"
    ref="dialog"
    :title="title || dialogTitle"
    :visible="is_visible"
    :close-on-click-modal="false"
    @close="resetCallback"
    class="dialog meta-dialog meeting-dialog"
  >
    <div class="dialog__content">
      <MetadataForm
        :defaultParams="defaultParams"
        field-size="big"
        labelPosition="left"
        :noRequiredStar="true"
        @savedFormData="onSavedFormData"
        @reset-callback="resetCallback"
        @setFormLoading="value => (formLoading = value)"
        @select-vacancy="handleVacancyChange"
        @update-date="updateDate"
        @update-time="updateTime"
        @update-members="updateMembers"
        @add-member="setCurrentUser"
        @get-busy-slots="getEventUsers"
        @update-slots="updateSlotsByCalendar"
        class="meeting-form"
      >
        <template slot="bottom-content">
          <div class="members">
            <p class="members__title">Участники</p>

            <div class="members__top">
              <Search
                :query="query"
                :disabled-btn="!selectedMember"
                @search="search"
                :update-key="updateKey"
                @add-member="addMember"
                class="members__search"
              >
                <template #results>
                  <div
                    v-if="membersSearch && membersSearch.length"
                    class="members__search-results"
                  >
                    <div
                      v-for="item in membersSearch"
                      :key="item.id"
                      class="members__search-item"
                      @click="chooseMember(item)"
                    >
                      <p class="members__search-name primary">
                        {{
                          `${item.last_name || ''} ${item.first_name || ''} ${
                            item.middle_name || ''
                          }` | format
                        }}
                      </p>
                      <p class="members__search-email secondary fz-14">
                        {{ item.email || '' }}
                      </p>
                    </div>
                  </div>
                </template>
              </Search>
              <!-- Необходимо убрать чек-бокс «Помощник планирования» до момента релиза в систему его второго представления, чтобы он не вводил в заблуждение пользователей. -->
              <!-- <div class="members__helper">
                <label for="helper-switch" class="members__helper-label">
                  Помощник планирования</label
                >
                <Switcher
                  name="helper-switch"
                  :model="helperEnabled"
                  class="members__helper-switch"
                  id="helper-switch"
                  :disabled="true"
                />
              </div> -->
              <!-- Необходимо убрать чек-бокс «Помощник планирования» до момента релиза в систему его второго представления, чтобы он не вводил в заблуждение пользователей. -->
            </div>
            <div class="planner" v-loading="loading">
              <div class="planner__desc" ref="planner">
                <div class="planner__head">
                  <p
                    class="planner__head-text bgg-20 sticky"
                    :style="{ 'min-width': '184px' }"
                  >
                    Участники
                  </p>
                  <div class="planner__head-timeline">
                    <p class="planner__head-text">00:00</p>
                    <p class="planner__head-text">01:00</p>
                    <p class="planner__head-text">02:00</p>
                    <p class="planner__head-text">03:00</p>
                    <p class="planner__head-text">04:00</p>
                    <p class="planner__head-text">05:00</p>
                    <p class="planner__head-text">06:00</p>
                    <p class="planner__head-text">07:00</p>
                    <p class="planner__head-text">08:00</p>
                    <p class="planner__head-text">09:00</p>
                    <p class="planner__head-text">10:00</p>
                    <p class="planner__head-text">11:00</p>
                    <p class="planner__head-text">12:00</p>
                    <p class="planner__head-text">13:00</p>
                    <p class="planner__head-text">14:00</p>
                    <p class="planner__head-text">15:00</p>
                    <p class="planner__head-text">16:00</p>
                    <p class="planner__head-text">17:00</p>
                    <p class="planner__head-text">18:00</p>
                    <p class="planner__head-text">19:00</p>
                    <p class="planner__head-text">20:00</p>
                    <p class="planner__head-text">21:00</p>
                    <p class="planner__head-text">22:00</p>
                    <p class="planner__head-text">23:00</p>
                  </div>
                </div>
                <div
                  class="planner__member"
                  v-for="member in members"
                  :key="member.id || member.email"
                >
                  <div class="planner__member-wrapper bgg-20 sticky">
                    <div class="planner__member-info">
                      <div class="flex-row">
                        <Icon
                          v-if="member.decision"
                          :iconName="reactionPicture(member.decision)"
                        />
                        <p class="planner__member-text planner__member-name">
                          {{
                            `${member.last_name || ''} ${
                              member.first_name
                                ? member.first_name[0] + '.'
                                : ''
                            }${
                              member.middle_name
                                ? member.middle_name[0] + '.'
                                : ''
                            }` | format
                          }}
                        </p>
                      </div>
                      <p
                        v-if="member.role"
                        class="planner__member-text planner__member-job"
                      >
                        {{ member.role | format }}
                      </p>
                      <span
                        class="planner__member-close"
                        @click="removeMember(member)"
                      >
                        <Icon iconName="close" iconColor="#CDD4DA" />
                      </span>
                    </div>
                  </div>

                  <div
                    class="planner__member-time"
                    v-if="
                      member.email && typeof eventList[member.email] != 'string'
                    "
                  >
                    <Planner
                      v-if="eventList[member.email]"
                      :taken-slots="eventList[member.email]"
                      :selected-slots="selectedTimePeriod"
                      :key="keyValue"
                    />
                  </div>
                  <div
                    v-else-if="typeof eventList[member.email] == 'string'"
                    class="planner__member-error fz-14 secondary brs-4"
                  >
                    <!-- {{ eventList[member.email] }} -->
                    Нет доступа к календарю пользователя.
                  </div>

                  <div
                    v-else-if="!member.email"
                    class="planner__member-error fz-14 secondary brs-4"
                  >
                    Сотрудник не указал почту в профиле в TalentForce.<br />
                    Вы можете найти участника через поиск по имени или почте.
                  </div>
                  <!-- <div
                    v-else-if="member.errorMessage"
                    class="planner__member-error fz-14 secondary brs-4"
                  >
                    Нет доступа к календарю пользователя.
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div class="email">
            <div
              :class="['email__switcher', { 'bottom-border': showEmailForm }]"
            >
              <Switcher
                :model="showEmailForm"
                @switch="val => (this.showEmailForm = val)"
              />
              <p class="email__switcher--label">
                Отправить E-mail после создания встречи
              </p>
            </div>
            <div class="email__form" v-show="showEmailForm">
              <EmailForm />
            </div>
          </div>
        </template>
      </MetadataForm>
    </div>
  </el-dialog>
</template>

<script>
import { MODULE } from '@/utils/constants';
import { store } from '@/store';
import isEqual from 'lodash/isEqual';
import { mixin, errorMsg } from '@/utils/mixins';
import { getController, postController } from '@/controllers/request';
import { Dialog } from 'element-ui';
import MetadataForm from './MetadataForm';
import Switcher from 'Elements/Switch/Switch';
import Search from 'Elements/Search/InstantSearch';
import Planner from 'Elements/Planner/TimePlanner';
import Icon from 'Elements/Icon/Icon';
import EmailForm from 'Elements/MetaData/EmailForm';

export default {
  mixins: [mixin, errorMsg],
  props: {
    title: {
      type: String,
      default: ''
    },
    data: Object
  },
  data() {
    return {
      defaultParams: {
        module: MODULE.HRPAC_EVENT,
        action: 'EventSave',
        'fields[id]': this.data?.id?.value || '',
        event_id: this.data?.id?.value || '',
        hrpac_candidate_id: this.data?.hrpac_candidate_id?.value || '',
        assigned_users_ids: [],
        assigned_users_emails: [],
        jsqon_return: 1,
        to_pdf: true
      },
      calendarType: this.data?.calendar_type?.value || '',
      dialogTitle: this.data?.id?.value ? 'Изменить встречу' : 'Новая встреча',
      formLoading: true,
      helperEnabled: true,
      members: [],
      query: null,
      membersSearch: [],
      eventList: {},
      eventDate: '',
      selectedStartTime: '00:00',
      selectedEndTime: '00:00',
      keyValue: 0,
      vacancyUsers: {
        userIds: [],
        userEmails: []
      },
      currentUser: {},
      initialMembers: [],
      showEmailForm: false,
      updateKey: 0,
      loading: false
    };
  },
  mounted() {
    if (this.data) {
      const { date_start, date_end, date_event } = this.data;

      if (date_start?.value) {
        this.selectedStartTime = date_start.value.split(' ')[1];
      }
      if (date_end?.value) {
        this.selectedEndTime = date_end.value.split(' ')[1];
      }

      if (date_event?.value) {
        this.eventDate = date_event.value || date_start.value.split(' ')[0];
      }
    }

    this.$refs.dialog.$el.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.search') || !this.membersSearch.length) return;

        this.membersSearch = [];
        this.query = null;
        this.selectedMember = null;
      }.bind(this)
    );

    this.$nextTick(
      () =>
        (this.$refs.planner.scrollLeft +=
          this.$refs.planner.offsetWidth / 2 + 180)
    );
  },
  computed: {
    is_visible() {
      return store.state.common.visible_dialog.create_event_dialog;
    },
    vacancies() {
      return store.state.candidate.vacancyData.map(v => {
        return {
          id: v.vacancy_id,
          name: v.vacancy_data.name_id
        };
      });
    },
    selectedTimePeriod() {
      if (this.selectedStartTime && this.selectedEndTime) {
        const startHour = this.selectedStartTime.split(':')[0];
        const startMinutes = this.selectedStartTime.split(':')[1];
        const endHour = this.selectedEndTime.split(':')[0];
        const endMinutes = this.selectedEndTime.split(':')[1];
        const timePeriod = {
          start: this.selectedStartTime,
          end: this.selectedEndTime
        };
        return startHour == endHour
          ? startMinutes == endMinutes || startMinutes > endMinutes
            ? null
            : timePeriod
          : startHour < endHour
          ? timePeriod
          : null;
      } else return null;
    }
  },
  watch: {
    selectedTimePeriod() {
      this.keyValue++;
    }
  },
  methods: {
    reactionPicture(i) {
      return i == 'accept'
        ? 'done'
        : i == 'unknown'
        ? 'questionMark'
        : i == 'tentative'
        ? 'sandClock'
        : i == 'decline'
        ? 'error'
        : '';
    },
    handleValueChange(name, val) {
      this.$set(this.form, name, val);
    },
    updateDate(date) {
      this.eventDate = date;
      this.getEventList();
    },
    updateTime(name, val) {
      switch (name) {
        case 'date_start':
          this.selectedStartTime = val;
          break;
        case 'date_end':
          this.selectedEndTime = val;
          break;
      }
    },
    updateSlotsByCalendar(calendarType) {
      this.calendarType = calendarType;
      this.getEventList();
    },
    async getEventUsers(data) {
      this.loading = true;
      this.eventDate = data?.date_event;
      this.calendarType = data?.calendar_type;
      if (!this.defaultParams.event_id) return;

      const params = {
        module: MODULE.HRPAC_EVENT,
        action: 'GetEventAssignedUsers',
        event_id: this.defaultParams.event_id,
        to_pdf: true
      };

      try {
        const resp = await getController({ params });
        await this.updateUserData(resp.data);
        this.initialMembers = this.members.slice();
      } catch (error) {
        store.dispatch('common/catchError', {
          error: error,
          msg: error,
          action: 'Ошибка загрузки списка участников'
        });
        this.loading = false;
      }
    },
    updateMembers(user = {}) {
      // if (user.id) {
      //   this.vacancyUsers.userIds.push(user);
      // }

      // if (user.email && !user.id) {
      //   this.vacancyUsers.userEmails.push(user);
      // }
      this.currentUser = { ...user };
    },
    async handleVacancyChange(vacancy_id) {
      this.loading = true;
      const params = {
        module: MODULE.HRPAC_EVENT,
        action: 'GetVacancyAssignedUsers',
        vacancy_id,
        to_pdf: true
      };

      try {
        const resp = await getController({ params });
        await this.updateUserData(resp.data);
      } catch (error) {
        store.dispatch('common/catchError', {
          error: error,
          msg: error,
          action: 'Ошибка загрузки списка участников'
        });
      }
    },
    updateUserData(newData) {
      const userIds = [];
      const userEmails = [];

      newData.forEach(item => {
        const isAddedUser = this.members.some(
          ({ id }) => item.id && id === item.id
        );

        return !!item.id && !isAddedUser
          ? userIds.push(item)
          : item.email && !item.id
          ? userEmails.push(item)
          : null;
      });
      this.$set(
        this.defaultParams,
        'assigned_users_ids',
        this.defaultParams.assigned_users_ids.filter(
          id =>
            !this.vacancyUsers.userIds.some(data => data.id === id) ||
            this.currentUser.id === id
        )
      );
      this.$set(
        this.defaultParams,
        'assigned_users_emails',
        this.defaultParams.assigned_users_emails.filter(
          email =>
            !this.vacancyUsers.userEmails.some(data => data.email === email)
        )
      );
      const members = this.members.filter(
        ({ id /* , email */ }) =>
          !this.vacancyUsers.userIds.some(data => data.id === id) ||
          // && !this.vacancyUsers.userEmails.some(data => data.email === email))
          this.currentUser.id === id
      );

      this.$set(this.defaultParams, 'assigned_users_ids', [
        ...new Set([
          ...this.defaultParams.assigned_users_ids,
          ...userIds
            .filter(({ id }) => this.currentUser.id !== id)
            .map(({ id }) => id)
        ])
      ]);
      this.$set(this.defaultParams, 'assigned_users_emails', [
        ...new Set([
          ...this.defaultParams.assigned_users_emails,
          ...userEmails
            .filter(({ in_system }) => !in_system)
            .map(({ email }) => email)
        ])
      ]);
      this.vacancyUsers = { userIds, userEmails };
      this.members = [
        ...members,
        ...newData.filter(
          ({ id, email }) =>
            userIds.find(u => u.id == id) ||
            userEmails.find(u => u.email == email)
        )
      ];

      if (newData.length) {
        this.getEventList(newData);
      } else {
        this.loading = false;
      }
    },
    async getEventList(list = null) {
      this.loading = true;
      const formData = new FormData();
      const params = {
        module: MODULE.HRPAC_EVENT,
        action: 'GetBusySlots',
        date: this.eventDate,
        calendar_type: this.calendarType,
        to_pdf: true
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }

      (list || this.members).forEach(member => {
        if (member.email) {
          formData.append('assigned_users_emails[]', member.email);
        }
      });

      try {
        const resp = await postController({ options: formData });

        for (let email in resp.data) {
          if (!email) return;

          if (!resp.data[email].data && resp.data[email].message) {
            // ErrorMailRecipientNotFound
            // store.dispatch('common/catchError', {
            //   error: resp.data[email].code,
            //   msg: resp.data[email].message,
            //   action: 'Ошибка загрузки списка слотов'
            // });
            // return;
            this.$set(this.eventList, email, resp.data[email].message);
            this.members[
              this.members.indexOf(this.members.find(el => el.email == email))
            ]['errorMessage'] = resp.data[email].message;
          }

          if (resp.data[email]?.data) {
            const events = resp.data[email].data.events
              // .filter(event => !!event.result)
              .map(e => ({
                start: e.date_start
                  .split(' ')[1]
                  .split(':')
                  .slice(0, 2)
                  .join(':'),
                end: e.date_end.split(' ')[1].split(':').slice(0, 2).join(':')
              }));
            this.$set(this.eventList, email, events);
            this.keyValue++;
          }
        }
      } catch (error) {
        store.dispatch('common/catchError', {
          error: error,
          msg: error,
          action: 'Ошибка загрузки списка событий'
        });
      } finally {
        this.loading = false;
      }
    },
    async search(query) {
      if (this.query === query) return;
      if (!query) {
        this.membersSearch = [];
        this.selectedMember = null;
        this.updateKey++;
        return;
      }

      this.query = query;

      try {
        const resp = await getController({
          params: {
            module: MODULE.HRPAC_EVENT,
            action: 'SearchUser',
            calendar_type: this.calendarType,
            search_string: this.query,
            to_pdf: 1
          }
        });

        if (resp.data && Array.isArray(resp.data)) {
          if (resp.data.length == 0) {
            const regexp = /\S+@\S+\.\S+/;
            // const regexp =
            //   /^[a-zA-Z]+(\d|.|\w)*@[a-zA-Z]+.[a-zA-Z]+.*[a-zA-Z]+$/;

            if (!regexp.test(this.query)) {
              console.error('Введен некорректный email');
              this.selectedMember = null;
            } else {
              this.selectedMember = {
                email: this.query,
                in_system: false,
                last_name: this.query
              };
            }
            this.updateKey++;
          } else {
            this.membersSearch = resp.data.filter(
              s =>
                !this.members.some(
                  ({ id, email }) =>
                    (s.id && id === s.id) || (s.email && email === s.email)
                )
            );
          }
          return;
        } else if (!resp.data.result && resp.data.error) {
          store.dispatch('common/catchError', {
            error: resp.data.error,
            msg: resp.data.error,
            action: 'Ошибка поиска и добавления участника'
          });
        }
      } catch (error) {
        store.dispatch('common/catchError', {
          error,
          msg: error,
          action: 'Ошибка поиска и добавления участника'
        });
      }
    },
    chooseMember(member) {
      this.query = this.formatHtml(
        `${member.last_name || ''} ${member.first_name || ''} ${
          member.middle_name || ''
        }`
      );
      this.selectedMember = member;
      this.membersSearch = [];
    },
    updateTitle(val) {
      if (val) this.dialogTitle = val;
    },
    setCurrentUser(member) {
      this.addMember(member);
      this.initialMembers = this.members.slice();
    },
    addMember(member = null) {
      this.$nextTick(() => {
        if (
          this.selectedStartTime === '00:00' &&
          this.selectedEndTime === '00:00'
        ) {
          const dateFields = document.querySelectorAll(
            'input[name="date_start"], input[name="date_end"]'
          );
          this.selectedStartTime = dateFields[0].value;
          this.selectedEndTime = dateFields[1].value;
        }
      });

      const queryResult = this.selectedMember || member;
      const isAddedUser = this.members.some(
        ({ id /* , email */ }) => queryResult.id && id === queryResult.id
        /* || (queryResult.email && email === queryResult.email) */
      );

      if (!isAddedUser) {
        this.members.push(queryResult);
        this.getEventList([queryResult]);
        if (
          queryResult.id &&
          !this.defaultParams.assigned_users_ids.includes(queryResult.id)
        ) {
          this.defaultParams.assigned_users_ids.push(queryResult.id);
        }
        if (
          queryResult.email &&
          !queryResult.id &&
          !queryResult.in_system &&
          !this.defaultParams.assigned_users_emails.includes(queryResult.email)
        ) {
          this.defaultParams.assigned_users_emails.push(queryResult.email);
        }
      }
      this.query = null;
      this.selectedMember = null;
    },
    removeMember(member) {
      this.members.splice(
        this.members.findIndex(
          ({ id /* , email */ }) =>
            id && id == member.id /* || (email && !email == member.email) */
        ),
        1
      );
      this.$delete(this.eventList, member.email);
      this.$set(
        this.defaultParams,
        'assigned_users_ids',
        this.defaultParams.assigned_users_ids.filter(id => id !== member.id)
      );
      if (!member.email) return;
      this.$set(
        this.defaultParams,
        'assigned_users_emails',
        this.defaultParams.assigned_users_emails.filter(
          email => email !== member.email
        )
      );
    },
    onSavedFormData() {
      if (!this.defaultParams.event_id) {
        this.showFullNotification({
          title: 'Встреча запланирована',
          message: 'Ответы от участников будут направлены на вашу почту',
          type: 'success'
        });
      }
      this.$emit('reset-callback');
      location.reload();
    },
    resetCallback() {
      if (!this.$refs.dialog?.$children) return this.$emit('reset-callback');

      const form = this.$refs.dialog?.$children[0].form;
      const initialForm = this.$refs.dialog?.$children[0].initialForm;

      if (
        this.$refs.dialog?.$children[0] &&
        (!isEqual(initialForm, form) ||
          !isEqual(this.initialMembers, this.members))
      ) {
        const params = {
          title: 'Закрыть форму?',
          text: 'Данные формы будут утеряны, а встреча не сохранена',
          buttons: [
            {
              id: 'cancel',
              name: 'Нет',
              color: 'darkBlue',
              reset: false
            },
            {
              id: 'close',
              name: 'Да',
              color: 'blue',
              reset: true,
              callback: () => this.$emit('reset-callback')
            }
          ]
        };
        this.$emit('confirm-close', params);
      } else this.$emit('reset-callback');
    }
  },
  components: {
    'el-dialog': Dialog,
    MetadataForm,
    Switcher,
    Search,
    Planner,
    Icon,
    EmailForm
  }
};
</script>

<style lang="scss" scoped>
#front .dialog {
  &__content {
    & ::v-deep .el-form-item.textarea {
      padding-left: 131px;
    }
  }

  & ::v-deep .el-dialog {
    padding: 0;

    & > .el-dialog__header {
      & > .el-dialog__title {
        font-family: 'Roboto Medium';
        font-size: 18px !important;
        line-height: 28px !important;
      }

      button {
        height: 24px;
      }
    }

    .el-dialog__footer {
      margin: 0 !important;
    }
  }
}

.meeting-form {
  & ::v-deep .el-form-item__label {
    font-size: 15px;
  }

  & ::v-deep .el-date-editor:not(.timepicker) input {
    width: 160px;
  }

  & ::v-deep .form-field {
    &:first-child:not(:only-child) {
      display: flex;
      flex: 3;
    }

    &:not(:first-child) {
      display: flex;
      flex: 1;
    }
  }

  & ::v-deep .ck-editor__editable_inline {
    padding-top: 12px !important;

    p {
      margin: 0;
    }
  }
}

.sticky {
  position: sticky;
  left: 0;
}

.bgg-20 {
  background: $black-20;
}

.members {
  background: $black-20;
  border-radius: 4px;
  padding: 20px 16px 0 16px;
  margin-top: 24px;
  text-align: left;

  &__title {
    font-family: 'Roboto Medium';
    font-size: 16px;
    line-height: 24px;
    font-weight: 700;
    color: $black-200;
  }

  &__top {
    margin-top: 12px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__helper {
    &-label {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      color: $black-100;
      margin: 0 12px 0 0;
      cursor: pointer;
    }

    &-switch {
      line-height: 24px;
      height: 24px;
    }
  }

  &__search {
    padding: 0;
    margin: 0;

    &-item {
      width: 100%;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 300ms;

      &:hover {
        background-color: $blue-10;
      }
    }

    &-name {
      font-size: 15px;
      line-height: 24px;
    }
  }
}

.planner {
  margin-top: 20px;

  &__desc {
    overflow: auto;
  }

  &__head {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 4px;
    margin-bottom: 4px;
    width: 1200px;

    &-text {
      color: $black-100;
      min-width: 61px;
    }

    &-timeline {
      display: flex;
      margin-left: 8px;
    }
  }

  &__member {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 4px;
    margin-bottom: 4px;
    width: 1200px;
    position: relative;

    & ::v-deep .el-loading-mask {
      // left: 180px;
      width: 1600px;
    }

    &:last-child {
      margin-bottom: 11px;
    }

    &-wrapper {
      width: 184px;
    }

    &-info {
      box-shadow: 0px 1px 4px rgba(33, 39, 44, 0.09);
      border-radius: 4px;
      background-color: #fff;
      padding: 12px;
      width: 180px;
      text-align: start;
      position: relative;

      .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 4px;
      }
    }

    &-text {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      word-break: break-word;
    }

    &-name {
      color: $black-200;
      margin-left: 4px !important;
    }

    &-job {
      color: $black-100;
      margin-top: 4px;
    }

    &-close {
      position: absolute;
      right: 12px;
      top: 10px;
      cursor: pointer;
    }

    &-error {
      // margin-left: 184px;
      // width: 184px;
      // position: fixed;
      // margin-top: -100px;
      // left: 195px;
      // position: sticky;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 1480px;
      background-color: $black-10;
    }
  }
}

.email {
  display: flex;
  flex-direction: column;
  background-color: $black-10;
  border-radius: 4px;
  margin-top: 8px;
  padding: 16px;

  &__switcher {
    display: flex;
    gap: 20px;
    align-items: center;

    &.bottom-border {
      padding-bottom: 16px;
      border-bottom: 1px solid $black-30;
    }

    &--label {
      color: $black-200;
      font-size: 16px;
      line-height: 24px;
    }
  }

  &__form {
    margin-top: 16px;
  }
}
</style>
