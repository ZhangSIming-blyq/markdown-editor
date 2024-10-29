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
      filePath: '', // Store file path for saving
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
    async editFile(filePath) {
  console.log("File path received in editFile:", filePath); // Debug log

  if (filePath) {
    this.selectedFile = filePath; // Update selectedFile to hold the path as a string
    this.filePath = filePath;

    if (window.electronAPI && window.electronAPI.readFile) {
      try {
        console.log("Calling readFile in electronAPI with path:", this.filePath); // Debugging line
        const content = await window.electronAPI.readFile(this.filePath);
        this.fileContent = content;
        console.log("File content loaded successfully."); // Debugging line
      } catch (error) {
        console.error("Error reading file in editFile:", error);
      }
    } else {
      console.error("electronAPI or readFile is not defined");
    }
  } else {
    console.error("File path is not valid or undefined");
  }
},

    autoSave() {
      if (this.filePath && window.electronAPI && window.electronAPI.writeFile) {
        window.electronAPI.writeFile(this.filePath, this.fileContent).catch((error) => {
          console.error('Auto-save failed:', error);
        });
      }
    },
    closeEditor() {
      if (this.filePath && window.electronAPI && window.electronAPI.writeFile) {
        window.electronAPI.writeFile(this.filePath, this.fileContent)
          .then(() => {
            this.selectedFile = null;
            this.fileContent = '';
            this.filePath = '';
          })
          .catch((error) => {
            console.error('Failed to save file on close:', error);
          });
      }
    },
  },
  mounted() {
    // Set up an interval for regular auto-saving every 30 seconds
    this.autoSaveInterval = setInterval(this.autoSave, 30000); // Adjust interval as needed
  },
  beforeDestroy() {
    // Clear interval when component is destroyed
    clearInterval(this.autoSaveInterval);
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
