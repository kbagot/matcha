import React from 'react';

export default class ChatWindow extends React.Component{
    constructor(props){
        super(props);
        this.renderMessages = this.renderMessages.bind(this);
    }


    renderMessages(){
        if (this.props.msg) {
            return (
                this.props.msg.map((elem, index) => {
                    return (
                        <p style={message} key={index}>{elem.msg}</p>
                    );
                })
            )
        }

    }

    render (){
        return (<div className={"textChatWindow"}>{this.renderMessages()}</div>);
    }
}



const message = {
    position: 'absolute',
    padding: '0.6vmin',
    backgroundColor: 'rgba(9, 70, 106, 0.15)',
    borderRadius: '1vmin'
};