<template>
  <div class="photo-upload">
    <Upload
      v-if="!model"
      :accept="UPLOAD_ACCEPT_TYPE.IMAGE"
      :listType="'picture-card'"
      :disabled="disabled"
      name="photo_file"
      :file="file"
      :id="field.name"
      :limit="field.limit || 1"
    ></Upload>
    <div class="photo-block" v-if="model && hasActions">
      <img :src="uploadLink" alt="" width="198" height="200" />
      <Button
        buttonColor="transparent"
        buttonText=""
        iconName="delete"
        hasLeftIcon
        iconColor="#CDD4DA"
        :disabled="disabled"
        class="delete-photo"
        @click="removeCandidatePhoto"
      />
    </div>
  </div>
</template>

<script>
import { FIELD, UPLOAD_ACCEPT_TYPE } from '@/utils/constants';
import { store } from '@/store';
import { postController } from '@/controllers/request.js';
import { mixin } from '@/utils/mixins';
import Upload from './Upload';
import Button from 'Elements/Button/Button';
import './photo.scss';

export default {
  mixins: [mixin],
  props: {
    model: String,
    field: Object,
    file: Array,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      FIELD,
      UPLOAD_ACCEPT_TYPE
    };
  },
  computed: {
    hasActions() {
      const actions = this.field.actions;
      return Object.keys(actions).length || actions.length;
    },
    uploadLink() {
      return this.field.actions.link;
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
    removeCandidatePhoto() {
      if (!this.requestSent) {
        this.requestSent = true;
        postController({ url: this.field.actions.delete })
          .then(() => location.reload())
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при удалении фото кандидата',
              'photo remove'
            )
          )
          .finally(() => (this.requestSent = false));
      }
    }
  },
  components: { Upload, Button }
};
</script>

<style lang="scss" scoped>
.photo-upload {
  .el-upload--picture-card {
    width: auto;
    border: none;
  }

  .photo-block {
    width: 198px;
    height: 200px;

    &.el-button {
      .medium {
        height: 200px;
        align-content: center;
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .upload-area {
    & ::v-deep .el-upload {
      & > .el-upload-dragger {
        border: 1px solid #e9edf2 !important;
        border-radius: 4px; //12
        display: flex;
        width: 198px !important;
        height: 200px !important;
      }
    }
  }
}
</style>

<style lang="scss">
.photo-upload {
  .el-upload--picture-card {
    width: auto;
    border: none;
  }

  .upload-area {
    .uploaded {
      .el-upload-list__item {
        width: 96px;
        height: 96px;
        align-self: center;
        margin: 24px 51px;
      }
    }
  }
}
</style>
