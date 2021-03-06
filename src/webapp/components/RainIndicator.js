/** @jsx React.DOM */

var React = require('react');
var _ = require('lodash');


module.exports = React.createFactory(
    React.createClass({
        getInitialState: function () {
            this.store = new RainIndicatorStore(this.update);
            return this.store.getState();
        },
        update: function () {
            this.setState(this.store.getState());
        },
        stopTheRain: function () {
            this.store.update({waiting: true});
            this.setState(this.store.getState());
        },
        render: function () {
            var headline = this.state.place.name ? this.state.place.name + ', ' + this.state.place.country: 'Is it raining?';
            var stopRainButton = this.state.isRaining && !this.state.waiting ?
                <button type="button" className="stop-the-rain-button" onClick={this.stopTheRain}>Stop the rain</button> : null;

            var weatherClasses = 'weather-icon';
            weatherClasses += this.state.isRaining === null ? ' mod-unknown': this.state.isRaining ? ' mod-rain' : ' mod-sun';
            weatherClasses += this.state.waiting ? 'is-waiting' : '';

            return (
                <div className="weather">
                    <h1 className="weather-headline">{headline}</h1>

                    <h2 className="weather-status">{this.state.isRaining === null ? 'Checking...' : this.state.weather}</h2>
                    <div className={weatherClasses}></div>
                    {stopRainButton}
                </div>
            )
        }
    }));

function RainIndicatorStore(updateCallback) {
    var that = this;
    this.updateCallback = updateCallback;
    this.state = {
        isRaining: null,
        place: {name: null},
        waiting: false
    };

    setInterval(getData(), 60000);

    function getData() {
        navigator.geolocation.getCurrentPosition(function (position) {
            callServer(position);
        });
    }

    function callServer(position) {
        var r = new XMLHttpRequest();
        r.open('GET', '/api/check-weather?lat=' + position.coords.latitude + '&lng=' + position.coords.longitude);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;
            that.state = JSON.parse(r.responseText);
            updateCallback();
        };
        r.send();
    }

}

RainIndicatorStore.prototype.getState = function () {
    return this.state;
};

RainIndicatorStore.prototype.update = function (newState) {
    _.assign(this.state, newState);
};
