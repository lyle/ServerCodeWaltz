define("Wakanda", 
["dojo/_base/xhr", "dojo/_base/lang", "dojo/json", "dojo/_base/declare", "dojo/store/util/QueryResults", "dojo/store/JsonRest", "dojo/_base/Deferred" /*=====, "./api/Store" =====*/
], function(xhr, lang, JSON, declare, QueryResults, JsonRest, Deferred /*=====, Store =====*/){

  function objectToQuery( /*Object*/ map) {
    var backstop = {};
    var enc = encodeURIComponent,
      pairs = [];
    for (var name in map) {
      var value = map[name];
      if (value != backstop[name]) {
        var assign = name + "=";
        if (lang.isArray(value)) {
          for (var i = 0, l = value.length; i < l; ++i) {
            pairs.push(assign + value[i]);
          }
        } else {
          pairs.push(assign + value);
        }
      }
    }
    return pairs.join("&"); // String
  }
  function objectToFilterQuery( /*Object*/ map) {
    var backstop = {};
    var enc = encodeURIComponent,
      pairs = [];
    for (var name in map) {
      var value = map[name];
      if (value != backstop[name]) {
        var assign = name + "=";
        if (lang.isArray(value)) {
          for (var i = 0, l = value.length; i < l; ++i) {
            pairs.push(assign + value[i]);
          }
        } else {
          pairs.push(assign + value);
        }
      }
    }
    return pairs.join(" AND "); // String
  }
  
  function QueryResultsForWakanda(results){
  	if(!results){
  		return results;
  	}
  	// if it is a promise it may be frozen
  	if(results.then){
  		results = lang.delegate(results);
  	}
  	function addIterativeMethod(method){
  		if(!results[method]){
  			results[method] = function(){
  				var args = arguments;
  				return Deferred.when(results, function(results){
  					Array.prototype.unshift.call(args, results);
  					return QueryResults(array[method].apply(array, args));
  				});
  			};
  		}
  	}
  	addIterativeMethod("forEach");
  	addIterativeMethod("filter");
  	addIterativeMethod("map");
  	if(!results.total){
  		results.total = Deferred.when(results, function(results){
  			return results.length;
  		});
  	}
  	return results; // Object
  };
  
  
  
  
  /*=====
  var __HeaderOptions = {
      // headers: Object?
      //    Additional headers to send along with the request.
    },
    __PutDirectives = declare(Store.PutDirectives, __HeaderOptions),
    __QueryOptions = declare(Store.QueryOptions, __HeaderOptions);
  =====*/
  //debugger;
  return declare("Wakanda", JsonRest, {

    // summary:
    //    This is a basic store for RESTful communicating with a server through JSON
    //    formatted data. It implements dojo/store/api/Store.

    // ascendingPrefix: String
    //    The prefix to apply to sort attribute names that are ascending
    ascendingPrefix: "ASC",

    // descendingPrefix: String
    //    The prefix to apply to sort attribute names that are ascending
    descendingPrefix: "DESC",
   
    query: function(query, options){
      //alert('query fired');
      // summary:
      //    Queries the store for objects. This will trigger a GET request to the server, with the
      //    query added as a query string.
      // query: Object
      //    The query to use for retrieving objects from the store.
      // options: __QueryOptions?
      //    The optional arguments to apply to the resultset.
      // returns: dojo/store/api/Store.QueryResults
      //    The results of the query, extended with iterative methods.
      options = options || {};

      var headers = lang.mixin({ Accept: this.accepts }, this.headers, options.headers);
      var filter;
      if (query && typeof query != "object") {
        filter=query;
      }
      if (query && typeof query == "object"){
        filter=objectToFilterQuery(query)
      }
      query = {};
      if (filter.length>0){
        query["$filter"] = "'" + filter + "'";
      }
      if(options.start >= 0){
        query["$skip"] = options.start;
      }
      if(options.expand){
        //$expand=coop,breed,coop.chickens
        alert('expand fired');
        var expand = ""
        for(var i = 0; i<options.expand.length; i++){
          expand += (i > 0 ? "," : "") + options.expand[i];
        }
        query["$expand"] = expand;
      }
      if(options.count >= 0){
        query["$top"] = options.count;
      }
      if(options.sort){
        //alert('sort fired');
        var orderby = "";
        //$orderby="salary  DESC,lastName ASC,firstName ASC"
        for(var i = 0; i<options.sort.length; i++){
          var sort = options.sort[i];
          orderby += (i > 0 ? "," : "") + encodeURIComponent(sort.attribute) + " " + (sort.descending ? this.descendingPrefix : this.ascendingPrefix);
        }
        query["$orderby"] = orderby;
      }
      
      query = objectToQuery(query);
      
      
     // sort: [
     //       { attribute: "baz", descending: true }
     //     ]
      
      var results = xhr("GET", {
        url: this.target + "?" + (query || ""),
        handleAs: "json",
        headers: headers
      });

      results.total = results.then(function(){
        return results["__COUNT"];
//        var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
//        return range && (range = range.match(/\/(.*)/)) && +range[1];
      });
      results = results.then(function(results){
        results.length = results["__COUNT"];
        return results["__ENTITIES"];
      });

            
      return QueryResults(results);
    },
    
    get: function(id, options){
      id = "(" + id + ")";
      this.inherited(arguments);
    },
    put: function(object, options){
      // summary:
      //    Stores an object. This will trigger a PUT request to the server
      //    if the object has an id, otherwise it will trigger a POST request.
      // object: Object
      //    The object to store.
      // options: __PutDirectives?
      //    Additional metadata for storing the data.  Includes an "id"
      //    property if a specific id is to be used.
      // returns: dojo/_base/Deferred
      options = options || {};
      var id = ("id" in options) ? options.id : this.getIdentity(object);
      var hasId = typeof id != "undefined";
      //alert(typeof id);
      return xhr(hasId && !options.incremental ? "PUT" : "POST", {
        url: hasId ? this.target + "(" + id + ")": this.target,
        postData: JSON.stringify(object),
        handleAs: "json",
        headers: lang.mixin({
          "Content-Type": "application/json",
          Accept: this.accepts,
          "If-Match": options.overwrite === true ? "*" : null,
          "If-None-Match": options.overwrite === false ? "*" : null
        }, this.headers, options.headers)
      });
    }

  });

});
