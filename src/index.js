import './style.scss'
class EasyDataMasking {
    #text
    #chunks
    #container
    #categories
    #dataMasked
    #selectingData
    #selectingDataStartIndex
    #events = {}
    #defaultOptions = {
        dataMasked: []
    }
    constructor(options) {
        options = Object.assign({}, this.#defaultOptions, options)
        const { container, text, maskings, categories, color } = options
        if (typeof text !== "string" && text.length === 0) {
            throw new Error("Type or value of the text option is wrong");
        }
        if (!(categories instanceof Array) && categories.length === 0) {
            throw new Error("Type or value of the categories option is wrong");
        }
        if (!(dataMasked instanceof Array) && dataMasked.length === 0) {
            throw new Error("Type or value of the dataMasked option is wrong");
        }
        if (typeof container !== "object") {
            throw new Error("Type of the container option is wrong");
        }
        this.#container = container
        this.#text = text
        this.#categories = categories
        this.#dataMasked = dataMasked
        this.#selectingData = null
        this.#checkCategoriesColor(this.#categories)
        this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
        this.#bindEvents()
    }
    #checkCategoriesColor = (categories) => {
        categories.forEach(category => {
            if (!category.color) category.color = "#577eba"
        })
    }
    #generateEntities = maskings => {
        // sort by masking_start
        maskings = maskings.slice().sort((a, b) => a.masking_start - b.masking_start)
        this.#dataMasked = maskings
        let entitiesInfos = []
        for (const masking of maskings) {
            const entityInfos = {
                ...masking,
                color: this.#getCategoryColor(masking.masking_category)
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
            let piece = characters.slice(startOffset, entity.masking_start).join('')
            chunks = chunks.concat(this.#generateTextChunks(piece))
            startOffset = entity.masking_end

            // add entities to chunks.
            piece = characters.slice(entity.masking_start, entity.masking_end).join('')
            chunks.push({
                type: "masking",
                content: piece,
                start: entity.masking_start,
                category: entity.masking_category,
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
        for (const chunk of chunks) {
            if (chunk.type == "text") {
                bodyHtmlStr += `<span>${chunk.content}</span>`
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
                                            ${"●".repeat(chunk.content.length)}
                                        </div>
                                        <div class="masking_content_bottom">
                                            ${chunk.content}
                                        </div>
                                    </span>
                                    <span class="masking_category"
                                        style="background-color: ${chunk.color}; color: ${this.#getContrastColor(chunk.color)};">
                                        ${chunk.category}
                                    </span>
                                 </span>`
            }
        }
        bodyHtmlStr = `<div class="easy_data_masking_body" id="easy_data_masking_body">${bodyHtmlStr}</div>`
        const renderHtml = `<div class="easy_data_masking">${headHtmlStr}${bodyHtmlStr}</div>`
        return renderHtml
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
        if (typeof callbackFunc === "function") callbackFunc()
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
                const masking_start = target.getAttribute("data-maskingStart")
                this.#dataMasked = this.#dataMasked.filter(item => item.masking_start != masking_start)
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
                        "masking_string": this.#selectingData,
                        "masking_category": category,
                        "masking_start": this.#selectingDataStartIndex,
                        "masking_end": this.#selectingDataStartIndex + this.#selectingData.length
                    })
                    this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
                }
            }
        })

        // event of add annocation
        document.addEventListener("mouseup", () => {
            let masking_string = window.getSelection ? window.getSelection()
                : document.selection.createRange().text;
            const anchorOffset = masking_string.anchorOffset
            const focusOffset = masking_string.focusOffset
            const anchorNodeData = masking_string.anchorNode.data
            masking_string = masking_string + "";
            masking_string = masking_string.replace(/^\s+|\s+$/g, "");
            this.#selectingData = masking_string.trim().length ? masking_string : null
            this.#selectingDataStartIndex = this.#getPrevNodesLength(anchorNodeData) + Math.min(anchorOffset, focusOffset)
        })

        document.addEventListener('keyup', e => {
            const keyName = e.key;
            const category = this.#categories.find(category => category.keypress === keyName)
            if (this.#selectingData && this.#selectingData != "" && category) {
                this.#dataMasked.push({
                    "masking_string": this.#selectingData,
                    "masking_category": category.value,
                    "masking_start": this.#selectingDataStartIndex,
                    "masking_end": this.#selectingDataStartIndex + this.#selectingData.length
                })
                this.#renderMaskingHtml(this.#dataMasked, this.#categories, this.#text)
            }
        }, false);
    }
    getDataMasked = () => {
        return this.#dataMasked
    }
    getTextAfterMasking = () => {
        let afterMasking = this.#text
        this.#dataMasked.forEach(masking => {
            afterMasking = afterMasking.replace(masking.masking_string, "x".repeat(masking.masking_string.length))
        })
        return afterMasking
    }
    on = (event, callback) => {
        this.#events[event] = callback
    }
}
window.EasyDataMasking = EasyDataMasking
export default EasyDataMasking