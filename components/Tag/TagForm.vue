<template>
  <div class="tag-box">
    <Tag
      v-for="{ tag_id, tag_name } in candidateTags"
      :key="tag_id"
      :id="tag_id"
      :name="tag_name"
      :effect="hasMyTag(tag_id) ? 'dark' : 'light'"
      @close="removeTag($event, tag_id)"
    />
    <span
      class="el-tag new-tag"
      v-if="tagFormVisible"
      ref="newTag"
      @click="focus"
    >
      <div class="new-tag__area">
        <div
          ref="input"
          class="new-tag__area-input"
          type="text"
          contenteditable
          autofocus
          @input="input($event)"
          @focus="focus"
        ></div>
        <i class="el-tag__close el-icon-close" @click="clear"></i>
      </div>
    </span>
    <div
      v-if="tagFormVisible && tagForm.tag_name && focused"
      v-loading="loading"
      ref="tagsPopper"
      class="el-select-dropdown el-popper tags-popper"
    >
      <div v-if="visibleTagBtn" class="add-tag-btn">
        <el-radio-group v-model="tagForm.my_tag" @change="createTag">
          <el-radio label="0">Общий тег</el-radio>
          <el-radio label="1">Личный тег</el-radio>
        </el-radio-group>
      </div>
      <div
        v-for="{ id, name, my_tag } in filterList"
        :key="id"
        :label="name"
        :value="id"
        class="el-select-dropdown__item"
        @click="selectTag(id)"
      >
        <span :class="Number(my_tag) ? 'my-tag-el' : ''">
          {{ name }}
        </span>
      </div>
      <p slot="empty" class="el-select-dropdown__empty">
        {{ noTagMatches }}
      </p>
    </div>
    <form v-show="false" id="tagForm">
      <input
        v-for="(val, key) in tagParams"
        :key="key"
        type="hidden"
        :name="key"
        :value="val"
      />
      <input
        v-if="tagAction === ACTION.ADD_TAG_TO_CANDIDATE"
        type="hidden"
        name="candidate_id"
        :value="candidateId"
      />
      <input
        v-if="tagAction === ACTION.ADD_TAG_TO_CANDIDATE"
        type="hidden"
        name="tag_id[]"
        :value="tagForm.tag_id"
      />
      <input
        v-if="tagAction === ACTION.CREATE_TAG"
        type="hidden"
        name="tag_name"
        :value="tagForm.tag_name"
      />
      <input
        v-if="tagAction === ACTION.CREATE_TAG"
        type="hidden"
        name="my_tag"
        :value="tagForm.my_tag"
      />
    </form>
  </div>
</template>

<script>
import { store } from '@/store';
import { RadioGroup, Radio } from 'element-ui';
import { getController, postController } from '@/controllers/request.js';
import { MODULE, ACTION } from '@/utils/constants';
import { mixin } from '@/utils/mixins';
import Tag from 'Elements/Tag/Tag';
import './tag.scss';

export default {
  mixins: [mixin],
  props: {
    candidateId: String,
    options: Array
  },
  data() {
    return {
      ACTION,
      visibleTagBtn: false,
      tagParams: {
        module: MODULE.HRPAC_TAGS,
        jsqon_return: 1,
        to_pdf: true
      },
      tags: [],
      candidateTags: [],
      tagForm: {},
      tagAction: '',
      loading: false,
      focused: false,
      filterList: []
    };
  },
  created() {
    this.tags = [...this.options];
    getController({
      params: {
        module: this.tagParams.module,
        action: ACTION.GET_CANDIDATE_TAGS,
        candidate_id: this.candidateId,
        jsqon_return: 1,
        to_pdf: true
      }
    })
      .then(resp => (this.candidateTags = [...resp.data]))
      .catch(err =>
        this.catchError(
          err,
          'Возникла ошибка загрузки списка тегов кандидата',
          'get candidate tags'
        )
      );
  },
  mounted() {
    document.addEventListener(
      'click',
      function(e) {
        if (!this.tagFormVisible) return;
        if (e.target.closest('.new-tag')) return;

        if (
          !e.path.filter(
            el => el.className == 'el-select-dropdown el-popper tags-popper'
          ).length
        ) {
          this.focused = false;
        }
      }.bind(this)
    );
  },
  computed: {
    noTagMatches() {
      return !this.filterList.length && this.tags.length
        ? 'Не найдено...'
        : !this.tags.length
        ? 'Справочник пуст'
        : '';
    },
    tagFormVisible() {
      return store.state.candidate.visible.tagForm || false;
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
    sortedListByAZ(list = []) {
      return list.sort((a, b) => a.tag_name.localeCompare(b.tag_name));
    },
    addTag() {
      if (this.tagForm.tag_id && !this.requestSent) {
        this.requestSent = true;
        const form = document.getElementById('tagForm');
        const formData = new FormData(form);
        formData.set('action', this.tagAction);
        postController({ options: formData })
          .then(resp => {
            if (resp.data && !resp.data.error) {
              const tag = this.tags.find(
                ({ id }) => id === this.tagForm.tag_id
              );
              const addedTag = {
                tag_id: tag.id,
                tag_name: tag.name,
                my_tag: tag.my_tag
              };
              this.candidateTags.push(addedTag);
              this.tagForm = {};
              store.commit('candidate/setVisibleElem', {
                elem: 'tagForm',
                visible: false
              });
            } else throw 'Возникла ошибка при добавлении тегов';
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при добавлении тегов',
              'add tag'
            )
          )
          .finally(() => {
            this.loading = false;
            this.tagAction = '';
            this.requestSent = false;
            this.focused = false;
          });
      }
    },
    createTag() {
      this.tagAction = ACTION.CREATE_TAG;
      if (!this.requestSent && this.tagForm.tag_name) {
        this.requestSent = true;
        this.loading = true;
        const form = document.getElementById('tagForm');
        const formData = new FormData(form);
        formData.set('action', this.tagAction);

        postController({ options: formData })
          .then(resp => {
            if (resp.data && !resp.data.error) {
              const id = resp.data[0].tag_id;
              const newTag = {
                id,
                my_tag: this.tagForm.my_tag,
                name: this.tagForm.tag_name
              };
              this.tags.push(newTag);
              this.$set(this.tagForm, 'tag_id', id);
              this.$set(this.tagForm, 'tag_name', '');
              this.$set(this.tagForm, 'my_tag', '');
              this.visibleTagBtn = false;
              this.requestSent = false;
              this.tagAction = ACTION.ADD_TAG_TO_CANDIDATE;
              this.$nextTick(() => this.addTag());
            } else throw 'Возникла ошибка при создании тега';
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при создании тега',
              'create tag'
            )
          )
          .finally(() => {
            this.tagAction = '';
            this.requestSent = false;
          });
      }
    },
    removeTag(e, id) {
      if (!this.requestSent) {
        this.requestSent = true;
        this.tagAction = ACTION.REMOVE_TAG_FROM_CANDIDATE;

        if (id) {
          const formData = new FormData();
          const el = e.target.closest('.el-tag');
          const loader = `<div class="el-loading-spinner"><svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg></div>`;

          el.innerHTML += loader;
          formData.set('action', this.tagAction);
          formData.set('candidate_id', this.candidateId);
          formData.set('tag_id', id);

          for (let key in this.tagParams) {
            formData.set(key, this.tagParams[key]);
          }

          postController({ options: formData })
            .then(resp => {
              if (resp.data && !resp.data.error) {
                this.candidateTags = this.candidateTags.filter(
                  ({ tag_id }) => tag_id !== id
                );
                this.$set(this.tagForm, 'tag_id', '');
              } else throw 'Возникла ошибка при удалении тега';
            })
            .catch(err =>
              this.catchError(
                err,
                'Возникла ошибка при удалении тега',
                'remove tag'
              )
            )
            .finally(() => {
              this.requestSent = false;
              this.tagAction = '';
            });
        }
      }
    },
    hasMyTag(tagId) {
      return (
        this.tags.filter(({ id, my_tag }) => id === tagId && Number(my_tag))
          .length > 0
      );
    },
    handleChangeTag(e) {
      this.tagAction = ACTION.CREATE_TAG;
      const query = !this.tags.find(({ name }) => name === e.target.innerHTML);
      this.visibleTagBtn = e.target.innerHTML ? query : false;
    },
    filter(e) {
      this.filterList = this.tags.filter(
        tag =>
          tag.name.toLowerCase().indexOf(e.target.innerHTML.toLowerCase()) >
            -1 && !this.candidateTags.some(({ tag_id }) => tag_id === tag.id)
      );
      this.calcPopperCoords();
    },
    input(e) {
      this.focused = true;
      this.$set(this.tagForm, 'tag_name', e.target.innerHTML);
      this.handleChangeTag(e);
      this.filter(e);
    },
    focus() {
      this.focused = true;
      this.calcPopperCoords();
    },
    selectTag(id) {
      this.loading = true;
      this.tagAction = ACTION.ADD_TAG_TO_CANDIDATE;
      this.$set(this.tagForm, 'tag_id', id);
      this.$nextTick(() => this.addTag());
    },
    clear() {
      this.focused = false;
      this.tagAction = '';
      this.tagForm = {};
      store.commit('candidate/setVisibleElem', {
        elem: 'tagForm',
        visible: false
      });
    },
    calcPopperCoords() {
      this.$nextTick(() => {
        const newTag = this.$refs.newTag;
        const popper = this.$refs.tagsPopper;
        if (!popper) return;
        popper.style = 'left:' + newTag.offsetLeft + 'px';
      });
    },
    addIndentToTags() {
      const tagsEl = $('.tag-box .el-tag');
      tagsEl.each((index, el) => {
        el.classList.remove('el-tag--marginTop');
        if (
          index !== 0 &&
          el.getBoundingClientRect().y > tagsEl[0].getBoundingClientRect().y
        ) {
          el.classList.add('el-tag--marginTop');
        } else {
          el.classList.remove('el-tag--marginTop');
        }
      });
    }
  },
  updated() {
    this.addIndentToTags();
  },
  watch: {
    'candidateTags.length': function() {
      this.candidateTags = [...this.sortedListByAZ(this.candidateTags)];

      if (this.tagAction === ACTION.REMOVE_TAG_FROM_CANDIDATE) {
        setTimeout(() => {
          this.calcPopperCoords();
          this.addIndentToTags();
        }, 400);
      }
    },
    tagFormVisible: function() {
      if (this.tagFormVisible) {
        this.$nextTick(() => this.$refs.input.focus());
      }
    }
  },
  unmounted() {
    document.removeEventListener('click');
  },
  components: {
    Tag,
    'el-radio-group': RadioGroup,
    'el-radio': Radio
  }
};
</script>

<style lang="scss">
.tag-box {
  margin: 24px 0;

  .el-tag {
    &:not(:last-of-type) {
      margin-right: 12px;
    }

    &:last-of-type {
      margin-right: 0;
    }
  }
}

.tag-box .new-tag {
  background: $black-10;
  border: 1px solid $black-30;
  padding: 4px 12px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 4px;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  font-size: 16px;
  line-height: 24px;
  display: inline-block;
  vertical-align: bottom;

  &__area {
    display: flex;
    align-items: center;

    &-input {
      outline: none;
      color: $black-200;
      min-width: 10px;
    }
  }

  & > input {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    overflow: hidden;
    max-width: calc(100% - 16px);
  }

  .el-tag__close {
    color: $black-80;
  }

  .el-icon-close:hover {
    background: transparent;
    color: $blue-80;
  }

  &.el-tag--marginTop {
    margin-top: 10px;
  }
}

.tag-box .new-tag > input {
  width: 10px;
  height: 100% !important;
  background: inherit;
  border: none !important;
  padding: 0 !important;
}

.el-select-dropdown.el-popper.tags-popper {
  margin: 0;
  border: 1px solid $black-20;
  border-radius: 4px;
  box-shadow: 0px 7px 9px rgba(0, 0, 0, 0.04);
  min-width: 279px !important;
  max-height: 350px;
  overflow: auto;

  .el-radio__inner:after {
    height: 8px;
    width: 8px;
  }

  .add-tag-btn {
    height: 48px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .el-radio {
      height: 24px;

      &:not(:last-child) {
        margin-right: 20px;
      }
    }

    .el-radio__label {
      display: inline-block;
      vertical-align: middle;
      height: 24px;
      margin-left: 10px;
      font-size: 16px;
      line-height: 24px;
      color: $black-190;

      &:hover {
        border: none;
      }
    }

    .el-radio__input {
      vertical-align: middle;
      // padding: 2px;
      text-align: center;

      &.is-checked .el-radio__inner {
        background: $blue-120;
        border-color: $blue-120;
      }

      &.is-checked + .el-radio__label {
        color: $black-190;
      }
    }

    .el-radio__inner {
      width: 20px;
      height: 20px;
      border: 1px solid $black-40;
      display: inline-block;
      vertical-align: middle;
    }
  }

  .el-select-dropdown__empty {
    color: $black-60;
  }

  .el-select-dropdown__item {
    height: 40px;
    line-height: 40px;
    padding: 0 16px;

    span {
      font-size: 15px;
      color: $black-190;
      background: inherit;
    }
  }
}
</style>
