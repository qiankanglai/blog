// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 67108864;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 20232;
var _stdout;
var _stdin;
var _stderr;
__ATINIT__ = __ATINIT__.concat([
  { func: function() { __GLOBAL__I_a150() } }
]);
var ___fsmu8;
var ___dso_handle;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,104,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,120,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,40,97,95,110,111,100,101,45,62,109,95,99,111,117,110,116,32,43,32,40,42,97,95,110,101,119,78,111,100,101,41,45,62,109,95,99,111,117,110,116,41,32,61,61,32,112,97,114,86,97,114,115,45,62,109,95,116,111,116,97,108,0,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,97,95,110,101,119,78,111,100,101,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,97,95,98,114,97,110,99,104,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,97,95,108,101,118,101,108,32,62,61,32,48,32,38,38,32,97,95,108,101,118,101,108,32,60,61,32,40,42,97,95,114,111,111,116,41,45,62,109,95,108,101,118,101,108,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,116,101,109,112,78,111,100,101,0,0,0,0,0,0,0,0,42,97,95,114,111,111,116,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,97,95,114,101,99,116,32,38,38,32,97,95,114,111,111,116,0,0,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,76,0,0,0,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,97,95,110,111,100,101,45,62,109,95,99,111,117,110,116,32,62,32,48,0,0,0,0,0,97,95,110,111,100,101,32,38,38,32,40,97,95,105,110,100,101,120,32,62,61,32,48,41,32,38,38,32,40,97,95,105,110,100,101,120,32,60,32,77,97,120,78,111,100,101,67,111,117,110,116,41,0,0,0,0,97,95,114,101,99,116,32,38,38,32,97,95,110,111,100,101,32,38,38,32,97,95,108,105,115,116,78,111,100,101,0,0,97,95,114,101,99,116,32,38,38,32,97,95,110,111,100,101,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,48,0,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,97,95,108,101,118,101,108,32,62,61,32,48,32,38,38,32,97,95,108,101,118,101,108,32,60,61,32,97,95,110,111,100,101,45,62,109,95,108,101,118,101,108,0,0,0,0,0,0,97,95,114,101,99,116,32,38,38,32,97,95,110,111,100,101,32,38,38,32,97,95,110,101,119,78,111,100,101,0,0,0,97,95,110,111,100,101,45,62,109,95,108,101,118,101,108,32,62,61,32,48,0,0,0,0,97,95,110,111,100,101,45,62,109,95,99,111,117,110,116,32,61,61,32,77,97,120,78,111,100,101,67,111,117,110,116,0,97,95,114,101,99,116,65,32,38,38,32,97,95,114,101,99,116,66,0,0,0,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,95,114,101,99,116,0,0,118,101,99,116,111,114,0,0,33,97,95,112,97,114,86,97,114,115,45,62,109,95,116,97,107,101,110,91,97,95,105,110,100,101,120,93,0,0,0,0,37,46,48,76,102,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,40,97,95,112,97,114,86,97,114,115,45,62,109,95,99,111,117,110,116,91,48,93,32,62,61,32,97,95,112,97,114,86,97,114,115,45,62,109,95,109,105,110,70,105,108,108,41,32,38,38,32,40,97,95,112,97,114,86,97,114,115,45,62,109,95,99,111,117,110,116,91,49,93,32,62,61,32,97,95,112,97,114,86,97,114,115,45,62,109,95,109,105,110,70,105,108,108,41,0,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,40,97,95,112,97,114,86,97,114,115,45,62,109,95,99,111,117,110,116,91,48,93,32,43,32,97,95,112,97,114,86,97,114,115,45,62,109,95,99,111,117,110,116,91,49,93,41,32,61,61,32,97,95,112,97,114,86,97,114,115,45,62,109,95,116,111,116,97,108,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,97,95,112,97,114,86,97,114,115,45,62,109,95,112,97,114,116,105,116,105,111,110,91,105,110,100,101,120,93,32,61,61,32,48,32,124,124,32,97,95,112,97,114,86,97,114,115,45,62,109,95,112,97,114,116,105,116,105,111,110,91,105,110,100,101,120,93,32,61,61,32,49,0,0,0,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,58,32,0,0,0,0,0,0,97,95,112,97,114,86,97,114,115,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,97,95,110,111,100,101,66,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,97,95,110,111,100,101,65,0,97,95,110,111,100,101,0,0,46,47,82,84,114,101,101,46,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,83,112,108,105,116,78,111,100,101,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,66,114,97,110,99,104,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,76,111,97,100,78,111,100,101,115,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,80,97,114,116,105,116,105,111,110,86,97,114,115,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,65,100,100,66,114,97,110,99,104,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,66,114,97,110,99,104,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,70,114,101,101,78,111,100,101,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,67,108,97,115,115,105,102,121,40,105,110,116,44,32,105,110,116,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,80,97,114,116,105,116,105,111,110,86,97,114,115,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,79,118,101,114,108,97,112,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,83,101,97,114,99,104,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,105,110,116,32,38,44,32,98,111,111,108,32,40,42,41,40,75,101,121,84,121,112,101,44,32,118,111,105,100,32,42,41,44,32,118,111,105,100,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,83,109,97,108,108,101,115,116,67,111,118,101,114,82,101,99,116,97,110,103,108,101,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,86,97,108,117,101,84,121,112,101,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,82,101,99,116,83,112,104,101,114,105,99,97,108,86,111,108,117,109,101,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,68,105,115,99,111,110,110,101,99,116,66,114,97,110,99,104,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,105,110,116,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,67,104,111,111,115,101,80,97,114,116,105,116,105,111,110,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,80,97,114,116,105,116,105,111,110,86,97,114,115,32,42,44,32,105,110,116,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,82,101,109,111,118,101,82,101,99,116,82,101,99,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,99,111,110,115,116,32,75,101,121,84,121,112,101,32,38,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,76,105,115,116,78,111,100,101,32,42,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,0,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,73,110,115,101,114,116,82,101,99,116,82,101,99,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,99,111,110,115,116,32,75,101,121,84,121,112,101,32,38,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,42,44,32,105,110,116,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,82,101,109,111,118,101,65,108,108,82,101,99,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,118,111,105,100,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,71,101,116,66,114,97,110,99,104,101,115,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,66,114,97,110,99,104,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,80,97,114,116,105,116,105,111,110,86,97,114,115,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,67,111,109,98,105,110,101,82,101,99,116,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,0,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,82,101,109,111,118,101,82,101,99,116,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,99,111,110,115,116,32,75,101,121,84,121,112,101,32,38,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,105,110,116,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,80,105,99,107,66,114,97,110,99,104,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,98,111,111,108,32,82,101,99,116,97,110,103,108,101,84,114,101,101,60,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,100,111,117,98,108,101,44,32,51,44,32,100,111,117,98,108,101,44,32,56,44,32,52,62,58,58,73,110,115,101,114,116,82,101,99,116,40,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,82,101,99,116,32,42,44,32,99,111,110,115,116,32,75,101,121,84,121,112,101,32,38,44,32,82,101,99,116,97,110,103,108,101,84,114,101,101,58,58,78,111,100,101,32,42,42,44,32,105,110,116,41,32,91,75,101,121,68,97,116,97,84,121,112,101,32,61,32,77,101,115,104,58,58,67,67,111,102,97,99,101,32,42,44,32,82,101,99,116,97,110,103,108,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,68,105,109,101,110,115,105,111,110,32,61,32,51,44,32,86,111,108,117,109,101,86,97,108,117,101,84,121,112,101,32,61,32,100,111,117,98,108,101,44,32,77,97,120,78,111,100,101,67,111,117,110,116,32,61,32,56,44,32,77,105,110,78,111,100,101,67,111,117,110,116,32,61,32,52,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,66,0,0,28,0,0,0,108,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,66,0,0,184,0,0,0,152,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,66,0,0,64,0,0,0,246,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,66,0,0,88,0,0,0,8,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,66,0,0,88,0,0,0,20,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,66,0,0,158,0,0,0,76,0,0,0,42,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,66,0,0,216,0,0,0,176,0,0,0,42,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,67,0,0,150,0,0,0,178,0,0,0,42,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,67,0,0,240,0,0,0,130,0,0,0,42,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,67,0,0,238,0,0,0,16,0,0,0,42,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,67,0,0,148,0,0,0,100,0,0,0,42,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,68,0,0,34,0,0,0,102,0,0,0,42,0,0,0,120,0,0,0,4,0,0,0,30,0,0,0,6,0,0,0,20,0,0,0,56,0,0,0,2,0,0,0,248,255,255,255,16,68,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,68,0,0,228,0,0,0,208,0,0,0,42,0,0,0,20,0,0,0,16,0,0,0,60,0,0,0,24,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,56,68,0,0,68,0,0,0,104,0,0,0,116,0,0,0,122,0,0,0,62,0,0,0,44,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,68,0,0,70,0,0,0,180,0,0,0,42,0,0,0,48,0,0,0,40,0,0,0,8,0,0,0,36,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,68,0,0,52,0,0,0,58,0,0,0,42,0,0,0,42,0,0,0,82,0,0,0,12,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,68,0,0,232,0,0,0,2,0,0,0,42,0,0,0,24,0,0,0,30,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,68,0,0,40,0,0,0,196,0,0,0,42,0,0,0,36,0,0,0,14,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,68,0,0,198,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,68,0,0,26,0,0,0,128,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,68,0,0,6,0,0,0,164,0,0,0,42,0,0,0,8,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,68,0,0,92,0,0,0,18,0,0,0,42,0,0,0,20,0,0,0,24,0,0,0,34,0,0,0,22,0,0,0,32,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,69,0,0,36,0,0,0,22,0,0,0,42,0,0,0,48,0,0,0,46,0,0,0,38,0,0,0,40,0,0,0,28,0,0,0,44,0,0,0,36,0,0,0,54,0,0,0,52,0,0,0,50,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,69,0,0,46,0,0,0,4,0,0,0,42,0,0,0,76,0,0,0,70,0,0,0,64,0,0,0,66,0,0,0,58,0,0,0,68,0,0,0,62,0,0,0,26,0,0,0,74,0,0,0,72,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,69,0,0,66,0,0,0,86,0,0,0,42,0,0,0,14,0,0,0,12,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,69,0,0,24,0,0,0,166,0,0,0,42,0,0,0,22,0,0,0,14,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,69,0,0,214,0,0,0,122,0,0,0,42,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,60,0,0,0,4,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,69,0,0,170,0,0,0,54,0,0,0,42,0,0,0,2,0,0,0,8,0,0,0,8,0,0,0,106,0,0,0,96,0,0,0,18,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,69,0,0,170,0,0,0,124,0,0,0,42,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,126,0,0,0,46,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,69,0,0,170,0,0,0,142,0,0,0,42,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,72,0,0,0,6,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,69,0,0,170,0,0,0,30,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,70,0,0,50,0,0,0,146,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,70,0,0,170,0,0,0,72,0,0,0,42,0,0,0,20,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,18,0,0,0,28,0,0,0,26,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,70,0,0,244,0,0,0,32,0,0,0,42,0,0,0,2,0,0,0,4,0,0,0,20,0,0,0,34,0,0,0,10,0,0,0,6,0,0,0,26,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,70,0,0,60,0,0,0,204,0,0,0,76,0,0,0,2,0,0,0,14,0,0,0,32,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,70,0,0,170,0,0,0,78,0,0,0,42,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,72,0,0,0,6,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,70,0,0,170,0,0,0,224,0,0,0,42,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,72,0,0,0,6,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,70,0,0,118,0,0,0,220,0,0,0,16,0,0,0,22,0,0,0,16,0,0,0,10,0,0,0,86,0,0,0,100,0,0,0,30,0,0,0,28,0,0,0,26,0,0,0,8,0,0,0,40,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,70,0,0,10,0,0,0,110,0,0,0,56,0,0,0,38,0,0,0,28,0,0,0,6,0,0,0,50,0,0,0,84,0,0,0,18,0,0,0,6,0,0,0,10,0,0,0,28,0,0,0,16,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,208,70,0,0,38,0,0,0,194,0,0,0,252,255,255,255,252,255,255,255,208,70,0,0,136,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,232,70,0,0,200,0,0,0,222,0,0,0,252,255,255,255,252,255,255,255,232,70,0,0,98,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,71,0,0,82,0,0,0,248,0,0,0,248,255,255,255,248,255,255,255,0,71,0,0,172,0,0,0,218,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,24,71,0,0,96,0,0,0,192,0,0,0,248,255,255,255,248,255,255,255,24,71,0,0,126,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,71,0,0,190,0,0,0,174,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,71,0,0,234,0,0,0,212,0,0,0,4,0,0,0,22,0,0,0,16,0,0,0,10,0,0,0,56,0,0,0,100,0,0,0,30,0,0,0,28,0,0,0,26,0,0,0,8,0,0,0,40,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,71,0,0,144,0,0,0,168,0,0,0,32,0,0,0,38,0,0,0,28,0,0,0,6,0,0,0,88,0,0,0,84,0,0,0,18,0,0,0,6,0,0,0,10,0,0,0,28,0,0,0,16,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,71,0,0,206,0,0,0,134,0,0,0,42,0,0,0,66,0,0,0,118,0,0,0,38,0,0,0,76,0,0,0,6,0,0,0,28,0,0,0,52,0,0,0,20,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,71,0,0,94,0,0,0,48,0,0,0,42,0,0,0,112,0,0,0,4,0,0,0,62,0,0,0,70,0,0,0,72,0,0,0,22,0,0,0,114,0,0,0,46,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,71,0,0,210,0,0,0,106,0,0,0,42,0,0,0,14,0,0,0,58,0,0,0,42,0,0,0,40,0,0,0,74,0,0,0,48,0,0,0,90,0,0,0,52,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,71,0,0,68,0,0,0,162,0,0,0,42,0,0,0,102,0,0,0,108,0,0,0,26,0,0,0,68,0,0,0,24,0,0,0,18,0,0,0,78,0,0,0,66,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,72,0,0,84,0,0,0,62,0,0,0,54,0,0,0,22,0,0,0,16,0,0,0,10,0,0,0,86,0,0,0,100,0,0,0,30,0,0,0,70,0,0,0,80,0,0,0,14,0,0,0,40,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,72,0,0,14,0,0,0,202,0,0,0,58,0,0,0,38,0,0,0,28,0,0,0,6,0,0,0,50,0,0,0,84,0,0,0,18,0,0,0,92,0,0,0,128,0,0,0,4,0,0,0,16,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,72,0,0,80,0,0,0,156,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,72,0,0,236,0,0,0,186,0,0,0,56,0,0,0,140,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,52,77,101,115,104,49,51,67,84,114,105,97,110,103,108,101,77,101,115,104,69,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,168,54,0,0,0,0,0,0,184,54,0,0,0,0,0,0,200,54,0,0,112,66,0,0,0,0,0,0,0,0,0,0,216,54,0,0,112,66,0,0,0,0,0,0,0,0,0,0,232,54,0,0,112,66,0,0,0,0,0,0,0,0,0,0,0,55,0,0,184,66,0,0,0,0,0,0,0,0,0,0,24,55,0,0,112,66,0,0,0,0,0,0,0,0,0,0,40,55,0,0,128,54,0,0,64,55,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,120,71,0,0,0,0,0,0,128,54,0,0,136,55,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,128,71,0,0,0,0,0,0,128,54,0,0,208,55,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,136,71,0,0,0,0,0,0,128,54,0,0,24,56,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,144,71,0,0,0,0,0,0,0,0,0,0,96,56,0,0,192,68,0,0,0,0,0,0,0,0,0,0,144,56,0,0,192,68,0,0,0,0,0,0,128,54,0,0,192,56,0,0,0,0,0,0,1,0,0,0,184,70,0,0,0,0,0,0,128,54,0,0,216,56,0,0,0,0,0,0,1,0,0,0,184,70,0,0,0,0,0,0,128,54,0,0,240,56,0,0,0,0,0,0,1,0,0,0,192,70,0,0,0,0,0,0,128,54,0,0,8,57,0,0,0,0,0,0,1,0,0,0,192,70,0,0,0,0,0,0,128,54,0,0,32,57,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,40,72,0,0,0,8,0,0,128,54,0,0,104,57,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,40,72,0,0,0,8,0,0,128,54,0,0,176,57,0,0,0,0,0,0,3,0,0,0,248,69,0,0,2,0,0,0,200,66,0,0,2,0,0,0,88,70,0,0,0,8,0,0,128,54,0,0,248,57,0,0,0,0,0,0,3,0,0,0,248,69,0,0,2,0,0,0,200,66,0,0,2,0,0,0,96,70,0,0,0,8,0,0,0,0,0,0,64,58,0,0,248,69,0,0,0,0,0,0,0,0,0,0,88,58,0,0,248,69,0,0,0,0,0,0,128,54,0,0,112,58,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,200,70,0,0,2,0,0,0,128,54,0,0,136,58,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,200,70,0,0,2,0,0,0,0,0,0,0,160,58,0,0,0,0,0,0,184,58,0,0,48,71,0,0,0,0,0,0,128,54,0,0,216,58,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,112,67,0,0,0,0,0,0,128,54,0,0,32,59,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,136,67,0,0,0,0,0,0,128,54,0,0,104,59,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,160,67,0,0,0,0,0,0,128,54,0,0,176,59,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,184,67,0,0,0,0,0,0,0,0,0,0,248,59,0,0,248,69,0,0,0,0,0,0,0,0,0,0,16,60,0,0,248,69,0,0,0,0,0,0,128,54,0,0,40,60,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,64,71,0,0,2,0,0,0,128,54,0,0,80,60,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,64,71,0,0,2,0,0,0,128,54,0,0,120,60,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,64,71,0,0,2,0,0,0,128,54,0,0,160,60,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,64,71,0,0,2,0,0,0,0,0,0,0,200,60,0,0,176,70,0,0,0,0,0,0,0,0,0,0,224,60,0,0,248,69,0,0,0,0,0,0,128,54,0,0,248,60,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,32,72,0,0,2,0,0,0,128,54,0,0,16,61,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,32,72,0,0,2,0,0,0,0,0,0,0,40,61,0,0,0,0,0,0,80,61,0,0,0,0,0,0,120,61,0,0,72,71,0,0,0,0,0,0,0,0,0,0,152,61,0,0,216,69,0,0,0,0,0,0,0,0,0,0,192,61,0,0,216,69,0,0,0,0,0,0,0,0,0,0,232,61,0,0,0,0,0,0,32,62,0,0,0,0,0,0,88,62,0,0,0,0,0,0,120,62,0,0,0,0,0,0,152,62,0,0,0,0,0,0,184,62,0,0,0,0,0,0,216,62,0,0,128,54,0,0,240,62,0,0,0,0,0,0,1,0,0,0,80,67,0,0,3,244,255,255,128,54,0,0,32,63,0,0,0,0,0,0,1,0,0,0,96,67,0,0,3,244,255,255,128,54,0,0,80,63,0,0,0,0,0,0,1,0,0,0,80,67,0,0,3,244,255,255,128,54,0,0,128,63,0,0,0,0,0,0,1,0,0,0,96,67,0,0,3,244,255,255,0,0,0,0,176,63,0,0,152,66,0,0,0,0,0,0,0,0,0,0,200,63,0,0,0,0,0,0,224,63,0,0,168,70,0,0,0,0,0,0,0,0,0,0,248,63,0,0,152,70,0,0,0,0,0,0,0,0,0,0,24,64,0,0,160,70,0,0,0,0,0,0,0,0,0,0,56,64,0,0,0,0,0,0,88,64,0,0,0,0,0,0,120,64,0,0,0,0,0,0,152,64,0,0,128,54,0,0,184,64,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,24,72,0,0,2,0,0,0,128,54,0,0,216,64,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,24,72,0,0,2,0,0,0,128,54,0,0,248,64,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,24,72,0,0,2,0,0,0,128,54,0,0,24,65,0,0,0,0,0,0,2,0,0,0,248,69,0,0,2,0,0,0,24,72,0,0,2,0,0,0,0,0,0,0,56,65,0,0,0,0,0,0,80,65,0,0,0,0,0,0,104,65,0,0,0,0,0,0,128,65,0,0,152,70,0,0,0,0,0,0,0,0,0,0,152,65,0,0,160,70,0,0,0,0,0,0,0,0,0,0,176,65,0,0,0,0,0,0,200,65,0,0,120,72,0,0,0,0,0,0,0,0,0,0,240,65,0,0,120,72,0,0,0,0,0,0,0,0,0,0,24,66,0,0,136,72,0,0,0,0,0,0,0,0,0,0,64,66,0,0,104,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,234,45,129,153,151,113,61,167,142,168,153,194,87,243,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(236);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(120);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(56);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(140);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(10);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(236);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(230);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(56);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(140);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(26);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(8);
HEAP32[((17000)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17008)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17016)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17032)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17048)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17064)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17080)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17096)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17232)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17248)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17504)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17600)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17608)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17752)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17768)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17912)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17928)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18008)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18016)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18024)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18040)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18056)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18072)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18080)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18088)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18096)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18104)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18112)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18120)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18224)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18240)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18248)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18264)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18280)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18296)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18304)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18312)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18320)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18456)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18464)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18472)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18480)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18496)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18512)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18536)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18552)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18568)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000/1000));
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  var _sqrt=Math.sqrt;
  var _acos=Math.acos;
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x*y > 4294967295),(x*y)>>>0)|0);
    }
  function _llvm_uadd_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x+y > 4294967295),(x+y)>>>0)|0);
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  Module["_strlen"] = _strlen;
  function _pthread_mutex_lock() {}
  function _pthread_mutex_unlock() {}
  function _pthread_cond_broadcast() {
      return 0;
    }
  function _pthread_cond_wait() {
      return 0;
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      if (FS.streams[stream]) {
        c = unSign(c & 0xFF);
        FS.streams[stream].ungotten.push(c);
        return c;
      } else {
        return -1;
      }
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _read(stream, _fgetc.ret, 1);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  Module["_strcpy"] = _strcpy;
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }var _isxdigit_l=_isxdigit;
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
        __scanString.whiteSpace['\v'] = 1;
        __scanString.whiteSpace['\f'] = 1;
        __scanString.whiteSpace['\r'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function __Z7catopenPKci() { throw 'catopen not implemented' }
  function __Z7catgetsP8_nl_catdiiPKc() { throw 'catgets not implemented' }
  function __Z8catcloseP8_nl_catd() { throw 'catclose not implemented' }
  function _newlocale(mask, locale, base) {
      return 0;
    }
  function _freelocale(locale) {}
  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i]
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function _strftime(s, maxsize, format, timeptr) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      // TODO: Implement.
      return 0;
    }var _strftime_l=_strftime;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      start = str;
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;
  function _uselocale(locale) {
      return 0;
    }
  function ___locale_mb_cur_max() { throw '__locale_mb_cur_max not implemented' }
  var _llvm_va_start=undefined;
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsprintf(s, format, va_arg) {
      return _sprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiif(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiif"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiif(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiif"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env._stdout|0;var t=env.___fsmu8|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.copyTempDouble;var am=env.copyTempFloat;var an=env.min;var ao=env.invoke_viiiii;var ap=env.invoke_viiiiiii;var aq=env.invoke_vi;var ar=env.invoke_vii;var as=env.invoke_iii;var at=env.invoke_iiii;var au=env.invoke_ii;var av=env.invoke_viiiiif;var aw=env.invoke_viii;var ax=env.invoke_viiiiiiii;var ay=env.invoke_v;var az=env.invoke_iiiiiiiii;var aA=env.invoke_viiiiiiiii;var aB=env.invoke_viiiiiif;var aC=env.invoke_viiiiii;var aD=env.invoke_iiiii;var aE=env.invoke_iiiiii;var aF=env.invoke_viiii;var aG=env._llvm_va_end;var aH=env._vsnprintf;var aI=env._vsscanf;var aJ=env._sscanf;var aK=env._snprintf;var aL=env.___locale_mb_cur_max;var aM=env._fgetc;var aN=env.___cxa_throw;var aO=env.___cxa_begin_catch;var aP=env._strerror;var aQ=env._pthread_mutex_lock;var aR=env._atexit;var aS=env._isdigit;var aT=env._abort;var aU=env.___cxa_end_catch;var aV=env._strtoull;var aW=env.___cxa_free_exception;var aX=env.__formatString;var aY=env._pread;var aZ=env._fflush;var a_=env._isxdigit;var a$=env.__Z8catcloseP8_nl_catd;var a0=env._sysconf;var a1=env._clock;var a2=env.___setErrNo;var a3=env._fwrite;var a4=env.__Z7catgetsP8_nl_catdiiPKc;var a5=env._send;var a6=env._sqrt;var a7=env._write;var a8=env.__scanString;var a9=env._llvm_umul_with_overflow_i32;var ba=env._exit;var bb=env._sprintf;var bc=env._llvm_lifetime_end;var bd=env._asprintf;var be=env.___ctype_b_loc;var bf=env.___cxa_find_matching_catch;var bg=env._freelocale;var bh=env.__Z7catopenPKci;var bi=env.___cxa_allocate_exception;var bj=env._isspace;var bk=env._strtoll;var bl=env._vasprintf;var bm=env._read;var bn=env.___cxa_is_number_type;var bo=env.__reallyNegative;var bp=env._time;var bq=env._llvm_uadd_with_overflow_i32;var br=env._pthread_cond_broadcast;var bs=env.___cxa_does_inherit;var bt=env.___ctype_toupper_loc;var bu=env.__ZSt9terminatev;var bv=env.___ctype_tolower_loc;var bw=env._pthread_mutex_unlock;var bx=env._llvm_eh_exception;var by=env.___assert_func;var bz=env.__exit;var bA=env.__parseInt64;var bB=env.__ZSt18uncaught_exceptionv;var bC=env.__isFloat;var bD=env._pwrite;var bE=env._recv;var bF=env._sbrk;var bG=env.___cxa_call_unexpected;var bH=env._strerror_r;var bI=env._newlocale;var bJ=env.___errno_location;var bK=env.___gxx_personality_v0;var bL=env._pthread_cond_wait;var bM=env.___cxa_rethrow;var bN=env._uselocale;var bO=env.___resumeException;var bP=env._ungetc;var bQ=env._acos;var bR=env._vsprintf;var bS=env._strftime;var bT=env._llvm_lifetime_start;
// EMSCRIPTEN_START_FUNCS
function ca(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cb(){return i|0}function cc(a){a=a|0;i=a}function cd(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function ce(a){a=a|0;K=a}function cf(a){a=a|0;L=a}function cg(a){a=a|0;M=a}function ch(a){a=a|0;N=a}function ci(a){a=a|0;O=a}function cj(a){a=a|0;P=a}function ck(a){a=a|0;Q=a}function cl(a){a=a|0;R=a}function cm(a){a=a|0;S=a}function cn(a){a=a|0;T=a}function co(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+48|0;e=d|0;f=b|0;cH(b,c[f>>2]|0);g=la(456)|0;c[g>>2]=0;c[f>>2]=g;c[g+4>>2]=0;g=b+16|0;c[g>>2]=0;j=c[a+4>>2]|0;k=a+8|0;if((j|0)==(c[k>>2]|0)){i=d;return}a=e|0;l=e+24|0;m=e+8|0;n=e+32|0;o=e+16|0;p=e+40|0;q=j;do{j=c[q>>2]|0;h[a>>3]=+h[j+24>>3];h[l>>3]=+h[j+48>>3];h[m>>3]=+h[j+32>>3];h[n>>3]=+h[j+56>>3];h[o>>3]=+h[j+40>>3];h[p>>3]=+h[j+64>>3];cM(b,e,q,f,0);c[g>>2]=(c[g>>2]|0)+1;q=q+4|0;}while((q|0)!=(c[k>>2]|0));i=d;return}function cp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;f=i;i=i+200|0;g=f|0;j=f+48|0;k=f+96|0;l=f+120|0;m=f+144|0;n=f+160|0;o=f+176|0;p=f+192|0;q=la(80)|0;r=q;dI(r,a);s=la(80)|0;t=s;dI(t,b);u=k+16|0;c[u>>2]=0;v=la(456)|0;c[v>>2]=0;w=k|0;c[w>>2]=v;c[v+4>>2]=0;h[k+8>>3]=4.1887898445129395;v=l+16|0;c[v>>2]=0;x=la(456)|0;c[x>>2]=0;y=l|0;c[y>>2]=x;c[x+4>>2]=0;h[l+8>>3]=4.1887898445129395;co(r,k);co(t,l);x=m|0;c[x>>2]=0;z=m+4|0;c[z>>2]=0;c[m+8>>2]=0;cq(0,t,k,l,m);A=n|0;c[A>>2]=0;B=n+4|0;c[B>>2]=0;c[n+8>>2]=0;cr(m,n);n=la(160)|0;m=n;ln(n|0,0,40);h[n+24>>3]=-3.4028234663852886e+38;h[n+32>>3]=-3.4028234663852886e+38;h[n+40>>3]=-3.4028234663852886e+38;h[n+48>>3]=3.4028234663852886e+38;h[n+56>>3]=3.4028234663852886e+38;h[n+64>>3]=3.4028234663852886e+38;ln(n+72|0,0,72);h[n+128>>3]=1.0;h[n+136>>3]=1.0;h[n+144>>3]=1.0;h[n+152>>3]=1.0;n=d+16|0;c[n>>2]=m;C=c[A>>2]|0;L16:do{if((c[B>>2]|0)!=(C|0)){D=0;E=C;F=m;while(1){G=E+(D<<2)|0;H=F+4|0;I=c[H>>2]|0;if((I|0)==(c[F+8>>2]|0)){c1(F|0,G)}else{if((I|0)==0){J=0}else{c[I>>2]=c[G>>2];J=c[H>>2]|0}c[H>>2]=J+4}H=D+2|0;G=c[A>>2]|0;if(H>>>0>=(c[B>>2]|0)-G>>2>>>0){break L16}D=H;E=G;F=c[n>>2]|0}}}while(0);n=o|0;c[n>>2]=0;J=o+4|0;c[J>>2]=0;c[o+8>>2]=0;m=c[x>>2]|0;do{if((m|0)!=(c[z>>2]|0)){C=m;do{F=C+48|0;if((c[F>>2]|0)==4){K=42}else{cs(c[C+52>>2]|0,k,o);if((c[F>>2]|0)!=5){K=42}}if((K|0)==42){K=0;cs(c[C+56>>2]|0,l,o)}C=C+64|0;}while((C|0)!=(c[z>>2]|0));C=c[n>>2]|0;if((C|0)==(c[J>>2]|0)){break}F=j|0;E=j+24|0;D=j+8|0;G=j+32|0;H=j+16|0;I=j+40|0;L=g|0;M=g+24|0;N=g+8|0;O=g+32|0;P=g+16|0;Q=g+40|0;R=C;do{C=c[R>>2]|0;c[p>>2]=C;S=C+24|0;T=C+48|0;if((c[C+120>>2]|0)==(r|0)){h[F>>3]=+h[S>>3];h[E>>3]=+h[T>>3];h[D>>3]=+h[C+32>>3];h[G>>3]=+h[C+56>>3];h[H>>3]=+h[C+40>>3];h[I>>3]=+h[C+64>>3];cM(k,j,p,w,0);c[u>>2]=(c[u>>2]|0)+1}else{h[L>>3]=+h[S>>3];h[M>>3]=+h[T>>3];h[N>>3]=+h[C+32>>3];h[O>>3]=+h[C+56>>3];h[P>>3]=+h[C+40>>3];h[Q>>3]=+h[C+64>>3];cM(l,g,p,y,0);c[v>>2]=(c[v>>2]|0)+1}R=R+4|0;}while((R|0)!=(c[J>>2]|0))}}while(0);ct(o,r,t,k,l,a,b);cu(o,r,t,d,e);if((q|0)!=0){bW[c[(c[q>>2]|0)+4>>2]&255](r)}if((s|0)!=0){bW[c[(c[s>>2]|0)+4>>2]&255](t)}t=c[n>>2]|0;n=t;if((t|0)!=0){s=c[J>>2]|0;if((t|0)!=(s|0)){c[J>>2]=s+((((s-4|0)+(-n|0)|0)>>>2^-1)<<2)}le(t)}t=c[A>>2]|0;A=t;if((t|0)!=0){n=c[B>>2]|0;if((t|0)!=(n|0)){c[B>>2]=n+((((n-4|0)+(-A|0)|0)>>>2^-1)<<2)}le(t)}t=c[x>>2]|0;x=t;if((t|0)!=0){A=c[z>>2]|0;if((t|0)!=(A|0)){c[z>>2]=A+((((A-64|0)+(-x|0)|0)>>>6^-1)<<6)}le(t)}cH(l,c[y>>2]|0);cH(k,c[w>>2]|0);i=f;return 1}function cq(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;a=i;i=i+208|0;g=a|0;j=a+48|0;k=a+56|0;l=a+104|0;m=a+112|0;n=a+128|0;o=a+144|0;p=m|0;c[p>>2]=0;q=m+4|0;c[q>>2]=0;c[m+8>>2]=0;h[k>>3]=+h[b+24>>3];h[k+24>>3]=+h[b+48>>3];h[k+8>>3]=+h[b+32>>3];h[k+32>>3]=+h[b+56>>3];h[k+16>>3]=+h[b+40>>3];h[k+40>>3]=+h[b+64>>3];c[l>>2]=0;c0(d,c[d>>2]|0,k,l,22,m);m=c[p>>2]|0;if((m|0)==(c[q>>2]|0)){r=m;s=m}else{l=n|0;k=n+4|0;d=n+8|0;b=n;n=g|0;t=g+24|0;u=g+8|0;v=g+32|0;w=g+16|0;x=g+40|0;y=e|0;z=o;A=o|0;B=o+24|0;C=o+48|0;D=o+52|0;E=o+56|0;F=f+4|0;G=f+8|0;H=o|0;I=o+8|0;J=o+16|0;K=o+24|0;L=o+32|0;M=o+40|0;N=o+52|0;O=m;do{c[l>>2]=0;c[k>>2]=0;c[d>>2]=0;m=c[O>>2]|0;h[n>>3]=+h[m+24>>3];h[t>>3]=+h[m+48>>3];h[u>>3]=+h[m+32>>3];h[v>>3]=+h[m+56>>3];h[w>>3]=+h[m+40>>3];h[x>>3]=+h[m+64>>3];c[j>>2]=0;c0(e,c[y>>2]|0,g,j,22,b);m=c[l>>2]|0;if((m|0)==(c[k>>2]|0)){P=m;Q=m}else{R=m;do{m=c[O>>2]|0;S=c[R>>2]|0;ln(z|0,0,48);T=du(m,S,A,B)|0;c[C>>2]=T;c[D>>2]=m;c[E>>2]=S;do{if((T|0)==1|(T|0)==4|(T|0)==5){S=c[F>>2]|0;if((S|0)==(c[G>>2]|0)){c$(f,o);break}if((S|0)==0){U=0}else{h[S>>3]=+h[H>>3];h[S+8>>3]=+h[I>>3];h[S+16>>3]=+h[J>>3];h[S+24>>3]=+h[K>>3];h[S+32>>3]=+h[L>>3];h[S+40>>3]=+h[M>>3];c[S+48>>2]=T;m=S+52|0;S=c[N+4>>2]|0;c[m>>2]=c[N>>2];c[m+4>>2]=S;U=c[F>>2]|0}c[F>>2]=U+64}else if((T|0)==2){dx(c[O>>2]|0,c[R>>2]|0,f)}}while(0);R=R+4|0;}while((R|0)!=(c[k>>2]|0));P=R;Q=c[l>>2]|0}T=Q;if((Q|0)!=0){if((Q|0)!=(P|0)){c[k>>2]=P+((((P-4|0)+(-T|0)|0)>>>2^-1)<<2)}le(Q)}O=O+4|0;}while((O|0)!=(c[q>>2]|0));r=O;s=c[p>>2]|0}if((s|0)==0){i=a;return}if((s|0)!=(r|0)){c[q>>2]=r+((((r-4|0)+(-s|0)|0)>>>2^-1)<<2)}le(s);i=a;return}function cr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0.0,J=0,K=0,L=0.0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;d=i;i=i+80|0;e=d|0;f=d+16|0;g=d+24|0;j=d+32|0;k=d+40|0;l=d+48|0;m=d+56|0;n=d+64|0;o=d+72|0;p=e|0;c[p>>2]=0;q=e+4|0;c[q>>2]=0;r=e+8|0;c[r>>2]=0;s=c[a>>2]|0;t=a+4|0;if((s|0)==(c[t>>2]|0)){i=d;return}a=b+4|0;u=b+8|0;v=s;do{w=+h[2492];s=0;while(1){if((s|0)>=3){break}x=+h[v+(s<<3)>>3]- +h[v+24+(s<<3)>>3];if(x>0.0){y=x}else{y=-0.0-x}if(y<w){s=s+1|0}else{z=134;break}}L125:do{if((z|0)==134){z=0;c[f>>2]=0;c[g>>2]=0;s=c[p>>2]|0;A=c[q>>2]|0;L127:do{if((s|0)==(A|0)){B=0;z=153}else{C=s;D=0;E=0;F=0;while(1){L130:do{if((D|0)==0){G=c[C>>2]|0;H=0;while(1){if((H|0)>=3){break}x=+h[G+(H<<3)>>3]- +h[v+(H<<3)>>3];if(x>0.0){I=x}else{I=-0.0-x}if(I<w){H=H+1|0}else{J=0;break L130}}c[f>>2]=G;J=G}else{J=D}}while(0);L140:do{if((E|0)==0){H=c[C>>2]|0;K=0;while(1){if((K|0)>=3){break}x=+h[H+(K<<3)>>3]- +h[v+24+(K<<3)>>3];if(x>0.0){L=x}else{L=-0.0-x}if(L<w){K=K+1|0}else{M=0;N=F;break L140}}c[g>>2]=H;M=H;N=H}else{M=E;N=F}}while(0);if((J|0)==0){O=M;P=N}else{if((N|0)==0){O=0;P=0}else{break L127}}K=C+4|0;if((K|0)==(A|0)){break}else{C=K;D=J;E=O;F=P}}if((J|0)==0){B=O;z=153}else{Q=O;z=159}}}while(0);do{if((z|0)==153){z=0;A=la(80)|0;s=A;h[A>>3]=+h[v>>3];h[A+8>>3]=+h[v+8>>3];h[A+16>>3]=+h[v+16>>3];ln(A+24|0,0,24);h[A+48>>3]=1.0;ln(A+56|0,0,16);h[A+72>>3]=1.0;c[f>>2]=s;A=c[q>>2]|0;if((A|0)==(c[r>>2]|0)){c_(e,f);Q=B;z=159;break}if((A|0)==0){R=0}else{c[A>>2]=s;R=c[q>>2]|0}c[q>>2]=R+4;Q=B;z=159}}while(0);do{if((z|0)==159){z=0;if((Q|0)!=0){break}s=la(80)|0;A=s;h[s>>3]=+h[v+24>>3];h[s+8>>3]=+h[v+32>>3];h[s+16>>3]=+h[v+40>>3];ln(s+24|0,0,24);h[s+48>>3]=1.0;ln(s+56|0,0,16);h[s+72>>3]=1.0;c[g>>2]=A;s=c[q>>2]|0;if((s|0)==(c[r>>2]|0)){c_(e,g);break}if((s|0)==0){S=0}else{c[s>>2]=A;S=c[q>>2]|0}c[q>>2]=S+4}}while(0);A=v+48|0;s=c[A>>2]|0;do{if((s|0)==5){F=c[v+56>>2]|0;E=c[f>>2]|0;D=c[g>>2]|0;C=c[F>>2]|0;K=c[F+4>>2]|0;if((C|0)==(K|0)){z=173;break}else{T=C}while(1){C=c[T>>2]|0;F=c[C>>2]|0;if((F|0)==(E|0)){if((c[C+4>>2]|0)==(D|0)){break L125}}if((F|0)==(D|0)){if((c[C+4>>2]|0)==(E|0)){break L125}}C=T+4|0;if((C|0)==(K|0)){z=173;break}else{T=C}}}else if((s|0)==1){z=173}else{U=s}}while(0);if((z|0)==173){z=0;s=la(72)|0;K=c[f>>2]|0;E=c[g>>2]|0;D=v+52|0;cY(s,K,E,c[D>>2]|0);c[j>>2]=s;C=la(72)|0;cY(C,E,K,c[D>>2]|0);c[k>>2]=C;D=c[a>>2]|0;if((D|0)==(c[u>>2]|0)){c1(b,j);V=c[a>>2]|0}else{if((D|0)==0){W=0}else{c[D>>2]=s;W=c[a>>2]|0}s=W+4|0;c[a>>2]=s;V=s}if((V|0)==(c[u>>2]|0)){c1(b,k)}else{if((V|0)==0){X=0}else{c[V>>2]=C;X=c[a>>2]|0}c[a>>2]=X+4}U=c[A>>2]|0}do{if((U|0)==4){C=c[v+56>>2]|0;s=c[f>>2]|0;D=c[g>>2]|0;K=c[C>>2]|0;E=c[C+4>>2]|0;if((K|0)==(E|0)){z=198;break}else{Y=K}while(1){K=c[Y>>2]|0;C=c[K>>2]|0;if((C|0)==(s|0)){if((c[K+4>>2]|0)==(D|0)){break L125}}if((C|0)==(D|0)){if((c[K+4>>2]|0)==(s|0)){break L125}}K=Y+4|0;if((K|0)==(E|0)){z=198;break}else{Y=K}}}else if((U|0)==1){z=198}}while(0);do{if((z|0)==198){z=0;E=la(72)|0;s=c[f>>2]|0;D=c[g>>2]|0;K=v+56|0;cY(E,s,D,c[K>>2]|0);c[l>>2]=E;C=la(72)|0;cY(C,D,s,c[K>>2]|0);c[m>>2]=C;K=c[a>>2]|0;if((K|0)==(c[u>>2]|0)){c1(b,l);Z=c[a>>2]|0}else{if((K|0)==0){_=0}else{c[K>>2]=E;_=c[a>>2]|0}E=_+4|0;c[a>>2]=E;Z=E}if((Z|0)==(c[u>>2]|0)){c1(b,m);break}if((Z|0)==0){$=0}else{c[Z>>2]=C;$=c[a>>2]|0}c[a>>2]=$+4}}while(0);if((c[A>>2]|0)!=2){break}C=v+52|0;E=c[C>>2]|0;K=c[f>>2]|0;s=c[g>>2]|0;D=c[E>>2]|0;F=c[E+4>>2]|0;if((D|0)!=(F|0)){E=D;do{D=c[E>>2]|0;G=c[D>>2]|0;if((G|0)==(K|0)){if((c[D+4>>2]|0)==(s|0)){break L125}}if((G|0)==(s|0)){if((c[D+4>>2]|0)==(K|0)){break L125}}E=E+4|0;}while((E|0)!=(F|0))}F=la(72)|0;cY(F,K,s,c[C>>2]|0);c[n>>2]=F;E=la(72)|0;cY(E,s,K,c[C>>2]|0);c[o>>2]=E;A=c[a>>2]|0;if((A|0)==(c[u>>2]|0)){c1(b,n);aa=c[a>>2]|0}else{if((A|0)==0){ab=0}else{c[A>>2]=F;ab=c[a>>2]|0}F=ab+4|0;c[a>>2]=F;aa=F}if((aa|0)==(c[u>>2]|0)){c1(b,o);break}if((aa|0)==0){ac=0}else{c[aa>>2]=E;ac=c[a>>2]|0}c[a>>2]=ac+4}}while(0);v=v+64|0;}while((v|0)!=(c[t>>2]|0));t=c[p>>2]|0;if((t|0)==0){i=d;return}p=c[q>>2]|0;if((t|0)!=(p|0)){c[q>>2]=p+((((p-4|0)+(-t|0)|0)>>>2^-1)<<2)}le(t);i=d;return}function cs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0.0,N=0,O=0.0,P=0.0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+152|0;f=e|0;g=e+48|0;j=e+56|0;k=e+72|0;l=e+88|0;m=e+96|0;n=e+104|0;o=e+120|0;p=e+128|0;q=e+136|0;r=e+144|0;c[g>>2]=a;if(!(c2(a)|0)){i=e;return}cw(a);s=j|0;c[s>>2]=0;t=j+4|0;c[t>>2]=0;u=j+8|0;c[u>>2]=0;v=k|0;c[v>>2]=0;w=k+4|0;c[w>>2]=0;x=k+8|0;c[x>>2]=0;y=a+4|0;z=a|0;A=c[z>>2]|0;B=a+120|0;if((c[y>>2]|0)-A>>2>>>0>=3){C=a+72|0;D=C|0;E=a+80|0;F=a+88|0;G=0;H=A;do{c[l>>2]=c[H+(G<<2)>>2];A=la(160)|0;I=A;J=c[B>>2]|0;ln(A|0,0,40);h[A+24>>3]=-3.4028234663852886e+38;h[A+32>>3]=-3.4028234663852886e+38;h[A+40>>3]=-3.4028234663852886e+38;h[A+48>>3]=3.4028234663852886e+38;h[A+56>>3]=3.4028234663852886e+38;h[A+64>>3]=3.4028234663852886e+38;ln(A+72|0,0,48);c[A+120>>2]=J;ln(A+124|0,0,20);h[A+128>>3]=1.0;h[A+136>>3]=1.0;h[A+144>>3]=1.0;h[A+152>>3]=1.0;c[m>>2]=I;c1(A,l);do{if(cx(a,I,1)|0){if(!(db(I)|0)){K=0;break}J=c5(A,C)|0;L=A+72|0;M=+h[D>>3];if(J){h[L>>3]=M;h[A+80>>3]=+h[E>>3];h[A+88>>3]=+h[F>>3];J=c[t>>2]|0;if((J|0)==(c[u>>2]|0)){cW(j,m);K=0;break}if((J|0)==0){N=0}else{c[J>>2]=I;N=c[t>>2]|0}c[t>>2]=N+4;K=0;break}else{O=-0.0- +h[E>>3];P=-0.0- +h[F>>3];h[L>>3]=-0.0-M;h[A+80>>3]=O;h[A+88>>3]=P;L=c[w>>2]|0;if((L|0)==(c[x>>2]|0)){cW(k,m);K=0;break}if((L|0)==0){Q=0}else{c[L>>2]=I;Q=c[w>>2]|0}c[w>>2]=Q+4;K=0;break}}else{K=G}}while(0);G=K+1|0;H=c[z>>2]|0;I=(c[y>>2]|0)-H>>2;}while(!(G>>>0>=I>>>0|I>>>0<3))}L308:do{if((c[B>>2]|0)!=0){h[f>>3]=+h[a+24>>3];h[f+24>>3]=+h[a+48>>3];h[f+8>>3]=+h[a+32>>3];h[f+32>>3]=+h[a+56>>3];h[f+16>>3]=+h[a+40>>3];h[f+40>>3]=+h[a+64>>3];G=b|0;cK(b,f,g,G);G=b+16|0;c[G>>2]=(c[G>>2]|0)-1;G=c[g>>2]|0;H=G+120|0;y=c[H>>2]|0;c[H>>2]=0;H=c[y+4>>2]|0;z=y+8|0;y=c[z>>2]|0;K=H;Q=0;while(1){if((K|0)==(y|0)){break L308}R=Q;S=K+4|0;if((c[K>>2]|0)==(G|0)){break}else{K=S;Q=Q-4|0}}Q=y-S|0;G=Q>>2;lk(K|0,S|0,Q|0);Q=c[z>>2]|0;if((K+(G<<2)|0)==(Q|0)){break}c[z>>2]=Q+(((R+((Q-4|0)+(-(H+(G<<2)|0)|0)|0)|0)>>>2^-1)<<2)}}while(0);R=c[s>>2]|0;S=c[t>>2]|0;if((R|0)==(S|0)){T=R;U=R}else{g=R;b=S;S=R;while(1){L320:do{if((S|0)!=(b|0)){R=S;L321:while(1){f=c[R>>2]|0;a=c[g>>2]|0;B=f|0;G=c[c[B>>2]>>2]|0;Q=f+72|0;m=(dh(c[c[c[a>>2]>>2]>>2]|0,c[G>>2]|0,c[G+4>>2]|0,Q)|0)==1;G=f+4|0;f=c[B>>2]|0;do{f=f+4|0;if((f|0)==(c[G>>2]|0)){break L321}B=c[f>>2]|0;}while(!(m^(dh(c[c[c[a>>2]>>2]>>2]|0,c[B>>2]|0,c[B+4>>2]|0,Q)|0)==1));Q=R+4|0;if((Q|0)==(c[t>>2]|0)){break L320}else{R=Q}}Q=c[R>>2]|0;a=c[g>>2]|0;m=Q+16|0;f=c[m>>2]|0;if((f|0)==(c[Q+20>>2]|0)){cI(Q+12|0,a);break}if((f|0)==0){V=0}else{cJ(f,a);V=c[m>>2]|0}c[m>>2]=V+12}}while(0);H=g+4|0;z=c[t>>2]|0;K=c[s>>2]|0;if((H|0)==(z|0)){T=K;U=H;break}else{g=H;b=z;S=K}}}S=n|0;c[S>>2]=0;b=n+4|0;c[b>>2]=0;c[n+8>>2]=0;if((T|0)==(U|0)){W=0;X=0}else{U=T;do{dM(c[U>>2]|0,n);U=U+4|0;}while((U|0)!=(c[t>>2]|0));W=c[S>>2]|0;X=c[b>>2]|0}c[o>>2]=c[d+4>>2];c[p>>2]=W;c[q>>2]=X;cz(r,d,o,p,q);q=c[S>>2]|0;S=q;if((q|0)!=0){p=c[b>>2]|0;if((q|0)!=(p|0)){c[b>>2]=p+((((p-4|0)+(-S|0)|0)>>>2^-1)<<2)}le(q)}q=c[v>>2]|0;v=q;if((q|0)!=0){S=c[w>>2]|0;if((q|0)!=(S|0)){c[w>>2]=S+((((S-4|0)+(-v|0)|0)>>>2^-1)<<2)}le(q)}q=c[s>>2]|0;if((q|0)==0){i=e;return}s=c[t>>2]|0;if((q|0)!=(s|0)){c[t>>2]=s+((((s-4|0)+(-q|0)|0)>>>2^-1)<<2)}le(q);i=e;return}function ct(a,b,d,e,f,g,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;i=i|0;var j=0,k=0,l=0,m=0,n=0;j=c[b+4>>2]|0;k=b+8|0;if((j|0)!=(c[k>>2]|0)){l=j;do{j=c[l>>2]|0;m=cy(i,f,j)|0;if((m|0)==0){c[j+124>>2]=1;h[j+128>>3]=.8;ln(j+136|0,0,16);h[j+152>>3]=1.0}else if((m|0)==3){c[j+124>>2]=4;h[j+128>>3]=.8;h[j+136>>3]=0.0;h[j+144>>3]=.8;h[j+152>>3]=1.0}else if((m|0)==1){c[j+124>>2]=2;ln(j+128|0,0,16);h[j+144>>3]=.8;h[j+152>>3]=1.0}else if((m|0)==2){c[j+124>>2]=3;h[j+128>>3]=0.0;h[j+136>>3]=.8;h[j+144>>3]=0.0;h[j+152>>3]=1.0}l=l+4|0;}while((l|0)!=(c[k>>2]|0))}k=c[d+4>>2]|0;l=d+8|0;if((k|0)!=(c[l>>2]|0)){d=k;do{k=c[d>>2]|0;j=cy(g,e,k)|0;if((j|0)==0){c[k+124>>2]=1;h[k+128>>3]=.8;ln(k+136|0,0,16);h[k+152>>3]=1.0}else if((j|0)==1){c[k+124>>2]=2;ln(k+128|0,0,16);h[k+144>>3]=.8;h[k+152>>3]=1.0}else if((j|0)==2){c[k+124>>2]=3;h[k+128>>3]=0.0;h[k+136>>3]=.8;h[k+144>>3]=0.0;h[k+152>>3]=1.0}else if((j|0)==3){c[k+124>>2]=4;h[k+128>>3]=.8;h[k+136>>3]=0.0;h[k+144>>3]=.8;h[k+152>>3]=1.0}d=d+4|0;}while((d|0)!=(c[l>>2]|0))}l=c[a>>2]|0;d=a+4|0;if((l|0)==(c[d>>2]|0)){return}else{n=l}do{l=c[n>>2]|0;a=(c[l+120>>2]|0)==(b|0);k=cy(a?i:g,a?f:e,l)|0;if((k|0)==0){c[l+124>>2]=1;h[l+128>>3]=.8;ln(l+136|0,0,16);h[l+152>>3]=1.0}else if((k|0)==1){c[l+124>>2]=2;ln(l+128|0,0,16);h[l+144>>3]=.8;h[l+152>>3]=1.0}else if((k|0)==2){c[l+124>>2]=3;h[l+128>>3]=0.0;h[l+136>>3]=.8;h[l+144>>3]=0.0;h[l+152>>3]=1.0}else if((k|0)==3){c[l+124>>2]=4;h[l+128>>3]=.8;h[l+136>>3]=0.0;h[l+144>>3]=.8;h[l+152>>3]=1.0}n=n+4|0;}while((n|0)!=(c[d>>2]|0));return}function cu(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;g=i;i=i+8|0;h=g|0;do{if((f|0)==0){j=c[a>>2]|0;k=a+4|0;if((j|0)!=(c[k>>2]|0)){l=e+8|0;m=e+12|0;n=e+4|0;o=j;do{j=c[o>>2]|0;p=c[j+124>>2]|0;do{if((c[j+120>>2]|0)==(b|0)){if((p-2|0)>>>0>=2){break}q=c[l>>2]|0;if((q|0)==(c[m>>2]|0)){cW(n,o);break}if((q|0)==0){r=0}else{c[q>>2]=j;r=c[l>>2]|0}c[l>>2]=r+4}else{if((p|0)!=2){break}q=c[l>>2]|0;if((q|0)==(c[m>>2]|0)){cW(n,o);break}if((q|0)==0){s=0}else{c[q>>2]=j;s=c[l>>2]|0}c[l>>2]=s+4}}while(0);o=o+4|0;}while((o|0)!=(c[k>>2]|0))}k=c[b+4>>2]|0;o=b+8|0;if((k|0)!=(c[o>>2]|0)){l=e+8|0;n=e+12|0;m=e+4|0;j=k;do{k=c[j>>2]|0;do{if(((c[k+124>>2]|0)-2|0)>>>0<2){p=c[l>>2]|0;if((p|0)==(c[n>>2]|0)){cW(m,j);break}if((p|0)==0){t=0}else{c[p>>2]=k;t=c[l>>2]|0}c[l>>2]=t+4}}while(0);j=j+4|0;}while((j|0)!=(c[o>>2]|0))}o=c[d+4>>2]|0;j=d+8|0;if((o|0)==(c[j>>2]|0)){break}l=e+8|0;m=e+12|0;n=e+4|0;k=o;do{o=c[k>>2]|0;do{if((c[o+124>>2]|0)==2){p=c[l>>2]|0;if((p|0)==(c[m>>2]|0)){cW(n,k);break}if((p|0)==0){u=0}else{c[p>>2]=o;u=c[l>>2]|0}c[l>>2]=u+4}}while(0);k=k+4|0;}while((k|0)!=(c[j>>2]|0))}else if((f|0)==1){j=c[a>>2]|0;k=a+4|0;if((j|0)!=(c[k>>2]|0)){l=e+8|0;n=e+12|0;m=e+4|0;o=j;do{j=c[o>>2]|0;p=c[j+124>>2]|0;do{if((c[j+120>>2]|0)==(b|0)){if(!((p|0)==3|(p|0)==1)){break}q=c[l>>2]|0;if((q|0)==(c[n>>2]|0)){cW(m,o);break}if((q|0)==0){v=0}else{c[q>>2]=j;v=c[l>>2]|0}c[l>>2]=v+4}else{if((p|0)!=1){break}q=c[l>>2]|0;if((q|0)==(c[n>>2]|0)){cW(m,o);break}if((q|0)==0){w=0}else{c[q>>2]=j;w=c[l>>2]|0}c[l>>2]=w+4}}while(0);o=o+4|0;}while((o|0)!=(c[k>>2]|0))}k=c[b+4>>2]|0;o=b+8|0;if((k|0)!=(c[o>>2]|0)){l=e+8|0;m=e+12|0;n=e+4|0;j=k;do{k=c[j>>2]|0;p=c[k+124>>2]|0;do{if((p|0)==1|(p|0)==3){q=c[l>>2]|0;if((q|0)==(c[m>>2]|0)){cW(n,j);break}if((q|0)==0){x=0}else{c[q>>2]=k;x=c[l>>2]|0}c[l>>2]=x+4}}while(0);j=j+4|0;}while((j|0)!=(c[o>>2]|0))}o=c[d+4>>2]|0;j=d+8|0;if((o|0)==(c[j>>2]|0)){break}l=e+8|0;n=e+12|0;m=e+4|0;k=o;do{o=c[k>>2]|0;do{if((c[o+124>>2]|0)==1){p=c[l>>2]|0;if((p|0)==(c[n>>2]|0)){cW(m,k);break}if((p|0)==0){y=0}else{c[p>>2]=o;y=c[l>>2]|0}c[l>>2]=y+4}}while(0);k=k+4|0;}while((k|0)!=(c[j>>2]|0))}else if((f|0)==2){j=c[a>>2]|0;k=a+4|0;if((j|0)!=(c[k>>2]|0)){l=e+8|0;m=e+12|0;n=e+4|0;o=j;do{j=c[o>>2]|0;p=c[j+120>>2]|0;do{if((p|0)==(b|0)){q=c[j+124>>2]|0;if(!((q|0)==2|(q|0)==4)){z=441;break}q=c[l>>2]|0;if((q|0)==(c[m>>2]|0)){cW(n,o);break}if((q|0)==0){A=0}else{c[q>>2]=j;A=c[l>>2]|0}c[l>>2]=A+4}else{z=441}}while(0);do{if((z|0)==441){z=0;if((p|0)!=(d|0)){break}if((c[j+124>>2]|0)!=1){break}q=j|0;B=c[q>>2]|0;C=j+4|0;do{if((B|0)!=(c[C>>2]|0)){D=B;while(1){E=c[D>>2]|0;F=E|0;G=E+4|0;E=c[F>>2]|0;c[F>>2]=c[G>>2];c[G>>2]=E;H=D+4|0;if((H|0)==(c[C>>2]|0)){break}else{D=H}}E=c[q>>2]|0;if((E|0)!=(H|0)&E>>>0<D>>>0){I=E;J=D}else{break}do{E=c[I>>2]|0;c[I>>2]=c[J>>2];c[J>>2]=E;I=I+4|0;J=J-4|0;}while(I>>>0<J>>>0)}}while(0);if(c2(j)|0){c4(j)}q=c[l>>2]|0;if((q|0)==(c[m>>2]|0)){cW(n,o);break}if((q|0)==0){K=0}else{c[q>>2]=c[o>>2];K=c[l>>2]|0}c[l>>2]=K+4}}while(0);o=o+4|0;}while((o|0)!=(c[k>>2]|0))}k=c[b+4>>2]|0;o=b+8|0;if((k|0)!=(c[o>>2]|0)){l=e+8|0;n=e+12|0;m=e+4|0;j=k;do{k=c[j>>2]|0;p=c[k+124>>2]|0;do{if((p|0)==2|(p|0)==4){q=c[l>>2]|0;if((q|0)==(c[n>>2]|0)){cW(m,j);break}if((q|0)==0){L=0}else{c[q>>2]=k;L=c[l>>2]|0}c[l>>2]=L+4}}while(0);j=j+4|0;}while((j|0)!=(c[o>>2]|0))}o=c[d+4>>2]|0;j=d+8|0;if((o|0)==(c[j>>2]|0)){break}l=e+8|0;m=e+12|0;n=e+4|0;k=o;do{o=c[k>>2]|0;do{if((c[o+124>>2]|0)==1){p=o|0;q=c[p>>2]|0;C=o+4|0;do{if((q|0)!=(c[C>>2]|0)){B=q;while(1){D=c[B>>2]|0;E=D|0;G=D+4|0;D=c[E>>2]|0;c[E>>2]=c[G>>2];c[G>>2]=D;M=B+4|0;if((M|0)==(c[C>>2]|0)){break}else{B=M}}D=c[p>>2]|0;if((D|0)!=(M|0)&D>>>0<B>>>0){N=D;O=B}else{break}do{D=c[N>>2]|0;c[N>>2]=c[O>>2];c[O>>2]=D;N=N+4|0;O=O-4|0;}while(N>>>0<O>>>0)}}while(0);if(c2(o)|0){c4(o)}p=c[l>>2]|0;if((p|0)==(c[m>>2]|0)){cW(n,k);break}if((p|0)==0){P=0}else{c[p>>2]=c[k>>2];P=c[l>>2]|0}c[l>>2]=P+4}}while(0);k=k+4|0;}while((k|0)!=(c[j>>2]|0))}}while(0);P=e+4|0;O=e+8|0;dX(c[P>>2]|0,c[O>>2]|0,h);h=c[O>>2]|0;e=c[P>>2]|0;N=h;if(N-e>>2>>>0>1){Q=1;R=e;S=N;T=h}else{i=g;return}while(1){h=Q-1|0;N=R+(Q<<2)|0;if((c[R+(h<<2)>>2]|0)==(c[N>>2]|0)){e=R+(Q+1<<2)|0;M=S-e|0;lk(N|0,e|0,M|0);e=R+((M>>2)+Q<<2)|0;M=c[O>>2]|0;if((e|0)==(M|0)){U=e}else{N=M+((((M-4|0)+(-e|0)|0)>>>2^-1)<<2)|0;c[O>>2]=N;U=N}V=h;W=U;X=c[P>>2]|0}else{V=Q;W=T;X=R}h=V+1|0;N=W;if(h>>>0<N-X>>2>>>0){Q=h;R=X;S=N;T=W}else{break}}i=g;return}function cv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+8|0;e=d|0;c[e>>2]=a;f=b+4|0;g=c[f>>2]|0;if((g|0)==(c[b+8>>2]|0)){cW(b,e);i=d;return 1}if((g|0)==0){h=0}else{c[g>>2]=a;h=c[f>>2]|0}c[f>>2]=h+4;i=d;return 1}function cw(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;b=i;i=i+72|0;d=b|0;e=b+8|0;f=b+32|0;g=b+56|0;j=a|0;k=g|0;l=g+4|0;m=g+8|0;n=a+4|0;a=d|0;o=f|0;p=f+8|0;q=f+16|0;r=e|0;s=e+8|0;t=e+16|0;u=0;do{v=c[j>>2]|0;w=c[v+(u<<2)>>2]|0;c[k>>2]=0;c[l>>2]=0;c[m>>2]=0;if((c[n>>2]|0)-v>>2>>>0>3){x=w|0;y=w+4|0;z=3;A=v;do{v=A+(z<<2)|0;B=c[c[v>>2]>>2]|0;h[o>>3]=0.0;h[p>>3]=1.0;h[q>>3]=0.0;do{if((dh(B,c[x>>2]|0,c[y>>2]|0,f)|0)==2){C=+c7(B,c[x>>2]|0,c[y>>2]|0);D=+h[2492];if(D+0.0>=C){break}if(1.0-D<=C){break}E=c[v>>2]|0;F=c[l>>2]|0;if((F|0)==(c[m>>2]|0)){c_(g,E);break}if((F|0)==0){G=0}else{c[F>>2]=c[E>>2];G=c[l>>2]|0}c[l>>2]=G+4}}while(0);B=c[(c[v>>2]|0)+4>>2]|0;h[r>>3]=0.0;h[s>>3]=1.0;h[t>>3]=0.0;do{if((dh(B,c[x>>2]|0,c[y>>2]|0,e)|0)==2){C=+c7(B,c[x>>2]|0,c[y>>2]|0);D=+h[2492];if(D+0.0>=C){break}if(1.0-D<=C){break}E=(c[v>>2]|0)+4|0;F=c[l>>2]|0;if((F|0)==(c[m>>2]|0)){c_(g,E);break}if((F|0)==0){H=0}else{c[F>>2]=c[E>>2];H=c[l>>2]|0}c[l>>2]=H+4}}while(0);z=z+2|0;A=c[j>>2]|0;}while(z>>>0<(c[n>>2]|0)-A>>2>>>0);I=c[k>>2]|0;J=c[l>>2]|0}else{I=0;J=0}c[a>>2]=w;dj(I,J,d);A=c[l>>2]|0;z=c[k>>2]|0;y=A;if(y-z>>2>>>0>1){x=1;v=z;B=y;y=A;E=A;while(1){F=x-1|0;K=v+(x<<2)|0;if((c[v+(F<<2)>>2]|0)==(c[K>>2]|0)){L=v+(x+1<<2)|0;M=B-L|0;lk(K|0,L|0,M|0);L=v+((M>>2)+x<<2)|0;M=c[l>>2]|0;if((L|0)==(M|0)){N=L}else{K=M+((((M-4|0)+(-L|0)|0)>>>2^-1)<<2)|0;c[l>>2]=K;N=K}O=F;P=N;Q=c[k>>2]|0;R=N}else{O=x;P=y;Q=v;R=E}F=O+1|0;K=P;if(F>>>0<K-Q>>2>>>0){x=F;v=Q;B=K;y=P;E=R}else{S=Q;T=R;break}}}else{S=z;T=A}if((S|0)==(T|0)){U=T;V=T}else{E=S;y=w;do{y=c9(c[E>>2]|0,y)|0;E=E+4|0;}while((E|0)!=(c[l>>2]|0));U=E;V=c[k>>2]|0}y=V;if((V|0)!=0){if((V|0)!=(U|0)){c[l>>2]=U+((((U-4|0)+(-y|0)|0)>>>2^-1)<<2)}le(V)}u=u+1|0;}while(u>>>0<3);i=b;return}function cx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0,M=0,N=0,O=0;e=i;i=i+88|0;f=e|0;g=e+56|0;j=e+72|0;k=e+80|0;l=b|0;m=b+4|0;n=c[(c[m>>2]|0)-4>>2]|0;c[n+64>>2]=1;o=g|0;c[o>>2]=0;p=g+4|0;c[p>>2]=0;q=g+8|0;c[q>>2]=0;r=a+4|0;s=c[r>>2]|0;t=c[a>>2]|0;L652:do{if((s-t>>2|0)<(d|0)){u=565}else{v=c[c[b>>2]>>2]|0;do{if((v|0)==(n|0)){u=550}else{if((c[n+4>>2]|0)!=(c[v>>2]|0)){u=550;break}if((c[n>>2]|0)!=(c[v+4>>2]|0)|(t|0)==(s|0)){u=565;break L652}}}while(0);if((u|0)==550){if((t|0)==(s|0)){u=565;break}}v=n+4|0;w=n|0;x=t;do{y=c[x>>2]|0;c[j>>2]=y;do{if(!((c[y+64>>2]|0)==1|(y|0)==(n|0))){if((c[v>>2]|0)!=(c[y>>2]|0)){break}if((c[w>>2]|0)==(c[y+4>>2]|0)){break}z=c[p>>2]|0;if((z|0)==(c[q>>2]|0)){c1(g,j);break}if((z|0)==0){A=0}else{c[z>>2]=y;A=c[p>>2]|0}c[p>>2]=A+4}}while(0);x=x+4|0;}while((x|0)!=(c[r>>2]|0));x=c[p>>2]|0;w=c[o>>2]|0;if((x|0)==(w|0)){u=565;break}v=c[n+4>>2]|0;y=c[n>>2]|0;B=+h[v>>3]- +h[y>>3];C=+h[v+8>>3]- +h[y+8>>3];D=+h[v+16>>3]- +h[y+16>>3];E=+h[a+72>>3];F=+h[a+80>>3];G=+h[a+88>>3];H=B*B+0.0+C*C+D*D;if(H==0.0){I=0.0}else{I=+W(+H)}c[f>>2]=v;h[f+8>>3]=(-0.0-B)/I;h[f+16>>3]=(-0.0-C)/I;h[f+24>>3]=(-0.0-D)/I;h[f+32>>3]=E;h[f+40>>3]=F;h[f+48>>3]=G;dc(w,x,f);x=c[c[o>>2]>>2]|0;c[k>>2]=x;w=c[m>>2]|0;if((w|0)==(c[b+8>>2]|0)){c1(l,k)}else{if((w|0)==0){J=0}else{c[w>>2]=x;J=c[m>>2]|0}c[m>>2]=J+4}K=cx(a,b,d+1|0)|0}}while(0);L686:do{if((u|0)==565){d=c[b>>2]|0;a=c[d>>2]|0;do{if((n|0)!=(a|0)){if((c[n+4>>2]|0)!=(c[a>>2]|0)){break}if((c[n>>2]|0)==(c[a+4>>2]|0)){break}if((d|0)==(c[m>>2]|0)){K=1;break L686}J=(b|0)==0;k=d;l=a;while(1){c[l+64>>2]=0;f=c[k>>2]|0;r=f+8|0;A=c[r>>2]|0;L695:do{if((A|0)!=0){c[r>>2]=0;j=c[A>>2]|0;g=A+4|0;q=c[g>>2]|0;t=j;s=0;while(1){if((t|0)==(q|0)){break L695}L=s;M=t+4|0;if((c[t>>2]|0)==(f|0)){break}else{t=M;s=s-4|0}}s=q-M|0;x=s>>2;lk(t|0,M|0,s|0);s=c[g>>2]|0;if((t+(x<<2)|0)==(s|0)){break}c[g>>2]=s+(((L+((s-4|0)+(-(j+(x<<2)|0)|0)|0)|0)>>>2^-1)<<2)}}while(0);c[r>>2]=b;if(!J){c3(b,f)}A=k+4|0;if((A|0)==(c[m>>2]|0)){K=1;break L686}k=A;l=c[A>>2]|0}}}while(0);if((d|0)==(c[m>>2]|0)){K=0;break}else{N=d;O=a}while(1){c[O+64>>2]=0;l=N+4|0;if((l|0)==(c[m>>2]|0)){K=0;break L686}N=l;O=c[l>>2]|0}}}while(0);O=c[o>>2]|0;if((O|0)==0){i=e;return K|0}o=c[p>>2]|0;if((O|0)!=(o|0)){c[p>>2]=o+((((o-4|0)+(-O|0)|0)>>>2^-1)<<2)}le(O);i=e;return K|0}function cy(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0.0,v=0,w=0.0,x=0,y=0.0,z=0,A=0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0.0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a2=0,a3=0;f=i;i=i+448|0;g=f|0;j=f+48|0;k=f+56|0;l=f+64|0;m=f+88|0;n=f+104|0;o=f+336|0;p=f+360|0;q=f+408|0;r=f+424|0;s=+h[e+96>>3];t=l|0;h[t>>3]=s;u=+h[e+104>>3];v=l+8|0;h[v>>3]=u;w=+h[e+112>>3];x=l+16|0;h[x>>3]=w;y=+h[2492];z=0;while(1){if((z|0)>=3){A=610;break}B=+h[l+(z<<3)>>3];if(+h[b+24+(z<<3)>>3]-y>=B){C=1;A=676;break}if(y+ +h[b+48+(z<<3)>>3]>B){z=z+1|0}else{C=1;A=677;break}}if((A|0)==676){i=f;return C|0}else if((A|0)==677){i=f;return C|0}else if((A|0)==610){z=m|0;c[z>>2]=0;D=m+4|0;c[D>>2]=0;E=m+8|0;c[E>>2]=0;cX(n,a1()|0);F=o|0;h[F>>3]=1.0;G=o+8|0;H=o+16|0;I=p;J=p|0;K=p+8|0;L=p+16|0;M=p+24|0;N=p+32|0;O=p+40|0;P=b+48|0;Q=b+56|0;R=b+64|0;S=q|0;T=q+4|0;U=q+8|0;V=q;q=g|0;W=g+24|0;X=g+8|0;Y=g+32|0;Z=g+16|0;_=g+40|0;$=d|0;aa=r;ab=r|0;ac=r+8|0;ad=r+16|0;ae=n|0;af=n+4|0;ag=e+72|0;ah=e+80|0;ai=e+88|0;ln(G|0,0,16);e=0;aj=0;ak=0;B=s;s=u;u=w;while(1){w=B-y;al=s-y;am=u-y;ln(I|0,0,40);h[J>>3]=w;h[K>>3]=al;h[L>>3]=am;h[M>>3]=y+B;h[N>>3]=y+s;h[O>>3]=y+u;if(aj){an=y+ +h[P>>3];ao=y+ +h[Q>>3];ap=y+ +h[R>>3];h[M>>3]=an;h[N>>3]=ao;h[O>>3]=ap;aq=w;ar=an;as=al;at=ao;au=am;av=ap}else{h[p+24+(e<<3)>>3]=+h[b+48+(e<<3)>>3]+ +h[2492];if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;aw=0.0;ax=0.0;ay=0.0}else{aw=+h[1373];ax=+h[1374];ay=+h[1375]}h[F>>3]=aw;h[G>>3]=ax;h[H>>3]=ay;h[o+(e<<3)>>3]=1.0;aq=+h[J>>3];ar=+h[M>>3];as=+h[K>>3];at=+h[N>>3];au=+h[L>>3];av=+h[O>>3]}c[S>>2]=0;c[T>>2]=0;c[U>>2]=0;h[q>>3]=aq;h[W>>3]=ar;h[X>>3]=as;h[Y>>3]=at;h[Z>>3]=au;h[_>>3]=av;c[j>>2]=0;c0(d,c[$>>2]|0,g,j,22,V);az=c[z>>2]|0;aA=c[D>>2]|0;if((az|0)!=(aA|0)){c[D>>2]=aA+(((((aA-24|0)+(-az|0)|0)>>>0)/24>>>0^-1)*24&-1)}az=c[S>>2]|0;if((az|0)==(c[T>>2]|0)){aB=e;aC=aj;aD=0;aE=0;aF=ak;aG=az}else{aA=az;L744:while(1){ln(aa|0,0,24);az=dv(l,o,c[aA>>2]|0,r)|0;do{if((az|0)==2){A=634;break L744}else if((az|0)==3){A=626;break L744}else if((az|0)==1){aH=c[D>>2]|0;if((aH|0)==(c[E>>2]|0)){cG(m,r);break}if((aH|0)==0){aI=0}else{h[aH>>3]=+h[ab>>3];h[aH+8>>3]=+h[ac>>3];h[aH+16>>3]=+h[ad>>3];aI=c[D>>2]|0}c[D>>2]=aI+24}}while(0);az=aA+4|0;if((az|0)==(c[T>>2]|0)){aJ=e;aK=aj;aL=0;aM=0;aN=ak;break}else{aA=az}}do{if((A|0)==634){A=0;az=c[aA>>2]|0;aJ=e;aK=aj;aL=0;aM=1;aN=+h[az+72>>3]*+h[ag>>3]+0.0+ +h[az+80>>3]*+h[ah>>3]+ +h[az+88>>3]*+h[ai>>3]>0.0?2:3}else if((A|0)==626){A=0;az=e+1|0;if((az|0)<=2){aJ=az;aK=aj;aL=1;aM=0;aN=ak;break}aH=(c[ae>>2]|0)+1|0;aO=(aH|0)>55?1:aH;aH=(c[af>>2]|0)+1|0;aP=(aH|0)>55?1:aH;aH=n+8+(aO<<2)|0;aQ=(c[aH>>2]|0)-(c[n+8+(aP<<2)>>2]|0)|0;aR=(aQ|0)<0?aQ+2147483647|0:aQ;c[aH>>2]=aR;c[ae>>2]=aO;c[af>>2]=aP;aH=aO+1|0;aO=(aH|0)>55?1:aH;aH=aP+1|0;aP=(aH|0)>55?1:aH;aH=n+8+(aO<<2)|0;aQ=(c[aH>>2]|0)-(c[n+8+(aP<<2)>>2]|0)|0;aS=(aQ|0)<0?aQ+2147483647|0:aQ;c[aH>>2]=aS;c[ae>>2]=aO;c[af>>2]=aP;aH=aO+1|0;aO=(aH|0)>55?1:aH;aH=aP+1|0;aP=(aH|0)>55?1:aH;aH=n+8+(aO<<2)|0;aQ=(c[aH>>2]|0)-(c[n+8+(aP<<2)>>2]|0)|0;aT=(aQ|0)<0?aQ+2147483647|0:aQ;c[aH>>2]=aT;c[ae>>2]=aO;c[af>>2]=aP;h[F>>3]=+(aR|0)*4.656612875245797e-10;h[G>>3]=+(aS|0)*4.656612875245797e-10;h[H>>3]=+(aT|0)*4.656612875245797e-10;aJ=az;aK=1;aL=1;aM=0;aN=ak}}while(0);aB=aJ;aC=aK;aD=aL;aE=aM;aF=aN;aG=c[S>>2]|0}aA=aG;if((aG|0)!=0){az=c[T>>2]|0;if((aG|0)!=(az|0)){c[T>>2]=az+((((az-4|0)+(-aA|0)|0)>>>2^-1)<<2)}le(aG)}if((aE|0)!=0){A=665;break}if(!aD){A=645;break}e=aB;aj=aC;ak=aF;B=+h[t>>3];s=+h[v>>3];u=+h[x>>3]}if((A|0)==665){aU=aF;aV=c[z>>2]|0}else if((A|0)==645){cB(c[z>>2]|0,c[D>>2]|0,k);k=c[D>>2]|0;aF=c[z>>2]|0;x=(k-aF|0)/24&-1;if(x>>>0>1){v=1;t=aF;ak=k;while(1){k=v-1|0;u=+h[2492];aC=0;while(1){if((aC|0)>=3){A=652;break}s=+h[t+(k*24&-1)+(aC<<3)>>3]- +h[t+(v*24&-1)+(aC<<3)>>3];if(s>0.0){aW=s}else{aW=-0.0-s}if(aW<u){aC=aC+1|0}else{aX=v;aY=ak;aZ=t;break}}if((A|0)==652){A=0;aC=t+(v*24&-1)|0;aj=t+((v+1|0)*24&-1)|0;if((aj|0)==(ak|0)){a_=aC;a$=ak}else{aB=v+((((ak+((-2-v|0)*24&-1)|0)+(-t|0)|0)>>>0)/24>>>0)|0;e=aC;aC=aj;while(1){h[e>>3]=+h[aC>>3];h[e+8>>3]=+h[aC+8>>3];h[e+16>>3]=+h[aC+16>>3];aj=aC+24|0;if((aj|0)==(ak|0)){break}else{e=e+24|0;aC=aj}}a_=t+((aB+1|0)*24&-1)|0;a$=c[D>>2]|0}if((a_|0)==(a$|0)){a0=a$}else{aC=a$+(((((a$-24|0)+(-a_|0)|0)>>>0)/24>>>0^-1)*24&-1)|0;c[D>>2]=aC;a0=aC}aX=k;aY=a0;aZ=c[z>>2]|0}aC=aX+1|0;e=(aY-aZ|0)/24&-1;if(aC>>>0<e>>>0){v=aC;t=aZ;ak=aY}else{a2=e;a3=aZ;break}}}else{a2=x;a3=aF}aU=a2&1^1;aV=a3}if((aV|0)==0){C=aU;i=f;return C|0}a3=c[D>>2]|0;if((aV|0)!=(a3|0)){c[D>>2]=a3+(((((a3-24|0)+(-aV|0)|0)>>>0)/24>>>0^-1)*24&-1)}le(aV);C=aU;i=f;return C|0}return 0}function cz(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;g=i;h=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[h>>2];h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[h>>2];h=b|0;j=c[h>>2]|0;k=j;l=(c[d>>2]|0)-k|0;d=l>>2;m=j+(d<<2)|0;n=e|0;e=c[n>>2]|0;o=c[f>>2]|0;f=o-e|0;p=f>>2;if((f|0)<=0){q=m;r=a|0;c[r>>2]=q;i=g;return}f=b+8|0;s=b+4|0;b=c[s>>2]|0;t=c[f>>2]|0;u=b;if((p|0)>(t-u>>2|0)){v=(u-k>>2)+p|0;if(v>>>0>1073741823){i_(0)}w=t-k|0;if(w>>2>>>0>536870910){x=1073741823;y=m;z=l>>2;A=699}else{k=w>>1;w=k>>>0<v>>>0?v:k;k=m;v=l>>2;if((w|0)==0){B=0;C=0;D=k;E=v}else{x=w;y=k;z=v;A=699}}if((A|0)==699){B=la(x<<2)|0;C=x;D=y;E=z}z=B+(E<<2)|0;y=B+(C<<2)|0;if((e|0)==(o|0)){F=z}else{C=e;x=z;while(1){if((x|0)==0){G=0}else{c[x>>2]=c[C>>2];G=x}A=G+4|0;v=C+4|0;if((v|0)==(o|0)){F=A;break}else{C=v;x=A}}}x=c[h>>2]|0;C=D-x|0;G=B+(E-(C>>2)<<2)|0;lj(G|0,x|0,C);C=(c[s>>2]|0)-D|0;lj(F|0,m|0,C);D=c[h>>2]|0;c[h>>2]=G;c[s>>2]=F+(C>>2<<2);c[f>>2]=y;if((D|0)==0){q=z;r=a|0;c[r>>2]=q;i=g;return}le(D);q=z;r=a|0;c[r>>2]=q;i=g;return}else{z=u-m>>2;do{if((p|0)>(z|0)){u=e+(z<<2)|0;if((u|0)==(o|0)){H=z;I=o;J=b;break}else{K=u;L=b}while(1){if((L|0)==0){M=0}else{c[L>>2]=c[K>>2];M=c[s>>2]|0}D=M+4|0;c[s>>2]=D;y=K+4|0;if((y|0)==(o|0)){H=z;I=u;J=D;break}else{K=y;L=D}}}else{H=p;I=o;J=b}}while(0);if((H|0)<=0){q=m;r=a|0;c[r>>2]=q;i=g;return}H=J-(j+(p+d<<2)|0)|0;p=H>>2;o=j+(p+d<<2)|0;if(o>>>0<b>>>0){d=o;o=J;do{if((o|0)==0){N=0}else{c[o>>2]=c[d>>2];N=c[s>>2]|0}d=d+4|0;o=N+4|0;c[s>>2]=o;}while(d>>>0<b>>>0);O=c[n>>2]|0}else{O=e}e=m;lk(J+(-p<<2)|0,e|0,H|0);lk(e|0,O|0,I-O|0);q=m;r=a|0;c[r>>2]=q;i=g;return}}function cA(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0.0,g=0.0,i=0.0,j=0.0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;d=0;while(1){if((d|0)>=3){e=0;break}f=+h[b+(d<<3)>>3];g=+h[a+(d<<3)>>3];i=f-g;if(i>0.0){j=i}else{j=-0.0-i}if(j<1.0e-9){d=d+1|0}else{k=717;break}}if((k|0)==717){e=f<g}d=0;while(1){if((d|0)>=3){l=0;break}m=+h[c+(d<<3)>>3];n=+h[b+(d<<3)>>3];g=m-n;if(g>0.0){o=g}else{o=-0.0-g}if(o<1.0e-9){d=d+1|0}else{k=723;break}}if((k|0)==723){l=m<n}if(!e){if(!l){p=0;return p|0}e=b|0;n=+h[e>>3];d=b+8|0;m=+h[d>>3];q=b+16|0;o=+h[q>>3];r=c|0;h[e>>3]=+h[r>>3];s=c+8|0;h[d>>3]=+h[s>>3];t=c+16|0;h[q>>3]=+h[t>>3];h[r>>3]=n;h[s>>3]=m;h[t>>3]=o;t=0;while(1){if((t|0)>=3){p=1;k=745;break}u=+h[b+(t<<3)>>3];v=+h[a+(t<<3)>>3];o=u-v;if(o>0.0){w=o}else{w=-0.0-o}if(w<1.0e-9){t=t+1|0}else{break}}if((k|0)==745){return p|0}if(u>=v){p=1;return p|0}t=a|0;v=+h[t>>3];s=a+8|0;u=+h[s>>3];r=a+16|0;w=+h[r>>3];h[t>>3]=+h[e>>3];h[s>>3]=+h[d>>3];h[r>>3]=+h[q>>3];h[e>>3]=v;h[d>>3]=u;h[q>>3]=w;p=2;return p|0}q=a|0;w=+h[q>>3];d=a+8|0;u=+h[d>>3];e=a+16|0;v=+h[e>>3];if(l){l=c|0;h[q>>3]=+h[l>>3];a=c+8|0;h[d>>3]=+h[a>>3];r=c+16|0;h[e>>3]=+h[r>>3];h[l>>3]=w;h[a>>3]=u;h[r>>3]=v;p=1;return p|0}r=b|0;h[q>>3]=+h[r>>3];q=b+8|0;h[d>>3]=+h[q>>3];d=b+16|0;h[e>>3]=+h[d>>3];h[r>>3]=w;h[q>>3]=u;h[d>>3]=v;e=0;while(1){if((e|0)>=3){p=1;k=747;break}x=+h[c+(e<<3)>>3];y=+h[b+(e<<3)>>3];o=x-y;if(o>0.0){z=o}else{z=-0.0-o}if(z<1.0e-9){e=e+1|0}else{break}}if((k|0)==747){return p|0}if(x>=y){p=1;return p|0}k=c|0;h[r>>3]=+h[k>>3];r=c+8|0;h[q>>3]=+h[r>>3];q=c+16|0;h[d>>3]=+h[q>>3];h[k>>3]=w;h[r>>3]=u;h[q>>3]=v;p=2;return p|0}function cB(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0,A=0.0,B=0.0,C=0.0,D=0,E=0.0,F=0,G=0.0,H=0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0.0,O=0.0,P=0.0,Q=0,R=0,S=0.0,T=0.0,U=0.0,V=0,W=0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0.0,af=0.0,ag=0.0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0.0,ao=0.0,ap=0.0,aq=0,ar=0.0,as=0.0,at=0.0;d=a;a=b;L907:while(1){b=a;e=a-24|0;f=a-48|0;g=e|0;i=a-24+8|0;j=a-24+16|0;k=d;L909:while(1){l=k;m=b-l|0;n=(m|0)/24&-1;if((n|0)==2){o=0;p=754;break L907}else if((n|0)==3){p=760;break L907}else if((n|0)==4){p=761;break L907}else if((n|0)==5){p=762;break L907}else if((n|0)==0|(n|0)==1){p=850;break L907}if((m|0)<168){p=764;break L907}n=(m|0)/48&-1;q=k+(n*24&-1)|0;if((m|0)>23976){r=(m|0)/96&-1;s=cD(k,k+(r*24&-1)|0,q,k+((r+n|0)*24&-1)|0,e,0)|0}else{s=cA(k,q,e,0)|0}r=0;while(1){if((r|0)>=3){p=774;break}t=+h[k+(r<<3)>>3];u=+h[k+(n*24&-1)+(r<<3)>>3];v=t-u;if(v>0.0){w=v}else{w=-0.0-v}if(w<1.0e-9){r=r+1|0}else{p=773;break}}if((p|0)==773){p=0;if(t<u){x=e;y=s}else{p=774}}L925:do{if((p|0)==774){p=0;L927:do{if((k|0)!=(f|0)){r=e;m=f;while(1){z=0;while(1){if((z|0)>=3){break}A=+h[r-24+(z<<3)>>3];B=+h[k+(n*24&-1)+(z<<3)>>3];v=A-B;if(v>0.0){C=v}else{C=-0.0-v}if(C<1.0e-9){z=z+1|0}else{p=812;break}}if((p|0)==812){p=0;if(A<B){break}}z=m-24|0;if((k|0)==(z|0)){break L927}else{r=m;m=z}}z=k|0;v=+h[z>>3];D=k+8|0;E=+h[D>>3];F=k+16|0;G=+h[F>>3];H=m|0;h[z>>3]=+h[H>>3];z=r-24+8|0;h[D>>3]=+h[z>>3];D=r-24+16|0;h[F>>3]=+h[D>>3];h[H>>3]=v;h[z>>3]=E;h[D>>3]=G;x=m;y=s+1|0;break L925}}while(0);D=k+24|0;z=0;while(1){if((z|0)>=3){p=782;break}I=+h[k+(z<<3)>>3];J=+h[a-24+(z<<3)>>3];G=I-J;if(G>0.0){K=G}else{K=-0.0-G}if(K<1.0e-9){z=z+1|0}else{p=781;break}}if((p|0)==781){p=0;if(I<J){L=D}else{p=782}}if((p|0)==782){p=0;if((D|0)==(e|0)){p=848;break L907}else{M=D}while(1){z=0;while(1){if((z|0)>=3){break}N=+h[k+(z<<3)>>3];O=+h[M+(z<<3)>>3];G=N-O;if(G>0.0){P=G}else{P=-0.0-G}if(P<1.0e-9){z=z+1|0}else{p=788;break}}if((p|0)==788){p=0;if(N<O){break}}z=M+24|0;if((z|0)==(e|0)){p=846;break L907}else{M=z}}D=M|0;G=+h[D>>3];z=M+8|0;E=+h[z>>3];m=M+16|0;v=+h[m>>3];h[D>>3]=+h[g>>3];h[z>>3]=+h[i>>3];h[m>>3]=+h[j>>3];h[g>>3]=G;h[i>>3]=E;h[j>>3]=v;L=M+24|0}if((L|0)==(e|0)){p=847;break L907}else{Q=e;R=L}while(1){m=R;while(1){z=0;while(1){if((z|0)>=3){break}S=+h[k+(z<<3)>>3];T=+h[m+(z<<3)>>3];v=S-T;if(v>0.0){U=v}else{U=-0.0-v}if(U<1.0e-9){z=z+1|0}else{p=798;break}}if((p|0)==798){p=0;if(S<T){V=Q;break}}m=m+24|0}L977:while(1){W=V-24|0;z=0;while(1){if((z|0)>=3){break L977}X=+h[k+(z<<3)>>3];Y=+h[V-24+(z<<3)>>3];v=X-Y;if(v>0.0){Z=v}else{Z=-0.0-v}if(Z<1.0e-9){z=z+1|0}else{break}}if(X<Y){V=W}else{break}}if(m>>>0>=W>>>0){k=m;continue L909}z=m|0;v=+h[z>>3];D=m+8|0;E=+h[D>>3];r=m+16|0;G=+h[r>>3];H=W|0;h[z>>3]=+h[H>>3];z=V-24+8|0;h[D>>3]=+h[z>>3];D=V-24+16|0;h[r>>3]=+h[D>>3];h[H>>3]=v;h[z>>3]=E;h[D>>3]=G;Q=W;R=m+24|0}}}while(0);n=k+24|0;L989:do{if(n>>>0<x>>>0){D=x;z=n;H=y;r=q;while(1){F=z;L992:while(1){_=0;while(1){if((_|0)>=3){$=D;break L992}aa=+h[F+(_<<3)>>3];ab=+h[r+(_<<3)>>3];G=aa-ab;if(G>0.0){ac=G}else{ac=-0.0-G}if(ac<1.0e-9){_=_+1|0}else{break}}if(aa<ab){F=F+24|0}else{$=D;break}}L1001:while(1){ad=$-24|0;m=0;while(1){if((m|0)>=3){$=ad;continue L1001}ae=+h[$-24+(m<<3)>>3];af=+h[r+(m<<3)>>3];G=ae-af;if(G>0.0){ag=G}else{ag=-0.0-G}if(ag<1.0e-9){m=m+1|0}else{break}}if(ae<af){break}else{$=ad}}if(F>>>0>ad>>>0){ah=F;ai=H;aj=r;break L989}m=F|0;G=+h[m>>3];_=F+8|0;E=+h[_>>3];ak=F+16|0;v=+h[ak>>3];al=ad|0;h[m>>3]=+h[al>>3];m=$-24+8|0;h[_>>3]=+h[m>>3];_=$-24+16|0;h[ak>>3]=+h[_>>3];h[al>>3]=G;h[m>>3]=E;h[_>>3]=v;D=ad;z=F+24|0;H=H+1|0;r=(r|0)==(F|0)?ad:r}}else{ah=n;ai=y;aj=q}}while(0);L1013:do{if((ah|0)==(aj|0)){am=ai}else{q=0;while(1){if((q|0)>=3){am=ai;break L1013}an=+h[aj+(q<<3)>>3];ao=+h[ah+(q<<3)>>3];v=an-ao;if(v>0.0){ap=v}else{ap=-0.0-v}if(ap<1.0e-9){q=q+1|0}else{break}}if(an>=ao){am=ai;break}q=ah|0;v=+h[q>>3];n=ah+8|0;E=+h[n>>3];r=ah+16|0;G=+h[r>>3];H=aj|0;h[q>>3]=+h[H>>3];q=aj+8|0;h[n>>3]=+h[q>>3];n=aj+16|0;h[r>>3]=+h[n>>3];h[H>>3]=v;h[q>>3]=E;h[n>>3]=G;am=ai+1|0}}while(0);if((am|0)==0){aq=cF(k,ah,0)|0;n=ah+24|0;if(cF(n,a,0)|0){p=840;break}if(aq){k=n;continue}}n=ah;if((n-l|0)>=(b-n|0)){p=844;break}cB(k,ah,c);k=ah+24|0}if((p|0)==840){p=0;if(aq){p=849;break}else{d=k;a=ah;continue}}else if((p|0)==844){p=0;cB(ah+24|0,a,c);d=k;a=ah;continue}}if((p|0)==754){while(1){p=0;if((o|0)>=3){p=851;break}ar=+h[a-24+(o<<3)>>3];as=+h[k+(o<<3)>>3];ao=ar-as;if(ao>0.0){at=ao}else{at=-0.0-ao}if(at<1.0e-9){o=o+1|0;p=754}else{break}}if((p|0)==851){return}if(ar>=as){return}o=k|0;as=+h[o>>3];ah=k+8|0;ar=+h[ah>>3];d=k+16|0;at=+h[d>>3];c=a-24|0;h[o>>3]=+h[c>>3];h[ah>>3]=+h[i>>3];h[d>>3]=+h[j>>3];h[c>>3]=as;h[i>>3]=ar;h[j>>3]=at;return}else if((p|0)==760){cA(k,k+24|0,e,0);return}else if((p|0)==761){cC(k,k+24|0,k+48|0,e,0);return}else if((p|0)==762){cD(k,k+24|0,k+48|0,k+72|0,e,0);return}else if((p|0)==764){cE(k,a,0);return}else if((p|0)==846){return}else if((p|0)==847){return}else if((p|0)==848){return}else if((p|0)==849){return}else if((p|0)==850){return}}function cC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0;e=cA(a,b,c,0)|0;f=0;while(1){if((f|0)>=3){g=e;i=880;break}j=+h[d+(f<<3)>>3];k=+h[c+(f<<3)>>3];l=j-k;if(l>0.0){m=l}else{m=-0.0-l}if(m<1.0e-9){f=f+1|0}else{break}}if((i|0)==880){return g|0}if(j>=k){g=e;return g|0}f=c|0;k=+h[f>>3];n=c+8|0;j=+h[n>>3];o=c+16|0;m=+h[o>>3];p=d|0;h[f>>3]=+h[p>>3];q=d+8|0;h[n>>3]=+h[q>>3];r=d+16|0;h[o>>3]=+h[r>>3];h[p>>3]=k;h[q>>3]=j;h[r>>3]=m;r=e+1|0;q=0;while(1){if((q|0)>=3){g=r;i=881;break}s=+h[c+(q<<3)>>3];t=+h[b+(q<<3)>>3];m=s-t;if(m>0.0){u=m}else{u=-0.0-m}if(u<1.0e-9){q=q+1|0}else{break}}if((i|0)==881){return g|0}if(s>=t){g=r;return g|0}r=b|0;t=+h[r>>3];q=b+8|0;s=+h[q>>3];c=b+16|0;u=+h[c>>3];h[r>>3]=+h[f>>3];h[q>>3]=+h[n>>3];h[c>>3]=+h[o>>3];h[f>>3]=t;h[n>>3]=s;h[o>>3]=u;o=e+2|0;n=0;while(1){if((n|0)>=3){g=o;i=882;break}v=+h[b+(n<<3)>>3];w=+h[a+(n<<3)>>3];u=v-w;if(u>0.0){x=u}else{x=-0.0-u}if(x<1.0e-9){n=n+1|0}else{break}}if((i|0)==882){return g|0}if(v>=w){g=o;return g|0}o=a|0;w=+h[o>>3];i=a+8|0;v=+h[i>>3];n=a+16|0;x=+h[n>>3];h[o>>3]=+h[r>>3];h[i>>3]=+h[q>>3];h[n>>3]=+h[c>>3];h[r>>3]=w;h[q>>3]=v;h[c>>3]=x;g=e+3|0;return g|0}function cD(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;f=cC(a,b,c,d,0)|0;g=0;while(1){if((g|0)>=3){i=f;j=919;break}k=+h[e+(g<<3)>>3];l=+h[d+(g<<3)>>3];m=k-l;if(m>0.0){n=m}else{n=-0.0-m}if(n<1.0e-9){g=g+1|0}else{break}}if((j|0)==919){return i|0}if(k>=l){i=f;return i|0}g=d|0;l=+h[g>>3];o=d+8|0;k=+h[o>>3];p=d+16|0;n=+h[p>>3];q=e|0;h[g>>3]=+h[q>>3];r=e+8|0;h[o>>3]=+h[r>>3];s=e+16|0;h[p>>3]=+h[s>>3];h[q>>3]=l;h[r>>3]=k;h[s>>3]=n;s=f+1|0;r=0;while(1){if((r|0)>=3){i=s;j=914;break}t=+h[d+(r<<3)>>3];u=+h[c+(r<<3)>>3];n=t-u;if(n>0.0){v=n}else{v=-0.0-n}if(v<1.0e-9){r=r+1|0}else{break}}if((j|0)==914){return i|0}if(t>=u){i=s;return i|0}s=c|0;u=+h[s>>3];r=c+8|0;t=+h[r>>3];d=c+16|0;v=+h[d>>3];h[s>>3]=+h[g>>3];h[r>>3]=+h[o>>3];h[d>>3]=+h[p>>3];h[g>>3]=u;h[o>>3]=t;h[p>>3]=v;p=f+2|0;o=0;while(1){if((o|0)>=3){i=p;j=912;break}w=+h[c+(o<<3)>>3];x=+h[b+(o<<3)>>3];v=w-x;if(v>0.0){y=v}else{y=-0.0-v}if(y<1.0e-9){o=o+1|0}else{break}}if((j|0)==912){return i|0}if(w>=x){i=p;return i|0}p=b|0;x=+h[p>>3];o=b+8|0;w=+h[o>>3];c=b+16|0;y=+h[c>>3];h[p>>3]=+h[s>>3];h[o>>3]=+h[r>>3];h[c>>3]=+h[d>>3];h[s>>3]=x;h[r>>3]=w;h[d>>3]=y;d=f+3|0;r=0;while(1){if((r|0)>=3){i=d;j=918;break}z=+h[b+(r<<3)>>3];A=+h[a+(r<<3)>>3];y=z-A;if(y>0.0){B=y}else{B=-0.0-y}if(B<1.0e-9){r=r+1|0}else{break}}if((j|0)==918){return i|0}if(z>=A){i=d;return i|0}d=a|0;A=+h[d>>3];j=a+8|0;z=+h[j>>3];r=a+16|0;B=+h[r>>3];h[d>>3]=+h[p>>3];h[j>>3]=+h[o>>3];h[r>>3]=+h[c>>3];h[p>>3]=A;h[o>>3]=z;h[c>>3]=B;i=f+4|0;return i|0}function cE(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0;c=i;i=i+24|0;d=c|0;e=a+48|0;cA(a,a+24|0,e,0);f=a+72|0;if((f|0)==(b|0)){i=c;return}g=d|0;j=d+8|0;k=d+16|0;l=f;f=e;while(1){e=0;while(1){if((e|0)>=3){break}m=+h[l+(e<<3)>>3];n=+h[f+(e<<3)>>3];o=m-n;if(o>0.0){p=o}else{p=-0.0-o}if(p<1.0e-9){e=e+1|0}else{q=927;break}}do{if((q|0)==927){q=0;if(m>=n){break}h[g>>3]=+h[l>>3];h[j>>3]=+h[l+8>>3];h[k>>3]=+h[l+16>>3];e=l;r=f;L1161:while(1){s=r|0;h[e>>3]=+h[s>>3];t=r+8|0;h[e+8>>3]=+h[t>>3];u=r+16|0;h[e+16>>3]=+h[u>>3];if((r|0)==(a|0)){break}v=r-24|0;w=0;while(1){if((w|0)>=3){break L1161}x=+h[d+(w<<3)>>3];y=+h[r-24+(w<<3)>>3];o=x-y;if(o>0.0){z=o}else{z=-0.0-o}if(z<1.0e-9){w=w+1|0}else{break}}if(x<y){e=r;r=v}else{break}}h[s>>3]=+h[g>>3];h[t>>3]=+h[j>>3];h[u>>3]=+h[k>>3]}}while(0);r=l+24|0;if((r|0)==(b|0)){break}else{f=l;l=r}}i=c;return}function cF(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0,A=0,B=0,C=0,D=0.0,E=0.0,F=0.0;c=i;i=i+24|0;d=c|0;e=(b-a|0)/24&-1;if((e|0)==2){f=0;while(1){if((f|0)>=3){g=1;j=971;break}k=+h[b-24+(f<<3)>>3];l=+h[a+(f<<3)>>3];m=k-l;if(m>0.0){n=m}else{n=-0.0-m}if(n<1.0e-9){f=f+1|0}else{break}}if((j|0)==971){i=c;return g|0}if(k>=l){g=1;i=c;return g|0}f=a|0;l=+h[f>>3];o=a+8|0;k=+h[o>>3];p=a+16|0;n=+h[p>>3];q=b-24|0;h[f>>3]=+h[q>>3];f=b-24+8|0;h[o>>3]=+h[f>>3];o=b-24+16|0;h[p>>3]=+h[o>>3];h[q>>3]=l;h[f>>3]=k;h[o>>3]=n;g=1;i=c;return g|0}else if((e|0)==0|(e|0)==1){g=1;i=c;return g|0}else if((e|0)==3){cA(a,a+24|0,b-24|0,0);g=1;i=c;return g|0}else if((e|0)==4){cC(a,a+24|0,a+48|0,b-24|0,0);g=1;i=c;return g|0}else if((e|0)==5){cD(a,a+24|0,a+48|0,a+72|0,b-24|0,0);g=1;i=c;return g|0}else{e=a+48|0;cA(a,a+24|0,e,0);o=a+72|0;if((o|0)==(b|0)){g=1;i=c;return g|0}f=d|0;q=d+8|0;p=d+16|0;r=e;e=0;s=o;L1200:while(1){o=0;while(1){if((o|0)>=3){t=e;break}u=+h[s+(o<<3)>>3];v=+h[r+(o<<3)>>3];n=u-v;if(n>0.0){w=n}else{w=-0.0-n}if(w<1.0e-9){o=o+1|0}else{j=958;break}}do{if((j|0)==958){j=0;if(u>=v){t=e;break}h[f>>3]=+h[s>>3];h[q>>3]=+h[s+8>>3];h[p>>3]=+h[s+16>>3];o=r;x=s;L1211:while(1){y=o|0;h[x>>3]=+h[y>>3];z=o+8|0;h[x+8>>3]=+h[z>>3];A=o+16|0;h[x+16>>3]=+h[A>>3];if((o|0)==(a|0)){break}B=o-24|0;C=0;while(1){if((C|0)>=3){break L1211}D=+h[d+(C<<3)>>3];E=+h[o-24+(C<<3)>>3];n=D-E;if(n>0.0){F=n}else{F=-0.0-n}if(F<1.0e-9){C=C+1|0}else{break}}if(D<E){x=o;o=B}else{break}}h[y>>3]=+h[f>>3];h[z>>3]=+h[q>>3];h[A>>3]=+h[p>>3];o=e+1|0;if((o|0)==8){break L1200}else{t=o}}}while(0);o=s+24|0;if((o|0)==(b|0)){g=1;j=973;break}else{r=s;e=t;s=o}}if((j|0)==973){i=c;return g|0}g=(s+24|0)==(b|0);i=c;return g|0}return 0}function cG(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=((c[d>>2]|0)-f|0)/24&-1;i=g+1|0;if(i>>>0>178956970){i_(0)}j=a+8|0;a=((c[j>>2]|0)-f|0)/24&-1;if(a>>>0>89478484){k=178956970;l=985}else{f=a<<1;a=f>>>0<i>>>0?i:f;if((a|0)==0){m=0;n=0}else{k=a;l=985}}if((l|0)==985){m=la(k*24&-1)|0;n=k}k=m+(g*24&-1)|0;l=m+(n*24&-1)|0;if((k|0)!=0){h[k>>3]=+h[b>>3];h[m+(g*24&-1)+8>>3]=+h[b+8>>3];h[m+(g*24&-1)+16>>3]=+h[b+16>>3]}b=m+(i*24&-1)|0;i=c[e>>2]|0;n=c[d>>2]|0;if((n|0)==(i|0)){o=i;p=k}else{a=(g-1|0)-((((n-24|0)+(-i|0)|0)>>>0)/24>>>0)|0;g=n;n=k;while(1){k=n-24|0;f=g-24|0;if((k|0)!=0){h[k>>3]=+h[f>>3];h[n-24+8>>3]=+h[g-24+8>>3];h[n-24+16>>3]=+h[g-24+16>>3]}if((f|0)==(i|0)){break}else{g=f;n=k}}o=c[e>>2]|0;p=m+(a*24&-1)|0}c[e>>2]=p;c[d>>2]=b;c[j>>2]=l;if((o|0)==0){return}le(o);return}function cH(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)==0){by(2832,1169,6864,2824)}d=c[b+4>>2]|0;if((d|0)<=-1){by(2832,1170,6864,1760)}if((d|0)<=0){e=b;le(e);return}d=b|0;if((c[d>>2]|0)>0){f=0}else{e=b;le(e);return}do{cH(a,c[b+8+(f*56&-1)+48>>2]|0);f=f+1|0;}while((f|0)<(c[d>>2]|0));e=b;le(e);return}function cI(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=((c[d>>2]|0)-f|0)/12&-1;h=g+1|0;if(h>>>0>357913941){i_(0)}i=a+8|0;a=((c[i>>2]|0)-f|0)/12&-1;if(a>>>0>178956969){j=357913941;k=1014}else{f=a<<1;a=f>>>0<h>>>0?h:f;if((a|0)==0){l=0;m=0}else{j=a;k=1014}}if((k|0)==1014){l=la(j*12&-1)|0;m=j}j=l+(g*12&-1)|0;g=l+(m*12&-1)|0;if((j|0)!=0){cJ(j,b)}b=l+(h*12&-1)|0;h=c[e>>2]|0;l=c[d>>2]|0;do{if((l|0)==(h|0)){c[e>>2]=j;c[d>>2]=b;c[i>>2]=g;n=h}else{m=l;k=j;do{k=k-12|0;m=m-12|0;if((k|0)!=0){cJ(k,m)}}while((m|0)!=(h|0));m=c[e>>2]|0;a=c[d>>2]|0;c[e>>2]=k;c[d>>2]=b;c[i>>2]=g;if((m|0)==(a|0)){n=m;break}else{o=a}while(1){a=o-12|0;f=c[a>>2]|0;p=f;if((f|0)!=0){q=o-12+4|0;r=c[q>>2]|0;if((f|0)!=(r|0)){c[q>>2]=r+((((r-4|0)+(-p|0)|0)>>>2^-1)<<2)}le(f)}if((m|0)==(a|0)){n=m;break}else{o=a}}}}while(0);if((n|0)==0){return}le(n);return}function cJ(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a|0;c[d>>2]=0;e=a+4|0;c[e>>2]=0;f=a+8|0;c[f>>2]=0;a=b+4|0;g=b|0;b=(c[a>>2]|0)-(c[g>>2]|0)|0;h=b>>2;if((h|0)==0){return}if(h>>>0>1073741823){i_(0)}i=la(b)|0;c[e>>2]=i;c[d>>2]=i;c[f>>2]=i+(h<<2);h=c[g>>2]|0;g=c[a>>2]|0;if((h|0)==(g|0)){return}else{j=h;k=i}do{if((k|0)==0){l=0}else{c[k>>2]=c[j>>2];l=c[e>>2]|0}k=l+4|0;c[e>>2]=k;j=j+4|0;}while((j|0)!=(g|0));return}function cK(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;if((b|0)==0|(e|0)==0){by(2832,533,7680,1408);return 0}h=c[e>>2]|0;if((h|0)==0){by(2832,534,7680,1104);return 0}c[g>>2]=0;if(cL(a,b,d,h,g)|0){j=1;i=f;return j|0}h=c[g>>2]|0;L1327:do{if((h|0)!=0){d=h;while(1){b=c[d+4>>2]|0;k=b|0;if((c[k>>2]|0)>0){l=b+4|0;m=0;do{cM(a,b+8+(m*56&-1)|0,b+8+(m*56&-1)+52|0,e,c[l>>2]|0);m=m+1|0;}while((m|0)<(c[k>>2]|0));n=c[g>>2]|0}else{n=d}c[g>>2]=c[n>>2];k=c[n+4>>2]|0;if((k|0)==0){break}le(k);if((n|0)!=0){le(n)}d=c[g>>2]|0;if((d|0)==0){break L1327}}by(2832,1184,4184,2824);return 0}}while(0);g=c[e>>2]|0;if((c[g>>2]|0)!=1){j=0;i=f;return j|0}if((c[g+4>>2]|0)<=0){j=0;i=f;return j|0}n=c[g+56>>2]|0;if((n|0)==0){by(2832,567,7680,1088);return 0}if((g|0)==0){by(2832,1184,4184,2824);return 0}le(g);c[e>>2]=n;j=0;i=f;return j|0}function cL(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+48|0;j=g|0;if((b|0)==0|(e|0)==0|(f|0)==0){by(2832,485,6240,1576);return 0}k=c[e+4>>2]|0;if((k|0)<=-1){by(2832,486,6240,1760);return 0}l=e|0;m=c[l>>2]|0;if((k|0)<=0){k=0;while(1){if((k|0)>=(m|0)){n=1;o=1119;break}if((c[e+8+(k*56&-1)+48>>2]|0)==(c[d>>2]|0)){break}else{k=k+1|0}}if((o|0)==1119){i=g;return n|0}if(k>>>0>=8){by(2832,617,5736,1520);return 0}if((m|0)<=0){by(2832,618,5736,1496);return 0}p=e+8+(k*56&-1)|0;k=e+8+((m-1|0)*56&-1)|0;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];c[p+8>>2]=c[k+8>>2];c[p+12>>2]=c[k+12>>2];c[p+16>>2]=c[k+16>>2];c[p+20>>2]=c[k+20>>2];c[p+24>>2]=c[k+24>>2];c[p+28>>2]=c[k+28>>2];c[p+32>>2]=c[k+32>>2];c[p+36>>2]=c[k+36>>2];c[p+40>>2]=c[k+40>>2];c[p+44>>2]=c[k+44>>2];c[p+48>>2]=c[k+48>>2];c[p+52>>2]=c[k+52>>2];c[l>>2]=(c[l>>2]|0)-1;n=0;i=g;return n|0}if((m|0)>0){q=0;r=m}else{n=1;i=g;return n|0}while(1){s=e+8+(q*56&-1)|0;if((s|0)==0){o=1095;break}else{t=0}while(1){if((t|0)>=3){o=1099;break}if(+h[b+(t<<3)>>3]>+h[e+8+(q*56&-1)+24+(t<<3)>>3]){u=r;break}if(+h[e+8+(q*56&-1)+(t<<3)>>3]>+h[b+24+(t<<3)>>3]){u=r;break}else{t=t+1|0}}if((o|0)==1099){o=0;v=e+8+(q*56&-1)+48|0;if(!(cL(a,b,d,c[v>>2]|0,f)|0)){o=1101;break}u=c[l>>2]|0}m=q+1|0;if((m|0)<(u|0)){q=m;r=u}else{n=1;o=1118;break}}if((o|0)==1118){i=g;return n|0}else if((o|0)==1095){by(2832,466,4672,1816);return 0}else if((o|0)==1101){o=c[v>>2]|0;if((c[o>>2]|0)>3){cO(j,a,o);a=s;v=j;c[a>>2]=c[v>>2];c[a+4>>2]=c[v+4>>2];c[a+8>>2]=c[v+8>>2];c[a+12>>2]=c[v+12>>2];c[a+16>>2]=c[v+16>>2];c[a+20>>2]=c[v+20>>2];c[a+24>>2]=c[v+24>>2];c[a+28>>2]=c[v+28>>2];c[a+32>>2]=c[v+32>>2];c[a+36>>2]=c[v+36>>2];c[a+40>>2]=c[v+40>>2];c[a+44>>2]=c[v+44>>2];n=0;i=g;return n|0}v=la(8)|0;c[v+4>>2]=o;c[v>>2]=c[f>>2];c[f>>2]=v;if(q>>>0>=8){by(2832,617,5736,1520);return 0}q=c[l>>2]|0;if((q|0)<=0){by(2832,618,5736,1496);return 0}v=s;s=e+8+((q-1|0)*56&-1)|0;c[v>>2]=c[s>>2];c[v+4>>2]=c[s+4>>2];c[v+8>>2]=c[s+8>>2];c[v+12>>2]=c[s+12>>2];c[v+16>>2]=c[s+16>>2];c[v+20>>2]=c[s+20>>2];c[v+24>>2]=c[s+24>>2];c[v+28>>2]=c[s+28>>2];c[v+32>>2]=c[s+32>>2];c[v+36>>2]=c[s+36>>2];c[v+40>>2]=c[s+40>>2];c[v+44>>2]=c[s+44>>2];c[v+48>>2]=c[s+48>>2];c[v+52>>2]=c[s+52>>2];c[l>>2]=(c[l>>2]|0)-1;n=0;i=g;return n|0}return 0}function cM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+104|0;h=g|0;j=g+8|0;k=g+56|0;if((b|0)==0|(e|0)==0){by(2832,401,8216,1408);return 0}if((f|0)<=-1){by(2832,402,8216,896);return 0}l=c[e>>2]|0;if((c[l+4>>2]|0)<(f|0)){by(2832,402,8216,896);return 0}if(!(cN(a,b,d,l,h,f)|0)){m=0;i=g;return m|0}f=la(456)|0;l=f;c[l>>2]=0;d=f+4|0;c[d>>2]=-1;b=c[e>>2]|0;c[d>>2]=(c[b+4>>2]|0)+1;cO(j,a,b);b=j;if((f|0)==0){by(2832,595,3896,2824);return 0}j=c[e>>2]|0;d=f+8|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];c[d+16>>2]=c[b+16>>2];c[d+20>>2]=c[b+20>>2];c[d+24>>2]=c[b+24>>2];c[d+28>>2]=c[b+28>>2];c[d+32>>2]=c[b+32>>2];c[d+36>>2]=c[b+36>>2];c[d+40>>2]=c[b+40>>2];c[d+44>>2]=c[b+44>>2];c[f+56>>2]=j;cO(k,a,c[h>>2]|0);a=k;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];c[b+16>>2]=c[a+16>>2];c[b+20>>2]=c[a+20>>2];c[b+24>>2]=c[a+24>>2];c[b+28>>2]=c[a+28>>2];c[b+32>>2]=c[a+32>>2];c[b+36>>2]=c[a+36>>2];c[b+40>>2]=c[a+40>>2];c[b+44>>2]=c[a+44>>2];a=c[h>>2]|0;h=f+64|0;c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];c[h+12>>2]=c[b+12>>2];c[h+16>>2]=c[b+16>>2];c[h+20>>2]=c[b+20>>2];c[h+24>>2]=c[b+24>>2];c[h+28>>2]=c[b+28>>2];c[h+32>>2]=c[b+32>>2];c[h+36>>2]=c[b+36>>2];c[h+40>>2]=c[b+40>>2];c[h+44>>2]=c[b+44>>2];c[f+112>>2]=a;c[l>>2]=2;c[e>>2]=f;m=1;i=g;return m|0}function cN(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0.0,C=0.0,D=0,E=0.0,F=0.0,G=0.0;j=i;i=i+160|0;k=j|0;l=j+56|0;m=j+64|0;n=j+112|0;if((b|0)==0|(e|0)==0|(f|0)==0){by(2832,353,6552,1728);return 0}if((g|0)<=-1){by(2832,354,6552,1680);return 0}o=c[e+4>>2]|0;if((o|0)<(g|0)){by(2832,354,6552,1680);return 0}if((o|0)<=(g|0)){if((o|0)!=(g|0)){by(2832,388,6552,1640);return 0}o=k;p=b;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];c[o+16>>2]=c[p+16>>2];c[o+20>>2]=c[p+20>>2];c[o+24>>2]=c[p+24>>2];c[o+28>>2]=c[p+28>>2];c[o+32>>2]=c[p+32>>2];c[o+36>>2]=c[p+36>>2];c[o+40>>2]=c[p+40>>2];c[o+44>>2]=c[p+44>>2];c[k+52>>2]=c[d>>2];p=e|0;q=c[p>>2]|0;if((q|0)<8){r=e+8+(q*56&-1)|0;c[r>>2]=c[o>>2];c[r+4>>2]=c[o+4>>2];c[r+8>>2]=c[o+8>>2];c[r+12>>2]=c[o+12>>2];c[r+16>>2]=c[o+16>>2];c[r+20>>2]=c[o+20>>2];c[r+24>>2]=c[o+24>>2];c[r+28>>2]=c[o+28>>2];c[r+32>>2]=c[o+32>>2];c[r+36>>2]=c[o+36>>2];c[r+40>>2]=c[o+40>>2];c[r+44>>2]=c[o+44>>2];c[r+48>>2]=c[o+48>>2];c[r+52>>2]=c[o+52>>2];c[p>>2]=(c[p>>2]|0)+1;s=0;i=j;return s|0}else{cP(a,e,k,f);s=1;i=j;return s|0}}p=cV(a,b,e)|0;o=e+8+(p*56&-1)+48|0;r=e+8+(p*56&-1)|0;if(!(cN(a,b,d,c[o>>2]|0,l,g)|0)){if((r|0)==0){by(2832,1055,7400,1816);return 0}t=+h[b>>3];g=r|0;u=+h[g>>3];v=+h[b+24>>3];d=e+8+(p*56&-1)+24|0;w=+h[d>>3];x=+h[b+8>>3];q=e+8+(p*56&-1)+8|0;y=+h[q>>3];z=+h[b+32>>3];A=e+8+(p*56&-1)+32|0;B=+h[A>>3];C=+h[b+16>>3];D=e+8+(p*56&-1)+16|0;E=+h[D>>3];F=+h[b+40>>3];b=e+8+(p*56&-1)+40|0;G=+h[b>>3];h[g>>3]=t<u?t:u;h[q>>3]=x<y?x:y;h[D>>3]=C<E?C:E;h[d>>3]=v>w?v:w;h[A>>3]=z>B?z:B;h[b>>3]=F>G?F:G;s=0;i=j;return s|0}cO(m,a,c[o>>2]|0);o=r;r=m;c[o>>2]=c[r>>2];c[o+4>>2]=c[r+4>>2];c[o+8>>2]=c[r+8>>2];c[o+12>>2]=c[r+12>>2];c[o+16>>2]=c[r+16>>2];c[o+20>>2]=c[r+20>>2];c[o+24>>2]=c[r+24>>2];c[o+28>>2]=c[r+28>>2];c[o+32>>2]=c[r+32>>2];c[o+36>>2]=c[r+36>>2];c[o+40>>2]=c[r+40>>2];c[o+44>>2]=c[r+44>>2];r=c[l>>2]|0;c[k+48>>2]=r;cO(n,a,r);r=k;l=n;c[r>>2]=c[l>>2];c[r+4>>2]=c[l+4>>2];c[r+8>>2]=c[l+8>>2];c[r+12>>2]=c[l+12>>2];c[r+16>>2]=c[l+16>>2];c[r+20>>2]=c[l+20>>2];c[r+24>>2]=c[l+24>>2];c[r+28>>2]=c[l+28>>2];c[r+32>>2]=c[l+32>>2];c[r+36>>2]=c[l+36>>2];c[r+40>>2]=c[l+40>>2];c[r+44>>2]=c[l+44>>2];l=e|0;n=c[l>>2]|0;if((n|0)<8){o=e+8+(n*56&-1)|0;c[o>>2]=c[r>>2];c[o+4>>2]=c[r+4>>2];c[o+8>>2]=c[r+8>>2];c[o+12>>2]=c[r+12>>2];c[o+16>>2]=c[r+16>>2];c[o+20>>2]=c[r+20>>2];c[o+24>>2]=c[r+24>>2];c[o+28>>2]=c[r+28>>2];c[o+32>>2]=c[r+32>>2];c[o+36>>2]=c[r+36>>2];c[o+40>>2]=c[r+40>>2];c[o+44>>2]=c[r+44>>2];c[o+48>>2]=c[r+48>>2];c[o+52>>2]=c[r+52>>2];c[l>>2]=(c[l>>2]|0)+1;s=0;i=j;return s|0}else{cP(a,e,k,f);s=1;i=j;return s|0}return 0}function cO(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0;if((d|0)==0){by(2832,1081,5224,2824)}b=a;ln(b|0,0,48);e=d|0;if((c[e>>2]|0)<=0){return}f=(a|0)==0;g=a|0;i=a+24|0;j=a+8|0;k=a+32|0;l=a+16|0;m=a+40|0;a=0;n=0;while(1){o=d+8+(n*56&-1)|0;if(a){if(f|(o|0)==0){p=1170;break}q=+h[g>>3];r=+h[o>>3];s=+h[i>>3];t=+h[d+8+(n*56&-1)+24>>3];u=+h[j>>3];v=+h[d+8+(n*56&-1)+8>>3];w=+h[k>>3];x=+h[d+8+(n*56&-1)+32>>3];y=+h[l>>3];z=+h[d+8+(n*56&-1)+16>>3];A=+h[m>>3];B=+h[d+8+(n*56&-1)+40>>3];h[g>>3]=q<r?q:r;h[j>>3]=u<v?u:v;h[l>>3]=y<z?y:z;h[i>>3]=s>t?s:t;h[k>>3]=w>x?w:x;h[m>>3]=A>B?A:B}else{C=o;c[b>>2]=c[C>>2];c[b+4>>2]=c[C+4>>2];c[b+8>>2]=c[C+8>>2];c[b+12>>2]=c[C+12>>2];c[b+16>>2]=c[C+16>>2];c[b+20>>2]=c[C+20>>2];c[b+24>>2]=c[C+24>>2];c[b+28>>2]=c[C+28>>2];c[b+32>>2]=c[C+32>>2];c[b+36>>2]=c[C+36>>2];c[b+40>>2]=c[C+40>>2];c[b+44>>2]=c[C+44>>2]}C=n+1|0;if((C|0)<(c[e>>2]|0)){a=1;n=C}else{p=1174;break}}if((p|0)==1170){by(2832,1055,7400,1816)}else if((p|0)==1174){return}}function cP(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+768|0;g=f|0;if((b|0)==0){by(2832,632,3320,2824)}if((d|0)==0){by(2832,633,3320,608)}h=b+4|0;j=c[h>>2]|0;cQ(a,b,d,g);cR(a,g,4);d=la(456)|0;c[d>>2]=0;c[d+4>>2]=-1;c[e>>2]=d;c[h>>2]=j;c[(c[e>>2]|0)+4>>2]=j;cS(a,b,c[e>>2]|0,g);if(((c[c[e>>2]>>2]|0)+(c[b>>2]|0)|0)==(c[g+36>>2]|0)){i=f;return}else{by(2832,652,3320,264)}}function cQ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0;if((b|0)==0){by(2832,882,7104,2824)}if((d|0)==0){by(2832,883,7104,608)}f=b|0;if((c[f>>2]|0)!=8){by(2832,885,7104,1784)}g=e+200|0;i=b+8|0;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];c[g+8>>2]=c[i+8>>2];c[g+12>>2]=c[i+12>>2];c[g+16>>2]=c[i+16>>2];c[g+20>>2]=c[i+20>>2];c[g+24>>2]=c[i+24>>2];c[g+28>>2]=c[i+28>>2];c[g+32>>2]=c[i+32>>2];c[g+36>>2]=c[i+36>>2];c[g+40>>2]=c[i+40>>2];c[g+44>>2]=c[i+44>>2];c[g+48>>2]=c[i+48>>2];c[g+52>>2]=c[i+52>>2];i=e+256|0;g=b+64|0;c[i>>2]=c[g>>2];c[i+4>>2]=c[g+4>>2];c[i+8>>2]=c[g+8>>2];c[i+12>>2]=c[g+12>>2];c[i+16>>2]=c[g+16>>2];c[i+20>>2]=c[g+20>>2];c[i+24>>2]=c[g+24>>2];c[i+28>>2]=c[g+28>>2];c[i+32>>2]=c[g+32>>2];c[i+36>>2]=c[g+36>>2];c[i+40>>2]=c[g+40>>2];c[i+44>>2]=c[g+44>>2];c[i+48>>2]=c[g+48>>2];c[i+52>>2]=c[g+52>>2];g=e+312|0;i=b+120|0;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];c[g+8>>2]=c[i+8>>2];c[g+12>>2]=c[i+12>>2];c[g+16>>2]=c[i+16>>2];c[g+20>>2]=c[i+20>>2];c[g+24>>2]=c[i+24>>2];c[g+28>>2]=c[i+28>>2];c[g+32>>2]=c[i+32>>2];c[g+36>>2]=c[i+36>>2];c[g+40>>2]=c[i+40>>2];c[g+44>>2]=c[i+44>>2];c[g+48>>2]=c[i+48>>2];c[g+52>>2]=c[i+52>>2];i=e+368|0;g=b+176|0;c[i>>2]=c[g>>2];c[i+4>>2]=c[g+4>>2];c[i+8>>2]=c[g+8>>2];c[i+12>>2]=c[g+12>>2];c[i+16>>2]=c[g+16>>2];c[i+20>>2]=c[g+20>>2];c[i+24>>2]=c[g+24>>2];c[i+28>>2]=c[g+28>>2];c[i+32>>2]=c[g+32>>2];c[i+36>>2]=c[g+36>>2];c[i+40>>2]=c[g+40>>2];c[i+44>>2]=c[g+44>>2];c[i+48>>2]=c[g+48>>2];c[i+52>>2]=c[g+52>>2];g=e+424|0;i=b+232|0;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];c[g+8>>2]=c[i+8>>2];c[g+12>>2]=c[i+12>>2];c[g+16>>2]=c[i+16>>2];c[g+20>>2]=c[i+20>>2];c[g+24>>2]=c[i+24>>2];c[g+28>>2]=c[i+28>>2];c[g+32>>2]=c[i+32>>2];c[g+36>>2]=c[i+36>>2];c[g+40>>2]=c[i+40>>2];c[g+44>>2]=c[i+44>>2];c[g+48>>2]=c[i+48>>2];c[g+52>>2]=c[i+52>>2];i=e+480|0;g=b+288|0;c[i>>2]=c[g>>2];c[i+4>>2]=c[g+4>>2];c[i+8>>2]=c[g+8>>2];c[i+12>>2]=c[g+12>>2];c[i+16>>2]=c[g+16>>2];c[i+20>>2]=c[g+20>>2];c[i+24>>2]=c[g+24>>2];c[i+28>>2]=c[g+28>>2];c[i+32>>2]=c[g+32>>2];c[i+36>>2]=c[g+36>>2];c[i+40>>2]=c[g+40>>2];c[i+44>>2]=c[g+44>>2];c[i+48>>2]=c[g+48>>2];c[i+52>>2]=c[g+52>>2];g=e+536|0;i=b+344|0;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];c[g+8>>2]=c[i+8>>2];c[g+12>>2]=c[i+12>>2];c[g+16>>2]=c[i+16>>2];c[g+20>>2]=c[i+20>>2];c[g+24>>2]=c[i+24>>2];c[g+28>>2]=c[i+28>>2];c[g+32>>2]=c[i+32>>2];c[g+36>>2]=c[i+36>>2];c[g+40>>2]=c[i+40>>2];c[g+44>>2]=c[i+44>>2];c[g+48>>2]=c[i+48>>2];c[g+52>>2]=c[i+52>>2];i=e+592|0;g=b+400|0;c[i>>2]=c[g>>2];c[i+4>>2]=c[g+4>>2];c[i+8>>2]=c[g+8>>2];c[i+12>>2]=c[g+12>>2];c[i+16>>2]=c[g+16>>2];c[i+20>>2]=c[g+20>>2];c[i+24>>2]=c[g+24>>2];c[i+28>>2]=c[g+28>>2];c[i+32>>2]=c[g+32>>2];c[i+36>>2]=c[g+36>>2];c[i+40>>2]=c[g+40>>2];c[i+44>>2]=c[g+44>>2];c[i+48>>2]=c[g+48>>2];c[i+52>>2]=c[g+52>>2];g=e+648|0;i=d;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];c[g+8>>2]=c[i+8>>2];c[g+12>>2]=c[i+12>>2];c[g+16>>2]=c[i+16>>2];c[g+20>>2]=c[i+20>>2];c[g+24>>2]=c[i+24>>2];c[g+28>>2]=c[i+28>>2];c[g+32>>2]=c[i+32>>2];c[g+36>>2]=c[i+36>>2];c[g+40>>2]=c[i+40>>2];c[g+44>>2]=c[i+44>>2];c[g+48>>2]=c[i+48>>2];c[g+52>>2]=c[i+52>>2];c[e+704>>2]=9;i=e+712|0;g=i;d=e+200|0;c[g>>2]=c[d>>2];c[g+4>>2]=c[d+4>>2];c[g+8>>2]=c[d+8>>2];c[g+12>>2]=c[d+12>>2];c[g+16>>2]=c[d+16>>2];c[g+20>>2]=c[d+20>>2];c[g+24>>2]=c[d+24>>2];c[g+28>>2]=c[d+28>>2];c[g+32>>2]=c[d+32>>2];c[g+36>>2]=c[d+36>>2];c[g+40>>2]=c[d+40>>2];c[g+44>>2]=c[d+44>>2];d=(i|0)==0;g=i|0;i=e+736|0;j=e+720|0;k=e+744|0;l=e+728|0;m=e+752|0;n=e+712|0;o=1;while(1){p=e+200+(o*56&-1)|0;if(d|(p|0)==0){q=1191;break}r=+h[g>>3];s=+h[p>>3];t=r<s?r:s;s=+h[i>>3];r=+h[e+200+(o*56&-1)+24>>3];u=s>r?s:r;r=+h[j>>3];s=+h[e+200+(o*56&-1)+8>>3];v=r<s?r:s;s=+h[k>>3];r=+h[e+200+(o*56&-1)+32>>3];w=s>r?s:r;r=+h[l>>3];s=+h[e+200+(o*56&-1)+16>>3];x=r<s?r:s;s=+h[m>>3];r=+h[e+200+(o*56&-1)+40>>3];y=s>r?s:r;h[n>>3]=t;h[j>>3]=v;h[l>>3]=x;h[i>>3]=u;h[k>>3]=w;h[m>>3]=y;p=o+1|0;if((p|0)<9){o=p}else{q=1193;break}}if((q|0)==1193){r=(u-t)*.5;t=(w-v)*.5;v=(y-x)*.5;x=+W(+(r*r+0.0+t*t+v*v));h[e+760>>3]=+h[a+8>>3]*x*x*x;c[f>>2]=0;c[b+4>>2]=-1;return}else if((q|0)==1191){by(2832,1055,7400,1816)}}function cR(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0,ak=0.0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0;if((b|0)==0){by(2832,757,5984,2352)}e=c[b+704>>2]|0;f=b+84|0;c[f>>2]=0;g=b+80|0;c[g>>2]=0;i=b+184|0;j=b+36|0;ln(i|0,0,16);c[j>>2]=e;k=b+40|0;c[k>>2]=d;if((e|0)>0){d=0;do{c[b+44+(d<<2)>>2]=0;c[b+(d<<2)>>2]=-1;d=d+1|0;}while((d|0)<(e|0))}cT(a,b);e=c[g>>2]|0;d=c[f>>2]|0;l=c[j>>2]|0;L1505:do{if((d+e|0)<(l|0)){m=b+88|0;n=(m|0)==0;o=m|0;m=b+112|0;p=b+96|0;q=b+120|0;r=b+104|0;s=b+128|0;t=b+136|0;u=(t|0)==0;v=t|0;t=b+160|0;w=b+144|0;x=b+168|0;y=b+152|0;z=b+176|0;A=a+8|0;B=b+192|0;C=0;D=0;E=e;F=d;G=l;L1507:while(1){H=G-(c[k>>2]|0)|0;if(!((E|0)<(H|0)&(F|0)<(H|0))){I=E;J=F;K=G;break L1505}if((G|0)>0){H=C;L=0;M=D;N=-1.0;while(1){do{if((c[b+44+(L<<2)>>2]|0)==0){O=b+200+(L*56&-1)|0;if((O|0)==0|n){P=1204;break L1507}Q=+h[O>>3];R=+h[o>>3];S=+h[b+200+(L*56&-1)+24>>3];T=+h[m>>3];U=+h[b+200+(L*56&-1)+8>>3];V=+h[p>>3];X=+h[b+200+(L*56&-1)+32>>3];Y=+h[q>>3];Z=+h[b+200+(L*56&-1)+16>>3];_=+h[r>>3];$=+h[b+200+(L*56&-1)+40>>3];aa=+h[s>>3];if(u){P=1206;break L1507}ab=+h[v>>3];ac=+h[t>>3];ad=+h[w>>3];ae=+h[x>>3];af=+h[y>>3];ag=+h[z>>3];ah=((S>T?S:T)-(Q<R?Q:R))*.5;R=((X>Y?X:Y)-(U<V?U:V))*.5;V=(($>aa?$:aa)-(Z<_?Z:_))*.5;_=+W(+(ah*ah+0.0+R*R+V*V));V=+h[A>>3];R=V*_*_*_- +h[i>>3];_=((S>ac?S:ac)-(Q<ab?Q:ab))*.5;ab=((X>ae?X:ae)-(U<ad?U:ad))*.5;ad=(($>ag?$:ag)-(Z<af?Z:af))*.5;af=+W(+(_*_+0.0+ab*ab+ad*ad));ad=V*af*af*af- +h[B>>3]-R;if(ad<0.0){ai=-0.0-ad;aj=1}else{ai=ad;aj=0}if(ai>N){ak=ai;al=L;am=aj;break}if(ai!=N){ak=N;al=M;am=H;break}O=(c[b+80+(aj<<2)>>2]|0)<(c[b+80+(H<<2)>>2]|0);ak=N;al=O?L:M;am=O?aj:H}else{ak=N;al=M;am=H}}while(0);O=L+1|0;if((O|0)<(G|0)){H=am;L=O;M=al;N=ak}else{an=am;ao=al;break}}}else{an=C;ao=D}cU(a,ao,an,b);M=c[g>>2]|0;L=c[f>>2]|0;H=c[j>>2]|0;if((L+M|0)<(H|0)){C=an;D=ao;E=M;F=L;G=H}else{I=M;J=L;K=H;break L1505}}if((P|0)==1204){by(2832,1055,7400,1816)}else if((P|0)==1206){by(2832,1055,7400,1816)}}else{I=e;J=d;K=l}}while(0);do{if((J+I|0)<(K|0)){l=(I|0)>=(K-(c[k>>2]|0)|0)&1;if((K|0)>0){ap=0;aq=K}else{ar=I;as=J;at=K;break}while(1){if((c[b+44+(ap<<2)>>2]|0)==0){cU(a,ap,l,b);au=c[j>>2]|0}else{au=aq}d=ap+1|0;if((d|0)<(au|0)){ap=d;aq=au}else{break}}ar=c[g>>2]|0;as=c[f>>2]|0;at=au}else{ar=I;as=J;at=K}}while(0);if((as+ar|0)!=(at|0)){by(2832,826,5984,2048)}at=c[k>>2]|0;if((ar|0)<(at|0)|(as|0)<(at|0)){by(2832,828,5984,1928)}else{return}}function cS(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==0){by(2832,658,3608,2816)}if((d|0)==0){by(2832,659,3608,2632)}if((e|0)==0){by(2832,660,3608,2352)}a=e+36|0;if((c[a>>2]|0)<=0){return}f=b|0;g=d|0;h=0;while(1){i=c[e+(h<<2)>>2]|0;if(i>>>0>=2){j=1234;break}if((i|0)==0){k=e+200+(h*56&-1)|0;if((k|0)==0){j=1237;break}l=c[f>>2]|0;if((l|0)>=8){j=1239;break}m=b+8+(l*56&-1)|0;l=k;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];c[m+12>>2]=c[l+12>>2];c[m+16>>2]=c[l+16>>2];c[m+20>>2]=c[l+20>>2];c[m+24>>2]=c[l+24>>2];c[m+28>>2]=c[l+28>>2];c[m+32>>2]=c[l+32>>2];c[m+36>>2]=c[l+36>>2];c[m+40>>2]=c[l+40>>2];c[m+44>>2]=c[l+44>>2];c[m+48>>2]=c[l+48>>2];c[m+52>>2]=c[l+52>>2];c[f>>2]=(c[f>>2]|0)+1}else if((i|0)==1){i=e+200+(h*56&-1)|0;if((i|0)==0){j=1242;break}l=c[g>>2]|0;if((l|0)>=8){j=1244;break}m=d+8+(l*56&-1)|0;l=i;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];c[m+12>>2]=c[l+12>>2];c[m+16>>2]=c[l+16>>2];c[m+20>>2]=c[l+20>>2];c[m+24>>2]=c[l+24>>2];c[m+28>>2]=c[l+28>>2];c[m+32>>2]=c[l+32>>2];c[m+36>>2]=c[l+36>>2];c[m+40>>2]=c[l+40>>2];c[m+44>>2]=c[l+44>>2];c[m+48>>2]=c[l+48>>2];c[m+52>>2]=c[l+52>>2];c[g>>2]=(c[g>>2]|0)+1}l=h+1|0;if((l|0)<(c[a>>2]|0)){h=l}else{j=1248;break}}if((j|0)==1234){by(2832,664,3608,2168)}else if((j|0)==1237){by(2832,594,3896,608)}else if((j|0)==1239){by(2832,606,3896,432)}else if((j|0)==1242){by(2832,594,3896,608)}else if((j|0)==1244){by(2832,606,3896,432)}else if((j|0)==1248){return}}function cT(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0,T=0,U=0,V=0.0,X=0;d=i;i=i+72|0;e=d|0;f=c[b+36>>2]|0;L1575:do{if((f|0)>0){g=a+8|0;j=0;while(1){k=b+200+(j*56&-1)|0;if((k|0)==0){break}l=(+h[b+200+(j*56&-1)+24>>3]- +h[k>>3])*.5;m=(+h[b+200+(j*56&-1)+32>>3]- +h[b+200+(j*56&-1)+8>>3])*.5;n=(+h[b+200+(j*56&-1)+40>>3]- +h[b+200+(j*56&-1)+16>>3])*.5;o=+W(+(l*l+0.0+m*m+n*n));h[e+(j<<3)>>3]=+h[g>>3]*o*o*o;j=j+1|0;if((j|0)>=(f|0)){break L1575}}by(2832,851,5488,1856)}}while(0);j=f-1|0;if((j|0)<=0){p=0;q=0;cU(a,q,0,b);cU(a,p,1,b);i=d;return}g=a+8|0;k=0;o=-1.0- +h[b+760>>3];r=0;s=0;L1585:while(1){t=s+1|0;if((t|0)<(f|0)){u=b+200+(s*56&-1)|0;v=(u|0)==0;w=u|0;u=b+200+(s*56&-1)+24|0;x=b+200+(s*56&-1)+8|0;y=b+200+(s*56&-1)+32|0;z=b+200+(s*56&-1)+16|0;A=b+200+(s*56&-1)+40|0;B=e+(s<<3)|0;C=k;n=o;D=r;E=t;while(1){F=b+200+(E*56&-1)|0;if(v|(F|0)==0){G=1261;break L1585}m=+h[w>>3];l=+h[F>>3];H=+h[u>>3];I=+h[b+200+(E*56&-1)+24>>3];J=+h[x>>3];K=+h[b+200+(E*56&-1)+8>>3];L=+h[y>>3];M=+h[b+200+(E*56&-1)+32>>3];N=+h[z>>3];O=+h[b+200+(E*56&-1)+16>>3];P=+h[A>>3];Q=+h[b+200+(E*56&-1)+40>>3];R=((H>I?H:I)-(m<l?m:l))*.5;l=((L>M?L:M)-(J<K?J:K))*.5;K=((P>Q?P:Q)-(N<O?N:O))*.5;O=+W(+(R*R+0.0+l*l+K*K));K=+h[g>>3]*O*O*O- +h[B>>3]- +h[e+(E<<3)>>3];F=K>n;S=F?E:C;O=F?K:n;T=F?s:D;F=E+1|0;if((F|0)<(f|0)){C=S;n=O;D=T;E=F}else{U=S;V=O;X=T;break}}}else{U=k;V=o;X=r}if((t|0)<(j|0)){k=U;o=V;r=X;s=t}else{p=U;q=X;G=1264;break}}if((G|0)==1261){by(2832,1055,7400,1816)}else if((G|0)==1264){cU(a,q,0,b);cU(a,p,1,b);i=d;return}}function cU(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0.0,I=0.0,J=0,K=0,L=0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0,T=0.0,U=0.0;if((e|0)==0){by(2832,726,4416,2352)}f=e+44+(b<<2)|0;if((c[f>>2]|0)!=0){by(2832,727,4416,1872)}c[e+(b<<2)>>2]=d;c[f>>2]=1;f=e+80+(d<<2)|0;g=e+88+(d*48&-1)|0;i=e+200+(b*56&-1)|0;if((c[f>>2]|0)==0){j=g;k=i;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];c[j+16>>2]=c[k+16>>2];c[j+20>>2]=c[k+20>>2];c[j+24>>2]=c[k+24>>2];c[j+28>>2]=c[k+28>>2];c[j+32>>2]=c[k+32>>2];c[j+36>>2]=c[k+36>>2];c[j+40>>2]=c[k+40>>2];c[j+44>>2]=c[k+44>>2];l=+h[e+88+(d*48&-1)+24>>3];m=+h[g>>3];n=+h[e+88+(d*48&-1)+32>>3];o=+h[e+88+(d*48&-1)+8>>3];p=+h[e+88+(d*48&-1)+40>>3];q=+h[e+88+(d*48&-1)+16>>3];r=l-m;s=r*.5;t=s*s;u=t+0.0;v=n-o;w=v*.5;x=w*w;y=u+x;z=p-q;A=z*.5;B=A*A;C=y+B;D=+W(+C);E=D*D;F=D*E;G=a+8|0;H=+h[G>>3];I=H*F;J=e+184+(d<<3)|0;h[J>>3]=I;K=c[f>>2]|0;L=K+1|0;c[f>>2]=L;return}if((i|0)==0|(g|0)==0){by(2832,1055,7400,1816)}M=+h[i>>3];i=g|0;N=+h[i>>3];O=M<N?M:N;N=+h[e+200+(b*56&-1)+24>>3];g=e+88+(d*48&-1)+24|0;M=+h[g>>3];P=N>M?N:M;M=+h[e+200+(b*56&-1)+8>>3];k=e+88+(d*48&-1)+8|0;N=+h[k>>3];Q=M<N?M:N;N=+h[e+200+(b*56&-1)+32>>3];j=e+88+(d*48&-1)+32|0;M=+h[j>>3];R=N>M?N:M;M=+h[e+200+(b*56&-1)+16>>3];S=e+88+(d*48&-1)+16|0;N=+h[S>>3];T=M<N?M:N;N=+h[e+200+(b*56&-1)+40>>3];b=e+88+(d*48&-1)+40|0;M=+h[b>>3];U=N>M?N:M;h[i>>3]=O;h[k>>3]=Q;h[S>>3]=T;h[g>>3]=P;h[j>>3]=R;h[b>>3]=U;l=P;m=O;n=R;o=Q;p=U;q=T;r=l-m;s=r*.5;t=s*s;u=t+0.0;v=n-o;w=v*.5;x=w*w;y=u+x;z=p-q;A=z*.5;B=A*A;C=y+B;D=+W(+C);E=D*D;F=D*E;G=a+8|0;H=+h[G>>3];I=H*F;J=e+184+(d<<3)|0;h[J>>3]=I;K=c[f>>2]|0;L=K+1|0;c[f>>2]=L;return}function cV(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0;if((b|0)==0|(d|0)==0){by(2832,1019,7960,1608);return 0}e=c[d>>2]|0;if((e|0)<=0){f=0;return f|0}g=a+8|0;a=b|0;i=b+24|0;j=b+8|0;k=b+32|0;l=b+16|0;m=b+40|0;n=-1.0;o=0.0;b=0;p=0;q=1;while(1){r=d+8+(p*56&-1)|0;if((r|0)==0){s=1283;break}t=+h[d+8+(p*56&-1)+24>>3];u=+h[r>>3];v=(t-u)*.5;w=+h[d+8+(p*56&-1)+32>>3];x=+h[d+8+(p*56&-1)+8>>3];y=(w-x)*.5;z=+h[d+8+(p*56&-1)+40>>3];A=+h[d+8+(p*56&-1)+16>>3];B=(z-A)*.5;C=+W(+(v*v+0.0+y*y+B*B));B=+h[g>>3];y=B*C*C*C;C=+h[a>>3];v=+h[i>>3];D=+h[j>>3];E=+h[k>>3];F=+h[l>>3];G=+h[m>>3];H=((v>t?v:t)-(C<u?C:u))*.5;u=((E>w?E:w)-(D<x?D:x))*.5;x=((G>z?G:z)-(F<A?F:A))*.5;A=+W(+(H*H+0.0+u*u+x*x));x=B*A*A*A-y;if(x<n|q){I=p;J=y;K=x}else{r=x==n&y<o;I=r?p:b;J=r?y:o;K=r?x:n}r=p+1|0;if((r|0)<(e|0)){n=K;o=J;b=I;p=r;q=0}else{f=I;s=1288;break}}if((s|0)==1288){return f|0}else if((s|0)==1283){by(2832,851,5488,1856);return 0}return 0}function cW(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=(c[d>>2]|0)-f>>2;h=g+1|0;if(h>>>0>1073741823){i_(0)}i=a+8|0;a=(c[i>>2]|0)-f|0;if(a>>2>>>0>536870910){j=1073741823;k=1294}else{f=a>>1;a=f>>>0<h>>>0?h:f;if((a|0)==0){l=0;m=0}else{j=a;k=1294}}if((k|0)==1294){l=la(j<<2)|0;m=j}j=l+(g<<2)|0;if((j|0)!=0){c[j>>2]=c[b>>2]}b=c[e>>2]|0;j=(c[d>>2]|0)-b|0;k=l+(g-(j>>2)<<2)|0;g=b;lj(k|0,g|0,j);c[e>>2]=k;c[d>>2]=l+(h<<2);c[i>>2]=l+(m<<2);if((b|0)==0){return}le(g);return}function cX(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=161803398-((b|0)>0?b:-b|0)|0;c[a+228>>2]=d;b=d;d=1;e=1;while(1){c[a+8+(((e*21&-1|0)%55&-1)<<2)>>2]=d;f=b-d|0;g=e+1|0;if((g|0)<55){b=d;d=(f|0)<0?f+2147483647|0:f;e=g}else{h=1;break}}while(1){e=a+8+(h<<2)|0;d=(c[e>>2]|0)-(c[a+8+(((h+30|0)%55&-1)+1<<2)>>2]|0)|0;c[e>>2]=(d|0)<0?d+2147483647|0:d;d=h+1|0;if((d|0)<56){h=d}else{i=1;break}}while(1){h=a+8+(i<<2)|0;d=(c[h>>2]|0)-(c[a+8+(((i+30|0)%55&-1)+1<<2)>>2]|0)|0;c[h>>2]=(d|0)<0?d+2147483647|0:d;d=i+1|0;if((d|0)<56){i=d}else{j=1;break}}while(1){i=a+8+(j<<2)|0;d=(c[i>>2]|0)-(c[a+8+(((j+30|0)%55&-1)+1<<2)>>2]|0)|0;c[i>>2]=(d|0)<0?d+2147483647|0:d;d=j+1|0;if((d|0)<56){j=d}else{k=1;break}}do{j=a+8+(k<<2)|0;d=(c[j>>2]|0)-(c[a+8+(((k+30|0)%55&-1)+1<<2)>>2]|0)|0;c[j>>2]=(d|0)<0?d+2147483647|0:d;k=k+1|0;}while((k|0)<56);c[a>>2]=0;c[a+4>>2]=21;return}function cY(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;f=a|0;c[f>>2]=b;g=a+4|0;c[g>>2]=d;c[a+8>>2]=e;d=a+16|0;ln(d|0,0,24);h[d>>3]=-3.4028234663852886e+38;d=a+24|0;h[d>>3]=-3.4028234663852886e+38;i=a+32|0;h[i>>3]=-3.4028234663852886e+38;j=a+40|0;h[j>>3]=3.4028234663852886e+38;k=a+48|0;h[k>>3]=3.4028234663852886e+38;l=a+56|0;h[l>>3]=3.4028234663852886e+38;c[a+64>>2]=0;if((e|0)==0){m=b}else{c3(e,a);m=c[f>>2]|0}if((m|0)==0){return}f=c[g>>2]|0;if((f|0)==0){return}n=+h[m>>3];o=+h[m+8>>3];p=+h[m+16>>3];q=+h[f>>3];r=+h[f+8>>3];s=+h[f+16>>3];h[a+16>>3]=q<n?q:n;h[d>>3]=r<o?r:o;h[i>>3]=s<p?s:p;h[j>>3]=q>n?q:n;h[k>>3]=r>o?r:o;h[l>>3]=s>p?s:p;return}function cZ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=a+24|0;ln(a|0,0,48);h[e>>3]=-3.4028234663852886e+38;f=a+32|0;h[f>>3]=-3.4028234663852886e+38;g=a+40|0;h[g>>3]=-3.4028234663852886e+38;i=a+48|0;h[i>>3]=3.4028234663852886e+38;j=a+56|0;h[j>>3]=3.4028234663852886e+38;k=a+64|0;h[k>>3]=3.4028234663852886e+38;l=a+72|0;ln(l|0,0,48);c[a+120>>2]=d;d=a+128|0;ln(d|0,0,32);if((b|0)==0){return}m=c[b>>2]|0;n=b+4|0;if((m|0)!=(c[n>>2]|0)){o=m;do{m=la(72)|0;p=c[o>>2]|0;cY(m,c[p>>2]|0,c[p+4>>2]|0,a);o=o+4|0;}while((o|0)!=(c[n>>2]|0))}h[e>>3]=+h[b+24>>3];h[f>>3]=+h[b+32>>3];h[g>>3]=+h[b+40>>3];h[i>>3]=+h[b+48>>3];h[j>>3]=+h[b+56>>3];h[k>>3]=+h[b+64>>3];h[l>>3]=+h[b+72>>3];h[a+80>>3]=+h[b+80>>3];h[a+88>>3]=+h[b+88>>3];h[a+96>>3]=+h[b+96>>3];h[a+104>>3]=+h[b+104>>3];h[a+112>>3]=+h[b+112>>3];c[a+124>>2]=c[b+124>>2];h[d>>3]=+h[b+128>>3];h[a+136>>3]=+h[b+136>>3];h[a+144>>3]=+h[b+144>>3];h[a+152>>3]=+h[b+152>>3];return}function c_(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=(c[d>>2]|0)-f>>2;h=g+1|0;if(h>>>0>1073741823){i_(0)}i=a+8|0;a=(c[i>>2]|0)-f|0;if(a>>2>>>0>536870910){j=1073741823;k=1347}else{f=a>>1;a=f>>>0<h>>>0?h:f;if((a|0)==0){l=0;m=0}else{j=a;k=1347}}if((k|0)==1347){l=la(j<<2)|0;m=j}j=l+(g<<2)|0;if((j|0)!=0){c[j>>2]=c[b>>2]}b=c[e>>2]|0;j=(c[d>>2]|0)-b|0;k=l+(g-(j>>2)<<2)|0;g=b;lj(k|0,g|0,j);c[e>>2]=k;c[d>>2]=l+(h<<2);c[i>>2]=l+(m<<2);if((b|0)==0){return}le(g);return}function c$(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=(c[d>>2]|0)-f>>6;i=g+1|0;if(i>>>0>67108863){i_(0)}j=a+8|0;a=(c[j>>2]|0)-f|0;if(a>>6>>>0>33554430){k=67108863;l=1359}else{f=a>>5;a=f>>>0<i>>>0?i:f;if((a|0)==0){m=0;n=0}else{k=a;l=1359}}if((l|0)==1359){m=la(k<<6)|0;n=k}k=m+(g<<6)|0;l=m+(n<<6)|0;if((k|0)!=0){h[k>>3]=+h[b>>3];h[m+(g<<6)+8>>3]=+h[b+8>>3];h[m+(g<<6)+16>>3]=+h[b+16>>3];h[m+(g<<6)+24>>3]=+h[b+24>>3];h[m+(g<<6)+32>>3]=+h[b+32>>3];h[m+(g<<6)+40>>3]=+h[b+40>>3];c[m+(g<<6)+48>>2]=c[b+48>>2];n=b+52|0;b=m+(g<<6)+52|0;a=c[n+4>>2]|0;c[b>>2]=c[n>>2];c[b+4>>2]=a}a=m+(i<<6)|0;i=c[e>>2]|0;b=c[d>>2]|0;if((b|0)==(i|0)){o=i;p=k}else{n=(g-1|0)-(((b-64|0)+(-i|0)|0)>>>6)|0;g=b;b=k;while(1){k=b-64|0;f=g-64|0;if((k|0)!=0){h[k>>3]=+h[f>>3];h[b-64+8>>3]=+h[g-64+8>>3];h[b-64+16>>3]=+h[g-64+16>>3];h[b-64+24>>3]=+h[g-64+24>>3];h[b-64+32>>3]=+h[g-64+32>>3];h[b-64+40>>3]=+h[g-64+40>>3];c[b-64+48>>2]=c[g-64+48>>2];q=g-64+52|0;r=b-64+52|0;s=c[q+4>>2]|0;c[r>>2]=c[q>>2];c[r+4>>2]=s}if((f|0)==(i|0)){break}else{g=f;b=k}}o=c[e>>2]|0;p=m+(n<<6)|0}c[e>>2]=p;c[d>>2]=a;c[j>>2]=l;if((o|0)==0){return}le(o);return}function c0(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;if((b|0)==0){by(2832,939,4928,2824);return 0}i=c[b+4>>2]|0;if((i|0)<=-1){by(2832,940,4928,1760);return 0}if((d|0)==0){by(2832,941,4928,1856);return 0}j=b|0;k=c[j>>2]|0;l=(k|0)>0;if((i|0)>0){if(l){m=0;n=k}else{o=1;return o|0}while(1){if((b+8+(m*56&-1)|0)==0){p=1383;break}else{q=0}while(1){if((q|0)>=3){p=1387;break}if(+h[d+(q<<3)>>3]>+h[b+8+(m*56&-1)+24+(q<<3)>>3]){r=n;break}if(+h[b+8+(m*56&-1)+(q<<3)>>3]>+h[d+24+(q<<3)>>3]){r=n;break}else{q=q+1|0}}if((p|0)==1387){p=0;if(!(c0(a,c[b+8+(m*56&-1)+48>>2]|0,d,e,f,g)|0)){o=0;p=1400;break}r=c[j>>2]|0}i=m+1|0;if((i|0)<(r|0)){m=i;n=r}else{o=1;p=1403;break}}if((p|0)==1400){return o|0}else if((p|0)==1403){return o|0}else if((p|0)==1383){by(2832,466,4672,1816);return 0}}else{if(l){s=0;t=k}else{o=1;return o|0}while(1){if((b+8+(s*56&-1)|0)==0){p=1391;break}else{u=0}while(1){if((u|0)>=3){p=1395;break}if(+h[d+(u<<3)>>3]>+h[b+8+(s*56&-1)+24+(u<<3)>>3]){v=t;break}if(+h[b+8+(s*56&-1)+(u<<3)>>3]>+h[d+24+(u<<3)>>3]){v=t;break}else{u=u+1|0}}if((p|0)==1395){p=0;c[e>>2]=(c[e>>2]|0)+1;if(!(bY[f&31](c[b+8+(s*56&-1)+52>>2]|0,g)|0)){o=0;p=1404;break}v=c[j>>2]|0}k=s+1|0;if((k|0)<(v|0)){s=k;t=v}else{o=1;p=1401;break}}if((p|0)==1391){by(2832,466,4672,1816);return 0}else if((p|0)==1404){return o|0}else if((p|0)==1401){return o|0}}return 0}function c1(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=(c[d>>2]|0)-f>>2;h=g+1|0;if(h>>>0>1073741823){i_(0)}i=a+8|0;a=(c[i>>2]|0)-f|0;if(a>>2>>>0>536870910){j=1073741823;k=1409}else{f=a>>1;a=f>>>0<h>>>0?h:f;if((a|0)==0){l=0;m=0}else{j=a;k=1409}}if((k|0)==1409){l=la(j<<2)|0;m=j}j=l+(g<<2)|0;if((j|0)!=0){c[j>>2]=c[b>>2]}b=c[e>>2]|0;j=(c[d>>2]|0)-b|0;k=l+(g-(j>>2)<<2)|0;g=b;lj(k|0,g|0,j);c[e>>2]=k;c[d>>2]=l+(h<<2);c[i>>2]=l+(m<<2);if((b|0)==0){return}le(g);return}function c2(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0;b=i;i=i+24|0;d=b|0;e=c[a>>2]|0;f=(c[a+4>>2]|0)-e>>2;if(f>>>0<3){g=0;i=b;return g|0}a=c[e>>2]|0;j=c[a+4>>2]|0;k=c[a>>2]|0;l=-0.0-(+h[j>>3]- +h[k>>3]);m=-0.0-(+h[j+8>>3]- +h[k+8>>3]);n=-0.0-(+h[j+16>>3]- +h[k+16>>3]);k=c[e+4>>2]|0;e=c[k+4>>2]|0;j=c[k>>2]|0;o=+h[e>>3]- +h[j>>3];p=+h[e+8>>3]- +h[j+8>>3];q=+h[e+16>>3]- +h[j+16>>3];h[d>>3]=p*n-q*m;h[d+8>>3]=q*l-o*n;h[d+16>>3]=o*m-p*l;l=+h[2492];j=3;L1783:while(1){e=0;while(1){if((e|0)>=3){break}p=+h[d+(e<<3)>>3];if(p>0.0){r=p}else{r=-0.0-p}if(r<l){e=e+1|0}else{g=1;s=1427;break L1783}}if(j>>>0>f>>>0){g=0;s=1426;break}else{j=j+1|0}}if((s|0)==1426){i=b;return g|0}else if((s|0)==1427){i=b;return g|0}return 0}function c3(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0;d=i;i=i+24|0;e=d|0;f=d+8|0;c[e>>2]=b;g=a|0;cJ(f,g);j=c[f>>2]|0;l=f+4|0;f=c[l>>2]|0;m=j;while(1){if((m|0)==(f|0)){n=0;break}if((c[m>>2]|0)==(b|0)){n=1;break}else{m=m+4|0}}m=j;if((j|0)!=0){if((j|0)!=(f|0)){c[l>>2]=f+((((f-4|0)+(-m|0)|0)>>>2^-1)<<2)}le(j)}if(n){o=0;i=d;return o|0}n=a+4|0;j=c[n>>2]|0;if((j|0)==(c[a+8>>2]|0)){c1(g,e);p=c[n>>2]|0}else{if((j|0)==0){q=0}else{c[j>>2]=b;q=c[n>>2]|0}b=q+4|0;c[n>>2]=b;p=b}b=c[a>>2]|0;if(p-b>>2>>>0<2){o=1;i=d;return o|0}if((b|0)==(p|0)){r=-3.4028234663852886e+38;s=-3.4028234663852886e+38;t=-940572673;u=-536870912;v=3.4028234663852886e+38;w=3.4028234663852886e+38;x=1206910975;y=-536870912}else{z=-3.4028234663852886e+38;A=-3.4028234663852886e+38;n=-940572673;q=-536870912;B=3.4028234663852886e+38;C=3.4028234663852886e+38;j=1206910975;e=-536870912;g=b;while(1){b=c[c[g>>2]>>2]|0;m=b|0;D=+h[m>>3];f=c[m>>2]|0;l=c[m+4>>2]|0;if(D>(c[k>>2]=q,c[k+4>>2]=n,+h[k>>3])){E=l;F=f}else{E=n;F=q}G=+h[b+8>>3];H=G>A?G:A;I=+h[b+16>>3];J=I>z?I:z;if(D<(c[k>>2]=e,c[k+4>>2]=j,+h[k>>3])){K=l;L=f}else{K=j;L=e}D=G<C?G:C;G=I<B?I:B;f=g+4|0;if((f|0)==(p|0)){r=J;s=H;t=E;u=F;v=G;w=D;x=K;y=L;break}else{z=J;A=H;n=E;q=F;B=G;C=D;j=K;e=L;g=f}}}h[a+24>>3]=(c[k>>2]=y,c[k+4>>2]=x,+h[k>>3]);h[a+32>>3]=w;h[a+40>>3]=v;h[a+48>>3]=(c[k>>2]=u,c[k+4>>2]=t,+h[k>>3]);h[a+56>>3]=s;h[a+64>>3]=r;o=1;i=d;return o|0}function c4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0,u=0.0;b=i;i=i+24|0;d=b|0;e=c[a>>2]|0;f=c[e>>2]|0;g=c[f+4>>2]|0;j=c[f>>2]|0;k=-0.0-(+h[g>>3]- +h[j>>3]);l=-0.0-(+h[g+8>>3]- +h[j+8>>3]);m=-0.0-(+h[g+16>>3]- +h[j+16>>3]);j=c[e+4>>2]|0;g=c[j+4>>2]|0;f=c[j>>2]|0;n=+h[g>>3]- +h[f>>3];o=+h[g+8>>3]- +h[f+8>>3];p=+h[g+16>>3]- +h[f+16>>3];q=o*m-p*l;r=p*k-n*m;m=n*l-o*k;h[d>>3]=q;h[d+8>>3]=r;h[d+16>>3]=m;k=+h[2492];f=a+4|0;g=3;L1831:while(1){j=0;while(1){if((j|0)>=3){break}o=+h[d+(j<<3)>>3];if(o>0.0){s=o}else{s=-0.0-o}if(s<k){j=j+1|0}else{break L1831}}if(g>>>0>(c[f>>2]|0)-e>>2>>>0){t=1466;break}else{g=g+1|0}}if((t|0)==1466){i=b;return}k=m*m+(q*q+0.0+r*r);if(k==0.0){u=0.0}else{u=+W(+k)}h[a+72>>3]=q/u;h[a+80>>3]=r/u;h[a+88>>3]=m/u;i=b;return}function c5(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0;d=c[a>>2]|0;e=c[d>>2]|0;f=c[e+4>>2]|0;g=c[e>>2]|0;i=+h[f>>3]- +h[g>>3];j=+h[f+8>>3]- +h[g+8>>3];k=+h[f+16>>3]- +h[g+16>>3];l=i*i+0.0+j*j+k*k;if(l==0.0){m=0.0}else{m=+W(+l)}g=(c[a+4>>2]|0)-d>>2;if((g|0)==0){n=0;return n|0}l=+h[b>>3];o=+h[b+8>>3];p=+h[b+16>>3];q=k/m;k=j/m;j=i/m;b=0;m=0.0;while(1){a=b+1|0;f=c[d+((a>>>0)%(g>>>0)>>>0<<2)>>2]|0;e=c[f+4>>2]|0;r=c[f>>2]|0;i=+h[e>>3]- +h[r>>3];s=+h[e+8>>3]- +h[r+8>>3];t=+h[e+16>>3]- +h[r+16>>3];u=i*i+0.0+s*s+t*t;if(u==0.0){v=0.0}else{v=+W(+u)}u=i/v;i=s/v;s=t/v;t=+$(+(j*u+0.0+k*i+q*s));if((j*i-k*u)*p+((q*u-j*s)*o+(l*(k*s-q*i)+0.0))>0.0){w=t}else{w=-0.0-t}x=m+w;if(a>>>0<g>>>0){q=s;k=i;j=u;b=a;m=x}else{break}}n=x>0.0;return n|0}function c6(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;i=i+232|0;d=b|0;cX(d,a1()|0);e=c[a+4>>2]|0;f=a+8|0;if((e|0)==(c[f>>2]|0)){g=a+16|0;j=c[g>>2]|0;k=j+128|0;h[k>>3]=1.0;l=j+136|0;m=j+152|0;n=l;ln(n|0,0,16);h[m>>3]=1.0;i=b;return}o=d|0;p=d+4|0;q=e;e=c[o>>2]|0;r=c[p>>2]|0;do{s=c[q>>2]|0;t=e+1|0;u=(t|0)>55?1:t;t=r+1|0;v=(t|0)>55?1:t;t=d+8+(u<<2)|0;w=(c[t>>2]|0)-(c[d+8+(v<<2)>>2]|0)|0;x=(w|0)<0?w+2147483647|0:w;c[t>>2]=x;c[o>>2]=u;c[p>>2]=v;t=u+1|0;u=(t|0)>55?1:t;t=v+1|0;v=(t|0)>55?1:t;t=d+8+(u<<2)|0;w=(c[t>>2]|0)-(c[d+8+(v<<2)>>2]|0)|0;y=(w|0)<0?w+2147483647|0:w;c[t>>2]=y;c[o>>2]=u;c[p>>2]=v;t=u+1|0;e=(t|0)>55?1:t;t=v+1|0;r=(t|0)>55?1:t;t=d+8+(e<<2)|0;v=(c[t>>2]|0)-(c[d+8+(r<<2)>>2]|0)|0;u=(v|0)<0?v+2147483647|0:v;c[t>>2]=u;c[o>>2]=e;c[p>>2]=r;h[s+128>>3]=+(x|0)*4.656612875245797e-10;h[s+136>>3]=+(y|0)*4.656612875245797e-10;h[s+144>>3]=+(u|0)*4.656612875245797e-10;h[s+152>>3]=1.0;q=q+4|0;}while((q|0)!=(c[f>>2]|0));g=a+16|0;j=c[g>>2]|0;k=j+128|0;h[k>>3]=1.0;l=j+136|0;m=j+152|0;n=l;ln(n|0,0,16);h[m>>3]=1.0;i=b;return}function c7(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0.0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0,C=0.0;d=i;i=i+24|0;e=d|0;f=+h[b>>3];g=+h[c>>3]-f;j=+h[b+8>>3];k=+h[c+8>>3]-j;l=+h[b+16>>3];m=+h[c+16>>3]-l;ln(e|0,0,16);h[e>>3]=g;h[e+8>>3]=k;h[e+16>>3]=m;n=+h[2492];c=0;while(1){if((c|0)>=3){o=0;p=1491;break}q=+h[e+(c<<3)>>3];if(q>0.0){r=q}else{r=-0.0-q}if(r<n){c=c+1|0}else{break}}if((p|0)==1491){while(1){p=0;if((o|0)>=3){s=.5;p=1513;break}r=+h[a+(o<<3)>>3]- +h[b+(o<<3)>>3];if(r>0.0){t=r}else{t=-0.0-r}if(t<n){o=o+1|0;p=1491}else{s=-1.0;p=1512;break}}if((p|0)==1513){i=d;return+s}else if((p|0)==1512){i=d;return+s}}if(g>0.0){u=g}else{u=-0.0-g}if(u<n){v=2;w=0.0}else{v=3;w=(+h[a>>3]-f)/g+0.0}if(k>0.0){x=k}else{x=-0.0-k}if(x<n){y=v-1|0;z=w}else{y=v;z=w+(+h[a+8>>3]-j)/k}if(m>0.0){A=m}else{A=-0.0-m}if(A<n){B=y-1|0;C=z}else{B=y;C=z+(+h[a+16>>3]-l)/m}s=C/+(B|0);i=d;return+s}function c8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0.0,r=0.0,s=0.0;d=i;i=i+24|0;e=d|0;f=c[b+4>>2]|0;g=c[b>>2]|0;j=+h[f>>3]- +h[g>>3];k=+h[f+8>>3]- +h[g+8>>3];l=+h[f+16>>3]- +h[g+16>>3];g=e;c[g>>2]=0;c[g+4>>2]=0;g=e|0;h[g>>3]=j;f=e+8|0;h[f>>3]=k;b=e+16|0;h[b>>3]=l;m=+h[2492];n=0;while(1){if((n|0)>=3){o=3.0;p=1526;break}q=+h[e+(n<<3)>>3];if(q>0.0){r=q}else{r=-0.0-q}if(r<m){n=n+1|0}else{break}}if((p|0)==1526){i=d;return+o}m=j*j+0.0+k*k+l*l;if(m==0.0){s=0.0}else{s=+W(+m)}m=j/s;h[g>>3]=m;j=k/s;h[f>>3]=j;k=l/s;h[b>>3]=k;s=+h[a+8>>3];l=+h[a+16>>3];r=+h[a+24>>3];q=m*s+0.0+j*l+k*r;if((r*j-l*k)*+h[a+32>>3]+0.0+(k*s-r*m)*+h[a+40>>3]+(l*m-j*s)*+h[a+48>>3]>0.0){o=-0.0-q;i=d;return+o}else{o=q+2.0;i=d;return+o}return 0.0}function c9(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,g=0.0,i=0.0,j=0.0,k=0.0,l=0.0;d=la(72)|0;e=b+4|0;cY(d,a,c[e>>2]|0,c[b+8>>2]|0);if((c[e>>2]|0)!=(a|0)){c[e>>2]=a}e=c[b>>2]|0;if((e|0)==0|(a|0)==0){return d|0}f=+h[e>>3];g=+h[e+8>>3];i=+h[e+16>>3];j=+h[a>>3];k=+h[a+8>>3];l=+h[a+16>>3];h[b+16>>3]=j<f?j:f;h[b+24>>3]=k<g?k:g;h[b+32>>3]=l<i?l:i;h[b+40>>3]=j>f?j:f;h[b+48>>3]=k>g?k:g;h[b+56>>3]=l>i?l:i;return d|0}function da(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,g=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0;d=c[b+4>>2]|0;e=a+4|0;if((c[e>>2]|0)!=(d|0)){c[e>>2]=d}e=c[a>>2]|0;if(!((e|0)==0|(d|0)==0)){f=+h[e>>3];g=+h[e+8>>3];i=+h[e+16>>3];j=+h[d>>3];k=+h[d+8>>3];l=+h[d+16>>3];h[a+16>>3]=j<f?j:f;h[a+24>>3]=k<g?k:g;h[a+32>>3]=l<i?l:i;h[a+40>>3]=j>f?j:f;h[a+48>>3]=k>g?k:g;h[a+56>>3]=l>i?l:i}d=b+8|0;e=c[d>>2]|0;if((e|0)==0){return a|0}c[d>>2]=0;d=c[e>>2]|0;m=e+4|0;e=c[m>>2]|0;n=d;o=0;while(1){if((n|0)==(e|0)){p=1548;break}q=o;r=n+4|0;if((c[n>>2]|0)==(b|0)){break}else{n=r;o=o-4|0}}if((p|0)==1548){return a|0}p=e-r|0;e=p>>2;lk(n|0,r|0,p|0);p=c[m>>2]|0;if((n+(e<<2)|0)==(p|0)){return a|0}c[m>>2]=p+(((q+((p-4|0)+(-(d+(e<<2)|0)|0)|0)|0)>>>2^-1)<<2);return a|0}function db(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=a+4|0;d=c[b>>2]|0;e=a|0;f=c[e>>2]|0;if(d-f>>2>>>0>1){g=1;i=f;j=d}else{k=c2(a)|0;return k|0}while(1){d=g-1|0;f=c[i+(d<<2)>>2]|0;l=c[i+(g<<2)>>2]|0;m=c[f+4>>2]|0;n=c[f>>2]|0;o=+h[m>>3]- +h[n>>3];p=+h[m+8>>3]- +h[n+8>>3];q=+h[m+16>>3]- +h[n+16>>3];r=c[l+4>>2]|0;s=c[l>>2]|0;t=+h[r>>3]- +h[s>>3];u=+h[r+8>>3]- +h[s+8>>3];v=+h[r+16>>3]- +h[s+16>>3];w=o*o+0.0+p*p+q*q;if(w==0.0){x=0.0}else{x=+W(+w)}w=t*t+0.0+u*u+v*v;if(w==0.0){y=0.0}else{y=+W(+w)}w=o/x*(t/y)+0.0+p/x*(u/y)+q/x*(v/y);if(w>0.0){z=w}else{z=-0.0-w}w=z+-1.0;if(w>0.0){A=w}else{A=-0.0-w}L1974:do{if(A<+h[2492]){do{if((l|0)!=(f|0)&(m|0)==(s|0)){if((n|0)==(r|0)){B=m;C=n;break}da(f,l);D=d;E=c[b>>2]|0;break L1974}else{B=s;C=r}}while(0);if(!((m|0)==(B|0)&(n|0)==(C|0))){D=g;E=j;break}c[f+8>>2]=0;F=c[e>>2]|0;G=c[b>>2]|0;H=F;I=0;while(1){if((H|0)==(G|0)){break}J=I;K=H+4|0;if((c[H>>2]|0)==(f|0)){L=1569;break}else{H=K;I=I-4|0}}do{if((L|0)==1569){L=0;I=G-K|0;M=I>>2;lk(H|0,K|0,I|0);I=c[b>>2]|0;if((H+(M<<2)|0)==(I|0)){break}c[b>>2]=I+(((J+((I-4|0)+(-(F+(M<<2)|0)|0)|0)|0)>>>2^-1)<<2)}}while(0);c[l+8>>2]=0;F=c[e>>2]|0;H=c[b>>2]|0;G=F;M=0;while(1){if((G|0)==(H|0)){N=H;break}O=M;P=G+4|0;if((c[G>>2]|0)==(l|0)){L=1574;break}else{G=P;M=M-4|0}}do{if((L|0)==1574){L=0;M=H-P|0;I=M>>2;lk(G|0,P|0,M|0);M=G+(I<<2)|0;Q=c[b>>2]|0;if((M|0)==(Q|0)){N=M;break}M=Q+(((O+((Q-4|0)+(-(F+(I<<2)|0)|0)|0)|0)>>>2^-1)<<2)|0;c[b>>2]=M;N=M}}while(0);D=g>>>0>1?g-2|0:d;E=N}else{D=g;E=j}}while(0);d=D+1|0;l=c[e>>2]|0;if(d>>>0<E-l>>2>>>0){g=d;i=l;j=E}else{break}}k=c2(a)|0;return k|0}function dc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;e=a;a=b;L1998:while(1){b=a;f=a-4|0;g=e;L2000:while(1){h=g;i=b-h|0;j=i>>2;if((j|0)==5){k=1588;break L1998}else if((j|0)==2){k=1584;break L1998}else if((j|0)==4){k=1587;break L1998}else if((j|0)==0|(j|0)==1){k=1625;break L1998}else if((j|0)==3){k=1586;break L1998}if((i|0)<124){k=1590;break L1998}l=(j|0)/2&-1;m=g+(l<<2)|0;if((i|0)>3996){i=(j|0)/4&-1;n=df(g,g+(i<<2)|0,m,g+(i+l<<2)|0,f,d)|0}else{n=dd(g,m,f,d)|0}l=c[g>>2]|0;i=c[m>>2]|0;o=+c8(d,l);do{if(o<+c8(d,i)){p=f;q=n}else{j=f;while(1){r=j-4|0;if((g|0)==(r|0)){break}s=c[r>>2]|0;t=+c8(d,s);if(t<+c8(d,i)){k=1607;break}else{j=r}}if((k|0)==1607){k=0;c[g>>2]=s;c[r>>2]=l;p=r;q=n+1|0;break}j=g+4|0;u=c[f>>2]|0;t=+c8(d,l);if(t<+c8(d,u)){v=j}else{w=j;while(1){if((w|0)==(f|0)){k=1628;break L1998}x=c[w>>2]|0;t=+c8(d,l);y=w+4|0;if(t<+c8(d,x)){break}else{w=y}}c[w>>2]=u;c[f>>2]=x;v=y}if((v|0)==(f|0)){k=1629;break L1998}else{z=f;A=v}while(1){j=c[g>>2]|0;B=A;while(1){C=c[B>>2]|0;t=+c8(d,j);D=B+4|0;if(t<+c8(d,C)){E=z;break}else{B=D}}do{E=E-4|0;F=c[E>>2]|0;t=+c8(d,j);}while(t<+c8(d,F));if(B>>>0>=E>>>0){g=B;continue L2000}c[B>>2]=F;c[E>>2]=C;z=E;A=D}}}while(0);l=g+4|0;L2030:do{if(l>>>0<p>>>0){i=p;u=l;w=q;j=m;while(1){G=c[j>>2]|0;H=u;while(1){I=c[H>>2]|0;o=+c8(d,I);J=H+4|0;if(o<+c8(d,G)){H=J}else{K=i;break}}do{K=K-4|0;L=c[K>>2]|0;o=+c8(d,L);}while(o>=+c8(d,G));if(H>>>0>K>>>0){M=H;N=w;O=j;break L2030}c[H>>2]=L;c[K>>2]=I;i=K;u=J;w=w+1|0;j=(j|0)==(H|0)?K:j}}else{M=l;N=q;O=m}}while(0);do{if((M|0)==(O|0)){P=N}else{m=c[O>>2]|0;l=c[M>>2]|0;o=+c8(d,m);if(o>=+c8(d,l)){P=N;break}c[M>>2]=m;c[O>>2]=l;P=N+1|0}}while(0);if((P|0)==0){Q=di(g,M,d)|0;l=M+4|0;if(di(l,a,d)|0){k=1619;break}if(Q){g=l;continue}}l=M;if((l-h|0)>=(b-l|0)){k=1623;break}dc(g,M,d);g=M+4|0}if((k|0)==1619){k=0;if(Q){k=1626;break}else{e=g;a=M;continue}}else if((k|0)==1623){k=0;dc(M+4|0,a,d);e=g;a=M;continue}}if((k|0)==1588){M=g+4|0;e=g+8|0;Q=g+12|0;df(g,M,e,Q,f,d);return}else if((k|0)==1584){Q=c[f>>2]|0;e=c[g>>2]|0;o=+c8(d,Q);if(o>=+c8(d,e)){return}c[g>>2]=Q;c[f>>2]=e;return}else if((k|0)==1590){dg(g,a,d);return}else if((k|0)==1587){de(g,g+4|0,g+8|0,f,d);return}else if((k|0)==1625){return}else if((k|0)==1626){return}else if((k|0)==1628){return}else if((k|0)==1629){return}else if((k|0)==1586){dd(g,g+4|0,f,d);return}}function dd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,i=0,j=0,k=0,l=0,m=0;f=c[b>>2]|0;g=c[a>>2]|0;h=+c8(e,f);i=h<+c8(e,g);j=c[d>>2]|0;k=+c8(e,j)<h;if(!i){if(!k){l=0;return l|0}c[b>>2]=j;c[d>>2]=f;i=c[b>>2]|0;m=c[a>>2]|0;h=+c8(e,i);if(h>=+c8(e,m)){l=1;return l|0}c[a>>2]=i;c[b>>2]=m;l=2;return l|0}if(k){c[a>>2]=j;c[d>>2]=g;l=1;return l|0}c[a>>2]=f;c[b>>2]=g;f=c[d>>2]|0;h=+c8(e,f);if(h>=+c8(e,g)){l=1;return l|0}c[b>>2]=f;c[d>>2]=g;l=2;return l|0}function de(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0.0,k=0;g=dd(a,b,d,f)|0;h=c[e>>2]|0;i=c[d>>2]|0;j=+c8(f,h);if(j>=+c8(f,i)){k=g;return k|0}c[d>>2]=h;c[e>>2]=i;i=c[d>>2]|0;e=c[b>>2]|0;j=+c8(f,i);if(j>=+c8(f,e)){k=g+1|0;return k|0}c[b>>2]=i;c[d>>2]=e;e=c[b>>2]|0;d=c[a>>2]|0;j=+c8(f,e);if(j>=+c8(f,d)){k=g+2|0;return k|0}c[a>>2]=e;c[b>>2]=d;k=g+3|0;return k|0}function df(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0.0,l=0;h=de(a,b,d,e,g)|0;i=c[f>>2]|0;j=c[e>>2]|0;k=+c8(g,i);if(k>=+c8(g,j)){l=h;return l|0}c[e>>2]=i;c[f>>2]=j;j=c[e>>2]|0;f=c[d>>2]|0;k=+c8(g,j);if(k>=+c8(g,f)){l=h+1|0;return l|0}c[d>>2]=j;c[e>>2]=f;f=c[d>>2]|0;e=c[b>>2]|0;k=+c8(g,f);if(k>=+c8(g,e)){l=h+2|0;return l|0}c[b>>2]=f;c[d>>2]=e;e=c[b>>2]|0;d=c[a>>2]|0;k=+c8(g,e);if(k>=+c8(g,d)){l=h+3|0;return l|0}c[a>>2]=e;c[b>>2]=d;l=h+4|0;return l|0}function dg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0.0,j=0,k=0,l=0,m=0,n=0;e=a+8|0;dd(a,a+4|0,e,d);f=a+12|0;if((f|0)==(b|0)){return}else{g=e;h=f}while(1){f=c[h>>2]|0;e=c[g>>2]|0;i=+c8(d,f);if(i<+c8(d,e)){j=g;k=h;l=e;while(1){c[k>>2]=l;if((j|0)==(a|0)){m=a;break}e=j-4|0;n=c[e>>2]|0;i=+c8(d,f);if(i<+c8(d,n)){k=j;j=e;l=n}else{m=j;break}}c[m>>2]=f}j=h+4|0;if((j|0)==(b|0)){break}else{g=h;h=j}}return}function dh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0;e=i;i=i+24|0;f=e|0;g=+h[b>>3];j=+h[c>>3]-g;k=+h[b+8>>3];l=+h[c+8>>3]-k;m=+h[b+16>>3];n=+h[c+16>>3]-m;o=+h[a>>3]-g;g=+h[a+8>>3]-k;k=+h[a+16>>3]-m;m=l*k-n*g;p=n*o-j*k;k=j*g-l*o;h[f>>3]=m;h[f+8>>3]=p;h[f+16>>3]=k;o=+h[2492];a=0;while(1){if((a|0)>=3){q=2;r=1687;break}l=+h[f+(a<<3)>>3];if(l>0.0){s=l}else{s=-0.0-l}if(s<o){a=a+1|0}else{break}}if((r|0)==1687){i=e;return q|0}q=m*+h[d>>3]+0.0+p*+h[d+8>>3]+k*+h[d+16>>3]>0.0&1;i=e;return q|0}function di(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b-a>>2;if((e|0)==3){f=a+4|0;g=b-4|0;dd(a,f,g,d);h=1;return h|0}else if((e|0)==4){de(a,a+4|0,a+8|0,b-4|0,d);h=1;return h|0}else if((e|0)==2){g=b-4|0;f=c[g>>2]|0;i=c[a>>2]|0;j=+c8(d,f);if(j>=+c8(d,i)){h=1;return h|0}c[a>>2]=f;c[g>>2]=i;h=1;return h|0}else if((e|0)==0|(e|0)==1){h=1;return h|0}else if((e|0)==5){df(a,a+4|0,a+8|0,a+12|0,b-4|0,d);h=1;return h|0}else{e=a+8|0;dd(a,a+4|0,e,d);i=a+12|0;if((i|0)==(b|0)){h=1;return h|0}else{k=e;l=0;m=i}while(1){i=c[m>>2]|0;e=c[k>>2]|0;j=+c8(d,i);if(j<+c8(d,e)){g=k;f=m;n=e;while(1){c[f>>2]=n;if((g|0)==(a|0)){o=a;break}e=g-4|0;p=c[e>>2]|0;j=+c8(d,i);if(j<+c8(d,p)){f=g;g=e;n=p}else{o=g;break}}c[o>>2]=i;g=l+1|0;if((g|0)==8){break}else{q=g}}else{q=l}g=m+4|0;if((g|0)==(b|0)){h=1;r=1704;break}else{k=m;l=q;m=g}}if((r|0)==1704){return h|0}h=(m+4|0)==(b|0);return h|0}return 0}function dj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;e=d|0;f=a;a=b;L2167:while(1){b=a;g=a-4|0;h=f;L2169:while(1){i=h;j=b-i|0;k=j>>2;if((k|0)==0|(k|0)==1){l=1758;break L2167}else if((k|0)==3){l=1716;break L2167}else if((k|0)==5){l=1718;break L2167}else if((k|0)==2){l=1714;break L2167}else if((k|0)==4){l=1717;break L2167}if((j|0)<124){l=1720;break L2167}m=(k|0)/2&-1;n=h+(m<<2)|0;if((j|0)>3996){j=(k|0)/4&-1;o=dm(h,h+(j<<2)|0,n,h+(j+m<<2)|0,g,d)|0}else{o=dk(h,n,g,d)|0}m=c[h>>2]|0;j=c[n>>2]|0;k=m|0;p=c[e>>2]|0;q=c[p>>2]|0;r=c[p+4>>2]|0;s=+c7(k,q,r);p=j|0;do{if(s<+c7(p,q,r)){t=g;u=o}else{j=g;while(1){v=j-4|0;if((h|0)==(v|0)){break}w=c[v>>2]|0;x=+c7(w|0,q,r);if(x<+c7(p,q,r)){l=1737;break}else{j=v}}if((l|0)==1737){l=0;c[h>>2]=w;c[v>>2]=m;t=v;u=o+1|0;break}j=h+4|0;y=c[g>>2]|0;x=+c7(k,q,r);if(x<+c7(y|0,q,r)){z=j}else{A=j;while(1){if((A|0)==(g|0)){l=1760;break L2167}B=c[A>>2]|0;x=+c7(k,q,r);C=A+4|0;if(x<+c7(B|0,q,r)){break}else{A=C}}c[A>>2]=y;c[g>>2]=B;z=C}if((z|0)==(g|0)){l=1761;break L2167}else{D=g;E=z}while(1){j=c[h>>2]|0;F=c[e>>2]|0;G=c[F>>2]|0;H=c[F+4>>2]|0;F=E;while(1){I=c[F>>2]|0;J=j|0;K=G|0;L=H|0;x=+c7(J,K,L);M=F+4|0;if(x<+c7(I|0,K,L)){N=D;break}else{F=M}}do{N=N-4|0;O=c[N>>2]|0;x=+c7(J,K,L);}while(x<+c7(O|0,K,L));if(F>>>0>=N>>>0){h=F;continue L2169}c[F>>2]=O;c[N>>2]=I;D=N;E=M}}}while(0);r=h+4|0;L2199:do{if(r>>>0<t>>>0){q=t;k=r;m=u;p=n;while(1){y=c[p>>2]|0;A=c[e>>2]|0;H=c[A>>2]|0;G=c[A+4>>2]|0;A=k;while(1){P=c[A>>2]|0;Q=H|0;R=G|0;s=+c7(P|0,Q,R);S=y|0;T=A+4|0;if(s<+c7(S,Q,R)){A=T}else{U=q;break}}do{U=U-4|0;V=c[U>>2]|0;s=+c7(V|0,Q,R);}while(s>=+c7(S,Q,R));if(A>>>0>U>>>0){W=A;X=m;Y=p;break L2199}c[A>>2]=V;c[U>>2]=P;q=U;k=T;m=m+1|0;p=(p|0)==(A|0)?U:p}}else{W=r;X=u;Y=n}}while(0);do{if((W|0)==(Y|0)){Z=X}else{n=c[Y>>2]|0;r=c[W>>2]|0;p=c[e>>2]|0;m=c[p>>2]|0;k=c[p+4>>2]|0;s=+c7(n|0,m,k);if(s>=+c7(r|0,m,k)){Z=X;break}c[W>>2]=n;c[Y>>2]=r;Z=X+1|0}}while(0);if((Z|0)==0){_=dp(h,W,d)|0;r=W+4|0;if(dp(r,a,d)|0){l=1749;break}if(_){h=r;continue}}r=W;if((r-i|0)>=(b-r|0)){l=1753;break}dj(h,W,d);h=W+4|0}if((l|0)==1753){l=0;dj(W+4|0,a,d);f=h;a=W;continue}else if((l|0)==1749){l=0;if(_){l=1763;break}else{f=h;a=W;continue}}}if((l|0)==1720){dn(h,a,d);return}else if((l|0)==1758){return}else if((l|0)==1760){return}else if((l|0)==1761){return}else if((l|0)==1763){return}else if((l|0)==1716){dk(h,h+4|0,g,d);return}else if((l|0)==1718){dm(h,h+4|0,h+8|0,h+12|0,g,d);return}else if((l|0)==1714){a=c[g>>2]|0;W=c[h>>2]|0;f=c[e>>2]|0;e=c[f>>2]|0;_=c[f+4>>2]|0;s=+c7(a|0,e,_);if(s>=+c7(W|0,e,_)){return}c[h>>2]=a;c[g>>2]=W;return}else if((l|0)==1717){dl(h,h+4|0,h+8|0,g,d);return}}function dk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0.0,l=0,m=0,n=0,o=0,p=0,q=0;f=c[b>>2]|0;g=c[a>>2]|0;h=e|0;e=c[h>>2]|0;i=c[e>>2]|0;j=c[e+4>>2]|0;k=+c7(f|0,i,j);e=g|0;l=k<+c7(e,i,j);m=c[d>>2]|0;n=+c7(m|0,i,j)<k;if(!l){if(!n){o=0;return o|0}c[b>>2]=m;c[d>>2]=f;l=c[b>>2]|0;j=c[a>>2]|0;i=c[h>>2]|0;p=c[i>>2]|0;q=c[i+4>>2]|0;k=+c7(l|0,p,q);if(k>=+c7(j|0,p,q)){o=1;return o|0}c[a>>2]=l;c[b>>2]=j;o=2;return o|0}if(n){c[a>>2]=m;c[d>>2]=g;o=1;return o|0}c[a>>2]=f;c[b>>2]=g;f=c[d>>2]|0;a=c[h>>2]|0;h=c[a>>2]|0;m=c[a+4>>2]|0;k=+c7(f|0,h,m);if(k>=+c7(e,h,m)){o=1;return o|0}c[b>>2]=f;c[d>>2]=g;o=2;return o|0}function dl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0.0,n=0;g=dk(a,b,d,f)|0;h=c[e>>2]|0;i=c[d>>2]|0;j=f|0;f=c[j>>2]|0;k=c[f>>2]|0;l=c[f+4>>2]|0;m=+c7(h|0,k,l);if(m>=+c7(i|0,k,l)){n=g;return n|0}c[d>>2]=h;c[e>>2]=i;i=c[d>>2]|0;e=c[b>>2]|0;h=c[j>>2]|0;l=c[h>>2]|0;k=c[h+4>>2]|0;m=+c7(i|0,l,k);if(m>=+c7(e|0,l,k)){n=g+1|0;return n|0}c[b>>2]=i;c[d>>2]=e;e=c[b>>2]|0;d=c[a>>2]|0;i=c[j>>2]|0;j=c[i>>2]|0;k=c[i+4>>2]|0;m=+c7(e|0,j,k);if(m>=+c7(d|0,j,k)){n=g+2|0;return n|0}c[a>>2]=e;c[b>>2]=d;n=g+3|0;return n|0}function dm(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0;h=dl(a,b,d,e,g)|0;i=c[f>>2]|0;j=c[e>>2]|0;k=g|0;g=c[k>>2]|0;l=c[g>>2]|0;m=c[g+4>>2]|0;n=+c7(i|0,l,m);if(n>=+c7(j|0,l,m)){o=h;return o|0}c[e>>2]=i;c[f>>2]=j;j=c[e>>2]|0;f=c[d>>2]|0;i=c[k>>2]|0;m=c[i>>2]|0;l=c[i+4>>2]|0;n=+c7(j|0,m,l);if(n>=+c7(f|0,m,l)){o=h+1|0;return o|0}c[d>>2]=j;c[e>>2]=f;f=c[d>>2]|0;e=c[b>>2]|0;j=c[k>>2]|0;l=c[j>>2]|0;m=c[j+4>>2]|0;n=+c7(f|0,l,m);if(n>=+c7(e|0,l,m)){o=h+2|0;return o|0}c[b>>2]=f;c[d>>2]=e;e=c[b>>2]|0;d=c[a>>2]|0;f=c[k>>2]|0;k=c[f>>2]|0;m=c[f+4>>2]|0;n=+c7(e|0,k,m);if(n>=+c7(d|0,k,m)){o=h+3|0;return o|0}c[a>>2]=e;c[b>>2]=d;o=h+4|0;return o|0}function dn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0;e=a+8|0;dk(a,a+4|0,e,d);f=a+12|0;if((f|0)==(b|0)){return}g=d|0;d=e;e=f;while(1){f=c[e>>2]|0;h=c[d>>2]|0;i=f|0;j=c[g>>2]|0;k=c[j>>2]|0;l=c[j+4>>2]|0;m=+c7(i,k,l);if(m<+c7(h|0,k,l)){l=d;k=e;j=h;while(1){c[k>>2]=j;if((l|0)==(a|0)){n=a;break}h=l-4|0;o=c[h>>2]|0;p=c[g>>2]|0;q=c[p>>2]|0;r=c[p+4>>2]|0;m=+c7(i,q,r);if(m<+c7(o|0,q,r)){k=l;l=h;j=o}else{n=l;break}}c[n>>2]=f}l=e+4|0;if((l|0)==(b|0)){break}else{d=e;e=l}}return}function dp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=b-a>>2;if((e|0)==2){f=b-4|0;g=c[f>>2]|0;h=c[a>>2]|0;i=c[d>>2]|0;j=c[i>>2]|0;k=c[i+4>>2]|0;l=+c7(g|0,j,k);if(l>=+c7(h|0,j,k)){m=1;return m|0}c[a>>2]=g;c[f>>2]=h;m=1;return m|0}else if((e|0)==3){dk(a,a+4|0,b-4|0,d);m=1;return m|0}else if((e|0)==0|(e|0)==1){m=1;return m|0}else if((e|0)==5){dm(a,a+4|0,a+8|0,a+12|0,b-4|0,d);m=1;return m|0}else if((e|0)==4){dl(a,a+4|0,a+8|0,b-4|0,d);m=1;return m|0}else{e=a+8|0;dk(a,a+4|0,e,d);h=a+12|0;if((h|0)==(b|0)){m=1;return m|0}f=d|0;d=e;e=0;g=h;while(1){h=c[g>>2]|0;k=c[d>>2]|0;j=h|0;i=c[f>>2]|0;n=c[i>>2]|0;o=c[i+4>>2]|0;l=+c7(j,n,o);if(l<+c7(k|0,n,o)){o=d;n=g;i=k;while(1){c[n>>2]=i;if((o|0)==(a|0)){p=a;break}k=o-4|0;q=c[k>>2]|0;r=c[f>>2]|0;s=c[r>>2]|0;t=c[r+4>>2]|0;l=+c7(j,s,t);if(l<+c7(q|0,s,t)){n=o;o=k;i=q}else{p=o;break}}c[p>>2]=h;o=e+1|0;if((o|0)==8){break}else{u=o}}else{u=e}o=g+4|0;if((o|0)==(b|0)){m=1;v=1832;break}else{d=g;e=u;g=o}}if((v|0)==1832){return m|0}m=(g+4|0)==(b|0);return m|0}return 0}function dq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0,ai=0.0,aj=0.0,ak=0,al=0.0;e=i;i=i+72|0;f=e|0;g=i;i=i+24|0;j=i;i=i+24|0;k=i;i=i+24|0;l=i;i=i+8|0;ln(f|0,0,72);m=a|0;a=g|0;n=g+8|0;o=g+16|0;p=j|0;q=j+8|0;r=j+16|0;s=d|0;t=b|0;u=d+8|0;v=b+8|0;w=d+16|0;x=b+16|0;y=k;z=k|0;A=k+8|0;B=k+16|0;C=0;D=0;L2327:while(1){E=c[(c[m>>2]|0)+(D<<2)>>2]|0;F=c[E>>2]|0;G=+h[F>>3];h[a>>3]=G;H=+h[F+8>>3];h[n>>3]=H;I=+h[F+16>>3];h[o>>3]=I;F=c[E+4>>2]|0;J=+h[F>>3];h[p>>3]=J;K=+h[F+8>>3];h[q>>3]=K;L=+h[F+16>>3];h[r>>3]=L;M=J-G;N=K-H;O=L-I;P=+h[s>>3];Q=P- +h[t>>3];R=+h[u>>3];S=R- +h[v>>3];T=+h[w>>3];U=T- +h[x>>3];V=M*M+0.0+N*N+O*O;F=V==0.0;if(F){X=0.0}else{X=+W(+V)}Y=Q*Q+0.0+S*S+U*U;if(Y==0.0){Z=0.0}else{Z=+W(+Y)}Y=M/X*(Q/Z)+0.0+N/X*(S/Z)+O/X*(U/Z);if(Y>0.0){_=Y}else{_=-0.0-Y}Y=_+-1.0;if(Y>0.0){$=Y}else{$=-0.0-Y}Y=+h[2492];do{if($<Y){U=P-G;S=R-H;Q=T-I;ln(y|0,0,16);h[z>>3]=U;h[A>>3]=S;h[B>>3]=Q;E=0;while(1){if((E|0)>=3){aa=1861;break L2327}ab=+h[k+(E<<3)>>3];if(ab>0.0){ac=ab}else{ac=-0.0-ab}if(ac<Y){E=E+1|0}else{break}}if(F){ad=0.0}else{ad=+W(+V)}ab=Q*Q+(U*U+0.0+S*S);if(ab==0.0){ae=0.0}else{ae=+W(+ab)}ab=M/ad*(U/ae)+0.0+N/ad*(S/ae)+O/ad*(Q/ae);if(ab>0.0){af=ab}else{af=-0.0-ab}ab=af+-1.0;if(ab>0.0){ag=ab}else{ag=-0.0-ab}if(ag<Y){aa=1861;break L2327}else{ah=C}}else{if(!(dr(l,g,j,b,d)|0)){ah=C;break}ab=+h[l>>3];ai=+h[2492];if(!(0.0-ai<ab&ai+1.0>ab)){ah=C;break}ai=N*ab+ +h[n>>3];aj=O*ab+ +h[o>>3];h[f+(C*24&-1)>>3]=+h[a>>3]+M*ab;h[f+(C*24&-1)+8>>3]=ai;h[f+(C*24&-1)+16>>3]=aj;ah=C+1|0}}while(0);F=D+1|0;if((F|0)<3){C=ah;D=F}else{break}}if((aa|0)==1861){h[t>>3]=G;h[v>>3]=H;h[x>>3]=I;h[s>>3]=J;h[u>>3]=K;h[w>>3]=L;ak=-1;i=e;return ak|0}if((ah|0)==3){aa=1864}else if((ah|0)==0){ak=0;i=e;return ak|0}L2372:do{if((aa|0)==1864){L=+h[2492];D=0;while(1){if((D|0)>=3){break}K=+h[f+(D<<3)>>3]- +h[f+24+(D<<3)>>3];if(K>0.0){al=K}else{al=-0.0-K}if(al<L){D=D+1|0}else{break L2372}}h[f+24>>3]=+h[f+48>>3];h[f+32>>3]=+h[f+56>>3];h[f+40>>3]=+h[f+64>>3]}}while(0);h[t>>3]=+h[f>>3];h[v>>3]=+h[f+8>>3];h[x>>3]=+h[f+16>>3];h[s>>3]=+h[f+24>>3];h[u>>3]=+h[f+32>>3];h[w>>3]=+h[f+40>>3];ak=ah;i=e;return ak|0}function dr(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0.0,J=0.0,K=0,L=0.0,M=0.0,N=0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0;f=i;i=i+144|0;g=f|0;j=f+24|0;k=f+48|0;l=f+72|0;m=f+96|0;n=f+120|0;o=+h[c>>3];p=+h[b>>3];q=o-p;r=+h[c+8>>3];s=+h[b+8>>3];t=r-s;u=+h[c+16>>3];v=+h[b+16>>3];w=u-v;ln(k|0,0,16);h[k>>3]=q;h[k+8>>3]=t;h[k+16>>3]=w;x=+h[e>>3];y=+h[d>>3];z=x-y;A=+h[e+8>>3];B=+h[d+8>>3];C=A-B;D=+h[e+16>>3];E=+h[d+16>>3];F=D-E;ln(l|0,0,16);h[l>>3]=z;h[l+8>>3]=C;h[l+16>>3]=F;G=+h[2492];d=0;while(1){if((d|0)>=3){H=1;break}I=+h[k+(d<<3)>>3];if(I>0.0){J=I}else{J=-0.0-I}if(J<G){d=d+1|0}else{H=0;break}}d=0;while(1){if((d|0)>=3){K=1885;break}J=+h[l+(d<<3)>>3];if(J>0.0){L=J}else{L=-0.0-J}if(L<G){d=d+1|0}else{break}}if((K|0)==1885){if(H){ln(m|0,0,16);h[m>>3]=(p+o)*.5;h[m+8>>3]=(s+r)*.5;h[m+16>>3]=(v+u)*.5;ln(n|0,0,16);h[n>>3]=(y+x)*.5;h[n+8>>3]=(B+A)*.5;h[n+16>>3]=(E+D)*.5;d=0;while(1){if((d|0)>=3){break}L=+h[m+(d<<3)>>3]- +h[n+(d<<3)>>3];if(L>0.0){M=L}else{M=-0.0-L}if(M<G){d=d+1|0}else{N=0;K=1933;break}}if((K|0)==1933){i=f;return N|0}h[a>>3]=.5;N=1;i=f;return N|0}else{M=(y+x)*.5-p;x=(B+A)*.5-s;A=(E+D)*.5-v;h[j>>3]=t*A-x*w;h[j+8>>3]=M*w-q*A;h[j+16>>3]=q*x-M*t;d=0;while(1){if((d|0)>=3){break}M=+h[j+(d<<3)>>3];if(M>0.0){O=M}else{O=-0.0-M}if(O<G){d=d+1|0}else{N=0;K=1927;break}}if((K|0)==1927){i=f;return N|0}h[a>>3]=.5;N=1;i=f;return N|0}}if(H){O=(p+o)*.5-y;o=(s+r)*.5-B;r=(v+u)*.5-E;h[g>>3]=C*r-o*F;h[g+8>>3]=O*F-z*r;h[g+16>>3]=z*o-O*C;H=0;while(1){if((H|0)>=3){break}O=+h[g+(H<<3)>>3];if(O>0.0){P=O}else{P=-0.0-O}if(P<G){H=H+1|0}else{N=0;K=1925;break}}if((K|0)==1925){i=f;return N|0}h[a>>3]=.5;N=1;i=f;return N|0}P=p-y;y=s-B;B=v-E;E=q*C-t*z;v=t*F-C*w;t=z*w-q*F;K=E>0.0;if(K){Q=E}else{Q=-0.0-E}H=v>0.0;if(H){R=v}else{R=-0.0-v}if(t>0.0){S=t}else{S=-0.0-t}q=Q>R?Q:R;R=q<S?S:q;if(R>0.0){T=R}else{T=-0.0-R}if(T<G){N=0;i=f;return N|0}if(K){U=E}else{U=-0.0-E}if(U==R){h[a>>3]=(y*z-P*C)/E;N=1;i=f;return N|0}if(H){V=v}else{V=-0.0-v}if(V==R){h[a>>3]=(B*C-y*F)/v;N=1;i=f;return N|0}else{h[a>>3]=(P*F-B*z)/t;N=1;i=f;return N|0}return 0}function ds(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0,aj=0.0,ak=0.0,al=0.0;e=i;i=i+72|0;f=e|0;g=f;j=i;i=i+24|0;k=i;i=i+24|0;l=i;i=i+24|0;m=i;i=i+8|0;n=i;i=i+8|0;o=dt(b,a)|0;do{if(o){if(dt(d,a)|0){p=2}else{break}i=e;return p|0}}while(0);q=+h[2492];r=0;while(1){if((r|0)>=3){p=0;s=2004;break}t=+h[b+(r<<3)>>3]- +h[d+(r<<3)>>3];if(t>0.0){u=t}else{u=-0.0-t}if(u<q){r=r+1|0}else{break}}if((s|0)==2004){i=e;return p|0}ln(g|0,0,72);g=d|0;r=b|0;q=+h[g>>3]- +h[r>>3];v=d+8|0;w=b+8|0;u=+h[v>>3]- +h[w>>3];x=d+16|0;y=b+16|0;t=+h[x>>3]- +h[y>>3];z=a|0;a=j|0;A=j+8|0;B=j+16|0;C=k|0;D=k+8|0;E=k+16|0;F=q*q+0.0+u*u+t*t;G=F==0.0;H=l;I=l|0;J=l+8|0;K=l+16|0;L=0;M=0;L2480:while(1){N=c[(c[z>>2]|0)+(M<<2)>>2]|0;O=c[N>>2]|0;P=+h[O>>3];h[a>>3]=P;Q=+h[O+8>>3];h[A>>3]=Q;R=+h[O+16>>3];h[B>>3]=R;O=c[N+4>>2]|0;S=+h[O>>3];h[C>>3]=S;T=+h[O+8>>3];h[D>>3]=T;U=+h[O+16>>3];h[E>>3]=U;V=S-P;X=T-Q;Y=U-R;if(G){Z=0.0}else{Z=+W(+F)}_=V*V+0.0+X*X+Y*Y;if(_==0.0){$=0.0}else{$=+W(+_)}_=q/Z*(V/$)+0.0+u/Z*(X/$)+t/Z*(Y/$);if(_>0.0){aa=_}else{aa=-0.0-_}_=aa+-1.0;if(_>0.0){ab=_}else{ab=-0.0-_}ac=+h[2492];do{if(ab<ac){_=+h[g>>3]-P;Y=+h[v>>3]-Q;X=+h[x>>3]-R;ln(H|0,0,16);h[I>>3]=_;h[J>>3]=Y;h[K>>3]=X;O=0;while(1){if((O|0)>=3){break L2480}V=+h[l+(O<<3)>>3];if(V>0.0){ad=V}else{ad=-0.0-V}if(ad<ac){O=O+1|0}else{break}}if(G){ae=0.0}else{ae=+W(+F)}V=X*X+(_*_+0.0+Y*Y);if(V==0.0){af=0.0}else{af=+W(+V)}V=q/ae*(_/af)+0.0+u/ae*(Y/af)+t/ae*(X/af);if(V>0.0){ag=V}else{ag=-0.0-V}V=ag+-1.0;if(V>0.0){ah=V}else{ah=-0.0-V}if(ah<ac){break L2480}else{ai=L}}else{if(!(dr(m,b,d,j,k)|0)){ai=L;break}V=+h[m>>3];aj=+h[2492];if(!(0.0-aj<V&aj+1.0>V)){ai=L;break}if(!(dr(n,j,k,b,d)|0)){ai=L;break}aj=+h[n>>3];ak=+h[2492];if(!(0.0-ak<aj&ak+1.0>aj)){ai=L;break}aj=u*V+ +h[w>>3];ak=t*V+ +h[y>>3];h[f+(L*24&-1)>>3]=+h[r>>3]+q*V;h[f+(L*24&-1)+8>>3]=aj;h[f+(L*24&-1)+16>>3]=ak;ai=L+1|0}}while(0);O=M+1|0;if((O|0)<3){L=ai;M=O}else{s=1989;break}}if((s|0)==1989){L2525:do{if((ai|0)==3){q=+h[2492];s=0;while(1){if((s|0)>=3){break}t=+h[f+(s<<3)>>3]- +h[f+24+(s<<3)>>3];if(t>0.0){al=t}else{al=-0.0-t}if(al<q){s=s+1|0}else{break L2525}}h[f+24>>3]=+h[f+48>>3];h[f+32>>3]=+h[f+56>>3];h[f+40>>3]=+h[f+64>>3]}else if((ai|0)==1){q=+h[f>>3];if(o){h[g>>3]=q;h[v>>3]=+h[f+8>>3];h[x>>3]=+h[f+16>>3];p=1;i=e;return p|0}else{h[r>>3]=q;h[w>>3]=+h[f+8>>3];h[y>>3]=+h[f+16>>3];p=1;i=e;return p|0}}else if((ai|0)==0){p=0;i=e;return p|0}}while(0);h[r>>3]=+h[f>>3];h[w>>3]=+h[f+8>>3];h[y>>3]=+h[f+16>>3];h[g>>3]=+h[f+24>>3];h[v>>3]=+h[f+32>>3];h[x>>3]=+h[f+40>>3];p=ai;i=e;return p|0}al=+c7(j,b,d);q=+c7(k,b,d);t=-0.0-ac;if(al<t&q<t){p=0;i=e;return p|0}do{if(ac<al+-1.0){if(ac<q+-1.0){p=0}else{break}i=e;return p|0}}while(0);d=al>0.0&al<1.0;if(al<q){if(d){h[r>>3]=P;h[w>>3]=Q;h[y>>3]=R}if(!(q>0.0&q<1.0)){p=-1;i=e;return p|0}h[g>>3]=S;h[v>>3]=T;h[x>>3]=U;p=-1;i=e;return p|0}else{if(d){h[g>>3]=P;h[v>>3]=Q;h[x>>3]=R}if(!(q>0.0&q<1.0)){p=-1;i=e;return p|0}h[r>>3]=S;h[w>>3]=T;h[y>>3]=U;p=-1;i=e;return p|0}return 0}function dt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0;d=i;i=i+24|0;e=d|0;h[e>>3]=+h[b+72>>3];h[e+8>>3]=+h[b+80>>3];h[e+16>>3]=+h[b+88>>3];f=b|0;b=c[c[f>>2]>>2]|0;g=(dh(a,c[b>>2]|0,c[b+4>>2]|0,e)|0)==1;b=c[(c[f>>2]|0)+4>>2]|0;j=(dh(a,c[b>>2]|0,c[b+4>>2]|0,e)|0)==1;if(g^j){k=0;i=d;return k|0}g=c[(c[f>>2]|0)+8>>2]|0;k=j^(dh(a,c[g>>2]|0,c[g+4>>2]|0,e)|0)==1^1;i=d;return k|0}function du(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,g=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0;f=+h[2492];do{if(f>+h[a+24>>3]- +h[b+48>>3]){if(f<=+h[a+32>>3]- +h[b+56>>3]){g=2022;break}if(f<=+h[a+40>>3]- +h[b+64>>3]){g=2022}}else{g=2022}}while(0);do{if((g|0)==2022){if(f<=+h[a+48>>3]- +h[b+24>>3]){i=0;return i|0}if(f<=+h[a+56>>3]- +h[b+32>>3]){i=0;return i|0}if(f>+h[a+64>>3]- +h[b+40>>3]){break}else{i=0}return i|0}}while(0);if(((c[a+4>>2]|0)-(c[a>>2]|0)|0)!=12){i=0;return i|0}if(((c[b+4>>2]|0)-(c[b>>2]|0)|0)!=12){i=0;return i|0}j=+h[a+96>>3];k=+h[a+104>>3];l=+h[a+112>>3];m=+h[b+96>>3];n=+h[b+104>>3];o=+h[b+112>>3];p=+h[a+72>>3];q=+h[a+80>>3];r=+h[a+88>>3];s=+h[b+72>>3];t=+h[b+80>>3];u=+h[b+88>>3];v=r*r+(p*p+0.0+q*q);if(v==0.0){w=0.0}else{w=+W(+v)}v=u*u+(s*s+0.0+t*t);if(v==0.0){x=0.0}else{x=+W(+v)}v=p/w*(s/x)+0.0+q/w*(t/x)+r/w*(u/x);if(v>0.0){y=v}else{y=-0.0-v}v=y+-1.0;if(v>0.0){z=v}else{z=-0.0-v}if(z<f){z=(j-m)*p+0.0+(k-n)*q+(l-o)*r;if(z>0.0){A=z}else{A=-0.0-z}i=A<f?2:0;return i|0}A=p*s+0.0+q*t+r*u;z=q*u-r*t;v=r*s-p*u;y=p*t-q*s;x=y*y+(v*v+(z*z+0.0));if(x==0.0){B=0.0}else{B=+W(+x)}x=z/B;z=v/B;v=y/B;if(A>0.0){C=A}else{C=-0.0-A}if(C<f){f=(j-m)*s+0.0+(k-n)*t+(l-o)*u;C=(m-j)*p+0.0+(n-k)*q+(o-l)*r;A=(m-p*C+(j-s*f))*.5;B=(n-q*C+(k-t*f))*.5;y=(o-r*C+(l-u*f))*.5;h[d>>3]=A;h[d+8>>3]=B;h[d+16>>3]=y;D=A;E=B;F=y}else{y=q*v-r*z;B=r*x-p*v;r=p*z-q*x;q=t*v-u*z;p=u*x-s*v;u=s*z-t*x;t=j-m;s=k-n;A=l-o;f=u*B-r*p;C=r*q-u*y;w=p*y-B*q;G=(A*w+(s*C+(t*f+0.0)))/(w*w+(C*C+(f*f+0.0)));H=m+(t-f*G);t=n+(s-C*G);s=o+(A-w*G);G=v*w+(z*C+(x*f+0.0));f=v*(B*H-y*t)+(z*(y*s-r*H)+(x*(r*t-B*s)+0.0));s=v*(m*p-n*q)+(z*(o*q-m*u)+(x*(n*u-o*p)+0.0));o=(y*s-q*f)/G;q=(B*s-p*f)/G;p=(r*s-u*f)/G;G=y*(o-j)+0.0+B*(q-k)+r*(p-l);f=(o+(j+y*G))*.5;y=(q+(k+B*G))*.5;B=(p+(l+r*G))*.5;h[d>>3]=f;h[d+8>>3]=y;h[d+16>>3]=B;D=f;E=y;F=B}h[e>>3]=x+D;h[e+8>>3]=z+E;h[e+16>>3]=v+F;I=dq(a,d,e)|0;if((I|0)==0){i=0;return i|0}a=ds(b,d,e)|0;if((a|0)==0){i=0;return i|0}F=+h[2492];b=0;while(1){if((b|0)>=3){i=0;g=2061;break}v=+h[d+(b<<3)>>3]- +h[e+(b<<3)>>3];if(v>0.0){J=v}else{J=-0.0-v}if(J<F){b=b+1|0}else{break}}if((g|0)==2061){return i|0}g=(I|0)==-1;I=g^1;b=(a|0)==-1;if(!(b|I)){i=4;return i|0}a=b^1;if(!(g|a)){i=5;return i|0}i=I|a?1:6;return i|0}function dv(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0,C=0.0,D=0,E=0.0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0;f=i;i=i+48|0;g=f|0;j=f+24|0;if((c[d+4>>2]|0)-(c[d>>2]|0)>>2>>>0<3){k=0;i=f;return k|0}l=+h[2492];m=0;while(1){if((m|0)>=3){k=2;n=2112;break}o=+h[a+(m<<3)>>3]- +h[d+96+(m<<3)>>3];if(o>0.0){p=o}else{p=-0.0-o}if(p<l){m=m+1|0}else{break}}if((n|0)==2112){i=f;return k|0}p=+h[d+24>>3];o=+h[d+32>>3];q=+h[d+40>>3];r=(p+ +h[d+48>>3])*.5;s=(o+ +h[d+56>>3])*.5;t=(q+ +h[d+64>>3])*.5;n=a|0;u=+h[n>>3];v=r-u;m=a+8|0;w=+h[m>>3];x=s-w;y=a+16|0;z=+h[y>>3];A=t-z;B=b|0;C=+h[B>>3];D=b+8|0;E=+h[D>>3];F=b+16|0;G=+h[F>>3];H=G*G+(C*C+0.0+E*E);if(H==0.0){I=0.0}else{I=+W(+H)}H=C/I;C=E/I;E=G/I;I=v*H+0.0+x*C+A*E;G=H*I-v;v=C*I-x;x=E*I-A;A=r-p;p=s-o;o=t-q;q=x*x+(v*v+(G*G+0.0));if(q==0.0){J=0.0}else{J=+W(+q)}if(A*A+0.0+p*p+o*o<J){k=0;i=f;return k|0}J=+h[d+72>>3];o=+h[d+80>>3];p=+h[d+88>>3];A=H*J+0.0+C*o+E*p;if(A>0.0){K=A}else{K=-0.0-A}q=+h[d+96>>3]-u;G=+h[d+104>>3]-w;v=+h[d+112>>3]-z;if(K>=l){K=(J*q+0.0+o*G+p*v)/A;h[e>>3]=u+H*K;h[e+8>>3]=w+C*K;h[e+16>>3]=z+E*K;do{if(dw(e,d)|0){if(K>0.0){L=K}else{L=-0.0-K}z=+h[2492];if(L<z){k=2;i=f;return k|0}if(z<K){k=1}else{break}i=f;return k|0}}while(0);k=0;i=f;return k|0}K=q*J+0.0+G*o+v*p;if(K>0.0){M=K}else{M=-0.0-K}if(M>=l){k=0;i=f;return k|0}if(dw(a,d)|0){k=2;i=f;return k|0}l=+h[n>>3];a=g|0;h[a>>3]=l;M=+h[m>>3];e=g+8|0;h[e>>3]=M;K=+h[y>>3];b=g+16|0;h[b>>3]=K;p=l+ +h[B>>3];l=M+ +h[D>>3];M=K+ +h[F>>3];ln(j|0,0,16);h[j>>3]=p;h[j+8>>3]=l;h[j+16>>3]=M;do{if((dq(d,g,j)|0)!=0){M=+h[a>>3];l=+h[e>>3];p=+h[b>>3];if(H*((M+M)*.5- +h[n>>3])+0.0+C*((l+l)*.5- +h[m>>3])+E*((p+p)*.5- +h[y>>3])>0.0){k=3}else{break}i=f;return k|0}}while(0);k=0;i=f;return k|0}function dw(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0;d=i;i=i+24|0;e=d|0;h[e>>3]=+h[b+72>>3];h[e+8>>3]=+h[b+80>>3];h[e+16>>3]=+h[b+88>>3];f=b|0;b=c[c[f>>2]>>2]|0;g=((dh(a,c[b>>2]|0,c[b+4>>2]|0,e)|0)-1|0)>>>0<2;b=c[(c[f>>2]|0)+4>>2]|0;j=((dh(a,c[b>>2]|0,c[b+4>>2]|0,e)|0)-1|0)>>>0<2;if(g^j){k=0;i=d;return k|0}g=c[(c[f>>2]|0)+8>>2]|0;k=j^((dh(a,c[g>>2]|0,c[g+4>>2]|0,e)|0)-1|0)>>>0<2^1;i=d;return k|0}function dx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+128|0;f=e|0;g=e+64|0;j=f;k=f+48|0;l=f|0;m=a|0;n=f|0;o=f+8|0;p=f+16|0;q=f+24|0;r=q|0;s=f+32|0;t=f+40|0;u=f+52|0;v=f+56|0;w=d+4|0;x=d+8|0;y=f+24|0;z=f+52|0;A=0;do{ln(j|0,0,40);c[k>>2]=2;B=c[(c[m>>2]|0)+(A<<2)>>2]|0;C=c[B>>2]|0;h[n>>3]=+h[C>>3];h[o>>3]=+h[C+8>>3];h[p>>3]=+h[C+16>>3];C=c[B+4>>2]|0;h[r>>3]=+h[C>>3];h[s>>3]=+h[C+8>>3];h[t>>3]=+h[C+16>>3];do{if((ds(b,l,q)|0)>0){c[u>>2]=b;c[v>>2]=a;C=c[w>>2]|0;if((C|0)==(c[x>>2]|0)){c$(d,f);break}if((C|0)==0){D=0}else{h[C>>3]=+h[n>>3];h[C+8>>3]=+h[o>>3];h[C+16>>3]=+h[p>>3];h[C+24>>3]=+h[y>>3];h[C+32>>3]=+h[s>>3];h[C+40>>3]=+h[t>>3];c[C+48>>2]=c[k>>2];B=C+52|0;C=c[z+4>>2]|0;c[B>>2]=c[z>>2];c[B+4>>2]=C;D=c[w>>2]|0}c[w>>2]=D+64}}while(0);A=A+1|0;}while((A|0)<3);A=g;D=g+48|0;z=g|0;k=b|0;t=g|0;s=g+8|0;y=g+16|0;p=g+24|0;o=p|0;n=g+32|0;f=g+40|0;v=g+52|0;u=g+56|0;q=g+24|0;l=g+52|0;r=0;do{ln(A|0,0,40);c[D>>2]=2;m=c[(c[k>>2]|0)+(r<<2)>>2]|0;j=c[m>>2]|0;h[t>>3]=+h[j>>3];h[s>>3]=+h[j+8>>3];h[y>>3]=+h[j+16>>3];j=c[m+4>>2]|0;h[o>>3]=+h[j>>3];h[n>>3]=+h[j+8>>3];h[f>>3]=+h[j+16>>3];do{if((ds(a,z,p)|0)>0){c[v>>2]=a;c[u>>2]=b;j=c[w>>2]|0;if((j|0)==(c[x>>2]|0)){c$(d,g);break}if((j|0)==0){E=0}else{h[j>>3]=+h[t>>3];h[j+8>>3]=+h[s>>3];h[j+16>>3]=+h[y>>3];h[j+24>>3]=+h[q>>3];h[j+32>>3]=+h[n>>3];h[j+40>>3]=+h[f>>3];c[j+48>>2]=c[D>>2];m=j+52|0;j=c[l+4>>2]|0;c[m>>2]=c[l>>2];c[m+4>>2]=j;E=c[w>>2]|0}c[w>>2]=E+64}}while(0);r=r+1|0;}while((r|0)<3);i=e;return 1}function dy(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,i=0.0,j=0,k=0,l=0.0,m=0,n=0.0,o=0.0,p=0,q=0.0,r=0,s=0.0,t=0.0,u=0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0.0,M=0,N=0.0,O=0,P=0.0,Q=0,R=0.0;if(!(a[20200]|0)){ln(11128,0,24);a[20200]=1}if(!(a[20192]|0)){ln(11104,0,24);a[20192]=1}if(!(a[20184]|0)){ln(11080,0,24);a[20184]=1}if(!(a[20176]|0)){ln(11056,0,24);a[20176]=1}if(!(a[20168]|0)){ln(11032,0,24);a[20168]=1}if(!(a[20160]|0)){ln(11008,0,24);a[20160]=1}if(!(a[20232]|0)){ln(11224,0,24);a[20232]=1}if(!(a[20224]|0)){ln(11200,0,24);a[20224]=1}if(!(a[20216]|0)){ln(11176,0,24);a[20216]=1}if(!(a[20208]|0)){ln(11152,0,24);a[20208]=1}f=c|0;g=b|0;i=+h[f>>3]- +h[g>>3];j=c+8|0;k=b+8|0;l=+h[j>>3]- +h[k>>3];m=c+16|0;c=b+16|0;n=+h[m>>3]- +h[c>>3];h[1391]=i;h[1392]=l;h[1393]=n;b=e|0;o=+h[b>>3]- +h[g>>3];p=e+8|0;q=+h[p>>3]- +h[k>>3];r=e+16|0;s=+h[r>>3]- +h[c>>3];h[1388]=o;h[1389]=q;h[1390]=s;e=d|0;t=+h[e>>3]- +h[g>>3];u=d+8|0;v=+h[u>>3]- +h[k>>3];w=d+16|0;x=+h[w>>3]- +h[c>>3];h[1385]=t;h[1386]=v;h[1387]=x;y=+h[b>>3]- +h[e>>3];z=+h[p>>3]- +h[u>>3];A=+h[r>>3]- +h[w>>3];h[1382]=y;h[1383]=z;h[1384]=A;B=+h[f>>3]- +h[e>>3];C=+h[j>>3]- +h[u>>3];D=+h[m>>3]- +h[w>>3];h[1379]=B;h[1380]=C;h[1381]=D;E=+h[g>>3]- +h[e>>3];F=+h[k>>3]- +h[u>>3];G=+h[c>>3]- +h[w>>3];h[1376]=E;h[1377]=F;h[1378]=G;H=l*s-q*n;I=n*o-s*i;s=q*i-l*o;h[1403]=H;h[1404]=I;h[1405]=s;o=l*x-v*n;q=n*t-x*i;x=v*i-l*t;h[1400]=o;h[1401]=q;h[1402]=x;t=z*D-C*A;l=A*B-D*y;D=C*y-z*B;h[1397]=t;h[1398]=l;h[1399]=D;B=z*G-F*A;C=A*E-G*y;G=F*y-z*E;h[1394]=B;h[1395]=C;h[1396]=G;do{if(H*o+0.0+I*q+s*x<0.0){if(t*B+0.0+l*C+G*D<0.0){J=1}else{break}return J|0}}while(0);D=+h[2492];d=0;while(1){if((d|0)>=3){K=2168;break}G=+h[11224+(d<<3)>>3];if(G>0.0){L=G}else{L=-0.0-G}if(L<D){d=d+1|0}else{M=0;break}}do{if((K|0)==2168){L=+h[b>>3];G=+h[p>>3];C=+h[r>>3];if((+h[g>>3]-L)*(+h[f>>3]-L)+0.0+(+h[k>>3]-G)*(+h[j>>3]-G)+(+h[c>>3]-C)*(+h[m>>3]-C)<0.0){J=1}else{M=0;break}return J|0}}while(0);while(1){if((M|0)>=3){K=2173;break}C=+h[11200+(M<<3)>>3];if(C>0.0){N=C}else{N=-0.0-C}if(N<D){M=M+1|0}else{O=0;break}}do{if((K|0)==2173){N=+h[e>>3];C=+h[u>>3];G=+h[w>>3];if((+h[g>>3]-N)*(+h[f>>3]-N)+0.0+(+h[k>>3]-C)*(+h[j>>3]-C)+(+h[c>>3]-G)*(+h[m>>3]-G)<0.0){J=1}else{O=0;break}return J|0}}while(0);while(1){if((O|0)>=3){K=2178;break}G=+h[11176+(O<<3)>>3];if(G>0.0){P=G}else{P=-0.0-G}if(P<D){O=O+1|0}else{Q=0;break}}do{if((K|0)==2178){P=+h[f>>3];G=+h[j>>3];C=+h[m>>3];if((P- +h[e>>3])*(P- +h[b>>3])+0.0+(G- +h[u>>3])*(G- +h[p>>3])+(C- +h[w>>3])*(C- +h[r>>3])<0.0){J=1}else{Q=0;break}return J|0}}while(0);while(1){if((Q|0)>=3){break}C=+h[11152+(Q<<3)>>3];if(C>0.0){R=C}else{R=-0.0-C}if(R<D){Q=Q+1|0}else{J=0;K=2190;break}}if((K|0)==2190){return J|0}D=+h[g>>3];R=+h[k>>3];C=+h[c>>3];J=(D- +h[e>>3])*(D- +h[b>>3])+0.0+(R- +h[u>>3])*(R- +h[p>>3])+(C- +h[w>>3])*(C- +h[r>>3])<0.0;return J|0}function dz(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[a>>2]=b;c[a+4>>2]=d;c[a+16>>2]=e;c[a+64>>2]=0;ln(a+20|0,0,24);e=la(456)|0;c[e>>2]=0;c[a+48>>2]=e;c[e+4>>2]=0;h[a+56>>3]=4.1887898445129395;c[a+88>>2]=0;e=la(456)|0;c[e>>2]=0;c[a+72>>2]=e;c[e+4>>2]=0;h[a+80>>3]=4.1887898445129395;c[a+96>>2]=0;c[a+100>>2]=0;c[a+104>>2]=0;e=la(80)|0;dI(e,b);c[a+8>>2]=e;e=la(80)|0;dI(e,d);c[a+12>>2]=e;return}function dA(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;i=i+80|0;d=b|0;e=b+16|0;f=b+24|0;g=b+32|0;j=b+40|0;k=b+48|0;l=b+56|0;m=b+64|0;n=b+72|0;o=a+20|0;p=c[o>>2]|0;q=a+24|0;r=c[q>>2]|0;if((p|0)!=(r|0)){c[q>>2]=r+((((r-64|0)+(-p|0)|0)>>>6^-1)<<6)}p=a+48|0;co(c[a+8>>2]|0,p);r=a+12|0;q=a+72|0;co(c[r>>2]|0,q);cq(0,c[r>>2]|0,p,q,o);q=d|0;c[q>>2]=0;p=d+4|0;c[p>>2]=0;c[d+8>>2]=0;cr(o,d);d=la(160)|0;ln(d|0,0,40);h[d+24>>3]=-3.4028234663852886e+38;h[d+32>>3]=-3.4028234663852886e+38;h[d+40>>3]=-3.4028234663852886e+38;h[d+48>>3]=3.4028234663852886e+38;h[d+56>>3]=3.4028234663852886e+38;h[d+64>>3]=3.4028234663852886e+38;ln(d+72|0,0,72);h[d+128>>3]=1.0;h[d+136>>3]=1.0;h[d+144>>3]=1.0;h[d+152>>3]=1.0;o=a+16|0;c[(c[o>>2]|0)+16>>2]=d;d=c[(c[o>>2]|0)+16>>2]|0;h[d+128>>3]=1.0;ln(d+136|0,0,16);h[d+152>>3]=1.0;d=c[q>>2]|0;r=c[o>>2]|0;if((c[p>>2]|0)==(d|0)){s=r}else{t=0;u=d;d=r;while(1){r=c[d+16>>2]|0;v=u+(t<<2)|0;w=r+4|0;x=c[w>>2]|0;if((x|0)==(c[r+8>>2]|0)){c1(r|0,v)}else{if((x|0)==0){y=0}else{c[x>>2]=c[v>>2];y=c[w>>2]|0}c[w>>2]=y+4}w=t+2|0;v=c[q>>2]|0;x=c[o>>2]|0;if(w>>>0<(c[p>>2]|0)-v>>2>>>0){t=w;u=v;d=x}else{s=x;break}}}c[e>>2]=c[s+8>>2];d=c[a>>2]|0;c[f>>2]=c[d+4>>2];c[g>>2]=c[d+8>>2];cz(j,s+4|0,e,f,g);g=c[o>>2]|0;c[k>>2]=c[g+8>>2];o=c[a+4>>2]|0;c[l>>2]=c[o+4>>2];c[m>>2]=c[o+8>>2];cz(n,g+4|0,k,l,m);m=c[q>>2]|0;if((m|0)==0){i=b;return}q=c[p>>2]|0;if((m|0)!=(q|0)){c[p>>2]=q+((((q-4|0)+(-m|0)|0)>>>2^-1)<<2)}le(m);i=b;return}function dB(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a+16|0;d=c[b>>2]|0;e=c[d+4>>2]|0;f=d+8|0;d=c[f>>2]|0;if((e|0)!=(d|0)){c[f>>2]=d+((((d-4|0)+(-e|0)|0)>>>2^-1)<<2)}e=c[a+20>>2]|0;d=a+24|0;if((e|0)==(c[d>>2]|0)){g=c[b>>2]|0;c6(g);return}else{h=e}do{e=h+52|0;a=c[e>>2]|0;do{if(c2(a)|0){if((c[h+48>>2]|0)==4){break}cw(a);f=c[b>>2]|0;i=f+8|0;j=c[i>>2]|0;if((j|0)==(c[f+12>>2]|0)){cW(f+4|0,e);break}if((j|0)==0){k=0}else{c[j>>2]=c[e>>2];k=c[i>>2]|0}c[i>>2]=k+4}}while(0);e=h+56|0;a=c[e>>2]|0;do{if(c2(a)|0){if((c[h+48>>2]|0)==5){break}cw(a);i=c[b>>2]|0;j=i+8|0;f=c[j>>2]|0;if((f|0)==(c[i+12>>2]|0)){cW(i+4|0,e);break}if((f|0)==0){l=0}else{c[f>>2]=c[e>>2];l=c[j>>2]|0}c[j>>2]=l+4}}while(0);h=h+64|0;}while((h|0)!=(c[d>>2]|0));g=c[b>>2]|0;c6(g);return}function dC(a){a=a|0;var b=0,d=0,e=0,f=0;b=c[a+8>>2]|0;if((b|0)!=0){bW[c[(c[b>>2]|0)+4>>2]&255](b)}b=c[a+12>>2]|0;if((b|0)!=0){bW[c[(c[b>>2]|0)+4>>2]&255](b)}b=c[a+96>>2]|0;d=b;if((b|0)!=0){e=a+100|0;f=c[e>>2]|0;if((b|0)!=(f|0)){c[e>>2]=f+((((f-4|0)+(-d|0)|0)>>>2^-1)<<2)}le(b)}b=a+72|0;cH(b,c[b>>2]|0);b=a+48|0;cH(b,c[b>>2]|0);b=c[a+32>>2]|0;d=b;if((b|0)!=0){f=a+36|0;e=c[f>>2]|0;if((b|0)!=(e|0)){c[f>>2]=e+((((e-4|0)+(-d|0)|0)>>>2^-1)<<2)}le(b)}b=c[a+20>>2]|0;if((b|0)==0){return}d=a+24|0;a=c[d>>2]|0;if((b|0)!=(a|0)){c[d>>2]=a+((((a-64|0)+(-b|0)|0)>>>6^-1)<<6)}le(b);return}function dD(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0.0,R=0,S=0.0,T=0.0,U=0,V=0,W=0,X=0,Y=0,Z=0;d=i;i=i+144|0;e=d|0;f=d+16|0;g=d+32|0;j=d+40|0;k=d+48|0;l=d+56|0;m=d+64|0;n=d+72|0;o=d+80|0;p=d+88|0;q=d+96|0;r=d+104|0;s=d+112|0;t=d+120|0;u=d+128|0;v=d+136|0;w=e|0;c[w>>2]=0;x=e+4|0;c[x>>2]=0;y=e+8|0;c[y>>2]=0;z=f|0;c[z>>2]=0;A=f+4|0;c[A>>2]=0;B=f+8|0;c[B>>2]=0;C=b+4|0;D=b|0;E=c[D>>2]|0;F=b+120|0;if((c[C>>2]|0)-E>>2>>>0>=3){G=b+72|0;H=G|0;I=b+80|0;J=b+88|0;K=0;L=E;do{c[g>>2]=c[L+(K<<2)>>2];E=la(160)|0;M=E;N=c[F>>2]|0;ln(E|0,0,40);h[E+24>>3]=-3.4028234663852886e+38;h[E+32>>3]=-3.4028234663852886e+38;h[E+40>>3]=-3.4028234663852886e+38;h[E+48>>3]=3.4028234663852886e+38;h[E+56>>3]=3.4028234663852886e+38;h[E+64>>3]=3.4028234663852886e+38;ln(E+72|0,0,48);c[E+120>>2]=N;ln(E+124|0,0,20);h[E+128>>3]=1.0;h[E+136>>3]=1.0;h[E+144>>3]=1.0;h[E+152>>3]=1.0;c[j>>2]=M;c1(E,g);do{if(cx(b,M,1)|0){if(!(db(M)|0)){O=0;break}N=c5(E,G)|0;P=E+72|0;Q=+h[H>>3];if(N){h[P>>3]=Q;h[E+80>>3]=+h[I>>3];h[E+88>>3]=+h[J>>3];N=c[A>>2]|0;if((N|0)==(c[B>>2]|0)){cW(f,j);O=0;break}if((N|0)==0){R=0}else{c[N>>2]=M;R=c[A>>2]|0}c[A>>2]=R+4;O=0;break}else{S=-0.0- +h[I>>3];T=-0.0- +h[J>>3];h[P>>3]=-0.0-Q;h[E+80>>3]=S;h[E+88>>3]=T;P=c[x>>2]|0;if((P|0)==(c[y>>2]|0)){cW(e,j);O=0;break}if((P|0)==0){U=0}else{c[P>>2]=M;U=c[x>>2]|0}c[x>>2]=U+4;O=0;break}}else{O=K}}while(0);K=O+1|0;L=c[D>>2]|0;M=(c[C>>2]|0)-L>>2;}while(!(K>>>0>=M>>>0|M>>>0<3))}K=c[F>>2]|0;L2926:do{if((K|0)!=0){c[F>>2]=0;L=c[K+4>>2]|0;C=K+8|0;D=c[C>>2]|0;O=L;U=0;while(1){if((O|0)==(D|0)){break L2926}V=U;W=O+4|0;if((c[O>>2]|0)==(b|0)){break}else{O=W;U=U-4|0}}U=D-W|0;j=U>>2;lk(O|0,W|0,U|0);U=c[C>>2]|0;if((O+(j<<2)|0)==(U|0)){break}c[C>>2]=U+(((V+((U-4|0)+(-(L+(j<<2)|0)|0)|0)|0)>>>2^-1)<<2)}}while(0);V=c[z>>2]|0;W=c[A>>2]|0;if((V|0)==(W|0)){X=V;Y=V}else{b=V;K=W;W=V;while(1){L2937:do{if((W|0)!=(K|0)){V=W;L2938:while(1){F=c[V>>2]|0;j=c[b>>2]|0;U=F|0;e=c[c[U>>2]>>2]|0;y=F+72|0;J=(dh(c[c[c[j>>2]>>2]>>2]|0,c[e>>2]|0,c[e+4>>2]|0,y)|0)==1;e=F+4|0;F=c[U>>2]|0;do{F=F+4|0;if((F|0)==(c[e>>2]|0)){break L2938}U=c[F>>2]|0;}while(!(J^(dh(c[c[c[j>>2]>>2]>>2]|0,c[U>>2]|0,c[U+4>>2]|0,y)|0)==1));y=V+4|0;if((y|0)==(c[A>>2]|0)){break L2937}else{V=y}}y=c[V>>2]|0;j=c[b>>2]|0;J=y+16|0;F=c[J>>2]|0;if((F|0)==(c[y+20>>2]|0)){cI(y+12|0,j);break}if((F|0)==0){Z=0}else{cJ(F,j);Z=c[J>>2]|0}c[J>>2]=Z+12}}while(0);L=b+4|0;C=c[A>>2]|0;O=c[z>>2]|0;if((L|0)==(C|0)){X=O;Y=L;break}else{b=L;K=C;W=O}}}W=a+16|0;K=c[W>>2]|0;c[k>>2]=c[K+8>>2];c[l>>2]=X;c[m>>2]=Y;cz(n,K+4|0,k,l,m);m=c[W>>2]|0;c[o>>2]=c[m+8>>2];c[p>>2]=c[w>>2];c[q>>2]=c[x>>2];cz(r,m+4|0,o,p,q);c[s>>2]=c[a+36>>2];c[t>>2]=c[z>>2];c[u>>2]=c[A>>2];cz(v,a+32|0,s,t,u);u=c[z>>2]|0;z=u;if((u|0)!=0){t=c[A>>2]|0;if((u|0)!=(t|0)){c[A>>2]=t+((((t-4|0)+(-z|0)|0)>>>2^-1)<<2)}le(u)}u=c[w>>2]|0;if((u|0)==0){i=d;return}w=c[x>>2]|0;if((u|0)!=(w|0)){c[x>>2]=w+((((w-4|0)+(-u|0)|0)>>>2^-1)<<2)}le(u);i=d;return}function dE(b){b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0;d=c[b+32>>2]|0;e=b+36|0;f=c[e>>2]|0;if((d|0)!=(f|0)){c[e>>2]=f+((((f-4|0)+(-d|0)|0)>>>2^-1)<<2)}d=c[b+20>>2]|0;f=b+24|0;if((d|0)!=(c[f>>2]|0)){e=d;do{d=c[e+52>>2]|0;do{if(c2(d)|0){if((c[e+48>>2]|0)==4){break}dD(b,d)}}while(0);d=c[e+56>>2]|0;do{if(c2(d)|0){if((c[e+48>>2]|0)==5){break}dD(b,d)}}while(0);e=e+64|0;}while((e|0)!=(c[f>>2]|0))}f=b+16|0;b=c[f>>2]|0;e=c[b+4>>2]|0;if((e|0)==(c[b+8>>2]|0)){g=b;c6(g);return}else{i=e}while(1){e=c[i>>2]|0;if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;j=0.0;k=0.0;l=0.0}else{j=+h[1373];k=+h[1374];l=+h[1375]}b=e+96|0;h[b>>3]=j;d=e+104|0;h[d>>3]=k;m=e+112|0;h[m>>3]=l;n=c[e>>2]|0;o=c[e+4>>2]|0;if((n|0)!=(o|0)){e=n;p=j;q=k;r=l;do{s=c[c[e>>2]>>2]|0;p=p+ +h[s>>3];h[b>>3]=p;q=q+ +h[s+8>>3];h[d>>3]=q;r=r+ +h[s+16>>3];h[m>>3]=r;e=e+4|0;}while((e|0)!=(o|0));t=+(o-n>>2>>>0>>>0);h[b>>3]=p/t;h[d>>3]=q/t;h[m>>3]=r/t}e=i+4|0;s=c[f>>2]|0;if((e|0)==(c[s+8>>2]|0)){g=s;break}else{i=e}}c6(g);return}function dF(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0;d=i;i=i+104|0;e=d|0;f=d+48|0;g=d+96|0;j=b+16|0;k=c[j>>2]|0;l=c[k+4>>2]|0;m=k+8|0;k=c[m>>2]|0;if((l|0)!=(k|0)){c[m>>2]=k+((((k-4|0)+(-l|0)|0)>>>2^-1)<<2)}l=c[b+32>>2]|0;k=b+36|0;if((l|0)!=(c[k>>2]|0)){m=l;do{dM(c[m>>2]|0,(c[j>>2]|0)+4|0);m=m+4|0;}while((m|0)!=(c[k>>2]|0))}k=c[j>>2]|0;m=c[k+4>>2]|0;if((m|0)==(c[k+8>>2]|0)){n=k;c6(n);i=d;return}k=b+8|0;l=b+48|0;o=f|0;p=f+24|0;q=f+8|0;r=f+32|0;s=f+16|0;t=f+40|0;u=l|0;v=b+64|0;w=b+72|0;x=e|0;y=e+24|0;z=e+8|0;A=e+32|0;B=e+16|0;C=e+40|0;D=w|0;E=b+88|0;b=m;do{m=c[b>>2]|0;c[g>>2]=m;F=m+24|0;G=m+48|0;if((c[m+120>>2]|0)==(c[k>>2]|0)){h[o>>3]=+h[F>>3];h[p>>3]=+h[G>>3];h[q>>3]=+h[m+32>>3];h[r>>3]=+h[m+56>>3];h[s>>3]=+h[m+40>>3];h[t>>3]=+h[m+64>>3];cM(l,f,g,u,0);c[v>>2]=(c[v>>2]|0)+1}else{h[x>>3]=+h[F>>3];h[y>>3]=+h[G>>3];h[z>>3]=+h[m+32>>3];h[A>>3]=+h[m+56>>3];h[B>>3]=+h[m+40>>3];h[C>>3]=+h[m+64>>3];cM(w,e,g,D,0);c[E>>2]=(c[E>>2]|0)+1}b=b+4|0;H=c[j>>2]|0;}while((b|0)!=(c[H+8>>2]|0));E=c[H+4>>2]|0;if((E|0)==(b|0)){n=H;c6(n);i=d;return}else{I=E}while(1){E=c[I>>2]|0;if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;J=0.0;K=0.0;L=0.0}else{J=+h[1373];K=+h[1374];L=+h[1375]}H=E+96|0;h[H>>3]=J;b=E+104|0;h[b>>3]=K;D=E+112|0;h[D>>3]=L;g=c[E>>2]|0;e=c[E+4>>2]|0;if((g|0)!=(e|0)){E=g;M=J;N=K;O=L;do{w=c[c[E>>2]>>2]|0;M=M+ +h[w>>3];h[H>>3]=M;N=N+ +h[w+8>>3];h[b>>3]=N;O=O+ +h[w+16>>3];h[D>>3]=O;E=E+4|0;}while((E|0)!=(e|0));P=+(e-g>>2>>>0>>>0);h[H>>3]=M/P;h[b>>3]=N/P;h[D>>3]=O/P}E=I+4|0;w=c[j>>2]|0;if((E|0)==(c[w+8>>2]|0)){n=w;break}else{I=E}}c6(n);i=d;return}function dG(b){b=b|0;return(a[b+72|0]&1)!=0|0}function dH(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=i;i=i+64|0;d=b|0;e=b+8|0;f=b+16|0;g=b+32|0;h=b+40|0;j=b+48|0;k=a+16|0;l=a+8|0;m=a+12|0;ct((c[k>>2]|0)+4|0,c[l>>2]|0,c[m>>2]|0,a+48|0,a+72|0,c[a>>2]|0,c[a+4>>2]|0);n=a+96|0;a=c[k>>2]|0;o=a+4|0;if((n|0)==(o|0)){p=a}else{dL(n,c[o>>2]|0,c[a+8>>2]|0);p=c[k>>2]|0}c[d>>2]=c[p+8>>2];a=c[l>>2]|0;c[e>>2]=c[a+4>>2];c[f>>2]=c[a+8>>2];cz(b+24|0,p+4|0,d,e,f);f=c[k>>2]|0;c[g>>2]=c[f+8>>2];k=c[m>>2]|0;c[h>>2]=c[k+4>>2];c[j>>2]=c[k+8>>2];cz(b+56|0,f+4|0,g,h,j);i=b;return}function dI(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+8|0;f=e|0;c[b>>2]=13920;g=b+4|0;c[g>>2]=0;j=b+8|0;c[j>>2]=0;k=b+12|0;c[k>>2]=0;l=b+24|0;m=l|0;ln(l|0,0,24);h[m>>3]=-3.4028234663852886e+38;l=b+32|0;h[l>>3]=-3.4028234663852886e+38;n=b+40|0;h[n>>3]=-3.4028234663852886e+38;o=b+48|0;h[o>>3]=3.4028234663852886e+38;p=b+56|0;h[p>>3]=3.4028234663852886e+38;q=b+64|0;h[q>>3]=3.4028234663852886e+38;a[b+72|0]=1;if((d|0)==0){i=e;return}r=c[d+4>>2]|0;s=d+8|0;if((r|0)!=(c[s>>2]|0)){t=r;do{r=la(160)|0;cZ(r,c[t>>2]|0,b);c[f>>2]=r;u=c[j>>2]|0;if((u|0)==(c[k>>2]|0)){cW(g,f)}else{if((u|0)==0){v=0}else{c[u>>2]=r;v=c[j>>2]|0}c[j>>2]=v+4}t=t+4|0;}while((t|0)!=(c[s>>2]|0))}h[m>>3]=+h[d+24>>3];h[l>>3]=+h[d+32>>3];h[n>>3]=+h[d+40>>3];h[o>>3]=+h[d+48>>3];h[p>>3]=+h[d+56>>3];h[q>>3]=+h[d+64>>3];i=e;return}function dJ(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=13920;b=c[a+4>>2]|0;if((b|0)==0){d=a;le(d);return}e=a+8|0;f=c[e>>2]|0;if((b|0)!=(f|0)){c[e>>2]=f+((((f-4|0)+(-b|0)|0)>>>2^-1)<<2)}le(b);d=a;le(d);return}function dK(a){a=a|0;var b=0,d=0;c[a>>2]=13920;b=c[a+4>>2]|0;if((b|0)==0){return}d=a+8|0;a=c[d>>2]|0;if((b|0)!=(a|0)){c[d>>2]=a+((((a-4|0)+(-b|0)|0)>>>2^-1)<<2)}le(b);return}function dL(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=b;f=d-e>>2;g=a+8|0;h=c[g>>2]|0;i=a|0;j=c[i>>2]|0;k=j;if(f>>>0<=h-k>>2>>>0){l=a+4|0;m=(c[l>>2]|0)-k|0;n=m>>2;if(f>>>0<=n>>>0){o=d-e|0;lk(j|0,b|0,o|0);e=j+(o>>2<<2)|0;o=c[l>>2]|0;if((e|0)==(o|0)){return}c[l>>2]=o+((((o-4|0)+(-e|0)|0)>>>2^-1)<<2);return}e=b+(n<<2)|0;lk(j|0,b|0,m|0);if((e|0)==(d|0)){return}m=e;e=c[l>>2]|0;do{if((e|0)==0){p=0}else{c[e>>2]=c[m>>2];p=c[l>>2]|0}e=p+4|0;c[l>>2]=e;m=m+4|0;}while((m|0)!=(d|0));return}if((j|0)==0){q=h}else{h=a+4|0;m=c[h>>2]|0;if((j|0)!=(m|0)){c[h>>2]=m+((((m-4|0)+(-k|0)|0)>>>2^-1)<<2)}le(j);c[g>>2]=0;c[h>>2]=0;c[i>>2]=0;q=0}if(f>>>0>1073741823){i_(0)}h=q;do{if(h>>2>>>0>536870910){r=1073741823}else{q=h>>1;j=q>>>0<f>>>0?f:q;if(j>>>0<=1073741823){r=j;break}i_(0)}}while(0);f=la(r<<2)|0;h=a+4|0;c[h>>2]=f;c[i>>2]=f;c[g>>2]=f+(r<<2);if((b|0)==(d|0)){return}else{s=b;t=f}do{if((t|0)==0){u=0}else{c[t>>2]=c[s>>2];u=c[h>>2]|0}t=u+4|0;c[h>>2]=t;s=s+4|0;}while((s|0)!=(d|0));return}function dM(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0.0,V=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0.0,af=0.0,ag=0,ah=0,ai=0.0,aj=0.0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0.0,as=0,at=0,au=0.0,av=0.0,aw=0.0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0.0,aH=0.0,aI=0.0,aJ=0,aK=0.0,aL=0.0,aM=0,aN=0,aO=0.0,aP=0.0,aQ=0,aR=0,aS=0,aT=0,aU=0.0,aV=0.0,aW=0.0,aX=0,aY=0,aZ=0,a_=0,a$=0.0,a0=0.0,a1=0,a2=0,a3=0.0,a4=0.0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0.0,bc=0.0,bd=0.0,be=0;e=i;i=i+88|0;f=e|0;g=e+16|0;j=e+24|0;l=e+32|0;m=e+40|0;n=e+48|0;o=e+56|0;p=e+64|0;q=e+72|0;r=e+80|0;if((c[b+4>>2]|0)-(c[b>>2]|0)>>2>>>0<3){s=0;i=e;return s|0}cJ(f,b|0);t=c[b+12>>2]|0;u=b+16|0;v=f+4|0;if((t|0)!=(c[u>>2]|0)){w=g|0;x=j|0;y=l|0;z=t;do{c[w>>2]=c[v>>2];c[x>>2]=c[z>>2];c[y>>2]=c[z+4>>2];dN(m,f,g,j,l);z=z+12|0;}while((z|0)!=(c[u>>2]|0))}u=c[v>>2]|0;z=f|0;l=c[z>>2]|0;j=u-l>>2;L10:do{if(j>>>0>3){g=b+120|0;m=d+4|0;y=d+8|0;x=f+8|0;w=b+72|0;t=l;A=u;while(1){B=c[t>>2]|0;C=t+4|0;if((C|0)==(A|0)){break}D=B|0;E=B+4|0;F=1.0;G=0;H=C;L15:while(1){C=H;L17:while(1){I=(c[C>>2]|0)+4|0;L20:do{if((dh(c[I>>2]|0,c[D>>2]|0,c[E>>2]|0,w)|0)==1){J=c[D>>2]|0;K=c[I>>2]|0;L=J|0;M=K|0;N=c[z>>2]|0;while(1){O=c[v>>2]|0;if((N|0)==(O|0)){break}P=c[N>>2]|0;Q=c[P>>2]|0;R=c[P+4>>2]|0;if((Q|0)==(J|0)&(R|0)==(K|0)){break}if((R|0)==(J|0)&(Q|0)==(K|0)){break}if(dy(Q|0,R|0,L,M)|0){break L20}else{N=N+4|0}}N=c[E>>2]|0;M=c[I>>2]|0;L=N|0;K=M|0;J=c[z>>2]|0;S=O;while(1){if((J|0)==(S|0)){break}R=c[J>>2]|0;Q=c[R>>2]|0;P=c[R+4>>2]|0;if((Q|0)==(N|0)&(P|0)==(M|0)){break}if((P|0)==(N|0)&(Q|0)==(M|0)){break}if(dy(Q|0,P|0,L,K)|0){break L20}J=J+4|0;S=c[v>>2]|0}J=c[D>>2]|0;T=c[I>>2]|0;U=+h[T>>3];V=+h[J>>3]-U;X=+h[T+8>>3];Y=+h[J+8>>3]-X;Z=+h[T+16>>3];_=+h[J+16>>3]-Z;$=V*V+0.0+Y*Y+_*_;if($==0.0){aa=0.0}else{aa=+W(+$)}J=c[E>>2]|0;$=+h[J>>3]-U;U=+h[J+8>>3]-X;X=+h[J+16>>3]-Z;Z=$*$+0.0+U*U+X*X;if(Z==0.0){ab=0.0}else{ab=+W(+Z)}ac=V/aa*($/ab)+0.0+Y/aa*(U/ab)+_/aa*(X/ab);if(ac<F){break L17}}}while(0);I=C+4|0;if((I|0)==(c[v>>2]|0)){ad=G;break L15}else{C=I}}I=C+4|0;if((I|0)==(S|0)){ad=T;break}else{F=ac;G=T;H=I}}if((ad|0)==0){break}H=la(160)|0;G=H;E=c[g>>2]|0;ln(H|0,0,40);h[H+24>>3]=-3.4028234663852886e+38;h[H+32>>3]=-3.4028234663852886e+38;h[H+40>>3]=-3.4028234663852886e+38;h[H+48>>3]=3.4028234663852886e+38;h[H+56>>3]=3.4028234663852886e+38;h[H+64>>3]=3.4028234663852886e+38;ln(H+72|0,0,48);c[H+120>>2]=E;ln(H+124|0,0,20);h[H+128>>3]=1.0;h[H+136>>3]=1.0;h[H+144>>3]=1.0;h[H+152>>3]=1.0;c[o>>2]=G;c[B+8>>2]=G;c3(G,B);E=la(72)|0;D=B+4|0;cY(E,c[D>>2]|0,ad,G);c3(G,E);E=la(72)|0;I=B|0;cY(E,ad,c[I>>2]|0,G);c3(G,E);E=c[H+4>>2]|0;J=c[H>>2]|0;K=E-J>>2;if(K>>>0>=2){if((J|0)==(E|0)){ae=-3.4028234663852886e+38;af=-3.4028234663852886e+38;ag=-940572673;ah=-536870912;ai=3.4028234663852886e+38;aj=3.4028234663852886e+38;ak=1206910975;al=-536870912}else{F=-3.4028234663852886e+38;X=-3.4028234663852886e+38;L=-940572673;M=-536870912;_=3.4028234663852886e+38;U=3.4028234663852886e+38;N=1206910975;P=-536870912;Q=J;while(1){R=c[c[Q>>2]>>2]|0;am=R|0;Y=+h[am>>3];an=c[am>>2]|0;ao=c[am+4>>2]|0;if(Y>(c[k>>2]=M,c[k+4>>2]=L,+h[k>>3])){ap=ao;aq=an}else{ap=L;aq=M}$=+h[R+8>>3];V=$>X?$:X;Z=+h[R+16>>3];ar=Z>F?Z:F;if(Y<(c[k>>2]=P,c[k+4>>2]=N,+h[k>>3])){as=ao;at=an}else{as=N;at=P}Y=$<U?$:U;$=Z<_?Z:_;an=Q+4|0;if((an|0)==(E|0)){ae=ar;af=V;ag=ap;ah=aq;ai=$;aj=Y;ak=as;al=at;break}else{F=ar;X=V;L=ap;M=aq;_=$;U=Y;N=as;P=at;Q=an}}}h[H+24>>3]=(c[k>>2]=al,c[k+4>>2]=ak,+h[k>>3]);h[H+32>>3]=aj;h[H+40>>3]=ai;h[H+48>>3]=(c[k>>2]=ah,c[k+4>>2]=ag,+h[k>>3]);h[H+56>>3]=af;h[H+64>>3]=ae}if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;au=0.0;av=0.0;aw=0.0}else{au=+h[1373];av=+h[1374];aw=+h[1375]}Q=H+96|0;h[Q>>3]=au;P=H+104|0;h[P>>3]=av;N=H+112|0;h[N>>3]=aw;if((J|0)!=(E|0)){M=J;U=au;_=av;X=aw;do{L=c[c[M>>2]>>2]|0;U=U+ +h[L>>3];h[Q>>3]=U;_=_+ +h[L+8>>3];h[P>>3]=_;X=X+ +h[L+16>>3];h[N>>3]=X;M=M+4|0;}while((M|0)!=(E|0));F=+(K>>>0>>>0);h[Q>>3]=U/F;h[P>>3]=_/F;h[N>>3]=X/F}c4(G);E=c[m>>2]|0;if((E|0)==(c[y>>2]|0)){cW(d,o)}else{if((E|0)==0){ax=0}else{c[E>>2]=G;ax=c[m>>2]|0}c[m>>2]=ax+4}E=c[z>>2]|0;M=E+4|0;J=(c[v>>2]|0)-M|0;lk(E|0,M|0,J|0);M=E+(J>>2<<2)|0;J=c[v>>2]|0;if((M|0)==(J|0)){ay=M}else{E=J+((((J-4|0)+(-M|0)|0)>>>2^-1)<<2)|0;c[v>>2]=E;ay=E}E=c[I>>2]|0;M=c[z>>2]|0;L88:do{if((M|0)==(ay|0)){az=ay}else{J=M;while(1){H=c[J>>2]|0;if((c[H>>2]|0)==(ad|0)){if((c[H+4>>2]|0)==(E|0)){az=J;break L88}}H=J+4|0;if((H|0)==(ay|0)){az=ay;break}else{J=H}}}}while(0);do{if((az|0)==(ay|0)){E=la(72)|0;M=E;G=c[I>>2]|0;c[E>>2]=G;c[E+4>>2]=ad;c[E+8>>2]=0;N=E+16|0;P=N;ln(N|0,0,16);h[P>>3]=-3.4028234663852886e+38;N=E+24|0;h[N>>3]=-3.4028234663852886e+38;Q=E+32|0;h[Q>>3]=-3.4028234663852886e+38;K=E+40|0;h[K>>3]=3.4028234663852886e+38;J=E+48|0;h[J>>3]=3.4028234663852886e+38;C=E+56|0;h[C>>3]=3.4028234663852886e+38;c[E+64>>2]=0;if((G|0)!=0){X=+h[G>>3];_=+h[G+8>>3];U=+h[G+16>>3];F=+h[ad>>3];Y=+h[ad+8>>3];$=+h[ad+16>>3];h[P>>3]=F<X?F:X;h[N>>3]=Y<_?Y:_;h[Q>>3]=$<U?$:U;h[K>>3]=F>X?F:X;h[J>>3]=Y>_?Y:_;h[C>>3]=$>U?$:U}c[p>>2]=M;C=c[v>>2]|0;if((C|0)==(c[x>>2]|0)){c1(f,p);aA=c[v>>2]|0;break}if((C|0)==0){aB=0}else{c[C>>2]=M;aB=c[v>>2]|0}M=aB+4|0;c[v>>2]=M;aA=M}else{M=az+4|0;C=ay-M|0;lk(az|0,M|0,C|0);M=az+(C>>2<<2)|0;C=c[v>>2]|0;if((M|0)==(C|0)){aA=M;break}J=C+((((C-4|0)+(-M|0)|0)>>>2^-1)<<2)|0;c[v>>2]=J;aA=J}}while(0);I=c[D>>2]|0;J=c[z>>2]|0;L111:do{if((J|0)==(aA|0)){aC=119}else{M=J;while(1){C=c[M>>2]|0;if((c[C>>2]|0)==(I|0)){if((c[C+4>>2]|0)==(ad|0)){break}}C=M+4|0;if((C|0)==(aA|0)){aC=119;break L111}else{M=C}}if((M|0)==(aA|0)){aC=119;break}C=M+4|0;K=aA-C|0;lk(M|0,C|0,K|0);C=M+(K>>2<<2)|0;K=c[v>>2]|0;if((C|0)==(K|0)){aD=C;break}Q=K+((((K-4|0)+(-C|0)|0)>>>2^-1)<<2)|0;c[v>>2]=Q;aD=Q}}while(0);do{if((aC|0)==119){aC=0;I=la(72)|0;J=I;Q=c[D>>2]|0;c[I>>2]=ad;c[I+4>>2]=Q;c[I+8>>2]=0;C=I+16|0;K=C;ln(C|0,0,16);h[K>>3]=-3.4028234663852886e+38;C=I+24|0;h[C>>3]=-3.4028234663852886e+38;N=I+32|0;h[N>>3]=-3.4028234663852886e+38;P=I+40|0;h[P>>3]=3.4028234663852886e+38;G=I+48|0;h[G>>3]=3.4028234663852886e+38;E=I+56|0;h[E>>3]=3.4028234663852886e+38;c[I+64>>2]=0;if((Q|0)!=0){U=+h[ad>>3];$=+h[ad+8>>3];_=+h[ad+16>>3];Y=+h[Q>>3];X=+h[Q+8>>3];F=+h[Q+16>>3];h[K>>3]=Y<U?Y:U;h[C>>3]=X<$?X:$;h[N>>3]=F<_?F:_;h[P>>3]=Y>U?Y:U;h[G>>3]=X>$?X:$;h[E>>3]=F>_?F:_}c[q>>2]=J;E=c[v>>2]|0;if((E|0)==(c[x>>2]|0)){c1(f,q);aD=c[v>>2]|0;break}if((E|0)==0){aE=0}else{c[E>>2]=J;aE=c[v>>2]|0}J=aE+4|0;c[v>>2]=J;aD=J}}while(0);D=c[z>>2]|0;J=aD-D>>2;if(J>>>0>3){t=D;A=aD}else{aF=J;aC=129;break L10}}A=la(160)|0;t=A;x=c[g>>2]|0;ln(A|0,0,40);h[A+24>>3]=-3.4028234663852886e+38;h[A+32>>3]=-3.4028234663852886e+38;h[A+40>>3]=-3.4028234663852886e+38;h[A+48>>3]=3.4028234663852886e+38;h[A+56>>3]=3.4028234663852886e+38;h[A+64>>3]=3.4028234663852886e+38;ln(A+72|0,0,48);c[A+120>>2]=x;ln(A+124|0,0,20);h[A+128>>3]=1.0;h[A+136>>3]=1.0;h[A+144>>3]=1.0;h[A+152>>3]=1.0;c[n>>2]=t;dO(A,c[z>>2]|0,c[v>>2]|0);if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;aG=0.0;aH=0.0;aI=0.0}else{aG=+h[1373];aH=+h[1374];aI=+h[1375]}x=A+96|0;h[x>>3]=aG;w=A+104|0;h[w>>3]=aH;J=A+112|0;h[J>>3]=aI;D=c[A>>2]|0;E=c[A+4>>2]|0;G=(D|0)==(E|0);if(G){aJ=E-D>>2}else{P=D;_=aG;F=aH;$=aI;do{N=c[c[P>>2]>>2]|0;_=_+ +h[N>>3];h[x>>3]=_;F=F+ +h[N+8>>3];h[w>>3]=F;$=$+ +h[N+16>>3];h[J>>3]=$;P=P+4|0;}while((P|0)!=(E|0));P=E-D>>2;X=+(P>>>0>>>0);h[x>>3]=_/X;h[w>>3]=F/X;h[J>>3]=$/X;aJ=P}if(aJ>>>0>=2){if(G){aK=-3.4028234663852886e+38;aL=-3.4028234663852886e+38;aM=-940572673;aN=-536870912;aO=3.4028234663852886e+38;aP=3.4028234663852886e+38;aQ=1206910975;aR=-536870912}else{X=-3.4028234663852886e+38;U=-3.4028234663852886e+38;P=-940572673;g=-536870912;Y=3.4028234663852886e+38;V=3.4028234663852886e+38;N=1206910975;C=-536870912;K=D;while(1){Q=c[c[K>>2]>>2]|0;I=Q|0;ar=+h[I>>3];H=c[I>>2]|0;L=c[I+4>>2]|0;if(ar>(c[k>>2]=g,c[k+4>>2]=P,+h[k>>3])){aS=L;aT=H}else{aS=P;aT=g}Z=+h[Q+8>>3];aU=Z>U?Z:U;aV=+h[Q+16>>3];aW=aV>X?aV:X;if(ar<(c[k>>2]=C,c[k+4>>2]=N,+h[k>>3])){aX=L;aY=H}else{aX=N;aY=C}ar=Z<V?Z:V;Z=aV<Y?aV:Y;H=K+4|0;if((H|0)==(E|0)){aK=aW;aL=aU;aM=aS;aN=aT;aO=Z;aP=ar;aQ=aX;aR=aY;break}else{X=aW;U=aU;P=aS;g=aT;Y=Z;V=ar;N=aX;C=aY;K=H}}}h[A+24>>3]=(c[k>>2]=aR,c[k+4>>2]=aQ,+h[k>>3]);h[A+32>>3]=aP;h[A+40>>3]=aO;h[A+48>>3]=(c[k>>2]=aN,c[k+4>>2]=aM,+h[k>>3]);h[A+56>>3]=aL;h[A+64>>3]=aK}K=c[m>>2]|0;if((K|0)==(c[y>>2]|0)){cW(d,n);aZ=0;break}if((K|0)==0){a_=0}else{c[K>>2]=t;a_=c[m>>2]|0}c[m>>2]=a_+4;aZ=0}else{aF=j;aC=129}}while(0);do{if((aC|0)==129){if((aF|0)!=3){aZ=1;break}j=la(160)|0;a_=j;n=c[b+120>>2]|0;aM=j+24|0;ln(j|0,0,40);h[aM>>3]=-3.4028234663852886e+38;aN=j+32|0;h[aN>>3]=-3.4028234663852886e+38;aQ=j+40|0;h[aQ>>3]=-3.4028234663852886e+38;aR=j+48|0;h[aR>>3]=3.4028234663852886e+38;aY=j+56|0;h[aY>>3]=3.4028234663852886e+38;aX=j+64|0;h[aX>>3]=3.4028234663852886e+38;ln(j+72|0,0,48);c[j+120>>2]=n;ln(j+124|0,0,20);h[j+128>>3]=1.0;h[j+136>>3]=1.0;h[j+144>>3]=1.0;h[j+152>>3]=1.0;c[r>>2]=a_;c[(c[c[z>>2]>>2]|0)+8>>2]=a_;n=c[c[z>>2]>>2]|0;c3(a_,n);c[(c[(c[z>>2]|0)+4>>2]|0)+8>>2]=a_;n=c[(c[z>>2]|0)+4>>2]|0;c3(a_,n);c[(c[(c[z>>2]|0)+8>>2]|0)+8>>2]=a_;n=c[(c[z>>2]|0)+8>>2]|0;c3(a_,n);n=c[j+4>>2]|0;aT=c[j>>2]|0;aS=n-aT>>2;if(aS>>>0>=2){if((aT|0)==(n|0)){a$=-3.4028234663852886e+38;a0=-3.4028234663852886e+38;a1=-940572673;a2=-536870912;a3=3.4028234663852886e+38;a4=3.4028234663852886e+38;a5=1206910975;a6=-536870912}else{aK=-3.4028234663852886e+38;aL=-3.4028234663852886e+38;aJ=-940572673;aD=-536870912;aO=3.4028234663852886e+38;aP=3.4028234663852886e+38;aE=1206910975;q=-536870912;f=aT;while(1){ad=c[c[f>>2]>>2]|0;aA=ad|0;aI=+h[aA>>3];az=c[aA>>2]|0;ay=c[aA+4>>2]|0;if(aI>(c[k>>2]=aD,c[k+4>>2]=aJ,+h[k>>3])){a7=ay;a8=az}else{a7=aJ;a8=aD}aH=+h[ad+8>>3];aG=aH>aL?aH:aL;aw=+h[ad+16>>3];av=aw>aK?aw:aK;if(aI<(c[k>>2]=q,c[k+4>>2]=aE,+h[k>>3])){a9=ay;ba=az}else{a9=aE;ba=q}aI=aH<aP?aH:aP;aH=aw<aO?aw:aO;az=f+4|0;if((az|0)==(n|0)){a$=av;a0=aG;a1=a7;a2=a8;a3=aH;a4=aI;a5=a9;a6=ba;break}else{aK=av;aL=aG;aJ=a7;aD=a8;aO=aH;aP=aI;aE=a9;q=ba;f=az}}}h[aM>>3]=(c[k>>2]=a6,c[k+4>>2]=a5,+h[k>>3]);h[aN>>3]=a4;h[aQ>>3]=a3;h[aR>>3]=(c[k>>2]=a2,c[k+4>>2]=a1,+h[k>>3]);h[aY>>3]=a0;h[aX>>3]=a$}if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;bb=0.0;bc=0.0;bd=0.0}else{bb=+h[1373];bc=+h[1374];bd=+h[1375]}f=j+96|0;h[f>>3]=bb;q=j+104|0;h[q>>3]=bc;aE=j+112|0;h[aE>>3]=bd;if((aT|0)!=(n|0)){aD=aT;aP=bb;aO=bc;aL=bd;do{aJ=c[c[aD>>2]>>2]|0;aP=aP+ +h[aJ>>3];h[f>>3]=aP;aO=aO+ +h[aJ+8>>3];h[q>>3]=aO;aL=aL+ +h[aJ+16>>3];h[aE>>3]=aL;aD=aD+4|0;}while((aD|0)!=(n|0));aK=+(aS>>>0>>>0);h[f>>3]=aP/aK;h[q>>3]=aO/aK;h[aE>>3]=aL/aK}c4(a_);n=d+4|0;aD=c[n>>2]|0;if((aD|0)==(c[d+8>>2]|0)){cW(d,r);aZ=1;break}if((aD|0)==0){be=0}else{c[aD>>2]=a_;be=c[n>>2]|0}c[n>>2]=be+4;aZ=1}}while(0);be=c[z>>2]|0;if((be|0)==0){s=aZ;i=e;return s|0}z=c[v>>2]|0;if((be|0)!=(z|0)){c[v>>2]=z+((((z-4|0)+(-be|0)|0)>>>2^-1)<<2)}le(be);s=aZ;i=e;return s|0}function dN(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;g=i;h=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[h>>2];h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[h>>2];h=b|0;j=c[h>>2]|0;k=j;l=(c[d>>2]|0)-k|0;d=l>>2;m=j+(d<<2)|0;n=e|0;e=c[n>>2]|0;o=c[f>>2]|0;f=o-e|0;p=f>>2;if((f|0)<=0){q=m;r=a|0;c[r>>2]=q;i=g;return}f=b+8|0;s=b+4|0;b=c[s>>2]|0;t=c[f>>2]|0;u=b;if((p|0)>(t-u>>2|0)){v=(u-k>>2)+p|0;if(v>>>0>1073741823){i_(0)}w=t-k|0;if(w>>2>>>0>536870910){x=1073741823;y=m;z=l>>2;A=186}else{k=w>>1;w=k>>>0<v>>>0?v:k;k=m;v=l>>2;if((w|0)==0){B=0;C=0;D=k;E=v}else{x=w;y=k;z=v;A=186}}if((A|0)==186){B=la(x<<2)|0;C=x;D=y;E=z}z=B+(E<<2)|0;y=B+(C<<2)|0;if((e|0)==(o|0)){F=z}else{C=e;x=z;while(1){if((x|0)==0){G=0}else{c[x>>2]=c[C>>2];G=x}A=G+4|0;v=C+4|0;if((v|0)==(o|0)){F=A;break}else{C=v;x=A}}}x=c[h>>2]|0;C=D-x|0;G=B+(E-(C>>2)<<2)|0;lj(G|0,x|0,C);C=(c[s>>2]|0)-D|0;lj(F|0,m|0,C);D=c[h>>2]|0;c[h>>2]=G;c[s>>2]=F+(C>>2<<2);c[f>>2]=y;if((D|0)==0){q=z;r=a|0;c[r>>2]=q;i=g;return}le(D);q=z;r=a|0;c[r>>2]=q;i=g;return}else{z=u-m>>2;do{if((p|0)>(z|0)){u=e+(z<<2)|0;if((u|0)==(o|0)){H=z;I=o;J=b;break}else{K=u;L=b}while(1){if((L|0)==0){M=0}else{c[L>>2]=c[K>>2];M=c[s>>2]|0}D=M+4|0;c[s>>2]=D;y=K+4|0;if((y|0)==(o|0)){H=z;I=u;J=D;break}else{K=y;L=D}}}else{H=p;I=o;J=b}}while(0);if((H|0)<=0){q=m;r=a|0;c[r>>2]=q;i=g;return}H=J-(j+(p+d<<2)|0)|0;p=H>>2;o=j+(p+d<<2)|0;if(o>>>0<b>>>0){d=o;o=J;do{if((o|0)==0){N=0}else{c[o>>2]=c[d>>2];N=c[s>>2]|0}d=d+4|0;o=N+4|0;c[s>>2]=o;}while(d>>>0<b>>>0);O=c[n>>2]|0}else{O=e}e=m;lk(J+(-p<<2)|0,e|0,H|0);lk(e|0,O|0,I-O|0);q=m;r=a|0;c[r>>2]=q;i=g;return}}function dO(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=b;f=d-e>>2;g=a+8|0;h=c[g>>2]|0;i=a|0;j=c[i>>2]|0;k=j;if(f>>>0<=h-k>>2>>>0){l=a+4|0;m=(c[l>>2]|0)-k|0;n=m>>2;if(f>>>0<=n>>>0){o=d-e|0;lk(j|0,b|0,o|0);e=j+(o>>2<<2)|0;o=c[l>>2]|0;if((e|0)==(o|0)){return}c[l>>2]=o+((((o-4|0)+(-e|0)|0)>>>2^-1)<<2);return}e=b+(n<<2)|0;lk(j|0,b|0,m|0);if((e|0)==(d|0)){return}m=e;e=c[l>>2]|0;do{if((e|0)==0){p=0}else{c[e>>2]=c[m>>2];p=c[l>>2]|0}e=p+4|0;c[l>>2]=e;m=m+4|0;}while((m|0)!=(d|0));return}if((j|0)==0){q=h}else{h=a+4|0;m=c[h>>2]|0;if((j|0)!=(m|0)){c[h>>2]=m+((((m-4|0)+(-k|0)|0)>>>2^-1)<<2)}le(j);c[g>>2]=0;c[h>>2]=0;c[i>>2]=0;q=0}if(f>>>0>1073741823){i_(0)}h=q;do{if(h>>2>>>0>536870910){r=1073741823}else{q=h>>1;j=q>>>0<f>>>0?f:q;if(j>>>0<=1073741823){r=j;break}i_(0)}}while(0);f=la(r<<2)|0;h=a+4|0;c[h>>2]=f;c[i>>2]=f;c[g>>2]=f+(r<<2);if((b|0)==(d|0)){return}else{s=b;t=f}do{if((t|0)==0){u=0}else{c[t>>2]=c[s>>2];u=c[h>>2]|0}t=u+4|0;c[h>>2]=t;s=s+4|0;}while((s|0)!=(d|0));return}function dP(b,d,e,f,j,l,m,n,o,p){b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0.0,ae=0.0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0,as=0,at=0,au=0,av=0.0,aw=0.0,ax=0,ay=0,az=0.0,aA=0.0,aB=0,aC=0,aD=0.0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0.0,aK=0,aL=0,aM=0,aN=0,aO=0.0,aP=0.0,aQ=0.0,aR=0.0,aS=0,aT=0,aU=0,aV=0,aW=0.0,aX=0.0,aY=0.0,aZ=0,a_=0.0,a$=0.0,a0=0,a1=0,a2=0.0,a3=0.0,a4=0,a5=0,a6=0,a7=0,a8=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0;q=i;i=i+216|0;r=q|0;s=q+8|0;t=q+16|0;u=q+24|0;v=q+32|0;w=q+144|0;x=q+160|0;y=q+176|0;z=q+192|0;A=q+208|0;B=la(80)|0;C=B;c[B>>2]=13920;D=B+4|0;E=D;c[E>>2]=0;F=B+8|0;c[F>>2]=0;G=B+12|0;c[G>>2]=0;H=B+24|0;I=H;ln(H|0,0,16);h[I>>3]=-3.4028234663852886e+38;H=B+32|0;h[H>>3]=-3.4028234663852886e+38;J=B+40|0;h[J>>3]=-3.4028234663852886e+38;L=B+48|0;h[L>>3]=3.4028234663852886e+38;M=B+56|0;h[M>>3]=3.4028234663852886e+38;N=B+64|0;h[N>>3]=3.4028234663852886e+38;a[B+72|0]=1;B=la(80)|0;O=B;c[B>>2]=13920;P=B+4|0;Q=P;c[Q>>2]=0;R=B+8|0;c[R>>2]=0;S=B+12|0;c[S>>2]=0;T=B+24|0;U=T;ln(T|0,0,16);h[U>>3]=-3.4028234663852886e+38;T=B+32|0;h[T>>3]=-3.4028234663852886e+38;V=B+40|0;h[V>>3]=-3.4028234663852886e+38;W=B+48|0;h[W>>3]=3.4028234663852886e+38;X=B+56|0;h[X>>3]=3.4028234663852886e+38;Y=B+64|0;h[Y>>3]=3.4028234663852886e+38;a[B+72|0]=1;B=la(80)|0;Z=B;c[B>>2]=13920;_=B+4|0;c[_>>2]=0;$=B+8|0;c[$>>2]=0;c[B+12>>2]=0;aa=B+24|0;ln(aa|0,0,16);h[aa>>3]=-3.4028234663852886e+38;h[B+32>>3]=-3.4028234663852886e+38;h[B+40>>3]=-3.4028234663852886e+38;h[B+48>>3]=3.4028234663852886e+38;h[B+56>>3]=3.4028234663852886e+38;h[B+64>>3]=3.4028234663852886e+38;a[B+72|0]=1;B=a9(d|0,80)|0;aa=K;ab=bq(B|0,8)|0;B=lb(aa|K?-1:ab)|0;c[B+4>>2]=d;ab=B+8|0;do{if((d|0)!=0){B=ab+(d*80&-1)|0;aa=ab;do{ln(aa|0,0,48);h[aa+48>>3]=1.0;h[aa+56>>3]=1.0;h[aa+64>>3]=1.0;h[aa+72>>3]=1.0;aa=aa+80|0;}while((aa|0)!=(B|0));if((d|0)>0){ac=0}else{break}do{B=ac*3&-1;ad=+g[b+(B+1<<2)>>2];ae=+g[b+(B+2<<2)>>2];h[ab+(ac*80&-1)>>3]=+g[b+(B<<2)>>2];h[ab+(ac*80&-1)+8>>3]=ad;h[ab+(ac*80&-1)+16>>3]=ae;ac=ac+1|0;}while((ac|0)<(d|0))}}while(0);if((f|0)>0){d=D;D=0;do{ac=D*3&-1;b=la(160)|0;B=b;ln(b|0,0,40);h[b+24>>3]=-3.4028234663852886e+38;h[b+32>>3]=-3.4028234663852886e+38;h[b+40>>3]=-3.4028234663852886e+38;h[b+48>>3]=3.4028234663852886e+38;h[b+56>>3]=3.4028234663852886e+38;h[b+64>>3]=3.4028234663852886e+38;ln(b+72|0,0,48);c[b+120>>2]=C;ln(b+124|0,0,20);h[b+128>>3]=1.0;h[b+136>>3]=1.0;h[b+144>>3]=1.0;h[b+152>>3]=1.0;c[t>>2]=B;aa=0;while(1){af=aa+1|0;ag=c[e+(aa+ac<<2)>>2]|0;ah=c[e+(((af|0)==3?0:af)+ac<<2)>>2]|0;ai=la(72)|0;aj=ai;cY(aj,ab+(ag*80&-1)|0,ab+(ah*80&-1)|0,B);c[ai+8>>2]=B;ah=c[ai>>2]|0;do{if((ah|0)!=0){ag=c[ai+4>>2]|0;if((ag|0)==0){break}ae=+h[ah>>3];ad=+h[ah+8>>3];ak=+h[ah+16>>3];al=+h[ag>>3];am=+h[ag+8>>3];an=+h[ag+16>>3];h[ai+16>>3]=al<ae?al:ae;h[ai+24>>3]=am<ad?am:ad;h[ai+32>>3]=an<ak?an:ak;h[ai+40>>3]=al>ae?al:ae;h[ai+48>>3]=am>ad?am:ad;h[ai+56>>3]=an>ak?an:ak}}while(0);c3(B,aj);if((af|0)<3){aa=af}else{break}}c4(B);if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;ao=0.0;ap=0.0;aq=0.0}else{ao=+h[1373];ap=+h[1374];aq=+h[1375]}aa=b+96|0;h[aa>>3]=ao;ac=b+104|0;h[ac>>3]=ap;ai=b+112|0;h[ai>>3]=aq;ah=c[b>>2]|0;ag=c[b+4>>2]|0;ar=(ah|0)==(ag|0);if(ar){as=ag-ah>>2}else{at=ah;ak=ao;an=ap;ad=aq;do{au=c[c[at>>2]>>2]|0;ak=ak+ +h[au>>3];h[aa>>3]=ak;an=an+ +h[au+8>>3];h[ac>>3]=an;ad=ad+ +h[au+16>>3];h[ai>>3]=ad;at=at+4|0;}while((at|0)!=(ag|0));at=ag-ah>>2;am=+(at>>>0>>>0);h[aa>>3]=ak/am;h[ac>>3]=an/am;h[ai>>3]=ad/am;as=at}if(as>>>0>=2){if(ar){av=-3.4028234663852886e+38;aw=-3.4028234663852886e+38;ax=-940572673;ay=-536870912;az=3.4028234663852886e+38;aA=3.4028234663852886e+38;aB=1206910975;aC=-536870912}else{am=-3.4028234663852886e+38;ae=-3.4028234663852886e+38;at=-940572673;au=-536870912;al=3.4028234663852886e+38;aD=3.4028234663852886e+38;aE=1206910975;aF=-536870912;aG=ah;while(1){aH=c[c[aG>>2]>>2]|0;aI=aH|0;aJ=+h[aI>>3];aK=c[aI>>2]|0;aL=c[aI+4>>2]|0;if(aJ>(c[k>>2]=au,c[k+4>>2]=at,+h[k>>3])){aM=aL;aN=aK}else{aM=at;aN=au}aO=+h[aH+8>>3];aP=aO>ae?aO:ae;aQ=+h[aH+16>>3];aR=aQ>am?aQ:am;if(aJ<(c[k>>2]=aF,c[k+4>>2]=aE,+h[k>>3])){aS=aL;aT=aK}else{aS=aE;aT=aF}aJ=aO<aD?aO:aD;aO=aQ<al?aQ:al;aK=aG+4|0;if((aK|0)==(ag|0)){av=aR;aw=aP;ax=aM;ay=aN;az=aO;aA=aJ;aB=aS;aC=aT;break}else{am=aR;ae=aP;at=aM;au=aN;al=aO;aD=aJ;aE=aS;aF=aT;aG=aK}}}h[b+24>>3]=(c[k>>2]=aC,c[k+4>>2]=aB,+h[k>>3]);h[b+32>>3]=aA;h[b+40>>3]=az;h[b+48>>3]=(c[k>>2]=ay,c[k+4>>2]=ax,+h[k>>3]);h[b+56>>3]=aw;h[b+64>>3]=av}aG=c[F>>2]|0;if((aG|0)==(c[G>>2]|0)){cW(d,t)}else{if((aG|0)==0){aU=0}else{c[aG>>2]=B;aU=c[F>>2]|0}c[F>>2]=aU+4}D=D+1|0;}while((D|0)<(f|0))}f=c[E>>2]|0;E=c[F>>2]|0;if((f|0)!=(E|0)){F=c[f>>2]|0;av=+h[F+24>>3];h[I>>3]=av;aw=+h[F+32>>3];h[H>>3]=aw;az=+h[F+40>>3];h[J>>3]=az;aA=+h[F+48>>3];h[L>>3]=aA;aq=+h[F+56>>3];h[M>>3]=aq;ap=+h[F+64>>3];h[N>>3]=ap;F=f;ao=av;av=aA;aA=aw;aw=aq;aq=az;az=ap;do{f=c[F>>2]|0;ap=+h[f+24>>3];ao=ao<ap?ao:ap;h[I>>3]=ao;ap=+h[f+48>>3];av=av>ap?av:ap;h[L>>3]=av;ap=+h[f+32>>3];aA=aA<ap?aA:ap;h[H>>3]=aA;ap=+h[f+56>>3];aw=aw>ap?aw:ap;h[M>>3]=aw;ap=+h[f+40>>3];aq=aq<ap?aq:ap;h[J>>3]=aq;ap=+h[f+64>>3];az=az>ap?az:ap;h[N>>3]=az;F=F+4|0;}while((F|0)!=(E|0))}E=a9(l|0,80)|0;F=K;N=bq(E|0,8)|0;E=lb(F|K?-1:N)|0;c[E+4>>2]=l;N=E+8|0;do{if((l|0)!=0){E=N+(l*80&-1)|0;F=N;do{ln(F|0,0,48);h[F+48>>3]=1.0;h[F+56>>3]=1.0;h[F+64>>3]=1.0;h[F+72>>3]=1.0;F=F+80|0;}while((F|0)!=(E|0));if((l|0)>0){aV=0}else{break}do{E=aV*3&-1;az=+g[j+(E+1<<2)>>2];aq=+g[j+(E+2<<2)>>2];h[N+(aV*80&-1)>>3]=+g[j+(E<<2)>>2];h[N+(aV*80&-1)+8>>3]=az;h[N+(aV*80&-1)+16>>3]=aq;aV=aV+1|0;}while((aV|0)<(l|0))}}while(0);if((n|0)>0){l=P;P=0;do{aV=P*3&-1;j=la(160)|0;E=j;ln(j|0,0,40);h[j+24>>3]=-3.4028234663852886e+38;h[j+32>>3]=-3.4028234663852886e+38;h[j+40>>3]=-3.4028234663852886e+38;h[j+48>>3]=3.4028234663852886e+38;h[j+56>>3]=3.4028234663852886e+38;h[j+64>>3]=3.4028234663852886e+38;ln(j+72|0,0,48);c[j+120>>2]=O;ln(j+124|0,0,20);h[j+128>>3]=1.0;h[j+136>>3]=1.0;h[j+144>>3]=1.0;h[j+152>>3]=1.0;c[u>>2]=E;F=0;while(1){B=F+1|0;b=c[m+(F+aV<<2)>>2]|0;J=c[m+(((B|0)==3?0:B)+aV<<2)>>2]|0;M=la(72)|0;H=M;cY(H,N+(b*80&-1)|0,N+(J*80&-1)|0,E);c[M+8>>2]=E;J=c[M>>2]|0;do{if((J|0)!=0){b=c[M+4>>2]|0;if((b|0)==0){break}aq=+h[J>>3];az=+h[J+8>>3];aw=+h[J+16>>3];aA=+h[b>>3];av=+h[b+8>>3];ao=+h[b+16>>3];h[M+16>>3]=aA<aq?aA:aq;h[M+24>>3]=av<az?av:az;h[M+32>>3]=ao<aw?ao:aw;h[M+40>>3]=aA>aq?aA:aq;h[M+48>>3]=av>az?av:az;h[M+56>>3]=ao>aw?ao:aw}}while(0);c3(E,H);if((B|0)<3){F=B}else{break}}c4(E);if((a[20152]|0)==0){ln(10984,0,24);c[5038]=1;c[5039]=0;aW=0.0;aX=0.0;aY=0.0}else{aW=+h[1373];aX=+h[1374];aY=+h[1375]}F=j+96|0;h[F>>3]=aW;aV=j+104|0;h[aV>>3]=aX;M=j+112|0;h[M>>3]=aY;J=c[j>>2]|0;af=c[j+4>>2]|0;aj=(J|0)==(af|0);if(aj){aZ=af-J>>2}else{b=J;aw=aW;ao=aX;az=aY;do{L=c[c[b>>2]>>2]|0;aw=aw+ +h[L>>3];h[F>>3]=aw;ao=ao+ +h[L+8>>3];h[aV>>3]=ao;az=az+ +h[L+16>>3];h[M>>3]=az;b=b+4|0;}while((b|0)!=(af|0));b=af-J>>2;av=+(b>>>0>>>0);h[F>>3]=aw/av;h[aV>>3]=ao/av;h[M>>3]=az/av;aZ=b}if(aZ>>>0>=2){if(aj){a_=-3.4028234663852886e+38;a$=-3.4028234663852886e+38;a0=-940572673;a1=-536870912;a2=3.4028234663852886e+38;a3=3.4028234663852886e+38;a4=1206910975;a5=-536870912}else{av=-3.4028234663852886e+38;aq=-3.4028234663852886e+38;b=-940572673;L=-536870912;aA=3.4028234663852886e+38;ap=3.4028234663852886e+38;I=1206910975;f=-536870912;D=J;while(1){aU=c[c[D>>2]>>2]|0;t=aU|0;aD=+h[t>>3];d=c[t>>2]|0;G=c[t+4>>2]|0;if(aD>(c[k>>2]=L,c[k+4>>2]=b,+h[k>>3])){a6=G;a7=d}else{a6=b;a7=L}al=+h[aU+8>>3];ae=al>aq?al:aq;am=+h[aU+16>>3];ad=am>av?am:av;if(aD<(c[k>>2]=f,c[k+4>>2]=I,+h[k>>3])){a8=G;ba=d}else{a8=I;ba=f}aD=al<ap?al:ap;al=am<aA?am:aA;d=D+4|0;if((d|0)==(af|0)){a_=ad;a$=ae;a0=a6;a1=a7;a2=al;a3=aD;a4=a8;a5=ba;break}else{av=ad;aq=ae;b=a6;L=a7;aA=al;ap=aD;I=a8;f=ba;D=d}}}h[j+24>>3]=(c[k>>2]=a5,c[k+4>>2]=a4,+h[k>>3]);h[j+32>>3]=a3;h[j+40>>3]=a2;h[j+48>>3]=(c[k>>2]=a1,c[k+4>>2]=a0,+h[k>>3]);h[j+56>>3]=a$;h[j+64>>3]=a_}D=c[R>>2]|0;if((D|0)==(c[S>>2]|0)){cW(l,u)}else{if((D|0)==0){bb=0}else{c[D>>2]=E;bb=c[R>>2]|0}c[R>>2]=bb+4}P=P+1|0;}while((P|0)<(n|0))}n=c[Q>>2]|0;Q=c[R>>2]|0;if((n|0)!=(Q|0)){R=c[n>>2]|0;a_=+h[R+24>>3];h[U>>3]=a_;a$=+h[R+32>>3];h[T>>3]=a$;a2=+h[R+40>>3];h[V>>3]=a2;a3=+h[R+48>>3];h[W>>3]=a3;aY=+h[R+56>>3];h[X>>3]=aY;aX=+h[R+64>>3];h[Y>>3]=aX;R=n;aW=a_;a_=a3;a3=a$;a$=aY;aY=a2;a2=aX;do{n=c[R>>2]|0;aX=+h[n+24>>3];aW=aW<aX?aW:aX;h[U>>3]=aW;aX=+h[n+48>>3];a_=a_>aX?a_:aX;h[W>>3]=a_;aX=+h[n+32>>3];a3=a3<aX?a3:aX;h[T>>3]=a3;aX=+h[n+56>>3];a$=a$>aX?a$:aX;h[X>>3]=a$;aX=+h[n+40>>3];aY=aY<aX?aY:aX;h[V>>3]=aY;aX=+h[n+64>>3];a2=a2>aX?a2:aX;h[Y>>3]=a2;R=R+4|0;}while((R|0)!=(Q|0))}if((p|0)<0){cp(C,O,Z,o)}else{dz(v,C,O,Z);dA(v);do{if((p|0)>0){dB(v);if((p|0)<=1){break}dE(v);if((p|0)<=2){break}dF(v);if((p|0)<=3){break}dH(v);if((p|0)<=4){break}Z=v+16|0;O=c[Z>>2]|0;C=c[O+4>>2]|0;Q=O+8|0;R=c[Q>>2]|0;if((C|0)==(R|0)){bc=O}else{c[Q>>2]=R+((((R-4|0)+(-C|0)|0)>>>2^-1)<<2);bc=c[Z>>2]|0}cu(v+96|0,c[v+8>>2]|0,c[v+12>>2]|0,bc,o)}}while(0);dC(v)}v=w|0;c[v>>2]=0;o=w+4|0;c[o>>2]=0;bc=w+8|0;c[bc>>2]=0;p=x|0;c[p>>2]=0;Z=x+4|0;c[Z>>2]=0;C=x+8|0;c[C>>2]=0;R=y|0;c[R>>2]=0;Q=y+4|0;c[Q>>2]=0;O=y+8|0;c[O>>2]=0;Y=z|0;V=z+4|0;X=V|0;c[X>>2]=0;c[z+8>>2]=0;T=V;c[z>>2]=T;V=c[_>>2]|0;W=c[$>>2]|0;do{if((V|0)!=(W|0)){U=s|0;n=s+4|0;P=0;bb=V;u=W;while(1){l=c[bb>>2]|0;S=c[l>>2]|0;if(((c[l+4>>2]|0)-S|0)==12){l=P;a0=0;a1=S;while(1){S=c[a1+(a0<<2)>>2]|0;a4=c[X>>2]|0;a5=c[S>>2]|0;do{if((a4|0)==0){bd=331}else{ba=a4;a8=T;L438:while(1){a7=ba;while(1){be=a7;if((c[a7+16>>2]|0)>>>0>=a5>>>0){break}a6=c[a7+4>>2]|0;if((a6|0)==0){bf=a8;break L438}else{a7=a6}}a6=c[a7>>2]|0;if((a6|0)==0){bf=be;break}else{ba=a6;a8=be}}if((bf|0)==(T|0)){bd=331;break}if(a5>>>0<(c[bf+16>>2]|0)>>>0){bd=331}else{bg=l}}}while(0);do{if((bd|0)==331){bd=0;c[U>>2]=a5;c[n>>2]=l;dS(r,Y,s);a4=l+1|0;a8=c[S>>2]|0;ba=c[o>>2]|0;if((ba|0)==(c[bc>>2]|0)){cG(w,a8|0);bg=a4;break}if((ba|0)==0){bh=0}else{h[ba>>3]=+h[a8>>3];h[ba+8>>3]=+h[a8+8>>3];h[ba+16>>3]=+h[a8+16>>3];bh=c[o>>2]|0}c[o>>2]=bh+24;bg=a4}}while(0);a2=+h[(c[bb>>2]|0)+128+(a0<<3)>>3];g[A>>2]=a2;S=c[Q>>2]|0;if((S|0)==(c[O>>2]|0)){dV(y,A)}else{if((S|0)==0){bi=0}else{g[S>>2]=a2;bi=c[Q>>2]|0}c[Q>>2]=bi+4}S=a0+1|0;if((S|0)>=3){break}l=bg;a0=S;a1=c[c[bb>>2]>>2]|0}bj=bg;bk=c[$>>2]|0}else{bj=P;bk=u}a1=bb+4|0;if((a1|0)==(bk|0)){break}else{P=bj;bb=a1;u=bk}}u=c[_>>2]|0;if((u|0)==(bk|0)){break}else{bl=u}do{u=c[X>>2]|0;do{if((u|0)==0){bd=355}else{bb=c[c[c[c[bl>>2]>>2]>>2]>>2]|0;P=u;n=T;L471:while(1){U=P;while(1){bm=U;if((c[U+16>>2]|0)>>>0>=bb>>>0){break}E=c[U+4>>2]|0;if((E|0)==0){bn=n;break L471}else{U=E}}E=c[U>>2]|0;if((E|0)==0){bn=bm;break}else{P=E;n=bm}}if((bn|0)==(T|0)){bd=355;break}if(bb>>>0<(c[bn+16>>2]|0)>>>0){bd=355}else{bo=bn}}}while(0);if((bd|0)==355){bd=0;bo=T}u=bo+20|0;n=c[Z>>2]|0;if((n|0)==(c[C>>2]|0)){dU(x,u)}else{if((n|0)==0){bp=0}else{c[n>>2]=c[u>>2];bp=c[Z>>2]|0}c[Z>>2]=bp+4}u=c[X>>2]|0;do{if((u|0)==0){bd=405}else{n=c[c[(c[c[bl>>2]>>2]|0)+4>>2]>>2]|0;P=u;E=T;L491:while(1){j=P;while(1){br=j;if((c[j+16>>2]|0)>>>0>=n>>>0){break}a1=c[j+4>>2]|0;if((a1|0)==0){bs=E;break L491}else{j=a1}}U=c[j>>2]|0;if((U|0)==0){bs=br;break}else{P=U;E=br}}if((bs|0)==(T|0)){bd=405;break}if(n>>>0<(c[bs+16>>2]|0)>>>0){bd=405}else{bt=bs}}}while(0);if((bd|0)==405){bd=0;bt=T}u=bt+20|0;E=c[Z>>2]|0;if((E|0)==(c[C>>2]|0)){dU(x,u)}else{if((E|0)==0){bu=0}else{c[E>>2]=c[u>>2];bu=c[Z>>2]|0}c[Z>>2]=bu+4}u=c[X>>2]|0;do{if((u|0)==0){bd=419}else{E=c[c[(c[c[bl>>2]>>2]|0)+8>>2]>>2]|0;P=u;bb=T;L511:while(1){U=P;while(1){bv=U;if((c[U+16>>2]|0)>>>0>=E>>>0){break}a1=c[U+4>>2]|0;if((a1|0)==0){bw=bb;break L511}else{U=a1}}j=c[U>>2]|0;if((j|0)==0){bw=bv;break}else{P=j;bb=bv}}if((bw|0)==(T|0)){bd=419;break}if(E>>>0<(c[bw+16>>2]|0)>>>0){bd=419}else{bx=bw}}}while(0);if((bd|0)==419){bd=0;bx=T}u=bx+20|0;bb=c[Z>>2]|0;if((bb|0)==(c[C>>2]|0)){dU(x,u)}else{if((bb|0)==0){by=0}else{c[bb>>2]=c[u>>2];by=c[Z>>2]|0}c[Z>>2]=by+4}bl=bl+4|0;}while((bl|0)!=(c[$>>2]|0))}}while(0);$=((c[o>>2]|0)-(c[v>>2]|0)|0)/24&-1;bl=((c[Z>>2]|0)-(c[p>>2]|0)>>2>>>0)/3>>>0;by=bl*3&-1;x=$*3&-1;C=k4((($*12&-1)+8|0)+(bl*24&-1)|0)|0;bx=C;c[bx>>2]=$;c[C+4>>2]=bl;bl=C+8|0;C=c[p>>2]|0;if((c[Z>>2]|0)!=(C|0)){$=0;T=C;do{c[bl+($<<2)>>2]=c[T+($<<2)>>2];$=$+1|0;T=c[p>>2]|0;}while($>>>0<(c[Z>>2]|0)-T>>2>>>0)}T=by+2|0;$=c[v>>2]|0;if((c[o>>2]|0)!=($|0)){bl=by+3|0;C=by+4|0;by=0;bd=$;do{$=by*3&-1;g[bx+($+T<<2)>>2]=+h[bd+(by*24&-1)>>3];g[bx+(bl+$<<2)>>2]=+h[(c[v>>2]|0)+(by*24&-1)+8>>3];g[bx+(C+$<<2)>>2]=+h[(c[v>>2]|0)+(by*24&-1)+16>>3];by=by+1|0;bd=c[v>>2]|0;}while(by>>>0<(((c[o>>2]|0)-bd|0)/24&-1)>>>0)}bd=T+x|0;x=c[R>>2]|0;if((c[Q>>2]|0)!=(x|0)){T=0;by=x;do{g[bx+(bd+T<<2)>>2]=+g[by+(T<<2)>>2];T=T+1|0;by=c[R>>2]|0;}while(T>>>0<(c[Q>>2]|0)-by>>2>>>0)}dT(Y,c[z+4>>2]|0);z=c[R>>2]|0;R=z;if((z|0)!=0){Y=c[Q>>2]|0;if((z|0)!=(Y|0)){c[Q>>2]=Y+((((Y-4|0)+(-R|0)|0)>>>2^-1)<<2)}le(z)}z=c[p>>2]|0;p=z;if((z|0)!=0){R=c[Z>>2]|0;if((z|0)!=(R|0)){c[Z>>2]=R+((((R-4|0)+(-p|0)|0)>>>2^-1)<<2)}le(z)}z=c[v>>2]|0;if((z|0)==0){i=q;return bx|0}v=c[o>>2]|0;if((z|0)!=(v|0)){c[o>>2]=v+(((((v-24|0)+(-z|0)|0)>>>0)/24>>>0^-1)*24&-1)}le(z);i=q;return bx|0}function dQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=(d|0)==(b|0);a[d+12|0]=e&1;if(e){return}else{f=d}while(1){g=f+8|0;h=c[g>>2]|0;d=h+12|0;if((a[d]&1)!=0){i=469;break}j=h+8|0;k=c[j>>2]|0;e=c[k>>2]|0;if((h|0)==(e|0)){l=c[k+4>>2]|0;if((l|0)==0){i=434;break}m=l+12|0;if((a[m]&1)!=0){i=434;break}a[d]=1;a[k+12|0]=(k|0)==(b|0)&1;a[m]=1}else{if((e|0)==0){i=451;break}m=e+12|0;if((a[m]&1)!=0){i=451;break}a[d]=1;a[k+12|0]=(k|0)==(b|0)&1;a[m]=1}if((k|0)==(b|0)){i=467;break}else{f=k}}if((i|0)==434){if((f|0)==(c[h>>2]|0)){n=h;o=k}else{b=h+4|0;m=c[b>>2]|0;d=m|0;e=c[d>>2]|0;c[b>>2]=e;if((e|0)==0){p=k}else{c[e+8>>2]=h;p=c[j>>2]|0}e=m+8|0;c[e>>2]=p;p=c[j>>2]|0;b=p|0;if((c[b>>2]|0)==(h|0)){c[b>>2]=m}else{c[p+4>>2]=m}c[d>>2]=h;c[j>>2]=m;n=m;o=c[e>>2]|0}a[n+12|0]=1;a[o+12|0]=0;n=o|0;e=c[n>>2]|0;m=e+4|0;d=c[m>>2]|0;c[n>>2]=d;if((d|0)!=0){c[d+8>>2]=o}d=o+8|0;c[e+8>>2]=c[d>>2];n=c[d>>2]|0;p=n|0;if((c[p>>2]|0)==(o|0)){c[p>>2]=e}else{c[n+4>>2]=e}c[m>>2]=o;c[d>>2]=e;return}else if((i|0)==451){e=h|0;if((f|0)==(c[e>>2]|0)){d=f+4|0;o=c[d>>2]|0;c[e>>2]=o;if((o|0)==0){q=k}else{c[o+8>>2]=h;q=c[j>>2]|0}c[g>>2]=q;q=c[j>>2]|0;o=q|0;if((c[o>>2]|0)==(h|0)){c[o>>2]=f}else{c[q+4>>2]=f}c[d>>2]=h;c[j>>2]=f;r=f;s=c[g>>2]|0}else{r=h;s=k}a[r+12|0]=1;a[s+12|0]=0;r=s+4|0;k=c[r>>2]|0;h=k|0;g=c[h>>2]|0;c[r>>2]=g;if((g|0)!=0){c[g+8>>2]=s}g=s+8|0;c[k+8>>2]=c[g>>2];r=c[g>>2]|0;f=r|0;if((c[f>>2]|0)==(s|0)){c[f>>2]=k}else{c[r+4>>2]=k}c[h>>2]=s;c[g>>2]=k;return}else if((i|0)==467){return}else if((i|0)==469){return}}function dR(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((bZ[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){if(q>>>0<11){h=q<<1&255;e=l;a[e]=h;r=l+1|0;s=h;t=e}else{e=q+16&-16;h=la(e)|0;c[l+8>>2]=h;g=e|1;c[l>>2]=g;c[l+4>>2]=q;r=h;s=g&255;t=l}ln(r|0,j|0,q|0);a[r+q|0]=0;if((s&1)==0){u=l+1|0}else{u=c[l+8>>2]|0}if((bZ[c[(c[d>>2]|0)+48>>2]&63](d,u,q)|0)==(q|0)){if((a[t]&1)==0){break}le(c[l+8>>2]|0);break}c[m>>2]=0;c[b>>2]=0;if((a[t]&1)==0){i=k;return}le(c[l+8>>2]|0);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((bZ[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function dS(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+8|0;g=f|0;h=d+4|0;j=h|0;k=c[j>>2]|0;do{if((k|0)==0){l=h;c[g>>2]=l;m=j;n=l}else{l=c[e>>2]|0;o=k;while(1){p=c[o+16>>2]|0;if(l>>>0<p>>>0){q=o|0;r=c[q>>2]|0;if((r|0)==0){s=506;break}else{o=r;continue}}if(p>>>0>=l>>>0){s=510;break}t=o+4|0;p=c[t>>2]|0;if((p|0)==0){s=509;break}else{o=p}}if((s|0)==506){c[g>>2]=o;m=q;n=o;break}else if((s|0)==509){c[g>>2]=o;m=t;n=o;break}else if((s|0)==510){c[g>>2]=o;m=g;n=o;break}}}while(0);g=c[m>>2]|0;if((g|0)!=0){u=g;v=0;w=b|0;c[w>>2]=u;x=b+4|0;a[x]=v;i=f;return}g=la(24)|0;s=g+16|0;if((s|0)!=0){c[s>>2]=c[e>>2];c[g+20>>2]=c[e+4>>2]}e=g;c[g>>2]=0;c[g+4>>2]=0;c[g+8>>2]=n;c[m>>2]=e;n=d|0;s=c[c[n>>2]>>2]|0;if((s|0)==0){y=e}else{c[n>>2]=s;y=c[m>>2]|0}dQ(c[d+4>>2]|0,y);y=d+8|0;c[y>>2]=(c[y>>2]|0)+1;u=g;v=1;w=b|0;c[w>>2]=u;x=b+4|0;a[x]=v;i=f;return}function dT(a,b){a=a|0;b=b|0;if((b|0)==0){return}else{dT(a,c[b>>2]|0);dT(a,c[b+4>>2]|0);le(b);return}}function dU(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=(c[d>>2]|0)-f>>2;h=g+1|0;if(h>>>0>1073741823){i_(0)}i=a+8|0;a=(c[i>>2]|0)-f|0;if(a>>2>>>0>536870910){j=1073741823;k=528}else{f=a>>1;a=f>>>0<h>>>0?h:f;if((a|0)==0){l=0;m=0}else{j=a;k=528}}if((k|0)==528){l=la(j<<2)|0;m=j}j=l+(g<<2)|0;if((j|0)!=0){c[j>>2]=c[b>>2]}b=c[e>>2]|0;j=(c[d>>2]|0)-b|0;k=l+(g-(j>>2)<<2)|0;g=b;lj(k|0,g|0,j);c[e>>2]=k;c[d>>2]=l+(h<<2);c[i>>2]=l+(m<<2);if((b|0)==0){return}le(g);return}function dV(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=a+4|0;e=a|0;f=c[e>>2]|0;h=(c[d>>2]|0)-f>>2;i=h+1|0;if(i>>>0>1073741823){i_(0)}j=a+8|0;a=(c[j>>2]|0)-f|0;if(a>>2>>>0>536870910){k=1073741823;l=540}else{f=a>>1;a=f>>>0<i>>>0?i:f;if((a|0)==0){m=0;n=0}else{k=a;l=540}}if((l|0)==540){m=la(k<<2)|0;n=k}k=m+(h<<2)|0;if((k|0)!=0){g[k>>2]=+g[b>>2]}b=c[e>>2]|0;k=(c[d>>2]|0)-b|0;l=m+(h-(k>>2)<<2)|0;h=b;lj(l|0,h|0,k);c[e>>2]=l;c[d>>2]=m+(i<<2);c[j>>2]=m+(n<<2);if((b|0)==0){return}le(h);return}function dW(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=c[b>>2]|0;g=c[a>>2]|0;h=c[d>>2]|0;i=h>>>0<f>>>0;do{if(f>>>0<g>>>0){if(i){c[a>>2]=h;c[d>>2]=g;j=1;k=g;break}c[a>>2]=f;c[b>>2]=g;l=c[d>>2]|0;if(l>>>0>=g>>>0){j=1;k=l;break}c[b>>2]=l;c[d>>2]=g;j=2;k=g}else{if(!i){j=0;k=h;break}c[b>>2]=h;c[d>>2]=f;l=c[b>>2]|0;m=c[a>>2]|0;if(l>>>0>=m>>>0){j=1;k=f;break}c[a>>2]=l;c[b>>2]=m;j=2;k=c[d>>2]|0}}while(0);f=c[e>>2]|0;if(f>>>0>=k>>>0){n=j;return n|0}c[d>>2]=f;c[e>>2]=k;k=c[d>>2]|0;e=c[b>>2]|0;if(k>>>0>=e>>>0){n=j+1|0;return n|0}c[b>>2]=k;c[d>>2]=e;e=c[b>>2]|0;d=c[a>>2]|0;if(e>>>0>=d>>>0){n=j+2|0;return n|0}c[a>>2]=e;c[b>>2]=d;n=j+3|0;return n|0}function dX(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=a;a=b;L736:while(1){b=a;f=a-4|0;g=e;L738:while(1){h=g;i=b-h|0;j=i>>2;if((j|0)==2){k=568;break L736}else if((j|0)==4){k=578;break L736}else if((j|0)==5){k=579;break L736}else if((j|0)==3){k=570;break L736}else if((j|0)==0|(j|0)==1){k=661;break L736}if((i|0)<124){k=585;break L736}l=(j|0)/2&-1;m=g+(l<<2)|0;do{if((i|0)>3996){n=(j|0)/4&-1;o=g+(n<<2)|0;p=g+(n+l<<2)|0;n=dW(g,o,m,p,0)|0;q=c[f>>2]|0;r=c[p>>2]|0;if(q>>>0>=r>>>0){s=n;break}c[p>>2]=q;c[f>>2]=r;r=c[p>>2]|0;q=c[m>>2]|0;if(r>>>0>=q>>>0){s=n+1|0;break}c[m>>2]=r;c[p>>2]=q;q=c[m>>2]|0;p=c[o>>2]|0;if(q>>>0>=p>>>0){s=n+2|0;break}c[o>>2]=q;c[m>>2]=p;p=c[o>>2]|0;q=c[g>>2]|0;if(p>>>0>=q>>>0){s=n+3|0;break}c[g>>2]=p;c[o>>2]=q;s=n+4|0}else{n=c[m>>2]|0;q=c[g>>2]|0;o=c[f>>2]|0;p=o>>>0<n>>>0;if(n>>>0>=q>>>0){if(!p){s=0;break}c[m>>2]=o;c[f>>2]=n;r=c[m>>2]|0;t=c[g>>2]|0;if(r>>>0>=t>>>0){s=1;break}c[g>>2]=r;c[m>>2]=t;s=2;break}if(p){c[g>>2]=o;c[f>>2]=q;s=1;break}c[g>>2]=n;c[m>>2]=q;n=c[f>>2]|0;if(n>>>0>=q>>>0){s=1;break}c[m>>2]=n;c[f>>2]=q;s=2}}while(0);l=c[g>>2]|0;j=c[m>>2]|0;do{if(l>>>0<j>>>0){u=f;v=s}else{i=f;while(1){w=i-4|0;if((g|0)==(w|0)){break}x=c[w>>2]|0;if(x>>>0<j>>>0){k=629;break}else{i=w}}if((k|0)==629){k=0;c[g>>2]=x;c[w>>2]=l;u=w;v=s+1|0;break}i=g+4|0;q=c[f>>2]|0;if(l>>>0<q>>>0){y=i}else{n=i;while(1){if((n|0)==(f|0)){k=659;break L736}z=c[n>>2]|0;A=n+4|0;if(l>>>0<z>>>0){break}else{n=A}}c[n>>2]=q;c[f>>2]=z;y=A}if((y|0)==(f|0)){k=660;break L736}else{B=f;C=y}while(1){i=c[g>>2]|0;o=C;while(1){D=c[o>>2]|0;E=o+4|0;if(i>>>0<D>>>0){F=B;break}else{o=E}}do{F=F-4|0;G=c[F>>2]|0;}while(i>>>0<G>>>0);if(o>>>0>=F>>>0){g=o;continue L738}c[o>>2]=G;c[F>>2]=D;B=F;C=E}}}while(0);l=g+4|0;L785:do{if(l>>>0<u>>>0){j=u;q=l;n=v;i=m;while(1){p=c[i>>2]|0;t=q;while(1){H=c[t>>2]|0;I=t+4|0;if(H>>>0<p>>>0){t=I}else{J=j;break}}do{J=J-4|0;K=c[J>>2]|0;}while(K>>>0>=p>>>0);if(t>>>0>J>>>0){L=t;M=n;N=i;break L785}c[t>>2]=K;c[J>>2]=H;j=J;q=I;n=n+1|0;i=(i|0)==(t|0)?J:i}}else{L=l;M=v;N=m}}while(0);do{if((L|0)==(N|0)){O=M}else{m=c[N>>2]|0;l=c[L>>2]|0;if(m>>>0>=l>>>0){O=M;break}c[L>>2]=m;c[N>>2]=l;O=M+1|0}}while(0);if((O|0)==0){P=dY(g,L,0)|0;l=L+4|0;if(dY(l,a,0)|0){k=641;break}if(P){g=l;continue}}l=L;if((l-h|0)>=(b-l|0)){k=645;break}dX(g,L,d);g=L+4|0}if((k|0)==641){k=0;if(P){k=665;break}else{e=g;a=L;continue}}else if((k|0)==645){k=0;dX(L+4|0,a,d);e=g;a=L;continue}}if((k|0)==568){L=c[f>>2]|0;e=c[g>>2]|0;if(L>>>0>=e>>>0){return}c[g>>2]=L;c[f>>2]=e;return}else if((k|0)==578){dW(g,g+4|0,g+8|0,f,0);return}else if((k|0)==579){e=g+4|0;L=g+8|0;d=g+12|0;dW(g,e,L,d,0);P=c[f>>2]|0;O=c[d>>2]|0;if(P>>>0>=O>>>0){return}c[d>>2]=P;c[f>>2]=O;O=c[d>>2]|0;P=c[L>>2]|0;if(O>>>0>=P>>>0){return}c[L>>2]=O;c[d>>2]=P;P=c[e>>2]|0;if(O>>>0>=P>>>0){return}c[e>>2]=O;c[L>>2]=P;P=c[g>>2]|0;if(O>>>0>=P>>>0){return}c[g>>2]=O;c[e>>2]=P;return}else if((k|0)==585){P=g+8|0;e=g+4|0;O=c[e>>2]|0;L=c[g>>2]|0;d=c[P>>2]|0;M=d>>>0<O>>>0;do{if(O>>>0<L>>>0){if(M){c[g>>2]=d;c[P>>2]=L;Q=L;break}c[g>>2]=O;c[e>>2]=L;if(d>>>0>=L>>>0){Q=d;break}c[e>>2]=d;c[P>>2]=L;Q=L}else{if(!M){Q=d;break}c[e>>2]=d;c[P>>2]=O;if(d>>>0>=L>>>0){Q=O;break}c[g>>2]=d;c[e>>2]=L;Q=O}}while(0);O=g+12|0;if((O|0)==(a|0)){return}else{R=P;S=O;T=Q}while(1){Q=c[S>>2]|0;if(Q>>>0<T>>>0){O=R;P=S;L=T;while(1){c[P>>2]=L;if((O|0)==(g|0)){U=g;break}e=O-4|0;d=c[e>>2]|0;if(Q>>>0<d>>>0){P=O;O=e;L=d}else{U=O;break}}c[U>>2]=Q}O=S+4|0;if((O|0)==(a|0)){break}L=c[S>>2]|0;R=S;S=O;T=L}return}else if((k|0)==570){T=g+4|0;S=c[T>>2]|0;R=c[g>>2]|0;a=c[f>>2]|0;U=a>>>0<S>>>0;if(S>>>0>=R>>>0){if(!U){return}c[T>>2]=a;c[f>>2]=S;L=c[T>>2]|0;O=c[g>>2]|0;if(L>>>0>=O>>>0){return}c[g>>2]=L;c[T>>2]=O;return}if(U){c[g>>2]=a;c[f>>2]=R;return}c[g>>2]=S;c[T>>2]=R;S=c[f>>2]|0;if(S>>>0>=R>>>0){return}c[T>>2]=S;c[f>>2]=R;return}else if((k|0)==659){return}else if((k|0)==660){return}else if((k|0)==661){return}else if((k|0)==665){return}}function dY(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=b-a>>2;if((d|0)==2){e=b-4|0;f=c[e>>2]|0;g=c[a>>2]|0;if(f>>>0>=g>>>0){h=1;return h|0}c[a>>2]=f;c[e>>2]=g;h=1;return h|0}else if((d|0)==3){g=a+4|0;e=b-4|0;f=c[g>>2]|0;i=c[a>>2]|0;j=c[e>>2]|0;k=j>>>0<f>>>0;if(f>>>0>=i>>>0){if(!k){h=1;return h|0}c[g>>2]=j;c[e>>2]=f;l=c[g>>2]|0;m=c[a>>2]|0;if(l>>>0>=m>>>0){h=1;return h|0}c[a>>2]=l;c[g>>2]=m;h=1;return h|0}if(k){c[a>>2]=j;c[e>>2]=i;h=1;return h|0}c[a>>2]=f;c[g>>2]=i;f=c[e>>2]|0;if(f>>>0>=i>>>0){h=1;return h|0}c[g>>2]=f;c[e>>2]=i;h=1;return h|0}else if((d|0)==4){dW(a,a+4|0,a+8|0,b-4|0,0);h=1;return h|0}else if((d|0)==5){i=a+4|0;e=a+8|0;f=a+12|0;g=b-4|0;dW(a,i,e,f,0);j=c[g>>2]|0;k=c[f>>2]|0;if(j>>>0>=k>>>0){h=1;return h|0}c[f>>2]=j;c[g>>2]=k;k=c[f>>2]|0;g=c[e>>2]|0;if(k>>>0>=g>>>0){h=1;return h|0}c[e>>2]=k;c[f>>2]=g;g=c[i>>2]|0;if(k>>>0>=g>>>0){h=1;return h|0}c[i>>2]=k;c[e>>2]=g;g=c[a>>2]|0;if(k>>>0>=g>>>0){h=1;return h|0}c[a>>2]=k;c[i>>2]=g;h=1;return h|0}else if((d|0)==0|(d|0)==1){h=1;return h|0}else{d=a+8|0;g=a+4|0;i=c[g>>2]|0;k=c[a>>2]|0;e=c[d>>2]|0;f=e>>>0<i>>>0;do{if(i>>>0<k>>>0){if(f){c[a>>2]=e;c[d>>2]=k;n=k;break}c[a>>2]=i;c[g>>2]=k;if(e>>>0>=k>>>0){n=e;break}c[g>>2]=e;c[d>>2]=k;n=k}else{if(!f){n=e;break}c[g>>2]=e;c[d>>2]=i;if(e>>>0>=k>>>0){n=i;break}c[a>>2]=e;c[g>>2]=k;n=i}}while(0);i=a+12|0;if((i|0)==(b|0)){h=1;return h|0}else{o=d;p=0;q=i;r=n}while(1){n=c[q>>2]|0;if(n>>>0<r>>>0){i=o;d=q;k=r;while(1){c[d>>2]=k;if((i|0)==(a|0)){s=a;break}g=i-4|0;e=c[g>>2]|0;if(n>>>0<e>>>0){d=i;i=g;k=e}else{s=i;break}}c[s>>2]=n;i=p+1|0;if((i|0)==8){break}else{t=i}}else{t=p}i=q+4|0;if((i|0)==(b|0)){h=1;u=718;break}k=c[q>>2]|0;o=q;p=t;q=i;r=k}if((u|0)==718){return h|0}h=(q+4|0)==(b|0);return h|0}return 0}function dZ(a){a=a|0;var b=0;c[a>>2]=13008;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);return}function d_(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13008;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;le(e);return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);e=a;le(e);return}function d$(b,d){b=b|0;d=d|0;var e=0;b_[c[(c[b>>2]|0)+24>>2]&255](b);e=jp(d,19096)|0;d=e;c[b+36>>2]=d;a[b+44|0]=b_[c[(c[e>>2]|0)+28>>2]&255](d)&1;return}function d0(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=b8[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a3(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=735;break}if((l|0)==2){m=-1;n=736;break}else if((l|0)!=1){n=733;break}}if((n|0)==733){m=((aZ(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==735){i=b;return m|0}else if((n|0)==736){i=b;return m|0}return 0}function d1(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+4|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;c[g>>2]=d;c[m>>2]=l;L967:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=b3[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=753;break}if((y|0)==3){B=744;break}if(y>>>0>=2){A=-1;B=755;break}x=(c[h>>2]|0)-t|0;if((a3(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=756;break}if((y|0)!=1){break L967}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y>>2<<2)|0;c[m>>2]=C;v=y;w=C}if((B|0)==744){if((a3(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==753){i=e;return A|0}else if((B|0)==755){i=e;return A|0}else if((B|0)==756){i=e;return A|0}}else{if((a3(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function d2(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,p=0,q=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;eD(18832,c[o>>2]|0,18904);c[4942]=13300;c[4944]=13320;c[4943]=0;c[4950]=18832;c[4948]=0;c[4949]=0;c[4945]=4098;c[4947]=0;c[4946]=6;ln(19808,0,40);if(a[20008]|0){d=c[2496]|0}else{if(a[20016]|0){e=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;e=10288}c[2502]=e;b=e+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;c[2496]=10008;a[20008]=1;d=10008}b=c[d>>2]|0;c[4951]=b;d=b+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;c[4962]=0;c[4963]=-1;ei(18736,c[s>>2]|0,18912);c[4876]=13204;c[4877]=13224;c[4883]=18736;c[4881]=0;c[4882]=0;c[4878]=4098;c[4880]=0;c[4879]=6;ln(19540,0,40);if(a[20008]|0){f=c[2496]|0}else{if(a[20016]|0){g=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;g=10288}c[2502]=g;d=g+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;c[2496]=10008;a[20008]=1;f=10008}d=c[f>>2]|0;c[4884]=d;f=d+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;c[4895]=0;c[4896]=-1;ei(18784,c[r>>2]|0,18920);c[4920]=13204;c[4921]=13224;c[4927]=18784;c[4925]=0;c[4926]=0;c[4922]=4098;c[4924]=0;c[4923]=6;ln(19716,0,40);if(a[20008]|0){h=c[2496]|0}else{if(a[20016]|0){i=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;i=10288}c[2502]=i;f=i+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;c[2496]=10008;a[20008]=1;h=10008}f=c[h>>2]|0;c[4928]=f;h=f+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;c[4939]=0;c[4940]=-1;h=c[19680+((c[(c[4920]|0)-12>>2]|0)+24|0)>>2]|0;c[4898]=13204;c[4899]=13224;c[4905]=h;c[4903]=(h|0)==0&1;c[4904]=0;c[4900]=4098;c[4902]=0;c[4901]=6;ln(19628,0,40);if(a[20008]|0){j=c[2496]|0}else{if(a[20016]|0){k=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;k=10288}c[2502]=k;h=k+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;c[2496]=10008;a[20008]=1;j=10008}h=c[j>>2]|0;c[4906]=h;j=h+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;c[4917]=0;c[4918]=-1;c[19768+((c[(c[4942]|0)-12>>2]|0)+72|0)>>2]=19504;j=19680+((c[(c[4920]|0)-12>>2]|0)+4|0)|0;c[j>>2]=c[j>>2]|8192;c[19680+((c[(c[4920]|0)-12>>2]|0)+72|0)>>2]=19504;eg(18680,c[o>>2]|0,18928);c[4854]=13252;c[4856]=13272;c[4855]=0;c[4862]=18680;c[4860]=0;c[4861]=0;c[4857]=4098;c[4859]=0;c[4858]=6;ln(19456,0,40);if(a[20008]|0){l=c[2496]|0}else{if(a[20016]|0){m=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;m=10288}c[2502]=m;j=m+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;c[2496]=10008;a[20008]=1;l=10008}j=c[l>>2]|0;c[4863]=j;l=j+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[4874]=0;c[4875]=-1;d4(18584,c[s>>2]|0,18936);c[4784]=13156;c[4785]=13176;c[4791]=18584;c[4789]=0;c[4790]=0;c[4786]=4098;c[4788]=0;c[4787]=6;ln(19172,0,40);if(a[20008]|0){n=c[2496]|0}else{if(a[20016]|0){p=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;p=10288}c[2502]=p;l=p+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[2496]=10008;a[20008]=1;n=10008}l=c[n>>2]|0;c[4792]=l;n=l+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;c[4803]=0;c[4804]=-1;d4(18632,c[r>>2]|0,18944);c[4828]=13156;c[4829]=13176;c[4835]=18632;c[4833]=0;c[4834]=0;c[4830]=4098;c[4832]=0;c[4831]=6;ln(19348,0,40);if(a[20008]|0){q=c[2496]|0}else{if(a[20016]|0){t=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;t=10288}c[2502]=t;n=t+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;c[2496]=10008;a[20008]=1;q=10008}n=c[q>>2]|0;c[4836]=n;q=n+4|0;I=c[q>>2]|0,c[q>>2]=I+1,I;c[4847]=0;c[4848]=-1;q=c[19312+((c[(c[4828]|0)-12>>2]|0)+24|0)>>2]|0;c[4806]=13156;c[4807]=13176;c[4813]=q;c[4811]=(q|0)==0&1;c[4812]=0;c[4808]=4098;c[4810]=0;c[4809]=6;ln(19260,0,40);if(a[20008]|0){u=c[2496]|0;v=u|0;w=c[v>>2]|0;x=w;c[4814]=x;y=w+4|0;z=(I=c[y>>2]|0,c[y>>2]=I+1,I);c[4825]=0;c[4826]=-1;A=c[4854]|0;B=A-12|0;C=B;D=c[C>>2]|0;E=D+72|0;F=E+19416|0;G=F;c[G>>2]=19136;H=c[4828]|0;J=H-12|0;K=J;L=c[K>>2]|0;M=L+4|0;N=M+19312|0;O=N;P=c[O>>2]|0;Q=P|8192;c[O>>2]=Q;R=c[4828]|0;S=R-12|0;T=S;U=c[T>>2]|0;V=U+72|0;W=V+19312|0;X=W;c[X>>2]=19136;return}if(a[20016]|0){Y=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;Y=10288}c[2502]=Y;q=Y+4|0;I=c[q>>2]|0,c[q>>2]=I+1,I;c[2496]=10008;a[20008]=1;u=10008;v=u|0;w=c[v>>2]|0;x=w;c[4814]=x;y=w+4|0;z=(I=c[y>>2]|0,c[y>>2]=I+1,I);c[4825]=0;c[4826]=-1;A=c[4854]|0;B=A-12|0;C=B;D=c[C>>2]|0;E=D+72|0;F=E+19416|0;G=F;c[G>>2]=19136;H=c[4828]|0;J=H-12|0;K=J;L=c[K>>2]|0;M=L+4|0;N=M+19312|0;O=N;P=c[O>>2]|0;Q=P|8192;c[O>>2]=Q;R=c[4828]|0;S=R-12|0;T=S;U=c[T>>2]|0;V=U+72|0;W=V+19312|0;X=W;c[X>>2]=19136;return}function d3(a){a=a|0;fS(19504);fS(19592);fT(19136);fT(19224);return}function d4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=13008;if(a[20008]|0){j=c[2496]|0}else{if(a[20016]|0){k=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;k=10288}c[2502]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[2496]=10008;a[20008]=1;j=10008}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;ln(b+8|0,0,24);c[h>>2]=13376;c[b+32>>2]=d;d=b+36|0;h=g|0;j=c[l>>2]|0;c[h>>2]=j;l=j+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;l=jp(g,19096)|0;g=l;j=c[h>>2]|0;h=j+4|0;if(((I=c[h>>2]|0,c[h>>2]=I+ -1,I)|0)!=0){c[d>>2]=g;m=b+40|0;c[m>>2]=e;n=b+44|0;o=l;p=c[o>>2]|0;q=p+28|0;r=c[q>>2]|0;s=b_[r&255](g)|0;t=s&1;a[n]=t;i=f;return}bW[c[(c[j>>2]|0)+8>>2]&255](j|0);c[d>>2]=g;m=b+40|0;c[m>>2]=e;n=b+44|0;o=l;p=c[o>>2]|0;q=p+28|0;r=c[q>>2]|0;s=b_[r&255](g)|0;t=s&1;a[n]=t;i=f;return}function d5(a){a=a|0;var b=0;c[a>>2]=13008;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);return}function d6(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13008;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;le(e);return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);e=a;le(e);return}function d7(a){a=a|0;return ea(a,0)|0}function d8(a){a=a|0;return ea(a,1)|0}function d9(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}c[h>>2]=d;k=c[b+36>>2]|0;l=f|0;m=b3[c[(c[k>>2]|0)+12>>2]&31](k,c[b+40>>2]|0,h,h+4|0,e+24|0,l,f+8|0,g)|0;if((m|0)==3){a[l]=d&255;c[g>>2]=f+1}else if((m|0)==2|(m|0)==1){j=-1;i=e;return j|0}m=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=l>>>0){j=d;n=871;break}f=b-1|0;c[g>>2]=f;if((bP(a[f]|0|0,c[m>>2]|0)|0)==-1){j=-1;n=872;break}}if((n|0)==871){i=e;return j|0}else if((n|0)==872){i=e;return j|0}return 0}function ea(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=c[b+44>>2]|0;l=(k|0)>1?k:1;L1108:do{if((l|0)>0){k=b+32|0;m=0;while(1){n=aM(c[k>>2]|0)|0;if((n|0)==-1){o=-1;break}a[f+m|0]=n&255;m=m+1|0;if((m|0)>=(l|0)){break L1108}}i=e;return o|0}}while(0);L1115:do{if((a[b+48|0]&1)==0){m=b+40|0;k=b+36|0;n=f|0;p=g+4|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[k>>2]|0;w=f+r|0;x=b3[c[(c[t>>2]|0)+16>>2]&31](t,s,n,w,h,g,p,j)|0;if((x|0)==3){y=883;break}else if((x|0)==2){o=-1;y=892;break}else if((x|0)!=1){z=r;break L1115}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=893;break}v=aM(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=894;break}a[w]=v&255;r=r+1|0}if((y|0)==883){c[g>>2]=a[n]|0;z=r;break}else if((y|0)==892){i=e;return o|0}else if((y|0)==893){i=e;return o|0}else if((y|0)==894){i=e;return o|0}}else{c[g>>2]=a[f|0]|0;z=l}}while(0);L1129:do{if(!d){l=b+32|0;y=z;while(1){if((y|0)<=0){break L1129}j=y-1|0;if((bP(a[f+j|0]|0|0,c[l>>2]|0)|0)==-1){o=-1;break}else{y=j}}i=e;return o|0}}while(0);o=c[g>>2]|0;i=e;return o|0}function eb(a){a=a|0;var b=0;c[a>>2]=13080;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);return}function ec(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13080;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;le(e);return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);e=a;le(e);return}function ed(b,d){b=b|0;d=d|0;var e=0;b_[c[(c[b>>2]|0)+24>>2]&255](b);e=jp(d,19104)|0;d=e;c[b+36>>2]=d;a[b+44|0]=b_[c[(c[e>>2]|0)+28>>2]&255](d)&1;return}function ee(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=b8[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a3(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=913;break}if((l|0)==2){m=-1;n=914;break}else if((l|0)!=1){n=911;break}}if((n|0)==911){m=((aZ(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==913){i=b;return m|0}else if((n|0)==914){i=b;return m|0}return 0}function ef(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+1|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;a[g]=d&255;c[m>>2]=l;L1160:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=b3[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=931;break}if((y|0)==3){B=922;break}if(y>>>0>=2){A=-1;B=933;break}x=(c[h>>2]|0)-t|0;if((a3(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=934;break}if((y|0)!=1){break L1160}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y|0)|0;c[m>>2]=C;v=y;w=C}if((B|0)==922){if((a3(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==931){i=e;return A|0}else if((B|0)==933){i=e;return A|0}else if((B|0)==934){i=e;return A|0}}else{if((a3(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function eg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=13008;if(a[20008]|0){j=c[2496]|0}else{if(a[20016]|0){k=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;k=10288}c[2502]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[2496]=10008;a[20008]=1;j=10008}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;ln(b+8|0,0,24);c[h>>2]=13776;c[b+32>>2]=d;c[b+40>>2]=e;e=g|0;d=c[l>>2]|0;c[e>>2]=d;l=d+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;l=jp(g,19096)|0;g=l;d=b+36|0;c[d>>2]=g;h=b+44|0;c[h>>2]=b_[c[(c[l>>2]|0)+24>>2]&255](g)|0;g=c[d>>2]|0;a[b+48|0]=b_[c[(c[g>>2]|0)+28>>2]&255](g)&1;if((c[h>>2]|0)<=8){h=c[e>>2]|0;e=h+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){i=f;return}bW[c[(c[h>>2]|0)+8>>2]&255](h|0);i=f;return}f=bi(8)|0;c[f>>2]=11320;h=f+4|0;if((h|0)!=0){e=lb(50)|0;c[e+4>>2]=37;c[e>>2]=37;g=e+12|0;c[h>>2]=g;c[e+8>>2]=0;lj(g|0,200,38)}aN(f|0,17048,64)}function eh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=jp(d,19096)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=b_[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=b_[c[(c[d>>2]|0)+28>>2]&255](d)&1;if((c[g>>2]|0)>8){is(200)}else{return}}function ei(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=13080;if(a[20008]|0){j=c[2496]|0}else{if(a[20016]|0){k=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;k=10288}c[2502]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[2496]=10008;a[20008]=1;j=10008}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;ln(b+8|0,0,24);c[h>>2]=13448;c[b+32>>2]=d;d=b+36|0;h=g|0;j=c[l>>2]|0;c[h>>2]=j;l=j+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;l=jp(g,19104)|0;g=l;j=c[h>>2]|0;h=j+4|0;if(((I=c[h>>2]|0,c[h>>2]=I+ -1,I)|0)!=0){c[d>>2]=g;m=b+40|0;c[m>>2]=e;n=b+44|0;o=l;p=c[o>>2]|0;q=p+28|0;r=c[q>>2]|0;s=b_[r&255](g)|0;t=s&1;a[n]=t;i=f;return}bW[c[(c[j>>2]|0)+8>>2]&255](j|0);c[d>>2]=g;m=b+40|0;c[m>>2]=e;n=b+44|0;o=l;p=c[o>>2]|0;q=p+28|0;r=c[q>>2]|0;s=b_[r&255](g)|0;t=s&1;a[n]=t;i=f;return}function ej(a){a=a|0;return c[a+4>>2]|0}function ek(a){a=a|0;return c[a+4>>2]|0}function el(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function em(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function en(a){a=a|0;var b=0;c[a>>2]=13080;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);return}function eo(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13080;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;le(e);return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);e=a;le(e);return}function ep(a){a=a|0;return es(a,0)|0}function eq(a){a=a|0;return es(a,1)|0}function er(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}k=d&255;a[h]=k;l=c[b+36>>2]|0;m=f|0;n=b3[c[(c[l>>2]|0)+12>>2]&31](l,c[b+40>>2]|0,h,h+1|0,e+24|0,m,f+8|0,g)|0;if((n|0)==2|(n|0)==1){j=-1;i=e;return j|0}else if((n|0)==3){a[m]=k;c[g>>2]=f+1}f=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=m>>>0){j=d;o=1015;break}k=b-1|0;c[g>>2]=k;if((bP(a[k]|0|0,c[f>>2]|0)|0)==-1){j=-1;o=1014;break}}if((o|0)==1014){i=e;return j|0}else if((o|0)==1015){i=e;return j|0}return 0}function es(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[b+44>>2]|0;m=(l|0)>1?l:1;L1257:do{if((m|0)>0){l=b+32|0;n=0;while(1){o=aM(c[l>>2]|0)|0;if((o|0)==-1){p=-1;break}a[g+n|0]=o&255;n=n+1|0;if((n|0)>=(m|0)){break L1257}}i=f;return p|0}}while(0);L1264:do{if((a[b+48|0]&1)==0){n=b+40|0;l=b+36|0;o=g|0;q=h+1|0;r=b+32|0;s=m;while(1){t=c[n>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[l>>2]|0;x=g+s|0;y=b3[c[(c[u>>2]|0)+16>>2]&31](u,t,o,x,j,h,q,k)|0;if((y|0)==2){p=-1;z=1034;break}else if((y|0)==3){z=1026;break}else if((y|0)!=1){A=s;break L1264}y=c[n>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){p=-1;z=1036;break}w=aM(c[r>>2]|0)|0;if((w|0)==-1){p=-1;z=1035;break}a[x]=w&255;s=s+1|0}if((z|0)==1034){i=f;return p|0}else if((z|0)==1026){a[h]=a[o]|0;A=s;break}else if((z|0)==1035){i=f;return p|0}else if((z|0)==1036){i=f;return p|0}}else{a[h]=a[g|0]|0;A=m}}while(0);L1278:do{if(!e){m=b+32|0;z=A;while(1){if((z|0)<=0){break L1278}k=z-1|0;if((bP(d[g+k|0]|0|0,c[m>>2]|0)|0)==-1){p=-1;break}else{z=k}}i=f;return p|0}}while(0);p=d[h]|0;i=f;return p|0}function et(){d2(0);aR(132,19856|0,u|0);return}function eu(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=11384;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;le(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;le(e);return}lf(d);e=a;le(e);return}function ev(a){a=a|0;var b=0;c[a>>2]=11384;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lf(a);return}function ew(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=11320;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;le(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;le(e);return}lf(d);e=a;le(e);return}function ex(a){a=a|0;var b=0;c[a>>2]=11320;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lf(a);return}function ey(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=11384;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;le(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;le(e);return}lf(d);e=a;le(e);return}function ez(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;b0[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function eA(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;do{if((l|0)!=0){m=d[h]|0;if((m&1|0)==0){n=m>>>1}else{n=c[f+4>>2]|0}if((n|0)==0){o=l}else{eJ(f,2344,2);o=c[k>>2]|0}m=c[e+4>>2]|0;b0[c[(c[m>>2]|0)+24>>2]&7](j,m,o);m=j;p=a[m]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}r=p&255;if((r&1|0)==0){s=r>>>1}else{s=c[j+4>>2]|0}eJ(f,q,s);if((a[m]&1)==0){break}le(c[j+8>>2]|0)}}while(0);j=b;c[j>>2]=c[h>>2];c[j+4>>2]=c[h+4>>2];c[j+8>>2]=c[h+8>>2];ln(h|0,0,12);i=g;return}function eB(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=11320;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;le(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;le(e);return}lf(d);e=a;le(e);return}function eC(a){a=a|0;var b=0;c[a>>2]=11320;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lf(a);return}function eD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=13080;if(a[20008]|0){j=c[2496]|0}else{if(a[20016]|0){k=c[c[2498]>>2]|0}else{i$(10288,1);c[2500]=10288;c[2498]=1e4;a[20016]=1;k=10288}c[2502]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[2496]=10008;a[20008]=1;j=10008}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;ln(b+8|0,0,24);c[h>>2]=13848;c[b+32>>2]=d;c[b+40>>2]=e;e=g|0;d=c[l>>2]|0;c[e>>2]=d;l=d+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;l=jp(g,19104)|0;g=l;d=b+36|0;c[d>>2]=g;h=b+44|0;c[h>>2]=b_[c[(c[l>>2]|0)+24>>2]&255](g)|0;g=c[d>>2]|0;a[b+48|0]=b_[c[(c[g>>2]|0)+28>>2]&255](g)&1;if((c[h>>2]|0)<=8){h=c[e>>2]|0;e=h+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){i=f;return}bW[c[(c[h>>2]|0)+8>>2]&255](h|0);i=f;return}f=bi(8)|0;c[f>>2]=11320;h=f+4|0;if((h|0)!=0){e=lb(50)|0;c[e+4>>2]=37;c[e>>2]=37;g=e+12|0;c[h>>2]=g;c[e+8>>2]=0;lj(g|0,200,38)}aN(f|0,17048,64)}function eE(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=jp(d,19104)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=b_[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=b_[c[(c[d>>2]|0)+28>>2]&255](d)&1;if((c[g>>2]|0)>8){is(200)}else{return}}function eF(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;i=i+32|0;g=d;d=i;i=i+8|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];g=f|0;h=f+16|0;j=ll(e|0)|0;if((j|0)==-1){eN(0)}if(j>>>0<11){a[h]=j<<1&255;k=h+1|0}else{l=j+16&-16;m=la(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}lj(k|0,e|0,j);a[k+j|0]=0;eA(g,d,h);j=b|0;c[j>>2]=11320;k=b+4|0;e=g;if((k|0)!=0){if((a[e]&1)==0){n=g+1|0}else{n=c[g+8>>2]|0}m=ll(n|0)|0;l=lb(m+13|0)|0;c[l+4>>2]=m;c[l>>2]=m;m=l+12|0;c[k>>2]=m;c[l+8>>2]=0;lm(m|0,n|0)}if((a[e]&1)!=0){le(c[g+8>>2]|0)}if((a[h]&1)==0){c[j>>2]=13344;o=b+8|0;p=d;q=o;r=p|0;s=c[r>>2]|0;t=p+4|0;u=c[t>>2]|0;v=q|0;c[v>>2]=s;w=q+4|0;c[w>>2]=u;i=f;return}le(c[h+8>>2]|0);c[j>>2]=13344;o=b+8|0;p=d;q=o;r=p|0;s=c[r>>2]|0;t=p+4|0;u=c[t>>2]|0;v=q|0;c[v>>2]=s;w=q+4|0;c[w>>2]=u;i=f;return}function eG(b){b=b|0;if((a[b]&1)==0){return}le(c[b+8>>2]|0);return}function eH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}eP(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}lk(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function eI(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){eQ(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}a[k+i|0]=d;d=i+1|0;a[k+d|0]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function eJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){eP(b,h,(e-h|0)+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}lj(k+j|0,d|0,e);d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function eK(b){b=b|0;if((a[b]&1)==0){return}le(c[b+8>>2]|0);return}function eL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}fi(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}i=(e|0)==0;do{if(k-d>>2>>>0<e>>>0){if(i){break}else{l=e}do{l=l-1|0;c[k+(l<<2)>>2]=c[d+(l<<2)>>2];}while((l|0)!=0)}else{if(i){break}else{m=d;n=e;o=k}while(1){j=n-1|0;c[o>>2]=c[m>>2];if((j|0)==0){break}else{m=m+4|0;n=j;o=o+4|0}}}}while(0);c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function eM(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;if((c[a>>2]|0)==1){do{bL(18896,18888);}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;bW[d&255](b);h;c[a>>2]=-1;i;br(18896);return}function eN(a){a=a|0;var b=0,d=0,e=0;a=bi(8)|0;c[a>>2]=11384;b=a+4|0;if((b|0)!=0){d=lb(25)|0;c[d+4>>2]=12;c[d>>2]=12;e=d+12|0;c[b>>2]=e;c[d+8>>2]=0;lj(e|0,376,13)}c[a>>2]=11352;aN(a|0,17064,88)}function eO(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;if((d|0)==-1){eN(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0;p=i}else{if(g>>>0>h>>>0){q=la(k)|0}else{q=la(k)|0}h=a[f]|0;g=h&1;if(g<<24>>24==0){r=e+1|0}else{r=c[b+8>>2]|0}l=q;m=r;n=g<<24>>24!=0;o=1;p=h}h=p&255;if((h&1|0)==0){s=h>>>1}else{s=c[b+4>>2]|0}lj(l|0,m|0,s+1|0);if(n){le(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function eP(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){eN(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=la(o)|0;if((g|0)!=0){lj(e|0,k|0,g)}if((i|0)!=0){lj(e+g|0,j|0,i)}j=f-h|0;if((j|0)!=(g|0)){lj(e+(i+g|0)|0,k+(h+g|0)|0,j-g|0)}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}le(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function eQ(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){eN(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=la(n)|0;if((g|0)!=0){lj(e|0,j|0,g)}m=f-h|0;if((m|0)!=(g|0)){lj(e+(i+g|0)|0,j+(h+g|0)|0,m-g|0)}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}le(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function eR(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=d;g=e-f|0;h=g>>2;if(h>>>0>1073741822){eN(0)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=la(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((d|0)==(e|0)){k=i;c[k>>2]=0;return}j=(((e-4|0)+(-f|0)|0)>>>2)+1|0;f=i;h=d;while(1){c[f>>2]=c[h>>2];d=h+4|0;if((d|0)==(e|0)){break}else{f=f+4|0;h=d}}k=i+(j<<2)|0;c[k>>2]=0;return}function eS(a,b){a=a|0;b=b|0;return}function eT(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function eU(a){a=a|0;return 0}function eV(a){a=a|0;return 0}function eW(a){a=a|0;return-1|0}function eX(a,b){a=a|0;b=b|0;return-1|0}function eY(a,b){a=a|0;b=b|0;return-1|0}function eZ(a,b){a=a|0;b=b|0;return}function e_(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function e$(a){a=a|0;return 0}function e0(a){a=a|0;return 0}function e1(a){a=a|0;return-1|0}function e2(a,b){a=a|0;b=b|0;return-1|0}function e3(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function e4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function e5(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function e6(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function e7(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){fj(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}c[k+(i<<2)>>2]=d;d=i+1|0;c[k+(d<<2)>>2]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function e8(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13080;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;le(e);return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);e=a;le(e);return}function e9(a){a=a|0;var b=0;c[a>>2]=13080;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);return}function fa(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=b_[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((k|0)==-1){g=d;m=1410;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=1409;break}}if((m|0)==1409){return g|0}else if((m|0)==1410){return g|0}return 0}function fb(a){a=a|0;var b=0,e=0;if((b_[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function fc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((bY[c[(c[g>>2]|0)+52>>2]&31](b,d[l]|0)|0)==-1){h=k;n=1425;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=1424;break}}if((n|0)==1424){return h|0}else if((n|0)==1425){return h|0}return 0}function fd(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13008;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;le(e);return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);e=a;le(e);return}function fe(a){a=a|0;var b=0;c[a>>2]=13008;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}bW[c[(c[b>>2]|0)+8>>2]&255](b|0);return}function ff(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=b_[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((j|0)==-1){f=b;l=1445;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=1444;break}}if((l|0)==1445){return f|0}else if((l|0)==1444){return f|0}return 0}function fg(a){a=a|0;var b=0,d=0;if((b_[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function fh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(d>>>0>1073741822){eN(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0;o=h}else{h=j<<2;if(f>>>0>g>>>0){p=la(h)|0}else{p=la(h)|0}h=a[e]|0;g=h&1;if(g<<24>>24==0){q=b+4|0}else{q=c[b+8>>2]|0}k=p;l=q;m=g<<24>>24!=0;n=1;o=h}h=o&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;if((h|0)!=0){r=l;o=h;h=k;while(1){g=o-1|0;c[h>>2]=c[r>>2];if((g|0)==0){break}else{r=r+4|0;o=g;h=h+4|0}}}if(m){le(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=k;return}else{a[e]=i<<1&255;return}}function fi(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;if((1073741821-d|0)>>>0<e>>>0){eN(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=la(o<<2)|0;if((g|0)!=0){n=k;l=g;m=e;while(1){p=l-1|0;c[m>>2]=c[n>>2];if((p|0)==0){break}else{n=n+4|0;l=p;m=m+4|0}}}if((i|0)!=0){m=j;j=i;l=e+(g<<2)|0;while(1){n=j-1|0;c[l>>2]=c[m>>2];if((n|0)==0){break}else{m=m+4|0;j=n;l=l+4|0}}}l=f-h|0;if((l|0)!=(g|0)){f=k+(h+g<<2)|0;h=l-g|0;j=e+(i+g<<2)|0;while(1){g=h-1|0;c[j>>2]=c[f>>2];if((g|0)==0){break}else{f=f+4|0;h=g;j=j+4|0}}}if((d|0)==1){q=b+8|0;c[q>>2]=e;r=o|1;s=b|0;c[s>>2]=r;t=l+i|0;u=b+4|0;c[u>>2]=t;v=e+(t<<2)|0;c[v>>2]=0;return}le(k);q=b+8|0;c[q>>2]=e;r=o|1;s=b|0;c[s>>2]=r;t=l+i|0;u=b+4|0;c[u>>2]=t;v=e+(t<<2)|0;c[v>>2]=0;return}function fj(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((1073741821-d|0)>>>0<e>>>0){eN(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=la(n<<2)|0;if((g|0)!=0){m=j;k=g;l=e;while(1){o=k-1|0;c[l>>2]=c[m>>2];if((o|0)==0){break}else{m=m+4|0;k=o;l=l+4|0}}}l=f-h|0;if((l|0)!=(g|0)){f=j+(h+g<<2)|0;h=l-g|0;l=e+(i+g<<2)|0;while(1){g=h-1|0;c[l>>2]=c[f>>2];if((g|0)==0){break}else{f=f+4|0;h=g;l=l+4|0}}}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=n|1;r=b|0;c[r>>2]=q;return}le(j);p=b+8|0;c[p>>2]=e;q=n|1;r=b|0;c[r>>2]=q;return}function fk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=bi(16)|0;if(!(a[20032]|0)){c[2506]=12848;a[20032]=1}b=lq(10024,0,32)|0;d=K;c[f>>2]=b&0|1;c[f+4>>2]=d&-1;eF(e,f,1648);c[e>>2]=12032;aN(e|0,17608,26)}function fl(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=12008;b=c[a+40>>2]|0;if((b|0)!=0){d=a+32|0;e=a+36|0;f=b;do{f=f-1|0;b0[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);}while((f|0)!=0)}f=c[a+28>>2]|0;e=f+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)==0){bW[c[(c[f>>2]|0)+8>>2]&255](f)}k5(c[a+32>>2]|0);k5(c[a+36>>2]|0);k5(c[a+48>>2]|0);k5(c[a+60>>2]|0);return}function fm(a,b){a=a|0;b=b|0;return-1|0}function fn(a){a=a|0;return 1912|0}function fo(a){a=a|0;return}function fp(a){a=a|0;return}function fq(a){a=a|0;return}function fr(a){a=a|0;return}function fs(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1882:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=1556;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=1557;break}if(l<<24>>24<k<<24>>24){i=1;j=1559;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L1882}else{b=k;h=l}}if((j|0)==1557){return i|0}else if((j|0)==1556){return i|0}else if((j|0)==1559){return i|0}}}while(0);i=(g|0)!=(d|0)&1;return i|0}function ft(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function fu(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1901:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=1575;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=1572;break}if((l|0)<(k|0)){i=1;j=1574;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L1901}else{a=k;h=l}}if((j|0)==1574){return i|0}else if((j|0)==1575){return i|0}else if((j|0)==1572){return i|0}}}while(0);i=(g|0)!=(d|0)&1;return i|0}function fv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((bY[c[(c[e>>2]|0)+52>>2]&31](a,c[j>>2]|0)|0)==-1){f=i;l=1585;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=1584;break}}if((l|0)==1585){return f|0}else if((l|0)==1584){return f|0}return 0}function fw(a){a=a|0;fl(a+8|0);le(a);return}function fx(a){a=a|0;fl(a+8|0);return}function fy(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fl(b+(d+8|0)|0);le(b+d|0);return}function fz(a){a=a|0;fl(a+((c[(c[a>>2]|0)-12>>2]|0)+8|0)|0);return}function fA(a){a=a|0;fl(a+8|0);le(a);return}function fB(a){a=a|0;fl(a+8|0);return}function fC(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fl(b+(d+8|0)|0);le(b+d|0);return}function fD(a){a=a|0;fl(a+((c[(c[a>>2]|0)-12>>2]|0)+8|0)|0);return}function fE(a){a=a|0;fl(a+4|0);le(a);return}function fF(a){a=a|0;fl(a+4|0);return}function fG(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fl(b+(d+4|0)|0);le(b+d|0);return}function fH(a){a=a|0;fl(a+((c[(c[a>>2]|0)-12>>2]|0)+4|0)|0);return}function fI(a){a=a|0;fl(a+4|0);le(a);return}function fJ(a){a=a|0;fl(a+4|0);return}function fK(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fl(b+(d+4|0)|0);le(b+d|0);return}function fL(a){a=a|0;fl(a+((c[(c[a>>2]|0)-12>>2]|0)+4|0)|0);return}function fM(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=11320;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;le(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;le(e);return}lf(d);e=a;le(e);return}function fN(a){a=a|0;var b=0;c[a>>2]=11320;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lf(a);return}function fO(a){a=a|0;fl(a);le(a);return}function fP(a){a=a|0;le(a);return}function fQ(a){a=a|0;le(a);return}function fR(a){a=a|0;le(a);return}function fS(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24|0)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16|0)>>2]|0)==0){k=c[h+(g+72|0)>>2]|0;if((k|0)!=0){fS(k)}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((b_[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;fk(h+k|0,c[h+(k+16|0)>>2]|1)}}while(0);fU(e);i=d;return b|0}function fT(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24|0)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16|0)>>2]|0)==0){k=c[h+(g+72|0)>>2]|0;if((k|0)!=0){fT(k)}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((b_[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;fk(h+k|0,c[h+(k+16|0)>>2]|1)}}while(0);fV(e);i=d;return b|0}function fU(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24|0)>>2]|0)==0){return}if((c[e+(d+16|0)>>2]|0)!=0){return}if((c[e+(d+4|0)>>2]&8192|0)==0){return}if(bB()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((b_[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;fk(d+b|0,c[d+(b+16|0)>>2]|1);return}function fV(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24|0)>>2]|0)==0){return}if((c[e+(d+16|0)>>2]|0)!=0){return}if((c[e+(d+4|0)>>2]&8192|0)==0){return}if(bB()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((b_[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;fk(d+b|0,c[d+(b+16|0)>>2]|1);return}function fW(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e|0)==1){d=la(48)|0;c[b+8>>2]=d;c[b>>2]=49;c[b+4>>2]=35;lj(d|0,2432,35);a[d+35|0]=0;return}d=aP(e|0)|0;e=ll(d|0)|0;if((e|0)==-1){eN(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0}else{g=e+16&-16;h=la(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=e;f=h}lj(f|0,d|0,e);a[f+e|0]=0;return}function fX(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;if((g|0)==-1){eN(0)}if(g>>>0<11){a[b]=g<<1&255;h=b+1|0}else{i=g+16&-16;j=la(i)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=g;h=j}if((e|0)==(f|0)){k=h;a[k]=0;return}j=f+(-d|0)|0;d=h;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=h+j|0;a[k]=0;return}function fY(a){a=a|0;return}function fZ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function f_(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;eR(a,c,d);return}function f$(a){a=a|0;le(a);return}function f0(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+80|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=k+16|0;o=k+24|0;p=k+32|0;q=k+40|0;r=k+48|0;s=k+72|0;if((c[g+4>>2]&1|0)==0){c[l>>2]=-1;t=c[(c[d>>2]|0)+16>>2]|0;u=e|0;c[n>>2]=c[u>>2];c[o>>2]=c[f>>2];bV[t&127](m,d,n,o,g,h,l);o=c[m>>2]|0;c[u>>2]=o;u=c[l>>2]|0;if((u|0)==1){a[j]=1}else if((u|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=o;i=k;return}o=g+28|0;g=p|0;u=c[o>>2]|0;c[g>>2]=u;l=u+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;l=jp(p,19408)|0;p=c[g>>2]|0;g=p+4|0;if(((I=c[g>>2]|0,c[g>>2]=I+ -1,I)|0)==0){bW[c[(c[p>>2]|0)+8>>2]&255](p|0)}p=q|0;g=c[o>>2]|0;c[p>>2]=g;o=g+4|0;I=c[o>>2]|0,c[o>>2]=I+1,I;o=jp(q,19024)|0;q=o;g=c[p>>2]|0;p=g+4|0;if(((I=c[p>>2]|0,c[p>>2]=I+ -1,I)|0)==0){bW[c[(c[g>>2]|0)+8>>2]&255](g|0)}g=r|0;p=o;bX[c[(c[p>>2]|0)+24>>2]&127](g,q);bX[c[(c[p>>2]|0)+28>>2]&127](r+12|0,q);c[s>>2]=c[f>>2];a[j]=(f1(e,s,g,r+24|0,l,h,1)|0)==(g|0)&1;c[b>>2]=c[e>>2];if((a[r+12|0]&1)!=0){le(c[r+20>>2]|0)}if((a[r]&1)==0){i=k;return}le(c[r+8>>2]|0);i=k;return}function f1(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12&-1;n=l|0;do{if(m>>>0>100){o=k4(m)|0;if((o|0)!=0){p=o;q=o;break}o=bi(4)|0;c[o>>2]=11256;aN(o|0,17016,28);return 0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){z=r;break}if((b_[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){A=z;B=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((b_[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){C=m;break}c[b>>2]=0;C=0}else{C=m}}while(0);A=c[u>>2]|0;B=C}D=(B|0)==0;if(!((r^D)&(s|0)!=0)){break}m=c[A+12>>2]|0;if((m|0)==(c[A+16>>2]|0)){E=b_[c[(c[A>>2]|0)+36>>2]&255](A)&255}else{E=a[m]|0}if(k){F=E}else{F=bY[c[(c[e>>2]|0)+12>>2]&31](h,E)|0}do{if(n){G=x;H=s}else{m=t+1|0;y=s;o=x;w=p;v=0;I=f;while(1){do{if((a[w]|0)==1){J=I;if((a[J]&1)==0){K=I+1|0}else{K=c[I+8>>2]|0}L=a[K+t|0]|0;if(k){M=L}else{M=bY[c[(c[e>>2]|0)+12>>2]&31](h,L)|0}if(F<<24>>24!=M<<24>>24){a[w]=0;N=v;O=o;P=y-1|0;break}L=d[J]|0;if((L&1|0)==0){Q=L>>>1}else{Q=c[I+4>>2]|0}if((Q|0)!=(m|0)){N=1;O=o;P=y;break}a[w]=2;N=1;O=o+1|0;P=y-1|0}else{N=v;O=o;P=y}}while(0);L=I+12|0;if((L|0)==(g|0)){break}y=P;o=O;w=w+1|0;v=N;I=L}if(!N){G=O;H=P;break}I=c[u>>2]|0;v=I+12|0;w=c[v>>2]|0;if((w|0)==(c[I+16>>2]|0)){o=c[(c[I>>2]|0)+40>>2]|0;b_[o&255](I)}else{c[v>>2]=w+1}if((O+P|0)>>>0<2|n){G=O;H=P;break}w=t+1|0;v=O;I=p;o=f;while(1){do{if((a[I]|0)==2){y=d[o]|0;if((y&1|0)==0){R=y>>>1}else{R=c[o+4>>2]|0}if((R|0)==(w|0)){S=v;break}a[I]=0;S=v-1|0}else{S=v}}while(0);y=o+12|0;if((y|0)==(g|0)){G=S;H=P;break}else{v=S;I=I+1|0;o=y}}}}while(0);t=t+1|0;x=G;s=H}do{if((A|0)==0){T=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){T=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[u>>2]=0;T=0;break}else{T=c[u>>2]|0;break}}}while(0);u=(T|0)==0;do{if(D){U=1841}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(u){break}else{U=1843;break}}if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[b>>2]=0;U=1841;break}else{if(u^(B|0)==0){break}else{U=1843;break}}}}while(0);if((U|0)==1841){if(u){U=1843}}if((U|0)==1843){c[j>>2]=c[j>>2]|2}L2198:do{if(n){U=1848}else{u=f;B=p;while(1){if((a[B]|0)==2){V=u;break L2198}b=u+12|0;if((b|0)==(g|0)){U=1848;break L2198}u=b;B=B+1|0}}}while(0);if((U|0)==1848){c[j>>2]=c[j>>2]|4;V=g}if((q|0)==0){i=l;return V|0}k5(q);i=l;return V|0}function f2(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[i+19864|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[i+19864|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function f3(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n-4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L2278:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}k=(e-h|0)>1?h+1|0:h;j=n+4|0;q=a[k]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(j>>>0<b>>>0){h=k;n=j;m=r;i=s}else{t=r;u=s;break L2278}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}
function f4(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19408)|0;b7[c[(c[h>>2]|0)+32>>2]&15](h,19864,19890,t);h=jp(l,19024)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L2309:while(1){do{if((g|0)==0){w=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){w=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){y=1945}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){if(x){z=h;A=0;break}else{B=h;C=0;break L2309}}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[f>>2]=0;y=1945;break}else{D=(h|0)==0;if(x^D){z=h;A=D;break}else{B=h;C=D;break L2309}}}}while(0);if((y|0)==1945){y=0;if(x){B=0;C=1;break}else{z=0;A=1}}h=w+12|0;D=c[h>>2]|0;E=w+16|0;if((D|0)==(c[E>>2]|0)){F=b_[c[(c[w>>2]|0)+36>>2]&255](w)&255}else{F=a[D]|0}if((f2(F,u,l,p,s,v,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[h>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[w>>2]|0)+40>>2]|0;b_[E&255](w);g=w;continue}else{c[h>>2]=D+1;g=w;continue}}g=n;A=d[g]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4;c[A>>2]=z}}while(0);c[k>>2]=f5(l,c[p>>2]|0,j,u)|0;f3(n,o,c[r>>2]|0,j);do{if(x){H=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){H=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){H=w;break}c[m>>2]=0;H=0}}while(0);m=(H|0)==0;L2354:do{if(C){y=1977}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=1977;break L2354}}while(0);if(!(m^(B|0)==0)){y=1979}}}while(0);if((y|0)==1977){if(m){y=1979}}if((y|0)==1979){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function f5(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[bJ()>>2]|0;c[bJ()>>2]=0;if(a[20024]|0){l=c[2504]|0}else{m=bI(1,1840,0)|0;c[2504]=m;a[20024]=1;l=m}m=bk(b|0,h|0,f|0,l|0)|0;l=K;f=c[bJ()>>2]|0;if((f|0)==0){c[bJ()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((f|0)==34|((l|0)<(d|0)|(l|0)==(d|0)&m>>>0<-2147483648>>>0)|((l|0)>(h|0)|(l|0)==(h|0)&m>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(l|0)>(e|0)|(l|0)==(e|0)&m>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function f6(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19408)|0;b7[c[(c[h>>2]|0)+32>>2]&15](h,19864,19890,t);h=jp(l,19024)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L2405:while(1){do{if((g|0)==0){w=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){w=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){y=2028}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){if(x){z=h;A=0;break}else{B=h;C=0;break L2405}}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[f>>2]=0;y=2028;break}else{D=(h|0)==0;if(x^D){z=h;A=D;break}else{B=h;C=D;break L2405}}}}while(0);if((y|0)==2028){y=0;if(x){B=0;C=1;break}else{z=0;A=1}}h=w+12|0;D=c[h>>2]|0;E=w+16|0;if((D|0)==(c[E>>2]|0)){F=b_[c[(c[w>>2]|0)+36>>2]&255](w)&255}else{F=a[D]|0}if((f2(F,u,l,p,s,v,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[h>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[w>>2]|0)+40>>2]|0;b_[E&255](w);g=w;continue}else{c[h>>2]=D+1;g=w;continue}}g=n;A=d[g]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4;c[A>>2]=z}}while(0);s=f7(l,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f3(n,o,c[r>>2]|0,j);do{if(x){H=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){H=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){H=w;break}c[m>>2]=0;H=0}}while(0);m=(H|0)==0;L2450:do{if(C){y=2060}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2060;break L2450}}while(0);if(!(m^(B|0)==0)){y=2062}}}while(0);if((y|0)==2060){if(m){y=2062}}if((y|0)==2062){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function f7(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}l=c[bJ()>>2]|0;c[bJ()>>2]=0;if(a[20024]|0){m=c[2504]|0}else{n=bI(1,1840,0)|0;c[2504]=n;a[20024]=1;m=n}n=bk(b|0,h|0,f|0,m|0)|0;m=K;f=c[bJ()>>2]|0;if((f|0)==0){c[bJ()>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}if((f|0)!=34){j=m;k=n;i=g;return(K=j,k)|0}c[e>>2]=4;e=0;f=(m|0)>(e|0)|(m|0)==(e|0)&n>>>0>0>>>0;j=f?2147483647:-2147483648;k=f?-1:0;i=g;return(K=j,k)|0}function f8(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0;f=i;i=i+280|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+8|0;o=f+40|0;p=f+56|0;q=f+96|0;r=f+104|0;s=f+264|0;t=f+272|0;u=c[j+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==8){v=16}else if((u|0)==64){v=8}else{v=10}u=n|0;n=m|0;w=c[j+28>>2]|0;c[n>>2]=w;j=w+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(m,19408)|0;b7[c[(c[j>>2]|0)+32>>2]&15](j,19864,19890,u);j=jp(m,19024)|0;m=j;w=b_[c[(c[j>>2]|0)+16>>2]&255](m)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,m);m=c[n>>2]|0;n=m+4|0;if(((I=c[n>>2]|0,c[n>>2]=I+ -1,I)|0)==0){bW[c[(c[m>>2]|0)+8>>2]&255](m|0)}m=p|0;ln(m|0,0,40);c[q>>2]=m;p=r|0;c[s>>2]=p;c[t>>2]=0;n=g|0;g=h|0;h=c[n>>2]|0;L2500:while(1){do{if((h|0)==0){x=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){x=h;break}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)!=-1){x=h;break}c[n>>2]=0;x=0}}while(0);y=(x|0)==0;j=c[g>>2]|0;do{if((j|0)==0){z=2110}else{if((c[j+12>>2]|0)!=(c[j+16>>2]|0)){if(y){A=j;B=0;break}else{C=j;D=0;break L2500}}if((b_[c[(c[j>>2]|0)+36>>2]&255](j)|0)==-1){c[g>>2]=0;z=2110;break}else{E=(j|0)==0;if(y^E){A=j;B=E;break}else{C=j;D=E;break L2500}}}}while(0);if((z|0)==2110){z=0;if(y){C=0;D=1;break}else{A=0;B=1}}j=x+12|0;E=c[j>>2]|0;F=x+16|0;if((E|0)==(c[F>>2]|0)){G=b_[c[(c[x>>2]|0)+36>>2]&255](x)&255}else{G=a[E]|0}if((f2(G,v,m,q,t,w,o,p,s,u)|0)!=0){C=A;D=B;break}E=c[j>>2]|0;if((E|0)==(c[F>>2]|0)){F=c[(c[x>>2]|0)+40>>2]|0;b_[F&255](x);h=x;continue}else{c[j>>2]=E+1;h=x;continue}}h=o;B=d[h]|0;if((B&1|0)==0){H=B>>>1}else{H=c[o+4>>2]|0}do{if((H|0)!=0){B=c[s>>2]|0;if((B-r|0)>=160){break}A=c[t>>2]|0;c[s>>2]=B+4;c[B>>2]=A}}while(0);b[l>>1]=f9(m,c[q>>2]|0,k,v)|0;f3(o,p,c[s>>2]|0,k);do{if(y){J=0}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){J=x;break}if((b_[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){J=x;break}c[n>>2]=0;J=0}}while(0);n=(J|0)==0;L2545:do{if(D){z=2142}else{do{if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((b_[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){break}c[g>>2]=0;z=2142;break L2545}}while(0);if(!(n^(C|0)==0)){z=2144}}}while(0);if((z|0)==2142){if(n){z=2144}}if((z|0)==2144){c[k>>2]=c[k>>2]|2}c[e>>2]=J;if((a[h]&1)==0){i=f;return}le(c[o+8>>2]|0);i=f;return}function f9(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[bJ()>>2]|0;c[bJ()>>2]=0;if(a[20024]|0){l=c[2504]|0}else{m=bI(1,1840,0)|0;c[2504]=m;a[20024]=1;l=m}m=aV(b|0,h|0,f|0,l|0)|0;l=K;f=c[bJ()>>2]|0;if((f|0)==0){c[bJ()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m&65535;i=g;return j|0}return 0}function ga(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19408)|0;b7[c[(c[h>>2]|0)+32>>2]&15](h,19864,19890,t);h=jp(l,19024)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L2600:while(1){do{if((g|0)==0){w=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){w=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){y=2196}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){if(x){z=h;A=0;break}else{B=h;C=0;break L2600}}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[f>>2]=0;y=2196;break}else{D=(h|0)==0;if(x^D){z=h;A=D;break}else{B=h;C=D;break L2600}}}}while(0);if((y|0)==2196){y=0;if(x){B=0;C=1;break}else{z=0;A=1}}h=w+12|0;D=c[h>>2]|0;E=w+16|0;if((D|0)==(c[E>>2]|0)){F=b_[c[(c[w>>2]|0)+36>>2]&255](w)&255}else{F=a[D]|0}if((f2(F,u,l,p,s,v,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[h>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[w>>2]|0)+40>>2]|0;b_[E&255](w);g=w;continue}else{c[h>>2]=D+1;g=w;continue}}g=n;A=d[g]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4;c[A>>2]=z}}while(0);c[k>>2]=gb(l,c[p>>2]|0,j,u)|0;f3(n,o,c[r>>2]|0,j);do{if(x){H=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){H=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){H=w;break}c[m>>2]=0;H=0}}while(0);m=(H|0)==0;L2645:do{if(C){y=2228}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2228;break L2645}}while(0);if(!(m^(B|0)==0)){y=2230}}}while(0);if((y|0)==2228){if(m){y=2230}}if((y|0)==2230){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[bJ()>>2]|0;c[bJ()>>2]=0;if(a[20024]|0){l=c[2504]|0}else{m=bI(1,1840,0)|0;c[2504]=m;a[20024]=1;l=m}m=aV(b|0,h|0,f|0,l|0)|0;l=K;f=c[bJ()>>2]|0;if((f|0)==0){c[bJ()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function gc(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19408)|0;b7[c[(c[h>>2]|0)+32>>2]&15](h,19864,19890,t);h=jp(l,19024)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L2700:while(1){do{if((g|0)==0){w=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){w=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){y=2282}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){if(x){z=h;A=0;break}else{B=h;C=0;break L2700}}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[f>>2]=0;y=2282;break}else{D=(h|0)==0;if(x^D){z=h;A=D;break}else{B=h;C=D;break L2700}}}}while(0);if((y|0)==2282){y=0;if(x){B=0;C=1;break}else{z=0;A=1}}h=w+12|0;D=c[h>>2]|0;E=w+16|0;if((D|0)==(c[E>>2]|0)){F=b_[c[(c[w>>2]|0)+36>>2]&255](w)&255}else{F=a[D]|0}if((f2(F,u,l,p,s,v,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[h>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[w>>2]|0)+40>>2]|0;b_[E&255](w);g=w;continue}else{c[h>>2]=D+1;g=w;continue}}g=n;A=d[g]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4;c[A>>2]=z}}while(0);c[k>>2]=gd(l,c[p>>2]|0,j,u)|0;f3(n,o,c[r>>2]|0,j);do{if(x){H=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){H=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){H=w;break}c[m>>2]=0;H=0}}while(0);m=(H|0)==0;L2745:do{if(C){y=2314}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2314;break L2745}}while(0);if(!(m^(B|0)==0)){y=2316}}}while(0);if((y|0)==2314){if(m){y=2316}}if((y|0)==2316){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gd(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[bJ()>>2]|0;c[bJ()>>2]=0;if(a[20024]|0){l=c[2504]|0}else{m=bI(1,1840,0)|0;c[2504]=m;a[20024]=1;l=m}m=aV(b|0,h|0,f|0,l|0)|0;l=K;f=c[bJ()>>2]|0;if((f|0)==0){c[bJ()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function ge(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19408)|0;b7[c[(c[h>>2]|0)+32>>2]&15](h,19864,19890,t);h=jp(l,19024)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L2800:while(1){do{if((g|0)==0){w=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){w=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){y=2368}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){if(x){z=h;A=0;break}else{B=h;C=0;break L2800}}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[f>>2]=0;y=2368;break}else{D=(h|0)==0;if(x^D){z=h;A=D;break}else{B=h;C=D;break L2800}}}}while(0);if((y|0)==2368){y=0;if(x){B=0;C=1;break}else{z=0;A=1}}h=w+12|0;D=c[h>>2]|0;E=w+16|0;if((D|0)==(c[E>>2]|0)){F=b_[c[(c[w>>2]|0)+36>>2]&255](w)&255}else{F=a[D]|0}if((f2(F,u,l,p,s,v,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[h>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[w>>2]|0)+40>>2]|0;b_[E&255](w);g=w;continue}else{c[h>>2]=D+1;g=w;continue}}g=n;A=d[g]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4;c[A>>2]=z}}while(0);s=gf(l,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f3(n,o,c[r>>2]|0,j);do{if(x){H=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){H=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){H=w;break}c[m>>2]=0;H=0}}while(0);m=(H|0)==0;L2845:do{if(C){y=2400}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2400;break L2845}}while(0);if(!(m^(B|0)==0)){y=2402}}}while(0);if((y|0)==2400){if(m){y=2402}}if((y|0)==2402){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gf(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[bJ()>>2]|0;c[bJ()>>2]=0;if(a[20024]|0){m=c[2504]|0}else{n=bI(1,1840,0)|0;c[2504]=n;a[20024]=1;m=n}n=aV(b|0,h|0,f|0,m|0)|0;o=K;p=c[bJ()>>2]|0;if((p|0)==0){c[bJ()>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((p|0)!=34){j=o;k=n;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(K=j,k)|0}function gg(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0.0,N=0.0,O=0;e=i;i=i+304|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+8|0;o=e+48|0;p=e+104|0;q=e+112|0;r=e+272|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+16|0;w=n|0;x=c[j+28>>2]|0;c[w>>2]=x;j=x+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(n,19408)|0;b7[c[(c[j>>2]|0)+32>>2]&15](j,19864,19896,v);j=jp(n,19024)|0;n=j;x=j;y=b_[c[(c[x>>2]|0)+12>>2]&255](n)|0;z=b_[c[(c[x>>2]|0)+16>>2]&255](n)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,n);n=c[w>>2]|0;w=n+4|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){bW[c[(c[n>>2]|0)+8>>2]&255](n|0)}n=e+64|0;ln(n|0,0,40);c[p>>2]=n;w=q|0;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;j=f|0;f=h|0;h=c[j>>2]|0;L2890:while(1){do{if((h|0)==0){A=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){A=h;break}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)!=-1){A=h;break}c[j>>2]=0;A=0}}while(0);B=(A|0)==0;x=c[f>>2]|0;do{if((x|0)==0){C=2445}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(B){D=x;E=0;break}else{F=x;G=0;break L2890}}if((b_[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;C=2445;break}else{H=(x|0)==0;if(B^H){D=x;E=H;break}else{F=x;G=H;break L2890}}}}while(0);if((C|0)==2445){C=0;if(B){F=0;G=1;break}else{D=0;E=1}}x=A+12|0;H=c[x>>2]|0;J=A+16|0;if((H|0)==(c[J>>2]|0)){K=b_[c[(c[A>>2]|0)+36>>2]&255](A)&255}else{K=a[H]|0}if((gh(K,t,u,n,p,y,z,o,w,r,s,v)|0)!=0){F=D;G=E;break}H=c[x>>2]|0;if((H|0)==(c[J>>2]|0)){J=c[(c[A>>2]|0)+40>>2]|0;b_[J&255](A);h=A;continue}else{c[x>>2]=H+1;h=A;continue}}h=o;E=d[h]|0;if((E&1|0)==0){L=E>>>1}else{L=c[o+4>>2]|0}do{if((L|0)!=0){if((a[t]&1)==0){break}E=c[r>>2]|0;if((E-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=E+4;c[E>>2]=D}}while(0);s=c[p>>2]|0;do{if((n|0)==(s|0)){c[k>>2]=4;M=0.0}else{if(!(a[20024]|0)){c[2504]=bI(1,1840,0)|0;a[20024]=1}N=+lh(n,m);if((c[m>>2]|0)==(s|0)){M=N;break}else{c[k>>2]=4;M=0.0;break}}}while(0);g[l>>2]=M;f3(o,w,c[r>>2]|0,k);do{if(B){O=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){O=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&255](A)|0)!=-1){O=A;break}c[j>>2]=0;O=0}}while(0);j=(O|0)==0;L2946:do{if(G){C=2485}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((b_[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2485;break L2946}}while(0);if(!(j^(F|0)==0)){C=2487}}}while(0);if((C|0)==2485){if(j){C=2487}}if((C|0)==2487){c[k>>2]=c[k>>2]|2}c[b>>2]=O;if((a[h]&1)==0){i=e;return}le(c[o+8>>2]|0);i=e;return}function gh(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+32|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((a[j]|0)==b<<24>>24){u=j;break}else{j=j+1|0}}j=u-o|0;if((j|0)>31){r=-1;return r|0}o=a[j+19864|0]|0;do{if((j|0)==25|(j|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=o;r=0;return r|0}else if((j|0)==22|(j|0)==23){a[f]=80}else{u=a[f]|0;if((o&95|0)!=(u<<24>>24|0)){break}a[f]=u|-128;if((a[e]&1)==0){break}a[e]=0;u=d[k]|0;if((u&1|0)==0){v=u>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}u=c[m>>2]|0;if((u-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=b}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=o}if((j|0)>21){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function gi(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0.0,N=0.0,O=0;e=i;i=i+304|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+8|0;o=e+48|0;p=e+104|0;q=e+112|0;r=e+272|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+16|0;w=n|0;x=c[j+28>>2]|0;c[w>>2]=x;j=x+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(n,19408)|0;b7[c[(c[j>>2]|0)+32>>2]&15](j,19864,19896,v);j=jp(n,19024)|0;n=j;x=j;y=b_[c[(c[x>>2]|0)+12>>2]&255](n)|0;z=b_[c[(c[x>>2]|0)+16>>2]&255](n)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,n);n=c[w>>2]|0;w=n+4|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){bW[c[(c[n>>2]|0)+8>>2]&255](n|0)}n=e+64|0;ln(n|0,0,40);c[p>>2]=n;w=q|0;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;j=f|0;f=g|0;g=c[j>>2]|0;L3040:while(1){do{if((g|0)==0){A=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){A=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){A=g;break}c[j>>2]=0;A=0}}while(0);B=(A|0)==0;x=c[f>>2]|0;do{if((x|0)==0){C=2568}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(B){D=x;E=0;break}else{F=x;G=0;break L3040}}if((b_[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;C=2568;break}else{H=(x|0)==0;if(B^H){D=x;E=H;break}else{F=x;G=H;break L3040}}}}while(0);if((C|0)==2568){C=0;if(B){F=0;G=1;break}else{D=0;E=1}}x=A+12|0;H=c[x>>2]|0;J=A+16|0;if((H|0)==(c[J>>2]|0)){K=b_[c[(c[A>>2]|0)+36>>2]&255](A)&255}else{K=a[H]|0}if((gh(K,t,u,n,p,y,z,o,w,r,s,v)|0)!=0){F=D;G=E;break}H=c[x>>2]|0;if((H|0)==(c[J>>2]|0)){J=c[(c[A>>2]|0)+40>>2]|0;b_[J&255](A);g=A;continue}else{c[x>>2]=H+1;g=A;continue}}g=o;E=d[g]|0;if((E&1|0)==0){L=E>>>1}else{L=c[o+4>>2]|0}do{if((L|0)!=0){if((a[t]&1)==0){break}E=c[r>>2]|0;if((E-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=E+4;c[E>>2]=D}}while(0);s=c[p>>2]|0;do{if((n|0)==(s|0)){c[k>>2]=4;M=0.0}else{if(!(a[20024]|0)){c[2504]=bI(1,1840,0)|0;a[20024]=1}N=+lh(n,m);if((c[m>>2]|0)==(s|0)){M=N;break}c[k>>2]=4;M=0.0}}while(0);h[l>>3]=M;f3(o,w,c[r>>2]|0,k);do{if(B){O=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){O=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&255](A)|0)!=-1){O=A;break}c[j>>2]=0;O=0}}while(0);j=(O|0)==0;L3094:do{if(G){C=2607}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((b_[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2607;break L3094}}while(0);if(!(j^(F|0)==0)){C=2609}}}while(0);if((C|0)==2607){if(j){C=2609}}if((C|0)==2609){c[k>>2]=c[k>>2]|2}c[b>>2]=O;if((a[g]&1)==0){i=e;return}le(c[o+8>>2]|0);i=e;return}function gj(a){a=a|0;return}function gk(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0.0,N=0.0,O=0;e=i;i=i+304|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+8|0;o=e+48|0;p=e+104|0;q=e+112|0;r=e+272|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+16|0;w=n|0;x=c[j+28>>2]|0;c[w>>2]=x;j=x+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(n,19408)|0;b7[c[(c[j>>2]|0)+32>>2]&15](j,19864,19896,v);j=jp(n,19024)|0;n=j;x=j;y=b_[c[(c[x>>2]|0)+12>>2]&255](n)|0;z=b_[c[(c[x>>2]|0)+16>>2]&255](n)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,n);n=c[w>>2]|0;w=n+4|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){bW[c[(c[n>>2]|0)+8>>2]&255](n|0)}n=e+64|0;ln(n|0,0,40);c[p>>2]=n;w=q|0;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;j=f|0;f=g|0;g=c[j>>2]|0;L3121:while(1){do{if((g|0)==0){A=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){A=g;break}if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){A=g;break}c[j>>2]=0;A=0}}while(0);B=(A|0)==0;x=c[f>>2]|0;do{if((x|0)==0){C=2639}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(B){D=x;E=0;break}else{F=x;G=0;break L3121}}if((b_[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;C=2639;break}else{H=(x|0)==0;if(B^H){D=x;E=H;break}else{F=x;G=H;break L3121}}}}while(0);if((C|0)==2639){C=0;if(B){F=0;G=1;break}else{D=0;E=1}}x=A+12|0;H=c[x>>2]|0;J=A+16|0;if((H|0)==(c[J>>2]|0)){K=b_[c[(c[A>>2]|0)+36>>2]&255](A)&255}else{K=a[H]|0}if((gh(K,t,u,n,p,y,z,o,w,r,s,v)|0)!=0){F=D;G=E;break}H=c[x>>2]|0;if((H|0)==(c[J>>2]|0)){J=c[(c[A>>2]|0)+40>>2]|0;b_[J&255](A);g=A;continue}else{c[x>>2]=H+1;g=A;continue}}g=o;E=d[g]|0;if((E&1|0)==0){L=E>>>1}else{L=c[o+4>>2]|0}do{if((L|0)!=0){if((a[t]&1)==0){break}E=c[r>>2]|0;if((E-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=E+4;c[E>>2]=D}}while(0);s=c[p>>2]|0;do{if((n|0)==(s|0)){c[k>>2]=4;M=0.0}else{if(!(a[20024]|0)){c[2504]=bI(1,1840,0)|0;a[20024]=1}N=+lh(n,m);if((c[m>>2]|0)==(s|0)){M=N;break}c[k>>2]=4;M=0.0}}while(0);h[l>>3]=M;f3(o,w,c[r>>2]|0,k);do{if(B){O=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){O=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&255](A)|0)!=-1){O=A;break}c[j>>2]=0;O=0}}while(0);j=(O|0)==0;L3175:do{if(G){C=2678}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((b_[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2678;break L3175}}while(0);if(!(j^(F|0)==0)){C=2680}}}while(0);if((C|0)==2678){if(j){C=2680}}if((C|0)==2680){c[k>>2]=c[k>>2]|2}c[b>>2]=O;if((a[g]&1)==0){i=e;return}le(c[o+8>>2]|0);i=e;return}function gl(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0;d=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d+32|0;l=k;m=i;i=i+4|0;i=i+7>>3<<3;n=i;i=i+40|0;o=i;i=i+4|0;i=i+7>>3<<3;p=i;i=i+160|0;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+4|0;i=i+7>>3<<3;ln(l|0,0,12);s=m|0;t=c[g+28>>2]|0;c[s>>2]=t;g=t+4|0;I=c[g>>2]|0,c[g>>2]=I+1,I;g=jp(m,19408)|0;m=d|0;b7[c[(c[g>>2]|0)+32>>2]&15](g,19864,19890,m);g=c[s>>2]|0;s=g+4|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){bW[c[(c[g>>2]|0)+8>>2]&255](g|0)}g=n|0;ln(g|0,0,40);c[o>>2]=g;s=p|0;c[q>>2]=s;c[r>>2]=0;p=e|0;e=f|0;f=c[p>>2]|0;L3197:while(1){do{if((f|0)==0){u=0}else{if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){u=f;break}if((b_[c[(c[f>>2]|0)+36>>2]&255](f)|0)!=-1){u=f;break}c[p>>2]=0;u=0}}while(0);v=(u|0)==0;t=c[e>>2]|0;do{if((t|0)==0){w=2702}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){if(v){x=t;y=0;break}else{z=t;A=0;break L3197}}if((b_[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[e>>2]=0;w=2702;break}else{C=(t|0)==0;if(v^C){x=t;y=C;break}else{z=t;A=C;break L3197}}}}while(0);if((w|0)==2702){w=0;if(v){z=0;A=1;break}else{x=0;y=1}}t=u+12|0;C=c[t>>2]|0;D=u+16|0;if((C|0)==(c[D>>2]|0)){E=b_[c[(c[u>>2]|0)+36>>2]&255](u)&255}else{E=a[C]|0}if((f2(E,16,g,o,r,0,k,s,q,m)|0)!=0){z=x;A=y;break}C=c[t>>2]|0;if((C|0)==(c[D>>2]|0)){D=c[(c[u>>2]|0)+40>>2]|0;b_[D&255](u);f=u;continue}else{c[t>>2]=C+1;f=u;continue}}a[n+39|0]=0;if(a[20024]|0){F=c[2504]|0}else{n=bI(1,1840,0)|0;c[2504]=n;a[20024]=1;F=n}if((gn(g,F,1632,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}do{if(v){G=0}else{if((c[u+12>>2]|0)!=(c[u+16>>2]|0)){G=u;break}if((b_[c[(c[u>>2]|0)+36>>2]&255](u)|0)!=-1){G=u;break}c[p>>2]=0;G=0}}while(0);p=(G|0)==0;L3242:do{if(A){w=2734}else{do{if((c[z+12>>2]|0)==(c[z+16>>2]|0)){if((b_[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){break}c[e>>2]=0;w=2734;break L3242}}while(0);if(!(p^(z|0)==0)){w=2736}}}while(0);if((w|0)==2734){if(p){w=2736}}if((w|0)==2736){c[h>>2]=c[h>>2]|2}c[b>>2]=G;if((a[l]&1)==0){i=d;return}le(c[k+8>>2]|0);i=d;return}function gm(a){a=a|0;le(a);return}function gn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bN(b|0)|0;b=aI(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bN(h|0);i=f;return b|0}function go(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+80|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=k+16|0;o=k+24|0;p=k+32|0;q=k+40|0;r=k+48|0;s=k+72|0;if((c[g+4>>2]&1|0)==0){c[l>>2]=-1;t=c[(c[d>>2]|0)+16>>2]|0;u=e|0;c[n>>2]=c[u>>2];c[o>>2]=c[f>>2];bV[t&127](m,d,n,o,g,h,l);o=c[m>>2]|0;c[u>>2]=o;u=c[l>>2]|0;if((u|0)==0){a[j]=0}else if((u|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=o;i=k;return}o=g+28|0;g=p|0;u=c[o>>2]|0;c[g>>2]=u;l=u+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;l=jp(p,19400)|0;p=c[g>>2]|0;g=p+4|0;if(((I=c[g>>2]|0,c[g>>2]=I+ -1,I)|0)==0){bW[c[(c[p>>2]|0)+8>>2]&255](p|0)}p=q|0;g=c[o>>2]|0;c[p>>2]=g;o=g+4|0;I=c[o>>2]|0,c[o>>2]=I+1,I;o=jp(q,19016)|0;q=o;g=c[p>>2]|0;p=g+4|0;if(((I=c[p>>2]|0,c[p>>2]=I+ -1,I)|0)==0){bW[c[(c[g>>2]|0)+8>>2]&255](g|0)}g=r|0;p=o;bX[c[(c[p>>2]|0)+24>>2]&127](g,q);bX[c[(c[p>>2]|0)+28>>2]&127](r+12|0,q);c[s>>2]=c[f>>2];a[j]=(gp(e,s,g,r+24|0,l,h,1)|0)==(g|0)&1;c[b>>2]=c[e>>2];if((a[r+12|0]&1)!=0){le(c[r+20>>2]|0)}if((a[r]&1)==0){i=k;return}le(c[r+8>>2]|0);i=k;return}function gp(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12&-1;n=l|0;do{if(m>>>0>100){o=k4(m)|0;if((o|0)!=0){p=o;q=o;break}o=bi(4)|0;c[o>>2]=11256;aN(o|0,17016,28);return 0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){A=b_[c[(c[r>>2]|0)+36>>2]&255](r)|0}else{A=c[m>>2]|0}if((A|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){B=z;C=0}else{y=c[m+12>>2]|0;if((y|0)==(c[m+16>>2]|0)){D=b_[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{D=c[y>>2]|0}if((D|0)==-1){c[b>>2]=0;E=0}else{E=m}B=c[u>>2]|0;C=E}F=(C|0)==0;if(!((r^F)&(s|0)!=0)){break}r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){G=b_[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{G=c[r>>2]|0}if(k){H=G}else{H=bY[c[(c[e>>2]|0)+28>>2]&31](h,G)|0}do{if(n){I=x;J=s}else{r=t+1|0;m=s;y=x;o=p;w=0;v=f;while(1){do{if((a[o]|0)==1){K=v;if((a[K]&1)==0){L=v+4|0}else{L=c[v+8>>2]|0}M=c[L+(t<<2)>>2]|0;if(k){N=M}else{N=bY[c[(c[e>>2]|0)+28>>2]&31](h,M)|0}if((H|0)!=(N|0)){a[o]=0;O=w;P=y;Q=m-1|0;break}M=d[K]|0;if((M&1|0)==0){R=M>>>1}else{R=c[v+4>>2]|0}if((R|0)!=(r|0)){O=1;P=y;Q=m;break}a[o]=2;O=1;P=y+1|0;Q=m-1|0}else{O=w;P=y;Q=m}}while(0);M=v+12|0;if((M|0)==(g|0)){break}m=Q;y=P;o=o+1|0;w=O;v=M}if(!O){I=P;J=Q;break}v=c[u>>2]|0;w=v+12|0;o=c[w>>2]|0;if((o|0)==(c[v+16>>2]|0)){y=c[(c[v>>2]|0)+40>>2]|0;b_[y&255](v)}else{c[w>>2]=o+4}if((P+Q|0)>>>0<2|n){I=P;J=Q;break}o=t+1|0;w=P;v=p;y=f;while(1){do{if((a[v]|0)==2){m=d[y]|0;if((m&1|0)==0){S=m>>>1}else{S=c[y+4>>2]|0}if((S|0)==(o|0)){T=w;break}a[v]=0;T=w-1|0}else{T=w}}while(0);m=y+12|0;if((m|0)==(g|0)){I=T;J=Q;break}else{w=T;v=v+1|0;y=m}}}}while(0);t=t+1|0;x=I;s=J}do{if((B|0)==0){U=1}else{J=c[B+12>>2]|0;if((J|0)==(c[B+16>>2]|0)){V=b_[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{V=c[J>>2]|0}if((V|0)==-1){c[u>>2]=0;U=1;break}else{U=(c[u>>2]|0)==0;break}}}while(0);do{if(F){W=2872}else{u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){X=b_[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{X=c[u>>2]|0}if((X|0)==-1){c[b>>2]=0;W=2872;break}else{if(U^(C|0)==0){break}else{W=2874;break}}}}while(0);if((W|0)==2872){if(U){W=2874}}if((W|0)==2874){c[j>>2]=c[j>>2]|2}L3406:do{if(n){W=2879}else{U=f;C=p;while(1){if((a[C]|0)==2){Y=U;break L3406}b=U+12|0;if((b|0)==(g|0)){W=2879;break L3406}U=b;C=C+1|0}}}while(0);if((W|0)==2879){c[j>>2]=c[j>>2]|4;Y=g}if((q|0)==0){i=l;return Y|0}k5(q);i=l;return Y|0}function gq(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[m+19864|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[m+19864|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function gr(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19400)|0;b7[c[(c[h>>2]|0)+48>>2]&15](h,19864,19890,t);h=jp(l,19016)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L3478:while(1){do{if((g|0)==0){w=0}else{h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){x=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{x=c[h>>2]|0}if((x|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);y=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){z=2948}else{A=c[h+12>>2]|0;if((A|0)==(c[h+16>>2]|0)){B=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=2948;break}else{A=(h|0)==0;if(y^A){C=h;D=A;break}else{E=h;F=A;break L3478}}}}while(0);if((z|0)==2948){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}h=w+12|0;A=c[h>>2]|0;G=w+16|0;if((A|0)==(c[G>>2]|0)){H=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{H=c[A>>2]|0}if((gq(H,u,l,p,s,v,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[h>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[w>>2]|0)+40>>2]|0;b_[G&255](w);g=w;continue}else{c[h>>2]=A+4;g=w;continue}}g=n;D=d[g]|0;if((D&1|0)==0){J=D>>>1}else{J=c[n+4>>2]|0}do{if((J|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4;c[D>>2]=C}}while(0);c[k>>2]=f5(l,c[p>>2]|0,j,u)|0;f3(n,o,c[r>>2]|0,j);do{if(y){K=0}else{r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){L=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{L=c[r>>2]|0}if((L|0)!=-1){K=w;break}c[m>>2]=0;K=0}}while(0);m=(K|0)==0;do{if(F){z=2981}else{w=c[E+12>>2]|0;if((w|0)==(c[E+16>>2]|0)){M=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{M=c[w>>2]|0}if((M|0)==-1){c[f>>2]=0;z=2981;break}else{if(m^(E|0)==0){break}else{z=2983;break}}}}while(0);if((z|0)==2981){if(m){z=2983}}if((z|0)==2983){c[j>>2]=c[j>>2]|2}c[b>>2]=K;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gs(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,L=0,M=0,N=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19400)|0;b7[c[(c[h>>2]|0)+48>>2]&15](h,19864,19890,t);h=jp(l,19016)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L3558:while(1){do{if((g|0)==0){w=0}else{h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){x=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{x=c[h>>2]|0}if((x|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);y=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){z=3016}else{A=c[h+12>>2]|0;if((A|0)==(c[h+16>>2]|0)){B=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=3016;break}else{A=(h|0)==0;if(y^A){C=h;D=A;break}else{E=h;F=A;break L3558}}}}while(0);if((z|0)==3016){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}h=w+12|0;A=c[h>>2]|0;G=w+16|0;if((A|0)==(c[G>>2]|0)){H=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{H=c[A>>2]|0}if((gq(H,u,l,p,s,v,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[h>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[w>>2]|0)+40>>2]|0;b_[G&255](w);g=w;continue}else{c[h>>2]=A+4;g=w;continue}}g=n;D=d[g]|0;if((D&1|0)==0){J=D>>>1}else{J=c[n+4>>2]|0}do{if((J|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4;c[D>>2]=C}}while(0);s=f7(l,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f3(n,o,c[r>>2]|0,j);do{if(y){L=0}else{r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){M=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{M=c[r>>2]|0}if((M|0)!=-1){L=w;break}c[m>>2]=0;L=0}}while(0);m=(L|0)==0;do{if(F){z=3049}else{w=c[E+12>>2]|0;if((w|0)==(c[E+16>>2]|0)){N=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{N=c[w>>2]|0}if((N|0)==-1){c[f>>2]=0;z=3049;break}else{if(m^(E|0)==0){break}else{z=3051;break}}}}while(0);if((z|0)==3049){if(m){z=3051}}if((z|0)==3051){c[j>>2]=c[j>>2]|2}c[b>>2]=L;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gt(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0;f=i;i=i+352|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+8|0;o=f+112|0;p=f+128|0;q=f+168|0;r=f+176|0;s=f+336|0;t=f+344|0;u=c[j+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=n|0;n=m|0;w=c[j+28>>2]|0;c[n>>2]=w;j=w+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(m,19400)|0;b7[c[(c[j>>2]|0)+48>>2]&15](j,19864,19890,u);j=jp(m,19016)|0;m=j;w=b_[c[(c[j>>2]|0)+16>>2]&255](m)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,m);m=c[n>>2]|0;n=m+4|0;if(((I=c[n>>2]|0,c[n>>2]=I+ -1,I)|0)==0){bW[c[(c[m>>2]|0)+8>>2]&255](m|0)}m=p|0;ln(m|0,0,40);c[q>>2]=m;p=r|0;c[s>>2]=p;c[t>>2]=0;n=g|0;g=h|0;h=c[n>>2]|0;L14:while(1){do{if((h|0)==0){x=0}else{j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){y=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{y=c[j>>2]|0}if((y|0)!=-1){x=h;break}c[n>>2]=0;x=0}}while(0);z=(x|0)==0;j=c[g>>2]|0;do{if((j|0)==0){A=28}else{B=c[j+12>>2]|0;if((B|0)==(c[j+16>>2]|0)){C=b_[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{C=c[B>>2]|0}if((C|0)==-1){c[g>>2]=0;A=28;break}else{B=(j|0)==0;if(z^B){D=j;E=B;break}else{F=j;G=B;break L14}}}}while(0);if((A|0)==28){A=0;if(z){F=0;G=1;break}else{D=0;E=1}}j=x+12|0;B=c[j>>2]|0;H=x+16|0;if((B|0)==(c[H>>2]|0)){J=b_[c[(c[x>>2]|0)+36>>2]&255](x)|0}else{J=c[B>>2]|0}if((gq(J,v,m,q,t,w,o,p,s,u)|0)!=0){F=D;G=E;break}B=c[j>>2]|0;if((B|0)==(c[H>>2]|0)){H=c[(c[x>>2]|0)+40>>2]|0;b_[H&255](x);h=x;continue}else{c[j>>2]=B+4;h=x;continue}}h=o;E=d[h]|0;if((E&1|0)==0){K=E>>>1}else{K=c[o+4>>2]|0}do{if((K|0)!=0){E=c[s>>2]|0;if((E-r|0)>=160){break}D=c[t>>2]|0;c[s>>2]=E+4;c[E>>2]=D}}while(0);b[l>>1]=f9(m,c[q>>2]|0,k,v)|0;f3(o,p,c[s>>2]|0,k);do{if(z){L=0}else{s=c[x+12>>2]|0;if((s|0)==(c[x+16>>2]|0)){M=b_[c[(c[x>>2]|0)+36>>2]&255](x)|0}else{M=c[s>>2]|0}if((M|0)!=-1){L=x;break}c[n>>2]=0;L=0}}while(0);n=(L|0)==0;do{if(G){A=61}else{x=c[F+12>>2]|0;if((x|0)==(c[F+16>>2]|0)){N=b_[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{N=c[x>>2]|0}if((N|0)==-1){c[g>>2]=0;A=61;break}else{if(n^(F|0)==0){break}else{A=63;break}}}}while(0);if((A|0)==61){if(n){A=63}}if((A|0)==63){c[k>>2]=c[k>>2]|2}c[e>>2]=L;if((a[h]&1)==0){i=f;return}le(c[o+8>>2]|0);i=f;return}function gu(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19400)|0;b7[c[(c[h>>2]|0)+48>>2]&15](h,19864,19890,t);h=jp(l,19016)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L94:while(1){do{if((g|0)==0){w=0}else{h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){x=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{x=c[h>>2]|0}if((x|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);y=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){z=96}else{A=c[h+12>>2]|0;if((A|0)==(c[h+16>>2]|0)){B=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=96;break}else{A=(h|0)==0;if(y^A){C=h;D=A;break}else{E=h;F=A;break L94}}}}while(0);if((z|0)==96){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}h=w+12|0;A=c[h>>2]|0;G=w+16|0;if((A|0)==(c[G>>2]|0)){H=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{H=c[A>>2]|0}if((gq(H,u,l,p,s,v,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[h>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[w>>2]|0)+40>>2]|0;b_[G&255](w);g=w;continue}else{c[h>>2]=A+4;g=w;continue}}g=n;D=d[g]|0;if((D&1|0)==0){J=D>>>1}else{J=c[n+4>>2]|0}do{if((J|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4;c[D>>2]=C}}while(0);c[k>>2]=gb(l,c[p>>2]|0,j,u)|0;f3(n,o,c[r>>2]|0,j);do{if(y){K=0}else{r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){L=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{L=c[r>>2]|0}if((L|0)!=-1){K=w;break}c[m>>2]=0;K=0}}while(0);m=(K|0)==0;do{if(F){z=129}else{w=c[E+12>>2]|0;if((w|0)==(c[E+16>>2]|0)){M=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{M=c[w>>2]|0}if((M|0)==-1){c[f>>2]=0;z=129;break}else{if(m^(E|0)==0){break}else{z=131;break}}}}while(0);if((z|0)==129){if(m){z=131}}if((z|0)==131){c[j>>2]=c[j>>2]|2}c[b>>2]=K;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gv(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19400)|0;b7[c[(c[h>>2]|0)+48>>2]&15](h,19864,19890,t);h=jp(l,19016)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L174:while(1){do{if((g|0)==0){w=0}else{h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){x=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{x=c[h>>2]|0}if((x|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);y=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){z=164}else{A=c[h+12>>2]|0;if((A|0)==(c[h+16>>2]|0)){B=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=164;break}else{A=(h|0)==0;if(y^A){C=h;D=A;break}else{E=h;F=A;break L174}}}}while(0);if((z|0)==164){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}h=w+12|0;A=c[h>>2]|0;G=w+16|0;if((A|0)==(c[G>>2]|0)){H=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{H=c[A>>2]|0}if((gq(H,u,l,p,s,v,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[h>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[w>>2]|0)+40>>2]|0;b_[G&255](w);g=w;continue}else{c[h>>2]=A+4;g=w;continue}}g=n;D=d[g]|0;if((D&1|0)==0){J=D>>>1}else{J=c[n+4>>2]|0}do{if((J|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4;c[D>>2]=C}}while(0);c[k>>2]=gd(l,c[p>>2]|0,j,u)|0;f3(n,o,c[r>>2]|0,j);do{if(y){K=0}else{r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){L=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{L=c[r>>2]|0}if((L|0)!=-1){K=w;break}c[m>>2]=0;K=0}}while(0);m=(K|0)==0;do{if(F){z=197}else{w=c[E+12>>2]|0;if((w|0)==(c[E+16>>2]|0)){M=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{M=c[w>>2]|0}if((M|0)==-1){c[f>>2]=0;z=197;break}else{if(m^(E|0)==0){break}else{z=199;break}}}}while(0);if((z|0)==197){if(m){z=199}}if((z|0)==199){c[j>>2]=c[j>>2]|2}c[b>>2]=K;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gw(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,L=0,M=0,N=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}t=m|0;m=l|0;v=c[h+28>>2]|0;c[m>>2]=v;h=v+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;h=jp(l,19400)|0;b7[c[(c[h>>2]|0)+48>>2]&15](h,19864,19890,t);h=jp(l,19016)|0;l=h;v=b_[c[(c[h>>2]|0)+16>>2]&255](l)|0;bX[c[(c[h>>2]|0)+20>>2]&127](n,l);l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=o|0;ln(l|0,0,40);c[p>>2]=l;o=q|0;c[r>>2]=o;c[s>>2]=0;m=f|0;f=g|0;g=c[m>>2]|0;L254:while(1){do{if((g|0)==0){w=0}else{h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){x=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{x=c[h>>2]|0}if((x|0)!=-1){w=g;break}c[m>>2]=0;w=0}}while(0);y=(w|0)==0;h=c[f>>2]|0;do{if((h|0)==0){z=232}else{A=c[h+12>>2]|0;if((A|0)==(c[h+16>>2]|0)){B=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=232;break}else{A=(h|0)==0;if(y^A){C=h;D=A;break}else{E=h;F=A;break L254}}}}while(0);if((z|0)==232){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}h=w+12|0;A=c[h>>2]|0;G=w+16|0;if((A|0)==(c[G>>2]|0)){H=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{H=c[A>>2]|0}if((gq(H,u,l,p,s,v,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[h>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[w>>2]|0)+40>>2]|0;b_[G&255](w);g=w;continue}else{c[h>>2]=A+4;g=w;continue}}g=n;D=d[g]|0;if((D&1|0)==0){J=D>>>1}else{J=c[n+4>>2]|0}do{if((J|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4;c[D>>2]=C}}while(0);s=gf(l,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f3(n,o,c[r>>2]|0,j);do{if(y){L=0}else{r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){M=b_[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{M=c[r>>2]|0}if((M|0)!=-1){L=w;break}c[m>>2]=0;L=0}}while(0);m=(L|0)==0;do{if(F){z=265}else{w=c[E+12>>2]|0;if((w|0)==(c[E+16>>2]|0)){N=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{N=c[w>>2]|0}if((N|0)==-1){c[f>>2]=0;z=265;break}else{if(m^(E|0)==0){break}else{z=267;break}}}}while(0);if((z|0)==265){if(m){z=267}}if((z|0)==267){c[j>>2]=c[j>>2]|2}c[b>>2]=L;if((a[g]&1)==0){i=e;return}le(c[n+8>>2]|0);i=e;return}function gx(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if((b|0)==(i|0)){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+128|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((c[j>>2]|0)==(b|0)){u=j;break}else{j=j+4|0}}j=u-o|0;o=j>>2;if((j|0)>124){r=-1;return r|0}u=a[o+19864|0]|0;do{if((o|0)==22|(o|0)==23){a[f]=80}else if((o|0)==25|(o|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=u;r=0;return r|0}else{b=a[f]|0;if((u&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){v=b>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}t=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=t}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=u}if((j|0)>84){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function gy(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,Q=0,R=0,S=0;e=i;i=i+400|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+8|0;o=e+144|0;p=e+200|0;q=e+208|0;r=e+368|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+16|0;w=n|0;x=c[j+28>>2]|0;c[w>>2]=x;j=x+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(n,19400)|0;b7[c[(c[j>>2]|0)+48>>2]&15](j,19864,19896,v);j=jp(n,19016)|0;n=j;x=j;y=b_[c[(c[x>>2]|0)+12>>2]&255](n)|0;z=b_[c[(c[x>>2]|0)+16>>2]&255](n)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,n);n=c[w>>2]|0;w=n+4|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){bW[c[(c[n>>2]|0)+8>>2]&255](n|0)}n=e+160|0;ln(n|0,0,40);c[p>>2]=n;w=q|0;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;j=f|0;f=h|0;h=c[j>>2]|0;L398:while(1){do{if((h|0)==0){A=0}else{x=c[h+12>>2]|0;if((x|0)==(c[h+16>>2]|0)){B=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{B=c[x>>2]|0}if((B|0)!=-1){A=h;break}c[j>>2]=0;A=0}}while(0);C=(A|0)==0;x=c[f>>2]|0;do{if((x|0)==0){D=349}else{E=c[x+12>>2]|0;if((E|0)==(c[x+16>>2]|0)){F=b_[c[(c[x>>2]|0)+36>>2]&255](x)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=349;break}else{E=(x|0)==0;if(C^E){G=x;H=E;break}else{J=x;K=E;break L398}}}}while(0);if((D|0)==349){D=0;if(C){J=0;K=1;break}else{G=0;H=1}}x=A+12|0;E=c[x>>2]|0;L=A+16|0;if((E|0)==(c[L>>2]|0)){M=b_[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{M=c[E>>2]|0}if((gx(M,t,u,n,p,y,z,o,w,r,s,v)|0)!=0){J=G;K=H;break}E=c[x>>2]|0;if((E|0)==(c[L>>2]|0)){L=c[(c[A>>2]|0)+40>>2]|0;b_[L&255](A);h=A;continue}else{c[x>>2]=E+4;h=A;continue}}h=o;H=d[h]|0;if((H&1|0)==0){N=H>>>1}else{N=c[o+4>>2]|0}do{if((N|0)!=0){if((a[t]&1)==0){break}H=c[r>>2]|0;if((H-q|0)>=160){break}G=c[s>>2]|0;c[r>>2]=H+4;c[H>>2]=G}}while(0);s=c[p>>2]|0;do{if((n|0)==(s|0)){c[k>>2]=4;O=0.0}else{if(!(a[20024]|0)){c[2504]=bI(1,1840,0)|0;a[20024]=1}P=+lh(n,m);if((c[m>>2]|0)==(s|0)){O=P;break}else{c[k>>2]=4;O=0.0;break}}}while(0);g[l>>2]=O;f3(o,w,c[r>>2]|0,k);do{if(C){Q=0}else{r=c[A+12>>2]|0;if((r|0)==(c[A+16>>2]|0)){R=b_[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{R=c[r>>2]|0}if((R|0)!=-1){Q=A;break}c[j>>2]=0;Q=0}}while(0);j=(Q|0)==0;do{if(K){D=390}else{A=c[J+12>>2]|0;if((A|0)==(c[J+16>>2]|0)){S=b_[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[A>>2]|0}if((S|0)==-1){c[f>>2]=0;D=390;break}else{if(j^(J|0)==0){break}else{D=392;break}}}}while(0);if((D|0)==390){if(j){D=392}}if((D|0)==392){c[k>>2]=c[k>>2]|2}c[b>>2]=Q;if((a[h]&1)==0){i=e;return}le(c[o+8>>2]|0);i=e;return}function gz(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,Q=0,R=0,S=0;e=i;i=i+400|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+8|0;o=e+144|0;p=e+200|0;q=e+208|0;r=e+368|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+16|0;w=n|0;x=c[j+28>>2]|0;c[w>>2]=x;j=x+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(n,19400)|0;b7[c[(c[j>>2]|0)+48>>2]&15](j,19864,19896,v);j=jp(n,19016)|0;n=j;x=j;y=b_[c[(c[x>>2]|0)+12>>2]&255](n)|0;z=b_[c[(c[x>>2]|0)+16>>2]&255](n)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,n);n=c[w>>2]|0;w=n+4|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){bW[c[(c[n>>2]|0)+8>>2]&255](n|0)}n=e+160|0;ln(n|0,0,40);c[p>>2]=n;w=q|0;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;j=f|0;f=g|0;g=c[j>>2]|0;L485:while(1){do{if((g|0)==0){A=0}else{x=c[g+12>>2]|0;if((x|0)==(c[g+16>>2]|0)){B=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{B=c[x>>2]|0}if((B|0)!=-1){A=g;break}c[j>>2]=0;A=0}}while(0);C=(A|0)==0;x=c[f>>2]|0;do{if((x|0)==0){D=422}else{E=c[x+12>>2]|0;if((E|0)==(c[x+16>>2]|0)){F=b_[c[(c[x>>2]|0)+36>>2]&255](x)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=422;break}else{E=(x|0)==0;if(C^E){G=x;H=E;break}else{J=x;K=E;break L485}}}}while(0);if((D|0)==422){D=0;if(C){J=0;K=1;break}else{G=0;H=1}}x=A+12|0;E=c[x>>2]|0;L=A+16|0;if((E|0)==(c[L>>2]|0)){M=b_[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{M=c[E>>2]|0}if((gx(M,t,u,n,p,y,z,o,w,r,s,v)|0)!=0){J=G;K=H;break}E=c[x>>2]|0;if((E|0)==(c[L>>2]|0)){L=c[(c[A>>2]|0)+40>>2]|0;b_[L&255](A);g=A;continue}else{c[x>>2]=E+4;g=A;continue}}g=o;H=d[g]|0;if((H&1|0)==0){N=H>>>1}else{N=c[o+4>>2]|0}do{if((N|0)!=0){if((a[t]&1)==0){break}H=c[r>>2]|0;if((H-q|0)>=160){break}G=c[s>>2]|0;c[r>>2]=H+4;c[H>>2]=G}}while(0);s=c[p>>2]|0;do{if((n|0)==(s|0)){c[k>>2]=4;O=0.0}else{if(!(a[20024]|0)){c[2504]=bI(1,1840,0)|0;a[20024]=1}P=+lh(n,m);if((c[m>>2]|0)==(s|0)){O=P;break}c[k>>2]=4;O=0.0}}while(0);h[l>>3]=O;f3(o,w,c[r>>2]|0,k);do{if(C){Q=0}else{r=c[A+12>>2]|0;if((r|0)==(c[A+16>>2]|0)){R=b_[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{R=c[r>>2]|0}if((R|0)!=-1){Q=A;break}c[j>>2]=0;Q=0}}while(0);j=(Q|0)==0;do{if(K){D=462}else{A=c[J+12>>2]|0;if((A|0)==(c[J+16>>2]|0)){S=b_[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[A>>2]|0}if((S|0)==-1){c[f>>2]=0;D=462;break}else{if(j^(J|0)==0){break}else{D=464;break}}}}while(0);if((D|0)==462){if(j){D=464}}if((D|0)==464){c[k>>2]=c[k>>2]|2}c[b>>2]=Q;if((a[g]&1)==0){i=e;return}le(c[o+8>>2]|0);i=e;return}function gA(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,Q=0,R=0,S=0;e=i;i=i+400|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+8|0;o=e+144|0;p=e+200|0;q=e+208|0;r=e+368|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+16|0;w=n|0;x=c[j+28>>2]|0;c[w>>2]=x;j=x+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;j=jp(n,19400)|0;b7[c[(c[j>>2]|0)+48>>2]&15](j,19864,19896,v);j=jp(n,19016)|0;n=j;x=j;y=b_[c[(c[x>>2]|0)+12>>2]&255](n)|0;z=b_[c[(c[x>>2]|0)+16>>2]&255](n)|0;bX[c[(c[j>>2]|0)+20>>2]&127](o,n);n=c[w>>2]|0;w=n+4|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){bW[c[(c[n>>2]|0)+8>>2]&255](n|0)}n=e+160|0;ln(n|0,0,40);c[p>>2]=n;w=q|0;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;j=f|0;f=g|0;g=c[j>>2]|0;L570:while(1){do{if((g|0)==0){A=0}else{x=c[g+12>>2]|0;if((x|0)==(c[g+16>>2]|0)){B=b_[c[(c[g>>2]|0)+36>>2]&255](g)|0}else{B=c[x>>2]|0}if((B|0)!=-1){A=g;break}c[j>>2]=0;A=0}}while(0);C=(A|0)==0;x=c[f>>2]|0;do{if((x|0)==0){D=494}else{E=c[x+12>>2]|0;if((E|0)==(c[x+16>>2]|0)){F=b_[c[(c[x>>2]|0)+36>>2]&255](x)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=494;break}else{E=(x|0)==0;if(C^E){G=x;H=E;break}else{J=x;K=E;break L570}}}}while(0);if((D|0)==494){D=0;if(C){J=0;K=1;break}else{G=0;H=1}}x=A+12|0;E=c[x>>2]|0;L=A+16|0;if((E|0)==(c[L>>2]|0)){M=b_[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{M=c[E>>2]|0}if((gx(M,t,u,n,p,y,z,o,w,r,s,v)|0)!=0){J=G;K=H;break}E=c[x>>2]|0;if((E|0)==(c[L>>2]|0)){L=c[(c[A>>2]|0)+40>>2]|0;b_[L&255](A);g=A;continue}else{c[x>>2]=E+4;g=A;continue}}g=o;H=d[g]|0;if((H&1|0)==0){N=H>>>1}else{N=c[o+4>>2]|0}do{if((N|0)!=0){if((a[t]&1)==0){break}H=c[r>>2]|0;if((H-q|0)>=160){break}G=c[s>>2]|0;c[r>>2]=H+4;c[H>>2]=G}}while(0);s=c[p>>2]|0;do{if((n|0)==(s|0)){c[k>>2]=4;O=0.0}else{if(!(a[20024]|0)){c[2504]=bI(1,1840,0)|0;a[20024]=1}P=+lh(n,m);if((c[m>>2]|0)==(s|0)){O=P;break}c[k>>2]=4;O=0.0}}while(0);h[l>>3]=O;f3(o,w,c[r>>2]|0,k);do{if(C){Q=0}else{r=c[A+12>>2]|0;if((r|0)==(c[A+16>>2]|0)){R=b_[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{R=c[r>>2]|0}if((R|0)!=-1){Q=A;break}c[j>>2]=0;Q=0}}while(0);j=(Q|0)==0;do{if(K){D=534}else{A=c[J+12>>2]|0;if((A|0)==(c[J+16>>2]|0)){S=b_[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[A>>2]|0}if((S|0)==-1){c[f>>2]=0;D=534;break}else{if(j^(J|0)==0){break}else{D=536;break}}}}while(0);if((D|0)==534){if(j){D=536}}if((D|0)==536){c[k>>2]=c[k>>2]|2}c[b>>2]=Q;if((a[g]&1)==0){i=e;return}le(c[o+8>>2]|0);i=e;return}function gB(a){a=a|0;return}function gC(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0;d=i;i=i+120|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d+104|0;l=k;m=i;i=i+4|0;i=i+7>>3<<3;n=i;i=i+40|0;o=i;i=i+4|0;i=i+7>>3<<3;p=i;i=i+160|0;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+4|0;i=i+7>>3<<3;ln(l|0,0,12);s=m|0;t=c[g+28>>2]|0;c[s>>2]=t;g=t+4|0;I=c[g>>2]|0,c[g>>2]=I+1,I;g=jp(m,19400)|0;m=d|0;b7[c[(c[g>>2]|0)+48>>2]&15](g,19864,19890,m);g=c[s>>2]|0;s=g+4|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){bW[c[(c[g>>2]|0)+8>>2]&255](g|0)}g=n|0;ln(g|0,0,40);c[o>>2]=g;s=p|0;c[q>>2]=s;c[r>>2]=0;p=e|0;e=f|0;f=c[p>>2]|0;L652:while(1){do{if((f|0)==0){u=0}else{t=c[f+12>>2]|0;if((t|0)==(c[f+16>>2]|0)){v=b_[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{v=c[t>>2]|0}if((v|0)!=-1){u=f;break}c[p>>2]=0;u=0}}while(0);w=(u|0)==0;t=c[e>>2]|0;do{if((t|0)==0){x=560}else{y=c[t+12>>2]|0;if((y|0)==(c[t+16>>2]|0)){z=b_[c[(c[t>>2]|0)+36>>2]&255](t)|0}else{z=c[y>>2]|0}if((z|0)==-1){c[e>>2]=0;x=560;break}else{y=(t|0)==0;if(w^y){A=t;C=y;break}else{D=t;E=y;break L652}}}}while(0);if((x|0)==560){x=0;if(w){D=0;E=1;break}else{A=0;C=1}}t=u+12|0;y=c[t>>2]|0;F=u+16|0;if((y|0)==(c[F>>2]|0)){G=b_[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[y>>2]|0}if((gq(G,16,g,o,r,0,k,s,q,m)|0)!=0){D=A;E=C;break}y=c[t>>2]|0;if((y|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;b_[F&255](u);f=u;continue}else{c[t>>2]=y+4;f=u;continue}}a[n+39|0]=0;if(a[20024]|0){H=c[2504]|0}else{n=bI(1,1840,0)|0;c[2504]=n;a[20024]=1;H=n}if((gn(g,H,1632,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}do{if(w){J=0}else{j=c[u+12>>2]|0;if((j|0)==(c[u+16>>2]|0)){K=b_[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{K=c[j>>2]|0}if((K|0)!=-1){J=u;break}c[p>>2]=0;J=0}}while(0);p=(J|0)==0;do{if(E){x=593}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=b_[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;x=593;break}else{if(p^(D|0)==0){break}else{x=595;break}}}}while(0);if((x|0)==593){if(p){x=595}}if((x|0)==595){c[h>>2]=c[h>>2]|2}c[b>>2]=J;if((a[l]&1)==0){i=d;return}le(c[k+8>>2]|0);i=d;return}function gD(a){a=a|0;le(a);return}function gE(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;j=i;i=i+32|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+16|0;if((c[f+4>>2]&1|0)==0){n=c[(c[d>>2]|0)+24>>2]|0;c[k>>2]=c[e>>2];b6[n&31](b,d,k,f,g,h&1);i=j;return}g=l|0;k=c[f+28>>2]|0;c[g>>2]=k;f=k+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(l,19024)|0;l=f;k=c[g>>2]|0;g=k+4|0;if(((I=c[g>>2]|0,c[g>>2]=I+ -1,I)|0)==0){bW[c[(c[k>>2]|0)+8>>2]&255](k|0)}k=c[f>>2]|0;if(h){bX[c[k+24>>2]&127](m,l)}else{bX[c[k+28>>2]&127](m,l)}l=m;k=m;h=a[k]|0;if((h&1)==0){f=l+1|0;o=f;p=f;q=m+8|0}else{f=m+8|0;o=c[f>>2]|0;p=l+1|0;q=f}f=e|0;e=m+4|0;m=o;o=h;while(1){r=(o&1)==0;if(r){s=p}else{s=c[q>>2]|0}h=o&255;if((m|0)==(s+((h&1|0)==0?h>>>1:c[e>>2]|0)|0)){break}h=a[m]|0;l=c[f>>2]|0;do{if((l|0)!=0){g=l+24|0;d=c[g>>2]|0;if((d|0)!=(c[l+28>>2]|0)){c[g>>2]=d+1;a[d]=h;break}if((bY[c[(c[l>>2]|0)+52>>2]&31](l,h&255)|0)!=-1){break}c[f>>2]=0}}while(0);m=m+1|0;o=a[k]|0}c[b>>2]=c[f>>2];if(r){i=j;return}le(c[q>>2]|0);i=j;return}function gF(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[10792]|0;a[q+1|0]=a[10793|0]|0;a[q+2|0]=a[10794|0]|0;a[q+3|0]=a[10795|0]|0;a[q+4|0]=a[10796|0]|0;a[q+5|0]=a[10797|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;if(a[20024]|0){w=c[2504]|0}else{t=bI(1,1840,0)|0;c[2504]=t;a[20024]=1;w=t}t=gG(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=657;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=657;break}x=k+2|0}else{y=657}}while(0);if((y|0)==657){x=u}y=l|0;l=o|0;k=c[f+28>>2]|0;c[l>>2]=k;t=k+4|0;I=c[t>>2]|0,c[t>>2]=I+1,I;gH(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;dR(b,p,y,D,E,f,g);i=d;return}bW[c[(c[o>>2]|0)+8>>2]&255](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;dR(b,p,y,D,E,f,g);i=d;return}function gG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bN(b|0)|0;b=bR(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bN(h|0);i=f;return b|0}function gH(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+16|0;m=l|0;n=jp(k,19408)|0;o=n;p=jp(k,19024)|0;k=p;bX[c[(c[p>>2]|0)+20>>2]&127](m,k);q=m;r=m;s=d[r]|0;if((s&1|0)==0){t=s>>>1}else{t=c[m+4>>2]|0}do{if((t|0)==0){s=c[(c[n>>2]|0)+32>>2]|0;b7[s&15](o,b,f,g);c[j>>2]=g+(f-b|0)}else{c[j>>2]=g;s=a[b]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){u=bY[c[(c[n>>2]|0)+28>>2]&31](o,s)|0;s=c[j>>2]|0;c[j>>2]=s+1;a[s]=u;v=b+1|0}else{v=b}do{if((f-v|0)>1){if((a[v]|0)!=48){w=v;break}u=v+1|0;s=a[u]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){w=v;break}s=n;x=bY[c[(c[s>>2]|0)+28>>2]&31](o,48)|0;y=c[j>>2]|0;c[j>>2]=y+1;a[y]=x;x=bY[c[(c[s>>2]|0)+28>>2]&31](o,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=x;w=v+2|0}else{w=v}}while(0);do{if((w|0)!=(f|0)){x=f-1|0;if(w>>>0<x>>>0){z=w;A=x}else{break}do{x=a[z]|0;a[z]=a[A]|0;a[A]=x;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);x=b_[c[(c[p>>2]|0)+16>>2]&255](k)|0;if(w>>>0<f>>>0){u=q+1|0;s=n;y=m+4|0;B=m+8|0;C=0;D=0;E=w;while(1){F=(a[r]&1)==0;do{if((a[(F?u:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?u:c[B>>2]|0)+D|0]|0|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1;a[I]=x;I=d[r]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0&1)+D|0;H=0}}while(0);F=bY[c[(c[s>>2]|0)+28>>2]&31](o,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(w-b|0)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-1|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=a[J]|0;a[J]=a[K]|0;a[K]=C;J=J+1|0;K=K-1|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0}else{L=g+(e-b|0)|0}c[h>>2]=L;if((a[r]&1)==0){i=l;return}le(c[m+8>>2]|0);i=l;return}function gI(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;if(a[20024]|0){w=c[2504]|0}else{t=bI(1,1840,0)|0;c[2504]=t;a[20024]=1;w=t}t=gG(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=734;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=734;break}x=l+2|0}else if((h|0)==32){x=j}else{y=734}}while(0);if((y|0)==734){x=u}y=m|0;m=p|0;h=c[f+28>>2]|0;c[m>>2]=h;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;gH(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;dR(b,q,y,D,E,f,g);i=d;return}bW[c[(c[p>>2]|0)+8>>2]&255](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;dR(b,q,y,D,E,f,g);i=d;return}function gJ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[10792]|0;a[q+1|0]=a[10793|0]|0;a[q+2|0]=a[10794|0]|0;a[q+3|0]=a[10795|0]|0;a[q+4|0]=a[10796|0]|0;a[q+5|0]=a[10797|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;if(a[20024]|0){w=c[2504]|0}else{t=bI(1,1840,0)|0;c[2504]=t;a[20024]=1;w=t}t=gG(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=763;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=763;break}x=k+2|0}else{y=763}}while(0);if((y|0)==763){x=u}y=l|0;l=o|0;k=c[f+28>>2]|0;c[l>>2]=k;t=k+4|0;I=c[t>>2]|0,c[t>>2]=I+1,I;gH(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;dR(b,p,y,D,E,f,g);i=d;return}bW[c[(c[o>>2]|0)+8>>2]&255](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;dR(b,p,y,D,E,f,g);i=d;return}function gK(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;if(a[20024]|0){w=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;w=v}v=gG(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=792;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=792;break}x=l+2|0}else if((h|0)==32){x=j}else{y=792}}while(0);if((y|0)==792){x=u}y=m|0;m=p|0;h=c[f+28>>2]|0;c[m>>2]=h;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;gH(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;dR(b,q,y,D,E,f,g);i=d;return}bW[c[(c[p>>2]|0)+8>>2]&255](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;dR(b,q,y,D,E,f,g);i=d;return}function gL(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d&2048|0)==0){e=b}else{a[b]=43;e=b+1|0}if((d&1024|0)==0){f=e}else{a[e]=35;f=e+1|0}e=d&260;b=d>>>14;d=(e|0)==260;if(d){g=f;h=0}else{a[f]=46;a[f+1|0]=42;g=f+2|0;h=1}f=a[c]|0;if(f<<24>>24==0){i=g}else{j=c;c=g;g=f;while(1){f=j+1|0;k=c+1|0;a[c]=g;l=a[f]|0;if(l<<24>>24==0){i=k;break}else{j=f;c=k;g=l}}}do{if((e|0)==256){if((b&1|0)==0){a[i]=101;break}else{a[i]=69;break}}else if((e|0)==4){if((b&1|0)==0){a[i]=102;break}else{a[i]=70;break}}else{g=(b&1|0)!=0;if(d){if(g){a[i]=65;break}else{a[i]=97;break}}else{if(g){a[i]=71;break}else{a[i]=103;break}}}}while(0);return h|0}function gM(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+16|0;m=l|0;n=jp(k,19408)|0;o=n;p=jp(k,19024)|0;k=p;bX[c[(c[p>>2]|0)+20>>2]&127](m,k);c[j>>2]=g;q=a[b]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){r=bY[c[(c[n>>2]|0)+28>>2]&31](o,q)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=r;s=b+1|0}else{s=b}r=f;L983:do{if((r-s|0)>1){if((a[s]|0)!=48){t=s;u=850;break}q=s+1|0;v=a[q]|0;if(!((v<<24>>24|0)==120|(v<<24>>24|0)==88)){t=s;u=850;break}v=n;w=bY[c[(c[v>>2]|0)+28>>2]&31](o,48)|0;x=c[j>>2]|0;c[j>>2]=x+1;a[x]=w;w=s+2|0;x=bY[c[(c[v>>2]|0)+28>>2]&31](o,a[q]|0)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=x;x=w;while(1){if(x>>>0>=f>>>0){y=x;z=w;break L983}q=a[x]|0;if(a[20024]|0){A=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;A=v}if((a_(q<<24>>24|0,A|0)|0)==0){y=x;z=w;break}else{x=x+1|0}}}else{t=s;u=850}}while(0);L998:do{if((u|0)==850){while(1){u=0;if(t>>>0>=f>>>0){y=t;z=s;break L998}A=a[t]|0;if(a[20024]|0){B=c[2504]|0}else{x=bI(1,1840,0)|0;c[2504]=x;a[20024]=1;B=x}if((aS(A<<24>>24|0,B|0)|0)==0){y=t;z=s;break}else{t=t+1|0;u=850}}}}while(0);u=m;t=m;s=d[t]|0;if((s&1|0)==0){C=s>>>1}else{C=c[m+4>>2]|0}do{if((C|0)==0){s=c[j>>2]|0;B=c[(c[n>>2]|0)+32>>2]|0;b7[B&15](o,z,y,s);c[j>>2]=(c[j>>2]|0)+(y-z|0)}else{do{if((z|0)!=(y|0)){s=y-1|0;if(z>>>0<s>>>0){D=z;E=s}else{break}do{s=a[D]|0;a[D]=a[E]|0;a[E]=s;D=D+1|0;E=E-1|0;}while(D>>>0<E>>>0)}}while(0);s=b_[c[(c[p>>2]|0)+16>>2]&255](k)|0;if(z>>>0<y>>>0){B=u+1|0;A=m+4|0;x=m+8|0;w=n;q=0;v=0;F=z;while(1){G=(a[t]&1)==0;do{if((a[(G?B:c[x>>2]|0)+v|0]|0)>0){if((q|0)!=(a[(G?B:c[x>>2]|0)+v|0]|0|0)){H=v;I=q;break}J=c[j>>2]|0;c[j>>2]=J+1;a[J]=s;J=d[t]|0;H=(v>>>0<(((J&1|0)==0?J>>>1:c[A>>2]|0)-1|0)>>>0&1)+v|0;I=0}else{H=v;I=q}}while(0);G=bY[c[(c[w>>2]|0)+28>>2]&31](o,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){q=I+1|0;v=H;F=G}else{break}}}F=g+(z-b|0)|0;v=c[j>>2]|0;if((F|0)==(v|0)){break}q=v-1|0;if(F>>>0<q>>>0){K=F;L=q}else{break}do{q=a[K]|0;a[K]=a[L]|0;a[L]=q;K=K+1|0;L=L-1|0;}while(K>>>0<L>>>0)}}while(0);L1037:do{if(y>>>0<f>>>0){L=n;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=bY[c[(c[L>>2]|0)+28>>2]&31](o,z)|0;z=c[j>>2]|0;c[j>>2]=z+1;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1037}}L=b_[c[(c[p>>2]|0)+12>>2]&255](k)|0;H=c[j>>2]|0;c[j>>2]=H+1;a[H]=L;M=K+1|0}else{M=y}}while(0);b7[c[(c[n>>2]|0)+32>>2]&15](o,M,f,c[j>>2]|0);o=(c[j>>2]|0)+(r-M|0)|0;c[j>>2]=o;if((e|0)==(f|0)){N=o}else{N=g+(e-b|0)|0}c[h>>2]=N;if((a[t]&1)==0){i=l;return}le(c[m+8>>2]|0);i=l;return}function gN(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+40|0;m=d+48|0;n=d+112|0;o=d+120|0;p=d+128|0;q=d+136|0;r=d+144|0;c[k>>2]=37;c[k+4>>2]=0;s=k;k=f+4|0;t=gL(s+1|0,1848,c[k>>2]|0)|0;u=d+8|0;c[l>>2]=u;if(a[20024]|0){v=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;v=w}if(t){x=gO(u,30,v,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{x=gO(u,30,v,s,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((x|0)>29){v=a[20024]|0;if(t){if(v){y=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;y=w}z=gP(l,y,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(v){A=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;A=v}z=gP(l,A,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}v=c[l>>2]|0;if((v|0)!=0){C=z;D=v;E=v;break}v=bi(4)|0;c[v>>2]=11256;aN(v|0,17016,28)}else{C=x;D=0;E=c[l>>2]|0}}while(0);x=E+C|0;z=c[k>>2]&176;do{if((z|0)==32){F=x}else if((z|0)==16){k=a[E]|0;if((k<<24>>24|0)==45|(k<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&k<<24>>24==48)){G=921;break}k=a[E+1|0]|0;if(!((k<<24>>24|0)==120|(k<<24>>24|0)==88)){G=921;break}F=E+2|0}else{G=921}}while(0);if((G|0)==921){F=E}do{if((E|0)==(u|0)){H=m|0;J=0;K=u}else{G=k4(C<<1)|0;if((G|0)!=0){H=G;J=G;K=c[l>>2]|0;break}G=bi(4)|0;c[G>>2]=11256;aN(G|0,17016,28)}}while(0);l=p|0;C=c[f+28>>2]|0;c[l>>2]=C;u=C+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;gM(K,F,x,H,n,o,p);p=c[l>>2]|0;l=p+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){bW[c[(c[p>>2]|0)+8>>2]&255](p|0)}p=e|0;c[r>>2]=c[p>>2];dR(q,r,H,c[n>>2]|0,c[o>>2]|0,f,g);g=c[q>>2]|0;c[p>>2]=g;c[b>>2]=g;if((J|0)!=0){k5(J)}if((D|0)==0){i=d;return}k5(D);i=d;return}function gO(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=bN(d|0)|0;d=aH(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}bN(j|0);i=g;return d|0}function gP(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bN(b|0)|0;b=bl(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bN(h|0);i=f;return b|0}function gQ(a){a=a|0;return}function gR(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+88|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d+8|0;k=d+32|0;l=d+72|0;m=d+80|0;n=d|0;a[n]=a[10800]|0;a[n+1|0]=a[10801|0]|0;a[n+2|0]=a[10802|0]|0;a[n+3|0]=a[10803|0]|0;a[n+4|0]=a[10804|0]|0;a[n+5|0]=a[10805|0]|0;o=j|0;if(a[20024]|0){p=c[2504]|0}else{q=bI(1,1840,0)|0;c[2504]=q;a[20024]=1;p=q}q=gG(o,p,n,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=j+q|0;n=c[f+4>>2]&176;do{if((n|0)==16){p=a[o]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){r=j+1|0;break}if(!((q|0)>1&p<<24>>24==48)){s=973;break}p=a[j+1|0]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){s=973;break}r=j+2|0}else if((n|0)==32){r=h}else{s=973}}while(0);if((s|0)==973){r=o}s=l|0;n=c[f+28>>2]|0;c[s>>2]=n;p=n+4|0;I=c[p>>2]|0,c[p>>2]=I+1,I;p=jp(l,19408)|0;l=c[s>>2]|0;s=l+4|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=k|0;b7[c[(c[p>>2]|0)+32>>2]&15](p,o,h,l);o=k+q|0;if((r|0)==(h|0)){t=o;u=e|0;v=c[u>>2]|0;w=m|0;c[w>>2]=v;dR(b,m,l,t,o,f,g);i=d;return}t=k+(r-j|0)|0;u=e|0;v=c[u>>2]|0;w=m|0;c[w>>2]=v;dR(b,m,l,t,o,f,g);i=d;return}function gS(a){a=a|0;le(a);return}function gT(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+16|0;if((c[f+4>>2]&1|0)==0){n=c[(c[d>>2]|0)+24>>2]|0;c[k>>2]=c[e>>2];b6[n&31](b,d,k,f,g,h&1);i=j;return}g=l|0;k=c[f+28>>2]|0;c[g>>2]=k;f=k+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(l,19016)|0;l=f;k=c[g>>2]|0;g=k+4|0;if(((I=c[g>>2]|0,c[g>>2]=I+ -1,I)|0)==0){bW[c[(c[k>>2]|0)+8>>2]&255](k|0)}k=c[f>>2]|0;if(h){bX[c[k+24>>2]&127](m,l)}else{bX[c[k+28>>2]&127](m,l)}l=m;k=a[l]|0;if((k&1)==0){h=m+4|0;o=h;p=h;q=m+8|0}else{h=m+8|0;o=c[h>>2]|0;p=m+4|0;q=h}h=e|0;e=o;o=k;while(1){r=(o&1)==0;if(r){s=p}else{s=c[q>>2]|0}k=o&255;if((k&1|0)==0){t=k>>>1}else{t=c[p>>2]|0}if((e|0)==(s+(t<<2)|0)){break}k=c[e>>2]|0;m=c[h>>2]|0;do{if((m|0)!=0){f=m+24|0;g=c[f>>2]|0;if((g|0)==(c[m+28>>2]|0)){u=bY[c[(c[m>>2]|0)+52>>2]&31](m,k)|0}else{c[f>>2]=g+4;c[g>>2]=k;u=k}if((u|0)!=-1){break}c[h>>2]=0}}while(0);e=e+4|0;o=a[l]|0}c[b>>2]=c[h>>2];if(r){i=j;return}le(c[q>>2]|0);i=j;return}function gU(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[10792]|0;a[q+1|0]=a[10793|0]|0;a[q+2|0]=a[10794|0]|0;a[q+3|0]=a[10795|0]|0;a[q+4|0]=a[10796|0]|0;a[q+5|0]=a[10797|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;if(a[20024]|0){w=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;w=v}v=gG(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1041;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1041;break}x=k+2|0}else if((q|0)==32){x=h}else{y=1041}}while(0);if((y|0)==1041){x=u}y=l|0;l=o|0;q=c[f+28>>2]|0;c[l>>2]=q;k=q+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;gW(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gZ(b,p,y,D,E,f,g);i=d;return}bW[c[(c[o>>2]|0)+8>>2]&255](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gZ(b,p,y,D,E,f,g);i=d;return}function gV(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+40|0;m=d+48|0;n=d+112|0;o=d+120|0;p=d+128|0;q=d+136|0;r=d+144|0;c[k>>2]=37;c[k+4>>2]=0;s=k;k=f+4|0;t=gL(s+1|0,1464,c[k>>2]|0)|0;u=d+8|0;c[l>>2]=u;if(a[20024]|0){v=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;v=w}if(t){x=gO(u,30,v,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{x=gO(u,30,v,s,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((x|0)>29){v=a[20024]|0;if(t){if(v){y=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;y=w}z=gP(l,y,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(v){A=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;A=v}z=gP(l,A,s,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}v=c[l>>2]|0;if((v|0)!=0){C=z;D=v;E=v;break}v=bi(4)|0;c[v>>2]=11256;aN(v|0,17016,28)}else{C=x;D=0;E=c[l>>2]|0}}while(0);x=E+C|0;z=c[k>>2]&176;do{if((z|0)==16){k=a[E]|0;if((k<<24>>24|0)==45|(k<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&k<<24>>24==48)){G=1080;break}k=a[E+1|0]|0;if(!((k<<24>>24|0)==120|(k<<24>>24|0)==88)){G=1080;break}F=E+2|0}else if((z|0)==32){F=x}else{G=1080}}while(0);if((G|0)==1080){F=E}do{if((E|0)==(u|0)){H=m|0;J=0;K=u}else{G=k4(C<<1)|0;if((G|0)!=0){H=G;J=G;K=c[l>>2]|0;break}G=bi(4)|0;c[G>>2]=11256;aN(G|0,17016,28)}}while(0);l=p|0;C=c[f+28>>2]|0;c[l>>2]=C;u=C+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;gM(K,F,x,H,n,o,p);p=c[l>>2]|0;l=p+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){bW[c[(c[p>>2]|0)+8>>2]&255](p|0)}p=e|0;c[r>>2]=c[p>>2];dR(q,r,H,c[n>>2]|0,c[o>>2]|0,f,g);g=c[q>>2]|0;c[p>>2]=g;c[b>>2]=g;if((J|0)!=0){k5(J)}if((D|0)==0){i=d;return}k5(D);i=d;return}function gW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+16|0;m=l|0;n=jp(k,19400)|0;o=n;p=jp(k,19016)|0;k=p;bX[c[(c[p>>2]|0)+20>>2]&127](m,k);q=m;r=m;s=d[r]|0;if((s&1|0)==0){t=s>>>1}else{t=c[m+4>>2]|0}do{if((t|0)==0){s=c[(c[n>>2]|0)+48>>2]|0;b7[s&15](o,b,f,g);c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;s=a[b]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){u=bY[c[(c[n>>2]|0)+44>>2]&31](o,s)|0;s=c[j>>2]|0;c[j>>2]=s+4;c[s>>2]=u;v=b+1|0}else{v=b}do{if((f-v|0)>1){if((a[v]|0)!=48){w=v;break}u=v+1|0;s=a[u]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){w=v;break}s=n;x=bY[c[(c[s>>2]|0)+44>>2]&31](o,48)|0;y=c[j>>2]|0;c[j>>2]=y+4;c[y>>2]=x;x=bY[c[(c[s>>2]|0)+44>>2]&31](o,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=x;w=v+2|0}else{w=v}}while(0);do{if((w|0)!=(f|0)){x=f-1|0;if(w>>>0<x>>>0){z=w;A=x}else{break}do{x=a[z]|0;a[z]=a[A]|0;a[A]=x;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);x=b_[c[(c[p>>2]|0)+16>>2]&255](k)|0;if(w>>>0<f>>>0){u=q+1|0;s=n;y=m+4|0;B=m+8|0;C=0;D=0;E=w;while(1){F=(a[r]&1)==0;do{if((a[(F?u:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?u:c[B>>2]|0)+D|0]|0|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=x;I=d[r]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0&1)+D|0;H=0}}while(0);F=bY[c[(c[s>>2]|0)+44>>2]&31](o,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(w-b<<2)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-4|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=c[J>>2]|0;c[J>>2]=c[K>>2];c[K>>2]=C;J=J+4|0;K=K-4|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0}else{L=g+(e-b<<2)|0}c[h>>2]=L;if((a[r]&1)==0){i=l;return}le(c[m+8>>2]|0);i=l;return}function gX(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;if(a[20024]|0){w=c[2504]|0}else{t=bI(1,1840,0)|0;c[2504]=t;a[20024]=1;w=t}t=gG(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=1166;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1166;break}x=l+2|0}else if((h|0)==32){x=j}else{y=1166}}while(0);if((y|0)==1166){x=u}y=m|0;m=p|0;h=c[f+28>>2]|0;c[m>>2]=h;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;gW(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gZ(b,q,y,D,E,f,g);i=d;return}bW[c[(c[p>>2]|0)+8>>2]&255](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gZ(b,q,y,D,E,f,g);i=d;return}function gY(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[10792]|0;a[q+1|0]=a[10793|0]|0;a[q+2|0]=a[10794|0]|0;a[q+3|0]=a[10795|0]|0;a[q+4|0]=a[10796|0]|0;a[q+5|0]=a[10797|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=k|0;if(a[20024]|0){w=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;w=v}v=gG(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1195;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1195;break}x=k+2|0}else{y=1195}}while(0);if((y|0)==1195){x=u}y=l|0;l=o|0;k=c[f+28>>2]|0;c[l>>2]=k;v=k+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;gW(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gZ(b,p,y,D,E,f,g);i=d;return}bW[c[(c[o>>2]|0)+8>>2]&255](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gZ(b,p,y,D,E,f,g);i=d;return}function gZ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((bZ[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){if(q>>>0>1073741822){eN(0)}if(q>>>0<2){a[l]=q<<1&255;r=1;s=l+4|0}else{g=q+4&-4;e=la(g<<2)|0;c[l+8>>2]=e;c[l>>2]=g|1;c[l+4>>2]=q;r=q;s=e}e=r;g=s;while(1){h=e-1|0;c[g>>2]=j;if((h|0)==0){break}else{e=h;g=g+4|0}}c[s+(q<<2)>>2]=0;g=c[m>>2]|0;e=l;if((a[e]&1)==0){t=l+4|0}else{t=c[l+8>>2]|0}if((bZ[c[(c[g>>2]|0)+48>>2]&63](g,t,q)|0)==(q|0)){if((a[e]&1)==0){u=g;break}le(c[l+8>>2]|0);u=g;break}c[m>>2]=0;c[b>>2]=0;if((a[e]&1)==0){i=k;return}le(c[l+8>>2]|0);i=k;return}else{u=d}}while(0);d=n-o|0;o=d>>2;do{if((d|0)>0){if((bZ[c[(c[u>>2]|0)+48>>2]&63](u,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=u;i=k;return}function g_(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;if(a[20024]|0){w=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;w=v}v=gG(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==32){x=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1260;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1260;break}x=l+2|0}else{y=1260}}while(0);if((y|0)==1260){x=u}y=m|0;m=p|0;l=c[f+28>>2]|0;c[m>>2]=l;v=l+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;gW(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gZ(b,q,y,D,E,f,g);i=d;return}bW[c[(c[p>>2]|0)+8>>2]&255](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gZ(b,q,y,D,E,f,g);i=d;return}function g$(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+16|0;m=l|0;n=jp(k,19400)|0;o=n;p=jp(k,19016)|0;k=p;bX[c[(c[p>>2]|0)+20>>2]&127](m,k);c[j>>2]=g;q=a[b]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){r=bY[c[(c[n>>2]|0)+44>>2]&31](o,q)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=r;s=b+1|0}else{s=b}r=f;L1477:do{if((r-s|0)>1){if((a[s]|0)!=48){t=s;u=1295;break}q=s+1|0;v=a[q]|0;if(!((v<<24>>24|0)==120|(v<<24>>24|0)==88)){t=s;u=1295;break}v=n;w=bY[c[(c[v>>2]|0)+44>>2]&31](o,48)|0;x=c[j>>2]|0;c[j>>2]=x+4;c[x>>2]=w;w=s+2|0;x=bY[c[(c[v>>2]|0)+44>>2]&31](o,a[q]|0)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=x;x=w;while(1){if(x>>>0>=f>>>0){y=x;z=w;break L1477}q=a[x]|0;if(a[20024]|0){A=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;A=v}if((a_(q<<24>>24|0,A|0)|0)==0){y=x;z=w;break}else{x=x+1|0}}}else{t=s;u=1295}}while(0);L1492:do{if((u|0)==1295){while(1){u=0;if(t>>>0>=f>>>0){y=t;z=s;break L1492}A=a[t]|0;if(a[20024]|0){B=c[2504]|0}else{x=bI(1,1840,0)|0;c[2504]=x;a[20024]=1;B=x}if((aS(A<<24>>24|0,B|0)|0)==0){y=t;z=s;break}else{t=t+1|0;u=1295}}}}while(0);u=m;t=m;s=d[t]|0;if((s&1|0)==0){C=s>>>1}else{C=c[m+4>>2]|0}do{if((C|0)==0){s=c[j>>2]|0;B=c[(c[n>>2]|0)+48>>2]|0;b7[B&15](o,z,y,s);c[j>>2]=(c[j>>2]|0)+(y-z<<2)}else{do{if((z|0)!=(y|0)){s=y-1|0;if(z>>>0<s>>>0){D=z;E=s}else{break}do{s=a[D]|0;a[D]=a[E]|0;a[E]=s;D=D+1|0;E=E-1|0;}while(D>>>0<E>>>0)}}while(0);s=b_[c[(c[p>>2]|0)+16>>2]&255](k)|0;if(z>>>0<y>>>0){B=u+1|0;A=m+4|0;x=m+8|0;w=n;q=0;v=0;F=z;while(1){G=(a[t]&1)==0;do{if((a[(G?B:c[x>>2]|0)+v|0]|0)>0){if((q|0)!=(a[(G?B:c[x>>2]|0)+v|0]|0|0)){H=v;I=q;break}J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=s;J=d[t]|0;H=(v>>>0<(((J&1|0)==0?J>>>1:c[A>>2]|0)-1|0)>>>0&1)+v|0;I=0}else{H=v;I=q}}while(0);G=bY[c[(c[w>>2]|0)+44>>2]&31](o,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){q=I+1|0;v=H;F=G}else{break}}}F=g+(z-b<<2)|0;v=c[j>>2]|0;if((F|0)==(v|0)){break}q=v-4|0;if(F>>>0<q>>>0){K=F;L=q}else{break}do{q=c[K>>2]|0;c[K>>2]=c[L>>2];c[L>>2]=q;K=K+4|0;L=L-4|0;}while(K>>>0<L>>>0)}}while(0);L1531:do{if(y>>>0<f>>>0){L=n;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=bY[c[(c[L>>2]|0)+44>>2]&31](o,z)|0;z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1531}}L=b_[c[(c[p>>2]|0)+12>>2]&255](k)|0;H=c[j>>2]|0;c[j>>2]=H+4;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);b7[c[(c[n>>2]|0)+48>>2]&15](o,M,f,c[j>>2]|0);o=(c[j>>2]|0)+(r-M<<2)|0;c[j>>2]=o;if((e|0)==(f|0)){N=o}else{N=g+(e-b<<2)|0}c[h>>2]=N;if((a[t]&1)==0){i=l;return}le(c[m+8>>2]|0);i=l;return}function g0(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+40|0;m=d+48|0;n=d+280|0;o=d+288|0;p=d+296|0;q=d+304|0;r=d+312|0;c[k>>2]=37;c[k+4>>2]=0;s=k;k=f+4|0;t=gL(s+1|0,1848,c[k>>2]|0)|0;u=d+8|0;c[l>>2]=u;if(a[20024]|0){v=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;v=w}if(t){x=gO(u,30,v,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{x=gO(u,30,v,s,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((x|0)>29){v=a[20024]|0;if(t){if(v){y=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;y=w}z=gP(l,y,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(v){A=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;A=v}z=gP(l,A,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}v=c[l>>2]|0;if((v|0)!=0){C=z;D=v;E=v;break}v=bi(4)|0;c[v>>2]=11256;aN(v|0,17016,28)}else{C=x;D=0;E=c[l>>2]|0}}while(0);x=E+C|0;z=c[k>>2]&176;do{if((z|0)==16){k=a[E]|0;if((k<<24>>24|0)==45|(k<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&k<<24>>24==48)){G=1366;break}k=a[E+1|0]|0;if(!((k<<24>>24|0)==120|(k<<24>>24|0)==88)){G=1366;break}F=E+2|0}else if((z|0)==32){F=x}else{G=1366}}while(0);if((G|0)==1366){F=E}do{if((E|0)==(u|0)){H=m|0;J=0;K=u}else{G=k4(C<<3)|0;z=G;if((G|0)!=0){H=z;J=z;K=c[l>>2]|0;break}z=bi(4)|0;c[z>>2]=11256;aN(z|0,17016,28)}}while(0);l=p|0;C=c[f+28>>2]|0;c[l>>2]=C;u=C+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;g$(K,F,x,H,n,o,p);p=c[l>>2]|0;l=p+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){bW[c[(c[p>>2]|0)+8>>2]&255](p|0)}p=e|0;c[r>>2]=c[p>>2];gZ(q,r,H,c[n>>2]|0,c[o>>2]|0,f,g);g=c[q>>2]|0;c[p>>2]=g;c[b>>2]=g;if((J|0)!=0){k5(J)}if((D|0)==0){i=d;return}k5(D);i=d;return}function g1(a){a=a|0;return}function g2(a){a=a|0;return 2}function g3(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+200|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d+8|0;k=d+32|0;l=d+184|0;m=d+192|0;n=d|0;a[n]=a[10800]|0;a[n+1|0]=a[10801|0]|0;a[n+2|0]=a[10802|0]|0;a[n+3|0]=a[10803|0]|0;a[n+4|0]=a[10804|0]|0;a[n+5|0]=a[10805|0]|0;o=j|0;if(a[20024]|0){p=c[2504]|0}else{q=bI(1,1840,0)|0;c[2504]=q;a[20024]=1;p=q}q=gG(o,p,n,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=j+q|0;n=c[f+4>>2]&176;do{if((n|0)==16){p=a[o]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){r=j+1|0;break}if(!((q|0)>1&p<<24>>24==48)){s=1402;break}p=a[j+1|0]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){s=1402;break}r=j+2|0}else if((n|0)==32){r=h}else{s=1402}}while(0);if((s|0)==1402){r=o}s=l|0;n=c[f+28>>2]|0;c[s>>2]=n;p=n+4|0;I=c[p>>2]|0,c[p>>2]=I+1,I;p=jp(l,19400)|0;l=c[s>>2]|0;s=l+4|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=k|0;b7[c[(c[p>>2]|0)+48>>2]&15](p,o,h,l);o=k+(q<<2)|0;if((r|0)==(h|0)){t=o;u=e|0;v=c[u>>2]|0;w=m|0;c[w>>2]=v;gZ(b,m,l,t,o,f,g);i=d;return}t=k+(r-j<<2)|0;u=e|0;v=c[u>>2]|0;w=m|0;c[w>>2]=v;gZ(b,m,l,t,o,f,g);i=d;return}function g4(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;n=i;i=i+32|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2];o=n|0;p=n+8|0;q=n+16|0;r=n+24|0;s=o|0;t=c[h+28>>2]|0;c[s>>2]=t;u=t+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;u=jp(o,19408)|0;o=u;t=c[s>>2]|0;s=t+4|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){bW[c[(c[t>>2]|0)+8>>2]&255](t|0)}c[j>>2]=0;t=f|0;L1636:do{if((l|0)==(m|0)){v=1479}else{s=g|0;w=u;x=u+8|0;y=u;z=e;A=q|0;B=r|0;C=p|0;D=l;E=0;L1638:while(1){F=E;while(1){if((F|0)!=0){v=1479;break L1636}G=c[t>>2]|0;do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}if((b_[c[(c[G>>2]|0)+36>>2]&255](G)|0)!=-1){H=G;break}c[t>>2]=0;H=0}}while(0);G=(H|0)==0;J=c[s>>2]|0;L1648:do{if((J|0)==0){v=1430}else{do{if((c[J+12>>2]|0)==(c[J+16>>2]|0)){if((b_[c[(c[J>>2]|0)+36>>2]&255](J)|0)!=-1){break}c[s>>2]=0;v=1430;break L1648}}while(0);if(G){K=J}else{v=1431;break L1638}}}while(0);if((v|0)==1430){v=0;if(G){v=1431;break L1638}else{K=0}}if(bZ[c[(c[w>>2]|0)+36>>2]&63](o,a[D]|0,0)<<24>>24==37){v=1436;break}J=a[D]|0;if(J<<24>>24>-1){L=c[x>>2]|0;if((b[L+(J<<24>>24<<1)>>1]&8192)!=0){M=D;v=1447;break}}N=H+12|0;J=c[N>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){P=b_[c[(c[H>>2]|0)+36>>2]&255](H)&255}else{P=a[J]|0}J=bY[c[(c[y>>2]|0)+12>>2]&31](o,P)|0;if(J<<24>>24==bY[c[(c[y>>2]|0)+12>>2]&31](o,a[D]|0)<<24>>24){v=1474;break}c[j>>2]=4;F=4}L1666:do{if((v|0)==1436){v=0;F=D+1|0;if((F|0)==(m|0)){v=1437;break L1638}J=bZ[c[(c[w>>2]|0)+36>>2]&63](o,a[F]|0,0)|0;if((J<<24>>24|0)==69|(J<<24>>24|0)==48){Q=D+2|0;if((Q|0)==(m|0)){v=1440;break L1638}R=J;S=bZ[c[(c[w>>2]|0)+36>>2]&63](o,a[Q]|0,0)|0;T=Q}else{R=0;S=J;T=F}F=c[(c[z>>2]|0)+36>>2]|0;c[A>>2]=H;c[B>>2]=K;b4[F&7](p,e,q,r,h,j,k,S,R);c[t>>2]=c[C>>2];U=T+1|0}else if((v|0)==1474){v=0;F=c[N>>2]|0;if((F|0)==(c[O>>2]|0)){J=c[(c[H>>2]|0)+40>>2]|0;b_[J&255](H)}else{c[N>>2]=F+1}U=D+1|0}else if((v|0)==1447){while(1){v=0;F=M+1|0;if((F|0)==(m|0)){V=m;break}J=a[F]|0;if(J<<24>>24<=-1){V=F;break}if((b[L+(J<<24>>24<<1)>>1]&8192)==0){V=F;break}else{M=F;v=1447}}G=H;F=K;while(1){do{if((G|0)==0){W=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){W=G;break}if((b_[c[(c[G>>2]|0)+36>>2]&255](G)|0)!=-1){W=G;break}c[t>>2]=0;W=0}}while(0);J=(W|0)==0;do{if((F|0)==0){v=1460}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){if(J){X=F;break}else{U=V;break L1666}}if((b_[c[(c[F>>2]|0)+36>>2]&255](F)|0)==-1){c[s>>2]=0;v=1460;break}else{if(J^(F|0)==0){X=F;break}else{U=V;break L1666}}}}while(0);if((v|0)==1460){v=0;if(J){U=V;break L1666}else{X=0}}Q=W+12|0;Y=c[Q>>2]|0;Z=W+16|0;if((Y|0)==(c[Z>>2]|0)){_=b_[c[(c[W>>2]|0)+36>>2]&255](W)&255}else{_=a[Y]|0}if(_<<24>>24<=-1){U=V;break L1666}if((b[(c[x>>2]|0)+(_<<24>>24<<1)>>1]&8192)==0){U=V;break L1666}Y=c[Q>>2]|0;if((Y|0)==(c[Z>>2]|0)){Z=c[(c[W>>2]|0)+40>>2]|0;b_[Z&255](W);G=W;F=X;continue}else{c[Q>>2]=Y+1;G=W;F=X;continue}}}}while(0);if((U|0)==(m|0)){v=1479;break L1636}D=U;E=c[j>>2]|0}if((v|0)==1437){c[j>>2]=4;$=H;break}else if((v|0)==1440){c[j>>2]=4;$=H;break}else if((v|0)==1431){c[j>>2]=4;$=H;break}}}while(0);if((v|0)==1479){$=c[t>>2]|0}t=f|0;do{if(($|0)!=0){if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){break}if((b_[c[(c[$>>2]|0)+36>>2]&255]($)|0)!=-1){break}c[t>>2]=0}}while(0);$=c[t>>2]|0;t=($|0)==0;f=g|0;g=c[f>>2]|0;L1724:do{if((g|0)==0){v=1489}else{do{if((c[g+12>>2]|0)==(c[g+16>>2]|0)){if((b_[c[(c[g>>2]|0)+36>>2]&255](g)|0)!=-1){break}c[f>>2]=0;v=1489;break L1724}}while(0);if(!t){break}aa=d|0;c[aa>>2]=$;i=n;return}}while(0);do{if((v|0)==1489){if(t){break}aa=d|0;c[aa>>2]=$;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;aa=d|0;c[aa>>2]=$;i=n;return}function g5(a){a=a|0;le(a);return}function g6(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];g4(a,b,k,l,f,g,h,10784,10792);i=j;return}function g7(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+40|0;m=d+48|0;n=d+280|0;o=d+288|0;p=d+296|0;q=d+304|0;r=d+312|0;c[k>>2]=37;c[k+4>>2]=0;s=k;k=f+4|0;t=gL(s+1|0,1464,c[k>>2]|0)|0;u=d+8|0;c[l>>2]=u;if(a[20024]|0){v=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;v=w}if(t){x=gO(u,30,v,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{x=gO(u,30,v,s,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((x|0)>29){v=a[20024]|0;if(t){if(v){y=c[2504]|0}else{w=bI(1,1840,0)|0;c[2504]=w;a[20024]=1;y=w}z=gP(l,y,s,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(v){A=c[2504]|0}else{v=bI(1,1840,0)|0;c[2504]=v;a[20024]=1;A=v}z=gP(l,A,s,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}v=c[l>>2]|0;if((v|0)!=0){C=z;D=v;E=v;break}v=bi(4)|0;c[v>>2]=11256;aN(v|0,17016,28)}else{C=x;D=0;E=c[l>>2]|0}}while(0);x=E+C|0;z=c[k>>2]&176;do{if((z|0)==16){k=a[E]|0;if((k<<24>>24|0)==45|(k<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&k<<24>>24==48)){G=1526;break}k=a[E+1|0]|0;if(!((k<<24>>24|0)==120|(k<<24>>24|0)==88)){G=1526;break}F=E+2|0}else if((z|0)==32){F=x}else{G=1526}}while(0);if((G|0)==1526){F=E}do{if((E|0)==(u|0)){H=m|0;J=0;K=u}else{G=k4(C<<3)|0;z=G;if((G|0)!=0){H=z;J=z;K=c[l>>2]|0;break}z=bi(4)|0;c[z>>2]=11256;aN(z|0,17016,28)}}while(0);l=p|0;C=c[f+28>>2]|0;c[l>>2]=C;u=C+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;g$(K,F,x,H,n,o,p);p=c[l>>2]|0;l=p+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){bW[c[(c[p>>2]|0)+8>>2]&255](p|0)}p=e|0;c[r>>2]=c[p>>2];gZ(q,r,H,c[n>>2]|0,c[o>>2]|0,f,g);g=c[q>>2]|0;c[p>>2]=g;c[b>>2]=g;if((J|0)!=0){k5(J)}if((D|0)==0){i=d;return}k5(D);i=d;return}function g8(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=b_[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}g4(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function g9(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=l|0;n=c[f+28>>2]|0;c[m>>2]=n;f=n+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(l,19408)|0;l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=c[e>>2]|0;e=b+8|0;b=b_[c[c[e>>2]>>2]&255](e)|0;c[k>>2]=l;l=(f1(d,k,b,b+168|0,f,g,0)|0)-b|0;if((l|0)>=168){o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}c[h+24>>2]=((l|0)/12&-1|0)%7&-1;o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}function ha(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=l|0;n=c[f+28>>2]|0;c[m>>2]=n;f=n+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(l,19408)|0;l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=c[e>>2]|0;e=b+8|0;b=b_[c[(c[e>>2]|0)+4>>2]&255](e)|0;c[k>>2]=l;l=(f1(d,k,b,b+288|0,f,g,0)|0)-b|0;if((l|0)>=288){o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}c[h+16>>2]=((l|0)/12&-1|0)%12&-1;o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}function hb(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=k|0;m=c[f+28>>2]|0;c[l>>2]=m;f=m+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(k,19408)|0;k=c[l>>2]|0;l=k+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){bW[c[(c[k>>2]|0)+8>>2]&255](k|0)}c[j>>2]=c[e>>2];e=hg(d,j,g,f,4)|0;if((c[g>>2]&4|0)!=0){n=d|0;o=c[n>>2]|0;p=a|0;c[p>>2]=o;i=b;return}if((e|0)<69){q=e+2e3|0}else{q=(e-69|0)>>>0<31?e+1900|0:e}c[h+20>>2]=q-1900;n=d|0;o=c[n>>2]|0;p=a|0;c[p>>2]=o;i=b;return}function hc(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;l=i;i=i+312|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+104|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;J=l+176|0;K=l+184|0;L=l+192|0;M=l+200|0;N=l+208|0;O=l+216|0;P=l+224|0;Q=l+232|0;R=l+240|0;S=l+248|0;T=l+256|0;U=l+264|0;V=l+272|0;W=l+280|0;X=l+288|0;Y=l+296|0;Z=l+304|0;c[h>>2]=0;_=y|0;$=c[g+28>>2]|0;c[_>>2]=$;aa=$+4|0;I=c[aa>>2]|0,c[aa>>2]=I+1,I;aa=jp(y,19408)|0;y=c[_>>2]|0;_=y+4|0;if(((I=c[_>>2]|0,c[_>>2]=I+ -1,I)|0)==0){bW[c[(c[y>>2]|0)+8>>2]&255](y|0)}y=k<<24>>24;L1841:do{if((y|0)==110|(y|0)==116){c[J>>2]=c[f>>2];hd(0,e,J,h,aa)}else if((y|0)==99){k=d+8|0;_=b_[c[(c[k>>2]|0)+12>>2]&255](k)|0;k=e|0;c[A>>2]=c[k>>2];c[B>>2]=c[f>>2];$=_;ab=a[_]|0;if((ab&1)==0){ac=$+1|0;ad=$+1|0}else{$=c[_+8>>2]|0;ac=$;ad=$}$=ab&255;if(($&1|0)==0){ae=$>>>1}else{ae=c[_+4>>2]|0}g4(z,d,A,B,g,h,j,ad,ac+ae|0);c[k>>2]=c[z>>2]}else if((y|0)==73){k=j+8|0;c[t>>2]=c[f>>2];_=hg(e,t,h,aa,2)|0;$=c[h>>2]|0;do{if(($&4|0)==0){if((_-1|0)>>>0>=12){break}c[k>>2]=_;break L1841}}while(0);c[h>>2]=$|4}else if((y|0)==77){c[q>>2]=c[f>>2];_=hg(e,q,h,aa,2)|0;k=c[h>>2]|0;if((k&4|0)==0&(_|0)<60){c[j+4>>2]=_;break}else{c[h>>2]=k|4;break}}else if((y|0)==97|(y|0)==65){k=c[f>>2]|0;_=d+8|0;ab=b_[c[c[_>>2]>>2]&255](_)|0;c[x>>2]=k;k=(f1(e,x,ab,ab+168|0,aa,h,0)|0)-ab|0;if((k|0)>=168){break}c[j+24>>2]=((k|0)/12&-1|0)%7&-1}else if((y|0)==100|(y|0)==101){k=j+12|0;c[v>>2]=c[f>>2];ab=hg(e,v,h,aa,2)|0;_=c[h>>2]|0;do{if((_&4|0)==0){if((ab-1|0)>>>0>=31){break}c[k>>2]=ab;break L1841}}while(0);c[h>>2]=_|4}else if((y|0)==70){ab=e|0;c[G>>2]=c[ab>>2];c[H>>2]=c[f>>2];g4(F,d,G,H,g,h,j,10768,10776);c[ab>>2]=c[F>>2]}else if((y|0)==72){c[u>>2]=c[f>>2];ab=hg(e,u,h,aa,2)|0;k=c[h>>2]|0;if((k&4|0)==0&(ab|0)<24){c[j+8>>2]=ab;break}else{c[h>>2]=k|4;break}}else if((y|0)==98|(y|0)==66|(y|0)==104){k=c[f>>2]|0;ab=d+8|0;$=b_[c[(c[ab>>2]|0)+4>>2]&255](ab)|0;c[w>>2]=k;k=(f1(e,w,$,$+288|0,aa,h,0)|0)-$|0;if((k|0)>=288){break}c[j+16>>2]=((k|0)/12&-1|0)%12&-1}else if((y|0)==112){c[K>>2]=c[f>>2];he(d,j+8|0,e,K,h,aa)}else if((y|0)==114){k=e|0;c[M>>2]=c[k>>2];c[N>>2]=c[f>>2];g4(L,d,M,N,g,h,j,10752,10763);c[k>>2]=c[L>>2]}else if((y|0)==82){k=e|0;c[P>>2]=c[k>>2];c[Q>>2]=c[f>>2];g4(O,d,P,Q,g,h,j,10744,10749);c[k>>2]=c[O>>2]}else if((y|0)==83){c[p>>2]=c[f>>2];k=hg(e,p,h,aa,2)|0;$=c[h>>2]|0;if(($&4|0)==0&(k|0)<61){c[j>>2]=k;break}else{c[h>>2]=$|4;break}}else if((y|0)==120){$=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];bV[$&127](b,d,U,V,g,h,j);i=l;return}else if((y|0)==106){c[s>>2]=c[f>>2];$=hg(e,s,h,aa,3)|0;k=c[h>>2]|0;if((k&4|0)==0&($|0)<366){c[j+28>>2]=$;break}else{c[h>>2]=k|4;break}}else if((y|0)==109){c[r>>2]=c[f>>2];k=(hg(e,r,h,aa,2)|0)-1|0;$=c[h>>2]|0;if(($&4|0)==0&(k|0)<12){c[j+16>>2]=k;break}else{c[h>>2]=$|4;break}}else if((y|0)==68){$=e|0;c[D>>2]=c[$>>2];c[E>>2]=c[f>>2];g4(C,d,D,E,g,h,j,10776,10784);c[$>>2]=c[C>>2]}else if((y|0)==84){$=e|0;c[S>>2]=c[$>>2];c[T>>2]=c[f>>2];g4(R,d,S,T,g,h,j,10736,10744);c[$>>2]=c[R>>2]}else if((y|0)==119){c[o>>2]=c[f>>2];$=hg(e,o,h,aa,1)|0;k=c[h>>2]|0;if((k&4|0)==0&($|0)<7){c[j+24>>2]=$;break}else{c[h>>2]=k|4;break}}else if((y|0)==88){k=d+8|0;$=b_[c[(c[k>>2]|0)+24>>2]&255](k)|0;k=e|0;c[X>>2]=c[k>>2];c[Y>>2]=c[f>>2];ab=$;af=a[$]|0;if((af&1)==0){ag=ab+1|0;ah=ab+1|0}else{ab=c[$+8>>2]|0;ag=ab;ah=ab}ab=af&255;if((ab&1|0)==0){ai=ab>>>1}else{ai=c[$+4>>2]|0}g4(W,d,X,Y,g,h,j,ah,ag+ai|0);c[k>>2]=c[W>>2]}else if((y|0)==121){c[n>>2]=c[f>>2];k=hg(e,n,h,aa,4)|0;if((c[h>>2]&4|0)!=0){break}if((k|0)<69){aj=k+2e3|0}else{aj=(k-69|0)>>>0<31?k+1900|0:k}c[j+20>>2]=aj-1900}else if((y|0)==89){c[m>>2]=c[f>>2];k=hg(e,m,h,aa,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=k-1900}else if((y|0)==37){c[Z>>2]=c[f>>2];hf(0,e,Z,h,aa)}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}function hd(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L1920:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((b_[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L1929:do{if((l|0)==0){m=1677}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((b_[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[e>>2]=0;m=1677;break L1929}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L1920}}}while(0);if((m|0)==1677){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=b_[c[(c[l>>2]|0)+36>>2]&255](l)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;b_[u&255](r);continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((b_[c[(c[o>>2]|0)+36>>2]&255](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=1696}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((b_[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[e>>2]=0;m=1696;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==1696){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function he(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=b_[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=f1(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function hf(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((b_[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L2003:do{if((e|0)==0){k=1734}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((b_[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[j>>2]=0;k=1734;break L2003}}while(0);if(d){l=e;m=0}else{k=1735}}}while(0);if((k|0)==1734){if(d){k=1735}else{l=0;m=1}}if((k|0)==1735){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=b_[c[(c[d>>2]|0)+36>>2]&255](d)&255}else{n=a[e]|0}if(bZ[c[(c[g>>2]|0)+36>>2]&63](g,n,0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;b_[d&255](n)}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((b_[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=1754}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((b_[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[j>>2]=0;k=1754;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==1754){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function hg(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((b_[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L2057:do{if((e|0)==0){m=1774}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((b_[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[l>>2]=0;m=1774;break L2057}}while(0);if(d){n=e}else{m=1775}}}while(0);if((m|0)==1774){if(d){m=1775}else{n=0}}if((m|0)==1775){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=b_[c[(c[d>>2]|0)+36>>2]&255](d)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=bZ[c[(c[d>>2]|0)+36>>2]&63](g,p,0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;b_[u&255](r);v=q;w=h;x=n}else{c[s>>2]=t+1;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((b_[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((b_[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=1804;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=b_[c[(c[A>>2]|0)+36>>2]&255](A)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=1820;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=1821;break}s=(bZ[c[(c[d>>2]|0)+36>>2]&63](g,E,0)<<24>>24)+(y*10&-1)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;b_[G&255](r);v=s;w=q;x=B;continue}else{c[u>>2]=F+1;v=s;w=q;x=B;continue}}if((m|0)==1804){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L2114:do{if(D){m=1814}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[l>>2]=0;m=1814;break L2114}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==1814){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}else if((m|0)==1820){i=j;return o|0}else if((m|0)==1821){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function hh(a){a=a|0;return}function hi(a){a=a|0;return 2}function hj(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;l=i;i=i+32|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=m|0;r=c[f+28>>2]|0;c[q>>2]=r;s=r+4|0;I=c[s>>2]|0,c[s>>2]=I+1,I;s=jp(m,19400)|0;m=s;r=c[q>>2]|0;q=r+4|0;if(((I=c[q>>2]|0,c[q>>2]=I+ -1,I)|0)==0){bW[c[(c[r>>2]|0)+8>>2]&255](r|0)}c[g>>2]=0;r=d|0;L2137:do{if((j|0)==(k|0)){t=1895}else{q=e|0;u=s;v=s;w=s;x=b;y=o|0;z=p|0;A=n|0;B=j;C=0;L2139:while(1){D=C;while(1){if((D|0)!=0){t=1895;break L2137}E=c[r>>2]|0;do{if((E|0)==0){F=0}else{G=c[E+12>>2]|0;if((G|0)==(c[E+16>>2]|0)){H=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{H=c[G>>2]|0}if((H|0)!=-1){F=E;break}c[r>>2]=0;F=0}}while(0);E=(F|0)==0;G=c[q>>2]|0;do{if((G|0)==0){t=1845}else{J=c[G+12>>2]|0;if((J|0)==(c[G+16>>2]|0)){K=b_[c[(c[G>>2]|0)+36>>2]&255](G)|0}else{K=c[J>>2]|0}if((K|0)==-1){c[q>>2]=0;t=1845;break}else{if(E^(G|0)==0){L=G;break}else{t=1847;break L2139}}}}while(0);if((t|0)==1845){t=0;if(E){t=1847;break L2139}else{L=0}}if(bZ[c[(c[u>>2]|0)+52>>2]&63](m,c[B>>2]|0,0)<<24>>24==37){t=1852;break}if(bZ[c[(c[v>>2]|0)+12>>2]&63](m,8192,c[B>>2]|0)|0){M=B;t=1862;break}N=F+12|0;G=c[N>>2]|0;O=F+16|0;if((G|0)==(c[O>>2]|0)){P=b_[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{P=c[G>>2]|0}G=bY[c[(c[w>>2]|0)+28>>2]&31](m,P)|0;if((G|0)==(bY[c[(c[w>>2]|0)+28>>2]&31](m,c[B>>2]|0)|0)){t=1890;break}c[g>>2]=4;D=4}L2171:do{if((t|0)==1890){t=0;D=c[N>>2]|0;if((D|0)==(c[O>>2]|0)){G=c[(c[F>>2]|0)+40>>2]|0;b_[G&255](F)}else{c[N>>2]=D+4}Q=B+4|0}else if((t|0)==1852){t=0;D=B+4|0;if((D|0)==(k|0)){t=1853;break L2139}G=bZ[c[(c[u>>2]|0)+52>>2]&63](m,c[D>>2]|0,0)|0;if((G<<24>>24|0)==69|(G<<24>>24|0)==48){J=B+8|0;if((J|0)==(k|0)){t=1856;break L2139}R=G;S=bZ[c[(c[u>>2]|0)+52>>2]&63](m,c[J>>2]|0,0)|0;T=J}else{R=0;S=G;T=D}D=c[(c[x>>2]|0)+36>>2]|0;c[y>>2]=F;c[z>>2]=L;b4[D&7](n,b,o,p,f,g,h,S,R);c[r>>2]=c[A>>2];Q=T+4|0}else if((t|0)==1862){while(1){t=0;D=M+4|0;if((D|0)==(k|0)){U=k;break}if(bZ[c[(c[v>>2]|0)+12>>2]&63](m,8192,c[D>>2]|0)|0){M=D;t=1862}else{U=D;break}}E=F;D=L;while(1){do{if((E|0)==0){V=0}else{G=c[E+12>>2]|0;if((G|0)==(c[E+16>>2]|0)){W=b_[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{W=c[G>>2]|0}if((W|0)!=-1){V=E;break}c[r>>2]=0;V=0}}while(0);G=(V|0)==0;do{if((D|0)==0){t=1877}else{J=c[D+12>>2]|0;if((J|0)==(c[D+16>>2]|0)){X=b_[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{X=c[J>>2]|0}if((X|0)==-1){c[q>>2]=0;t=1877;break}else{if(G^(D|0)==0){Y=D;break}else{Q=U;break L2171}}}}while(0);if((t|0)==1877){t=0;if(G){Q=U;break L2171}else{Y=0}}J=V+12|0;Z=c[J>>2]|0;_=V+16|0;if((Z|0)==(c[_>>2]|0)){$=b_[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{$=c[Z>>2]|0}if(!(bZ[c[(c[v>>2]|0)+12>>2]&63](m,8192,$)|0)){Q=U;break L2171}Z=c[J>>2]|0;if((Z|0)==(c[_>>2]|0)){_=c[(c[V>>2]|0)+40>>2]|0;b_[_&255](V);E=V;D=Y;continue}else{c[J>>2]=Z+4;E=V;D=Y;continue}}}}while(0);if((Q|0)==(k|0)){t=1895;break L2137}B=Q;C=c[g>>2]|0}if((t|0)==1847){c[g>>2]=4;aa=F;break}else if((t|0)==1853){c[g>>2]=4;aa=F;break}else if((t|0)==1856){c[g>>2]=4;aa=F;break}}}while(0);if((t|0)==1895){aa=c[r>>2]|0}r=d|0;do{if((aa|0)!=0){d=c[aa+12>>2]|0;if((d|0)==(c[aa+16>>2]|0)){ab=b_[c[(c[aa>>2]|0)+36>>2]&255](aa)|0}else{ab=c[d>>2]|0}if((ab|0)!=-1){break}c[r>>2]=0}}while(0);ab=c[r>>2]|0;r=(ab|0)==0;aa=e|0;e=c[aa>>2]|0;do{if((e|0)==0){t=1908}else{d=c[e+12>>2]|0;if((d|0)==(c[e+16>>2]|0)){ac=b_[c[(c[e>>2]|0)+36>>2]&255](e)|0}else{ac=c[d>>2]|0}if((ac|0)==-1){c[aa>>2]=0;t=1908;break}if(!(r^(e|0)==0)){break}ad=a|0;c[ad>>2]=ab;i=l;return}}while(0);do{if((t|0)==1908){if(r){break}ad=a|0;c[ad>>2]=ab;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ad=a|0;c[ad>>2]=ab;i=l;return}function hk(a){a=a|0;le(a);return}function hl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];hj(a,b,k,l,f,g,h,10704,10736);i=j;return}function hm(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=b_[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}hj(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function hn(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=l|0;n=c[f+28>>2]|0;c[m>>2]=n;f=n+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(l,19400)|0;l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=c[e>>2]|0;e=b+8|0;b=b_[c[c[e>>2]>>2]&255](e)|0;c[k>>2]=l;l=(gp(d,k,b,b+168|0,f,g,0)|0)-b|0;if((l|0)>=168){o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}c[h+24>>2]=((l|0)/12&-1|0)%7&-1;o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}function ho(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=l|0;n=c[f+28>>2]|0;c[m>>2]=n;f=n+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(l,19400)|0;l=c[m>>2]|0;m=l+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){bW[c[(c[l>>2]|0)+8>>2]&255](l|0)}l=c[e>>2]|0;e=b+8|0;b=b_[c[(c[e>>2]|0)+4>>2]&255](e)|0;c[k>>2]=l;l=(gp(d,k,b,b+288|0,f,g,0)|0)-b|0;if((l|0)>=288){o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}c[h+16>>2]=((l|0)/12&-1|0)%12&-1;o=d|0;p=c[o>>2]|0;q=a|0;c[q>>2]=p;i=j;return}function hp(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=k|0;m=c[f+28>>2]|0;c[l>>2]=m;f=m+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;f=jp(k,19400)|0;k=c[l>>2]|0;l=k+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){bW[c[(c[k>>2]|0)+8>>2]&255](k|0)}c[j>>2]=c[e>>2];e=hu(d,j,g,f,4)|0;if((c[g>>2]&4|0)!=0){n=d|0;o=c[n>>2]|0;p=a|0;c[p>>2]=o;i=b;return}if((e|0)<69){q=e+2e3|0}else{q=(e-69|0)>>>0<31?e+1900|0:e}c[h+20>>2]=q-1900;n=d|0;o=c[n>>2]|0;p=a|0;c[p>>2]=o;i=b;return}function hq(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;l=i;i=i+312|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+104|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;J=l+176|0;K=l+184|0;L=l+192|0;M=l+200|0;N=l+208|0;O=l+216|0;P=l+224|0;Q=l+232|0;R=l+240|0;S=l+248|0;T=l+256|0;U=l+264|0;V=l+272|0;W=l+280|0;X=l+288|0;Y=l+296|0;Z=l+304|0;c[h>>2]=0;_=y|0;$=c[g+28>>2]|0;c[_>>2]=$;aa=$+4|0;I=c[aa>>2]|0,c[aa>>2]=I+1,I;aa=jp(y,19400)|0;y=c[_>>2]|0;_=y+4|0;if(((I=c[_>>2]|0,c[_>>2]=I+ -1,I)|0)==0){bW[c[(c[y>>2]|0)+8>>2]&255](y|0)}y=k<<24>>24;L2296:do{if((y|0)==99){k=d+8|0;_=b_[c[(c[k>>2]|0)+12>>2]&255](k)|0;k=e|0;c[A>>2]=c[k>>2];c[B>>2]=c[f>>2];$=a[_]|0;if(($&1)==0){ab=_+4|0;ac=_+4|0}else{ad=c[_+8>>2]|0;ab=ad;ac=ad}ad=$&255;if((ad&1|0)==0){ae=ad>>>1}else{ae=c[_+4>>2]|0}hj(z,d,A,B,g,h,j,ac,ab+(ae<<2)|0);c[k>>2]=c[z>>2]}else if((y|0)==109){c[r>>2]=c[f>>2];k=(hu(e,r,h,aa,2)|0)-1|0;_=c[h>>2]|0;if((_&4|0)==0&(k|0)<12){c[j+16>>2]=k;break}else{c[h>>2]=_|4;break}}else if((y|0)==97|(y|0)==65){_=c[f>>2]|0;k=d+8|0;ad=b_[c[c[k>>2]>>2]&255](k)|0;c[x>>2]=_;_=(gp(e,x,ad,ad+168|0,aa,h,0)|0)-ad|0;if((_|0)>=168){break}c[j+24>>2]=((_|0)/12&-1|0)%7&-1}else if((y|0)==70){_=e|0;c[G>>2]=c[_>>2];c[H>>2]=c[f>>2];hj(F,d,G,H,g,h,j,10536,10568);c[_>>2]=c[F>>2]}else if((y|0)==72){c[u>>2]=c[f>>2];_=hu(e,u,h,aa,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(_|0)<24){c[j+8>>2]=_;break}else{c[h>>2]=ad|4;break}}else if((y|0)==98|(y|0)==66|(y|0)==104){ad=c[f>>2]|0;_=d+8|0;k=b_[c[(c[_>>2]|0)+4>>2]&255](_)|0;c[w>>2]=ad;ad=(gp(e,w,k,k+288|0,aa,h,0)|0)-k|0;if((ad|0)>=288){break}c[j+16>>2]=((ad|0)/12&-1|0)%12&-1}else if((y|0)==114){ad=e|0;c[M>>2]=c[ad>>2];c[N>>2]=c[f>>2];hj(L,d,M,N,g,h,j,10624,10668);c[ad>>2]=c[L>>2]}else if((y|0)==82){ad=e|0;c[P>>2]=c[ad>>2];c[Q>>2]=c[f>>2];hj(O,d,P,Q,g,h,j,10600,10620);c[ad>>2]=c[O>>2]}else if((y|0)==83){c[p>>2]=c[f>>2];ad=hu(e,p,h,aa,2)|0;k=c[h>>2]|0;if((k&4|0)==0&(ad|0)<61){c[j>>2]=ad;break}else{c[h>>2]=k|4;break}}else if((y|0)==100|(y|0)==101){k=j+12|0;c[v>>2]=c[f>>2];ad=hu(e,v,h,aa,2)|0;_=c[h>>2]|0;do{if((_&4|0)==0){if((ad-1|0)>>>0>=31){break}c[k>>2]=ad;break L2296}}while(0);c[h>>2]=_|4}else if((y|0)==106){c[s>>2]=c[f>>2];ad=hu(e,s,h,aa,3)|0;k=c[h>>2]|0;if((k&4|0)==0&(ad|0)<366){c[j+28>>2]=ad;break}else{c[h>>2]=k|4;break}}else if((y|0)==73){k=j+8|0;c[t>>2]=c[f>>2];ad=hu(e,t,h,aa,2)|0;$=c[h>>2]|0;do{if(($&4|0)==0){if((ad-1|0)>>>0>=12){break}c[k>>2]=ad;break L2296}}while(0);c[h>>2]=$|4}else if((y|0)==77){c[q>>2]=c[f>>2];ad=hu(e,q,h,aa,2)|0;k=c[h>>2]|0;if((k&4|0)==0&(ad|0)<60){c[j+4>>2]=ad;break}else{c[h>>2]=k|4;break}}else if((y|0)==68){k=e|0;c[D>>2]=c[k>>2];c[E>>2]=c[f>>2];hj(C,d,D,E,g,h,j,10672,10704);c[k>>2]=c[C>>2]}else if((y|0)==120){k=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];bV[k&127](b,d,U,V,g,h,j);i=l;return}else if((y|0)==88){k=d+8|0;ad=b_[c[(c[k>>2]|0)+24>>2]&255](k)|0;k=e|0;c[X>>2]=c[k>>2];c[Y>>2]=c[f>>2];_=a[ad]|0;if((_&1)==0){af=ad+4|0;ag=ad+4|0}else{ah=c[ad+8>>2]|0;af=ah;ag=ah}ah=_&255;if((ah&1|0)==0){ai=ah>>>1}else{ai=c[ad+4>>2]|0}hj(W,d,X,Y,g,h,j,ag,af+(ai<<2)|0);c[k>>2]=c[W>>2]}else if((y|0)==121){c[n>>2]=c[f>>2];k=hu(e,n,h,aa,4)|0;if((c[h>>2]&4|0)!=0){break}if((k|0)<69){aj=k+2e3|0}else{aj=(k-69|0)>>>0<31?k+1900|0:k}c[j+20>>2]=aj-1900}else if((y|0)==84){k=e|0;c[S>>2]=c[k>>2];c[T>>2]=c[f>>2];hj(R,d,S,T,g,h,j,10568,10600);c[k>>2]=c[R>>2]}else if((y|0)==119){c[o>>2]=c[f>>2];k=hu(e,o,h,aa,1)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(k|0)<7){c[j+24>>2]=k;break}else{c[h>>2]=ad|4;break}}else if((y|0)==89){c[m>>2]=c[f>>2];ad=hu(e,m,h,aa,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ad-1900}else if((y|0)==37){c[Z>>2]=c[f>>2];ht(0,e,Z,h,aa)}else if((y|0)==110|(y|0)==116){c[J>>2]=c[f>>2];hr(0,e,J,h,aa)}else if((y|0)==112){c[K>>2]=c[f>>2];hs(d,j+8|0,e,K,h,aa)}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}function hr(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L2375:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=2046}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=2046;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L2375}}}}while(0);if((m|0)==2046){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{s=c[k>>2]|0}if(!(bZ[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;b_[u&255](k);continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=b_[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=2068}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=b_[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=2068;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==2068){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function hs(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=b_[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=gp(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function ht(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=b_[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=2108}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=b_[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=2108;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=2110;break}}}}while(0);if((l|0)==2108){if(h){l=2110}else{n=0;o=1}}if((l|0)==2110){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=b_[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{p=c[d>>2]|0}if(bZ[c[(c[f>>2]|0)+52>>2]&63](f,p,0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;b_[h&255](p)}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=b_[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=2132}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=b_[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=2132;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==2132){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function hu(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=b_[c[(c[a>>2]|0)+36>>2]&255](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=2154}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=b_[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=2154;break}else{if(j^(b|0)==0){o=b;break}else{m=2156;break}}}}while(0);if((m|0)==2154){if(j){m=2156}else{o=0}}if((m|0)==2156){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=b_[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{q=c[b>>2]|0}b=e;if(!(bZ[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=bZ[c[(c[j>>2]|0)+52>>2]&63](e,q,0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;b_[r&255](q);s=n;t=f;u=o}else{c[a>>2]=k+4;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=b_[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=b_[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=b_[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{D=c[f>>2]|0}if(!(bZ[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=2207;break}f=(bZ[c[(c[j>>2]|0)+52>>2]&63](e,D,0)<<24>>24)+(v*10&-1)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;b_[q&255](n);s=f;t=o;u=z;continue}else{c[k>>2]=a+4;s=f;t=o;u=z;continue}}if((m|0)==2207){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=b_[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=2200}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=b_[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=2200;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==2200){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function hv(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2];f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=bS(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=bY[c[(c[s>>2]|0)+52>>2]&31](s,m&255)|0}else{c[l>>2]=j+1;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function hw(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2];e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400;il(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=bY[c[(c[o>>2]|0)+52>>2]&31](o,l)|0}else{c[k>>2]=d+4;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function hx(a){a=a|0;var b=0,d=0;b=a;d=c[a+8>>2]|0;if((d|0)==0){le(b);return}bg(d|0);le(b);return}function hy(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)==0){return}bg(b|0);return}function hz(a){a=a|0;var b=0,d=0;b=a;d=c[a+8>>2]|0;if((d|0)==0){le(b);return}bg(d|0);le(b);return}function hA(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)==0){return}bg(b|0);return}function hB(a){a=a|0;return}function hC(a){a=a|0;return 127}function hD(a){a=a|0;return 127}function hE(a){a=a|0;return 0}function hF(a){a=a|0;return}function hG(a){a=a|0;return 127}function hH(a){a=a|0;return 127}function hI(a){a=a|0;return 0}function hJ(a){a=a|0;return}function hK(a){a=a|0;return 2147483647}function hL(a){a=a|0;return 2147483647}function hM(a){a=a|0;return 0}function hN(a){a=a|0;return}function hO(a){a=a|0;return 2147483647}function hP(a){a=a|0;return 2147483647}function hQ(a){a=a|0;return 0}function hR(a){a=a|0;return}function hS(a){a=a|0;return}function hT(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hU(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hV(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hW(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hX(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hY(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hZ(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function h_(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function h$(b,c){b=b|0;c=c|0;c=b;a[b]=2;a[c+1|0]=45;a[c+2|0]=0;return}function h0(b,c){b=b|0;c=c|0;c=b;a[b]=2;a[c+1|0]=45;a[c+2|0]=0;return}function h1(b,d){b=b|0;d=d|0;a[b]=2;d=b+4|0;c[d>>2]=45;c[d+4>>2]=0;return}function h2(b,d){b=b|0;d=d|0;a[b]=2;d=b+4|0;c[d>>2]=45;c[d+4>>2]=0;return}function h3(a){a=a|0;le(a);return}function h4(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function h5(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function h6(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function h7(a){a=a|0;le(a);return}function h8(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function h9(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ia(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ib(a){a=a|0;le(a);return}function ic(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function id(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ie(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ig(a){a=a|0;le(a);return}function ih(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ii(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ij(a,b){a=a|0;b=b|0;ln(a|0,0,12);return}function ik(a){a=a|0;le(a);return}function il(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;bS(n|0,100,o|0,f|0,c[g>>2]|0);c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=bN(c[g>>2]|0)|0;g=kN(d,m,n,l)|0;if((f|0)!=0){bN(f|0)}if((g|0)==-1){is(1112)}else{c[e>>2]=d+(g<<2);i=j;return}}function im(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;d=i;i=i+264|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+104|0;n=d+112|0;o=d+120|0;p=d+128|0;q=d+136|0;r=d+144|0;s=m|0;c[s>>2]=l;t=m+4|0;c[t>>2]=154;u=o|0;v=c[h+28>>2]|0;c[u>>2]=v;w=v+4|0;I=c[w>>2]|0,c[w>>2]=I+1,I;w=jp(o,19408)|0;v=w;a[p]=0;x=f|0;c[q>>2]=c[x>>2];do{if(io(e,q,g,o,c[h+4>>2]|0,j,p,v,m,n,l+100|0)|0){f=r|0;y=c[(c[w>>2]|0)+32>>2]|0;b7[y&15](v,10520,10530,f);y=d+160|0;z=c[n>>2]|0;A=c[s>>2]|0;C=z-A|0;do{if((C|0)>98){D=k4(C+2|0)|0;if((D|0)!=0){E=D;F=D;break}D=bi(4)|0;c[D>>2]=11256;aN(D|0,17016,28)}else{E=y;F=0}}while(0);if((a[p]&1)==0){G=E}else{a[E]=45;G=E+1|0}if(A>>>0<z>>>0){C=r+10|0;D=r;H=G;J=A;while(1){K=f;while(1){if((K|0)==(C|0)){L=C;break}if((a[K]|0)==(a[J]|0)){L=K;break}else{K=K+1|0}}a[H]=a[10520+(L-D|0)|0]|0;K=J+1|0;M=H+1|0;if(K>>>0<(c[n>>2]|0)>>>0){H=M;J=K}else{N=M;break}}}else{N=G}a[N]=0;if((aJ(y|0,2136,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)!=1){is(2032)}if((F|0)==0){break}k5(F)}}while(0);F=e|0;e=c[F>>2]|0;do{if((e|0)==0){O=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){O=e;break}if((b_[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){O=e;break}c[F>>2]=0;O=0}}while(0);F=(O|0)==0;e=c[x>>2]|0;do{if((e|0)==0){P=2346}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){if(F){break}else{P=2348;break}}if((b_[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[x>>2]=0;P=2346;break}else{if(F^(e|0)==0){break}else{P=2348;break}}}}while(0);if((P|0)==2346){if(F){P=2348}}if((P|0)==2348){c[j>>2]=c[j>>2]|2}c[b>>2]=O;O=c[u>>2]|0;u=O+4|0;if(((I=c[u>>2]|0,c[u>>2]=I+ -1,I)|0)==0){bW[c[(c[O>>2]|0)+8>>2]&255](O|0)}O=c[s>>2]|0;c[s>>2]=0;if((O|0)==0){i=d;return}bW[c[t>>2]&255](O);i=d;return}function io(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0;q=i;i=i+472|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2];r=q|0;s=q+8|0;t=q+408|0;u=q+416|0;v=q+424|0;w=q+432|0;x=q+440|0;y=q+448|0;z=q+456|0;A=z;B=i;i=i+12|0;i=i+7>>3<<3;C=i;i=i+12|0;i=i+7>>3<<3;D=i;i=i+12|0;i=i+7>>3<<3;E=i;i=i+12|0;i=i+7>>3<<3;F=i;i=i+4|0;i=i+7>>3<<3;G=i;i=i+4|0;i=i+7>>3<<3;c[r>>2]=p;p=s|0;H=t|0;c[H>>2]=p;I=t+4|0;c[I>>2]=154;c[u>>2]=p;c[v>>2]=s+400;ln(A|0,0,12);s=B;J=C;K=D;L=E;ln(s|0,0,12);ln(J|0,0,12);ln(K|0,0,12);ln(L|0,0,12);iu(g,h,w,x,y,z,B,C,D,F);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=f|0;f=m+8|0;m=D+1|0;M=D+4|0;N=D+8|0;O=C+1|0;P=C+4|0;Q=C+8|0;R=(j&512|0)!=0;j=B+1|0;S=B+4|0;T=B+8|0;B=E+1|0;U=E+4|0;V=E+8|0;W=w+3|0;X=z+4|0;Y=0;Z=0;_=p;L2780:while(1){p=c[g>>2]|0;do{if((p|0)==0){$=0}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){$=p;break}if((b_[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[g>>2]=0;$=0;break}else{$=c[g>>2]|0;break}}}while(0);p=($|0)==0;aa=c[e>>2]|0;do{if((aa|0)==0){ab=2377}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){if(p){ac=aa;break}else{ad=Y;ae=_;af=aa;ab=2617;break L2780}}if((b_[c[(c[aa>>2]|0)+36>>2]&255](aa)|0)==-1){c[e>>2]=0;ab=2377;break}else{if(p^(aa|0)==0){ac=aa;break}else{ad=Y;ae=_;af=aa;ab=2617;break L2780}}}}while(0);if((ab|0)==2377){ab=0;if(p){ad=Y;ae=_;af=0;ab=2617;break}else{ac=0}}aa=a[w+Z|0]|0;L2802:do{if((aa|0)==1){if((Z|0)==3){ad=Y;ae=_;af=ac;ab=2617;break L2780}ag=c[g>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){ai=b_[c[(c[ag>>2]|0)+36>>2]&255](ag)&255}else{ai=a[ah]|0}if(ai<<24>>24<=-1){ab=2413;break L2780}if((b[(c[f>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){ab=2413;break L2780}ah=c[g>>2]|0;ag=ah+12|0;aj=c[ag>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=b_[c[(c[ah>>2]|0)+40>>2]&255](ah)&255}else{c[ag>>2]=aj+1;ak=a[aj]|0}eI(E,ak);ab=2414}else if((aa|0)==0){ab=2414}else if((aa|0)==3){aj=a[J]|0;ag=aj&255;ah=(ag&1|0)==0;al=a[K]|0;am=al&255;an=(am&1|0)==0;if(((ah?ag>>>1:c[P>>2]|0)|0)==(-(an?am>>>1:c[M>>2]|0)|0)){ao=Y;ap=_;aq=ac;break}do{if(((ah?ag>>>1:c[P>>2]|0)|0)!=0){if(((an?am>>>1:c[M>>2]|0)|0)==0){break}ar=c[g>>2]|0;as=c[ar+12>>2]|0;if((as|0)==(c[ar+16>>2]|0)){at=b_[c[(c[ar>>2]|0)+36>>2]&255](ar)&255;au=at;av=a[J]|0}else{au=a[as]|0;av=aj}as=c[g>>2]|0;at=as+12|0;ar=c[at>>2]|0;aw=(ar|0)==(c[as+16>>2]|0);if(au<<24>>24==(a[(av&1)==0?O:c[Q>>2]|0]|0)){if(aw){ax=c[(c[as>>2]|0)+40>>2]|0;b_[ax&255](as)}else{c[at>>2]=ar+1}at=d[J]|0;ao=((at&1|0)==0?at>>>1:c[P>>2]|0)>>>0>1?C:Y;ap=_;aq=ac;break L2802}if(aw){ay=b_[c[(c[as>>2]|0)+36>>2]&255](as)&255}else{ay=a[ar]|0}if(ay<<24>>24!=(a[(a[K]&1)==0?m:c[N>>2]|0]|0)){ab=2481;break L2780}ar=c[g>>2]|0;as=ar+12|0;aw=c[as>>2]|0;if((aw|0)==(c[ar+16>>2]|0)){at=c[(c[ar>>2]|0)+40>>2]|0;b_[at&255](ar)}else{c[as>>2]=aw+1}a[l]=1;aw=d[K]|0;ao=((aw&1|0)==0?aw>>>1:c[M>>2]|0)>>>0>1?D:Y;ap=_;aq=ac;break L2802}}while(0);am=c[g>>2]|0;an=c[am+12>>2]|0;aw=(an|0)==(c[am+16>>2]|0);if(((ah?ag>>>1:c[P>>2]|0)|0)==0){if(aw){as=b_[c[(c[am>>2]|0)+36>>2]&255](am)&255;az=as;aA=a[K]|0}else{az=a[an]|0;aA=al}if(az<<24>>24!=(a[(aA&1)==0?m:c[N>>2]|0]|0)){ao=Y;ap=_;aq=ac;break}as=c[g>>2]|0;ar=as+12|0;at=c[ar>>2]|0;if((at|0)==(c[as+16>>2]|0)){ax=c[(c[as>>2]|0)+40>>2]|0;b_[ax&255](as)}else{c[ar>>2]=at+1}a[l]=1;at=d[K]|0;ao=((at&1|0)==0?at>>>1:c[M>>2]|0)>>>0>1?D:Y;ap=_;aq=ac;break}if(aw){aw=b_[c[(c[am>>2]|0)+36>>2]&255](am)&255;aB=aw;aC=a[J]|0}else{aB=a[an]|0;aC=aj}if(aB<<24>>24!=(a[(aC&1)==0?O:c[Q>>2]|0]|0)){a[l]=1;ao=Y;ap=_;aq=ac;break}an=c[g>>2]|0;aw=an+12|0;am=c[aw>>2]|0;if((am|0)==(c[an+16>>2]|0)){at=c[(c[an>>2]|0)+40>>2]|0;b_[at&255](an)}else{c[aw>>2]=am+1}am=d[J]|0;ao=((am&1|0)==0?am>>>1:c[P>>2]|0)>>>0>1?C:Y;ap=_;aq=ac}else if((aa|0)==2){if(!((Y|0)!=0|Z>>>0<2)){if((Z|0)==2){aD=(a[W]|0)!=0}else{aD=0}if(!(R|aD)){ao=0;ap=_;aq=ac;break}}am=a[s]|0;aw=(am&1)==0;an=aw?j:c[T>>2]|0;L2877:do{if((Z|0)==0){aE=an;aF=am;aG=ac}else{if((d[w+(Z-1|0)|0]|0)>=2){aE=an;aF=am;aG=ac;break}at=am&255;ar=(at&1|0)==0;as=at>>>1;at=c[S>>2]|0;ax=c[T>>2]|0;aH=an;while(1){if((aH|0)==((aw?j:ax)+(ar?as:at)|0)){break}aI=a[aH]|0;if(aI<<24>>24<=-1){break}if((b[(c[f>>2]|0)+(aI<<24>>24<<1)>>1]&8192)==0){break}else{aH=aH+1|0}}at=aH-(aw?j:ax)|0;as=a[L]|0;ar=as&255;aI=(ar&1|0)==0;L2885:do{if(at>>>0<=(aI?ar>>>1:c[U>>2]|0)>>>0){aJ=(as&1)==0;aK=(aJ?B:c[V>>2]|0)+((aI?ar>>>1:c[U>>2]|0)-at|0)|0;aL=(aJ?B:c[V>>2]|0)+(aI?ar>>>1:c[U>>2]|0)|0;if((aK|0)==(aL|0)){aE=aH;aF=am;aG=ac;break L2877}else{aM=aw?j:ax;aN=aK}while(1){if((a[aN]|0)!=(a[aM]|0)){break L2885}aK=aN+1|0;if((aK|0)==(aL|0)){aE=aH;aF=am;aG=ac;break L2877}else{aM=aM+1|0;aN=aK}}}}while(0);aE=aw?j:ax;aF=am;aG=ac}}while(0);L2891:while(1){am=aF&255;if((aE|0)==(((aF&1)==0?j:c[T>>2]|0)+((am&1|0)==0?am>>>1:c[S>>2]|0)|0)){aO=aG;break}am=c[g>>2]|0;do{if((am|0)==0){aP=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aP=am;break}if((b_[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;aP=0;break}else{aP=c[g>>2]|0;break}}}while(0);am=(aP|0)==0;do{if((aG|0)==0){ab=2510}else{if((c[aG+12>>2]|0)!=(c[aG+16>>2]|0)){if(am){aQ=aG;break}else{aO=aG;break L2891}}if((b_[c[(c[aG>>2]|0)+36>>2]&255](aG)|0)==-1){c[e>>2]=0;ab=2510;break}else{if(am^(aG|0)==0){aQ=aG;break}else{aO=aG;break L2891}}}}while(0);if((ab|0)==2510){ab=0;if(am){aO=0;break}else{aQ=0}}ax=c[g>>2]|0;aw=c[ax+12>>2]|0;if((aw|0)==(c[ax+16>>2]|0)){aR=b_[c[(c[ax>>2]|0)+36>>2]&255](ax)&255}else{aR=a[aw]|0}if(aR<<24>>24!=(a[aE]|0)){aO=aQ;break}aw=c[g>>2]|0;ax=aw+12|0;an=c[ax>>2]|0;if((an|0)==(c[aw+16>>2]|0)){aj=c[(c[aw>>2]|0)+40>>2]|0;b_[aj&255](aw)}else{c[ax>>2]=an+1}aE=aE+1|0;aF=a[s]|0;aG=aQ}if(!R){ao=Y;ap=_;aq=aO;break}an=a[s]|0;ax=an&255;if((aE|0)==(((an&1)==0?j:c[T>>2]|0)+((ax&1|0)==0?ax>>>1:c[S>>2]|0)|0)){ao=Y;ap=_;aq=aO}else{ab=2523;break L2780}}else if((aa|0)==4){ax=a[y]|0;an=0;aw=ac;aj=_;L2927:while(1){al=c[g>>2]|0;do{if((al|0)==0){aS=0}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){aS=al;break}if((b_[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[g>>2]=0;aS=0;break}else{aS=c[g>>2]|0;break}}}while(0);al=(aS|0)==0;do{if((aw|0)==0){ab=2536}else{if((c[aw+12>>2]|0)!=(c[aw+16>>2]|0)){if(al){aT=aw;aU=0;break}else{aV=aw;aW=0;break L2927}}if((b_[c[(c[aw>>2]|0)+36>>2]&255](aw)|0)==-1){c[e>>2]=0;ab=2536;break}else{am=(aw|0)==0;if(al^am){aT=aw;aU=am;break}else{aV=aw;aW=am;break L2927}}}}while(0);if((ab|0)==2536){ab=0;if(al){aV=0;aW=1;break}else{aT=0;aU=1}}am=c[g>>2]|0;ag=c[am+12>>2]|0;if((ag|0)==(c[am+16>>2]|0)){aX=b_[c[(c[am>>2]|0)+36>>2]&255](am)&255}else{aX=a[ag]|0}do{if(aX<<24>>24>-1){if((b[(c[f>>2]|0)+(aX<<24>>24<<1)>>1]&2048)==0){ab=2548;break}ag=c[o>>2]|0;if((ag|0)==(c[r>>2]|0)){iv(n,o,r);aY=c[o>>2]|0}else{aY=ag}c[o>>2]=aY+1;a[aY]=aX;aZ=an+1|0;a_=aj}else{ab=2548}}while(0);if((ab|0)==2548){ab=0;al=d[A]|0;if(!((an|0)!=0&(((al&1|0)==0?al>>>1:c[X>>2]|0)|0)!=0&aX<<24>>24==ax<<24>>24)){aV=aT;aW=aU;break}if((aj|0)==(c[v>>2]|0)){iw(t,u,v);a$=c[u>>2]|0}else{a$=aj}al=a$+4|0;c[u>>2]=al;c[a$>>2]=an;aZ=0;a_=al}al=c[g>>2]|0;ag=al+12|0;am=c[ag>>2]|0;if((am|0)==(c[al+16>>2]|0)){ah=c[(c[al>>2]|0)+40>>2]|0;b_[ah&255](al);an=aZ;aw=aT;aj=a_;continue}else{c[ag>>2]=am+1;an=aZ;aw=aT;aj=a_;continue}}if((c[H>>2]|0)==(aj|0)|(an|0)==0){a0=aj}else{if((aj|0)==(c[v>>2]|0)){iw(t,u,v)}aw=c[u>>2]|0;ax=aw+4|0;c[u>>2]=ax;c[aw>>2]=an;a0=ax}ax=c[F>>2]|0;if((ax|0)>0){aw=c[g>>2]|0;do{if((aw|0)==0){a1=0}else{if((c[aw+12>>2]|0)!=(c[aw+16>>2]|0)){a1=aw;break}if((b_[c[(c[aw>>2]|0)+36>>2]&255](aw)|0)==-1){c[g>>2]=0;a1=0;break}else{a1=c[g>>2]|0;break}}}while(0);aw=(a1|0)==0;L2989:do{if(aW){ab=2572}else{do{if((c[aV+12>>2]|0)==(c[aV+16>>2]|0)){if((b_[c[(c[aV>>2]|0)+36>>2]&255](aV)|0)!=-1){break}c[e>>2]=0;ab=2572;break L2989}}while(0);if(aw^(aV|0)==0){a2=aV}else{ab=2579;break L2780}}}while(0);if((ab|0)==2572){ab=0;if(aw){ab=2579;break L2780}else{a2=0}}an=c[g>>2]|0;aj=c[an+12>>2]|0;if((aj|0)==(c[an+16>>2]|0)){a3=b_[c[(c[an>>2]|0)+36>>2]&255](an)&255}else{a3=a[aj]|0}if(a3<<24>>24!=(a[x]|0)){ab=2579;break L2780}aj=c[g>>2]|0;an=aj+12|0;am=c[an>>2]|0;if((am|0)==(c[aj+16>>2]|0)){ag=c[(c[aj>>2]|0)+40>>2]|0;b_[ag&255](aj);a4=a2;a5=ax}else{c[an>>2]=am+1;a4=a2;a5=ax}while(1){am=c[g>>2]|0;do{if((am|0)==0){a6=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){a6=am;break}if((b_[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;a6=0;break}else{a6=c[g>>2]|0;break}}}while(0);am=(a6|0)==0;do{if((a4|0)==0){ab=2595}else{if((c[a4+12>>2]|0)!=(c[a4+16>>2]|0)){if(am){a7=a4;break}else{ab=2603;break L2780}}if((b_[c[(c[a4>>2]|0)+36>>2]&255](a4)|0)==-1){c[e>>2]=0;ab=2595;break}else{if(am^(a4|0)==0){a7=a4;break}else{ab=2603;break L2780}}}}while(0);if((ab|0)==2595){ab=0;if(am){ab=2603;break L2780}else{a7=0}}an=c[g>>2]|0;aj=c[an+12>>2]|0;if((aj|0)==(c[an+16>>2]|0)){a8=b_[c[(c[an>>2]|0)+36>>2]&255](an)&255}else{a8=a[aj]|0}if(a8<<24>>24<=-1){ab=2603;break L2780}if((b[(c[f>>2]|0)+(a8<<24>>24<<1)>>1]&2048)==0){ab=2603;break L2780}if((c[o>>2]|0)==(c[r>>2]|0)){iv(n,o,r)}aj=c[g>>2]|0;an=c[aj+12>>2]|0;if((an|0)==(c[aj+16>>2]|0)){a9=b_[c[(c[aj>>2]|0)+36>>2]&255](aj)&255}else{a9=a[an]|0}an=c[o>>2]|0;c[o>>2]=an+1;a[an]=a9;an=a5-1|0;c[F>>2]=an;aj=c[g>>2]|0;ag=aj+12|0;al=c[ag>>2]|0;if((al|0)==(c[aj+16>>2]|0)){ah=c[(c[aj>>2]|0)+40>>2]|0;b_[ah&255](aj)}else{c[ag>>2]=al+1}if((an|0)>0){a4=a7;a5=an}else{ba=a7;break}}}else{ba=aV}if((c[o>>2]|0)==(c[h>>2]|0)){ab=2615;break L2780}else{ao=Y;ap=a0;aq=ba}}else{ao=Y;ap=_;aq=ac}}while(0);L3050:do{if((ab|0)==2414){ab=0;if((Z|0)==3){ad=Y;ae=_;af=ac;ab=2617;break L2780}else{bb=ac}while(1){aa=c[g>>2]|0;do{if((aa|0)==0){bc=0}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){bc=aa;break}if((b_[c[(c[aa>>2]|0)+36>>2]&255](aa)|0)==-1){c[g>>2]=0;bc=0;break}else{bc=c[g>>2]|0;break}}}while(0);aa=(bc|0)==0;do{if((bb|0)==0){ab=2427}else{if((c[bb+12>>2]|0)!=(c[bb+16>>2]|0)){if(aa){bd=bb;break}else{ao=Y;ap=_;aq=bb;break L3050}}if((b_[c[(c[bb>>2]|0)+36>>2]&255](bb)|0)==-1){c[e>>2]=0;ab=2427;break}else{if(aa^(bb|0)==0){bd=bb;break}else{ao=Y;ap=_;aq=bb;break L3050}}}}while(0);if((ab|0)==2427){ab=0;if(aa){ao=Y;ap=_;aq=0;break L3050}else{bd=0}}am=c[g>>2]|0;p=c[am+12>>2]|0;if((p|0)==(c[am+16>>2]|0)){be=b_[c[(c[am>>2]|0)+36>>2]&255](am)&255}else{be=a[p]|0}if(be<<24>>24<=-1){ao=Y;ap=_;aq=bd;break L3050}if((b[(c[f>>2]|0)+(be<<24>>24<<1)>>1]&8192)==0){ao=Y;ap=_;aq=bd;break L3050}p=c[g>>2]|0;am=p+12|0;ax=c[am>>2]|0;if((ax|0)==(c[p+16>>2]|0)){bf=b_[c[(c[p>>2]|0)+40>>2]&255](p)&255}else{c[am>>2]=ax+1;bf=a[ax]|0}eI(E,bf);bb=bd}}}while(0);ax=Z+1|0;if(ax>>>0<4){Y=ao;Z=ax;_=ap}else{ad=ao;ae=ap;af=aq;ab=2617;break}}L3087:do{if((ab|0)==2413){c[k>>2]=c[k>>2]|4;bg=0}else if((ab|0)==2481){c[k>>2]=c[k>>2]|4;bg=0}else if((ab|0)==2523){c[k>>2]=c[k>>2]|4;bg=0}else if((ab|0)==2579){c[k>>2]=c[k>>2]|4;bg=0}else if((ab|0)==2603){c[k>>2]=c[k>>2]|4;bg=0}else if((ab|0)==2615){c[k>>2]=c[k>>2]|4;bg=0}else if((ab|0)==2617){L3095:do{if((ad|0)!=0){aq=ad;ap=ad+1|0;ao=ad+8|0;_=ad+4|0;Z=1;Y=af;L3097:while(1){bd=d[aq]|0;if((bd&1|0)==0){bh=bd>>>1}else{bh=c[_>>2]|0}if(Z>>>0>=bh>>>0){break L3095}bd=c[g>>2]|0;do{if((bd|0)==0){bi=0}else{if((c[bd+12>>2]|0)!=(c[bd+16>>2]|0)){bi=bd;break}if((b_[c[(c[bd>>2]|0)+36>>2]&255](bd)|0)==-1){c[g>>2]=0;bi=0;break}else{bi=c[g>>2]|0;break}}}while(0);bd=(bi|0)==0;do{if((Y|0)==0){ab=2635}else{if((c[Y+12>>2]|0)!=(c[Y+16>>2]|0)){if(bd){bj=Y;break}else{break L3097}}if((b_[c[(c[Y>>2]|0)+36>>2]&255](Y)|0)==-1){c[e>>2]=0;ab=2635;break}else{if(bd^(Y|0)==0){bj=Y;break}else{break L3097}}}}while(0);if((ab|0)==2635){ab=0;if(bd){break}else{bj=0}}aa=c[g>>2]|0;bb=c[aa+12>>2]|0;if((bb|0)==(c[aa+16>>2]|0)){bk=b_[c[(c[aa>>2]|0)+36>>2]&255](aa)&255}else{bk=a[bb]|0}if((a[aq]&1)==0){bl=ap}else{bl=c[ao>>2]|0}if(bk<<24>>24!=(a[bl+Z|0]|0)){break}bb=Z+1|0;aa=c[g>>2]|0;bf=aa+12|0;E=c[bf>>2]|0;if((E|0)==(c[aa+16>>2]|0)){be=c[(c[aa>>2]|0)+40>>2]|0;b_[be&255](aa);Z=bb;Y=bj;continue}else{c[bf>>2]=E+1;Z=bb;Y=bj;continue}}c[k>>2]=c[k>>2]|4;bg=0;break L3087}}while(0);Y=c[H>>2]|0;if((Y|0)==(ae|0)){bg=1;break}c[G>>2]=0;f3(z,Y,ae,G);if((c[G>>2]|0)==0){bg=1;break}c[k>>2]=c[k>>2]|4;bg=0}}while(0);if((a[L]&1)!=0){le(c[V>>2]|0)}if((a[K]&1)!=0){le(c[N>>2]|0)}if((a[J]&1)!=0){le(c[Q>>2]|0)}if((a[s]&1)!=0){le(c[T>>2]|0)}if((a[A]&1)!=0){le(c[z+8>>2]|0)}z=c[H>>2]|0;c[H>>2]=0;if((z|0)==0){i=q;return bg|0}bW[c[I>>2]&255](z);i=q;return bg|0}function ip(a){a=a|0;return}function iq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){eQ(b,k,(j+h|0)-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g|0)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function ir(a){a=a|0;le(a);return}function is(a){a=a|0;var b=0,d=0,e=0,f=0;b=bi(8)|0;c[b>>2]=11320;d=b+4|0;if((d|0)==0){aN(b|0,17048,64)}e=ll(a|0)|0;f=lb(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;e=f+12|0;c[d>>2]=e;c[f+8>>2]=0;lm(e|0,a|0);aN(b|0,17048,64)}function it(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+144|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+104|0;n=d+112|0;o=d+120|0;p=d+128|0;q=d+136|0;r=m|0;c[r>>2]=l;s=m+4|0;c[s>>2]=154;t=o|0;u=c[h+28>>2]|0;c[t>>2]=u;v=u+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;v=jp(o,19408)|0;u=v;a[p]=0;w=f|0;f=c[w>>2]|0;c[q>>2]=f;if(io(e,q,g,o,c[h+4>>2]|0,j,p,u,m,n,l+100|0)|0){l=k;if((a[l]&1)==0){a[k+1|0]=0;a[l]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}l=v;if((a[p]&1)!=0){eI(k,bY[c[(c[l>>2]|0)+28>>2]&31](u,45)|0)}p=bY[c[(c[l>>2]|0)+28>>2]&31](u,48)|0;u=c[n>>2]|0;n=u-1|0;l=c[r>>2]|0;while(1){if(l>>>0>=n>>>0){break}if((a[l]|0)==p<<24>>24){l=l+1|0}else{break}}iq(k,l,u)}u=e|0;e=c[u>>2]|0;do{if((e|0)==0){x=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){x=e;break}if((b_[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){x=e;break}c[u>>2]=0;x=0}}while(0);u=(x|0)==0;do{if((f|0)==0){y=2725}else{if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(u){break}else{y=2727;break}}if((b_[c[(c[f>>2]|0)+36>>2]&255](f)|0)==-1){c[w>>2]=0;y=2725;break}else{if(u^(f|0)==0){break}else{y=2727;break}}}}while(0);if((y|0)==2725){if(u){y=2727}}if((y|0)==2727){c[j>>2]=c[j>>2]|2}c[b>>2]=x;x=c[t>>2]|0;t=x+4|0;if(((I=c[t>>2]|0,c[t>>2]=I+ -1,I)|0)==0){bW[c[(c[x>>2]|0)+8>>2]&255](x|0)}x=c[r>>2]|0;c[r>>2]=0;if((x|0)==0){i=d;return}bW[c[s>>2]&255](x);i=d;return}function iu(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;n=i;i=i+24|0;o=n|0;p=n+8|0;q=p;r=i;i=i+12|0;i=i+7>>3<<3;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+4|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;if(b){b=jp(d,19920)|0;H=b;bX[c[(c[b>>2]|0)+44>>2]&127](o,H);I=e;C=c[o>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;I=b;bX[c[(c[I>>2]|0)+32>>2]&127](p,H);p=l;if((a[p]&1)==0){a[l+1|0]=0;a[p]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eO(l,0);c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];ln(q|0,0,12);bX[c[(c[I>>2]|0)+28>>2]&127](r,H);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eO(k,0);c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];ln(s|0,0,12);s=b;a[f]=b_[c[(c[s>>2]|0)+12>>2]&255](H)|0;a[g]=b_[c[(c[s>>2]|0)+16>>2]&255](H)|0;bX[c[(c[I>>2]|0)+20>>2]&127](t,H);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eO(h,0);c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];ln(u|0,0,12);bX[c[(c[I>>2]|0)+24>>2]&127](v,H);v=j;if((a[v]&1)==0){a[j+1|0]=0;a[v]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eO(j,0);c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];ln(w|0,0,12);J=b_[c[(c[b>>2]|0)+36>>2]&255](H)|0;c[m>>2]=J;i=n;return}else{H=jp(d,19928)|0;d=H;bX[c[(c[H>>2]|0)+44>>2]&127](x,d);b=e;C=c[x>>2]|0;a[b]=C&255;C=C>>8;a[b+1|0]=C&255;C=C>>8;a[b+2|0]=C&255;C=C>>8;a[b+3|0]=C&255;b=H;bX[c[(c[b>>2]|0)+32>>2]&127](y,d);y=l;if((a[y]&1)==0){a[l+1|0]=0;a[y]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eO(l,0);c[y>>2]=c[z>>2];c[y+4>>2]=c[z+4>>2];c[y+8>>2]=c[z+8>>2];ln(z|0,0,12);bX[c[(c[b>>2]|0)+28>>2]&127](A,d);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eO(k,0);c[A>>2]=c[B>>2];c[A+4>>2]=c[B+4>>2];c[A+8>>2]=c[B+8>>2];ln(B|0,0,12);B=H;a[f]=b_[c[(c[B>>2]|0)+12>>2]&255](d)|0;a[g]=b_[c[(c[B>>2]|0)+16>>2]&255](d)|0;bX[c[(c[b>>2]|0)+20>>2]&127](D,d);D=h;if((a[D]&1)==0){a[h+1|0]=0;a[D]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eO(h,0);c[D>>2]=c[E>>2];c[D+4>>2]=c[E+4>>2];c[D+8>>2]=c[E+8>>2];ln(E|0,0,12);bX[c[(c[b>>2]|0)+24>>2]&127](F,d);F=j;if((a[F]&1)==0){a[j+1|0]=0;a[F]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eO(j,0);c[F>>2]=c[G>>2];c[F+4>>2]=c[G+4>>2];c[F+8>>2]=c[G+8>>2];ln(G|0,0,12);J=b_[c[(c[H>>2]|0)+36>>2]&255](d)|0;c[m>>2]=J;i=n;return}}function iv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a+4|0;f=(c[e>>2]|0)!=154;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h|0;h=k6(f?a:0,j)|0;if((h|0)==0){li()}do{if(f){c[g>>2]=h;k=h}else{a=c[g>>2]|0;c[g>>2]=h;if((a|0)==0){k=h;break}bW[c[e>>2]&255](a);k=c[g>>2]|0}}while(0);c[e>>2]=74;c[b>>2]=k+i;c[d>>2]=(c[g>>2]|0)+j;return}function iw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=154;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=k6(k,j)|0;k=a;if((a|0)==0){li()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}bW[c[e>>2]&255](a);l=c[g>>2]|0}}while(0);c[e>>2]=74;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function ix(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;d=i;i=i+584|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+400|0;n=d+408|0;o=d+416|0;p=d+424|0;q=d+432|0;r=d+440|0;s=m|0;c[s>>2]=l;t=m+4|0;c[t>>2]=154;u=o|0;v=c[h+28>>2]|0;c[u>>2]=v;w=v+4|0;I=c[w>>2]|0,c[w>>2]=I+1,I;w=jp(o,19400)|0;v=w;a[p]=0;x=f|0;c[q>>2]=c[x>>2];do{if(iy(e,q,g,o,c[h+4>>2]|0,j,p,v,m,n,l+400|0)|0){f=r|0;y=c[(c[w>>2]|0)+48>>2]|0;b7[y&15](v,10504,10514,f);y=d+480|0;z=c[n>>2]|0;A=c[s>>2]|0;C=z-A|0;do{if((C|0)>392){D=k4((C>>2)+2|0)|0;if((D|0)!=0){E=D;F=D;break}D=bi(4)|0;c[D>>2]=11256;aN(D|0,17016,28)}else{E=y;F=0}}while(0);if((a[p]&1)==0){G=E}else{a[E]=45;G=E+1|0}if(A>>>0<z>>>0){C=r+40|0;D=r;H=G;J=A;while(1){K=f;while(1){if((K|0)==(C|0)){L=C;break}if((c[K>>2]|0)==(c[J>>2]|0)){L=K;break}else{K=K+4|0}}a[H]=a[10504+(L-D>>2)|0]|0;K=J+4|0;M=H+1|0;if(K>>>0<(c[n>>2]|0)>>>0){H=M;J=K}else{N=M;break}}}else{N=G}a[N]=0;if((aJ(y|0,2136,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)!=1){is(2032)}if((F|0)==0){break}k5(F)}}while(0);F=e|0;e=c[F>>2]|0;do{if((e|0)==0){O=0}else{k=c[e+12>>2]|0;if((k|0)==(c[e+16>>2]|0)){P=b_[c[(c[e>>2]|0)+36>>2]&255](e)|0}else{P=c[k>>2]|0}if((P|0)!=-1){O=e;break}c[F>>2]=0;O=0}}while(0);F=(O|0)==0;e=c[x>>2]|0;do{if((e|0)==0){Q=2841}else{P=c[e+12>>2]|0;if((P|0)==(c[e+16>>2]|0)){R=b_[c[(c[e>>2]|0)+36>>2]&255](e)|0}else{R=c[P>>2]|0}if((R|0)==-1){c[x>>2]=0;Q=2841;break}else{if(F^(e|0)==0){break}else{Q=2843;break}}}}while(0);if((Q|0)==2841){if(F){Q=2843}}if((Q|0)==2843){c[j>>2]=c[j>>2]|2}c[b>>2]=O;O=c[u>>2]|0;u=O+4|0;if(((I=c[u>>2]|0,c[u>>2]=I+ -1,I)|0)==0){bW[c[(c[O>>2]|0)+8>>2]&255](O|0)}O=c[s>>2]|0;c[s>>2]=0;if((O|0)==0){i=d;return}bW[c[t>>2]&255](O);i=d;return}function iy(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0;p=i;i=i+472|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2];q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=p+440|0;x=p+448|0;y=p+456|0;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+12|0;i=i+7>>3<<3;C=i;i=i+12|0;i=i+7>>3<<3;D=i;i=i+12|0;i=i+7>>3<<3;E=i;i=i+4|0;i=i+7>>3<<3;F=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;G=s|0;c[G>>2]=o;H=s+4|0;c[H>>2]=154;c[t>>2]=o;c[u>>2]=r+400;ln(z|0,0,12);r=A;I=B;J=C;K=D;ln(r|0,0,12);ln(I|0,0,12);ln(J|0,0,12);ln(K|0,0,12);iD(f,g,v,w,x,y,A,B,C,E);g=m|0;c[n>>2]=c[g>>2];f=b|0;b=e|0;e=l;L=C+4|0;M=C+8|0;N=B+4|0;O=B+8|0;P=(h&512|0)!=0;h=A+4|0;Q=A+8|0;A=D+4|0;R=D+8|0;S=v+3|0;T=y+4|0;U=0;V=0;W=o;L2:while(1){o=c[f>>2]|0;do{if((o|0)==0){X=1}else{Y=c[o+12>>2]|0;if((Y|0)==(c[o+16>>2]|0)){Z=b_[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{Z=c[Y>>2]|0}if((Z|0)==-1){c[f>>2]=0;X=1;break}else{X=(c[f>>2]|0)==0;break}}}while(0);o=c[b>>2]|0;do{if((o|0)==0){_=16}else{Y=c[o+12>>2]|0;if((Y|0)==(c[o+16>>2]|0)){$=b_[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{$=c[Y>>2]|0}if(($|0)==-1){c[b>>2]=0;_=16;break}else{if(X^(o|0)==0){aa=o;break}else{ab=U;ac=W;ad=o;_=255;break L2}}}}while(0);if((_|0)==16){_=0;if(X){ab=U;ac=W;ad=0;_=255;break}else{aa=0}}o=a[v+V|0]|0;L26:do{if((o|0)==4){Y=c[x>>2]|0;ae=0;af=aa;ag=W;L28:while(1){ah=c[f>>2]|0;do{if((ah|0)==0){ai=1}else{aj=c[ah+12>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=b_[c[(c[ah>>2]|0)+36>>2]&255](ah)|0}else{ak=c[aj>>2]|0}if((ak|0)==-1){c[f>>2]=0;ai=1;break}else{ai=(c[f>>2]|0)==0;break}}}while(0);do{if((af|0)==0){_=175}else{ah=c[af+12>>2]|0;if((ah|0)==(c[af+16>>2]|0)){al=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0}else{al=c[ah>>2]|0}if((al|0)==-1){c[b>>2]=0;_=175;break}else{ah=(af|0)==0;if(ai^ah){am=af;an=ah;break}else{ao=af;ap=ah;break L28}}}}while(0);if((_|0)==175){_=0;if(ai){ao=0;ap=1;break}else{am=0;an=1}}ah=c[f>>2]|0;aj=c[ah+12>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){aq=b_[c[(c[ah>>2]|0)+36>>2]&255](ah)|0}else{aq=c[aj>>2]|0}if(bZ[c[(c[e>>2]|0)+12>>2]&63](l,2048,aq)|0){aj=c[n>>2]|0;if((aj|0)==(c[q>>2]|0)){iE(m,n,q);ar=c[n>>2]|0}else{ar=aj}c[n>>2]=ar+4;c[ar>>2]=aq;as=ae+1|0;at=ag}else{aj=d[z]|0;if(!((ae|0)!=0&(((aj&1|0)==0?aj>>>1:c[T>>2]|0)|0)!=0&(aq|0)==(Y|0))){ao=am;ap=an;break}if((ag|0)==(c[u>>2]|0)){iw(s,t,u);au=c[t>>2]|0}else{au=ag}aj=au+4|0;c[t>>2]=aj;c[au>>2]=ae;as=0;at=aj}aj=c[f>>2]|0;ah=aj+12|0;av=c[ah>>2]|0;if((av|0)==(c[aj+16>>2]|0)){aw=c[(c[aj>>2]|0)+40>>2]|0;b_[aw&255](aj);ae=as;af=am;ag=at;continue}else{c[ah>>2]=av+4;ae=as;af=am;ag=at;continue}}if((c[G>>2]|0)==(ag|0)|(ae|0)==0){ax=ag}else{if((ag|0)==(c[u>>2]|0)){iw(s,t,u)}af=c[t>>2]|0;Y=af+4|0;c[t>>2]=Y;c[af>>2]=ae;ax=Y}Y=c[E>>2]|0;if((Y|0)>0){af=c[f>>2]|0;do{if((af|0)==0){ay=1}else{av=c[af+12>>2]|0;if((av|0)==(c[af+16>>2]|0)){az=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0}else{az=c[av>>2]|0}if((az|0)==-1){c[f>>2]=0;ay=1;break}else{ay=(c[f>>2]|0)==0;break}}}while(0);do{if(ap){_=212}else{af=c[ao+12>>2]|0;if((af|0)==(c[ao+16>>2]|0)){aA=b_[c[(c[ao>>2]|0)+36>>2]&255](ao)|0}else{aA=c[af>>2]|0}if((aA|0)==-1){c[b>>2]=0;_=212;break}else{if(ay^(ao|0)==0){aB=ao;break}else{_=218;break L2}}}}while(0);if((_|0)==212){_=0;if(ay){_=218;break L2}else{aB=0}}af=c[f>>2]|0;ae=c[af+12>>2]|0;if((ae|0)==(c[af+16>>2]|0)){aC=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0}else{aC=c[ae>>2]|0}if((aC|0)!=(c[w>>2]|0)){_=218;break L2}ae=c[f>>2]|0;af=ae+12|0;ag=c[af>>2]|0;if((ag|0)==(c[ae+16>>2]|0)){av=c[(c[ae>>2]|0)+40>>2]|0;b_[av&255](ae);aD=aB;aE=Y}else{c[af>>2]=ag+4;aD=aB;aE=Y}while(1){ag=c[f>>2]|0;do{if((ag|0)==0){aF=1}else{af=c[ag+12>>2]|0;if((af|0)==(c[ag+16>>2]|0)){aG=b_[c[(c[ag>>2]|0)+36>>2]&255](ag)|0}else{aG=c[af>>2]|0}if((aG|0)==-1){c[f>>2]=0;aF=1;break}else{aF=(c[f>>2]|0)==0;break}}}while(0);do{if((aD|0)==0){_=235}else{ag=c[aD+12>>2]|0;if((ag|0)==(c[aD+16>>2]|0)){aH=b_[c[(c[aD>>2]|0)+36>>2]&255](aD)|0}else{aH=c[ag>>2]|0}if((aH|0)==-1){c[b>>2]=0;_=235;break}else{if(aF^(aD|0)==0){aI=aD;break}else{_=242;break L2}}}}while(0);if((_|0)==235){_=0;if(aF){_=242;break L2}else{aI=0}}ag=c[f>>2]|0;af=c[ag+12>>2]|0;if((af|0)==(c[ag+16>>2]|0)){aJ=b_[c[(c[ag>>2]|0)+36>>2]&255](ag)|0}else{aJ=c[af>>2]|0}if(!(bZ[c[(c[e>>2]|0)+12>>2]&63](l,2048,aJ)|0)){_=242;break L2}if((c[n>>2]|0)==(c[q>>2]|0)){iE(m,n,q)}af=c[f>>2]|0;ag=c[af+12>>2]|0;if((ag|0)==(c[af+16>>2]|0)){aK=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0}else{aK=c[ag>>2]|0}ag=c[n>>2]|0;c[n>>2]=ag+4;c[ag>>2]=aK;ag=aE-1|0;c[E>>2]=ag;af=c[f>>2]|0;ae=af+12|0;av=c[ae>>2]|0;if((av|0)==(c[af+16>>2]|0)){ah=c[(c[af>>2]|0)+40>>2]|0;b_[ah&255](af)}else{c[ae>>2]=av+4}if((ag|0)>0){aD=aI;aE=ag}else{aL=aI;break}}}else{aL=ao}if((c[n>>2]|0)==(c[g>>2]|0)){_=253;break L2}else{aM=U;aN=ax;aO=aL}}else if((o|0)==1){if((V|0)==3){ab=U;ac=W;ad=aa;_=255;break L2}Y=c[f>>2]|0;ag=c[Y+12>>2]|0;if((ag|0)==(c[Y+16>>2]|0)){aP=b_[c[(c[Y>>2]|0)+36>>2]&255](Y)|0}else{aP=c[ag>>2]|0}if(!(bZ[c[(c[e>>2]|0)+12>>2]&63](l,8192,aP)|0)){_=51;break L2}ag=c[f>>2]|0;Y=ag+12|0;av=c[Y>>2]|0;if((av|0)==(c[ag+16>>2]|0)){aQ=b_[c[(c[ag>>2]|0)+40>>2]&255](ag)|0}else{c[Y>>2]=av+4;aQ=c[av>>2]|0}e7(D,aQ);_=52}else if((o|0)==0){_=52}else if((o|0)==3){av=a[I]|0;Y=av&255;ag=(Y&1|0)==0;ae=a[J]|0;af=ae&255;ah=(af&1|0)==0;if(((ag?Y>>>1:c[N>>2]|0)|0)==(-(ah?af>>>1:c[L>>2]|0)|0)){aM=U;aN=W;aO=aa;break}do{if(((ag?Y>>>1:c[N>>2]|0)|0)!=0){if(((ah?af>>>1:c[L>>2]|0)|0)==0){break}aj=c[f>>2]|0;aw=c[aj+12>>2]|0;if((aw|0)==(c[aj+16>>2]|0)){aR=b_[c[(c[aj>>2]|0)+36>>2]&255](aj)|0;aS=aR;aT=a[I]|0}else{aS=c[aw>>2]|0;aT=av}aw=c[f>>2]|0;aR=aw+12|0;aj=c[aR>>2]|0;aU=(aj|0)==(c[aw+16>>2]|0);if((aS|0)==(c[((aT&1)==0?N:c[O>>2]|0)>>2]|0)){if(aU){aV=c[(c[aw>>2]|0)+40>>2]|0;b_[aV&255](aw)}else{c[aR>>2]=aj+4}aR=d[I]|0;aM=((aR&1|0)==0?aR>>>1:c[N>>2]|0)>>>0>1?B:U;aN=W;aO=aa;break L26}if(aU){aW=b_[c[(c[aw>>2]|0)+36>>2]&255](aw)|0}else{aW=c[aj>>2]|0}if((aW|0)!=(c[((a[J]&1)==0?L:c[M>>2]|0)>>2]|0)){_=117;break L2}aj=c[f>>2]|0;aw=aj+12|0;aU=c[aw>>2]|0;if((aU|0)==(c[aj+16>>2]|0)){aR=c[(c[aj>>2]|0)+40>>2]|0;b_[aR&255](aj)}else{c[aw>>2]=aU+4}a[k]=1;aU=d[J]|0;aM=((aU&1|0)==0?aU>>>1:c[L>>2]|0)>>>0>1?C:U;aN=W;aO=aa;break L26}}while(0);af=c[f>>2]|0;ah=c[af+12>>2]|0;aU=(ah|0)==(c[af+16>>2]|0);if(((ag?Y>>>1:c[N>>2]|0)|0)==0){if(aU){aw=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0;aX=aw;aY=a[J]|0}else{aX=c[ah>>2]|0;aY=ae}if((aX|0)!=(c[((aY&1)==0?L:c[M>>2]|0)>>2]|0)){aM=U;aN=W;aO=aa;break}aw=c[f>>2]|0;aj=aw+12|0;aR=c[aj>>2]|0;if((aR|0)==(c[aw+16>>2]|0)){aV=c[(c[aw>>2]|0)+40>>2]|0;b_[aV&255](aw)}else{c[aj>>2]=aR+4}a[k]=1;aR=d[J]|0;aM=((aR&1|0)==0?aR>>>1:c[L>>2]|0)>>>0>1?C:U;aN=W;aO=aa;break}if(aU){aU=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0;aZ=aU;a_=a[I]|0}else{aZ=c[ah>>2]|0;a_=av}if((aZ|0)!=(c[((a_&1)==0?N:c[O>>2]|0)>>2]|0)){a[k]=1;aM=U;aN=W;aO=aa;break}ah=c[f>>2]|0;aU=ah+12|0;af=c[aU>>2]|0;if((af|0)==(c[ah+16>>2]|0)){aR=c[(c[ah>>2]|0)+40>>2]|0;b_[aR&255](ah)}else{c[aU>>2]=af+4}af=d[I]|0;aM=((af&1|0)==0?af>>>1:c[N>>2]|0)>>>0>1?B:U;aN=W;aO=aa}else if((o|0)==2){if(!((U|0)!=0|V>>>0<2)){if((V|0)==2){a$=(a[S]|0)!=0}else{a$=0}if(!(P|a$)){aM=0;aN=W;aO=aa;break}}af=a[r]|0;aU=(af&1)==0?h:c[Q>>2]|0;L225:do{if((V|0)==0){a0=aU;a1=af;a2=aa}else{if((d[v+(V-1|0)|0]|0)<2){a3=aU;a4=af}else{a0=aU;a1=af;a2=aa;break}while(1){ah=a4&255;if((a3|0)==(((a4&1)==0?h:c[Q>>2]|0)+(((ah&1|0)==0?ah>>>1:c[h>>2]|0)<<2)|0)){a5=a4;break}if(!(bZ[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[a3>>2]|0)|0)){_=128;break}a3=a3+4|0;a4=a[r]|0}if((_|0)==128){_=0;a5=a[r]|0}ah=(a5&1)==0;aR=a3-(ah?h:c[Q>>2]|0)>>2;aj=a[K]|0;aw=aj&255;aV=(aw&1|0)==0;L235:do{if(aR>>>0<=(aV?aw>>>1:c[A>>2]|0)>>>0){a6=(aj&1)==0;a7=(a6?A:c[R>>2]|0)+((aV?aw>>>1:c[A>>2]|0)-aR<<2)|0;a8=(a6?A:c[R>>2]|0)+((aV?aw>>>1:c[A>>2]|0)<<2)|0;if((a7|0)==(a8|0)){a0=a3;a1=a5;a2=aa;break L225}else{a9=a7;ba=ah?h:c[Q>>2]|0}while(1){if((c[a9>>2]|0)!=(c[ba>>2]|0)){break L235}a7=a9+4|0;if((a7|0)==(a8|0)){a0=a3;a1=a5;a2=aa;break L225}a9=a7;ba=ba+4|0}}}while(0);a0=ah?h:c[Q>>2]|0;a1=a5;a2=aa}}while(0);L242:while(1){af=a1&255;if((a0|0)==(((a1&1)==0?h:c[Q>>2]|0)+(((af&1|0)==0?af>>>1:c[h>>2]|0)<<2)|0)){bb=a2;break}af=c[f>>2]|0;do{if((af|0)==0){bc=1}else{aU=c[af+12>>2]|0;if((aU|0)==(c[af+16>>2]|0)){bd=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0}else{bd=c[aU>>2]|0}if((bd|0)==-1){c[f>>2]=0;bc=1;break}else{bc=(c[f>>2]|0)==0;break}}}while(0);do{if((a2|0)==0){_=149}else{af=c[a2+12>>2]|0;if((af|0)==(c[a2+16>>2]|0)){be=b_[c[(c[a2>>2]|0)+36>>2]&255](a2)|0}else{be=c[af>>2]|0}if((be|0)==-1){c[b>>2]=0;_=149;break}else{if(bc^(a2|0)==0){bf=a2;break}else{bb=a2;break L242}}}}while(0);if((_|0)==149){_=0;if(bc){bb=0;break}else{bf=0}}af=c[f>>2]|0;ah=c[af+12>>2]|0;if((ah|0)==(c[af+16>>2]|0)){bg=b_[c[(c[af>>2]|0)+36>>2]&255](af)|0}else{bg=c[ah>>2]|0}if((bg|0)!=(c[a0>>2]|0)){bb=bf;break}ah=c[f>>2]|0;af=ah+12|0;aU=c[af>>2]|0;if((aU|0)==(c[ah+16>>2]|0)){av=c[(c[ah>>2]|0)+40>>2]|0;b_[av&255](ah)}else{c[af>>2]=aU+4}a0=a0+4|0;a1=a[r]|0;a2=bf}if(!P){aM=U;aN=W;aO=bb;break}aU=a[r]|0;af=aU&255;if((a0|0)==(((aU&1)==0?h:c[Q>>2]|0)+(((af&1|0)==0?af>>>1:c[h>>2]|0)<<2)|0)){aM=U;aN=W;aO=bb}else{_=161;break L2}}else{aM=U;aN=W;aO=aa}}while(0);L278:do{if((_|0)==52){_=0;if((V|0)==3){ab=U;ac=W;ad=aa;_=255;break L2}else{bh=aa}while(1){o=c[f>>2]|0;do{if((o|0)==0){bi=1}else{af=c[o+12>>2]|0;if((af|0)==(c[o+16>>2]|0)){bj=b_[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{bj=c[af>>2]|0}if((bj|0)==-1){c[f>>2]=0;bi=1;break}else{bi=(c[f>>2]|0)==0;break}}}while(0);do{if((bh|0)==0){_=66}else{o=c[bh+12>>2]|0;if((o|0)==(c[bh+16>>2]|0)){bk=b_[c[(c[bh>>2]|0)+36>>2]&255](bh)|0}else{bk=c[o>>2]|0}if((bk|0)==-1){c[b>>2]=0;_=66;break}else{if(bi^(bh|0)==0){bl=bh;break}else{aM=U;aN=W;aO=bh;break L278}}}}while(0);if((_|0)==66){_=0;if(bi){aM=U;aN=W;aO=0;break L278}else{bl=0}}o=c[f>>2]|0;af=c[o+12>>2]|0;if((af|0)==(c[o+16>>2]|0)){bm=b_[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{bm=c[af>>2]|0}if(!(bZ[c[(c[e>>2]|0)+12>>2]&63](l,8192,bm)|0)){aM=U;aN=W;aO=bl;break L278}af=c[f>>2]|0;o=af+12|0;aU=c[o>>2]|0;if((aU|0)==(c[af+16>>2]|0)){bn=b_[c[(c[af>>2]|0)+40>>2]&255](af)|0}else{c[o>>2]=aU+4;bn=c[aU>>2]|0}e7(D,bn);bh=bl}}}while(0);aU=V+1|0;if(aU>>>0<4){U=aM;V=aU;W=aN}else{ab=aM;ac=aN;ad=aO;_=255;break}}L315:do{if((_|0)==51){c[j>>2]=c[j>>2]|4;bo=0}else if((_|0)==117){c[j>>2]=c[j>>2]|4;bo=0}else if((_|0)==161){c[j>>2]=c[j>>2]|4;bo=0}else if((_|0)==218){c[j>>2]=c[j>>2]|4;bo=0}else if((_|0)==242){c[j>>2]=c[j>>2]|4;bo=0}else if((_|0)==253){c[j>>2]=c[j>>2]|4;bo=0}else if((_|0)==255){L323:do{if((ab|0)!=0){aO=ab;aN=ab+4|0;aM=ab+8|0;W=1;V=ad;L325:while(1){U=d[aO]|0;if((U&1|0)==0){bp=U>>>1}else{bp=c[aN>>2]|0}if(W>>>0>=bp>>>0){break L323}U=c[f>>2]|0;do{if((U|0)==0){bq=1}else{bl=c[U+12>>2]|0;if((bl|0)==(c[U+16>>2]|0)){br=b_[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{br=c[bl>>2]|0}if((br|0)==-1){c[f>>2]=0;bq=1;break}else{bq=(c[f>>2]|0)==0;break}}}while(0);do{if((V|0)==0){_=274}else{U=c[V+12>>2]|0;if((U|0)==(c[V+16>>2]|0)){bs=b_[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bs=c[U>>2]|0}if((bs|0)==-1){c[b>>2]=0;_=274;break}else{if(bq^(V|0)==0){bt=V;break}else{break L325}}}}while(0);if((_|0)==274){_=0;if(bq){break}else{bt=0}}U=c[f>>2]|0;bl=c[U+12>>2]|0;if((bl|0)==(c[U+16>>2]|0)){bu=b_[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bu=c[bl>>2]|0}if((a[aO]&1)==0){bv=aN}else{bv=c[aM>>2]|0}if((bu|0)!=(c[bv+(W<<2)>>2]|0)){break}bl=W+1|0;U=c[f>>2]|0;bh=U+12|0;bn=c[bh>>2]|0;if((bn|0)==(c[U+16>>2]|0)){D=c[(c[U>>2]|0)+40>>2]|0;b_[D&255](U);W=bl;V=bt;continue}else{c[bh>>2]=bn+4;W=bl;V=bt;continue}}c[j>>2]=c[j>>2]|4;bo=0;break L315}}while(0);V=c[G>>2]|0;if((V|0)==(ac|0)){bo=1;break}c[F>>2]=0;f3(y,V,ac,F);if((c[F>>2]|0)==0){bo=1;break}c[j>>2]=c[j>>2]|4;bo=0}}while(0);if((a[K]&1)!=0){le(c[R>>2]|0)}if((a[J]&1)!=0){le(c[M>>2]|0)}if((a[I]&1)!=0){le(c[O>>2]|0)}if((a[r]&1)!=0){le(c[Q>>2]|0)}if((a[z]&1)!=0){le(c[y+8>>2]|0)}y=c[G>>2]|0;c[G>>2]=0;if((y|0)==0){i=p;return bo|0}bW[c[H>>2]&255](y);i=p;return bo|0}function iz(a){a=a|0;return}function iA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){fj(b,k,(j+h|0)-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=(j+(((e-4|0)+(-g|0)|0)>>>2)|0)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function iB(a){a=a|0;le(a);return}function iC(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+440|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+400|0;n=d+408|0;o=d+416|0;p=d+424|0;q=d+432|0;r=m|0;c[r>>2]=l;s=m+4|0;c[s>>2]=154;t=o|0;u=c[h+28>>2]|0;c[t>>2]=u;v=u+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;v=jp(o,19400)|0;u=v;a[p]=0;w=f|0;f=c[w>>2]|0;c[q>>2]=f;if(iy(e,q,g,o,c[h+4>>2]|0,j,p,u,m,n,l+400|0)|0){l=k;if((a[l]&1)==0){c[k+4>>2]=0;a[l]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}l=v;if((a[p]&1)!=0){e7(k,bY[c[(c[l>>2]|0)+44>>2]&31](u,45)|0)}p=bY[c[(c[l>>2]|0)+44>>2]&31](u,48)|0;u=c[n>>2]|0;n=u-4|0;l=c[r>>2]|0;while(1){if(l>>>0>=n>>>0){break}if((c[l>>2]|0)==(p|0)){l=l+4|0}else{break}}iA(k,l,u)}u=e|0;e=c[u>>2]|0;do{if((e|0)==0){x=0}else{l=c[e+12>>2]|0;if((l|0)==(c[e+16>>2]|0)){y=b_[c[(c[e>>2]|0)+36>>2]&255](e)|0}else{y=c[l>>2]|0}if((y|0)!=-1){x=e;break}c[u>>2]=0;x=0}}while(0);u=(x|0)==0;do{if((f|0)==0){z=359}else{e=c[f+12>>2]|0;if((e|0)==(c[f+16>>2]|0)){A=b_[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{A=c[e>>2]|0}if((A|0)==-1){c[w>>2]=0;z=359;break}else{if(u^(f|0)==0){break}else{z=361;break}}}}while(0);if((z|0)==359){if(u){z=361}}if((z|0)==361){c[j>>2]=c[j>>2]|2}c[b>>2]=x;x=c[t>>2]|0;t=x+4|0;if(((I=c[t>>2]|0,c[t>>2]=I+ -1,I)|0)==0){bW[c[(c[x>>2]|0)+8>>2]&255](x|0)}x=c[r>>2]|0;c[r>>2]=0;if((x|0)==0){i=d;return}bW[c[s>>2]&255](x);i=d;return}function iD(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;n=i;i=i+24|0;o=n|0;p=n+8|0;q=p;r=i;i=i+12|0;i=i+7>>3<<3;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+4|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;if(b){b=jp(d,19904)|0;H=b;bX[c[(c[b>>2]|0)+44>>2]&127](o,H);I=e;C=c[o>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;I=b;bX[c[(c[I>>2]|0)+32>>2]&127](p,H);p=l;if((a[p]&1)==0){c[l+4>>2]=0;a[p]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}fh(l,0);c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];ln(q|0,0,12);bX[c[(c[I>>2]|0)+28>>2]&127](r,H);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}fh(k,0);c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];ln(s|0,0,12);s=b;c[f>>2]=b_[c[(c[s>>2]|0)+12>>2]&255](H)|0;c[g>>2]=b_[c[(c[s>>2]|0)+16>>2]&255](H)|0;bX[c[(c[b>>2]|0)+20>>2]&127](t,H);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eO(h,0);c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];ln(u|0,0,12);bX[c[(c[I>>2]|0)+24>>2]&127](v,H);v=j;if((a[v]&1)==0){c[j+4>>2]=0;a[v]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}fh(j,0);c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];ln(w|0,0,12);J=b_[c[(c[s>>2]|0)+36>>2]&255](H)|0;c[m>>2]=J;i=n;return}else{H=jp(d,19912)|0;d=H;bX[c[(c[H>>2]|0)+44>>2]&127](x,d);s=e;C=c[x>>2]|0;a[s]=C&255;C=C>>8;a[s+1|0]=C&255;C=C>>8;a[s+2|0]=C&255;C=C>>8;a[s+3|0]=C&255;s=H;bX[c[(c[s>>2]|0)+32>>2]&127](y,d);y=l;if((a[y]&1)==0){c[l+4>>2]=0;a[y]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}fh(l,0);c[y>>2]=c[z>>2];c[y+4>>2]=c[z+4>>2];c[y+8>>2]=c[z+8>>2];ln(z|0,0,12);bX[c[(c[s>>2]|0)+28>>2]&127](A,d);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}fh(k,0);c[A>>2]=c[B>>2];c[A+4>>2]=c[B+4>>2];c[A+8>>2]=c[B+8>>2];ln(B|0,0,12);B=H;c[f>>2]=b_[c[(c[B>>2]|0)+12>>2]&255](d)|0;c[g>>2]=b_[c[(c[B>>2]|0)+16>>2]&255](d)|0;bX[c[(c[H>>2]|0)+20>>2]&127](D,d);D=h;if((a[D]&1)==0){a[h+1|0]=0;a[D]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eO(h,0);c[D>>2]=c[E>>2];c[D+4>>2]=c[E+4>>2];c[D+8>>2]=c[E+8>>2];ln(E|0,0,12);bX[c[(c[s>>2]|0)+24>>2]&127](F,d);F=j;if((a[F]&1)==0){c[j+4>>2]=0;a[F]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}fh(j,0);c[F>>2]=c[G>>2];c[F+4>>2]=c[G+4>>2];c[F+8>>2]=c[G+8>>2];ln(G|0,0,12);J=b_[c[(c[B>>2]|0)+36>>2]&255](d)|0;c[m>>2]=J;i=n;return}}function iE(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=154;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=k6(k,j)|0;k=a;if((a|0)==0){li()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}bW[c[e>>2]&255](a);l=c[g>>2]|0}}while(0);c[e>>2]=74;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function iF(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;e=i;i=i+264|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e+104|0;n=e+216|0;o=e+224|0;p=e+232|0;q=e+240|0;r=e+248|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+4|0;i=i+7>>3<<3;y=i;i=i+100|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=e|0;c[m>>2]=D;E=e+112|0;F=aK(D|0,100,1904,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(F>>>0>99){if(a[20024]|0){G=c[2504]|0}else{D=bI(1,1840,0)|0;c[2504]=D;a[20024]=1;G=D}D=gP(m,G,1904,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;H=c[m>>2]|0;if((H|0)==0){J=bi(4)|0;c[J>>2]=11256;aN(J|0,17016,28)}J=k4(D)|0;if((J|0)!=0){K=J;L=D;M=H;N=J;break}J=bi(4)|0;c[J>>2]=11256;aN(J|0,17016,28)}else{K=E;L=F;M=0;N=0}}while(0);F=n|0;E=c[j+28>>2]|0;c[F>>2]=E;G=E+4|0;I=c[G>>2]|0,c[G>>2]=I+1,I;G=jp(n,19408)|0;E=G;J=c[m>>2]|0;b7[c[(c[G>>2]|0)+32>>2]&15](E,J,J+L|0,K);if((L|0)==0){O=0}else{O=(a[c[m>>2]|0]|0)==45}ln(s|0,0,12);ln(u|0,0,12);ln(w|0,0,12);iG(g,O,n,o,p,q,r,t,v,x);n=y|0;y=c[x>>2]|0;if((L|0)>(y|0)){x=d[w]|0;if((x&1|0)==0){P=x>>>1}else{P=c[v+4>>2]|0}x=d[u]|0;if((x&1|0)==0){Q=x>>>1}else{Q=c[t+4>>2]|0}R=((L-y<<1|1)+P|0)+Q|0}else{Q=d[w]|0;if((Q&1|0)==0){S=Q>>>1}else{S=c[v+4>>2]|0}Q=d[u]|0;if((Q&1|0)==0){T=Q>>>1}else{T=c[t+4>>2]|0}R=(S+2|0)+T|0}T=R+y|0;do{if(T>>>0>100){R=k4(T)|0;if((R|0)!=0){U=R;V=R;break}R=bi(4)|0;c[R>>2]=11256;aN(R|0,17016,28)}else{U=n;V=0}}while(0);iI(U,z,A,c[j+4>>2]|0,K,K+L|0,E,O,o,a[p]|0,a[q]|0,r,t,v,y);c[C>>2]=c[f>>2];dR(b,C,U,c[z>>2]|0,c[A>>2]|0,j,k);if((V|0)!=0){k5(V)}if((a[w]&1)!=0){le(c[v+8>>2]|0)}if((a[u]&1)!=0){le(c[t+8>>2]|0)}if((a[s]&1)!=0){le(c[r+8>>2]|0)}r=c[F>>2]|0;F=r+4|0;if(((I=c[F>>2]|0,c[F>>2]=I+ -1,I)|0)==0){bW[c[(c[r>>2]|0)+8>>2]&255](r|0)}if((N|0)!=0){k5(N)}if((M|0)==0){i=e;return}k5(M);i=e;return}function iG(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;n=i;i=i+8|0;o=n|0;p=o;q=i;i=i+12|0;i=i+7>>3<<3;r=q;s=i;i=i+4|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+4|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+4|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;if(b){b=jp(e,19920)|0;N=b;O=c[b>>2]|0;if(d){bX[c[O+44>>2]&127](p,N);p=f;C=c[o>>2]|0;a[p]=C&255;C=C>>8;a[p+1|0]=C&255;C=C>>8;a[p+2|0]=C&255;C=C>>8;a[p+3|0]=C&255;bX[c[(c[b>>2]|0)+32>>2]&127](q,N);q=l;if((a[q]&1)==0){a[l+1|0]=0;a[q]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eO(l,0);c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];ln(r|0,0,12)}else{bX[c[O+40>>2]&127](t,N);t=f;C=c[s>>2]|0;a[t]=C&255;C=C>>8;a[t+1|0]=C&255;C=C>>8;a[t+2|0]=C&255;C=C>>8;a[t+3|0]=C&255;bX[c[(c[b>>2]|0)+28>>2]&127](u,N);u=l;if((a[u]&1)==0){a[l+1|0]=0;a[u]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eO(l,0);c[u>>2]=c[v>>2];c[u+4>>2]=c[v+4>>2];c[u+8>>2]=c[v+8>>2];ln(v|0,0,12)}v=b;a[g]=b_[c[(c[v>>2]|0)+12>>2]&255](N)|0;a[h]=b_[c[(c[v>>2]|0)+16>>2]&255](N)|0;v=b;bX[c[(c[v>>2]|0)+20>>2]&127](w,N);w=j;if((a[w]&1)==0){a[j+1|0]=0;a[w]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eO(j,0);c[w>>2]=c[x>>2];c[w+4>>2]=c[x+4>>2];c[w+8>>2]=c[x+8>>2];ln(x|0,0,12);bX[c[(c[v>>2]|0)+24>>2]&127](y,N);y=k;if((a[y]&1)==0){a[k+1|0]=0;a[y]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eO(k,0);c[y>>2]=c[z>>2];c[y+4>>2]=c[z+4>>2];c[y+8>>2]=c[z+8>>2];ln(z|0,0,12);P=b_[c[(c[b>>2]|0)+36>>2]&255](N)|0;c[m>>2]=P;i=n;return}else{N=jp(e,19928)|0;e=N;b=c[N>>2]|0;if(d){bX[c[b+44>>2]&127](B,e);B=f;C=c[A>>2]|0;a[B]=C&255;C=C>>8;a[B+1|0]=C&255;C=C>>8;a[B+2|0]=C&255;C=C>>8;a[B+3|0]=C&255;bX[c[(c[N>>2]|0)+32>>2]&127](D,e);D=l;if((a[D]&1)==0){a[l+1|0]=0;a[D]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eO(l,0);c[D>>2]=c[E>>2];c[D+4>>2]=c[E+4>>2];c[D+8>>2]=c[E+8>>2];ln(E|0,0,12)}else{bX[c[b+40>>2]&127](G,e);G=f;C=c[F>>2]|0;a[G]=C&255;C=C>>8;a[G+1|0]=C&255;C=C>>8;a[G+2|0]=C&255;C=C>>8;a[G+3|0]=C&255;bX[c[(c[N>>2]|0)+28>>2]&127](H,e);H=l;if((a[H]&1)==0){a[l+1|0]=0;a[H]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eO(l,0);c[H>>2]=c[I>>2];c[H+4>>2]=c[I+4>>2];c[H+8>>2]=c[I+8>>2];ln(I|0,0,12)}I=N;a[g]=b_[c[(c[I>>2]|0)+12>>2]&255](e)|0;a[h]=b_[c[(c[I>>2]|0)+16>>2]&255](e)|0;I=N;bX[c[(c[I>>2]|0)+20>>2]&127](J,e);J=j;if((a[J]&1)==0){a[j+1|0]=0;a[J]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eO(j,0);c[J>>2]=c[K>>2];c[J+4>>2]=c[K+4>>2];c[J+8>>2]=c[K+8>>2];ln(K|0,0,12);bX[c[(c[I>>2]|0)+24>>2]&127](L,e);L=k;if((a[L]&1)==0){a[k+1|0]=0;a[L]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eO(k,0);c[L>>2]=c[M>>2];c[L+4>>2]=c[M+4>>2];c[L+8>>2]=c[M+8>>2];ln(M|0,0,12);P=b_[c[(c[N>>2]|0)+36>>2]&255](e)|0;c[m>>2]=P;i=n;return}}function iH(a){a=a|0;return}function iI(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;do{if((H|0)==0){c[e>>2]=c[f>>2];I=G}else if((H|0)==1){c[e>>2]=c[f>>2];J=bY[c[(c[s>>2]|0)+28>>2]&31](j,32)|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=J;I=G}else if((H|0)==3){J=a[t]|0;K=J&255;if((K&1|0)==0){L=K>>>1}else{L=c[w>>2]|0}if((L|0)==0){I=G;break}if((J&1)==0){M=u}else{M=c[v>>2]|0}J=a[M]|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=J;I=G}else if((H|0)==2){J=a[q]|0;K=J&255;N=(K&1|0)==0;if(N){O=K>>>1}else{O=c[z>>2]|0}if((O|0)==0|x){I=G;break}if((J&1)==0){P=y;Q=y}else{J=c[A>>2]|0;P=J;Q=J}if(N){R=K>>>1}else{R=c[z>>2]|0}K=P+R|0;N=c[f>>2]|0;if((Q|0)==(K|0)){S=N}else{J=Q;T=N;while(1){a[T]=a[J]|0;N=J+1|0;U=T+1|0;if((N|0)==(K|0)){S=U;break}else{J=N;T=U}}}c[f>>2]=S;I=G}else if((H|0)==4){T=c[f>>2]|0;J=k?G+1|0:G;K=J;while(1){if(K>>>0>=i>>>0){break}U=a[K]|0;if(U<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(U<<24>>24<<1)>>1]&2048)==0){break}else{K=K+1|0}}U=K;if(B){if(K>>>0>J>>>0){N=J+(-U|0)|0;U=N>>>0<o>>>0?o:N;N=U+r|0;V=K;W=r;X=T;while(1){Y=V-1|0;Z=a[Y]|0;c[f>>2]=X+1;a[X]=Z;Z=W-1|0;_=(Z|0)>0;if(!(Y>>>0>J>>>0&_)){break}V=Y;W=Z;X=c[f>>2]|0}X=K+U|0;if(_){$=N;aa=X;ab=590}else{ac=0;ad=N;ae=X}}else{$=r;aa=K;ab=590}if((ab|0)==590){ab=0;ac=bY[c[(c[s>>2]|0)+28>>2]&31](j,48)|0;ad=$;ae=aa}X=c[f>>2]|0;c[f>>2]=X+1;if((ad|0)>0){W=ad;V=X;while(1){a[V]=ac;Z=W-1|0;Y=c[f>>2]|0;c[f>>2]=Y+1;if((Z|0)>0){W=Z;V=Y}else{af=Y;break}}}else{af=X}a[af]=m;ag=ae}else{ag=K}if((ag|0)==(J|0)){V=bY[c[(c[s>>2]|0)+28>>2]&31](j,48)|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=V}else{V=a[C]|0;W=V&255;if((W&1|0)==0){ah=W>>>1}else{ah=c[F>>2]|0}if((ah|0)==0){ai=ag;aj=0;ak=0;al=-1}else{if((V&1)==0){am=D}else{am=c[E>>2]|0}ai=ag;aj=0;ak=0;al=a[am]|0}while(1){do{if((aj|0)==(al|0)){V=c[f>>2]|0;c[f>>2]=V+1;a[V]=n;V=ak+1|0;W=a[C]|0;N=W&255;if((N&1|0)==0){an=N>>>1}else{an=c[F>>2]|0}if(V>>>0>=an>>>0){ao=al;ap=V;aq=0;break}N=(W&1)==0;if(N){ar=D}else{ar=c[E>>2]|0}if((a[ar+V|0]|0)==127){ao=-1;ap=V;aq=0;break}if(N){as=D}else{as=c[E>>2]|0}ao=a[as+V|0]|0;ap=V;aq=0}else{ao=al;ap=ak;aq=aj}}while(0);V=ai-1|0;N=a[V]|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=N;if((V|0)==(J|0)){break}else{ai=V;aj=aq+1|0;ak=ap;al=ao}}}K=c[f>>2]|0;if((T|0)==(K|0)){I=J;break}X=K-1|0;if(T>>>0<X>>>0){at=T;au=X}else{I=J;break}while(1){X=a[at]|0;a[at]=a[au]|0;a[au]=X;X=at+1|0;K=au-1|0;if(X>>>0<K>>>0){at=X;au=K}else{I=J;break}}}else{I=G}}while(0);H=h+1|0;if(H>>>0<4){G=I;h=H}else{break}}h=a[t]|0;t=h&255;I=(t&1|0)==0;if(I){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(I){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;if((aw|0)==(w|0)){az=ay}else{ax=ay;ay=aw;while(1){a[ax]=a[ay]|0;aw=ax+1|0;t=ay+1|0;if((t|0)==(w|0)){az=aw;break}else{ax=aw;ay=t}}}c[f>>2]=az}az=g&176;if((az|0)==32){c[e>>2]=c[f>>2];return}else if((az|0)==16){return}else{c[e>>2]=d;return}}function iJ(a){a=a|0;le(a);return}function iK(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+48|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+16|0;o=e+24|0;p=e+32|0;q=p;r=i;i=i+12|0;i=i+7>>3<<3;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+4|0;i=i+7>>3<<3;w=i;i=i+100|0;i=i+7>>3<<3;x=i;i=i+4|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=l|0;B=c[h+28>>2]|0;c[A>>2]=B;C=B+4|0;I=c[C>>2]|0,c[C>>2]=I+1,I;C=jp(l,19408)|0;B=C;D=k;E=k;F=a[E]|0;G=F&255;if((G&1|0)==0){H=G>>>1}else{H=c[k+4>>2]|0}if((H|0)==0){J=0}else{if((F&1)==0){K=D+1|0}else{K=c[k+8>>2]|0}F=a[K]|0;J=F<<24>>24==bY[c[(c[C>>2]|0)+28>>2]&31](B,45)<<24>>24}ln(q|0,0,12);ln(s|0,0,12);ln(u|0,0,12);iG(g,J,l,m,n,o,p,r,t,v);l=w|0;w=a[E]|0;g=w&255;C=(g&1|0)==0;if(C){L=g>>>1}else{L=c[k+4>>2]|0}F=c[v>>2]|0;if((L|0)>(F|0)){if(C){M=g>>>1}else{M=c[k+4>>2]|0}g=d[u]|0;if((g&1|0)==0){N=g>>>1}else{N=c[t+4>>2]|0}g=d[s]|0;if((g&1|0)==0){O=g>>>1}else{O=c[r+4>>2]|0}P=((M-F<<1|1)+N|0)+O|0}else{O=d[u]|0;if((O&1|0)==0){Q=O>>>1}else{Q=c[t+4>>2]|0}O=d[s]|0;if((O&1|0)==0){R=O>>>1}else{R=c[r+4>>2]|0}P=(Q+2|0)+R|0}R=P+F|0;do{if(R>>>0>100){P=k4(R)|0;if((P|0)!=0){S=P;T=P;U=a[E]|0;break}P=bi(4)|0;c[P>>2]=11256;aN(P|0,17016,28)}else{S=l;T=0;U=w}}while(0);if((U&1)==0){V=D+1|0;W=D+1|0}else{D=c[k+8>>2]|0;V=D;W=D}D=U&255;if((D&1|0)==0){X=D>>>1}else{X=c[k+4>>2]|0}iI(S,x,y,c[h+4>>2]|0,W,V+X|0,B,J,m,a[n]|0,a[o]|0,p,r,t,F);c[z>>2]=c[f>>2];dR(b,z,S,c[x>>2]|0,c[y>>2]|0,h,j);if((T|0)!=0){k5(T)}if((a[u]&1)!=0){le(c[t+8>>2]|0)}if((a[s]&1)!=0){le(c[r+8>>2]|0)}if((a[q]&1)!=0){le(c[p+8>>2]|0)}p=c[A>>2]|0;A=p+4|0;if(((I=c[A>>2]|0,c[A>>2]=I+ -1,I)|0)!=0){i=e;return}bW[c[(c[p>>2]|0)+8>>2]&255](p|0);i=e;return}function iL(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+560|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e+104|0;n=e+512|0;o=e+520|0;p=e+528|0;q=e+536|0;r=e+544|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+4|0;i=i+7>>3<<3;y=i;i=i+400|0;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=e|0;c[m>>2]=D;E=e+112|0;F=aK(D|0,100,1904,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(F>>>0>99){if(a[20024]|0){G=c[2504]|0}else{D=bI(1,1840,0)|0;c[2504]=D;a[20024]=1;G=D}D=gP(m,G,1904,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;H=c[m>>2]|0;if((H|0)==0){J=bi(4)|0;c[J>>2]=11256;aN(J|0,17016,28)}J=k4(D<<2)|0;K=J;if((J|0)!=0){L=K;M=D;N=H;O=K;break}K=bi(4)|0;c[K>>2]=11256;aN(K|0,17016,28)}else{L=E;M=F;N=0;O=0}}while(0);F=n|0;E=c[j+28>>2]|0;c[F>>2]=E;G=E+4|0;I=c[G>>2]|0,c[G>>2]=I+1,I;G=jp(n,19400)|0;E=G;K=c[m>>2]|0;b7[c[(c[G>>2]|0)+48>>2]&15](E,K,K+M|0,L);if((M|0)==0){P=0}else{P=(a[c[m>>2]|0]|0)==45}ln(s|0,0,12);ln(u|0,0,12);ln(w|0,0,12);iM(g,P,n,o,p,q,r,t,v,x);n=y|0;y=c[x>>2]|0;if((M|0)>(y|0)){x=d[w]|0;if((x&1|0)==0){Q=x>>>1}else{Q=c[v+4>>2]|0}x=d[u]|0;if((x&1|0)==0){R=x>>>1}else{R=c[t+4>>2]|0}S=((M-y<<1|1)+Q|0)+R|0}else{R=d[w]|0;if((R&1|0)==0){T=R>>>1}else{T=c[v+4>>2]|0}R=d[u]|0;if((R&1|0)==0){U=R>>>1}else{U=c[t+4>>2]|0}S=(T+2|0)+U|0}U=S+y|0;do{if(U>>>0>100){S=k4(U<<2)|0;T=S;if((S|0)!=0){V=T;W=T;break}T=bi(4)|0;c[T>>2]=11256;aN(T|0,17016,28)}else{V=n;W=0}}while(0);iO(V,z,A,c[j+4>>2]|0,L,L+(M<<2)|0,E,P,o,c[p>>2]|0,c[q>>2]|0,r,t,v,y);c[C>>2]=c[f>>2];gZ(b,C,V,c[z>>2]|0,c[A>>2]|0,j,k);if((W|0)!=0){k5(W)}if((a[w]&1)!=0){le(c[v+8>>2]|0)}if((a[u]&1)!=0){le(c[t+8>>2]|0)}if((a[s]&1)!=0){le(c[r+8>>2]|0)}r=c[F>>2]|0;F=r+4|0;if(((I=c[F>>2]|0,c[F>>2]=I+ -1,I)|0)==0){bW[c[(c[r>>2]|0)+8>>2]&255](r|0)}if((O|0)!=0){k5(O)}if((N|0)==0){i=e;return}k5(N);i=e;return}function iM(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;n=i;i=i+8|0;o=n|0;p=o;q=i;i=i+12|0;i=i+7>>3<<3;r=q;s=i;i=i+4|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+4|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+4|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;if(b){b=jp(e,19904)|0;N=b;O=c[b>>2]|0;if(d){bX[c[O+44>>2]&127](p,N);p=f;C=c[o>>2]|0;a[p]=C&255;C=C>>8;a[p+1|0]=C&255;C=C>>8;a[p+2|0]=C&255;C=C>>8;a[p+3|0]=C&255;bX[c[(c[b>>2]|0)+32>>2]&127](q,N);q=l;if((a[q]&1)==0){c[l+4>>2]=0;a[q]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}fh(l,0);c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];ln(r|0,0,12)}else{bX[c[O+40>>2]&127](t,N);t=f;C=c[s>>2]|0;a[t]=C&255;C=C>>8;a[t+1|0]=C&255;C=C>>8;a[t+2|0]=C&255;C=C>>8;a[t+3|0]=C&255;bX[c[(c[b>>2]|0)+28>>2]&127](u,N);u=l;if((a[u]&1)==0){c[l+4>>2]=0;a[u]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}fh(l,0);c[u>>2]=c[v>>2];c[u+4>>2]=c[v+4>>2];c[u+8>>2]=c[v+8>>2];ln(v|0,0,12)}v=b;c[g>>2]=b_[c[(c[v>>2]|0)+12>>2]&255](N)|0;c[h>>2]=b_[c[(c[v>>2]|0)+16>>2]&255](N)|0;bX[c[(c[b>>2]|0)+20>>2]&127](w,N);w=j;if((a[w]&1)==0){a[j+1|0]=0;a[w]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eO(j,0);c[w>>2]=c[x>>2];c[w+4>>2]=c[x+4>>2];c[w+8>>2]=c[x+8>>2];ln(x|0,0,12);bX[c[(c[b>>2]|0)+24>>2]&127](y,N);y=k;if((a[y]&1)==0){c[k+4>>2]=0;a[y]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}fh(k,0);c[y>>2]=c[z>>2];c[y+4>>2]=c[z+4>>2];c[y+8>>2]=c[z+8>>2];ln(z|0,0,12);P=b_[c[(c[v>>2]|0)+36>>2]&255](N)|0;c[m>>2]=P;i=n;return}else{N=jp(e,19912)|0;e=N;v=c[N>>2]|0;if(d){bX[c[v+44>>2]&127](B,e);B=f;C=c[A>>2]|0;a[B]=C&255;C=C>>8;a[B+1|0]=C&255;C=C>>8;a[B+2|0]=C&255;C=C>>8;a[B+3|0]=C&255;bX[c[(c[N>>2]|0)+32>>2]&127](D,e);D=l;if((a[D]&1)==0){c[l+4>>2]=0;a[D]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}fh(l,0);c[D>>2]=c[E>>2];c[D+4>>2]=c[E+4>>2];c[D+8>>2]=c[E+8>>2];ln(E|0,0,12)}else{bX[c[v+40>>2]&127](G,e);G=f;C=c[F>>2]|0;a[G]=C&255;C=C>>8;a[G+1|0]=C&255;C=C>>8;a[G+2|0]=C&255;C=C>>8;a[G+3|0]=C&255;bX[c[(c[N>>2]|0)+28>>2]&127](H,e);H=l;if((a[H]&1)==0){c[l+4>>2]=0;a[H]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}fh(l,0);c[H>>2]=c[I>>2];c[H+4>>2]=c[I+4>>2];c[H+8>>2]=c[I+8>>2];ln(I|0,0,12)}I=N;c[g>>2]=b_[c[(c[I>>2]|0)+12>>2]&255](e)|0;c[h>>2]=b_[c[(c[I>>2]|0)+16>>2]&255](e)|0;bX[c[(c[N>>2]|0)+20>>2]&127](J,e);J=j;if((a[J]&1)==0){a[j+1|0]=0;a[J]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eO(j,0);c[J>>2]=c[K>>2];c[J+4>>2]=c[K+4>>2];c[J+8>>2]=c[K+8>>2];ln(K|0,0,12);bX[c[(c[N>>2]|0)+24>>2]&127](L,e);L=k;if((a[L]&1)==0){c[k+4>>2]=0;a[L]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}fh(k,0);c[L>>2]=c[M>>2];c[L+4>>2]=c[M+4>>2];c[L+8>>2]=c[M+8>>2];ln(M|0,0,12);P=b_[c[(c[I>>2]|0)+36>>2]&255](e)|0;c[m>>2]=P;i=n;return}}function iN(a){a=a|0;return}function iO(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;do{if((D|0)==4){E=c[e>>2]|0;F=j?n+4|0:n;G=F;while(1){if(G>>>0>=h>>>0){break}if(bZ[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[G>>2]|0)|0){G=G+4|0}else{break}}if(y){if(G>>>0>F>>>0){H=G;I=q;do{H=H-4|0;J=c[H>>2]|0;K=c[e>>2]|0;c[e>>2]=K+4;c[K>>2]=J;I=I-1|0;L=(I|0)>0;}while(H>>>0>F>>>0&L);if(L){M=I;N=H;O=871}else{P=0;Q=I;R=H}}else{M=q;N=G;O=871}if((O|0)==871){O=0;P=bY[c[(c[r>>2]|0)+44>>2]&31](i,48)|0;Q=M;R=N}J=c[e>>2]|0;c[e>>2]=J+4;if((Q|0)>0){K=Q;S=J;while(1){c[S>>2]=P;T=K-1|0;U=c[e>>2]|0;c[e>>2]=U+4;if((T|0)>0){K=T;S=U}else{V=U;break}}}else{V=J}c[V>>2]=l;W=R}else{W=G}if((W|0)==(F|0)){S=bY[c[(c[r>>2]|0)+44>>2]&31](i,48)|0;K=c[e>>2]|0;c[e>>2]=K+4;c[K>>2]=S}else{S=a[z]|0;K=S&255;if((K&1|0)==0){X=K>>>1}else{X=c[C>>2]|0}if((X|0)==0){Y=W;Z=0;_=0;$=-1}else{if((S&1)==0){aa=A}else{aa=c[B>>2]|0}Y=W;Z=0;_=0;$=a[aa]|0}while(1){do{if((Z|0)==($|0)){S=c[e>>2]|0;c[e>>2]=S+4;c[S>>2]=m;S=_+1|0;K=a[z]|0;H=K&255;if((H&1|0)==0){ab=H>>>1}else{ab=c[C>>2]|0}if(S>>>0>=ab>>>0){ac=$;ad=S;ae=0;break}H=(K&1)==0;if(H){af=A}else{af=c[B>>2]|0}if((a[af+S|0]|0)==127){ac=-1;ad=S;ae=0;break}if(H){ag=A}else{ag=c[B>>2]|0}ac=a[ag+S|0]|0;ad=S;ae=0}else{ac=$;ad=_;ae=Z}}while(0);S=Y-4|0;H=c[S>>2]|0;K=c[e>>2]|0;c[e>>2]=K+4;c[K>>2]=H;if((S|0)==(F|0)){break}else{Y=S;Z=ae+1|0;_=ad;$=ac}}}G=c[e>>2]|0;if((E|0)==(G|0)){ah=F;break}J=G-4|0;if(E>>>0<J>>>0){ai=E;aj=J}else{ah=F;break}while(1){J=c[ai>>2]|0;c[ai>>2]=c[aj>>2];c[aj>>2]=J;J=ai+4|0;G=aj-4|0;if(J>>>0<G>>>0){ai=J;aj=G}else{ah=F;break}}}else if((D|0)==0){c[d>>2]=c[e>>2];ah=n}else if((D|0)==1){c[d>>2]=c[e>>2];F=bY[c[(c[r>>2]|0)+44>>2]&31](i,32)|0;E=c[e>>2]|0;c[e>>2]=E+4;c[E>>2]=F;ah=n}else if((D|0)==3){F=a[s]|0;E=F&255;if((E&1|0)==0){ak=E>>>1}else{ak=c[t>>2]|0}if((ak|0)==0){ah=n;break}if((F&1)==0){al=t}else{al=c[u>>2]|0}F=c[al>>2]|0;E=c[e>>2]|0;c[e>>2]=E+4;c[E>>2]=F;ah=n}else if((D|0)==2){F=a[p]|0;E=F&255;G=(E&1|0)==0;if(G){am=E>>>1}else{am=c[w>>2]|0}if((am|0)==0|v){ah=n;break}if((F&1)==0){an=w;ao=w;ap=w}else{F=c[x>>2]|0;an=F;ao=F;ap=F}if(G){aq=E>>>1}else{aq=c[w>>2]|0}E=an+(aq<<2)|0;G=c[e>>2]|0;if((ao|0)==(E|0)){ar=G}else{F=((an+(aq-1<<2)|0)+(-ap|0)|0)>>>2;J=ao;S=G;while(1){c[S>>2]=c[J>>2];H=J+4|0;if((H|0)==(E|0)){break}J=H;S=S+4|0}ar=G+(F+1<<2)|0}c[e>>2]=ar;ah=n}else{ah=n}}while(0);D=g+1|0;if(D>>>0<4){n=ah;g=D}else{break}}g=a[s]|0;s=g&255;ah=(s&1|0)==0;if(ah){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(ah){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;ah=au+4|0;if((ah|0)==(t|0)){ax=s}else{au=(((at+(aw-2<<2)|0)+(-av|0)|0)>>>2)+1|0;av=s;aw=ah;while(1){c[av>>2]=c[aw>>2];ah=aw+4|0;if((ah|0)==(t|0)){break}else{av=av+4|0;aw=ah}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==32){c[d>>2]=c[e>>2];return}else if((ax|0)==16){return}else{c[d>>2]=b;return}}function iP(a){a=a|0;le(a);return}function iQ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bh(f|0,200)|0;return d>>>(((d|0)!=-1&1)>>>0)|0}function iR(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+48|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+8|0;n=e+16|0;o=e+24|0;p=e+32|0;q=p;r=i;i=i+12|0;i=i+7>>3<<3;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+4|0;i=i+7>>3<<3;w=i;i=i+400|0;x=i;i=i+4|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=l|0;B=c[h+28>>2]|0;c[A>>2]=B;C=B+4|0;I=c[C>>2]|0,c[C>>2]=I+1,I;C=jp(l,19400)|0;B=C;D=k;E=a[D]|0;F=E&255;if((F&1|0)==0){G=F>>>1}else{G=c[k+4>>2]|0}if((G|0)==0){H=0}else{if((E&1)==0){J=k+4|0}else{J=c[k+8>>2]|0}E=c[J>>2]|0;H=(E|0)==(bY[c[(c[C>>2]|0)+44>>2]&31](B,45)|0)}ln(q|0,0,12);ln(s|0,0,12);ln(u|0,0,12);iM(g,H,l,m,n,o,p,r,t,v);l=w|0;w=a[D]|0;g=w&255;C=(g&1|0)==0;if(C){K=g>>>1}else{K=c[k+4>>2]|0}E=c[v>>2]|0;if((K|0)>(E|0)){if(C){L=g>>>1}else{L=c[k+4>>2]|0}g=d[u]|0;if((g&1|0)==0){M=g>>>1}else{M=c[t+4>>2]|0}g=d[s]|0;if((g&1|0)==0){N=g>>>1}else{N=c[r+4>>2]|0}O=((L-E<<1|1)+M|0)+N|0}else{N=d[u]|0;if((N&1|0)==0){P=N>>>1}else{P=c[t+4>>2]|0}N=d[s]|0;if((N&1|0)==0){Q=N>>>1}else{Q=c[r+4>>2]|0}O=(P+2|0)+Q|0}Q=O+E|0;do{if(Q>>>0>100){O=k4(Q<<2)|0;P=O;if((O|0)!=0){R=P;S=P;T=a[D]|0;break}P=bi(4)|0;c[P>>2]=11256;aN(P|0,17016,28)}else{R=l;S=0;T=w}}while(0);if((T&1)==0){U=k+4|0;V=k+4|0}else{w=c[k+8>>2]|0;U=w;V=w}w=T&255;if((w&1|0)==0){W=w>>>1}else{W=c[k+4>>2]|0}iO(R,x,y,c[h+4>>2]|0,V,U+(W<<2)|0,B,H,m,c[n>>2]|0,c[o>>2]|0,p,r,t,E);c[z>>2]=c[f>>2];gZ(b,z,R,c[x>>2]|0,c[y>>2]|0,h,j);if((S|0)!=0){k5(S)}if((a[u]&1)!=0){le(c[t+8>>2]|0)}if((a[s]&1)!=0){le(c[r+8>>2]|0)}if((a[q]&1)!=0){le(c[p+8>>2]|0)}p=c[A>>2]|0;A=p+4|0;if(((I=c[A>>2]|0,c[A>>2]=I+ -1,I)|0)!=0){i=e;return}bW[c[(c[p>>2]|0)+8>>2]&255](p|0);i=e;return}function iS(a){a=a|0;return}function iT(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;i=i+16|0;j=d|0;k=j;ln(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=p;do{eI(j,a[q]|0);q=q+1|0;}while(q>>>0<h>>>0);q=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){r=q;s=1014;break}t=c[j+8>>2]|0;u=q}else{r=(e|0)==-1?-1:e<<1;s=1014}}while(0);if((s|0)==1014){t=j+1|0;u=r}r=a4(u|0,f|0,g|0,t|0)|0;ln(l|0,0,12);l=ll(r|0)|0;t=r+l|0;if((l|0)>0){l=r;do{eI(b,a[l]|0);l=l+1|0;}while(l>>>0<t>>>0)}if((a[k]&1)==0){i=d;return}le(c[j+8>>2]|0);i=d;return}function iU(a,b){a=a|0;b=b|0;a$(((b|0)==-1?-1:b<<1)|0);return}function iV(a){a=a|0;le(a);return}function iW(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bh(f|0,200)|0;return d>>>(((d|0)!=-1&1)>>>0)|0}function iX(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;ln(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=12952;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=z;C=12952;while(1){c[m>>2]=x;D=(b3[c[C+12>>2]&31](w,j,x,h,m,y,A,l)|0)==2;if(D|(c[m>>2]|0)==(x|0)){is(1112)}if(y>>>0<(c[l>>2]|0)>>>0){E=y;do{eI(r,a[E]|0);E=E+1|0;}while(E>>>0<(c[l>>2]|0)>>>0)}E=c[m>>2]|0;if(E>>>0>=h>>>0|D){break}x=E;C=c[B>>2]|0}B=(e|0)==-1?-1:e<<1;if((a[s]&1)==0){F=B;G=1058;break}H=c[r+8>>2]|0;I=B}else{F=(e|0)==-1?-1:e<<1;G=1058}}while(0);if((G|0)==1058){H=r+1|0;I=F}F=a4(I|0,f|0,g|0,H|0)|0;ln(v|0,0,12);v=u|0;c[u+4>>2]=0;c[u>>2]=12896;H=ll(F|0)|0;g=F+H|0;L1235:do{if((H|0)>=1){f=u;I=g;G=o|0;e=o+128|0;h=F;m=12896;while(1){c[q>>2]=h;l=(b3[c[m+16>>2]&31](v,n,h,(I-h|0)>32?h+32|0:g,q,G,e,p)|0)==2;if(l|(c[q>>2]|0)==(h|0)){is(1112)}if(G>>>0<(c[p>>2]|0)>>>0){j=G;do{e7(b,c[j>>2]|0);j=j+4|0;}while(j>>>0<(c[p>>2]|0)>>>0)}j=c[q>>2]|0;if(j>>>0>=g>>>0|l){break L1235}h=j;m=c[f>>2]|0}}}while(0);if((a[s]&1)==0){i=d;return}le(c[r+8>>2]|0);i=d;return}function iY(a,b){a=a|0;b=b|0;a$(((b|0)==-1?-1:b<<1)|0);return}function iZ(a){a=a|0;var b=0;c[a>>2]=12416;b=c[a+8>>2]|0;if((b|0)==0){return}bg(b|0);return}function i_(b){b=b|0;var d=0,e=0,f=0,g=0;b=bi(8)|0;c[b>>2]=11384;d=b+4|0;if((d|0)==0){e=b;c[e>>2]=11352;aN(b|0,17064,88)}f=lb(19)|0;c[f+4>>2]=6;c[f>>2]=6;g=f+12|0;c[d>>2]=g;c[f+8>>2]=0;a[g]=a[1864]|0;a[g+1|0]=a[1865|0]|0;a[g+2|0]=a[1866|0]|0;a[g+3|0]=a[1867|0]|0;a[g+4|0]=a[1868|0]|0;a[g+5|0]=a[1869|0]|0;a[g+6|0]=a[1870|0]|0;e=b;c[e>>2]=11352;aN(b|0,17064,88)}function i$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1;c[b>>2]=12672;d=b+8|0;I=b+12|0;a[b+136|0]=1;J=b+24|0;K=J;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J+112;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J-1|0;}while((J|0)!=0);J=b+144|0;K=J;a[J]=2;a[K+1|0]=67;a[K+2|0]=0;K=c[d>>2]|0;if((K|0)!=(L|0)){c[I>>2]=M+(-((M+(-K|0)|0)>>>2)<<2)}c[2561]=0;c[2560]=12376;if((c[4772]|0)!=-1){c[H>>2]=19088;c[H+4>>2]=12;c[H+8>>2]=0;eM(19088,H,90)}jg(b,10240,(c[4773]|0)-1|0);c[2559]=0;c[2558]=12336;if((c[4770]|0)!=-1){c[G>>2]=19080;c[G+4>>2]=12;c[G+8>>2]=0;eM(19080,G,90)}jg(b,10232,(c[4771]|0)-1|0);c[2615]=0;c[2614]=12784;c[2616]=0;a[10468]=0;c[2616]=c[be()>>2];if((c[4852]|0)!=-1){c[F>>2]=19408;c[F+4>>2]=12;c[F+8>>2]=0;eM(19408,F,90)}jg(b,10456,(c[4853]|0)-1|0);c[2613]=0;c[2612]=12704;if((c[4850]|0)!=-1){c[E>>2]=19400;c[E+4>>2]=12;c[E+8>>2]=0;eM(19400,E,90)}jg(b,10448,(c[4851]|0)-1|0);c[2567]=0;c[2566]=12472;if((c[4776]|0)!=-1){c[D>>2]=19104;c[D+4>>2]=12;c[D+8>>2]=0;eM(19104,D,90)}jg(b,10264,(c[4777]|0)-1|0);c[2563]=0;c[2562]=12416;c[2564]=0;if((c[4774]|0)!=-1){c[C>>2]=19096;c[C+4>>2]=12;c[C+8>>2]=0;eM(19096,C,90)}jg(b,10248,(c[4775]|0)-1|0);c[2569]=0;c[2568]=12528;if((c[4778]|0)!=-1){c[B>>2]=19112;c[B+4>>2]=12;c[B+8>>2]=0;eM(19112,B,90)}jg(b,10272,(c[4779]|0)-1|0);c[2571]=0;c[2570]=12584;if((c[4780]|0)!=-1){c[A>>2]=19120;c[A+4>>2]=12;c[A+8>>2]=0;eM(19120,A,90)}jg(b,10280,(c[4781]|0)-1|0);c[2541]=0;c[2540]=11880;a[10168]=46;a[10169]=44;ln(10172,0,12);if((c[4756]|0)!=-1){c[z>>2]=19024;c[z+4>>2]=12;c[z+8>>2]=0;eM(19024,z,90)}jg(b,10160,(c[4757]|0)-1|0);c[2533]=0;c[2532]=11832;c[2534]=46;c[2535]=44;ln(10144,0,12);if((c[4754]|0)!=-1){c[y>>2]=19016;c[y+4>>2]=12;c[y+8>>2]=0;eM(19016,y,90)}jg(b,10128,(c[4755]|0)-1|0);c[2557]=0;c[2556]=12264;if((c[4768]|0)!=-1){c[x>>2]=19072;c[x+4>>2]=12;c[x+8>>2]=0;eM(19072,x,90)}jg(b,10224,(c[4769]|0)-1|0);c[2555]=0;c[2554]=12192;if((c[4766]|0)!=-1){c[w>>2]=19064;c[w+4>>2]=12;c[w+8>>2]=0;eM(19064,w,90)}jg(b,10216,(c[4767]|0)-1|0);c[2553]=0;c[2552]=12128;if((c[4764]|0)!=-1){c[v>>2]=19056;c[v+4>>2]=12;c[v+8>>2]=0;eM(19056,v,90)}jg(b,10208,(c[4765]|0)-1|0);c[2551]=0;c[2550]=12064;if((c[4762]|0)!=-1){c[u>>2]=19048;c[u+4>>2]=12;c[u+8>>2]=0;eM(19048,u,90)}jg(b,10200,(c[4763]|0)-1|0);c[2625]=0;c[2624]=13712;if((c[4982]|0)!=-1){c[t>>2]=19928;c[t+4>>2]=12;c[t+8>>2]=0;eM(19928,t,90)}jg(b,10496,(c[4983]|0)-1|0);c[2623]=0;c[2622]=13648;if((c[4980]|0)!=-1){c[s>>2]=19920;c[s+4>>2]=12;c[s+8>>2]=0;eM(19920,s,90)}jg(b,10488,(c[4981]|0)-1|0);c[2621]=0;c[2620]=13584;if((c[4978]|0)!=-1){c[r>>2]=19912;c[r+4>>2]=12;c[r+8>>2]=0;eM(19912,r,90)}jg(b,10480,(c[4979]|0)-1|0);c[2619]=0;c[2618]=13520;if((c[4976]|0)!=-1){c[q>>2]=19904;c[q+4>>2]=12;c[q+8>>2]=0;eM(19904,q,90)}jg(b,10472,(c[4977]|0)-1|0);c[2515]=0;c[2514]=11536;if((c[4744]|0)!=-1){c[p>>2]=18976;c[p+4>>2]=12;c[p+8>>2]=0;eM(18976,p,90)}jg(b,10056,(c[4745]|0)-1|0);c[2513]=0;c[2512]=11496;if((c[4742]|0)!=-1){c[o>>2]=18968;c[o+4>>2]=12;c[o+8>>2]=0;eM(18968,o,90)}jg(b,10048,(c[4743]|0)-1|0);c[2511]=0;c[2510]=11456;if((c[4740]|0)!=-1){c[n>>2]=18960;c[n+4>>2]=12;c[n+8>>2]=0;eM(18960,n,90)}jg(b,10040,(c[4741]|0)-1|0);c[2509]=0;c[2508]=11416;if((c[4738]|0)!=-1){c[m>>2]=18952;c[m+4>>2]=12;c[m+8>>2]=0;eM(18952,m,90)}jg(b,10032,(c[4739]|0)-1|0);c[2529]=0;c[2528]=11736;c[2530]=11784;if((c[4752]|0)!=-1){c[l>>2]=19008;c[l+4>>2]=12;c[l+8>>2]=0;eM(19008,l,90)}jg(b,10112,(c[4753]|0)-1|0);c[2525]=0;c[2524]=11640;c[2526]=11688;if((c[4750]|0)!=-1){c[k>>2]=19e3;c[k+4>>2]=12;c[k+8>>2]=0;eM(19e3,k,90)}jg(b,10096,(c[4751]|0)-1|0);c[2521]=0;c[2520]=12640;if(a[20024]|0){N=c[2504]|0}else{k=bI(1,1840,0)|0;c[2504]=k;a[20024]=1;N=k}c[2522]=N;c[2520]=11608;if((c[4748]|0)!=-1){c[j>>2]=18992;c[j+4>>2]=12;c[j+8>>2]=0;eM(18992,j,90)}jg(b,10080,(c[4749]|0)-1|0);c[2517]=0;c[2516]=12640;if(a[20024]|0){O=c[2504]|0}else{j=bI(1,1840,0)|0;c[2504]=j;a[20024]=1;O=j}c[2518]=O;c[2516]=11576;if((c[4746]|0)!=-1){c[h>>2]=18984;c[h+4>>2]=12;c[h+8>>2]=0;eM(18984,h,90)}jg(b,10064,(c[4747]|0)-1|0);c[2549]=0;c[2548]=11968;if((c[4760]|0)!=-1){c[g>>2]=19040;c[g+4>>2]=12;c[g+8>>2]=0;eM(19040,g,90)}jg(b,10192,(c[4761]|0)-1|0);c[2547]=0;c[2546]=11928;if((c[4758]|0)!=-1){c[f>>2]=19032;c[f+4>>2]=12;c[f+8>>2]=0;eM(19032,f,90)}jg(b,10184,(c[4759]|0)-1|0);i=e;return}function i0(a,b){a=a|0;b=b|0;return b|0}function i1(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function i2(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function i3(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function i4(a){a=a|0;return 1}function i5(a){a=a|0;return 1}function i6(a){a=a|0;return 1}function i7(a,b){a=a|0;b=b|0;return b<<24>>24|0}function i8(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function i9(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function ja(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function jb(a){a=a|0;c[a+4>>2]=(I=c[4782]|0,c[4782]=I+1,I)+1;return}function jc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function jd(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=(((e-4|0)+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function je(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function jf(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function jg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=b+4|0;I=c[e>>2]|0,c[e>>2]=I+1,I;e=a+8|0;f=a+12|0;a=c[f>>2]|0;g=e|0;h=c[g>>2]|0;i=a-h>>2;do{if(i>>>0>d>>>0){j=h}else{k=d+1|0;if(i>>>0<k>>>0){kF(e,k-i|0);j=c[g>>2]|0;break}if(i>>>0<=k>>>0){j=h;break}l=h+(k<<2)|0;if((l|0)==(a|0)){j=h;break}c[f>>2]=a+((((a-4|0)+(-l|0)|0)>>>2^-1)<<2);j=h}}while(0);h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}j=h+4|0;if(((I=c[j>>2]|0,c[j>>2]=I+ -1,I)|0)!=0){m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}bW[c[(c[h>>2]|0)+8>>2]&255](h|0);m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}function jh(a){a=a|0;ji(a);le(a);return}function ji(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;c[b>>2]=12672;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((e|0)==(g|0)){h=e}else{e=0;i=g;while(1){g=c[i+(e<<2)>>2]|0;do{if((g|0)!=0){j=g+4|0;if(((I=c[j>>2]|0,c[j>>2]=I+ -1,I)|0)!=0){break}bW[c[(c[g>>2]|0)+8>>2]&255](g|0)}}while(0);g=e+1|0;j=c[f>>2]|0;if(g>>>0<(c[d>>2]|0)-j>>2>>>0){e=g;i=j}else{h=j;break}}}if((a[b+144|0]&1)==0){k=h}else{le(c[b+152>>2]|0);k=c[f>>2]|0}if((k|0)==0){return}f=c[d>>2]|0;if((k|0)!=(f|0)){c[d>>2]=f+((((f-4|0)+(-k|0)|0)>>>2^-1)<<2)}if((k|0)==(b+24|0)){a[b+136|0]=0;return}else{le(k);return}}function jj(a){a=a|0;le(a);return}function jk(a){a=a|0;if((a|0)==0){return}bW[c[(c[a>>2]|0)+4>>2]&255](a);return}function jl(a){a=a|0;le(a);return}function jm(b){b=b|0;var d=0;c[b>>2]=12784;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}lf(d)}}while(0);le(b);return}function jn(b){b=b|0;var d=0;c[b>>2]=12784;d=c[b+8>>2]|0;if((d|0)==0){return}if((a[b+12|0]&1)==0){return}lf(d);return}function jo(a){a=a|0;le(a);return}function jp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;eM(a,e,90)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=bi(4)|0;h=g;c[h>>2]=11288;aN(g|0,17032,184);return 0}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=bi(4)|0;h=g;c[h>>2]=11288;aN(g|0,17032,184);return 0}else{i=d;return f|0}return 0}function jq(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[be()>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function jr(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[be()>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function js(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[be()>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=1327;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=1328;break}else{h=e}}if((i|0)==1327){return g|0}else if((i|0)==1328){return g|0}return 0}function jt(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=1336;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=1337;break}if((b[(c[be()>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=1338;break}else{a=a+4|0}}if((h|0)==1336){return g|0}else if((h|0)==1337){return g|0}else if((h|0)==1338){return g|0}return 0}function ju(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[bt()>>2]|0)+(b<<2)>>2]|0;return d|0}function jv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[bt()>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function jw(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[bv()>>2]|0)+(b<<2)>>2]|0;return d|0}function jx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[bv()>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function jy(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[bt()>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function jz(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[bt()>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function jA(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[bv()>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function jB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[bv()>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function jC(a){a=a|0;var b=0,d=0;c[a>>2]=12416;b=c[a+8>>2]|0;if((b|0)==0){d=a;le(d);return}bg(b|0);d=a;le(d);return}function jD(a){a=a|0;return 0}function jE(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L1627:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=1440;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=1441;break L1627}c[j>>2]=p+1;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=1442;break L1627}c[j>>2]=p+1;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=1443;break L1627}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=1444;break L1627}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=1436;break L1627}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=1447;break L1627}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=1448;break L1627}if((d-(c[j>>2]|0)|0)<4){m=1;o=1446;break L1627}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=1445;break L1627}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=1437;break}}if((o|0)==1437){return m|0}else if((o|0)==1440){return m|0}else if((o|0)==1441){return m|0}else if((o|0)==1442){return m|0}else if((o|0)==1443){return m|0}else if((o|0)==1444){return m|0}else if((o|0)==1445){return m|0}else if((o|0)==1436){return m|0}else if((o|0)==1446){return m|0}else if((o|0)==1447){return m|0}else if((o|0)==1448){return m|0}return 0}function jF(a){a=a|0;le(a);return}function jG(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jE(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g|0);i=b;return l|0}function jH(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jS(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d|0);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function jI(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=e;while(1){if((d|0)==(f|0)){k=f;break}if((c[d>>2]|0)==0){k=d;break}else{d=d+4|0}}c[j>>2]=h;c[g>>2]=e;L1672:do{if((e|0)==(f|0)|(h|0)==(i|0)){l=e}else{d=i;m=b+8|0;n=h;o=e;p=k;while(1){q=bN(c[m>>2]|0)|0;r=kP(n,g,p-o>>2,d-n|0,0)|0;if((q|0)!=0){bN(q|0)}if((r|0)==(-1|0)){s=1461;break}else if((r|0)==0){t=1;s=1483;break}q=(c[j>>2]|0)+r|0;c[j>>2]=q;if((q|0)==(i|0)){s=1480;break}if((p|0)==(f|0)){u=f;v=q;w=c[g>>2]|0}else{q=bN(c[m>>2]|0)|0;if((q|0)!=0){bN(q|0)}q=c[j>>2]|0;if((q|0)==(i|0)){t=1;s=1485;break}c[j>>2]=q+1;a[q]=0;q=(c[g>>2]|0)+4|0;c[g>>2]=q;r=q;while(1){if((r|0)==(f|0)){x=f;break}if((c[r>>2]|0)==0){x=r;break}else{r=r+4|0}}u=x;v=c[j>>2]|0;w=q}if((w|0)==(f|0)|(v|0)==(i|0)){l=w;break L1672}else{n=v;o=w;p=u}}if((s|0)==1480){l=c[g>>2]|0;break}else if((s|0)==1461){c[j>>2]=n;L1696:do{if((o|0)==(c[g>>2]|0)){y=o}else{p=o;d=n;while(1){r=c[p>>2]|0;z=bN(c[m>>2]|0)|0;A=kO(d,r,0)|0;if((z|0)!=0){bN(z|0)}if((A|0)==-1){y=p;break L1696}z=(c[j>>2]|0)+A|0;c[j>>2]=z;A=p+4|0;if((A|0)==(c[g>>2]|0)){y=A;break}else{p=A;d=z}}}}while(0);c[g>>2]=y;t=2;return t|0}else if((s|0)==1483){return t|0}else if((s|0)==1485){return t|0}}}while(0);t=(l|0)!=(f|0)&1;return t|0}function jJ(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L1714:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=w;x=v;w=bN(c[s>>2]|0)|0;y=kM(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){bN(w|0)}if((y|0)==0){z=2;A=1523;break}else if((y|0)==(-1|0)){A=1496;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){A=1518;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=bN(c[s>>2]|0)|0;F=kL(w,y,1,d)|0;if((E|0)!=0){bN(E|0)}if((F|0)!=0){z=2;A=1521;break}c[k>>2]=(c[k>>2]|0)+4;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L1714}else{t=C;u=D;v=B}}if((A|0)==1523){i=l;return z|0}else if((A|0)==1521){i=l;return z|0}else if((A|0)==1496){c[k>>2]=t;L1738:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=bN(c[s>>2]|0)|0;E=kL(v,r,x-r|0,n)|0;if((o|0)!=0){bN(o|0)}if((E|0)==(-1|0)){A=1502;break}else if((E|0)==0){I=r+1|0}else if((E|0)==(-2|0)){A=1503;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L1738}else{v=E;r=I}}if((A|0)==1502){c[g>>2]=r;z=2;i=l;return z|0}else if((A|0)==1503){c[g>>2]=r;z=1;i=l;return z|0}}}while(0);c[g>>2]=H;z=(H|0)!=(f|0)&1;i=l;return z|0}else if((A|0)==1518){q=c[g>>2]|0;break}}}while(0);z=(q|0)!=(f|0)&1;i=l;return z|0}function jK(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;d=bN(c[a+8>>2]|0)|0;if((d|0)==0){return 0}bN(d|0);return 0}function jL(a){a=a|0;var b=0,d=0,e=0;b=a+8|0;a=bN(c[b>>2]|0)|0;if((a|0)!=0){bN(a|0)}a=c[b>>2]|0;if((a|0)==0){return 1}b=bN(a|0)|0;a=aL()|0;if((b|0)==0){d=(a|0)==1;e=d&1;return e|0}bN(b|0);d=(a|0)==1;e=d&1;return e|0}function jM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=(b|0)!=0?b:112;b=d;d=0;j=0;while(1){k=bN(c[i>>2]|0)|0;l=kL(0,b,h-b|0,a)|0;if((k|0)!=0){bN(k|0)}if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;m=1564;break}else if((l|0)==0){n=1;o=b+1|0}else{n=l;o=b+l|0}l=n+d|0;k=j+1|0;if(k>>>0>=f>>>0|(o|0)==(e|0)){g=l;m=1562;break}else{b=o;d=l;j=k}}if((m|0)==1564){return g|0}else if((m|0)==1562){return g|0}return 0}function jN(a){a=a|0;var b=0,d=0,e=0;b=c[a+8>>2]|0;do{if((b|0)==0){d=1}else{a=bN(b|0)|0;e=aL()|0;if((a|0)==0){d=e;break}bN(a|0);d=e}}while(0);return d|0}function jO(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function jP(a){a=a|0;return 0}function jQ(a){a=a|0;return 0}function jR(a){a=a|0;return 4}function jS(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L1812:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L1814:while(1){if(e>>>0>=i>>>0){o=n;break L1812}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=1637;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1}else{if((p&255)<194){r=2;s=1629;break L1814}if((p&255)<224){if((h-n|0)<2){r=1;s=1636;break L1814}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=1622;break L1814}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=1633;break L1814}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2;break}if((p&255)<240){if((h-n|0)<3){r=1;s=1640;break L1814}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=1628;break L1814}}else if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=1634;break L1814}}else{if((u&-64)<<24>>24!=-128){r=2;s=1635;break L1814}}v=t&255;if((v&192|0)!=128){r=2;s=1641;break L1814}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=1642;break L1814}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3;break}if((p&255)>=245){r=2;s=1638;break L1814}if((h-n|0)<4){r=1;s=1639;break L1814}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==240){if((t+112&255)>=48){r=2;s=1626;break L1814}}else if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=1627;break L1814}}else{if((t&-64)<<24>>24!=-128){r=2;s=1630;break L1814}}w=v&255;if((w&192|0)!=128){r=2;s=1631;break L1814}v=u&255;if((v&192|0)!=128){r=2;s=1632;break L1814}if((l-e|0)<4){r=1;s=1623;break L1814}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=1624;break L1814}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L1812}}if((s|0)==1626){return r|0}else if((s|0)==1627){return r|0}else if((s|0)==1628){return r|0}else if((s|0)==1629){return r|0}else if((s|0)==1630){return r|0}else if((s|0)==1622){return r|0}else if((s|0)==1623){return r|0}else if((s|0)==1624){return r|0}else if((s|0)==1631){return r|0}else if((s|0)==1632){return r|0}else if((s|0)==1633){return r|0}else if((s|0)==1634){return r|0}else if((s|0)==1641){return r|0}else if((s|0)==1642){return r|0}else if((s|0)==1635){return r|0}else if((s|0)==1636){return r|0}else if((s|0)==1637){return r|0}else if((s|0)==1638){return r|0}else if((s|0)==1639){return r|0}else if((s|0)==1640){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0&1;return r|0}
function jT(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L1881:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L1883:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L1881}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L1881}if((k&255)<224){if((g-j|0)<2){m=j;break L1881}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L1881}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L1881}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L1881}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==237){if((p&-32)<<24>>24!=-128){s=1665;break L1883}}else if((l|0)==224){if((p&-32)<<24>>24!=-96){s=1663;break L1883}}else{if((p&-64)<<24>>24!=-128){s=1667;break L1883}}t=r&255;if((t&192|0)!=128){m=j;break L1881}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L1881}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L1881}u=j;if((g-u|0)<4){m=j;break L1881}if((e-i|0)>>>0<2){m=j;break L1881}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==240){if((t+112&255)>=48){s=1676;break L1883}}else if((l|0)==244){if((t&-16)<<24>>24!=-128){s=1678;break L1883}}else{if((t&-64)<<24>>24!=-128){s=1680;break L1883}}v=p&255;if((v&192|0)!=128){m=j;break L1881}p=r&255;if((p&192|0)!=128){m=j;break L1881}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L1881}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L1881}}if((s|0)==1676){w=u-b|0;return w|0}else if((s|0)==1667){w=q-b|0;return w|0}else if((s|0)==1680){w=u-b|0;return w|0}else if((s|0)==1663){w=q-b|0;return w|0}else if((s|0)==1678){w=u-b|0;return w|0}else if((s|0)==1665){w=q-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function jU(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L1944:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=1714;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=1718;break L1944}c[h>>2]=b+1;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=1719;break L1944}c[h>>2]=b+1;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=1720;break L1944}c[h>>2]=b+1;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=1721;break L1944}c[h>>2]=b+1;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=1715;break}}if((l|0)==1718){return k|0}else if((l|0)==1720){return k|0}else if((l|0)==1715){return k|0}else if((l|0)==1721){return k|0}else if((l|0)==1714){return k|0}else if((l|0)==1719){return k|0}return 0}function jV(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jT(c,d,e,1114111,0)|0}function jW(a){a=a|0;le(a);return}function jX(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jU(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g|0);i=b;return l|0}function jY(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=j1(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d|0);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function jZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function j_(a){a=a|0;return 0}function j$(a){a=a|0;return 0}function j0(a){a=a|0;return 4}function j1(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L1984:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L1986:while(1){if(k>>>0>=h>>>0){m=b;break L1984}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=1771;break L1986}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1}else{if((n&255)<194){p=2;q=1789;break L1986}if((n&255)<224){if((g-b|0)<2){p=1;q=1785;break L1986}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=1778;break L1986}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=1779;break L1986}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2;break}if((n&255)<240){if((g-b|0)<3){p=1;q=1776;break L1986}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=1775;break L1986}}else if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=1777;break L1986}}else{if((s&-64)<<24>>24!=-128){p=2;q=1774;break L1986}}t=r&255;if((t&192|0)!=128){p=2;q=1780;break L1986}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=1788;break L1986}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3;break}if((n&255)>=245){p=2;q=1786;break L1986}if((g-b|0)<4){p=1;q=1773;break L1986}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=1770;break L1986}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=1781;break L1986}}else{if((r&-64)<<24>>24!=-128){p=2;q=1783;break L1986}}u=t&255;if((u&192|0)!=128){p=2;q=1784;break L1986}t=s&255;if((t&192|0)!=128){p=2;q=1772;break L1986}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=1787;break L1986}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L1984}}if((q|0)==1770){return p|0}else if((q|0)==1771){return p|0}else if((q|0)==1772){return p|0}else if((q|0)==1773){return p|0}else if((q|0)==1774){return p|0}else if((q|0)==1775){return p|0}else if((q|0)==1776){return p|0}else if((q|0)==1777){return p|0}else if((q|0)==1778){return p|0}else if((q|0)==1785){return p|0}else if((q|0)==1786){return p|0}else if((q|0)==1787){return p|0}else if((q|0)==1788){return p|0}else if((q|0)==1789){return p|0}else if((q|0)==1779){return p|0}else if((q|0)==1780){return p|0}else if((q|0)==1781){return p|0}else if((q|0)==1783){return p|0}else if((q|0)==1784){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0&1;return p|0}function j2(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2051:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L2053:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L2051}n=j+1|0}else{if((k&255)<194){m=j;break L2051}if((k&255)<224){if((g-j|0)<2){m=j;break L2051}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L2051}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L2051}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L2051}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==224){if((o&-32)<<24>>24!=-96){r=1810;break L2053}}else if((l|0)==237){if((o&-32)<<24>>24!=-128){r=1812;break L2053}}else{if((o&-64)<<24>>24!=-128){r=1814;break L2053}}s=q&255;if((s&192|0)!=128){m=j;break L2051}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L2051}n=j+3|0;break}if((k&255)>=245){m=j;break L2051}t=j;if((g-t|0)<4){m=j;break L2051}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==240){if((s+112&255)>=48){r=1822;break L2053}}else if((l|0)==244){if((s&-16)<<24>>24!=-128){r=1824;break L2053}}else{if((s&-64)<<24>>24!=-128){r=1826;break L2053}}u=o&255;if((u&192|0)!=128){m=j;break L2051}o=q&255;if((o&192|0)!=128){m=j;break L2051}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L2051}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L2051}i=i+1|0;j=n}if((r|0)==1824){v=t-b|0;return v|0}else if((r|0)==1826){v=t-b|0;return v|0}else if((r|0)==1810){v=p-b|0;return v|0}else if((r|0)==1812){v=p-b|0;return v|0}else if((r|0)==1814){v=p-b|0;return v|0}else if((r|0)==1822){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function j3(b){b=b|0;return a[b+8|0]|0}function j4(a){a=a|0;return c[a+8>>2]|0}function j5(b){b=b|0;return a[b+9|0]|0}function j6(a){a=a|0;return c[a+12>>2]|0}function j7(b,c){b=b|0;c=c|0;c=b;a[b]=8;b=c+1|0;C=1702195828;a[b]=C&255;C=C>>8;a[b+1|0]=C&255;C=C>>8;a[b+2|0]=C&255;C=C>>8;a[b+3|0]=C&255;a[c+5|0]=0;return}function j8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return j2(c,d,e,1114111,0)|0}function j9(a){a=a|0;le(a);return}function ka(a){a=a|0;le(a);return}function kb(b){b=b|0;var d=0;c[b>>2]=11880;if((a[b+12|0]&1)==0){d=b;le(d);return}le(c[b+20>>2]|0);d=b;le(d);return}function kc(b){b=b|0;c[b>>2]=11880;if((a[b+12|0]&1)==0){return}le(c[b+20>>2]|0);return}function kd(b){b=b|0;var d=0;c[b>>2]=11832;if((a[b+16|0]&1)==0){d=b;le(d);return}le(c[b+24>>2]|0);d=b;le(d);return}function ke(b){b=b|0;c[b>>2]=11832;if((a[b+16|0]&1)==0){return}le(c[b+24>>2]|0);return}function kf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=la(32)|0;d=b;c[a+8>>2]=d;c[a>>2]=9;c[a+4>>2]=4;a=1472;e=4;f=d;while(1){d=e-1|0;c[f>>2]=c[a>>2];if((d|0)==0){break}else{a=a+4|0;e=d;f=f+4|0}}c[b+16>>2]=0;return}function kg(b,c){b=b|0;c=c|0;c=b;a[b]=10;b=c+1|0;a[b]=a[1456]|0;a[b+1|0]=a[1457|0]|0;a[b+2|0]=a[1458|0]|0;a[b+3|0]=a[1459|0]|0;a[b+4|0]=a[1460|0]|0;a[c+6|0]=0;return}function kh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=la(32)|0;d=b;c[a+8>>2]=d;c[a>>2]=9;c[a+4>>2]=5;a=1432;e=5;f=d;while(1){d=e-1|0;c[f>>2]=c[a>>2];if((d|0)==0){break}else{a=a+4|0;e=d;f=f+4|0}}c[b+20>>2]=0;return}function ki(b){b=b|0;var d=0;if(a[20104]|0){d=c[2726]|0;return d|0}if(!(a[19992]|0)){ln(9528|0,0|0,168|0);aR(250,0,u|0);a[19992]=1}eH(9528,2336,6);eH(9540,2328,6);eH(9552,2320,7);eH(9564,2304,9);eH(9576,2288,8);eH(9588,2280,6);eH(9600,2264,8);eH(9612,2256,3);eH(9624,2248,3);eH(9636,2160,3);eH(9648,2152,3);eH(9660,2144,3);eH(9672,2128,3);eH(9684,2120,3);c[2726]=9528;a[20104]=1;d=9528;return d|0}function kj(b){b=b|0;var d=0;if(a[20048]|0){d=c[2704]|0;return d|0}if(!(a[19968]|0)){ln(8784|0,0|0,168|0);aR(138,0,u|0);a[19968]=1}eL(8784,2744,6);eL(8796,2712,6);eL(8808,2680,7);eL(8820,2640,9);eL(8832,2592,8);eL(8844,2560,6);eL(8856,2520,8);eL(8868,2504,3);eL(8880,2488,3);eL(8892,2472,3);eL(8904,2416,3);eL(8916,2400,3);eL(8928,2384,3);eL(8940,2368,3);c[2704]=8784;a[20048]=1;d=8784;return d|0}function kk(b){b=b|0;var d=0;if(a[20096]|0){d=c[2724]|0;return d|0}if(!(a[19984]|0)){ln(9240|0,0|0,288|0);aR(160,0,u|0);a[19984]=1}eH(9240,408,7);eH(9252,392,8);eH(9264,368,5);eH(9276,360,5);eH(9288,352,3);eH(9300,344,4);eH(9312,336,4);eH(9324,328,6);eH(9336,248,9);eH(9348,240,7);eH(9360,184,8);eH(9372,168,8);eH(9384,160,3);eH(9396,152,3);eH(9408,144,3);eH(9420,136,3);eH(9432,352,3);eH(9444,128,3);eH(9456,120,3);eH(9468,2808,3);eH(9480,2800,3);eH(9492,2792,3);eH(9504,2784,3);eH(9516,2776,3);c[2724]=9240;a[20096]=1;d=9240;return d|0}function kl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d+12|0;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+20>>2]|0;f=c[d+16>>2]|0;if((f|0)==-1){eN(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=la(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}lj(g|0,e|0,f);a[g+f|0]=0;return}function km(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d+16|0;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+24>>2]|0;f=c[d+20>>2]|0;if((f|0)==-1){eN(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=la(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}lj(g|0,e|0,f);a[g+f|0]=0;return}function kn(b){b=b|0;var d=0;if(a[20040]|0){d=c[2702]|0;return d|0}if(!(a[19960]|0)){ln(8496|0,0|0,288|0);aR(114,0,u|0);a[19960]=1}eL(8496,1008,7);eL(8508,968,8);eL(8520,944,5);eL(8532,872,5);eL(8544,544,3);eL(8556,848,4);eL(8568,824,4);eL(8580,792,6);eL(8592,752,9);eL(8604,720,7);eL(8616,680,8);eL(8628,640,8);eL(8640,624,3);eL(8652,592,3);eL(8664,576,3);eL(8676,560,3);eL(8688,544,3);eL(8700,528,3);eL(8712,512,3);eL(8724,496,3);eL(8736,480,3);eL(8748,464,3);eL(8760,448,3);eL(8772,416,3);c[2702]=8496;a[20040]=1;d=8496;return d|0}function ko(b){b=b|0;var d=0;if(a[20112]|0){d=c[2728]|0;return d|0}if(!(a[2e4]|0)){ln(9696|0,0|0,288|0);aR(112,0,u|0);a[2e4]=1}eH(9696,1048,2);eH(9708,1040,2);c[2728]=9696;a[20112]=1;d=9696;return d|0}function kp(b){b=b|0;var d=0;if(a[20056]|0){d=c[2706]|0;return d|0}if(!(a[19976]|0)){ln(8952|0,0|0,288|0);aR(226,0,u|0);a[19976]=1}eL(8952,1072,2);eL(8964,1056,2);c[2706]=8952;a[20056]=1;d=8952;return d|0}function kq(b){b=b|0;var c=0;if(a[20120]|0){return 10920}a[10920]=16;b=10921;c=b|0;C=623865125;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;c=b+4|0;C=2032480100;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;a[10929|0]=0;aR(242,10920,u|0);a[20120]=1;return 10920}function kr(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[20064]|0){return 10832}b=la(48)|0;d=b;c[2710]=d;c[2708]=13;c[2709]=8;e=1368;f=8;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+32>>2]=0;aR(182,10832,u|0);a[20064]=1;return 10832}function ks(b){b=b|0;var c=0;if(a[20144]|0){return 10968}a[10968]=16;b=10969;c=b|0;C=624576549;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;c=b+4|0;C=1394948685;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;a[10977|0]=0;aR(242,10968,u|0);a[20144]=1;return 10968}function kt(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[20088]|0){return 10880}b=la(48)|0;d=b;c[2722]=d;c[2720]=13;c[2721]=8;e=1312;f=8;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+32>>2]=0;aR(182,10880,u|0);a[20088]=1;return 10880}function ku(b){b=b|0;if(a[20136]|0){return 10952}b=la(32)|0;c[2740]=b;c[2738]=33;c[2739]=20;lj(b|0,1288|0,20);a[b+20|0]=0;aR(242,10952,u|0);a[20136]=1;return 10952}function kv(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[20080]|0){return 10864}b=la(96)|0;d=b;c[2718]=d;c[2716]=25;c[2717]=20;e=1200;f=20;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+80>>2]=0;aR(182,10864,u|0);a[20080]=1;return 10864}function kw(b){b=b|0;if(a[20128]|0){return 10936}b=la(16)|0;c[2736]=b;c[2734]=17;c[2735]=11;lj(b|0,1184|0,11);a[b+11|0]=0;aR(242,10936,u|0);a[20128]=1;return 10936}function kx(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[20072]|0){return 10848}b=la(48)|0;d=b;c[2714]=d;c[2712]=13;c[2713]=11;e=1136;f=11;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+44>>2]=0;aR(182,10848,u|0);a[20072]=1;return 10848}function ky(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;bW[f&255](a);return}else{f=c[(c[d>>2]|0)+(e-1|0)>>2]|0;bW[f&255](a);return}}function kz(b){b=b|0;var d=0;b=9240;while(1){d=b-12|0;if((a[d]&1)!=0){le(c[b-12+8>>2]|0)}if((d|0)==8952){break}else{b=d}}return}function kA(b){b=b|0;var d=0;b=9984;while(1){d=b-12|0;if((a[d]&1)!=0){le(c[b-12+8>>2]|0)}if((d|0)==9696){break}else{b=d}}return}function kB(b){b=b|0;var d=0;b=8784;while(1){d=b-12|0;if((a[d]&1)!=0){le(c[b-12+8>>2]|0)}if((d|0)==8496){break}else{b=d}}return}function kC(b){b=b|0;var d=0;b=9528;while(1){d=b-12|0;if((a[d]&1)!=0){le(c[b-12+8>>2]|0)}if((d|0)==9240){break}else{b=d}}return}function kD(b){b=b|0;if((a[8940]&1)!=0){le(c[2237]|0)}if((a[8928]&1)!=0){le(c[2234]|0)}if((a[8916]&1)!=0){le(c[2231]|0)}if((a[8904]&1)!=0){le(c[2228]|0)}if((a[8892]&1)!=0){le(c[2225]|0)}if((a[8880]&1)!=0){le(c[2222]|0)}if((a[8868]&1)!=0){le(c[2219]|0)}if((a[8856]&1)!=0){le(c[2216]|0)}if((a[8844]&1)!=0){le(c[2213]|0)}if((a[8832]&1)!=0){le(c[2210]|0)}if((a[8820]&1)!=0){le(c[2207]|0)}if((a[8808]&1)!=0){le(c[2204]|0)}if((a[8796]&1)!=0){le(c[2201]|0)}if((a[8784]&1)==0){return}le(c[2198]|0);return}function kE(b){b=b|0;if((a[9684]&1)!=0){le(c[2423]|0)}if((a[9672]&1)!=0){le(c[2420]|0)}if((a[9660]&1)!=0){le(c[2417]|0)}if((a[9648]&1)!=0){le(c[2414]|0)}if((a[9636]&1)!=0){le(c[2411]|0)}if((a[9624]&1)!=0){le(c[2408]|0)}if((a[9612]&1)!=0){le(c[2405]|0)}if((a[9600]&1)!=0){le(c[2402]|0)}if((a[9588]&1)!=0){le(c[2399]|0)}if((a[9576]&1)!=0){le(c[2396]|0)}if((a[9564]&1)!=0){le(c[2393]|0)}if((a[9552]&1)!=0){le(c[2390]|0)}if((a[9540]&1)!=0){le(c[2387]|0)}if((a[9528]&1)==0){return}le(c[2384]|0);return}function kF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}k=l+4|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b+16|0;k=b|0;l=c[k>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){i_(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=2093}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=2093;break}a[l]=1;p=j;q=h}}while(0);if((o|0)==2093){p=la(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;do{if((d|0)==0){r=0}else{c[d>>2]=0;r=d}d=r+4|0;n=n-1|0;}while((n|0)!=0);n=c[k>>2]|0;r=(c[f>>2]|0)-n|0;o=p+(g-(r>>2)<<2)|0;g=n;lj(o|0,g|0,r);c[k>>2]=o;c[f>>2]=d;c[e>>2]=p+(q<<2);if((n|0)==0){return}if((n|0)==(j|0)){a[b+128|0]=0;return}else{le(g);return}}function kG(a){a=a|0;return}function kH(a){a=a|0;return 1664|0}function kI(a){a=a|0;return}function kJ(a){a=a|0;return}function kK(a){a=a|0;return}function kL(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?104:f)|0;f=c[j>>2]|0;L2434:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0&1;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L2434}o=d+1|0;p=c[t+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L2450:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L2434}else{s=o;u=p;v=q;w=l}while(1){s=s+1|0;u=(w&255)-128|u<<6;v=v-1|0;if((u|0)>=0){break}if((v|0)==0){r=u;break L2450}w=a[s]|0;if(((w&255)-128|0)>>>0>63){break L2434}}c[j>>2]=0;c[m>>2]=u;k=e-v|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[bJ()>>2]=138;k=-1;i=g;return k|0}function kM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L2465:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L2465}z=y?s:x;A=t-z|0;x=kN(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L2465}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L2476:do{if((r|0)==0){D=n;E=r}else{if((p|0)==0|(o|0)==0){D=n;E=r;break}else{F=p;G=o;H=n;I=q;J=r}while(1){K=kL(I,J,G,f)|0;if((K+2|0)>>>0<3){break}A=J+K|0;c[j>>2]=A;B=F-1|0;C=H+1|0;if((B|0)==0|(G|0)==(K|0)){D=C;E=A;break L2476}else{F=B;G=G-K|0;H=C;I=I+4|0;J=A}}if((K|0)==(-1|0)){D=-1;E=J;break}else if((K|0)==0){c[j>>2]=0;D=H;E=0;break}else{c[f>>2]=0;D=H;E=J;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=E;i=g;return D|0}function kN(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;h=c[e>>2]|0;do{if((g|0)==0){i=2161}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=2161;break}if((b|0)==0){l=k;m=h;n=f;i=2172;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=2192}}while(0);if((i|0)==2161){if((b|0)==0){s=h;u=f;i=2163}else{v=h;w=b;x=f;i=2162}}L2497:while(1){if((i|0)==2172){i=0;h=(d[m]|0)>>>3;if((h-16|h+(l>>26))>>>0>7){i=2173;break}h=m+1|0;do{if((l&33554432|0)==0){y=h}else{if(((d[h]|0)-128|0)>>>0>63){i=2176;break L2497}g=m+2|0;if((l&524288|0)==0){y=g;break}if(((d[g]|0)-128|0)>>>0>63){i=2179;break L2497}y=m+3|0}}while(0);s=y;u=n-1|0;i=2163;continue}else if((i|0)==2163){i=0;h=a[s]|0;do{if(((h&255)-1|0)>>>0<127){if((s&3|0)!=0){z=s;A=u;B=h;break}g=c[s>>2]|0;if(((g-16843009|g)&-2139062144|0)==0){C=u;D=s}else{z=s;A=u;B=g&255;break}do{D=D+4|0;C=C-4|0;E=c[D>>2]|0;}while(((E-16843009|E)&-2139062144|0)==0);z=D;A=C;B=E&255}else{z=s;A=u;B=h}}while(0);h=B&255;if((h-1|0)>>>0<127){s=z+1|0;u=A-1|0;i=2163;continue}g=h-194|0;if(g>>>0>50){F=A;G=b;H=z;i=2203;break}l=c[t+(g<<2)>>2]|0;m=z+1|0;n=A;i=2172;continue}else if((i|0)==2192){i=0;g=d[p]|0;h=g>>>3;if((h-16|h+(o>>26))>>>0>7){i=2193;break}h=p+1|0;I=g-128|o<<6;do{if((I|0)<0){g=(d[h]|0)-128|0;if(g>>>0>63){i=2196;break L2497}k=p+2|0;J=g|I<<6;if((J|0)>=0){K=J;L=k;break}g=(d[k]|0)-128|0;if(g>>>0>63){i=2199;break L2497}K=g|J<<6;L=p+3|0}else{K=I;L=h}}while(0);c[q>>2]=K;v=L;w=q+4|0;x=r-1|0;i=2162;continue}else if((i|0)==2162){i=0;if((x|0)==0){M=f;i=2214;break}else{N=x;O=w;P=v}while(1){h=a[P]|0;do{if(((h&255)-1|0)>>>0<127){if((P&3|0)==0&N>>>0>3){Q=N;R=O;S=P}else{T=P;U=O;V=N;W=h;break}while(1){X=c[S>>2]|0;if(((X-16843009|X)&-2139062144|0)!=0){i=2186;break}c[R>>2]=X&255;c[R+4>>2]=d[S+1|0]|0;c[R+8>>2]=d[S+2|0]|0;Y=S+4|0;Z=R+16|0;c[R+12>>2]=d[S+3|0]|0;_=Q-4|0;if(_>>>0>3){Q=_;R=Z;S=Y}else{i=2187;break}}if((i|0)==2186){i=0;T=S;U=R;V=Q;W=X&255;break}else if((i|0)==2187){i=0;T=Y;U=Z;V=_;W=a[Y]|0;break}}else{T=P;U=O;V=N;W=h}}while(0);$=W&255;if(($-1|0)>>>0>=127){break}c[U>>2]=$;h=V-1|0;if((h|0)==0){M=f;i=2213;break L2497}else{N=h;O=U+4|0;P=T+1|0}}h=$-194|0;if(h>>>0>50){F=V;G=U;H=T;i=2203;break}o=c[t+(h<<2)>>2]|0;p=T+1|0;q=U;r=V;i=2192;continue}}if((i|0)==2196){aa=I;ab=p-1|0;ac=q;ad=r;i=2202}else if((i|0)==2193){aa=o;ab=p-1|0;ac=q;ad=r;i=2202}else if((i|0)==2179){aa=l;ab=m-1|0;ac=b;ad=n;i=2202}else if((i|0)==2213){return M|0}else if((i|0)==2214){return M|0}else if((i|0)==2176){aa=l;ab=m-1|0;ac=b;ad=n;i=2202}else if((i|0)==2199){aa=J;ab=p-1|0;ac=q;ad=r;i=2202}else if((i|0)==2173){aa=l;ab=m-1|0;ac=b;ad=n;i=2202}if((i|0)==2202){if((aa|0)==0){F=ad;G=ac;H=ab;i=2203}else{ae=ac;af=ab}}do{if((i|0)==2203){if((a[H]|0)!=0){ae=G;af=H;break}if((G|0)!=0){c[G>>2]=0;c[e>>2]=0}M=f-F|0;return M|0}}while(0);c[bJ()>>2]=138;if((ae|0)==0){M=-1;return M|0}c[e>>2]=af;M=-1;return M|0}function kO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[bJ()>>2]=138;f=-1;return f|0}return 0}function kP(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L2587:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L2587}x=w?r:s;y=s-x|0;w=kQ(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L2587}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L2598:do{if((q|0)==0){B=m;C=q}else{if((o|0)==0|(n|0)==0){B=m;C=q;break}else{D=o;E=n;F=m;G=p;H=q}while(1){I=kO(G,c[H>>2]|0,0)|0;if((I+1|0)>>>0<2){break}y=H+4|0;c[h>>2]=y;z=E-1|0;A=F+1|0;if((D|0)==(I|0)|(z|0)==0){B=A;C=y;break L2598}else{D=D-I|0;E=z;F=A;G=G+I|0;H=y}}if((I|0)!=0){B=-1;C=H;break}c[h>>2]=0;B=F;C=0}}while(0);if(!k){i=f;return B|0}c[b>>2]=C;i=f;return B|0}function kQ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=kO(j,o,0)|0;if((k|0)==-1){l=-1;p=2280;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=2282;break}else{m=k;n=h;o=r}}if((p|0)==2280){i=f;return l|0}else if((p|0)==2282){i=f;return l|0}}L2624:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L2624}if(q>>>0>127){j=kO(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L2624}}i=f;return l|0}else{s=e;t=b}}while(0);L2636:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=2274;break}if(m>>>0>127){n=kO(b,m,0)|0;if((n|0)==-1){l=-1;p=2277;break}if(n>>>0>u>>>0){p=2270;break}o=c[w>>2]|0;kO(v,o,0);y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L2636}else{u=z;v=y;w=m}}if((p|0)==2270){l=e-u|0;i=f;return l|0}else if((p|0)==2274){a[v]=0;x=u;break}else if((p|0)==2277){i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function kR(a){a=a|0;le(a);return}function kS(a){a=a|0;le(a);return}function kT(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kU(a){a=a|0;le(a);return}function kV(a){a=a|0;le(a);return}function kW(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=kZ(b,18568,18552,-1)|0;j=h;if((h|0)==0){g=0;break}ln(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;b9[c[(c[h>>2]|0)+28>>2]&15](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2];g=1}}while(0);i=e;return g|0}function kX(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;b9[c[(c[g>>2]|0)+28>>2]&15](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kY(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;b9[c[(c[j>>2]|0)+28>>2]&15](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;b9[c[(c[j>>2]|0)+28>>2]&15](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=2337;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=2340;break}}if((m|0)==2337){return}else if((m|0)==2340){return}}function kZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;ln(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;b6[c[(c[k>>2]|0)+20>>2]&31](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}bU[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else{o=0}}while(0);i=f;return o|0}function k_(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L2763:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L2765:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;b6[c[(c[v>>2]|0)+20>>2]&31](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L2765}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=2382;break L2763}if((c[o>>2]&2|0)==0){B=2382;break L2763}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=2381}else{D=x;B=2378}}else{D=0;B=2378}}while(0);do{if((B|0)==2378){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)!=1){C=D;B=2381;break}if((c[d+24>>2]|0)!=2){C=D;B=2381;break}a[d+54|0]=1;if(D){B=2382}else{B=2383}}}while(0);if((B|0)==2381){if(C){B=2382}else{B=2383}}if((B|0)==2382){c[i>>2]=3;return}else if((B|0)==2383){c[i>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;bU[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=2419;break}if((c[b>>2]|0)==1){B=2413;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;bU[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=2409;break}}if((B|0)==2409){return}else if((B|0)==2413){return}else if((B|0)==2419){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=2410;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=2420;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;bU[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=2418;break}}if((B|0)==2410){return}else if((B|0)==2418){return}else if((B|0)==2420){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=2411;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;bU[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=2424;break}}if((B|0)==2411){return}else if((B|0)==2424){return}}function k$(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;bU[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;b6[c[(c[l>>2]|0)+20>>2]&31](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=2438}else{if((a[j]&1)==0){m=1;n=2438}}L2865:do{if((n|0)==2438){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=2441;break}a[d+54|0]=1;if(m){break L2865}}else{n=2441}}while(0);if((n|0)==2441){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function k0(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function k1(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function k2(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;b6[c[(c[p>>2]|0)+20>>2]&31](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L2939:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;do{if((a[p]&1)!=0){break L2939}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L2939}}else{if((c[o>>2]|0)==1){break L2939}if((c[q>>2]&2|0)==0){break L2939}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;b6[c[(c[u>>2]|0)+20>>2]&31](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;}while(s>>>0<n>>>0)}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function k3(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;b6[c[(c[i>>2]|0)+20>>2]&31](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function k4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[712]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=2888+(h<<2)|0;j=2888+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[712]=e&(1<<g^-1)}else{if(l>>>0<(c[716]|0)>>>0){aT();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{aT();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[714]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=2888+(p<<2)|0;m=2888+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[712]=e&(1<<r^-1)}else{if(l>>>0<(c[716]|0)>>>0){aT();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{aT();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[714]|0;if((l|0)!=0){q=c[717]|0;d=l>>>3;l=d<<1;f=2888+(l<<2)|0;k=c[712]|0;h=1<<d;do{if((k&h|0)==0){c[712]=k|h;s=f;t=2888+(l+2<<2)|0}else{d=2888+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[716]|0)>>>0){s=g;t=d;break}aT();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[714]=m;c[717]=e;n=i;return n|0}l=c[713]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[3152+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[716]|0;if(r>>>0<i>>>0){aT();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){aT();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){aT();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){aT();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){aT();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{aT();return 0;return 0}}}while(0);L3204:do{if((e|0)!=0){f=d+28|0;i=3152+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[713]=c[713]&(1<<c[f>>2]^-1);break L3204}else{if(e>>>0<(c[716]|0)>>>0){aT();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L3204}}}while(0);if(v>>>0<(c[716]|0)>>>0){aT();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[714]|0;if((f|0)!=0){e=c[717]|0;i=f>>>3;f=i<<1;q=2888+(f<<2)|0;k=c[712]|0;g=1<<i;do{if((k&g|0)==0){c[712]=k|g;y=q;z=2888+(f+2<<2)|0}else{i=2888+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[716]|0)>>>0){y=l;z=i;break}aT();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[714]=p;c[717]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[713]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[3152+(A<<2)>>2]|0;L3012:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L3012}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[3152+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[714]|0)-g|0)>>>0){o=g;break}q=K;m=c[716]|0;if(q>>>0<m>>>0){aT();return 0;return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){aT();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){aT();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){aT();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){aT();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{aT();return 0;return 0}}}while(0);L3062:do{if((e|0)!=0){i=K+28|0;m=3152+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[713]=c[713]&(1<<c[i>>2]^-1);break L3062}else{if(e>>>0<(c[716]|0)>>>0){aT();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L3062}}}while(0);if(L>>>0<(c[716]|0)>>>0){aT();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=2888+(e<<2)|0;r=c[712]|0;j=1<<i;do{if((r&j|0)==0){c[712]=r|j;O=m;P=2888+(e+2<<2)|0}else{i=2888+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[716]|0)>>>0){O=d;P=i;break}aT();return 0;return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8|0)>>2]=O;c[q+(g+12|0)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=3152+(Q<<2)|0;c[q+(g+28|0)>>2]=Q;c[q+(g+20|0)>>2]=0;c[q+(g+16|0)>>2]=0;m=c[713]|0;l=1<<Q;if((m&l|0)==0){c[713]=m|l;c[j>>2]=e;c[q+(g+24|0)>>2]=j;c[q+(g+12|0)>>2]=e;c[q+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=2698;break}else{l=l<<1;m=j}}if((T|0)==2698){if(S>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[S>>2]=e;c[q+(g+24|0)>>2]=m;c[q+(g+12|0)>>2]=e;c[q+(g+8|0)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[716]|0;if(m>>>0<i>>>0){aT();return 0;return 0}if(j>>>0<i>>>0){aT();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8|0)>>2]=j;c[q+(g+12|0)>>2]=m;c[q+(g+24|0)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[714]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[717]|0;if(S>>>0>15){R=J;c[717]=R+o;c[714]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[714]=0;c[717]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[715]|0;if(o>>>0<J>>>0){S=J-o|0;c[715]=S;J=c[718]|0;K=J;c[718]=K+o;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[20]|0)==0){J=a0(8)|0;if((J-1&J|0)==0){c[22]=J;c[21]=J;c[23]=-1;c[24]=2097152;c[25]=0;c[823]=0;c[20]=bp(0)&-16^1431655768;break}else{aT();return 0;return 0}}}while(0);J=o+48|0;S=c[22]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[822]|0;do{if((O|0)!=0){P=c[820]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L3271:do{if((c[823]&4|0)==0){O=c[718]|0;L3273:do{if((O|0)==0){T=2728}else{L=O;P=3296;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=2728;break L3273}else{P=M}}if((P|0)==0){T=2728;break}L=R-(c[715]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bF(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=2737}}while(0);do{if((T|0)==2728){O=bF(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[21]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=(S-g|0)+(m+g&-L)|0}L=c[820]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[822]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bF($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=2737}}while(0);L3293:do{if((T|0)==2737){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=2748;break L3271}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[22]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bF(O|0)|0)==-1){bF(m|0);W=Y;break L3293}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=2748;break L3271}}}while(0);c[823]=c[823]|4;ad=W;T=2745}else{ad=0;T=2745}}while(0);do{if((T|0)==2745){if(S>>>0>=2147483647){break}W=bF(S|0)|0;Z=bF(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=2748}}}while(0);do{if((T|0)==2748){ad=(c[820]|0)+aa|0;c[820]=ad;if(ad>>>0>(c[821]|0)>>>0){c[821]=ad}ad=c[718]|0;L3313:do{if((ad|0)==0){S=c[716]|0;if((S|0)==0|ab>>>0<S>>>0){c[716]=ab}c[824]=ab;c[825]=aa;c[827]=0;c[721]=c[20];c[720]=-1;S=0;do{Y=S<<1;ac=2888+(Y<<2)|0;c[2888+(Y+3<<2)>>2]=ac;c[2888+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[718]=ab+ae;c[715]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[719]=c[24]}else{S=3296;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=2760;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==2760){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[718]|0;Y=(c[715]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[718]=Z+ai;c[715]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[719]=c[24];break L3313}}while(0);if(ab>>>0<(c[716]|0)>>>0){c[716]=ab}S=ab+aa|0;Y=3296;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=2770;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==2770){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa|0)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=(S-(ab+ak|0)|0)-o|0;c[ab+(ak+4|0)>>2]=o|3;do{if((Z|0)==(c[718]|0)){J=(c[715]|0)+K|0;c[715]=J;c[718]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[717]|0)){J=(c[714]|0)+K|0;c[714]=J;c[717]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L3358:do{if(X>>>0<256){U=c[ab+((al|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+al|0)>>2]|0;R=2888+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[716]|0)>>>0){aT();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}aT();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[712]=c[712]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[716]|0)>>>0){aT();return 0;return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}aT();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+al|0)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa|0)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa|0)>>2]|0;if(g>>>0<(c[716]|0)>>>0){aT();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){aT();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{aT();return 0;return 0}}}while(0);if((m|0)==0){break}P=ab+((aa+28|0)+al|0)|0;U=3152+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[713]=c[713]&(1<<c[P>>2]^-1);break L3358}else{if(m>>>0<(c[716]|0)>>>0){aT();return 0;return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L3358}}}while(0);if(an>>>0<(c[716]|0)>>>0){aT();return 0;return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa|0)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=ar|1;c[ab+(ar+W|0)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=2888+(V<<2)|0;P=c[712]|0;m=1<<J;do{if((P&m|0)==0){c[712]=P|m;as=X;at=2888+(V+2<<2)|0}else{J=2888+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[716]|0)>>>0){as=U;at=J;break}aT();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8|0)>>2]=as;c[ab+(W+12|0)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=3152+(au<<2)|0;c[ab+(W+28|0)>>2]=au;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[713]|0;Q=1<<au;if((X&Q|0)==0){c[713]=X|Q;c[m>>2]=V;c[ab+(W+24|0)>>2]=m;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=2843;break}else{Q=Q<<1;X=m}}if((T|0)==2843){if(aw>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[716]|0;if(X>>>0<$>>>0){aT();return 0;return 0}if(m>>>0<$>>>0){aT();return 0;return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=m;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=3296;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39|0)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+((ay-47|0)+aA|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=(aa-40|0)-aB|0;c[718]=ab+aB;c[715]=_;c[ab+(aB+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[719]=c[24];c[ac+4>>2]=27;c[W>>2]=c[824];c[W+4>>2]=c[3300>>2];c[W+8>>2]=c[3304>>2];c[W+12>>2]=c[3308>>2];c[824]=ab;c[825]=aa;c[827]=0;c[826]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4|0)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=2888+(K<<2)|0;S=c[712]|0;m=1<<W;do{if((S&m|0)==0){c[712]=S|m;aC=Z;aD=2888+(K+2<<2)|0}else{W=2888+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[716]|0)>>>0){aC=Q;aD=W;break}aT();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=3152+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[713]|0;Q=1<<aE;if((Z&Q|0)==0){c[713]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=2878;break}else{Q=Q<<1;Z=m}}if((T|0)==2878){if(aG>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[716]|0;if(Z>>>0<m>>>0){aT();return 0;return 0}if(_>>>0<m>>>0){aT();return 0;return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[715]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[715]=_;ad=c[718]|0;Q=ad;c[718]=Q+o;c[Q+(o+4|0)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[bJ()>>2]=12;n=0;return n|0}function k5(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[716]|0;if(b>>>0<e>>>0){aT()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){aT()}h=f&-8;i=a+(h-8|0)|0;j=i;L3530:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){aT()}if((n|0)==(c[717]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[714]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=2888+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){aT()}if((c[k+12>>2]|0)==(n|0)){break}aT()}}while(0);if((s|0)==(k|0)){c[712]=c[712]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){aT()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}aT()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){aT()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){aT()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){aT()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{aT()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=3152+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[713]=c[713]&(1<<c[v>>2]^-1);q=n;r=o;break L3530}else{if(p>>>0<(c[716]|0)>>>0){aT()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L3530}}}while(0);if(A>>>0<(c[716]|0)>>>0){aT()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[716]|0)>>>0){aT()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[716]|0)>>>0){aT()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){aT()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){aT()}do{if((e&2|0)==0){if((j|0)==(c[718]|0)){B=(c[715]|0)+r|0;c[715]=B;c[718]=q;c[q+4>>2]=B|1;if((q|0)==(c[717]|0)){c[717]=0;c[714]=0}if(B>>>0<=(c[719]|0)>>>0){return}k7(0);return}if((j|0)==(c[717]|0)){B=(c[714]|0)+r|0;c[714]=B;c[717]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L3635:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=2888+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[716]|0)>>>0){aT()}if((c[u+12>>2]|0)==(j|0)){break}aT()}}while(0);if((g|0)==(u|0)){c[712]=c[712]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[716]|0)>>>0){aT()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}aT()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[716]|0)>>>0){aT()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[716]|0)>>>0){aT()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){aT()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{aT()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=3152+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[713]=c[713]&(1<<c[t>>2]^-1);break L3635}else{if(f>>>0<(c[716]|0)>>>0){aT()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L3635}}}while(0);if(E>>>0<(c[716]|0)>>>0){aT()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[716]|0)>>>0){aT()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[716]|0)>>>0){aT()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[717]|0)){H=B;break}c[714]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=2888+(d<<2)|0;A=c[712]|0;E=1<<r;do{if((A&E|0)==0){c[712]=A|E;I=e;J=2888+(d+2<<2)|0}else{r=2888+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[716]|0)>>>0){I=h;J=r;break}aT()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=3152+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[713]|0;d=1<<K;do{if((r&d|0)==0){c[713]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=3057;break}else{A=A<<1;J=E}}if((N|0)==3057){if(M>>>0<(c[716]|0)>>>0){aT()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[716]|0;if(J>>>0<E>>>0){aT()}if(B>>>0<E>>>0){aT()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[720]|0)-1|0;c[720]=q;if((q|0)==0){O=3304}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[720]=-1;return}function k6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=k4(b)|0;return d|0}if(b>>>0>4294967231){c[bJ()>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=k8(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=k4(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;lj(f|0,a|0,g>>>0<b>>>0?g:b);k5(a);d=f;return d|0}function k7(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[20]|0)==0){b=a0(8)|0;if((b-1&b|0)==0){c[22]=b;c[21]=b;c[23]=-1;c[24]=2097152;c[25]=0;c[823]=0;c[20]=bp(0)&-16^1431655768;break}else{aT();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[718]|0;if((b|0)==0){d=0;return d|0}e=c[715]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[22]|0;g=ag(((((((-40-a|0)-1|0)+e|0)+f|0)>>>0)/(f>>>0)>>>0)-1|0,f);h=b;i=3296;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bF(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bF(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bF(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[820]=(c[820]|0)-j;h=c[718]|0;m=(c[715]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[718]=j+o;c[715]=n;c[j+(o+4|0)>>2]=n|1;c[j+(m+4|0)>>2]=40;c[719]=c[24];d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[715]|0)>>>0<=(c[719]|0)>>>0){d=0;return d|0}c[719]=-1;d=0;return d|0}function k8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[716]|0;if(g>>>0<j>>>0){aT();return 0;return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){aT();return 0;return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){aT();return 0;return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[22]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=k|3;c[l>>2]=c[l>>2]|1;k9(g+b|0,k);n=a;return n|0}if((i|0)==(c[718]|0)){k=(c[715]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=l|1;c[718]=g+b;c[715]=l;n=a;return n|0}if((i|0)==(c[717]|0)){l=(c[714]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4|0)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4|0)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[714]=q;c[717]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L3856:do{if(m>>>0<256){l=c[g+(f+8|0)>>2]|0;k=c[g+(f+12|0)>>2]|0;o=2888+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){aT();return 0;return 0}if((c[l+12>>2]|0)==(i|0)){break}aT();return 0;return 0}}while(0);if((k|0)==(l|0)){c[712]=c[712]&(1<<e^-1);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){aT();return 0;return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}aT();return 0;return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24|0)>>2]|0;t=c[g+(f+12|0)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20|0)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16|0)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){aT();return 0;return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8|0)>>2]|0;if(u>>>0<j>>>0){aT();return 0;return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){aT();return 0;return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{aT();return 0;return 0}}}while(0);if((s|0)==0){break}t=g+(f+28|0)|0;l=3152+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[713]=c[713]&(1<<c[t>>2]^-1);break L3856}else{if(s>>>0<(c[716]|0)>>>0){aT();return 0;return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L3856}}}while(0);if(y>>>0<(c[716]|0)>>>0){aT();return 0;return 0}c[y+24>>2]=s;o=c[g+(f+16|0)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20|0)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[716]|0)>>>0){aT();return 0;return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4|0)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;k9(g+b|0,q);n=a;return n|0}return 0}function k9(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L1:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[716]|0;if(i>>>0<l>>>0){aT()}if((j|0)==(c[717]|0)){m=d+(b+4|0)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[714]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h|0)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h|0)>>2]|0;q=c[d+(12-h|0)>>2]|0;r=2888+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){aT()}if((c[p+12>>2]|0)==(j|0)){break}aT()}}while(0);if((q|0)==(p|0)){c[712]=c[712]&(1<<m^-1);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){aT()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}aT()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h|0)>>2]|0;t=c[d+(12-h|0)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4|0)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){aT()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h|0)>>2]|0;if(v>>>0<l>>>0){aT()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){aT()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{aT()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h|0)|0;l=3152+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[713]=c[713]&(1<<c[t>>2]^-1);n=j;o=k;break L1}else{if(m>>>0<(c[716]|0)>>>0){aT()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L1}}}while(0);if(y>>>0<(c[716]|0)>>>0){aT()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[716]|0)>>>0){aT()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4|0)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[716]|0)>>>0){aT()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[716]|0;if(e>>>0<a>>>0){aT()}y=d+(b+4|0)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[718]|0)){A=(c[715]|0)+o|0;c[715]=A;c[718]=n;c[n+4>>2]=A|1;if((n|0)!=(c[717]|0)){return}c[717]=0;c[714]=0;return}if((f|0)==(c[717]|0)){A=(c[714]|0)+o|0;c[714]=A;c[717]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L100:do{if(z>>>0<256){g=c[d+(b+8|0)>>2]|0;t=c[d+(b+12|0)>>2]|0;h=2888+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){aT()}if((c[g+12>>2]|0)==(f|0)){break}aT()}}while(0);if((t|0)==(g|0)){c[712]=c[712]&(1<<s^-1);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){aT()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}aT()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24|0)>>2]|0;l=c[d+(b+12|0)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20|0)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16|0)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){aT()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8|0)>>2]|0;if(i>>>0<a>>>0){aT()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){aT()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{aT()}}}while(0);if((m|0)==0){break}l=d+(b+28|0)|0;g=3152+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[713]=c[713]&(1<<c[l>>2]^-1);break L100}else{if(m>>>0<(c[716]|0)>>>0){aT()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L100}}}while(0);if(C>>>0<(c[716]|0)>>>0){aT()}c[C+24>>2]=m;h=c[d+(b+16|0)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[716]|0)>>>0){aT()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20|0)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[716]|0)>>>0){aT()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[717]|0)){F=A;break}c[714]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=2888+(z<<2)|0;C=c[712]|0;b=1<<o;do{if((C&b|0)==0){c[712]=C|b;G=y;H=2888+(z+2<<2)|0}else{o=2888+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[716]|0)>>>0){G=d;H=o;break}aT()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=(14-(b|H|z)|0)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=3152+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[713]|0;z=1<<I;if((o&z|0)==0){c[713]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=126;break}else{I=I<<1;J=G}}if((L|0)==126){if(K>>>0<(c[716]|0)>>>0){aT()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[716]|0;if(J>>>0<I>>>0){aT()}if(L>>>0<I>>>0){aT()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function la(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=k4(b)|0;if((d|0)!=0){e=170;break}a=(I=c[4988]|0,c[4988]=I+0,I);if((a|0)==0){break}b2[a&1]()}if((e|0)==170){return d|0}d=bi(4)|0;c[d>>2]=11256;aN(d|0,17016,28);return 0}function lb(a){a=a|0;return la(a)|0}function lc(a){a=a|0;return}function ld(a){a=a|0;return 1352|0}function le(a){a=a|0;if((a|0)!=0){k5(a)}return}function lf(a){a=a|0;le(a);return}function lg(a){a=a|0;le(a);return}function lh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((bj(a[e]|0|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=((f*10&-1)-48|0)+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=198}else{if((e|0)>0){v=0.0;w=e;x=l;y=198}else{z=0.0;A=0.0}}if((y|0)==198){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=((m*10&-1)-48|0)+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==43){F=g+2|0;G=0}else if((n<<24>>24|0)==45){F=g+2|0;G=1}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=((I*10&-1)-48|0)+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[bJ()>>2]=34;N=1.0;O=8;P=511;y=215}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=215}}if((y|0)==215){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=215}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function li(){var a=0;a=bi(4)|0;c[a>>2]=11256;aN(a|0,17016,28)}function lj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function lk(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{lj(b,c,d)}}function ll(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function lm(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function ln(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function lo(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function lp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function lq(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function lr(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function ls(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function lt(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function lu(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function lv(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c);f=a>>>16;a=(e>>>16)+ag(d,f)|0;d=b>>>16;b=ag(d,c);return(K=((a>>>16)+ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,0|(a+b<<16|e&65535))|0}function lw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=lp(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=lp(lB(i,b,lp(g^c,h^d,g,h)|0,K,0)^a,K^e,a,e)|0;return(K=K,f)|0}function lx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=lp(h^a,j^b,h,j)|0;b=K;lB(m,b,lp(k^d,l^e,k,l)|0,K,g);l=lp(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,l)|0}function ly(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=lv(e,a)|0;f=K;return(K=(ag(b,a)+ag(d,e)|0)+f|f&0,0|c&-1)|0}function lz(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=lB(a,b,c,d,0)|0;return(K=K,e)|0}function lA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;lB(a,b,d,e,g);i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function lB(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a&-1;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((lu(l|0)|0)>>>0);return(K=n,o)|0}p=(lt(l|0)|0)-(lt(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(lt(l|0)|0)-(lt(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=((lt(j|0)|0)+33|0)-(lt(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a&-1|0;return(K=n,o)|0}else{p=lu(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d&-1|0;d=k|e&0;e=lo(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;lp(e,k,j,a);b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=lp(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(0|J)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function lC(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;bU[a&7](b|0,c|0,d|0,e|0,f|0)}function lD(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;bV[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function lE(a,b){a=a|0;b=b|0;bW[a&255](b|0)}function lF(a,b,c){a=a|0;b=b|0;c=c|0;bX[a&127](b|0,c|0)}function lG(a,b,c){a=a|0;b=b|0;c=c|0;return bY[a&31](b|0,c|0)|0}function lH(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return bZ[a&63](b|0,c|0,d|0)|0}function lI(a,b){a=a|0;b=b|0;return b_[a&255](b|0)|0}function lJ(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;b$[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function lK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b0[a&7](b|0,c|0,d|0)}function lL(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;b1[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function lM(a){a=a|0;b2[a&1]()}function lN(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return b3[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function lO(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;b4[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function lP(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;b5[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function lQ(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;b6[a&31](b|0,c|0,d|0,e|0,f|0,g|0)}function lR(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return b7[a&15](b|0,c|0,d|0,e|0)|0}function lS(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return b8[a&31](b|0,c|0,d|0,e|0,f|0)|0}function lT(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b9[a&15](b|0,c|0,d|0,e|0)}function lU(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0)}function lV(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(1)}function lW(a){a=a|0;ah(2)}function lX(a,b){a=a|0;b=b|0;ah(3)}function lY(a,b){a=a|0;b=b|0;ah(4);return 0}function lZ(a,b,c){a=a|0;b=b|0;c=c|0;ah(5);return 0}function l_(a){a=a|0;ah(6);return 0}function l$(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(7)}function l0(a,b,c){a=a|0;b=b|0;c=c|0;ah(8)}function l1(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(9)}function l2(){ah(10)}function l3(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(11);return 0}function l4(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(12)}function l5(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(13)}function l6(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(14)}function l7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(15);return 0}function l8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(16);return 0}function l9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17)}
// EMSCRIPTEN_END_FUNCS
var bU=[lU,lU,k$,lU,k0,lU,k_,lU];var bV=[lV,lV,hb,lV,hl,lV,hn,lV,iR,lV,g_,lV,gX,lV,iK,lV,g6,lV,ha,lV,ho,lV,gC,lV,g9,lV,gg,lV,gu,lV,hm,lV,gK,lV,gI,lV,gw,lV,gs,lV,gt,lV,gl,lV,gv,lV,gr,lV,go,lV,gA,lV,gz,lV,gy,lV,hp,lV,ga,lV,g8,lV,ge,lV,f6,lV,f8,lV,gc,lV,f4,lV,gk,lV,gi,lV,f0,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV,lV];var bW=[lW,lW,iV,lW,f$,lW,gQ,lW,ey,lW,e9,lW,jb,lW,en,lW,hz,lW,gD,lW,eu,lW,gm,lW,fp,lW,fN,lW,lc,lW,jj,lW,jm,lW,hh,lW,gj,lW,fJ,lW,iN,lW,jk,lW,fy,lW,fY,lW,ib,lW,ji,lW,kc,lW,jo,lW,kJ,lW,kb,lW,fo,lW,d6,lW,ex,lW,fr,lW,hB,lW,ke,lW,jl,lW,k5,lW,iJ,lW,ka,lW,dK,lW,fB,lW,d5,lW,fR,lW,ev,lW,ky,lW,gB,lW,hJ,lW,fx,lW,fH,lW,hx,lW,hk,lW,fO,lW,h7,lW,lg,lW,e8,lW,kA,lW,kB,lW,fK,lW,fe,lW,kU,lW,jC,lW,jF,lW,fz,lW,fM,lW,ik,lW,d3,lW,ig,lW,fL,lW,kD,lW,kK,lW,jW,lW,eb,lW,jh,lW,hy,lW,ip,lW,kR,lW,hS,lW,dJ,lW,iH,lW,kC,lW,h3,lW,gS,lW,fQ,lW,ec,lW,fq,lW,fD,lW,eB,lW,iB,lW,ir,lW,kd,lW,eK,lW,kG,lW,kV,lW,fG,lW,eC,lW,fw,lW,fI,lW,iP,lW,fl,lW,fF,lW,eo,lW,fP,lW,hN,lW,g5,lW,hF,lW,d_,lW,iZ,lW,iz,lW,fC,lW,fd,lW,fE,lW,j9,lW,kz,lW,g1,lW,kS,lW,iS,lW,dZ,lW,kI,lW,hA,lW,hR,lW,eG,lW,jn,lW,ew,lW,fA,lW,kE,lW,lW,lW,lW,lW];var bX=[lX,lX,kg,lX,d$,lX,ij,lX,km,lX,hY,lX,kl,lX,iU,lX,eZ,lX,h$,lX,hZ,lX,h1,lX,h6,lX,h4,lX,h2,lX,hW,lX,ed,lX,h_,lX,kf,lX,ih,lX,h9,lX,h8,lX,kh,lX,hX,lX,h0,lX,j7,lX,hV,lX,eh,lX,eS,lX,eE,lX,iY,lX,ic,lX,hU,lX,hT,lX,h5,lX,id,lX,ie,lX,ia,lX,ii,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX,lX];var bY=[lY,lY,jy,lY,er,lY,i7,lY,e2,lY,i0,lY,eY,lY,d9,lY,ef,lY,ju,lY,jA,lY,cv,lY,fm,lY,jw,lY,eX,lY,d1,lY];var bZ=[lZ,lZ,ft,lZ,jz,lZ,jx,lZ,kW,lZ,i8,lZ,fZ,lZ,ez,lZ,fc,lZ,fa,lZ,jq,lZ,e_,lZ,iW,lZ,i9,lZ,jv,lZ,ff,lZ,em,lZ,jB,lZ,iQ,lZ,eT,lZ,fv,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ,lZ];var b_=[l_,l_,kx,l_,hL,l_,eW,l_,kn,l_,fb,l_,kv,l_,hG,l_,jL,l_,jR,l_,g2,l_,kj,l_,dG,l_,fg,l_,e1,l_,kr,l_,kp,l_,j_,l_,kH,l_,ek,l_,j6,l_,j3,l_,kq,l_,jQ,l_,j4,l_,eU,l_,hQ,l_,ks,l_,d0,l_,hH,l_,jD,l_,kw,l_,j0,l_,hO,l_,ki,l_,d7,l_,j$,l_,jN,l_,fn,l_,hE,l_,d8,l_,j5,l_,eV,l_,e$,l_,ee,l_,hI,l_,ep,l_,i6,l_,i5,l_,ld,l_,e0,l_,hC,l_,kk,l_,i4,l_,hD,l_,ej,l_,hK,l_,hM,l_,ko,l_,hP,l_,hi,l_,ku,l_,kt,l_,jP,l_,eq,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_,l_];var b$=[l$,l$,g7,l$,g0,l$,gV,l$,gN,l$,l$,l$,l$,l$,l$,l$];var b0=[l0,l0,el,l0,fW,l0,l0,l0];var b1=[l1,l1,hw,l1,hv,l1,im,l1,ix,l1,it,l1,iC,l1,l1,l1];var b2=[l2,l2];var b3=[l3,l3,i1,l3,jJ,l3,jH,l3,i2,l3,jX,l3,jY,l3,jI,l3,jG,l3,l3,l3,l3,l3,l3,l3,l3,l3,l3,l3,l3,l3,l3,l3];var b4=[l4,l4,hq,l4,hc,l4,l4,l4];var b5=[l5,l5,iL,l5,iF,l5,l5,l5];var b6=[l6,l6,k2,l6,gY,l6,gU,l6,gT,l6,k3,l6,g3,l6,iT,l6,e5,l6,gR,l6,gE,l6,gJ,l6,gF,l6,k1,l6,e3,l6,iX,l6];var b7=[l7,l7,jr,l7,js,l7,je,l7,jc,l7,jt,l7,l7,l7,l7,l7];var b8=[l8,l8,jO,l8,jM,l8,j8,l8,i3,l8,jd,l8,jV,l8,fu,l8,jf,l8,ja,l8,jK,l8,fs,l8,jZ,l8,l8,l8,l8,l8,l8,l8];var b9=[l9,l9,kX,l9,kY,l9,e4,l9,kT,l9,e6,l9,f_,l9,fX,l9];return{_strlen:ll,_free:k5,_realloc:k6,_memmove:lk,_memset:ln,_malloc:k4,_memcpy:lj,__GLOBAL__I_a150:et,_boolean_operate:dP,_strcpy:lm,stackAlloc:ca,stackSave:cb,stackRestore:cc,setThrew:cd,setTempRet0:ce,setTempRet1:cf,setTempRet2:cg,setTempRet3:ch,setTempRet4:ci,setTempRet5:cj,setTempRet6:ck,setTempRet7:cl,setTempRet8:cm,setTempRet9:cn,dynCall_viiiii:lC,dynCall_viiiiiii:lD,dynCall_vi:lE,dynCall_vii:lF,dynCall_iii:lG,dynCall_iiii:lH,dynCall_ii:lI,dynCall_viiiiif:lJ,dynCall_viii:lK,dynCall_viiiiiiii:lL,dynCall_v:lM,dynCall_iiiiiiiii:lN,dynCall_viiiiiiiii:lO,dynCall_viiiiiif:lP,dynCall_viiiiii:lQ,dynCall_iiiii:lR,dynCall_iiiiii:lS,dynCall_viiii:lT}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "copyTempDouble": copyTempDouble, "copyTempFloat": copyTempFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiii": invoke_iiii, "invoke_ii": invoke_ii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_llvm_va_end": _llvm_va_end, "_vsnprintf": _vsnprintf, "_vsscanf": _vsscanf, "_sscanf": _sscanf, "_snprintf": _snprintf, "___locale_mb_cur_max": ___locale_mb_cur_max, "_fgetc": _fgetc, "___cxa_throw": ___cxa_throw, "___cxa_begin_catch": ___cxa_begin_catch, "_strerror": _strerror, "_pthread_mutex_lock": _pthread_mutex_lock, "_atexit": _atexit, "_isdigit": _isdigit, "_abort": _abort, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "___cxa_free_exception": ___cxa_free_exception, "__formatString": __formatString, "_pread": _pread, "_fflush": _fflush, "_isxdigit": _isxdigit, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "_sysconf": _sysconf, "_clock": _clock, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "_send": _send, "_sqrt": _sqrt, "_write": _write, "__scanString": __scanString, "_llvm_umul_with_overflow_i32": _llvm_umul_with_overflow_i32, "_exit": _exit, "_sprintf": _sprintf, "_llvm_lifetime_end": _llvm_lifetime_end, "_asprintf": _asprintf, "___ctype_b_loc": ___ctype_b_loc, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "___cxa_allocate_exception": ___cxa_allocate_exception, "_isspace": _isspace, "_strtoll": _strtoll, "_vasprintf": _vasprintf, "_read": _read, "___cxa_is_number_type": ___cxa_is_number_type, "__reallyNegative": __reallyNegative, "_time": _time, "_llvm_uadd_with_overflow_i32": _llvm_uadd_with_overflow_i32, "_pthread_cond_broadcast": _pthread_cond_broadcast, "___cxa_does_inherit": ___cxa_does_inherit, "___ctype_toupper_loc": ___ctype_toupper_loc, "__ZSt9terminatev": __ZSt9terminatev, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_llvm_eh_exception": _llvm_eh_exception, "___assert_func": ___assert_func, "__exit": __exit, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "__isFloat": __isFloat, "_pwrite": _pwrite, "_recv": _recv, "_sbrk": _sbrk, "___cxa_call_unexpected": ___cxa_call_unexpected, "_strerror_r": _strerror_r, "_newlocale": _newlocale, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "_uselocale": _uselocale, "___resumeException": ___resumeException, "_ungetc": _ungetc, "_acos": _acos, "_vsprintf": _vsprintf, "_strftime": _strftime, "_llvm_lifetime_start": _llvm_lifetime_start, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "_stdout": _stdout, "___fsmu8": ___fsmu8, "___dso_handle": ___dso_handle }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var __GLOBAL__I_a150 = Module["__GLOBAL__I_a150"] = asm["__GLOBAL__I_a150"];
var _boolean_operate = Module["_boolean_operate"] = asm["_boolean_operate"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiiif = Module["dynCall_viiiiif"] = asm["dynCall_viiiiif"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiif = Module["dynCall_viiiiiif"] = asm["dynCall_viiiiiif"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
