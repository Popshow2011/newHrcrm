<template>
  <div class="documents__list">
    <DocumentRow
      v-for="(doc, i) in documents"
      :key="doc.link"
      :index="i"
      :document="doc"
      :details-text="
        detailsType == 'created_by'
          ? `${doc.created_by_name.value} добавил(а)
          ${doc.active_date ? doc.active_date.value : ''}`
          : detailsType == 'size'
          ? fileSize(doc)
          : ''
      "
      :document-link="`/index.php?entryPoint=download&id=${doc.id.value}&type=${module}`"
      :document-name="doc.filename.value"
      :allow-remove="
        allowRemove ? allowRemove : userId === doc.created_by.value
      "
      @delete-file="deleteFile"
    />
    <!-- <div class="documents__empty" v-if="!documents.length">
      Документы еще не были загружены
    </div> -->
  </div>
</template>
<script>
import DocumentRow from './DocumentRow';
export default {
  components: { DocumentRow },
  props: {
    documents: {
      type: [Array, Object],
      default: () => []
    },
    userId: {
      type: String
    },
    allowRemove: {
      type: Boolean,
      default: false
    },
    module: {
      type: String,
      default: 'Documents'
    },
    detailsType: {
      type: String,
      default: 'created_by'
    }
  },
  methods: {
    deleteFile(value) {
      this.$emit('deleteFile', value);
    },
    fileSize(file) {
      return file.filesize && file.filesize.value
        ? Number(file.filesize.value / 1024 / 1024).toFixed(2) + ' Мб'
        : '0 Мб';
    }
  }
};
</script>
<style lang="scss" scoped>
.documents__list {
  padding-top: 20px;
}
</style>
