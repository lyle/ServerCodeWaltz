
//Chicken class exists (loaded from JSON Model.waModel)
//this addClas method will not blow away what exists

chicken = model.addClass("Chicken", "Chickens");
chicken.addAttribute("gender", "storage", "string");
chicken.addAttribute("breed", "relatedEntity", "Breed", "Breed");
chicken.addAttribute("age", "calculated", "long");

chicken.addAttribute("breedName", "calculated", "string");

// ---------------------------

chicken.breedName.onGet = function()
{
	return this.breed.name;
}
chicken.age.onGet = function()
{
	return datetool.computeAge(this.hatchDate, "weeks");
}

chicken.age.onSort = function(ascending)
{
	return datetool.buildSortQuery(ascending, "hatchDate");
}

chicken.age.onQuery = function(compareOperator, compareValue)
{
	return datetool.buildQuery(compareOperator, compareValue, "hatchDate");
}