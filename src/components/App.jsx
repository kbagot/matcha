import React from 'react';
import io from 'socket.io-client';
import Guest from './Guest.jsx';
import User from './User.jsx';
import Cookie from 'cookie';

let ip = Cookie.parse(document.cookie).ip;
let socket = io(ip + ':8081');
// console.log("client");
export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {}
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
                this.setState({user});
        });
        socket.on('userDisconnect', (user) => {
                this.setState({['user']: {}})
        });

    }

    render(){
        let display = this.state.user.login ? <User socket={socket} user={this.state.user}/> : <Guest socket={socket}/>;
        return (
            <div className={"app"}>
                {ip}
                {display}
            </div>
        )
    }
}