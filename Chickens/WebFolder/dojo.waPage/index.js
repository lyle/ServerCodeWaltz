
// dojo.ready(function(){
//var columns, store, grid   
WAF.onAfterInit = function() {
  require([
      "Wakanda",
      "dojo/store/Memory",
      "dgrid/OnDemandGrid",
      "dojo/store/Observable"
  ], function (Wakanda, Memory, OnDemandGrid, Observable) {
     var chickens = [{name:"Little Bon", breed:"americana", alive:true},
       {name:"Cim-Cha", breed:"silver lace", alive:true},
       {name:"Lucy Left", breed:"whinedot", alive:false},
       {name:"Crazy Break", breed:"silky", alive:true}];
       var store = new Memory({data:chickens, idProperty: "name"});
       
      observerable = new Observable(store);
      // Create an instance of OnDemandGrid referencing the store
      grid = new OnDemandGrid({
          store: observerable,
          columns: {
              name: "Name",
              breed: "Breed",
              alive: {label:"alive", formatter:function(item){if(item){return "&#10003;"}else{return "x"}}}
          }
      }, "grid");
      grid.startup();
    
  });
}

function displayView(daView, chickenArray){
  var tempResult ='<table class="chickenList"';
  chickenArray.forEach(function(chicken){
    //console.log(chicken.name)
    tempResult +='<tr>'
    tempResult +='<td>' + chicken.name + '</td>'
    tempResult +='<td>'+ chicken.breed + '</td>'
    tempResult +='</tr>'
  });
  daView.innerHTML = tempResult;
}






