import React from 'react';
import io from 'socket.io-client';
import Guest from './Guest.jsx';
import User from './User.jsx';
import Cookie from 'cookie';

let cookie = Cookie.parse(document.cookie);
let ip = cookie.ip;
let socket = io(ip + ':8081');

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            login: cookie.login,
            error: cookie.error
        };
    }

    componentDidMount (){
        socket.on("doloc", () => {
            if ("geolocation" in navigator) {
                /* geolocation is available */
                navigator.geolocation.getCurrentPosition(position => {
                    socket.emit('locUp', {
                        lat: position.coords.latitude, lon: position.coords.longitude
                    });
                }, error => {
                    console.log(error);
                    socket.emit('locUp', {lat: '', lon: ''});
                });
            }
        });
        socket.on("error", (err) => console.log(err));
        socket.on('refresh', data => socket.emit('refresh', data));
        socket.on('user', (user, fn) => {
            this.userLogin(user);
            if (fn)
                fn();
        });
        socket.on('userDisconnect', (user) => this.userLogout());
    }

    userLogin(user){
        document.cookie = "login=" + true;
        document.cookie = "error=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: user,['login']:true, ['error']:false});
    }

    userLogout(){
        document.cookie = "login=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: {}, ['login']: undefined});
    }

    render(){
        let display = this.state.login && !this.state.error ? <User socket={socket} user={this.state.user} /> : <Guest socket={socket}/>;

        return (
            <div className={"app"}>
                    {display}
            </div>
        )
    }
}