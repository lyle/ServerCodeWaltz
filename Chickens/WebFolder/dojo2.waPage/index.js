WAF.onAfterInit = function() {
  require([
      "Wakanda",
      "dojo/store/Memory",
      "dgrid/OnDemandGrid",
      "dojo/store/Observable",
      "dgrid/OnDemandList"
  ], function (Wakanda, Memory, OnDemandGrid, Observable, OnDemandList) {

     chickenModel = new Wakanda({
       target: "/rest/Chicken"
     });
     createGrid(chickenModel)
     
  //   chickenModel.query({gender:"female"}, {
  //         start: 10,
  //         count: 10
  //  }).then(function(results){
  //         chickens = results;
  //         store = new Memory({ data: chickens, idProperty:"ID" });
  //         createGrid(store)
  //  });
    
    function createGrid(store){
      observerable = new Observable(store);
      // Create an instance of OnDemandGrid referencing the store
      grid = new OnDemandGrid({
          store: observerable,
          minRowsPerPage: 10,
          columns: {
              name: "Name",
              breed: {label:"Breed", formatter:function(breed){if(breed){return breed.name}else{return "-"}}},
              age: "Weeks Old",
              alive: {label:"alive", formatter:function(item){if(item){return "&#10003;"}else{return "x"}}}
          }
      }, "grid");
      grid.startup();
    }
   // example refresh via chrome
   //chickenModel.query({name:'Gw*'},{sort:[{attribute:'age'}],expand:["breed"]}).then(function(results){observerable.data = results;}).then(function(){grid.refresh()})
     
  });

  
  

//  require(["dojo/store/Memory"],
//    function(Memory){
//      var chickens = [
//        {name:"Little Bon", breed:"americana", alive:true},
//        {name:"Cim-Cha", breed:"silver lace", alive:true},
//        {name:"Lucy Left", breed:"whinedot", alive:false},
//        {name:"Crazy Break", breed:"silky", alive:true}
//        ];
//        var employeeStore = new Memory({data:chickens, idProperty: "name"});
//        displayView(daView, employeeStore.query({alive:true}));
//  });


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






