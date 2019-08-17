'use strict';

class Test {
    constructor () {
        throw new Error('fxxk');
    }
}

(async () => {
    new Test();
})();