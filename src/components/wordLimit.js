class WordLimit {
  constructor(limit, wordLens) {
    this.limit = Number(limit) || 1000;

    this.container = document.createElement("span");
    this.container.classList.add("ql-word-count");
    this.update(wordLens);
  }

  update = count => {
    if (!this.container) return;
    count = count >= 0 ? count : 0;

    if (!this.container.innerHTML) {
      this.container.innerHTML = `<span class="ql-word-entered">${count}</span>/${this.limit}`;
    } else {
      const enteredEl = this.container.querySelector(".ql-word-entered");
      enteredEl.innerText = count;
    }
  };
}

export default WordLimit;
