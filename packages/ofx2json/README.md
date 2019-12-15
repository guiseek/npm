# `ofx2json`

> Library 4 convert OFX files 2 JSON

## Install
```shell
# npm
npm i @guiseek/ofx2json --save

# yarn
yarn add @guiseek/ofx2json
```

## Usage

```js
const ofx2Json = require('ofx2json');

ofx2Json('run-scripts/nubank-2019-11.ofx').then((res) => {

    // Header
    console.log(res.header);

    // Content
    console.log(res.content);

    // or pretty
    console.dir(res.content, { depth: null})

}).catch(err => {
    console.error(err.message)
})
```
