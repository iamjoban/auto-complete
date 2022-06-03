const debounce = (fun, time) => {
  let timeout = null;
  return (...args) => {
    console.log('default debounce');
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fun(...args)
    }, time);
  }
}

class AutoComplete {
  #searchBox = null;
  #suggestion = null
  #searchBoxID;
  #suggestionID;
  #filterSuggestion;
  #options = {};
  #currentSuggestion;
  constructor(options = {}) {
    const { uniqueFieldId = null } = options;
    if (!uniqueFieldId) {
      throw new Error('Please pass uniqueFieldId as part of options');
    }
    this.#options = options;
    this.#searchBoxID = `search-box-${uniqueFieldId}`;
    this.#suggestionID = `autocomplete-text-${uniqueFieldId}`;

  }

  #getSearchBoxDomObject() {
    if (!this.#searchBox) {
      this.#searchBox = document.getElementById(this.#searchBoxID);
    }
    return this.#searchBox;
  }

  #getSuggestionDomObject() {
    if (!this.#suggestion) {
      this.#suggestion = document.getElementById(this.#suggestionID);
    }
    return this.#suggestion;
  }

  static addClass(ele, className) {
    ele.classList.add(className);
  }

  static removeClass(ele, className) {
    ele.classList.remove(className);
  }

  static debounce = debounce;

  #inputChnageHandler = (event) => {
    if (this.#filterSuggestion) {
      const suggestion = this.#getSuggestionDomObject();
      AutoComplete.addClass(suggestion, 'hide');
      const searchedTerm = event.target.value;
      const filteredSuggestions = this.#filterSuggestion(searchedTerm);
      const suggestionToShow = filteredSuggestions?.[0];
      this.#currentSuggestion = suggestionToShow;
      if (suggestionToShow) {
        suggestion.innerHTML = suggestionToShow;
        AutoComplete.removeClass(suggestion, 'hide');
      }
    } else {
      throw new Error('Please register filter handler using registerSuggestionFilterHandler');
    }
  };

  #keydownHandler = (e) => {
    if (e.keyCode === 39) {
      const searchBox = this.#getSearchBoxDomObject();
      searchBox.value = this.#currentSuggestion;
    }
  }

  registerSuggestionFilterHandler(handler) {
    this.#filterSuggestion = handler;
  }

  render(containerEleToRenderIn, options = {}) {
    const { placeholder = 'Type here...' } = options
    const inputContainer = document.createElement('div');
    inputContainer.setAttribute('class', 'input-container');
    inputContainer.setAttribute('id', `input-container-${this.#options.uniqueFieldId}`);

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('autocomplete', 'false');
    input.setAttribute('placeholder', placeholder);
    input.setAttribute('id', this.#searchBoxID);
    input.setAttribute('class', 'search-box');
    const { withDebounce, debounceTime = 0 } = this.#options;
    const handler = withDebounce ? AutoComplete.debounce(this.#inputChnageHandler, debounceTime) : this.#inputChnageHandler;
    input.addEventListener('input', handler);
    input.addEventListener('keydown', this.#keydownHandler);

    const span = document.createElement('span');
    span.setAttribute('class', 'autocomplete-text hide');
    span.setAttribute('id', this.#suggestionID);

    const fregment = document.createDocumentFragment();
    fregment.append(input);
    fregment.append(span);
    inputContainer.append(fregment);

    containerEleToRenderIn.append(inputContainer);
  }
}