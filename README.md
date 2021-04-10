# easy-text-annotation-box

> It's an easy javascript plugin for mannual text annotation, supporting key shortcuts for faster labeling.

### Concept

```javascript
// initial annotations:
[
  {
    word: "James",
    label: "name",
  },
];
```

<img src="down-arrow.png" width="50px"/><br/>
<img src="demo.gif" width="650px"/><br/>
<img src="down-arrow.png" width="50px"/><br/>

```javascript
// latest annotations:
[
  {
    word: "James",
    label: "name",
  },
  {
    word: "basketball",
    label: "sports",
  },
  {
    word: "🏀 ",
    label: "emoji",
  },
];
```

### Demo

[Try!](https://codesandbox.io/s/easy-sequence-labeling-box-igykl?file=/index.html)

### How to use:

```html
<script src="https://raw.githack.com/HC200ok/easy-text-annotation-box/master/dist/easyTextAnnotationBox.min.js"></script>
<body>
  <div id="demo"></div>
</body>
<script>
  window.onload = () => {
    const annotations = [
      {
        word: "James",
        label: "name",
      },
    ];
    const labels = [
      {
        value: "name",
        keypress: "n",
      },
      {
        value: "sports",
        keypress: "s",
      },
      {
        value: "emoji",
        keypress: "e",
      },
      {
        value: "food",
      },
    ];

    const text =
      "James is a basketball player, he likes eating hamburger since he was a child, now he is a basketball 🏀  star.";

    const color = "#577eba";

    const easyTextAnnotationBox = new EasyTextAnnotationBox({
      container: document.getElementById("demo"),
      text,
      annotations, // optional
      labels,
      color, // optional
    });

    // axios.post('/XXXX', {
    //     parameters: easyTextAnnotationBox.getAnnotations(),
    // }).then(function (response) {
    //     XXXXX
    // }).catch(function (error) {
    //     XXXXX
    // })
  };
</script>
```

### Options

| Props       | Description              | Type   | Must Required | Default   |
| ----------- | ------------------------ | ------ | ------------- | --------- |
| annotations | labeled data             | Array  | no            | []        |
| labels      | label value and keypress | Array  | yes           |           |
| text        | text                     | String | yes           |           |
| color       | theme color              | String | no            | '#577eba' |

### Functions

| Function Name  | Description                |
| :------------: | -------------------------- |
| getAnnotations | get the latest annotations |

### Build Setup

```bash
# install dependencies
npm install
# serve with hot reload at localhost:8080
npm run dev
# build for production with minification
npm run build
```
