<template>
  <div class="editor">
    <!-- 目录选择 -->
    <input type="file" webkitdirectory @change="handleFileSelect" />
    <div class="file-list">
      <DirectoryTree :tree="directoryTree" @file-selected="editFile" />
    </div>
    <div class="markdown-editor" v-if="selectedFile">
      <div class="editor-header">
        <h2>Editing: {{ selectedFile.name }}</h2>
        <button @click="closeFile">Close</button>
      </div>
      <div
        id="editor"
        contenteditable="true"
        @input="renderMarkdown"
        v-html="previewContent"
        ref="editor"
      ></div>
    </div>
    <div class="markdown-editor" v-else>
      <h2>Select a file to edit</h2>
    </div>
  </div>
</template>

<script>
import DirectoryTree from './DirectoryTree.vue';
import markdownit from 'markdown-it';

export default {
  components: { DirectoryTree },
  data() {
    return {
      directoryTree: [],
      selectedFile: null,
      fileContent: '',
      previewContent: '',
      markdown: markdownit(),
    };
  },
  methods: {
    handleFileSelect(event) {
      const files = Array.from(event.target.files).filter(file => file.name.endsWith('.md'));
      this.directoryTree = this.buildTree(files);
    },
    editFile(file) {
      if (file instanceof File || file instanceof Blob) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = e => {
          this.fileContent = e.target.result;
          this.previewContent = this.markdown.render(this.fileContent);
        };
        reader.readAsText(file);
      } else {
        console.error("Selected item is not a valid file.");
      }
    },
    buildTree(files) {
      const tree = [];
      files.forEach(file => {
        const parts = file.webkitRelativePath.split('/'); // 使用相对路径
        let currentLevel = tree;
        parts.forEach((part, index) => {
          let existingPath = currentLevel.find(item => item.name === part);
          if (!existingPath) {
            existingPath = {
              name: part,
              path: parts.slice(0, index + 1).join('/'),
              type: index === parts.length - 1 ? 'file' : 'directory',
              children: [],
              expanded: false,
              file: index === parts.length - 1 ? file : null // 确保文件对象
            };
            currentLevel.push(existingPath);
          }
          if (existingPath.type === 'directory') {
            currentLevel = existingPath.children;
          }
        });
      });
      return tree;
    },
    renderMarkdown() {
      const editor = this.$refs.editor;
      this.fileContent = editor.innerText || editor.textContent;
      this.previewContent = this.markdown.render(this.fileContent);
    },
    closeFile() {
      this.selectedFile = null;
      this.fileContent = '';
      this.previewContent = '';
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
  margin-bottom: 10px;
}

#editor {
  width: 100%;
  height: calc(100vh - 120px);
  font-size: 16px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  overflow-y: auto;
  font-family: Arial, sans-serif;
}
</style>
