# easy-sequence-labeling-box
> It's an easy javascript plugin for sequence labeling, supporting key shortcuts for faster labeling.

### Concept
```javascript
// initial annations:
[
    {
        "word": "James",
        "label": "name"
    }
] 
```
<span style="color:#577eba;font-size:4em;">↓</span><br/>
<img src="./gif/demo.gif" width="650px"/><br/>
<span style="color:#577eba;font-size:4em;" >↓</span><br/>
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