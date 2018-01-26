import React from 'react';

export default class User extends React.Component{
    constructor(props){
        super(props);
        this.disconnectUser = this.disconnectUser.bind(this);
    }

    disconnectUser(){
        this.props.socket.emit("userDisconnect", {});
    }

    render(){
        return (
            <div className={"User"}>
                <p>Welcome {this.props.user.login}</p>
                <button onClick={this.disconnectUser}>Disconnect</button>
            </div>
        )
    }
}