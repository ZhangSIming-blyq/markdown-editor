<template>
  <div class="editor">
    <div class="file-list">
      <input type="file" @change="handleFileUpload" webkitdirectory directory multiple />
      <DirectoryTree :tree="directoryTree" @file-selected="editFile" />
    </div>
    <div class="markdown-editor" v-if="selectedFile">
      <div class="editor-header">
        <h2>Editing: {{ selectedFile.name }}</h2>
        <button @click="closeEditor">Close</button>
      </div>
      <textarea
        v-model="fileContent"
        ref="textArea"
        @input="autoSave"
      ></textarea>
    </div>
    <div v-else class="markdown-editor">
      <h2>Select a file to edit</h2>
    </div>
  </div>
</template>

<script>
import DirectoryTree from './DirectoryTree.vue';

export default {
  components: {
    DirectoryTree,
  },
  data() {
    return {
      directoryTree: [],
      selectedFile: null,
      fileContent: '',
    };
  },
  methods: {
    handleFileUpload(event) {
      const files = Array.from(event.target.files);
      this.directoryTree = this.buildTree(files);
    },
    buildTree(files) {
      const tree = [];
      files.forEach((file) => {
        const parts = file.webkitRelativePath.split('/');
        let currentLevel = tree;
        parts.forEach((part, index) => {
          const existingPath = currentLevel.find((item) => item.name === part);
          if (existingPath) {
            currentLevel = existingPath.children;
          } else {
            const newPart = {
              name: part,
              path: parts.slice(0, index + 1).join('/'),
              type: index === parts.length - 1 ? 'file' : 'directory',
              children: [],
              expanded: false,
              file: index === parts.length - 1 ? file : null,
            };
            currentLevel.push(newPart);
            if (newPart.type === 'directory') {
              currentLevel = newPart.children;
            }
          }
        });
      });
      return tree;
    },
    editFile(file) {
      if (file instanceof File) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.fileContent = e.target.result;
        };
        reader.readAsText(file);
      } else {
        console.error('Selected item is not a valid file.');
      }
    },
    autoSave() {
      if (this.selectedFile) {
        // Only keep the content in memory as a backup for now
        localStorage.setItem(this.selectedFile.name, this.fileContent);
      }
    },
    closeEditor() {
      // Attempt to save the latest content back to the original file
      this.autoSave();  // Save the latest changes to memory/localStorage as a backup

      this.selectedFile = null;
      this.fileContent = '';
    },
  },
};
</script>

<style scoped>
.editor {
  display: flex;
  height: 100vh;
}

.file-list {
  width: 20%;
  border-right: 1px solid #ccc;
  padding: 20px;
  overflow-y: auto;
}

.markdown-editor {
  width: 80%;
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

textarea {
  width: 100%;
  height: calc(100vh - 60px);
  font-size: 16px;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
