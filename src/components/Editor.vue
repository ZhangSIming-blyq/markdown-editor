<template>
    <div class="editor">
      <div class="file-list">
        <DirectoryTree :tree="directoryTree" @file-selected="editFile" />
      </div>
      <div class="markdown-editor" v-if="selectedFile">
        <h2>Editing: {{ selectedFile.name }}</h2>
        <textarea v-model="fileContent"></textarea>
      </div>
      <div class="markdown-editor" v-else>
        <h2>Select a file to edit</h2>
      </div>
    </div>
  </template>
  
  <script>
  import DirectoryTree from './DirectoryTree.vue';
  
  export default {
    components: {
      DirectoryTree
    },
    data() {
      return {
        directoryTree: [],
        selectedFile: null,
        fileContent: ''
      };
    },
    methods: {
      editFile(file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.fileContent = e.target.result;
        };
        reader.readAsText(file);
      },
      buildTree(files) {
        const tree = [];
        files.forEach(file => {
          const parts = file.path.split('/');
          let currentLevel = tree;
          parts.forEach((part, index) => {
            const existingPath = currentLevel.find(item => item.name === part);
            if (existingPath) {
              currentLevel = existingPath.children;
            } else {
              const newPart = {
                name: part,
                path: parts.slice(0, index + 1).join('/'),
                type: index === parts.length - 1 ? 'file' : 'directory',
                children: [],
                expanded: false,
                file: index === parts.length - 1 ? file.file : null
              };
              currentLevel.push(newPart);
              if (newPart.type === 'directory') {
                currentLevel = newPart.children;
              }
            }
          });
        });
        return tree;
      }
    },
    created() {
      if (this.$route.query.files) {
        const files = JSON.parse(this.$route.query.files);
        this.directoryTree = this.buildTree(files);
      }
    }
  };
  </script>
  
  <style scoped>
  .editor {
    display: flex;
    height: 100vh;
  }
  
  .file-list {
    width: 20%; /* 1/5 */
    border-right: 1px solid #ccc;
    padding: 20px;
    overflow-y: auto;
  }
  
  .markdown-editor {
    width: 80%; /* 4/5 */
    padding: 20px;
  }
  
  textarea {
    width: 100%;
    height: calc(100vh - 60px);
    font-size: 16px;
    padding: 10px;
    box-sizing: border-box;
  }
  </style>