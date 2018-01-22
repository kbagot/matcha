import React from 'react';
import io from 'socket.io-client';
import Login from './Login.jsx';
import Register from './Register.jsx';
let socket = io(`http://localhost:8081`);

export default class App extends React.Component {
    constructor (props){
        super(props);
        this.state = {
            user : {},
            login: true,
            status: 'Register'
        };
        this.switchButton = this.switchButton.bind(this);
    }

    componentDidMount (){
        socket.on('user', (user) => this.setState({user}));
    }

    switchButton (){
        this.setState(prevState =>  ({
            ['login']: !prevState.login,
            ['status']: !prevState.login ? 'Register' : 'Login'
        }));
    }

    render () {
        let window = null;

        if (this.state.login){
            window = <Login socket={socket}/>
        }
        else{
            window = <Register socket={socket}/>
        }
        return (
            <div>
                <h1> Surprise {this.state.user.name} !</h1>
                {window}
                <button onClick={this.switchButton}>{this.state.status}</button>
            </div>
        );
    }
}