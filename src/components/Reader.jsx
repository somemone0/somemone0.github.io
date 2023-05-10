import React from "react";

class Reader extends React.Component {

    constructor(props) {
        super(props);

        this.getCensusInfo = this.getCensusInfo.bind(this)
        this.getElectionInfo = this.getElectionInfo.bind(this)
        this.getElectionColor = this.getElectionColor.bind(this)

        this.state = {
            navigation: false,
            blockGroupFIPS: 0,
            dem16: 0,
            rep16: 0,
            dem20: 0,
            rep20: 0,
            countyName: "",
            stateName: "",
            isFiveSeconds: false
        }
    }

    getCensusInfo() {

        const that = this;
        navigator.geolocation.getCurrentPosition(function (position) { // Get location

            var request = "https://geo.fcc.gov/api/census/area?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&censusYear=2020";

            fetch(request)
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.results.length > 0) {

                        that.setState({
                            blockGroupFIPS: responseJson.results.at(0).block_fips,
                            countyName: responseJson.results.at(0).county_name,
                            stateName: responseJson.results.at(0).state_code
                        });

                        that.getElectionInfo()

                    }
                })

        })
    }

    getElectionInfo() {

        const that = this;

        var request = "https://" + this.serverURL + "/electiondata?blockfips=" + this.state.blockGroupFIPS + "&statecode=" + this.state.stateName

        fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {

                that.setState({
                    dem16: parseInt(responseJson.dem2016),
                    rep16: parseInt(responseJson.rep2016),
                    dem20: parseInt(responseJson.dem2020),
                    rep20: parseInt(responseJson.rep2020)
                })

            })

    }

    componentDidMount() {


        this.serverURL = "how-did-they-vote.herokuapp.com"

        if ("geolocation" in navigator) {
            this.setState({navigation: true});
            this.interval = setInterval(() => this.getCensusInfo(), 1500)
        }

        setTimeout(() => {this.setState({isFiveSeconds: true})}, 5000)

        this.getCensusInfo();
    }

    getElectionColor(amount) { // Negative for democrat win, positive for republican win
        let backgroundColor = "";
        let color = "";

        if (amount <= 0) {
            amount = amount * -1;

            if (amount <= 1) {
                backgroundColor = "#D3E7FF";
            } else if (amount <= 4) {
                backgroundColor = "#b9d7ff"
            } else if (amount <= 8) {
                backgroundColor = "#86b6f6"
            } else if (amount <= 12) {
                backgroundColor = "#4389e3"
                color = "white"
            } else if (amount <= 16) {
                backgroundColor = "#1666cb"
                color = "white"
            } else if (amount <= 21) {
                backgroundColor = "#0645b4"
                color = "white"
            } else {
                backgroundColor = "#002B84"
                color = "white"
            }
        } else {
            if (amount <= 1) {
                backgroundColor = "#ffccd0";
            } else if (amount <= 4) {
                backgroundColor = "#f2b3be"
            } else if (amount <= 8) {
                backgroundColor = "#e27f90"
            } else if (amount <= 12) {
                backgroundColor = "#cc2f4a"
                color = "white"
            } else if (amount <= 16) {
                backgroundColor = "#d40000"
                color = "white"
            } else if (amount <= 21) {
                backgroundColor = "#aa0000"
                color = "white"
            } else if (amount <= 30) {
                backgroundColor = "#800000"
                color = "white"
            }
        }

        return {
            backgroundColor: backgroundColor,
            color: color
        }
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval)
        }
    }

    render() {

        if (this.state.navigation === false) {
            return (
                <div><p>You're either on a device that doesn't support location or declined the request for location</p></div>
            );
        } else if (this.state.blockGroupFIPS === 0 || this.state.dem20 === 0) {
            let addition = ""
            if (this.state.isFiveSeconds) addition = <p>(This might be an error with the backend)</p>

            return (
                <div><p>Resolving connection to server...</p>{addition}</div>
            );
        } else {

            let demPercentage20 = (this.state.dem20 / (this.state.dem20 + this.state.rep20)) * 100
            let repPercentage20 = (this.state.rep20 / (this.state.dem20 + this.state.rep20)) * 100

            let difference20 = repPercentage20 - demPercentage20

            var result20 = ((difference20 <= 0) ? "D" : "R") + "+" + (Math.round(Math.abs(difference20) * 100) / 100)

            var demPercentage16 = (this.state.dem16 / (this.state.dem16 + this.state.rep16)) * 100
            var repPercentage16 = (this.state.rep16 / (this.state.dem16 + this.state.rep16)) * 100

            var difference16 = repPercentage16 - demPercentage16

            var result16 = ((difference16 <= 0) ? "D" : "R") + "+" + (Math.round(Math.abs(difference16) * 100) / 100)

            let colors20 = this.getElectionColor(difference20)
            let colors16 = this.getElectionColor(difference16)

            document.body.style.backgroundColor = colors20.backgroundColor;

            return (
                <div style={{textAlign: "center", color: colors20.color}}>
                    <h2>2020: {result20}</h2>
                    <h2 style={{backgroundColor: colors16.backgroundColor, color: colors16.color, padding: 10}}>2016: {result16}</h2>
                    <p>{this.state.countyName}, {this.state.stateName}<br /></p>

                    <p>This district shifted <b>{(Math.round(Math.abs(difference20 - difference16) * 100) / 100)}</b> points to the <b>{(difference20 <= difference16) ? "left" : "right"}</b> last election.</p>
                </div>
            );


        }

    }

}

export default Reader;