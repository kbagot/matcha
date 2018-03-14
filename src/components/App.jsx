import React from 'react';
import io from 'socket.io-client';
import Guest from './Guest.jsx';
import User from './User.jsx';
import Cookie from 'cookie';
import ReactLoading from 'react-loading';

let cookie = Cookie.parse(document.cookie);
let ip = cookie.ip;
let socket = io(ip + ':8081');

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            login: cookie.login,
            error: cookie.error,
            ready: cookie.ready,
        };
        this.userlocation = this.userlocation.bind(this);
    }

    componentDidMount (){
        socket.on("error", (err) => console.log(err));
        socket.on('refresh', data => socket.emit('refresh', data));
        socket.on('user', (user, fn) => {

            this.userLogin(user);
            if (fn)
                fn();
        });
        socket.on('userDisconnect', (user) => this.userLogout());
    }

    userlocation() {
        console.log('location');
            if ("geolocation" in navigator) {
                /* geolocation is available */
                navigator.geolocation.getCurrentPosition(async position => {
                    await socket.emit('locUp', {
                        lat: position.coords.latitude, lon: position.coords.longitude
                    }, () => {
                        document.cookie = "ready=" + true;
                        this.setState({
                            ['ready']: true,
                        });
                    });
                }, error => {
                    console.log(error);
                    socket.emit('locUp', {lat: '', lon: ''}, () => {
                        document.cookie = "ready=" + true;
                        this.setState({
                            ['ready']: true,
                        });
                    });
                });
            }
    }

    userLogin(user){
        document.cookie = "login=" + true;
        document.cookie = "error=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: user,['login']: true, ['error']: false});
    }

    userLogout(){
        document.cookie = "login=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ready=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: {}, ['login']: undefined, ['ready']: undefined});
    }

    render(){
        let display = '';

        if (this.state.login && !this.state.error && this.state.ready)
            display = <User socket={socket} user={this.state.user}/>;
        else if (this.state.login && !this.state.ready) {
            display = <div className="loadpage">
                <ReactLoading type='cylon' color='white' width='15%' height='15px'/>
                </div>;
        } else
            display = <Guest socket={socket} location={this.userlocation}/>;

        return (
            <div className={"app"}>
                    {display}
            </div>
        )
    }
}