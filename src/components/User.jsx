import React from 'react';
import Chat from './Chat.jsx';
import Research from './Research.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.disconnectUser = this.disconnectUser.bind(this);
        this.seekUser = this.seekUser.bind(this);
        this.state = {
            view: false
        };
    }


    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    seekUser() {
        this.setState({['view']: true})
    }

    render() {
        let view = null;
        if (this.state.view) {
            view = <Research />
        }else{
            view = <button onClick={this.seekUser}>Research</button>
        }
        return (
            <div className={"User"}>
                <p>Welcome {this.props.user.login}</p>
                <button onClick={this.disconnectUser}>Disconnect</button>
                <Chat user={this.props.user} socket={this.props.socket}/>
                {view}
            </div>
        )
    }
}