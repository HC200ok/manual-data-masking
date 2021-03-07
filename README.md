# easy-sequence-labeling-box
> It's an easy javascript plugin for sequence labeling, supporting key shortcuts for faster labeling.

### Concept
```javascript
// initial annotations:
[
    {
        "word": "James",
        "label": "name"
    }
] 
```
<img src="down-arrow.png" width="50px"/><br/>
<img src="demo.gif" width="650px"/><br/>
<img src="down-arrow.png" width="50px"/><br/>
```javascript
// latest annotaions: 
[
    {
        "word": "James", 
        "label": "name"
    }, 
    {
        "word": "basketball",
        "label": "sports"
    }, 
    {
        "word": "🏀 ",
        "label": "emoji"
    }
]
```

### Use CDN Script: 
```javascript
<script src="https://raw.githack.com/HC200ok/easy-sequence-labeling-box/master/dist/easySequenceLabelingBox.min.js"></script>
```

### Demo
[Try!](https://codesandbox.io/s/easy-sequence-labeling-box-igykl?file=/index.html)

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