2025-10-08T18:56:48.274Z [info] Starting chunk extraction for document: Complete Customer Onboarding System Blueprint
2025-10-08T18:56:48.274Z [info] Document length: 1825 characters
2025-10-08T18:56:48.274Z [info] Category: Complete Systems & Methodologies
2025-10-08T18:56:48.274Z [info] Detected 10 sections, 472 tokens
2025-10-08T18:57:06.113Z [info] AI response length: 5208 characters
2025-10-08T18:57:06.113Z [info] AI response preview: ```json
[
  {
    "chunk_type": "Chapter_Sequential",
    "confidence": 0.95,
    "start_line": 1,
    "end_line": 4,
    "section_heading": "Complete Customer Onboarding System Blueprint - Overview",
    "reasoning": "Top-level introduction section establishing the document's scope and key metrics
2025-10-08T18:57:06.113Z [warning] Chunk 3 too small (25 chars), expanding to 500 chars minimum
2025-10-08T18:57:06.113Z [info] Parsed 18 chunk candidates from AI response
2025-10-08T18:57:06.113Z [info] After applying limits: 15 chunks
2025-10-08T18:57:13.506Z [info] ✅ Logged API response: cer_analysis
2025-10-08T18:57:15.695Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:57:15.821Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:57:18.188Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:57:18.737Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:57:18.981Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:57:22.427Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:57:28.534Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:57:29.523Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:57:32.483Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:57:37.913Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:57:37.977Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:57:38.553Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:57:40.754Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:57:41.196Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:57:41.978Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:57:49.216Z [info] ✅ Logged API response: task_extraction
2025-10-08T18:57:49.757Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:57:53.136Z [info] ✅ Logged API response: task_extraction
2025-10-08T18:57:58.463Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:58:01.720Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:58:06.744Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:58:07.214Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:58:09.892Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:58:09.976Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:58:10.054Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:58:13.071Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:58:18.213Z [info] ✅ Logged API response: task_extraction
2025-10-08T18:58:19.331Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:58:20.971Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:58:26.672Z [info] ✅ Logged API response: training_pair_generation
2025-10-08T18:58:32.198Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:58:32.347Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:58:32.598Z [info] ✅ Logged API response: content_analysis
2025-10-08T18:58:35.137Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:58:39.797Z [info] ✅ Logged API response: risk_assessment
2025-10-08T18:58:44.029Z [info] ✅ Logged API response: task_extraction
2025-10-08T18:58:44.487Z [error] Chunk extraction error: eE [Error]: 500 {"type":"error","error":{"type":"api_error","message":"Overloaded"},"request_id":null}
    at ev.generate (/var/task/src/.next/server/chunks/7829.js:1:8311)
    at t8.makeStatusError (/var/task/src/.next/server/chunks/7829.js:6:4449)
    at t8.makeRequest (/var/task/src/.next/server/chunks/7829.js:6:7698)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async r.executePromptTemplate (/var/task/src/.next/server/chunks/3690.js:1:4294)
    at async r.generateDimensionsForChunk (/var/task/src/.next/server/chunks/3690.js:1:3571)
    at async Promise.all (index 0)
    at async r.generateDimensionsForDocument (/var/task/src/.next/server/chunks/3690.js:1:2127)
    at async f (/var/task/src/.next/server/app/api/chunks/extract/route.js:92:2540)
    at async /var/task/src/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411 {
  status: 500,
  headers: Headers {
    date: 'Wed, 08 Oct 2025 18:58:44 GMT',
    'content-type': 'application/json',
    'content-length': '86',
    connection: 'keep-alive',
    'cf-ray': '98b7dec82958d634-IAD',
    'x-should-retry': 'false',
    'request-id': 'req_011CTvF7utgLujZEthjNKrV7',
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
    'anthropic-organization-id': 'f9fb128e-3276-4baa-8667-7508e98efbdc',
    'x-envoy-upstream-service-time': '11973',
    via: '1.1 google',
    'cf-cache-status': 'DYNAMIC',
    'x-robots-tag': 'none',
    server: 'cloudflare'
  },
  requestID: 'req_011CTvF7utgLujZEthjNKrV7',
  error: {
    type: 'error',
    error: { type: 'api_error', message: 'Overloaded' },
    request_id: null
  }
}