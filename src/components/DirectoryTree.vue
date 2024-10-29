<template>
  <ul>
    <li v-for="item in tree" :key="item.path">
      <div @click="handleItemClick(item)">
        <span v-if="item.type === 'directory'">📁</span>
        <span v-else>📄</span>
        {{ item.name }}
      </div>
      <DirectoryTree
        v-if="item.children && item.expanded"
        :tree="item.children"
        @file-selected="$emit('file-selected', $event)"
      />
    </li>
  </ul>
</template>

<script>
export default {
  name: 'DirectoryTree',
  props: {
    tree: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleItemClick(item) {
      if (item.type === 'directory') {
        item.expanded = !item.expanded;
      } else if (item.name.endsWith('.md')) { // Only emit for .md files
        this.$emit('file-selected', item.path);
      } else {
        console.warn('Only .md files can be opened. Selected file:', item.name);
      }
    },
  },
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 20px;
}
li {
  cursor: pointer;
}
</style>
