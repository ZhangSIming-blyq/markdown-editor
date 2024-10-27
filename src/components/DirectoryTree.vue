<template>
    <ul>
      <li v-for="item in tree" :key="item.path">
        <div @click="toggle(item)">
          <span v-if="item.type === 'directory'">📁</span>
          <span v-else @click.stop="selectFile(item.file)">📄</span>
          {{ item.name }}
        </div>
        <DirectoryTree v-if="item.children && item.expanded" :tree="item.children" @file-selected="$emit('file-selected', $event)" />
      </li>
    </ul>
  </template>
  
  <script>
  export default {
    name: 'DirectoryTree',
    props: {
      tree: {
        type: Array,
        required: true
      }
    },
    methods: {
      toggle(item) {
        if (item.type === 'directory') {
          item.expanded = !item.expanded;
        }
      },
      selectFile(file) {
        this.$emit('file-selected', file);
      }
    }
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