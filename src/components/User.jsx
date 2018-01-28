import React from 'react';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.disconnectUser = this.disconnectUser.bind(this);
    }

    // async componentDidMount() {
            // this.props.socket.emit('locUp', {
            // lat: position.coords.latitude, lon: position.coords.longitude
            // });
        // }
    // }
        // } else {
        //     /* geolocation IS NOT available */
        //     this.props.socket.emit('locUp');
        //     console.log('hum');
        // }

    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    render() {
        return (
            <div className={"User"}>
                <p>Welcome {this.props.user.login}</p>
                <button onClick={this.disconnectUser}>Disconnect</button>
            </div>
        )
    }
}