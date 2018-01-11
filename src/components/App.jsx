import React from 'react';
import io from 'socket.io-client';

let socket = io(`http://localhost:8081`);

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user : {}
        };
    }

    componentDidMount(){
        socket.on('user', (user) => this.setState({user}));
    }

    render () {
        return (
            <div>
                <h1> Surprise {this.state.user.name} !</h1>
            </div>
        );
    }
}