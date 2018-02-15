import React from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';

export default class Guest extends React.Component{
    constructor (props){
        super(props);
        this.state = {
            login: true,
            status: 'Register'
        };
        this.switchButton = this.switchButton.bind(this);
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
            window = <Login socket={this.props.socket}/>
        }
        else{
            window = <Register socket={this.props.socket} switch={this.switchButton}/>
        }
        return (
            <div>
                <h1> Surprise !</h1>
                {window}
                <button onClick={this.switchButton}>{this.state.status}</button>
            </div>
        );
    }
}