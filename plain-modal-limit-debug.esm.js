/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * PlainModal
 * https://anseki.github.io/plain-modal/
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';
import mClassList from 'm-class-list';
import PlainOverlay from 'plain-overlay';
/* Static ESM */ /* import CSS_TEXT from './default.scss' */ var CSS_TEXT = ".plainmodal .plainmodal-overlay{-webkit-tap-highlight-color:rgba(0,0,0,0);transform:translateZ(0);box-shadow:0 0 1px rgba(0,0,0,0)}.plainmodal.plainoverlay{background-color:transparent;cursor:auto}.plainmodal .plainmodal-content{z-index:9000}.plainmodal .plainmodal-overlay{width:100%;height:100%;position:absolute;left:0;top:0;background-color:rgba(136,136,136,0.6);-webkit-transition-property:opacity;-moz-transition-property:opacity;-o-transition-property:opacity;transition-property:opacity;-webkit-transition-duration:200ms;-moz-transition-duration:200ms;-o-transition-duration:200ms;transition-duration:200ms;-webkit-transition-timing-function:linear;-moz-transition-timing-function:linear;-o-transition-timing-function:linear;transition-timing-function:linear;opacity:1}.plainmodal .plainmodal-overlay.plainmodal-overlay-hide{opacity:0}.plainmodal .plainmodal-overlay.plainmodal-overlay-force{-webkit-transition-property:none;-moz-transition-property:none;-o-transition-property:none;transition-property:none}";
mClassList.ignoreNative = true;

var APP_ID = 'plainmodal',
    STYLE_ELEMENT_ID = APP_ID + '-style',
    STYLE_CLASS = APP_ID,
    STYLE_CLASS_CONTENT = APP_ID + '-content',
    STYLE_CLASS_OVERLAY = APP_ID + '-overlay',
    STYLE_CLASS_OVERLAY_HIDE = STYLE_CLASS_OVERLAY + '-hide',
    STYLE_CLASS_OVERLAY_FORCE = STYLE_CLASS_OVERLAY + '-force',
    STATE_CLOSED = 0,
    STATE_OPENING = 1,
    STATE_OPENED = 2,
    STATE_CLOSING = 3,
    STATE_INACTIVATING = 4,
    STATE_INACTIVATED = 5,
    STATE_ACTIVATING = 6,
    DURATION = 200,
    // COPY from PlainOverlay

IS_TRIDENT = !!document.uniqueID,
    IS_EDGE = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
    isObject = function () {
  var toString = {}.toString,
      fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
  return function (obj) {
    var proto = void 0,
        constr = void 0;
    return obj && toString.call(obj) === '[object Object]' && (!(proto = Object.getPrototypeOf(obj)) || (constr = proto.hasOwnProperty('constructor') && proto.constructor) && typeof constr === 'function' && fnToString.call(constr) === objFnString);
  };
}(),


/**
 * An object that has properties of instance.
 * @typedef {Object} props
 * @property {Element} elmContent - Content element.
 * @property {Element} elmOverlay - Overlay element. (Not PlainOverlay)
 * @property {PlainOverlay} plainOverlay - PlainOverlay instance.
 * @property {PlainDraggable} plainDraggable - PlainDraggable instance.
 * @property {number} state - Current state.
 * @property {Object} options - Options.
 * @property {props} parentProps - props that is effected with current props.
 * @property {{plainOverlay: boolean, option: boolean}} effectFinished - The effect finished.
 */

/** @type {Object.<_id: number, props>} */
insProps = {},


/**
 * A `props` list, it have a `state` other than `STATE_CLOSED`.
 * A `props` is pushed to the end of this array, `shownProps[shownProps.length - 1]` can be active.
 * @type {Array.<props>}
 */
shownProps = [];

var closeByEscKey = true,
    closeByOverlay = true,
    insId = 0,
    openCloseEffectProps = void 0; // A `props` that is running the "open/close" effect now.

// [DEBUG]
var traceLog = [];
var STATE_TEXT = {};
STATE_TEXT[STATE_CLOSED] = 'STATE_CLOSED';
STATE_TEXT[STATE_OPENING] = 'STATE_OPENING';
STATE_TEXT[STATE_OPENED] = 'STATE_OPENED';
STATE_TEXT[STATE_CLOSING] = 'STATE_CLOSING';
STATE_TEXT[STATE_INACTIVATING] = 'STATE_INACTIVATING';
STATE_TEXT[STATE_INACTIVATED] = 'STATE_INACTIVATED';
STATE_TEXT[STATE_ACTIVATING] = 'STATE_ACTIVATING';
// [/DEBUG]

function forceReflow(target) {
  // Trident and Blink bug (reflow like `offsetWidth` can't update)
  setTimeout(function () {
    var parent = target.parentNode,
        next = target.nextSibling;
    // It has to be removed first for Blink.
    parent.insertBefore(parent.removeChild(target), next);
  }, 0);
}

/**
 * @param {Element} element - A target element.
 * @returns {boolean} `true` if connected element.
 */
function isElement(element) {
  return !!(element && element.nodeType === Node.ELEMENT_NODE &&
  // element instanceof HTMLElement &&
  typeof element.getBoundingClientRect === 'function' && !(element.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED));
}

function finishOpening(props) {
  // [DEBUG]
  traceLog.push('<finishOpening>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  // [/DEBUG]
  openCloseEffectProps = null;
  props.state = STATE_OPENED;
  traceLog.push('state:' + STATE_TEXT[props.state]); // [DEBUG/]
  if (props.parentProps) {
    // [DEBUG]
    traceLog.push('parentProps._id:' + props.parentProps._id, 'parentProps.state:' + STATE_TEXT[props.parentProps.state]);
    // [/DEBUG]
    props.parentProps.state = STATE_INACTIVATED;
    traceLog.push('parentProps.state:' + STATE_TEXT[props.parentProps.state]); // [DEBUG/]
  }
  if (props.options.onOpen) {
    props.options.onOpen.call(props.ins);
  }
  traceLog.push('</finishOpening>'); // [DEBUG/]
}

function finishClosing(props) {
  // [DEBUG]
  traceLog.push('<finishClosing>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  if (shownProps[shownProps.length - 1] !== props) {
    throw new Error('`shownProps` is broken.');
  }
  // [/DEBUG]
  shownProps.pop();
  // [DEBUG]
  traceLog.push('shownProps:' + (shownProps.length ? shownProps.map(function (props) {
    return props._id;
  }).join(',') : 'NONE'));
  // [/DEBUG]
  openCloseEffectProps = null;
  props.state = STATE_CLOSED;
  traceLog.push('state:' + STATE_TEXT[props.state]); // [DEBUG/]
  if (props.parentProps) {
    // [DEBUG]
    traceLog.push('parentProps._id:' + props.parentProps._id, 'parentProps.state:' + STATE_TEXT[props.parentProps.state]);
    // [/DEBUG]
    props.parentProps.state = STATE_OPENED;
    traceLog.push('parentProps.state:' + STATE_TEXT[props.parentProps.state]); // [DEBUG/]
    traceLog.push('parentProps(UNLINK):' + props.parentProps._id); // [DEBUG/]
    props.parentProps = null;
  }
  if (props.options.onClose) {
    props.options.onClose.call(props.ins);
  }
  traceLog.push('</finishClosing>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {string} effectKey - `plainOverlay' or 'option`
 * @returns {void}
 */
function finishOpenEffect(props, effectKey) {
  // [DEBUG]
  traceLog.push('<finishOpenEffect>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  traceLog.push('effectKey:' + effectKey);
  // [/DEBUG]
  if (props.state !== STATE_OPENING) {
    traceLog.push('CANCEL', '</finishOpenEffect>'); // [DEBUG/]
    return;
  }
  props.effectFinished[effectKey] = true;
  // [DEBUG]
  traceLog.push('effectFinished.plainOverlay:' + props.effectFinished.plainOverlay);
  traceLog.push('effectFinished.option:' + props.effectFinished.option);
  traceLog.push('openEffect:' + (props.options.openEffect ? 'YES' : 'NO'));
  // [/DEBUG]
  if (props.effectFinished.plainOverlay && (!props.options.openEffect || props.effectFinished.option)) {
    finishOpening(props);
  }
  traceLog.push('_id:' + props._id, '</finishOpenEffect>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {string} effectKey - `plainOverlay' or 'option`
 * @returns {void}
 */
function finishCloseEffect(props, effectKey) {
  // [DEBUG]
  traceLog.push('<finishCloseEffect>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  traceLog.push('effectKey:' + effectKey);
  // [/DEBUG]
  if (props.state !== STATE_CLOSING) {
    traceLog.push('CANCEL', '</finishCloseEffect>'); // [DEBUG/]
    return;
  }
  props.effectFinished[effectKey] = true;
  // [DEBUG]
  traceLog.push('effectFinished.plainOverlay:' + props.effectFinished.plainOverlay);
  traceLog.push('effectFinished.option:' + props.effectFinished.option);
  traceLog.push('closeEffect:' + (props.options.closeEffect ? 'YES' : 'NO'));
  // [/DEBUG]
  if (props.effectFinished.plainOverlay && (!props.options.closeEffect || props.effectFinished.option)) {
    finishClosing(props);
  }
  traceLog.push('_id:' + props._id, '</finishCloseEffect>'); // [DEBUG/]
}

/**
 * Process after preparing data and adjusting style.
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function execOpening(props, force) {
  // [DEBUG]
  traceLog.push('<execOpening>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  traceLog.push('force:' + !!force);
  // [/DEBUG]
  if (props.parentProps) {
    // inactivate parentProps
    // [DEBUG]
    traceLog.push('parentProps._id:' + props.parentProps._id, 'parentProps.state:' + STATE_TEXT[props.parentProps.state]);
    // [/DEBUG]
    /*
      Cases:
        - STATE_OPENED or STATE_ACTIVATING, regardless of force
        - STATE_INACTIVATING and force
    */
    var parentProps = props.parentProps,
        elmOverlay = parentProps.elmOverlay;
    if (parentProps.state === STATE_OPENED) {
      elmOverlay.style[CSSPrefix.getName('transitionDuration')] = props.options.duration === DURATION ? '' : props.options.duration + 'ms';
      // [DEBUG]
      traceLog.push('elmOverlay.duration:' + (props.options.duration === DURATION ? '' : props.options.duration + 'ms'));
      // [/DEBUG]
    }
    var elmOverlayClassList = mClassList(elmOverlay);
    elmOverlayClassList.toggle(STYLE_CLASS_OVERLAY_FORCE, !!force);
    elmOverlayClassList.add(STYLE_CLASS_OVERLAY_HIDE);
    // [DEBUG]
    traceLog.push('elmOverlay.CLASS_FORCE:' + elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_FORCE));
    traceLog.push('elmOverlay.CLASS_HIDE:' + elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_HIDE));
    // [/DEBUG]
    // Update `state` regardless of force, for switchDraggable.
    parentProps.state = STATE_INACTIVATING;
    parentProps.plainOverlay.blockingDisabled = true;
    traceLog.push('parentProps.state:' + STATE_TEXT[props.parentProps.state]); // [DEBUG/]
  }

  props.state = STATE_OPENING;
  props.plainOverlay.blockingDisabled = false;
  traceLog.push('state:' + STATE_TEXT[props.state]); // [DEBUG/]
  props.effectFinished.plainOverlay = props.effectFinished.option = false;
  props.plainOverlay.show(force);
  if (props.options.openEffect) {
    if (force) {
      props.options.openEffect.call(props.ins);
      finishOpenEffect(props, 'option');
    } else {
      props.options.openEffect.call(props.ins, props.openEffectDone);
    }
  }
  traceLog.push('_id:' + props._id, '</execOpening>'); // [DEBUG/]
}

/**
 * Process after preparing data and adjusting style.
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @param {boolean} [sync] - `force` with sync-mode. (Skip restoring active element)
 * @returns {void}
 */
function execClosing(props, force, sync) {
  // [DEBUG]
  traceLog.push('<execClosing>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  traceLog.push('force:' + !!force, 'sync:' + !!sync);
  // [/DEBUG]
  if (props.parentProps) {
    // activate parentProps
    // [DEBUG]
    traceLog.push('parentProps._id:' + props.parentProps._id, 'parentProps.state:' + STATE_TEXT[props.parentProps.state]);
    // [/DEBUG]
    /*
      Cases:
        - STATE_INACTIVATED or STATE_INACTIVATING, regardless of `force`
        - STATE_ACTIVATING and `force`
    */
    var parentProps = props.parentProps,
        elmOverlay = parentProps.elmOverlay;
    if (parentProps.state === STATE_INACTIVATED) {
      elmOverlay.style[CSSPrefix.getName('transitionDuration')] = props.options.duration === DURATION ? '' : props.options.duration + 'ms';
      // [DEBUG]
      traceLog.push('elmOverlay.duration:' + (props.options.duration === DURATION ? '' : props.options.duration + 'ms'));
      // [/DEBUG]
    }
    var elmOverlayClassList = mClassList(elmOverlay);
    elmOverlayClassList.toggle(STYLE_CLASS_OVERLAY_FORCE, !!force);
    elmOverlayClassList.remove(STYLE_CLASS_OVERLAY_HIDE);
    // [DEBUG]
    traceLog.push('elmOverlay.CLASS_FORCE:' + elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_FORCE));
    traceLog.push('elmOverlay.CLASS_HIDE:' + elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_HIDE));
    // [/DEBUG]
    // same condition as props
    parentProps.state = STATE_ACTIVATING;
    parentProps.plainOverlay.blockingDisabled = false;
    traceLog.push('parentProps.state:' + STATE_TEXT[props.parentProps.state]); // [DEBUG/]
  }

  props.state = STATE_CLOSING;
  traceLog.push('state:' + STATE_TEXT[props.state]); // [DEBUG/]
  props.effectFinished.plainOverlay = props.effectFinished.option = false;
  props.plainOverlay.hide(force, sync);
  if (props.options.closeEffect) {
    if (force) {
      props.options.closeEffect.call(props.ins);
      finishCloseEffect(props, 'option');
    } else {
      props.options.closeEffect.call(props.ins, props.closeEffectDone);
    }
  }
  traceLog.push('_id:' + props._id, '</execClosing>'); // [DEBUG/]
}

/**
 * Finish the "open/close" effect immediately with sync-mode.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function fixOpenClose(props) {
  // [DEBUG]
  traceLog.push('<fixOpenClose>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]);
  // [/DEBUG]
  if (props.state === STATE_OPENING) {
    execOpening(props, true);
  } else if (props.state === STATE_CLOSING) {
    execClosing(props, true, true);
  }
  traceLog.push('_id:' + props._id, '</fixOpenClose>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function _open(props, force) {
  traceLog.push('<open>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]); // [DEBUG/]
  if (props.state !== STATE_CLOSED && props.state !== STATE_CLOSING && props.state !== STATE_OPENING || props.state === STATE_OPENING && !force || props.state !== STATE_OPENING && props.options.onBeforeOpen && props.options.onBeforeOpen.call(props.ins) === false) {
    traceLog.push('CANCEL', '</open>'); // [DEBUG/]
    return false;
  }
  /*
    Cases:
      - STATE_CLOSED or STATE_CLOSING, regardless of `force`
      - STATE_OPENING and `force`
  */

  // [DEBUG]
  traceLog.push('openCloseEffectProps:' + (openCloseEffectProps ? openCloseEffectProps._id : 'NONE'));
  // [/DEBUG]
  if (props.state === STATE_CLOSED) {
    if (openCloseEffectProps) {
      fixOpenClose(openCloseEffectProps);
    }
    openCloseEffectProps = props;

    if (shownProps.length) {
      // [DEBUG]
      if (shownProps.indexOf(props) !== -1) {
        throw new Error('`shownProps` is broken.');
      }
      // [/DEBUG]
      props.parentProps = shownProps[shownProps.length - 1];
      traceLog.push('parentProps(LINK):' + props.parentProps._id); // [DEBUG/]
    }
    shownProps.push(props);
    // [DEBUG]
    traceLog.push('shownProps:' + (shownProps.length ? shownProps.map(function (props) {
      return props._id;
    }).join(',') : 'NONE'));
    // [/DEBUG]

    mClassList(props.elmOverlay).add(STYLE_CLASS_OVERLAY_FORCE).remove(STYLE_CLASS_OVERLAY_HIDE);
    // [DEBUG]
    traceLog.push('elmOverlay.CLASS_FORCE:' + mClassList(props.elmOverlay).contains(STYLE_CLASS_OVERLAY_FORCE));
    traceLog.push('elmOverlay.CLASS_HIDE:' + mClassList(props.elmOverlay).contains(STYLE_CLASS_OVERLAY_HIDE));
    // [/DEBUG]
  }

  execOpening(props, force);
  traceLog.push('_id:' + props._id, '</open>'); // [DEBUG/]
  return true;
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function _close(props, force) {
  traceLog.push('<close>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]); // [DEBUG/]
  if (props.state === STATE_CLOSED || props.state === STATE_CLOSING && !force || props.state !== STATE_CLOSING && props.options.onBeforeClose && props.options.onBeforeClose.call(props.ins) === false) {
    traceLog.push('CANCEL', '</close>'); // [DEBUG/]
    return false;
  }
  /*
    Cases:
      - Other than STATE_CLOSED and STATE_CLOSING, regardless of `force`
      - STATE_CLOSING and `force`
  */

  // [DEBUG]
  traceLog.push('openCloseEffectProps:' + (openCloseEffectProps ? openCloseEffectProps._id : 'NONE'));
  // [/DEBUG]
  if (openCloseEffectProps && openCloseEffectProps !== props) {
    fixOpenClose(openCloseEffectProps);
    openCloseEffectProps = null;
  }
  /*
    Cases:
      - STATE_OPENED, STATE_OPENING or STATE_INACTIVATED, regardless of `force`
      - STATE_CLOSING and `force`
  */
  if (props.state === STATE_INACTIVATED) {
    // -> STATE_OPENED
    // [DEBUG]
    var i = shownProps.indexOf(props);
    if (i === -1 || i === shownProps.length - 1) {
      throw new Error('`shownProps` is broken.');
    }
    traceLog.push('shownProps:' + (shownProps.length ? shownProps.map(function (props) {
      return props._id;
    }).join(',') : 'NONE'));
    // [/DEBUG]
    var topProps = void 0;
    while ((topProps = shownProps[shownProps.length - 1]) !== props) {
      // [DEBUG]
      if (topProps.state !== STATE_OPENED) {
        throw new Error('`shownProps` is broken.');
      }
      traceLog.push('topProps._id:' + topProps._id, 'topProps.state:' + STATE_TEXT[topProps.state]);
      // [/DEBUG]
      execClosing(topProps, true, true);
    }
  }
  /*
    Cases:
      - STATE_OPENED or STATE_OPENING, regardless of `force`
      - STATE_CLOSING and `force`
  */

  if (props.state === STATE_OPENED) {
    if (openCloseEffectProps) {
      throw new Error('`openCloseEffectProps` is broken.');
    } // [DEBUG/]
    openCloseEffectProps = props;
  }

  execClosing(props, force);
  traceLog.push('_id:' + props._id, '</close>'); // [DEBUG/]
  return true;
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function _setOptions(props, newOptions) {
  var options = props.options,
      plainOverlay = props.plainOverlay;

  // closeButton
  if (newOptions.hasOwnProperty('closeButton') && (newOptions.closeButton = isElement(newOptions.closeButton) ? newOptions.closeButton : newOptions.closeButton == null ? void 0 : false) !== false && newOptions.closeButton !== options.closeButton) {
    if (options.closeButton) {
      // Remove
      options.closeButton.removeEventListener('click', props.handleClose, false);
    }
    options.closeButton = newOptions.closeButton;
    if (options.closeButton) {
      // Add
      options.closeButton.addEventListener('click', props.handleClose, false);
    }
  }

  // duration
  // Check by PlainOverlay
  plainOverlay.duration = newOptions.duration;
  options.duration = plainOverlay.duration;

  // overlayBlur
  // Check by PlainOverlay
  plainOverlay.blur = newOptions.overlayBlur;
  options.overlayBlur = plainOverlay.blur;

  // effect functions and event listeners
  ['openEffect', 'closeEffect', 'onOpen', 'onClose', 'onBeforeOpen', 'onBeforeClose'].forEach(function (option) {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = void 0;
    }
  });
}

var PlainModal = function () {
  /**
   * Create a `PlainModal` instance.
   * @param {Element} content - An element that is shown as the content of the modal window.
   * @param {Object} [options] - Options.
   */
  function PlainModal(content, options) {
    _classCallCheck(this, PlainModal);

    var props = {
      ins: this,
      options: { // Initial options (not default)
        closeButton: void 0,
        duration: DURATION,
        overlayBlur: false
      },
      state: STATE_CLOSED,
      effectFinished: { plainOverlay: false, option: false }
    };

    Object.defineProperty(this, '_id', { value: ++insId });
    props._id = this._id;
    insProps[this._id] = props;

    if (!content.nodeType || content.nodeType !== Node.ELEMENT_NODE || content.ownerDocument.defaultView !== window) {
      throw new Error('This `content` is not accepted.');
    }
    props.elmContent = content;
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    // Setup window
    if (!document.getElementById(STYLE_ELEMENT_ID)) {
      var head = document.getElementsByTagName('head')[0] || document.documentElement,
          sheet = head.insertBefore(document.createElement('style'), head.firstChild);
      sheet.type = 'text/css';
      sheet.id = STYLE_ELEMENT_ID;
      sheet.textContent = CSS_TEXT;
      if (IS_TRIDENT || IS_EDGE) {
        forceReflow(sheet);
      } // Trident bug

      // for closeByEscKey
      window.addEventListener('keydown', function (event) {
        var key = void 0,
            topProps = void 0;
        if (closeByEscKey && ((key = event.key.toLowerCase()) === 'escape' || key === 'esc') && (topProps = shownProps.length && shownProps[shownProps.length - 1]) && (traceLog.push('<keydown/>', 'CLOSE', '_id:' + topProps._id), true) && // [DEBUG/]
        _close(topProps)) {
          event.preventDefault();
          event.stopImmediatePropagation(); // preventDefault stops other listeners, maybe.
          event.stopPropagation();
        }
      }, true);
    }

    mClassList(content).add(STYLE_CLASS_CONTENT);
    // Overlay
    props.plainOverlay = new PlainOverlay({
      face: content,
      onShow: function onShow() {
        finishOpenEffect(props, 'plainOverlay');
      },
      onHide: function onHide() {
        finishCloseEffect(props, 'plainOverlay');
      }
    });
    // The `content` is now contained into PlainOverlay, and update `display`.
    if (window.getComputedStyle(content, '').display === 'none') {
      content.style.display = 'block';
    }
    // Trident can not get parent of SVG by parentElement.
    var elmPlainOverlayBody = content.parentNode; // elmOverlayBody of PlainOverlay
    mClassList(elmPlainOverlayBody.parentNode).add(STYLE_CLASS); // elmOverlay of PlainOverlay

    // elmOverlay (own overlay)
    var elmOverlay = props.elmOverlay = elmPlainOverlayBody.appendChild(document.createElement('div'));
    elmOverlay.className = STYLE_CLASS_OVERLAY;
    // for closeByOverlay
    elmOverlay.addEventListener('click', function (event) {
      if (event.target === elmOverlay && closeByOverlay) {
        traceLog.push('<overlayClick/>', 'CLOSE', '_id:' + props._id); // [DEBUG/]
        _close(props);
      }
    }, true);

    // Prepare removable event listeners for each instance.
    props.handleClose = function () {
      _close(props);
    };
    // Callback functions for additional effects, prepare these to allow to be used as listener.
    props.openEffectDone = function () {
      finishOpenEffect(props, 'option');
    };
    props.closeEffectDone = function () {
      finishCloseEffect(props, 'option');
    };
    props.effectDone = function () {
      traceLog.push('<effectDone/>', '_id:' + props._id, 'state:' + STATE_TEXT[props.state]); // [DEBUG/]
      if (props.state === STATE_OPENING) {
        finishOpenEffect(props, 'option');
      } else if (props.state === STATE_CLOSING) {
        finishCloseEffect(props, 'option');
      }
    };

    _setOptions(props, options);
  }

  /**
   * @param {Object} options - New options.
   * @returns {PlainModal} Current instance itself.
   */


  _createClass(PlainModal, [{
    key: 'setOptions',
    value: function setOptions(options) {
      if (isObject(options)) {
        _setOptions(insProps[this._id], options);
      }
      return this;
    }

    /**
     * Open the modal window.
     * @param {boolean} [force] - Show it immediately without effect.
     * @param {Object} [options] - New options.
     * @returns {PlainModal} Current instance itself.
     */

  }, {
    key: 'open',
    value: function open(force, options) {
      if (arguments.length < 2 && typeof force !== 'boolean') {
        options = force;
        force = false;
      }

      this.setOptions(options);
      _open(insProps[this._id], force);
      return this;
    }

    /**
     * Close the modal window.
     * @param {boolean} [force] - Close it immediately without effect.
     * @returns {PlainModal} Current instance itself.
     */

  }, {
    key: 'close',
    value: function close(force) {
      _close(insProps[this._id], force);
      return this;
    }
  }, {
    key: 'state',
    get: function get() {
      return insProps[this._id].state;
    }
  }, {
    key: 'closeButton',
    get: function get() {
      return insProps[this._id].options.closeButton;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { closeButton: value });
    }
  }, {
    key: 'duration',
    get: function get() {
      return insProps[this._id].options.duration;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { duration: value });
    }
  }, {
    key: 'overlayBlur',
    get: function get() {
      return insProps[this._id].options.overlayBlur;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { overlayBlur: value });
    }
  }, {
    key: 'openEffect',
    get: function get() {
      return insProps[this._id].options.openEffect;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { openEffect: value });
    }
  }, {
    key: 'closeEffect',
    get: function get() {
      return insProps[this._id].options.closeEffect;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { closeEffect: value });
    }
  }, {
    key: 'effectDone',
    get: function get() {
      return insProps[this._id].effectDone;
    }
  }, {
    key: 'onOpen',
    get: function get() {
      return insProps[this._id].options.onOpen;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onOpen: value });
    }
  }, {
    key: 'onClose',
    get: function get() {
      return insProps[this._id].options.onClose;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onClose: value });
    }
  }, {
    key: 'onBeforeOpen',
    get: function get() {
      return insProps[this._id].options.onBeforeOpen;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onBeforeOpen: value });
    }
  }, {
    key: 'onBeforeClose',
    get: function get() {
      return insProps[this._id].options.onBeforeClose;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onBeforeClose: value });
    }
  }], [{
    key: 'closeByEscKey',
    get: function get() {
      return closeByEscKey;
    },
    set: function set(value) {
      if (typeof value === 'boolean') {
        closeByEscKey = value;
      }
    }
  }, {
    key: 'closeByOverlay',
    get: function get() {
      return closeByOverlay;
    },
    set: function set(value) {
      if (typeof value === 'boolean') {
        closeByOverlay = value;
      }
    }
  }, {
    key: 'STATE_CLOSED',
    get: function get() {
      return STATE_CLOSED;
    }
  }, {
    key: 'STATE_OPENING',
    get: function get() {
      return STATE_OPENING;
    }
  }, {
    key: 'STATE_OPENED',
    get: function get() {
      return STATE_OPENED;
    }
  }, {
    key: 'STATE_CLOSING',
    get: function get() {
      return STATE_CLOSING;
    }
  }, {
    key: 'STATE_INACTIVATING',
    get: function get() {
      return STATE_INACTIVATING;
    }
  }, {
    key: 'STATE_INACTIVATED',
    get: function get() {
      return STATE_INACTIVATED;
    }
  }, {
    key: 'STATE_ACTIVATING',
    get: function get() {
      return STATE_ACTIVATING;
    }
  }]);

  return PlainModal;
}();

PlainModal.limit = true;

// [DEBUG]
PlainModal.insProps = insProps;
PlainModal.traceLog = traceLog;
PlainModal.shownProps = shownProps;
PlainModal.STATE_TEXT = STATE_TEXT;
PlainModal.IS_TRIDENT = IS_TRIDENT;
PlainModal.IS_EDGE = IS_EDGE;
window.PlainOverlay = PlainOverlay;
// [/DEBUG]

export default PlainModal;