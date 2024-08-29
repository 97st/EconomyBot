# napi-rs-canvas-twemoji

This is a module that is able to draw emoji on @napi-rs/canvas.

This package is based on [skia-canvas-twemoji](https://github.com/PolestarLabs/skia-canvas-twemoji), which is based on [node-canvas-with-twemoji](https://github.com/cagpie/node-canvas-with-twemoji).

## Quick Example
```javascript
const { Canvas } = require('@napi-rs/canvas');
const { fillTextWithTwemoji } = require('napi-rs-canvas-twemoji');

async function main () {
    const canvas = new Canvas(200, 200);
    const context = canvas.getContext('2d');

    context.fillStyle = '#000000';
    context.font = '30px Arial';
    await fillTextWithTwemoji(context, 'emoji 🎀', 100, 100);
}

main();
```

## Dependencies

- @napi-rs/canvas [GitHub](https://github.com/samizdatco/skia-canvas)
- twemoji-parser [GitHub](https://github.com/twitter/twemoji-parser)

## Licence

### napi-rs-canvas-twemoji

Copyright (c) 2020-2022 cagpie / Shun Kobayashi / axisiscool <cagpie@gmail.com>, Polestar Labs <labs@pollux.gg>, Axis <axis@axis.moe>

Code licensed under the MIT License: http://opensource.org/licenses/MIT
