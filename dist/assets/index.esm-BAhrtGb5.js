import{g as P,_ as I,a as y,b as O,i as D,p as _,u as R,F as L,c as x,C as F,r as E,d as U}from"./index-CsZT6cY-.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $="type.googleapis.com/google.protobuf.Int64Value",M="type.googleapis.com/google.protobuf.UInt64Value";function v(e,t){const n={};for(const r in e)e.hasOwnProperty(r)&&(n[r]=t(e[r]));return n}function k(e){if(e==null)return null;if(e instanceof Number&&(e=e.valueOf()),typeof e=="number"&&isFinite(e)||e===!0||e===!1||Object.prototype.toString.call(e)==="[object String]")return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(t=>k(t));if(typeof e=="function"||typeof e=="object")return v(e,t=>k(t));throw new Error("Data cannot be encoded in JSON: "+e)}function m(e){if(e==null)return e;if(e["@type"])switch(e["@type"]){case $:case M:{const t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t}default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(t=>m(t)):typeof e=="function"||typeof e=="object"?v(e,t=>m(t)):e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class f extends L{constructor(t,n,r){super(`${w}/${t}`,n||""),this.details=r,Object.setPrototypeOf(this,f.prototype)}}function G(e){if(e>=200&&e<300)return"ok";switch(e){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function T(e,t){let n=G(e),r=n,s;try{const i=t&&t.error;if(i){const a=i.status;if(typeof a=="string"){if(!N[a])return new f("internal","internal");n=N[a],r=a}const o=i.message;typeof o=="string"&&(r=o),s=i.details,s!==void 0&&(s=m(s))}}catch{}return n==="ok"?null:new f(n,r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{constructor(t,n,r,s){this.app=t,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,U(t)&&t.settings.appCheckToken&&(this.serverAppAppCheckToken=t.settings.appCheckToken),this.auth=n.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||n.get().then(i=>this.auth=i,()=>{}),this.messaging||r.get().then(i=>this.messaging=i,()=>{}),this.appCheck||s?.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{return(await this.auth.getToken())?.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const n=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(t){const n=await this.getAuthToken(),r=await this.getMessagingToken(),s=await this.getAppCheckToken(t);return{authToken:n,messagingToken:r,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const A="us-central1",J=/^data: (.*?)(?:\n|$)/;function j(e){let t=null;return{promise:new Promise((n,r)=>{t=setTimeout(()=>{r(new f("deadline-exceeded","deadline-exceeded"))},e)}),cancel:()=>{t&&clearTimeout(t)}}}class q{constructor(t,n,r,s,i=A,a=(...o)=>fetch(...o)){this.app=t,this.fetchImpl=a,this.emulatorOrigin=null,this.contextProvider=new H(t,n,r,s),this.cancelAllRequests=new Promise(o=>{this.deleteService=()=>Promise.resolve(o())});try{const o=new URL(i);this.customDomain=o.origin+(o.pathname==="/"?"":o.pathname),this.region=A}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(t){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${n}.cloudfunctions.net/${t}`}}function V(e,t,n){const r=D(t);e.emulatorOrigin=`http${r?"s":""}://${t}:${n}`,r&&(_(e.emulatorOrigin),R("Functions",!0))}function B(e,t,n){const r=s=>Y(e,t,s,n||{});return r.stream=(s,i)=>W(e,t,s,i),r}async function X(e,t,n,r){n["Content-Type"]="application/json";let s;try{s=await r(e,{method:"POST",body:JSON.stringify(t),headers:n})}catch{return{status:0,json:null}}let i=null;try{i=await s.json()}catch{}return{status:s.status,json:i}}async function S(e,t){const n={},r=await e.contextProvider.getContext(t.limitedUseAppCheckTokens);return r.authToken&&(n.Authorization="Bearer "+r.authToken),r.messagingToken&&(n["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(n["X-Firebase-AppCheck"]=r.appCheckToken),n}function Y(e,t,n,r){const s=e._url(t);return K(e,s,n,r)}async function K(e,t,n,r){n=k(n);const s={data:n},i=await S(e,r),a=r.timeout||7e4,o=j(a),u=await Promise.race([X(t,s,i,e.fetchImpl),o.promise,e.cancelAllRequests]);if(o.cancel(),!u)throw new f("cancelled","Firebase Functions instance was deleted.");const d=T(u.status,u.json);if(d)throw d;if(!u.json)throw new f("internal","Response is not valid JSON object.");let c=u.json.data;if(typeof c>"u"&&(c=u.json.result),typeof c>"u")throw new f("internal","Response is missing data field.");return{data:m(c)}}function W(e,t,n,r){const s=e._url(t);return z(e,s,n,r||{})}async function z(e,t,n,r){n=k(n);const s={data:n},i=await S(e,r);i["Content-Type"]="application/json",i.Accept="text/event-stream";let a;try{a=await e.fetchImpl(t,{method:"POST",body:JSON.stringify(s),headers:i,signal:r?.signal})}catch(l){if(l instanceof Error&&l.name==="AbortError"){const g=new f("cancelled","Request was cancelled.");return{data:Promise.reject(g),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(g)}}}}}}const h=T(0,null);return{data:Promise.reject(h),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(h)}}}}}}let o,u;const d=new Promise((l,h)=>{o=l,u=h});r?.signal?.addEventListener("abort",()=>{const l=new f("cancelled","Request was cancelled.");u(l)});const c=a.body.getReader(),p=Q(c,o,u,r?.signal);return{stream:{[Symbol.asyncIterator](){const l=p.getReader();return{async next(){const{value:h,done:g}=await l.read();return{value:h,done:g}},async return(){return await l.cancel(),{done:!0,value:void 0}}}}},data:d}}function Q(e,t,n,r){const s=(a,o)=>{const u=a.match(J);if(!u)return;const d=u[1];try{const c=JSON.parse(d);if("result"in c){t(m(c.result));return}if("message"in c){o.enqueue(m(c.message));return}if("error"in c){const p=T(0,c);o.error(p),n(p);return}}catch(c){if(c instanceof f){o.error(c),n(c);return}}},i=new TextDecoder;return new ReadableStream({start(a){let o="";return u();async function u(){if(r?.aborted){const d=new f("cancelled","Request was cancelled");return a.error(d),n(d),Promise.resolve()}try{const{value:d,done:c}=await e.read();if(c){o.trim()&&s(o.trim(),a),a.close();return}if(r?.aborted){const l=new f("cancelled","Request was cancelled");a.error(l),n(l),await e.cancel();return}o+=i.decode(d,{stream:!0});const p=o.split(`
`);o=p.pop()||"";for(const l of p)l.trim()&&s(l.trim(),a);return u()}catch(d){const c=d instanceof f?d:T(0,null);a.error(c),n(c)}}},cancel(){return e.cancel()}})}const C="@firebase/functions",b="0.13.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z="auth-internal",ee="app-check-internal",te="messaging-internal";function ne(e){const t=(n,{instanceIdentifier:r})=>{const s=n.getProvider("app").getImmediate(),i=n.getProvider(Z),a=n.getProvider(te),o=n.getProvider(ee);return new q(s,i,a,o,r)};x(new F(w,t,"PUBLIC").setMultipleInstances(!0)),E(C,b,e),E(C,b,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ie(e=P(),t=A){const r=I(y(e),w).getImmediate({identifier:t}),s=O("functions");return s&&re(r,...s),r}function re(e,t,n){V(y(e),t,n)}function oe(e,t,n){return B(y(e),t,n)}ne();export{f as FunctionsError,re as connectFunctionsEmulator,ie as getFunctions,oe as httpsCallable};
