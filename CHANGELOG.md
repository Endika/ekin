# Changelog

## [1.4.1](https://github.com/Endika/ekin/compare/v1.4.0...v1.4.1) (2026-06-05)


### Bug Fixes

* **builder:** add New action so multiple workouts can be saved instead of overwriting one ([87bc325](https://github.com/Endika/ekin/commit/87bc3258c65e2d424d2b28cc358d58b07b9718db))

## [1.4.0](https://github.com/Endika/ekin/compare/v1.3.0...v1.4.0) (2026-06-05)


### Features

* **builder:** rename saved workouts inline and replace native delete confirm with a dialog ([0c1f7bd](https://github.com/Endika/ekin/commit/0c1f7bd65d57ee7cc9b38a4c9b499ab25e19d969))

## [1.3.0](https://github.com/Endika/ekin/compare/v1.2.2...v1.3.0) (2026-06-05)


### Features

* **builder:** show exercise image with zone-icon fallback and tap-to-zoom ([ecf5757](https://github.com/Endika/ekin/commit/ecf5757259d9f34789b015436a38ccbf117b7d8e))

## [1.2.2](https://github.com/Endika/ekin/compare/v1.2.1...v1.2.2) (2026-06-05)


### Bug Fixes

* **builder:** on save, reveal the saved workouts list instead of jumping to progress ([7b9e8c2](https://github.com/Endika/ekin/commit/7b9e8c21ac59c884267fcc1add81acec6a17a24b))

## [1.2.1](https://github.com/Endika/ekin/compare/v1.2.0...v1.2.1) (2026-06-05)


### Bug Fixes

* **autofill:** treat full-body as all zones so generate is never empty ([ebb4f7e](https://github.com/Endika/ekin/commit/ebb4f7ec6b9692e80f287d20eb47b9da1cd1bc4c))

## [1.2.0](https://github.com/Endika/ekin/compare/v1.1.0...v1.2.0) (2026-06-05)


### Features

* **ui:** add light/dark theme toggle and version footer ([56bef75](https://github.com/Endika/ekin/commit/56bef75c2e93cb4d0e0db5ab2581c84516001794))


### Bug Fixes

* **autofill:** adapt panel to narrow screens and open by default ([fe2e907](https://github.com/Endika/ekin/commit/fe2e907fa200b6770b0fd109beb49c661c2d017e))

## [1.1.0](https://github.com/Endika/ekin/compare/v1.0.1...v1.1.0) (2026-06-05)


### Features

* **ai:** add optional gemini workout assistant ([743ec84](https://github.com/Endika/ekin/commit/743ec84b94a9ce850717b9738917045ea0d16c70))
* **autofill:** add workout auto-fill generator and panel ([bea9a40](https://github.com/Endika/ekin/commit/bea9a40460cbe9e0be7d484dd6c237a0168b8d86))
* **builder:** reuse and delete saved workouts ([1dbca7b](https://github.com/Endika/ekin/commit/1dbca7b0124757fac7f1c159b89ca2dc26ee7672))
* **i18n:** add 6-locale scaffolding and settings sheet ([dfa0070](https://github.com/Endika/ekin/commit/dfa007092574e0a7c09e627b9eda5770d8fe0117))
* **i18n:** localize all UI strings across components ([556680d](https://github.com/Endika/ekin/commit/556680da2365137c6651b755bd9fbca90f53aa72))
* **progress:** add per-exercise evolution chart and progress view ([919367b](https://github.com/Endika/ekin/commit/919367b3119af39e81a1586c709206586b8b3116))
* **progress:** add streak and totals stats ([144c0df](https://github.com/Endika/ekin/commit/144c0df96755153efee90eb5945b25a1089a46e7))


### Documentation

* document auto-fill, progress, ai assist and i18n ([9b71b0e](https://github.com/Endika/ekin/commit/9b71b0efe74bda366460b27a8026b1fee5577c01))

## [1.0.1](https://github.com/Endika/ekin/compare/v1.0.0...v1.0.1) (2026-06-04)


### Chores

* ignore changelog in prettier ([edaa20e](https://github.com/Endika/ekin/commit/edaa20e16bd880832fd418a8f5de24cdea252d35))

## 1.0.0 (2026-06-04)


### Features

* **app:** wire builder, player and history views ([8653e64](https://github.com/Endika/ekin/commit/8653e64f5e9e73f256f0119e1c9268e14e8d1a46))
* **builder:** add manual workout builder ui ([690d056](https://github.com/Endika/ekin/commit/690d056edf8975756295a66dbcf77a71fbe11d97))
* **catalog:** add browse and search ui ([7a7848a](https://github.com/Endika/ekin/commit/7a7848a26bcf4609b02cee33f9aef89c1d622ad2))
* **data:** add indexeddb workouts and sessions repos ([d1ea7bb](https://github.com/Endika/ekin/commit/d1ea7bb50c666f35bf612e2142e97dc03abbfd38))
* **domain:** add core types and catalog ([741ff90](https://github.com/Endika/ekin/commit/741ff90195d9c5a57e7a4ff0d11bd56a73116e98))
* **domain:** add workout reducers ([4e1f42d](https://github.com/Endika/ekin/commit/4e1f42d2a979f044dd62b34122917d182f48d512))
* **history:** add session history list ([c3271c7](https://github.com/Endika/ekin/commit/c3271c79b7339bbf53ff8c911a7d6e692f2a757f))
* **player:** add screen wake-lock helper ([00e9c26](https://github.com/Endika/ekin/commit/00e9c260dffcef30a7b3c56d280a3d190e5498c5))
* **player:** add session player ui with timer and wake-lock ([17715bf](https://github.com/Endika/ekin/commit/17715bfb5071304f38919aac3566e8463b0eba86))
* **player:** add session timer state machine ([018ad14](https://github.com/Endika/ekin/commit/018ad140ea9c2f1632ffe88b900c89e8899f98ae))
* **pwa:** add icons and offline shell ([9a79404](https://github.com/Endika/ekin/commit/9a79404434aa2bb5b4d330f0ad961cd1a910c527))
* **ui:** add brand mark, PWA icons and inline icon set ([5b1bd49](https://github.com/Endika/ekin/commit/5b1bd4952ab332b2e2b33e6853c1b9e4aeaee2ff))
* **ui:** add energy design system and self-hosted fonts ([384b464](https://github.com/Endika/ekin/commit/384b4647e5177e5dbc2da20feadcf8e621114f65))
* **ui:** redesign shell, builder, catalog, player and history ([3aa3b94](https://github.com/Endika/ekin/commit/3aa3b94a183e035ea88f1c4bca8c2eb9dbb77797))


### Bug Fixes

* **pwa:** cache exercise images and reacquire wake lock ([b6c8939](https://github.com/Endika/ekin/commit/b6c8939bfbcac524ba32d391af431a23b3f8a45d))


### Documentation

* rewrite readme with live link and badges ([88622a6](https://github.com/Endika/ekin/commit/88622a6b1818388761defb35356beda562095a43))


### Chores

* add bodyweight exercise catalog build ([7bb461f](https://github.com/Endika/ekin/commit/7bb461fff89a3637009b99df3c96565f0db00ccc))
* add MIT license ([a88469a](https://github.com/Endika/ekin/commit/a88469a41a4378341dbfd2e1a6d949fae42671fe))
* add readme and pages deploy ([75976b3](https://github.com/Endika/ekin/commit/75976b3ce0007c13ca524ca88d3abd32fd580fa4))
* add release-please and ci workflows ([7c2cc71](https://github.com/Endika/ekin/commit/7c2cc71b0d4e3098f4e0dd69f9eb25e6f56bd0c7))
* decouple exercise data fetch from build ([2ea637a](https://github.com/Endika/ekin/commit/2ea637adde7848d0bd267861b1f0636e832aaabf))
* initial commit ([2e8c445](https://github.com/Endika/ekin/commit/2e8c445b12201b2463d03bdc9dd0f91e59c28b0a))
* scaffold svelte+vite+pwa project ([9b436a7](https://github.com/Endika/ekin/commit/9b436a7ce86a529b4444e1da345d8eac4d141a59))
