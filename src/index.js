import './style.scss'
class EasyTextAnnotationBox {
    #box
    #text
    #color
    #labels
    #annotations
    #selectingWord
    #defaultOptions = {
        annotations: [],
        color: "#577eba"
    }
    constructor(options) {
        options = Object.assign({}, this.#defaultOptions, options)
        const { container, text, annotations, labels, color } = options
        if (typeof text !== "string" && text.length === 0) {
            throw new Error("Type or value of the text option is wrong");
        }
        if (!(labels instanceof Array) && labels.length === 0) {
            throw new Error("Type or value of the labels option is wrong");
        }
        if (typeof container !== "object") {
            throw new Error("Type of the container option is wrong");
        }
        this.#box = container
        this.#text = text
        this.#labels = labels
        this.#annotations = annotations
        this.#selectingWord = null
        this.#color = color
        this.#renderAnnotationHtml(this.#annotations, this.#labels, this.#text)
        this.#bindEvents()
    }
    #getEntityInfos = (text, annotation) => {
        const regex = new RegExp(annotation.word, 'g');
        const matchedIndexes = [...text.matchAll(regex)]
        let entityInfos = []
        for (const item of matchedIndexes) {
            entityInfos.push({
                end_offset: item["index"] + annotation.word.length,
                label: annotation.label,
                start_offset: item["index"],
                word: annotation.word
            })
        }
        return entityInfos
    }
    #initEntities = (text, annotations) => {
        let entitiesInfos = []
        for (const annotation of annotations) {
            const entityInfos = this.#getEntityInfos(text, annotation)
            entitiesInfos = entitiesInfos.concat(entityInfos)
        }
        // sort by start_offset
        entitiesInfos = entitiesInfos.slice().sort((a, b) => a.start_offset - b.start_offset)
        // filter duplicate start_offset
        entitiesInfos = entitiesInfos.reduce((acc, current) => {
          const i = acc.findIndex(item => item.start_offset === current.start_offset);
          if (i == -1) {
            return acc.concat([current])
          } else {
            if (acc[i].word.length < current.word.length) acc[i] = current
            return acc
          }
        }, [])

        return entitiesInfos
    }
    #makeTextChunks = text => {
        let chunks = []
        const snippets = text.split('\n')
        for (const snippet of snippets.slice(0, -1)) {
            chunks.push({
                type: "text",
                content: snippet + '\n',
                label: null,
                color: null,
                newline: false
            })
            chunks.push({
                type: "text",
                content: '',
                label: null,
                color: null,
                newline: true
            })
        }
        chunks.push({
            type: "text",
            label: null,
            color: null,
            content: snippets.slice(-1)[0],
            newline: false
        })
        return chunks
    }
    #makeChunks = (text, entities) => {
        let chunks = []
        let startOffset = 0
        // to count the number of characters correctly.
        const characters = text.split('')
        for (const entity of entities) {
            // add non-entities to chunks.
            let piece = characters.slice(startOffset, entity.start_offset).join('')
            chunks = chunks.concat(this.#makeTextChunks(piece))
            startOffset = entity.end_offset

            // add entities to chunks.
            piece = characters.slice(entity.start_offset, entity.end_offset).join('')
            chunks.push({
                type: "annotation",
                content: piece,
                label: entity.label
            })
        }
        // add the rest of text.
        chunks = chunks.concat(this.#makeTextChunks(characters.slice(startOffset, characters.length).join('')))
        return chunks
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
    #makeRenderHtml = (chunks, labels) => {
        let headHtmlStr = ""
        for (const label of labels) {
            let labelHtmlStr = ""
            labelHtmlStr += `<span class="label_value" style="background-color: ${this.#color}; color: ${this.#getContrastColor(this.#color)}">${label.value}</span>`
            if (label.keypress) {
                labelHtmlStr += `<span class="label_keypress" style="border-color: ${this.#color}">${label.keypress}</span>`
            }
            headHtmlStr += `<span data-label="${label.value}" class="label" style="border-color: ${this.#color}">${labelHtmlStr}</span>`
        }
        headHtmlStr = `<div class="easy_text_annotation_box_head">${headHtmlStr}</div>`
        let bodyHtmlStr = ""
        for (const chunk of chunks) {
            if (chunk.type == "text") {
                bodyHtmlStr += `<span>${chunk.content}</span>`
            }
            if (chunk.type == "annotation") {
                bodyHtmlStr += `<span class="annotation" style="border-color: ${this.#color};">
                                    <span class="annotation_word">
                                        ${chunk.content}
                                        <button class="annotation_delete" data-word="${chunk.content.trim()}">x
                                        </button>
                                    </span>
                                    <span class="annotation_label"
                                        style="background-color: ${this.#color}; color: ${this.#getContrastColor(this.#color)};">
                                        ${chunk.label}
                                    </span>
                                 </span>`
            }
        }
        bodyHtmlStr = `<div class="easy_text_annotation_box_body">${bodyHtmlStr}</div>`
        const renderHtml = `<div class="easy_text_annotation_box">${headHtmlStr}${bodyHtmlStr}</div>`
        return renderHtml
    }
    #renderHtml = html => {
        this.#box.innerHTML = html
    }
    #renderAnnotationHtml = (annotations, lables, text) => {
        const entities = this.#initEntities(text, annotations)
        const chunks = this.#makeChunks(text, entities)
        const html = this.#makeRenderHtml(chunks, lables)

        this.#renderHtml(html)
    }
    #bindEvents = () => {
        this.#box.addEventListener("click", e => {
            e = e || window.event;
            const target = e.target || e.srcElement;
            if (target.classList.contains("annotation_delete")) {
                const word = target.getAttribute("data-word")
                this.#annotations = this.#annotations.filter(item => item.word != word)
                this.#renderAnnotationHtml(this.#annotations, this.#labels, this.#text)
            }
        })

        this.#box.addEventListener("mousedown", e => {
            e = e || window.event;
            const target = e.target || e.srcElement;
            if (target.parentNode && target.parentNode.classList.contains("label")) {
                const label = target.parentNode.getAttribute("data-label")
                if (this.#selectingWord && this.#selectingWord != "" && label) {
                    this.#annotations.push({
                        "word": this.#selectingWord,
                        "label": label
                    })
                    this.#renderAnnotationHtml(this.#annotations, this.#labels, this.#text)
                }
            }
        })

        // event of add annocation
        document.addEventListener("mouseup", () => {
            let word = window.getSelection ? window.getSelection()
                : document.selection.createRange().text;
            word = word + "";
            word = word.replace(/^\s+|\s+$/g, "");
            this.#selectingWord = word.trim().length ? word : null
        })

        document.addEventListener('keyup', e => {
            const keyName = e.key;
            const label = this.#labels.find(label => label.keypress === keyName)
            if (this.#selectingWord && this.#selectingWord != "" && label) {
                this.#annotations.push({
                    "word": this.#selectingWord,
                    "label": label.value
                })
                this.#renderAnnotationHtml(this.#annotations, this.#labels, this.#text)
            }
        }, false);
    }
    getAnnotations() {
        return this.#annotations
    }
}
window.EasyTextAnnotationBox = EasyTextAnnotationBox
export default EasyTextAnnotationBox