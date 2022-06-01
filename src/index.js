import './style.scss'
class ManualDataMasking {
  #text
  #chunks
  #container
  #maxHeight
  #categories
  #dataMasked
  #selectingData
  #replaceCharactor
  #dataMaskingCharactor
  #selectingDataStartIndex
  #events = {}
  #defaultOptions = {
    maxHeight: null,
    dataMasked: [],
    replaceCharactor: "*",
    dataMaskingCharactor: "●",
  }
  #CATEGORY_DEFAULT_COLOR  = "#577eba"
  constructor(options) {
    options = Object.assign({}, this.#defaultOptions, options)
    const { container, text, categories, replaceCharactor, dataMaskingCharactor, dataMasked, maxHeight } = options
    if (typeof text !== "string" || text.length === 0) {
      throw new Error("Type or value of the text option is wrong");
    }
    if (!(categories instanceof Array) || categories.length === 0) {
      throw new Error("Type or value of the categories option is wrong");
    }
    if (!(dataMasked instanceof Array)) {
      throw new Error("Type of the dataMasked option is wrong");
    }
    if (typeof container !== "object") {
      throw new Error("Type of the container option is wrong");
    }
    if (typeof replaceCharactor !== "string" || replaceCharactor.length === 0) {
      throw new Error("Type or value of the replaceCharactor option is wrong");
    }
    if (typeof dataMaskingCharactor !== "string" || dataMaskingCharactor.length === 0) {
      throw new Error("Type or value of the dataMaskingCharactor option is wrong");
    }
    if (typeof maxHeight !== "number" && maxHeight !== null) {
      throw new Error("Type of the maxHeight option is wrong");
    }
    this.#container = container
    this.#text = text
    this.#categories = categories
    this.#dataMasked = dataMasked
    this.#maxHeight = maxHeight
    this.#selectingData = null
    this.#replaceCharactor = replaceCharactor
    this.#dataMaskingCharactor = dataMaskingCharactor
    this.#checkCategoriesColor(this.#categories)
    this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
    this.#bindEvents()
  }
  #checkCategoriesColor = (categories) => {
    categories.forEach(category => {
      if (!category.color) category.color = this.#CATEGORY_DEFAULT_COLOR
    })
  }
  #generateEntities = maskings => {
    // sort by start
    maskings = maskings.slice().sort((a, b) => a.start - b.start)
    this.#dataMasked = maskings
    let entitiesInfos = []
    for (const masking of maskings) {
      const entityInfos = {
        ...masking,
        color: this.#getCategoryColor(masking.category)
      }
      entitiesInfos = entitiesInfos.concat(entityInfos)
    }
    return entitiesInfos
  }
  #generateTextChunks = text => {
    let chunks = []
    const snippets = text.split('\n')
    for (const snippet of snippets.slice(0, -1)) {
      chunks.push({
        type: "text",
        content: snippet,
        category: null,
        color: null
      })
      chunks.push({
        type: "wrap",
        content: '↵',
        category: null,
        color: null
      })
    }
    chunks.push({
      type: "text",
      category: null,
      color: null,
      content: snippets.slice(-1)[0]
    })
    return chunks
  }
  #generateChunks = (text, entities) => {
    let chunks = []
    let startOffset = 0
    // to count the number of characters correctly.
    const characters = text.split('')
    for (const entity of entities) {
      // add non-entities to chunks.
      let piece = characters.slice(startOffset, entity.start).join('')
      chunks = chunks.concat(this.#generateTextChunks(piece))
      startOffset = entity.end

      // add entities to chunks.
      piece = characters.slice(entity.start, entity.end).join('')
      chunks.push({
        type: "masking",
        content: piece,
        start: entity.start,
        category: entity.category,
        color: entity.color
      })
    }
    // add the rest of text.
    chunks = chunks.concat(this.#generateTextChunks(characters.slice(startOffset, characters.length).join('')))
    return chunks
  }
  #generateRenderHtml = (chunks, categories) => {
    let headHtmlStr = ""
    for (const category of categories) {
      let categoryHtmlStr = ""
      categoryHtmlStr += `<span class="category_value" style="background-color: ${category.color}; color: ${this.#getContrastColor(category.color)}">${category.value}</span>`
      if (category.keypress) {
        categoryHtmlStr += `<span class="category_keypress" style="border-color: ${category.color}">${category.keypress}</span>`
      }
      headHtmlStr += `<span data-category="${category.value}" class="category" style="border-color: ${category.color}">${categoryHtmlStr}</span>`
    }
    headHtmlStr = `<div class="easy_data_masking_head">${headHtmlStr}</div>`
    let bodyHtmlStr = ""
    for (const [index, chunk] of chunks.entries()) {
      if (chunk.type == "text") {
        bodyHtmlStr += `${this.#isTextIndent(index, chunks) ? '<span class="text-indent">' : '<span>'}${chunk.content}</span>`
      }
      if (chunk.type == "wrap") {
        bodyHtmlStr += `<br/>`
      }
      if (chunk.type == "masking") {
        bodyHtmlStr += `<span class="masking" style="border-color: ${chunk.color};">
                  <button class="masking_delete" data-maskingStart="${chunk.start}">x
                  </button>          
                  <span class="masking_content">
                    <div class="masking_content_top">
                      ${this.#dataMaskingCharactor.repeat(chunk.content.length)}
                    </div>
                    <div class="masking_content_bottom">
                      ${chunk.content}
                    </div>
                  </span>
                  <span class="category"
                    style="background-color: ${chunk.color}; color: ${this.#getContrastColor(chunk.color)};">
                    ${chunk.category}
                  </span>
                 </span>`
      }
    }
    bodyHtmlStr = `<div class="easy_data_masking_body"
                      id="easy_data_masking_body"
                      style="${ this.#maxHeight ? `max-height: ${this.#maxHeight}px` : ''}">
                        ${bodyHtmlStr}
                  </div>`
    const renderHtml = `<div class="easy_data_masking">${headHtmlStr}${bodyHtmlStr}</div>`
    return renderHtml
  }
  #isTextIndent(index, chunks) {
    if (index === 0) return true;
    const previousChunk = chunks[index - 1];
    if (previousChunk.type === "wrap") {
      return true;
    }
    return false;
  }
  #renderHtml = html => {
    this.#container.innerHTML = html
  }
  #renderMaskingHtml = (maskings, lables, text) => {
    const entities = this.#generateEntities(maskings)
    this.#chunks = this.#generateChunks(text, entities)
    const html = this.#generateRenderHtml(this.#chunks, lables)
    this.#renderHtml(html)
    const callbackFunc = this.#events["afterMasking"]
    if (typeof callbackFunc === "function") callbackFunc(this.getDataMasked(), this.getTextAfterDataMasking())
  }
  #getContrastColor = hexcolor => {
    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === '#') {
      hexcolor = hexcolor.slice(1)
    }
    // Convert to RGB value
    const r = parseInt(hexcolor.substr(0, 2), 16)
    const g = parseInt(hexcolor.substr(2, 2), 16)
    const b = parseInt(hexcolor.substr(4, 2), 16)
    // Get YIQ ratio
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    // Check contrast
    return (yiq >= 128) ? 'black' : 'white'
  }
  #getCategoryColor = category => {
    return this.#categories.find(item => item.value === category).color
  }
  #getPrevNodesLength = content => {
    const nodeIndex = this.#chunks.findIndex(item => item.content === content)
    let prevNodesLength = 0
    for (let i = 0; i < nodeIndex; i++) {
      prevNodesLength += this.#chunks[i].content.length
    }
    return prevNodesLength
  }
  #bindEvents = () => {
    this.#container.addEventListener("click", e => {
      e = e || window.event;
      const target = e.target || e.srcElement;
      if (target.classList.contains("masking_delete")) {
        const start = target.getAttribute("data-maskingStart")
        this.#dataMasked = this.#dataMasked.filter(item => item.start != start)
        this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
      }
    })

    this.#container.addEventListener("mousedown", e => {
      e = e || window.event;
      const target = e.target || e.srcElement;
      if (target.parentNode && target.parentNode.classList.contains("category")) {
        const category = target.parentNode.getAttribute("data-category")
        if (this.#selectingData && this.#selectingData != "" && category) {
          this.#dataMasked.push({
            "content": this.#selectingData,
            "category": category,
            "start": this.#selectingDataStartIndex,
            "end": this.#selectingDataStartIndex + this.#selectingData.length
          })
          this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
        }
      }
    })

    // event of add annocation
    document.addEventListener("mouseup", () => {
      let content = window.getSelection ? window.getSelection()
        : document.selection.createRange().text;
      const anchorOffset = content.anchorOffset
      const focusOffset = content.focusOffset
      const anchorNodeData = content.anchorNode.data
      content = content + "";
      content = content.replace(/^\s+|\s+$/g, "");
      this.#selectingData = content.trim().length ? content : null
      this.#selectingDataStartIndex = this.#getPrevNodesLength(anchorNodeData) + Math.min(anchorOffset, focusOffset)
    })

    document.addEventListener('keyup', e => {
      const keyName = e.key;
      const category = this.#categories.find(category => category.keypress === keyName)
      if (this.#selectingData && this.#selectingData != "" && category) {
        this.#dataMasked.push({
          "content": this.#selectingData,
          "category": category.value,
          "start": this.#selectingDataStartIndex,
          "end": this.#selectingDataStartIndex + this.#selectingData.length
        })
        this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
      }
    }, false);
  }
  #replaceAt = (text, index, replacement) => {
    return text.substr(0, index) + replacement + text.substr(index + replacement.length);
  }
  getDataMasked = () => {
    return this.#dataMasked
  }
  getTextAfterDataMasking = () => {
    let afterMasking = this.#text
    this.#dataMasked.forEach(masking => {
      afterMasking = this.#replaceAt(afterMasking, masking.start, this.#replaceCharactor.repeat(masking.content.length))
    })
    return afterMasking
  }
  on = (event, callback) => {
    this.#events[event] = callback
  }
}
export function create(options) {
  return new ManualDataMasking(options)
}