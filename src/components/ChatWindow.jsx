import React from 'react';

export default class ChatWindow extends React.Component{
    constructor(props){
        super(props);
        this.renderMessages = this.renderMessages.bind(this);
    }


    renderMessages(){
        if (this.props.msg){
           return this.props.msg.map((elem, index) => {
               return (
               <p key={index}>{elem}</p>
               );
           })
        }
    }

    render (){
        return (<div className={"textChatWindow"}>{this.renderMessages()}</div>);
    }
}