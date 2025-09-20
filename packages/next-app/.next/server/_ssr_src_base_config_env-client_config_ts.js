"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_src_base_config_env-client_config_ts";
exports.ids = ["_ssr_src_base_config_env-client_config_ts"];
exports.modules = {

/***/ "(ssr)/./src/base/config/env-client.config.ts":
/*!**********************************************!*\
  !*** ./src/base/config/env-client.config.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   envClient: () => (/* binding */ envClient)\n/* harmony export */ });\n/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zod */ \"(ssr)/../../node_modules/zod/v3/types.js\");\n\nconst envClientSchema = zod__WEBPACK_IMPORTED_MODULE_0__.object({\n    NEXT_PUBLIC_API_URL: zod__WEBPACK_IMPORTED_MODULE_0__.string().url().endsWith('/')\n});\nconst envClient = envClientSchema.parse({\n    NEXT_PUBLIC_API_URL: \"http://localhost:5142/\"\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvYmFzZS9jb25maWcvZW52LWNsaWVudC5jb25maWcudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBdUI7QUFFdkIsTUFBTUMsZUFBZSxHQUFHRCx1Q0FBUSxDQUFDO0lBQy9CRyxtQkFBbUIsRUFBRUgsdUNBQVEsQ0FBQyxDQUFDLENBQUNLLEdBQUcsQ0FBQyxDQUFDLENBQUNDLFFBQVEsQ0FBQyxHQUFHO0FBQ3BELENBQUMsQ0FBQztBQUVLLE1BQU1DLFNBQVMsR0FBR04sZUFBZSxDQUFDTyxLQUFLLENBQUM7SUFDN0NMLG1CQUFtQixFQUFFTSx3QkFBWU47QUFDbkMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFETUlOXFxPbmVEcml2ZVxcRGVza3RvcFxcSW0gYSBiaXJkZGRkZGRkXFxwYWNrYWdlc1xcbmV4dC1hcHBcXHNyY1xcYmFzZVxcY29uZmlnXFxlbnYtY2xpZW50LmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuXHJcbmNvbnN0IGVudkNsaWVudFNjaGVtYSA9IHoub2JqZWN0KHtcclxuICBORVhUX1BVQkxJQ19BUElfVVJMOiB6LnN0cmluZygpLnVybCgpLmVuZHNXaXRoKCcvJyksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGVudkNsaWVudCA9IGVudkNsaWVudFNjaGVtYS5wYXJzZSh7XHJcbiAgTkVYVF9QVUJMSUNfQVBJX1VSTDogcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQVBJX1VSTCxcclxufSk7XHJcbiJdLCJuYW1lcyI6WyJ6IiwiZW52Q2xpZW50U2NoZW1hIiwib2JqZWN0IiwiTkVYVF9QVUJMSUNfQVBJX1VSTCIsInN0cmluZyIsInVybCIsImVuZHNXaXRoIiwiZW52Q2xpZW50IiwicGFyc2UiLCJwcm9jZXNzIiwiZW52Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./src/base/config/env-client.config.ts\n");

/***/ })

};
;