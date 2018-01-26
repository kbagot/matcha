import React from 'react';
import io from 'socket.io-client';
import Guest from './Guest.jsx';
import User from './User.jsx';

let socket = io('http://e3r10p14:8081');

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {}
        };
    }

    componentDidMount (){
        // for (let event of ["user", "userDisconnect"]){
        //     socket.on(event, (user) => this.setState({user}));
        // }
        console.log("MOUNTED");
        socket.on("error", (err) => console.log(err));
        socket.on('user', (user) => {
            // if (this.state.user.login === user.login)
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
                {display}
            </div>
        )
    }
}