import{$ as Ue,A as Ht,Aa as Z,C as Oi,Ca as U,D as Ei,Da as ct,E as ki,Ea as xt,F as Di,Fa as qi,G as Fi,Ia as ie,J as Le,Ja as Wi,Ka as It,L as jt,La as Zi,N as Mi,P as ye,Pa as dt,Q as ve,Ra as pe,S as Ai,T as Li,U as Qe,W as $i,Y as $e,_ as zi,aa as Gt,b as Nt,c as re,ca as qe,da as Pi,e as Je,ea as Ni,f as me,fa as Ri,g as ge,ga as We,h as _e,ha as Bi,ia as bt,ja as tt,k as X,ka as Ct,l as He,la as Hi,ma as Qt,oa as ji,pa as ae,sa as Gi,ta as Qi,ua as Ui,xa as Te,ya as D,z as lt,za as wt}from"./chunk-36YCFKA3.js";import{$ as be,$a as V,$b as Xe,Ab as N,Ac as at,Bb as Q,Bc as et,Dc as je,Ec as Ti,Fb as E,Fc as Ge,Gb as c,Gc as Rt,Hb as De,Hc as Vi,Ib as Fe,Ic as Bt,Jb as S,Jc as Si,Kb as W,Lb as m,Mb as g,N as vt,Na as l,O as Se,P as G,Pa as mi,Pb as fe,Q as R,Qb as we,Ra as Pt,Rb as Be,S as Re,Sa as I,Sb as rt,Ua as gi,Ub as yi,V as B,Vb as vi,Wb as bi,Xb as $,Yb as Me,Zb as z,_b as xe,a as k,aa as C,ab as H,ac as Ci,b as te,ba as w,bb as se,ca as K,da as v,db as _,ec as wi,fb as d,hb as _i,i as pi,ic as le,ja as x,ka as Ce,l as ui,lb as f,mb as a,nb as Ye,nc as xi,oa as zt,ob as Oe,pa as oe,pb as he,q as hi,qb as T,rb as ke,rc as b,sc as Y,tc as Ae,uc as Ie,vb as p,vc as Ii,w as fi,wb as u,xb as y,yb as A,zb as L}from"./chunk-2ZWRSXWG.js";var rn=(()=>{class t{_renderer;_elementRef;onChange=e=>{};onTouched=()=>{};constructor(e,i){this._renderer=e,this._elementRef=i}setProperty(e,i){this._renderer.setProperty(this._elementRef.nativeElement,e,i)}registerOnTouched(e){this.onTouched=e}registerOnChange(e){this.onChange=e}setDisabledState(e){this.setProperty("disabled",e)}static \u0275fac=function(i){return new(i||t)(I(Pt),I(zt))};static \u0275dir=se({type:t})}return t})(),io=(()=>{class t extends rn{static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275dir=se({type:t,features:[_]})}return t})(),Ke=new Re("");var no={provide:Ke,useExisting:Se(()=>an),multi:!0};function oo(){let t=Nt()?Nt().getUserAgent():"";return/android (\d+)/.test(t.toLowerCase())}var so=new Re(""),an=(()=>{class t extends rn{_compositionMode;_composing=!1;constructor(e,i,n){super(e,i),this._compositionMode=n,this._compositionMode==null&&(this._compositionMode=!oo())}writeValue(e){let i=e??"";this.setProperty("value",i)}_handleInput(e){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(e)}_compositionStart(){this._composing=!0}_compositionEnd(e){this._composing=!1,this._compositionMode&&this.onChange(e)}static \u0275fac=function(i){return new(i||t)(I(Pt),I(zt),I(so,8))};static \u0275dir=se({type:t,selectors:[["input","formControlName","",3,"type","checkbox"],["textarea","formControlName",""],["input","formControl","",3,"type","checkbox"],["textarea","formControl",""],["input","ngModel","",3,"type","checkbox"],["textarea","ngModel",""],["","ngDefaultControl",""]],hostBindings:function(i,n){i&1&&E("input",function(r){return n._handleInput(r.target.value)})("blur",function(){return n.onTouched()})("compositionstart",function(){return n._compositionStart()})("compositionend",function(r){return n._compositionEnd(r.target.value)})},standalone:!1,features:[$([no]),_]})}return t})();function Xt(t){return t==null||Jt(t)===0}function Jt(t){return t==null?null:Array.isArray(t)||typeof t=="string"?t.length:t instanceof Set?t.size:null}var ei=new Re(""),ti=new Re(""),ro=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,Ki=class{static min(o){return ao(o)}static max(o){return lo(o)}static required(o){return co(o)}static requiredTrue(o){return po(o)}static email(o){return uo(o)}static minLength(o){return ho(o)}static maxLength(o){return fo(o)}static pattern(o){return mo(o)}static nullValidator(o){return ln()}static compose(o){return fn(o)}static composeAsync(o){return gn(o)}};function ao(t){return o=>{if(o.value==null||t==null)return null;let e=parseFloat(o.value);return!isNaN(e)&&e<t?{min:{min:t,actual:o.value}}:null}}function lo(t){return o=>{if(o.value==null||t==null)return null;let e=parseFloat(o.value);return!isNaN(e)&&e>t?{max:{max:t,actual:o.value}}:null}}function co(t){return Xt(t.value)?{required:!0}:null}function po(t){return t.value===!0?null:{required:!0}}function uo(t){return Xt(t.value)||ro.test(t.value)?null:{email:!0}}function ho(t){return o=>{let e=o.value?.length??Jt(o.value);return e===null||e===0?null:e<t?{minlength:{requiredLength:t,actualLength:e}}:null}}function fo(t){return o=>{let e=o.value?.length??Jt(o.value);return e!==null&&e>t?{maxlength:{requiredLength:t,actualLength:e}}:null}}function mo(t){if(!t)return ln;let o,e;return typeof t=="string"?(e="",t.charAt(0)!=="^"&&(e+="^"),e+=t,t.charAt(t.length-1)!=="$"&&(e+="$"),o=new RegExp(e)):(e=t.toString(),o=t),i=>{if(Xt(i.value))return null;let n=i.value;return o.test(n)?null:{pattern:{requiredPattern:e,actualValue:n}}}}function ln(t){return null}function cn(t){return t!=null}function dn(t){return _i(t)?ui(t):t}function pn(t){let o={};return t.forEach(e=>{o=e!=null?k(k({},o),e):o}),Object.keys(o).length===0?null:o}function un(t,o){return o.map(e=>e(t))}function go(t){return!t.validate}function hn(t){return t.map(o=>go(o)?o:e=>o.validate(e))}function fn(t){if(!t)return null;let o=t.filter(cn);return o.length==0?null:function(e){return pn(un(e,o))}}function mn(t){return t!=null?fn(hn(t)):null}function gn(t){if(!t)return null;let o=t.filter(cn);return o.length==0?null:function(e){let i=un(e,o).map(dn);return fi(i).pipe(hi(pn))}}function _n(t){return t!=null?gn(hn(t)):null}function Yi(t,o){return t===null?[o]:Array.isArray(t)?[...t,o]:[t,o]}function yn(t){return t._rawValidators}function vn(t){return t._rawAsyncValidators}function Ut(t){return t?Array.isArray(t)?t:[t]:[]}function Vt(t,o){return Array.isArray(t)?t.includes(o):t===o}function Xi(t,o){let e=Ut(o);return Ut(t).forEach(n=>{Vt(e,n)||e.push(n)}),e}function Ji(t,o){return Ut(o).filter(e=>!Vt(t,e))}var St=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(o){this._rawValidators=o||[],this._composedValidatorFn=mn(this._rawValidators)}_setAsyncValidators(o){this._rawAsyncValidators=o||[],this._composedAsyncValidatorFn=_n(this._rawAsyncValidators)}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(o){this._onDestroyCallbacks.push(o)}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(o=>o()),this._onDestroyCallbacks=[]}reset(o=void 0){this.control&&this.control.reset(o)}hasError(o,e){return this.control?this.control.hasError(o,e):!1}getError(o,e){return this.control?this.control.getError(o,e):null}},Ze=class extends St{name;get formDirective(){return null}get path(){return null}},Ee=class extends St{_parent=null;name=null;valueAccessor=null},Ot=class{_cd;constructor(o){this._cd=o}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return!!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return!!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return!!this._cd?.control?.invalid}get isPending(){return!!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}},_o={"[class.ng-untouched]":"isUntouched","[class.ng-touched]":"isTouched","[class.ng-pristine]":"isPristine","[class.ng-dirty]":"isDirty","[class.ng-valid]":"isValid","[class.ng-invalid]":"isInvalid","[class.ng-pending]":"isPending"},Sl=te(k({},_o),{"[class.ng-submitted]":"isSubmitted"}),Ol=(()=>{class t extends Ot{constructor(e){super(e)}static \u0275fac=function(i){return new(i||t)(I(Ee,2))};static \u0275dir=se({type:t,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(i,n){i&2&&Oe("ng-untouched",n.isUntouched)("ng-touched",n.isTouched)("ng-pristine",n.isPristine)("ng-dirty",n.isDirty)("ng-valid",n.isValid)("ng-invalid",n.isInvalid)("ng-pending",n.isPending)},standalone:!1,features:[_]})}return t})(),El=(()=>{class t extends Ot{constructor(e){super(e)}static \u0275fac=function(i){return new(i||t)(I(Ze,10))};static \u0275dir=se({type:t,selectors:[["","formGroupName",""],["","formArrayName",""],["","ngModelGroup",""],["","formGroup",""],["form",3,"ngNoForm",""],["","ngForm",""]],hostVars:16,hostBindings:function(i,n){i&2&&Oe("ng-untouched",n.isUntouched)("ng-touched",n.isTouched)("ng-pristine",n.isPristine)("ng-dirty",n.isDirty)("ng-valid",n.isValid)("ng-invalid",n.isInvalid)("ng-pending",n.isPending)("ng-submitted",n.isSubmitted)},standalone:!1,features:[_]})}return t})();var pt="VALID",Tt="INVALID",it="PENDING",ut="DISABLED",ze=class{},Et=class extends ze{value;source;constructor(o,e){super(),this.value=o,this.source=e}},ht=class extends ze{pristine;source;constructor(o,e){super(),this.pristine=o,this.source=e}},ft=class extends ze{touched;source;constructor(o,e){super(),this.touched=o,this.source=e}},nt=class extends ze{status;source;constructor(o,e){super(),this.status=o,this.source=e}},qt=class extends ze{source;constructor(o){super(),this.source=o}},Wt=class extends ze{source;constructor(o){super(),this.source=o}};function ii(t){return(Mt(t)?t.validators:t)||null}function yo(t){return Array.isArray(t)?mn(t):t||null}function ni(t,o){return(Mt(o)?o.asyncValidators:t)||null}function vo(t){return Array.isArray(t)?_n(t):t||null}function Mt(t){return t!=null&&!Array.isArray(t)&&typeof t=="object"}function bn(t,o,e){let i=t.controls;if(!(o?Object.keys(i):i).length)throw new vt(1e3,"");if(!i[e])throw new vt(1001,"")}function Cn(t,o,e){t._forEachChild((i,n)=>{if(e[n]===void 0)throw new vt(1002,"")})}var ot=class{_pendingDirty=!1;_hasOwnPendingAsyncValidator=null;_pendingTouched=!1;_onCollectionChange=()=>{};_updateOn;_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(o,e){this._assignValidators(o),this._assignAsyncValidators(e)}get validator(){return this._composedValidatorFn}set validator(o){this._rawValidators=this._composedValidatorFn=o}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(o){this._rawAsyncValidators=this._composedAsyncValidatorFn=o}get parent(){return this._parent}get status(){return Ae(this.statusReactive)}set status(o){Ae(()=>this.statusReactive.set(o))}_status=Ie(()=>this.statusReactive());statusReactive=oe(void 0);get valid(){return this.status===pt}get invalid(){return this.status===Tt}get pending(){return this.status==it}get disabled(){return this.status===ut}get enabled(){return this.status!==ut}errors;get pristine(){return Ae(this.pristineReactive)}set pristine(o){Ae(()=>this.pristineReactive.set(o))}_pristine=Ie(()=>this.pristineReactive());pristineReactive=oe(!0);get dirty(){return!this.pristine}get touched(){return Ae(this.touchedReactive)}set touched(o){Ae(()=>this.touchedReactive.set(o))}_touched=Ie(()=>this.touchedReactive());touchedReactive=oe(!1);get untouched(){return!this.touched}_events=new pi;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(o){this._assignValidators(o)}setAsyncValidators(o){this._assignAsyncValidators(o)}addValidators(o){this.setValidators(Xi(o,this._rawValidators))}addAsyncValidators(o){this.setAsyncValidators(Xi(o,this._rawAsyncValidators))}removeValidators(o){this.setValidators(Ji(o,this._rawValidators))}removeAsyncValidators(o){this.setAsyncValidators(Ji(o,this._rawAsyncValidators))}hasValidator(o){return Vt(this._rawValidators,o)}hasAsyncValidator(o){return Vt(this._rawAsyncValidators,o)}clearValidators(){this.validator=null}clearAsyncValidators(){this.asyncValidator=null}markAsTouched(o={}){let e=this.touched===!1;this.touched=!0;let i=o.sourceControl??this;this._parent&&!o.onlySelf&&this._parent.markAsTouched(te(k({},o),{sourceControl:i})),e&&o.emitEvent!==!1&&this._events.next(new ft(!0,i))}markAllAsTouched(o={}){this.markAsTouched({onlySelf:!0,emitEvent:o.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsTouched(o))}markAsUntouched(o={}){let e=this.touched===!0;this.touched=!1,this._pendingTouched=!1;let i=o.sourceControl??this;this._forEachChild(n=>{n.markAsUntouched({onlySelf:!0,emitEvent:o.emitEvent,sourceControl:i})}),this._parent&&!o.onlySelf&&this._parent._updateTouched(o,i),e&&o.emitEvent!==!1&&this._events.next(new ft(!1,i))}markAsDirty(o={}){let e=this.pristine===!0;this.pristine=!1;let i=o.sourceControl??this;this._parent&&!o.onlySelf&&this._parent.markAsDirty(te(k({},o),{sourceControl:i})),e&&o.emitEvent!==!1&&this._events.next(new ht(!1,i))}markAsPristine(o={}){let e=this.pristine===!1;this.pristine=!0,this._pendingDirty=!1;let i=o.sourceControl??this;this._forEachChild(n=>{n.markAsPristine({onlySelf:!0,emitEvent:o.emitEvent})}),this._parent&&!o.onlySelf&&this._parent._updatePristine(o,i),e&&o.emitEvent!==!1&&this._events.next(new ht(!0,i))}markAsPending(o={}){this.status=it;let e=o.sourceControl??this;o.emitEvent!==!1&&(this._events.next(new nt(this.status,e)),this.statusChanges.emit(this.status)),this._parent&&!o.onlySelf&&this._parent.markAsPending(te(k({},o),{sourceControl:e}))}disable(o={}){let e=this._parentMarkedDirty(o.onlySelf);this.status=ut,this.errors=null,this._forEachChild(n=>{n.disable(te(k({},o),{onlySelf:!0}))}),this._updateValue();let i=o.sourceControl??this;o.emitEvent!==!1&&(this._events.next(new Et(this.value,i)),this._events.next(new nt(this.status,i)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(te(k({},o),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(n=>n(!0))}enable(o={}){let e=this._parentMarkedDirty(o.onlySelf);this.status=pt,this._forEachChild(i=>{i.enable(te(k({},o),{onlySelf:!0}))}),this.updateValueAndValidity({onlySelf:!0,emitEvent:o.emitEvent}),this._updateAncestors(te(k({},o),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(i=>i(!1))}_updateAncestors(o,e){this._parent&&!o.onlySelf&&(this._parent.updateValueAndValidity(o),o.skipPristineCheck||this._parent._updatePristine({},e),this._parent._updateTouched({},e))}setParent(o){this._parent=o}getRawValue(){return this.value}updateValueAndValidity(o={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let i=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===pt||this.status===it)&&this._runAsyncValidator(i,o.emitEvent)}let e=o.sourceControl??this;o.emitEvent!==!1&&(this._events.next(new Et(this.value,e)),this._events.next(new nt(this.status,e)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._parent&&!o.onlySelf&&this._parent.updateValueAndValidity(te(k({},o),{sourceControl:e}))}_updateTreeValidity(o={emitEvent:!0}){this._forEachChild(e=>e._updateTreeValidity(o)),this.updateValueAndValidity({onlySelf:!0,emitEvent:o.emitEvent})}_setInitialStatus(){this.status=this._allControlsDisabled()?ut:pt}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(o,e){if(this.asyncValidator){this.status=it,this._hasOwnPendingAsyncValidator={emitEvent:e!==!1};let i=dn(this.asyncValidator(this));this._asyncValidationSubscription=i.subscribe(n=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(n,{emitEvent:e,shouldHaveEmitted:o})})}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let o=this._hasOwnPendingAsyncValidator?.emitEvent??!1;return this._hasOwnPendingAsyncValidator=null,o}return!1}setErrors(o,e={}){this.errors=o,this._updateControlsErrors(e.emitEvent!==!1,this,e.shouldHaveEmitted)}get(o){let e=o;return e==null||(Array.isArray(e)||(e=e.split(".")),e.length===0)?null:e.reduce((i,n)=>i&&i._find(n),this)}getError(o,e){let i=e?this.get(e):this;return i&&i.errors?i.errors[o]:null}hasError(o,e){return!!this.getError(o,e)}get root(){let o=this;for(;o._parent;)o=o._parent;return o}_updateControlsErrors(o,e,i){this.status=this._calculateStatus(),o&&this.statusChanges.emit(this.status),(o||i)&&this._events.next(new nt(this.status,e)),this._parent&&this._parent._updateControlsErrors(o,e,i)}_initObservables(){this.valueChanges=new x,this.statusChanges=new x}_calculateStatus(){return this._allControlsDisabled()?ut:this.errors?Tt:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(it)?it:this._anyControlsHaveStatus(Tt)?Tt:pt}_anyControlsHaveStatus(o){return this._anyControls(e=>e.status===o)}_anyControlsDirty(){return this._anyControls(o=>o.dirty)}_anyControlsTouched(){return this._anyControls(o=>o.touched)}_updatePristine(o,e){let i=!this._anyControlsDirty(),n=this.pristine!==i;this.pristine=i,this._parent&&!o.onlySelf&&this._parent._updatePristine(o,e),n&&this._events.next(new ht(this.pristine,e))}_updateTouched(o={},e){this.touched=this._anyControlsTouched(),this._events.next(new ft(this.touched,e)),this._parent&&!o.onlySelf&&this._parent._updateTouched(o,e)}_onDisabledChange=[];_registerOnCollectionChange(o){this._onCollectionChange=o}_setUpdateStrategy(o){Mt(o)&&o.updateOn!=null&&(this._updateOn=o.updateOn)}_parentMarkedDirty(o){let e=this._parent&&this._parent.dirty;return!o&&!!e&&!this._parent._anyControlsDirty()}_find(o){return null}_assignValidators(o){this._rawValidators=Array.isArray(o)?o.slice():o,this._composedValidatorFn=yo(this._rawValidators)}_assignAsyncValidators(o){this._rawAsyncValidators=Array.isArray(o)?o.slice():o,this._composedAsyncValidatorFn=vo(this._rawAsyncValidators)}},kt=class extends ot{constructor(o,e,i){super(ii(e),ni(i,e)),this.controls=o,this._initObservables(),this._setUpdateStrategy(e),this._setUpControls(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator})}controls;registerControl(o,e){return this.controls[o]?this.controls[o]:(this.controls[o]=e,e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange),e)}addControl(o,e,i={}){this.registerControl(o,e),this.updateValueAndValidity({emitEvent:i.emitEvent}),this._onCollectionChange()}removeControl(o,e={}){this.controls[o]&&this.controls[o]._registerOnCollectionChange(()=>{}),delete this.controls[o],this.updateValueAndValidity({emitEvent:e.emitEvent}),this._onCollectionChange()}setControl(o,e,i={}){this.controls[o]&&this.controls[o]._registerOnCollectionChange(()=>{}),delete this.controls[o],e&&this.registerControl(o,e),this.updateValueAndValidity({emitEvent:i.emitEvent}),this._onCollectionChange()}contains(o){return this.controls.hasOwnProperty(o)&&this.controls[o].enabled}setValue(o,e={}){Cn(this,!0,o),Object.keys(o).forEach(i=>{bn(this,!0,i),this.controls[i].setValue(o[i],{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e)}patchValue(o,e={}){o!=null&&(Object.keys(o).forEach(i=>{let n=this.controls[i];n&&n.patchValue(o[i],{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e))}reset(o={},e={}){this._forEachChild((i,n)=>{i.reset(o?o[n]:null,{onlySelf:!0,emitEvent:e.emitEvent})}),this._updatePristine(e,this),this._updateTouched(e,this),this.updateValueAndValidity(e)}getRawValue(){return this._reduceChildren({},(o,e,i)=>(o[i]=e.getRawValue(),o))}_syncPendingControls(){let o=this._reduceChildren(!1,(e,i)=>i._syncPendingControls()?!0:e);return o&&this.updateValueAndValidity({onlySelf:!0}),o}_forEachChild(o){Object.keys(this.controls).forEach(e=>{let i=this.controls[e];i&&o(i,e)})}_setUpControls(){this._forEachChild(o=>{o.setParent(this),o._registerOnCollectionChange(this._onCollectionChange)})}_updateValue(){this.value=this._reduceValue()}_anyControls(o){for(let[e,i]of Object.entries(this.controls))if(this.contains(e)&&o(i))return!0;return!1}_reduceValue(){let o={};return this._reduceChildren(o,(e,i,n)=>((i.enabled||this.disabled)&&(e[n]=i.value),e))}_reduceChildren(o,e){let i=o;return this._forEachChild((n,s)=>{i=e(i,n,s)}),i}_allControlsDisabled(){for(let o of Object.keys(this.controls))if(this.controls[o].enabled)return!1;return Object.keys(this.controls).length>0||this.disabled}_find(o){return this.controls.hasOwnProperty(o)?this.controls[o]:null}};var Zt=class extends kt{};var At=new Re("",{providedIn:"root",factory:()=>Lt}),Lt="always";function wn(t,o){return[...o.path,t]}function Kt(t,o,e=Lt){oi(t,o),o.valueAccessor.writeValue(t.value),(t.disabled||e==="always")&&o.valueAccessor.setDisabledState?.(t.disabled),Co(t,o),xo(t,o),wo(t,o),bo(t,o)}function en(t,o,e=!0){let i=()=>{};o.valueAccessor&&(o.valueAccessor.registerOnChange(i),o.valueAccessor.registerOnTouched(i)),Ft(t,o),t&&(o._invokeOnDestroyCallbacks(),t._registerOnCollectionChange(()=>{}))}function Dt(t,o){t.forEach(e=>{e.registerOnValidatorChange&&e.registerOnValidatorChange(o)})}function bo(t,o){if(o.valueAccessor.setDisabledState){let e=i=>{o.valueAccessor.setDisabledState(i)};t.registerOnDisabledChange(e),o._registerOnDestroy(()=>{t._unregisterOnDisabledChange(e)})}}function oi(t,o){let e=yn(t);o.validator!==null?t.setValidators(Yi(e,o.validator)):typeof e=="function"&&t.setValidators([e]);let i=vn(t);o.asyncValidator!==null?t.setAsyncValidators(Yi(i,o.asyncValidator)):typeof i=="function"&&t.setAsyncValidators([i]);let n=()=>t.updateValueAndValidity();Dt(o._rawValidators,n),Dt(o._rawAsyncValidators,n)}function Ft(t,o){let e=!1;if(t!==null){if(o.validator!==null){let n=yn(t);if(Array.isArray(n)&&n.length>0){let s=n.filter(r=>r!==o.validator);s.length!==n.length&&(e=!0,t.setValidators(s))}}if(o.asyncValidator!==null){let n=vn(t);if(Array.isArray(n)&&n.length>0){let s=n.filter(r=>r!==o.asyncValidator);s.length!==n.length&&(e=!0,t.setAsyncValidators(s))}}}let i=()=>{};return Dt(o._rawValidators,i),Dt(o._rawAsyncValidators,i),e}function Co(t,o){o.valueAccessor.registerOnChange(e=>{t._pendingValue=e,t._pendingChange=!0,t._pendingDirty=!0,t.updateOn==="change"&&xn(t,o)})}function wo(t,o){o.valueAccessor.registerOnTouched(()=>{t._pendingTouched=!0,t.updateOn==="blur"&&t._pendingChange&&xn(t,o),t.updateOn!=="submit"&&t.markAsTouched()})}function xn(t,o){t._pendingDirty&&t.markAsDirty(),t.setValue(t._pendingValue,{emitModelToViewChange:!1}),o.viewToModelUpdate(t._pendingValue),t._pendingChange=!1}function xo(t,o){let e=(i,n)=>{o.valueAccessor.writeValue(i),n&&o.viewToModelUpdate(i)};t.registerOnChange(e),o._registerOnDestroy(()=>{t._unregisterOnChange(e)})}function Io(t,o){t==null,oi(t,o)}function To(t,o){return Ft(t,o)}function In(t,o){if(!t.hasOwnProperty("model"))return!1;let e=t.model;return e.isFirstChange()?!0:!Object.is(o,e.currentValue)}function Vo(t){return Object.getPrototypeOf(t.constructor)===io}function So(t,o){t._syncPendingControls(),o.forEach(e=>{let i=e.control;i.updateOn==="submit"&&i._pendingChange&&(e.viewToModelUpdate(i._pendingValue),i._pendingChange=!1)})}function Tn(t,o){if(!o)return null;Array.isArray(o);let e,i,n;return o.forEach(s=>{s.constructor===an?e=s:Vo(s)?i=s:n=s}),n||i||e||null}function Oo(t,o){let e=t.indexOf(o);e>-1&&t.splice(e,1)}function tn(t,o){let e=t.indexOf(o);e>-1&&t.splice(e,1)}function nn(t){return typeof t=="object"&&t!==null&&Object.keys(t).length===2&&"value"in t&&"disabled"in t}var mt=class extends ot{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=!1;constructor(o=null,e,i){super(ii(e),ni(i,e)),this._applyFormState(o),this._setUpdateStrategy(e),this._initObservables(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator}),Mt(e)&&(e.nonNullable||e.initialValueIsDefault)&&(nn(o)?this.defaultValue=o.value:this.defaultValue=o)}setValue(o,e={}){this.value=this._pendingValue=o,this._onChange.length&&e.emitModelToViewChange!==!1&&this._onChange.forEach(i=>i(this.value,e.emitViewToModelChange!==!1)),this.updateValueAndValidity(e)}patchValue(o,e={}){this.setValue(o,e)}reset(o=this.defaultValue,e={}){this._applyFormState(o),this.markAsPristine(e),this.markAsUntouched(e),this.setValue(this.value,e),this._pendingChange=!1}_updateValue(){}_anyControls(o){return!1}_allControlsDisabled(){return this.disabled}registerOnChange(o){this._onChange.push(o)}_unregisterOnChange(o){tn(this._onChange,o)}registerOnDisabledChange(o){this._onDisabledChange.push(o)}_unregisterOnDisabledChange(o){tn(this._onDisabledChange,o)}_forEachChild(o){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:!0,emitModelToViewChange:!1}),!0):!1}_applyFormState(o){nn(o)?(this.value=this._pendingValue=o.value,o.disabled?this.disable({onlySelf:!0,emitEvent:!1}):this.enable({onlySelf:!0,emitEvent:!1})):this.value=this._pendingValue=o}};var Eo=t=>t instanceof mt;var ko={provide:Ee,useExisting:Se(()=>si)},on=Promise.resolve(),si=(()=>{class t extends Ee{_changeDetectorRef;callSetDisabledState;control=new mt;static ngAcceptInputType_isDisabled;_registered=!1;viewModel;name="";isDisabled;model;options;update=new x;constructor(e,i,n,s,r,h){super(),this._changeDetectorRef=r,this.callSetDisabledState=h,this._parent=e,this._setValidators(i),this._setAsyncValidators(n),this.valueAccessor=Tn(this,s)}ngOnChanges(e){if(this._checkForErrors(),!this._registered||"name"in e){if(this._registered&&(this._checkName(),this.formDirective)){let i=e.name.previousValue;this.formDirective.removeControl({name:i,path:this._getPath(i)})}this._setUpControl()}"isDisabled"in e&&this._updateDisabled(e),In(e,this.viewModel)&&(this._updateValue(this.model),this.viewModel=this.model)}ngOnDestroy(){this.formDirective&&this.formDirective.removeControl(this)}get path(){return this._getPath(this.name)}get formDirective(){return this._parent?this._parent.formDirective:null}viewToModelUpdate(e){this.viewModel=e,this.update.emit(e)}_setUpControl(){this._setUpdateStrategy(),this._isStandalone()?this._setUpStandalone():this.formDirective.addControl(this),this._registered=!0}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.control._updateOn=this.options.updateOn)}_isStandalone(){return!this._parent||!!(this.options&&this.options.standalone)}_setUpStandalone(){Kt(this.control,this,this.callSetDisabledState),this.control.updateValueAndValidity({emitEvent:!1})}_checkForErrors(){this._checkName()}_checkName(){this.options&&this.options.name&&(this.name=this.options.name),!this._isStandalone()&&this.name}_updateValue(e){on.then(()=>{this.control.setValue(e,{emitViewToModelChange:!1}),this._changeDetectorRef?.markForCheck()})}_updateDisabled(e){let i=e.isDisabled.currentValue,n=i!==0&&b(i);on.then(()=>{n&&!this.control.disabled?this.control.disable():!n&&this.control.disabled&&this.control.enable(),this._changeDetectorRef?.markForCheck()})}_getPath(e){return this._parent?wn(e,this._parent):[e]}static \u0275fac=function(i){return new(i||t)(I(Ze,9),I(ei,10),I(ti,10),I(Ke,10),I(xi,8),I(At,8))};static \u0275dir=se({type:t,selectors:[["","ngModel","",3,"formControlName","",3,"formControl",""]],inputs:{name:"name",isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"],options:[0,"ngModelOptions","options"]},outputs:{update:"ngModelChange"},exportAs:["ngModel"],standalone:!1,features:[$([ko]),_,be]})}return t})();var Dl=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275dir=se({type:t,selectors:[["form",3,"ngNoForm","",3,"ngNativeValidate",""]],hostAttrs:["novalidate",""],standalone:!1})}return t})();var Vn=new Re("");var Do={provide:Ze,useExisting:Se(()=>Fo)},Fo=(()=>{class t extends Ze{callSetDisabledState;get submitted(){return Ae(this._submittedReactive)}set submitted(e){this._submittedReactive.set(e)}_submitted=Ie(()=>this._submittedReactive());_submittedReactive=oe(!1);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];form=null;ngSubmit=new x;constructor(e,i,n){super(),this.callSetDisabledState=n,this._setValidators(e),this._setAsyncValidators(i)}ngOnChanges(e){e.hasOwnProperty("form")&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form)}ngOnDestroy(){this.form&&(Ft(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}))}get formDirective(){return this}get control(){return this.form}get path(){return[]}addControl(e){let i=this.form.get(e.path);return Kt(i,e,this.callSetDisabledState),i.updateValueAndValidity({emitEvent:!1}),this.directives.push(e),i}getControl(e){return this.form.get(e.path)}removeControl(e){en(e.control||null,e,!1),Oo(this.directives,e)}addFormGroup(e){this._setUpFormContainer(e)}removeFormGroup(e){this._cleanUpFormContainer(e)}getFormGroup(e){return this.form.get(e.path)}addFormArray(e){this._setUpFormContainer(e)}removeFormArray(e){this._cleanUpFormContainer(e)}getFormArray(e){return this.form.get(e.path)}updateModel(e,i){this.form.get(e.path).setValue(i)}onSubmit(e){return this._submittedReactive.set(!0),So(this.form,this.directives),this.ngSubmit.emit(e),this.form._events.next(new qt(this.control)),e?.target?.method==="dialog"}onReset(){this.resetForm()}resetForm(e=void 0){this.form.reset(e),this._submittedReactive.set(!1),this.form._events.next(new Wt(this.form))}_updateDomValue(){this.directives.forEach(e=>{let i=e.control,n=this.form.get(e.path);i!==n&&(en(i||null,e),Eo(n)&&(Kt(n,e,this.callSetDisabledState),e.control=n))}),this.form._updateTreeValidity({emitEvent:!1})}_setUpFormContainer(e){let i=this.form.get(e.path);Io(i,e),i.updateValueAndValidity({emitEvent:!1})}_cleanUpFormContainer(e){if(this.form){let i=this.form.get(e.path);i&&To(i,e)&&i.updateValueAndValidity({emitEvent:!1})}}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm&&this._oldForm._registerOnCollectionChange(()=>{})}_updateValidators(){oi(this.form,this),this._oldForm&&Ft(this._oldForm,this)}static \u0275fac=function(i){return new(i||t)(I(ei,10),I(ti,10),I(At,8))};static \u0275dir=se({type:t,selectors:[["","formGroup",""]],hostBindings:function(i,n){i&1&&E("submit",function(r){return n.onSubmit(r)})("reset",function(){return n.onReset()})},inputs:{form:[0,"formGroup","form"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:!1,features:[$([Do]),_,be]})}return t})();var Mo={provide:Ee,useExisting:Se(()=>Ao)},Ao=(()=>{class t extends Ee{_ngModelWarningConfig;_added=!1;viewModel;control;name=null;set isDisabled(e){}model;update=new x;static _ngModelWarningSentOnce=!1;_ngModelWarningSent=!1;constructor(e,i,n,s,r){super(),this._ngModelWarningConfig=r,this._parent=e,this._setValidators(i),this._setAsyncValidators(n),this.valueAccessor=Tn(this,s)}ngOnChanges(e){this._added||this._setUpControl(),In(e,this.viewModel)&&(this.viewModel=this.model,this.formDirective.updateModel(this,this.model))}ngOnDestroy(){this.formDirective&&this.formDirective.removeControl(this)}viewToModelUpdate(e){this.viewModel=e,this.update.emit(e)}get path(){return wn(this.name==null?this.name:this.name.toString(),this._parent)}get formDirective(){return this._parent?this._parent.formDirective:null}_setUpControl(){this.control=this.formDirective.addControl(this),this._added=!0}static \u0275fac=function(i){return new(i||t)(I(Ze,13),I(ei,10),I(ti,10),I(Ke,10),I(Vn,8))};static \u0275dir=se({type:t,selectors:[["","formControlName",""]],inputs:{name:[0,"formControlName","name"],isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"]},outputs:{update:"ngModelChange"},standalone:!1,features:[$([Mo]),_,be]})}return t})();var Sn=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({})}return t})(),Yt=class extends ot{constructor(o,e,i){super(ii(e),ni(i,e)),this.controls=o,this._initObservables(),this._setUpdateStrategy(e),this._setUpControls(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator})}controls;at(o){return this.controls[this._adjustIndex(o)]}push(o,e={}){this.controls.push(o),this._registerControl(o),this.updateValueAndValidity({emitEvent:e.emitEvent}),this._onCollectionChange()}insert(o,e,i={}){this.controls.splice(o,0,e),this._registerControl(e),this.updateValueAndValidity({emitEvent:i.emitEvent})}removeAt(o,e={}){let i=this._adjustIndex(o);i<0&&(i=0),this.controls[i]&&this.controls[i]._registerOnCollectionChange(()=>{}),this.controls.splice(i,1),this.updateValueAndValidity({emitEvent:e.emitEvent})}setControl(o,e,i={}){let n=this._adjustIndex(o);n<0&&(n=0),this.controls[n]&&this.controls[n]._registerOnCollectionChange(()=>{}),this.controls.splice(n,1),e&&(this.controls.splice(n,0,e),this._registerControl(e)),this.updateValueAndValidity({emitEvent:i.emitEvent}),this._onCollectionChange()}get length(){return this.controls.length}setValue(o,e={}){Cn(this,!1,o),o.forEach((i,n)=>{bn(this,!1,n),this.at(n).setValue(i,{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e)}patchValue(o,e={}){o!=null&&(o.forEach((i,n)=>{this.at(n)&&this.at(n).patchValue(i,{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e))}reset(o=[],e={}){this._forEachChild((i,n)=>{i.reset(o[n],{onlySelf:!0,emitEvent:e.emitEvent})}),this._updatePristine(e,this),this._updateTouched(e,this),this.updateValueAndValidity(e)}getRawValue(){return this.controls.map(o=>o.getRawValue())}clear(o={}){this.controls.length<1||(this._forEachChild(e=>e._registerOnCollectionChange(()=>{})),this.controls.splice(0),this.updateValueAndValidity({emitEvent:o.emitEvent}))}_adjustIndex(o){return o<0?o+this.length:o}_syncPendingControls(){let o=this.controls.reduce((e,i)=>i._syncPendingControls()?!0:e,!1);return o&&this.updateValueAndValidity({onlySelf:!0}),o}_forEachChild(o){this.controls.forEach((e,i)=>{o(e,i)})}_updateValue(){this.value=this.controls.filter(o=>o.enabled||this.disabled).map(o=>o.value)}_anyControls(o){return this.controls.some(e=>e.enabled&&o(e))}_setUpControls(){this._forEachChild(o=>this._registerControl(o))}_allControlsDisabled(){for(let o of this.controls)if(o.enabled)return!1;return this.controls.length>0||this.disabled}_registerControl(o){o.setParent(this),o._registerOnCollectionChange(this._onCollectionChange)}_find(o){return this.at(o)??null}};function sn(t){return!!t&&(t.asyncValidators!==void 0||t.validators!==void 0||t.updateOn!==void 0)}var Fl=(()=>{class t{useNonNullable=!1;get nonNullable(){let e=new t;return e.useNonNullable=!0,e}group(e,i=null){let n=this._reduceControls(e),s={};return sn(i)?s=i:i!==null&&(s.validators=i.validator,s.asyncValidators=i.asyncValidator),new kt(n,s)}record(e,i=null){let n=this._reduceControls(e);return new Zt(n,i)}control(e,i,n){let s={};return this.useNonNullable?(sn(i)?s=i:(s.validators=i,s.asyncValidators=n),new mt(e,te(k({},s),{nonNullable:!0}))):new mt(e,i,n)}array(e,i,n){let s=e.map(r=>this._createControl(r));return new Yt(s,i,n)}_reduceControls(e){let i={};return Object.keys(e).forEach(n=>{i[n]=this._createControl(e[n])}),i}_createControl(e){if(e instanceof mt)return e;if(e instanceof ot)return e;if(Array.isArray(e)){let i=e[0],n=e.length>1?e[1]:null,s=e.length>2?e[2]:null;return this.control(i,n,s)}else return this.control(e)}static \u0275fac=function(i){return new(i||t)};static \u0275prov=G({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var Ml=(()=>{class t{static withConfig(e){return{ngModule:t,providers:[{provide:At,useValue:e.callSetDisabledState??Lt}]}}static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[Sn]})}return t})(),Al=(()=>{class t{static withConfig(e){return{ngModule:t,providers:[{provide:Vn,useValue:e.warnOnNgModelWithFormControl??"always"},{provide:At,useValue:e.callSetDisabledState??Lt}]}}static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[Sn]})}return t})();var On=(()=>{class t extends ie{static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["BlankIcon"]],features:[_],decls:2,vars:0,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["width","1","height","1","fill","currentColor","fill-opacity","0"]],template:function(i,n){i&1&&(K(),p(0,"svg",0),y(1,"rect",1),u())},encapsulation:2})}return t})();var st=(()=>{class t extends ie{static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["CheckIcon"]],features:[_],decls:2,vars:5,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["d","M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z","fill","currentColor"]],template:function(i,n){i&1&&(K(),p(0,"svg",0),y(1,"path",1),u()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role))},encapsulation:2})}return t})();var En=(()=>{class t extends ie{static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["ChevronDownIcon"]],features:[_],decls:2,vars:5,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["d","M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z","fill","currentColor"]],template:function(i,n){i&1&&(K(),p(0,"svg",0),y(1,"path",1),u()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role))},encapsulation:2})}return t})();var kn=(()=>{class t extends ie{pathId;ngOnInit(){this.pathId="url(#"+ae()+")"}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["ExclamationTriangleIcon"]],features:[_],decls:8,vars:7,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["d","M13.4018 13.1893H0.598161C0.49329 13.189 0.390283 13.1615 0.299143 13.1097C0.208003 13.0578 0.131826 12.9832 0.0780112 12.8932C0.0268539 12.8015 0 12.6982 0 12.5931C0 12.4881 0.0268539 12.3848 0.0780112 12.293L6.47985 1.08982C6.53679 1.00399 6.61408 0.933574 6.70484 0.884867C6.7956 0.836159 6.897 0.810669 7 0.810669C7.103 0.810669 7.2044 0.836159 7.29516 0.884867C7.38592 0.933574 7.46321 1.00399 7.52015 1.08982L13.922 12.293C13.9731 12.3848 14 12.4881 14 12.5931C14 12.6982 13.9731 12.8015 13.922 12.8932C13.8682 12.9832 13.792 13.0578 13.7009 13.1097C13.6097 13.1615 13.5067 13.189 13.4018 13.1893ZM1.63046 11.989H12.3695L7 2.59425L1.63046 11.989Z","fill","currentColor"],["d","M6.99996 8.78801C6.84143 8.78594 6.68997 8.72204 6.57787 8.60993C6.46576 8.49782 6.40186 8.34637 6.39979 8.18784V5.38703C6.39979 5.22786 6.46302 5.0752 6.57557 4.96265C6.68813 4.85009 6.84078 4.78686 6.99996 4.78686C7.15914 4.78686 7.31179 4.85009 7.42435 4.96265C7.5369 5.0752 7.60013 5.22786 7.60013 5.38703V8.18784C7.59806 8.34637 7.53416 8.49782 7.42205 8.60993C7.30995 8.72204 7.15849 8.78594 6.99996 8.78801Z","fill","currentColor"],["d","M6.99996 11.1887C6.84143 11.1866 6.68997 11.1227 6.57787 11.0106C6.46576 10.8985 6.40186 10.7471 6.39979 10.5885V10.1884C6.39979 10.0292 6.46302 9.87658 6.57557 9.76403C6.68813 9.65147 6.84078 9.58824 6.99996 9.58824C7.15914 9.58824 7.31179 9.65147 7.42435 9.76403C7.5369 9.87658 7.60013 10.0292 7.60013 10.1884V10.5885C7.59806 10.7471 7.53416 10.8985 7.42205 11.0106C7.30995 11.1227 7.15849 11.1866 6.99996 11.1887Z","fill","currentColor"],[3,"id"],["width","14","height","14","fill","white"]],template:function(i,n){i&1&&(K(),p(0,"svg",0)(1,"g"),y(2,"path",1)(3,"path",2)(4,"path",3),u(),p(5,"defs")(6,"clipPath",4),y(7,"rect",5),u()()()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role),l(),f("clip-path",n.pathId),l(5),a("id",n.pathId))},encapsulation:2})}return t})();var Dn=(()=>{class t extends ie{pathId;ngOnInit(){this.pathId="url(#"+ae()+")"}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["InfoCircleIcon"]],features:[_],decls:6,vars:7,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["fill-rule","evenodd","clip-rule","evenodd","d","M3.11101 12.8203C4.26215 13.5895 5.61553 14 7 14C8.85652 14 10.637 13.2625 11.9497 11.9497C13.2625 10.637 14 8.85652 14 7C14 5.61553 13.5895 4.26215 12.8203 3.11101C12.0511 1.95987 10.9579 1.06266 9.67879 0.532846C8.3997 0.00303296 6.99224 -0.13559 5.63437 0.134506C4.2765 0.404603 3.02922 1.07129 2.05026 2.05026C1.07129 3.02922 0.404603 4.2765 0.134506 5.63437C-0.13559 6.99224 0.00303296 8.3997 0.532846 9.67879C1.06266 10.9579 1.95987 12.0511 3.11101 12.8203ZM3.75918 2.14976C4.71846 1.50879 5.84628 1.16667 7 1.16667C8.5471 1.16667 10.0308 1.78125 11.1248 2.87521C12.2188 3.96918 12.8333 5.45291 12.8333 7C12.8333 8.15373 12.4912 9.28154 11.8502 10.2408C11.2093 11.2001 10.2982 11.9478 9.23232 12.3893C8.16642 12.8308 6.99353 12.9463 5.86198 12.7212C4.73042 12.4962 3.69102 11.9406 2.87521 11.1248C2.05941 10.309 1.50384 9.26958 1.27876 8.13803C1.05367 7.00647 1.16919 5.83358 1.61071 4.76768C2.05222 3.70178 2.79989 2.79074 3.75918 2.14976ZM7.00002 4.8611C6.84594 4.85908 6.69873 4.79698 6.58977 4.68801C6.48081 4.57905 6.4187 4.43185 6.41669 4.27776V3.88888C6.41669 3.73417 6.47815 3.58579 6.58754 3.4764C6.69694 3.367 6.84531 3.30554 7.00002 3.30554C7.15473 3.30554 7.3031 3.367 7.4125 3.4764C7.52189 3.58579 7.58335 3.73417 7.58335 3.88888V4.27776C7.58134 4.43185 7.51923 4.57905 7.41027 4.68801C7.30131 4.79698 7.1541 4.85908 7.00002 4.8611ZM7.00002 10.6945C6.84594 10.6925 6.69873 10.6304 6.58977 10.5214C6.48081 10.4124 6.4187 10.2652 6.41669 10.1111V6.22225C6.41669 6.06754 6.47815 5.91917 6.58754 5.80977C6.69694 5.70037 6.84531 5.63892 7.00002 5.63892C7.15473 5.63892 7.3031 5.70037 7.4125 5.80977C7.52189 5.91917 7.58335 6.06754 7.58335 6.22225V10.1111C7.58134 10.2652 7.51923 10.4124 7.41027 10.5214C7.30131 10.6304 7.1541 10.6925 7.00002 10.6945Z","fill","currentColor"],[3,"id"],["width","14","height","14","fill","white"]],template:function(i,n){i&1&&(K(),p(0,"svg",0)(1,"g"),y(2,"path",1),u(),p(3,"defs")(4,"clipPath",2),y(5,"rect",3),u()()()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role),l(),f("clip-path",n.pathId),l(3),a("id",n.pathId))},encapsulation:2})}return t})();var Fn=(()=>{class t extends ie{static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["MinusIcon"]],features:[_],decls:2,vars:5,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["d","M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z","fill","currentColor"]],template:function(i,n){i&1&&(K(),p(0,"svg",0),y(1,"path",1),u()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role))},encapsulation:2})}return t})();var Mn=(()=>{class t extends ie{pathId;ngOnInit(){this.pathId="url(#"+ae()+")"}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["SearchIcon"]],features:[_],decls:6,vars:7,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["fill-rule","evenodd","clip-rule","evenodd","d","M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z","fill","currentColor"],[3,"id"],["width","14","height","14","fill","white"]],template:function(i,n){i&1&&(K(),p(0,"svg",0)(1,"g"),y(2,"path",1),u(),p(3,"defs")(4,"clipPath",2),y(5,"rect",3),u()()()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role),l(),f("clip-path",n.pathId),l(3),a("id",n.pathId))},encapsulation:2})}return t})();var An=(()=>{class t extends ie{pathId;ngOnInit(){this.pathId="url(#"+ae()+")"}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["TimesCircleIcon"]],features:[_],decls:6,vars:7,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["fill-rule","evenodd","clip-rule","evenodd","d","M7 14C5.61553 14 4.26215 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303296 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303296 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26215 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.16667C5.84628 1.16667 4.71846 1.50879 3.75918 2.14976C2.79989 2.79074 2.05222 3.70178 1.61071 4.76768C1.16919 5.83358 1.05367 7.00647 1.27876 8.13803C1.50384 9.26958 2.05941 10.309 2.87521 11.1248C3.69102 11.9406 4.73042 12.4962 5.86198 12.7212C6.99353 12.9463 8.16642 12.8308 9.23232 12.3893C10.2982 11.9478 11.2093 11.2001 11.8502 10.2408C12.4912 9.28154 12.8333 8.15373 12.8333 7C12.8333 5.45291 12.2188 3.96918 11.1248 2.87521C10.0308 1.78125 8.5471 1.16667 7 1.16667ZM4.66662 9.91668C4.58998 9.91704 4.51404 9.90209 4.44325 9.87271C4.37246 9.84333 4.30826 9.8001 4.2544 9.74557C4.14516 9.6362 4.0838 9.48793 4.0838 9.33335C4.0838 9.17876 4.14516 9.0305 4.2544 8.92113L6.17553 7L4.25443 5.07891C4.15139 4.96832 4.09529 4.82207 4.09796 4.67094C4.10063 4.51982 4.16185 4.37563 4.26872 4.26876C4.3756 4.16188 4.51979 4.10066 4.67091 4.09799C4.82204 4.09532 4.96829 4.15142 5.07887 4.25446L6.99997 6.17556L8.92106 4.25446C9.03164 4.15142 9.1779 4.09532 9.32903 4.09799C9.48015 4.10066 9.62434 4.16188 9.73121 4.26876C9.83809 4.37563 9.89931 4.51982 9.90198 4.67094C9.90464 4.82207 9.84855 4.96832 9.74551 5.07891L7.82441 7L9.74554 8.92113C9.85478 9.0305 9.91614 9.17876 9.91614 9.33335C9.91614 9.48793 9.85478 9.6362 9.74554 9.74557C9.69168 9.8001 9.62748 9.84333 9.55669 9.87271C9.4859 9.90209 9.40996 9.91704 9.33332 9.91668C9.25668 9.91704 9.18073 9.90209 9.10995 9.87271C9.03916 9.84333 8.97495 9.8001 8.9211 9.74557L6.99997 7.82444L5.07884 9.74557C5.02499 9.8001 4.96078 9.84333 4.88999 9.87271C4.81921 9.90209 4.74326 9.91704 4.66662 9.91668Z","fill","currentColor"],[3,"id"],["width","14","height","14","fill","white"]],template:function(i,n){i&1&&(K(),p(0,"svg",0)(1,"g"),y(2,"path",1),u(),p(3,"defs")(4,"clipPath",2),y(5,"rect",3),u()()()),i&2&&(T(n.getClassNames()),f("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role),l(),f("clip-path",n.pathId),l(3),a("id",n.pathId))},encapsulation:2})}return t})();var $o=["checkboxicon"],zo=["input"],Po=()=>({"p-checkbox-input":!0}),No=t=>({checked:t,class:"p-checkbox-icon"});function Ro(t,o){if(t&1&&y(0,"span",8),t&2){let e=c(3);a("ngClass",e.checkboxIcon),f("data-pc-section","icon")}}function Bo(t,o){t&1&&y(0,"CheckIcon",9),t&2&&(a("styleClass","p-checkbox-icon"),f("data-pc-section","icon"))}function Ho(t,o){if(t&1&&(A(0),d(1,Ro,1,2,"span",7)(2,Bo,1,2,"CheckIcon",6),L()),t&2){let e=c(2);l(),a("ngIf",e.checkboxIcon),l(),a("ngIf",!e.checkboxIcon)}}function jo(t,o){t&1&&y(0,"MinusIcon",9),t&2&&(a("styleClass","p-checkbox-icon"),f("data-pc-section","icon"))}function Go(t,o){if(t&1&&(A(0),d(1,Ho,3,2,"ng-container",4)(2,jo,1,2,"MinusIcon",6),L()),t&2){let e=c();l(),a("ngIf",e.checked),l(),a("ngIf",e._indeterminate())}}function Qo(t,o){}function Uo(t,o){t&1&&d(0,Qo,0,0,"ng-template")}var qo=({dt:t})=>`
.p-checkbox {
    position: relative;
    display: inline-flex;
    user-select: none;
    vertical-align: bottom;
    width: ${t("checkbox.width")};
    height: ${t("checkbox.height")};
}

.p-checkbox-input {
    cursor: pointer;
    appearance: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
    border: 1px solid transparent;
    border-radius: ${t("checkbox.border.radius")};
}

.p-checkbox-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${t("checkbox.border.radius")};
    border: 1px solid ${t("checkbox.border.color")};
    background: ${t("checkbox.background")};
    width: ${t("checkbox.width")};
    height: ${t("checkbox.height")};
    transition: background ${t("checkbox.transition.duration")}, color ${t("checkbox.transition.duration")}, border-color ${t("checkbox.transition.duration")}, box-shadow ${t("checkbox.transition.duration")}, outline-color ${t("checkbox.transition.duration")};
    outline-color: transparent;
    box-shadow: ${t("checkbox.shadow")};
}

.p-checkbox-icon {
    transition-duration: ${t("checkbox.transition.duration")};
    color: ${t("checkbox.icon.color")};
    font-size: ${t("checkbox.icon.size")};
    width: ${t("checkbox.icon.size")};
    height: ${t("checkbox.icon.size")};
}

.p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
    border-color: ${t("checkbox.hover.border.color")};
}

.p-checkbox-checked .p-checkbox-box {
    border-color: ${t("checkbox.checked.border.color")};
    background: ${t("checkbox.checked.background")};
}

.p-checkbox-checked .p-checkbox-icon {
    color: ${t("checkbox.icon.checked.color")};
}

.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
    background: ${t("checkbox.checked.hover.background")};
    border-color: ${t("checkbox.checked.hover.border.color")};
}

.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
    color: ${t("checkbox.icon.checked.hover.color")};
}

.p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
    border-color: ${t("checkbox.focus.border.color")};
    box-shadow: ${t("checkbox.focus.ring.shadow")};
    outline: ${t("checkbox.focus.ring.width")} ${t("checkbox.focus.ring.style")} ${t("checkbox.focus.ring.color")};
    outline-offset: ${t("checkbox.focus.ring.offset")};
}

.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
    border-color: ${t("checkbox.checked.focus.border.color")};
}

p-checkBox.ng-invalid.ng-dirty .p-checkbox-box,
p-check-box.ng-invalid.ng-dirty .p-checkbox-box,
p-checkbox.ng-invalid.ng-dirty .p-checkbox-box {
    border-color: ${t("checkbox.invalid.border.color")};
}

.p-checkbox.p-variant-filled .p-checkbox-box {
    background: ${t("checkbox.filled.background")};
}

.p-checkbox-checked.p-variant-filled .p-checkbox-box {
    background: ${t("checkbox.checked.background")};
}

.p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
    background: ${t("checkbox.checked.hover.background")};
}

.p-checkbox.p-disabled {
    opacity: 1;
}

.p-checkbox.p-disabled .p-checkbox-box {
    background: ${t("checkbox.disabled.background")};
    border-color: ${t("checkbox.checked.disabled.border.color")};
}

.p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
    color: ${t("checkbox.icon.disabled.color")};
}

.p-checkbox-sm,
.p-checkbox-sm .p-checkbox-box {
    width: ${t("checkbox.sm.width")};
    height: ${t("checkbox.sm.height")};
}

.p-checkbox-sm .p-checkbox-icon {
    font-size: ${t("checkbox.icon.sm.size")};
    width: ${t("checkbox.icon.sm.size")};
    height: ${t("checkbox.icon.sm.size")};
}

.p-checkbox-lg,
.p-checkbox-lg .p-checkbox-box {
    width: ${t("checkbox.lg.width")};
    height: ${t("checkbox.lg.height")};
}

.p-checkbox-lg .p-checkbox-icon {
    font-size: ${t("checkbox.icon.lg.size")};
    width: ${t("checkbox.icon.lg.size")};
    height: ${t("checkbox.icon.lg.size")};
}
`,Wo={root:({instance:t,props:o})=>["p-checkbox p-component",{"p-checkbox-checked":t.checked,"p-disabled":o.disabled,"p-invalid":o.invalid,"p-variant-filled":o.variant?o.variant==="filled":t.config.inputStyle==="filled"||t.config.inputVariant==="filled"}],box:"p-checkbox-box",input:"p-checkbox-input",icon:"p-checkbox-icon"},Ln=(()=>{class t extends Z{name="checkbox";theme=qo;classes=Wo;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var Zo={provide:Ke,useExisting:Se(()=>$n),multi:!0},$n=(()=>{class t extends U{value;name;disabled;binary;ariaLabelledBy;ariaLabel;tabindex;inputId;style;inputStyle;styleClass;inputClass;indeterminate=!1;size;formControl;checkboxIcon;readonly;required;autofocus;trueValue=!0;falseValue=!1;variant;onChange=new x;onFocus=new x;onBlur=new x;inputViewChild;get checked(){return this._indeterminate()?!1:this.binary?this.model===this.trueValue:Hi(this.value,this.model)}get containerClass(){return{"p-checkbox p-component":!0,"p-checkbox-checked p-highlight":this.checked,"p-disabled":this.disabled,"p-variant-filled":this.variant==="filled"||this.config.inputStyle()==="filled"||this.config.inputVariant()==="filled","p-checkbox-sm p-inputfield-sm":this.size==="small","p-checkbox-lg p-inputfield-lg":this.size==="large"}}_indeterminate=oe(void 0);checkboxIconTemplate;templates;_checkboxIconTemplate;model;onModelChange=()=>{};onModelTouched=()=>{};focused=!1;_componentStyle=B(Ln);ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"icon":this._checkboxIconTemplate=e.template;break;case"checkboxicon":this._checkboxIconTemplate=e.template;break}})}ngOnChanges(e){super.ngOnChanges(e),e.indeterminate&&this._indeterminate.set(e.indeterminate.currentValue)}updateModel(e){let i,n=this.injector.get(Ee,null,{optional:!0,self:!0}),s=n&&!this.formControl?n.value:this.model;this.binary?(i=this._indeterminate()?this.trueValue:this.checked?this.falseValue:this.trueValue,this.model=i,this.onModelChange(i)):(this.checked||this._indeterminate()?i=s.filter(r=>!Ct(r,this.value)):i=s?[...s,this.value]:[this.value],this.onModelChange(i),this.model=i,this.formControl&&this.formControl.setValue(i)),this._indeterminate()&&this._indeterminate.set(!1),this.onChange.emit({checked:i,originalEvent:e})}handleChange(e){this.readonly||this.updateModel(e)}onInputFocus(e){this.focused=!0,this.onFocus.emit(e)}onInputBlur(e){this.focused=!1,this.onBlur.emit(e),this.onModelTouched()}focus(){this.inputViewChild.nativeElement.focus()}writeValue(e){this.model=e,this.cd.markForCheck()}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){setTimeout(()=>{this.disabled=e,this.cd.markForCheck()})}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["p-checkbox"],["p-checkBox"],["p-check-box"]],contentQueries:function(i,n,s){if(i&1&&(S(s,$o,4),S(s,Te,4)),i&2){let r;m(r=g())&&(n.checkboxIconTemplate=r.first),m(r=g())&&(n.templates=r)}},viewQuery:function(i,n){if(i&1&&W(zo,5),i&2){let s;m(s=g())&&(n.inputViewChild=s.first)}},inputs:{value:"value",name:"name",disabled:[2,"disabled","disabled",b],binary:[2,"binary","binary",b],ariaLabelledBy:"ariaLabelledBy",ariaLabel:"ariaLabel",tabindex:[2,"tabindex","tabindex",Y],inputId:"inputId",style:"style",inputStyle:"inputStyle",styleClass:"styleClass",inputClass:"inputClass",indeterminate:[2,"indeterminate","indeterminate",b],size:"size",formControl:"formControl",checkboxIcon:"checkboxIcon",readonly:[2,"readonly","readonly",b],required:[2,"required","required",b],autofocus:[2,"autofocus","autofocus",b],trueValue:"trueValue",falseValue:"falseValue",variant:"variant"},outputs:{onChange:"onChange",onFocus:"onFocus",onBlur:"onBlur"},features:[$([Zo,Ln]),_,be],decls:6,vars:29,consts:[["input",""],[3,"ngClass"],["type","checkbox",3,"focus","blur","change","value","checked","disabled","readonly","ngClass"],[1,"p-checkbox-box"],[4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[3,"styleClass",4,"ngIf"],["class","p-checkbox-icon",3,"ngClass",4,"ngIf"],[1,"p-checkbox-icon",3,"ngClass"],[3,"styleClass"]],template:function(i,n){if(i&1){let s=Q();p(0,"div",1)(1,"input",2,0),E("focus",function(h){return C(s),w(n.onInputFocus(h))})("blur",function(h){return C(s),w(n.onInputBlur(h))})("change",function(h){return C(s),w(n.handleChange(h))}),u(),p(3,"div",3),d(4,Go,3,2,"ng-container",4)(5,Uo,1,0,null,5),u()()}i&2&&(he(n.style),T(n.styleClass),a("ngClass",n.containerClass),f("data-p-highlight",n.checked)("data-p-checked",n.checked)("data-p-disabled",n.disabled),l(),he(n.inputStyle),T(n.inputClass),a("value",n.value)("checked",n.checked)("disabled",n.disabled)("readonly",n.readonly)("ngClass",Me(26,Po)),f("id",n.inputId)("name",n.name)("tabindex",n.tabindex)("required",n.required?!0:null)("aria-labelledby",n.ariaLabelledBy)("aria-label",n.ariaLabel),l(3),a("ngIf",!n.checkboxIconTemplate&&!n._checkboxIconTemplate),l(),a("ngTemplateOutlet",n.checkboxIconTemplate||n._checkboxIconTemplate)("ngTemplateOutletContext",z(27,No,n.checked)))},dependencies:[X,re,me,_e,st,Fn,D],encapsulation:2,changeDetection:0})}return t})(),bc=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[$n,D,D]})}return t})();var Ko=["*"],Yo=({dt:t})=>`
.p-iconfield {
    position: relative;
    display: block;
}

.p-inputicon {
    position: absolute;
    top: 50%;
    margin-top: calc(-1 * (${t("icon.size")} / 2));
    color: ${t("iconfield.icon.color")};
    line-height: 1;
}

.p-iconfield .p-inputicon:first-child {
    inset-inline-start: ${t("form.field.padding.x")};
}

.p-iconfield .p-inputicon:last-child {
    inset-inline-end: ${t("form.field.padding.x")};
}

.p-iconfield .p-inputtext:not(:first-child) {
    padding-inline-start: calc((${t("form.field.padding.x")} * 2) + ${t("icon.size")});
}

.p-iconfield .p-inputtext:not(:last-child) {
    padding-inline-end: calc((${t("form.field.padding.x")} * 2) + ${t("icon.size")});
}

.p-iconfield:has(.p-inputfield-sm) .p-inputicon {
    font-size: ${t("form.field.sm.font.size")};
    width: ${t("form.field.sm.font.size")};
    height: ${t("form.field.sm.font.size")};
    margin-top: calc(-1 * (${t("form.field.sm.font.size")} / 2));
}

.p-iconfield:has(.p-inputfield-lg) .p-inputicon {
    font-size: ${t("form.field.lg.font.size")};
    width: ${t("form.field.lg.font.size")};
    height: ${t("form.field.lg.font.size")};
    margin-top: calc(-1 * (${t("form.field.lg.font.size")} / 2));
}
`,Xo={root:"p-iconfield"},zn=(()=>{class t extends Z{name="iconfield";theme=Yo;classes=Xo;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var ri=(()=>{class t extends U{iconPosition="left";get _styleClass(){return this.styleClass}styleClass;_componentStyle=B(zn);static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["p-iconfield"],["p-iconField"],["p-icon-field"]],hostAttrs:[1,"p-iconfield"],hostVars:6,hostBindings:function(i,n){i&2&&(T(n._styleClass),Oe("p-iconfield-left",n.iconPosition==="left")("p-iconfield-right",n.iconPosition==="right"))},inputs:{iconPosition:"iconPosition",styleClass:"styleClass"},features:[$([zn]),_],ngContentSelectors:Ko,decls:1,vars:0,template:function(i,n){i&1&&(De(),Fe(0))},dependencies:[X],encapsulation:2,changeDetection:0})}return t})(),Mc=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[ri]})}return t})();var Jo=["*"],es={root:"p-inputicon"},Pn=(()=>{class t extends Z{name="inputicon";classes=es;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})(),ai=(()=>{class t extends U{styleClass;get hostClasses(){return this.styleClass}_componentStyle=B(Pn);static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["p-inputicon"],["p-inputIcon"]],hostVars:4,hostBindings:function(i,n){i&2&&(T(n.hostClasses),Oe("p-inputicon",!0))},inputs:{styleClass:"styleClass"},features:[$([Pn]),_],ngContentSelectors:Jo,decls:1,vars:0,template:function(i,n){i&1&&(De(),Fe(0))},dependencies:[X,D],encapsulation:2,changeDetection:0})}return t})(),qc=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[ai,D,D]})}return t})();var ts=({dt:t})=>`
.p-inputtext {
    font-family: inherit;
    font-feature-settings: inherit;
    font-size: 1rem;
    color: ${t("inputtext.color")};
    background: ${t("inputtext.background")};
    padding-block: ${t("inputtext.padding.y")};
    padding-inline: ${t("inputtext.padding.x")};
    border: 1px solid ${t("inputtext.border.color")};
    transition: background ${t("inputtext.transition.duration")}, color ${t("inputtext.transition.duration")}, border-color ${t("inputtext.transition.duration")}, outline-color ${t("inputtext.transition.duration")}, box-shadow ${t("inputtext.transition.duration")};
    appearance: none;
    border-radius: ${t("inputtext.border.radius")};
    outline-color: transparent;
    box-shadow: ${t("inputtext.shadow")};
}

.p-inputtext.ng-invalid.ng-dirty {
    border-color: ${t("inputtext.invalid.border.color")};
}

.p-inputtext:enabled:hover {
    border-color: ${t("inputtext.hover.border.color")};
}

.p-inputtext:enabled:focus {
    border-color: ${t("inputtext.focus.border.color")};
    box-shadow: ${t("inputtext.focus.ring.shadow")};
    outline: ${t("inputtext.focus.ring.width")} ${t("inputtext.focus.ring.style")} ${t("inputtext.focus.ring.color")};
    outline-offset: ${t("inputtext.focus.ring.offset")};
}

.p-inputtext.p-invalid {
    border-color: ${t("inputtext.invalid.border.color")};
}

.p-inputtext.p-variant-filled {
    background: ${t("inputtext.filled.background")};
}
    
.p-inputtext.p-variant-filled:enabled:hover {
    background: ${t("inputtext.filled.hover.background")};
}

.p-inputtext.p-variant-filled:enabled:focus {
    background: ${t("inputtext.filled.focus.background")};
}

.p-inputtext:disabled {
    opacity: 1;
    background: ${t("inputtext.disabled.background")};
    color: ${t("inputtext.disabled.color")};
}

.p-inputtext::placeholder {
    color: ${t("inputtext.placeholder.color")};
}

.p-inputtext.ng-invalid.ng-dirty::placeholder {
    color: ${t("inputtext.invalid.placeholder.color")};
}

.p-inputtext-sm {
    font-size: ${t("inputtext.sm.font.size")};
    padding-block: ${t("inputtext.sm.padding.y")};
    padding-inline: ${t("inputtext.sm.padding.x")};
}

.p-inputtext-lg {
    font-size: ${t("inputtext.lg.font.size")};
    padding-block: ${t("inputtext.lg.padding.y")};
    padding-inline: ${t("inputtext.lg.padding.x")};
}

.p-inputtext-fluid {
    width: 100%;
}
`,is={root:({instance:t,props:o})=>["p-inputtext p-component",{"p-filled":t.filled,"p-inputtext-sm":o.size==="small","p-inputtext-lg":o.size==="large","p-invalid":o.invalid,"p-variant-filled":o.variant==="filled","p-inputtext-fluid":o.fluid}]},Nn=(()=>{class t extends Z{name="inputtext";theme=ts;classes=is;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var Rn=(()=>{class t extends U{ngModel;variant;fluid;pSize;filled;_componentStyle=B(Nn);get hasFluid(){let i=this.el.nativeElement.closest("p-fluid");return We(this.fluid)?!!i:this.fluid}constructor(e){super(),this.ngModel=e}ngAfterViewInit(){super.ngAfterViewInit(),this.updateFilledState(),this.cd.detectChanges()}ngDoCheck(){this.updateFilledState()}onInput(){this.updateFilledState()}updateFilledState(){this.filled=this.el.nativeElement.value&&this.el.nativeElement.value.length||this.ngModel&&this.ngModel.model}static \u0275fac=function(i){return new(i||t)(I(si,8))};static \u0275dir=se({type:t,selectors:[["","pInputText",""]],hostAttrs:[1,"p-inputtext","p-component"],hostVars:14,hostBindings:function(i,n){if(i&1&&E("input",function(r){return n.onInput(r)}),i&2){let s;Oe("p-filled",n.filled)("p-variant-filled",((s=n.variant)!==null&&s!==void 0?s:n.config.inputStyle()||n.config.inputVariant())==="filled")("p-inputtext-fluid",n.hasFluid)("p-inputtext-sm",n.pSize==="small")("p-inputfield-sm",n.pSize==="small")("p-inputtext-lg",n.pSize==="large")("p-inputfield-lg",n.pSize==="large")}},inputs:{variant:"variant",fluid:[2,"fluid","fluid",b],pSize:"pSize"},features:[$([Nn]),_]})}return t})(),sd=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({})}return t})();var ns=({dt:t})=>`
.p-progressspinner {
    position: relative;
    margin: 0 auto;
    width: 100px;
    height: 100px;
    display: inline-block;
}

.p-progressspinner::before {
    content: "";
    display: block;
    padding-top: 100%;
}

.p-progressspinner-spin {
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    animation: p-progressspinner-rotate 2s linear infinite;
}

.p-progressspinner-circle {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: 0;
    stroke: ${t("progressspinner.colorOne")};
    animation: p-progressspinner-dash 1.5s ease-in-out infinite, p-progressspinner-color 6s ease-in-out infinite;
    stroke-linecap: round;
}

@keyframes p-progressspinner-rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes p-progressspinner-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}
@keyframes p-progressspinner-color {
    100%,
    0% {
        stroke: ${t("progressspinner.colorOne")};
    }
    40% {
        stroke: ${t("progressspinner.colorTwo")};
    }
    66% {
        stroke: ${t("progressspinner.colorThree")};
    }
    80%,
    90% {
        stroke: ${t("progressspinner.colorFour")};
    }
}
`,os={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},Bn=(()=>{class t extends Z{name="progressspinner";theme=ns;classes=os;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var ss=(()=>{class t extends U{styleClass;style;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;_componentStyle=B(Bn);static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],inputs:{styleClass:"styleClass",style:"style",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[$([Bn]),_],decls:3,vars:11,consts:[["role","progressbar",1,"p-progressspinner",3,"ngStyle","ngClass"],["viewBox","25 25 50 50",1,"p-progressspinner-spin"],["cx","50","cy","50","r","20","stroke-miterlimit","10",1,"p-progressspinner-circle"]],template:function(i,n){i&1&&(p(0,"div",0),K(),p(1,"svg",1),y(2,"circle",2),u()()),i&2&&(a("ngStyle",n.style)("ngClass",n.styleClass),f("aria-label",n.ariaLabel)("aria-busy",!0)("data-pc-name","progressspinner")("data-pc-section","root"),l(),Ye("animation-duration",n.animationDuration),f("data-pc-section","root"),l(),f("fill",n.fill)("stroke-width",n.strokeWidth))},dependencies:[X,re,ge,D],encapsulation:2,changeDetection:0})}return t})(),yd=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[ss,D,D]})}return t})();var rs=({dt:t})=>`
.p-tooltip {
    position: absolute;
    display: none;
    max-width: ${t("tooltip.max.width")};
}

.p-tooltip-right,
.p-tooltip-left {
    padding: 0 ${t("tooltip.gutter")};
}

.p-tooltip-top,
.p-tooltip-bottom {
    padding: ${t("tooltip.gutter")} 0;
}

.p-tooltip-text {
    white-space: pre-line;
    word-break: break-word;
    background: ${t("tooltip.background")};
    color: ${t("tooltip.color")};
    padding: ${t("tooltip.padding")};
    box-shadow: ${t("tooltip.shadow")};
    border-radius: ${t("tooltip.border.radius")};
}

.p-tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    scale: 2;
}

.p-tooltip-right .p-tooltip-arrow {
    top: 50%;
    left: 0;
    margin-top: calc(-1 * ${t("tooltip.gutter")});
    border-width: ${t("tooltip.gutter")} ${t("tooltip.gutter")} ${t("tooltip.gutter")} 0;
    border-right-color: ${t("tooltip.background")};
}

.p-tooltip-left .p-tooltip-arrow {
    top: 50%;
    right: 0;
    margin-top: calc(-1 * ${t("tooltip.gutter")});
    border-width: ${t("tooltip.gutter")} 0 ${t("tooltip.gutter")} ${t("tooltip.gutter")};
    border-left-color: ${t("tooltip.background")};
}

.p-tooltip-top .p-tooltip-arrow {
    bottom: 0;
    left: 50%;
    margin-left: calc(-1 * ${t("tooltip.gutter")});
    border-width: ${t("tooltip.gutter")} ${t("tooltip.gutter")} 0 ${t("tooltip.gutter")};
    border-top-color: ${t("tooltip.background")};
    border-bottom-color: ${t("tooltip.background")};
}

.p-tooltip-bottom .p-tooltip-arrow {
    top: 0;
    left: 50%;
    margin-left: calc(-1 * ${t("tooltip.gutter")});
    border-width: 0 ${t("tooltip.gutter")} ${t("tooltip.gutter")} ${t("tooltip.gutter")};
    border-top-color: ${t("tooltip.background")};
    border-bottom-color: ${t("tooltip.background")};
}
`,as={root:"p-tooltip p-component",arrow:"p-tooltip-arrow",text:"p-tooltip-text"},Hn=(()=>{class t extends Z{name="tooltip";theme=rs;classes=as;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var jn=(()=>{class t extends U{zone;viewContainer;tooltipPosition;tooltipEvent="hover";appendTo;positionStyle;tooltipStyleClass;tooltipZIndex;escape=!0;showDelay;hideDelay;life;positionTop;positionLeft;autoHide=!0;fitContent=!0;hideOnEscape=!0;content;get disabled(){return this._disabled}set disabled(e){this._disabled=e,this.deactivate()}tooltipOptions;_tooltipOptions={tooltipLabel:null,tooltipPosition:"right",tooltipEvent:"hover",appendTo:"body",positionStyle:null,tooltipStyleClass:null,tooltipZIndex:"auto",escape:!0,disabled:null,showDelay:null,hideDelay:null,positionTop:null,positionLeft:null,life:null,autoHide:!0,hideOnEscape:!0,id:ae("pn_id_")+"_tooltip"};_disabled;container;styleClass;tooltipText;showTimeout;hideTimeout;active;mouseEnterListener;mouseLeaveListener;containerMouseleaveListener;clickListener;focusListener;blurListener;documentEscapeListener;scrollHandler;resizeListener;_componentStyle=B(Hn);interactionInProgress=!1;constructor(e,i){super(),this.zone=e,this.viewContainer=i}ngAfterViewInit(){super.ngAfterViewInit(),He(this.platformId)&&this.zone.runOutsideAngular(()=>{let e=this.getOption("tooltipEvent");if((e==="hover"||e==="both")&&(this.mouseEnterListener=this.onMouseEnter.bind(this),this.mouseLeaveListener=this.onMouseLeave.bind(this),this.clickListener=this.onInputClick.bind(this),this.el.nativeElement.addEventListener("mouseenter",this.mouseEnterListener),this.el.nativeElement.addEventListener("click",this.clickListener),this.el.nativeElement.addEventListener("mouseleave",this.mouseLeaveListener)),e==="focus"||e==="both"){this.focusListener=this.onFocus.bind(this),this.blurListener=this.onBlur.bind(this);let i=this.el.nativeElement.querySelector(".p-component");i||(i=this.getTarget(this.el.nativeElement)),i.addEventListener("focus",this.focusListener),i.addEventListener("blur",this.blurListener)}})}ngOnChanges(e){super.ngOnChanges(e),e.tooltipPosition&&this.setOption({tooltipPosition:e.tooltipPosition.currentValue}),e.tooltipEvent&&this.setOption({tooltipEvent:e.tooltipEvent.currentValue}),e.appendTo&&this.setOption({appendTo:e.appendTo.currentValue}),e.positionStyle&&this.setOption({positionStyle:e.positionStyle.currentValue}),e.tooltipStyleClass&&this.setOption({tooltipStyleClass:e.tooltipStyleClass.currentValue}),e.tooltipZIndex&&this.setOption({tooltipZIndex:e.tooltipZIndex.currentValue}),e.escape&&this.setOption({escape:e.escape.currentValue}),e.showDelay&&this.setOption({showDelay:e.showDelay.currentValue}),e.hideDelay&&this.setOption({hideDelay:e.hideDelay.currentValue}),e.life&&this.setOption({life:e.life.currentValue}),e.positionTop&&this.setOption({positionTop:e.positionTop.currentValue}),e.positionLeft&&this.setOption({positionLeft:e.positionLeft.currentValue}),e.disabled&&this.setOption({disabled:e.disabled.currentValue}),e.content&&(this.setOption({tooltipLabel:e.content.currentValue}),this.active&&(e.content.currentValue?this.container&&this.container.offsetParent?(this.updateText(),this.align()):this.show():this.hide())),e.autoHide&&this.setOption({autoHide:e.autoHide.currentValue}),e.id&&this.setOption({id:e.id.currentValue}),e.tooltipOptions&&(this._tooltipOptions=k(k({},this._tooltipOptions),e.tooltipOptions.currentValue),this.deactivate(),this.active&&(this.getOption("tooltipLabel")?this.container&&this.container.offsetParent?(this.updateText(),this.align()):this.show():this.hide()))}isAutoHide(){return this.getOption("autoHide")}onMouseEnter(e){!this.container&&!this.showTimeout&&this.activate()}onMouseLeave(e){this.isAutoHide()?this.deactivate():!(lt(e.relatedTarget,"p-tooltip")||lt(e.relatedTarget,"p-tooltip-text")||lt(e.relatedTarget,"p-tooltip-arrow"))&&this.deactivate()}onFocus(e){this.activate()}onBlur(e){this.deactivate()}onInputClick(e){this.deactivate()}activate(){if(!this.interactionInProgress){if(this.active=!0,this.clearHideTimeout(),this.getOption("showDelay")?this.showTimeout=setTimeout(()=>{this.show()},this.getOption("showDelay")):this.show(),this.getOption("life")){let e=this.getOption("showDelay")?this.getOption("life")+this.getOption("showDelay"):this.getOption("life");this.hideTimeout=setTimeout(()=>{this.hide()},e)}this.getOption("hideOnEscape")&&(this.documentEscapeListener=this.renderer.listen("document","keydown.escape",()=>{this.deactivate(),this.documentEscapeListener()})),this.interactionInProgress=!0}}deactivate(){this.interactionInProgress=!1,this.active=!1,this.clearShowTimeout(),this.getOption("hideDelay")?(this.clearHideTimeout(),this.hideTimeout=setTimeout(()=>{this.hide()},this.getOption("hideDelay"))):this.hide(),this.documentEscapeListener&&this.documentEscapeListener()}create(){this.container&&(this.clearHideTimeout(),this.remove()),this.container=document.createElement("div"),this.container.setAttribute("id",this.getOption("id")),this.container.setAttribute("role","tooltip");let e=document.createElement("div");e.className="p-tooltip-arrow",this.container.appendChild(e),this.tooltipText=document.createElement("div"),this.tooltipText.className="p-tooltip-text",this.updateText(),this.getOption("positionStyle")&&(this.container.style.position=this.getOption("positionStyle")),this.container.appendChild(this.tooltipText),this.getOption("appendTo")==="body"?document.body.appendChild(this.container):this.getOption("appendTo")==="target"?jt(this.container,this.el.nativeElement):jt(this.getOption("appendTo"),this.container),this.container.style.display="none",this.fitContent&&(this.container.style.width="fit-content"),this.isAutoHide()?this.container.style.pointerEvents="none":(this.container.style.pointerEvents="unset",this.bindContainerMouseleaveListener())}bindContainerMouseleaveListener(){if(!this.containerMouseleaveListener){let e=this.container??this.container.nativeElement;this.containerMouseleaveListener=this.renderer.listen(e,"mouseleave",i=>{this.deactivate()})}}unbindContainerMouseleaveListener(){this.containerMouseleaveListener&&(this.bindContainerMouseleaveListener(),this.containerMouseleaveListener=null)}show(){if(!this.getOption("tooltipLabel")||this.getOption("disabled"))return;this.create(),this.el.nativeElement.closest("p-dialog")?setTimeout(()=>{this.container&&(this.container.style.display="inline-block"),this.container&&this.align()},100):(this.container.style.display="inline-block",this.align()),Mi(this.container,250),this.getOption("tooltipZIndex")==="auto"?pe.set("tooltip",this.container,this.config.zIndex.tooltip):this.container.style.zIndex=this.getOption("tooltipZIndex"),this.bindDocumentResizeListener(),this.bindScrollListener()}hide(){this.getOption("tooltipZIndex")==="auto"&&pe.clear(this.container),this.remove()}updateText(){let e=this.getOption("tooltipLabel");if(e instanceof mi){let i=this.viewContainer.createEmbeddedView(e);i.detectChanges(),i.rootNodes.forEach(n=>this.tooltipText.appendChild(n))}else this.getOption("escape")?(this.tooltipText.innerHTML="",this.tooltipText.appendChild(document.createTextNode(e))):this.tooltipText.innerHTML=e}align(){let e=this.getOption("tooltipPosition"),i={top:[this.alignTop,this.alignBottom,this.alignRight,this.alignLeft],bottom:[this.alignBottom,this.alignTop,this.alignRight,this.alignLeft],left:[this.alignLeft,this.alignRight,this.alignTop,this.alignBottom],right:[this.alignRight,this.alignLeft,this.alignTop,this.alignBottom]};for(let[n,s]of i[e].entries())if(n===0)s.call(this);else if(this.isOutOfBounds())s.call(this);else break}getHostOffset(){if(this.getOption("appendTo")==="body"||this.getOption("appendTo")==="target"){let e=this.el.nativeElement.getBoundingClientRect(),i=e.left+Di(),n=e.top+Fi();return{left:i,top:n}}else return{left:0,top:0}}get activeElement(){return this.el.nativeElement.nodeName.startsWith("P-")?ye(this.el.nativeElement,".p-component"):this.el.nativeElement}alignRight(){this.preAlign("right");let e=this.activeElement,i=Le(e),n=($e(e)-$e(this.container))/2;this.alignTooltip(i,n)}alignLeft(){this.preAlign("left");let e=Le(this.container),i=($e(this.el.nativeElement)-$e(this.container))/2;this.alignTooltip(-e,i)}alignTop(){this.preAlign("top");let e=(Le(this.el.nativeElement)-Le(this.container))/2,i=$e(this.container);this.alignTooltip(e,-i)}alignBottom(){this.preAlign("bottom");let e=(Le(this.el.nativeElement)-Le(this.container))/2,i=$e(this.el.nativeElement);this.alignTooltip(e,i)}alignTooltip(e,i){let n=this.getHostOffset(),s=n.left+e,r=n.top+i;this.container.style.left=s+this.getOption("positionLeft")+"px",this.container.style.top=r+this.getOption("positionTop")+"px"}setOption(e){this._tooltipOptions=k(k({},this._tooltipOptions),e)}getOption(e){return this._tooltipOptions[e]}getTarget(e){return lt(e,"p-inputwrapper")?ye(e,"input"):e}preAlign(e){this.container.style.left="-999px",this.container.style.top="-999px";let i="p-tooltip p-component p-tooltip-"+e;this.container.className=this.getOption("tooltipStyleClass")?i+" "+this.getOption("tooltipStyleClass"):i}isOutOfBounds(){let e=this.container.getBoundingClientRect(),i=e.top,n=e.left,s=Le(this.container),r=$e(this.container),h=ki();return n+s>h.width||n<0||i<0||i+r>h.height}onWindowResize(e){this.hide()}bindDocumentResizeListener(){this.zone.runOutsideAngular(()=>{this.resizeListener=this.onWindowResize.bind(this),window.addEventListener("resize",this.resizeListener)})}unbindDocumentResizeListener(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)}bindScrollListener(){this.scrollHandler||(this.scrollHandler=new xt(this.el.nativeElement,()=>{this.container&&this.hide()})),this.scrollHandler.bindScrollListener()}unbindScrollListener(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()}unbindEvents(){let e=this.getOption("tooltipEvent");if((e==="hover"||e==="both")&&(this.el.nativeElement.removeEventListener("mouseenter",this.mouseEnterListener),this.el.nativeElement.removeEventListener("mouseleave",this.mouseLeaveListener),this.el.nativeElement.removeEventListener("click",this.clickListener)),e==="focus"||e==="both"){let i=this.el.nativeElement.querySelector(".p-component");i||(i=this.getTarget(this.el.nativeElement)),i.removeEventListener("focus",this.focusListener),i.removeEventListener("blur",this.blurListener)}this.unbindDocumentResizeListener()}remove(){this.container&&this.container.parentElement&&(this.getOption("appendTo")==="body"?document.body.removeChild(this.container):this.getOption("appendTo")==="target"?this.el.nativeElement.removeChild(this.container):Pi(this.getOption("appendTo"),this.container)),this.unbindDocumentResizeListener(),this.unbindScrollListener(),this.unbindContainerMouseleaveListener(),this.clearTimeouts(),this.container=null,this.scrollHandler=null}clearShowTimeout(){this.showTimeout&&(clearTimeout(this.showTimeout),this.showTimeout=null)}clearHideTimeout(){this.hideTimeout&&(clearTimeout(this.hideTimeout),this.hideTimeout=null)}clearTimeouts(){this.clearShowTimeout(),this.clearHideTimeout()}ngOnDestroy(){this.unbindEvents(),super.ngOnDestroy(),this.container&&pe.clear(this.container),this.remove(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.documentEscapeListener&&this.documentEscapeListener()}static \u0275fac=function(i){return new(i||t)(I(Ce),I(gi))};static \u0275dir=se({type:t,selectors:[["","pTooltip",""]],inputs:{tooltipPosition:"tooltipPosition",tooltipEvent:"tooltipEvent",appendTo:"appendTo",positionStyle:"positionStyle",tooltipStyleClass:"tooltipStyleClass",tooltipZIndex:"tooltipZIndex",escape:[2,"escape","escape",b],showDelay:[2,"showDelay","showDelay",Y],hideDelay:[2,"hideDelay","hideDelay",Y],life:[2,"life","life",Y],positionTop:[2,"positionTop","positionTop",Y],positionLeft:[2,"positionLeft","positionLeft",Y],autoHide:[2,"autoHide","autoHide",b],fitContent:[2,"fitContent","fitContent",b],hideOnEscape:[2,"hideOnEscape","hideOnEscape",b],content:[0,"pTooltip","content"],disabled:[0,"tooltipDisabled","disabled"],tooltipOptions:"tooltipOptions"},features:[$([Hn]),_,be]})}return t})(),Dd=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({})}return t})();var Gn=["content"],cs=["overlay"],ds=["*"],ps=(t,o,e,i,n,s,r,h,q,P,M,ce,ee,de)=>({"p-overlay p-component":!0,"p-overlay-modal p-overlay-mask p-overlay-mask-enter":t,"p-overlay-center":o,"p-overlay-top":e,"p-overlay-top-start":i,"p-overlay-top-end":n,"p-overlay-bottom":s,"p-overlay-bottom-start":r,"p-overlay-bottom-end":h,"p-overlay-left":q,"p-overlay-left-start":P,"p-overlay-left-end":M,"p-overlay-right":ce,"p-overlay-right-start":ee,"p-overlay-right-end":de}),us=(t,o,e)=>({showTransitionParams:t,hideTransitionParams:o,transform:e}),hs=t=>({value:"visible",params:t}),fs=t=>({mode:t}),ms=t=>({$implicit:t});function gs(t,o){t&1&&N(0)}function _s(t,o){if(t&1){let e=Q();p(0,"div",3,1),E("click",function(n){C(e);let s=c(2);return w(s.onOverlayContentClick(n))})("@overlayContentAnimation.start",function(n){C(e);let s=c(2);return w(s.onOverlayContentAnimationStart(n))})("@overlayContentAnimation.done",function(n){C(e);let s=c(2);return w(s.onOverlayContentAnimationDone(n))}),Fe(2),d(3,gs,1,0,"ng-container",4),u()}if(t&2){let e=c(2);T(e.contentStyleClass),a("ngStyle",e.contentStyle)("ngClass","p-overlay-content")("@overlayContentAnimation",z(11,hs,Xe(7,us,e.showTransitionOptions,e.hideTransitionOptions,e.transformOptions[e.modal?e.overlayResponsiveDirection:"default"]))),l(3),a("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",z(15,ms,z(13,fs,e.overlayMode)))}}function ys(t,o){if(t&1){let e=Q();p(0,"div",3,0),E("click",function(){C(e);let n=c();return w(n.onOverlayClick())}),d(2,_s,4,17,"div",2),u()}if(t&2){let e=c();T(e.styleClass),a("ngStyle",e.style)("ngClass",wi(5,ps,[e.modal,e.modal&&e.overlayResponsiveDirection==="center",e.modal&&e.overlayResponsiveDirection==="top",e.modal&&e.overlayResponsiveDirection==="top-start",e.modal&&e.overlayResponsiveDirection==="top-end",e.modal&&e.overlayResponsiveDirection==="bottom",e.modal&&e.overlayResponsiveDirection==="bottom-start",e.modal&&e.overlayResponsiveDirection==="bottom-end",e.modal&&e.overlayResponsiveDirection==="left",e.modal&&e.overlayResponsiveDirection==="left-start",e.modal&&e.overlayResponsiveDirection==="left-end",e.modal&&e.overlayResponsiveDirection==="right",e.modal&&e.overlayResponsiveDirection==="right-start",e.modal&&e.overlayResponsiveDirection==="right-end"])),l(2),a("ngIf",e.visible)}}var vs=({dt:t})=>`
.p-overlay {
    position: absolute;
    top: 0;
}

.p-overlay-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-overlay-content {
    transform-origin: inherit;
}

.p-overlay-modal > .p-overlay-content {
    z-index: 1;
    width: 90%;
}

/* Position */
/* top */
.p-overlay-top {
    align-items: flex-start;
}
.p-overlay-top-start {
    align-items: flex-start;
    justify-content: flex-start;
}
.p-overlay-top-end {
    align-items: flex-start;
    justify-content: flex-end;
}

/* bottom */
.p-overlay-bottom {
    align-items: flex-end;
}
.p-overlay-bottom-start {
    align-items: flex-end;
    justify-content: flex-start;
}
.p-overlay-bottom-end {
    align-items: flex-end;
    justify-content: flex-end;
}

/* left */
.p-overlay-left {
    justify-content: flex-start;
}
.p-overlay-left-start {
    justify-content: flex-start;
    align-items: flex-start;
}
.p-overlay-left-end {
    justify-content: flex-start;
    align-items: flex-end;
}

/* right */
.p-overlay-right {
    justify-content: flex-end;
}
.p-overlay-right-start {
    justify-content: flex-end;
    align-items: flex-start;
}
.p-overlay-right-end {
    justify-content: flex-end;
    align-items: flex-end;
}
`,Qn=(()=>{class t extends Z{name="overlay";theme=vs;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})(),bs=Rt([je({transform:"{{transform}}",opacity:0}),et("{{showTransitionParams}}")]),Cs=Rt([et("{{hideTransitionParams}}",je({transform:"{{transform}}",opacity:0}))]),Un=(()=>{class t extends U{overlayService;zone;get visible(){return this._visible}set visible(e){this._visible=e,this._visible&&!this.modalVisible&&(this.modalVisible=!0)}get mode(){return this._mode||this.overlayOptions?.mode}set mode(e){this._mode=e}get style(){return dt.merge(this._style,this.modal?this.overlayResponsiveOptions?.style:this.overlayOptions?.style)}set style(e){this._style=e}get styleClass(){return dt.merge(this._styleClass,this.modal?this.overlayResponsiveOptions?.styleClass:this.overlayOptions?.styleClass)}set styleClass(e){this._styleClass=e}get contentStyle(){return dt.merge(this._contentStyle,this.modal?this.overlayResponsiveOptions?.contentStyle:this.overlayOptions?.contentStyle)}set contentStyle(e){this._contentStyle=e}get contentStyleClass(){return dt.merge(this._contentStyleClass,this.modal?this.overlayResponsiveOptions?.contentStyleClass:this.overlayOptions?.contentStyleClass)}set contentStyleClass(e){this._contentStyleClass=e}get target(){let e=this._target||this.overlayOptions?.target;return e===void 0?"@prev":e}set target(e){this._target=e}get appendTo(){return this._appendTo||this.overlayOptions?.appendTo}set appendTo(e){this._appendTo=e}get autoZIndex(){let e=this._autoZIndex||this.overlayOptions?.autoZIndex;return e===void 0?!0:e}set autoZIndex(e){this._autoZIndex=e}get baseZIndex(){let e=this._baseZIndex||this.overlayOptions?.baseZIndex;return e===void 0?0:e}set baseZIndex(e){this._baseZIndex=e}get showTransitionOptions(){let e=this._showTransitionOptions||this.overlayOptions?.showTransitionOptions;return e===void 0?".12s cubic-bezier(0, 0, 0.2, 1)":e}set showTransitionOptions(e){this._showTransitionOptions=e}get hideTransitionOptions(){let e=this._hideTransitionOptions||this.overlayOptions?.hideTransitionOptions;return e===void 0?".1s linear":e}set hideTransitionOptions(e){this._hideTransitionOptions=e}get listener(){return this._listener||this.overlayOptions?.listener}set listener(e){this._listener=e}get responsive(){return this._responsive||this.overlayOptions?.responsive}set responsive(e){this._responsive=e}get options(){return this._options}set options(e){this._options=e}visibleChange=new x;onBeforeShow=new x;onShow=new x;onBeforeHide=new x;onHide=new x;onAnimationStart=new x;onAnimationDone=new x;overlayViewChild;contentViewChild;contentTemplate;templates;_contentTemplate;_visible=!1;_mode;_style;_styleClass;_contentStyle;_contentStyleClass;_target;_appendTo;_autoZIndex;_baseZIndex;_showTransitionOptions;_hideTransitionOptions;_listener;_responsive;_options;modalVisible=!1;isOverlayClicked=!1;isOverlayContentClicked=!1;scrollHandler;documentClickListener;documentResizeListener;_componentStyle=B(Qn);documentKeyboardListener;window;transformOptions={default:"scaleY(0.8)",center:"scale(0.7)",top:"translate3d(0px, -100%, 0px)","top-start":"translate3d(0px, -100%, 0px)","top-end":"translate3d(0px, -100%, 0px)",bottom:"translate3d(0px, 100%, 0px)","bottom-start":"translate3d(0px, 100%, 0px)","bottom-end":"translate3d(0px, 100%, 0px)",left:"translate3d(-100%, 0px, 0px)","left-start":"translate3d(-100%, 0px, 0px)","left-end":"translate3d(-100%, 0px, 0px)",right:"translate3d(100%, 0px, 0px)","right-start":"translate3d(100%, 0px, 0px)","right-end":"translate3d(100%, 0px, 0px)"};get modal(){if(He(this.platformId))return this.mode==="modal"||this.overlayResponsiveOptions&&this.document.defaultView?.matchMedia(this.overlayResponsiveOptions.media?.replace("@media","")||`(max-width: ${this.overlayResponsiveOptions.breakpoint})`).matches}get overlayMode(){return this.mode||(this.modal?"modal":"overlay")}get overlayOptions(){return k(k({},this.config?.overlayOptions),this.options)}get overlayResponsiveOptions(){return k(k({},this.overlayOptions?.responsive),this.responsive)}get overlayResponsiveDirection(){return this.overlayResponsiveOptions?.direction||"center"}get overlayEl(){return this.overlayViewChild?.nativeElement}get contentEl(){return this.contentViewChild?.nativeElement}get targetEl(){return zi(this.target,this.el?.nativeElement)}constructor(e,i){super(),this.overlayService=e,this.zone=i}ngAfterContentInit(){this.templates?.forEach(e=>{e.getType()==="content"?this._contentTemplate=e.template:this._contentTemplate=e.template})}show(e,i=!1){this.onVisibleChange(!0),this.handleEvents("onShow",{overlay:e||this.overlayEl,target:this.targetEl,mode:this.overlayMode}),i&&ve(this.targetEl),this.modal&&Ht(this.document?.body,"p-overflow-hidden")}hide(e,i=!1){if(this.visible)this.onVisibleChange(!1),this.handleEvents("onHide",{overlay:e||this.overlayEl,target:this.targetEl,mode:this.overlayMode}),i&&ve(this.targetEl),this.modal&&Oi(this.document?.body,"p-overflow-hidden");else return}alignOverlay(){!this.modal&&ct.alignOverlay(this.overlayEl,this.targetEl,this.appendTo)}onVisibleChange(e){this._visible=e,this.visibleChange.emit(e)}onOverlayClick(){this.isOverlayClicked=!0}onOverlayContentClick(e){this.overlayService.add({originalEvent:e,target:this.targetEl}),this.isOverlayContentClicked=!0}onOverlayContentAnimationStart(e){switch(e.toState){case"visible":this.handleEvents("onBeforeShow",{overlay:this.overlayEl,target:this.targetEl,mode:this.overlayMode}),this.autoZIndex&&pe.set(this.overlayMode,this.overlayEl,this.baseZIndex+this.config?.zIndex[this.overlayMode]),ct.appendOverlay(this.overlayEl,this.appendTo==="body"?this.document.body:this.appendTo,this.appendTo),this.alignOverlay();break;case"void":this.handleEvents("onBeforeHide",{overlay:this.overlayEl,target:this.targetEl,mode:this.overlayMode}),this.modal&&Ht(this.overlayEl,"p-overlay-mask-leave");break}this.handleEvents("onAnimationStart",e)}onOverlayContentAnimationDone(e){let i=this.overlayEl||e.element.parentElement;switch(e.toState){case"visible":this.visible&&(this.show(i,!0),this.bindListeners());break;case"void":if(!this.visible){this.hide(i,!0),this.modalVisible=!1,this.unbindListeners(),ct.appendOverlay(this.overlayEl,this.targetEl,this.appendTo),pe.clear(i),this.cd.markForCheck();break}}this.handleEvents("onAnimationDone",e)}handleEvents(e,i){this[e].emit(i),this.options&&this.options[e]&&this.options[e](i),this.config?.overlayOptions&&(this.config?.overlayOptions)[e]&&(this.config?.overlayOptions)[e](i)}bindListeners(){this.bindScrollListener(),this.bindDocumentClickListener(),this.bindDocumentResizeListener(),this.bindDocumentKeyboardListener()}unbindListeners(){this.unbindScrollListener(),this.unbindDocumentClickListener(),this.unbindDocumentResizeListener(),this.unbindDocumentKeyboardListener()}bindScrollListener(){this.scrollHandler||(this.scrollHandler=new xt(this.targetEl,e=>{(!this.listener||this.listener(e,{type:"scroll",mode:this.overlayMode,valid:!0}))&&this.hide(e,!0)})),this.scrollHandler.bindScrollListener()}unbindScrollListener(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()}bindDocumentClickListener(){this.documentClickListener||(this.documentClickListener=this.renderer.listen(this.document,"click",e=>{let n=!(this.targetEl&&(this.targetEl.isSameNode(e.target)||!this.isOverlayClicked&&this.targetEl.contains(e.target)))&&!this.isOverlayContentClicked;(this.listener?this.listener(e,{type:"outside",mode:this.overlayMode,valid:e.which!==3&&n}):n)&&this.hide(e),this.isOverlayClicked=this.isOverlayContentClicked=!1}))}unbindDocumentClickListener(){this.documentClickListener&&(this.documentClickListener(),this.documentClickListener=null)}bindDocumentResizeListener(){this.documentResizeListener||(this.documentResizeListener=this.renderer.listen(this.document.defaultView,"resize",e=>{(this.listener?this.listener(e,{type:"resize",mode:this.overlayMode,valid:!qe()}):!qe())&&this.hide(e,!0)}))}unbindDocumentResizeListener(){this.documentResizeListener&&(this.documentResizeListener(),this.documentResizeListener=null)}bindDocumentKeyboardListener(){this.documentKeyboardListener||this.zone.runOutsideAngular(()=>{this.documentKeyboardListener=this.renderer.listen(this.document.defaultView,"keydown",e=>{if(this.overlayOptions.hideOnEscape===!1||e.code!=="Escape")return;(this.listener?this.listener(e,{type:"keydown",mode:this.overlayMode,valid:!qe()}):!qe())&&this.zone.run(()=>{this.hide(e,!0)})})})}unbindDocumentKeyboardListener(){this.documentKeyboardListener&&(this.documentKeyboardListener(),this.documentKeyboardListener=null)}ngOnDestroy(){this.hide(this.overlayEl,!0),this.overlayEl&&(ct.appendOverlay(this.overlayEl,this.targetEl,this.appendTo),pe.clear(this.overlayEl)),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.unbindListeners(),super.ngOnDestroy()}static \u0275fac=function(i){return new(i||t)(I(Ui),I(Ce))};static \u0275cmp=V({type:t,selectors:[["p-overlay"]],contentQueries:function(i,n,s){if(i&1&&(S(s,Gn,4),S(s,Te,4)),i&2){let r;m(r=g())&&(n.contentTemplate=r.first),m(r=g())&&(n.templates=r)}},viewQuery:function(i,n){if(i&1&&(W(cs,5),W(Gn,5)),i&2){let s;m(s=g())&&(n.overlayViewChild=s.first),m(s=g())&&(n.contentViewChild=s.first)}},inputs:{visible:"visible",mode:"mode",style:"style",styleClass:"styleClass",contentStyle:"contentStyle",contentStyleClass:"contentStyleClass",target:"target",appendTo:"appendTo",autoZIndex:"autoZIndex",baseZIndex:"baseZIndex",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",listener:"listener",responsive:"responsive",options:"options"},outputs:{visibleChange:"visibleChange",onBeforeShow:"onBeforeShow",onShow:"onShow",onBeforeHide:"onBeforeHide",onHide:"onHide",onAnimationStart:"onAnimationStart",onAnimationDone:"onAnimationDone"},features:[$([Qn]),_],ngContentSelectors:ds,decls:1,vars:1,consts:[["overlay",""],["content",""],[3,"ngStyle","class","ngClass","click",4,"ngIf"],[3,"click","ngStyle","ngClass"],[4,"ngTemplateOutlet","ngTemplateOutletContext"]],template:function(i,n){i&1&&(De(),d(0,ys,3,20,"div",2)),i&2&&a("ngIf",n.modalVisible)},dependencies:[X,re,me,_e,ge,D],encapsulation:2,data:{animation:[at("overlayContentAnimation",[Ge(":enter",[Bt(bs)]),Ge(":leave",[Bt(Cs)])])]},changeDetection:0})}return t})();var qn=["content"],ws=["item"],xs=["loader"],Is=["loadericon"],Ts=["element"],Vs=["*"],Ss=(t,o,e)=>({"p-virtualscroller":!0,"p-virtualscroller-inline":t,"p-virtualscroller-both p-both-scroll":o,"p-virtualscroller-horizontal p-horizontal-scroll":e}),li=(t,o)=>({$implicit:t,options:o}),Os=t=>({"p-virtualscroller-content":!0,"p-virtualscroller-loading ":t}),Es=t=>({"p-virtualscroller-loader-mask":t}),ks=t=>({numCols:t}),Zn=t=>({options:t}),Ds=()=>({styleClass:"p-virtualscroller-loading-icon"}),Fs=(t,o)=>({rows:t,columns:o});function Ms(t,o){t&1&&N(0)}function As(t,o){if(t&1&&(A(0),d(1,Ms,1,0,"ng-container",10),L()),t&2){let e=c(2);l(),a("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",xe(2,li,e.loadedItems,e.getContentOptions()))}}function Ls(t,o){t&1&&N(0)}function $s(t,o){if(t&1&&(A(0),d(1,Ls,1,0,"ng-container",10),L()),t&2){let e=o.$implicit,i=o.index,n=c(3);l(),a("ngTemplateOutlet",n.itemTemplate||n._itemTemplate)("ngTemplateOutletContext",xe(2,li,e,n.getOptions(i)))}}function zs(t,o){if(t&1&&(p(0,"div",11,3),d(2,$s,2,5,"ng-container",12),u()),t&2){let e=c(2);he(e.contentStyle),T(e.contentStyleClass),a("ngClass",z(8,Os,e.d_loading)),f("data-pc-section","content"),l(2),a("ngForOf",e.loadedItems)("ngForTrackBy",e._trackBy)}}function Ps(t,o){if(t&1&&y(0,"div",13),t&2){let e=c(2);a("ngStyle",e.spacerStyle),f("data-pc-section","spacer")}}function Ns(t,o){t&1&&N(0)}function Rs(t,o){if(t&1&&(A(0),d(1,Ns,1,0,"ng-container",10),L()),t&2){let e=o.index,i=c(4);l(),a("ngTemplateOutlet",i.loaderTemplate||i._loaderTemplate)("ngTemplateOutletContext",z(4,Zn,i.getLoaderOptions(e,i.both&&z(2,ks,i.numItemsInViewport.cols))))}}function Bs(t,o){if(t&1&&(A(0),d(1,Rs,2,6,"ng-container",15),L()),t&2){let e=c(3);l(),a("ngForOf",e.loaderArr)}}function Hs(t,o){t&1&&N(0)}function js(t,o){if(t&1&&(A(0),d(1,Hs,1,0,"ng-container",10),L()),t&2){let e=c(4);l(),a("ngTemplateOutlet",e.loaderIconTemplate||e._loaderIconTemplate)("ngTemplateOutletContext",z(3,Zn,Me(2,Ds)))}}function Gs(t,o){t&1&&y(0,"SpinnerIcon",16),t&2&&(a("styleClass","p-virtualscroller-loading-icon pi-spin"),f("data-pc-section","loadingIcon"))}function Qs(t,o){if(t&1&&d(0,js,2,5,"ng-container",6)(1,Gs,1,2,"ng-template",null,5,le),t&2){let e=fe(2),i=c(3);a("ngIf",i.loaderIconTemplate||i._loaderIconTemplate)("ngIfElse",e)}}function Us(t,o){if(t&1&&(p(0,"div",14),d(1,Bs,2,1,"ng-container",6)(2,Qs,3,2,"ng-template",null,4,le),u()),t&2){let e=fe(3),i=c(2);a("ngClass",z(4,Es,!i.loaderTemplate)),f("data-pc-section","loader"),l(),a("ngIf",i.loaderTemplate||i._loaderTemplate)("ngIfElse",e)}}function qs(t,o){if(t&1){let e=Q();A(0),p(1,"div",7,1),E("scroll",function(n){C(e);let s=c();return w(s.onContainerScroll(n))}),d(3,As,2,5,"ng-container",6)(4,zs,3,10,"ng-template",null,2,le)(6,Ps,1,2,"div",8)(7,Us,4,6,"div",9),u(),L()}if(t&2){let e=fe(5),i=c();l(),T(i._styleClass),a("ngStyle",i._style)("ngClass",Xe(12,Ss,i.inline,i.both,i.horizontal)),f("id",i._id)("tabindex",i.tabindex)("data-pc-name","scroller")("data-pc-section","root"),l(2),a("ngIf",i.contentTemplate||i._contentTemplate)("ngIfElse",e),l(3),a("ngIf",i._showSpacer),l(),a("ngIf",!i.loaderDisabled&&i._showLoader&&i.d_loading)}}function Ws(t,o){t&1&&N(0)}function Zs(t,o){if(t&1&&(A(0),d(1,Ws,1,0,"ng-container",10),L()),t&2){let e=c(2);l(),a("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",xe(5,li,e.items,xe(2,Fs,e._items,e.loadedColumns)))}}function Ks(t,o){if(t&1&&(Fe(0),d(1,Zs,2,8,"ng-container",17)),t&2){let e=c();l(),a("ngIf",e.contentTemplate||e._contentTemplate)}}var Ys=({dt:t})=>`
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${t("virtualscroller.loader.mask.background")};
    color: ${t("virtualscroller.loader.mask.color")};
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-loading-icon {
    font-size: ${t("virtualscroller.loader.icon.size")};
    width: ${t("virtualscroller.loader.icon.size")};
    height: ${t("virtualscroller.loader.icon.size")};
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}
`,Wn=(()=>{class t extends Z{name="virtualscroller";theme=Ys;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var ci=(()=>{class t extends U{zone;get id(){return this._id}set id(e){this._id=e}get style(){return this._style}set style(e){this._style=e}get styleClass(){return this._styleClass}set styleClass(e){this._styleClass=e}get tabindex(){return this._tabindex}set tabindex(e){this._tabindex=e}get items(){return this._items}set items(e){this._items=e}get itemSize(){return this._itemSize}set itemSize(e){this._itemSize=e}get scrollHeight(){return this._scrollHeight}set scrollHeight(e){this._scrollHeight=e}get scrollWidth(){return this._scrollWidth}set scrollWidth(e){this._scrollWidth=e}get orientation(){return this._orientation}set orientation(e){this._orientation=e}get step(){return this._step}set step(e){this._step=e}get delay(){return this._delay}set delay(e){this._delay=e}get resizeDelay(){return this._resizeDelay}set resizeDelay(e){this._resizeDelay=e}get appendOnly(){return this._appendOnly}set appendOnly(e){this._appendOnly=e}get inline(){return this._inline}set inline(e){this._inline=e}get lazy(){return this._lazy}set lazy(e){this._lazy=e}get disabled(){return this._disabled}set disabled(e){this._disabled=e}get loaderDisabled(){return this._loaderDisabled}set loaderDisabled(e){this._loaderDisabled=e}get columns(){return this._columns}set columns(e){this._columns=e}get showSpacer(){return this._showSpacer}set showSpacer(e){this._showSpacer=e}get showLoader(){return this._showLoader}set showLoader(e){this._showLoader=e}get numToleratedItems(){return this._numToleratedItems}set numToleratedItems(e){this._numToleratedItems=e}get loading(){return this._loading}set loading(e){this._loading=e}get autoSize(){return this._autoSize}set autoSize(e){this._autoSize=e}get trackBy(){return this._trackBy}set trackBy(e){this._trackBy=e}get options(){return this._options}set options(e){this._options=e,e&&typeof e=="object"&&(Object.entries(e).forEach(([i,n])=>this[`_${i}`]!==n&&(this[`_${i}`]=n)),Object.entries(e).forEach(([i,n])=>this[`${i}`]!==n&&(this[`${i}`]=n)))}onLazyLoad=new x;onScroll=new x;onScrollIndexChange=new x;elementViewChild;contentViewChild;height;_id;_style;_styleClass;_tabindex=0;_items;_itemSize=0;_scrollHeight;_scrollWidth;_orientation="vertical";_step=0;_delay=0;_resizeDelay=10;_appendOnly=!1;_inline=!1;_lazy=!1;_disabled=!1;_loaderDisabled=!1;_columns;_showSpacer=!0;_showLoader=!1;_numToleratedItems;_loading;_autoSize=!1;_trackBy;_options;d_loading=!1;d_numToleratedItems;contentEl;contentTemplate;itemTemplate;loaderTemplate;loaderIconTemplate;templates;_contentTemplate;_itemTemplate;_loaderTemplate;_loaderIconTemplate;first=0;last=0;page=0;isRangeChanged=!1;numItemsInViewport=0;lastScrollPos=0;lazyLoadState={};loaderArr=[];spacerStyle={};contentStyle={};scrollTimeout;resizeTimeout;initialized=!1;windowResizeListener;defaultWidth;defaultHeight;defaultContentWidth;defaultContentHeight;_contentStyleClass;get contentStyleClass(){return this._contentStyleClass}set contentStyleClass(e){this._contentStyleClass=e}get vertical(){return this._orientation==="vertical"}get horizontal(){return this._orientation==="horizontal"}get both(){return this._orientation==="both"}get loadedItems(){return this._items&&!this.d_loading?this.both?this._items.slice(this._appendOnly?0:this.first.rows,this.last.rows).map(e=>this._columns?e:e.slice(this._appendOnly?0:this.first.cols,this.last.cols)):this.horizontal&&this._columns?this._items:this._items.slice(this._appendOnly?0:this.first,this.last):[]}get loadedRows(){return this.d_loading?this._loaderDisabled?this.loaderArr:[]:this.loadedItems}get loadedColumns(){return this._columns&&(this.both||this.horizontal)?this.d_loading&&this._loaderDisabled?this.both?this.loaderArr[0]:this.loaderArr:this._columns.slice(this.both?this.first.cols:this.first,this.both?this.last.cols:this.last):this._columns}_componentStyle=B(Wn);constructor(e){super(),this.zone=e}ngOnInit(){super.ngOnInit(),this.setInitialState()}ngOnChanges(e){super.ngOnChanges(e);let i=!1;if(this.scrollHeight=="100%"&&(this.height="100%"),e.loading){let{previousValue:n,currentValue:s}=e.loading;this.lazy&&n!==s&&s!==this.d_loading&&(this.d_loading=s,i=!0)}if(e.orientation&&(this.lastScrollPos=this.both?{top:0,left:0}:0),e.numToleratedItems){let{previousValue:n,currentValue:s}=e.numToleratedItems;n!==s&&s!==this.d_numToleratedItems&&(this.d_numToleratedItems=s)}if(e.options){let{previousValue:n,currentValue:s}=e.options;this.lazy&&n?.loading!==s?.loading&&s?.loading!==this.d_loading&&(this.d_loading=s.loading,i=!0),n?.numToleratedItems!==s?.numToleratedItems&&s?.numToleratedItems!==this.d_numToleratedItems&&(this.d_numToleratedItems=s.numToleratedItems)}this.initialized&&!i&&(e.items?.previousValue?.length!==e.items?.currentValue?.length||e.itemSize||e.scrollHeight||e.scrollWidth)&&(this.init(),this.calculateAutoSize())}ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"content":this._contentTemplate=e.template;break;case"item":this._itemTemplate=e.template;break;case"loader":this._loaderTemplate=e.template;break;case"loadericon":this._loaderIconTemplate=e.template;break;default:this._itemTemplate=e.template;break}})}ngAfterViewInit(){super.ngAfterViewInit(),Promise.resolve().then(()=>{this.viewInit()})}ngAfterViewChecked(){this.initialized||this.viewInit()}ngOnDestroy(){this.unbindResizeListener(),this.contentEl=null,this.initialized=!1,super.ngOnDestroy()}viewInit(){He(this.platformId)&&!this.initialized&&Gt(this.elementViewChild?.nativeElement)&&(this.setInitialState(),this.setContentEl(this.contentEl),this.init(),this.defaultWidth=Ue(this.elementViewChild?.nativeElement),this.defaultHeight=Qe(this.elementViewChild?.nativeElement),this.defaultContentWidth=Ue(this.contentEl),this.defaultContentHeight=Qe(this.contentEl),this.initialized=!0)}init(){this._disabled||(this.setSize(),this.calculateOptions(),this.setSpacerSize(),this.bindResizeListener(),this.cd.detectChanges())}setContentEl(e){this.contentEl=e||this.contentViewChild?.nativeElement||ye(this.elementViewChild?.nativeElement,".p-virtualscroller-content")}setInitialState(){this.first=this.both?{rows:0,cols:0}:0,this.last=this.both?{rows:0,cols:0}:0,this.numItemsInViewport=this.both?{rows:0,cols:0}:0,this.lastScrollPos=this.both?{top:0,left:0}:0,this.d_loading=this._loading||!1,this.d_numToleratedItems=this._numToleratedItems,this.loaderArr=[]}getElementRef(){return this.elementViewChild}getPageByFirst(e){return Math.floor(((e??this.first)+this.d_numToleratedItems*4)/(this._step||1))}isPageChanged(e){return this._step?this.page!==this.getPageByFirst(e??this.first):!0}scrollTo(e){this.elementViewChild?.nativeElement?.scrollTo(e)}scrollToIndex(e,i="auto"){if(this.both?e.every(s=>s>-1):e>-1){let s=this.first,{scrollTop:r=0,scrollLeft:h=0}=this.elementViewChild?.nativeElement,{numToleratedItems:q}=this.calculateNumItems(),P=this.getContentPosition(),M=this.itemSize,ce=(F=0,j)=>F<=j?0:F,ee=(F,j,ue)=>F*j+ue,de=(F=0,j=0)=>this.scrollTo({left:F,top:j,behavior:i}),ne=this.both?{rows:0,cols:0}:0,Pe=!1,O=!1;this.both?(ne={rows:ce(e[0],q[0]),cols:ce(e[1],q[1])},de(ee(ne.cols,M[1],P.left),ee(ne.rows,M[0],P.top)),O=this.lastScrollPos.top!==r||this.lastScrollPos.left!==h,Pe=ne.rows!==s.rows||ne.cols!==s.cols):(ne=ce(e,q),this.horizontal?de(ee(ne,M,P.left),r):de(h,ee(ne,M,P.top)),O=this.lastScrollPos!==(this.horizontal?h:r),Pe=ne!==s),this.isRangeChanged=Pe,O&&(this.first=ne)}}scrollInView(e,i,n="auto"){if(i){let{first:s,viewport:r}=this.getRenderedRange(),h=(M=0,ce=0)=>this.scrollTo({left:M,top:ce,behavior:n}),q=i==="to-start",P=i==="to-end";if(q){if(this.both)r.first.rows-s.rows>e[0]?h(r.first.cols*this._itemSize[1],(r.first.rows-1)*this._itemSize[0]):r.first.cols-s.cols>e[1]&&h((r.first.cols-1)*this._itemSize[1],r.first.rows*this._itemSize[0]);else if(r.first-s>e){let M=(r.first-1)*this._itemSize;this.horizontal?h(M,0):h(0,M)}}else if(P){if(this.both)r.last.rows-s.rows<=e[0]+1?h(r.first.cols*this._itemSize[1],(r.first.rows+1)*this._itemSize[0]):r.last.cols-s.cols<=e[1]+1&&h((r.first.cols+1)*this._itemSize[1],r.first.rows*this._itemSize[0]);else if(r.last-s<=e+1){let M=(r.first+1)*this._itemSize;this.horizontal?h(M,0):h(0,M)}}}else this.scrollToIndex(e,n)}getRenderedRange(){let e=(s,r)=>r||s?Math.floor(s/(r||s)):0,i=this.first,n=0;if(this.elementViewChild?.nativeElement){let{scrollTop:s,scrollLeft:r}=this.elementViewChild.nativeElement;if(this.both)i={rows:e(s,this._itemSize[0]),cols:e(r,this._itemSize[1])},n={rows:i.rows+this.numItemsInViewport.rows,cols:i.cols+this.numItemsInViewport.cols};else{let h=this.horizontal?r:s;i=e(h,this._itemSize),n=i+this.numItemsInViewport}}return{first:this.first,last:this.last,viewport:{first:i,last:n}}}calculateNumItems(){let e=this.getContentPosition(),i=(this.elementViewChild?.nativeElement?this.elementViewChild.nativeElement.offsetWidth-e.left:0)||0,n=(this.elementViewChild?.nativeElement?this.elementViewChild.nativeElement.offsetHeight-e.top:0)||0,s=(P,M)=>M||P?Math.ceil(P/(M||P)):0,r=P=>Math.ceil(P/2),h=this.both?{rows:s(n,this._itemSize[0]),cols:s(i,this._itemSize[1])}:s(this.horizontal?i:n,this._itemSize),q=this.d_numToleratedItems||(this.both?[r(h.rows),r(h.cols)]:r(h));return{numItemsInViewport:h,numToleratedItems:q}}calculateOptions(){let{numItemsInViewport:e,numToleratedItems:i}=this.calculateNumItems(),n=(h,q,P,M=!1)=>this.getLast(h+q+(h<P?2:3)*P,M),s=this.first,r=this.both?{rows:n(this.first.rows,e.rows,i[0]),cols:n(this.first.cols,e.cols,i[1],!0)}:n(this.first,e,i);this.last=r,this.numItemsInViewport=e,this.d_numToleratedItems=i,this.showLoader&&(this.loaderArr=this.both?Array.from({length:e.rows}).map(()=>Array.from({length:e.cols})):Array.from({length:e})),this._lazy&&Promise.resolve().then(()=>{this.lazyLoadState={first:this._step?this.both?{rows:0,cols:s.cols}:0:s,last:Math.min(this._step?this._step:this.last,this.items.length)},this.handleEvents("onLazyLoad",this.lazyLoadState)})}calculateAutoSize(){this._autoSize&&!this.d_loading&&Promise.resolve().then(()=>{if(this.contentEl){this.contentEl.style.minHeight=this.contentEl.style.minWidth="auto",this.contentEl.style.position="relative",this.elementViewChild.nativeElement.style.contain="none";let[e,i]=[Ue(this.contentEl),Qe(this.contentEl)];e!==this.defaultContentWidth&&(this.elementViewChild.nativeElement.style.width=""),i!==this.defaultContentHeight&&(this.elementViewChild.nativeElement.style.height="");let[n,s]=[Ue(this.elementViewChild.nativeElement),Qe(this.elementViewChild.nativeElement)];(this.both||this.horizontal)&&(this.elementViewChild.nativeElement.style.width=n<this.defaultWidth?n+"px":this._scrollWidth||this.defaultWidth+"px"),(this.both||this.vertical)&&(this.elementViewChild.nativeElement.style.height=s<this.defaultHeight?s+"px":this._scrollHeight||this.defaultHeight+"px"),this.contentEl.style.minHeight=this.contentEl.style.minWidth="",this.contentEl.style.position="",this.elementViewChild.nativeElement.style.contain=""}})}getLast(e=0,i=!1){return this._items?Math.min(i?(this._columns||this._items[0]).length:this._items.length,e):0}getContentPosition(){if(this.contentEl){let e=getComputedStyle(this.contentEl),i=parseFloat(e.paddingLeft)+Math.max(parseFloat(e.left)||0,0),n=parseFloat(e.paddingRight)+Math.max(parseFloat(e.right)||0,0),s=parseFloat(e.paddingTop)+Math.max(parseFloat(e.top)||0,0),r=parseFloat(e.paddingBottom)+Math.max(parseFloat(e.bottom)||0,0);return{left:i,right:n,top:s,bottom:r,x:i+n,y:s+r}}return{left:0,right:0,top:0,bottom:0,x:0,y:0}}setSize(){if(this.elementViewChild?.nativeElement){let e=this.elementViewChild.nativeElement.parentElement.parentElement,i=this._scrollWidth||`${this.elementViewChild.nativeElement.offsetWidth||e.offsetWidth}px`,n=this._scrollHeight||`${this.elementViewChild.nativeElement.offsetHeight||e.offsetHeight}px`,s=(r,h)=>this.elementViewChild.nativeElement.style[r]=h;this.both||this.horizontal?(s("height",n),s("width",i)):s("height",n)}}setSpacerSize(){if(this._items){let e=this.getContentPosition(),i=(n,s,r,h=0)=>this.spacerStyle=te(k({},this.spacerStyle),{[`${n}`]:(s||[]).length*r+h+"px"});this.both?(i("height",this._items,this._itemSize[0],e.y),i("width",this._columns||this._items[1],this._itemSize[1],e.x)):this.horizontal?i("width",this._columns||this._items,this._itemSize,e.x):i("height",this._items,this._itemSize,e.y)}}setContentPosition(e){if(this.contentEl&&!this._appendOnly){let i=e?e.first:this.first,n=(r,h)=>r*h,s=(r=0,h=0)=>this.contentStyle=te(k({},this.contentStyle),{transform:`translate3d(${r}px, ${h}px, 0)`});if(this.both)s(n(i.cols,this._itemSize[1]),n(i.rows,this._itemSize[0]));else{let r=n(i,this._itemSize);this.horizontal?s(r,0):s(0,r)}}}onScrollPositionChange(e){let i=e.target,n=this.getContentPosition(),s=(O,F)=>O?O>F?O-F:O:0,r=(O,F)=>F||O?Math.floor(O/(F||O)):0,h=(O,F,j,ue,Ve,Ne)=>O<=Ve?Ve:Ne?j-ue-Ve:F+Ve-1,q=(O,F,j,ue,Ve,Ne,yt)=>O<=Ne?0:Math.max(0,yt?O<F?j:O-Ne:O>F?j:O-2*Ne),P=(O,F,j,ue,Ve,Ne=!1)=>{let yt=F+ue+2*Ve;return O>=Ve&&(yt+=Ve+1),this.getLast(yt,Ne)},M=s(i.scrollTop,n.top),ce=s(i.scrollLeft,n.left),ee=this.both?{rows:0,cols:0}:0,de=this.last,ne=!1,Pe=this.lastScrollPos;if(this.both){let O=this.lastScrollPos.top<=M,F=this.lastScrollPos.left<=ce;if(!this._appendOnly||this._appendOnly&&(O||F)){let j={rows:r(M,this._itemSize[0]),cols:r(ce,this._itemSize[1])},ue={rows:h(j.rows,this.first.rows,this.last.rows,this.numItemsInViewport.rows,this.d_numToleratedItems[0],O),cols:h(j.cols,this.first.cols,this.last.cols,this.numItemsInViewport.cols,this.d_numToleratedItems[1],F)};ee={rows:q(j.rows,ue.rows,this.first.rows,this.last.rows,this.numItemsInViewport.rows,this.d_numToleratedItems[0],O),cols:q(j.cols,ue.cols,this.first.cols,this.last.cols,this.numItemsInViewport.cols,this.d_numToleratedItems[1],F)},de={rows:P(j.rows,ee.rows,this.last.rows,this.numItemsInViewport.rows,this.d_numToleratedItems[0]),cols:P(j.cols,ee.cols,this.last.cols,this.numItemsInViewport.cols,this.d_numToleratedItems[1],!0)},ne=ee.rows!==this.first.rows||de.rows!==this.last.rows||ee.cols!==this.first.cols||de.cols!==this.last.cols||this.isRangeChanged,Pe={top:M,left:ce}}}else{let O=this.horizontal?ce:M,F=this.lastScrollPos<=O;if(!this._appendOnly||this._appendOnly&&F){let j=r(O,this._itemSize),ue=h(j,this.first,this.last,this.numItemsInViewport,this.d_numToleratedItems,F);ee=q(j,ue,this.first,this.last,this.numItemsInViewport,this.d_numToleratedItems,F),de=P(j,ee,this.last,this.numItemsInViewport,this.d_numToleratedItems),ne=ee!==this.first||de!==this.last||this.isRangeChanged,Pe=O}}return{first:ee,last:de,isRangeChanged:ne,scrollPos:Pe}}onScrollChange(e){let{first:i,last:n,isRangeChanged:s,scrollPos:r}=this.onScrollPositionChange(e);if(s){let h={first:i,last:n};if(this.setContentPosition(h),this.first=i,this.last=n,this.lastScrollPos=r,this.handleEvents("onScrollIndexChange",h),this._lazy&&this.isPageChanged(i)){let q={first:this._step?Math.min(this.getPageByFirst(i)*this._step,this.items.length-this._step):i,last:Math.min(this._step?(this.getPageByFirst(i)+1)*this._step:n,this.items.length)};(this.lazyLoadState.first!==q.first||this.lazyLoadState.last!==q.last)&&this.handleEvents("onLazyLoad",q),this.lazyLoadState=q}}}onContainerScroll(e){if(this.handleEvents("onScroll",{originalEvent:e}),this._delay&&this.isPageChanged()){if(this.scrollTimeout&&clearTimeout(this.scrollTimeout),!this.d_loading&&this.showLoader){let{isRangeChanged:i}=this.onScrollPositionChange(e);(i||this._step&&this.isPageChanged())&&(this.d_loading=!0,this.cd.detectChanges())}this.scrollTimeout=setTimeout(()=>{this.onScrollChange(e),this.d_loading&&this.showLoader&&(!this._lazy||this._loading===void 0)&&(this.d_loading=!1,this.page=this.getPageByFirst()),this.cd.detectChanges()},this._delay)}else!this.d_loading&&this.onScrollChange(e)}bindResizeListener(){He(this.platformId)&&(this.windowResizeListener||this.zone.runOutsideAngular(()=>{let e=this.document.defaultView,i=qe()?"orientationchange":"resize";this.windowResizeListener=this.renderer.listen(e,i,this.onWindowResize.bind(this))}))}unbindResizeListener(){this.windowResizeListener&&(this.windowResizeListener(),this.windowResizeListener=null)}onWindowResize(){this.resizeTimeout&&clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(()=>{if(Gt(this.elementViewChild?.nativeElement)){let[e,i]=[Ue(this.elementViewChild?.nativeElement),Qe(this.elementViewChild?.nativeElement)],[n,s]=[e!==this.defaultWidth,i!==this.defaultHeight];(this.both?n||s:this.horizontal?n:this.vertical&&s)&&this.zone.run(()=>{this.d_numToleratedItems=this._numToleratedItems,this.defaultWidth=e,this.defaultHeight=i,this.defaultContentWidth=Ue(this.contentEl),this.defaultContentHeight=Qe(this.contentEl),this.init()})}},this._resizeDelay)}handleEvents(e,i){return this.options&&this.options[e]?this.options[e](i):this[e].emit(i)}getContentOptions(){return{contentStyleClass:`p-virtualscroller-content ${this.d_loading?"p-virtualscroller-loading":""}`,items:this.loadedItems,getItemOptions:e=>this.getOptions(e),loading:this.d_loading,getLoaderOptions:(e,i)=>this.getLoaderOptions(e,i),itemSize:this._itemSize,rows:this.loadedRows,columns:this.loadedColumns,spacerStyle:this.spacerStyle,contentStyle:this.contentStyle,vertical:this.vertical,horizontal:this.horizontal,both:this.both}}getOptions(e){let i=(this._items||[]).length,n=this.both?this.first.rows+e:this.first+e;return{index:n,count:i,first:n===0,last:n===i-1,even:n%2===0,odd:n%2!==0}}getLoaderOptions(e,i){let n=this.loaderArr.length;return k({index:e,count:n,first:e===0,last:e===n-1,even:e%2===0,odd:e%2!==0},i)}static \u0275fac=function(i){return new(i||t)(I(Ce))};static \u0275cmp=V({type:t,selectors:[["p-scroller"],["p-virtualscroller"],["p-virtual-scroller"],["p-virtualScroller"]],contentQueries:function(i,n,s){if(i&1&&(S(s,qn,4),S(s,ws,4),S(s,xs,4),S(s,Is,4),S(s,Te,4)),i&2){let r;m(r=g())&&(n.contentTemplate=r.first),m(r=g())&&(n.itemTemplate=r.first),m(r=g())&&(n.loaderTemplate=r.first),m(r=g())&&(n.loaderIconTemplate=r.first),m(r=g())&&(n.templates=r)}},viewQuery:function(i,n){if(i&1&&(W(Ts,5),W(qn,5)),i&2){let s;m(s=g())&&(n.elementViewChild=s.first),m(s=g())&&(n.contentViewChild=s.first)}},hostVars:2,hostBindings:function(i,n){i&2&&Ye("height",n.height)},inputs:{id:"id",style:"style",styleClass:"styleClass",tabindex:"tabindex",items:"items",itemSize:"itemSize",scrollHeight:"scrollHeight",scrollWidth:"scrollWidth",orientation:"orientation",step:"step",delay:"delay",resizeDelay:"resizeDelay",appendOnly:"appendOnly",inline:"inline",lazy:"lazy",disabled:"disabled",loaderDisabled:"loaderDisabled",columns:"columns",showSpacer:"showSpacer",showLoader:"showLoader",numToleratedItems:"numToleratedItems",loading:"loading",autoSize:"autoSize",trackBy:"trackBy",options:"options"},outputs:{onLazyLoad:"onLazyLoad",onScroll:"onScroll",onScrollIndexChange:"onScrollIndexChange"},features:[$([Wn]),_,be],ngContentSelectors:Vs,decls:3,vars:2,consts:[["disabledContainer",""],["element",""],["buildInContent",""],["content",""],["buildInLoader",""],["buildInLoaderIcon",""],[4,"ngIf","ngIfElse"],[3,"scroll","ngStyle","ngClass"],["class","p-virtualscroller-spacer",3,"ngStyle",4,"ngIf"],["class","p-virtualscroller-loader",3,"ngClass",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[3,"ngClass"],[4,"ngFor","ngForOf","ngForTrackBy"],[1,"p-virtualscroller-spacer",3,"ngStyle"],[1,"p-virtualscroller-loader",3,"ngClass"],[4,"ngFor","ngForOf"],[3,"styleClass"],[4,"ngIf"]],template:function(i,n){if(i&1&&(De(),d(0,qs,8,16,"ng-container",6)(1,Ks,2,1,"ng-template",null,0,le)),i&2){let s=fe(2);a("ngIf",!n._disabled)("ngIfElse",s)}},dependencies:[X,re,Je,me,_e,ge,Wi,D],encapsulation:2})}return t})(),vp=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[ci,D,D]})}return t})();var _t=t=>({height:t}),Xs=(t,o,e)=>({"p-select-option":!0,"p-select-option-selected":t,"p-disabled":o,"p-focus":e}),di=t=>({$implicit:t});function Js(t,o){t&1&&y(0,"CheckIcon",5)}function er(t,o){t&1&&y(0,"BlankIcon",6)}function tr(t,o){if(t&1&&(A(0),d(1,Js,1,0,"CheckIcon",3)(2,er,1,0,"BlankIcon",4),L()),t&2){let e=c();l(),a("ngIf",e.selected),l(),a("ngIf",!e.selected)}}function ir(t,o){if(t&1&&(p(0,"span"),we(1),u()),t&2){let e,i=c();l(),Be((e=i.label)!==null&&e!==void 0?e:"empty")}}function nr(t,o){t&1&&N(0)}var or=["item"],sr=["group"],rr=["loader"],ar=["selectedItem"],lr=["header"],Kn=["filter"],cr=["footer"],dr=["emptyfilter"],pr=["empty"],ur=["dropdownicon"],hr=["loadingicon"],fr=["clearicon"],mr=["filtericon"],gr=["onicon"],_r=["officon"],yr=["cancelicon"],vr=["focusInput"],br=["editableInput"],Cr=["items"],wr=["scroller"],xr=["overlay"],Ir=["firstHiddenFocusableEl"],Tr=["lastHiddenFocusableEl"],Vr=()=>({class:"p-select-clear-icon"}),Sr=()=>({class:"p-select-dropdown-icon"}),Xn=t=>({options:t}),Jn=(t,o)=>({$implicit:t,options:o}),Or=()=>({});function Er(t,o){if(t&1&&(A(0),we(1),L()),t&2){let e=c(2);l(),Be(e.label()==="p-emptylabel"?"\xA0":e.label())}}function kr(t,o){if(t&1&&N(0,24),t&2){let e=c(2);a("ngTemplateOutlet",e.selectedItemTemplate||e._selectedItemTemplate)("ngTemplateOutletContext",z(2,di,e.selectedOption))}}function Dr(t,o){if(t&1&&(p(0,"span"),we(1),u()),t&2){let e=c(3);l(),Be(e.label()==="p-emptylabel"?"\xA0":e.label())}}function Fr(t,o){if(t&1&&d(0,Dr,2,1,"span",18),t&2){let e=c(2);a("ngIf",e.isSelectedOptionEmpty())}}function Mr(t,o){if(t&1){let e=Q();p(0,"span",22,3),E("focus",function(n){C(e);let s=c();return w(s.onInputFocus(n))})("blur",function(n){C(e);let s=c();return w(s.onInputBlur(n))})("keydown",function(n){C(e);let s=c();return w(s.onKeyDown(n))}),d(2,Er,2,1,"ng-container",20)(3,kr,1,4,"ng-container",23)(4,Fr,1,1,"ng-template",null,4,le),u()}if(t&2){let e,i=fe(5),n=c();a("ngClass",n.inputClass)("pTooltip",n.tooltip)("tooltipPosition",n.tooltipPosition)("positionStyle",n.tooltipPositionStyle)("tooltipStyleClass",n.tooltipStyleClass)("pAutoFocus",n.autofocus),f("aria-disabled",n.disabled)("id",n.inputId)("aria-label",n.ariaLabel||(n.label()==="p-emptylabel"?void 0:n.label()))("aria-labelledby",n.ariaLabelledBy)("aria-haspopup","listbox")("aria-expanded",(e=n.overlayVisible)!==null&&e!==void 0?e:!1)("aria-controls",n.overlayVisible?n.id+"_list":null)("tabindex",n.disabled?-1:n.tabindex)("aria-activedescendant",n.focused?n.focusedOptionId:void 0)("aria-required",n.required)("required",n.required),l(2),a("ngIf",!n.selectedItemTemplate&&!n._selectedItemTemplate)("ngIfElse",i),l(),a("ngIf",(n.selectedItemTemplate||n._selectedItemTemplate)&&!n.isSelectedOptionEmpty())}}function Ar(t,o){if(t&1){let e=Q();p(0,"input",25,5),E("input",function(n){C(e);let s=c();return w(s.onEditableInput(n))})("keydown",function(n){C(e);let s=c();return w(s.onKeyDown(n))})("focus",function(n){C(e);let s=c();return w(s.onInputFocus(n))})("blur",function(n){C(e);let s=c();return w(s.onInputBlur(n))}),u()}if(t&2){let e=c();a("ngClass",e.inputClass)("disabled",e.disabled)("pAutoFocus",e.autofocus),f("id",e.inputId)("maxlength",e.maxlength)("placeholder",e.modelValue()===void 0||e.modelValue()===null?e.placeholder():void 0)("aria-label",e.ariaLabel||(e.label()==="p-emptylabel"?void 0:e.label()))("aria-activedescendant",e.focused?e.focusedOptionId:void 0)}}function Lr(t,o){if(t&1){let e=Q();p(0,"TimesIcon",27),E("click",function(n){C(e);let s=c(2);return w(s.clear(n))}),u()}t&2&&f("data-pc-section","clearicon")}function $r(t,o){}function zr(t,o){t&1&&d(0,$r,0,0,"ng-template")}function Pr(t,o){if(t&1){let e=Q();p(0,"span",27),E("click",function(n){C(e);let s=c(2);return w(s.clear(n))}),d(1,zr,1,0,null,28),u()}if(t&2){let e=c(2);f("data-pc-section","clearicon"),l(),a("ngTemplateOutlet",e.clearIconTemplate||e._clearIconTemplate)("ngTemplateOutletContext",Me(3,Vr))}}function Nr(t,o){if(t&1&&(A(0),d(1,Lr,1,1,"TimesIcon",26)(2,Pr,2,4,"span",26),L()),t&2){let e=c();l(),a("ngIf",!e.clearIconTemplate&&!e._clearIconTemplate),l(),a("ngIf",e.clearIconTemplate||e._clearIconTemplate)}}function Rr(t,o){t&1&&N(0)}function Br(t,o){if(t&1&&(A(0),d(1,Rr,1,0,"ng-container",29),L()),t&2){let e=c(2);l(),a("ngTemplateOutlet",e.loadingIconTemplate||e._loadingIconTemplate)}}function Hr(t,o){if(t&1&&y(0,"span",32),t&2){let e=c(3);a("ngClass","p-select-loading-icon pi-spin "+e.loadingIcon)}}function jr(t,o){t&1&&y(0,"span",33),t&2&&T("p-select-loading-icon pi pi-spinner pi-spin")}function Gr(t,o){if(t&1&&(A(0),d(1,Hr,1,1,"span",30)(2,jr,1,2,"span",31),L()),t&2){let e=c(2);l(),a("ngIf",e.loadingIcon),l(),a("ngIf",!e.loadingIcon)}}function Qr(t,o){if(t&1&&(A(0),d(1,Br,2,1,"ng-container",18)(2,Gr,3,2,"ng-container",18),L()),t&2){let e=c();l(),a("ngIf",e.loadingIconTemplate||e._loadingIconTemplate),l(),a("ngIf",!e.loadingIconTemplate&&!e._loadingIconTemplate)}}function Ur(t,o){if(t&1&&y(0,"span",37),t&2){let e=c(3);a("ngClass",e.dropdownIcon)}}function qr(t,o){t&1&&y(0,"ChevronDownIcon",38),t&2&&a("styleClass","p-select-dropdown-icon")}function Wr(t,o){if(t&1&&(A(0),d(1,Ur,1,1,"span",35)(2,qr,1,1,"ChevronDownIcon",36),L()),t&2){let e=c(2);l(),a("ngIf",e.dropdownIcon),l(),a("ngIf",!e.dropdownIcon)}}function Zr(t,o){}function Kr(t,o){t&1&&d(0,Zr,0,0,"ng-template")}function Yr(t,o){if(t&1&&(p(0,"span",39),d(1,Kr,1,0,null,28),u()),t&2){let e=c(2);l(),a("ngTemplateOutlet",e.dropdownIconTemplate||e._dropdownIconTemplate)("ngTemplateOutletContext",Me(2,Sr))}}function Xr(t,o){if(t&1&&d(0,Wr,3,2,"ng-container",18)(1,Yr,2,3,"span",34),t&2){let e=c();a("ngIf",!e.dropdownIconTemplate&&!e._dropdownIconTemplate),l(),a("ngIf",e.dropdownIconTemplate||e._dropdownIconTemplate)}}function Jr(t,o){t&1&&N(0)}function ea(t,o){t&1&&N(0)}function ta(t,o){if(t&1&&(A(0),d(1,ea,1,0,"ng-container",28),L()),t&2){let e=c(3);l(),a("ngTemplateOutlet",e.filterTemplate||e._filterTemplate)("ngTemplateOutletContext",z(2,Xn,e.filterOptions))}}function ia(t,o){t&1&&y(0,"SearchIcon")}function na(t,o){}function oa(t,o){t&1&&d(0,na,0,0,"ng-template")}function sa(t,o){if(t&1&&(p(0,"span"),d(1,oa,1,0,null,29),u()),t&2){let e=c(4);l(),a("ngTemplateOutlet",e.filterIconTemplate||e._filterIconTemplate)}}function ra(t,o){if(t&1){let e=Q();p(0,"p-iconfield")(1,"input",46,10),E("input",function(n){C(e);let s=c(3);return w(s.onFilterInputChange(n))})("keydown",function(n){C(e);let s=c(3);return w(s.onFilterKeyDown(n))})("blur",function(n){C(e);let s=c(3);return w(s.onFilterBlur(n))}),u(),p(3,"p-inputicon"),d(4,ia,1,0,"SearchIcon",18)(5,sa,2,1,"span",18),u()()}if(t&2){let e=c(3);l(),a("pSize",e.size)("value",e._filterValue()||"")("variant",e.variant),f("placeholder",e.filterPlaceholder)("aria-owns",e.id+"_list")("aria-label",e.ariaFilterLabel)("aria-activedescendant",e.focusedOptionId),l(3),a("ngIf",!e.filterIconTemplate&&!e._filterIconTemplate),l(),a("ngIf",e.filterIconTemplate||e._filterIconTemplate)}}function aa(t,o){if(t&1){let e=Q();p(0,"div",45),E("click",function(n){return C(e),w(n.stopPropagation())}),d(1,ta,2,4,"ng-container",20)(2,ra,6,9,"ng-template",null,9,le),u()}if(t&2){let e=fe(3),i=c(2);l(),a("ngIf",i.filterTemplate||i._filterTemplate)("ngIfElse",e)}}function la(t,o){t&1&&N(0)}function ca(t,o){if(t&1&&d(0,la,1,0,"ng-container",28),t&2){let e=o.$implicit,i=o.options;c(2);let n=fe(9);a("ngTemplateOutlet",n)("ngTemplateOutletContext",xe(2,Jn,e,i))}}function da(t,o){t&1&&N(0)}function pa(t,o){if(t&1&&d(0,da,1,0,"ng-container",28),t&2){let e=o.options,i=c(4);a("ngTemplateOutlet",i.loaderTemplate||i._loaderTemplate)("ngTemplateOutletContext",z(2,Xn,e))}}function ua(t,o){t&1&&(A(0),d(1,pa,1,4,"ng-template",null,12,le),L())}function ha(t,o){if(t&1){let e=Q();p(0,"p-scroller",47,11),E("onLazyLoad",function(n){C(e);let s=c(2);return w(s.onLazyLoad.emit(n))}),d(2,ca,1,5,"ng-template",null,2,le)(4,ua,3,0,"ng-container",18),u()}if(t&2){let e=c(2);he(z(8,_t,e.scrollHeight)),a("items",e.visibleOptions())("itemSize",e.virtualScrollItemSize||e._itemSize)("autoSize",!0)("lazy",e.lazy)("options",e.virtualScrollOptions),l(4),a("ngIf",e.loaderTemplate||e._loaderTemplate)}}function fa(t,o){t&1&&N(0)}function ma(t,o){if(t&1&&(A(0),d(1,fa,1,0,"ng-container",28),L()),t&2){c();let e=fe(9),i=c();l(),a("ngTemplateOutlet",e)("ngTemplateOutletContext",xe(3,Jn,i.visibleOptions(),Me(2,Or)))}}function ga(t,o){if(t&1&&(p(0,"span"),we(1),u()),t&2){let e=c(2).$implicit,i=c(3);l(),Be(i.getOptionGroupLabel(e.optionGroup))}}function _a(t,o){t&1&&N(0)}function ya(t,o){if(t&1&&(A(0),p(1,"li",51),d(2,ga,2,1,"span",18)(3,_a,1,0,"ng-container",28),u(),L()),t&2){let e=c(),i=e.$implicit,n=e.index,s=c().options,r=c(2);l(),a("ngStyle",z(5,_t,s.itemSize+"px")),f("id",r.id+"_"+r.getOptionIndex(n,s)),l(),a("ngIf",!r.groupTemplate&&!r._groupTemplate),l(),a("ngTemplateOutlet",r.groupTemplate||r._groupTemplate)("ngTemplateOutletContext",z(7,di,i.optionGroup))}}function va(t,o){if(t&1){let e=Q();A(0),p(1,"p-selectItem",52),E("onClick",function(n){C(e);let s=c().$implicit,r=c(3);return w(r.onOptionSelect(n,s))})("onMouseEnter",function(n){C(e);let s=c().index,r=c().options,h=c(2);return w(h.onOptionMouseEnter(n,h.getOptionIndex(s,r)))}),u(),L()}if(t&2){let e=c(),i=e.$implicit,n=e.index,s=c().options,r=c(2);l(),a("id",r.id+"_"+r.getOptionIndex(n,s))("option",i)("checkmark",r.checkmark)("selected",r.isSelected(i))("label",r.getOptionLabel(i))("disabled",r.isOptionDisabled(i))("template",r.itemTemplate||r._itemTemplate)("focused",r.focusedOptionIndex()===r.getOptionIndex(n,s))("ariaPosInset",r.getAriaPosInset(r.getOptionIndex(n,s)))("ariaSetSize",r.ariaSetSize)}}function ba(t,o){if(t&1&&d(0,ya,4,9,"ng-container",18)(1,va,2,10,"ng-container",18),t&2){let e=o.$implicit,i=c(3);a("ngIf",i.isOptionGroup(e)),l(),a("ngIf",!i.isOptionGroup(e))}}function Ca(t,o){if(t&1&&we(0),t&2){let e=c(4);rt(" ",e.emptyFilterMessageLabel," ")}}function wa(t,o){t&1&&N(0,null,14)}function xa(t,o){if(t&1&&d(0,wa,2,0,"ng-container",29),t&2){let e=c(4);a("ngTemplateOutlet",e.emptyFilterTemplate||e._emptyFilterTemplate||e.emptyTemplate||e._emptyTemplate)}}function Ia(t,o){if(t&1&&(p(0,"li",53),d(1,Ca,1,1)(2,xa,1,1,"ng-container"),u()),t&2){let e=c().options,i=c(2);a("ngStyle",z(2,_t,e.itemSize+"px")),l(),ke(!i.emptyFilterTemplate&&!i._emptyFilterTemplate&&!i.emptyTemplate?1:2)}}function Ta(t,o){if(t&1&&we(0),t&2){let e=c(4);rt(" ",e.emptyMessageLabel," ")}}function Va(t,o){t&1&&N(0,null,15)}function Sa(t,o){if(t&1&&d(0,Va,2,0,"ng-container",29),t&2){let e=c(4);a("ngTemplateOutlet",e.emptyTemplate||e._emptyTemplate)}}function Oa(t,o){if(t&1&&(p(0,"li",53),d(1,Ta,1,1)(2,Sa,1,1,"ng-container"),u()),t&2){let e=c().options,i=c(2);a("ngStyle",z(2,_t,e.itemSize+"px")),l(),ke(!i.emptyTemplate&&!i._emptyTemplate?1:2)}}function Ea(t,o){if(t&1&&(p(0,"ul",48,13),d(2,ba,2,2,"ng-template",49)(3,Ia,3,4,"li",50)(4,Oa,3,4,"li",50),u()),t&2){let e=o.$implicit,i=o.options,n=c(2);he(i.contentStyle),a("ngClass",i.contentStyleClass),f("id",n.id+"_list")("aria-label",n.listLabel),l(2),a("ngForOf",e),l(),a("ngIf",n.filterValue&&n.isEmpty()),l(),a("ngIf",!n.filterValue&&n.isEmpty())}}function ka(t,o){t&1&&N(0)}function Da(t,o){if(t&1){let e=Q();p(0,"div",40)(1,"span",41,6),E("focus",function(n){C(e);let s=c();return w(s.onFirstHiddenFocus(n))}),u(),d(3,Jr,1,0,"ng-container",29)(4,aa,4,2,"div",42),p(5,"div",43),d(6,ha,5,10,"p-scroller",44)(7,ma,2,6,"ng-container",18)(8,Ea,5,8,"ng-template",null,7,le),u(),d(10,ka,1,0,"ng-container",29),p(11,"span",41,8),E("focus",function(n){C(e);let s=c();return w(s.onLastHiddenFocus(n))}),u()()}if(t&2){let e=c();T(e.panelStyleClass),a("ngClass","p-select-overlay p-component")("ngStyle",e.panelStyle),l(),f("tabindex",0)("data-p-hidden-accessible",!0)("data-p-hidden-focusable",!0),l(2),a("ngTemplateOutlet",e.headerTemplate||e._headerTemplate),l(),a("ngIf",e.filter),l(),Ye("max-height",e.virtualScroll?"auto":e.scrollHeight||"auto"),l(),a("ngIf",e.virtualScroll),l(),a("ngIf",!e.virtualScroll),l(3),a("ngTemplateOutlet",e.footerTemplate||e._footerTemplate),l(),f("tabindex",0)("data-p-hidden-accessible",!0)("data-p-hidden-focusable",!0)}}var Fa=({dt:t})=>`
.p-select {
    display: inline-flex;
    cursor: pointer;
    position: relative;
    user-select: none;
    background: ${t("select.background")};
    border: 1px solid ${t("select.border.color")};
    transition: background ${t("select.transition.duration")}, color ${t("select.transition.duration")}, border-color ${t("select.transition.duration")},
        outline-color ${t("select.transition.duration")}, box-shadow ${t("select.transition.duration")};
    border-radius: ${t("select.border.radius")};
    outline-color: transparent;
    box-shadow: ${t("select.shadow")};
}

.p-select.ng-invalid.ng-dirty {
    border-color: ${t("select.invalid.border.color")};
}

.p-select:not(.p-disabled):hover {
    border-color: ${t("select.hover.border.color")};
}

.p-select:not(.p-disabled).p-focus {
    border-color: ${t("select.focus.border.color")};
    box-shadow: ${t("select.focus.ring.shadow")};
    outline: ${t("select.focus.ring.width")} ${t("select.focus.ring.style")} ${t("select.focus.ring.color")};
    outline-offset: ${t("select.focus.ring.offset")};
}

.p-select.p-variant-filled {
    background: ${t("select.filled.background")};
}

.p-select.p-variant-filled:not(.p-disabled):hover {
    background: ${t("select.filled.hover.background")};
}

.p-select.p-variant-filled.p-focus {
    background: ${t("select.filled.focus.background")};
}

.p-select.p-disabled {
    opacity: 1;
    background: ${t("select.disabled.background")};
}

.p-select-clear-icon {
    position: absolute;
    top: 50%;
    margin-top: -0.5rem;
    color: ${t("select.clear.icon.color")};
    inset-inline-end: ${t("select.dropdown.width")};
}

.p-select-dropdown {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    color: ${t("select.dropdown.color")};
    width: ${t("select.dropdown.width")};
    border-start-end-radius: ${t("select.border.radius")};
    border-end-end-radius: ${t("select.border.radius")};
}

.p-select-label {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    flex: 1 1 auto;
    width: 1%;
    padding: ${t("select.padding.y")} ${t("select.padding.x")};
    text-overflow: ellipsis;
    cursor: pointer;
    color: ${t("select.color")};
    background: transparent;
    border: 0 none;
    outline: 0 none;
}

.p-select-label.p-placeholder {
    color: ${t("select.placeholder.color")};
}

.p-select.ng-invalid.ng-dirty .p-select-label.p-placeholder {
    color: ${t("select.invalid.placeholder.color")};
}

.p-select:has(.p-select-clear-icon) .p-select-label {
    padding-inline-end: calc(1rem + ${t("select.padding.x")});
}

.p-select.p-disabled .p-select-label {
    color: ${t("select.disabled.color")};
}

.p-select-label-empty {
    overflow: hidden;
    opacity: 0;
}

input.p-select-label {
    cursor: default;
}

.p-select .p-select-overlay {
    min-width: 100%;
}

.p-select-overlay {
    cursor: default;
    background: ${t("select.overlay.background")};
    color: ${t("select.overlay.color")};
    border: 1px solid ${t("select.overlay.border.color")};
    border-radius: ${t("select.overlay.border.radius")};
    box-shadow: ${t("select.overlay.shadow")};
}

.p-select-header {
    padding: ${t("select.list.header.padding")};
}

.p-select-filter {
    width: 100%;
}

.p-select-list-container {
    overflow: auto;
}

.p-select-option-group {
    cursor: auto;
    margin: 0;
    padding: ${t("select.option.group.padding")};
    background: ${t("select.option.group.background")};
    color: ${t("select.option.group.color")};
    font-weight: ${t("select.option.group.font.weight")};
}

.p-select-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
    padding: ${t("select.list.padding")};
    gap: ${t("select.list.gap")};
    display: flex;
    flex-direction: column;
}

.p-select-option {
    cursor: pointer;
    font-weight: normal;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: ${t("select.option.padding")};
    border: 0 none;
    color: ${t("select.option.color")};
    background: transparent;
    transition: background ${t("select.transition.duration")}, color ${t("select.transition.duration")}, border-color ${t("select.transition.duration")},
            box-shadow ${t("select.transition.duration")}, outline-color ${t("select.transition.duration")};
    border-radius: ${t("select.option.border.radius")};
}

.p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
    background: ${t("select.option.focus.background")};
    color: ${t("select.option.focus.color")};
}

.p-select-option.p-select-option-selected {
    background: ${t("select.option.selected.background")};
    color: ${t("select.option.selected.color")};
}

.p-select-option.p-select-option-selected.p-focus {
    background: ${t("select.option.selected.focus.background")};
    color: ${t("select.option.selected.focus.color")};
}

.p-select-option-check-icon {
    position: relative;
    margin-inline-start: ${t("select.checkmark.gutter.start")};
    margin-inline-end: ${t("select.checkmark.gutter.end")};
    color: ${t("select.checkmark.color")};
}

.p-select-empty-message {
    padding: ${t("select.empty.message.padding")};
}

.p-select-fluid {
    display: flex;
}

.p-select-sm .p-select-label {
    font-size: ${t("select.sm.font.size")};
    padding-block: ${t("select.sm.padding.y")};
    padding-inline: ${t("select.sm.padding.x")};
}

.p-select-sm .p-select-dropdown .p-icon {
    font-size: ${t("select.sm.font.size")};
    width: ${t("select.sm.font.size")};
    height: ${t("select.sm.font.size")};
}

.p-select-lg .p-select-label {
    font-size: ${t("select.lg.font.size")};
    padding-block: ${t("select.lg.padding.y")};
    padding-inline: ${t("select.lg.padding.x")};
}

.p-select-lg .p-select-dropdown .p-icon {
    font-size: ${t("select.lg.font.size")};
    width: ${t("select.lg.font.size")};
    height: ${t("select.lg.font.size")};
}
`,Ma={root:({instance:t})=>["p-select p-component p-inputwrapper",{"p-disabled":t.disabled,"p-variant-filled":t.variant==="filled"||t.config.inputVariant()==="filled"||t.config.inputStyle()==="filled","p-focus":t.focused,"p-inputwrapper-filled":t.modelValue()!==void 0&&t.modelValue()!==null,"p-inputwrapper-focus":t.focused||t.overlayVisible,"p-select-open":t.overlayVisible,"p-select-fluid":t.hasFluid,"p-select-sm p-inputfield-sm":t.size==="small","p-select-lg p-inputfield-lg":t.size==="large"}],label:({instance:t,props:o})=>["p-select-label",{"p-placeholder":!o.editable&&t.label===o.placeholder,"p-select-label-empty":!o.editable&&!t.$slots.value&&(t.label==="p-emptylabel"||t.label.length===0)}],clearIcon:"p-select-clear-icon",dropdown:"p-select-dropdown",loadingicon:"p-select-loading-icon",dropdownIcon:"p-select-dropdown-icon",overlay:"p-select-overlay p-component",header:"p-select-header",pcFilter:"p-select-filter",listContainer:"p-select-list-container",list:"p-select-list",optionGroup:"p-select-option-group",optionGroupLabel:"p-select-option-group-label",option:({instance:t,props:o,state:e,option:i,focusedOption:n})=>["p-select-option",{"p-select-option-selected":t.isSelected(i)&&o.highlightOnSelect,"p-focus":e.focusedOptionIndex===n,"p-disabled":t.isOptionDisabled(i)}],optionLabel:"p-select-option-label",optionCheckIcon:"p-select-option-check-icon",optionBlankIcon:"p-select-option-blank-icon",emptyMessage:"p-select-empty-message"},Yn=(()=>{class t extends Z{name="select";theme=Fa;classes=Ma;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var Aa={provide:Ke,useExisting:Se(()=>eo),multi:!0},La=(()=>{class t extends U{id;option;selected;focused;label;disabled;visible;itemSize;ariaPosInset;ariaSetSize;template;checkmark;onClick=new x;onMouseEnter=new x;onOptionClick(e){this.onClick.emit(e)}onOptionMouseEnter(e){this.onMouseEnter.emit(e)}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["p-selectItem"]],inputs:{id:"id",option:"option",selected:[2,"selected","selected",b],focused:[2,"focused","focused",b],label:"label",disabled:[2,"disabled","disabled",b],visible:[2,"visible","visible",b],itemSize:[2,"itemSize","itemSize",Y],ariaPosInset:"ariaPosInset",ariaSetSize:"ariaSetSize",template:"template",checkmark:[2,"checkmark","checkmark",b]},outputs:{onClick:"onClick",onMouseEnter:"onMouseEnter"},features:[_],decls:4,vars:22,consts:[["role","option","pRipple","",3,"click","mouseenter","id","ngStyle","ngClass"],[4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["styleClass","p-select-option-check-icon",4,"ngIf"],["styleClass","p-select-option-blank-icon",4,"ngIf"],["styleClass","p-select-option-check-icon"],["styleClass","p-select-option-blank-icon"]],template:function(i,n){i&1&&(p(0,"li",0),E("click",function(r){return n.onOptionClick(r)})("mouseenter",function(r){return n.onOptionMouseEnter(r)}),d(1,tr,3,2,"ng-container",1)(2,ir,2,1,"span",1)(3,nr,1,0,"ng-container",2),u()),i&2&&(a("id",n.id)("ngStyle",z(14,_t,n.itemSize+"px"))("ngClass",Xe(16,Xs,n.selected&&!n.checkmark,n.disabled,n.focused)),f("aria-label",n.label)("aria-setsize",n.ariaSetSize)("aria-posinset",n.ariaPosInset)("aria-selected",n.selected)("data-p-focused",n.focused)("data-p-highlight",n.selected)("data-p-disabled",n.disabled),l(),a("ngIf",n.checkmark),l(),a("ngIf",!n.template),l(),a("ngTemplateOutlet",n.template)("ngTemplateOutletContext",z(20,di,n.option)))},dependencies:[X,re,me,_e,ge,D,Zi,st,On],encapsulation:2})}return t})(),eo=(()=>{class t extends U{zone;filterService;id;scrollHeight="200px";filter;name;style;panelStyle;styleClass;panelStyleClass;readonly;required;editable;appendTo;tabindex=0;set placeholder(e){this._placeholder.set(e)}get placeholder(){return this._placeholder.asReadonly()}loadingIcon;filterPlaceholder;filterLocale;variant;inputId;dataKey;filterBy;filterFields;autofocus;resetFilterOnHide=!1;checkmark=!1;dropdownIcon;loading=!1;optionLabel;optionValue;optionDisabled;optionGroupLabel="label";optionGroupChildren="items";autoDisplayFirst=!0;group;showClear;emptyFilterMessage="";emptyMessage="";lazy=!1;virtualScroll;virtualScrollItemSize;virtualScrollOptions;size;overlayOptions;ariaFilterLabel;ariaLabel;ariaLabelledBy;filterMatchMode="contains";maxlength;tooltip="";tooltipPosition="right";tooltipPositionStyle="absolute";tooltipStyleClass;focusOnHover=!0;selectOnFocus=!1;autoOptionFocus=!1;autofocusFilter=!0;fluid;get disabled(){return this._disabled}set disabled(e){e&&(this.focused=!1,this.overlayVisible&&this.hide()),this._disabled=e,this.cd.destroyed||this.cd.detectChanges()}get itemSize(){return this._itemSize}set itemSize(e){this._itemSize=e,console.log("The itemSize property is deprecated, use virtualScrollItemSize property instead.")}_itemSize;get autoZIndex(){return this._autoZIndex}set autoZIndex(e){this._autoZIndex=e,console.log("The autoZIndex property is deprecated since v14.2.0, use overlayOptions property instead.")}_autoZIndex;get baseZIndex(){return this._baseZIndex}set baseZIndex(e){this._baseZIndex=e,console.log("The baseZIndex property is deprecated since v14.2.0, use overlayOptions property instead.")}_baseZIndex;get showTransitionOptions(){return this._showTransitionOptions}set showTransitionOptions(e){this._showTransitionOptions=e,console.log("The showTransitionOptions property is deprecated since v14.2.0, use overlayOptions property instead.")}_showTransitionOptions;get hideTransitionOptions(){return this._hideTransitionOptions}set hideTransitionOptions(e){this._hideTransitionOptions=e,console.log("The hideTransitionOptions property is deprecated since v14.2.0, use overlayOptions property instead.")}_hideTransitionOptions;get filterValue(){return this._filterValue()}set filterValue(e){setTimeout(()=>{this._filterValue.set(e)})}get options(){return this._options()}set options(e){Bi(e,this._options())||this._options.set(e)}onChange=new x;onFilter=new x;onFocus=new x;onBlur=new x;onClick=new x;onShow=new x;onHide=new x;onClear=new x;onLazyLoad=new x;_componentStyle=B(Yn);filterViewChild;focusInputViewChild;editableInputViewChild;itemsViewChild;scroller;overlayViewChild;firstHiddenFocusableElementOnOverlay;lastHiddenFocusableElementOnOverlay;get hasFluid(){let i=this.el.nativeElement.closest("p-fluid");return this.fluid||!!i}get hostClass(){return this._componentStyle.classes.root({instance:this}).map(i=>typeof i=="string"?i:Object.keys(i).filter(n=>i[n]).join(" ")).join(" ")+" "+this.styleClass}get hostStyle(){return this.style}_disabled;itemsWrapper;itemTemplate;groupTemplate;loaderTemplate;selectedItemTemplate;headerTemplate;filterTemplate;footerTemplate;emptyFilterTemplate;emptyTemplate;dropdownIconTemplate;loadingIconTemplate;clearIconTemplate;filterIconTemplate;onIconTemplate;offIconTemplate;cancelIconTemplate;templates;_itemTemplate;_selectedItemTemplate;_headerTemplate;_filterTemplate;_footerTemplate;_emptyFilterTemplate;_emptyTemplate;_groupTemplate;_loaderTemplate;_dropdownIconTemplate;_loadingIconTemplate;_clearIconTemplate;_filterIconTemplate;_cancelIconTemplate;_onIconTemplate;_offIconTemplate;filterOptions;_options=oe(null);_placeholder=oe(void 0);modelValue=oe(null);value;onModelChange=()=>{};onModelTouched=()=>{};hover;focused;overlayVisible;optionsChanged;panel;dimensionsUpdated;hoveredItem;selectedOptionUpdated;_filterValue=oe(null);searchValue;searchIndex;searchTimeout;previousSearchChar;currentSearchChar;preventModelTouched;focusedOptionIndex=oe(-1);labelId;listId;clicked=oe(!1);get emptyMessageLabel(){return this.emptyMessage||this.config.getTranslation(wt.EMPTY_MESSAGE)}get emptyFilterMessageLabel(){return this.emptyFilterMessage||this.config.getTranslation(wt.EMPTY_FILTER_MESSAGE)}get isVisibleClearIcon(){return this.modelValue()!=null&&this.hasSelectedOption()&&this.showClear&&!this.disabled}get listLabel(){return this.config.getTranslation(wt.ARIA).listLabel}get rootClass(){return this._componentStyle.classes.root({instance:this})}get inputClass(){let e=this.label();return{"p-select-label":!0,"p-placeholder":this.placeholder()&&e===this.placeholder(),"p-select-label-empty":!this.editable&&!this.selectedItemTemplate&&(e==null||e==="p-emptylabel"||e.length===0)}}get panelClass(){return{"p-dropdown-panel p-component":!0,"p-input-filled":this.config.inputStyle()==="filled"||this.config.inputVariant()==="filled","p-ripple-disabled":this.config.ripple()===!1}}get focusedOptionId(){return this.focusedOptionIndex()!==-1?`${this.id}_${this.focusedOptionIndex()}`:null}visibleOptions=Ie(()=>{let e=this.getAllVisibleAndNonVisibleOptions();if(this._filterValue()){let n=!(this.filterBy||this.optionLabel)&&!this.filterFields&&!this.optionValue?this.options.filter(s=>s.label?s.label.toString().toLowerCase().indexOf(this._filterValue().toLowerCase().trim())!==-1:s.toString().toLowerCase().indexOf(this._filterValue().toLowerCase().trim())!==-1):this.filterService.filter(e,this.searchFields(),this._filterValue().trim(),this.filterMatchMode,this.filterLocale);if(this.group){let s=this.options||[],r=[];return s.forEach(h=>{let P=this.getOptionGroupChildren(h).filter(M=>n.includes(M));P.length>0&&r.push(te(k({},h),{[typeof this.optionGroupChildren=="string"?this.optionGroupChildren:"items"]:[...P]}))}),this.flatOptions(r)}return n}return e});label=Ie(()=>{let e=this.getAllVisibleAndNonVisibleOptions(),i=e.findIndex(n=>this.isOptionValueEqualsModelValue(n));return i!==-1?this.getOptionLabel(e[i]):this.placeholder()||"p-emptylabel"});filled=Ie(()=>typeof this.modelValue()=="string"?!!this.modelValue():this.label()!=="p-emptylabel"&&this.modelValue()!==void 0&&this.modelValue()!==null);selectedOption;editableInputValue=Ie(()=>this.getOptionLabel(this.selectedOption)||this.modelValue()||"");constructor(e,i){super(),this.zone=e,this.filterService=i,Ii(()=>{let n=this.modelValue(),s=this.visibleOptions();if(s&&bt(s)){let r=this.findSelectedOptionIndex();(r!==-1||n===void 0||typeof n=="string"&&n.length===0||this.isModelValueNotSet()||this.editable)&&(this.selectedOption=s[r])}We(s)&&(n===void 0||this.isModelValueNotSet())&&bt(this.selectedOption)&&(this.selectedOption=null),n!==void 0&&this.editable&&this.updateEditableLabel(),this.cd.markForCheck()})}isModelValueNotSet(){return this.modelValue()===null&&!this.isOptionValueEqualsModelValue(this.selectedOption)}getAllVisibleAndNonVisibleOptions(){return this.group?this.flatOptions(this.options):this.options||[]}ngOnInit(){super.ngOnInit(),this.id=this.id||ae("pn_id_"),this.autoUpdateModel(),this.filterBy&&(this.filterOptions={filter:e=>this.onFilterInputChange(e),reset:()=>this.resetFilter()})}ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"item":this._itemTemplate=e.template;break;case"selectedItem":this._selectedItemTemplate=e.template;break;case"header":this._headerTemplate=e.template;break;case"filter":this._filterTemplate=e.template;break;case"footer":this._footerTemplate=e.template;break;case"emptyfilter":this._emptyFilterTemplate=e.template;break;case"empty":this._emptyTemplate=e.template;break;case"group":this._groupTemplate=e.template;break;case"loader":this._loaderTemplate=e.template;break;case"dropdownicon":this._dropdownIconTemplate=e.template;break;case"loadingicon":this._loadingIconTemplate=e.template;break;case"clearicon":this._clearIconTemplate=e.template;break;case"filtericon":this._filterIconTemplate=e.template;break;case"cancelicon":this._cancelIconTemplate=e.template;break;case"onicon":this._onIconTemplate=e.template;break;case"officon":this._offIconTemplate=e.template;break;default:this._itemTemplate=e.template;break}})}ngAfterViewChecked(){if(this.optionsChanged&&this.overlayVisible&&(this.optionsChanged=!1,this.zone.runOutsideAngular(()=>{setTimeout(()=>{this.overlayViewChild&&this.overlayViewChild.alignOverlay()},1)})),this.selectedOptionUpdated&&this.itemsWrapper){let e=ye(this.overlayViewChild?.overlayViewChild?.nativeElement,"li.p-select-option-selected");e&&Ni(this.itemsWrapper,e),this.selectedOptionUpdated=!1}}flatOptions(e){return(e||[]).reduce((i,n,s)=>{i.push({optionGroup:n,group:!0,index:s});let r=this.getOptionGroupChildren(n);return r&&r.forEach(h=>i.push(h)),i},[])}autoUpdateModel(){if(this.selectOnFocus&&this.autoOptionFocus&&!this.hasSelectedOption()&&(this.focusedOptionIndex.set(this.findFirstFocusedOptionIndex()),this.onOptionSelect(null,this.visibleOptions()[this.focusedOptionIndex()],!1)),this.autoDisplayFirst&&(this.modelValue()===null||this.modelValue()===void 0)&&!this.placeholder()){let e=this.findFirstOptionIndex();this.onOptionSelect(null,this.visibleOptions()[e],!1,!0)}}onOptionSelect(e,i,n=!0,s=!1){if(!this.isSelected(i)){let r=this.getOptionValue(i);this.updateModel(r,e),this.focusedOptionIndex.set(this.findSelectedOptionIndex()),s===!1&&this.onChange.emit({originalEvent:e,value:r})}n&&this.hide(!0)}onOptionMouseEnter(e,i){this.focusOnHover&&this.changeFocusedOptionIndex(e,i)}updateModel(e,i){this.value=e,this.onModelChange(e),this.modelValue.set(e),this.selectedOptionUpdated=!0}writeValue(e){this.filter&&this.resetFilter(),this.value=e,this.allowModelChange()&&this.onModelChange(e),this.modelValue.set(this.value),this.updateEditableLabel(),this.cd.markForCheck()}allowModelChange(){return!!this.modelValue()&&!this.placeholder()&&(this.modelValue()===void 0||this.modelValue()===null)&&!this.editable&&this.options&&this.options.length}isSelected(e){return this.isOptionValueEqualsModelValue(e)}isOptionValueEqualsModelValue(e){return this.isValidOption(e)&&Ct(this.modelValue(),this.getOptionValue(e),this.equalityKey())}ngAfterViewInit(){super.ngAfterViewInit(),this.editable&&this.updateEditableLabel(),this.updatePlaceHolderForFloatingLabel()}updatePlaceHolderForFloatingLabel(){let e=this.el.nativeElement.parentElement,i=e?.classList.contains("p-float-label");if(e&&i&&!this.selectedOption){let n=e.querySelector("label");n&&this._placeholder.set(n.textContent)}}updateEditableLabel(){this.editableInputViewChild&&(this.editableInputViewChild.nativeElement.value=this.getOptionLabel(this.selectedOption)||this.modelValue()||"")}clearEditableLabel(){this.editableInputViewChild&&(this.editableInputViewChild.nativeElement.value="")}getOptionIndex(e,i){return this.virtualScrollerDisabled?e:i&&i.getItemOptions(e).index}getOptionLabel(e){return this.optionLabel!==void 0&&this.optionLabel!==null?tt(e,this.optionLabel):e&&e.label!==void 0?e.label:e}getOptionValue(e){return this.optionValue&&this.optionValue!==null?tt(e,this.optionValue):!this.optionLabel&&e&&e.value!==void 0?e.value:e}isSelectedOptionEmpty(){return We(this.selectedOption)}isOptionDisabled(e){return this.getOptionValue(this.modelValue())===this.getOptionValue(e)||this.getOptionLabel(this.modelValue()===this.getOptionLabel(e))&&e.disabled===!1?!1:this.optionDisabled?tt(e,this.optionDisabled):e&&e.disabled!==void 0?e.disabled:!1}getOptionGroupLabel(e){return this.optionGroupLabel!==void 0&&this.optionGroupLabel!==null?tt(e,this.optionGroupLabel):e&&e.label!==void 0?e.label:e}getOptionGroupChildren(e){return this.optionGroupChildren!==void 0&&this.optionGroupChildren!==null?tt(e,this.optionGroupChildren):e.items}getAriaPosInset(e){return(this.optionGroupLabel?e-this.visibleOptions().slice(0,e).filter(i=>this.isOptionGroup(i)).length:e)+1}get ariaSetSize(){return this.visibleOptions().filter(e=>!this.isOptionGroup(e)).length}resetFilter(){this._filterValue.set(null),this.filterViewChild&&this.filterViewChild.nativeElement&&(this.filterViewChild.nativeElement.value="")}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){this.disabled=e,this.cd.markForCheck()}onContainerClick(e){this.disabled||this.readonly||this.loading||(this.focusInputViewChild?.nativeElement.focus({preventScroll:!0}),!(e.target.tagName==="INPUT"||e.target.getAttribute("data-pc-section")==="clearicon"||e.target.closest('[data-pc-section="clearicon"]'))&&((!this.overlayViewChild||!this.overlayViewChild.el.nativeElement.contains(e.target))&&(this.overlayVisible?this.hide(!0):this.show(!0)),this.onClick.emit(e),this.clicked.set(!0),this.cd.detectChanges()))}isEmpty(){return!this._options()||this.visibleOptions()&&this.visibleOptions().length===0}onEditableInput(e){let i=e.target.value;this.searchValue="",!this.searchOptions(e,i)&&this.focusedOptionIndex.set(-1),this.onModelChange(i),this.updateModel(i||null,e),setTimeout(()=>{this.onChange.emit({originalEvent:e,value:i})},1),!this.overlayVisible&&bt(i)&&this.show()}show(e){this.overlayVisible=!0,this.focusedOptionIndex.set(this.focusedOptionIndex()!==-1?this.focusedOptionIndex():this.autoOptionFocus?this.findFirstFocusedOptionIndex():this.editable?-1:this.findSelectedOptionIndex()),e&&ve(this.focusInputViewChild?.nativeElement),this.cd.markForCheck()}onOverlayAnimationStart(e){if(e.toState==="visible"){if(this.itemsWrapper=ye(this.overlayViewChild?.overlayViewChild?.nativeElement,this.virtualScroll?".p-scroller":".p-select-list-container"),this.virtualScroll&&this.scroller?.setContentEl(this.itemsViewChild?.nativeElement),this.options&&this.options.length)if(this.virtualScroll){let i=this.modelValue()?this.focusedOptionIndex():-1;i!==-1&&this.scroller?.scrollToIndex(i)}else{let i=ye(this.itemsWrapper,".p-select-option.p-select-option-selected");i&&i.scrollIntoView({block:"nearest",inline:"nearest"})}this.filterViewChild&&this.filterViewChild.nativeElement&&(this.preventModelTouched=!0,this.autofocusFilter&&!this.editable&&this.filterViewChild.nativeElement.focus()),this.onShow.emit(e)}e.toState==="void"&&(this.itemsWrapper=null,this.onModelTouched(),this.onHide.emit(e))}hide(e){this.overlayVisible=!1,this.focusedOptionIndex.set(-1),this.clicked.set(!1),this.searchValue="",this.overlayOptions?.mode==="modal"&&Ei(),this.filter&&this.resetFilterOnHide&&this.resetFilter(),e&&(this.focusInputViewChild&&ve(this.focusInputViewChild?.nativeElement),this.editable&&this.editableInputViewChild&&ve(this.editableInputViewChild?.nativeElement)),this.cd.markForCheck()}onInputFocus(e){if(this.disabled)return;this.focused=!0;let i=this.focusedOptionIndex()!==-1?this.focusedOptionIndex():this.overlayVisible&&this.autoOptionFocus?this.findFirstFocusedOptionIndex():-1;this.focusedOptionIndex.set(i),this.overlayVisible&&this.scrollInView(this.focusedOptionIndex()),this.onFocus.emit(e)}onInputBlur(e){this.focused=!1,this.onBlur.emit(e),this.preventModelTouched||this.onModelTouched(),this.preventModelTouched=!1}onKeyDown(e,i=!1){if(!(this.disabled||this.readonly||this.loading)){switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e,this.editable);break;case"ArrowLeft":case"ArrowRight":this.onArrowLeftKey(e,this.editable);break;case"Delete":this.onDeleteKey(e);break;case"Home":this.onHomeKey(e,this.editable);break;case"End":this.onEndKey(e,this.editable);break;case"PageDown":this.onPageDownKey(e);break;case"PageUp":this.onPageUpKey(e);break;case"Space":this.onSpaceKey(e,i);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e);break;case"Backspace":this.onBackspaceKey(e,this.editable);break;case"ShiftLeft":case"ShiftRight":break;default:!e.metaKey&&ji(e.key)&&(!this.overlayVisible&&this.show(),!this.editable&&this.searchOptions(e,e.key));break}this.clicked.set(!1)}}onFilterKeyDown(e){switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e,!0);break;case"ArrowLeft":case"ArrowRight":this.onArrowLeftKey(e,!0);break;case"Home":this.onHomeKey(e,!0);break;case"End":this.onEndKey(e,!0);break;case"Enter":case"NumpadEnter":this.onEnterKey(e,!0);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e,!0);break;default:break}}onFilterBlur(e){this.focusedOptionIndex.set(-1)}onArrowDownKey(e){if(!this.overlayVisible)this.show(),this.editable&&this.changeFocusedOptionIndex(e,this.findSelectedOptionIndex());else{let i=this.focusedOptionIndex()!==-1?this.findNextOptionIndex(this.focusedOptionIndex()):this.clicked()?this.findFirstOptionIndex():this.findFirstFocusedOptionIndex();this.changeFocusedOptionIndex(e,i)}e.preventDefault(),e.stopPropagation()}changeFocusedOptionIndex(e,i){if(this.focusedOptionIndex()!==i&&(this.focusedOptionIndex.set(i),this.scrollInView(),this.selectOnFocus)){let n=this.visibleOptions()[i];this.onOptionSelect(e,n,!1)}}get virtualScrollerDisabled(){return!this.virtualScroll}scrollInView(e=-1){let i=e!==-1?`${this.id}_${e}`:this.focusedOptionId;if(this.itemsViewChild&&this.itemsViewChild.nativeElement){let n=ye(this.itemsViewChild.nativeElement,`li[id="${i}"]`);n?n.scrollIntoView&&n.scrollIntoView({block:"nearest",inline:"nearest"}):this.virtualScrollerDisabled||setTimeout(()=>{this.virtualScroll&&this.scroller?.scrollToIndex(e!==-1?e:this.focusedOptionIndex())},0)}}hasSelectedOption(){return this.modelValue()!==void 0}isValidSelectedOption(e){return this.isValidOption(e)&&this.isSelected(e)}equalityKey(){return this.optionValue?null:this.dataKey}findFirstFocusedOptionIndex(){let e=this.findSelectedOptionIndex();return e<0?this.findFirstOptionIndex():e}findFirstOptionIndex(){return this.visibleOptions().findIndex(e=>this.isValidOption(e))}findSelectedOptionIndex(){return this.hasSelectedOption()?this.visibleOptions().findIndex(e=>this.isValidSelectedOption(e)):-1}findNextOptionIndex(e){let i=e<this.visibleOptions().length-1?this.visibleOptions().slice(e+1).findIndex(n=>this.isValidOption(n)):-1;return i>-1?i+e+1:e}findPrevOptionIndex(e){let i=e>0?Qt(this.visibleOptions().slice(0,e),n=>this.isValidOption(n)):-1;return i>-1?i:e}findLastOptionIndex(){return Qt(this.visibleOptions(),e=>this.isValidOption(e))}findLastFocusedOptionIndex(){let e=this.findSelectedOptionIndex();return e<0?this.findLastOptionIndex():e}isValidOption(e){return e!=null&&!(this.isOptionDisabled(e)||this.isOptionGroup(e))}isOptionGroup(e){return this.optionGroupLabel!==void 0&&this.optionGroupLabel!==null&&e.optionGroup!==void 0&&e.optionGroup!==null&&e.group}onArrowUpKey(e,i=!1){if(e.altKey&&!i){if(this.focusedOptionIndex()!==-1){let n=this.visibleOptions()[this.focusedOptionIndex()];this.onOptionSelect(e,n)}this.overlayVisible&&this.hide()}else{let n=this.focusedOptionIndex()!==-1?this.findPrevOptionIndex(this.focusedOptionIndex()):this.clicked()?this.findLastOptionIndex():this.findLastFocusedOptionIndex();this.changeFocusedOptionIndex(e,n),!this.overlayVisible&&this.show()}e.preventDefault(),e.stopPropagation()}onArrowLeftKey(e,i=!1){i&&this.focusedOptionIndex.set(-1)}onDeleteKey(e){this.showClear&&(this.clear(e),e.preventDefault())}onHomeKey(e,i=!1){if(i){let n=e.currentTarget;e.shiftKey?n.setSelectionRange(0,n.value.length):(n.setSelectionRange(0,0),this.focusedOptionIndex.set(-1))}else this.changeFocusedOptionIndex(e,this.findFirstOptionIndex()),!this.overlayVisible&&this.show();e.preventDefault()}onEndKey(e,i=!1){if(i){let n=e.currentTarget;if(e.shiftKey)n.setSelectionRange(0,n.value.length);else{let s=n.value.length;n.setSelectionRange(s,s),this.focusedOptionIndex.set(-1)}}else this.changeFocusedOptionIndex(e,this.findLastOptionIndex()),!this.overlayVisible&&this.show();e.preventDefault()}onPageDownKey(e){this.scrollInView(this.visibleOptions().length-1),e.preventDefault()}onPageUpKey(e){this.scrollInView(0),e.preventDefault()}onSpaceKey(e,i=!1){!this.editable&&!i&&this.onEnterKey(e)}onEnterKey(e,i=!1){if(!this.overlayVisible)this.focusedOptionIndex.set(-1),this.onArrowDownKey(e);else{if(this.focusedOptionIndex()!==-1){let n=this.visibleOptions()[this.focusedOptionIndex()];this.onOptionSelect(e,n)}!i&&this.hide()}e.preventDefault()}onEscapeKey(e){this.overlayVisible&&this.hide(!0),e.preventDefault(),e.stopPropagation()}onTabKey(e,i=!1){if(!i)if(this.overlayVisible&&this.hasFocusableElements())ve(e.shiftKey?this.lastHiddenFocusableElementOnOverlay.nativeElement:this.firstHiddenFocusableElementOnOverlay.nativeElement),e.preventDefault();else{if(this.focusedOptionIndex()!==-1&&this.overlayVisible){let n=this.visibleOptions()[this.focusedOptionIndex()];this.onOptionSelect(e,n)}this.overlayVisible&&this.hide(this.filter)}e.stopPropagation()}onFirstHiddenFocus(e){let i=e.relatedTarget===this.focusInputViewChild?.nativeElement?Li(this.overlayViewChild.el?.nativeElement,":not(.p-hidden-focusable)"):this.focusInputViewChild?.nativeElement;ve(i)}onLastHiddenFocus(e){let i=e.relatedTarget===this.focusInputViewChild?.nativeElement?$i(this.overlayViewChild?.overlayViewChild?.nativeElement,':not([data-p-hidden-focusable="true"])'):this.focusInputViewChild?.nativeElement;ve(i)}hasFocusableElements(){return Ai(this.overlayViewChild.overlayViewChild.nativeElement,':not([data-p-hidden-focusable="true"])').length>0}onBackspaceKey(e,i=!1){i&&!this.overlayVisible&&this.show()}searchFields(){return this.filterBy?.split(",")||this.filterFields||[this.optionLabel]}searchOptions(e,i){this.searchValue=(this.searchValue||"")+i;let n=-1,s=!1;return n=this.visibleOptions().findIndex(r=>this.isOptionMatched(r)),n!==-1&&(s=!0),n===-1&&this.focusedOptionIndex()===-1&&(n=this.findFirstFocusedOptionIndex()),n!==-1&&setTimeout(()=>{this.changeFocusedOptionIndex(e,n)}),this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=setTimeout(()=>{this.searchValue="",this.searchTimeout=null},500),s}isOptionMatched(e){return this.isValidOption(e)&&this.getOptionLabel(e).toString().toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale))}onFilterInputChange(e){let i=e.target.value;this._filterValue.set(i),this.focusedOptionIndex.set(-1),this.onFilter.emit({originalEvent:e,filter:this._filterValue()}),!this.virtualScrollerDisabled&&this.scroller.scrollToIndex(0),setTimeout(()=>{this.overlayViewChild.alignOverlay()}),this.cd.markForCheck()}applyFocus(){this.editable?ye(this.el.nativeElement,".p-dropdown-label.p-inputtext").focus():ve(this.focusInputViewChild?.nativeElement)}focus(){this.applyFocus()}clear(e){this.updateModel(null,e),this.clearEditableLabel(),this.onModelTouched(),this.onChange.emit({originalEvent:e,value:this.value}),this.onClear.emit(e),this.resetFilter()}static \u0275fac=function(i){return new(i||t)(I(Ce),I(Gi))};static \u0275cmp=V({type:t,selectors:[["p-select"]],contentQueries:function(i,n,s){if(i&1&&(S(s,or,4),S(s,sr,4),S(s,rr,4),S(s,ar,4),S(s,lr,4),S(s,Kn,4),S(s,cr,4),S(s,dr,4),S(s,pr,4),S(s,ur,4),S(s,hr,4),S(s,fr,4),S(s,mr,4),S(s,gr,4),S(s,_r,4),S(s,yr,4),S(s,Te,4)),i&2){let r;m(r=g())&&(n.itemTemplate=r.first),m(r=g())&&(n.groupTemplate=r.first),m(r=g())&&(n.loaderTemplate=r.first),m(r=g())&&(n.selectedItemTemplate=r.first),m(r=g())&&(n.headerTemplate=r.first),m(r=g())&&(n.filterTemplate=r.first),m(r=g())&&(n.footerTemplate=r.first),m(r=g())&&(n.emptyFilterTemplate=r.first),m(r=g())&&(n.emptyTemplate=r.first),m(r=g())&&(n.dropdownIconTemplate=r.first),m(r=g())&&(n.loadingIconTemplate=r.first),m(r=g())&&(n.clearIconTemplate=r.first),m(r=g())&&(n.filterIconTemplate=r.first),m(r=g())&&(n.onIconTemplate=r.first),m(r=g())&&(n.offIconTemplate=r.first),m(r=g())&&(n.cancelIconTemplate=r.first),m(r=g())&&(n.templates=r)}},viewQuery:function(i,n){if(i&1&&(W(Kn,5),W(vr,5),W(br,5),W(Cr,5),W(wr,5),W(xr,5),W(Ir,5),W(Tr,5)),i&2){let s;m(s=g())&&(n.filterViewChild=s.first),m(s=g())&&(n.focusInputViewChild=s.first),m(s=g())&&(n.editableInputViewChild=s.first),m(s=g())&&(n.itemsViewChild=s.first),m(s=g())&&(n.scroller=s.first),m(s=g())&&(n.overlayViewChild=s.first),m(s=g())&&(n.firstHiddenFocusableElementOnOverlay=s.first),m(s=g())&&(n.lastHiddenFocusableElementOnOverlay=s.first)}},hostVars:5,hostBindings:function(i,n){i&1&&E("click",function(r){return n.onContainerClick(r)}),i&2&&(f("id",n.id),he(n.hostStyle),T(n.hostClass))},inputs:{id:"id",scrollHeight:"scrollHeight",filter:[2,"filter","filter",b],name:"name",style:"style",panelStyle:"panelStyle",styleClass:"styleClass",panelStyleClass:"panelStyleClass",readonly:[2,"readonly","readonly",b],required:[2,"required","required",b],editable:[2,"editable","editable",b],appendTo:"appendTo",tabindex:[2,"tabindex","tabindex",Y],placeholder:"placeholder",loadingIcon:"loadingIcon",filterPlaceholder:"filterPlaceholder",filterLocale:"filterLocale",variant:"variant",inputId:"inputId",dataKey:"dataKey",filterBy:"filterBy",filterFields:"filterFields",autofocus:[2,"autofocus","autofocus",b],resetFilterOnHide:[2,"resetFilterOnHide","resetFilterOnHide",b],checkmark:[2,"checkmark","checkmark",b],dropdownIcon:"dropdownIcon",loading:[2,"loading","loading",b],optionLabel:"optionLabel",optionValue:"optionValue",optionDisabled:"optionDisabled",optionGroupLabel:"optionGroupLabel",optionGroupChildren:"optionGroupChildren",autoDisplayFirst:[2,"autoDisplayFirst","autoDisplayFirst",b],group:[2,"group","group",b],showClear:[2,"showClear","showClear",b],emptyFilterMessage:"emptyFilterMessage",emptyMessage:"emptyMessage",lazy:[2,"lazy","lazy",b],virtualScroll:[2,"virtualScroll","virtualScroll",b],virtualScrollItemSize:[2,"virtualScrollItemSize","virtualScrollItemSize",Y],virtualScrollOptions:"virtualScrollOptions",size:"size",overlayOptions:"overlayOptions",ariaFilterLabel:"ariaFilterLabel",ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy",filterMatchMode:"filterMatchMode",maxlength:[2,"maxlength","maxlength",Y],tooltip:"tooltip",tooltipPosition:"tooltipPosition",tooltipPositionStyle:"tooltipPositionStyle",tooltipStyleClass:"tooltipStyleClass",focusOnHover:[2,"focusOnHover","focusOnHover",b],selectOnFocus:[2,"selectOnFocus","selectOnFocus",b],autoOptionFocus:[2,"autoOptionFocus","autoOptionFocus",b],autofocusFilter:[2,"autofocusFilter","autofocusFilter",b],fluid:[2,"fluid","fluid",b],disabled:"disabled",itemSize:"itemSize",autoZIndex:"autoZIndex",baseZIndex:"baseZIndex",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",filterValue:"filterValue",options:"options"},outputs:{onChange:"onChange",onFilter:"onFilter",onFocus:"onFocus",onBlur:"onBlur",onClick:"onClick",onShow:"onShow",onHide:"onHide",onClear:"onClear",onLazyLoad:"onLazyLoad"},features:[$([Aa,Yn]),_],decls:11,vars:15,consts:[["elseBlock",""],["overlay",""],["content",""],["focusInput",""],["defaultPlaceholder",""],["editableInput",""],["firstHiddenFocusableEl",""],["buildInItems",""],["lastHiddenFocusableEl",""],["builtInFilterElement",""],["filter",""],["scroller",""],["loader",""],["items",""],["emptyFilter",""],["empty",""],["role","combobox",3,"ngClass","pTooltip","tooltipPosition","positionStyle","tooltipStyleClass","pAutoFocus","focus","blur","keydown",4,"ngIf"],["type","text","aria-haspopup","listbox",3,"ngClass","disabled","pAutoFocus","input","keydown","focus","blur",4,"ngIf"],[4,"ngIf"],["role","button","aria-label","dropdown trigger","aria-haspopup","listbox",1,"p-select-dropdown"],[4,"ngIf","ngIfElse"],[3,"visibleChange","onAnimationStart","onHide","visible","options","target","appendTo","autoZIndex","baseZIndex","showTransitionOptions","hideTransitionOptions"],["role","combobox",3,"focus","blur","keydown","ngClass","pTooltip","tooltipPosition","positionStyle","tooltipStyleClass","pAutoFocus"],[3,"ngTemplateOutlet","ngTemplateOutletContext",4,"ngIf"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],["type","text","aria-haspopup","listbox",3,"input","keydown","focus","blur","ngClass","disabled","pAutoFocus"],["class","p-select-clear-icon",3,"click",4,"ngIf"],[1,"p-select-clear-icon",3,"click"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[4,"ngTemplateOutlet"],["aria-hidden","true",3,"ngClass",4,"ngIf"],["aria-hidden","true",3,"class",4,"ngIf"],["aria-hidden","true",3,"ngClass"],["aria-hidden","true"],["class","p-select-dropdown-icon",4,"ngIf"],["class","p-select-dropdown-icon",3,"ngClass",4,"ngIf"],[3,"styleClass",4,"ngIf"],[1,"p-select-dropdown-icon",3,"ngClass"],[3,"styleClass"],[1,"p-select-dropdown-icon"],[3,"ngClass","ngStyle"],["role","presentation",1,"p-hidden-accessible","p-hidden-focusable",3,"focus"],["class","p-select-header",3,"click",4,"ngIf"],[1,"p-select-list-container"],[3,"items","style","itemSize","autoSize","lazy","options","onLazyLoad",4,"ngIf"],[1,"p-select-header",3,"click"],["pInputText","","type","text","role","searchbox","autocomplete","off",1,"p-select-filter",3,"input","keydown","blur","pSize","value","variant"],[3,"onLazyLoad","items","itemSize","autoSize","lazy","options"],["role","listbox",1,"p-select-list",3,"ngClass"],["ngFor","",3,"ngForOf"],["class","p-select-empty-message","role","option",3,"ngStyle",4,"ngIf"],["role","option",1,"p-select-option-group",3,"ngStyle"],[3,"onClick","onMouseEnter","id","option","checkmark","selected","label","disabled","template","focused","ariaPosInset","ariaSetSize"],["role","option",1,"p-select-empty-message",3,"ngStyle"]],template:function(i,n){if(i&1){let s=Q();d(0,Mr,6,20,"span",16)(1,Ar,2,8,"input",17)(2,Nr,3,2,"ng-container",18),p(3,"div",19),d(4,Qr,3,2,"ng-container",20)(5,Xr,2,2,"ng-template",null,0,le),u(),p(7,"p-overlay",21,1),bi("visibleChange",function(h){return C(s),vi(n.overlayVisible,h)||(n.overlayVisible=h),w(h)}),E("onAnimationStart",function(h){return C(s),w(n.onOverlayAnimationStart(h))})("onHide",function(){return C(s),w(n.hide())}),d(9,Da,13,17,"ng-template",null,2,le),u()}if(i&2){let s,r=fe(6);a("ngIf",!n.editable),l(),a("ngIf",n.editable),l(),a("ngIf",n.isVisibleClearIcon),l(),f("aria-expanded",(s=n.overlayVisible)!==null&&s!==void 0?s:!1)("data-pc-section","trigger"),l(),a("ngIf",n.loading)("ngIfElse",r),l(3),yi("visible",n.overlayVisible),a("options",n.overlayOptions)("target","@parent")("appendTo",n.appendTo)("autoZIndex",n.autoZIndex)("baseZIndex",n.baseZIndex)("showTransitionOptions",n.showTransitionOptions)("hideTransitionOptions",n.hideTransitionOptions)}},dependencies:[X,re,Je,me,_e,ge,La,Un,jn,qi,It,En,Mn,Rn,ri,ai,ci,D],encapsulation:2,changeDetection:0})}return t})(),Zp=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[eo,D,D]})}return t})();var to=["container"],$a=(t,o,e,i)=>({showTransformParams:t,hideTransformParams:o,showTransitionParams:e,hideTransitionParams:i}),za=t=>({value:"visible",params:t}),Pa=(t,o)=>({$implicit:t,closeFn:o}),Na=t=>({$implicit:t});function Ra(t,o){t&1&&N(0)}function Ba(t,o){if(t&1&&d(0,Ra,1,0,"ng-container",3),t&2){let e=c();a("ngTemplateOutlet",e.headlessTemplate)("ngTemplateOutletContext",xe(2,Pa,e.message,e.onCloseIconClick))}}function Ha(t,o){if(t&1&&y(0,"span",4),t&2){let e=c(3);a("ngClass",e.cx("messageIcon"))}}function ja(t,o){t&1&&y(0,"CheckIcon"),t&2&&f("aria-hidden",!0)("data-pc-section","icon")}function Ga(t,o){t&1&&y(0,"InfoCircleIcon"),t&2&&f("aria-hidden",!0)("data-pc-section","icon")}function Qa(t,o){t&1&&y(0,"TimesCircleIcon"),t&2&&f("aria-hidden",!0)("data-pc-section","icon")}function Ua(t,o){t&1&&y(0,"ExclamationTriangleIcon"),t&2&&f("aria-hidden",!0)("data-pc-section","icon")}function qa(t,o){t&1&&y(0,"InfoCircleIcon"),t&2&&f("aria-hidden",!0)("data-pc-section","icon")}function Wa(t,o){if(t&1&&(p(0,"span",4),d(1,ja,1,2,"CheckIcon")(2,Ga,1,2,"InfoCircleIcon")(3,Qa,1,2,"TimesCircleIcon")(4,Ua,1,2,"ExclamationTriangleIcon")(5,qa,1,2,"InfoCircleIcon"),u()),t&2){let e,i=c(3);a("ngClass",i.cx("messageIcon")),f("aria-hidden",!0)("data-pc-section","icon"),l(),ke((e=i.message.severity)==="success"?1:e==="info"?2:e==="error"?3:e==="warn"?4:5)}}function Za(t,o){if(t&1&&(A(0),d(1,Ha,1,1,"span",6)(2,Wa,6,4,"span",6),p(3,"div",4)(4,"div",4),we(5),u(),p(6,"div",4),we(7),u()(),L()),t&2){let e=c(2);l(),a("ngIf",e.message.icon),l(),a("ngIf",!e.message.icon),l(),a("ngClass",e.cx("messageText")),f("data-pc-section","text"),l(),a("ngClass",e.cx("summary")),f("data-pc-section","summary"),l(),rt(" ",e.message.summary," "),l(),a("ngClass",e.cx("detail")),f("data-pc-section","detail"),l(),Be(e.message.detail)}}function Ka(t,o){t&1&&N(0)}function Ya(t,o){if(t&1&&y(0,"span",4),t&2){let e=c(4);a("ngClass",e.cx("closeIcon"))}}function Xa(t,o){if(t&1&&d(0,Ya,1,1,"span",6),t&2){let e=c(3);a("ngIf",e.message.closeIcon)}}function Ja(t,o){if(t&1&&y(0,"TimesIcon",4),t&2){let e=c(3);a("ngClass",e.cx("closeIcon")),f("aria-hidden",!0)("data-pc-section","closeicon")}}function el(t,o){if(t&1){let e=Q();p(0,"div")(1,"button",7),E("click",function(n){C(e);let s=c(2);return w(s.onCloseIconClick(n))})("keydown.enter",function(n){C(e);let s=c(2);return w(s.onCloseIconClick(n))}),d(2,Xa,1,1,"span",4)(3,Ja,1,3,"TimesIcon",4),u()()}if(t&2){let e=c(2);l(),a("ariaLabel",e.closeAriaLabel),f("class",e.cx("closeButton"))("data-pc-section","closebutton"),l(),ke(e.message.closeIcon?2:3)}}function tl(t,o){if(t&1&&(p(0,"div",4),d(1,Za,8,10,"ng-container",5)(2,Ka,1,0,"ng-container",3)(3,el,4,4,"div"),u()),t&2){let e=c();T(e.message==null?null:e.message.contentStyleClass),a("ngClass",e.cx("messageContent")),f("data-pc-section","content"),l(),a("ngIf",!e.template),l(),a("ngTemplateOutlet",e.template)("ngTemplateOutletContext",z(8,Na,e.message)),l(),ke((e.message==null?null:e.message.closable)!==!1?3:-1)}}var il=["message"],nl=["headless"];function ol(t,o){if(t&1){let e=Q();p(0,"p-toastItem",3),E("onClose",function(n){C(e);let s=c();return w(s.onMessageClose(n))})("@toastAnimation.start",function(n){C(e);let s=c();return w(s.onAnimationStart(n))})("@toastAnimation.done",function(n){C(e);let s=c();return w(s.onAnimationEnd(n))}),u()}if(t&2){let e=o.$implicit,i=o.index,n=c();a("message",e)("index",i)("life",n.life)("template",n.template||n._template)("headlessTemplate",n.headlessTemplate||n._headlessTemplate)("@toastAnimation",void 0)("showTransformOptions",n.showTransformOptions)("hideTransformOptions",n.hideTransformOptions)("showTransitionOptions",n.showTransitionOptions)("hideTransitionOptions",n.hideTransitionOptions)}}var sl=({dt:t})=>`
.p-toast {
    width: ${t("toast.width")};
    white-space: pre-line;
    word-break: break-word;
}

.p-toast-message {
    margin: 0 0 1rem 0;
}

.p-toast-message-icon {
    flex-shrink: 0;
    font-size: ${t("toast.icon.size")};
    width: ${t("toast.icon.size")};
    height: ${t("toast.icon.size")};
}

.p-toast-message-content {
    display: flex;
    align-items: flex-start;
    padding: ${t("toast.content.padding")};
    gap: ${t("toast.content.gap")};
}

.p-toast-message-text {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: ${t("toast.text.gap")};
}

.p-toast-summary {
    font-weight: ${t("toast.summary.font.weight")};
    font-size: ${t("toast.summary.font.size")};
}

.p-toast-detail {
    font-weight: ${t("toast.detail.font.weight")};
    font-size: ${t("toast.detail.font.size")};
}

.p-toast-close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background: transparent;
    transition: background ${t("toast.transition.duration")}, color ${t("toast.transition.duration")}, outline-color ${t("toast.transition.duration")}, box-shadow ${t("toast.transition.duration")};
    outline-color: transparent;
    color: inherit;
    width: ${t("toast.close.button.width")};
    height: ${t("toast.close.button.height")};
    border-radius: ${t("toast.close.button.border.radius")};
    margin: -25% 0 0 0;
    right: -25%;
    padding: 0;
    border: none;
    user-select: none;
}

.p-toast-close-button:dir(rtl) {
    margin: -25% 0 0 auto;
    left: -25%;
    right: auto;
}

.p-toast-message-info,
.p-toast-message-success,
.p-toast-message-warn,
.p-toast-message-error,
.p-toast-message-secondary,
.p-toast-message-contrast {
    border-width: ${t("toast.border.width")};
    border-style: solid;
    backdrop-filter: blur(${t("toast.blur")});
    border-radius: ${t("toast.border.radius")};
}

.p-toast-close-icon {
    font-size: ${t("toast.close.icon.size")};
    width: ${t("toast.close.icon.size")};
    height: ${t("toast.close.icon.size")};
}

.p-toast-close-button:focus-visible {
    outline-width: ${t("focus.ring.width")};
    outline-style: ${t("focus.ring.style")};
    outline-offset: ${t("focus.ring.offset")};
}

.p-toast-message-info {
    background: ${t("toast.info.background")};
    border-color: ${t("toast.info.border.color")};
    color: ${t("toast.info.color")};
    box-shadow: ${t("toast.info.shadow")};
}

.p-toast-message-info .p-toast-detail {
    color: ${t("toast.info.detail.color")};
}

.p-toast-message-info .p-toast-close-button:focus-visible {
    outline-color: ${t("toast.info.close.button.focus.ring.color")};
    box-shadow: ${t("toast.info.close.button.focus.ring.shadow")};
}

.p-toast-message-info .p-toast-close-button:hover {
    background: ${t("toast.info.close.button.hover.background")};
}

.p-toast-message-success {
    background: ${t("toast.success.background")};
    border-color: ${t("toast.success.border.color")};
    color: ${t("toast.success.color")};
    box-shadow: ${t("toast.success.shadow")};
}

.p-toast-message-success .p-toast-detail {
    color: ${t("toast.success.detail.color")};
}

.p-toast-message-success .p-toast-close-button:focus-visible {
    outline-color: ${t("toast.success.close.button.focus.ring.color")};
    box-shadow: ${t("toast.success.close.button.focus.ring.shadow")};
}

.p-toast-message-success .p-toast-close-button:hover {
    background: ${t("toast.success.close.button.hover.background")};
}

.p-toast-message-warn {
    background: ${t("toast.warn.background")};
    border-color: ${t("toast.warn.border.color")};
    color: ${t("toast.warn.color")};
    box-shadow: ${t("toast.warn.shadow")};
}

.p-toast-message-warn .p-toast-detail {
    color: ${t("toast.warn.detail.color")};
}

.p-toast-message-warn .p-toast-close-button:focus-visible {
    outline-color: ${t("toast.warn.close.button.focus.ring.color")};
    box-shadow: ${t("toast.warn.close.button.focus.ring.shadow")};
}

.p-toast-message-warn .p-toast-close-button:hover {
    background: ${t("toast.warn.close.button.hover.background")};
}

.p-toast-message-error {
    background: ${t("toast.error.background")};
    border-color: ${t("toast.error.border.color")};
    color: ${t("toast.error.color")};
    box-shadow: ${t("toast.error.shadow")};
}

.p-toast-message-error .p-toast-detail {
    color: ${t("toast.error.detail.color")};
}

.p-toast-message-error .p-toast-close-button:focus-visible {
    outline-color: ${t("toast.error.close.button.focus.ring.color")};
    box-shadow: ${t("toast.error.close.button.focus.ring.shadow")};
}

.p-toast-message-error .p-toast-close-button:hover {
    background: ${t("toast.error.close.button.hover.background")};
}

.p-toast-message-secondary {
    background: ${t("toast.secondary.background")};
    border-color: ${t("toast.secondary.border.color")};
    color: ${t("toast.secondary.color")};
    box-shadow: ${t("toast.secondary.shadow")};
}

.p-toast-message-secondary .p-toast-detail {
    color: ${t("toast.secondary.detail.color")};
}

.p-toast-message-secondary .p-toast-close-button:focus-visible {
    outline-color: ${t("toast.secondary.close.button.focus.ring.color")};
    box-shadow: ${t("toast.secondary.close.button.focus.ring.shadow")};
}

.p-toast-message-secondary .p-toast-close-button:hover {
    background: ${t("toast.secondary.close.button.hover.background")};
}

.p-toast-message-contrast {
    background: ${t("toast.contrast.background")};
    border-color: ${t("toast.contrast.border.color")};
    color: ${t("toast.contrast.color")};
    box-shadow: ${t("toast.contrast.shadow")};
}

.p-toast-message-contrast .p-toast-detail {
    color: ${t("toast.contrast.detail.color")};
}

.p-toast-message-contrast .p-toast-close-button:focus-visible {
    outline-color: ${t("toast.contrast.close.button.focus.ring.color")};
    box-shadow: ${t("toast.contrast.close.button.focus.ring.shadow")};
}

.p-toast-message-contrast .p-toast-close-button:hover {
    background: ${t("toast.contrast.close.button.hover.background")};
}

.p-toast-top-center {
    transform: translateX(-50%);
}

.p-toast-bottom-center {
    transform: translateX(-50%);
}

.p-toast-center {
    min-width: 20vw;
    transform: translate(-50%, -50%);
}

.p-toast-message-enter-from {
    opacity: 0;
    transform: translateY(50%);
}

.p-toast-message-leave-from {
    max-height: 1000px;
}

.p-toast .p-toast-message.p-toast-message-leave-to {
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
    overflow: hidden;
}

.p-toast-message-enter-active {
    transition: transform 0.3s, opacity 0.3s;
}

.p-toast-message-leave-active {
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1), opacity 0.3s, margin-bottom 0.3s;
}
`,rl={root:({instance:t})=>{let{_position:o}=t;return{position:"fixed",top:o==="top-right"||o==="top-left"||o==="top-center"?"20px":o==="center"?"50%":null,right:(o==="top-right"||o==="bottom-right")&&"20px",bottom:(o==="bottom-left"||o==="bottom-right"||o==="bottom-center")&&"20px",left:o==="top-left"||o==="bottom-left"?"20px":o==="center"||o==="top-center"||o==="bottom-center"?"50%":null}}},al={root:({instance:t})=>({"p-toast p-component":!0,[`p-toast-${t._position}`]:!!t._position}),message:({instance:t})=>({"p-toast-message":!0,"p-toast-message-info":t.message.severity==="info"||t.message.severity===void 0,"p-toast-message-warn":t.message.severity==="warn","p-toast-message-error":t.message.severity==="error","p-toast-message-success":t.message.severity==="success","p-toast-message-secondary":t.message.severity==="secondary","p-toast-message-contrast":t.message.severity==="contrast"}),messageContent:"p-toast-message-content",messageIcon:({instance:t})=>({"p-toast-message-icon":!0,[`pi ${t.message.icon}`]:!!t.message.icon}),messageText:"p-toast-message-text",summary:"p-toast-summary",detail:"p-toast-detail",closeButton:"p-toast-close-button",closeIcon:({instance:t})=>({"p-toast-close-icon":!0,[`pi ${t.message.closeIcon}`]:!!t.message.closeIcon})},$t=(()=>{class t extends Z{name="toast";theme=sl;classes=al;inlineStyles=rl;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=G({token:t,factory:t.\u0275fac})}return t})();var ll=(()=>{class t extends U{zone;message;index;life;template;headlessTemplate;showTransformOptions;hideTransformOptions;showTransitionOptions;hideTransitionOptions;onClose=new x;containerViewChild;_componentStyle=B($t);timeout;constructor(e){super(),this.zone=e}ngAfterViewInit(){super.ngAfterViewInit(),this.initTimeout()}initTimeout(){this.message?.sticky||this.zone.runOutsideAngular(()=>{this.timeout=setTimeout(()=>{this.onClose.emit({index:this.index,message:this.message})},this.message?.life||this.life||3e3)})}clearTimeout(){this.timeout&&(clearTimeout(this.timeout),this.timeout=null)}onMouseEnter(){this.clearTimeout()}onMouseLeave(){this.initTimeout()}onCloseIconClick=e=>{this.clearTimeout(),this.onClose.emit({index:this.index,message:this.message}),e.preventDefault()};get closeAriaLabel(){return this.config.translation.aria?this.config.translation.aria.close:void 0}ngOnDestroy(){this.clearTimeout(),super.ngOnDestroy()}static \u0275fac=function(i){return new(i||t)(I(Ce))};static \u0275cmp=V({type:t,selectors:[["p-toastItem"]],viewQuery:function(i,n){if(i&1&&W(to,5),i&2){let s;m(s=g())&&(n.containerViewChild=s.first)}},inputs:{message:"message",index:[2,"index","index",Y],life:[2,"life","life",Y],template:"template",headlessTemplate:"headlessTemplate",showTransformOptions:"showTransformOptions",hideTransformOptions:"hideTransformOptions",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions"},outputs:{onClose:"onClose"},features:[$([$t]),_],decls:4,vars:15,consts:[["container",""],["role","alert","aria-live","assertive","aria-atomic","true",3,"mouseenter","mouseleave","ngClass"],[3,"ngClass","class"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[3,"ngClass"],[4,"ngIf"],[3,"ngClass",4,"ngIf"],["type","button","autofocus","",3,"click","keydown.enter","ariaLabel"]],template:function(i,n){if(i&1){let s=Q();p(0,"div",1,0),E("mouseenter",function(){return C(s),w(n.onMouseEnter())})("mouseleave",function(){return C(s),w(n.onMouseLeave())}),d(2,Ba,1,5,"ng-container")(3,tl,4,10,"div",2),u()}i&2&&(T(n.message==null?null:n.message.styleClass),a("ngClass",n.cx("message"))("@messageState",z(13,za,Ci(8,$a,n.showTransformOptions,n.hideTransformOptions,n.showTransitionOptions,n.hideTransitionOptions))),f("id",n.message==null?null:n.message.id)("data-pc-name","toast")("data-pc-section","root"),l(2),ke(n.headlessTemplate?2:3))},dependencies:[X,re,me,_e,st,kn,Dn,It,An,D],encapsulation:2,data:{animation:[at("messageState",[Ti("visible",je({transform:"translateY(0)",opacity:1})),Ge("void => *",[je({transform:"{{showTransformParams}}",opacity:0}),et("{{showTransitionParams}}")]),Ge("* => void",[et("{{hideTransitionParams}}",je({height:0,opacity:0,transform:"{{hideTransformParams}}"}))])])]},changeDetection:0})}return t})(),cl=(()=>{class t extends U{key;autoZIndex=!0;baseZIndex=0;life=3e3;style;styleClass;get position(){return this._position}set position(e){this._position=e,this.cd.markForCheck()}preventOpenDuplicates=!1;preventDuplicates=!1;showTransformOptions="translateY(100%)";hideTransformOptions="translateY(-100%)";showTransitionOptions="300ms ease-out";hideTransitionOptions="250ms ease-in";breakpoints;onClose=new x;template;headlessTemplate;containerViewChild;messageSubscription;clearSubscription;messages;messagesArchieve;_position="top-right";messageService=B(Qi);_componentStyle=B($t);styleElement;id=ae("pn_id_");templates;ngOnInit(){super.ngOnInit(),this.messageSubscription=this.messageService.messageObserver.subscribe(e=>{if(e)if(Array.isArray(e)){let i=e.filter(n=>this.canAdd(n));this.add(i)}else this.canAdd(e)&&this.add([e])}),this.clearSubscription=this.messageService.clearObserver.subscribe(e=>{e?this.key===e&&(this.messages=null):this.messages=null,this.cd.markForCheck()})}_template;_headlessTemplate;ngAfterContentInit(){this.templates?.forEach(e=>{switch(e.getType()){case"message":this._template=e.template;break;case"headless":this._headlessTemplate=e.template;break;default:this._template=e.template;break}})}ngAfterViewInit(){super.ngAfterViewInit(),this.breakpoints&&this.createStyle()}add(e){this.messages=this.messages?[...this.messages,...e]:[...e],this.preventDuplicates&&(this.messagesArchieve=this.messagesArchieve?[...this.messagesArchieve,...e]:[...e]),this.cd.markForCheck()}canAdd(e){let i=this.key===e.key;return i&&this.preventOpenDuplicates&&(i=!this.containsMessage(this.messages,e)),i&&this.preventDuplicates&&(i=!this.containsMessage(this.messagesArchieve,e)),i}containsMessage(e,i){return e?e.find(n=>n.summary===i.summary&&n.detail==i.detail&&n.severity===i.severity)!=null:!1}onMessageClose(e){this.messages?.splice(e.index,1),this.onClose.emit({message:e.message}),this.cd.detectChanges()}onAnimationStart(e){e.fromState==="void"&&(this.renderer.setAttribute(this.containerViewChild?.nativeElement,this.id,""),this.autoZIndex&&this.containerViewChild?.nativeElement.style.zIndex===""&&pe.set("modal",this.containerViewChild?.nativeElement,this.baseZIndex||this.config.zIndex.modal))}onAnimationEnd(e){e.toState==="void"&&this.autoZIndex&&We(this.messages)&&pe.clear(this.containerViewChild?.nativeElement)}createStyle(){if(!this.styleElement){this.styleElement=this.renderer.createElement("style"),this.styleElement.type="text/css",this.renderer.appendChild(this.document.head,this.styleElement);let e="";for(let i in this.breakpoints){let n="";for(let s in this.breakpoints[i])n+=s+":"+this.breakpoints[i][s]+" !important;";e+=`
                    @media screen and (max-width: ${i}) {
                        .p-toast[${this.id}] {
                           ${n}
                        }
                    }
                `}this.renderer.setProperty(this.styleElement,"innerHTML",e),Ri(this.styleElement,"nonce",this.config?.csp()?.nonce)}}destroyStyle(){this.styleElement&&(this.renderer.removeChild(this.document.head,this.styleElement),this.styleElement=null)}ngOnDestroy(){this.messageSubscription&&this.messageSubscription.unsubscribe(),this.containerViewChild&&this.autoZIndex&&pe.clear(this.containerViewChild.nativeElement),this.clearSubscription&&this.clearSubscription.unsubscribe(),this.destroyStyle(),super.ngOnDestroy()}static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=V({type:t,selectors:[["p-toast"]],contentQueries:function(i,n,s){if(i&1&&(S(s,il,5),S(s,nl,5),S(s,Te,4)),i&2){let r;m(r=g())&&(n.template=r.first),m(r=g())&&(n.headlessTemplate=r.first),m(r=g())&&(n.templates=r)}},viewQuery:function(i,n){if(i&1&&W(to,5),i&2){let s;m(s=g())&&(n.containerViewChild=s.first)}},inputs:{key:"key",autoZIndex:[2,"autoZIndex","autoZIndex",b],baseZIndex:[2,"baseZIndex","baseZIndex",Y],life:[2,"life","life",Y],style:"style",styleClass:"styleClass",position:"position",preventOpenDuplicates:[2,"preventOpenDuplicates","preventOpenDuplicates",b],preventDuplicates:[2,"preventDuplicates","preventDuplicates",b],showTransformOptions:"showTransformOptions",hideTransformOptions:"hideTransformOptions",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",breakpoints:"breakpoints"},outputs:{onClose:"onClose"},features:[$([$t]),_],decls:3,vars:7,consts:[["container",""],[3,"ngClass","ngStyle"],[3,"message","index","life","template","headlessTemplate","showTransformOptions","hideTransformOptions","showTransitionOptions","hideTransitionOptions","onClose",4,"ngFor","ngForOf"],[3,"onClose","message","index","life","template","headlessTemplate","showTransformOptions","hideTransformOptions","showTransitionOptions","hideTransitionOptions"]],template:function(i,n){i&1&&(p(0,"div",1,0),d(2,ol,1,10,"p-toastItem",2),u()),i&2&&(he(n.style),T(n.styleClass),a("ngClass",n.cx("root"))("ngStyle",n.sx("root")),l(2),a("ngForOf",n.messages))},dependencies:[X,re,Je,ge,ll,D],encapsulation:2,data:{animation:[at("toastAnimation",[Ge(":enter, :leave",[Si("@*",Vi())])])]},changeDetection:0})}return t})(),_u=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=H({type:t});static \u0275inj=R({imports:[cl,D,D]})}return t})();export{st as a,En as b,Ke as c,an as d,Ki as e,Ee as f,Ol as g,El as h,si as i,Dl as j,Fo as k,Ao as l,Fl as m,Ml as n,Al as o,$n as p,bc as q,ri as r,Mc as s,ai as t,qc as u,Rn as v,sd as w,ss as x,yd as y,ci as z,vp as A,jn as B,Dd as C,eo as D,Zp as E,cl as F,_u as G};
