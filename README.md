# easy-data-masking

> A javascript plugin for mannual [data masking](https://research.aimultiple.com/data-masking/).

## Features

1. Configurable categories of sensitive data like swear word, person name, home address...
2. Showing sensitive data been masked when mouse hover.
3. Replacing sensitive data by using characters "●" and "x".

## Concept

```javascript
// dataMasked before data masking:
[];

// text before data masking:
"川崎さんは川崎に住んでいます、電話番号は080080080、自粛しない悪い人間。";
```

<img src="down-arrow.png" width="50px"/><br/>
<img src="demo.gif" width="750px"/><br/>
<img src="down-arrow.png" width="50px"/><br/>

```javascript
// dataMasked after data masking:
[
  {
    masking_string: "川崎",
    masking_category: "Person Name",
    masking_start: 0,
    masking_end: 2,
  },
  {
    masking_string: "080080080",
    masking_category: "Phone Number",
    masking_start: 20,
    masking_end: 29,
  },
  {
    masking_string: "悪い",
    masking_category: "Swear Word",
    masking_start: 35,
    masking_end: 37,
  },
];

// text after data masking:
"xxさんは川崎に住んでいます、電話番号はxxxxxxxxx、自粛しないxx人間。";
```
## Demo

[Try!](https://codesandbox.io/s/easy-data-masking-igykl?file=/index.html)

## How to use

step1: download [easyDataMasking.min.js](https://github.com/HC200ok/easy-data-masking/blob/master/dist/easyDataMasking.min.js)

step2:

```html
<script src="easyDataMasking.min.js"></script>

<div id="demo"></div>

<script>
  const dataMasked = [
    {
      "masking_string": "川崎",
      "masking_category": "Person Name",
      "masking_start": 0,
      "masking_end": 2
    }
  ]

  const categories = [
    {
      "value": "Person Name",
      "color": "#b6656c"
    },
    {
      "value": "Swear Word",
      "color": "#577eba"
    },
    {
      "value": "Others",
      "color": "#3e6146"
    }
  ]

  const text = "川崎さんは川崎に住んでいます、電話番080080080、自粛しない悪い人間。"

  const easyDataMasking = new EasyDataMasking({
    container: document.getElementById("demo"),
    text,
    dataMasked,
    categories,
  })

  easyDataMasking.on("afterMasking", function() {
    console.log(easyDataMasking.getTextAfterMasking())
    console.log(easyDataMasking.getDataMasked())
  })
</script>
```

## Options

| Property   | Description                  | Type               | Required | Default |
| ---------- | ---------------------------- | ------------------ | -------- | ------- |
| container  | container dom element        | Dom Element Object | yes      |         |
| categories | categories of sensitive data | Array              | yes      |         |
| text       | text                         | String             | yes      |         |
| dataMasked | sensitive data been masked        | Array              | no       | []      |

## Functions

|    Function Name    | Description                                                                             |
| :-----------------: | --------------------------------------------------------------------------------------- |
|    getDataMasked    | get sensitive data been masked                                                                    |
| getTextAfterMasking | get text after data masking                                                             |
|         on          | register callback functions that will be triggered each time after new sensitive data been masked |

## Build Setup

```bash
# install dependencies
npm install
# serve with hot reload at localhost:8080
npm run dev
# build for production with minification
npm run build
```
