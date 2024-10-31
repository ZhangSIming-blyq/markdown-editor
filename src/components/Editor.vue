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
      <textarea v-model="fileContent" ref="textArea" @input="autoSave"></textarea>
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
      baseDirectory: '', // Store base directory
    };
  },
  methods: {
    handleFileUpload(event) {
      const files = Array.from(event.target.files);

      this.baseDirectory = "/Users/simingzhang/siming"

      console.log("Base directory set to:", this.baseDirectory);

      // Send base directory to main process
      window.electronAPI.setBaseDirectory(this.baseDirectory);
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
    async editFile(item) {
      console.log("Item clicked:", item); // Log the entire item object

      if (item && typeof item.path === 'string') {
        if (item.type === 'directory') {
          item.expanded = !item.expanded;
        } else if (item.path.endsWith('.md')) { // Only allow .md files
          console.log("Emitting relative path for file:", item.path);
          try {
            const content = await window.electronAPI.readFile(item.path);
            this.fileContent = content;
            this.selectedFile = item;
            this.filePath = item.path;
            console.log("File content loaded successfully.");
          } catch (error) {
            console.error("Error reading file:", error);
          }
        } else {
          console.log("Selected item is not a markdown file:", item.path);
        }
      } else {
        console.error("Invalid item or path:", item);
      }
    },
    autoSave() {
      if (!this.filePath) {
        console.error('No file path set. Cannot auto-save.');
        return;
      }

      console.log('Attempting to auto-save file:', this.filePath);
      console.log('File content:', this.fileContent);

      window.electronAPI.writeFile(this.filePath, this.fileContent)
        .then(() => {
          console.log('Auto-save successful.');
        })
        .catch((error) => {
          console.error('Auto-save failed:', error);
        });
    },
    closeEditor() {
      console.log('Closing editor and attempting to auto-save.');
      this.autoSave(); // Ensure auto-save before closing
      this.selectedFile = null;
      this.fileContent = '';
      this.filePath = '';
    },
  },
  mounted() {
    console.log('Setting up auto-save interval.');
    // Set up an interval for regular auto-saving every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      console.log('Auto-save interval triggered.');
      this.autoSave();
    }, 30000); // Adjust interval as needed
  },
  beforeDestroy() {
    console.log('Clearing auto-save interval.');
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
