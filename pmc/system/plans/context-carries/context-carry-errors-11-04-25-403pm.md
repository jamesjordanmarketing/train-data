17:08:11.786 Running build in Washington, D.C., USA (East) – iad1
17:08:11.786 Build machine configuration: 2 cores, 8 GB
17:08:11.970 Cloning github.com/jamesjordanmarketing/train-data (Branch: main, Commit: 7f58129)
17:08:11.971 Previous build caches not available.
17:08:13.745 Cloning completed: 1.774s
17:08:14.496 Running "vercel build"
17:08:15.093 Vercel CLI 48.8.2
17:08:16.507 Running "install" command: `cd src && npm install`...
17:09:17.301 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
17:09:18.834 npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
17:09:18.935 npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead
17:09:19.472 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
17:09:19.765 npm warn deprecated superagent@8.1.2: Please upgrade to superagent v10.2.2+, see release notes at https://github.com/forwardemail/superagent/releases/tag/v10.2.2 - maintenance is supported by Forward Email @ https://forwardemail.net
17:09:19.949 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
17:09:20.590 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
17:09:20.754 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
17:09:21.239 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
17:09:21.417 npm warn deprecated supertest@6.3.4: Please upgrade to supertest v7.1.3+, see release notes at https://github.com/forwardemail/supertest/releases/tag/v7.1.3 - maintenance is supported by Forward Email @ https://forwardemail.net
17:09:22.163 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:09:22.219 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:09:22.219 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:09:22.220 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:09:22.220 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:09:22.280 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
17:09:24.878 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
17:09:31.054 
17:09:31.055 added 957 packages, and audited 959 packages in 1m
17:09:31.057 
17:09:31.057 209 packages are looking for funding
17:09:31.057   run `npm fund` for details
17:09:31.057 
17:09:31.057 found 0 vulnerabilities
17:09:31.350 
17:09:31.352 > cat-module@0.1.0 build
17:09:31.352 > next build
17:09:31.353 
17:09:31.890 Attention: Next.js now collects completely anonymous telemetry regarding usage.
17:09:31.890 This information is used to shape Next.js' roadmap and prioritize features.
17:09:31.890 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
17:09:31.891 https://nextjs.org/telemetry
17:09:31.891 
17:09:31.946   ▲ Next.js 14.2.33
17:09:31.946 
17:09:32.006    Creating an optimized production build ...
17:09:48.504 Failed to compile.
17:09:48.504 
17:09:48.505 ./lib/backup/storage.ts
17:09:48.506 Module not found: Can't resolve '../../train-wireframe/src/lib/errors'
17:09:48.506 
17:09:48.506 https://nextjs.org/docs/messages/module-not-found
17:09:48.506 
17:09:48.506 Import trace for requested module:
17:09:48.506 ./app/api/backup/create/route.ts
17:09:48.506 
17:09:48.506 ./lib/backup/storage.ts
17:09:48.506 Module not found: Can't resolve '../../train-wireframe/src/lib/errors/error-logger'
17:09:48.506 
17:09:48.507 https://nextjs.org/docs/messages/module-not-found
17:09:48.507 
17:09:48.507 Import trace for requested module:
17:09:48.507 ./app/api/backup/create/route.ts
17:09:48.507 
17:09:48.507 ./lib/services/index.ts
17:09:48.507 Error: 
17:09:48.507   [31mx[0m the name `ValidationResult` is exported multiple times
17:09:48.507      ,-[[36;1;4m/vercel/path0/src/lib/services/index.ts[0m:102:1]
17:09:48.507  [2m102[0m |   BulkOperationResult,
17:09:48.508  [2m103[0m |   ServiceError,
17:09:48.508  [2m104[0m |   FieldError,
17:09:48.508  [2m105[0m |   ValidationResult,
17:09:48.508      : [31;1m  ^^^^^^^^|^^^^^^^[0m
17:09:48.508      :           [31;1m`-- [31;1mprevious exported here[0m[0m
17:09:48.508  [2m106[0m | } from './service-types';
17:09:48.508  [2m107[0m | 
17:09:48.508  [2m108[0m | // AI Service Types
17:09:48.509  [2m109[0m | export type { 
17:09:48.509  [2m110[0m |   GenerationConfig,
17:09:48.509  [2m111[0m |   ClaudeAPIResponse,
17:09:48.509  [2m112[0m | } from './claude-api-client';
17:09:48.509  [2m113[0m | 
17:09:48.509  [2m114[0m | export type {
17:09:48.509  [2m115[0m |   ResolvedTemplate,
17:09:48.509  [2m116[0m |   ResolveParams,
17:09:48.509  [2m117[0m | } from './template-resolver';
17:09:48.509  [2m118[0m | 
17:09:48.510  [2m119[0m | export type {
17:09:48.510  [2m120[0m |   ValidationResult,
17:09:48.510      : [33;1m  ^^^^^^^^|^^^^^^^[0m
17:09:48.510      :           [33;1m`-- [33;1mexported more than once[0m[0m
17:09:48.510  [2m121[0m |   ConversationForValidation,
17:09:48.510  [2m122[0m | } from './quality-validator';
17:09:48.510      `----
17:09:48.510 
17:09:48.510 Error: 
17:09:48.510   [36m>[0m Exported identifiers must be unique
17:09:48.510 
17:09:48.511 Import trace for requested module:
17:09:48.511 ./lib/services/index.ts
17:09:48.511 ./app/api/conversations/generate-batch/route.ts
17:09:48.511 
17:09:48.511 ../train-wireframe/src/lib/errors/error-logger.ts
17:09:48.511 Error: 
17:09:48.511   [31mx[0m Expected ':', got ','
17:09:48.511      ,-[[36;1;4m/vercel/path0/train-wireframe/src/lib/errors/error-logger.ts[0m:108:1]
17:09:48.511  [2m108[0m |         isRecoverable: entry.error.isRecoverable,
17:09:48.511  [2m109[0m |         context: entry.error.context,
17:09:48.511  [2m110[0m |         stack: entry.error.stack,
17:09:48.511  [2m111[0m |       } as AppError,
17:09:48.512      : [31;1m                   ^[0m
17:09:48.512  [2m112[0m |     };
17:09:48.512  [2m113[0m | 
17:09:48.512  [2m114[0m |     // Check queue size limit
17:09:48.512      `----
17:09:48.512 
17:09:48.512 Caused by:
17:09:48.512     Syntax Error
17:09:48.512 
17:09:48.512 Import trace for requested module:
17:09:48.512 ../train-wireframe/src/lib/errors/error-logger.ts
17:09:48.513 ./app/api/backup/create/route.ts
17:09:48.513 
17:09:48.514 
17:09:48.514 > Build failed because of webpack errors
17:09:48.559 npm error Lifecycle script `build` failed with error:
17:09:48.560 npm error code 1
17:09:48.560 npm error path /vercel/path0/src
17:09:48.560 npm error workspace cat-module@0.1.0
17:09:48.560 npm error location /vercel/path0/src
17:09:48.560 npm error command failed
17:09:48.561 npm error command sh -c next build
17:09:48.568 Error: Command "cd src && npm run build" exited with 1