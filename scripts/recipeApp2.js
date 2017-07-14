// Clever Cooks | Recipe Finder
// Coded by Andrew Dyke Oct. 2015

// This is a small web application that is easy to use. It is for people to find recipes from all over the world. It is powered by the Yummply API. 

// There are 3 options to narrow down results: Holiday, Course and Prep Time. On form submission the user will be presented with recipes corresponding to the their request.
// ---------------------------------------------------------------------


// Create an empty object called recipeApp. Within this object we will store all of the functionality of our application.
var recipeApp = {};

// We add properties and values to the object recipeApp. The api id and key are provided by the owner of the API and we can't get in without them.
recipeApp.apiId = '4180c144';
recipeApp.apiKey = '58c4ec16abb8bc536b83d95dbb8c80b2';

recipeApp.numRecipes = 0;

// Predetermined result number we can update and reuse to load more recipes.
recipeApp.maxResult = 12;

// Create a function(method) inside our object to retrieve data from API
// This function gets back all requested values through a query string. The variables you see concatenated within the query string are storing values inputted by our user. 
recipeApp.getRecipes = function(selectedHoliday, selectedCourse, prepTime) {
	// API URL & QUERY STRING
	var apiUrl = 'https://api.yummly.com/v1/api/recipes?_app_id='+ recipeApp.apiId +'&_app_key='+ recipeApp.apiKey + selectedHoliday + selectedCourse + prepTime + '&requirePictures=true&maxResult=' + recipeApp.maxResult + '&start=' + recipeApp.numRecipes;
	// AJAX is used to get info across the internerd from our API
	$.ajax({
		// using the url variable we made
		url: apiUrl,
		method: 'GET',
		dataType: 'jsonp',
	// using THEN we can store the value(which is an object) returned in a variable called result and do something else. In this case we've discovered that inside the object returned from our request is a better more descriptive object for each recipe. So if we want to access this better information we need to loop through our results and get the id of all the recipes we were returned.
	}).then(function(result) {
		
		// If the number of recipes is 0 then we show the title "Recipes Found"
		if (recipeApp.numRecipes === 0) {
			// Put a title for results on the page
			var pageTitle = $('<h4>').text('Recipes Found:');
			$('#recipe').append(pageTitle);
			
			// Find the .loadMore button and remove the .hide class
			$('.loadMore').removeClass('hide');
		}
		
		// Add our maxRecipes (ie. 12) to the numRecipes (ie. 0)
		// This keeps track of how many recipes are being shown on the screen
		recipeApp.numRecipes = recipeApp.maxResult + recipeApp.numRecipes;
		
		// looping through each recipe
		$.each(result.matches, function(index, value) {
			// storing recipe id each time
			var recipeId = value.id;
			// Calling the function and passing the recipe ID to use
			// Passing values to another function is one short line of code but is a 3 step process: identify the function that we're sending the value in recipeId to | call it with parentheses | and pass the value through the hole(parentheses).
			recipeApp.getOneRecipe(recipeId);
		});
		
	});
};

// The job of the getOneRecipe function is to accept the value passed to it from the getRecipes function and make another ajax call to get more detailed information.
// we define the value as idSent within this function so we can remember it was the id we're using to get the meatier data of each recipe.
recipeApp.getOneRecipe = function(idSent) {
	// In the url used in this request for a specific recipe we use idSent to specify the recipe we want 
	var apiUrl = 'https://api.yummly.com/v1/api/recipe/'+ idSent +'?_app_id='+ recipeApp.apiId +'&_app_key='+ recipeApp.apiKey;
	$.ajax({
		url: apiUrl,
		method: 'GET',
		dataType: 'jsonp'
	}).then(function(result) {
		// This time with our result we want to pass it to a function that will create html elements and append them all within a containing div in the users browser.
		// Placing Results Found Title in section#recipe
		recipeApp.displayResult(result);
	});
};

// Creating a new method in recipeApp that places values we want from the API into the appropriate HTML elements. This is easily expandable simply using dot notation to access values stored in the Yummly API.
recipeApp.displayResult = function(recipeObject) {	
	// we use whatever name we choose when renaming the values passed into this(and every) function. This means the variable in parentheses above is the first part of our dot notation when selecting the info we want from that object. So we can use dot notation now to select the values in the object, store them in variables and use them for whatever we want.
	var name = recipeObject.name;
	var imageUrl = recipeObject.images[0].hostedLargeUrl;
	var ingredientsList = recipeObject.ingredientLines;
	var originalSource = recipeObject.source.sourceRecipeUrl;

	// Creating HTML tags and placing the values in the variables above inside them
	// var resultsTitle = $('#recipe').html('<h3>Recipes Found:</h3>');

	// Make an H2 tag with the name variable inside it
	name = $('<h2>').text(name);


	// Make an image tag and assign an src and alt attribute to it
	var image = $('<img>').attr('src', imageUrl).attr('alt', 'A picture of the recipe');

	var linkImage = $('<a>').attr('href', originalSource).append(image);
	// A link to the orginal source
	// var source = $('<a>').attr('href', originalSource).text('Recipe Source');
	ingredientsTitle = $('<h5>').text('Ingredients:');
	ingredients = $('<p>').addClass('ingredientsList').text(ingredientsList);

	// Make a div with a class of recipeBox and append(insert) within it the variables we just made to make a div with an H2, img, and two p tags inside it with all the info we want our user to see.
	var recipeBox = $('<div>').addClass('recipeBox', 'hvr-float-shadow').append(name, linkImage, ingredientsTitle, ingredients);

	//  Then place the recipeBox in the element with the id of 'recipe'
	$('#recipe').append(recipeBox);

	if (recipeApp.numRecipes === 12) {
		$.smoothScroll({
			scrollTarget: '#recipe'
		});
	};
};

// Making the form work
recipeApp.formSubmit = function() {
	
	$('.recipeForm').on('submit', function(event){
		// prevent default form submission and instead
		event.preventDefault();
		// Get the value inputted and assign to variable
		var selectedHoliday = '&allowedHoliday[]=holiday^holiday-' + $('#selectedHoliday').val();
		var selectedCourse = '&allowedCourse[]=course^course-' + $('#selectedCourse').val();
		var prepTime = '&maxTotalTimeInSeconds=' + $('#prepTime').val();

		// calling method getRecipes and passing it the values we've stored in our variables above
		recipeApp.getRecipes(selectedHoliday, selectedCourse, prepTime);
	});


	$('.loadMore').on('click', function(event){
		// prevent default form submission and instead
		event.preventDefault();
		// $('#recipe').remove();
		// Get the value inputted and assign to variable
		var selectedHoliday = '&allowedHoliday[]=holiday^holiday-' + $('#selectedHoliday').val();
		var selectedCourse = '&allowedCourse[]=course^course-' + $('#selectedCourse').val();
		var prepTime = '&maxTotalTimeInSeconds=' + $('#prepTime').val();
	
		// calling method getRecipes and passing it the values we've stored in our variables above
		recipeApp.getRecipes(selectedHoliday, selectedCourse, prepTime);
	});

};

recipeApp.init = function() {
	recipeApp.formSubmit();
};

// Run app Run!!
$(document).ready(function(){
  recipeApp.init();
});

