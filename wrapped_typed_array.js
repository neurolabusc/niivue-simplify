/**
 * <kbd>require.mx('mxjs/base/utilities/wrapped_typed_array.js')</kbd>
 * 
 * Wrap TypedArray objects to provide functions that rely on dynamic sizing
 * (push, pop, etc.).
 * 
 * @mXrap
 * @library WrappedTypedArray
 * @alpha
 */

const exports = (function(){
  "use strict";

  const exports = {};

  const MIN_INTERNAL_LENGTH = 8;
  const SMALL_SUBARRAY_LIMIT = 10;
  const BYTE_SIZE_LIMIT = 0x40000000;

  function max2(a, b) { return a > b ? a : b; }
  function min2(a, b) { return a < b ? a : b; }

  exports.TAHelp = {};

  exports.TAHelp.slice = function(ta, begin, end) {
    begin = begin || 0;
    end = end || ta.length;

    begin = begin < 0 ? max2(begin + ta.length, 0) : begin;
    end = end < 0 ? max2(end + ta.length, 0) : end;

    var clone = new ta.constructor(end - begin);

    for (var i = 0; i < clone.length; ++i) {
      clone[i] = ta[begin+i];
    }

    return clone;
  };

  function __throw(message) {
    throw new Error(message);
  }

  function __internal_resize(wta, newInternalLength) {
    var newinternal = new wta._ctor(newInternalLength);
    if (!newinternal || typeof(newinternal.length) === "undefined") {
      __throw("Couldn't allocate space for " + newInternalLength + " elements.");
    }

    var oldinternal = wta._internal;
    var newRealLength = min2(wta._length, newInternalLength);

    wta._length = newRealLength;

    for (var i = 0; i < newRealLength; ++i) {
      newinternal[i] = oldinternal[i];
    }

    wta._internal = newinternal;
  }

  function makeWrappedTypedArray(ctor) {
    const BYTES_PER_ELEMENT = (new ctor(1)).BYTES_PER_ELEMENT;
    const MAX_INTERNAL_LENGTH = (BYTE_SIZE_LIMIT/BYTES_PER_ELEMENT)-1;

    /**
     * A <code>WrappedTypedArray</code> object wraps a native
     * <code>TypedArray</code> object and provides convenience functions for
     * dynamically changing the length of the internal <code>TypedArray</code>.
     * Because Javascript typed arrays have a fixed length, this is simulated by
     * storing a separate 'used length' variable and only considering elements
     * up to the 'used length'. When the 'used length' exceeds the real length
     * of the internal typed array, a larger internal typed array is constructed
     * and the values from the old internal typed array are copied into the new
     * one.
     * 
     * Note that <code>WrappedTypedArray</code> is a placeholder for one of the
     * following names, all of which provide the same interface described here,
     * but use a different native <code>TypedArray</code> internally:
     * <ul>
     *  <li>WrappedInt8Array</li>
     *  <li>WrappedUint8Array</li>
     *  <li>WrappedUint8ClampedArray</li>
     *  <li>WrappedInt16Array</li>
     *  <li>WrappedUint16Array</li>
     *  <li>WrappedInt32Array</li>
     *  <li>WrappedUint32Array</li>
     *  <li>WrappedFloat32Array</li>
     *  <li>WrappedFloat64Array</li>
     * </ul>
     * 
     * With the current version of Javascript, it is not possible to fully
     * emulate the interface of a native <code>TypedArray</code> (or
     * <code>Array</code>), so some elemental operations such as iteration or
     * square-bracket access (i.e. array[0]) are not possible with the
     * <code>WrappedTypedArray</code> object itself. For these purposes, you can
     * access the internal <code>TypedArray</code> using the
     * <code>internal</code> property, but <strong>you must be careful not to
     * iterate past the length defined in the parent
     * <code>WrappedTypedArray</code></strong>.
     * 
     * Correct:
     * <pre><code>const wta = new LibWTA.WrappedFloat32Array(...);
     * for (let i = 0; i < wta.length; ++i) {
     *   print(wta.internal[i]);
     * }
     * </code></pre>
     * 
     * <strong>Incorrect</strong>:
     * <pre><code>const wta = new LibWTA.WrappedFloat32Array(...);
     * for (let i = 0; i < wta.internal.length; ++i) {
     *   print(wta.internal[i]);
     * }
     * </code></pre>
     * 
     * <strong>Incorrect</strong>:
     * <pre><code>const wta = new LibWTA.WrappedFloat32Array(...);
     * for (let i in wta.internal) {
     *   print(wta.internal[i]);
     * }
     * </code></pre>
     * 
     * @class WrappedTypedArray
     * @param {*} length 
     */
    const wta = function(length) {
      length = length || 0;

      if (false) {
      Object.defineProperties(this, {
        _ctor: { value: ctor },

        _length: {
          value: length,
          writable: true
        },

        _internal: {
          value: new ctor(max2(length, MIN_INTERNAL_LENGTH)),
          writable: true
        },

        /**
         * @member {TypedArray} TypedArray the underlying type of <code>TypedArray</code> used by this <code>WrappedTypedArray</code>.
         */
        TypedArray: { value: ctor }
      });
      }
      else {
        this._ctor = ctor;
        this._length = length;
        this._internal = new ctor(max2(length, MIN_INTERNAL_LENGTH));
        this.TypedArray = ctor;
      }
    };

    const _small_subarray_contructors = [];

    function make_small_subarray_constructor(length) {
      const ssc = function(wrappedArray, begin) {
        this._wrappedArray = wrappedArray;
        this._begin = begin;
      };

      for (let i = 0; i < length; ++i) {
        const off = i;
        ssc.prototype.__defineGetter__(off, function() { return this._wrappedArray._internal[this._begin+off]; });
        ssc.prototype.__defineSetter__(off, function(v) { this._wrappedArray._internal[this._begin+off] = v; });
      }

      ssc.prototype.__defineGetter__("length", function() { return length; });

      return ssc;
    }

    function _small_subarray(wta, begin, length) {
      if (length > SMALL_SUBARRAY_LIMIT) {
        throw new Error("length '" + length + "' exceeds small_subarray limit.");
      }

      var ssc = _small_subarray_contructors[length];

      if (!ssc) {
        ssc = _small_subarray_contructors[length] = make_small_subarray_constructor(length);
      }

      return new ssc(wta, begin);
    }

    /**
     * Equivalent to TypedArray.prototype.indexOf():
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/indexOf
     * 
     * @method indexOf
     * @param {Number} searchElement
     * @param {Number} (optional) fromIndex
     * @return {Number} index
     */
    wta.prototype.indexOf = function(searchElement, fromIndex) {
      if (typeof(fromIndex) !== "number") {
        fromIndex = 0;
      }

      var internal = this.internal;
      var length = this.length;
      var i;

      if (fromIndex < 0) { fromIndex = max2(0, fromIndex + length); }

      if (searchElement === searchElement) {
        for (i = fromIndex; i < length; ++i) {
          if (internal[i] === searchElement) {
            return i;
          }
        }
      }
      else {
        // NaN
        for (i = fromIndex; i < length; ++i) {
          if (internal[i] !== internal[i]) {
            return i;
          }
        }
      }

      return -1;
    };

    /**
     * Equivalent to Array.prototype.push():
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
     * 
     * @method push
     * @param {Number} value
     */
    wta.prototype.push = function (v) {
      if (this._length === this._internal.length) {
        if (this._internal.length < MAX_INTERNAL_LENGTH) {
          var newlength = 2 * this._internal.length;

          if (newlength > MAX_INTERNAL_LENGTH) {
            newlength = MAX_INTERNAL_LENGTH;
          }

          __internal_resize(this, newlength);
        }
        else {
          __throw("WrappedTypedArray already at maximum length " + MAX_INTERNAL_LENGTH);
        }
      }

      this._internal[this._length] = v;
      this._length++;
    };

    /**
     * @method toTypedArray
     * @return {TypedArray}
     */
    wta.prototype.toTypedArray = function() {
      var length = this.length;
      var internal = this.internal;

      var ta = new this.TypedArray(length);

      for (var i = 0; i < length; ++i) {
        ta[i] = internal[i];
      }

      return ta;
    };

    Object.defineProperties(wta.prototype, {
      _expand_if_needed: {
        value: function (newElementCount) {
          const newlength = this._length + newElementCount;

          if (newlength <= MAX_INTERNAL_LENGTH) {
            if (newlength > this._internal.length) {
              var resizeto = 2 * this._internal.length || MIN_INTERNAL_LENGTH;
              
              while (newlength > resizeto) {
                resizeto = 2 * resizeto;
              }

              if (resizeto > MAX_INTERNAL_LENGTH) {
                resizeto = MAX_INTERNAL_LENGTH;
              }

              __internal_resize(this, resizeto);
            }
          }
          else {
            __throw("new length " + newlength + " exceeds maximum element count " + MAX_INTERNAL_LENGTH);
          }
        }
      },

      // more-or-less default

      /**
       * @member {Number} length sets or returns the number of elements in this array (equivalent to Array.length).
       */
      length: {
        enumerable: true,
        get: function () {
          return this._length;
        },
        set: function (v) {
          if (v > this._length) {
            if (v > this._internal.length) {
              if (v <= MAX_INTERNAL_LENGTH) {
                // Expand the internal array to have enough room for the new items.
                __internal_resize(this, v);
              }
              else {
                __throw("new length " + v + " exceeds maximum element count " + MAX_INTERNAL_LENGTH);
              }
            }
          } else if (v < this._length) {
            // Clear the removed items.
            // this._internal.fill(0, v, this._length);
            for (var i = v; i < this._length; ++i) {
              this._internal[i] = 0;
            }
          }

          this._length = v;
        }
      },

      /**
       * This is a polyfill, only added if the standard builtin method does not
       * exist.
       */
      copyWithin: {
        value: function(target, start, end) {
          const length = this.length;
          const internal = this.internal;

          if (typeof(start) !== "number") { start = 0; }
          if (typeof(end) !== "number") { end = length; }

          if (target < 0) {
            target = max2(0, target + length);
          }
          else {
            target = min2(target, length);
          }

          if (start < 0) {
            start = max2(0, start + length);
          }
          else {
            start = min2(start, length);
          }

          if (end < 0) {
            end = max2(0, end + length);
          }
          else {
            end = min2(end, length);
          }

          const count = end - start;

          if (target < start) {
            for (let i = 0; i < count; ++i) {
              internal[target+i] = internal[start+i];
            }
          }
          else if (target > start) {
            const targetEnd = min2(target + count, this.length);
            const realCount = targetEnd - target;

            for (let i = realCount-1; i >= 0; --i) {
              internal[target+i] = internal[start+i];
            }
          }
        }
      },

      /**
       * Equivalent to Array.prototype.every():
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
       * 
       * @method every
       * @param {Function} callback
       * @param {Object} thisArg Optional.
       * @return {Boolean} result
       */
      every: {
        value: function(callback, thisArg) {
          var internal = this.internal;

          for (var i = 0; i < this.length; ++i) {
            if (!callback.call(thisArg, internal[i], i, this)) {
              return false;
            }
          }

          return true;
        }
      },

      /**
       * Equivalent to Array.prototype.join():
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
       * 
       * @method join
       * @param {String} separator
       * @return {String} result
       */
      join: {
        value: function(separator) {
          var length = this.length;
          var internal = this.internal;

          separator = separator || ',';

          var result = '';

          if (length) {
            result += internal[0];
            for (var i = 1; i < length; ++i) {
              result += separator + internal[i];
            }
          }

          return result;
        }
      },

      /**
       * Equivalent to Array.prototype.pop():
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop
       * 
       * @method pop
       * @return {Number} popped
       */
      pop: {
        enumerable: true,
        value: function () {
          if (this._length > 0) {
            return this._internal[--(this._length)];
          }
        }
      },

      /**
       * Equivalent to Array.prototype.reverse():
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
       * 
       * @method reverse
       */
      reverse: {
        enumerable: true,
        value: function () {
          var length = this.length;
          var internal = this.internal;

          for (var i = 0; i < (length / 2); ++i) {
            var temp = internal[length-i-1];
            internal[length-i-1] = internal[i];
            internal[i] = temp;
          }
        }
      },

      /**
       * Equivalent to Array.prototype.slice():
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
       * 
       * @method slice
       * @param {Number} begin
       * @param {Number} end
       * @return {WrappedTypedArray} slice
       */
      slice: {
        enumerable: true,
        value: function (begin, end) {
          begin = begin || 0;
          end = end || this._length;

          begin = begin < 0 ? max2(this._length + begin, 0) : begin;
          end = end < 0 ? max2(this._length + end, 0) : end;

          var clone = new wta(end - begin);

          for (var i = 0; i < clone._internal.length; ++i) {
            clone._internal[i] = this._internal[begin + i];
          }

          return clone;
        }
      },

      /**
       * Equivalent to Array.prototype.some():
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
       * 
       * @method some
       * @param {Function} callback
       * @param {Object} thisArg
       * @return {Boolean} result
       */
      some: {
        enumerable: true,
        value: function (callback, thisArg) {
          var internal = this.internal;

          for (var i = 0; i < this.length; ++i) {
            if (callback.call(thisArg, internal[i], i, this)) {
              return true;
            }
          }

          return false;
        }
      },

      // TODO: join

      // extensions from here on

      /**
       * @member property {TypedArray} internal gets the internal (fixed-length) <code>TypedArray</code>. In general, it is not safe to save and reuse this object (because the internal <code>TypedArray</code> may be replaced when extending the length of the <code>WrappedTypedArray</code>, at which point the saved <code>TypedArray</code> would no longer refer to the same object as the internal <code>TypedArray</code>).
       */
      internal: {
        enumerable: true,
        get: function() { return this._internal; }
      },

      /**
       * Get the value of the element at the given index.
       * 
       * @method get
       * @param {Number} index
       * @return {Number} value the value of the element at the given index
       */
      get: {
        enumerable: true,
        value: function(idx) { return this._internal[idx]; }
      },

      /**
       * Sets the value of the element at the given index to the supplied value.
       * 
       * @method set
       * @param {Number} index
       * @param {Number} value
       */
      set: {
        enumerable: true,
        value: function(idx, value) { this._internal[idx] = value; }
      },

      /**
       * Ensure that the underlying TypedArray has enough room for
       * <code>length</code> elements. If you know that you're going to be
       * adding a lot of elements to a <code>WrappedTypedArray</code>, it may
       * improve performance to reserve the space up-front (as when writing to
       * output tables).
       * 
       * @method reserve
       * @param {Number} length attempt to reserve space for <code>length</code> elements
       */
      reserve: {
        enumerable: true,
        value: function(length) {
          if (length > this._internal.length) {
            if (length <= MAX_INTERNAL_LENGTH) {
              __internal_resize(this, length);
            }
            else {
              __throw("reserving " + length + " elements exceeds maximum element count " + MAX_INTERNAL_LENGTH);
            }
          }
        }
      },

      /**
       * Push all values in the given array onto the end of this array. This is
       * a convenience function, equivalent to calling <code>push()</code>
       * independently for each element in the passed array, but simpler and
       * more performant.
       * 
       * @method push_array
       * @param {Array} array
       */
      push_array: {
        enumerable: true,
        value: function(array) {
          this._expand_if_needed(array.length);
    
          for (var i = 0; i < array.length; ++i) {
            this._internal[this._length+i] = array[i];
          }
    
          this._length += array.length;
        }
      },

      /**
       * Creates a "view" of a section of this array, starting from the index
       * <code>begin</code> and continuing while the index is less than
       * <code>end</code>. This is similar to
       * <code>TypedArray.prototype.subarray()</code>:
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray
       * 
       * Note that the existing builtin
       * <code>TypedArray.prototype.subarray()</code> method has poor
       * performance, so this uses a workaround object that has better
       * performance, but does not have all of the methods that would be present
       * on a real subarray. Furthermore, because of the nature of the
       * workaround object, it should only be used for small subarrays (e.g. to
       * use for a 3-length subarray defining an XYZ point).
       * 
       * @method smallsubarray
       * @param {Number} begin
       * @param {Number} end
       * @return {SmallSubarray} subarray
       */
      smallsubarray: {
        enumerable: true,
        value: function(begin, end) {
          end = typeof(end) === "number" ? end : this._length;
          return _small_subarray(this, begin, end - begin);
        }
      }
    });

    return wta;
  }

  const TYPED_ARRAYS = {
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array
  };

  for (let key in TYPED_ARRAYS) {
    exports["Wrapped" + key] = makeWrappedTypedArray(TYPED_ARRAYS[key]);
  }

  try {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = exports;
    }
  }
  catch (e) {}

  return exports;
})();

const { WrappedInt32Array } = exports;

export { WrappedInt32Array };
