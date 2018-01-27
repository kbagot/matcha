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
        console.log(socket);
        // for (let event of ["user", "userDisconnect"]){
        //     socket.on(event, (user) => this.setState({user}));
        // }
        // console.log("MOUNTED");


        socket.on("error", (err) => console.log(err));
        socket.on('user', (user) => {
            document.cookie = "login=" + true;
            document.cookie = "error=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            this.setState({['user']: user, ['login']: true, ['error']:false});
        });
        socket.on('userDisconnect', (user) => {
            document.cookie = "login=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            this.setState({['user']: {}, ['login']: false});
        });

    }

    render(){
        console.log(cookie);
        let display = this.state.login && !this.state.error ? <User socket={socket} user={this.state.user}/> : <Guest socket={socket}/>;
        return (
            <div className={"app"}>
                {ip}
                {display}
            </div>
        )
    }
}