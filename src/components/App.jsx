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
            waiting: false
        };
        this.handleClick = this.handleClick.bind(this);
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

    handleClick(){
        this.setState({waiting: true});
    }

    userLogin(user){
        document.cookie = "login=" + true;
        document.cookie = "error=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: user,['login']: true, ['error']: false, waiting: false});
    }

    userLogout(){
        document.cookie = "login=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: {}, ['login']: undefined});
    }

    render(){
        let display = '';

        if (this.state.waiting && !this.state.login && !this.state.error){
            display = <div className="loadpage"><ReactLoading delay={0} type='cylon' color='white' width='15%' height='15px'/></div>;
        } else if (this.state.login && !this.state.error) {
                display = <User socket={socket} user={this.state.user}/>;
        } else {
            display = <Guest socket={socket} submit={this.handleClick}/>;
        }

        return (
            <div className={"app"}>
                {display}
            </div>
        )
    }
}