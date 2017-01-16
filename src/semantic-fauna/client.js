/* @flow */

// A fix for style-loader issue #96, #55, #124
if(process.env.NODE_ENV === 'development') {
    /* eslint-disable */
    __webpack_public_path__ = window.location.protocol + "//" + window.location.host + "/";
    /* eslint-enable */
}

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Namer from 'semantic-fauna/components/namer';

// Needs to be required rather than imported for above fix to work
require('semantic-fauna/sass/styles.scss');

const appElement = document.getElementById('semantic-fauna');

ReactDOM.render((
    <Namer/>
), appElement);

