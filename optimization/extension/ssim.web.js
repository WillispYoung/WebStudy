!function(t,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.ssim=r():t.ssim=r()}(this,function(){return function(t){function r(e){if(n[e])return n[e].exports;var i=n[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,r),i.l=!0,i.exports}var n={};return r.m=t,r.c=n,r.i=function(t){return t},r.d=function(t,r,n){Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:n})},r.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(n,"a",n),n},r.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},r.p="",r(r.s=65)}([function(t,r){function n(t){return e(t)/t.length}function e(t){for(var r=0,n=0;n<t.length;n++)r+=t[n];return r}function i(t){for(var r=new Array(t.length),n=0;n<t.length;n++)r[n]=Math.floor(t[n]);return r}function o(t){for(var r=t.data,n=0,e=0;e<r.length;e++)n+=r[e];return n}function a(t,r){for(var n=t.data,e=t.width,i=t.height,o=r.data,a=new Array(n.length),u=0;u<i;u++)for(var f=u*e,c=0;c<e;c++)a[f+c]=n[f+c]+o[f+c];return{data:a,width:e,height:i}}function u(t,r){for(var n=t.data,e=t.width,i=t.height,o=r.data,a=new Array(n.length),u=0;u<i;u++)for(var f=u*e,c=0;c<e;c++)a[f+c]=n[f+c]-o[f+c];return{data:a,width:e,height:i}}function f(t,r){for(var n=t.data,e=t.width,i=t.height,o=new Array(n.length),a=0;a<n.length;a++)o[a]=n[a]+r;return{data:o,width:e,height:i}}function c(t,r){return"number"==typeof r?f(t,r):a(t,r)}function h(t,r){return"number"==typeof r?f(t,-r):u(t,r)}function d(t,r){for(var n=t.data,e=t.width,i=t.height,o=new Array(n.length),a=0;a<n.length;a++)o[a]=n[a]/r;return{data:o,width:e,height:i}}function l(t,r){for(var n=t.data,e=t.width,i=t.height,o=r.data,a=new Array(n.length),u=0;u<n.length;u++)a[u]=n[u]/o[u];return{data:a,width:e,height:i}}function s(t,r){return"number"==typeof r?d(t,r):l(t,r)}function p(t,r){for(var n=t.data,e=t.width,i=t.height,o=new Array(n.length),a=0;a<n.length;a++)o[a]=n[a]*r;return{data:o,width:e,height:i}}function v(t,r){for(var n=t.data,e=t.width,i=t.height,o=r.data,a=new Array(n.length),u=0;u<n.length;u++)a[u]=n[u]*o[u];return{data:a,width:e,height:i}}function w(t,r){return"number"==typeof r?p(t,r):v(t,r)}function y(t){return w(t,t)}function m(t){return o(t)/t.data.length}t.exports={add2d:c,average:n,divide2d:s,floor:i,mean2d:m,multiply2d:w,square2d:y,subtract2d:h,sum:e,sum2d:o}},function(t,r){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,r){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,r){var n=t.exports={version:"2.4.0"};"number"==typeof __e&&(__e=n)},function(t,r,n){t.exports=!n(1)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,r){var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};t.exports=function(t){return"object"===("undefined"==typeof t?"undefined":n(t))?null!==t:"function"==typeof t}},function(t,r,n){(function(t,e){function i(t,r){this._id=t,this._clearFn=r}var o=n(50).nextTick,a=Function.prototype.apply,u=Array.prototype.slice,f={},c=0;r.setTimeout=function(){return new i(a.call(setTimeout,window,arguments),clearTimeout)},r.setInterval=function(){return new i(a.call(setInterval,window,arguments),clearInterval)},r.clearTimeout=r.clearInterval=function(t){t.close()},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(window,this._id)},r.enroll=function(t,r){clearTimeout(t._idleTimeoutId),t._idleTimeout=r},r.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},r._unrefActive=r.active=function(t){clearTimeout(t._idleTimeoutId);var r=t._idleTimeout;r>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},r))},r.setImmediate="function"==typeof t?t:function(t){var n=c++,e=!(arguments.length<2)&&u.call(arguments,1);return f[n]=!0,o(function(){f[n]&&(e?t.apply(null,e):t.call(null),r.clearImmediate(n))}),n},r.clearImmediate="function"==typeof e?e:function(t){delete f[t]}}).call(r,n(6).setImmediate,n(6).clearImmediate)},function(t,r,n){var e=n(18),i=e.conv2,o=n(19),a=o.filter2,u=n(53),f=u.fspecial,c=n(54),h=c.imfilter,d=n(55),l=d.normpdf,s=n(22),p=s.ones,v=n(23),w=v.padarray,y=n(56),m=y.rgb2gray,g=n(57),b=g.skip2d,x=n(59),T=x.transpose,M=n(24),S=M.zeros;t.exports={conv2:i,filter2:a,fspecial:f,imfilter:h,normpdf:l,ones:p,padarray:w,rgb2gray:m,skip2d:b,transpose:T,zeros:S}},function(t,r){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,r,n){var e=n(2),i=n(3),o=n(11),a=n(44),u=n(33),f="prototype",c=function t(r,n,c){var h,d,l,s,p=r&t.F,v=r&t.G,w=r&t.S,y=r&t.P,m=r&t.B,g=v?e:w?e[n]||(e[n]={}):(e[n]||{})[f],b=v?i:i[n]||(i[n]={}),x=b[f]||(b[f]={});v&&(c=n);for(h in c)d=!p&&g&&void 0!==g[h],l=(d?g:c)[h],s=m&&d?u(l,e):y&&"function"==typeof l?u(Function.call,l):l,g&&a(g,h,l,r&t.U),b[h]!=l&&o(b,h,s),y&&x[h]!=l&&(x[h]=l)};e.core=i,c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,r){var n={}.hasOwnProperty;t.exports=function(t,r){return n.call(t,r)}},function(t,r,n){var e=n(38),i=n(43);t.exports=n(4)?function(t,r,n){return e.f(t,r,i(1,n))}:function(t,r,n){return t[r]=n,t}},function(t,r,n){var e=n(32);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==e(t)?t.split(""):Object(t)}},function(t,r,n){var e=n(40),i=n(35);t.exports=Object.keys||function(t){return e(t,i)}},function(t,r){var n=Math.ceil,e=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?e:n)(t)}},function(t,r,n){var e=n(12),i=n(8);t.exports=function(t){return e(i(t))}},function(t,r,n){var e=n(8);t.exports=function(t){return Object(e(t))}},function(t,r){var n=0,e=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+e).toString(36))}},function(t,r,n){function e(t,r){for(var n=t.data,e=t.width,i=t.height,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"full",a=e+r.width-1,f=i+r.height-1,c=l(f,a),h=c.data,d=0;d<r.height;d++)for(var s=0;s<r.width;s++){var p=r.data[d*r.width+s];if(p)for(var v=0;v<i;v++)for(var w=0;w<e;w++)h[(v+d)*a+w+s]+=n[v*e+w]*p}var y={data:h,width:a,height:f};return u(y,o,i,r.height,e,r.width)}function i(t,r){var n=r.data,e=r.width,i=r.height,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"full",u=p(i,1),f=p(1,e),c=a(t,u,f,o);return w(c,n[0])}function o(t){for(var r=t.data,n=r[0],e=1;e<r.length;e++)if(r[e]!==n)return!1;return!0}function a(t,r,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"full",o=Math.max(r.height,r.width),a=Math.max(n.height,n.width),f=e(t,r,"full"),c=e(f,n,"full");return u(c,i,t.height,o,t.width,a)}function u(t,r,n,e,i,o){if("full"===r)return t;if("same"===r){var a=Math.ceil((t.height-n)/2),u=Math.ceil((t.width-i)/2);return h(t,a,n,u,i)}return h(t,e-1,n-e+1,o-1,i-o+1)}function f(){for(var t=arguments.length,r=Array(t),n=0;n<t;n++)r[n]=arguments[n];return r[2]&&r[2].data?a.apply(void 0,r):o(r[1])?i.apply(void 0,r):e.apply(void 0,r)}var c=n(58),h=c.sub,d=n(24),l=d.zeros,s=n(22),p=s.ones,v=n(0),w=v.multiply2d;t.exports={conv2:f}},function(t,r,n){function e(t){for(var r=t.data,n=t.width,e=t.height,i=new Array(r.length),o=0;o<e;o++)for(var a=0;a<n;a++)i[o*n+a]=r[(e-1-o)*n+n-1-a];return{data:i,width:n,height:e}}function i(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"same";return a(r,e(t),n)}var o=n(18),a=o.conv2;t.exports={filter2:i}},function(t,r){function n(t,r,n){for(var e=r*t,i=new Array(e),o=0;o<e;o++)i[o]=n;return{data:i,width:r,height:t}}t.exports={numbers:n}},function(t,r){function n(t,r){return t-r*Math.floor(t/r)}t.exports={mod:n}},function(t,r,n){function e(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t;return o(t,r,1)}var i=n(20),o=i.numbers;t.exports={ones:e}},function(t,r,n){function e(t){for(var r=t.data,n=t.width,e=t.height,i=new Array(r.length),o=0;o<e;o++)for(var a=0;a<n;a++)i[o*n+a]=r[o*n+n-1-a];return{data:i,width:n,height:e}}function i(t){for(var r=t.data,n=t.width,e=t.height,i=new Array(r.length),o=0;o<e;o++)for(var a=0;a<n;a++)i[o*n+a]=r[(e-1-o)*n+a];return{data:i,width:n,height:e}}function o(t,r){for(var n=t.width+r.width,e=new Array(t.height*n),i=0;i<t.height;i++){for(var o=0;o<t.width;o++)e[i*n+o]=t.data[i*t.width+o];for(var a=0;a<r.width;a++)e[i*n+a+t.width]=r.data[i*r.width+a]}return{data:e,width:n,height:t.height}}function a(t,r){return{data:t.data.concat(r.data),height:t.height+r.height,width:t.width}}function u(t,r){for(var n=t.width+2*r,i=new Array(n*t.height),a=o(t,e(t)),u=0;u<t.height;u++)for(var f=-r;f<t.width+r;f++)i[u*n+f+r]=a.data[u*a.width+s(f,a.width)];return{data:i,width:n,height:t.height}}function f(t,r){for(var n=a(t,i(t)),e=t.height+2*r,o=new Array(t.width*e),u=-r;u<t.height+r;u++)for(var f=0;f<t.width;f++)o[(u+r)*t.width+f]=n.data[s(u,n.height)*t.width+f];return{data:o,width:t.width,height:e}}function c(t,r){for(var n=d(r,2),e=n[0],i=n[1],o=t.width+2*i,a=t.height+2*e,u=new Array(o*a),f=-e;f<0;f++){for(var c=-i;c<0;c++)u[(f+e)*o+c+i]=t.data[(Math.abs(f)-1)*t.width+Math.abs(c)-1];for(var h=0;h<t.width;h++)u[(f+e)*o+h+i]=t.data[(Math.abs(f)-1)*t.width+h];for(var l=t.width;l<t.width+i;l++)u[(f+e)*o+l+i]=t.data[(Math.abs(f)-1)*t.width+2*t.width-l-1]}for(var s=0;s<t.height;s++){for(var p=-i;p<0;p++)u[(s+e)*o+p+i]=t.data[s*t.width+Math.abs(p)-1];for(var v=0;v<t.width;v++)u[(s+e)*o+v+i]=t.data[s*t.width+v];for(var w=t.width;w<t.width+i;w++)u[(s+e)*o+w+i]=t.data[s*t.width+2*t.width-w-1]}for(var y=t.height;y<t.height+e;y++){for(var m=-i;m<0;m++)u[(y+e)*o+m+i]=t.data[(2*t.height-y-1)*t.width+Math.abs(m)-1];for(var g=0;g<t.width;g++)u[(y+e)*o+g+i]=t.data[(2*t.height-y-1)*t.width+g];for(var b=t.width;b<t.width+i;b++)u[(y+e)*o+b+i]=t.data[(2*t.height-y-1)*t.width+2*t.width-b-1]}return{data:u,width:o,height:a}}function h(t,r){var n=d(r,2),e=n[0],i=n[1];return t.height>=e&&t.width>=i?c(t,[e,i]):f(u(t,i),e)}var d=function(){function t(t,r){var n=[],e=!0,i=!1,o=void 0;try{for(var a,u=t[Symbol.iterator]();!(e=(a=u.next()).done)&&(n.push(a.value),!r||n.length!==r);e=!0);}catch(t){i=!0,o=t}finally{try{!e&&u.return&&u.return()}finally{if(i)throw o}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return t(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),l=n(21),s=l.mod;t.exports={padarray:h}},function(t,r,n){function e(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t;return o(t,r,0)}var i=n(20),o=i.numbers;t.exports={zeros:e}},function(t,r){function n(t){throw new Error("Missing "+t+" parameter")}function e(t,r,n){if(n&&t>=n&&r>=n){var e=t/r;return e>1?{height:n,width:Math.round(n/e)}:{height:Math.round(n*e),width:n}}return{width:t,height:r}}t.exports={force:n,getLimitDimensions:e}},function(t,r,n){function e(t){if(Object.keys(t).forEach(function(t){if(!(t in x))throw new Error('"'+t+'" is not a valid option')}),"k1"in t&&("number"!=typeof t.k1||t.k1<0))throw new Error("Invalid k1 value. Default is "+x.k1);if("k2"in t&&("number"!=typeof t.k2||t.k2<0))throw new Error("Invalid k2 value. Default is "+x.k2)}function i(t){return e(t),Object.assign({},x,t)}function o(t){if(t[0].width!==t[1].width||t[0].height!==t[1].height)throw new Error("Image dimensions do not match");return t}function a(t){return[l(t[0]),l(t[1])]}function u(t,r){return"fast"===r.downsample?h(t,f.Promise,r.maxSize):h(t,f.Promise)}function f(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:b("image1"),r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:b("image2"),n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},e=(new Date).getTime();n=i(n);var c="fast"===n.ssim?w:m;return f.Promise.all([u(t,n),u(r,n)]).then(o).then(a).then(function(t){return c(t[0],t[1],n)}).then(function(t){return{ssim_map:t,mssim:p(t),performance:(new Date).getTime()-e}})}var c=n(61),h=c.readpixels,d=n(7),l=d.rgb2gray,s=n(0),p=s.mean2d,v=n(62),w=v.ssim,y=n(60),m=y.originalSsim,g=n(25),b=g.force,x=n(64),T=n(63),M=T.version,S=n(51);f.Promise=this.Promise||S,f.ssim=w,f.version=M,t.exports=f},function(t,r,n){var e=n(9);e(e.S+e.F,"Object",{assign:n(37)})},function(t,r,n){var e=n(16),i=n(13);n(42)("keys",function(){return function(t){return i(e(t))}})},function(t,r){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,r,n){var e=n(5);t.exports=function(t){if(!e(t))throw TypeError(t+" is not an object!");return t}},function(t,r,n){var e=n(15),i=n(48),o=n(47);t.exports=function(t){return function(r,n,a){var u,f=e(r),c=i(f.length),h=o(a,c);if(t&&n!=n){for(;c>h;)if(u=f[h++],u!=u)return!0}else for(;c>h;h++)if((t||h in f)&&f[h]===n)return t||h||0;return!t&&-1}}},function(t,r){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,r,n){var e=n(29);t.exports=function(t,r,n){if(e(t),void 0===r)return t;switch(n){case 1:return function(n){return t.call(r,n)};case 2:return function(n,e){return t.call(r,n,e)};case 3:return function(n,e,i){return t.call(r,n,e,i)}}return function(){return t.apply(r,arguments)}}},function(t,r,n){var e=n(5),i=n(2).document,o=e(i)&&e(i.createElement);t.exports=function(t){return o?i.createElement(t):{}}},function(t,r){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,r,n){t.exports=!n(4)&&!n(1)(function(){return 7!=Object.defineProperty(n(34)("div"),"a",{get:function(){return 7}}).a})},function(t,r,n){"use strict";var e=n(13),i=n(39),o=n(41),a=n(16),u=n(12),f=Object.assign;t.exports=!f||n(1)(function(){var t={},r={},n=Symbol(),e="abcdefghijklmnopqrst";return t[n]=7,e.split("").forEach(function(t){r[t]=t}),7!=f({},t)[n]||Object.keys(f({},r)).join("")!=e})?function(t,r){for(var n=a(t),f=arguments.length,c=1,h=i.f,d=o.f;f>c;)for(var l,s=u(arguments[c++]),p=h?e(s).concat(h(s)):e(s),v=p.length,w=0;v>w;)d.call(s,l=p[w++])&&(n[l]=s[l]);return n}:f},function(t,r,n){var e=n(30),i=n(36),o=n(49),a=Object.defineProperty;r.f=n(4)?Object.defineProperty:function(t,r,n){if(e(t),r=o(r,!0),e(n),i)try{return a(t,r,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[r]=n.value),t}},function(t,r){r.f=Object.getOwnPropertySymbols},function(t,r,n){var e=n(10),i=n(15),o=n(31)(!1),a=n(45)("IE_PROTO");t.exports=function(t,r){var n,u=i(t),f=0,c=[];for(n in u)n!=a&&e(u,n)&&c.push(n);for(;r.length>f;)e(u,n=r[f++])&&(~o(c,n)||c.push(n));return c}},function(t,r){r.f={}.propertyIsEnumerable},function(t,r,n){var e=n(9),i=n(3),o=n(1);t.exports=function(t,r){var n=(i.Object||{})[t]||Object[t],a={};a[t]=r(n),e(e.S+e.F*o(function(){n(1)}),"Object",a)}},function(t,r){t.exports=function(t,r){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:r}}},function(t,r,n){var e=n(2),i=n(11),o=n(10),a=n(17)("src"),u="toString",f=Function[u],c=(""+f).split(u);n(3).inspectSource=function(t){return f.call(t)},(t.exports=function(t,r,n,u){var f="function"==typeof n;f&&(o(n,"name")||i(n,"name",r)),t[r]!==n&&(f&&(o(n,a)||i(n,a,t[r]?""+t[r]:c.join(String(r)))),t===e?t[r]=n:u?t[r]?t[r]=n:i(t,r,n):(delete t[r],i(t,r,n)))})(Function.prototype,u,function(){return"function"==typeof this&&this[a]||f.call(this)})},function(t,r,n){var e=n(46)("keys"),i=n(17);t.exports=function(t){return e[t]||(e[t]=i(t))}},function(t,r,n){var e=n(2),i="__core-js_shared__",o=e[i]||(e[i]={});t.exports=function(t){return o[t]||(o[t]={})}},function(t,r,n){var e=n(14),i=Math.max,o=Math.min;t.exports=function(t,r){return t=e(t),t<0?i(t+r,0):o(t,r)}},function(t,r,n){var e=n(14),i=Math.min;t.exports=function(t){return t>0?i(e(t),9007199254740991):0}},function(t,r,n){var e=n(5);t.exports=function(t,r){if(!e(t))return t;var n,i;if(r&&"function"==typeof(n=t.toString)&&!e(i=n.call(t)))return i;if("function"==typeof(n=t.valueOf)&&!e(i=n.call(t)))return i;if(!r&&"function"==typeof(n=t.toString)&&!e(i=n.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},function(t,r){function n(){throw new Error("setTimeout has not been defined")}function e(){throw new Error("clearTimeout has not been defined")}function i(t){if(h===setTimeout)return setTimeout(t,0);if((h===n||!h)&&setTimeout)return h=setTimeout,setTimeout(t,0);try{return h(t,0)}catch(r){try{return h.call(null,t,0)}catch(r){return h.call(this,t,0)}}}function o(t){if(d===clearTimeout)return clearTimeout(t);if((d===e||!d)&&clearTimeout)return d=clearTimeout,clearTimeout(t);try{return d(t)}catch(r){try{return d.call(null,t)}catch(r){return d.call(this,t)}}}function a(){v&&s&&(v=!1,s.length?p=s.concat(p):w=-1,p.length&&u())}function u(){if(!v){var t=i(a);v=!0;for(var r=p.length;r;){for(s=p,p=[];++w<r;)s&&s[w].run();w=-1,r=p.length}s=null,v=!1,o(t)}}function f(t,r){this.fun=t,this.array=r}function c(){}var h,d,l=t.exports={};!function(){try{h="function"==typeof setTimeout?setTimeout:n}catch(t){h=n}try{d="function"==typeof clearTimeout?clearTimeout:e}catch(t){d=e}}();var s,p=[],v=!1,w=-1;l.nextTick=function(t){var r=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)r[n-1]=arguments[n];p.push(new f(t,r)),1!==p.length||v||i(u)},f.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=c,l.addListener=c,l.once=c,l.off=c,l.removeListener=c,l.removeAllListeners=c,l.emit=c,l.binding=function(t){throw new Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(t){throw new Error("process.chdir is not supported")},l.umask=function(){return 0}},function(t,r,n){(function(r,n){var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};!function(){function i(t){r.setImmediate?n(t):r.importScripts?setTimeout(t):(a++,u[a]=t,r.postMessage(a,"*"))}function o(t){"use strict";function r(t,r,n,i){if(2==c)return i();if("object"!=("undefined"==typeof h?"undefined":e(h))&&"function"!=typeof h||"function"!=typeof t)i();else try{var o=0;t.call(h,function(t){o++||(h=t,r())},function(t){o++||(h=t,n())})}catch(t){h=t,n()}}function n(){var t;try{t=h&&h.then}catch(t){return h=t,c=2,n()}r(t,function(){c=1,n()},function(){c=2,n()},function(){try{1==c&&"function"==typeof a?h=a(h):2==c&&"function"==typeof u&&(h=u(h),c=1)}catch(t){return h=t,l()}h==f?(h=TypeError(),l()):r(t,function(){l(3)},l,function(){l(1==c&&3)})})}if("function"!=typeof t&&void 0!=t)throw TypeError();if("object"!=e(this)||this&&this.then)throw TypeError();var a,u,f=this,c=0,h=0,d=[];f.promise=f,f.resolve=function(t){return a=f.fn,u=f.er,c||(h=t,c=1,i(n)),f},f.reject=function(t){return a=f.fn,u=f.er,c||(h=t,c=2,i(n)),f},f._d=1,f.then=function(t,r){if(1!=this._d)throw TypeError();var n=new o;return n.fn=t,n.er=r,3==c?n.resolve(h):4==c?n.reject(h):d.push(n),n},f.catch=function(t){return f.then(null,t)};var l=function(t){c=t||4,d.map(function(t){3==c&&t.resolve(h)||t.reject(h)})};try{"function"==typeof t&&t(f.resolve,f.reject)}catch(t){f.reject(t)}return f}r=this;var a=1,u={},f=!1;r.setImmediate||r.addEventListener("message",function(t){if(t.source==r)if(f)i(u[t.data]);else{f=!0;try{u[t.data]()}catch(t){}delete u[t.data],f=!1}}),o.resolve=function(t){if(1!=this._d)throw TypeError();return t instanceof o?t:new o(function(r){r(t)})},o.reject=function(t){if(1!=this._d)throw TypeError();return new o(function(r,n){n(t)})},o.all=function(t){function r(e,i){if(i)return n.resolve(i);if(e)return n.reject(e);var o=t.reduce(function(t,r){return r&&r.then?t+1:t},0);0==o&&n.resolve(t),t.map(function(n,e){n&&n.then&&n.then(function(n){return t[e]=n,r(),n},r)})}if(1!=this._d)throw TypeError();if(!(t instanceof Array))return o.reject(TypeError());var n=new o;return r(),n},o.race=function(t){function r(e,i){if(i)return n.resolve(i);if(e)return n.reject(e);var o=t.reduce(function(t,r){return r&&r.then?t+1:t},0);0==o&&n.resolve(t),t.map(function(t,n){t&&t.then&&t.then(function(t){r(null,t)},r)})}if(1!=this._d)throw TypeError();if(!(t instanceof Array))return o.reject(TypeError());if(0==t.length)return new o;var n=new o;return r(),n},o._d=1,t.exports=o}()}).call(r,n(52),n(6).setImmediate)},function(t,r){var n,e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"===("undefined"==typeof window?"undefined":e(window))&&(n=window)}t.exports=n},function(t,r,n){function e(t){for(var r=2*t+1,n=new Array(Math.pow(r,2)),e=0;e<r;e++)for(var i=0;i<r;i++)n[e*r+i]=Math.pow(e-t,2)+Math.pow(i-t,2);return{data:n,width:r,height:r}}function i(t,r){for(var n=t.data,e=t.width,i=t.height,o=new Array(n.length),a=0;a<n.length;a++)o[a]=Math.exp(-n[a]/(2*Math.pow(r,2)));return{data:o,width:e,height:i}}function o(){var t=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:"gaussian",arguments.length>1&&void 0!==arguments[1]?arguments[1]:3),r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1.5;t=(t-1)/2;var n=e(t),o=i(n,r),a=u(o);return f(o,a)}var a=n(0),u=a.sum2d,f=a.divide2d;t.exports={fspecial:o}},function(t,r,n){function e(t,r,n,e){if(t=c(t,d([r/2,n/2]),e),0===u(r,2)&&(t.data=t.data.slice(0,-t.width),t.height--),0===u(n,2)){for(var i=[],o=0;o<t.data.length;o++)(o+1)%t.width!==0&&i.push(t.data[o]);t.data=i,t.width--}return t}function i(t){return"same"===t&&(t="valid"),t}function o(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"symmetric",o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"same";return t=e(t,r.width,r.height,n),o=i(o),s(r,t,o)}var a=n(21),u=a.mod,f=n(23),c=f.padarray,h=n(0),d=h.floor,l=n(19),s=l.filter2;t.exports={imfilter:o}},function(t,r){function n(t){for(var r=t.data,n=t.width,e=t.height,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,a=2.5066282746310007,u=new Array(r.length),f=0;f<r.length;f++){var c=(r[f]-i)/o;u[f]=Math.exp(-Math.pow(c,2)/2)/(o*a)}return{data:u,width:n,height:e}}t.exports={normpdf:n}},function(t,r){function n(t,r,n){return Math.round(.29894*t+.58704*r+.11402*n)}function e(t){for(var r=t.data,e=t.width,i=t.height,o=new Array(e*i),a=0;a<i;a++)for(var u=0;u<e;u++){var f=u+a*e,c=4*f;o[f]=n(r[c],r[c+1],r[c+2],r[c+3])}return{data:o,width:e,height:i}}t.exports={rgb2gray:e}},function(t,r){function n(t,r,n){for(var i=e(r,3),o=i[0],a=i[1],u=i[2],f=e(n,3),c=f[0],h=f[1],d=f[2],l=Math.ceil((d-c)/h),s=Math.ceil((u-o)/a),p=new Array(l*s),v=0;v<s;v++)for(var w=0;w<l;w++){var y=o+v*a,m=c+w*h;p[v*l+w]=t.data[y*t.width+m]}return{data:p,width:l,height:s}}var e=function(){function t(t,r){var n=[],e=!0,i=!1,o=void 0;try{for(var a,u=t[Symbol.iterator]();!(e=(a=u.next()).done)&&(n.push(a.value),!r||n.length!==r);e=!0);}catch(t){i=!0,o=t}finally{try{!e&&u.return&&u.return()}finally{if(i)throw o}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return t(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();t.exports={skip2d:n}},function(t,r){function n(t,r,n,e,i){for(var o=t.data,a=t.width,u=new Array(i*n),f=0;f<n;f++)for(var c=0;c<i;c++)u[f*i+c]=o[(e+f)*a+r+c];return{data:u,width:i,height:n}}t.exports={sub:n}},function(t,r){function n(t){for(var r=t.data,n=t.width,e=t.height,i=new Array(n*e),o=0;o<e;o++)for(var a=0;a<n;a++)i[a*e+o]=r[o*n+a];return{data:i,height:n,width:e}}t.exports={transpose:n}},function(t,r,n){function e(t,r,n){var e=s("gaussian",n.windowSize,1.5),i=Math.pow(2,n.bitDepth)-1,d=Math.pow(n.k1*i,2),y=Math.pow(n.k2*i,2);if(e=a(e,h(e)),"original"===n.downsample){var m=Math.min(t.width,t.height)/n.maxSize,g=Math.round(m),b=Math.max(1,g);if(b>1){var x=v(b);x=a(x,h(x)),t=p(t,x,"symmetric","same"),r=p(r,x,"symmetric","same"),t=w(t,[0,b,t.height],[0,b,t.width]),r=w(r,[0,b,r.height],[0,b,r.width])}}var T=l(e,t,"valid"),M=l(e,r,"valid"),S=f(T),j=f(M),_=u(T,M),A=f(t),E=f(r),O=c(l(e,A,"valid"),S),k=c(l(e,E,"valid"),j),I=c(l(e,u(t,r),"valid"),_);if(d>0&&y>0){var P=o(u(_,2),d),F=o(u(I,2),y),z=o(o(S,j),d),D=o(o(O,k),y);return a(u(P,F),u(z,D))}var L=u(_,2),q=u(I,2),C=o(S,j),B=o(O,k);return a(u(L,q),u(C,B))}var i=n(0),o=i.add2d,a=i.divide2d,u=i.multiply2d,f=i.square2d,c=i.subtract2d,h=i.sum2d,d=n(7),l=d.filter2,s=d.fspecial,p=d.imfilter,v=d.ones,w=d.skip2d;t.exports={originalSsim:e}},function(t,r,n){function e(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,e=new Image,i=document.createElement("canvas"),a=i.getContext("2d");return new r(function(r,u){e.onload=function(){var t=o(e.width,e.height,n),f=t.width,c=t.height;return 0===f||0===c?u("Failed to load image"):(i.width=f,i.height=c,a.drawImage(e,0,0,e.width,e.height,0,0,f,c),r(a.getImageData(0,0,f,c)))},e.onerror=u,e.src=t})}var i=n(25),o=i.getLimitDimensions;t.exports={readpixels:e}},function(t,r,n){function e(t,r,n){var e=b(i(n.windowSize),0,1.5),f=Math.pow(2,n.bitDepth)-1,h=Math.pow(n.k1*f,2),d=Math.pow(n.k2*f,2);e=l(e,w(e));var y=M(e);if("original"===n.downsample){var g=u(t,r,n.maxSize),x=c(g,2);t=x[0],r=x[1]}var T=m(t,e,y,"valid"),S=m(r,e,y,"valid"),j=p(T),_=p(S),A=s(T,S),E=p(t),O=p(r),k=v(m(E,e,y,"valid"),j),I=v(m(O,e,y,"valid"),_),P=v(m(s(t,r),e,y,"valid"),A);return h>0&&d>0?o(A,P,j,_,k,I,h,d):a(A,P,j,_,k,I)}function i(t){for(var r=Math.floor(t/2),n=new Array(2*r+1),e=-r;e<=r;e++)n[e+r]=Math.abs(e);return{data:n,width:n.length,height:1}}function o(t,r,n,e,i,o,a,u){var f=d(s(t,2),a),c=d(s(r,2),u),h=d(d(n,e),a),p=d(d(i,o),u);return l(s(f,c),s(h,p))}function a(t,r,n,e,i,o){var a=s(t,2),u=s(r,2),f=d(n,e),c=d(i,o);return l(s(a,u),s(f,c))}function u(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:256,e=Math.min(t.width,r.height)/n,i=Math.round(e);if(i>1){var o=x(i);o=l(o,w(o)),t=f(t,o,i),r=f(r,o,i)}return[t,r]}function f(t,r,n){var e=g(t,r,"symmetric","same");return T(e,[0,n,e.height],[0,n,e.width])}var c=function(){function t(t,r){var n=[],e=!0,i=!1,o=void 0;try{for(var a,u=t[Symbol.iterator]();!(e=(a=u.next()).done)&&(n.push(a.value),!r||n.length!==r);e=!0);}catch(t){i=!0,o=t}finally{try{!e&&u.return&&u.return()}finally{if(i)throw o}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return t(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),h=n(0),d=h.add2d,l=h.divide2d,s=h.multiply2d,p=h.square2d,v=h.subtract2d,w=h.sum2d,y=n(7),m=y.conv2,g=y.imfilter,b=y.normpdf,x=y.ones,T=y.skip2d,M=y.transpose;t.exports={ssim:e}},function(t,r){t.exports={type:"deploy",version:"2.5.1"}},function(t,r){t.exports={windowSize:11,k1:.01,k2:.03,bitDepth:8,downsample:"original",ssim:"fast",maxSize:256}},function(t,r,n){n(28),n(27),t.exports=n(26)}])});