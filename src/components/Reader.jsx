
class Reader extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
       navigation: false,
        blockGroupFIPS: 0,
        dem16: 0,
        rep16: 0,
        dem20: 0,
        rep20: 0,
        countyName: "",
        stateName: ""
    }

    getCensusInfo() {
        navigator.geolocation.getCurrentPosition(function (position) { // Get location

            var request = "https://geo.fcc.gov/area?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&censusYear=2020"
            fetch(request)
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.results.length > 0) {

                        this.setState({
                            blockGroupFIPS: responseJson.results[0].block_fips,
                            countyName: responseJson.results[0].county_name,
                            stateName: responseJson.results[0].state_code
                        })

                        this.getElectionInfo()

                    }
                })

        })
    }

    getElectionInfo() {

        var request = "http://" + this.serverURL + ":3000/electiondata?blockfips=" + this.state.blockGroupFIPS + "&statecode=" + this.state.stateName

        fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {

                this.setState({
                    dem16: responseJson.dem2016,
                    rep16: responseJson.rep2016,
                    dem20: responseJson.dem2020,
                    rep20: responseJson.rep2020
                })

            })

    }

    componentDidMount() {
        this.getCensusInfo = this.getCensusInfo.bind(this)
        this.getElectionInfo = this.getElectionInfo.bind(this)

        this.serverURL = "localhost"

        if ("geolocation" in navigator) {
            this.setState({navigation: true});
            this.interval = setInterval(() => this.getCensusInfo(), 5000)
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
            return (
                <div><p>You are outside the United States.</p></div>
            );
        } else {

            var demPercentage = (this.state.dem20 / (this.state.dem20 + this.state.rep20)) * 100
            var repPercentage = (this.state.rep20 / (this.state.dem20 + this.state.rep20)) * 100

            var difference = Math.abs(demPercentage - repPercentage)

            var result = ((demPercentage >= repPercentage) ? "D" : "R") + "+" + difference

            return (
                <div style={{textAlign: "center"}}>
                    <h2>{this.state.countyName} County, {this.state.stateName}</h2>
                    <p>{result}</p>
                </div>
            );


        }

    }

}