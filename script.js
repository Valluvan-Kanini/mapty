'use strict';



let map, mapEvent;//These are global variables

class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;

    constructor(coords, distance, duration){

        this.coords = coords;// [lat, lng]
        this.distance = distance;//in km
        this.duration = duration;//in min

    }

    _setDescription(){//This is an internal usage method

        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;

    }

    click(){
        this.clicks++;
    }
}

class Running extends Workout{
    type = 'running';//We are creating the "type" new property inside of the object belongs to "Running" child class. 
                    //We set the value 'running' to the 'type' property

    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;

        this.calcPace();//We call the "calcPace" method

        this._setDescription();//We call the "_setDescription" method
    }

    calcPace(){// in min/km, this is a method
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout{
    type = 'cycling';//We are creating the "type" new property inside of the object belongs to "Cycling" child class. 
                    //We set the value 'cycling' to the 'type' property

    constructor(coords, distance, duration, elevationGain){
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        //this.type = 'cycling';

        this.calcSpeed();//We call the "calcSpeed" method

        this._setDescription();//We call the "_setDescription" method
    }

    calcSpeed(){//in km/h, this is a method
        this.speed = this.distance / (this.duration/60);
        return this.speed;
    }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);//We are creating the new object using of "Running" child class
// const cycling1 = new Cycling([39, -12], 27, 95, 523);//We are creating the new object using of "Cycling" child class
// console.log(run1, cycling1);//Debugging


///////////////////////////////////
//APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{

    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];//private empty array

    constructor(){
        //Get user's position
        this._getPosition();//"this" keyword pointing the "app" object, we call the "_getPosition" method

        //Get data from local storage
        this._getLocalStorage();

        //Attach Event Handlers
        form.addEventListener('submit', this._newWorkout.bind(this));
        
        inputType.addEventListener('change', this._toggleElevationField);

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
        
    }

    _getPosition(){

        if(navigator.geolocation){//

            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){//This is an error call back function
                alert('Could not get Your Position 🌍🌍🌍');
            }
            
            );
        };
    }

    _loadMap(position){//This is success call back function, the API Giolocation object value pass to the "position" argument
        
            const {latitude} =  position.coords;//"{latitude}" pointing the latitude property in the "coords" child object, here "position" is parent object
            const {longitude} = position.coords;//"{longitude}" pointing the  longitude property in the "coords" child object, here "position" is parent object
     
            console.log(latitude, longitude);//Debugging 11.5096145   77.292812
     
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);//Debugging Our current location
     
            const coords = [latitude, longitude];//We are declaring an array named "coords" with two elements, latitude and longitude.

            //console.log(this)//Debugging purpose
     
            this.#map = L.map('map').setView(coords, this.#mapZoomLevel);//"L.map('map')" is Creates a new Leaflet "map instance", associating it with the HTML element with the ID 'map'. Make sure you have an HTML element with the ID 'map' in your document.
                                                                 //.setView([51.505, -0.09], 13): Sets the "initial center" and "zoom level" of the map. In this case, it sets the "center to coordinates [51.505, -0.09]"" and a "zoom level of 13".
     
             console.log(this.#map, typeof this.#map);//Debugging
     
             L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             }).addTo(this.#map);//L.tileLayer: This function creates a tile layer for the map
             //'https://tile.openstreetmap.org/{z}/{x}/{y}.png': This is the URL template for the tile layer. It fetches map tiles from the OpenStreetMap tile server. 
             //attribution: This is the text that will be displayed in the map attribution control. It includes a link to the OpenStreetMap contributors' page.
             //addTo(map): This method adds the tile layer to the previously created Leaflet map (map).
     
             //Handling clicks on map
             this.#map.on('click', this._showForm.bind(this)//When we clicks on the map, the provided callback function will be executed, logging the "mapEvent" object to the console.
                                               //The "mapEvent" is our choice. This is not argument, it is an object.
                                               //This function is a "callback" function
                 
     
             
             );// This can be useful for inspecting the details of the "click" event, including the clicked coordinates "(mapEvent.latlng)".


            this.#workouts.forEach((work) => {//The "forEach()" method no of loops = length of the "this.#workouts". In the first loop, the index value [0]'s value will pass to the 'work' argument
                this._renderWorkoutMarker(work);//Inside of the function body, we will call the "_renderWorkoutMarker()" method using of "this" object and pass the value to the "work" parameter
            });

         }

    _showForm(mapE){

        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();

    }

    _hideForm(){//This is an internal usage method

        //Empty inputs fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        //Hide the form
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
    }

    _toggleElevationField(){

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

    }

    _newWorkout(event){

            event.preventDefault();//Prevent from loading

            console.log(this);//Debugging

            const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));//This is arrow function and also callback function
                                //"...inputs" is a rest operator argument.
                                //"inputs" is a array. The no of loops "every" method = length of the inputs array
                                //In the first loop, the [0]'s array element pass to the "inp" argument
                                //The "return" keyword store the boolean value, true or false. In between the loop, if the 'false' value comes means, the loop will stop.

            const allPositive = (...inputs) => inputs.every(inp => inp > 0);//This is arrow function and also callback function
                                //"...inputs" is a rest operator argument.
                                //"inputs" is a array. The no of loops "every" method = length of the inputs array
                                //In the first loop, the [0]'s array element pass to the "inp" argument
                                //The "return" keyword store the boolean value, true or false. In between the loop, if the 'false' value comes means, the loop will stop.

            //Get data from form
            const type = inputType.value;
            const distance = +inputDistance.value;//We are typecasting from string datatype to number datatype
            const duration = +inputDuration.value;//We are typecasting from string datatype to number datatype
            const {lat, lng} = this.#mapEvent.latlng;//We are using destructuring to extract the "lat" and "lng" properties from the "latlng" object within the "mapEvent" object.
                                                 //Actually {lat, lng}, these are properties. Available in the "latlng" child object with in the "mapEvent" parent object.

            let workout;//This is global variable

            //If workout running, create running object
            if(type === 'running'){
                const cadence = +inputCadence.value;

                //Check if data is valid
                if(
                    //!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)
                    !validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)//We call the "validInputs" and "allPositive" arrow functions and pass the values to the "...inputs" rest operator argument and get the boolean value
                ){
                    return alert('Inputs have to be positive numbers and Greater than 0 ⛔⛔⛔');
                }

                workout = new Running([lat, lng], distance, duration, cadence);//We create the "workout" object using of "Running" child class and pass the values to the constructor's parameter
                
            }

            //If workout cycling, create cycling object
            if(type === 'cycling'){
                const elevation = +inputElevation.value;

                //Check if data is valid
                if(
                    //!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(elevation)
                    !validInputs(distance, duration, elevation) || !allPositive(distance, duration)//We call the "validInputs" and "allPositive" arrow functions and pass the values to the "...inputs" rest operator argument and get the boolean value
                ){
                    return alert('Inputs have to be positive numbers and Greater than 0 ⛔⛔⛔');
                }

                workout = new Cycling([lat, lng], distance, duration, elevation);//We create the "workout" object using of "Cycling" child class and pass the values to the constructor's parameter
            }

            //Add new object to workout array
            this.#workouts.push(workout);//Using of "push" method, we are adding the "workout" object value to the "#workouts" private empty array property
            //console.log(workout);//Debugging

            //Render workout on map as marker
            this._renderWorkoutMarker(workout);//We call the "_renderWorkoutMarker" method using of "this" keyword. We pass the "workout" object value to the "workout" parameter in the method.

            //Render workout on list
            this._renderWorkout(workout);//We call the "_renderWorkout" method using of "this" keyword. We pass the "workout" object value to the "workout" parameter in the method.
        
            //Hide form + Clear input fields after submit
            this._hideForm();//We call the "_hideForm()" method using of "this" keyword.

            //Set local storage to all workouts
            this._setLocalStorage();
            
    }

    _renderWorkoutMarker(workout){//This is an internal usage method
        
        console.log(this.#mapEvent);//Debugging. The "mapEvent" argument contains information about the click event, such as the clicked coordinates.
        
        //console.log(this.#mapEvent.latlng);//Debugging. latlng pointing the both "latitude" and "longitude"
        
        L.marker(workout.coords).addTo(this.#map)
                          .bindPopup(L.popup({
                            maxWidth: 250,
                            minWidth: 100,
                            autoClose: false,
                            closeOnClick: false,
                            className: `${workout.type}-popup`,
                         }))
                        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
                        .openPopup();//We are adding a marker to your Leaflet map using the "L.marker" function.
                                    //L.marker([51.5, -0.09]): This creates a marker at the specified coordinates [51.5, -0.09].
                                    //.addTo(map): This method adds the marker to the previously created Leaflet map (map).
                                    //.bindPopup('A pretty CSS popup.<br> Easily customizable.'): This binds a popup to the marker with the specified content. The content can include HTML.
                                    //.openPopup(): This opens the popup immediately after adding the marker. If you remove this line, the popup will only open when the user clicks on the marker. 
    }

    _renderWorkout(workout){//This is an internal usage method

        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if(workout.type === 'running'){

            html = html + `
                        <div class="workout__details">
                            <span class="workout__icon">⚡️</span>
                            <span class="workout__value">${workout.pace.toFixed(1)}</span>
                            <span class="workout__unit">min/km</span>
                        </div>
                        <div class="workout__details">
                            <span class="workout__icon">🦶🏼</span>
                            <span class="workout__value">${workout.cadence}</span>
                            <span class="workout__unit">spm</span>
                        </div>
                    </li>
        `;//Here we are replacing the value in the "html" variable
        }


        if(workout.type === 'cycling'){

            html = html + `
                        <div class="workout__details">
                            <span class="workout__icon">⚡️</span>
                            <span class="workout__value">${workout.speed.toFixed(1)}</span>
                            <span class="workout__unit">km/h</span>
                        </div>
                        <div class="workout__details">
                            <span class="workout__icon">⛰</span>
                            <span class="workout__value">${workout.elevationGain}</span>
                            <span class="workout__unit">m</span>
                        </div>
                    </li>
        `;//Here we are replacing the value in the "html" variable
        }

        form.insertAdjacentHTML('afterend', html);//We are insert the "html" variable into the "form" variable

    }

    _moveToPopup(event){//This is an internal usage method

        // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
        if (!this.#map) {
            return;
        }

        const workoutEl = event.target.closest('.workout');

        //console.log(event);//Debugging

        console.log(workoutEl, typeof workoutEl);//Object, Debugging

        if(!workoutEl){
            return;
        }

        const workout = this.#workouts.find(//The find method no of loops = length of the "this.#workouts"
            (work) => work.id === workoutEl.dataset.id);

        //console.log(workout, typeof workout);//Object, Debugging

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });

        //Using the public interface
       // workout.click();
    }

    _setLocalStorage(){//This is an internal usage method
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));//This line sets an item in the localStorage. The "key" for the item is 'workouts', and the "value" is the JSON stringified version of this.#workouts.
    }                       // "JSON.stringify()" is used to convert the workouts data (presumably an object or array) into a "string" so that it can be stored in localStorage.
                            //"this.#workouts" represents the workout data that you want to store.


    _getLocalStorage(){//This is an internal usage method

        const data = JSON.parse(localStorage.getItem('workouts'));//It fetches the value associated with the key 'workouts' from the localStorage and assigns it to the variable "data". 
                                                    //This is how you retrieve the workout data that was previously stored using localStorage.setItem('workouts', JSON.stringify(this.#workouts)).
                                                    //However, keep in mind that the data retrieved from localStorage is stored as a string. If the original data was an object or an array, you may need to parse it back into its original format using JSON.parse():
        console.log(data);//Debugging

        if(!data){
            return;
        }

        this.#workouts = data;//Assigns the value of the "data" variable to the "this.#workouts" property. This assumes that "this.#workouts" is a private class field or an instance property of an object.

        this.#workouts.forEach((work) => {//The "forEach()" method no of loops = length of the "this.#workouts". In the first loop, the index value [0]'s value will pass to the 'work' argument
            this._renderWorkout(work);//Inside of the function body, we will call the "_renderWorkout()" method using of "this" object and pass the value to the "work" parameter
        });

    }

    reset(){//This is a method

        localStorage.removeItem('workouts');//localStorage.removeItem('workouts'): This line removes the item with the key 'workouts' from the browser's localStorage. This is essentially clearing the stored workout data.
        location.reload();//location.reload(): This line reloads the current page. This is often used to refresh the page after performing certain actions
    }

}

const app = new App();//We are creating the new object 'app'


