Runtime Error
Server


Error: Event handlers cannot be passed to Client Component props.
  <button ref=... type="button" form=... formAction=... formMethod=... formTarget=... formNoValidate=... disabled=... autoFocus=... className=... style=... onClick={function handleClick} onFocus=... onBlur=... onMouseEnter=... onMouseLeave=... onKeyDown=... aria-label=... aria-describedby=... aria-pressed=... aria-expanded=... aria-disabled=... role=... data-testid=... id=... name=... children=...>
                                                                                                                                                                    ^^^^^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.

Call Stack
4

Hide 4 ignore-listed frame(s)
resolveErrorDev
node_modules\next\dist\compiled\react-server-dom-webpack\cjs\react-server-dom-webpack-client.browser.development.js (1865:1)
processFullStringRow
node_modules\next\dist\compiled\react-server-dom-webpack\cjs\react-server-dom-webpack-client.browser.development.js (2245:1)
processFullBinaryRow
node_modules\next\dist\compiled\react-server-dom-webpack\cjs\react-server-dom-webpack-client.browser.development.js (2233:1)
progress
node_modules\next\dist\compiled\react-server-dom-webpack\cjs\react-server-dom-webpack-client.browser.development.js (2479:1)

Error: Event handlers cannot be passed to Client Component props.
  <button ref=... type="button" form=... formAction=... formMethod=... formTarget=... formNoValidate=... disabled=... autoFocus=... className=... style=... onClick={function handleClick} onFocus=... onBlur=... onMouseEnter=... onMouseLeave=... onKeyDown=... aria-label=... aria-describedby=... aria-pressed=... aria-expanded=... aria-disabled=... role=... data-testid=... id=... name=... children=...>
                                                                                                                                                                    ^^^^^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
    at resolveErrorDev (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.development.js:1865:46)
    at processFullStringRow (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.development.js:2245:17)
    at processFullBinaryRow (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.development.js:2233:7)
    at progress (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.development.js:2479:17)