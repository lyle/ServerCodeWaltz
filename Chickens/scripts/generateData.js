/**
 * @public
 * @method handleDataInitRequest
 * @param {request Object} request
 * @param {response Object} response
**/

function handleDataInitRequest(request, response){
  var theQuery = getURLQuery(request.url);
  var coopCount = theQuery.coopCount || 100;
  //coopCount = 1000;
  response.contentType = 'text/html';
  if (theQuery.rebuildData) {
    ds.Breed.remove();
    ds.Breed.setAutoSequenceNumber(1);
    ds.Coop.remove();
    ds.Coop.setAutoSequenceNumber(1);
    ds.Chicken.remove();
    ds.Chicken.setAutoSequenceNumber(1);
    ds.Address.remove();
    ds.Address.setAutoSequenceNumber(1);
  }
  
  response.body = "<pre>" + generateSomeData(coopCount) + "\n</pre>" + new Date();
}
function returnNewAddress(usAddress){
  var Faker = require('Faker');
  var address = new ds.Address({
    name: Faker.Company.companyName(0),
    street: Faker.Address.streetAddress(),
    street2:Faker.Address.secondaryAddress()  
  });
  address.city = Faker.Address.city();
  address.zip = Faker.Address.zipCode();
  if (usAddress){
    address.state = Faker.Address.usState();
    address.country = 'United States';
  }else{
    address.state = Faker.Address.brState();
    address.country = Faker.Address.ukCountry();
  }
  address.save();
  return address;
}
function randomCoopName(suffix){
  var Faker = require('Faker');
  var coopName = Faker.random.bs_adjective(suffix);
  return coopName.charAt(0).toUpperCase() + coopName.substring(1)  + ' ' + suffix;
}
/**
 * @private
 * @method generateSomeData
 * @param {number} coopsToGenerate
 * @param {string} progressReference
 * @returns string
 * This is kinda sloppy - but does it's duty.
 **/
function generateSomeData(coopCount, progressReference) {
  progressReference = progressReference || "generateCoops";
  coopCount = coopCount || 100;
  var Faker = require('Faker');
  var status = '';
  var breeds = loadArrayFromFile("breeds.txt");
  var roosterFirstNames = loadArrayFromFile("firstRoosters.txt");
  var henFirstNames = loadArrayFromFile("firstHens.txt");
  if (breeds != null && ds.Breed.all() < 5 )
  {
    console.log("Building Breeds");
    breeds.forEach( function(name){
      breed = new ds.Breed({name: name});
      breed.save();
    });
    status = status + "Created Breeds\n";
  }
  var breedIds = ds.Breed.all();
  if (ds.Coop.all().length > 300 ){
    // Let's erase the exisitng coops and chickens
    ds.Address.remove();
    ds.Address.setAutoSequenceNumber(1);
    ds.Coop.remove();
    ds.Coop.setAutoSequenceNumber(1);
    ds.Chicken.remove();
    ds.Chicken.setAutoSequenceNumber(1);
  }

  var i;
  var hensCreated = 0;
  var roostersCreated = 0;
  console.log("Creating Coops");
  var progress = ProgressIndicator(coopCount,
    "Creating Coops - Coop number {curValue} out of {maxValue}",
    true, "", progressReference);
  
  var curAddress = returnNewAddress(true);
  
  for (i=0; i< coopCount; i++)
  {
    //create or use last address
    if (Faker.random.number(4) > 2) {
      curAddress = returnNewAddress(i%3);
    }
    progress.setValue(i);
    var j;
    var numberOfHens = Faker.random.number(20);
    
    coop = new ds.Coop({name: randomCoopName(curAddress.name)});
    coop.address = curAddress;
    coop.save();
    for (j=0; j < numberOfHens; j++)
    {
      var currentBreedID = breedIds[rangedRandom(0, breedIds.length-1)].ID;
      
      hen = new ds.Chicken({
        name: henFirstNames.getRandomElement(),
        hatchDate: new Date(randomInteger(2010, 2012), randomInteger(0, 11), randomInteger(1, 28)),
        coop: coop,
        breed: (currentBreedID),
        gender: "female"
      });
      try
      {
        hen.save();
        hensCreated ++;
      } catch(e) {
        
      }        

    };
    if (rangedRandom(1,10) == 9)
    {
      var currentBreedID = breedIds[rangedRandom(0, breedIds.length-1)].ID;
      rooster = new ds.Chicken({
        name: roosterFirstNames.getRandomElement(),
        hatchDate: new Date(randomInteger(2010, 2012), randomInteger(0, 11), randomInteger(1, 28)),
        coop: coop,
        breed: (currentBreedID),
        gender: "male"
      });
      try
      {
        rooster.save();
        roostersCreated ++;
      } catch(e) {
        
      }    
    }
  }
  progress.setValue(coopCount);
  //
  status = status + "Created " + coopCount.toString() + " coops\n";
  status = status + "Created " + hensCreated.toString() + " hens\n";
  status = status + "Created " + roostersCreated.toString() + " roosters\n";


  if ('' == status){
    status = "no data generated";
  }
  return status;
}




Array.prototype.getRandomElement = function()
{
  var x = rangedRandom(0, this.length-1);
  return this[x];
}
function rangedRandom(from, to)
{
  from = from || 0;
  to = to || 1000;
  var range = to - from;
  return Math.round((Math.random() * range) + from);
}

//generateSomeData(1000000);