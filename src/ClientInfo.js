import FontDetector from './libs/fontdetect';
import webglDetector from './libs/webgldetect';
import * as c from './constants';

function isExist(what) {
  return typeof what !== 'undefined';
}

export default class ClientInfo {
  /**
   * Detect javascript version
   *
   * @return {number} Current javascript version.
   */
  getJSVersion() {
    let script, i, jsVersion, scriptArr = [];

    for (i = 0; i < c.JS_VERSIONS.length; i++) {
      script = document.createElement('script');
      script.innerHTML = 'var jsver = ' + c.JS_VERSIONS[i] + ';';
      script.setAttribute('language', 'Javascript' + c.JS_VERSIONS[i]);

      // Save script element
      scriptArr.push(script);

      document.body.appendChild(script);
    }

    // Detect version
    jsVersion = window.jsver;

    // Remove scripts
    for (i = 0; i < scriptArr.length; i++) {
      document.body.removeChild(scriptArr[i]);
    }

    // Clean up
    scriptArr = null;

    return jsVersion;
  }

  /**
   * Document referrer
   *
   * @return {string} Document referrer
   */
  getReferrer() {
    return isExist(document.referrer) ? document.referrer : null;
  }

  /**
   * Get installed fonts as array
   *
   * @return {array} Array of installed fonts.
   */
  getFonts() {
    const fontDetector = new FontDetector();
    let fonts = [], i;

    for (i = 0; i < c.FONT_ARRAY.length; i++) {
      if (fontDetector.detect(c.FONT_ARRAY[i])) {
        fonts.push(c.FONT_ARRAY[i]);
      }
    }

    return fonts;
  }

  /**
   * Get installed fonts as string
   *
   * @return {string} String that contains installed fonts.
   */
  getFontsString() {
    let fonts = this.getFonts();

    return fonts.join(', ');
  }

  /**
   * Detect installed font
   *
   * @param {string} font - Font name to detect
   * @return {boolean} - Whether given font is installed
   */
  detectFont(font) {
    const fontDetector = new FontDetector();

    return fontDetector.detect(font);
  }

  /**
   * Get screen print
   *
   * @return {string} - Screen print
   * @todo Add IE support
   */
  getScreenPrint() {
    const size        = this.getScreenSize();
    const ratio       = this.getScreenRatio();
    const depth       = this.getColorDepth();
    const type        = this.getColorType();
    const workingArea = this.getWorkingAreaSize();

    return `${workingArea.width}x${size.height} ${ratio} ${depth}-bit ${type} {working area ${workingArea.width}x${workingArea.height}}`;
  }

  /**
   * Get color dept
   *
   * @return {number} - Color depth
   */
  getColorDepth() {
    const screen = window.screen;

    if (isExist(screen.colorDepth)) {
      return screen.colorDepth;
    } else if (isExist(screen.pixelDepth)) {
      return screen.pixelDepth;
    }

    return null;
  }

  /**
   * Get color type string
   *
   * @return {string} - Color type
   */
  getColorType() {
    const colorDepth = this.getColorDepth();

    if (colorDepth >= 24) {
      return 'TrueColor';
    } else if (colorDepth >= 15) {
      return 'HighColor';
    }

    return '';
  }

  /**
   * Get screen ratio
   *
   * @return {string} - Screen ratio
   */
  getScreenRatio() {
    const sizes  = this.getScreenSize();
    const width  = sizes.width;
    const height = sizes.height;

    if (isExist(width) && isExist(height)) {
      let ratio = Math.round(width / height * 100) / 100;

      return c.RATIOS[ratio];
    }

    return null;
  }

  /**
   * Get screen size
   *
   * @return {object} - Screen size object
   */
  getScreenSize() {
    const screen = window.screen;
    const width  = screen.width;
    const height = screen.height;

    if (isExist(width) && isExist(height)) {
      return { width, height };
    }

    return {
      width: 0,
      height: 0
    };
  }

  /**
   * Get working area sizes
   *
   * @return {object} Working area size object
   */
  getWorkingAreaSize() {
    const el = document.createElement('div');
    const styles = 'width:100%;height:100%;position:fixed;left:0;top:0;z-index:-1';

    el.setAttribute('style', styles);

    document.body.appendChild(el);

    let width  = el.offsetWidth,
        height = el.offsetHeight;

    // Clean up
    document.body.removeChild(el);

    return { width, height };
  }

  /**
   * Get navigator information
   *
   * @return {object} - object with navigator information
   */
  getNavigatorInfo() {
    const navigatorInfo = {};

    let key, option, i;

    for (i = 0; i < c.NAVIGATOR_OPTIONS.length; i++) {
      key = c.NAVIGATOR_OPTIONS[i];
      option = window.navigator[key];

      if (isExist(option)) {
        navigatorInfo[key] = option;
      }
    }

    return navigatorInfo;
   }

  /**
   * Get user language
   *
   * @return {string} - user language
   */
  getLanguage() {
    return window.navigator.language;
  }

  /**
   * Get instaled languages
   *
   * @return {array} - array of languages
   */
  getLanguages() {
    return window.navigator.languages;
  }

  /**
   * Get instaled languages as string
   *
   * @return {string} - string with languages
   */
  getLanguagesString() {
    return this.getLanguages().join(', ');
  }

  /**
   * Get battery information
   *
   * @return {Promise}
   */
  getBatteryInfo() {
    const navigator = window.navigator;
    const batteryInfo = {};
    const batteryOptions = {
      mozBattery:    'Mozilla',
      webkitBattery: 'WebKit',
      battery:       'W3C'
    };

    const isDesktop = battery => {
      return battery.charging && battery.chargingTime === 0 && battery.dischargingTime === Infinity && battery.level === 1;
    };

    return new Promise((resolve, reject) => {
      if (isExist(navigator.getBattery)) {
        try {
          const batteryInterval = window.setTimeout(() => {
            resolve(batteryInfo);
          }, 1000);

          navigator.getBattery()
            .then(battery => {
              batteryInfo['vendor']          = 'W3C';
              batteryInfo['charging']        = battery.charging;
              batteryInfo['chargingTime']    = battery.chargingTime;
              batteryInfo['dischargingTime'] = battery.dischargingTime;
              batteryInfo['level']           = battery.level;
              batteryInfo['isDesktop']       = isDesktop(battery);

              clearInterval(batteryInterval);

              resolve(batteryInfo);
            });
        } catch (error) {
          resolve(batteryInfo);
        }
      } else {
        for (let key in batteryOptions) {
          let battery = navigator[key];

          if (battery) {
            batteryInfo['vendor']          = batteryOptions[key] + ' (Legacy)';
            batteryInfo['charging']        = battery.charging;
            batteryInfo['chargingTime']    = battery.chargingTime;
            batteryInfo['dischargingTime'] = battery.dischargingTime;
            batteryInfo['level']           = battery.level;
            batteryInfo['isDesktop']       = isDesktop(battery);

            resolve(batteryInfo);

            break;
          }
        }
      }
    });
  }

  /**
   * Get memory performance snapshot
   *
   * @return {object} - memory performance snapshot
   */
  getMemoryPerformance() {
    const memory = window.performance ? window.performance.memory : null;

    if (isExist(memory)) {
      return {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize:  memory.usedJSHeapSize
      };
    }

    return null;
  }

  /**
   * Get navigation performance snapshot
   *
   * @return {object} - navigation performance snapshot
   */
  getNavigationPerformance() {
    const navigation = window.performance ? window.performance.navigation : {};

    if (isExist(navigation.type)) {
      let type, body, redirectCount = navigation.redirectCount;

      switch (navigation.type) {
        case 0:
          type = 'TYPE_NAVIGATE';
          body = 'Navigation started by clicking on a link, or entering the URL in the address bar, or form submission, or initializing through a script operation.';
          break;

        case 1:
          type = 'TYPE_RELOAD';
          body = 'Navigation through the reload operation or the location.reload method.';
          break;

        case 2:
          type = 'TYPE_BACK_FORWARD';
          body = 'Navigation through a history traversal operation.';
          break;

        default:
          type = 'TYPE_UNDEFINED';
          body = 'Any navigation types not defined by values above.';
      }

      return {
        type,
        body,
        redirectCount
      }
    }

    return null;
  }

  /**
   * Calculate timing performance
   *
   * @param {object} data - window performance object
   * @return {object} - object that contains timeline performance
   */
  _calculateTimingPerformance(data) {
    let prev_value = 0;
    let total_timeline = 0;

    const result = {};

    let i, option;

    for (i = 0; i < c.PERFOMANCE_TIMING_OPTIONS.length; i++) {
      option = c.PERFOMANCE_TIMING_OPTIONS[i];

      let value = data.timing[option],
          timelineDelta = 0,
          timelineCurrent = 0;

      top: {
        if (isExist(value)) {
          timelineCurrent = total_timeline;
          timelineDelta = (value === 0 || prev_value === 0) ? 0 : value - prev_value;

          prev_value = value;
          total_timeline += timelineDelta;

          if (option === 'unloadEventStart' || option === 'unloadEventEnd' || option === 'msFirstPaint') {
            prev_value = 0,
            total_timeline = 0
          }
        } else if (option === 'msFirstPaint') {
          option = null;
          break top;
        } else {
          value = timelineDelta = timelineCurrent = null;
        }
      }

      if (option) {
        result[option] = [value, timelineCurrent, timelineDelta];
      }
    }

    return result;
  }

  /**
   * Get performance
   *
   * @return {Promise}
   */
  geTimingPerformance() {
    return new Promise((resolve, reject) => {
      if (isExist(performance)) {
        try {
          window.onload = () => {
            setTimeout(() => {
              resolve(this._calculateTimingPerformance(window.performance));
            },
            100);
          };

          this._calculateTimingPerformance(window.performance);
        } catch(error) {
          resolve('Performance API is not supported');
        }
      } else {
        resolve('Performance API is not supported');
      }
    });
  }

  /**
   * Get global permissions
   *
   * @return {Promise}
   */
  getGlobalPermissions() {
    const globalPermissions = {
        permissions_vendor: 'W3C',
        geolocation: {},
        notifications: {},
        midi: {},
        midi_sysex: {},
        push: {}
      };

    return new Promise((resolve, reject) => {
      const handleMessage = res => {
        if ('https://permissions-api.github.io' == res.origin || 'http://permissions-api.github.io' == res.origin) {
          for (let key in res.data) {
            globalPermissions[key] = res.data[key];
          }
        }

        resolve(globalPermissions);
      };

      if (isExist(this.permDone)) {
        perm_iframe.contentWindow.postMessage('repeat', '*');
      } else {
        const el = document.createElement('div');

        el.setAttribute('style', 'display:none');
        el.innerHTML = '<iframe id="perm_iframe" src="https://permissions-api.github.io/query/all.html"></iframe>';

        document.body.appendChild(el);

        window.addEventListener('message', handleMessage, false);
        window.addEventListener('onmessage', handleMessage, false);

        this.permDone = true;
      }
    });
  };

  /**
   * Navigator permissions
   *
   * @return {Promise}
   */
  getNavigatorPermissions() {
    const permissions = window.navigator.permissions;

    return new Promise((resolve, reject) => {
      if (isExist(permissions)) {
        const parsePermissions = perms => {
          const type = typeof perms[0].state !== 'undefined' ? 'state' : 'status';

          const getPermisson = (permission, type) => {
            return permission ? permission[type] : null;
          };

          return {
            permissions_vendor: 'W3C',
            geolocation:        getPermisson(perms[0], type),
            notifications:      getPermisson(perms[1], type),
            midi:               getPermisson(perms[2], type),
            midi_sysex:         getPermisson(perms[3], type),
            push:               getPermisson(perms[4], type)
          };
        };

        const promises_array = [
          permissions.query({ name: 'geolocation' }),
          permissions.query({ name: 'notifications' }),
          permissions.query({ name: 'midi' }),
          permissions.query({ name: 'midi', sysex: true })
        ];

        if (navigator.userAgent.indexOf('OPR') === -1) {
          promises_array.push(
            permissions.query({ name: 'push', userVisibleOnly: true, userVisible: true })
          );
        }

        return Promise.all(promises_array)
          .then(perms => {
            resolve(parsePermissions(perms));
          })
          .catch(error => {
            resolve('Error getting permissions');
          });
      } else {
        resolve('Permissions API is not supported');
      }
    });
  }

  /**
   * Detect webGl support
   *
   * @return {object} - webGl info
   */
  detectWebGl() {
    const webglObj = webglDetector();

    let webgl = Object.assign({}, webglObj);

    if (webglObj.status && !webglObj.disabled) {
      const gl = document.createElement('canvas').getContext(webglObj.name);

      webgl = Object.assign({}, webglObj, {
        version:                  gl.getParameter(gl.VERSION),
        shading_language_version: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        vendor:                   gl.getParameter(gl.VENDOR),
        renderer:                 gl.getParameter(gl.RENDERER)
      });
    }

    return webgl;
  }
}