<template>
    <div class="welcome">
      <h1>Welcome to Vue Markdown Editor!</h1>
      <button @click="selectDirectory">Open Directory</button>
      <input type="file" ref="fileInput" webkitdirectory directory multiple style="display: none;" @change="handleDirectorySelect" />
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      selectDirectory() {
        this.$refs.fileInput.click();
      },
      handleDirectorySelect(event) {
        const files = Array.from(event.target.files);
        this.$router.push({ name: 'Editor', query: { files: JSON.stringify(files.map(file => ({ name: file.name, path: file.webkitRelativePath, file }))) } });
      }
    }
  };
  </script>
  
  <style scoped>
  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
  }
  </style>